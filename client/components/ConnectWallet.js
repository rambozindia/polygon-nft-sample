import { useState, useEffect } from "react";
import { ethers } from "ethers";

const ConnectWallet = ({ setSigner, setProvider }) => {
  const [address, setAddress] = useState(null);
  const [network, setNetwork] = useState(null);

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const currentNetwork = await provider.getNetwork();
        setNetwork(currentNetwork);

        // if (
        //   currentNetwork.chainId !== 80002 &&
        //   currentNetwork.chainId !== 137
        // ) {
        //   await switchToAmoy();
        // }

        await switchToMainnet();

        await provider.send("eth_requestAccounts", []);
        const signer = await provider.getSigner();
        setSigner(signer);
        setProvider(provider);
        setAddress(await signer.getAddress());
      } catch (error) {
        console.error(error);
      }
    } else {
      console.error("Please install MetaMask!");
    }
  };

  const switchToAmoy = async () => {
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: "0x13882" }],
      });
    } catch (switchError) {
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: "0x13882",
                chainName: "Polygon Amoy Testnet",
                rpcUrls: ["https://rpc-amoy.polygon.technology"],
                nativeCurrency: {
                  name: "POL",
                  symbol: "POL",
                  decimals: 18,
                },
                blockExplorerUrls: ["https://amoy.polygonscan.com/"],
              },
            ],
          });
        } catch (addError) {
          console.error(addError);
        }
      }
      console.error(switchError);
    }
  };

  const switchToMainnet = async () => {
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: "0x89" }], // Chain ID for Polygon Mainnet
      });
    } catch (switchError) {
      console.error(switchError);
    }
  };

  return (
    <div>
      {address ? (
        <div>
          <p>Connected with: {address}</p>
          <p>Network: {network ? network.name : "Unknown"}</p>
          <button onClick={switchToAmoy}>Switch to Amoy</button>
          <button onClick={switchToMainnet}>Switch to Mainnet</button>
        </div>
      ) : (
        <button onClick={connectWallet}>Connect Wallet</button>
      )}
    </div>
  );
};

export default ConnectWallet;
