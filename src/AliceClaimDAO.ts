import { ClaimTransaction } from "./ClaimTransaction";
import { ClaimDAOInterface } from "./ClaimDAOInterface";
import { THEY } from "./Environment";
import { Container } from "typedi";

let config: any = Container.get("config");

class AliceClaimDAO implements ClaimDAOInterface {
  _get(address: string, key: string): ClaimTransaction | null {
    const storageClaim = window.localStorage.getItem(key);
    if (storageClaim) {
      return new ClaimTransaction().parse(storageClaim);
    }
    return null;
  }

  _createBaseTransaction() {
    return new ClaimTransaction().parse({
      id: 0,
      addresses: [config.account, config.serverAccount],
      messageForAlice: "",
      cumulativeDebits: [0, 0],
      nonce: 0,
      timestamp: 0,
      signatures: ["", ""]
    });
  }

  getLastSentClaim(address: string): ClaimTransaction | null {
    return this._get(address, "wallet-sent-claim");
  }

  getLastTransaction(address: string): ClaimTransaction {
    return (
      this._get(address, "wallet-last-claim") || this._createBaseTransaction()
    );
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
