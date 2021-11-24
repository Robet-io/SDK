const isServer = () => {
  return !(typeof window != "undefined" && window.document);
};

const _ = require("lodash");
const BN = require("bn.js");
const Web3 = require("web3");

const sigUtil = require("@metamask/eth-sig-util");

const environment = require("./configuration.json");

let web3: any;

if (isServer()) {
  web3 = new Web3(new Web3.providers.HttpProvider(environment.rpcUrlTestnet));
} else {
  web3 = new Web3(Web3.givenProvider || environment.rpcUrlTestnet);
}

const VaultABI = require("../abi/Vault.json");
const VaultContract = new web3.eth.Contract(
  VaultABI,
  environment.vaultContractAddress
);

//const RACTokenABI = require("../abi/RACToken.json")
//const RACTokenContract = new web3.eth.Contract(RACTokenABI, environment.racTokenContractAddress)

class MetaMaskInitializer {
  account: string | undefined;
  networkId: number | undefined;
  resolve: ((account: string | undefined) => void) | undefined;
  ethereum: any;

  constructor() {
    // @ts-ignore
    this.ethereum = window.ethereum;
  }

  async onNetwork() {
    web3.eth.net
      .getId()
      .then((_networkId: number) => {
        this.networkId = _networkId;
        console.log("Network id: " + this.networkId);
        if (this.networkId != environment.chainId) {
          return this.switchChain();
        } else {
          console.log("getBalance for account: " + this.account);
          web3.eth.getBalance(this.account).then((balance: number) => {
            console.log("Balance: " + balance);
          });
          console.log("_ " + (typeof _ !== "undefined"));
          if (this.resolve) this.resolve(this.account);
        }
      })
      .then(() => {});
  }

  async switchChain() {
    try {
      await this.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: environment.chainIdHex }]
      });
    } catch (switchError) {
      // This error code indicates that the chain has not been added to MetaMask.
      if ((switchError as { code: number }).code === 4902) {
        try {
          await this.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: environment.chainIdHex,
                rpcUrls: [environment.rpcUrlTestnet],
                chainName: environment.chainName
              }
            ]
          });
        } catch (addError) {
          // handle "add" error
        }
      }
      // handle other "switch" errors
    }
  }

  initMetamask(): Promise<void> {
    return new Promise((resolve, reject) => {
      console.log("init");

      if (typeof this.ethereum !== "undefined") {
        console.log("MetaMask is installed!");
        console.log("Network: " + this.ethereum.networkVersion);
        console.log("Address: " + this.ethereum.selectedAddress);
        this.ethereum
          .request({ method: "eth_requestAccounts" })
          .then((accounts: Array<string>) => {
            this.account = accounts[0];
            console.log("Accounts: " + accounts[0]);

            this.onNetwork();
          });
        this.ethereum.on("accountsChanged", (accounts: Array<string>) => {
          // Time to reload your interface with accounts[0]!
          this.account = accounts[0];
          console.log("Accounts changed: " + accounts[0]);

          this.onNetwork();
        });
        this.ethereum.on("chainChanged", (chain: number) => {
          return this.switchChain();
        });
      }
    });
  }
}

const ALICE: number = 0;
const BOB: number = 1;
const ME = isServer() ? BOB : ALICE;
const THEY = isServer() ? ALICE : BOB;

let config: any = {};
const pastClaims: { [address: string]: ClaimTransaction } = {};
const sentClaims: { [address: string]: ClaimTransaction } = {};

class ClaimTransaction {
  id: number = 0;
  addresses: Array<string> = [];
  cumulativeDebits: Array<number> = [0, 0];
  signatures: Array<string> = [];
  nonce: number = 1;
  timestamp: number = Date.now();
  amount: number = 0;
  messageForAlice: string = "";

  constructor() {}

