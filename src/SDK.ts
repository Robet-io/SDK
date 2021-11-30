import "reflect-metadata";
import "core-js/stable";
import "regenerator-runtime/runtime";
import "dotenv/config";

import { Container, Inject } from "typedi";

import { ME, THEY, Environment } from "./Environment";
import { AliceClaimDAO } from "./AliceClaimDAO";
import { NetworkInterface } from "./interfaces/NetworkInterface";
import { MetaMaskController } from "./MetaMaskController";
import { ClaimTransaction } from "./ClaimTransaction";
import { ClaimDAOInterface } from "./interfaces/ClaimDAOInterface";
import { isEmpty, extend } from "lodash";
import { SDKException } from "./exceptions/SDKException";
import { CommunicationController } from "./CommunicationController";
import Web3 from "web3";

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
  private readonly environment: Environment;

  constructor() {
    this.environment = Container.get("env");
    // Setup web3
    const web3 = new Web3(
      new Web3.providers.HttpProvider(this.environment.rpcUrl)
    );

    Container.set("provider.web3", web3);
  }

  init(): Promise<any> {
    return new Promise((resolve, reject) => {
      new MetaMaskController().initMetamask().then((account: string) => {
        this._init({}).then(() => {
          resolve("Test");
        });
      });
    });
  }

  _init(_config: any): Promise<CommunicationController> {
    return new Promise((resolve, reject) => {
      let config = extend(
        {
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
          }
        },
        _config
      );

      Container.set("config", config);

      config.network.connect();

      resolve(new CommunicationController(config));
    });
  }
}
