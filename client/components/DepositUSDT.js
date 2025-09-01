import { useState } from 'react';
import { ethers } from 'ethers';
import NFT from '../src/NFT.json'; // This will be created by the deploy script

const DepositUSDT = ({ signer, provider }) => {
  const [amount, setAmount] = useState('');

  const depositUSDT = async () => {
    if (signer && provider) {
      try {
        const nftContract = new ethers.Contract(NFT.address, NFT.abi, signer);
        const usdtAddress = "0xc2132D05D31c914a87C6611C10748AEb04B58e8F"; // await nftContract.usdtTokenAddress;
        console.log("USDT Token Address:", usdtAddress, NFT.address);

        const usdtContract = new ethers.Contract(usdtAddress, ["function approve(address spender, uint256 amount) public returns (bool)"], signer);

        const tx1 = await usdtContract.approve(NFT.address, ethers.parseUnits(amount, 6));
        await tx1.wait();

        console.log(ethers.parseUnits(amount, 6), "amount", amount);
        
        const tx2 = await nftContract.depositUSDT(ethers.parseUnits(amount, 6));
        await tx2.wait();

        console.log("USDT deposited successfully!");
      } catch (error) {
        console.error(error);
      }
    } else {
      console.error("Please connect your wallet first!");
    }
  };

  return (
    <div>
      <input
        type="text"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="Amount in USDT"
      />
      <button onClick={depositUSDT}>Deposit USDT</button>
    </div>
  );
};

export default DepositUSDT;
