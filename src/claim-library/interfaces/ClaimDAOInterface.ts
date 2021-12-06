import { IClaimRequest } from "./IClaimRequest";
import { ClaimTransaction } from "../ClaimTransaction";

export interface ClaimDAOInterface {
    getLastTransaction(address: string): IClaimRequest | null;

    saveTransaction(claim: ClaimTransaction, address: string): void;

    getLastSentClaim(address: string): IClaimRequest | null;

    saveSentClaim(claim: ClaimTransaction, address: string): void;

    deleteLastSentClaim(address: string): void;
}
