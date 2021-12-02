import "reflect-metadata";
import "core-js/stable";
import "regenerator-runtime/runtime";
import "dotenv/config";

import { Container, Inject } from "typedi";

import { AliceClaimDAO } from "./AliceClaimDAO";
import { MetaMaskController } from "./MetaMaskController";
import { extend } from "lodash";
import Web3 from "web3";
import { AliceNetwork } from "./AliceNetwork";
import {
  ClaimTransaction,
  CommunicationController,
  Environment
} from "@coingames/claim-library";

export class SDK {
  private readonly environment: Environment;
  private communicationController: CommunicationController | undefined;

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
        this.connectToServer(account).then(() => {
          resolve("Test");
        });
      });
    });
  }

  protected connectToServer(account: string): Promise<void> {
    return new Promise((resolve, reject) => {
      Container.set("claimDAO", new AliceClaimDAO(account));

      this.communicationController = new CommunicationController(
        {
          account: account,
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
        new AliceNetwork()
      );

      resolve();
    });
  }

  pay(amount: number): Promise<void> {
    return (this.communicationController as CommunicationController).pay(
      amount
    );
  }
}
