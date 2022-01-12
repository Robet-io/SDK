import { addEventListener } from './modules/events'
import { isRightNet, setRightNet } from './modules/network'
import {
  isMetamaskInstalled,
  getAddress
} from './modules/metamask'

import claims from './modules/claims'

const receiveMsg = async (msg) => {
  if (msg) {
    const claim = JSON.parse(msg)
    if (claim && claim.type === process.env.CSDK_TYPE_PLAY) {
      if (!claim.signatures[0] && !claim.signatures[1]) {
        const signedClaim = await claims.pay(claim)
        return { signedClaim }
      } else if (claim.signatures[0] && claim.signatures[1]) {
        await claims.payReceived(claim)
      }
    } else if (claim && claim.type === process.env.CSDK_TYPE_WIN) {
      if (!claim.signatures[0] && claim.signatures[1]) {
        const signedClaim = await claims.win(claim)
        return { signedClaim }
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
  receiveMsg
}

export default cryptoSDK
