/* eslint-disable import/no-anonymous-default-export */
import { recoverTypedSignature, SignTypedDataVersion } from '@metamask/eth-sig-util'
import claimControls from './claimControls'
import claimStorage from './claimStorage'
import blockchain from '../blockchain'
import { domain } from '../domain'
import { signTypedData } from '../metamask'
import bnUtils from '../bnUtils'

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
      await _signClaim(claim)
      claimStorage.saveConfirmedClaim(claim)
      return claim
    } else {
      throw new Error("Server's balance is not enough")
    }
  }
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
 * @param {boolean} [ofAlice]
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
  const claimWasntSigned = _isAliceClaimNotSigned(claim)
  const claimIsValid = claimControls.isValidNewClaim(claim)
  if (claimIsValid && claimWasntSigned) {
    const balanceIsEnough = await _isBalanceEnough(claim, web3Provider)
    if (balanceIsEnough === true) {
      await _signClaim(claim)
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
const _isAliceClaimNotSigned = (claim) => {
  const lastAliceClaim = claimStorage.getClaimAlice()
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
  // TODO server's balance???
  if (index === 1) return true

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
    if (bnUtils.gte(balance, claim.cumulativeDebits[index])) {
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
const _signClaim = async (claim) => {
  const msg = _buildTypedClaim(claim)
  const from = claim.addresses[0]
  claim.signatures[0] = await signTypedData(msg, from)
}

/**
 *
 * @param {obj} claim
 */
const payReceived = async (claim) => {
  const claimIsValid = claimControls.isValidClaimAlice(claim)
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
 * @param {obj} claim New claim for sign
 */
const signWithdraw = async (claim, web3Provider) => {
  // check if the claim wasn't already signed
  const claimWasntSigned = _isAliceClaimNotSigned(claim)
  const claimIsValid = claimControls.isValidWithdraw(claim)
  // const msgIsValid = await _isValidWithdrawMsg(claim, web3Provider)
  // if (claimIsValid && claimWasntSigned && msgIsValid) {
  if (claimIsValid && claimWasntSigned) {
    await _signClaim(claim)
    claimStorage.saveClaimAlice(claim)
    return claim
  }
}

// /**
//  *
//  * @param {obj} claim
//  * @param {obj} web3Provider
//  */
// const _isValidWithdrawMsg = async (claim, web3Provider) => {
//   let balanceToWithdraw
//   try {
//     const { balance } = await blockchain.getVaultBalance(claim.addresses[0], web3Provider)
//     // TODO add big numbers library
//     balanceToWithdraw = balance + claim.cumulativeDebits[1] - claim.cumulativeDebits[0]
//   } catch (error) {
//     throw new Error("Can't get balance from Vault")
//   }

//   const msg = `You are withdrawing: ${balanceToWithdraw} DE.GA`
//   if (msg === claim.messageForAlice) {
//     return true
//   } else {
//     throw new Error("Wrong amount in withdraw claim's message")
//   }
// }

/**
 *
 * @param {obj} claim
 */
const lastClaim = (claim) => {
  const confirmedClaim = claimStorage.getConfirmedClaim()
  if (!confirmedClaim && claim === null) {
    return true
  } if (!confirmedClaim && claim && claim.nonce) {
    claimStorage.saveConfirmedClaim(claim)
    return true
  } else if (confirmedClaim && claim === null) {
    return { handshake: confirmedClaim }
  } else if (claim.id >= confirmedClaim.id &&
    claim.nonce > confirmedClaim.nonce) {
    // && claim.timestamp > confirmedClaim.timestamp) {
    // newer claim
    if (_verifySignature(claim, true) &&
      _verifySignature(claim)) {
      claimStorage.saveConfirmedClaim(claim)
      return true
    } else {
      return { handshake: confirmedClaim }
    }
  } else {
    try {
      const areEqual = claimControls.areEqualClaims(claim, confirmedClaim)
      if (areEqual === true &&
        claim.signatures[0] === confirmedClaim.signatures[0] &&
        claim.signatures[1] === confirmedClaim.signatures[1]
      ) {
        return true
      } else {
        return { handshake: confirmedClaim }
      }
    } catch (error) {
      return { handshake: confirmedClaim }
    }
  }
}

export default {
  pay,
  payReceived,
  win,
  signWithdraw,
  lastClaim
}
