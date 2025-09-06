const express = require('express');
const { ethers } = require('ethers');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require("crypto");
const cors = require('cors');
require('dotenv').config({ path: './.env' });

const app = express();
// Configure CORS
app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:3001'], // Add your frontend URLs here
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));


app.use(express.json());

// Allowed file types and max file size
const ALLOWED_FILE_TYPES = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/gif': 'gif',
    'image/webp': 'webp'
};
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

// Function to validate file type
const validateFile = (file) => {
    // Check if file type is allowed
    if (!ALLOWED_FILE_TYPES[file.mimetype]) {
        throw new Error('Invalid file type. Only JPG, PNG, GIF, and WebP images are allowed.');
    }
    
    // Check file size
    if (file.size > MAX_FILE_SIZE) {
        throw new Error('File too large. Maximum size is 5MB.');
    }
    
    return true;
};

// --- Local File Storage Setup ---
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// Serve static files from the uploads directory
app.use('/uploads', express.static(uploadsDir));

// Configure multer for disk storage with security measures
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    // Generate a secure random filename
    const fileExtension = ALLOWED_FILE_TYPES[file.mimetype];
    const randomName = crypto.randomBytes(16).toString("hex");
    cb(null, `${randomName}.${fileExtension}`);
  },
});

// Configure multer with file filter and size limits
const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        try {
            if (validateFile(file)) {
                cb(null, true);
            }
        } catch (error) {
            cb(new Error(error.message));
        }
    },
    limits: {
        fileSize: MAX_FILE_SIZE
    }
});
// --- End Local File Storage Setup ---


const { POLYGON_MAINNET_RPC_URL, PRIVATE_KEY } = process.env;

// IMPORTANT: This address must be updated after a successful deployment
const contractAddress = "0xF6FbF5361b9F90FF3A8D3DBbDBdb5B266419484f";
const nftAbi = require('./artifacts/contracts/NFT.sol/NFT.json').abi;

const provider = new ethers.JsonRpcProvider(POLYGON_MAINNET_RPC_URL);
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
const nftContract = new ethers.Contract(contractAddress, nftAbi, wallet);

console.log("Backend server running with admin account:", wallet.address);

// Endpoint for file upload
app.post("/upload", (req, res) => {
  upload.single("file")(req, res, async (err) => {
    if (err) {
      // Handle multer errors
      if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
          return res
            .status(400)
            .send({ error: "File size too large. Maximum size is 5MB." });
        }
        return res.status(400).send({ error: err.message });
      }
      return res.status(400).send({ error: err.message });
    }

    if (!req.file) {
      return res.status(400).send({ error: "No file uploaded." });
    }

    try {
      // Additional validation of the uploaded file
      const filePath = req.file.path;

      // Verify file exists
      if (!fs.existsSync(filePath)) {
        throw new Error("File upload failed - file not found");
      }

      // Verify file size again
      const stats = fs.statSync(filePath);
      if (stats.size > MAX_FILE_SIZE) {
        fs.unlinkSync(filePath);
        throw new Error("File size exceeds limit");
      }

      // Generate secure URL
      const fileUrl = `${req.protocol}://${req.get("host")}/uploads/${
        req.file.filename
      }`;

      console.log("File uploaded successfully. URL:", fileUrl);
      res.send({
        success: true,
        url: fileUrl,
        filename: req.file.filename,
        mimetype: req.file.mimetype,
        size: req.file.size,
      });
    } catch (error) {
      // Clean up file if it exists
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      console.error(error);
      res
        .status(500)
        .send({ error: "An error occurred while processing the file." });
    }
  });
});


app.post('/mint', async (req, res) => {
  const { recipient } = req.body;
  if (!recipient) {
    return res.status(400).send({ error: 'Recipient address is required.' });
  }
  try {
    console.log(`Minting new NFT for: ${recipient}`);
    const tx = await nftContract.mint(recipient);
    const receipt = await tx.wait();
    const transferEvent = receipt.logs.find(
      (log) => log.eventName === "Transfer"
    );
    const tokenId = transferEvent.args[2].toString();
    console.log("NFT minted successfully! Token ID:", tokenId);
    res.send({ success: true, txHash: tx.hash, tokenId: tokenId });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: 'An error occurred while minting the NFT.' });
  }
});

