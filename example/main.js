const getAddressButton = document.querySelector('#get-address')
const setNetButton = document.querySelector('#set-net')

cryptoSDK.addEventListener(event => {
  console.log('Crypto SDK event', event.detail)
})

getAddressButton.addEventListener('click', async () => {
  try {
    const result = await cryptoSDK.getAddress()
    console.log('get address', result)
  } catch (error) {
    console.log('Error while getting address', error)
  }
})

setNetButton.addEventListener('click', async () => {
  cryptoSDK.setRightNet()
})
