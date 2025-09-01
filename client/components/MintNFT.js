import { useState } from 'react';
import { ethers } from 'ethers';
import NFT from '../src/NFT.json'; // This will be created by the deploy script

const MintNFT = ({ signer }) => {
  const [address, setAddress] = useState('');

  const mintNFT = async () => {
    if (signer) {
      try {
        const nftContract = new ethers.Contract(NFT.address, NFT.abi, signer);
        const tx = await nftContract.mint(address);
        await tx.wait();
        console.log("NFT minted successfully!");
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
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        placeholder="Recipient Address"
      />
      <button onClick={mintNFT}>Mint NFT</button>
    </div>
  );
};

export default MintNFT;
