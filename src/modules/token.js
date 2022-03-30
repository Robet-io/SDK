/* eslint-disable import/no-anonymous-default-export */
// eslint-disable-next-line no-redeclare
/* global localStorage */
import {
  emitErrorEvent,
  emitEvent,
  eventType
} from './events'
import { domain } from './domain'
import { signTypedData } from './metamask'

/**
 *
 * @param {string} challenge
 * @returns {object}
 */
const _buildTypedSignin = (challenge) => {
  const message = {
    method: 'signin',
    text: challenge
  }
  return {
    types: {
      EIP712Domain: [
        { name: 'name', type: 'string' },
        { name: 'version', type: 'string' },
        { name: 'chainId', type: 'uint256' },
        { name: 'verifyingContract', type: 'address' }
      ],
      Signin: [
        { name: 'method', type: 'string' },
        { name: 'text', type: 'string' }
      ]
    },
    domain,
    primaryType: 'Signin',
    message
  }
}

/**
 *
 * @param {string} challenge
 * @param {string} address
 * @return {string}
 */
const signChallenge = async (challenge, address) => {
  const msg = _buildTypedSignin(challenge)
  try {
    const response = await signTypedData(msg, address)
    emitEvent(eventType.challengeSigned, { signature: response })
    return response
  } catch (error) {
    emitErrorEvent(eventType.challengeNotSigned, error)
    throw error
  }
}

const authToken = 'authToken'
const expireToken = 'expireToken'
const expirationPeriod = 1200000 // 20min * 60 * 1000

/**
 *
 * @param {string} token
 */
const setToken = (token) => {
  try {
    localStorage.setItem(authToken, token)
    localStorage.setItem(expireToken, Date.now() + expirationPeriod)
    emitEvent(eventType.token, 'JWT token received')
  } catch (error) {
    emitErrorEvent(eventType.token, error)
  }
}

/**
 *
 * @returns {string}
 */
const getToken = () => {
  return localStorage.getItem(authToken)
}

/**
 *
 * @returns {boolean}
 */
const isLogged = () => {
  const token = getToken()
  if (token) {
    const expirationTime = localStorage.getItem(expireToken)
    if (expirationTime && expirationTime > Date.now()) {
      return true
    }
  }
  return false
}

export default {
  signChallenge,
  setToken,
  getToken,
  isLogged
}
