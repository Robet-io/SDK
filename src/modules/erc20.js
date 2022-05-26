/* eslint-disable import/no-anonymous-default-export */
/* eslint-disable no-prototype-builtins */
import {
  getWeb3Provider,
  checkRightNetwork
} from './network'
import {
  emitErrorEvent,
  eventType
} from './events'
import blockchain from './blockchain'
import bnUtils from './bnUtils'

/**
 * @param {string} amount
 * @param {string} address
 * @return {object} txhash
 */
const depositDega = async (amount, address) => {
  try {
    checkRightNetwork()
  } catch (error) {
    emitErrorEvent(eventType.depositDega, error)
    throw error
  }

  const web3Provider = getWeb3Provider()

  try {
    await checkDegaBalance(amount, address, web3Provider)
  } catch (error) {
    emitErrorEvent(eventType.depositDega, error)
    throw error
  }

  try {
    await blockchain.depositDega(amount, address, web3Provider)
  } catch (error) {
    emitErrorEvent(eventType.depositDega, error)
    throw error
  }
}

/**
 * @param {string} amount
 * @param {string} address
 */
const checkDegaBalance = async (amount, address, web3Provider) => {
  let balance
  try {
    balance = await blockchain.getDegaBalance(address, web3Provider)
  } catch (error) {
    throw new Error("Can't get balance of Dega")
  }

  if (bnUtils.lt(balance, amount)) {
    throw new Error('The balance of Dega is not enough')
  }
}

/**
 * @param {string} amount
 * @param {string} address
 */
const approveDega = async (amount, address) => {
  try {
    checkRightNetwork()
  } catch (error) {
    emitErrorEvent(eventType.approveDega, error)
    throw error
  }

  const web3Provider = getWeb3Provider()

  try {
    await blockchain.approveDega(amount, address, web3Provider)
  } catch (error) {
    emitErrorEvent(eventType.approveDega, error)
    throw error
  }
}

/**
 * @param {string} address
 * @returns {string} balance
 */
const getDegaBalance = async (address) => {
  try {
    checkRightNetwork()
  } catch (error) {
    emitErrorEvent(eventType.getBalance, error)
    throw error
  }

  const web3Provider = getWeb3Provider()

  let balance = '0'
  try {
    balance = await blockchain.getDegaBalance(address, web3Provider)
  } catch (error) {
    throw new Error("Can't get balance of Dega")
  }

  return balance.toString()
}

/**
 * @param {string} address
 * @returns {string} balance
 */
const getBtcbBalance = async (address) => {
  try {
    checkRightNetwork()
  } catch (error) {
    emitErrorEvent(eventType.getBalance, error)
    throw error
  }

  const web3Provider = getWeb3Provider()

  let balance = '0'
  try {
    balance = await blockchain.getBtcbBalance(address, web3Provider)
  } catch (error) {
    throw new Error("Can't get balance of BTCB")
  }

  return balance.toString()
}

/**
 * @param {string} address
 * @returns {string} balance
 */
const getBnbBalance = async (address) => {
  try {
    checkRightNetwork()
  } catch (error) {
    emitErrorEvent(eventType.getBalance, error)
    throw error
  }

  const web3Provider = getWeb3Provider()

  let balance = '0'
  try {
    balance = await blockchain.getBnbBalance(address, web3Provider)
  } catch (error) {
    throw new Error("Can't get balance of BNB")
  }

  return balance.toString()
}

/**
 * @param {string} address
 * @returns {string} allowance
 */
const getDegaAllowance = async (address) => {
  try {
    checkRightNetwork()
  } catch (error) {
    emitErrorEvent(eventType.approveDega, error)
    throw error
  }

  const web3Provider = getWeb3Provider()

  try {
    return await blockchain.getDegaAllowance(address, web3Provider)
  } catch (error) {
    emitErrorEvent(eventType.approveDega, error)
    throw error
  }
}

export default {
  depositDega,
  approveDega,
  getDegaBalance,
  getBtcbBalance,
  getBnbBalance,
  getDegaAllowance
}
