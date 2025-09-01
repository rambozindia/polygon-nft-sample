const { task } = require("hardhat/config");

task("admin", "Admin actions for the NFT contract")
  .addPositionalParam("action", "The admin action to perform (mint, withdraw, assign)")
  .addOptionalParam("recipient", "The recipient address for minting or assigning")
  .addOptionalParam("amount", "The amount for withdrawal")
  .addOptionalParam("tokenId", "The ID of the token to assign")
  .setAction(async (taskArgs, hre) => {
    const { action, recipient, amount, tokenId } = taskArgs;
    const { ethers } = hre;

    const [deployer] = await ethers.getSigners();
    console.log("Performing actions with the account:", deployer.address);

    // IMPORTANT: This address must be updated after a successful deployment
    const contractAddress = "0xF6FbF5361b9F90FF3A8D3DBbDBdb5B266419484f";
    const nftContract = await ethers.getContractAt("NFT", contractAddress);

    switch (action) {
      case "mint":
        if (!recipient) {
          console.log("Please provide a --recipient for minting.");
          return;
        }
        console.log(`Minting new NFT for: ${recipient}`);
        const txMint = await nftContract.mint(recipient);
        await txMint.wait();
        console.log("NFT minted successfully!");
        break;

      case "withdraw":
        if (!recipient || !amount) {
          console.log("Please provide --recipient and --amount for withdrawal.");
          return;
        }
        console.log(`Withdrawing ${amount} USDT to: ${recipient}`);
        const txWithdraw = await nftContract.withdrawUSDT(recipient, ethers.parseUnits(amount, 6));
        await txWithdraw.wait();
        console.log("Withdrawal successful!");
        break;

      case "assign":
        if (!recipient || !tokenId) {
          console.log("Please provide --recipient and --token-id for assigning.");
          return;
        }
        console.log(`Assigning NFT with ID ${tokenId} from ${deployer.address} to: ${recipient}`);
        const txAssign = await nftContract.safeTransferFrom(deployer.address, recipient, tokenId);
        await txAssign.wait();
        console.log("NFT assigned successfully!");
        break;

      default:
        console.log(`Invalid action: ${action}. Available actions: mint, withdraw, assign`);
    }
  });
