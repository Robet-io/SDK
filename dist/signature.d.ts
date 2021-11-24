/**
 * Descrizione interfaccia
 */
export interface IClaim {
    id: number;
    /** Alice address */
    alice: string;
    /** Bob address */
    bob: string;
    nonce: number;
    timestamp: number;
    cumulativeDebitAlice: number;
    cumulativeDebitBob: number;
}
export interface IDomain {
    name: string;
    version: string;
    chainId: number;
    verifyingContract: string;
}
interface IField {
    name: string;
    type: string;
}
interface ISignatureTypes {
    EIP712Domain: IField[];
    Claim: IField[];
}
export interface ISignature {
    types: ISignatureTypes;
    domain: IDomain;
    primaryType: string;
    message: IClaim;
}
/**
 * Descrizione funzione
 * @param claim Descrizione parametro
 */
export declare function buildTypedSignature(claim: IClaim, domain: IDomain): ISignature;
export {};
