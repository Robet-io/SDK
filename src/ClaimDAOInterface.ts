import {ClaimTransaction} from "./ClaimTransaction";

interface ClaimDAOInterface {
    getLastTransaction(address: string): ClaimTransaction;
    saveTransaction(claim: ClaimTransaction, address: string): void;
    getLastSentClaim(address:string): ClaimTransaction|null;
    saveSentClaim(claim: ClaimTransaction, address: string): void;
    deleteLastSentClaim(address:string):void;
}

export {ClaimDAOInterface};