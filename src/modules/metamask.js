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
    // return { error }
    throw new Error(errorMessage)
  }

  const netId = getValidNetworks()
  try {
    await checkRightNetwork(netId)
  } catch (error) {
    emitErrorEvent(eventType.wrongNetworkOnGetAddress, error)
    // return { error }
    throw new Error(error)
  }

  try {
    const address = await _getAccount()
    return { address }
  } catch (error) {
    emitErrorEvent(eventType.address, error)
    // return { error }
    throw new Error(error)
  }
}

const signMsg = async (msg, from) => {
  let web3Provider
  if (window.ethereum) {
    web3Provider = window.ethereum
  } else if (window.web3) {
    // Legacy dApp browsers...
    web3Provider = window.web3.currentProvider
  } else {
    throw new Error('Metamask is not installed !!!')
  }

  const signature = await web3Provider.request({
    method: 'eth_signTypedData_v4',
    params: [from, JSON.stringify(msg)],
    from: from
  })
  return signature
}

_initMetamask()

export {
  isMetamaskInstalled,
  getAddress,
  signMsg
}
