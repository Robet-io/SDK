import { NetworkInterface } from "./interfaces/NetworkInterface";
import { Container } from "typedi";
import { ClaimDAOInterface } from "./interfaces/ClaimDAOInterface";
import { AliceClaimDAO } from "./AliceClaimDAO";
import { ClaimTransaction } from "./ClaimTransaction";
import { ME, THEY } from "./Environment";

export class PaymentController {
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
      await newClaim.checkAndCountersign();
      this.saveTransaction(newClaim);
      this.sendClaim(newClaim);
    } else if (
      newClaim.signatures[THEY] &&
      newClaim.signatures[ME] &&
      newClaim.amount > 0 &&
      newClaim.isSentClaim()
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
      await newClaim.checkAndSign();
      this.sendClaim(newClaim);
    }
  }

  async pay(amount: number) {
    let newClaim = new ClaimTransaction();
    await newClaim.createPayment(amount, this.config.serverAccount);
    this.sendClaim(newClaim);
  }

  async withdraw() {
    let lastClaim = this.claimDAO.getLastTransaction(this.config.serverAccount);
    /*await VaultContract.methods
                        .withdraw(lastClaim)
                        .send({ from: this.config.account });*/
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
}
