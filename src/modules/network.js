import { emitEvent, emitErrorEvent, eventType } from './events'

// TODO: bring the chain_id (process.env ?? - )
const CHAIN_ID = 97
const CHAIN_NAME = 'BSC Testnet2'
const RPC_URL = 'https://data-seed-prebsc-1-s1.binance.org'
const CHAIN_EXPLORER = 'https://testnet.bscscan.com/'
const CURRENCY_NAME = 'BNB'
const CURRENCY_SYMBOL = 'BNB'
const CURRENCY_DECIMALS = 18

const checkRightNetwork = async (rightNet) => {
  let web3Provider = false

  if (window.ethereum) {
    web3Provider = window.ethereum
  } else if (window.web3) {
    // Legacy dApp browsers...
    web3Provider = window.web3.currentProvider
  } else {
    throw new Error('Metamask is not installed !!!')
  }

  if (web3Provider) {
    const networkID = Number(await web3Provider.request({ method: 'eth_chainId' }))
    if (Array.isArray(rightNet)) {
      if (!rightNet.includes(networkID)) {
        // setRightNet()
        const msg = 'Please change your network on Metamask. Valid networks are: ' + networksNames(rightNet)
        throw new Error(msg)
      } else {
        return true
      }
    } else {
      if (Number(networkID) !== Number(rightNet)) {
        // setRightNet()
        const msg = `Please set your network on Metamask to ${networksNames(rightNet)}`
        throw new Error(msg)
      } else {
        return true
      }
    }
  }
}

const networksNames = (netId = false) => {
  const names = []
  names[1] = 'Ethereum Mainnet'
  names[3] = 'Ethereum Ropsten'
  names[42] = 'Ethereum Kovan'
  names[4] = 'Ethereum Rinkeby'
  names[5] = 'Ethereum Goerli'
  names[56] = 'Binance Smart Chain'
  names[97] = 'Binance Smart Chain Testnet'
  if (netId) {
    if (Array.isArray(netId)) {
      const validNames = []
      for (let i = 0; i < netId.length; i++) {
        validNames.push(names[netId[i]])
      }
      return validNames
    } else if (names[netId]) {
      return names[netId]
    } else {
      console.error(`Network ID ${netId} Not found in the networksNames list`)
      return networksNames(CHAIN_ID)
    }
  } else {
    return names
  }
}

const getValidNetworks = () => {
  // TODO array - two nets
  return [Number(CHAIN_ID)]
}

const isRightNet = async () => {
  try {
    const result = await checkRightNetwork(getValidNetworks())
    emitEvent(eventType.network, result)
    return result
  } catch (error) {
    emitErrorEvent(eventType.network, error)
    return false
  }
}

const setRightNet = async () => {
  if (window.ethereum) {
    const ethereum = window.ethereum
    const chainIdHex = `0x${Number(CHAIN_ID).toString(16)}`
    const data = [{
      chainId: chainIdHex, // '0x61'
      chainName: CHAIN_NAME,
      nativeCurrency:
        {
          name: CURRENCY_NAME,
          symbol: CURRENCY_SYMBOL,
          decimals: CURRENCY_DECIMALS
        },
      rpcUrls: [RPC_URL],
      blockExplorerUrls: [CHAIN_EXPLORER]
    }]
    /* eslint-disable */
    try {
      await ethereum.request({ method: 'wallet_addEthereumChain', params: data })
      const isRightNetResult = await checkRightNetwork(getValidNetworks())
      if (isRightNetResult) {
        emitEvent(eventType.network, 'Success, network is set to the right one')
      } else {
        emitErrorEvent(eventType.network, 'Add net error: network is not changed')
      }
    } catch (error) {
      emitErrorEvent(eventType.network, `Add net error: ${error}`)
    }
  } else if (window.web3) {
    emitErrorEvent(eventType.network, "This version of Metamask supports only manual network switching")
    throw new Error('This version of Metamask supports only manual network switching')
  } else {
    emitErrorEvent(eventType.network, 'Metamask is not installed')
    throw new Error('Metamask is not installed')
  }
}

export {
  isRightNet,
  checkRightNetwork,
  setRightNet,
  getValidNetworks,
  CHAIN_ID
}
