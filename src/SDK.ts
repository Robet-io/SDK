import "reflect-metadata";
import "core-js/stable";
import "regenerator-runtime/runtime";
import "dotenv/config";

import { AliceClaimDAO } from "./AliceClaimDAO";
import { MetaMaskController } from "./MetaMaskController";
import { AliceNetwork } from "./AliceNetwork";
import { Web3Provider } from "./Web3Provider";
import {ClaimTransaction, CommunicationController, env} from "./claim-library";


export class SDK {
    private communicationController: CommunicationController | undefined;

    constructor() {
        env.setUp({
            ME: 0,
            THEY: 1,
            chainId: Number(process.env.CHAIN_ID),
            chainName: String(process.env.CHAIN_NAME),
            rpcUrl: String(process.env.RPC_URL),
            vaultContractAddress: String(process.env.CONTRACT_VAULT_ADDRESS),
            tokenContractAddress: String(process.env.CONTRACT_TOKEN_ADDRESS),
            serverAddress: String(process.env.SERVER_ADDRESS),
            serverPrivateKey: "",
            serverUrl: String(process.env.SERVER_URL),
        });
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
            this.communicationController = new CommunicationController(
                {
                    account: account,
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
                new AliceNetwork(),
                AliceClaimDAO.getInstance(account),
                Web3Provider.getInstance()
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
