/* eslint-disable import/no-anonymous-default-export */
import {
  getWeb3Provider,
  checkRightNetwork
} from './network'
import {
  emitErrorEvent,
  emitEvent,
  eventType
} from './events'
import claimLibrary from './claim-library'

/**
 *
 * @param {obj} claim
 */
const pay = async (claim) => {
  try {
    await checkRightNetwork()
  } catch (error) {
    emitErrorEvent(eventType.claimNotSigned, error)
    throw error
  }

  const web3Provider = getWeb3Provider()
  try {
    const claimResult = await claimLibrary.pay(claim, web3Provider)
    emitEvent(eventType.claimSigned, { claim: claimResult })
    return claimResult
  } catch (error) {
    emitErrorEvent(eventType.claimNotSigned, error)
    throw error
  }
}

/**
 *
 * @param {obj} claim
 */
const payReceived = async (claim) => {
  try {
    await checkRightNetwork()
  } catch (error) {
    emitErrorEvent(eventType.paymentNotConfirmed, error)
    throw error
  }

  try {
    await claimLibrary.payReceived(claim)
    emitEvent(eventType.paymentConfirmed, { claim })
  } catch (error) {
    emitErrorEvent(eventType.paymentNotConfirmed, { error, claim })
    throw error
  }
}

/**
 *
 * @param {obj} claim
 */
const win = async (claim) => {
  try {
    await checkRightNetwork()
  } catch (error) {
    emitErrorEvent(eventType.winNotConfirmed, error)
    throw error
  }

  const web3Provider = getWeb3Provider()
  try {
    const claimResult = await claimLibrary.win(claim, web3Provider)
    emitEvent(eventType.winClaimSigned, { claim: claimResult })
    return claimResult
  } catch (error) {
    emitErrorEvent(eventType.winNotConfirmed, error)
    throw error
  }
}

/**
 *
 * @param {obj} claim
 */
const lastClaim = async (msg) => {
  const claim = JSON.parse(msg)
  if (claim.error) {
    emitErrorEvent(eventType.claimNotSynced, claim)
    return true
  }
  const trueOrClaim = await claimLibrary.lastClaim(claim)
  console.log('true or claim', trueOrClaim)
  if (trueOrClaim === true) {
    emitEvent(eventType.claimSynced)
  } else {
    emitErrorEvent(eventType.claimNotSynced, { lastClaim: trueOrClaim })
  }
  return trueOrClaim
}

export default {
  pay,
  payReceived,
  win,
  lastClaim
}
