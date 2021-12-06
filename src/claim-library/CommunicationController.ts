import { NetworkInterface } from "./interfaces/NetworkInterface";
import { ClaimDAOInterface } from "./interfaces/ClaimDAOInterface";
import { ClaimTransaction } from "./ClaimTransaction";
import { env } from "./env";
import isEqual from "lodash/isEqual";
import pick from "lodash/pick";
import { IClaimRequest } from "./interfaces/IClaimRequest";
import { LibException } from "./exceptions/LibException";
import Web3 from "web3";

export class CommunicationController {
    constructor(
        protected config: any,
        protected readonly network: NetworkInterface,
        protected readonly claimDAO: ClaimDAOInterface,
        protected readonly web3: Web3
    ) {
        this.network.setListener(this);
        this.network.connect();
    }

    async onMessageReceived(message: string) {
        const newClaim = new ClaimTransaction(
            this.config.account,
            this.claimDAO,
            this.web3
        ).parse(message);

        if (
            newClaim.claim.signatures[env.get("THEY")] &&
            !newClaim.claim.signatures[env.get("ME")] &&
            newClaim.claim.amount < 0
        ) {
            // pagamento suo
            await this.checkAndCountersign(newClaim);
            this.saveTransaction(newClaim);
            this.sendClaim(newClaim);
        } else if (
            newClaim.claim.signatures[env.get("THEY")] &&
            newClaim.claim.signatures[env.get("ME")] &&
            newClaim.claim.amount > 0 &&
            this.isSentClaim(newClaim.claim)
        ) {
            // controfirma ad un mio pagamento
            if (newClaim.checkSignature()) {
                this.saveTransaction(newClaim);
            }
        } else if (
            !newClaim.claim.signatures[env.get("THEY")] &&
            !newClaim.claim.signatures[env.get("ME")] &&
            newClaim.claim.amount > 0
        ) {
            // proposta di pagamento da parte mia
            if (
                !this.config.onTransactionRequestReceived(
                    newClaim.claim.amount,
                    newClaim.claim.addresses[env.get("THEY")]
                )
            ) {
                throw new LibException("Transaction refused.");
            }
            await this.checkAndSign(newClaim);

            this.sendClaim(newClaim);
        }
    }

    async pay(amount: number) {
        const newClaim = new ClaimTransaction(this.config.account, this.claimDAO, this.web3);
        await newClaim.createPayment(amount, env.get("serverAddress"));
        this.sendClaim(newClaim);
    }

    protected saveTransaction(claimTransaction: ClaimTransaction) {
        this.claimDAO.saveTransaction(claimTransaction, claimTransaction.claim.addresses[env.get("THEY")]);
        this.config.onTransactionCompleted(
            claimTransaction.claim.amount,
            claimTransaction.claim.addresses[env.get("THEY")],
            claimTransaction.claim
        );
        this.claimDAO.deleteLastSentClaim(claimTransaction.claim.addresses[env.get("THEY")]);
    }

    protected sendClaim(claimTransaction: ClaimTransaction) {
        const message = claimTransaction.serialize();
        this.network?.send(message);
        if (claimTransaction.claim.signatures[env.get("ME")] && !claimTransaction.claim.signatures[env.get("THEY")]) {
            this.claimDAO.saveSentClaim(claimTransaction, claimTransaction.claim.addresses[env.get("THEY")]);
        }
    }

    async checkAndSign(transaction: ClaimTransaction) {
        transaction.check();

        if (transaction.claim.amount < 0) {
            throw "Claim with amount inconsistent with sending policies.";
        }

        // Counter sign
        await transaction.sign();

        return this;
    }

    async checkAndCountersign(claimTransaction: ClaimTransaction) {
        claimTransaction.check();

        if (claimTransaction.claim.amount > 0) {
            throw new LibException("Claim with amount inconsistent with sending policies.");
        }

        if (!claimTransaction.checkSignature()) {
            throw new LibException("Invalid signature");
        }

        await claimTransaction.sign();

        return this;
    }

    isSentClaim(claim: IClaimRequest) {
        const sentClaim = this.claimDAO.getLastSentClaim(claim.addresses[env.get("THEY")]);

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
            sentClaim.signatures[env.get("ME")] === claim.signatures[env.get("ME")]
        );
    }
}
