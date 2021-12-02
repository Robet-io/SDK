import Web3 from "web3";
import { env } from "@coingames/claim-library";

export class Web3Provider {
    private static _instance: Web3;

    static getInstance(): Web3 {
        if (typeof this._instance === "undefined") {
            this._instance = new Web3(Web3.givenProvider || env.get("rpcUrl"))
        }

        return this._instance;
    }
}
