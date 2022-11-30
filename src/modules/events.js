/**
 * @param {function(): void} cb
 */
const addEventListener = cb => {
    document.addEventListener(cryptoEvent, cb)
}

/**
 * @param {function(): void} cb
 */
const addEventListenerWS = cb => {
    document.addEventListener(cryptoEventWS, cb)
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

// eslint-disable-next-line no-redeclare
/* global CustomEvent */
/**
 * @param {string} msg
 */
const emitEventWS = (msg) => {
    const event = new CustomEvent(cryptoEventWS, { detail: JSON.parse(msg) })
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
    withdrawSigned: 'withdrawSigned',
    depositDega: 'depositDega',
    withdrawDega: 'withdrawDega',
    approveDega: 'approveDega',
    getBalance: 'getBalance',
    degaAllowed: 'degaAllowed'
}

/**
 * @type {string}
 */
const cryptoEvent = 'cryptoSDK'
const cryptoEventWS = 'cryptoSDK_WS'

export {
    addEventListener,
    emitEvent,
    emitErrorEvent,
    eventType,
    addEventListenerWS,
    emitEventWS
}
