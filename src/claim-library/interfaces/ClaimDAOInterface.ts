import { ClaimTransaction } from "../ClaimTransaction";
import { IClaimRequest } from "./IClaimRequest";

export interface ClaimDAOInterface {
    getLastTransaction(address: string): Promise<IClaimRequest | undefined>;

    saveTransaction(claim: ClaimTransaction, address: string): any;

    getProposedTransaction(address: string): Promise<IClaimRequest | undefined>;

    saveProposedTransaction(claim: ClaimTransaction): void;

    deleteProposedTransaction(address: string): void;
}
