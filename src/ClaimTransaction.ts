import { Container } from "typedi";

const BN = require("bn.js");
const sigUtil = require("@metamask/eth-sig-util");
import { ALICE, BOB, ME, THEY, isServer, environment } from "./Environment";
const _ = require("lodash");

import Web3 from "web3";
import { ClaimDAOInterface } from "./ClaimDAOInterface";

class ClaimTransaction {
  id: number = 0;
  addresses: Array<string> = [];
  cumulativeDebits: Array<number> = [0, 0];
  signatures: Array<string> = [];
  nonce: number = 1;
  timestamp: number = Date.now();
  amount: number = 0;
  messageForAlice: string = "";
  protected readonly config: any = Container.get("config");
  protected readonly web3: Web3 = Container.get("web3");
  protected readonly claimDAO: ClaimDAOInterface = Container.get("claimDAO");

  constructor() {}

  async createPayment(amount: number, theirAddress: string) {
    // vanilla init
    this.id = 1;
    this.addresses = [this.config.account, theirAddress];
    this.cumulativeDebits = [0, 0];
    this.signatures = [];
    this.nonce = 1;
    this.timestamp = Date.now();
    this.amount = amount;

    let amountToShow = Math.abs(this.amount);

    if (ME == ALICE) {
      if (amount > 0) {
        this.messageForAlice = "You pay: " + amountToShow + " RAC";
      } else {
        this.messageForAlice = "You receive: " + amountToShow + " RAC";
      }
    }
    if (ME == BOB) {
      if (amount > 0) {
        this.messageForAlice = "You receive: " + amountToShow + " RAC";
      } else {
        this.messageForAlice = "You pay: " + amountToShow + " RAC";
      }
    }

    let lastBalance = 0;
    let lastClaim = this.claimDAO.getLastTransaction(theirAddress);
    if (lastClaim) {
      this.nonce = lastClaim.nonce + 1;
      this.id = lastClaim.id;
      lastBalance =
        lastClaim.cumulativeDebits[ME] - lastClaim.cumulativeDebits[THEY];
    }

    const balance = lastBalance + amount;
    if (balance > 0) {
      this.cumulativeDebits[ME] = balance;
    } else {
      this.cumulativeDebits[BOB] = -balance;
    }

    if (amount > 0) {
      await this._sign(this.encode());
    }

    return this;
  }

  serialize() {
    return JSON.stringify(
      _.pick(this, [
        "id",
        "addresses",
        "messageForAlice",
        "cumulativeDebits",
        "nonce",
        "timestamp",
        "signatures"
      ])
    );
  }

  parse(body: any) {
    console.log("Parsing: %s", body);

    //if(typeof body === 'string')
    body = JSON.parse(body);
    console.log("Parsed: %s", body);
    this.id = body.id;
    this.addresses = body.addresses;
    this.messageForAlice = body.messageForAlice;
    this.cumulativeDebits = body.cumulativeDebits;
    this.nonce = body.nonce;
    this.timestamp = body.timestamp;
    this.signatures = body.signatures;

    let amount = this.cumulativeDebits[ME] - this.cumulativeDebits[THEY];
    const lastClaim = this.claimDAO.getLastTransaction(this.addresses[THEY]);
    if (lastClaim) {
      (amount = ALICE), BOB, ME, THEY, isServer, environment;
      amount -
        lastClaim.cumulativeDebits[ME] +
        lastClaim.cumulativeDebits[THEY];
    }
    this.amount = amount;

    console.log("Claim:", this);
    return this;
  }

  encode(): any {
    const EIP712Domain = [
      { name: "name", type: "string" },
      { name: "version", type: "string" },
      { name: "chainId", type: "uint256" },
      { name: "verifyingContract", type: "address" }
    ];

    const Claim = [
      { name: "id", type: "uint256" },
      { name: "alice", type: "address" },
      { name: "bob", type: "address" },
      { name: "nonce", type: "uint256" },
      { name: "timestamp", type: "uint256" },
      { name: "messageForAlice", type: "string" },
      { name: "cumulativeDebitAlice", type: "uint256" },
      { name: "cumulativeDebitBob", type: "uint256" }
    ];

    const name = "CoinGames Vault";
    const version = "1";
    const chainId = environment.chainId;

    const verifyingContract = environment.vaultContractAddress;

    return {
      types: {
        EIP712Domain,
        Claim
      },
      domain: { name, version, chainId, verifyingContract },
      primaryType: "Claim",
      message: {
        id: this.id,
        alice: this.addresses[ALICE],
        bob: this.addresses[BOB],
        nonce: this.nonce,
        timestamp: this.timestamp,
        messageForAlice: this.messageForAlice,
        cumulativeDebitAlice: new BN(this.cumulativeDebits[ALICE]).toString(10),
        cumulativeDebitBob: new BN(this.cumulativeDebits[BOB]).toString(10)
      }
    };
  }

