/* eslint-disable import/no-anonymous-default-export */
import BigNumber from 'bignumber.js'

const toFixed = (value, decimal = 2) => {
  const aBN = new BigNumber(value + '')
  return aBN.toFixed(decimal)
}

const minus = (a, b) => {
  const aBN = new BigNumber(a + '')
  const bBN = new BigNumber(b + '')
  return aBN.minus(bBN).toFixed()
}

const plus = (a, b) => {
  const aBN = new BigNumber(a + '')
  const bBN = new BigNumber(b + '')
  return aBN.plus(bBN).toFixed()
}

const roundDecimals = (a, decimals = 2) => {
  const aBN = new BigNumber(a + '')
  return aBN.toFixed(decimals)
}

const roundUpToTen = (a) => {
  if (a === '0' || a === 0) {
    return '10'
  } else if (lt(a, 1)) {
    // return a
    // roundUpToDecimalTen
    const a2 = a.replace('0.', '')
    // 000002
    const l = a2.length
    console.log('l', l)
    const p = pow(10, l)
    console.log({ p })
    const b = times(a, p)
    console.log({ b })
    const c = roundUpToTen(b)
    console.log({ c })
    const d = div(c, p)
    console.log({ d })
    return d
  } else {
    const b = times(div(a, 10, 0, BigNumber.ROUND_UP), 10)
    return (b === (a + '')) ? roundUpToTen(plus(a, 1)) : b
  }
}

const times = (a, b, decimals = 18, type = BigNumber.ROUND_FLOOR) => {
  let aBN = new BigNumber(a + '')
  const bBN = new BigNumber(b + '')
  aBN = aBN.times(bBN).toFixed()
  decimals = parseInt(decimals)
  return dp(aBN, decimals, type)
}

const timesFloor = (a, b, decimals = 18) => {
  return times(a, b, decimals)
}

const div = (a, b, decimals = 18, type = BigNumber.ROUND_FLOOR) => {
  let aBN = new BigNumber(a + '')
  const bBN = new BigNumber(b + '')
  aBN = aBN.div(bBN).toFixed()
  decimals = parseInt(decimals)
  return dp(aBN, decimals, type)
}

const divFloor = (a, b, decimals = 18) => {
  return div(a, b, decimals)
}

const pow = (a, b) => {
  const aBN = new BigNumber(a + '')
  const bBN = new BigNumber(b + '')
  return aBN.pow(bBN)
}

const eq = (a, b) => {
  const aBN = new BigNumber(a + '')
  const bBN = new BigNumber(b + '')
  return aBN.eq(bBN)
}

const lt = (a, b) => {
  const aBN = new BigNumber(a + '')
  const bBN = new BigNumber(b + '')
  return aBN.lt(bBN)
}

const gt = (a, b) => {
  const aBN = new BigNumber(a + '')
  const bBN = new BigNumber(b + '')
  return aBN.gt(bBN)
}

const lte = (a, b) => {
  const aBN = new BigNumber(a + '')
  const bBN = new BigNumber(b + '')
  return aBN.lte(bBN)
}

const gte = (a, b) => {
  const aBN = new BigNumber(a + '')
  const bBN = new BigNumber(b + '')
  return aBN.gte(bBN)
}

const isNaN = (a) => {
  const aBN = new BigNumber(a + '')
  return aBN.isNaN()
}

const dp = (a, n, type) => {
  const aBN = new BigNumber(a + '')
  return aBN.dp(parseInt(n), type).toFixed()
}

const negated = (a) => {
  const aBN = new BigNumber(a + '')
  return aBN.negated().toFixed()
}

// module.exports = {
export default {
  minus,
  plus,
  times,
  div,
  pow,
  eq,
  lt,
  gt,
  lte,
  gte,
  isNaN,
  dp,
  negated,
  timesFloor,
  divFloor,
  toFixed,
  roundUpToTen,
  roundDecimals
}
