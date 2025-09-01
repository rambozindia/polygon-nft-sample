const ethers = require("hardhat").ethers;
const fs = require("fs");

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  const usdtTokenAddress = "0xc2132D05D31c914a87C6611C10748AEb04B58e8F"; // Replace with the actual USDT token address on Polygon testnet

  const NFT = await ethers.getContractFactory("NFT");
  const nft = await NFT.deploy(deployer.address, usdtTokenAddress);

  await nft.waitForDeployment();

  console.log("NFT deployed to:", await nft.getAddress());

  const data = {
    address: await nft.getAddress(),
    abi: JSON.parse(nft.interface.formatJson()),
  };

  fs.writeFileSync(
    "../client/src/NFT.json",
    JSON.stringify(data)
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
