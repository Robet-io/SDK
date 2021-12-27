import { addEventListener } from './modules/events'
import { isRightNet, setRightNet } from './modules/network'
import {
  isMetamaskInstalled,
  getAddress
} from './modules/metamask'

import {
  pay,
  payReceived
} from './modules/claims'

const cryptoSDK = {
  getAddress,
  isMetamaskInstalled,
  isRightNet,
  setRightNet,
  addEventListener,
  pay,
  payReceived
}

export default cryptoSDK
