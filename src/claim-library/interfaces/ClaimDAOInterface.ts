import { IClaimRequest } from "./IClaimRequest";

export interface ClaimDAOInterface {
    getLastTransaction(address: string): Promise<IClaimRequest | undefined>;

    saveTransaction(claim: IClaimRequest): Promise<IClaimRequest | undefined>;

    getProposedTransaction(address: string): Promise<IClaimRequest | undefined>;

    saveProposedTransaction(claim: IClaimRequest): Promise<IClaimRequest | undefined>;

    deleteProposedTransaction(address: string): Promise<IClaimRequest | undefined>;
}
