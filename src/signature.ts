const BN = require("bn.js");

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
export function buildTypedSignature(
  claim: IClaim,
  domain: IDomain
): ISignature {
  const EIP712Domain: IField[] = [
    { name: "name", type: "string" },
    { name: "version", type: "string" },
    { name: "chainId", type: "uint256" },
    { name: "verifyingContract", type: "address" }
  ];

  const Claim: IField[] = [
    { name: "id", type: "uin256" },
    { name: "alice", type: "address" },
    { name: "bob", type: "address" },
    { name: "nonce", type: "uint256" },
    { name: "timestamp", type: "uint256" },
    { name: "cumulativeDebitAlice", type: "uint256" },
    { name: "cumulativeDebitBob", type: "uint256" }
  ];

  const Domain: IDomain = {
    name: domain.name,
    version: domain.version,
    chainId: domain.chainId,
    verifyingContract: domain.verifyingContract
  };

  return {
    types: {
      EIP712Domain,
      Claim
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
