require("@nomicfoundation/hardhat-toolbox");
require("dotenv/config");
require("./tasks/admin");

const { AMOY_RPC_URL, POLYGON_MAINNET_RPC_URL, PRIVATE_KEY, POLYGONSCAN_API_KEY } = process.env;

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.24",
  networks: {
    amoy: {
      url: AMOY_RPC_URL || "https://rpc-amoy.polygon.technology/",
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
      chainId: 80002,
    },
    mainnet: {
      url: POLYGON_MAINNET_RPC_URL || "https://polygon-rpc.com/",
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
      chainId: 137,
    },
  },
  etherscan: {
    apiKey: {
      polygon: POLYGONSCAN_API_KEY
    }
  },
};
