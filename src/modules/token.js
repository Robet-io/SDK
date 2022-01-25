/* eslint-disable import/no-anonymous-default-export */
// eslint-disable-next-line no-redeclare
/* global localStorage */
import { personalSign } from './metamask'
import {
  emitErrorEvent,
  emitEvent,
  eventType
} from './events'

const signChallenge = async (challenge, address) => {
  try {
    const response = await personalSign(challenge, address)
    emitEvent(eventType.challengeSigned, { signature: response })
    return response
  } catch (error) {
    emitErrorEvent(eventType.challengNotSigned, error)
    throw error
  }
}

const authToken = 'authToken'

const setToken = async (token) => {
  await localStorage.setItem(authToken, token)
}

const getToken = async () => {
  return await localStorage.getItem(authToken)
}

export default {
  signChallenge,
  setToken,
  getToken
}
