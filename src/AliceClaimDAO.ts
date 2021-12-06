import { Web3Provider } from "./Web3Provider";
import {ClaimDAOInterface, ClaimTransaction, IClaimRequest} from "./claim-library";


export class AliceClaimDAO implements ClaimDAOInterface {
    constructor(protected account: string) {
    }

    _get(address: string, key: string): IClaimRequest | null {
        const storageClaim = window.localStorage.getItem(key);
        if (storageClaim) {
            return new ClaimTransaction(
                this.account,
                new AliceClaimDAO(address),
                Web3Provider.getInstance()
            ).parse(storageClaim).claim;
        }
        return null;
    }

    getLastSentClaim(address: string): IClaimRequest | null {
        return this._get(address, "wallet-sent-claim");
    }

    getLastTransaction(address: string): IClaimRequest | null {
        return this._get(address, "wallet-last-claim");
    }

    saveSentClaim(claim: ClaimTransaction, address: string): void {
        window.localStorage.setItem("wallet-sent-claim", claim.serialize());
        console.log(claim.serialize());
    }

    saveTransaction(claim: ClaimTransaction, address: string): void {
        window.localStorage.setItem("wallet-last-claim", claim.serialize());
        console.log(claim.serialize());
    }

    deleteLastSentClaim(address: string): void {
        window.localStorage.removeItem("wallet-sent-claim");
    }
}
