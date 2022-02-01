/* eslint-disable import/no-anonymous-default-export */
import claimStorage from './claimStorage'
import bnUtils from '../bnUtils'

/* claim structure
const claim = {
  id: 1,
  nonce: 1,
  timestamp: Date.now(),
  messageForAlice: `You ${amount > 0 ? 'receive' : 'spend'}: ${Math.abs(amount)} DE.GA`,
  amount: amount,
  addresses: [userAddress, SERVER_ADDRESS],
  cumulativeDebits: [0, 0],
  signatures: new Array(2),
  type: type
} */

const CSDK_SERVER_ADDRESS = process.env.CSDK_SERVER_ADDRESS
const CSDK_TYPE_WITHDRAW = process.env.CSDK_TYPE_WITHDRAW

/**
 *
 * @param {obj} claim new claim for Alice
 */
const isValidNewClaim = (claim) => {
  const lastClaim = claimStorage.getConfirmedClaim()
  if (lastClaim) {
    const wasWithdraw = lastClaim.type === CSDK_TYPE_WITHDRAW
    const id = wasWithdraw ? lastClaim.id + 1 : lastClaim.id
    const nonce = wasWithdraw ? 1 : lastClaim.nonce + 1
    if (id !== claim.id) {
      throw new Error(`Invalid claim id: ${claim.id} - last claim id: ${lastClaim.id}${wasWithdraw ? '. id must change after withdraw' : ''}`)
    }
    if (nonce !== claim.nonce) {
      throw new Error(`Invalid claim nonce: ${claim.nonce} ${wasWithdraw ? ' - channel id is changed' : `- last claim nonce: ${lastClaim.nonce}`}`)
    }
    if (claim.addresses[1] !== CSDK_SERVER_ADDRESS) {
      throw new Error(`Invalid address of Server: ${claim.addresses[1]} - expected: ${CSDK_SERVER_ADDRESS}`)
    }

    // control cumulative debits
    const lastBalance = bnUtils.minus(lastClaim.cumulativeDebits[1], lastClaim.cumulativeDebits[0])
    const balance = bnUtils.plus(lastBalance, claim.amount)

    _controlDebits(balance, claim.cumulativeDebits)
  } else {
    if (claim.id !== 1) {
      throw new Error(`Invalid claim id: ${claim.id}`)
    }
    if (claim.nonce !== 1) {
      throw new Error(`Invalid claim nonce: ${claim.nonce}`)
    }
    if (claim.addresses[1] !== CSDK_SERVER_ADDRESS) {
      throw new Error(`Invalid address of Server: ${claim.addresses[1]} - expected: ${CSDK_SERVER_ADDRESS}`)
    }

    // control cumulative debits
    const balance = claim.amount
    _controlDebits(balance, claim.cumulativeDebits)
  }
  return true
}

/**
 *
 * @param {int} balance
 * @param {array} cumulativeDebits
 */
const _controlDebits = (balance, cumulativeDebits) => {
  if (bnUtils.gt(balance, 0)) {
    if (!bnUtils.eq(cumulativeDebits[0], 0)) {
      throw new Error(`Invalid claim cumulative debit of Client: ${cumulativeDebits[0]} - expected: 0`)
    }
    if (!bnUtils.eq(cumulativeDebits[1], balance)) {
      throw new Error(`Invalid claim cumulative debit of Server: ${cumulativeDebits[1]} - expected: ${balance}`)
    }
  } else {
    if (!bnUtils.eq(cumulativeDebits[0], bnUtils.negated(balance))) {
      throw new Error(`Invalid claim cumulative debit of Client: ${cumulativeDebits[0]} - expected: ${-balance}`)
    }
    if (!bnUtils.eq(cumulativeDebits[1], 0)) {
      throw new Error(`Invalid claim cumulative debit of Server: ${cumulativeDebits[1]} - expected: 0`)
    }
  }
}

/**
 *
 * @param {obj} claim claim Alice, countersigned by Bob
 */
const isValidClaimAlice = (claim) => {
  let isValid = isValidNewClaim(claim)
  if (isValid) {
    const savedClaim = claimStorage.getClaimAlice()
    if (savedClaim) {
      isValid = areEqualClaims(claim, savedClaim)
    }
  }
  return isValid
}

/**
 *
 * @param {obj} claim
 * @param {obj} savedClaim
 * @param {boolean} [isWithdraw]
 */
const areEqualClaims = (claim, savedClaim, isWithdraw = false) => {
  if (savedClaim.id !== claim.id) {
    throw new Error(`Invalid claim id: ${claim.id} - saved claim id: ${savedClaim.id}`)
  }

  const nonce = isWithdraw ? claim.nonce - 1 : claim.nonce
  if (savedClaim.nonce !== nonce) {
    throw new Error(`Invalid claim nonce: ${claim.nonce} - saved claim nonce: ${savedClaim.nonce}`)
  }

  // if (savedClaim.amount !== claim.amount) {
  //   throw new Error(`Invalid claim amount: ${claim.amount} - saved claim amount: ${savedClaim.amount}`)
  // }

  if (savedClaim.cumulativeDebits[0] !== claim.cumulativeDebits[0]) {
    throw new Error(`Invalid claim cumulative debit of Client: ${claim.cumulativeDebits[0]} - saved claim: ${savedClaim.cumulativeDebits[0]}`)
  }
  if (savedClaim.cumulativeDebits[1] !== claim.cumulativeDebits[1]) {
    throw new Error(`Invalid claim cumulative debit of Server: ${claim.cumulativeDebits[1]} - saved claim: ${savedClaim.cumulativeDebits[1]}`)
  }

  const type = isWithdraw ? process.env.CSDK_TYPE_WITHDRAW : savedClaim.type
  if (claim.type !== type) {
    throw new Error(`Invalid claim type: ${claim.type} - saved claim type: ${savedClaim.type}`)
  }
  if (savedClaim.addresses[0] !== claim.addresses[0]) {
    throw new Error(`Invalid address of Client: ${claim.addresses[0]} - saved claim: ${savedClaim.addresses[0]}`)
  }
  if (savedClaim.addresses[1] !== claim.addresses[1]) {
    throw new Error(`Invalid address of Server: ${claim.addresses[1]} - saved claim: ${savedClaim.addresses[1]}`)
  }
  if (!isWithdraw && savedClaim.timestamp !== claim.timestamp) {
    throw new Error(`Invalid timestamp of Server: ${claim.timestamp} - saved claim: ${savedClaim.timestamp}`)
  }
  return true
}

/**
 *
 * @param {obj} claim claim Alice, countersigned by Bob
 */
const isValidWithdraw = (claim) => {
  const savedClaim = claimStorage.getConfirmedClaim()
  if (savedClaim) {
    return areEqualClaims(claim, savedClaim, true)
  }
  return false
}

export default {
  isValidNewClaim,
  isValidClaimAlice,
  areEqualClaims,
  isValidWithdraw
}
