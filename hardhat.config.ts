import "@typechain/hardhat";
import "@nomiclabs/hardhat-ethers";
import "@openzeppelin/hardhat-upgrades";
import "@nomiclabs/hardhat-waffle";
import "@nomiclabs/hardhat-etherscan";
import "hardhat-contract-sizer";
import "solidity-coverage";
import "hardhat-gas-reporter";

import { HardhatUserConfig } from "hardhat/config";
import { SolcUserConfig } from "hardhat/types";
import * as dotenv from "dotenv";

const DEFAULT_COMPILER_SETTINGS: SolcUserConfig = {
    version: "0.8.0",
};

dotenv.config();

const config: HardhatUserConfig = {
    networks: {
        hardhat: {
            allowUnlimitedContractSize: false,
        },
        mainnet: {
            url: `https://mainnet.infura.io/v3/${process.env.INFURA_API_KEY}`,
        },
        ropsten: {
            url: `https://ropsten.infura.io/v3/${process.env.INFURA_API_KEY}`,
        },
        rinkeby: {
            url: `https://rinkeby.infura.io/v3/${process.env.INFURA_API_KEY}`,
            // accounts: [`0x${process.env.WALLET_PRIVATE_KEY}`],
        },
        goerli: {
            url: `https://goerli.infura.io/v3/${process.env.INFURA_API_KEY}`,
        },
        kovan: {
            url: `https://kovan.infura.io/v3/${process.env.INFURA_API_KEY}`,
        },
    },
    solidity: {
        compilers: [DEFAULT_COMPILER_SETTINGS],
    },
    contractSizer: {
        alphaSort: false,
        disambiguatePaths: true,
        runOnCompile: false,
    },
};

if (process.env.ETHERSCAN_API_KEY) {
    config.etherscan = {
        // Your API key for Etherscan
        // Obtain one at https://etherscan.io/
        apiKey: process.env.ETHERSCAN_API_KEY,
    };
}

export default config;
