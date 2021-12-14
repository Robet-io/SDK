import { Web3Provider } from "./Web3Provider";
import {ClaimDAOInterface, ClaimTransaction, env, IClaimRequest} from "./claim-library";
import Web3 from "web3";


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

    async _get(address: string, key: string): Promise<IClaimRequest | undefined> {
        const storageClaim = window.localStorage.getItem(key);
        if (storageClaim) {
            return JSON.parse(storageClaim);
        }
        return undefined;
    }

    async getProposedTransaction(address: string): Promise<IClaimRequest | undefined> {
        return this._get(address, "wallet-sent-claim");
    }

    async getLastTransaction(address: string): Promise<IClaimRequest | undefined> {
        return this._get(address, "wallet-last-claim");
    }

    saveProposedTransaction(claim: ClaimTransaction): void {
        window.localStorage.setItem("wallet-sent-claim", claim.serialize());
        console.log(claim.serialize());
    }

    saveTransaction(claim: ClaimTransaction, address: string): void {
        window.localStorage.setItem("wallet-last-claim", claim.serialize());
        console.log(claim.serialize());
    }

    deleteProposedTransaction(address: string): void {
        window.localStorage.removeItem("wallet-sent-claim");
    }
}
