const addEventListener = (cb) => {
  document.addEventListener(cryptoEvent, cb)
}

// eslint-disable-next-line no-redeclare
/* global CustomEvent */
const emitEvent = (type, msg) => {
  const event = new CustomEvent(cryptoEvent, { detail: { type, msg } })
  document.dispatchEvent(event)
}

const emitErrorEvent = (type, msg) => {
  const event = new CustomEvent(cryptoEvent, { detail: { type, msg, error: true } })
  document.dispatchEvent(event)
}

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
  paymentConfirmed: 'paymentConfirmed',
  paymentNotConfirmed: 'paymentNotConfirmed'
}

const cryptoEvent = 'cryptoSDK'

export {
  addEventListener,
  emitEvent,
  emitErrorEvent,
  eventType
}
