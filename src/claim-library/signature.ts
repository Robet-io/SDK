import { recoverTypedSignature, signTypedData, SignTypedDataVersion } from "@metamask/eth-sig-util";
import { MessageTypes } from "@metamask/eth-sig-util/dist/sign-typed-data";
import { IClaimRequest } from "./interfaces/IClaimRequest";
import { IClaim } from "./interfaces/IClaim";
import { ALICE, BOB } from "./env";
import { toChecksumAddress } from "ethereumjs-util";
import { LibException } from "./exceptions/LibException";

interface IDomain {
    name?: string;
    version?: string;
    chainId?: number;
    verifyingContract?: string;
    salt?: ArrayBuffer;
}

export interface ISignature {
    types: MessageTypes;
    domain: IDomain;
    primaryType: string;
    message: IClaim;
}

/**
 *
 * @param message
 * @param domain
 */
export function buildTypedClaim(message: IClaimRequest, domain: IDomain): ISignature {
    return {
        types: {
            EIP712Domain: [
                { name: "name", type: "string" },
                { name: "version", type: "string" },
                { name: "chainId", type: "uint256" },
                { name: "verifyingContract", type: "address" }
            ],
            Claim: [
                { name: "id", type: "uint256" },
                { name: "alice", type: "address" },
                { name: "bob", type: "address" },
                { name: "nonce", type: "uint256" },
                { name: "timestamp", type: "uint256" },
                { name: "messageForAlice", type: "string" },
                { name: "cumulativeDebitAlice", type: "uint256" },
                { name: "cumulativeDebitBob", type: "uint256" }
            ]
        },
        domain,
        primaryType: "Claim",
        message: {
            id: message.id,
            alice: message.addresses[ALICE],
            bob: message.addresses[BOB],
            nonce: message.nonce,
            timestamp: message.timestamp,
            messageForAlice: message.messageForAlice,
            cumulativeDebitAlice: message.cumulativeDebits[ALICE],
            cumulativeDebitBob: message.cumulativeDebits[BOB],
        }
    };
}

/**
 *
 * @param data
 * @param privKey
 */
export function signTypedClaim(data: ISignature, privKey: string): string {
    const privateKey = Buffer.from(privKey, "hex");

    return signTypedData({
        privateKey,
        data,
        version: SignTypedDataVersion.V4
    });
}

/**
 *
 * @param data
 * @param signature
 */
export function recoverTypedClaimSigner(
    data: ISignature,
    signature: string | undefined
): string {
    if (signature === undefined) throw new Error("Invalid signature for recover");

    return recoverTypedSignature({
        data,
        signature,
        version: SignTypedDataVersion.V4
    });
}
