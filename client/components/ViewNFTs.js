import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import NFT from '../src/NFT.json';

const ViewNFTs = ({ signer }) => {
  const [tokenIds, setTokenIds] = useState([]);
  const [loading, setLoading] = useState(false);

  const getNFTs = async () => {
    if (signer) {
      setLoading(true);
      try {
        const nftContract = new ethers.Contract(NFT.address, NFT.abi, signer);
        const address = await signer.getAddress();
        const balance = await nftContract.balanceOf(address);

        const ids = [];
        for (let i = 0; i < balance; i++) {
          const tokenId = await nftContract.tokenOfOwnerByIndex(address, i);
          ids.push(tokenId.toString());
        }
        setTokenIds(ids);
      } catch (error) {
        console.error(error);
      }
      setLoading(false);
    }
  };

  useEffect(() => {
    getNFTs();
  }, [signer]);

  return (
    <div>
      <h3>Your NFTs</h3>
      <button onClick={getNFTs} disabled={loading}>
        {loading ? 'Loading...' : 'Refresh NFTs'}
      </button>
      {tokenIds.length > 0 ? (
        <ul>
          {tokenIds.map((id) => (
            <li key={id}>Token ID: {id}</li>
          ))}
        </ul>
      ) : (
        <p>You don't own any NFTs in this collection yet.</p>
      )}
    </div>
  );
};

export default ViewNFTs;
