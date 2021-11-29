import { Container } from "typedi";
import { isServer } from "./utils";

const environment = require("./configuration.json");

Container.set("env", environment);

const ALICE: number = 0;
const BOB: number = 1;
const ME = isServer() ? BOB : ALICE;
const THEY = isServer() ? ALICE : BOB;

export { ALICE, BOB, ME, THEY, environment };