app.post('/withdraw', async (req, res) => {
    const { recipient, amount } = req.body;
    if (!recipient || !amount) {
        return res.status(400).send({ error: 'Recipient and amount are required.' });
    }
    try {
        console.log(`Withdrawing ${amount} USDT to: ${recipient}`);
        const tx = await nftContract.withdrawUSDT(recipient, ethers.parseUnits(amount, 6));
        await tx.wait();
        console.log("Withdrawal successful!");
        res.send({ success: true, txHash: tx.hash });
    } catch (error) {
        console.error(error);
        res.status(500).send({ error: 'An error occurred during withdrawal.' });
    }
});

app.post('/assign', async (req, res) => {
    const { recipient, tokenId } = req.body;
    if (!recipient || !tokenId) {
        return res.status(400).send({ error: 'Recipient and tokenId are required.' });
    }
    try {
        console.log(`Assigning NFT with ID ${tokenId} to: ${recipient}`);
        const tx = await nftContract.safeTransferFrom(wallet.address, recipient, tokenId);
        await tx.wait();
        console.log("NFT assigned successfully!");
        res.send({ success: true, txHash: tx.hash });
    } catch (error) {
        console.error(error);
        res.status(500).send({ error: 'An error occurred while assigning the NFT.' });
    }
});

app.post('/assign-new-nft', async (req, res) => {
    const { recipient } = req.body;
    if (!recipient) {
        return res.status(400).send({ error: 'Recipient address is required.' });
    }
    try {
        console.log(`Assigning a new NFT to: ${recipient}`);
        const tx = await nftContract.assignNFT(recipient);
        await tx.wait();
        console.log("New NFT assigned successfully!");
        res.send({ success: true, txHash: tx.hash });
    } catch (error) {
        console.error(error);
        res.status(500).send({ error: 'An error occurred while assigning the new NFT.' });
    }
});

app.post('/admin-transfer', async (req, res) => {
    const { from, to, tokenId } = req.body;
    if (!from || !to || !tokenId) {
        return res.status(400).send({ error: 'From, to, and tokenId are required.' });
    }
    try {
        console.log(`Admin transferring NFT ${tokenId} from ${from} to ${to}`);
        const tx = await nftContract.adminTransfer(from, to, tokenId);
        await tx.wait();
        console.log("Admin transfer successful!");
        res.send({ success: true, txHash: tx.hash });
    } catch (error) {
        console.error(error);
        res.status(500).send({ error: 'An error occurred during the admin transfer.' });
    }
});

app.post('/batch-admin-transfer', async (req, res) => {
    const { froms, to, tokenIds } = req.body;
    if (!froms || !to || !tokenIds || froms.length !== tokenIds.length) {
        return res.status(400).send({ error: 'froms and tokenIds arrays are required and must have the same length, and a to address is required.' });
    }
    try {
        console.log(`Admin batch transferring ${tokenIds.length} NFTs to ${to}`);
        const tx = await nftContract.batchAdminTransfer(froms, to, tokenIds);
        await tx.wait();
        console.log("Admin batch transfer successful!");
        res.send({ success: true, txHash: tx.hash });
    } catch (error) {
        console.error(error);
        res.status(500).send({ error: 'An error occurred during the admin batch transfer.' });
    }
});

app.get('/balance', async (req, res) => {
    try {
        const balance = await nftContract.getUSDTBalance();
        res.send({ success: true, balance: ethers.formatUnits(balance, 6) }); // Assuming USDT has 6 decimals
    } catch (error) {
        console.error(error);
        res.status(500).send({ error: 'An error occurred while fetching the balance.' });
    }
});

app.post('/initial-mint-and-list', async (req, res) => {
    const { quantity } = req.body;
    if (!quantity || quantity <= 0) {
        return res.status(400).send({ error: 'A positive quantity is required.' });
    }
    try {
        const tx = await nftContract.initialMintAndList(quantity);
        await tx.wait();
        res.send({ success: true, message: `${quantity} NFTs minted and listed for 50 USDT each.` });
    } catch (error) {
        console.error(error);
        res.status(500).send({ error: 'An error occurred.' });
    }
});


app.post('/set-base-uri', async (req, res) => {
    const { baseURI } = req.body;
    if (!baseURI) {
        return res.status(400).send({ error: 'baseURI is required.' });
    }
    try {
        const tx = await nftContract.setBaseURI(baseURI);
        await tx.wait();
        res.send({ success: true, message: `Base URI set to: ${baseURI}` });
    } catch (error) {
        console.error(error);
        res.status(500).send({ error: 'An error occurred.' });
    }
});


const port = 3001;
app.listen(port, () => {
  console.log(`Admin API server listening on port ${port}`);
});
