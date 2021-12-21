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
        const newClaim = await new ClaimTransaction(
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
            await this.saveTransaction(newClaim);
            await this.sendClaim(newClaim);
        } else if (
            newClaim.claim.signatures[env.get("THEY")] &&
            newClaim.claim.signatures[env.get("ME")] &&
            newClaim.claim.amount > 0 &&
            await this.isProposedTransaction(newClaim.claim)
        ) {
            // controfirma ad un mio pagamento
            if (newClaim.checkSignature()) {
                await this.saveTransaction(newClaim);
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

            await this.sendClaim(newClaim);
        }
    }

    async pay(amount: number) {
        const newClaim = new ClaimTransaction(this.config.account, this.claimDAO, this.web3);
        await newClaim.createPayment(amount, env.get("serverAddress"));
        await this.sendClaim(newClaim);
    }

    async checkAndSign(transaction: ClaimTransaction) {
        await transaction.check();

        if (transaction.claim.amount < 0) {
            throw "Claim with amount inconsistent with sending policies.";
        }

        // Counter sign
        await transaction.sign();

        return this;
    }

    async checkAndCountersign(claimTransaction: ClaimTransaction) {
        await claimTransaction.check();

        if (claimTransaction.claim.amount > 0) {
            throw new LibException("Claim with amount inconsistent with sending policies.");
        }

        if (!claimTransaction.checkSignature()) {
            throw new LibException("Invalid signature");
        }

        await claimTransaction.sign();

        return this;
    }

    async isProposedTransaction(claim: IClaimRequest) {
        const sentClaim = await this.claimDAO.getProposedTransaction(claim.addresses[env.get("THEY")]);

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

    protected async saveTransaction(claimTransaction: ClaimTransaction) {
        const response = await this.claimDAO.saveTransaction(claimTransaction, claimTransaction.claim.addresses[env.get("THEY")]);
        console.log("saveTransaction response:", response);
        this.config.onTransactionCompleted(
            claimTransaction.claim.amount,
            claimTransaction.claim.addresses[env.get("THEY")],
            claimTransaction.claim
        );
        this.claimDAO.deleteProposedTransaction(claimTransaction.claim.addresses[env.get("THEY")]);
    }

    protected async sendClaim(claimTransaction: ClaimTransaction) {
        const message = claimTransaction.serialize();
        this.network?.send(message);
        if (claimTransaction.claim.signatures[env.get("ME")] && !claimTransaction.claim.signatures[env.get("THEY")]) {
            await this.claimDAO.saveProposedTransaction(claimTransaction);
        }
    }
}
