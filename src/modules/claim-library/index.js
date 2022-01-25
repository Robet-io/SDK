/* eslint-disable import/no-anonymous-default-export */
import { recoverTypedSignature, SignTypedDataVersion } from '@metamask/eth-sig-util'
import claimControls from './claimControls'
import claimStorage from './claimStorage'
import blockchain from '../blockchain'

const CSDK_CHAIN_ID = process.env.CSDK_CHAIN_ID
const CSDK_CHAIN_NAME = process.env.CSDK_CHAIN_NAME
const CSDK_CONTRACT_VAULT_ADDRESS = process.env.CSDK_CONTRACT_VAULT_ADDRESS

// const claimType = {
//   TYPE_REFUND: 'ticket.refund',
//   TYPE_WIN: 'ticket.win',
//   TYPE_PLAY: 'ticket.play',
//   TYPE_WITHDRAW: 'wallet.withdraw'
// }

/**
 *
 * @param {obj} claim
 * @param {obj} web3Provider
 */
const win = async (claim, web3Provider) => {
  /*
    TODO check type?
    Is there any check on the smart contract level that require check here on the claim type?
    If not no check here is necessary. MUST Check the smart contract.
  */
  const claimIsValid = await claimControls.isValidNewClaim(claim)
  if (claimIsValid) {
    if (!_verifySignature(claim)) {
      throw new Error("Server's signature is not verified")
    }
    const balanceIsEnough = await _isBalanceEnough(claim, web3Provider)
    if (balanceIsEnough === true) {
      await _signClaim(claim, web3Provider)
      claimStorage.saveConfirmedClaim(claim)
      return claim
    } else {
      throw new Error("Server's balance is not enough")
    }
  }
}

const domain = {
  name: CSDK_CHAIN_NAME,
  version: '1',
  chainId: CSDK_CHAIN_ID,
  verifyingContract: CSDK_CONTRACT_VAULT_ADDRESS
}

/**
 *
 * @param {obj} claim
 */
const _buildTypedClaim = claim => {
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

/**
 *
 * @param {obj} claim
 * @param {boolean} ofAlice = false
 */
const _verifySignature = (claim, ofAlice = false) => {
  let signer = 1
  if (ofAlice) {
    signer = 0
  }
  const data = _buildTypedClaim(claim)
  const signature = claim.signatures[signer]
  try {
    const addressSigner = recoverTypedSignature({
      data: data,
      signature: signature,
      version: SignTypedDataVersion.V4
    })
    return addressSigner.toUpperCase() === claim.addresses[signer].toUpperCase()
  } catch (error) {
    return false
  }
}

/**
 *
 * @param {obj} claim New claim for sign
 * @param {obj} web3Provider
 */
const pay = async (claim, web3Provider) => {
  //  TODO check the type of claim??

  // check if the claim wasn't already signed
  const claimWasntSigned = await _isAliceClaimNotSigned(claim)
  const claimIsValid = await claimControls.isValidNewClaim(claim)
  if (claimIsValid && claimWasntSigned) {
    const balanceIsEnough = await _isBalanceEnough(claim, web3Provider)
    if (balanceIsEnough === true) {
      await _signClaim(claim, web3Provider)
      claimStorage.saveClaimAlice(claim)
      return claim
    } else {
      throw new Error('Not enough balance')
    }
  }
}

/**
 *
 * @param {obj} claim
 */
const _isAliceClaimNotSigned = async (claim) => {
  const lastAliceClaim = await claimStorage.getClaimAlice()
  if (lastAliceClaim && lastAliceClaim.id === claim.id && lastAliceClaim.nonce >= claim.nonce) {
    throw new Error(`Claim with nonce ${claim.nonce} is already signed`)
  } else {
    return true
  }
}

/**
 *
 * @param {obj} claim
 * @param {obj} web3Provider
 */
const _isBalanceEnough = async (claim, web3Provider) => {
  const index = claim.amount < 0 ? 0 : 1
  return await _checkBalance(claim, index, web3Provider)
}

/**
 *
 * @param {obj} claim New claim for sign
 * @param {int} index 0 = Client, 1 = Server
 * @param {obj} web3Provider
 */
const _checkBalance = async (claim, index, web3Provider) => {
  try {
    const { balance } = await blockchain.getVaultBalance(claim.addresses[index], web3Provider)
    if (balance >= claim.cumulativeDebits[index]) {
      return true
    } else {
      return false
    }
  } catch (error) {
    throw new Error("Can't get balance from Vault")
  }
}

/**
 *
 * @param {obj} claim
 * @param {obj} web3Provider
 */
const _signClaim = async (claim, web3Provider) => {
  const msg = _buildTypedClaim(claim)
  const from = claim.addresses[0]
  claim.signatures[0] = await web3Provider.request({
    method: 'eth_signTypedData_v4',
    params: [from, JSON.stringify(msg)],
    from: from
  })
}

/**
 *
 * @param {obj} claim
 */
const payReceived = async (claim) => {
  // Arriva la ricevuta del server controfirmata
  // Verifico e salvo su localstorage come ultimo claim
  const claimIsValid = await claimControls.isValidClaimAlice(claim)
  if (claimIsValid) {
    if (_verifySignature(claim)) {
      claimStorage.saveConfirmedClaim(claim)
    } else {
      throw new Error("Server's signature is not verified")
    }
  }
}

/**
 *
 * @param {obj} claim
 */
const lastClaim = async (claim) => {
  const confirmedClaim = await claimStorage.getConfirmedClaim()
  if (!confirmedClaim) {
    claimStorage.saveConfirmedClaim(claim)
    return true
  } else {
    try {
      const areEqual = claimControls.areEqualClaims(claim, confirmedClaim)
      if (areEqual === true &&
        claim.signatures[0] === confirmedClaim.signatures[0] &&
        claim.signatures[1] === confirmedClaim.signatures[1]
      ) {
        return true
      } else {
        return { lastClaim: confirmedClaim }
      }
    } catch (error) {
      return { lastClaim: confirmedClaim }
    }
  }
}

export default {
  pay,
  payReceived,
  win,
  lastClaim
}
