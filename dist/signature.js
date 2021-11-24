"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildTypedSignature = void 0;
var BN = require("bn.js");
/**
 * Descrizione funzione
 * @param claim Descrizione parametro
 */
function buildTypedSignature(claim, domain) {
    var EIP712Domain = [
        { name: "name", type: "string" },
        { name: "version", type: "string" },
        { name: "chainId", type: "uint256" },
        { name: "verifyingContract", type: "address" }
    ];
    var Claim = [
        { name: "id", type: "uin256" },
        { name: "alice", type: "address" },
        { name: "bob", type: "address" },
        { name: "nonce", type: "uint256" },
        { name: "timestamp", type: "uint256" },
        { name: "cumulativeDebitAlice", type: "uint256" },
        { name: "cumulativeDebitBob", type: "uint256" }
    ];
    var Domain = {
        name: domain.name,
        version: domain.version,
        chainId: domain.chainId,
        verifyingContract: domain.verifyingContract
    };
    return {
        types: {
            EIP712Domain: EIP712Domain,
            Claim: Claim
        },
        domain: Domain,
        primaryType: "Claim",
        message: {
            id: claim.id,
            alice: claim.alice,
            bob: claim.bob,
            nonce: claim.nonce,
            timestamp: claim.timestamp,
            cumulativeDebitAlice: new BN(claim.cumulativeDebitAlice).toString(10),
            cumulativeDebitBob: new BN(claim.cumulativeDebitBob).toString(10)
        }
    };
}
exports.buildTypedSignature = buildTypedSignature;
//# sourceMappingURL=signature.js.map