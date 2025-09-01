const express = require('express');
const { ethers } = require('ethers');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: './.env' });

const app = express();
app.use(express.json());

// --- Local File Storage Setup ---
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// Serve static files from the uploads directory
app.use('/uploads', express.static(uploadsDir));

// Configure multer for disk storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage: storage });
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
app.post('/upload', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).send({ error: 'No file uploaded.' });
    }
    try {
        const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
        console.log("File uploaded successfully. URL:", fileUrl);
        res.send({ success: true, url: fileUrl });
    } catch (error) {
        console.error(error);
        res.status(500).send({ error: 'An error occurred while uploading the file.' });
    }
});


app.post('/mint', async (req, res) => {
  const { recipient } = req.body;
  if (!recipient) {
    return res.status(400).send({ error: 'Recipient address is required.' });
  }
  try {
    console.log(`Minting new NFT for: ${recipient}`);
    const tx = await nftContract.mint(recipient);
    await tx.wait();
    console.log("NFT minted successfully!");
    res.send({ success: true, txHash: tx.hash });
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


const port = 3001;
app.listen(port, () => {
  console.log(`Admin API server listening on port ${port}`);
});
