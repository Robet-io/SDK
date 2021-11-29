import { NetworkInterface } from "./interfaces/NetworkInterface";
import { Container } from "typedi";
import { ClaimDAOInterface } from "./interfaces/ClaimDAOInterface";
import { AliceClaimDAO } from "./AliceClaimDAO";
import { ClaimTransaction } from "./ClaimTransaction";
import { ME, THEY } from "./Environment";
import isEqual from "lodash/isEqual";
import pick from "lodash/pick";

export class CommunicationController {
  protected readonly network: NetworkInterface = Container.get("network");
  protected readonly claimDAO: ClaimDAOInterface;

  constructor(protected config: any) {
    this.claimDAO = new AliceClaimDAO();
    Container.set("claimDAO", this.claimDAO);
  }

  async onMessageReceived(message: string) {
    const newClaim = new ClaimTransaction().parse(message);

    if (
      newClaim.signatures[THEY] &&
      !newClaim.signatures[ME] &&
      newClaim.amount < 0
    ) {
      // pagamento suo
      await this.checkAndCountersign(newClaim);
      this.saveTransaction(newClaim);
      this.sendClaim(newClaim);
    } else if (
      newClaim.signatures[THEY] &&
      newClaim.signatures[ME] &&
      newClaim.amount > 0 &&
      this.isSentClaim(newClaim)
    ) {
      // controfirma ad un mio pagamento
      if (await newClaim.checkSignature()) {
        this.saveTransaction(newClaim);
      }
    } else if (
      !newClaim.signatures[THEY] &&
      !newClaim.signatures[ME] &&
      newClaim.amount > 0
    ) {
      // proposta di pagamento da parte mia
      if (
        !this.config.onTransactionRequestReceived(
          newClaim.amount,
          newClaim.addresses[THEY]
        )
      ) {
        throw "Transaction refused.";
      }
      await this.checkAndSign(newClaim);
      this.sendClaim(newClaim);
    }
  }

  async pay(amount: number) {
    let newClaim = new ClaimTransaction();
    await newClaim.createPayment(amount, this.config.serverAccount);
    this.sendClaim(newClaim);
  }

  protected saveTransaction(newClaim: ClaimTransaction) {
    this.claimDAO.saveTransaction(newClaim, newClaim.addresses[THEY]);
    this.config.onTransactionCompleted(
      newClaim.amount,
      newClaim.addresses[THEY],
      newClaim
    );
    this.claimDAO.deleteLastSentClaim(newClaim.addresses[THEY]);
  }

  protected sendClaim(claim: ClaimTransaction) {
    const message = claim.serialize();
    this.config.network.send(message);
    if (claim.signatures[ME] && !claim.signatures[THEY]) {
      this.claimDAO.saveSentClaim(claim, claim.addresses[THEY]);
    }
  }

  async checkAndSign(claim: ClaimTransaction) {
    claim.check();

    if (claim.amount < 0) {
      throw "Claim with amount inconsistent with sending policies.";
    }

    const encodedClaim = claim.encode();
    console.log("Solidity Sha3: " + encodedClaim);

    // Counter sign
    await claim._sign(encodedClaim);

    return this;
  }

  async checkAndCountersign(claim: ClaimTransaction) {
    claim.check();

    if (claim.amount > 0) {
      throw "Claim with amount inconsistent with sending policies.";
    }

    const encodedClaim = claim.encode();
    console.log("Solidity Sha3: " + encodedClaim);

    const signValidity = claim._checkSignature(encodedClaim);
    console.log("signValidity: " + signValidity);

    // Counter sign
    await claim._sign(encodedClaim);

    return this;
  }

  isSentClaim(claim: ClaimTransaction) {
    const sentClaim = this.claimDAO.getLastSentClaim(claim.addresses[THEY]);
    if (!sentClaim) {
      return false;
    }
    const relevantFields = [
      "addresses",
      "cumulativeDebits",
      "nonce",
      "timestamp"
    ];
    return (
      sentClaim &&
      isEqual(pick(claim, relevantFields), pick(sentClaim, relevantFields)) &&
      sentClaim.signatures[ME] == claim.signatures[ME]
    );
  }
}
