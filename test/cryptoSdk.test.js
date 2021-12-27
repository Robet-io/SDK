/* eslint-env jest */
import { eventType, addEventListener } from '../src/modules/events'
import cryptoSDK from '../src/index'
import MockProvider from './mocks/MetamaskProvider.js'
import claimStorage from '../src/modules/claim-library/claimStorage'

// TODO test this:
//   + getAddress,
//   + isMetamaskInstalled,
//   + isRightNet,
//   + setRightNet
// pay
// payReceived

describe('cryptoSDK library', () => {
  const address = process.env.ALICE_ADDRESS
  const privateKey = process.env.ALICE_PRIVATE_KEY

  let events
  beforeEach(() => {
    events = []
    addEventListener(event => {
      // console.log('====== arrived event', event.detail)
      events.push(event.detail)
    })
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
  })

  describe('window.ethereum', () => {
    describe('the chain is right', () => {
      beforeEach(() => {
        window.ethereum = new MockProvider({
          address, privateKey, chainId: 97
        })
      })

      test('getAddress() returns address', async () => {
        const account = await cryptoSDK.getAddress()
        expect(account).toEqual({ address })
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
        // let's make a mock fridge (storage) for all our tests to use
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

        const SERVER_ADDRESS = '0x70997970C51812dc3A010C7d01b50e0d17dc79C8'
        const aliceSignature = '0xd01e8fcb4d8f61bd1dee9d8574f6e8339ab3be6831a1b5c8eabfea64d357ca7057853d1b73120990eed58ce5b89fc4bb8e0dc50215981bec4a63e94196c3adb41c'

        const claimToSign = {
          id: 1,
          addresses: [address, SERVER_ADDRESS],
          amount: 5,
          cumulativeDebits: [0, 5],
          messageForAlice: 'You receive: 5 DE.GA',
          timestamp: 1639145450856,
          nonce: 1,
          signatures: [],
          type: 'ticket.play'
        }

        test('pay() returns signed claim AND emits event AND saves to localStorage', async () => {
          expect((await cryptoSDK.pay(claimToSign)).signatures[0]).toBe(aliceSignature)
          expect(events[0].type).toEqual(eventType.claimSigned)
          expect((await claimStorage.getClaimAlice()).signatures[0]).toBe(aliceSignature)
        })
      })
    })

    describe('the chain is wrong', () => {
      beforeEach(() => {
        window.ethereum = new MockProvider({
          address, privateKey, chainId: 16
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
    })
  })

  describe('window.web3 - legacy wallet', () => {
    describe('the chain is right', () => {
      beforeEach(() => {
        window.ethereum = undefined
        window.web3 = {
          currentProvider: new MockProvider({
            address, privateKey, chainId: 97
          }),
          eth: {
            accounts: [address]
          }
        }
      })

      test('getAddress() returns address', async () => {
        const account = await cryptoSDK.getAddress()
        expect(account).toEqual({ address })
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
    })

    describe('the chain is wrong', () => {
      beforeEach(() => {
        window.ethereum = undefined
        window.web3 = {
          currentProvider: new MockProvider({
            address, privateKey, chainId: 21
          }),
          eth: {
            accounts: [address]
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
    })
  })
})
