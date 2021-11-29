import "reflect-metadata";
import "core-js/stable";
import "regenerator-runtime/runtime";
import "dotenv/config";

import { Container } from "typedi";

import { ME, THEY, environment } from "./Environment";
import { AliceClaimDAO } from "./AliceClaimDAO";
import { NetworkInterface } from "./interfaces/NetworkInterface";
import { MetaMaskController } from "./MetaMaskController";
import { ClaimTransaction } from "./ClaimTransaction";
import { ClaimDAOInterface } from "./interfaces/ClaimDAOInterface";
import { isEmpty, extend } from "lodash";
import { SDKException } from "./exceptions/SDKException";
import { PaymentController } from "./PaymentController";
import Web3 from "web3";

/*
const VaultABI = require("../abi/Vault.json");
const VaultContract = new web3.eth.Contract(
    VaultABI,
    environment.vaultContractAddress
);*/

const SDK1 = {
    init: function (_config: any): Promise<PaymentController> {
        return new Promise((resolve, reject) => {
            let config = extend(
                {
                    serverAccount: environment.serverAddress,
                    account: null,
                    privateKey: null,
                    onTransactionRequestReceived: function (
                        amount: number,
                        address: string
                    ) {
                        return true;
                    },
                    onTransactionCompleted: function (
                        amount: number,
                        address: string,
                        claimTransaction: ClaimTransaction
                    ) {
                        console.log("Transaction completed: " + amount);
                    }
                },
                _config
            );

            Container.set("config", config);

            config.network.connect();

            resolve(new PaymentController(config));
        });
    }
};

function setup() {

}

export type SDKOptions = {
    chainId: number;
    chainName: string;
    rpcUrl: string;
    vaultContractAddress: string;
    tokenContractAddress: string;
    serverAddress: string;
    serverPrivateKey: string;
    serverUrl: string;
};

export function init() {
    /*
      return new Promise((resolve, reject) => {
          new MetaMaskController(environment)
              .initMetamask()
              .then((account: string) => {
                  SDK1.init({
                      account: account
                  }).then(() => {
                      resolve("Test");
                  });
              });
      });*/
}

export class SDK {
    private readonly _options: SDKOptions;

    constructor() {
        this._options = {
            chainId: Number(process.env.CHAIN_ID),
            chainName: String(process.env.CHAIN_NAME),
            rpcUrl: String(process.env.RPC_URL),
            vaultContractAddress: String(process.env.CONTRACT_VAULT_ADDRESS),
            tokenContractAddress: String(process.env.CONTRACT_TOKEN_ADDRESS),
            serverAddress: String(process.env.SERVER_ADDRESS),
            serverPrivateKey: String(process.env.SERVER_PRIVATE_KEY),
            serverUrl: String(process.env.SERVER_URL)
        };

        Container.set("SDKOptions", this._options);
    }

    init() {
        // Setup web3
        const web3 = new Web3(new Web3.providers.HttpProvider(this._options.rpcUrl));
        Container.set("provider.web3", web3);


    }
}