  async checkSignature() {
    let encodedClaim = this.encode();
    console.log("Solidity Sha3: ", encodedClaim);

    const signValidity = this._checkSignature(encodedClaim);
    console.log("signValidity: ", signValidity);

    return signValidity;
  }

  check() {
    if (
      this.id < 0 ||
      this.nonce < 1 ||
      this.timestamp < 0 ||
      this.cumulativeDebits[ALICE] < 0 ||
      this.cumulativeDebits[BOB] < 0
    )
      throw "Claim not valid.";

    if (this.cumulativeDebits[ME] != 0 && this.cumulativeDebits[THEY] != 0) {
      throw "Claim not balanced.";
    }

    let amount = Math.abs(this.amount);

    if (ME == ALICE) {
      if (this.amount > 0) {
        if (this.messageForAlice !== "You pay: " + amount + " RAC") {
          throw "Message not valid";
        }
      } else {
        if (this.messageForAlice !== "You receive: " + amount + " RAC") {
          throw "Message not valid";
        }
      }
    }
    if (ME == BOB) {
      if (this.amount > 0) {
        if (this.messageForAlice !== "You receive: " + amount + " RAC") {
          throw "Message not valid";
        }
      } else {
        if (this.messageForAlice !== "You pay: " + amount + " RAC") {
          throw "Message not valid";
        }
      }
    }

    let lastClaim = this.claimDAO.getLastTransaction(this.addresses[THEY]);

    if (lastClaim) {
      if (
        lastClaim.nonce + 1 != this.nonce ||
        lastClaim.timestamp > this.timestamp
      )
        throw "Claim not sequent.";
      if (this.id != lastClaim.id) {
        throw "payment channel not valid";
      }
    } else {
      if (this.id != 1 || this.nonce != 1) {
        throw "id or nonce are invalid";
      }
    }
  }

  async checkAndSign() {
    this.check();

    if (this.amount < 0) {
      throw "Claim with amount inconsistent with sending policies.";
    }

    const encodedClaim = this.encode();
    console.log("Solidity Sha3: " + encodedClaim);

    // Counter sign
    await this._sign(encodedClaim);

    return this;
  }

  async checkAndCountersign() {
    this.check();

    if (this.amount > 0) {
      throw "Claim with amount inconsistent with sending policies.";
    }

    const encodedClaim = this.encode();
    console.log("Solidity Sha3: " + encodedClaim);

    const signValidity = this._checkSignature(encodedClaim);
    console.log("signValidity: " + signValidity);

    // Counter sign
    await this._sign(encodedClaim);

    return this;
  }

  async _sign(encodedClaim: any) {
    if (ME == ALICE) {
      // @ts-ignore
      this.signatures[ME] = await web3.currentProvider?.request({
        method: "eth_signTypedData_v4",
        params: [this.config.account, JSON.stringify(encodedClaim)],
        from: this.config.account
      });
    } else if (ME == BOB) {
      const privKey: any = Buffer.from(this.config.privateKey, "hex");

      this.signatures[ME] = sigUtil.signTypedData({
        privateKey: privKey,
        data: encodedClaim,
        version: "V4"
      });
    }
  }

  _checkSignature(encodedClaim: any) {
    const recovered = sigUtil.recoverTypedSignature({
      data: encodedClaim,
      signature: this.signatures[THEY],
      version: "V4"
    });

    console.log("_checkSignature", encodedClaim, recovered);

    let ret =
      this.web3.utils.toChecksumAddress(recovered) ===
      this.web3.utils.toChecksumAddress(this.addresses[THEY]);
    if (!ret) throw "Signature not valid.";
    return ret;
  }

  isSentClaim() {
    const sentClaim = this.claimDAO.getLastSentClaim(this.addresses[THEY]);
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
      _.isEqual(
        _.pick(this, relevantFields),
        _.pick(sentClaim, relevantFields)
      ) &&
      sentClaim.signatures[ME] == this.signatures[ME]
    );
  }
}

export { ClaimTransaction };
