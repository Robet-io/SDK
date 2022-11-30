/* eslint-env jest */
import { eventType, addEventListener } from '../src/modules/events'
import cryptoSDK from '../src/index'
import MetamaskProvider from './mocks/MetamaskProvider.js'
import claimStorage from '../src/modules/claim-library/claimStorage'
import { signClaim, signChallenge } from './utils'

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
// + win
// + login via Metamask, sign challenge, save token with exp.date, isLogged()
// + exchange of claims on websocket open
// + Consensual withdraw:
//   + control and sign withdraw
//   + arrived countersigned withdraw claim from server - save to localStorage, send tx to Vault
// + getTotalBalance

const ALICE_ADDRESS_WRONG = '0x987064F77c87440708B187E79397c2128DDD7a76'
const ALICE_PRIVATE_KEY_WRONG = '9da4e43f956025c31011fcb1b4c15657d51177ff6aa26431a4bf14b1c9f8c2fa'

jest.mock('../src/modules/blockchain', () => {
    return {
        __esModule: true,
        default: {
            getVaultBalance: jest.fn((address) => {
                if (address === ALICE_ADDRESS_WRONG) {
                    return ({ balance: 1 })
                    // } else if (address === process.env.CSDK_SERVER_ADDRESS) {
                    //   return ({ balance: 1 })
                } else {
                    return ({ balance: 20 })
                }
            }),
            withdrawConsensually: jest.fn((claim, web3Provider) => {
                return true
            }),
            getLastClosedChannel: jest.fn((claim, web3Provider) => {
                return '0'
            })
        }
    }
})

cryptoSDK.setEnv('test')

