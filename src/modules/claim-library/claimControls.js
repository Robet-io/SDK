/* eslint-disable import/no-anonymous-default-export */
import claimStorage from './claimStorage'
import bnUtils from '../bnUtils'
import { ALICE, BOB } from '../const'
import { formatNumber } from '../utils'

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
  closed: 0 or 1
} */

const CSDK_SERVER_ADDRESS = process.env.CSDK_SERVER_ADDRESS

/**
 *
 * @param {object} claim new claim for Alice
 */
const isValidNewClaim = (claim) => {
  const lastClaim = claimStorage.getConfirmedClaim(claim.addresses[ALICE])
  if (lastClaim) {
    const wasWithdraw = lastClaim.closed === 1
    const id = wasWithdraw ? lastClaim.id + 1 : lastClaim.id
    const nonce = wasWithdraw ? 1 : lastClaim.nonce + 1
    if (id !== claim.id) {
      throw new Error(`Invalid claim id: ${claim.id} - last claim id: ${lastClaim.id}${wasWithdraw ? '. id must change after withdraw' : ''}`)
    }
    if (nonce !== claim.nonce) {
      throw new Error(`Invalid claim nonce: ${claim.nonce} ${wasWithdraw ? ' - channel id is changed' : `- last claim nonce: ${lastClaim.nonce}`}`)
    }
    if (claim.addresses[BOB] !== CSDK_SERVER_ADDRESS) {
      throw new Error(`Invalid address of Server: ${claim.addresses[BOB]} - expected: ${CSDK_SERVER_ADDRESS}`)
    }

    // control cumulative debits
    // was a withdraw:
    // balance = claim.amount

    // wasn't a withdraw:
    // lastBalance = cumulativeDebitBob - cumulatieDebitAlice
    // balance = lastBalance + claim.amount

    const balance = wasWithdraw ? claim.amount : bnUtils.plus(bnUtils.minus(lastClaim.cumulativeDebits[BOB], lastClaim.cumulativeDebits[ALICE]), claim.amount)

    _controlDebits(balance, claim.cumulativeDebits)
  } else {
    if (claim.id !== 1) {
      throw new Error(`Invalid claim id: ${claim.id}`)
    }
    if (claim.nonce !== 1) {
      throw new Error(`Invalid claim nonce: ${claim.nonce}`)
    }
    if (claim.addresses[BOB] !== CSDK_SERVER_ADDRESS) {
      throw new Error(`Invalid address of Server: ${claim.addresses[BOB]} - expected: ${CSDK_SERVER_ADDRESS}`)
    }

    // control cumulative debits
    const balance = claim.amount
    _controlDebits(balance, claim.cumulativeDebits)
  }

  _controlMesssage(claim)

  return true
}

/**
 *
 * @param {object} claim
 */
const _controlMesssage = (claim) => {
  if (claim.closed === 0) {
    const messageForAlice = `You ${bnUtils.gt(claim.amount, '0') ? 'receive' : 'spend'}: ${formatNumber(bnUtils.abs(claim.amount))} DE.GA`
    if (claim.messageForAlice !== messageForAlice) {
      throw new Error(`Invalid message for Alice: ${claim.messageForAlice} - expected: ${messageForAlice}`)
    }
  }
}

/**
 *
 * @param {int} balance
 * @param {array} cumulativeDebits
 */
const _controlDebits = (balance, cumulativeDebits) => {
  if (bnUtils.gt(balance, 0)) {
    if (!bnUtils.eq(cumulativeDebits[ALICE], 0)) {
      throw new Error(`Invalid claim cumulative debit of Client: ${cumulativeDebits[ALICE]} - expected: 0`)
    }
    if (!bnUtils.eq(cumulativeDebits[BOB], balance)) {
      throw new Error(`Invalid claim cumulative debit of Server: ${cumulativeDebits[BOB]} - expected: ${balance}`)
    }
  } else {
    if (!bnUtils.eq(cumulativeDebits[ALICE], bnUtils.negated(balance))) {
      throw new Error(`Invalid claim cumulative debit of Client: ${cumulativeDebits[ALICE]} - expected: ${-balance}`)
    }
    if (!bnUtils.eq(cumulativeDebits[BOB], 0)) {
      throw new Error(`Invalid claim cumulative debit of Server: ${cumulativeDebits[BOB]} - expected: 0`)
    }
  }
}

