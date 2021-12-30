import {
  emitErrorEvent,
  emitEvent,
  eventType
} from './events'

import {
  checkRightNetwork,
  getValidNetworks,
  isRightNet,
  CHAIN_ID
} from './network'

/**
 *
 * @param {int} chainId
 */
const _handleChainChanged = async (chainId) => {
  try {
    const checkIsRightNet = await isRightNet()
    if (checkIsRightNet) {
      emitEvent(eventType.chainChanged, { chainId })
    } else {
      emitErrorEvent(eventType.chainChanged, { chainId })
    }
  } catch {
    emitErrorEvent(eventType.chainChanged, { chainId })
  }
}
const _initMetamask = () => {
  // TODO delete
  console.log('####process.env.CSDK_CHAIN_ID', process.env.CSDK_CHAIN_ID)
  
  
  // console.log('- - - - - control env', process.env)
  if (window.ethereum) {
    if (!window.ethereum.chainId) {
      window.ethereum.chainId = CHAIN_ID
    }

    // events subscription
    window.ethereum.on('accountsChanged', async (accounts) => {
      console.log('#### - Metamask: accountsChanged - accounts', accounts)
      emitEvent(eventType.accountsChanged, { accounts })
    })

    window.ethereum.on('chainChanged', async (chainId) => {
      console.log('#### - Metamask: chainChanged', chainId)
      await _handleChainChanged(chainId)
      // getAddress()
    })

    window.ethereum.on('message', async (message) => {
      emitEvent(eventType.message, { message })
    })

    window.ethereum.on('error', async (error) => {
      console.log('#### - Metamask: error', error)
      emitErrorEvent(eventType.error, error)
    })
  } else if (window.web3) {
    // events subscription for legacy wallet
    window.web3.currentProvider.on('accountsChanged', async (accounts) => {
      console.log('#### - Metamask web3: accountsChanged - accounts', accounts)
      emitEvent(eventType.accountsChanged, { accounts })
    })

    window.web3.currentProvider.on('chainIdChanged', async (chainId) => {
      console.log('#### - Metamask web3: chainChanged', chainId)
      await _handleChainChanged(chainId)
    })

    window.web3.currentProvider.on('error', async (error) => {
      console.log('#### - Metamask web3: error', error)
      emitErrorEvent(eventType.error, error)
    })
  }
}

const _getAccount = async () => {
  if (window.ethereum) {
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
    if (accounts && accounts[0]) {
      return accounts[0]
    } else {
      throw new Error("Can't get address")
    }
  } else if (window.web3) {
    const accounts = window.web3.eth.accounts
    if (accounts && accounts.length > 0) {
      return accounts[0]
    } else {
      throw new Error("Can't get address")
    }
  } else {
    throw new Error('Metamask is not installed')
  }
}

const isMetamaskInstalled = () => {
  if (window.ethereum || window.web3) {
    return true
  } else {
    return false
  }
}

const getAddress = async () => {
  if (!isMetamaskInstalled()) {
    const errorMessage = 'Metamask is not installed, unable to get user address'
    emitErrorEvent(eventType.metamaskNotInstalled, errorMessage)
    throw new Error(errorMessage)
  }

  const netId = getValidNetworks()
  try {
    await checkRightNetwork(netId)
  } catch (error) {
    emitErrorEvent(eventType.wrongNetworkOnGetAddress, error)
    throw new Error(error)
  }

  try {
    const address = await _getAccount()
    return { address }
  } catch (error) {
    emitErrorEvent(eventType.address, error)
    throw new Error(error)
  }
}

_initMetamask()

export {
  isMetamaskInstalled,
  getAddress
}
