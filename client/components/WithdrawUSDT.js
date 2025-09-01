import { useState } from 'react';
import { ethers } from 'ethers';
import NFT from '../src/NFT.json';

const WithdrawUSDT = ({ signer }) => {
  const [toAddress, setToAddress] = useState('');
  const [amount, setAmount] = useState('');

  const withdrawUSDT = async () => {
    if (signer) {
      try {
        const nftContract = new ethers.Contract(NFT.address, NFT.abi, signer);
        const tx = await nftContract.withdrawUSDT(toAddress, ethers.parseUnits(amount, 6));
        await tx.wait();
        console.log("USDT withdrawn successfully!");
      } catch (error) {
        console.error(error);
      }
    } else {
      console.error("Please connect your wallet first!");
    }
  };

  return (
    <div>
      <h3>Withdraw USDT (Owner Only)</h3>
      <input
        type="text"
        value={toAddress}
        onChange={(e) => setToAddress(e.target.value)}
        placeholder="To Address"
      />
      <input
        type="text"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="Amount"
      />
      <button onClick={withdrawUSDT}>Withdraw USDT</button>
    </div>
  );
};

export default WithdrawUSDT;
