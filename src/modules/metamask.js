import {
    emitErrorEvent,
    emitEvent,
    eventType
} from './events'
import {
    checkRightNetwork,
    isRightNet,
    getWeb3Provider
} from './network'
import { getEnv } from "../env";
import { options } from "../options";

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

const initMetamask = () => {
    const web3Provider = getWeb3Provider()

    if (web3Provider) {
        if (!web3Provider.chainId) {
            web3Provider.chainId = options[getEnv()].chainId
        }

        // events subscription
        web3Provider.on('accountsChanged', async (accounts) => {
            console.log('#### - Metamask: accountsChanged - accounts', accounts)
            emitEvent(eventType.accountsChanged, { accounts })
        })

        web3Provider.on('chainChanged', async (chainId) => {
            console.log('#### - Metamask: chainChanged', chainId)
            await _handleChainChanged(chainId)
            // getAddress()
        })

        web3Provider.on('error', async (error) => {
            console.log('#### - Metamask: error', error)
            emitErrorEvent(eventType.error, error)
        })
    }
}

/**
 * @return {string}
 */
const _getAccount = async () => {
    if (!isMetamaskInstalled()) {
        throw new Error('Metamask is not installed')
    }

    const web3Provider = getWeb3Provider()

    const accounts = await web3Provider.request({ method: 'eth_requestAccounts' })
    if (accounts && accounts[0]) {
        return accounts[0]
    } else {
        throw new Error("Can't get address")
    }
}

/**
 * @return {boolean}
 */
const isMetamaskInstalled = () => {
    return typeof window.ethereum !== 'undefined' && window.ethereum.isMetaMask
}

/**
 * @return {{ address: string}}
 */
const getAddress = async () => {
    if (!isMetamaskInstalled()) {
        const errorMessage = 'Metamask is not installed, unable to get user address'
        emitErrorEvent(eventType.metamaskNotInstalled, errorMessage)
        throw new Error(errorMessage)
    }

    try {
        await checkRightNetwork()
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

/**
 * @param {object} msg
 * @param {string} from
 */
const signTypedData = async (msg, from) => {
    await checkRightNetwork()
    const web3Provider = getWeb3Provider()

    return await web3Provider.request({
        method: 'eth_signTypedData_v4',
        params: [from, JSON.stringify(msg)],
        from: from
    })
}

setTimeout(initMetamask, 1_000)

export {
    isMetamaskInstalled,
    getAddress,
    signTypedData
}
