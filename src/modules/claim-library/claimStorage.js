/* eslint-disable import/no-anonymous-default-export */
/* eslint-disable-next-line no-redeclare */
/* global localStorage */

import { ALICE } from '../const'

/**
 * @type {object}
 */
const savedClameType = {
  claimConfirmed: 'claimConfirmed',
  claimAlice: 'claimAlice'
}

/**
 * @param {string} address
 * @return {string}
 */
const claimConfirmedName = address => `${savedClameType.claimConfirmed}_${address.toLowerCase()}`

/**
* @param {string} address
* @return {string}
*/
const claimAliceName = address => `${savedClameType.claimAlice}_${address.toLowerCase()}`

/**
 *
 * @param {object} claim
 */
const saveConfirmedClaim = claim => {
  localStorage.setItem(claimConfirmedName(claim.addresses[ALICE]), JSON.stringify(claim))
}

/**
 * @param {string} address
 * @return {object} claim
 */
const getConfirmedClaim = (address) => {
  return JSON.parse(localStorage.getItem(claimConfirmedName(address)))
}

/**
 *
 * @param {object} claim
 */
const saveClaimAlice = claim => {
  localStorage.setItem(claimAliceName(claim.addresses[ALICE]), JSON.stringify(claim))
}

/**
 * @param {string} address
 * @return {object} claim
 */
const getClaimAlice = (address) => {
  return JSON.parse(localStorage.getItem(claimAliceName(address)))
}

/**
 * @param {string} address
 */
const downloadLastClaim = (address) => {
  const lastClaim = localStorage.getItem(claimConfirmedName(address))
  if (!lastClaim) {
    return
  }
  const text = _prepareJsonContent(lastClaim)
  const element = document.createElement('a')
  const filename = `lastConfirmedClaim-${(new Date()).toISOString()}.json`
  element.setAttribute('href', 'data:application/json;charset=utf-8,' + encodeURIComponent(text))
  element.setAttribute('download', filename)
  element.style.display = 'none'
  document.body.appendChild(element)
  element.click()
  document.body.removeChild(element)
}

/**
 * @param {string} jsonString
 * @returns {string}
 */
const _prepareJsonContent = (jsonString) => {
  jsonString = jsonString.replace('{', '{\n')
  jsonString = jsonString.replace('}', '\n}')
  jsonString = jsonString.replaceAll(',', ',\n')
  return jsonString
}

export default {
  saveConfirmedClaim,
  getConfirmedClaim,
  saveClaimAlice,
  getClaimAlice,
  downloadLastClaim
}
