/* eslint-disable import/no-anonymous-default-export */
import {
  getWeb3Provider
} from './network'
import {
  emitErrorEvent,
  emitEvent,
  eventType
} from './events'
import claimLibrary from './claim-library'

const pay = async (claim) => {
  const web3Provider = getWeb3Provider()
  try {
    const claimResult = await claimLibrary.pay(web3Provider, claim)
    emitEvent(eventType.claimSigned, { claim: claimResult })
    return claimResult
  } catch (error) {
    emitErrorEvent(eventType.claimNotSigned, error)
    throw error
  }
}

const payReceived = async (claim) => {
  try {
    await claimLibrary.payReceived(claim)
    emitEvent(eventType.paymentConfirmed, { claim })
  } catch (error) {
    emitErrorEvent(eventType.paymentNotConfirmed, { error, claim })
    throw error
  }
}

export {
  pay,
  payReceived
}
