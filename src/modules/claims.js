/* eslint-disable import/no-anonymous-default-export */
/* eslint-disable no-prototype-builtins */
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
import blockchain from './blockchain'
import bnUtils from './bnUtils'
import { ALICE, BOB } from './const'
import { getAddress } from './metamask'

/**
 * @param {object} claim
 * @return {object}
 */
const cashin = async (claim) => {
  try {
    await checkRightNetwork()
  } catch (error) {
    emitErrorEvent(eventType.claimNotSigned, error)
    throw error
  }

  const web3Provider = getWeb3Provider()
  try {
    const claimResult = await claimLibrary.cashin(claim, web3Provider)
    emitEvent(eventType.claimSigned, { claim: claimResult })
    return claimResult
  } catch (error) {
    emitErrorEvent(eventType.claimNotSigned, error)
    throw error
  }
}

/**
 * @param {string} address
 * @return {object}
 */
const getVaultBalance = async (address) => {
  const web3Provider = getWeb3Provider()
  try {
    const balance = await blockchain.getVaultBalance(address, web3Provider)
    return balance
  } catch (error) {
    console.error(error)
  }
}

/**
 *
 * @param {object} claim
 */
const claimControfirmed = async (claim) => {
  try {
    await checkRightNetwork()
  } catch (error) {
    emitErrorEvent(eventType.claimNotConfirmed, error)
    throw error
  }

  try {
    await claimLibrary.claimControfirmed(claim)
    emitEvent(eventType.claimConfirmed, { claim })
  } catch (error) {
    emitErrorEvent(eventType.claimNotConfirmed, { error, claim })
    throw error
  }
}

/**
 * @param {object} claim
 * @return {object}
 */
const cashout = async (claim) => {
  try {
    await checkRightNetwork()
  } catch (error) {
    emitErrorEvent(eventType.winNotConfirmed, error)
    throw error
  }

  const web3Provider = getWeb3Provider()
  try {
    const claimResult = await claimLibrary.cashout(claim, web3Provider)
    emitEvent(eventType.winClaimSigned, { claim: claimResult })
    return claimResult
  } catch (error) {
    emitErrorEvent(eventType.winNotConfirmed, error)
    throw error
  }
}

/**
 *
 * @param {object} claim
 * @return {object|boolean}
 */
const lastClaim = async (claim) => {
  if (claim && claim.hasOwnProperty('error')) {
    emitErrorEvent(eventType.claimNotSynced, claim.error)
    return
  }

  const { address } = await getAddress()
  if (claim && (claim.addresses[ALICE].toLowerCase() !== address.toLowerCase())) {
    emitErrorEvent(eventType.claimNotSynced, claim.error)
    return
  }

  const trueOrClaim = claimLibrary.lastClaim(claim, address)
  if (trueOrClaim === true) {
    emitEvent(eventType.claimSynced, 'Claims are synced')
  } else {
    emitErrorEvent(eventType.claimNotSynced, { lastClaim: trueOrClaim })
    return trueOrClaim
  }
}

/**
 * @param {object} claim
 * @return {object}
 */
const signWithdraw = async (claim) => {
  try {
    await checkRightNetwork()
  } catch (error) {
    emitErrorEvent(eventType.claimNotSigned, error)
    throw error
  }

  const web3Provider = getWeb3Provider()
  try {
    const claimResult = await claimLibrary.signWithdraw(claim, web3Provider)
    emitEvent(eventType.claimSigned, { claim: claimResult })
    return claimResult
  } catch (error) {
    emitErrorEvent(eventType.claimNotSigned, error)
    throw error
  }
}

/**
 *
 * @param {object} claim
 */
const withdrawConsensually = async (claim) => {
  try {
    await checkRightNetwork()
  } catch (error) {
    emitErrorEvent(eventType.withdraw, error)
    throw error
  }

  const web3Provider = getWeb3Provider()
  try {
    await blockchain.withdrawConsensually(claim, web3Provider)
    emitEvent(eventType.withdraw, 'Consensual withdraw is sent to blockchain')
  } catch (error) {
    emitErrorEvent(eventType.withdraw, error)
  }
}

/**
 * @param {string} address
 * @return {string}
 */
const getTotalBalance = async (address) => {
  try {
    await checkRightNetwork()
  } catch (error) {
    emitErrorEvent(eventType.getBalance, error)
    throw error
  }

  const web3Provider = getWeb3Provider()
  let balance = '0'

  try {
    balance = bnUtils.plus(balance, (await blockchain.getVaultBalance(address, web3Provider)).balance)
  } catch (error) {
    emitErrorEvent(eventType.getBalance, error)
  }

  const lastClaim = claimLibrary.getConfirmedClaim(address)

  if (lastClaim) {
    balance = bnUtils.plus(balance, bnUtils.minus(lastClaim.cumulativeDebits[BOB], lastClaim.cumulativeDebits[ALICE]))
  }

  return balance
}

export default {
  cashin,
  claimControfirmed,
  cashout,
  lastClaim,
  signWithdraw,
  withdrawConsensually,
  getVaultBalance,
  downloadLastClaim: claimLibrary.downloadLastClaim,
  getTotalBalance
}
