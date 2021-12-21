import isEqual from "lodash/isEqual";
import isEmpty from "lodash/isEmpty";
import { toChecksumAddress } from "ethereumjs-util";
import { IClaimRequest } from "./interfaces/IClaimRequest";
import { ClaimDAOInterface } from "./interfaces/ClaimDAOInterface";
import { buildTypedClaim, ISignature, recoverTypedClaimSigner, signTypedClaim } from "./signature";
import { IEnvOptions } from "./interfaces/IEnvOptions";
import { ClaimTypeEnum } from "./enums/ClaimTypeEnum";
import { LibException } from "./exceptions/LibException";
import { isEthereumAddress } from "class-validator";

export class ClaimController {
    private _userAddress!: string;
    private _options!: IEnvOptions;
    private _dao!: ClaimDAOInterface;

    setUserAddress(value: string): ClaimController {
        this._userAddress = value;

        return this;
    }

    get userAddress(): string {
        return this._userAddress;
    }

    setOptions(value: IEnvOptions): ClaimController {
        this._options = value;

        return this;
    }

    get options(): IEnvOptions {
        return this._options;
    }

    setDao(value: ClaimDAOInterface): ClaimController {
        this._dao = value;

        return this;
    }

    get dao(): ClaimDAOInterface {
        return this._dao;
    }

    async processRequest(claim: IClaimRequest): Promise<IClaimRequest | undefined> {
        //claim.amount = await this.calculateAmount(claim);

        if (!isEmpty(claim.signatures[this.options.THEY]) && isEmpty(claim.signatures[this.options.ME]) && claim.amount < 0 && await this.isProposedTransaction(claim)) {
            return await this.processTheirPayment(claim);
        } else if (!isEmpty(claim.signatures[this.options.THEY]) && !isEmpty(claim.signatures[this.options.ME]) && claim.amount > 0 && await this.isProposedTransaction(claim)) {
            return await this.processMyCountersignedPayment(claim);
        }

        throw new LibException("Claim not accepted");
    }

    async createPayment(amount: number, type: ClaimTypeEnum): Promise<IClaimRequest> {
        const claim = {
            id: 1,
            nonce: 1,
            timestamp: Date.now(),
            messageForAlice: "",
            amount: amount,
            addresses: [this.userAddress, this.options.serverAddress],
            cumulativeDebits: [0, 0],
            signatures: new Array(2),
            type: type
        };

        claim.messageForAlice = this.buildMessageForAlice(amount);

        let lastBalance = 0;
        const lastClaim = await this.dao.getLastTransaction(this.userAddress);
        if (lastClaim !== undefined && !isEmpty(lastClaim)) {
            claim.nonce = lastClaim.nonce + 1;
            claim.id = lastClaim.id;
            lastBalance = lastClaim.cumulativeDebits[this.options.ME] - lastClaim.cumulativeDebits[this.options.THEY];
        }

        const balance = lastBalance + amount;
        if (balance > 0) {
            claim.cumulativeDebits[this.options.ME] = balance;
        } else {
            claim.cumulativeDebits[this.options.THEY] = -balance;
        }

        if (amount > 0) {
            claim.signatures[this.options.ME] = this.sign(claim);
        }

        await this.dao.saveProposedTransaction(claim);

        return claim;
    }

    private async calculateAmount(claim: IClaimRequest): Promise<number> {
        let amount = claim.cumulativeDebits[this.options.ME] - claim.cumulativeDebits[this.options.THEY];

        const lastClaim = await this.dao.getLastTransaction(claim.addresses[this.options.THEY]);

        if (lastClaim !== undefined && !isEmpty(lastClaim)) {
            amount -= lastClaim.cumulativeDebits[this.options.ME] + lastClaim.cumulativeDebits[this.options.THEY];
        }

        return amount;
    }

    private async processTheirPayment(claim: IClaimRequest): Promise<IClaimRequest> {
        if (await this.isValid(claim) && this.checkSignature(claim, this.options.THEY)) {
            claim.signatures[this.options.ME] = this.sign(claim);

            await this.dao.saveTransaction(claim);

            await this.dao.deleteProposedTransaction(claim.addresses[this.options.THEY]);

            return claim;
        }

        throw new LibException("Error during execution of their payment");
    }

