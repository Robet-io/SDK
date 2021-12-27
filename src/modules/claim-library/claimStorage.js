/* eslint-disable import/no-anonymous-default-export */
/* eslint-disable-next-line no-redeclare */
/* global localStorage */

/*
  TODO: Save on localstorage..
  Diversi tipi di archivi:
  1. Ultimo claim confermato (sia da alice che da bob)
  // TODO ??? puo esistere unconfirmed claim di Bob ??? - è claim confermato.
  2. Ultimo claim di BOB unconfirmed
  3. Ultimo claim di MIO (di ALICE) unconfirmed
*/

const savedClameType = {
  claimConfirmed: 'claimConfirmed',
  claimAlice: 'claimAlice'
  // claimBob: 'claimBob'
}

const saveConfirmedClaim = claim => {
  localStorage.setItem(savedClameType.claimConfirmed, JSON.stringify(claim))
}

const getConfirmedClaim = async () => {
  // const savedClaim = await localStorage.getItem(savedClameType.claimConfirmed)
  // console.log(savedClaim)
  // return JSON.parse(null)
  return JSON.parse(await localStorage.getItem(savedClameType.claimConfirmed))
}

const saveClaimAlice = (claim) => {
  localStorage.setItem(savedClameType.claimAlice, JSON.stringify(claim))
}

const getClaimAlice = async () => {
  return JSON.parse(await localStorage.getItem(savedClameType.claimAlice))
}

// const saveClaimBob = claim => {
//   localStorage.setItem(savedClameType.claimBob, JSON.stringify(claim))
// }

// const getClaimBob = async () => {
//   return JSON.parse(await localStorage.getItem(savedClameType.claimBob))
// }

export default {
  saveConfirmedClaim,
  getConfirmedClaim,
  saveClaimAlice,
  getClaimAlice
  // saveClaimBob,
  // getClaimBob
}
