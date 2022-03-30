import { emitEvent, emitErrorEvent, eventType } from './events'

const CSDK_CHAIN_ID = process.env.CSDK_CHAIN_ID
const CSDK_CHAIN_NAME = process.env.CSDK_CHAIN_NAME
const CSDK_RPC_URL = process.env.CSDK_RPC_URL
const CSDK_CHAIN_EXPLORER = process.env.CSDK_CHAIN_EXPLORER
const CSDK_CURRENCY_NAME = process.env.CSDK_CURRENCY_NAME
const CSDK_CURRENCY_SYMBOL = process.env.CSDK_CURRENCY_SYMBOL
const CSDK_CURRENCY_DECIMALS = process.env.CSDK_CURRENCY_DECIMALS

/**
 * @returns {boolean}
 */
const checkRightNetwork = async () => {
  const rightNet = getValidNetworks()
  const web3Provider = getWeb3Provider()

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

/**
 *
 * @param {boolean} netId
 * @returns {Array.<string>}
 */
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
      return networksNames(CSDK_CHAIN_ID)
    }
  } else {
    return names
  }
}

/**
 * @returns {number}
 */
const getValidNetworks = () => {
  return [Number(CSDK_CHAIN_ID)]
}

/**
 * @returns {boolean}
 */
const isRightNet = async () => {
  try {
    const result = await checkRightNetwork()
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
    const chainIdHex = `0x${Number(CSDK_CHAIN_ID).toString(16)}`
    const data = [{
      chainId: chainIdHex,
      chainName: CSDK_CHAIN_NAME,
      nativeCurrency:
        {
          name: CSDK_CURRENCY_NAME,
          symbol: CSDK_CURRENCY_SYMBOL,
          decimals: CSDK_CURRENCY_DECIMALS
        },
      rpcUrls: [CSDK_RPC_URL],
      blockExplorerUrls: [CSDK_CHAIN_EXPLORER]
    }]
    /* eslint-disable */
    try {
      await ethereum.request({ method: 'wallet_addEthereumChain', params: data })
      const isRightNetResult = await checkRightNetwork()
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

/**
 *
 * @returns {object}
 */
const getWeb3Provider = () => {
  if (window.ethereum) {
    return window.ethereum
  } else if (window.web3) {
    // Legacy dApp browsers...
    return window.web3.currentProvider
  } else {
    emitErrorEvent(eventType.metamaskNotInstalled, { error: 'Metamask is not installed' })
    throw new Error('Metamask is not installed')
  }
}

export {
  isRightNet,
  checkRightNetwork,
  setRightNet,
  getValidNetworks,
  getWeb3Provider
}
