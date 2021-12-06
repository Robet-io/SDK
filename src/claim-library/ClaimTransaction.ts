import Web3 from "web3";
import { env } from "./env";
import { ClaimDAOInterface } from "./interfaces/ClaimDAOInterface";
import { IClaimRequest } from "./interfaces/IClaimRequest";
import { LibException } from "./exceptions/LibException";
import { buildTypedClaim, ISignature, recoverTypedClaimSigner, signTypedClaim } from "./signature";

export class ClaimTransaction {
    private _claim!: IClaimRequest;

    constructor(
        protected account: string,
        protected readonly claimDAO: ClaimDAOInterface,
        protected readonly web3: Web3
    ) {
    }

    get claim(): IClaimRequest {
        return this._claim;
    }

    async createPayment(amount: number, theirAddress: string) {
        this._claim = {
            id: 1,
            nonce: 1,
            timestamp: Date.now(),
            messageForAlice: "",
            amount: amount,
            addresses: [this.account, theirAddress],
            cumulativeDebits: [0, 0],
            signatures: []
        };

        const amountToShow = Math.abs(amount);

        if (env.get("ME") === env.get("ALICE")) {
            if (amount > 0) {
                this._claim.messageForAlice = "You pay: " + amountToShow + " RAC";
            } else {
                this._claim.messageForAlice = "You receive: " + amountToShow + " RAC";
            }
        } else if (env.get("ME") === env.get("BOB")) {
            if (amount > 0) {
                this._claim.messageForAlice = "You receive: " + amountToShow + " RAC";
            } else {
                this._claim.messageForAlice = "You pay: " + amountToShow + " RAC";
            }
        } else {
            throw new LibException("ME and BOB error");
        }

        let lastBalance = 0;
        const lastClaim: IClaimRequest | null = this.claimDAO.getLastTransaction(
            theirAddress
        );
        if (lastClaim) {
            this._claim.nonce = lastClaim.nonce + 1;
            this._claim.id = lastClaim.id;
            lastBalance =
                lastClaim.cumulativeDebits[env.get("ME")] -
                lastClaim.cumulativeDebits[env.get("THEY")];
        }

        const balance = lastBalance + amount;
        if (balance > 0) {
            this._claim.cumulativeDebits[env.get("ME")] = balance;
        } else {
            this._claim.cumulativeDebits[env.get("BOB")] = -balance;
        }

        if (amount > 0) {
            await this.sign();
        }

        return this;
    }

    serialize() {
        return JSON.stringify(this._claim);
    }

    parse(body: string) {
        const claim = JSON.parse(body);

        this._claim = {
            id: Number(claim.id),
            addresses: claim.addresses,
            amount: Number(claim.amount),
            cumulativeDebits: claim.cumulativeDebits,
            messageForAlice: claim.messageForAlice,
            timestamp: claim.timestamp,
            nonce: claim.nonce,
            signatures: claim.signatures,
        };

        const lastClaim = this.claimDAO.getLastTransaction(
            this._claim.addresses[env.get("THEY")]
        );

        let amount =
            this._claim.cumulativeDebits[env.get("ME")] -
            this._claim.cumulativeDebits[env.get("THEY")];

        if (lastClaim) {
            amount = amount - lastClaim.cumulativeDebits[env.get("ME")] + lastClaim.cumulativeDebits[env.get("THEY")];
        }

        this._claim.amount = amount;

        return this;
    }

    encode(): ISignature {
        const ret:ISignature = buildTypedClaim(this.claim, {
            name: "CoinGames Vault",
            version: "1",
            chainId: env.get("chainId"),
            verifyingContract: env.get("vaultContractAddress")
        });
        console.log("encoded",ret);
        return ret;
    }

    check() {
        if (
            this._claim.id < 0 ||
            this._claim.nonce < 1 ||
            this._claim.timestamp < 0 ||
            this._claim.cumulativeDebits[env.get("ALICE")] < 0 ||
            this._claim.cumulativeDebits[env.get("BOB")] < 0
        ) {
            throw new LibException("Claim not valid.");
        }

        if (
            this._claim.cumulativeDebits[env.get("ME")] !== 0 &&
            this._claim.cumulativeDebits[env.get("THEY")] !== 0
        ) {
            throw new LibException("Claim not balanced.");
        }

        const amount = Math.abs(this._claim.amount);

        if (env.get("ME") === env.get("ALICE")) {
            if (this._claim.amount > 0) {
                if (this._claim.messageForAlice !== "You pay: " + amount + " RAC") {
                    throw new LibException("Message not valid");
                }
            } else {
                if (this._claim.messageForAlice !== "You receive: " + amount + " RAC") {
                    throw new LibException("Message not valid");
                }
            }
        }
        if (env.get("ME") === env.get("BOB")) {
            if (this._claim.amount > 0) {
                if (this._claim.messageForAlice !== "You receive: " + amount + " RAC") {
                    throw new LibException("Message not valid");
                }
            } else {
                if (this._claim.messageForAlice !== "You pay: " + amount + " RAC") {
                    throw new LibException("Message not valid");
                }
            }
        }

        const lastClaim = this.claimDAO.getLastTransaction(
            this._claim.addresses[env.get("THEY")]
        );

        if (lastClaim) {
            if (
                lastClaim.nonce + 1 !== this._claim.nonce ||
                lastClaim.timestamp > this._claim.timestamp
            ) {
                throw new LibException("Claim not sequent.");
            }
            if (this._claim.id !== lastClaim.id) {
                throw new LibException("payment channel not valid");
            }
        } else {
            if (this._claim.id !== 1 || this._claim.nonce !== 1) {
                throw new LibException("id or nonce are invalid");
            }
        }
    }

    async sign() {
        const encodedClaim = this.encode();

        if (env.get("ME") === env.get("ALICE")) {
            this._claim.signatures[env.get("ME")] = await (this.web3.currentProvider as any).request({
                method: "eth_signTypedData_v4",
                params: [this.account, JSON.stringify(encodedClaim)],
                from: this.account
            });
        } else if (env.get("ME") === env.get("BOB")) {
            this._claim.signatures[env.get("ME")] = signTypedClaim(encodedClaim, env.get("serverPrivateKey"));
        } else {
            throw new LibException("ME and BOB error");
        }

        return this;
    }

    checkSignature(): boolean {
        const encodedClaim = this.encode();
        const recovered = recoverTypedClaimSigner(encodedClaim, this._claim.signatures[env.get("THEY")]);

        return this.web3.utils.toChecksumAddress(recovered) === this.web3.utils.toChecksumAddress(this._claim.addresses[env.get("THEY")]);
    }
}
