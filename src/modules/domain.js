const CSDK_CHAIN_ID = process.env.CSDK_CHAIN_ID
const CSDK_CONTRACT_VAULT_NAME = process.env.CSDK_CONTRACT_VAULT_NAME
const CSDK_CONTRACT_VAULT_VERSION = process.env.CSDK_CONTRACT_VAULT_VERSION
const CSDK_CONTRACT_VAULT_ADDRESS = process.env.CSDK_CONTRACT_VAULT_ADDRESS

/**
 * @type {object}
 */
const domain = {
  name: CSDK_CONTRACT_VAULT_NAME,
  version: CSDK_CONTRACT_VAULT_VERSION,
  chainId: CSDK_CHAIN_ID,
  verifyingContract: CSDK_CONTRACT_VAULT_ADDRESS
}

export {
  domain
}
