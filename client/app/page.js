'use client';

import { useState } from 'react';
import ConnectWallet from '../components/ConnectWallet';
import DepositUSDT from '../components/DepositUSDT';
import MintNFT from '../components/MintNFT';
import AssignNFT from '../components/AssignNFT';
import ViewNFTs from '../components/ViewNFTs';
import WithdrawUSDT from '../components/WithdrawUSDT';
import Marketplace from '../components/Marketplace';
import AdminDashboard from '../components/AdminDashboard';
import styles from './Page.module.css';

export default function Home() {
  const [signer, setSigner] = useState(null);
  const [provider, setProvider] = useState(null);

  return (
    <main className={styles.container}>
      <h1>NFT Marketplace</h1>
      <div className={styles.componentBox}>
        <ConnectWallet setSigner={setSigner} setProvider={setProvider} />
      </div>
      <div className={styles.componentBox}>
        <Marketplace signer={signer} />
      </div>
      <div className={styles.componentBox}>
        <h2>Admin Tools</h2>
        <AdminDashboard />
        <hr />
        <DepositUSDT signer={signer} provider={provider} />
        <WithdrawUSDT signer={signer} />
        <MintNFT signer={signer} />
        <AssignNFT signer={signer} />
      </div>
      <div className={styles.componentBox}>
        <ViewNFTs signer={signer} />
      </div>
    </main>
  );
}