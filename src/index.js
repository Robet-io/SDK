/* eslint-disable no-prototype-builtins */
import { addEventListener } from './modules/events'
import { isRightNet, setRightNet } from './modules/network'
import {
  isMetamaskInstalled,
  getAddress
} from './modules/metamask'
import token from './modules/token'

import claims from './modules/claims'

const receiveMsg = async (msg) => {
  if (msg) {
    const message = JSON.parse(msg)
    if (message.hasOwnProperty('handshake')) {
      // handshake
      return claims.lastClaim(message.handshake)
    } else {
      const claim = message
      if (claim && claim.type === process.env.CSDK_TYPE_PLAY) {
        if (!claim.signatures[0] && !claim.signatures[1]) {
          const signedClaim = await claims.pay(claim)
          return signedClaim
        } else if (claim.signatures[0] && claim.signatures[1]) {
          await claims.payReceived(claim)
        }
      } else if (claim && claim.type === process.env.CSDK_TYPE_WIN) {
        if (!claim.signatures[0] && claim.signatures[1]) {
          const signedClaim = await claims.win(claim)
          return signedClaim
        }
      } else if (claim && claim.type === process.env.CSDK_TYPE_WITHDRAW) {
        if (!claim.signatures[0] && !claim.signatures[1]) {
          const signedClaim = await claims.signWithdraw(claim)
          return signedClaim
        } else if (claim.signatures[0] && claim.signatures[1]) {
          await claims.payReceived(claim)
          await claims.withdrawConsensually(claim)
        }
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
  pay: claims.pay,
  payReceived: claims.payReceived,
  win: claims.win,
  receiveMsg,
  signChallenge: token.signChallenge,
  setToken: token.setToken,
  getToken: token.getToken,
  isLogged: token.isLogged,
  lastClaim: claims.lastClaim,
  getVaultBalance: claims.getVaultBalance
}

export default cryptoSDK
