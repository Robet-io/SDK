/* eslint-disable import/no-anonymous-default-export */
// eslint-disable-next-line no-redeclare
/* global localStorage */
import {
    emitErrorEvent,
    emitEvent,
    eventType
} from './events'
import { getDomain } from './domain'
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
        domain: getDomain(),
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
 * @param {string} address
 * @return {string}
 */
const authTokenName = address => `${authToken}_${address.toLowerCase()}`

/**
 * @param {string} address
 * @return {string}
 */
const expireTokenName = address => `${expireToken}_${address.toLowerCase()}`

/**
 * @param {string} address
 * @param {string} token
 */
const setToken = (address, token) => {
    try {
        localStorage.setItem(authTokenName(address), token)
        localStorage.setItem(expireTokenName(address), Date.now() + expirationPeriod)
        emitEvent(eventType.token, 'JWT token received')
    } catch (error) {
        emitErrorEvent(eventType.token, error)
    }
}

/**
 * @param {string} address
 * @returns {string}
 */
const getToken = (address) => {
    return localStorage.getItem(authTokenName(address))
}

/**
 * @param {string} address
 * @returns {boolean}
 */
const isLogged = (address) => {
    const token = getToken(address)
    if (token) {
        const expirationTime = localStorage.getItem(expireTokenName(address))
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
