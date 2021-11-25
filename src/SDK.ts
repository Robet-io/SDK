import {config} from "dotenv";


const _ = require("lodash");
const BN = require("bn.js");
const Web3 = require("web3");

const sigUtil = require("@metamask/eth-sig-util");



import { AliceClaimDAO } from "./AliceClaimDAO";
import { NetworkInterface } from "./NetworkInterface";
import { AliceNetwork } from "./AliceNetwork";
import { MetaMaskController } from "./MetaMaskController";
import {ALICE, BOB, ME, THEY, isServer, environment} from "./Environment"
import {ClaimTransaction} from "./ClaimTransaction"
import {Container} from "typedi";
import {ClaimDAOInterface} from "./ClaimDAOInterface";


let web3: any;
let claimDAO:ClaimDAOInterface;

if (isServer()) {
  web3 = new Web3(new Web3.providers.HttpProvider(environment.rpcUrlTestnet));
  claimDAO = new AliceClaimDAO();
} else {
  web3 = new Web3(Web3.givenProvider || environment.rpcUrlTestnet);
  claimDAO = new AliceClaimDAO();
}

Container.set("web3",web3);
Container.set("claimDAO",claimDAO);

const VaultABI = require("../abi/Vault.json");
const VaultContract = new web3.eth.Contract(
  VaultABI,
  environment.vaultContractAddress
);

//const RACTokenABI = require("../abi/RACToken.json")
//const RACTokenContract = new web3.eth.Contract(RACTokenABI, environment.racTokenContractAddress)


class PaymentController {
  constructor(protected config: any) {}
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
    let lastClaim = claimDAO.getLastTransaction(this.config.serverAccount);
    await VaultContract.methods
      .withdraw(lastClaim)
      .send({ from: this.config.account });
  }
  protected saveTransaction(newClaim: ClaimTransaction) {
    claimDAO.saveTransaction(newClaim,newClaim.addresses[THEY]);
    this.config.claimDAO.save(newClaim);
    this.config.onTransactionCompleted(
      newClaim.amount,
      newClaim.addresses[THEY],
      newClaim
    );
    claimDAO.deleteLastSentClaim(newClaim.addresses[THEY]);
  }

  protected sendClaim(claim: ClaimTransaction) {
    const message = claim.serialize();
    this.config.network.send(message);
    if (claim.signatures[ME] && !claim.signatures[THEY]) {
      claimDAO.saveSentClaim(claim,claim.addresses[THEY]);
    }
  }
}

const SDK = {
  init: async (_config: any): Promise<PaymentController> => {
    let config = _.extend(
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

    Container.set("config",config);

    console.log("ME ALICE", ME, ALICE);
    if (ME == ALICE) {
      config.account = await new MetaMaskController(web3,environment).initMetamask();
    }
    config.network.connect();

    return new PaymentController(config);
  }
};

export { SDK };

// module.exports = {SDK:SDK, ClaimTransaction:ClaimTransaction};
