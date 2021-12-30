
const callSContract = async (contract, method, params) => {
  return await contract.methods[method](params).call()
}


export default callSContract