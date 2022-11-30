import { signTypedData, SignTypedDataVersion, personalSign } from '@metamask/eth-sig-util'

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
        case 'eth_signTypedData_v4': {
          const privKey = Buffer.from(privateKey, 'hex')
          const signature = signTypedData({
            data: JSON.parse(props.params[1]),
            privateKey: privKey,
            version: SignTypedDataVersion.V4
          })
          return Promise.resolve(signature)
        }
        case 'eth_sendTransaction': {
          return Promise.reject(new Error('This service can not send transactions.'))
        }
        case 'personal_sign': {
          const privKey = Buffer.from(privateKey, 'hex')
          const signature = personalSign({
            data: JSON.parse(props.params[1]),
            privateKey: privKey
          })
          return Promise.resolve(signature)
        }
        // case 'eth_decrypt': {
        //   const stripped = props.params[0].substring(2)
        //   const buff = Buffer.from(stripped, 'hex')
        //   const data = JSON.parse(buff.toString('utf8'))
        //   return Promise.resolve(decrypt(data, privateKey))
        // }
        default:
          /* eslint-disable prefer-promise-reject-errors */
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
