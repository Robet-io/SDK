const environment = require("./configuration.json");

const isServer = () => {
    return !(typeof window != "undefined" && window.document);
};

const ALICE: number = 0;
const BOB: number = 1;
const ME = isServer() ? BOB : ALICE;
const THEY = isServer() ? ALICE : BOB;

export {ALICE, BOB, ME, THEY, isServer, environment}