/**
 *
 * @param {object} claim claim Alice, countersigned by Bob
 */
const isValidClaimAlice = (claim) => {
  let isValid = isValidNewClaim(claim)
  if (isValid) {
    const savedClaim = claimStorage.getClaimAlice(claim.addresses[ALICE])
    if (savedClaim) {
      isValid = areEqualClaims(claim, savedClaim)
    }
  }
  return isValid
}

/**
 *
 * @param {object} claim
 * @param {object} savedClaim
 * @param {boolean} [isWithdraw]
 */
const areEqualClaims = (claim, savedClaim, isWithdraw = false) => {
  if (isWithdraw && savedClaim.closed === 1) {
    if (savedClaim.id + 1 !== claim.id) {
      throw new Error(`Invalid claim id: ${claim.id} - channel was closed and saved claim id: ${savedClaim.id}`)
    }
  } else if (savedClaim.id !== claim.id) {
    throw new Error(`Invalid claim id: ${claim.id} - saved claim id: ${savedClaim.id}`)
  }

  if (isWithdraw && savedClaim.closed === 1) {
    if (claim.nonce !== 1) {
      throw new Error(`Invalid claim nonce: ${claim.nonce} - channel was closed`)
    }
  } else {
    const nonce = isWithdraw ? claim.nonce - 1 : claim.nonce
    if (savedClaim.nonce !== nonce) {
      throw new Error(`Invalid claim nonce: ${claim.nonce} - saved claim nonce: ${savedClaim.nonce}`)
    }
  }

  // if (savedClaim.amount !== claim.amount) {
  //   throw new Error(`Invalid claim amount: ${claim.amount} - saved claim amount: ${savedClaim.amount}`)
  // }

  if (savedClaim.cumulativeDebits[ALICE] !== claim.cumulativeDebits[ALICE]) {
    throw new Error(`Invalid claim cumulative debit of Client: ${claim.cumulativeDebits[ALICE]} - saved claim: ${savedClaim.cumulativeDebits[ALICE]}`)
  }
  if (savedClaim.cumulativeDebits[BOB] !== claim.cumulativeDebits[BOB]) {
    throw new Error(`Invalid claim cumulative debit of Server: ${claim.cumulativeDebits[BOB]} - saved claim: ${savedClaim.cumulativeDebits[BOB]}`)
  }

  if (savedClaim.addresses[ALICE] !== claim.addresses[ALICE]) {
    throw new Error(`Invalid address of Client: ${claim.addresses[ALICE]} - saved claim: ${savedClaim.addresses[ALICE]}`)
  }
  if (savedClaim.addresses[BOB] !== claim.addresses[BOB]) {
    throw new Error(`Invalid address of Server: ${claim.addresses[BOB]} - saved claim: ${savedClaim.addresses[BOB]}`)
  }
  if (!isWithdraw && savedClaim.timestamp !== claim.timestamp) {
    throw new Error(`Invalid timestamp of Server: ${claim.timestamp} - saved claim: ${savedClaim.timestamp}`)
  }

  if (!isWithdraw && savedClaim.messageForAlice !== claim.messageForAlice) {
    throw new Error(`Invalid message for Alice: ${claim.messageForAlice} - expected: ${savedClaim.messageForAlice}`)
  }
  return true
}

/**
 *
 * @param {object} claim claim Alice, countersigned by Bob
 * @param {int} balance
 */
const isValidWithdraw = (claim, balance) => {
  _controlWithdrawMessage(claim, balance)

  const savedClaim = claimStorage.getConfirmedClaim(claim.addresses[ALICE])
  if (savedClaim) {
    return areEqualClaims(claim, savedClaim, true)
  }
  return true
}

/**
 *
 * @param {object} claim
 * @param {int} balance
 */
const _controlWithdrawMessage = (claim, balance) => {
  const balanceToWithdraw = bnUtils.plus(balance, bnUtils.minus(claim.cumulativeDebits[BOB], claim.cumulativeDebits[ALICE]))
  const messageForAlice = `You are withdrawing: ${formatNumber(balanceToWithdraw)} DE.GA`

  if (claim.messageForAlice !== messageForAlice) {
    throw new Error(`Invalid message for Alice: ${claim.messageForAlice} - expected: ${messageForAlice}`)
  }
}

export default {
  isValidNewClaim,
  isValidClaimAlice,
  areEqualClaims,
  isValidWithdraw
}
