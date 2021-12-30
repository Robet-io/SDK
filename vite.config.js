
/* eslint-disable */
import { defineConfig } from 'vite'
import path from 'path'

export default defineConfig(({ mode }) => {
  const dotEnvFile = mode ? `./.env.${mode}` : './.env'
  console.log('dotEnvFile', dotEnvFile)
  require('dotenv').config({ path: dotEnvFile })

  return {
    define: {
      "process.env.CSDK_ALICE_ADDRESS": `"${process.env.CSDK_ALICE_ADDRESS}"`,
      "process.env.CSDK_ALICE_PRIVATE_KEY": `"${process.env.CSDK_ALICE_PRIVATE_KEY}"`,

      // "process.env.CSDK_ALICE_ADDRESS_WRONG": `"${process.env.CSDK_ALICE_ADDRESS_WRONG}"`,
      // "process.env.CSDK_ALICE_PRIVATE_KEY_WRONG": `"${process.env.CSDK_ALICE_PRIVATE_KEY_WRONG}"`,

      "process.env.CSDK_CONTRACT_VAULT_ADDRESS": `"${process.env.CSDK_CONTRACT_VAULT_ADDRESS}"`,
      "process.env.CSDK_CONTRACT_TOKEN_ADDRESS": `"${process.env.CSDK_CONTRACT_TOKEN_ADDRESS}"`,
      "process.env.CSDK_SERVER_ADDRESS": `"${process.env.CSDK_SERVER_ADDRESS}"`,
      "process.env.CSDK_SERVER_PRIVATE_KEY": `"${process.env.CSDK_SERVER_PRIVATE_KEY}"`,

      "process.env.CSDK_CHAIN_ID": `"${process.env.CSDK_CHAIN_ID}"`,
      "process.env.CSDK_CHAIN_NAME": `"${process.env.CSDK_CHAIN_NAME}"`,
      "process.env.CSDK_RPC_URL": `"${process.env.CSDK_RPC_URL}"`,
      "process.env.CSDK_CHAIN_EXPLORER": `"${process.env.CSDK_CHAIN_EXPLORER}"`,
      "process.env.CSDK_CURRENCY_NAME": `"${process.env.CSDK_CURRENCY_NAME}"`,
      "process.env.CSDK_CURRENCY_SYMBOL": `"${process.env.CSDK_CURRENCY_SYMBOL}"`,
      "process.env.CSDK_CURRENCY_DECIMALS": `"${process.env.CSDK_CURRENCY_DECIMALS}"`
    },
    build: {
      lib: {
        entry: path.resolve(__dirname, 'src/index.js'),
        name: 'cryptoSDK'
        // fileName: (format) => `crypto-sdk.${format}.js`
      },
      rollupOptions: {
        // make sure to externalize deps that shouldn't be bundled
        // into your library
        external: ['@metamask/eth-sig-util', 'web3'],
        output: {
          // Provide global variables to use in the UMD build
          // for externalized deps
          globals: {
            '@metamask/eth-sig-util': '@metamask/eth-sig-util',
            web3: 'Web3'
          }
        }
      }
    }
  }
})

/*
module.exports = defineConfig({
  build: {
    lib: {
      entry: path.resolve(__dirname, "src/index.js"),
      name: 'cryptoSDK',
      // fileName: (format) => `crypto-sdk.${format}.js`
    },
    rollupOptions: {
      // make sure to externalize deps that shouldn't be bundled
      // into your library
      external: ['@metamask/eth-sig-util', 'web3'],
      output: {
        // Provide global variables to use in the UMD build
        // for externalized deps
        globals: {
          '@metamask/eth-sig-util': '@metamask/eth-sig-util',
          web3: 'Web3'
        }
      }
    }
  },
})
 */
