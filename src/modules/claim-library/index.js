/* eslint-disable import/no-anonymous-default-export */
import { recoverTypedSignature, SignTypedDataVersion } from '@metamask/eth-sig-util'
import claimControls from './claimControls'
import claimStorage from './claimStorage'

// TODO bring data from env vars
const CHAIN_ID = 97
const CHAIN_NAME = 'BSC Testnet'
// const RPC_URL = 'https://data-seed-prebsc-1-s1.binance.org'
const CONTRACT_VAULT_ADDRESS = '0xBC8655Fbb4ec8E3cc9edef00f05841A776907311'
// const CONTRACT_TOKEN_ADDRESS = '0xE8DaBa764266A64F66f5661F5cFAb6Ea41D18964'
// const SERVER_ADDRESS = '0xeA085D9698651e76750F07d0dE0464476187b3ca'
// const SERVER_URL = 'http://localhost:8081'

// const claimType = {
//   TYPE_REFUND: 'ticket.refund',
//   TYPE_WIN: 'ticket.win',
//   TYPE_PLAY: 'ticket.play',
//   TYPE_WITHDRAW: 'wallet.withdraw'
// }

// TODO
/*

*/
const win = async () => {
  // Ricevo claim di vincita firmato solo da SERVER BOB
  // Verifico e in caso controfirmo e mando al client
  // Salvo anche su local storage
}

const domain = {
  name: CHAIN_NAME,
  version: '1',
  chainId: CHAIN_ID,
  verifyingContract: CONTRACT_VAULT_ADDRESS
}

/**
 *
 * @param message
 */
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

const pay = async (web3Provider, claim) => {
  /*
    Pago quindi firmo un claim che il server mi ha preparato....

    fare i controlli su local storage
    per verificare che ID e nonce siano corretti

    quindi se tutto ok FIRMA e manda al client
    che poi mandera al server...
  */
  const claimIsValid = await claimControls.isValidNewClaim(claim)
  if (claimIsValid) {
    // control balance
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

const _isBalanceEnough = async (claim, web3Provider) => {
  // if (claim.amount < 0) {
  //   // Alice pays
  //   const balance = await web3Provider.request({
  //     method: 'eth_call',
  //     params: [from, JSON.stringify(msg)],
  //     from: from
  //   })
  // } else {
  //   // Server pays
  // }
  return true
}

const _signClaim = async (claim, web3Provider) => {
  const msg = _buildTypedClaim(claim)
  const from = claim.addresses[0]
  claim.signatures[0] = await web3Provider.request({
    method: 'eth_signTypedData_v4',
    params: [from, JSON.stringify(msg)],
    from: from
  })
}

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

export default {
  pay,
  payReceived
}
