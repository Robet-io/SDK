/** 1234567.890100 => 1,234,567.8901 */
const formatNumber = (x, reduceDecimalTo) => {
  if (!x) return
  (x + '').replace(',', '.')
  const a = x.split('.')
  if (a[1]) {
    if (reduceDecimalTo) {
      const decimals = a[1].substring(0, reduceDecimalTo).replace(/0+$/, '')
      return a[0].toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') + `${decimals ? '.' + decimals : ''}`
    } else {
      return a[0].toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') + '.' + a[1]
    }
  } else {
    return a[0].toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  }
}

export {
  formatNumber
}
