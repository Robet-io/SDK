// import { personalSign, decrypt } from 'eth-sig-util

const provider = (startProps) => {
  const {
    address, privateKey, chainId
  } = startProps

  const buildProvider = {
    isMetaMask: true,
    networkVersion: chainId,
    chainId: `0x${chainId.toString(16)}`,
    selectedAddress: address,

    request (props) {
      switch (props.method) {
        case 'eth_requestAccounts':
        case 'eth_accounts':
          return Promise.resolve([this.selectedAddress])
        case 'net_version':
          return Promise.resolve(this.networkVersion)
        case 'eth_chainId':
          return Promise.resolve(this.chainId)
        case 'wallet_addEthereumChain':
          this.chainId = `0x${Number(97).toString(16)}`
          return Promise.resolve(this.chainId)
        // case 'eth_signTypedData_v4': {
        //   const privKey = Buffer.from(privateKey, 'hex')
        //   const signature = ethSigUtil.signTypedMessage(privKey, { data: props.params[0] })
        //   return Promise.resolve(signature)
        // }
        case 'eth_sendTransaction': {
          return Promise.reject(new Error('This service can not send transactions.'))
        }
        // case 'eth_decrypt': {
        //   const stripped = props.params[0].substring(2)
        //   const buff = Buffer.from(stripped, 'hex')
        //   const data = JSON.parse(buff.toString('utf8'))
        //   return Promise.resolve(decrypt(data, privateKey))
        // }
        default:
          return Promise.reject(`The method ${props.method} is not implemented by the mock provider.`)
      }
    },

    // sendAsync (props) {
    //   switch (props.method) {
    //     case 'eth_accounts':
    //       cb(null, { result: [this.selectedAddress] })
    //       break
    //     case 'net_version':
    //       cb(null, { result: this.networkVersion })
    //       break
    //     default: console.log(`Method '${props.method}' is not supported yet.`)
    //   }
    // },
    on (props) {
      console.log('registering event:', props)
    },
    removeAllListeners () {
      console.log('removeAllListeners', null)
    }
  }

  // console.log('Mock Provider ', buildProvider)
  return buildProvider
}

export default provider
