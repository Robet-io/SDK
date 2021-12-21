/* eslint-env jest */
import { eventType, addEventListener } from '../src/modules/events'
import cryptoSDK from '../src/index'
import MockProvider from './mocks/MetamaskProvider.js'

// TODO test this:
//   + getAddress,
//   + isMetamaskInstalled,
//   + isRightNet,
//   setRightNet

describe('cryptoSDK library', () => {
  const address = '0x11111'
  const privateKey = '00003604eae2aa7acc0932fb809ed417a6efaf1af3dce3ce27f9ddef74900000'

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
