import { Container } from "typedi";
import { isServer } from "./utils";

const environment = require("./configuration.json");

//Container.set("env", environment);

const ALICE: number = 0;
const BOB: number = 1;
const ME = isServer() ? BOB : ALICE;
const THEY = isServer() ? ALICE : BOB;

export { ALICE, BOB, ME, THEY, environment };

export type Environment = {
  chainId: number;
  chainName: string;
  rpcUrl: string;
  vaultContractAddress: string;
  tokenContractAddress: string;
  serverAddress: string;
  serverPrivateKey: string;
  serverUrl: string;
};

Container.set("env", {
  chainId: Number(process.env.CHAIN_ID),
  chainName: String(process.env.CHAIN_NAME),
  rpcUrl: String(process.env.RPC_URL),
  vaultContractAddress: String(process.env.CONTRACT_VAULT_ADDRESS),
  tokenContractAddress: String(process.env.CONTRACT_TOKEN_ADDRESS),
  serverAddress: String(process.env.SERVER_ADDRESS),
  serverPrivateKey: String(process.env.SERVER_PRIVATE_KEY),
  serverUrl: String(process.env.SERVER_URL)
});
