import { addEventListener } from './modules/events'
import { isRightNet, setRightNet } from './modules/network'
import { isMetamaskInstalled, getAddress } from './modules/metamask'

const cryptoSDK = {
  getAddress,
  isMetamaskInstalled,
  isRightNet,
  setRightNet,
  addEventListener
}

export default cryptoSDK
