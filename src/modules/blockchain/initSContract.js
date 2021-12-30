import Web3 from 'web3'

const initSContract = (web3Provider, contractAddress = vaultAddress, contractAbi) => {
  const web3 = new Web3(web3Provider)
  const contract = new web3.eth.Contract(contractAbi, contractAddress)
  return contract
}

export default initSContract