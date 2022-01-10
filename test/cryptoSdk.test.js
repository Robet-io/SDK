/* eslint-env jest */
import { eventType, addEventListener } from '../src/modules/events'
import cryptoSDK from '../src/index'
import MetamaskProvider from './mocks/MetamaskProvider.js'
import claimStorage from '../src/modules/claim-library/claimStorage'
import { signClaim } from './utils'

// to test:
//   + getAddress,
//   + isMetamaskInstalled,
//   + isRightNet,
//   + setRightNet
// + pay: current and legacy:
//    + 1. claim not saved: a) claim is valid, b) not valid
//    + 2. claim saved: a) claim is valid, b) not valid
//    + 3. wrong chain
// + payReceived
//    + 1. claim not saved: a) claim is valid, b) not valid
//    + 2. claim saved: a) claim is valid, b) not valid
//    + 3. wrong chain
// win

jest.mock('../src/modules/blockchain', () => {
  return {
    __esModule: true,
    default: {
      getVaultBalance: jest.fn((address) => {
        if (address === process.env.CSDK_ALICE_ADDRESS_WRONG) {
          return ({ balance: 1 })
        // } else if (address === process.env.CSDK_SERVER_ADDRESS) {
        //   return ({ balance: 1 })
        } else {
          return ({ balance: 20 })
        }
      })
    }
  }
})

