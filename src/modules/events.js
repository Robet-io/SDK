/**
 * @param {function(): void} cb
 */
const addEventListener = cb => {
  document.addEventListener(cryptoEvent, cb)
}

// eslint-disable-next-line no-redeclare
/* global CustomEvent */
/**
 * @param {string} type
 * @param {string} msg
 */
const emitEvent = (type, msg) => {
  const event = new CustomEvent(cryptoEvent, { detail: { type, msg } })
  document.dispatchEvent(event)
}

/**
 * @param {string} type
 * @param {string} msg
 */
const emitErrorEvent = (type, msg) => {
  const event = new CustomEvent(cryptoEvent, { detail: { type, msg, error: true } })
  document.dispatchEvent(event)
}

/**
 * @type {object}
 */
const eventType = {
  network: 'network',
  accountsChanged: 'accountsChanged',
  chainChanged: 'chainChanged',
  message: 'message',
  address: 'address',
  wrongNetworkOnGetAddress: 'wrongNetworkOnGetAddress',
  metamaskNotInstalled: 'metamaskNotInstalled',
  general: 'general',
  claimNotSigned: 'claimNotSigned',
  claimSigned: 'claimSigned',
  claimConfirmed: 'claimConfirmed',
  claimNotConfirmed: 'claimNotConfirmed',
  winClaimSigned: 'winClaimSigned',
  winNotConfirmed: 'winNotConfirmed',
  challengeSigned: 'challengeSigned',
  challengeNotSigned: 'challengeNotSigned',
  claimSynced: 'claimSynced',
  claimNotSynced: 'claimNotSynced',
  token: 'jwtToken',
  withdraw: 'withdraw',
  withdrawReceipt: 'withdrawReceipt',
  withdrawHash: 'withdrawHash',
  depositDega: 'depositDega',
  withdrawDega: 'withdrawDega',
  approveDega: 'approveDega',
  serverEvent: 'serverEvent'
}

/**
 * @type {string}
 */
const cryptoEvent = 'cryptoSDK'

export {
  addEventListener,
  emitEvent,
  emitErrorEvent,
  eventType
}
