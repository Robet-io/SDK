/* eslint-disable import/no-anonymous-default-export */
import Web3 from 'web3'
import abi from './abi/VaultSimple.json'

const vaultAddress = process.env.CSDK_CONTRACT_VAULT_ADDRESS

const initContract = (web3Provider, contractAddress = vaultAddress, contractAbi = abi) => {
  const web3 = new Web3(web3Provider)
  const contract = new web3.eth.Contract(contractAbi, contractAddress)
  return contract
}

const callMethod = async (contract, method, params) => {
  return await contract.methods[method](params).call()
}

const getVaultBalance = async (address, web3Provider) => {
  const contract = initContract(web3Provider)
  const web3 = new Web3()
  const balance = web3.utils.fromWei(await callMethod(contract, 'balanceOf', address))
  return { balance }
}

export default {
  getVaultBalance
}
