import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import NFT from '../src/NFT.json'; // This will be created by the deploy script

const AssignNFT = ({ signer }) => {
  const [toAddress, setToAddress] = useState('');
  const [tokenId, setTokenId] = useState('');
  const [fromAddress, setFromAddress] = useState('');

  useEffect(() => {
    const getAddress = async () => {
      if (signer) {
        const address = await signer.getAddress();
        setFromAddress(address);
      }
    };
    getAddress();
  }, [signer]);

  const assignNFT = async () => {
    if (signer) {
      try {
        const nftContract = new ethers.Contract(NFT.address, NFT.abi, signer);
        console.log("From Address:", fromAddress);
        console.log("To Address:", toAddress);
        console.log("Token ID:", tokenId);

        const tx = await nftContract.safeTransferFrom(fromAddress, toAddress, tokenId);
        await tx.wait();
        console.log("NFT assigned successfully!");
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
        value={toAddress}
        onChange={(e) => setToAddress(e.target.value)}
        placeholder="To Address"
      />
      <input
        type="text"
        value={tokenId}
        onChange={(e) => setTokenId(e.target.value)}
        placeholder="Token ID"
      />
      <button onClick={assignNFT}>Assign NFT</button>
    </div>
  );
};

export default AssignNFT;
