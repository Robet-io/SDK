/* eslint-disable import/no-anonymous-default-export */
/* eslint-disable-next-line no-redeclare */
/* global localStorage */

/**
 * @type {object}
 */
const savedClameType = {
  claimConfirmed: 'claimConfirmed',
  claimAlice: 'claimAlice'
}

/**
 *
 * @param {object} claim
 */
const saveConfirmedClaim = claim => {
  localStorage.setItem(savedClameType.claimConfirmed, JSON.stringify(claim))
}

/**
 *
 * @return {object} claim
 */
const getConfirmedClaim = () => {
  return JSON.parse(localStorage.getItem(savedClameType.claimConfirmed))
}

/**
 *
 * @param {object} claim
 */
const saveClaimAlice = claim => {
  localStorage.setItem(savedClameType.claimAlice, JSON.stringify(claim))
}

/**
 *
 * @return {object} claim
 */
const getClaimAlice = () => {
  return JSON.parse(localStorage.getItem(savedClameType.claimAlice))
}

const downloadLastClaim = () => {
  const lastClaim = localStorage.getItem(savedClameType.claimConfirmed)
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
 *
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