    private async processMyCountersignedPayment(claim: IClaimRequest): Promise<undefined> {
        if (this.checkSignature(claim, this.options.ME) && this.checkSignature(claim, this.options.THEY)) {
            await this.dao.saveTransaction(claim);

            await this.dao.deleteProposedTransaction(claim.addresses[this.options.THEY]);

            return;
        }

        throw new LibException("Error during save transaction");
    }

    private checkSignature(claim: IClaimRequest, subject: number) {
        try {
            const recover = recoverTypedClaimSigner(this.buildTypedClaim(claim), claim.signatures[subject]);

            return toChecksumAddress(recover) === toChecksumAddress(claim.addresses[subject]);
        } catch (e) {
            throw new LibException("Error during checking signature");
        }
    }

    async isProposedTransaction(claim: IClaimRequest) {
        const sentClaim = await this._dao.getProposedTransaction(claim.addresses[this.options.THEY]);

        if (sentClaim === undefined || isEmpty(sentClaim)) {
            throw new LibException(`Cannot find proposed transaction for address: ${ claim.addresses[this.options.THEY] }`);
        }

        for (const k of ["id", "addresses", "cumulativeDebits", "nonce", "timestamp", "messageForAlice"]) {
            if (!isEqual(sentClaim[k], claim[k])) {
                throw new LibException(`Proposed claim mismatch: claim ${ k } doesn't match`);
            }
        }

        if (claim.signatures[this.options.ME] !== sentClaim.signatures[this.options.ME]) {
            throw new LibException(`Proposed claim mismatch: claim signatures doesn't match`);
        }

        return true;
    }

    private sign(claim: IClaimRequest): string {
        try {
            return signTypedClaim(this.buildTypedClaim(claim), this.options.serverPrivateKey);
        } catch (e) {
            throw new LibException("Error during recover typed signature");
        }
    }

    private buildTypedClaim(claim: IClaimRequest): ISignature {
        try {
            return buildTypedClaim(claim, {
                name: this.options.chainName,
                version: "1",
                chainId: this.options.chainId,
                verifyingContract: this.options.vaultContractAddress
            });
        } catch (e) {
            throw new LibException("Error during building typed claim");
        }
    }

    private async isValid(claim: IClaimRequest): Promise<boolean> {
        if (claim.addresses.some(v => !isEthereumAddress(v))) {
            throw new LibException(`Invalid claim address: ${ JSON.stringify(claim.addresses) }`);
        }

        if (claim.timestamp <= 0 || claim.timestamp > Date.now()) {
            throw new LibException(`Invalid claim timestamp: ${ claim.timestamp }`);
        }

        if (claim.cumulativeDebits.some((v) => v < 0) ||
            claim.cumulativeDebits.every((v) => v !== 0)) {
            throw new LibException(`Invalid claim cumulativeDebits: ${ JSON.stringify(claim.cumulativeDebits) }`);
        }

        if (this.buildMessageForAlice(claim.amount) !== claim.messageForAlice) {
            throw new LibException(`Invalid messageForAlice: ${ claim.messageForAlice }`);
        }

        const lastClaim = await this.dao.getLastTransaction(claim.addresses[this.options.THEY]);

        if (lastClaim !== undefined && !isEmpty(lastClaim)) {
            if (lastClaim.id !== claim.id) {
                throw new LibException(`Invalid claim id: ${ claim.id } - last claim id: ${ lastClaim.id }`);
            }

            if (lastClaim.nonce + 1 !== claim.nonce) {
                throw new LibException(`Invalid claim nonce: ${ claim.nonce } - last claim nonce: ${ lastClaim.nonce }`);
            }

            if (lastClaim.timestamp > claim.timestamp) {
                throw new LibException(`Invalid claim timestamp: ${ claim.timestamp } - last claim timestamp: ${ lastClaim.timestamp }`);
            }
        } else {
            if (claim.id !== 1) {
                throw new LibException(`Invalid claim id: ${ claim.id }`);
            }

            if (claim.nonce !== 1) {
                throw new LibException(`Invalid claim nonce: ${ claim.nonce }`);
            }
        }

        return true;
    }

    buildMessageForAlice(amount: number): string {
        return `You ${ amount > 0 ? "receive" : "spend" }: ${ Math.abs(amount) } DE.GA`;
    }
}
