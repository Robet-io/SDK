import Web3 from 'web3'

/**
 * "001234500600700800900100200" => "1,234,500.6007008009001002"
 * "0x10" => "0.000000000000000016"
 * @param {string} number inWei, !not a BigNumber object
 * @param {integer} [reduceDecimalTo]
 * @return {string}
 */
const formatNumber = (number, reduceDecimalTo = 18) => {
  if (!number) return
  const web3 = new Web3()
  const x = web3.utils.fromWei(number)
  // (x + '').replace(',', '.')
  const a = x.split('.')
  const integer = a[0].toString().replace(/\b0+(?!$)/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  if (a[1]) {
    if (reduceDecimalTo) {
      const decimals = a[1].substring(0, reduceDecimalTo).replace(/0+$/, '')
      return integer + `${decimals ? '.' + decimals : ''}`
    } else {
      return integer + '.' + a[1]
    }
  } else {
    return integer
  }
}

export {
  formatNumber
}
