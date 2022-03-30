/* eslint-disable no-prototype-builtins */
import { addEventListener } from './modules/events'
import { isRightNet, setRightNet } from './modules/network'
import { isMetamaskInstalled, getAddress } from './modules/metamask'
import token from './modules/token'
import claims from './modules/claims'
import { ALICE, BOB } from './modules/const'

const CSDK_TYPE_CASHIN = process.env.CSDK_TYPE_CASHIN
const CSDK_TYPE_CASHOUT = process.env.CSDK_TYPE_CASHOUT
const CSDK_TYPE_WITHDRAW = process.env.CSDK_TYPE_WITHDRAW
const CSDK_TYPE_HANDSHAKE = process.env.CSDK_TYPE_HANDSHAKE

/**
 * @param {string} msg
 * @return {object}
 */
const receiveMsg = async (msg) => {
  if (msg) {
    const { action, claim, context, error } = JSON.parse(msg)
    if (error) {
      throw new Error(error)
    }
    switch (action) {
      case CSDK_TYPE_HANDSHAKE: {
        const lastClaimAlice = claims.lastClaim(claim)
        if (lastClaimAlice) {
          return {
            action,
            claim: lastClaimAlice,
            context
          }
        }
        break
      }
      case CSDK_TYPE_CASHIN: {
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
      case CSDK_TYPE_CASHOUT: {
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
      case CSDK_TYPE_WITHDRAW: {
        if (!claim.signatures[ALICE] && !claim.signatures[BOB]) {
          const signedClaim = await claims.signWithdraw(claim)
          return {
            action,
            claim: signedClaim,
            context
          }
        } else if (claim.signatures[ALICE] && claim.signatures[BOB]) {
          await claims.claimControfirmed(claim)
          await claims.withdrawConsensually(claim)
        } else {
          throw new Error('Invalid claim')
        }
        break
      }
      default: {
        throw new Error('Not supported')
      }
    }
  }
}

const cryptoSDK = {
  getAddress,
  isMetamaskInstalled,
  isRightNet,
  setRightNet,
  addEventListener,
  receiveMsg,
  signChallenge: token.signChallenge,
  setToken: token.setToken,
  getToken: token.getToken,
  isLogged: token.isLogged,
  getVaultBalance: claims.getVaultBalance,
  downloadLastClaim: claims.downloadLastClaim,

  pay: claims.cashin,
  payReceived: claims.claimControfirmed,
  win: claims.cashout
}

export default cryptoSDK
