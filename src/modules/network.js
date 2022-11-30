import { emitEvent, emitErrorEvent, eventType } from './events'
import { ethers } from "ethers";
import { isMetamaskInstalled } from "./metamask";
import { options } from "../options";
import { getEnv } from "../env";

/**
 * @returns {boolean}
 */
const checkRightNetwork = async () => {
    if (!isMetamaskInstalled()) {
        emitErrorEvent(eventType.metamaskNotInstalled, 'Metamask is not installed')
        throw new Error('Metamask is not installed')
    }

    const web3Provider = getWeb3Provider()

    if (web3Provider) {
        const rightNet = options[getEnv()].chainId

        const networkID = Number(await web3Provider.request({ method: 'eth_chainId' }))

        if (Number(networkID) !== Number(rightNet)) {
            throw new Error('Please change your network on Metamask')
        }

        return true
    }

    return false
}

/**
 * @returns {boolean}
 */
const isRightNet = async () => {
    if (!isMetamaskInstalled()) {
        emitErrorEvent(eventType.metamaskNotInstalled, 'Metamask is not installed')
        return false
    }

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
    if (!isMetamaskInstalled()) {
        emitErrorEvent(eventType.network, 'Metamask is not installed')
        throw new Error('Metamask is not installed')
    }

    const ethereum = getWeb3Provider()

    try {
        await ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{
                chainId: options[getEnv()].chainId
            }]
        })
    } catch (switchError) {
        if (switchError.code === 4902) {
            const chainIdHex = options[getEnv()].chainId
            const data = [{
                chainId: chainIdHex,
                chainName: options[getEnv()].chainName,
                nativeCurrency:
                    {
                        name: options[getEnv()].currencyName,
                        symbol: options[getEnv()].currencySymbol,
                        decimals: parseInt(options[getEnv()].currencyDecimals)
                    },
                rpcUrls: [options[getEnv()].rpcUrl],
                blockExplorerUrls: [options[getEnv()].blockExplorerUrl]
            }]

            try {
                await ethereum.request({ method: 'wallet_addEthereumChain', params: data })
                const isRightNetResult = checkRightNetwork()
                if (isRightNetResult) {
                    emitEvent(eventType.network, 'Success, network is set to the right one')
                } else {
                    emitErrorEvent(eventType.network, 'Add net error: network is not changed')
                }
            } catch (error) {
                emitErrorEvent(eventType.network, error.message ? error.message : error)
            }
        }
    }
}

/**
 *
 * @returns {ExternalProvider | Web3Provider}
 */
const getWeb3Provider = (original = false) => {
    return original ? new ethers.providers.Web3Provider(window.ethereum) : new ethers.providers.Web3Provider(window.ethereum).provider
}

export {
    isRightNet,
    checkRightNetwork,
    setRightNet,
    getWeb3Provider
}
