/* eslint-disable import/no-anonymous-default-export */
import Web3 from 'web3'
import abi from './abi/VaultSimple.json'

import getVaultBalance from './getVaultBalance'

/* 
const vaultAddress = '0x92B182F9D931fe2a1399430D1b7D0187849797ef'

const setContract = (web3Provider, contractAddress = vaultAddress, contractAbi = abi) => {
  const web3 = new Web3(web3Provider)
  const contract = new web3.eth.Contract(contractAbi, contractAddress)
  return contract
}

const callMethod = async (contract, method, params) => {
  return await contract.methods[method](params).call()
}

const getBalance = async (address, web3Provider) => {
  const contract = setContract(web3Provider)
  const web3 = new Web3()
  const balance = web3.utils.fromWei(await callMethod(contract, 'balanceOf', address))
  return balance
} */

export default {
  getVaultBalance
}

