const CSDK_CHAIN_ID = process.env.CSDK_CHAIN_ID
const CSDK_CHAIN_NAME = process.env.CSDK_CHAIN_NAME
const CSDK_CONTRACT_VAULT_ADDRESS = process.env.CSDK_CONTRACT_VAULT_ADDRESS

/**
 * @type {object}
 */
const domain = {
  name: CSDK_CHAIN_NAME,
  version: '1',
  chainId: CSDK_CHAIN_ID,
  verifyingContract: CSDK_CONTRACT_VAULT_ADDRESS
}

export {
  domain
}
