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

export default {
  saveConfirmedClaim,
  getConfirmedClaim,
  saveClaimAlice,
  getClaimAlice
}