describe('cryptoSDK library', () => {
    const ALICE_ADDRESS = '0xACC8CB8D3C8fccD8fC5F511A902d310574De9767'
    const ALICE_PRIVATE_KEY = 'fac8585356dcd96126a004f0ee3a6cf8d8ed39c8874f8d5355f28da8a1fa54cb'

    const SERVER_ADDRESS = '0xeA085D9698651e76750F07d0dE0464476187b3ca'
    const SERVER_PRIVATE_KEY = '05dcfbe9006e74667714ade3097716f2306ec44bd5bbb6b035d7e4375e46d747'

    const claimToPay = {
        id: 1,
        addresses: [ALICE_ADDRESS, SERVER_ADDRESS],
        amount: -5,
        cumulativeDebits: ['5', '0'],
        messageForAlice: 'You spend: 0.000000000000000005 DE.GA',
        timestamp: 1639145450856,
        nonce: 1,
        signatures: [],
        closed: 0
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
        cumulativeDebits: ['0', '5'],
        messageForAlice: 'You receive: 0.00000000000000001 DE.GA',
        timestamp: 1639145450856,
        nonce: 2,
        signatures: [],
        closed: 0
    }

    const bobSignatureWin = signClaim(claimWin, SERVER_PRIVATE_KEY)
    const aliceSignatureWin = signClaim(claimWin, ALICE_PRIVATE_KEY)
    claimWin.signatures = ['', bobSignatureWin]

    const challenge = '624c73aa97dc207439572a5401372995e0206eec3f692a8215a606759deac5c7'
    const token = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiJ9.eyJpc3MiOiJGdW50ZWNoIiwiaWF0IjoxNjQyNzgwOTcyLCJleHAiOjE2NzQzMTY5NzIsImF1ZCI6ImRlY2VudHJhbGl6ZWRnYW1ibGluZy5pbyIsInN1YiI6ImFkbWluQGRlY2VudHJhbGl6ZWRnYW1ibGluZy5pbyIsImlkIjoiMSIsImFkZHJlc3MiOiIweGFjYzhjYjhkM2M4ZmNjZDhmYzVmNTExYTkwMmQzMTA1NzRkZTk3NjcifQ.Ny1PEq0c6Gvjyr9q8BV2vta2owoLfVLc9anKCQuNoI-QTucnHzPQl7gTsG43XesPMWeZYEAWRPySRdXLkczzlw'

    let events
    beforeEach(() => {
        events = []
        events.length = 0
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

        test('Login via Metamask - throws error AND arrives error event metamaskNotInstalled', async () => {
            const errorMsg = 'Metamask is not installed'
            await expect(cryptoSDK.signChallenge(challenge)).rejects.toThrowError(errorMsg)
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

            describe('cash-in (ex. pay)', () => {
                describe('1. pay(), no claim saved in localStorage', () => {
                    test('pay() returns signed claim AND emits event AND saves to localStorage', async () => {
                        expect((await cryptoSDK.pay(claimToPay)).signatures[0]).toBe(aliceSignature)
                        expect(events[0].type).toEqual(eventType.claimSigned)
                        expect((await claimStorage.getClaimAlice(ALICE_ADDRESS)).signatures[0]).toBe(aliceSignature)
                    })

                    test("pay() when balance is not enough: throws error AND emits error event AND doesn't save to localStorage", async () => {
                        const claimToPayNotValid = {
                            ...claimToPay,
                            addresses: [ALICE_ADDRESS_WRONG, SERVER_ADDRESS]
                        }

                        const aliceSignature = signClaim(claimToPayNotValid, ALICE_PRIVATE_KEY_WRONG)
                        const bobSignature = signClaim(claimToPayNotValid, SERVER_PRIVATE_KEY)

                        claimToPayNotValid.signatures = [aliceSignature, bobSignature]

                        const errorMsg = 'Not enough balance'
                        await expect(cryptoSDK.pay(claimToPayNotValid)).rejects.toThrowError(errorMsg)
                        expect(events[0].type).toEqual(eventType.claimNotSigned)
                        expect(events[0].error).toBe(true)
                        expect(await claimStorage.getClaimAlice(ALICE_ADDRESS_WRONG)).toBe(null)
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
                        expect(await claimStorage.getClaimAlice(ALICE_ADDRESS)).toBe(null)
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
                        expect(await claimStorage.getClaimAlice(ALICE_ADDRESS)).toBe(null)
                    })

                    test("pay(), wrong server address: throws error AND emits error event AND doesn't save to localStorage", async () => {
                        const claimToPayNotValid = {
                            ...claimToPay,
                            addresses: [ALICE_ADDRESS, ALICE_ADDRESS]
                        }
                        const errorMsg = 'Invalid address of Server: 0xACC8CB8D3C8fccD8fC5F511A902d310574De9767 - expected: 0xeA085D9698651e76750F07d0dE0464476187b3ca'
                        await expect(cryptoSDK.pay(claimToPayNotValid)).rejects.toThrowError(errorMsg)
                        expect(events[0].type).toEqual(eventType.claimNotSigned)
                        expect(events[0].error).toBe(true)
                        expect(await claimStorage.getClaimAlice(ALICE_ADDRESS)).toBe(null)
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
                        expect(await claimStorage.getClaimAlice(ALICE_ADDRESS)).toBe(null)
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
                        expect(await claimStorage.getClaimAlice(ALICE_ADDRESS)).toBe(null)
                    })

                    test("pay() when msg is wrong: throws error AND emits error event AND doesn't save to localStorage", async () => {
                        const claimToPayNotValid = {
                            ...claimToPay,
                            messageForAlice: 'You spend: 0.000000000000000015 DE.GA'
                        }
                        const errorMsg = 'Invalid message for Alice'
                        await expect(cryptoSDK.pay(claimToPayNotValid)).rejects.toThrowError(errorMsg)
                        expect(events[0].type).toEqual(eventType.claimNotSigned)
                        expect(events[0].error).toBe(true)
                        expect(await claimStorage.getClaimAlice(ALICE_ADDRESS)).toBe(null)
                    })
                })

                describe('2. pay(), exists a claim saved in localStorage', () => {
                    const claimToPay2 = {
                        id: 1,
                        addresses: [ALICE_ADDRESS, SERVER_ADDRESS],
                        amount: -6,
                        cumulativeDebits: [11, 0],
                        messageForAlice: 'You spend: 0.000000000000000006 DE.GA',
                        timestamp: 1639145450856,
                        nonce: 2,
                        signatures: [aliceSignature, ''],
                        closed: 0
                    }
                    const aliceSignature2 = signClaim(claimToPay2, ALICE_PRIVATE_KEY)
                    beforeEach(() => {
                        const previousClaim = {
                            id: 1,
                            addresses: [ALICE_ADDRESS, SERVER_ADDRESS],
                            amount: -5,
                            cumulativeDebits: [5, 0],
                            messageForAlice: 'You spend: 0.000000000000000005 DE.GA',
                            timestamp: 1639145450856,
                            nonce: 1,
                            signatures: [aliceSignature, ''],
                            closed: 0
                        }
                        claimStorage.saveConfirmedClaim(previousClaim)
                    })

                    test('pay() returns signed claim AND emits event AND saves to localStorage', async () => {
                        expect((await cryptoSDK.pay(claimToPay2)).signatures[0]).toBe(aliceSignature2)
                        expect(events[0].type).toEqual(eventType.claimSigned)
                        expect((await claimStorage.getClaimAlice(ALICE_ADDRESS)).nonce).toBe(2)
                    })

                    test("pay() when balance is not enough: throws error AND emits error event AND doesn't save to localStorage", async () => {
                        const previousClaim = {
                            id: 1,
                            addresses: [ALICE_ADDRESS_WRONG, SERVER_ADDRESS],
                            amount: -5,
                            cumulativeDebits: [5, 0],
                            messageForAlice: 'You spend: 0.000000000000000005 DE.GA',
                            timestamp: 1639145450856,
                            nonce: 1,
                            signatures: [aliceSignature, ''],
                            closed: 0
                        }
                        claimStorage.saveConfirmedClaim(previousClaim)

                        const claimToPay2NotValid = {
                            ...claimToPay2,
                            addresses: [ALICE_ADDRESS_WRONG, SERVER_ADDRESS]
                        }
                        const errorMsg = 'Not enough balance'
                        await expect(cryptoSDK.pay(claimToPay2NotValid)).rejects.toThrowError(errorMsg)
                        expect(events[0].type).toEqual(eventType.claimNotSigned)
                        expect(events[0].error).toBe(true)
                        expect(await claimStorage.getClaimAlice(ALICE_ADDRESS_WRONG)).toBe(null)
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
                        expect(await claimStorage.getClaimAlice(ALICE_ADDRESS)).toBe(null)
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
                        expect(await claimStorage.getClaimAlice(ALICE_ADDRESS)).toBe(null)
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
                        expect(await claimStorage.getClaimAlice(ALICE_ADDRESS)).toBe(null)
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
                        expect(await claimStorage.getClaimAlice(ALICE_ADDRESS)).toBe(null)
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
                        expect(await claimStorage.getClaimAlice(ALICE_ADDRESS)).toBe(null)
                    })

                    test("pay() when msg is wrong: throws error AND emits error event AND doesn't save to localStorage", async () => {
                        const claimToPayNotValid = {
                            ...claimToPay2,
                            messageForAlice: 'You spend: 0.000000000000000015 DE.GA'
                        }
                        const errorMsg = 'Invalid message for Alice'
                        await expect(cryptoSDK.pay(claimToPayNotValid)).rejects.toThrowError(errorMsg)
                        expect(events[0].type).toEqual(eventType.claimNotSigned)
                        expect(events[0].error).toBe(true)
                        expect(await claimStorage.getClaimAlice(ALICE_ADDRESS)).toBe(null)
                    })
                })
            })

            describe('claimControfirmed (ex. payReceived)', () => {
                describe('1. payReceived(), no claim saved in localStorage', () => {
                    test('payReceived() emits event AND saves to localStorage in confirmedClaim', async () => {
                        await cryptoSDK.payReceived(claimToPayRecieved)
                        expect(events[0].type).toEqual(eventType.claimConfirmed)
                        expect((await claimStorage.getConfirmedClaim(ALICE_ADDRESS)).signatures[1]).toBe(bobSignature)
                    })

                    test("payReceived(), wrong id: throws error AND emits error event AND doesn't save to localStorage", async () => {
                        const claimToPayNotValid = {
                            ...claimToPayRecieved,
                            id: 2
                        }
                        const errorMsg = 'Invalid claim id: 2'
                        await expect(cryptoSDK.payReceived(claimToPayNotValid)).rejects.toThrowError(errorMsg)
                        expect(events[0].type).toEqual(eventType.claimNotConfirmed)
                        expect(events[0].error).toBe(true)
                        expect(await claimStorage.getConfirmedClaim(ALICE_ADDRESS)).toBe(null)
                    })

                    test("payReceived(), wrong nonce: throws error AND emits error event AND doesn't save to localStorage", async () => {
                        const claimToPayNotValid = {
                            ...claimToPayRecieved,
                            nonce: 2
                        }
                        const errorMsg = 'Invalid claim nonce: 2'
                        await expect(cryptoSDK.payReceived(claimToPayNotValid)).rejects.toThrowError(errorMsg)
                        expect(events[0].type).toEqual(eventType.claimNotConfirmed)
                        expect(events[0].error).toBe(true)
                        expect(await claimStorage.getConfirmedClaim(ALICE_ADDRESS)).toBe(null)
                    })

                    test("payReceived(), wrong server address: throws error AND emits error event AND doesn't save to localStorage", async () => {
                        const claimToPayNotValid = {
                            ...claimToPayRecieved,
                            addresses: [ALICE_ADDRESS, ALICE_ADDRESS]
                        }
                        const errorMsg = 'Invalid address of Server: 0xACC8CB8D3C8fccD8fC5F511A902d310574De9767 - expected: 0xeA085D9698651e76750F07d0dE0464476187b3ca'
                        await expect(cryptoSDK.payReceived(claimToPayNotValid)).rejects.toThrowError(errorMsg)
                        expect(events[0].type).toEqual(eventType.claimNotConfirmed)
                        expect(events[0].error).toBe(true)
                        expect(await claimStorage.getConfirmedClaim(ALICE_ADDRESS)).toBe(null)
                    })

                    test("payReceived(), wrong Alice debit: throws error AND emits error event AND doesn't save to localStorage", async () => {
                        const claimToPayNotValid = {
                            ...claimToPayRecieved,
                            cumulativeDebits: [10, 0]
                        }
                        const errorMsg = 'Invalid claim cumulative debit of Client: 10 - expected: 5'
                        await expect(cryptoSDK.payReceived(claimToPayNotValid)).rejects.toThrowError(errorMsg)
                        expect(events[0].type).toEqual(eventType.claimNotConfirmed)
                        expect(events[0].error).toBe(true)
                        expect(await claimStorage.getConfirmedClaim(ALICE_ADDRESS)).toBe(null)
                    })

                    test("payReceived(), wrong Server debit: throws error AND emits error event AND doesn't save to localStorage", async () => {
                        const claimToPayNotValid = {
                            ...claimToPayRecieved,
                            cumulativeDebits: [5, 10]
                        }
                        const errorMsg = 'Invalid claim cumulative debit of Server: 10 - expected: 0'
                        await expect(cryptoSDK.payReceived(claimToPayNotValid)).rejects.toThrowError(errorMsg)
                        expect(events[0].type).toEqual(eventType.claimNotConfirmed)
                        expect(events[0].error).toBe(true)
                        expect(await claimStorage.getConfirmedClaim(ALICE_ADDRESS)).toBe(null)
                    })

                    test("payReceived(), wrong server signature: throws error AND emits error event AND doesn't save to localStorage", async () => {
                        const claimToPayNotValid = {
                            ...claimToPayRecieved,
                            signatures: [aliceSignature, bobSignature + '123']
                        }
                        const errorMsg = "Server's signature is not verified"
                        await expect(cryptoSDK.payReceived(claimToPayNotValid)).rejects.toThrowError(errorMsg)
                        expect(events[0].type).toEqual(eventType.claimNotConfirmed)
                        expect(events[0].error).toBe(true)
                        expect(await claimStorage.getConfirmedClaim(ALICE_ADDRESS)).toBe(null)
                    })

                    test("payReceived() when msg is wrong: throws error AND emits error event AND doesn't save to localStorage", async () => {
                        const claimToPayNotValid = {
                            ...claimToPayRecieved,
                            messageForAlice: 'You spend: 0.000000000000000015 DE.GA'
                        }
                        const errorMsg = 'Invalid message for Alice'
                        await expect(cryptoSDK.payReceived(claimToPayNotValid)).rejects.toThrowError(errorMsg)
                        expect(events[0].type).toEqual(eventType.claimNotConfirmed)
                        expect(events[0].error).toBe(true)
                        expect(await claimStorage.getConfirmedClaim(ALICE_ADDRESS)).toBe(null)
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
                        expect(events[0].type).toEqual(eventType.claimConfirmed)
                        expect((await claimStorage.getConfirmedClaim(ALICE_ADDRESS)).signatures[1]).toBe(bobSignature)
                    })

                    test("payReceived(), wrong id: throws error AND emits error event AND doesn't save to localStorage", async () => {
                        const claimToPayNotValid = {
                            ...claimToPayRecieved,
                            id: 2
                        }
                        const errorMsg = 'Invalid claim id:'
                        await expect(cryptoSDK.payReceived(claimToPayNotValid)).rejects.toThrowError(errorMsg)
                        expect(events[0].type).toEqual(eventType.claimNotConfirmed)
                        expect(events[0].error).toBe(true)
                        expect(await claimStorage.getConfirmedClaim(ALICE_ADDRESS)).toBe(null)
                    })

                    test("payReceived(), wrong nonce: throws error AND emits error event AND doesn't save to localStorage", async () => {
                        const claimToPayNotValid = {
                            ...claimToPayRecieved,
                            nonce: 2
                        }
                        const errorMsg = 'Invalid claim nonce:'
                        await expect(cryptoSDK.payReceived(claimToPayNotValid)).rejects.toThrowError(errorMsg)
                        expect(events[0].type).toEqual(eventType.claimNotConfirmed)
                        expect(events[0].error).toBe(true)
                        expect(await claimStorage.getConfirmedClaim(ALICE_ADDRESS)).toBe(null)
                    })

                    test("payReceived(), wrong server address: throws error AND emits error event AND doesn't save to localStorage", async () => {
                        const claimToPayNotValid = {
                            ...claimToPayRecieved,
                            addresses: [ALICE_ADDRESS, ALICE_ADDRESS]
                        }
                        const errorMsg = 'Invalid address of Server'
                        await expect(cryptoSDK.payReceived(claimToPayNotValid)).rejects.toThrowError(errorMsg)
                        expect(events[0].type).toEqual(eventType.claimNotConfirmed)
                        expect(events[0].error).toBe(true)
                        expect(await claimStorage.getConfirmedClaim(ALICE_ADDRESS)).toBe(null)
                    })

                    test("payReceived(), wrong Alice debit: throws error AND emits error event AND doesn't save to localStorage", async () => {
                        const claimToPayNotValid = {
                            ...claimToPayRecieved,
                            cumulativeDebits: [10, 0]
                        }
                        const errorMsg = 'Invalid claim cumulative debit of Client:'
                        await expect(cryptoSDK.payReceived(claimToPayNotValid)).rejects.toThrowError(errorMsg)
                        expect(events[0].type).toEqual(eventType.claimNotConfirmed)
                        expect(events[0].error).toBe(true)
                        expect(await claimStorage.getConfirmedClaim(ALICE_ADDRESS)).toBe(null)
                    })

                    test("payReceived(), wrong Server debit: throws error AND emits error event AND doesn't save to localStorage", async () => {
                        const claimToPayNotValid = {
                            ...claimToPayRecieved,
                            cumulativeDebits: [5, 10]
                        }
                        const errorMsg = 'Invalid claim cumulative debit of Server:'
                        await expect(cryptoSDK.payReceived(claimToPayNotValid)).rejects.toThrowError(errorMsg)
                        expect(events[0].type).toEqual(eventType.claimNotConfirmed)
                        expect(events[0].error).toBe(true)
                        expect(await claimStorage.getConfirmedClaim(ALICE_ADDRESS)).toBe(null)
                    })

                    test("payReceived(), wrong server signature: throws error AND emits error event AND doesn't save to localStorage", async () => {
                        const claimToPayNotValid = {
                            ...claimToPayRecieved,
                            signatures: [aliceSignature, bobSignature + '123']
                        }
                        const errorMsg = "Server's signature is not verified"
                        await expect(cryptoSDK.payReceived(claimToPayNotValid)).rejects.toThrowError(errorMsg)
                        expect(events[0].type).toEqual(eventType.claimNotConfirmed)
                        expect(events[0].error).toBe(true)
                        expect(await claimStorage.getConfirmedClaim(ALICE_ADDRESS)).toBe(null)
                    })
                })
            })

            describe('1. cash-out (ex. win), exists a claim saved in localStorage', () => {
                beforeEach(async () => {
                    claimStorage.saveConfirmedClaim(claimToPayRecieved)
                })

                test('win() returns signed claim AND emits event AND saves to localStorage', async () => {
                    expect((await cryptoSDK.win(claimWin)).signatures[0]).toBe(aliceSignatureWin)
                    expect(events[0].type).toEqual(eventType.winClaimSigned)
                    expect((await claimStorage.getConfirmedClaim(ALICE_ADDRESS)).signatures[0]).toBe(aliceSignatureWin)
                })

                // test("win() when balance of Server is not enough: throws error AND emits error event AND doesn't save to localStorage", async () => {
                //   const claimNotValid = {
                //     ...claimWin
                //   }
                //   const errorMsg = "Server's balance is not enough"
                //   await expect(cryptoSDK.win(claimNotValid)).rejects.toThrowError(errorMsg)
                //   expect(events[0].type).toEqual(eventType.winNotConfirmed)
                //   expect(events[0].error).toBe(true)
                //   expect((await claimStorage.getConfirmedClaim(ALICE_ADDRESS)).nonce).toBe(1)
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
                    expect((await claimStorage.getConfirmedClaim(ALICE_ADDRESS)).nonce).toBe(1)
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
                    expect((await claimStorage.getConfirmedClaim(ALICE_ADDRESS)).nonce).toBe(1)
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
                    expect((await claimStorage.getConfirmedClaim(ALICE_ADDRESS)).nonce).toBe(1)
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
                    expect((await claimStorage.getConfirmedClaim(ALICE_ADDRESS)).nonce).toBe(1)
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
                    expect((await claimStorage.getConfirmedClaim(ALICE_ADDRESS)).nonce).toBe(1)
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
                    expect((await claimStorage.getConfirmedClaim(ALICE_ADDRESS)).nonce).toBe(1)
                })
            })

            describe('2. win(), no claim saved in localStorage', () => {
                const claimWinFirst = {
                    id: 1,
                    addresses: [ALICE_ADDRESS, SERVER_ADDRESS],
                    amount: 10,
                    cumulativeDebits: [0, 10],
                    messageForAlice: 'You receive: 0.00000000000000001 DE.GA',
                    timestamp: 1639145450856,
                    nonce: 1,
                    signatures: [],
                    closed: 0
                }

                const bobSignatureWinFirst = signClaim(claimWinFirst, SERVER_PRIVATE_KEY)
                const aliceSignatureWinFirst = signClaim(claimWinFirst, ALICE_PRIVATE_KEY)
                claimWinFirst.signatures = ['', bobSignatureWinFirst]

                test('win() returns signed claim AND emits event AND saves to localStorage', async () => {
                    expect((await cryptoSDK.win(claimWinFirst)).signatures[0]).toBe(aliceSignatureWinFirst)
                    expect(events[0].type).toEqual(eventType.winClaimSigned)
                    expect((await claimStorage.getConfirmedClaim(ALICE_ADDRESS)).signatures[0]).toBe(aliceSignatureWinFirst)
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
                    expect(await claimStorage.getClaimAlice(ALICE_ADDRESS)).toBe(null)
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
                    expect(await claimStorage.getClaimAlice(ALICE_ADDRESS)).toBe(null)
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
                    expect(await claimStorage.getClaimAlice(ALICE_ADDRESS)).toBe(null)
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
                    expect(await claimStorage.getClaimAlice(ALICE_ADDRESS)).toBe(null)
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
                    expect(await claimStorage.getClaimAlice(ALICE_ADDRESS)).toBe(null)
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
                    expect(await claimStorage.getClaimAlice(ALICE_ADDRESS)).toBe(null)
                })

                test("win(), msg is wrong: throws error AND emits error event AND doesn't save to localStorage", async () => {
                    const claimWinNotValid = {
                        ...claimWinFirst,
                        messageForAlice: 'You receive: 0.0000000000000011 DE.GA'
                    }
                    const errorMsg = 'Invalid message for Alice'
                    await expect(cryptoSDK.win(claimWinNotValid)).rejects.toThrowError(errorMsg)
                    expect(events[0].type).toEqual(eventType.winNotConfirmed)
                    expect(events[0].error).toBe(true)
                    expect(await claimStorage.getClaimAlice(ALICE_ADDRESS)).toBe(null)
                })
            })

            describe('Login via Metamask', () => {
                test('signChallenge() returns signature', async () => {
                    const signature = await cryptoSDK.signChallenge(challenge)
                    expect(signature).toEqual(signChallenge(challenge, ALICE_PRIVATE_KEY))
                })

                test('setToken() saves token in localStorage', async () => {
                    cryptoSDK.setToken(ALICE_ADDRESS, token)
                    expect(cryptoSDK.getToken(ALICE_ADDRESS)).toBe(token)
                })

                test('isLogged() returns true after setToken()', async () => {
                    cryptoSDK.setToken(ALICE_ADDRESS, token)
                    expect(cryptoSDK.isLogged(ALICE_ADDRESS)).toBe(true)
                })

                test("isLogged() returns false if there's no token saved", async () => {
                    expect(cryptoSDK.isLogged(ALICE_ADDRESS)).toBe(false)
                })
            })

            describe('Last claim exchange', () => {
                // no claim on server, no claim on client
                test('no claim on server, no claim on client - ok, nothing saved', async () => {
                    const handshakeServer = {
                        action: 'HANDSHAKE',
                        claim: null
                    }
                    expect(await cryptoSDK.receiveMsg(JSON.stringify(handshakeServer))).toBe(undefined)
                    expect(claimStorage.getConfirmedClaim(ALICE_ADDRESS)).toBe(null)
                })

                // no claim on server, claim on client
                test("no claim on server, claim on client - returns client's claim", async () => {
                    const handshakeServer = {
                        action: 'HANDSHAKE',
                        claim: null
                    }

                    claimStorage.saveConfirmedClaim(claimToPayRecieved)
                    const handshakeClient = await cryptoSDK.receiveMsg(JSON.stringify(handshakeServer))
                    expect(handshakeClient.claim.nonce).toBe(claimToPayRecieved.nonce)
                })

                // claim on server, no claim on client
                test("claim on server, no claim on client - ok, server's claim is saved", async () => {
                    const handshakeServer = {
                        action: 'HANDSHAKE',
                        claim: claimToPayRecieved
                    }

                    expect(await cryptoSDK.receiveMsg(JSON.stringify(handshakeServer))).toBe(undefined)
                    expect((await claimStorage.getConfirmedClaim(ALICE_ADDRESS)).signatures[1]).toBe(bobSignature)
                })

                // claim on server, newer claim on client
                test("claim on server, newer claim on client - returns client's claim", async () => {
                    const handshakeServer = {
                        action: 'HANDSHAKE',
                        claim: claimToPayRecieved
                    }

                    claimStorage.saveConfirmedClaim(claimWin)

                    const handshakeClient = await cryptoSDK.receiveMsg(JSON.stringify(handshakeServer))
                    expect(handshakeClient.claim.nonce).toBe(claimWin.nonce)
                })

                // claim on server, different claim on client
                test("claim on server, different claim on client - returns client's claim", async () => {
                    const handshakeServer = {
                        action: 'HANDSHAKE',
                        claim: claimToPayRecieved
                    }

                    const claimClient = {
                        ...claimToPayRecieved,
                        timestamp: 1639145450890
                    }

                    claimStorage.saveConfirmedClaim(claimClient)

                    const handshakeClient = await cryptoSDK.receiveMsg(JSON.stringify(handshakeServer))
                    expect(handshakeClient.claim.timestamp).toBe(claimClient.timestamp)
                })

                // claim on server, the same claim on client
                test('claim on server, the same claim on client - ok', async () => {
                    const handshakeServer = {
                        action: 'HANDSHAKE',
                        claim: claimToPayRecieved
                    }

                    claimStorage.saveConfirmedClaim(claimToPayRecieved)

                    expect(await cryptoSDK.receiveMsg(JSON.stringify(handshakeServer))).toBe(undefined)
                })
            })

            describe('Consensual withdraw', () => {
                describe('Sign withdraw', () => {
                    const withdrawClaim = {
                        id: 1,
                        nonce: 3,
                        timestamp: 1643386044505,
                        messageForAlice: 'You are withdrawing: 0.00000000000000003 DE.GA',
                        amount: 0,
                        addresses: [ALICE_ADDRESS, SERVER_ADDRESS],
                        cumulativeDebits: ['0', '10'],
                        signatures: [null, null],
                        closed: 1
                    }

                    test('signs withdraw claim, saves to localStorage as claimAlice', async () => {
                        const lastClaim = {
                            id: 1,
                            nonce: 2,
                            timestamp: 1643386044504,
                            messageForAlice: 'You receive: 0.00000000000000001 DE.GA',
                            amount: 10,
                            addresses: [ALICE_ADDRESS, SERVER_ADDRESS],
                            cumulativeDebits: ['0', '10'],
                            signatures: [null, null],
                            closed: 0
                        }
                        lastClaim.signatures = [
                            signClaim(lastClaim, ALICE_PRIVATE_KEY),
                            signClaim(lastClaim, SERVER_PRIVATE_KEY)
                        ]

                        claimStorage.saveConfirmedClaim(lastClaim)

                        const messageServer = {
                            action: 'WITHDRAW',
                            claim: withdrawClaim
                        }

                        const messageSDK = await cryptoSDK.receiveMsg(JSON.stringify(messageServer))
                        expect(messageSDK.claim.signatures[0]).toBe(signClaim(withdrawClaim, ALICE_PRIVATE_KEY))
                        expect((await claimStorage.getClaimAlice(ALICE_ADDRESS)).nonce).toBe(withdrawClaim.nonce)
                    })

                    test("withdraw claim's nonce doesn't correspond to the saved one: throws error AND emits error event AND doesn't save to localStorage", async () => {
                        const lastClaim = {
                            id: 1,
                            nonce: 1,
                            timestamp: 1643386044504,
                            messageForAlice: 'You receive: 0.00000000000000001 DE.GA',
                            amount: 10,
                            addresses: [ALICE_ADDRESS, SERVER_ADDRESS],
                            cumulativeDebits: ['0', '10'],
                            signatures: [null, null],
                            closed: 0
                        }
                        lastClaim.signatures = [
                            signClaim(lastClaim, ALICE_PRIVATE_KEY),
                            signClaim(lastClaim, SERVER_PRIVATE_KEY)
                        ]

                        claimStorage.saveConfirmedClaim(lastClaim)

                        const messageServer = {
                            action: 'WITHDRAW',
                            claim: withdrawClaim
                        }

                        const errorMsg = 'Invalid claim nonce'
                        await expect(cryptoSDK.receiveMsg(JSON.stringify(messageServer))).rejects.toThrowError(errorMsg)
                        expect(events[0].type).toEqual(eventType.claimNotSigned)
                        expect(events[0].error).toBe(true)
                        expect((await claimStorage.getClaimAlice(ALICE_ADDRESS))).toBe(null)
                    })

                    test("withdraw claim's id doesn't correspond to the saved one: throws error AND emits error event AND doesn't save to localStorage", async () => {
                        const lastClaim = {
                            id: 2,
                            nonce: 2,
                            timestamp: 1643386044504,
                            messageForAlice: 'You receive: 0.00000000000000001 DE.GA',
                            amount: 10,
                            addresses: [ALICE_ADDRESS, SERVER_ADDRESS],
                            cumulativeDebits: ['0', '10'],
                            signatures: [null, null],
                            closed: 0
                        }
                        lastClaim.signatures = [
                            signClaim(lastClaim, ALICE_PRIVATE_KEY),
                            signClaim(lastClaim, SERVER_PRIVATE_KEY)
                        ]

                        claimStorage.saveConfirmedClaim(lastClaim)

                        const messageServer = {
                            action: 'WITHDRAW',
                            claim: withdrawClaim
                        }

                        const errorMsg = 'Invalid claim id'
                        await expect(cryptoSDK.receiveMsg(JSON.stringify(messageServer))).rejects.toThrowError(errorMsg)
                        expect(events[0].type).toEqual(eventType.claimNotSigned)
                        expect(events[0].error).toBe(true)
                        expect((await claimStorage.getClaimAlice(ALICE_ADDRESS))).toBe(null)
                    })

                    test("withdraw claim's debits doesn't correspond to the saved one: throws error AND emits error event AND doesn't save to localStorage", async () => {
                        const lastClaim = {
                            id: 1,
                            nonce: 2,
                            timestamp: 1643386044504,
                            messageForAlice: 'You receive: 0.00000000000000001 DE.GA',
                            amount: 10,
                            addresses: [ALICE_ADDRESS, SERVER_ADDRESS],
                            cumulativeDebits: ['0', '15'],
                            signatures: [null, null],
                            closed: 0
                        }
                        lastClaim.signatures = [
                            signClaim(lastClaim, ALICE_PRIVATE_KEY),
                            signClaim(lastClaim, SERVER_PRIVATE_KEY)
                        ]

                        claimStorage.saveConfirmedClaim(lastClaim)

                        const messageServer = {
                            action: 'WITHDRAW',
                            claim: withdrawClaim
                        }

                        const errorMsg = 'Invalid claim cumulative debit'
                        await expect(cryptoSDK.receiveMsg(JSON.stringify(messageServer))).rejects.toThrowError(errorMsg)
                        expect(events[0].type).toEqual(eventType.claimNotSigned)
                        expect(events[0].error).toBe(true)
                        expect((await claimStorage.getClaimAlice(ALICE_ADDRESS))).toBe(null)
                    })

                    test("withdraw claim's addresses doesn't correspond to the saved one: throws error AND emits error event AND doesn't save to localStorage", async () => {
                        const lastClaim = {
                            id: 1,
                            nonce: 2,
                            timestamp: 1643386044504,
                            messageForAlice: 'You receive: 0.00000000000000001 DE.GA',
                            amount: 10,
                            addresses: [ALICE_ADDRESS, ALICE_ADDRESS_WRONG],
                            cumulativeDebits: ['0', '10'],
                            signatures: [null, null],
                            closed: 0
                        }
                        lastClaim.signatures = [
                            signClaim(lastClaim, ALICE_PRIVATE_KEY),
                            signClaim(lastClaim, SERVER_PRIVATE_KEY)
                        ]

                        claimStorage.saveConfirmedClaim(lastClaim)

                        const messageServer = {
                            action: 'WITHDRAW',
                            claim: withdrawClaim
                        }

                        const errorMsg = 'Invalid address of Server'
                        await expect(cryptoSDK.receiveMsg(JSON.stringify(messageServer))).rejects.toThrowError(errorMsg)
                        expect(events[0].type).toEqual(eventType.claimNotSigned)
                        expect(events[0].error).toBe(true)
                        expect((await claimStorage.getClaimAlice(ALICE_ADDRESS))).toBe(null)
                    })

                    test("withdraw msg is wrong: throws error AND emits error event AND doesn't save to localStorage", async () => {
                        const lastClaim = {
                            id: 1,
                            nonce: 2,
                            timestamp: 1643386044504,
                            messageForAlice: 'You receive: 0.00000000000000001 DE.GA',
                            amount: 10,
                            addresses: [ALICE_ADDRESS, SERVER_ADDRESS],
                            cumulativeDebits: ['0', '10'],
                            signatures: [null, null],
                            closed: 0
                        }
                        lastClaim.signatures = [
                            signClaim(lastClaim, ALICE_PRIVATE_KEY),
                            signClaim(lastClaim, SERVER_PRIVATE_KEY)
                        ]

                        claimStorage.saveConfirmedClaim(lastClaim)

                        withdrawClaim.messageForAlice = 'You are withdrawing: 0.00000000000000103 DE.GA'
                        const messageServer = {
                            action: 'WITHDRAW',
                            claim: withdrawClaim
                        }
                        const errorMsg = 'Invalid message for Alice'
                        await expect(cryptoSDK.receiveMsg(JSON.stringify(messageServer))).rejects.toThrowError(errorMsg)
                        expect(events[0].type).toEqual(eventType.claimNotSigned)
                        expect(events[0].error).toBe(true)
                        expect((await claimStorage.getClaimAlice(ALICE_ADDRESS))).toBe(null)
                    })
                })

                describe('Countersigned withdraw claim', () => {
                    beforeEach(() => {
                        const lastClaim = {
                            id: 1,
                            nonce: 2,
                            timestamp: 1643386044504,
                            messageForAlice: 'You receive: 0.00000000000000001 DE.GA',
                            amount: 10,
                            addresses: [ALICE_ADDRESS, SERVER_ADDRESS],
                            cumulativeDebits: ['0', '10'],
                            signatures: [null, null],
                            closed: 0
                        }
                        lastClaim.signatures = [
                            signClaim(lastClaim, ALICE_PRIVATE_KEY),
                            signClaim(lastClaim, SERVER_PRIVATE_KEY)
                        ]

                        claimStorage.saveConfirmedClaim(lastClaim)
                    })

                    test('saves to localStorage and sends tx', async () => {
                        const withdrawClaim = {
                            id: 1,
                            nonce: 3,
                            timestamp: 1643386044505,
                            messageForAlice: 'You are withdrawing: 100000000000000000000 DE.GA',
                            amount: 0,
                            addresses: [ALICE_ADDRESS, SERVER_ADDRESS],
                            cumulativeDebits: ['0', '10'],
                            signatures: [null, null],
                            closed: 1
                        }

                        withdrawClaim.signatures = [
                            signClaim(withdrawClaim, ALICE_PRIVATE_KEY),
                            null
                        ]

                        claimStorage.saveClaimAlice(withdrawClaim)

                        withdrawClaim.signatures[1] = signClaim(withdrawClaim, SERVER_PRIVATE_KEY)

                        const messageServer = {
                            action: 'WITHDRAW',
                            claim: withdrawClaim
                        }

                        await cryptoSDK.receiveMsg(JSON.stringify(messageServer))
                        expect((await claimStorage.getConfirmedClaim(ALICE_ADDRESS)).nonce).toBe(withdrawClaim.nonce)

                        expect(events[events.length - 1].type).toEqual(eventType.withdrawSigned)
                        expect(events[events.length - 1].msg).toEqual('Consensual withdraw signed.')
                    })

                    test("wrong server's signature: throws error and doesn't save to localStorage and doesn't sent tx", async () => {
                        events = []
                        events.length = 0
                        const withdrawClaim = {
                            id: 1,
                            nonce: 3,
                            timestamp: 1643386044505,
                            messageForAlice: 'You are withdrawing: 100000000000000000000 DE.GA',
                            amount: 0,
                            addresses: [ALICE_ADDRESS, SERVER_ADDRESS],
                            cumulativeDebits: ['0', '10'],
                            signatures: [null, null],
                            closed: 1
                        }

                        withdrawClaim.signatures = [
                            signClaim(withdrawClaim, ALICE_PRIVATE_KEY),
                            null
                        ]

                        claimStorage.saveClaimAlice(withdrawClaim)

                        withdrawClaim.signatures[1] = signClaim(withdrawClaim, ALICE_PRIVATE_KEY)

                        const messageServer = {
                            action: 'WITHDRAW',
                            claim: withdrawClaim
                        }

                        const errorMsg = "Server's signature is not verified"
                        await expect(cryptoSDK.receiveMsg(JSON.stringify(messageServer))).rejects.toThrowError(errorMsg)
                        expect(events[events.length - 1].type).toEqual(eventType.claimNotConfirmed)
                        expect(events[events.length - 1].error).toBe(true)
                        expect((await claimStorage.getConfirmedClaim(ALICE_ADDRESS)).nonce).toBe(2)
                    })

                    test("Alice's signed withdraw claim is different from server's: throws error and doesn't save to localStorage and doesn't sent tx", async () => {
                        const withdrawClaimAlice = {
                            id: 1,
                            nonce: 3,
                            timestamp: 1643386044505,
                            messageForAlice: 'You are withdrawing: 100000000000000000000 DE.GA',
                            amount: 0,
                            addresses: [ALICE_ADDRESS, SERVER_ADDRESS],
                            cumulativeDebits: ['0', '10'],
                            signatures: [null, null],
                            closed: 1
                        }

                        withdrawClaimAlice.signatures = [
                            signClaim(withdrawClaimAlice, ALICE_PRIVATE_KEY),
                            null
                        ]

                        claimStorage.saveClaimAlice(withdrawClaimAlice)

                        const withdrawClaimServer = {
                            id: 1,
                            nonce: 3,
                            timestamp: 1643386044505,
                            messageForAlice: 'You are withdrawing: 100000000000000000000 DE.GA',
                            amount: 0,
                            addresses: [ALICE_ADDRESS, SERVER_ADDRESS],
                            cumulativeDebits: ['0', '15'],
                            signatures: [null, null],
                            closed: 1
                        }

                        withdrawClaimServer.signatures = [
                            withdrawClaimAlice.signatures[0],
                            signClaim(withdrawClaimServer, SERVER_PRIVATE_KEY)
                        ]

                        const messageServer = {
                            action: 'WITHDRAW',
                            claim: withdrawClaimServer
                        }

                        const errorMsg = 'Invalid claim cumulative debit'
                        await expect(cryptoSDK.receiveMsg(JSON.stringify(messageServer))).rejects.toThrowError(errorMsg)
                        expect(events[events.length - 1].type).toEqual(eventType.claimNotConfirmed)
                        expect(events[events.length - 1].error).toBe(true)
                        expect((await claimStorage.getConfirmedClaim(ALICE_ADDRESS)).nonce).toBe(2)
                    })

                    test("Alice's signed withdraw claim is different from server's, invalid msg: throws error and doesn't save to localStorage and doesn't sent tx", async () => {
                        const withdrawClaimAlice = {
                            id: 1,
                            nonce: 3,
                            timestamp: 1643386044505,
                            messageForAlice: 'You are withdrawing: 100000000000000000000 DE.GA',
                            amount: 0,
                            addresses: [ALICE_ADDRESS, SERVER_ADDRESS],
                            cumulativeDebits: ['0', '10'],
                            signatures: [null, null],
                            closed: 1
                        }

                        withdrawClaimAlice.signatures = [
                            signClaim(withdrawClaimAlice, ALICE_PRIVATE_KEY),
                            null
                        ]

                        claimStorage.saveClaimAlice(withdrawClaimAlice)

                        const withdrawClaimServer = {
                            id: 1,
                            nonce: 3,
                            timestamp: 1643386044505,
                            messageForAlice: 'You are withdrawing: 100000000000000000010 DE.GA',
                            amount: 0,
                            addresses: [ALICE_ADDRESS, SERVER_ADDRESS],
                            cumulativeDebits: ['0', '10'],
                            signatures: [null, null],
                            closed: 1
                        }

                        withdrawClaimServer.signatures = [
                            withdrawClaimAlice.signatures[0],
                            signClaim(withdrawClaimServer, SERVER_PRIVATE_KEY)
                        ]

                        const messageServer = {
                            action: 'WITHDRAW',
                            claim: withdrawClaimServer
                        }

                        const errorMsg = 'Invalid message for Alice'
                        await expect(cryptoSDK.receiveMsg(JSON.stringify(messageServer))).rejects.toThrowError(errorMsg)
                        expect(events[events.length - 1].type).toEqual(eventType.claimNotConfirmed)
                        expect(events[events.length - 1].error).toBe(true)
                        expect((await claimStorage.getConfirmedClaim(ALICE_ADDRESS)).nonce).toBe(2)
                    })
                })
            })

            describe('Gets total balance (vault + off-chain)', () => {
                it('exists a claim saved in localStorage, Alice debit is 0', async () => {
                    expect((await cryptoSDK.getTotalBalance(ALICE_ADDRESS)).toString()).toBe('20')
                    expect(claimWin.cumulativeDebits[0]).toBe('0')

                    claimStorage.saveConfirmedClaim(claimWin)

                    expect((await cryptoSDK.getTotalBalance(ALICE_ADDRESS)).toString()).toBe('25')
                })

                it('exists a claim saved in localStorage, Alice debit is not 0', async () => {
                    expect(claimWin.cumulativeDebits[1]).toBe('5')

                    claimStorage.saveConfirmedClaim(claimToPay)

                    expect((await cryptoSDK.getTotalBalance(ALICE_ADDRESS)).toString()).toBe('15')
                })

                it('exists a claim saved in localStorage, both debits is 0', async () => {
                    claimWin.cumulativeDebits = ['0', '0']
                    const bobSignatureWin = signClaim(claimWin, SERVER_PRIVATE_KEY)
                    const aliceSignatureWin = signClaim(claimWin, ALICE_PRIVATE_KEY)
                    claimWin.signatures = [aliceSignatureWin, bobSignatureWin]

                    claimStorage.saveConfirmedClaim(claimWin)

                    expect((await cryptoSDK.getTotalBalance(ALICE_ADDRESS)).toString()).toBe('20')
                })

                it('no claim saved in localStorage', async () => {
                    expect((await cryptoSDK.getTotalBalance(ALICE_ADDRESS)).toString()).toBe('20')
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
                const errorMsg = 'Error: Please change your network on Metamask'
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
                const errorMsg = 'Please change your network on Metamask'
                await expect(cryptoSDK.pay(claimToPay)).rejects.toThrowError(errorMsg)
                expect(events[0].type).toEqual(eventType.claimNotSigned)
                expect(events[0].error).toBe(true)
                expect(await claimStorage.getClaimAlice(ALICE_ADDRESS)).toBe(null)
            })

            test("payReceived() throws error AND emits error event AND doesn't save to localStorage", async () => {
                const errorMsg = 'Please change your network on Metamask'
                await expect(cryptoSDK.payReceived(claimToPayRecieved)).rejects.toThrowError(errorMsg)
                expect(events[0].type).toEqual(eventType.claimNotConfirmed)
                expect(events[0].error).toBe(true)
                expect(await claimStorage.getConfirmedClaim(ALICE_ADDRESS)).toBe(null)
            })

            test("win() throws error AND emits error event AND doesn't save to localStorage", async () => {
                const errorMsg = 'Please change your network on Metamask'
                await expect(cryptoSDK.win(claimWin)).rejects.toThrowError(errorMsg)
                expect(events[0].type).toEqual(eventType.winNotConfirmed)
                expect(events[0].error).toBe(true)
                expect(await claimStorage.getConfirmedClaim(ALICE_ADDRESS)).toBe(null)
            })

            test('Login via Metamask - throws error AND arrives error event challengeNotSigned', async () => {
                const errorMsg = 'Please change your network on Metamask'
                await expect(cryptoSDK.signChallenge(challenge)).rejects.toThrowError(errorMsg)
                expect(events[0].type).toEqual(eventType.challengeNotSigned)
                expect(events[0].error).toBe(true)
            })
        })
    })
})
