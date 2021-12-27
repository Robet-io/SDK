/* eslint-disable import/no-anonymous-default-export */
import claimStorage from './claimStorage'

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

const SERVER_ADDRESS = '0x70997970C51812dc3A010C7d01b50e0d17dc79C8'

/**
 *
 * @param {obj} claim new claim for Alice
 */
const isValidNewClaim = async (claim) => {
  // TODO Alice's balance in Vault??
  const lastClaim = await claimStorage.getConfirmedClaim()
  if (lastClaim) {
    if (lastClaim.id !== claim.id) {
      throw new Error(`Invalid claim id: ${claim.id} - last claim id: ${lastClaim.id}`)
    }
    if (lastClaim.nonce + 1 !== claim.nonce) {
      throw new Error(`Invalid claim nonce: ${claim.nonce} - last claim nonce: ${lastClaim.nonce}`)
    }

    // control cumulative debits
    const lastBalance = lastClaim.cumulativeDebits[1] - lastClaim.cumulativeDebits[0]
    const balance = lastBalance + claim.amount
    if (balance > 0) {
      if (claim.cumulativeDebits[1] !== balance) {
        throw new Error(`Invalid claim cumulative debit of Server: ${claim.cumulativeDebits[1]} - expected: ${balance}`)
      }
    } else {
      if (claim.cumulativeDebits[0] !== -balance) {
        throw new Error(`Invalid claim cumulative debit of Alice: ${claim.cumulativeDebits[0]} - expected: ${-balance}`)
      }
    }
  } else {
    if (claim.id !== 1) {
      throw new Error(`Invalid claim id: ${claim.id}`)
    }
    if (claim.nonce !== 1) {
      throw new Error(`Invalid claim nonce: ${claim.nonce}`)
    }
    if (claim.addresses[1] !== SERVER_ADDRESS) {
      throw new Error(`Invalid claim Server address: ${claim.addresses[1]} - expected: ${SERVER_ADDRESS}`)
    }

    // control cumulative debits
    const balance = claim.amount
    if (balance > 0) {
      if (claim.cumulativeDebits[1] !== balance) {
        throw new Error(`Invalid claim cumulative debit of Server: ${claim.cumulativeDebits[1]} - expected: ${balance}`)
      }
    } else {
      if (claim.cumulativeDebits[0] !== -balance) {
        throw new Error(`Invalid claim cumulative debit of Alice: ${claim.cumulativeDebits[0]} - expected: ${-balance}`)
      }
    }
  }
  return true
}

/**
 *
 * @param {obj} claim claim Alice, countersigned by Bob
 */
const isValidClaimAlice = async (claim) => {
  const savedClaim = await claimStorage.getClaimAlice()
  let isValid = false
  if (savedClaim) {
    isValid = _areEqualClaims(claim, savedClaim)
  } else {
    // claim Alice wasn't saved
    // check if it's a new claim
    isValid = await isValidNewClaim(claim)
  }
  return isValid
}

const _areEqualClaims = (claim, savedClaim) => {
  if (savedClaim.id !== claim.id) {
    throw new Error(`Invalid claim id: ${claim.id} - saved claim id: ${savedClaim.id}`)
  }
  if (savedClaim.nonce !== claim.nonce) {
    throw new Error(`Invalid claim nonce: ${claim.nonce} - saved claim nonce: ${savedClaim.nonce}`)
  }
  if (savedClaim.amount !== claim.amount) {
    throw new Error(`Invalid claim amount: ${claim.amount} - saved claim amount: ${savedClaim.amount}`)
  }
  if (savedClaim.cumulativeDebits[0] !== claim.cumulativeDebits[0]) {
    throw new Error(`Invalid claim cumulative debit of Client: ${claim.cumulativeDebits[0]} - saved claim: ${savedClaim.cumulativeDebits[0]}`)
  }
  if (savedClaim.cumulativeDebits[1] !== claim.cumulativeDebits[1]) {
    throw new Error(`Invalid claim cumulative debit of Server: ${claim.cumulativeDebits[1]} - saved claim: ${savedClaim.cumulativeDebits[1]}`)
  }
  if (savedClaim.type !== claim.type) {
    throw new Error(`Invalid claim type: ${claim.type} - saved claim type: ${savedClaim.type}`)
  }
  return true
}

// const _isEmpty = (obj) => {
//   return Object.keys(obj).length === 0
// }

// const verifySignature = async (claim, ofAlice = false) => {
//   let signer = 1
//   if (ofAlice) {
//     signer = 0
//   }
//   const data = _buildTypedClaim(claim)
//   const signature = claim.signatures[signer]
//   const addressSigner = recoverTypedSignature({
//     data: data,
//     signature: signature,
//     version: SignTypedDataVersion.V4
//   })
//   console.log(addressSigner, claim.addresses[signer])
//   return addressSigner === claim.addresses[signer]
// }

export default {
  isValidNewClaim,
  isValidClaimAlice
}
