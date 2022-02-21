/* eslint-disable import/no-anonymous-default-export */
import Web3 from 'web3'
import abi from './abi/vault.json'

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
  const balance = await callMethod(contract, 'balanceOf', address)
  return { balance }
}

const withdrawConsensually = async (claim, web3Provider) => {
  const contract = initContract(web3Provider)
  const web3 = new Web3(web3Provider)
  const address = claim.addresses[0]
  try {
    const gas = await contract.methods.withdrawAlice(claim).estimateGas({ from: address })
    // console.log('- - - - withdrawToken - gas', gas) // gas 156026 156014 156002 156026
    const gasPrice = await web3.eth.getGasPrice()
    const options = { gasPrice, from: address, gas }
    // const options = { from: address }
    try {
      await contract.methods.withdrawAlice(claim).send(options)
        .on('transactionHash', (txHash) => {
          console.log('txHash', txHash)
        })
        // .on('confirmation', function (confirmationNumber) { console.log('-------confirmationNumber', confirmationNumber) })
        .on('receipt', (receipt) => {
          console.log('receipt', receipt)
        })
    } catch (error) {
      throw new Error(error)
    }
  } catch (error) {
    throw new Error(error)
  }
}

export default {
  getVaultBalance,
  withdrawConsensually
}
