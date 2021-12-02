import { Container } from "typedi";
import {
  ClaimDAOInterface,
  ClaimTransaction,
  Environment
} from "@coingames/claim-library";

class AliceClaimDAO implements ClaimDAOInterface {
  protected readonly environment: Environment = Container.get("env");

  constructor(protected account: string) {}

  _get(address: string, key: string): ClaimTransaction | null {
    const storageClaim = window.localStorage.getItem(key);
    if (storageClaim) {
      return new ClaimTransaction(this.account).parse(storageClaim);
    }
    return null;
  }

  getLastSentClaim(address: string): ClaimTransaction | null {
    return this._get(address, "wallet-sent-claim");
  }

  getLastTransaction(address: string): ClaimTransaction | null {
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

export { AliceClaimDAO };
