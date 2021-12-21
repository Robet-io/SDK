import {ClaimDAOInterface, ClaimTransaction, IClaimRequest} from "./claim-library";

export class AliceClaimDAO implements ClaimDAOInterface {
    private constructor(protected account: string) {
    }

    private static _instance: AliceClaimDAO;

    static getInstance(address:string): AliceClaimDAO {
        if (typeof this._instance === "undefined") {
            this._instance = new AliceClaimDAO(address);
        }

        return this._instance;
    }

    _get(address: string, key: string): IClaimRequest | undefined {
        const storageClaim = window.localStorage.getItem(key);
        if (storageClaim) {
            return JSON.parse(storageClaim);
        }
        return undefined;
    }

    getProposedTransaction(address: string): Promise<IClaimRequest | undefined> {
        return new Promise((resolve, reject) => {
            resolve(this._get(address, "wallet-sent-claim"));
        });
    }

    getLastTransaction(address: string): Promise<IClaimRequest | undefined> {
        return new Promise((resolve, reject) => {
            resolve(this._get(address, "wallet-last-claim"));
        });
    }

    saveSentClaim(claim: ClaimTransaction, address: string): void {
        window.localStorage.setItem("wallet-sent-claim", claim.serialize());
        console.log(claim.serialize());
    }

    saveTransaction(claim: ClaimTransaction, address: string): void {

    }

    deleteProposedTransaction(address: string): void {
        window.localStorage.removeItem("wallet-sent-claim");
    }

    saveProposedTransaction(claim: ClaimTransaction): void {
        window.localStorage.setItem("wallet-last-claim", claim.serialize());
        console.log(claim.serialize());
    }
}
