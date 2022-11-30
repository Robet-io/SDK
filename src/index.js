import {
    addEventListener,
    emitErrorEvent,
    addEventListenerWS,
    emitEventWS,
    eventType,
    emitEvent
} from './modules/events'
import { isRightNet, setRightNet } from './modules/network'
import { isMetamaskInstalled, getAddress } from './modules/metamask'
import token from './modules/token'
import claims from './modules/claims'
import erc20 from './modules/erc20'
import { ALICE, BOB } from './modules/const'
import { formatNumber } from './modules/utils'
import { setEnv } from "./env";

/**
 * @param {string} msg
 * @return {object}
 */
const receiveMsg = async (msg) => {
    if (msg) {
        const { action, claim, context, error } = JSON.parse(msg)
        if (error) {
            emitErrorEvent(eventType.general, error)
        }

        switch (action) {
            case 'HANDSHAKE': {
                const lastClaimAlice = await claims.lastClaim(claim)
                if (lastClaimAlice) {
                    return {
                        action,
                        claim: lastClaimAlice,
                        context
                    }
                }
                break
            }
            case 'CASHIN': {
                if (!claim.signatures[ALICE] && !claim.signatures[BOB]) {
                    const signedClaim = await claims.cashin(claim)
                    return {
                        action,
                        claim: signedClaim,
                        context
                    }
                } else if (claim.signatures[ALICE] && claim.signatures[BOB]) {
                    await claims.claimControfirmed(claim)
                } else {
                    throw new Error('Invalid claim')
                }
                break
            }
            case 'CASHOUT': {
                if (!claim.signatures[ALICE] && claim.signatures[BOB]) {
                    const signedClaim = await claims.cashout(claim)
                    return {
                        action,
                        claim: signedClaim,
                        context
                    }
                } else {
                    throw new Error('Invalid claim')
                }
            }
            case 'WITHDRAW': {
                if (!claim.signatures[ALICE] && !claim.signatures[BOB]) {
                    const signedClaim = await claims.signWithdraw(claim)
                    return {
                        action,
                        claim: signedClaim,
                        context
                    }
                } else if (claim.signatures[ALICE] && claim.signatures[BOB]) {
                    await claims.claimControfirmed(claim)
                    //await claims.withdrawConsensually(claim)
                    emitEvent(eventType.withdrawSigned, 'Consensual withdraw signed.');
                } else {
                    throw new Error('Invalid claim')
                }
                break
            }
            default:
                break
        }
    }
}

const cryptoSDK = {
    setEnv,
    getAddress,
    isMetamaskInstalled,
    isRightNet,
    setRightNet,
    addEventListener,
    addEventListenerWS,
    emitEventWS,
    receiveMsg,
    signChallenge: token.signChallenge,
    setToken: token.setToken,
    getToken: token.getToken,
    isLogged: token.isLogged,
    getVaultBalance: claims.getVaultBalance,
    getTotalBalance: claims.getTotalBalance,
    downloadLastClaim: claims.downloadLastClaim,
    getConfirmedClaim: claims.getConfirmedClaim,
    formatNumber,

    pay: claims.cashin,
    payReceived: claims.claimControfirmed,
    win: claims.cashout,

    depositDega: erc20.depositDega,
    approveDega: erc20.approveDega,
    getDegaAllowance: erc20.getDegaAllowance,
    getDegaBalance: erc20.getDegaBalance,
    getBtcbBalance: erc20.getBtcbBalance,
    getBnbBalance: erc20.getBnbBalance,

    sendConsensualWithdraw: async function () {
        const { address } = getAddress();
        const claim = claims.getConfirmedClaim(address)
        if (!claim.closed) {
            throw new Error('Withdraw claim not found.')
        }
        await claims.withdrawConsensually(claim)
    }
}

export default cryptoSDK
