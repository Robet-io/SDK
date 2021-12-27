import { signTypedData, SignTypedDataVersion } from '@metamask/eth-sig-util'

const domain = {
  name: process.env.CHAIN_NAME,
  version: '1',
  chainId: process.env.CHAIN_ID,
  verifyingContract: process.env.CONTRACT_VAULT_ADDRESS
}

function _buildTypedClaim (claim) {
  return {
    types: {
      EIP712Domain: [
        { name: 'name', type: 'string' },
        { name: 'version', type: 'string' },
        { name: 'chainId', type: 'uint256' },
        { name: 'verifyingContract', type: 'address' }
      ],
      Claim: [
        { name: 'id', type: 'uint256' },
        { name: 'alice', type: 'address' },
        { name: 'bob', type: 'address' },
        { name: 'nonce', type: 'uint256' },
        { name: 'timestamp', type: 'uint256' },
        { name: 'messageForAlice', type: 'string' },
        { name: 'cumulativeDebitAlice', type: 'uint256' },
        { name: 'cumulativeDebitBob', type: 'uint256' }
      ]
    },
    domain,
    primaryType: 'Claim',
    message: {
      id: claim.id,
      alice: claim.addresses[0],
      bob: claim.addresses[1],
      nonce: claim.nonce,
      timestamp: claim.timestamp,
      messageForAlice: claim.messageForAlice,
      cumulativeDebitAlice: claim.cumulativeDebits[0],
      cumulativeDebitBob: claim.cumulativeDebits[1]
    }
  }
}

export const signClaim = (claim, privateKey) => {
  const privKey = Buffer.from(privateKey, 'hex')
  const signature = signTypedData({
    data: _buildTypedClaim(claim),
    privateKey: privKey,
    version: SignTypedDataVersion.V4
  })
  return signature
}
