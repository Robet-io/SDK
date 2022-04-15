/* eslint-disable import/no-anonymous-default-export */
import Web3 from 'web3'
import vaultAbi from './abi/vault.json'
import degaAbi from './abi/dega.json'
import {
  emitEvent,
  eventType
} from '../events'

const vaultAddress = process.env.CSDK_CONTRACT_VAULT_ADDRESS
const degaAddress = process.env.CSDK_CONTRACT_TOKEN_ADDRESS

/**
 *
 * @param {object} web3Provider
 * @param {string} contractAddress
 * @param {object} contractAbi
 * @returns {object}
 */
const initContract = (web3Provider, contractAddress = vaultAddress, contractAbi = vaultAbi) => {
  const web3 = new Web3(web3Provider)
  const contract = new web3.eth.Contract(contractAbi, contractAddress)
  return contract
}

/**
 *
 * @param {object} contract
 * @param {string} method
 * @param {array} params
 * @returns {any}
 */
const callMethod = async (contract, method, params) => {
  return await contract.methods[method](params).call()
}

/**
 *
 * @param {string} address
 * @param {object} web3Provider
 * @returns { balance: string }
 */
const getVaultBalance = async (address, web3Provider) => {
  const contract = initContract(web3Provider)
  const balance = await callMethod(contract, 'balanceOf', address)
  return { balance }
}

/**
 *
 * @param {object} claim
 * @param {object} web3Provider
 */
const withdrawConsensually = async (claim, web3Provider) => {
  const contract = initContract(web3Provider)
  const web3 = new Web3(web3Provider)
  const address = claim.addresses[0]
  try {
    const gas = await contract.methods.withdrawAlice(claim).estimateGas({ from: address })
    const gasPrice = await web3.eth.getGasPrice()
    const options = { gasPrice, from: address, gas }
    try {
      await contract.methods.withdrawAlice(claim).send(options)
        .on('transactionHash', (txHash) => {
          console.log('txHash', txHash)
          emitEvent(eventType.withdrawHash, txHash)
        })
        // .on('confirmation', function (confirmationNumber) { console.log('-------confirmationNumber', confirmationNumber) })
        .on('receipt', (receipt) => {
          console.log('receipt', receipt)
          emitEvent(eventType.withdrawReceipt, receipt)
        })
    } catch (error) {
      throw new Error(error)
    }
  } catch (error) {
    throw new Error(error)
  }
}

/**
 *
 * @param {string} address
 * @param {object} web3Provider
 * @returns {string} balance
 */
const getDegaBalance = async (address, web3Provider) => {
  const contract = initContract(web3Provider, degaAddress, degaAbi)
  const balance = await callMethod(contract, 'balanceOf', address)
  return balance
}

/**
 *
 * @param {string} amount
 * @param {string} address
 * @param {object} web3Provider
 * @returns {object} txHash
 */
const approveDega = async (amount, address, web3Provider) => {
  const contract = initContract(web3Provider, degaAddress, degaAbi)
  const web3 = new Web3(web3Provider)
  const gas = await contract.methods.approve(vaultAddress, amount).estimateGas({ from: address })
  const gasPrice = await web3.eth.getGasPrice()
  const options = { gasPrice, from: address, gas }
  return await contract.methods.approve(vaultAddress, amount).send(options)
}

/**
 *
 * @param {string} amount
 * @param {string} address
 * @param {object} web3Provider
 * @returns {object} txHash
 */
const depositDega = async (amount, address, web3Provider) => {
  const contract = initContract(web3Provider)
  const web3 = new Web3(web3Provider)
  const gas = await contract.methods.deposit(amount).estimateGas({ from: address })
  const gasPrice = await web3.eth.getGasPrice()
  const options = { gasPrice, from: address, gas }
  return await contract.methods.deposit(amount).send(options)
}

export default {
  getVaultBalance,
  withdrawConsensually,
  getDegaBalance,
  depositDega,
  approveDega
}
