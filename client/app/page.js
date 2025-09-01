'use client';

import { useState } from 'react';
import ConnectWallet from '../components/ConnectWallet';
import DepositUSDT from '../components/DepositUSDT';
import MintNFT from '../components/MintNFT';
import AssignNFT from '../components/AssignNFT';
import ViewNFTs from '../components/ViewNFTs';
import WithdrawUSDT from '../components/WithdrawUSDT';

export default function Home() {
  const [signer, setSigner] = useState(null);
  const [provider, setProvider] = useState(null);

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <ConnectWallet setSigner={setSigner} setProvider={setProvider} />
      <DepositUSDT signer={signer} provider={provider} />
      <WithdrawUSDT signer={signer} />
      <MintNFT signer={signer} />
      <AssignNFT signer={signer} />
      <ViewNFTs signer={signer} />
    </main>
  );
}