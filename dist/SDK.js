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
var _ = require("lodash");
var BN = require("bn.js");
var Web3 = require("web3");
var sigUtil = require("@metamask/eth-sig-util");
var AliceClaimDAO_1 = require("./AliceClaimDAO");
var AliceNetwork_1 = require("./AliceNetwork");
var MetaMaskController_1 = require("./MetaMaskController");
var Environment_1 = require("./Environment");
var ClaimTransaction_1 = require("./ClaimTransaction");
var typedi_1 = require("typedi");
var web3;
var claimDAO;
if ((0, Environment_1.isServer)()) {
    web3 = new Web3(new Web3.providers.HttpProvider(Environment_1.environment.rpcUrlTestnet));
    claimDAO = new AliceClaimDAO_1.AliceClaimDAO();
}
else {
    web3 = new Web3(Web3.givenProvider || Environment_1.environment.rpcUrlTestnet);
    claimDAO = new AliceClaimDAO_1.AliceClaimDAO();
}
typedi_1.Container.set("web3", web3);
typedi_1.Container.set("claimDAO", claimDAO);
var VaultABI = require("../abi/Vault.json");
var VaultContract = new web3.eth.Contract(VaultABI, Environment_1.environment.vaultContractAddress);
//const RACTokenABI = require("../abi/RACToken.json")
//const RACTokenContract = new web3.eth.Contract(RACTokenABI, environment.racTokenContractAddress)
var PaymentController = /** @class */ (function () {
    function PaymentController(config) {
        this.config = config;
    }
    PaymentController.prototype.onMessageReceived = function (message) {
        return __awaiter(this, void 0, void 0, function () {
            var newClaim;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        newClaim = new ClaimTransaction_1.ClaimTransaction().parse(message);
                        if (!(newClaim.signatures[Environment_1.THEY] &&
                            !newClaim.signatures[Environment_1.ME] &&
                            newClaim.amount < 0)) return [3 /*break*/, 2];
                        // pagamento suo
                        return [4 /*yield*/, newClaim.checkAndCountersign()];
                    case 1:
                        // pagamento suo
                        _a.sent();
                        this.saveTransaction(newClaim);
                        this.sendClaim(newClaim);
                        return [3 /*break*/, 6];
                    case 2:
                        if (!(newClaim.signatures[Environment_1.THEY] &&
                            newClaim.signatures[Environment_1.ME] &&
                            newClaim.amount > 0 &&
                            newClaim.isSentClaim())) return [3 /*break*/, 4];
                        return [4 /*yield*/, newClaim.checkSignature()];
                    case 3:
                        // controfirma ad un mio pagamento
                        if (_a.sent()) {
                            this.saveTransaction(newClaim);
                        }
                        return [3 /*break*/, 6];
                    case 4:
                        if (!(!newClaim.signatures[Environment_1.THEY] &&
                            !newClaim.signatures[Environment_1.ME] &&
                            newClaim.amount > 0)) return [3 /*break*/, 6];
                        // proposta di pagamento da parte mia
                        if (!this.config.onTransactionRequestReceived(newClaim.amount, newClaim.addresses[Environment_1.THEY])) {
                            throw "Transaction refused.";
                        }
                        return [4 /*yield*/, newClaim.checkAndSign()];
                    case 5:
                        _a.sent();
                        this.sendClaim(newClaim);
                        _a.label = 6;
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    PaymentController.prototype.pay = function (amount) {
        return __awaiter(this, void 0, void 0, function () {
            var newClaim;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        newClaim = new ClaimTransaction_1.ClaimTransaction();
                        return [4 /*yield*/, newClaim.createPayment(amount, this.config.serverAccount)];
                    case 1:
                        _a.sent();
                        this.sendClaim(newClaim);
                        return [2 /*return*/];
                }
            });
        });
    };
    PaymentController.prototype.withdraw = function () {
        return __awaiter(this, void 0, void 0, function () {
            var lastClaim;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        lastClaim = claimDAO.getLastTransaction(this.config.serverAccount);
                        return [4 /*yield*/, VaultContract.methods
                                .withdraw(lastClaim)
                                .send({ from: this.config.account })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    PaymentController.prototype.saveTransaction = function (newClaim) {
        claimDAO.saveTransaction(newClaim, newClaim.addresses[Environment_1.THEY]);
        this.config.claimDAO.save(newClaim);
        this.config.onTransactionCompleted(newClaim.amount, newClaim.addresses[Environment_1.THEY], newClaim);
        claimDAO.deleteLastSentClaim(newClaim.addresses[Environment_1.THEY]);
    };
    PaymentController.prototype.sendClaim = function (claim) {
        var message = claim.serialize();
        this.config.network.send(message);
        if (claim.signatures[Environment_1.ME] && !claim.signatures[Environment_1.THEY]) {
            claimDAO.saveSentClaim(claim, claim.addresses[Environment_1.THEY]);
        }
    };
    return PaymentController;
}());
var SDK = {
    init: function (_config) { return __awaiter(void 0, void 0, void 0, function () {
        var config, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    config = _.extend({
                        serverAccount: Environment_1.environment.serverAddress,
                        account: null,
                        privateKey: null,
                        onTransactionRequestReceived: function (amount, address) {
                            return true;
                        },
                        onTransactionCompleted: function (amount, address, claimTransaction) {
                            console.log("Transaction completed: " + amount);
                        },
                        network: new AliceNetwork_1.AliceNetwork(),
                        claimDAO: new AliceClaimDAO_1.AliceClaimDAO()
                    }, _config);
                    typedi_1.Container.set("config", config);
                    console.log("ME ALICE", Environment_1.ME, Environment_1.ALICE);
                    if (!(Environment_1.ME == Environment_1.ALICE)) return [3 /*break*/, 2];
                    _a = config;
                    return [4 /*yield*/, new MetaMaskController_1.MetaMaskController(web3, Environment_1.environment).initMetamask()];
                case 1:
                    _a.account = _b.sent();
                    _b.label = 2;
                case 2:
                    config.network.connect();
                    return [2 /*return*/, new PaymentController(config)];
            }
        });
    }); }
};
exports.default = SDK;
// module.exports = {SDK:SDK, ClaimTransaction:ClaimTransaction};
//# sourceMappingURL=SDK.js.map