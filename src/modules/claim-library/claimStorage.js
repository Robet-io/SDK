/* eslint-disable import/no-anonymous-default-export */
/* eslint-disable-next-line no-redeclare */
/* global localStorage */

const savedClameType = {
  claimConfirmed: 'claimConfirmed',
  claimAlice: 'claimAlice'
}

const saveConfirmedClaim = claim => {
  localStorage.setItem(savedClameType.claimConfirmed, JSON.stringify(claim))
}

const getConfirmedClaim = () => {
  return JSON.parse(localStorage.getItem(savedClameType.claimConfirmed))
}

const saveClaimAlice = claim => {
  localStorage.setItem(savedClameType.claimAlice, JSON.stringify(claim))
}

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
