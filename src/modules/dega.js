/* eslint-disable import/no-anonymous-default-export */
/* eslint-disable no-prototype-builtins */
import Web3 from 'web3'
import {
  getWeb3Provider,
  checkRightNetwork
} from './network'
import {
  emitErrorEvent,
  emitEvent,
  eventType
} from './events'
import blockchain from './blockchain'
import bnUtils from './bnUtils'

/**
 * @param {number} amount
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

  const web3 = new Web3()
  const amountWei = web3.utils.toWei(amount)

  const web3Provider = getWeb3Provider()

  try {
    await checkDegaBalance(amountWei, address, web3Provider)
  } catch (error) {
    emitErrorEvent(eventType.depositDega, error)
    throw error
  }

  try {
    const txHash = await blockchain.depositDega(amountWei, address, web3Provider)
    emitEvent(eventType.depositDega, { txHash })
    return txHash
  } catch (error) {
    console.log('error deposit', { error })
    emitErrorEvent(eventType.depositDega, error)
    throw error
  }
}

/**
 * @param {number} amount
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
 * @param {number} amount
 * @param {string} address
 * @return {object} txhash
 */
const approveDega = async (amount, address) => {
  try {
    checkRightNetwork()
  } catch (error) {
    emitErrorEvent(eventType.approveDega, error)
    throw error
  }

  const web3 = new Web3()
  const amountWei = web3.utils.toWei(amount)

  const web3Provider = getWeb3Provider()

  try {
    const txHash = await blockchain.approveDega(amountWei, address, web3Provider)
    emitEvent(eventType.approveDega, { txHash })
    return txHash
  } catch (error) {
    emitErrorEvent(eventType.approveDega, error)
    throw error
  }
}

export default {
  depositDega,
  approveDega
}
