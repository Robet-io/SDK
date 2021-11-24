"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClaimTransaction = exports.SDK = void 0;
var isServer = function () {
    return !(typeof window != 'undefined' && window.document);
};
var _ = require('lodash');
var BN = require('bn.js');
var Web3 = require('web3');
var sigUtil = require('@metamask/eth-sig-util');
var environment = require('./configuration.json');
var web3;
if (isServer()) {
    web3 = new Web3(new Web3.providers.HttpProvider(environment.rpcUrlTestnet));
}
else {
    web3 = new Web3(Web3.givenProvider || environment.rpcUrlTestnet);
}
var VaultABI = require("../abi/Vault.json");
var VaultContract = new web3.eth.Contract(VaultABI, environment.vaultContractAddress);
//const RACTokenABI = require("../abi/RACToken.json")
//const RACTokenContract = new web3.eth.Contract(RACTokenABI, environment.racTokenContractAddress)
var MetaMaskInitializer = /** @class */ (function () {
    function MetaMaskInitializer() {
        // @ts-ignore
        this.ethereum = window.ethereum;
    }
    MetaMaskInitializer.prototype.onNetwork = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                web3.eth.net.getId().then(function (_networkId) {
                    _this.networkId = _networkId;
                    console.log('Network id: ' + _this.networkId);
                    if (_this.networkId != environment.chainId) {
                        return _this.switchChain();
                    }
                    else {
                        console.log('getBalance for account: ' + _this.account);
                        web3.eth.getBalance(_this.account).then(function (balance) {
                            console.log('Balance: ' + balance);
                        });
                        console.log('_ ' + (typeof _ !== 'undefined'));
                        if (_this.resolve)
                            _this.resolve(_this.account);
                    }
                }).then(function () {
                });
                return [2 /*return*/];
            });
        });
    };
    MetaMaskInitializer.prototype.switchChain = function () {
        return __awaiter(this, void 0, void 0, function () {
            var switchError_1, addError_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 7]);
                        return [4 /*yield*/, this.ethereum.request({
                                method: 'wallet_switchEthereumChain',
                                params: [{ chainId: environment.chainIdHex }],
                            })];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 7];
                    case 2:
                        switchError_1 = _a.sent();
                        if (!(switchError_1.code === 4902)) return [3 /*break*/, 6];
                        _a.label = 3;
                    case 3:
                        _a.trys.push([3, 5, , 6]);
                        return [4 /*yield*/, this.ethereum.request({
                                method: 'wallet_addEthereumChain',
                                params: [{
                                        chainId: environment.chainIdHex,
                                        rpcUrls: [environment.rpcUrlTestnet],
                                        chainName: environment.chainName
                                    }],
                            })];
                    case 4:
                        _a.sent();
                        return [3 /*break*/, 6];
                    case 5:
                        addError_1 = _a.sent();
                        return [3 /*break*/, 6];
                    case 6: return [3 /*break*/, 7];
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    MetaMaskInitializer.prototype.initMetamask = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            console.log('init');
            if (typeof _this.ethereum !== 'undefined') {
                console.log('MetaMask is installed!');
                console.log('Network: ' + _this.ethereum.networkVersion);
                console.log('Address: ' + _this.ethereum.selectedAddress);
                _this.ethereum.request({ method: 'eth_requestAccounts' }).then(function (accounts) {
                    _this.account = accounts[0];
                    console.log('Accounts: ' + accounts[0]);
                    _this.onNetwork();
                });
                _this.ethereum.on('accountsChanged', function (accounts) {
                    // Time to reload your interface with accounts[0]!
                    _this.account = accounts[0];
                    console.log('Accounts changed: ' + accounts[0]);
                    _this.onNetwork();
                });
                _this.ethereum.on('chainChanged', function (chain) {
                    return _this.switchChain();
                });
            }
        });
    };
    return MetaMaskInitializer;
}());
var ALICE = 0;
var BOB = 1;
var ME = isServer() ? BOB : ALICE;
var THEY = isServer() ? ALICE : BOB;
var config = {};
var pastClaims = {};
var sentClaims = {};
var ClaimTransaction = /** @class */ (function () {
    function ClaimTransaction() {
        this.id = 0;
        this.addresses = [];
        this.cumulativeDebits = [0, 0];
        this.signatures = [];
        this.nonce = 1;
        this.timestamp = Date.now();
        this.amount = 0;
        this.messageForAlice = "";
    }
    ClaimTransaction.prototype.createPayment = function (amount, theirAddress) {
        return __awaiter(this, void 0, void 0, function () {
            var amountToShow, lastBalance, lastClaim, balance;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        // vanilla init
                        this.id = 1;
                        this.addresses = [config.account, theirAddress];
                        this.cumulativeDebits = [0, 0];
                        this.signatures = [];
                        this.nonce = 1;
                        this.timestamp = Date.now();
                        this.amount = amount;
                        amountToShow = Math.abs(this.amount);
                        if (ME == ALICE) {
                            if (amount > 0) {
                                this.messageForAlice = "You pay: " + amountToShow + " RAC";
                            }
                            else {
                                this.messageForAlice = "You receive: " + amountToShow + " RAC";
                            }
                        }
                        if (ME == BOB) {
                            if (amount > 0) {
                                this.messageForAlice = "You receive: " + amountToShow + " RAC";
                            }
                            else {
                                this.messageForAlice = "You pay: " + amountToShow + " RAC";
                            }
                        }
                        lastBalance = 0;
                        lastClaim = pastClaims[theirAddress];
                        if (lastClaim) {
                            this.nonce = lastClaim.nonce + 1;
                            this.id = lastClaim.id;
                            lastBalance = lastClaim.cumulativeDebits[ME] - lastClaim.cumulativeDebits[THEY];
                        }
                        balance = lastBalance + amount;
                        if (balance > 0) {
                            this.cumulativeDebits[ME] = balance;
                        }
                        else {
                            this.cumulativeDebits[BOB] = -balance;
                        }
                        if (!(amount > 0)) return [3 /*break*/, 2];
                        return [4 /*yield*/, this._sign(this.encode())];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2: return [2 /*return*/, this];
                }
            });
        });
    };
    ClaimTransaction.prototype.serialize = function () {
        return JSON.stringify(_.pick(this, ["id", "addresses", "messageForAlice", "cumulativeDebits", "nonce", "timestamp", "signatures"]));
    };
    ClaimTransaction.prototype.parse = function (body) {
        console.log("Parsing: %s", body);
        //if(typeof body === 'string')
        body = JSON.parse(body);
        console.log("Parsed: %s", body);
        this.id = body.id;
        this.addresses = body.addresses;
        this.messageForAlice = body.messageForAlice;
        this.cumulativeDebits = body.cumulativeDebits;
        this.nonce = body.nonce;
        this.timestamp = body.timestamp;
        this.signatures = body.signatures;
        var amount = (this.cumulativeDebits[ME]) - (this.cumulativeDebits[THEY]);
        var lastClaim = pastClaims[this.addresses[THEY]];
        if (lastClaim) {
            amount = amount - lastClaim.cumulativeDebits[ME] + lastClaim.cumulativeDebits[THEY];
        }
        this.amount = amount;
        console.log('Claim:', this);
        return this;
    };
    ClaimTransaction.prototype.encode = function () {
        var EIP712Domain = [
            { name: 'name', type: 'string' },
            { name: 'version', type: 'string' },
            { name: 'chainId', type: 'uint256' },
            { name: 'verifyingContract', type: 'address' },
        ];
        var Claim = [
            { name: 'id', type: 'uint256' },
            { name: 'alice', type: 'address' },
            { name: 'bob', type: 'address' },
            { name: 'nonce', type: 'uint256' },
            { name: 'timestamp', type: 'uint256' },
            { name: 'messageForAlice', type: 'string' },
            { name: 'cumulativeDebitAlice', type: 'uint256' },
            { name: 'cumulativeDebitBob', type: 'uint256' },
        ];
        var name = "CoinGames Vault";
        var version = "1";
        var chainId = environment.chainId;
        var verifyingContract = environment.vaultContractAddress;
        return {
            types: {
                EIP712Domain: EIP712Domain,
                Claim: Claim
            },
            domain: { name: name, version: version, chainId: chainId, verifyingContract: verifyingContract },
            primaryType: 'Claim',
            message: {
                id: this.id,
                alice: this.addresses[ALICE],
                bob: this.addresses[BOB],
                nonce: this.nonce,
                timestamp: this.timestamp,
                messageForAlice: this.messageForAlice,
                cumulativeDebitAlice: new BN(this.cumulativeDebits[ALICE]).toString(10),
                cumulativeDebitBob: new BN(this.cumulativeDebits[BOB]).toString(10),
            }
        };
    };
    ClaimTransaction.prototype.checkSignature = function () {
        return __awaiter(this, void 0, void 0, function () {
            var encodedClaim, signValidity;
            return __generator(this, function (_a) {
                encodedClaim = this.encode();
                console.log("Solidity Sha3: ", encodedClaim);
                signValidity = this._checkSignature(encodedClaim);
                console.log('signValidity: ', signValidity);
                return [2 /*return*/, signValidity];
            });
        });
    };
    ClaimTransaction.prototype.check = function () {
        if (this.id < 0 || this.nonce < 1 || this.timestamp < 0 || this.cumulativeDebits[ALICE] < 0 || this.cumulativeDebits[BOB] < 0)
            throw "Claim not valid.";
        if (this.cumulativeDebits[ME] != 0 && this.cumulativeDebits[THEY] != 0) {
            throw 'Claim not balanced.';
        }
        var amount = Math.abs(this.amount);
        if (ME == ALICE) {
            if (this.amount > 0) {
                if (this.messageForAlice !== "You pay: " + amount + " RAC") {
                    throw "Message not valid";
                }
            }
            else {
                if (this.messageForAlice !== "You receive: " + amount + " RAC") {
                    throw "Message not valid";
                }
            }
        }
        if (ME == BOB) {
            if (this.amount > 0) {
                if (this.messageForAlice !== "You receive: " + amount + " RAC") {
                    throw "Message not valid";
                }
            }
            else {
                if (this.messageForAlice !== "You pay: " + amount + " RAC") {
                    throw "Message not valid";
                }
            }
        }
        var lastClaim = pastClaims[this.addresses[THEY]];
        if (lastClaim) {
            if (lastClaim.nonce + 1 != this.nonce || lastClaim.timestamp > this.timestamp)
                throw "Claim not sequent.";
            if (this.id != lastClaim.id) {
                throw "payment channel not valid";
            }
        }
        else {
            if (this.id != 1 || this.nonce != 1) {
                throw "id or nonce are invalid";
            }
        }
    };
    ClaimTransaction.prototype.checkAndSign = function () {
        return __awaiter(this, void 0, void 0, function () {
            var encodedClaim;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.check();
                        if (this.amount < 0) {
                            throw 'Claim with amount inconsistent with sending policies.';
                        }
                        encodedClaim = this.encode();
                        console.log('Solidity Sha3: ' + encodedClaim);
                        // Counter sign
                        return [4 /*yield*/, this._sign(encodedClaim)];
                    case 1:
                        // Counter sign
                        _a.sent();
                        return [2 /*return*/, this];
                }
            });
        });
    };
    ClaimTransaction.prototype.checkAndCountersign = function () {
        return __awaiter(this, void 0, void 0, function () {
            var encodedClaim, signValidity;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.check();
                        if (this.amount > 0) {
                            throw 'Claim with amount inconsistent with sending policies.';
                        }
                        encodedClaim = this.encode();
                        console.log('Solidity Sha3: ' + encodedClaim);
                        signValidity = this._checkSignature(encodedClaim);
                        console.log('signValidity: ' + signValidity);
                        // Counter sign
                        return [4 /*yield*/, this._sign(encodedClaim)];
                    case 1:
                        // Counter sign
                        _a.sent();
                        return [2 /*return*/, this];
                }
            });
        });
    };
    ClaimTransaction.prototype._sign = function (encodedClaim) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, _b, privKey;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        if (!(ME == ALICE)) return [3 /*break*/, 2];
                        _a = this.signatures;
                        _b = ME;
                        return [4 /*yield*/, web3.currentProvider.request({
                                method: 'eth_signTypedData_v4',
                                params: [config.account, JSON.stringify(encodedClaim)],
                                from: config.account,
                            })];
                    case 1:
                        _a[_b] = _c.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        if (ME == BOB) {
                            privKey = Buffer.from(config.privateKey, 'hex');
                            this.signatures[ME] = sigUtil.signTypedData({
                                privateKey: privKey,
                                data: encodedClaim,
                                version: 'V4',
                            });
                        }
                        _c.label = 3;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    ClaimTransaction.prototype._checkSignature = function (encodedClaim) {
        var recovered = sigUtil.recoverTypedSignature({
            data: encodedClaim,
            signature: this.signatures[THEY],
            version: 'V4',
        });
        console.log('_checkSignature', encodedClaim, recovered);
        var ret = web3.utils.toChecksumAddress(recovered) === web3.utils.toChecksumAddress(this.addresses[THEY]);
        if (!ret)
            throw "Signature not valid.";
        return ret;
    };
    ClaimTransaction.prototype.isSentClaim = function () {
        var sentClaim = sentClaims[this.addresses[THEY]];
        if (!sentClaim) {
            return false;
        }
        var relevantFields = ['addresses', 'cumulativeDebits', 'nonce', 'timestamp'];
        return sentClaim && _.isEqual(_.pick(this, relevantFields), _.pick(sentClaim, relevantFields)) && sentClaim.signatures[ME] == this.signatures[ME];
    };
    return ClaimTransaction;
}());
exports.ClaimTransaction = ClaimTransaction;
var AliceNetwork = /** @class */ (function () {
    function AliceNetwork() {
    }
    AliceNetwork.prototype.connect = function () {
        var _this = this;
        // Create WebSocket connection.
        this.socket = new WebSocket('ws://localhost:8666');
        // Connection opened
        this.socket.addEventListener('open', function (event) {
            console.log('Connection established!');
        });
        // Listen for messages
        this.socket.addEventListener('message', function (event) { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                console.log('Message from server ', event.data);
                SDK.onMessageReceived(event.data);
                return [2 /*return*/];
            });
        }); });
    };
    ;
    AliceNetwork.prototype.send = function (message) {
        var _a;
        (_a = this.socket) === null || _a === void 0 ? void 0 : _a.send(message);
    };
    return AliceNetwork;
}());
var AliceClaimDAO = /** @class */ (function () {
    function AliceClaimDAO() {
    }
    AliceClaimDAO.prototype.load = function () {
        return window.localStorage.getItem('wallet-last-claim');
    };
    AliceClaimDAO.prototype.save = function (claim) {
        window.localStorage.setItem('wallet-last-claim', claim.serialize());
        console.log(claim.serialize());
    };
    return AliceClaimDAO;
}());
function saveTransaction(newClaim) {
    pastClaims[newClaim.addresses[THEY]] = newClaim;
    config.claimDAO.save(newClaim);
    config.onTransactionCompleted(newClaim.amount, newClaim.addresses[THEY], newClaim);
    delete sentClaims[newClaim.addresses[THEY]];
}
function sendClaim(claim) {
    var message = claim.serialize();
    config.network.send(message);
    if (claim.signatures[ME] && !claim.signatures[THEY]) {
        sentClaims[claim.addresses[THEY]] = claim;
    }
}
function onMessageReceived(message) {
    return __awaiter(this, void 0, void 0, function () {
        var newClaim;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    newClaim = new ClaimTransaction().parse(message);
                    if (!(newClaim.signatures[THEY] && !newClaim.signatures[ME] && newClaim.amount < 0)) return [3 /*break*/, 2];
                    return [4 /*yield*/, newClaim.checkAndCountersign()];
                case 1:
                    _a.sent();
                    saveTransaction(newClaim);
                    sendClaim(newClaim);
                    return [3 /*break*/, 6];
                case 2:
                    if (!(newClaim.signatures[THEY] && newClaim.signatures[ME] && newClaim.amount > 0 && newClaim.isSentClaim())) return [3 /*break*/, 4];
                    return [4 /*yield*/, newClaim.checkSignature()];
                case 3:
                    if (_a.sent()) {
                        saveTransaction(newClaim);
                    }
                    return [3 /*break*/, 6];
                case 4:
                    if (!(!newClaim.signatures[THEY] && !newClaim.signatures[ME] && newClaim.amount > 0)) return [3 /*break*/, 6];
                    if (!config.onTransactionRequestReceived(newClaim.amount, newClaim.addresses[THEY])) {
                        throw 'Transaction refused.';
                    }
                    return [4 /*yield*/, newClaim.checkAndSign()];
                case 5:
                    _a.sent();
                    sendClaim(newClaim);
                    _a.label = 6;
                case 6: return [2 /*return*/];
            }
        });
    });
}
// The code defines all the functions,
// variables or object to expose as:
var SDK = {
    init: function (_config) { return __awaiter(void 0, void 0, void 0, function () {
        var _a, lastClaim, claimTransaction;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    config = _.extend({
                        serverAccount: environment.serverAddress,
                        account: null,
                        privateKey: null,
                        onTransactionRequestReceived: function (amount, address) {
                            return true;
                        },
                        onTransactionCompleted: function (amount, address, claimTransaction) {
                            console.log('Transaction completed: ' + amount);
                        },
                        network: new AliceNetwork(),
                        claimDAO: new AliceClaimDAO(),
                    }, _config);
                    console.log('ME ALICE', ME, ALICE);
                    if (!(ME == ALICE)) return [3 /*break*/, 2];
                    _a = config;
                    return [4 /*yield*/, new MetaMaskInitializer().initMetamask()];
                case 1:
                    _a.account = _b.sent();
                    _b.label = 2;
                case 2:
                    config.network.connect();
                    lastClaim = config.claimDAO.load();
                    if (lastClaim) {
                        claimTransaction = new ClaimTransaction().parse(lastClaim);
                        pastClaims[claimTransaction.addresses[THEY]] = claimTransaction;
                        console.log('last claim recovered: ' + lastClaim);
                    }
                    return [2 /*return*/];
            }
        });
    }); },
    pay: function (amount) { return __awaiter(void 0, void 0, void 0, function () {
        var newClaim;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    newClaim = new ClaimTransaction();
                    return [4 /*yield*/, newClaim.createPayment(amount, config.serverAccount)];
                case 1:
                    _a.sent();
                    sendClaim(newClaim);
                    return [2 /*return*/];
            }
        });
    }); },
    onMessageReceived: onMessageReceived,
    withdraw: function () { return __awaiter(void 0, void 0, void 0, function () {
        var lastClaim;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    lastClaim = pastClaims[config.serverAccount];
                    return [4 /*yield*/, VaultContract.methods.withdraw(lastClaim).send({ from: config.account })];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); },
};
exports.SDK = SDK;
// module.exports = {SDK:SDK, ClaimTransaction:ClaimTransaction};
//# sourceMappingURL=SDK.js.map