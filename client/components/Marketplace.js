import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import NFT from '../src/NFT.json';
import styles from './Marketplace.module.css';

const Marketplace = ({ signer }) => {
  const [nfts, setNfts] = useState([]);

  const fetchNFTs = useCallback(async () => {
    if (signer) {
      try {
        const nftContract = new ethers.Contract(NFT.address, NFT.abi, signer);
        const totalSupply = await nftContract.totalSupply();
        const nftsForSale = [];
        for (let i = 0; i < totalSupply; i++) {
          const price = await nftContract.getPrice(i);
          if (price > 0) {
            const owner = await nftContract.ownerOf(i);
            const tokenURI = await nftContract.tokenURI(i);
            nftsForSale.push({
              tokenId: i,
              price: ethers.formatUnits(price, 6),
              owner: owner,
              tokenURI: tokenURI,
            });
          }
        }
        setNfts(nftsForSale);
      } catch (error) {
        console.error("Could not fetch NFTs:", error);
      }
    }
  }, [signer]);

  useEffect(() => {
    fetchNFTs();
  }, [fetchNFTs]);

  const handlePurchase = async (tokenId, price) => {
    if (!signer) {
      alert("Please connect your wallet first!");
      return;
    }
    try {
      const usdtAddress = "0xc2132D05D31c914a87C6611C10748AEb04B58e8F"; // USDT on Polygon Amoy
      const erc20Abi = ["function approve(address spender, uint256 amount) public returns (bool)"];
      const usdtContract = new ethers.Contract(usdtAddress, erc20Abi, signer);

      const priceInSmallestUnit = ethers.parseUnits(price, 6);

      console.log("Approving USDT spending...");
      const approveTx = await usdtContract.approve(NFT.address, priceInSmallestUnit);
      await approveTx.wait();
      console.log("USDT spending approved.");

      console.log("Purchasing NFT...");
      const nftContract = new ethers.Contract(NFT.address, NFT.abi, signer);
      const purchaseTx = await nftContract.purchaseNFT(tokenId);
      await purchaseTx.wait();
      console.log("NFT purchased successfully!");

      alert("Purchase successful!");
      fetchNFTs(); // Refresh the list of NFTs
    } catch (error) {
      console.error("Purchase failed:", error);
      alert("Purchase failed. See console for details.");
    }
  };

  return (
    <div className={styles.marketplace}>
      <h2>Marketplace</h2>
      <div className={styles.nftGrid}>
        {nfts.map((nft) => (
          <div key={nft.tokenId} className={styles.nftCard}>
            <img src={nft.tokenURI} alt={`NFT #${nft.tokenId}`} width="200" height="200" style={{ objectFit: 'cover', borderRadius: '4px' }} />
            <h3>NFT #{nft.tokenId}</h3>
            <p>Price: {nft.price} USDT</p>
            <p>Owner: {nft.owner.substring(0, 6)}...{nft.owner.substring(nft.owner.length - 4)}</p>
            <button onClick={() => handlePurchase(nft.tokenId, nft.price)}>Purchase</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Marketplace;
