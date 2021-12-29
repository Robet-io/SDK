import { defineConfig } from "vite"
import path from "path"

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
