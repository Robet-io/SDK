/* eslint-disable import/no-anonymous-default-export */
import Web3 from 'web3'
import abi from './abi/VaultSimple.json'

import callSContract from './callSContract'
import initSContract from './initSContract'

const vaultAddress = '0x92B182F9D931fe2a1399430D1b7D0187849797ef'

const getVaultBalance = async (address, web3Provider) => {
  const contract = initSContract(web3Provider)
  const web3 = new Web3()
  const balance = web3.utils.fromWei(await callSContract(contract, 'balanceOf', address))
  return {balance}
}

export default getVaultBalance