  async createPayment(amount: number, theirAddress: string) {
    // vanilla init
    this.id = 1;
    this.addresses = [config.account, theirAddress];
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
    let lastClaim = pastClaims[theirAddress];
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
    const lastClaim = pastClaims[this.addresses[THEY]];
    if (lastClaim) {
      amount =
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

    let lastClaim = pastClaims[this.addresses[THEY]];

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
      this.signatures[ME] = await web3.currentProvider.request({
        method: "eth_signTypedData_v4",
        params: [config.account, JSON.stringify(encodedClaim)],
        from: config.account
      });
    } else if (ME == BOB) {
      const privKey: any = Buffer.from(config.privateKey, "hex");

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
      web3.utils.toChecksumAddress(recovered) ===
      web3.utils.toChecksumAddress(this.addresses[THEY]);
    if (!ret) throw "Signature not valid.";
    return ret;
  }

  isSentClaim() {
    const sentClaim = sentClaims[this.addresses[THEY]];
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

interface NetworkInterface {
  connect(): void;

  send(message: string): void;
}

class AliceNetwork implements NetworkInterface {
  socket: WebSocket | undefined;

  connect() {
    // Create WebSocket connection.
    this.socket = new WebSocket("ws://localhost:8666");
    // Connection opened
    this.socket.addEventListener("open", event => {
      console.log("Connection established!");
    });

    // Listen for messages
    this.socket.addEventListener("message", async event => {
      console.log("Message from server ", event.data);
      SDK.onMessageReceived(event.data);
    });
  }

  send(message: string) {
    this.socket?.send(message);
  }
}

interface ClaimDAOInterface {
  loadLastTransaction(address: string): ClaimTransaction;

  saveTransaction(claim: ClaimTransaction, address: string): void;
}

class AliceClaimDAO {
  load() {
    return window.localStorage.getItem("wallet-last-claim");
  }

  save(claim: ClaimTransaction) {
    window.localStorage.setItem("wallet-last-claim", claim.serialize());
    console.log(claim.serialize());
  }
}

function saveTransaction(newClaim: ClaimTransaction) {
  pastClaims[newClaim.addresses[THEY]] = newClaim;
  config.claimDAO.save(newClaim);
  config.onTransactionCompleted(
    newClaim.amount,
    newClaim.addresses[THEY],
    newClaim
  );
  delete sentClaims[newClaim.addresses[THEY]];
}

function sendClaim(claim: ClaimTransaction) {
  const message = claim.serialize();
  config.network.send(message);
  if (claim.signatures[ME] && !claim.signatures[THEY]) {
    sentClaims[claim.addresses[THEY]] = claim;
  }
}

async function onMessageReceived(message: string) {
  const newClaim = new ClaimTransaction().parse(message);

  if (
    newClaim.signatures[THEY] &&
    !newClaim.signatures[ME] &&
    newClaim.amount < 0
  ) {
    // pagamento suo
    await newClaim.checkAndCountersign();
    saveTransaction(newClaim);
    sendClaim(newClaim);
  } else if (
    newClaim.signatures[THEY] &&
    newClaim.signatures[ME] &&
    newClaim.amount > 0 &&
    newClaim.isSentClaim()
  ) {
    // controfirma ad un mio pagamento
    if (await newClaim.checkSignature()) {
      saveTransaction(newClaim);
    }
  } else if (
    !newClaim.signatures[THEY] &&
    !newClaim.signatures[ME] &&
    newClaim.amount > 0
  ) {
    // proposta di pagamento da parte mia
    if (
      !config.onTransactionRequestReceived(
        newClaim.amount,
        newClaim.addresses[THEY]
      )
    ) {
      throw "Transaction refused.";
    }
    await newClaim.checkAndSign();
    sendClaim(newClaim);
  }
}

// The code defines all the functions,
// variables or object to expose as:
const SDK = {
  init: async (_config: any) => {
    config = _.extend(
      {
        serverAccount: environment.serverAddress,
        account: null,
        privateKey: null,
        onTransactionRequestReceived: function(
          amount: number,
          address: string
        ) {
          return true;
        },
        onTransactionCompleted: function(
          amount: number,
          address: string,
          claimTransaction: ClaimTransaction
        ) {
          console.log("Transaction completed: " + amount);
        },
        network: new AliceNetwork(),
        claimDAO: new AliceClaimDAO()
      },
      _config
    );

    console.log("ME ALICE", ME, ALICE);
    if (ME == ALICE) {
      config.account = await new MetaMaskInitializer().initMetamask();
    }
    config.network.connect();
    const lastClaim = config.claimDAO.load();
    if (lastClaim) {
      const claimTransaction = new ClaimTransaction().parse(lastClaim);
      pastClaims[claimTransaction.addresses[THEY]] = claimTransaction;
      console.log("last claim recovered: " + lastClaim);
    }
  },
  pay: async (amount: number) => {
    let newClaim = new ClaimTransaction();
    await newClaim.createPayment(amount, config.serverAccount);
    sendClaim(newClaim);
  },
  onMessageReceived: onMessageReceived,
  withdraw: async () => {
    let lastClaim = pastClaims[config.serverAccount];
    await VaultContract.methods
      .withdraw(lastClaim)
      .send({ from: config.account });
  }
};

export { SDK, ClaimTransaction };

// module.exports = {SDK:SDK, ClaimTransaction:ClaimTransaction};