describe('cryptoSDK library', () => {
  const ALICE_ADDRESS = process.env.CSDK_ALICE_ADDRESS
  const ALICE_PRIVATE_KEY = process.env.CSDK_ALICE_PRIVATE_KEY
  const ALICE_ADDRESS_WRONG = process.env.CSDK_ALICE_ADDRESS_WRONG
  // const ALICE_PRIVATE_KEY_WRONG = process.env.CSDK_ALICE_PRIVATE_KEY_WRONG

  const SERVER_ADDRESS = process.env.CSDK_SERVER_ADDRESS
  const SERVER_PRIVATE_KEY = process.env.CSDK_SERVER_PRIVATE_KEY

  const claimToPay = {
    id: 1,
    addresses: [ALICE_ADDRESS, SERVER_ADDRESS],
    amount: -5,
    cumulativeDebits: [5, 0],
    messageForAlice: 'You pay: 5 DE.GA',
    timestamp: 1639145450856,
    nonce: 1,
    signatures: [],
    type: 'ticket.play'
  }
  const aliceSignature = signClaim(claimToPay, ALICE_PRIVATE_KEY)
  const bobSignature = signClaim(claimToPay, SERVER_PRIVATE_KEY)

  const claimToPayRecieved = {
    ...claimToPay,
    signatures: [aliceSignature, bobSignature]
  }

  const claimWin = {
    id: 1,
    addresses: [ALICE_ADDRESS, SERVER_ADDRESS],
    amount: 10,
    cumulativeDebits: [0, 5],
    messageForAlice: 'You receive: 10 DE.GA',
    timestamp: 1639145450856,
    nonce: 2,
    signatures: [],
    type: 'ticket.win'
  }

  const bobSignatureWin = signClaim(claimWin, SERVER_PRIVATE_KEY)
  const aliceSignatureWin = signClaim(claimWin, ALICE_PRIVATE_KEY)
  claimWin.signatures = ['', bobSignatureWin]

  let events
  beforeEach(() => {
    events = []
    addEventListener(event => {
      // console.log('====== arrived event', event.detail)
      events.push(event.detail)
    })
  })

  // mock localStorage
  let mockFridge = {}
  beforeAll(() => {
    global.Storage.prototype.setItem = jest.fn((key, value) => {
      mockFridge[key] = value
    })
    global.Storage.prototype.getItem = jest.fn((key) => {
      const item = mockFridge[key]
      return item === undefined ? null : item
    })
  })

  beforeEach(() => {
    mockFridge = {}
  })

  afterAll(() => {
    global.Storage.prototype.setItem.mockReset()
    global.Storage.prototype.getItem.mockReset()
  })

  describe('Metamask is not installed', () => {
    test('throws error while getAddress AND arrives error event metamaskNotInstalled', async () => {
      const errorMsg = 'Metamask is not installed, unable to get user address'
      await expect(cryptoSDK.getAddress()).rejects.toThrowError(errorMsg)
      expect(events[0].type).toEqual(eventType.metamaskNotInstalled)
      expect(events[0].error).toBe(true)
    })

    test('returns false isMetamaskInstalled()', async () => {
      await expect(cryptoSDK.isMetamaskInstalled()).toBe(false)
    })

    test('isRightNet() returns false AND emits error event', async () => {
      expect(await cryptoSDK.isRightNet()).toBe(false)
      expect(events[0].type).toEqual(eventType.metamaskNotInstalled)
      expect(events[0].error).toBe(true)
    })

    test('setRightNet() - throws error AND returns error event', async () => {
      const errorMsg = 'Metamask is not installed'
      await expect(cryptoSDK.setRightNet()).rejects.toThrowError(errorMsg)
      expect(events[0].type).toEqual(eventType.network)
      expect(events[0].error).toBe(true)
    })

    test('setRightNet() - throws error AND returns error event', async () => {
      const errorMsg = 'Metamask is not installed'
      await expect(cryptoSDK.setRightNet()).rejects.toThrowError(errorMsg)
      expect(events[0].type).toEqual(eventType.network)
      expect(events[0].error).toBe(true)
    })

    test('pay() - throws error AND arrives error event ', async () => {
      const errorMsg = 'Metamask is not installed'
      await expect(cryptoSDK.pay(claimToPay)).rejects.toThrowError(errorMsg)
      expect(events[0].type).toEqual(eventType.metamaskNotInstalled)
      expect(events[0].error).toBe(true)
    })

    test('win() - throws error AND arrives error event ', async () => {
      const errorMsg = 'Metamask is not installed'
      await expect(cryptoSDK.win(claimWin)).rejects.toThrowError(errorMsg)
      expect(events[0].type).toEqual(eventType.metamaskNotInstalled)
      expect(events[0].error).toBe(true)
    })
  })

  describe('window.ethereum', () => {
    describe('the chain is right', () => {
      beforeEach(() => {
        window.ethereum = new MetamaskProvider({
          address: ALICE_ADDRESS,
          privateKey: ALICE_PRIVATE_KEY,
          chainId: 97
        })
      })

      test('getAddress() returns address', async () => {
        const account = await cryptoSDK.getAddress()
        expect(account).toEqual({ address: ALICE_ADDRESS })
      })

      test('isMetamaskInstalled() returns true', async () => {
        await expect(cryptoSDK.isMetamaskInstalled()).toBeTruthy()
      })

      test('isRightNet() returns true AND emits event', async () => {
        expect(await cryptoSDK.isRightNet()).toBe(true)
        expect(events[0].type).toEqual(eventType.network)
      })

      test('setRightNet() returns event', async () => {
        await cryptoSDK.setRightNet()
        expect(events[0].type).toEqual(eventType.network)
        expect(await cryptoSDK.isRightNet()).toBe(true)
      })

      describe('pay()', () => {
        describe('1. pay(), no claim saved in localStorage', () => {
          test('pay() returns signed claim AND emits event AND saves to localStorage', async () => {
            expect((await cryptoSDK.pay(claimToPay)).signatures[0]).toBe(aliceSignature)
            expect(events[0].type).toEqual(eventType.claimSigned)
            expect((await claimStorage.getClaimAlice()).signatures[0]).toBe(aliceSignature)
          })

          test("pay() when balance is not enough: throws error AND emits error event AND doesn't save to localStorage", async () => {
            const claimToPayNotValid = {
              ...claimToPay,
              addresses: [ALICE_ADDRESS_WRONG, SERVER_ADDRESS]
            }
            const errorMsg = 'Not enough balance'
            await expect(cryptoSDK.pay(claimToPayNotValid)).rejects.toThrowError(errorMsg)
            expect(events[0].type).toEqual(eventType.claimNotSigned)
            expect(events[0].error).toBe(true)
            expect(await claimStorage.getClaimAlice()).toBe(null)
          })

          test("pay(), wrong id: throws error AND emits error event AND doesn't save to localStorage", async () => {
            const claimToPayNotValid = {
              ...claimToPay,
              id: 2
            }
            const errorMsg = 'Invalid claim id: 2'
            await expect(cryptoSDK.pay(claimToPayNotValid)).rejects.toThrowError(errorMsg)
            expect(events[0].type).toEqual(eventType.claimNotSigned)
            expect(events[0].error).toBe(true)
            expect(await claimStorage.getClaimAlice()).toBe(null)
          })

          test("pay(), wrong nonce: throws error AND emits error event AND doesn't save to localStorage", async () => {
            const claimToPayNotValid = {
              ...claimToPay,
              nonce: 2
            }
            const errorMsg = 'Invalid claim nonce: 2'
            await expect(cryptoSDK.pay(claimToPayNotValid)).rejects.toThrowError(errorMsg)
            expect(events[0].type).toEqual(eventType.claimNotSigned)
            expect(events[0].error).toBe(true)
            expect(await claimStorage.getClaimAlice()).toBe(null)
          })

          test("pay(), wrong server address: throws error AND emits error event AND doesn't save to localStorage", async () => {
            const claimToPayNotValid = {
              ...claimToPay,
              addresses: [ALICE_ADDRESS, ALICE_ADDRESS]
            }
            const errorMsg = 'Invalid address of Server: 0x0f671cad8f3dfa3dcf7fcf8cfe17a3cee4259175 - expected: 0xeA085D9698651e76750F07d0dE0464476187b3ca'
            await expect(cryptoSDK.pay(claimToPayNotValid)).rejects.toThrowError(errorMsg)
            expect(events[0].type).toEqual(eventType.claimNotSigned)
            expect(events[0].error).toBe(true)
            expect(await claimStorage.getClaimAlice()).toBe(null)
          })

          test("pay(), wrong Alice debit: throws error AND emits error event AND doesn't save to localStorage", async () => {
            const claimToPayNotValid = {
              ...claimToPay,
              cumulativeDebits: [10, 0]
            }
            const errorMsg = 'Invalid claim cumulative debit of Client: 10 - expected: 5'
            await expect(cryptoSDK.pay(claimToPayNotValid)).rejects.toThrowError(errorMsg)
            expect(events[0].type).toEqual(eventType.claimNotSigned)
            expect(events[0].error).toBe(true)
            expect(await claimStorage.getClaimAlice()).toBe(null)
          })

          test("pay(), wrong Server debit: throws error AND emits error event AND doesn't save to localStorage", async () => {
            const claimToPayNotValid = {
              ...claimToPay,
              cumulativeDebits: [5, 10]
            }
            const errorMsg = 'Invalid claim cumulative debit of Server: 10 - expected: 0'
            await expect(cryptoSDK.pay(claimToPayNotValid)).rejects.toThrowError(errorMsg)
            expect(events[0].type).toEqual(eventType.claimNotSigned)
            expect(events[0].error).toBe(true)
            expect(await claimStorage.getClaimAlice()).toBe(null)
          })
        })

        describe('2. pay(), exists a claim saved in localStorage', () => {
          const claimToPay2 = {
            id: 1,
            addresses: [ALICE_ADDRESS, SERVER_ADDRESS],
            amount: -6,
            cumulativeDebits: [11, 0],
            messageForAlice: 'You pay: 6 DE.GA',
            timestamp: 1639145450856,
            nonce: 2,
            signatures: [aliceSignature, ''],
            type: 'ticket.play'
          }
          const aliceSignature2 = '0x940194654d3894e4c443c11a6723bdac84bf1dd231ec1f409375c974d8ea3adb1d4e052db8243f2eff40c37d46f613097a936c02a17d241283ceec718393e5ff1b'
          beforeEach(() => {
            const previousClaim = {
              id: 1,
              addresses: [ALICE_ADDRESS, SERVER_ADDRESS],
              amount: -5,
              cumulativeDebits: [5, 0],
              messageForAlice: 'You pay: 5 DE.GA',
              timestamp: 1639145450856,
              nonce: 1,
              signatures: [aliceSignature, ''],
              type: 'ticket.play'
            }
            claimStorage.saveConfirmedClaim(previousClaim)
          })

          test('pay() returns signed claim AND emits event AND saves to localStorage', async () => {
            expect((await cryptoSDK.pay(claimToPay2)).signatures[0]).toBe(aliceSignature2)
            expect(events[0].type).toEqual(eventType.claimSigned)
            expect((await claimStorage.getClaimAlice()).nonce).toBe(2)
          })

          test("pay() when balance is not enough: throws error AND emits error event AND doesn't save to localStorage", async () => {
            const claimToPay2NotValid = {
              ...claimToPay2,
              addresses: [ALICE_ADDRESS_WRONG, SERVER_ADDRESS]
            }
            const errorMsg = 'Not enough balance'
            await expect(cryptoSDK.pay(claimToPay2NotValid)).rejects.toThrowError(errorMsg)
            expect(events[0].type).toEqual(eventType.claimNotSigned)
            expect(events[0].error).toBe(true)
            expect(await claimStorage.getClaimAlice()).toBe(null)
          })

          test("pay(), wrong id: throws error AND emits error event AND doesn't save to localStorage", async () => {
            const claimToPayNotValid = {
              ...claimToPay2,
              id: 2
            }
            const errorMsg = 'Invalid claim id: 2 - last claim id: 1'
            await expect(cryptoSDK.pay(claimToPayNotValid)).rejects.toThrowError(errorMsg)
            expect(events[0].type).toEqual(eventType.claimNotSigned)
            expect(events[0].error).toBe(true)
            expect(await claimStorage.getClaimAlice()).toBe(null)
          })

          test("pay(), wrong nonce: throws error AND emits error event AND doesn't save to localStorage", async () => {
            const claimToPayNotValid = {
              ...claimToPay2,
              nonce: 1
            }
            const errorMsg = 'Invalid claim nonce: 1 - last claim nonce: 1'
            await expect(cryptoSDK.pay(claimToPayNotValid)).rejects.toThrowError(errorMsg)
            expect(events[0].type).toEqual(eventType.claimNotSigned)
            expect(events[0].error).toBe(true)
            expect(await claimStorage.getClaimAlice()).toBe(null)
          })

          test("pay(), wrong server address: throws error AND emits error event AND doesn't save to localStorage", async () => {
            const claimToPayNotValid = {
              ...claimToPay2,
              addresses: [ALICE_ADDRESS, ALICE_ADDRESS]
            }
            const errorMsg = 'Invalid address of Server'
            await expect(cryptoSDK.pay(claimToPayNotValid)).rejects.toThrowError(errorMsg)
            expect(events[0].type).toEqual(eventType.claimNotSigned)
            expect(events[0].error).toBe(true)
            expect(await claimStorage.getClaimAlice()).toBe(null)
          })

          test("pay(), wrong Alice debit: throws error AND emits error event AND doesn't save to localStorage", async () => {
            const claimToPayNotValid = {
              ...claimToPay2,
              cumulativeDebits: [10, 0]
            }
            const errorMsg = 'Invalid claim cumulative debit of Client:'
            await expect(cryptoSDK.pay(claimToPayNotValid)).rejects.toThrowError(errorMsg)
            expect(events[0].type).toEqual(eventType.claimNotSigned)
            expect(events[0].error).toBe(true)
            expect(await claimStorage.getClaimAlice()).toBe(null)
          })

          test("pay(), wrong Server debit: throws error AND emits error event AND doesn't save to localStorage", async () => {
            const claimToPayNotValid = {
              ...claimToPay2,
              cumulativeDebits: [11, 10]
            }
            const errorMsg = 'Invalid claim cumulative debit of Server:'
            await expect(cryptoSDK.pay(claimToPayNotValid)).rejects.toThrowError(errorMsg)
            expect(events[0].type).toEqual(eventType.claimNotSigned)
            expect(events[0].error).toBe(true)
            expect(await claimStorage.getClaimAlice()).toBe(null)
          })
        })
      })

      describe('payReceived()', () => {
        describe('1. payReceived(), no claim saved in localStorage', () => {
          test('payReceived() emits event AND saves to localStorage in confirmedClaim', async () => {
            await cryptoSDK.payReceived(claimToPayRecieved)
            expect(events[0].type).toEqual(eventType.paymentConfirmed)
            expect((await claimStorage.getConfirmedClaim()).signatures[1]).toBe(bobSignature)
          })

          test("payReceived(), wrong id: throws error AND emits error event AND doesn't save to localStorage", async () => {
            const claimToPayNotValid = {
              ...claimToPayRecieved,
              id: 2
            }
            const errorMsg = 'Invalid claim id: 2'
            await expect(cryptoSDK.payReceived(claimToPayNotValid)).rejects.toThrowError(errorMsg)
            expect(events[0].type).toEqual(eventType.paymentNotConfirmed)
            expect(events[0].error).toBe(true)
            expect(await claimStorage.getConfirmedClaim()).toBe(null)
          })

          test("payReceived(), wrong nonce: throws error AND emits error event AND doesn't save to localStorage", async () => {
            const claimToPayNotValid = {
              ...claimToPayRecieved,
              nonce: 2
            }
            const errorMsg = 'Invalid claim nonce: 2'
            await expect(cryptoSDK.payReceived(claimToPayNotValid)).rejects.toThrowError(errorMsg)
            expect(events[0].type).toEqual(eventType.paymentNotConfirmed)
            expect(events[0].error).toBe(true)
            expect(await claimStorage.getConfirmedClaim()).toBe(null)
          })

          test("payReceived(), wrong server address: throws error AND emits error event AND doesn't save to localStorage", async () => {
            const claimToPayNotValid = {
              ...claimToPayRecieved,
              addresses: [ALICE_ADDRESS, ALICE_ADDRESS]
            }
            const errorMsg = 'Invalid address of Server: 0x0f671cad8f3dfa3dcf7fcf8cfe17a3cee4259175 - expected: 0xeA085D9698651e76750F07d0dE0464476187b3ca'
            await expect(cryptoSDK.payReceived(claimToPayNotValid)).rejects.toThrowError(errorMsg)
            expect(events[0].type).toEqual(eventType.paymentNotConfirmed)
            expect(events[0].error).toBe(true)
            expect(await claimStorage.getConfirmedClaim()).toBe(null)
          })

          test("payReceived(), wrong Alice debit: throws error AND emits error event AND doesn't save to localStorage", async () => {
            const claimToPayNotValid = {
              ...claimToPayRecieved,
              cumulativeDebits: [10, 0]
            }
            const errorMsg = 'Invalid claim cumulative debit of Client: 10 - expected: 5'
            await expect(cryptoSDK.payReceived(claimToPayNotValid)).rejects.toThrowError(errorMsg)
            expect(events[0].type).toEqual(eventType.paymentNotConfirmed)
            expect(events[0].error).toBe(true)
            expect(await claimStorage.getConfirmedClaim()).toBe(null)
          })

          test("payReceived(), wrong Server debit: throws error AND emits error event AND doesn't save to localStorage", async () => {
            const claimToPayNotValid = {
              ...claimToPayRecieved,
              cumulativeDebits: [5, 10]
            }
            const errorMsg = 'Invalid claim cumulative debit of Server: 10 - expected: 0'
            await expect(cryptoSDK.payReceived(claimToPayNotValid)).rejects.toThrowError(errorMsg)
            expect(events[0].type).toEqual(eventType.paymentNotConfirmed)
            expect(events[0].error).toBe(true)
            expect(await claimStorage.getConfirmedClaim()).toBe(null)
          })

          test("payReceived(), wrong server signature: throws error AND emits error event AND doesn't save to localStorage", async () => {
            const claimToPayNotValid = {
              ...claimToPayRecieved,
              signatures: [aliceSignature, bobSignature + '123']
            }
            const errorMsg = "Server's signature is not verified"
            await expect(cryptoSDK.payReceived(claimToPayNotValid)).rejects.toThrowError(errorMsg)
            expect(events[0].type).toEqual(eventType.paymentNotConfirmed)
            expect(events[0].error).toBe(true)
            expect(await claimStorage.getConfirmedClaim()).toBe(null)
          })
        })

        describe('2. payReceived(), exists a claim saved in localStorage', () => {
          beforeEach(() => {
            const claimToPaySaved = {
              ...claimToPayRecieved,
              signatures: [aliceSignature, '']
            }
            claimStorage.saveClaimAlice(claimToPaySaved)
          })

          test('payReceived() emits event AND saves to localStorage in confirmedClaim', async () => {
            await cryptoSDK.payReceived(claimToPayRecieved)
            expect(events[0].type).toEqual(eventType.paymentConfirmed)
            expect((await claimStorage.getConfirmedClaim()).signatures[1]).toBe(bobSignature)
          })

          test("payReceived(), wrong id: throws error AND emits error event AND doesn't save to localStorage", async () => {
            const claimToPayNotValid = {
              ...claimToPayRecieved,
              id: 2
            }
            const errorMsg = 'Invalid claim id:'
            await expect(cryptoSDK.payReceived(claimToPayNotValid)).rejects.toThrowError(errorMsg)
            expect(events[0].type).toEqual(eventType.paymentNotConfirmed)
            expect(events[0].error).toBe(true)
            expect(await claimStorage.getConfirmedClaim()).toBe(null)
          })

          test("payReceived(), wrong nonce: throws error AND emits error event AND doesn't save to localStorage", async () => {
            const claimToPayNotValid = {
              ...claimToPayRecieved,
              nonce: 2
            }
            const errorMsg = 'Invalid claim nonce:'
            await expect(cryptoSDK.payReceived(claimToPayNotValid)).rejects.toThrowError(errorMsg)
            expect(events[0].type).toEqual(eventType.paymentNotConfirmed)
            expect(events[0].error).toBe(true)
            expect(await claimStorage.getConfirmedClaim()).toBe(null)
          })

          test("payReceived(), wrong server address: throws error AND emits error event AND doesn't save to localStorage", async () => {
            const claimToPayNotValid = {
              ...claimToPayRecieved,
              addresses: [ALICE_ADDRESS, ALICE_ADDRESS]
            }
            const errorMsg = 'Invalid address of Server'
            await expect(cryptoSDK.payReceived(claimToPayNotValid)).rejects.toThrowError(errorMsg)
            expect(events[0].type).toEqual(eventType.paymentNotConfirmed)
            expect(events[0].error).toBe(true)
            expect(await claimStorage.getConfirmedClaim()).toBe(null)
          })

          test("payReceived(), wrong Client address: throws error AND emits error event AND doesn't save to localStorage", async () => {
            const claimToPayNotValid = {
              ...claimToPayRecieved,
              addresses: ['123', SERVER_ADDRESS]
            }
            const errorMsg = 'Invalid address of Client'
            await expect(cryptoSDK.payReceived(claimToPayNotValid)).rejects.toThrowError(errorMsg)
            expect(events[0].type).toEqual(eventType.paymentNotConfirmed)
            expect(events[0].error).toBe(true)
            expect(await claimStorage.getConfirmedClaim()).toBe(null)
          })

          test("payReceived(), wrong Alice debit: throws error AND emits error event AND doesn't save to localStorage", async () => {
            const claimToPayNotValid = {
              ...claimToPayRecieved,
              cumulativeDebits: [10, 0]
            }
            const errorMsg = 'Invalid claim cumulative debit of Client:'
            await expect(cryptoSDK.payReceived(claimToPayNotValid)).rejects.toThrowError(errorMsg)
            expect(events[0].type).toEqual(eventType.paymentNotConfirmed)
            expect(events[0].error).toBe(true)
            expect(await claimStorage.getConfirmedClaim()).toBe(null)
          })

          test("payReceived(), wrong Server debit: throws error AND emits error event AND doesn't save to localStorage", async () => {
            const claimToPayNotValid = {
              ...claimToPayRecieved,
              cumulativeDebits: [5, 10]
            }
            const errorMsg = 'Invalid claim cumulative debit of Server:'
            await expect(cryptoSDK.payReceived(claimToPayNotValid)).rejects.toThrowError(errorMsg)
            expect(events[0].type).toEqual(eventType.paymentNotConfirmed)
            expect(events[0].error).toBe(true)
            expect(await claimStorage.getConfirmedClaim()).toBe(null)
          })

          test("payReceived(), wrong server signature: throws error AND emits error event AND doesn't save to localStorage", async () => {
            const claimToPayNotValid = {
              ...claimToPayRecieved,
              signatures: [aliceSignature, bobSignature + '123']
            }
            const errorMsg = "Server's signature is not verified"
            await expect(cryptoSDK.payReceived(claimToPayNotValid)).rejects.toThrowError(errorMsg)
            expect(events[0].type).toEqual(eventType.paymentNotConfirmed)
            expect(events[0].error).toBe(true)
            expect(await claimStorage.getConfirmedClaim()).toBe(null)
          })
        })
      })

      describe('1. win(), exists a claim saved in localStorage', () => {
        beforeEach(async () => {
          await claimStorage.saveConfirmedClaim(claimToPayRecieved)
        })

        test('win() returns signed claim AND emits event AND saves to localStorage', async () => {
          expect((await cryptoSDK.win(claimWin)).signatures[0]).toBe(aliceSignatureWin)
          expect(events[0].type).toEqual(eventType.winClaimSigned)
          expect((await claimStorage.getConfirmedClaim()).signatures[0]).toBe(aliceSignatureWin)
        })

        // test("win() when balance of Server is not enough: throws error AND emits error event AND doesn't save to localStorage", async () => {
        //   const claimNotValid = {
        //     ...claimWin
        //   }
        //   const errorMsg = "Server's balance is not enough"
        //   await expect(cryptoSDK.win(claimNotValid)).rejects.toThrowError(errorMsg)
        //   expect(events[0].type).toEqual(eventType.winNotConfirmed)
        //   expect(events[0].error).toBe(true)
        //   expect((await claimStorage.getConfirmedClaim()).nonce).toBe(1)
        // })

        test("win(), wrong id: throws error AND emits error event AND doesn't save to localStorage", async () => {
          const claimWinNotValid = {
            ...claimWin,
            id: 2
          }
          const errorMsg = 'Invalid claim id: 2'
          await expect(cryptoSDK.win(claimWinNotValid)).rejects.toThrowError(errorMsg)
          expect(events[0].type).toEqual(eventType.winNotConfirmed)
          expect(events[0].error).toBe(true)
          expect((await claimStorage.getConfirmedClaim()).nonce).toBe(1)
        })

        test("win(), wrong nonce: throws error AND emits error event AND doesn't save to localStorage", async () => {
          const claimWinNotValid = {
            ...claimWin,
            nonce: 3
          }
          const errorMsg = 'Invalid claim nonce: 3'
          await expect(cryptoSDK.win(claimWinNotValid)).rejects.toThrowError(errorMsg)
          expect(events[0].type).toEqual(eventType.winNotConfirmed)
          expect(events[0].error).toBe(true)
          expect((await claimStorage.getConfirmedClaim()).nonce).toBe(1)
        })

        test("win(), wrong server address: throws error AND emits error event AND doesn't save to localStorage", async () => {
          const claimWinNotValid = {
            ...claimWin,
            addresses: [ALICE_ADDRESS, ALICE_ADDRESS]
          }
          const errorMsg = 'Invalid address of Server'
          await expect(cryptoSDK.win(claimWinNotValid)).rejects.toThrowError(errorMsg)
          expect(events[0].type).toEqual(eventType.winNotConfirmed)
          expect(events[0].error).toBe(true)
          expect((await claimStorage.getConfirmedClaim()).nonce).toBe(1)
        })

        test("win(), wrong Alice debit: throws error AND emits error event AND doesn't save to localStorage", async () => {
          const claimWinNotValid = {
            ...claimWin,
            cumulativeDebits: [10, 0]
          }
          const errorMsg = 'Invalid claim cumulative debit of Client: 10 - expected: 0'
          await expect(cryptoSDK.win(claimWinNotValid)).rejects.toThrowError(errorMsg)
          expect(events[0].type).toEqual(eventType.winNotConfirmed)
          expect(events[0].error).toBe(true)
          expect((await claimStorage.getConfirmedClaim()).nonce).toBe(1)
        })

        test("win(), wrong Server debit: throws error AND emits error event AND doesn't save to localStorage", async () => {
          const claimWinNotValid = {
            ...claimWin,
            cumulativeDebits: [0, 10]
          }
          const errorMsg = 'Invalid claim cumulative debit of Server: 10 - expected: 5'
          await expect(cryptoSDK.win(claimWinNotValid)).rejects.toThrowError(errorMsg)
          expect(events[0].type).toEqual(eventType.winNotConfirmed)
          expect(events[0].error).toBe(true)
          expect((await claimStorage.getConfirmedClaim()).nonce).toBe(1)
        })

        test("win(), wrong server signature: throws error AND emits error event AND doesn't save to localStorage", async () => {
          const claimWinNotValid = {
            ...claimWin,
            signatures: ['', bobSignature]
          }
          const errorMsg = "Server's signature is not verified"
          await expect(cryptoSDK.win(claimWinNotValid)).rejects.toThrowError(errorMsg)
          expect(events[0].type).toEqual(eventType.winNotConfirmed)
          expect(events[0].error).toBe(true)
          expect((await claimStorage.getConfirmedClaim()).nonce).toBe(1)
        })
      })

      describe('2. win(), no claim saved in localStorage', () => {
        const claimWinFirst = {
          id: 1,
          addresses: [ALICE_ADDRESS, SERVER_ADDRESS],
          amount: 10,
          cumulativeDebits: [0, 10],
          messageForAlice: 'You receive: 10 DE.GA',
          timestamp: 1639145450856,
          nonce: 1,
          signatures: [],
          type: 'ticket.win'
        }

        const bobSignatureWinFirst = signClaim(claimWinFirst, SERVER_PRIVATE_KEY)
        const aliceSignatureWinFirst = signClaim(claimWinFirst, ALICE_PRIVATE_KEY)
        claimWinFirst.signatures = ['', bobSignatureWinFirst]

        test('win() returns signed claim AND emits event AND saves to localStorage', async () => {
          expect((await cryptoSDK.win(claimWinFirst)).signatures[0]).toBe(aliceSignatureWinFirst)
          expect(events[0].type).toEqual(eventType.winClaimSigned)
          expect((await claimStorage.getConfirmedClaim()).signatures[0]).toBe(aliceSignatureWinFirst)
        })

        test("win(), wrong id: throws error AND emits error event AND doesn't save to localStorage", async () => {
          const claimWinNotValid = {
            ...claimWinFirst,
            id: 2
          }
          const errorMsg = 'Invalid claim id: 2'
          await expect(cryptoSDK.win(claimWinNotValid)).rejects.toThrowError(errorMsg)
          expect(events[0].type).toEqual(eventType.winNotConfirmed)
          expect(events[0].error).toBe(true)
          expect(await claimStorage.getClaimAlice()).toBe(null)
        })

        test("win(), wrong nonce: throws error AND emits error event AND doesn't save to localStorage", async () => {
          const claimWinNotValid = {
            ...claimWinFirst,
            nonce: 3
          }
          const errorMsg = 'Invalid claim nonce: 3'
          await expect(cryptoSDK.win(claimWinNotValid)).rejects.toThrowError(errorMsg)
          expect(events[0].type).toEqual(eventType.winNotConfirmed)
          expect(events[0].error).toBe(true)
          expect(await claimStorage.getClaimAlice()).toBe(null)
        })

        test("win(), wrong server address: throws error AND emits error event AND doesn't save to localStorage", async () => {
          const claimWinNotValid = {
            ...claimWinFirst,
            addresses: [ALICE_ADDRESS, ALICE_ADDRESS]
          }
          const errorMsg = 'Invalid address of Server'
          await expect(cryptoSDK.win(claimWinNotValid)).rejects.toThrowError(errorMsg)
          expect(events[0].type).toEqual(eventType.winNotConfirmed)
          expect(events[0].error).toBe(true)
          expect(await claimStorage.getClaimAlice()).toBe(null)
        })

        test("win(), wrong Alice debit: throws error AND emits error event AND doesn't save to localStorage", async () => {
          const claimWinNotValid = {
            ...claimWinFirst,
            cumulativeDebits: [10, 0]
          }
          const errorMsg = 'Invalid claim cumulative debit of Client: 10 - expected: 0'
          await expect(cryptoSDK.win(claimWinNotValid)).rejects.toThrowError(errorMsg)
          expect(events[0].type).toEqual(eventType.winNotConfirmed)
          expect(events[0].error).toBe(true)
          expect(await claimStorage.getClaimAlice()).toBe(null)
        })

        test("win(), wrong Server debit: throws error AND emits error event AND doesn't save to localStorage", async () => {
          const claimWinNotValid = {
            ...claimWinFirst,
            cumulativeDebits: [0, 5]
          }
          const errorMsg = 'Invalid claim cumulative debit of Server: 5 - expected: 10'
          await expect(cryptoSDK.win(claimWinNotValid)).rejects.toThrowError(errorMsg)
          expect(events[0].type).toEqual(eventType.winNotConfirmed)
          expect(events[0].error).toBe(true)
          expect(await claimStorage.getClaimAlice()).toBe(null)
        })

        test("win(), wrong server signature: throws error AND emits error event AND doesn't save to localStorage", async () => {
          const claimWinNotValid = {
            ...claimWinFirst,
            signatures: ['', bobSignature]
          }
          const errorMsg = "Server's signature is not verified"
          await expect(cryptoSDK.win(claimWinNotValid)).rejects.toThrowError(errorMsg)
          expect(events[0].type).toEqual(eventType.winNotConfirmed)
          expect(events[0].error).toBe(true)
          expect(await claimStorage.getClaimAlice()).toBe(null)
        })
      })
    })

    describe('the chain is wrong', () => {
      beforeEach(() => {
        window.ethereum = new MetamaskProvider({
          address: ALICE_ADDRESS,
          privateKey: ALICE_PRIVATE_KEY,
          chainId: 16
        })
      })

      test('getAddress() - throws error AND arrives error event wrongNetworkOnGetAddress', async () => {
        const errorMsg = 'Error: Please change your network on Metamask. Valid networks are: Binance Smart Chain Testnet'
        await expect(cryptoSDK.getAddress()).rejects.toThrowError(errorMsg)
        expect(events[0].type).toEqual(eventType.wrongNetworkOnGetAddress)
        expect(events[0].error).toBe(true)
      })

      test('isMetamaskInstalled() returns true', async () => {
        await expect(cryptoSDK.isMetamaskInstalled()).toBe(true)
      })

      test('isRightNet() returns false AND emits error event', async () => {
        expect(await cryptoSDK.isRightNet()).toBe(false)
        expect(events[0].type).toEqual(eventType.network)
        expect(events[0].error).toBe(true)
      })

      test('setRightNet() returns event and changes network', async () => {
        expect(await cryptoSDK.isRightNet()).toBe(false)
        await cryptoSDK.setRightNet()
        expect(events[0].type).toEqual(eventType.network)
        expect(await cryptoSDK.isRightNet()).toBe(true)
      })

      test("pay() throws error AND emits error event AND doesn't save to localStorage", async () => {
        const errorMsg = 'Please change your network on Metamask. Valid networks are:'
        await expect(cryptoSDK.pay(claimToPay)).rejects.toThrowError(errorMsg)
        expect(events[0].type).toEqual(eventType.claimNotSigned)
        expect(events[0].error).toBe(true)
        expect(await claimStorage.getClaimAlice()).toBe(null)
      })

      test("payReceived() throws error AND emits error event AND doesn't save to localStorage", async () => {
        const errorMsg = 'Please change your network on Metamask. Valid networks are:'
        await expect(cryptoSDK.payReceived(claimToPayRecieved)).rejects.toThrowError(errorMsg)
        expect(events[0].type).toEqual(eventType.paymentNotConfirmed)
        expect(events[0].error).toBe(true)
        expect(await claimStorage.getConfirmedClaim()).toBe(null)
      })

      test("win() throws error AND emits error event AND doesn't save to localStorage", async () => {
        const errorMsg = 'Please change your network on Metamask. Valid networks are:'
        await expect(cryptoSDK.win(claimWin)).rejects.toThrowError(errorMsg)
        expect(events[0].type).toEqual(eventType.winNotConfirmed)
        expect(events[0].error).toBe(true)
        expect(await claimStorage.getConfirmedClaim()).toBe(null)
      })
    })
  })

  describe('window.web3 - legacy wallet', () => {
    describe('the chain is right', () => {
      beforeEach(() => {
        window.ethereum = undefined
        window.web3 = {
          currentProvider: new MetamaskProvider({
            address: ALICE_ADDRESS,
            privateKey: ALICE_PRIVATE_KEY,
            chainId: 97
          }),
          eth: {
            accounts: [ALICE_ADDRESS]
          }
        }
      })

      test('getAddress() returns address', async () => {
        const account = await cryptoSDK.getAddress()
        expect(account).toEqual({ address: ALICE_ADDRESS })
      })

      test('isMetamaskInstalled() returns true', async () => {
        await expect(cryptoSDK.isMetamaskInstalled()).toBeTruthy()
      })

      test('isRightNet() returns true AND emits event', async () => {
        expect(await cryptoSDK.isRightNet()).toBe(true)
        expect(events[0].type).toEqual(eventType.network)
      })

      test('setRightNet() - only manual, throws error AND returns error event', async () => {
        const errorMsg = 'This version of Metamask supports only manual network switching'
        await expect(cryptoSDK.setRightNet()).rejects.toThrowError(errorMsg)
        expect(events[0].type).toEqual(eventType.network)
        expect(events[0].error).toBe(true)
      })

      describe('pay()', () => {
        describe('1. pay(), no claim saved in localStorage', () => {
          test('pay() returns signed claim AND emits event AND saves to localStorage', async () => {
            expect((await cryptoSDK.pay(claimToPay)).signatures[0]).toBe(aliceSignature)
            expect(events[0].type).toEqual(eventType.claimSigned)
            expect((await claimStorage.getClaimAlice()).signatures[0]).toBe(aliceSignature)
          })

          test("pay(), wrong id: throws error AND emits error event AND doesn't save to localStorage", async () => {
            const claimToPayNotValid = {
              ...claimToPay,
              id: 2
            }
            const errorMsg = 'Invalid claim id: 2'
            await expect(cryptoSDK.pay(claimToPayNotValid)).rejects.toThrowError(errorMsg)
            expect(events[0].type).toEqual(eventType.claimNotSigned)
            expect(events[0].error).toBe(true)
            expect(await claimStorage.getClaimAlice()).toBe(null)
          })

          test("pay(), wrong nonce: throws error AND emits error event AND doesn't save to localStorage", async () => {
            const claimToPayNotValid = {
              ...claimToPay,
              nonce: 2
            }
            const errorMsg = 'Invalid claim nonce: 2'
            await expect(cryptoSDK.pay(claimToPayNotValid)).rejects.toThrowError(errorMsg)
            expect(events[0].type).toEqual(eventType.claimNotSigned)
            expect(events[0].error).toBe(true)
            expect(await claimStorage.getClaimAlice()).toBe(null)
          })

          test("pay(), wrong server address: throws error AND emits error event AND doesn't save to localStorage", async () => {
            const claimToPayNotValid = {
              ...claimToPay,
              addresses: [ALICE_ADDRESS, ALICE_ADDRESS]
            }
            const errorMsg = 'Invalid address of Server: 0x0f671cad8f3dfa3dcf7fcf8cfe17a3cee4259175 - expected: 0xeA085D9698651e76750F07d0dE0464476187b3ca'
            await expect(cryptoSDK.pay(claimToPayNotValid)).rejects.toThrowError(errorMsg)
            expect(events[0].type).toEqual(eventType.claimNotSigned)
            expect(events[0].error).toBe(true)
            expect(await claimStorage.getClaimAlice()).toBe(null)
          })

          test("pay(), wrong Alice debit: throws error AND emits error event AND doesn't save to localStorage", async () => {
            const claimToPayNotValid = {
              ...claimToPay,
              cumulativeDebits: [10, 0]
            }
            const errorMsg = 'Invalid claim cumulative debit of Client: 10 - expected: 5'
            await expect(cryptoSDK.pay(claimToPayNotValid)).rejects.toThrowError(errorMsg)
            expect(events[0].type).toEqual(eventType.claimNotSigned)
            expect(events[0].error).toBe(true)
            expect(await claimStorage.getClaimAlice()).toBe(null)
          })

          test("pay(), wrong Server debit: throws error AND emits error event AND doesn't save to localStorage", async () => {
            const claimToPayNotValid = {
              ...claimToPay,
              cumulativeDebits: [5, 10]
            }
            const errorMsg = 'Invalid claim cumulative debit of Server: 10 - expected: 0'
            await expect(cryptoSDK.pay(claimToPayNotValid)).rejects.toThrowError(errorMsg)
            expect(events[0].type).toEqual(eventType.claimNotSigned)
            expect(events[0].error).toBe(true)
            expect(await claimStorage.getClaimAlice()).toBe(null)
          })
        })

        describe('2. pay(), exists a claim saved in localStorage', () => {
          const claimToPay2 = {
            id: 1,
            addresses: [ALICE_ADDRESS, SERVER_ADDRESS],
            amount: -6,
            cumulativeDebits: [11, 0],
            messageForAlice: 'You pay: 6 DE.GA',
            timestamp: 1639145450856,
            nonce: 2,
            signatures: [aliceSignature, ''],
            type: 'ticket.play'
          }
          const aliceSignature2 = '0x940194654d3894e4c443c11a6723bdac84bf1dd231ec1f409375c974d8ea3adb1d4e052db8243f2eff40c37d46f613097a936c02a17d241283ceec718393e5ff1b'
          beforeEach(() => {
            const previousClaim = {
              id: 1,
              addresses: [ALICE_ADDRESS, SERVER_ADDRESS],
              amount: -5,
              cumulativeDebits: [5, 0],
              messageForAlice: 'You pay: 5 DE.GA',
              timestamp: 1639145450856,
              nonce: 1,
              signatures: [aliceSignature, ''],
              type: 'ticket.play'
            }
            claimStorage.saveConfirmedClaim(previousClaim)
          })

          test('pay() returns signed claim AND emits event AND saves to localStorage', async () => {
            expect((await cryptoSDK.pay(claimToPay2)).signatures[0]).toBe(aliceSignature2)
            expect(events[0].type).toEqual(eventType.claimSigned)
            expect((await claimStorage.getClaimAlice()).nonce).toBe(2)
          })

          test("pay(), wrong id: throws error AND emits error event AND doesn't save to localStorage", async () => {
            const claimToPayNotValid = {
              ...claimToPay2,
              id: 2
            }
            const errorMsg = 'Invalid claim id:'
            await expect(cryptoSDK.pay(claimToPayNotValid)).rejects.toThrowError(errorMsg)
            expect(events[0].type).toEqual(eventType.claimNotSigned)
            expect(events[0].error).toBe(true)
            expect(await claimStorage.getClaimAlice()).toBe(null)
          })

          test("pay(), wrong nonce: throws error AND emits error event AND doesn't save to localStorage", async () => {
            const claimToPayNotValid = {
              ...claimToPay2,
              nonce: 1
            }
            const errorMsg = 'Invalid claim nonce:'
            await expect(cryptoSDK.pay(claimToPayNotValid)).rejects.toThrowError(errorMsg)
            expect(events[0].type).toEqual(eventType.claimNotSigned)
            expect(events[0].error).toBe(true)
            expect(await claimStorage.getClaimAlice()).toBe(null)
          })

          test("pay(), wrong server address: throws error AND emits error event AND doesn't save to localStorage", async () => {
            const claimToPayNotValid = {
              ...claimToPay2,
              addresses: [ALICE_ADDRESS, ALICE_ADDRESS]
            }
            const errorMsg = 'Invalid address of Server'
            await expect(cryptoSDK.pay(claimToPayNotValid)).rejects.toThrowError(errorMsg)
            expect(events[0].type).toEqual(eventType.claimNotSigned)
            expect(events[0].error).toBe(true)
            expect(await claimStorage.getClaimAlice()).toBe(null)
          })

          test("pay(), wrong Alice debit: throws error AND emits error event AND doesn't save to localStorage", async () => {
            const claimToPayNotValid = {
              ...claimToPay2,
              cumulativeDebits: [10, 0]
            }
            const errorMsg = 'Invalid claim cumulative debit of Client:'
            await expect(cryptoSDK.pay(claimToPayNotValid)).rejects.toThrowError(errorMsg)
            expect(events[0].type).toEqual(eventType.claimNotSigned)
            expect(events[0].error).toBe(true)
            expect(await claimStorage.getClaimAlice()).toBe(null)
          })

          test("pay(), wrong Server debit: throws error AND emits error event AND doesn't save to localStorage", async () => {
            const claimToPayNotValid = {
              ...claimToPay2,
              cumulativeDebits: [11, 10]
            }
            const errorMsg = 'Invalid claim cumulative debit of Server:'
            await expect(cryptoSDK.pay(claimToPayNotValid)).rejects.toThrowError(errorMsg)
            expect(events[0].type).toEqual(eventType.claimNotSigned)
            expect(events[0].error).toBe(true)
            expect(await claimStorage.getClaimAlice()).toBe(null)
          })
        })
      })

      describe('payReceived()', () => {
        describe('1. payReceived(), no claim saved in localStorage', () => {
          test('payReceived() emits event AND saves to localStorage in confirmedClaim', async () => {
            await cryptoSDK.payReceived(claimToPayRecieved)
            expect(events[0].type).toEqual(eventType.paymentConfirmed)
            expect((await claimStorage.getConfirmedClaim()).signatures[1]).toBe(bobSignature)
          })

          test("payReceived(), wrong id: throws error AND emits error event AND doesn't save to localStorage", async () => {
            const claimToPayNotValid = {
              ...claimToPayRecieved,
              id: 2
            }
            const errorMsg = 'Invalid claim id: 2'
            await expect(cryptoSDK.payReceived(claimToPayNotValid)).rejects.toThrowError(errorMsg)
            expect(events[0].type).toEqual(eventType.paymentNotConfirmed)
            expect(events[0].error).toBe(true)
            expect(await claimStorage.getConfirmedClaim()).toBe(null)
          })

          test("payReceived(), wrong nonce: throws error AND emits error event AND doesn't save to localStorage", async () => {
            const claimToPayNotValid = {
              ...claimToPayRecieved,
              nonce: 2
            }
            const errorMsg = 'Invalid claim nonce: 2'
            await expect(cryptoSDK.payReceived(claimToPayNotValid)).rejects.toThrowError(errorMsg)
            expect(events[0].type).toEqual(eventType.paymentNotConfirmed)
            expect(events[0].error).toBe(true)
            expect(await claimStorage.getConfirmedClaim()).toBe(null)
          })

          test("payReceived(), wrong server address: throws error AND emits error event AND doesn't save to localStorage", async () => {
            const claimToPayNotValid = {
              ...claimToPayRecieved,
              addresses: [ALICE_ADDRESS, ALICE_ADDRESS]
            }
            const errorMsg = 'Invalid address of Server: 0x0f671cad8f3dfa3dcf7fcf8cfe17a3cee4259175 - expected: 0xeA085D9698651e76750F07d0dE0464476187b3ca'
            await expect(cryptoSDK.payReceived(claimToPayNotValid)).rejects.toThrowError(errorMsg)
            expect(events[0].type).toEqual(eventType.paymentNotConfirmed)
            expect(events[0].error).toBe(true)
            expect(await claimStorage.getConfirmedClaim()).toBe(null)
          })

          test("payReceived(), wrong Alice debit: throws error AND emits error event AND doesn't save to localStorage", async () => {
            const claimToPayNotValid = {
              ...claimToPayRecieved,
              cumulativeDebits: [10, 0]
            }
            const errorMsg = 'Invalid claim cumulative debit of Client: 10 - expected: 5'
            await expect(cryptoSDK.payReceived(claimToPayNotValid)).rejects.toThrowError(errorMsg)
            expect(events[0].type).toEqual(eventType.paymentNotConfirmed)
            expect(events[0].error).toBe(true)
            expect(await claimStorage.getConfirmedClaim()).toBe(null)
          })

          test("payReceived(), wrong Server debit: throws error AND emits error event AND doesn't save to localStorage", async () => {
            const claimToPayNotValid = {
              ...claimToPayRecieved,
              cumulativeDebits: [5, 10]
            }
            const errorMsg = 'Invalid claim cumulative debit of Server: 10 - expected: 0'
            await expect(cryptoSDK.payReceived(claimToPayNotValid)).rejects.toThrowError(errorMsg)
            expect(events[0].type).toEqual(eventType.paymentNotConfirmed)
            expect(events[0].error).toBe(true)
            expect(await claimStorage.getConfirmedClaim()).toBe(null)
          })

          test("payReceived(), wrong server signature: throws error AND emits error event AND doesn't save to localStorage", async () => {
            const claimToPayNotValid = {
              ...claimToPayRecieved,
              signatures: [aliceSignature, bobSignature + '123']
            }
            const errorMsg = "Server's signature is not verified"
            await expect(cryptoSDK.payReceived(claimToPayNotValid)).rejects.toThrowError(errorMsg)
            expect(events[0].type).toEqual(eventType.paymentNotConfirmed)
            expect(events[0].error).toBe(true)
            expect(await claimStorage.getConfirmedClaim()).toBe(null)
          })
        })

        describe('2. payReceived(), exists a claim saved in localStorage', () => {
          beforeEach(() => {
            const claimToPaySaved = {
              ...claimToPayRecieved,
              signatures: [aliceSignature, '']
            }
            claimStorage.saveClaimAlice(claimToPaySaved)
          })

          test('payReceived() emits event AND saves to localStorage in confirmedClaim', async () => {
            await cryptoSDK.payReceived(claimToPayRecieved)
            expect(events[0].type).toEqual(eventType.paymentConfirmed)
            expect((await claimStorage.getConfirmedClaim()).signatures[1]).toBe(bobSignature)
          })

          test("payReceived(), wrong id: throws error AND emits error event AND doesn't save to localStorage", async () => {
            const claimToPayNotValid = {
              ...claimToPayRecieved,
              id: 2
            }
            const errorMsg = 'Invalid claim id'
            await expect(cryptoSDK.payReceived(claimToPayNotValid)).rejects.toThrowError(errorMsg)
            expect(events[0].type).toEqual(eventType.paymentNotConfirmed)
            expect(events[0].error).toBe(true)
            expect(await claimStorage.getConfirmedClaim()).toBe(null)
          })

          test("payReceived(), wrong nonce: throws error AND emits error event AND doesn't save to localStorage", async () => {
            const claimToPayNotValid = {
              ...claimToPayRecieved,
              nonce: 2
            }
            const errorMsg = 'Invalid claim nonce'
            await expect(cryptoSDK.payReceived(claimToPayNotValid)).rejects.toThrowError(errorMsg)
            expect(events[0].type).toEqual(eventType.paymentNotConfirmed)
            expect(events[0].error).toBe(true)
            expect(await claimStorage.getConfirmedClaim()).toBe(null)
          })

          test("payReceived(), wrong server address: throws error AND emits error event AND doesn't save to localStorage", async () => {
            const claimToPayNotValid = {
              ...claimToPayRecieved,
              addresses: [ALICE_ADDRESS, ALICE_ADDRESS]
            }
            const errorMsg = 'Invalid address of Server'
            await expect(cryptoSDK.payReceived(claimToPayNotValid)).rejects.toThrowError(errorMsg)
            expect(events[0].type).toEqual(eventType.paymentNotConfirmed)
            expect(events[0].error).toBe(true)
            expect(await claimStorage.getConfirmedClaim()).toBe(null)
          })

          test("payReceived(), wrong Client address: throws error AND emits error event AND doesn't save to localStorage", async () => {
            const claimToPayNotValid = {
              ...claimToPayRecieved,
              addresses: ['123', SERVER_ADDRESS]
            }
            const errorMsg = 'Invalid address of Client'
            await expect(cryptoSDK.payReceived(claimToPayNotValid)).rejects.toThrowError(errorMsg)
            expect(events[0].type).toEqual(eventType.paymentNotConfirmed)
            expect(events[0].error).toBe(true)
            expect(await claimStorage.getConfirmedClaim()).toBe(null)
          })

          test("payReceived(), wrong Alice debit: throws error AND emits error event AND doesn't save to localStorage", async () => {
            const claimToPayNotValid = {
              ...claimToPayRecieved,
              cumulativeDebits: [10, 0]
            }
            const errorMsg = 'Invalid claim cumulative debit of Client:'
            await expect(cryptoSDK.payReceived(claimToPayNotValid)).rejects.toThrowError(errorMsg)
            expect(events[0].type).toEqual(eventType.paymentNotConfirmed)
            expect(events[0].error).toBe(true)
            expect(await claimStorage.getConfirmedClaim()).toBe(null)
          })

          test("payReceived(), wrong Server debit: throws error AND emits error event AND doesn't save to localStorage", async () => {
            const claimToPayNotValid = {
              ...claimToPayRecieved,
              cumulativeDebits: [5, 10]
            }
            const errorMsg = 'Invalid claim cumulative debit of Server:'
            await expect(cryptoSDK.payReceived(claimToPayNotValid)).rejects.toThrowError(errorMsg)
            expect(events[0].type).toEqual(eventType.paymentNotConfirmed)
            expect(events[0].error).toBe(true)
            expect(await claimStorage.getConfirmedClaim()).toBe(null)
          })

          test("payReceived(), wrong server signature: throws error AND emits error event AND doesn't save to localStorage", async () => {
            const claimToPayNotValid = {
              ...claimToPayRecieved,
              signatures: [aliceSignature, bobSignature + '123']
            }
            const errorMsg = "Server's signature is not verified"
            await expect(cryptoSDK.payReceived(claimToPayNotValid)).rejects.toThrowError(errorMsg)
            expect(events[0].type).toEqual(eventType.paymentNotConfirmed)
            expect(events[0].error).toBe(true)
            expect(await claimStorage.getConfirmedClaim()).toBe(null)
          })
        })
      })
    })

    describe('the chain is wrong', () => {
      beforeEach(() => {
        window.ethereum = undefined
        window.web3 = {
          currentProvider: new MetamaskProvider({
            address: ALICE_ADDRESS,
            privateKey: ALICE_PRIVATE_KEY,
            chainId: 21
          }),
          eth: {
            accounts: [ALICE_ADDRESS]
          }
        }
      })

      test('getAddress() - throws error AND arrives error event wrongNetworkOnGetAddress', async () => {
        const errorMsg = 'Error: Please change your network on Metamask. Valid networks are: Binance Smart Chain Testnet'
        await expect(cryptoSDK.getAddress()).rejects.toThrowError(errorMsg)
        expect(events[0].type).toEqual(eventType.wrongNetworkOnGetAddress)
        expect(events[0].error).toBe(true)
      })

      test('isMetamaskInstalled() returns true', async () => {
        await expect(cryptoSDK.isMetamaskInstalled()).toBeTruthy()
      })

      test('isRightNet() returns false AND emits error event', async () => {
        expect(await cryptoSDK.isRightNet()).toBe(false)
        expect(events[0].type).toEqual(eventType.network)
        expect(events[0].error).toBe(true)
      })

      test('setRightNet() - only manual, throws error AND returns error event', async () => {
        const errorMsg = 'This version of Metamask supports only manual network switching'
        await expect(cryptoSDK.setRightNet()).rejects.toThrowError(errorMsg)
        expect(events[0].type).toEqual(eventType.network)
        expect(events[0].error).toBe(true)
      })

      test("pay() throws error AND emits error event AND doesn't save to localStorage", async () => {
        const errorMsg = 'Please change your network on Metamask. Valid networks are:'
        await expect(cryptoSDK.pay(claimToPay)).rejects.toThrowError(errorMsg)
        expect(events[0].type).toEqual(eventType.claimNotSigned)
        expect(events[0].error).toBe(true)
        expect(await claimStorage.getClaimAlice()).toBe(null)
      })

      test("payReceived() throws error AND emits error event AND doesn't save to localStorage", async () => {
        const errorMsg = 'Please change your network on Metamask. Valid networks are:'
        await expect(cryptoSDK.payReceived(claimToPayRecieved)).rejects.toThrowError(errorMsg)
        expect(events[0].type).toEqual(eventType.paymentNotConfirmed)
        expect(events[0].error).toBe(true)
        expect(await claimStorage.getConfirmedClaim()).toBe(null)
      })
    })
  })
})
