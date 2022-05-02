import { recoverTypedSignature, SignTypedDataVersion } from "@metamask/eth-sig-util";
import BigNumber from "bignumber.js";
import Web3 from "web3";
const addEventListener = (cb) => {
  document.addEventListener(cryptoEvent, cb);
};
const emitEvent = (type, msg) => {
  const event = new CustomEvent(cryptoEvent, { detail: { type, msg } });
  document.dispatchEvent(event);
};
const emitErrorEvent = (type, msg) => {
  const event = new CustomEvent(cryptoEvent, { detail: { type, msg, error: true } });
  document.dispatchEvent(event);
};
const eventType = {
  network: "network",
  accountsChanged: "accountsChanged",
  chainChanged: "chainChanged",
  message: "message",
  address: "address",
  wrongNetworkOnGetAddress: "wrongNetworkOnGetAddress",
  metamaskNotInstalled: "metamaskNotInstalled",
  general: "general",
  claimNotSigned: "claimNotSigned",
  claimSigned: "claimSigned",
  claimConfirmed: "claimConfirmed",
  claimNotConfirmed: "claimNotConfirmed",
  winClaimSigned: "winClaimSigned",
  winNotConfirmed: "winNotConfirmed",
  challengeSigned: "challengeSigned",
  challengeNotSigned: "challengeNotSigned",
  claimSynced: "claimSynced",
  claimNotSynced: "claimNotSynced",
  token: "jwtToken",
  withdraw: "withdraw",
  withdrawReceipt: "withdrawReceipt",
  withdrawHash: "withdrawHash",
  depositDega: "depositDega",
  withdrawDega: "withdrawDega",
  approveDega: "approveDega",
  serverEvent: "serverEvent"
};
const cryptoEvent = "cryptoSDK";
const CSDK_CHAIN_ID$1 = "97";
const CSDK_CHAIN_NAME$1 = "BSC Testnet";
const CSDK_RPC_URL = "https://data-seed-prebsc-1-s1.binance.org";
const CSDK_CHAIN_EXPLORER = "https://testnet.bscscan.com/";
const CSDK_CURRENCY_NAME = "BNB";
const CSDK_CURRENCY_SYMBOL = "BNB";
const CSDK_CURRENCY_DECIMALS = "18";
const checkRightNetwork = async () => {
  const rightNet = getValidNetworks();
  const web3Provider = getWeb3Provider();
  if (web3Provider) {
    const networkID = Number(await web3Provider.request({ method: "eth_chainId" }));
    if (Array.isArray(rightNet)) {
      if (!rightNet.includes(networkID)) {
        const msg = "Please change your network on Metamask. Valid networks are: " + networksNames(rightNet);
        throw new Error(msg);
      } else {
        return true;
      }
    } else {
      if (Number(networkID) !== Number(rightNet)) {
        const msg = `Please set your network on Metamask to ${networksNames(rightNet)}`;
        throw new Error(msg);
      } else {
        return true;
      }
    }
  }
};
const networksNames = (netId = false) => {
  const names = [];
  names[1] = "Ethereum Mainnet";
  names[3] = "Ethereum Ropsten";
  names[42] = "Ethereum Kovan";
  names[4] = "Ethereum Rinkeby";
  names[5] = "Ethereum Goerli";
  names[56] = "Binance Smart Chain";
  names[97] = "Binance Smart Chain Testnet";
  if (netId) {
    if (Array.isArray(netId)) {
      const validNames = [];
      for (let i = 0; i < netId.length; i++) {
        validNames.push(names[netId[i]]);
      }
      return validNames;
    } else if (names[netId]) {
      return names[netId];
    } else {
      console.error(`Network ID ${netId} Not found in the networksNames list`);
      return networksNames(CSDK_CHAIN_ID$1);
    }
  } else {
    return names;
  }
};
const getValidNetworks = () => {
  return [Number(CSDK_CHAIN_ID$1)];
};
const isRightNet = async () => {
  try {
    const result = await checkRightNetwork();
    emitEvent(eventType.network, result);
    return result;
  } catch (error) {
    emitErrorEvent(eventType.network, error);
    return false;
  }
};
const setRightNet = async () => {
  if (window.ethereum) {
    const ethereum = window.ethereum;
    const chainIdHex = `0x${Number(CSDK_CHAIN_ID$1).toString(16)}`;
    const data = [{
      chainId: chainIdHex,
      chainName: CSDK_CHAIN_NAME$1,
      nativeCurrency: {
        name: CSDK_CURRENCY_NAME,
        symbol: CSDK_CURRENCY_SYMBOL,
        decimals: CSDK_CURRENCY_DECIMALS
      },
      rpcUrls: [CSDK_RPC_URL],
      blockExplorerUrls: [CSDK_CHAIN_EXPLORER]
    }];
    try {
      await ethereum.request({ method: "wallet_addEthereumChain", params: data });
      const isRightNetResult = await checkRightNetwork();
      if (isRightNetResult) {
        emitEvent(eventType.network, "Success, network is set to the right one");
      } else {
        emitErrorEvent(eventType.network, "Add net error: network is not changed");
      }
    } catch (error) {
      emitErrorEvent(eventType.network, `Add net error: ${error}`);
    }
  } else if (window.web3) {
    emitErrorEvent(eventType.network, "This version of Metamask supports only manual network switching");
    throw new Error("This version of Metamask supports only manual network switching");
  } else {
    emitErrorEvent(eventType.network, "Metamask is not installed");
    throw new Error("Metamask is not installed");
  }
};
const getWeb3Provider = () => {
  if (window.ethereum) {
    return window.ethereum;
  } else if (window.web3) {
    return window.web3.currentProvider;
  } else {
    emitErrorEvent(eventType.metamaskNotInstalled, { error: "Metamask is not installed" });
    throw new Error("Metamask is not installed");
  }
};
const _handleChainChanged = async (chainId) => {
  try {
    const checkIsRightNet = await isRightNet();
    if (checkIsRightNet) {
      emitEvent(eventType.chainChanged, { chainId });
    } else {
      emitErrorEvent(eventType.chainChanged, { chainId });
    }
  } catch {
    emitErrorEvent(eventType.chainChanged, { chainId });
  }
};
const _initMetamask = () => {
  if (window.ethereum) {
    if (!window.ethereum.chainId) {
      window.ethereum.chainId = "97";
    }
    window.ethereum.on("accountsChanged", async (accounts) => {
      console.log("#### - Metamask: accountsChanged - accounts", accounts);
      emitEvent(eventType.accountsChanged, { accounts });
    });
    window.ethereum.on("chainChanged", async (chainId) => {
      console.log("#### - Metamask: chainChanged", chainId);
      await _handleChainChanged(chainId);
    });
    window.ethereum.on("error", async (error) => {
      console.log("#### - Metamask: error", error);
      emitErrorEvent(eventType.error, error);
    });
  } else if (window.web3) {
    window.web3.currentProvider.on("accountsChanged", async (accounts) => {
      console.log("#### - Metamask web3: accountsChanged - accounts", accounts);
      emitEvent(eventType.accountsChanged, { accounts });
    });
    window.web3.currentProvider.on("chainIdChanged", async (chainId) => {
      console.log("#### - Metamask web3: chainChanged", chainId);
      await _handleChainChanged(chainId);
    });
    window.web3.currentProvider.on("error", async (error) => {
      console.log("#### - Metamask web3: error", error);
      emitErrorEvent(eventType.error, error);
    });
  }
};
const _getAccount = async () => {
  if (window.ethereum) {
    const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
    if (accounts && accounts[0]) {
      return accounts[0];
    } else {
      throw new Error("Can't get address");
    }
  } else if (window.web3) {
    const accounts = window.web3.eth.accounts;
    if (accounts && accounts.length > 0) {
      return accounts[0];
    } else {
      throw new Error("Can't get address");
    }
  } else {
    throw new Error("Metamask is not installed");
  }
};
const isMetamaskInstalled = () => {
  if (window.ethereum || window.web3) {
    return true;
  } else {
    return false;
  }
};
const getAddress = async () => {
  if (!isMetamaskInstalled()) {
    const errorMessage = "Metamask is not installed, unable to get user address";
    emitErrorEvent(eventType.metamaskNotInstalled, errorMessage);
    throw new Error(errorMessage);
  }
  const netId = getValidNetworks();
  try {
    await checkRightNetwork(netId);
  } catch (error) {
    emitErrorEvent(eventType.wrongNetworkOnGetAddress, error);
    throw new Error(error);
  }
  try {
    const address = await _getAccount();
    return { address };
  } catch (error) {
    emitErrorEvent(eventType.address, error);
    throw new Error(error);
  }
};
const signTypedData = async (msg, from) => {
  await checkRightNetwork();
  const web3Provider = getWeb3Provider();
  const response = await web3Provider.request({
    method: "eth_signTypedData_v4",
    params: [from, JSON.stringify(msg)],
    from
  });
  return response;
};
_initMetamask();
const CSDK_CHAIN_ID = "97";
const CSDK_CHAIN_NAME = "BSC Testnet";
const CSDK_CONTRACT_VAULT_ADDRESS = "0x9b9a5C1Af0A543d7dd243Bea6BDD53458dd0F067";
const domain = {
  name: CSDK_CHAIN_NAME,
  version: "1",
  chainId: CSDK_CHAIN_ID,
  verifyingContract: CSDK_CONTRACT_VAULT_ADDRESS
};
const _buildTypedSignin = (challenge) => {
  const message = {
    method: "signin",
    text: challenge
  };
  return {
    types: {
      EIP712Domain: [
        { name: "name", type: "string" },
        { name: "version", type: "string" },
        { name: "chainId", type: "uint256" },
        { name: "verifyingContract", type: "address" }
      ],
      Signin: [
        { name: "method", type: "string" },
        { name: "text", type: "string" }
      ]
    },
    domain,
    primaryType: "Signin",
    message
  };
};
const signChallenge = async (challenge, address) => {
  const msg = _buildTypedSignin(challenge);
  try {
    const response = await signTypedData(msg, address);
    emitEvent(eventType.challengeSigned, { signature: response });
    return response;
  } catch (error) {
    emitErrorEvent(eventType.challengeNotSigned, error);
    throw error;
  }
};
const authToken = "authToken";
const expireToken = "expireToken";
const expirationPeriod = 12e5;
const setToken = (token2) => {
  try {
    localStorage.setItem(authToken, token2);
    localStorage.setItem(expireToken, Date.now() + expirationPeriod);
    emitEvent(eventType.token, "JWT token received");
  } catch (error) {
    emitErrorEvent(eventType.token, error);
  }
};
const getToken = () => {
  return localStorage.getItem(authToken);
};
const isLogged = () => {
  const token2 = getToken();
  if (token2) {
    const expirationTime = localStorage.getItem(expireToken);
    if (expirationTime && expirationTime > Date.now()) {
      return true;
    }
  }
  return false;
};
var token = {
  signChallenge,
  setToken,
  getToken,
  isLogged
};
const savedClameType = {
  claimConfirmed: "claimConfirmed",
  claimAlice: "claimAlice"
};
const saveConfirmedClaim = (claim) => {
  localStorage.setItem(savedClameType.claimConfirmed, JSON.stringify(claim));
};
const getConfirmedClaim = () => {
  return JSON.parse(localStorage.getItem(savedClameType.claimConfirmed));
};
const saveClaimAlice = (claim) => {
  localStorage.setItem(savedClameType.claimAlice, JSON.stringify(claim));
};
const getClaimAlice = () => {
  return JSON.parse(localStorage.getItem(savedClameType.claimAlice));
};
const downloadLastClaim = () => {
  const lastClaim2 = localStorage.getItem(savedClameType.claimConfirmed);
  if (!lastClaim2) {
    return;
  }
  const text = _prepareJsonContent(lastClaim2);
  const element = document.createElement("a");
  const filename = `lastConfirmedClaim-${new Date().toISOString()}.json`;
  element.setAttribute("href", "data:application/json;charset=utf-8," + encodeURIComponent(text));
  element.setAttribute("download", filename);
  element.style.display = "none";
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
};
const _prepareJsonContent = (jsonString) => {
  jsonString = jsonString.replace("{", "{\n");
  jsonString = jsonString.replace("}", "\n}");
  jsonString = jsonString.replaceAll(",", ",\n");
  return jsonString;
};
var claimStorage = {
  saveConfirmedClaim,
  getConfirmedClaim,
  saveClaimAlice,
  getClaimAlice,
  downloadLastClaim
};
const toFixed = (value, decimal = 2) => {
  const aBN = new BigNumber(value + "");
  return aBN.toFixed(decimal);
};
const minus = (a, b) => {
  const aBN = new BigNumber(a + "");
  const bBN = new BigNumber(b + "");
  return aBN.minus(bBN).toFixed();
};
const plus = (a, b) => {
  const aBN = new BigNumber(a + "");
  const bBN = new BigNumber(b + "");
  return aBN.plus(bBN).toFixed();
};
const roundDecimals = (a, decimals = 2) => {
  const aBN = new BigNumber(a + "");
  return aBN.toFixed(decimals);
};
const roundUpToTen = (a) => {
  if (a === "0" || a === 0) {
    return "10";
  } else if (lt(a, 1)) {
    const a2 = a.replace("0.", "");
    const l = a2.length;
    console.log("l", l);
    const p = pow(10, l);
    console.log({ p });
    const b = times(a, p);
    console.log({ b });
    const c = roundUpToTen(b);
    console.log({ c });
    const d = div(c, p);
    console.log({ d });
    return d;
  } else {
    const b = times(div(a, 10, 0, BigNumber.ROUND_UP), 10);
    return b === a + "" ? roundUpToTen(plus(a, 1)) : b;
  }
};
const times = (a, b, decimals = 18, type = BigNumber.ROUND_FLOOR) => {
  let aBN = new BigNumber(a + "");
  const bBN = new BigNumber(b + "");
  aBN = aBN.times(bBN).toFixed();
  decimals = parseInt(decimals);
  return dp(aBN, decimals, type);
};
const timesFloor = (a, b, decimals = 18) => {
  return times(a, b, decimals);
};
const div = (a, b, decimals = 18, type = BigNumber.ROUND_FLOOR) => {
  let aBN = new BigNumber(a + "");
  const bBN = new BigNumber(b + "");
  aBN = aBN.div(bBN).toFixed();
  decimals = parseInt(decimals);
  return dp(aBN, decimals, type);
};
const divFloor = (a, b, decimals = 18) => {
  return div(a, b, decimals);
};
const pow = (a, b) => {
  const aBN = new BigNumber(a + "");
  const bBN = new BigNumber(b + "");
  return aBN.pow(bBN);
};
const eq = (a, b) => {
  const aBN = new BigNumber(a + "");
  const bBN = new BigNumber(b + "");
  return aBN.eq(bBN);
};
const lt = (a, b) => {
  const aBN = new BigNumber(a + "");
  const bBN = new BigNumber(b + "");
  return aBN.lt(bBN);
};
const gt = (a, b) => {
  const aBN = new BigNumber(a + "");
  const bBN = new BigNumber(b + "");
  return aBN.gt(bBN);
};
const lte = (a, b) => {
  const aBN = new BigNumber(a + "");
  const bBN = new BigNumber(b + "");
  return aBN.lte(bBN);
};
const gte = (a, b) => {
  const aBN = new BigNumber(a + "");
  const bBN = new BigNumber(b + "");
  return aBN.gte(bBN);
};
const isNaN = (a) => {
  const aBN = new BigNumber(a + "");
  return aBN.isNaN();
};
const dp = (a, n, type) => {
  const aBN = new BigNumber(a + "");
  return aBN.dp(parseInt(n), type).toFixed();
};
const negated = (a) => {
  const aBN = new BigNumber(a + "");
  return aBN.negated().toFixed();
};
const abs = (a) => {
  const aBN = new BigNumber(a + "");
  return aBN.abs().toFixed();
};
var bnUtils = {
  minus,
  plus,
  times,
  div,
  pow,
  eq,
  lt,
  gt,
  lte,
  gte,
  isNaN,
  dp,
  negated,
  timesFloor,
  divFloor,
  toFixed,
  roundUpToTen,
  roundDecimals,
  abs
};
const ALICE = 0;
const BOB = 1;
const formatNumber = (number, reduceDecimalTo = 18) => {
  if (!number)
    return;
  const web3 = new Web3();
  const x = web3.utils.fromWei(number);
  const a = x.split(".");
  const integer = a[0].toString().replace(/\b0+(?!$)/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  if (a[1]) {
    if (reduceDecimalTo) {
      const decimals = a[1].substring(0, reduceDecimalTo).replace(/0+$/, "");
      return integer + `${decimals ? "." + decimals : ""}`;
    } else {
      return integer + "." + a[1];
    }
  } else {
    return integer;
  }
};
const CSDK_SERVER_ADDRESS = "0xeA085D9698651e76750F07d0dE0464476187b3ca";
const isValidNewClaim = (claim) => {
  const lastClaim2 = claimStorage.getConfirmedClaim();
  if (lastClaim2) {
    const wasWithdraw = lastClaim2.closed === 1;
    const id = wasWithdraw ? lastClaim2.id + 1 : lastClaim2.id;
    const nonce = wasWithdraw ? 1 : lastClaim2.nonce + 1;
    if (id !== claim.id) {
      throw new Error(`Invalid claim id: ${claim.id} - last claim id: ${lastClaim2.id}${wasWithdraw ? ". id must change after withdraw" : ""}`);
    }
    if (nonce !== claim.nonce) {
      throw new Error(`Invalid claim nonce: ${claim.nonce} ${wasWithdraw ? " - channel id is changed" : `- last claim nonce: ${lastClaim2.nonce}`}`);
    }
    if (claim.addresses[BOB] !== CSDK_SERVER_ADDRESS) {
      throw new Error(`Invalid address of Server: ${claim.addresses[BOB]} - expected: ${CSDK_SERVER_ADDRESS}`);
    }
    const balance = wasWithdraw ? claim.amount : bnUtils.plus(bnUtils.minus(lastClaim2.cumulativeDebits[BOB], lastClaim2.cumulativeDebits[ALICE]), claim.amount);
    _controlDebits(balance, claim.cumulativeDebits);
  } else {
    if (claim.id !== 1) {
      throw new Error(`Invalid claim id: ${claim.id}`);
    }
    if (claim.nonce !== 1) {
      throw new Error(`Invalid claim nonce: ${claim.nonce}`);
    }
    if (claim.addresses[BOB] !== CSDK_SERVER_ADDRESS) {
      throw new Error(`Invalid address of Server: ${claim.addresses[BOB]} - expected: ${CSDK_SERVER_ADDRESS}`);
    }
    const balance = claim.amount;
    _controlDebits(balance, claim.cumulativeDebits);
  }
  _controlMesssage(claim);
  return true;
};
const _controlMesssage = (claim) => {
  if (claim.closed === 0) {
    const messageForAlice = `You ${bnUtils.gt(claim.amount, "0") ? "receive" : "spend"}: ${formatNumber(bnUtils.abs(claim.amount))} DE.GA`;
    if (claim.messageForAlice !== messageForAlice) {
      throw new Error(`Invalid message for Alice: ${claim.messageForAlice} - expected: ${messageForAlice}`);
    }
  }
};
const _controlDebits = (balance, cumulativeDebits) => {
  if (bnUtils.gt(balance, 0)) {
    if (!bnUtils.eq(cumulativeDebits[ALICE], 0)) {
      throw new Error(`Invalid claim cumulative debit of Client: ${cumulativeDebits[ALICE]} - expected: 0`);
    }
    if (!bnUtils.eq(cumulativeDebits[BOB], balance)) {
      throw new Error(`Invalid claim cumulative debit of Server: ${cumulativeDebits[BOB]} - expected: ${balance}`);
    }
  } else {
    if (!bnUtils.eq(cumulativeDebits[ALICE], bnUtils.negated(balance))) {
      throw new Error(`Invalid claim cumulative debit of Client: ${cumulativeDebits[ALICE]} - expected: ${-balance}`);
    }
    if (!bnUtils.eq(cumulativeDebits[BOB], 0)) {
      throw new Error(`Invalid claim cumulative debit of Server: ${cumulativeDebits[BOB]} - expected: 0`);
    }
  }
};
const isValidClaimAlice = (claim) => {
  let isValid = isValidNewClaim(claim);
  if (isValid) {
    const savedClaim = claimStorage.getClaimAlice();
    if (savedClaim) {
      isValid = areEqualClaims(claim, savedClaim);
    }
  }
  return isValid;
};
const areEqualClaims = (claim, savedClaim, isWithdraw = false) => {
  if (savedClaim.id !== claim.id) {
    throw new Error(`Invalid claim id: ${claim.id} - saved claim id: ${savedClaim.id}`);
  }
  const nonce = isWithdraw ? claim.nonce - 1 : claim.nonce;
  if (savedClaim.nonce !== nonce) {
    throw new Error(`Invalid claim nonce: ${claim.nonce} - saved claim nonce: ${savedClaim.nonce}`);
  }
  if (savedClaim.cumulativeDebits[ALICE] !== claim.cumulativeDebits[ALICE]) {
    throw new Error(`Invalid claim cumulative debit of Client: ${claim.cumulativeDebits[ALICE]} - saved claim: ${savedClaim.cumulativeDebits[ALICE]}`);
  }
  if (savedClaim.cumulativeDebits[BOB] !== claim.cumulativeDebits[BOB]) {
    throw new Error(`Invalid claim cumulative debit of Server: ${claim.cumulativeDebits[BOB]} - saved claim: ${savedClaim.cumulativeDebits[BOB]}`);
  }
  if (savedClaim.addresses[ALICE] !== claim.addresses[ALICE]) {
    throw new Error(`Invalid address of Client: ${claim.addresses[ALICE]} - saved claim: ${savedClaim.addresses[ALICE]}`);
  }
  if (savedClaim.addresses[BOB] !== claim.addresses[BOB]) {
    throw new Error(`Invalid address of Server: ${claim.addresses[BOB]} - saved claim: ${savedClaim.addresses[BOB]}`);
  }
  if (!isWithdraw && savedClaim.timestamp !== claim.timestamp) {
    throw new Error(`Invalid timestamp of Server: ${claim.timestamp} - saved claim: ${savedClaim.timestamp}`);
  }
  if (!isWithdraw && savedClaim.messageForAlice !== claim.messageForAlice) {
    throw new Error(`Invalid message for Alice: ${claim.messageForAlice} - expected: ${savedClaim.messageForAlice}`);
  }
  return true;
};
const isValidWithdraw = (claim, balance) => {
  _controlWithdrawMessage(claim, balance);
  const savedClaim = claimStorage.getConfirmedClaim();
  if (savedClaim) {
    return areEqualClaims(claim, savedClaim, true);
  }
  return false;
};
const _controlWithdrawMessage = (claim, balance) => {
  const balanceToWithdraw = bnUtils.plus(balance, bnUtils.minus(claim.cumulativeDebits[BOB], claim.cumulativeDebits[ALICE]));
  const messageForAlice = `You are withdrawing: ${formatNumber(balanceToWithdraw)} DE.GA`;
  if (claim.messageForAlice !== messageForAlice) {
    throw new Error(`Invalid message for Alice: ${claim.messageForAlice} - expected: ${messageForAlice}`);
  }
};
var claimControls = {
  isValidNewClaim,
  isValidClaimAlice,
  areEqualClaims,
  isValidWithdraw
};
var vaultAbi = [
  {
    anonymous: false,
    inputs: [
      {
        components: [
          {
            components: [
              {
                internalType: "uint256",
                name: "id",
                type: "uint256"
              },
              {
                internalType: "uint256",
                name: "nonce",
                type: "uint256"
              },
              {
                internalType: "uint256",
                name: "timestamp",
                type: "uint256"
              },
              {
                internalType: "uint256[]",
                name: "cumulativeDebits",
                type: "uint256[]"
              }
            ],
            internalType: "struct VaultV1.ClaimTransaction",
            name: "claimTransaction",
            type: "tuple"
          },
          {
            internalType: "uint256",
            name: "timestamp",
            type: "uint256"
          },
          {
            internalType: "address",
            name: "requester",
            type: "address"
          }
        ],
        indexed: false,
        internalType: "struct VaultV1.EmergencyWithdrawRequest",
        name: "emergencyWithdrawRequest",
        type: "tuple"
      }
    ],
    name: "InitEmergencyWithdraw",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "bytes32",
        name: "role",
        type: "bytes32"
      },
      {
        indexed: true,
        internalType: "bytes32",
        name: "previousAdminRole",
        type: "bytes32"
      },
      {
        indexed: true,
        internalType: "bytes32",
        name: "newAdminRole",
        type: "bytes32"
      }
    ],
    name: "RoleAdminChanged",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "bytes32",
        name: "role",
        type: "bytes32"
      },
      {
        indexed: true,
        internalType: "address",
        name: "account",
        type: "address"
      },
      {
        indexed: true,
        internalType: "address",
        name: "sender",
        type: "address"
      }
    ],
    name: "RoleGranted",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "bytes32",
        name: "role",
        type: "bytes32"
      },
      {
        indexed: true,
        internalType: "address",
        name: "account",
        type: "address"
      },
      {
        indexed: true,
        internalType: "address",
        name: "sender",
        type: "address"
      }
    ],
    name: "RoleRevoked",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      {
        components: [
          {
            components: [
              {
                internalType: "uint256",
                name: "id",
                type: "uint256"
              },
              {
                internalType: "uint256",
                name: "nonce",
                type: "uint256"
              },
              {
                internalType: "uint256",
                name: "timestamp",
                type: "uint256"
              },
              {
                internalType: "uint256[]",
                name: "cumulativeDebits",
                type: "uint256[]"
              }
            ],
            internalType: "struct VaultV1.ClaimTransaction",
            name: "claimTransaction",
            type: "tuple"
          },
          {
            internalType: "uint256",
            name: "timestamp",
            type: "uint256"
          },
          {
            internalType: "address",
            name: "requester",
            type: "address"
          }
        ],
        indexed: false,
        internalType: "struct VaultV1.EmergencyWithdrawRequest",
        name: "emergencyWithdrawRequest",
        type: "tuple"
      },
      {
        indexed: false,
        internalType: "string",
        name: "cause",
        type: "string"
      }
    ],
    name: "StopEmergencyWithdraw",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      {
        components: [
          {
            internalType: "uint256",
            name: "id",
            type: "uint256"
          },
          {
            internalType: "uint256",
            name: "nonce",
            type: "uint256"
          },
          {
            internalType: "uint256",
            name: "timestamp",
            type: "uint256"
          },
          {
            internalType: "uint256[]",
            name: "cumulativeDebits",
            type: "uint256[]"
          }
        ],
        indexed: false,
        internalType: "struct VaultV1.ClaimTransaction",
        name: "claimTransaction",
        type: "tuple"
      }
    ],
    name: "WithdrawAlice",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256"
      }
    ],
    name: "WithdrawBob",
    type: "event"
  },
  {
    inputs: [],
    name: "DEFAULT_ADMIN_ROLE",
    outputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "clientAddress",
        type: "address"
      }
    ],
    name: "balanceOf",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address"
      }
    ],
    name: "balances",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256"
      }
    ],
    name: "deposit",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "account",
        type: "address"
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256"
      }
    ],
    name: "depositFor",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [],
    name: "emergencyWithdrawAlice",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address"
      }
    ],
    name: "emergencyWithdrawRequests",
    outputs: [
      {
        components: [
          {
            internalType: "uint256",
            name: "id",
            type: "uint256"
          },
          {
            internalType: "uint256",
            name: "nonce",
            type: "uint256"
          },
          {
            internalType: "uint256",
            name: "timestamp",
            type: "uint256"
          },
          {
            internalType: "uint256[]",
            name: "cumulativeDebits",
            type: "uint256[]"
          }
        ],
        internalType: "struct VaultV1.ClaimTransaction",
        name: "claimTransaction",
        type: "tuple"
      },
      {
        internalType: "uint256",
        name: "timestamp",
        type: "uint256"
      },
      {
        internalType: "address",
        name: "requester",
        type: "address"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "getChainId",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "role",
        type: "bytes32"
      }
    ],
    name: "getRoleAdmin",
    outputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "role",
        type: "bytes32"
      },
      {
        internalType: "address",
        name: "account",
        type: "address"
      }
    ],
    name: "grantRole",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "role",
        type: "bytes32"
      },
      {
        internalType: "address",
        name: "account",
        type: "address"
      }
    ],
    name: "hasRole",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: "uint256",
            name: "id",
            type: "uint256"
          },
          {
            internalType: "address[]",
            name: "addresses",
            type: "address[]"
          },
          {
            internalType: "uint256",
            name: "nonce",
            type: "uint256"
          },
          {
            internalType: "uint256",
            name: "timestamp",
            type: "uint256"
          },
          {
            internalType: "string",
            name: "messageForAlice",
            type: "string"
          },
          {
            internalType: "uint256[]",
            name: "cumulativeDebits",
            type: "uint256[]"
          },
          {
            internalType: "bytes[]",
            name: "signatures",
            type: "bytes[]"
          },
          {
            internalType: "uint256",
            name: "closed",
            type: "uint256"
          }
        ],
        internalType: "struct VaultV1.ClaimRequest",
        name: "req",
        type: "tuple"
      }
    ],
    name: "initEmergencyWithdrawAlice",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [],
    name: "initEmergencyWithdrawAliceWithoutClaim",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "alice",
        type: "address"
      }
    ],
    name: "initEmergencyWithdrawBob",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "tokenAddress",
        type: "address"
      },
      {
        internalType: "address",
        name: "serverAddress",
        type: "address"
      },
      {
        internalType: "string",
        name: "name",
        type: "string"
      },
      {
        internalType: "string",
        name: "version",
        type: "string"
      }
    ],
    name: "initialize",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "role",
        type: "bytes32"
      },
      {
        internalType: "address",
        name: "account",
        type: "address"
      }
    ],
    name: "renounceRole",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "role",
        type: "bytes32"
      },
      {
        internalType: "address",
        name: "account",
        type: "address"
      }
    ],
    name: "revokeRole",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: "uint256",
            name: "id",
            type: "uint256"
          },
          {
            internalType: "address[]",
            name: "addresses",
            type: "address[]"
          },
          {
            internalType: "uint256",
            name: "nonce",
            type: "uint256"
          },
          {
            internalType: "uint256",
            name: "timestamp",
            type: "uint256"
          },
          {
            internalType: "string",
            name: "messageForAlice",
            type: "string"
          },
          {
            internalType: "uint256[]",
            name: "cumulativeDebits",
            type: "uint256[]"
          },
          {
            internalType: "bytes[]",
            name: "signatures",
            type: "bytes[]"
          },
          {
            internalType: "uint256",
            name: "closed",
            type: "uint256"
          }
        ],
        internalType: "struct VaultV1.ClaimRequest",
        name: "req",
        type: "tuple"
      }
    ],
    name: "stopEmergencyWithdraw",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "bytes4",
        name: "interfaceId",
        type: "bytes4"
      }
    ],
    name: "supportsInterface",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: "uint256",
            name: "id",
            type: "uint256"
          },
          {
            internalType: "address[]",
            name: "addresses",
            type: "address[]"
          },
          {
            internalType: "uint256",
            name: "nonce",
            type: "uint256"
          },
          {
            internalType: "uint256",
            name: "timestamp",
            type: "uint256"
          },
          {
            internalType: "string",
            name: "messageForAlice",
            type: "string"
          },
          {
            internalType: "uint256[]",
            name: "cumulativeDebits",
            type: "uint256[]"
          },
          {
            internalType: "bytes[]",
            name: "signatures",
            type: "bytes[]"
          },
          {
            internalType: "uint256",
            name: "closed",
            type: "uint256"
          }
        ],
        internalType: "struct VaultV1.ClaimRequest",
        name: "req",
        type: "tuple"
      }
    ],
    name: "verify",
    outputs: [],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: "uint256",
            name: "id",
            type: "uint256"
          },
          {
            internalType: "address[]",
            name: "addresses",
            type: "address[]"
          },
          {
            internalType: "uint256",
            name: "nonce",
            type: "uint256"
          },
          {
            internalType: "uint256",
            name: "timestamp",
            type: "uint256"
          },
          {
            internalType: "string",
            name: "messageForAlice",
            type: "string"
          },
          {
            internalType: "uint256[]",
            name: "cumulativeDebits",
            type: "uint256[]"
          },
          {
            internalType: "bytes[]",
            name: "signatures",
            type: "bytes[]"
          },
          {
            internalType: "uint256",
            name: "closed",
            type: "uint256"
          }
        ],
        internalType: "struct VaultV1.ClaimRequest",
        name: "req",
        type: "tuple"
      }
    ],
    name: "withdrawAlice",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256"
      }
    ],
    name: "withdrawBob",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address"
      }
    ],
    name: "withdrawTransactions",
    outputs: [
      {
        internalType: "uint256",
        name: "id",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "nonce",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "timestamp",
        type: "uint256"
      }
    ],
    stateMutability: "view",
    type: "function"
  }
];
var degaAbi = [
  {
    inputs: [],
    stateMutability: "nonpayable",
    type: "constructor"
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "owner",
        type: "address"
      },
      {
        indexed: true,
        internalType: "address",
        name: "spender",
        type: "address"
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "value",
        type: "uint256"
      }
    ],
    name: "Approval",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "bytes32",
        name: "role",
        type: "bytes32"
      },
      {
        indexed: true,
        internalType: "bytes32",
        name: "previousAdminRole",
        type: "bytes32"
      },
      {
        indexed: true,
        internalType: "bytes32",
        name: "newAdminRole",
        type: "bytes32"
      }
    ],
    name: "RoleAdminChanged",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "bytes32",
        name: "role",
        type: "bytes32"
      },
      {
        indexed: true,
        internalType: "address",
        name: "account",
        type: "address"
      },
      {
        indexed: true,
        internalType: "address",
        name: "sender",
        type: "address"
      }
    ],
    name: "RoleGranted",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "bytes32",
        name: "role",
        type: "bytes32"
      },
      {
        indexed: true,
        internalType: "address",
        name: "account",
        type: "address"
      },
      {
        indexed: true,
        internalType: "address",
        name: "sender",
        type: "address"
      }
    ],
    name: "RoleRevoked",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "from",
        type: "address"
      },
      {
        indexed: true,
        internalType: "address",
        name: "to",
        type: "address"
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "value",
        type: "uint256"
      }
    ],
    name: "Transfer",
    type: "event"
  },
  {
    inputs: [],
    name: "DEFAULT_ADMIN_ROLE",
    outputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "MINTER_ROLE",
    outputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "owner",
        type: "address"
      },
      {
        internalType: "address",
        name: "spender",
        type: "address"
      }
    ],
    name: "allowance",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "spender",
        type: "address"
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256"
      }
    ],
    name: "approve",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool"
      }
    ],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "account",
        type: "address"
      }
    ],
    name: "balanceOf",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256"
      }
    ],
    name: "burn",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "account",
        type: "address"
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256"
      }
    ],
    name: "burn",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "account",
        type: "address"
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256"
      }
    ],
    name: "burnFrom",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [],
    name: "decimals",
    outputs: [
      {
        internalType: "uint8",
        name: "",
        type: "uint8"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "spender",
        type: "address"
      },
      {
        internalType: "uint256",
        name: "subtractedValue",
        type: "uint256"
      }
    ],
    name: "decreaseAllowance",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool"
      }
    ],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "role",
        type: "bytes32"
      }
    ],
    name: "getRoleAdmin",
    outputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "role",
        type: "bytes32"
      },
      {
        internalType: "address",
        name: "account",
        type: "address"
      }
    ],
    name: "grantRole",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "role",
        type: "bytes32"
      },
      {
        internalType: "address",
        name: "account",
        type: "address"
      }
    ],
    name: "hasRole",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "spender",
        type: "address"
      },
      {
        internalType: "uint256",
        name: "addedValue",
        type: "uint256"
      }
    ],
    name: "increaseAllowance",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool"
      }
    ],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "to",
        type: "address"
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256"
      }
    ],
    name: "mint",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [],
    name: "name",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "role",
        type: "bytes32"
      },
      {
        internalType: "address",
        name: "account",
        type: "address"
      }
    ],
    name: "renounceRole",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "role",
        type: "bytes32"
      },
      {
        internalType: "address",
        name: "account",
        type: "address"
      }
    ],
    name: "revokeRole",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "bytes4",
        name: "interfaceId",
        type: "bytes4"
      }
    ],
    name: "supportsInterface",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "symbol",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "totalSupply",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "to",
        type: "address"
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256"
      }
    ],
    name: "transfer",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool"
      }
    ],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "from",
        type: "address"
      },
      {
        internalType: "address",
        name: "to",
        type: "address"
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256"
      }
    ],
    name: "transferFrom",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool"
      }
    ],
    stateMutability: "nonpayable",
    type: "function"
  }
];
const vaultAddress = "0x9b9a5C1Af0A543d7dd243Bea6BDD53458dd0F067";
const degaAddress = "0x16B052D944c1b7731d7C240b6072530929C93b40";
const initContract = (web3Provider, contractAddress = vaultAddress, contractAbi = vaultAbi) => {
  const web3 = new Web3(web3Provider);
  const contract = new web3.eth.Contract(contractAbi, contractAddress);
  return contract;
};
const callMethod = async (contract, method, params) => {
  return await contract.methods[method](params).call();
};
const getVaultBalance$1 = async (address, web3Provider) => {
  const contract = initContract(web3Provider);
  const balance = await callMethod(contract, "balanceOf", address);
  return { balance };
};
const withdrawConsensually$1 = async (claim, web3Provider) => {
  const contract = initContract(web3Provider);
  const web3 = new Web3(web3Provider);
  const address = claim.addresses[0];
  try {
    const gas = await contract.methods.withdrawAlice(claim).estimateGas({ from: address });
    const gasPrice = await web3.eth.getGasPrice();
    const options = { gasPrice, from: address, gas };
    try {
      await contract.methods.withdrawAlice(claim).send(options).on("transactionHash", (txHash) => {
        console.log("txHash", txHash);
        emitEvent(eventType.withdrawHash, txHash);
      }).on("receipt", (receipt) => {
        console.log("receipt", receipt);
        emitEvent(eventType.withdrawReceipt, receipt);
      });
    } catch (error) {
      throw new Error(error);
    }
  } catch (error) {
    throw new Error(error);
  }
};
const getDegaBalance = async (address, web3Provider) => {
  const contract = initContract(web3Provider, degaAddress, degaAbi);
  const balance = await callMethod(contract, "balanceOf", address);
  return balance;
};
const sendTx = async (address, contract, method, params, event, web3Provider) => {
  const web3 = new Web3(web3Provider);
  const gas = await contract.methods[method](...params).estimateGas({ from: address });
  const gasPrice = await web3.eth.getGasPrice();
  const options = { gasPrice, from: address, gas };
  await contract.methods[method](...params).send(options).on("transactionHash", (txHash) => {
    emitEvent(event, { txHash });
  }).on("receipt", (receipt) => {
    emitEvent(event, { receipt });
  });
};
const depositDega$1 = async (amount, address, web3Provider) => {
  const contract = initContract(web3Provider);
  await sendTx(address, contract, "deposit", [amount], eventType.depositDega, web3Provider);
};
const approveDega$1 = async (amount, address, web3Provider) => {
  const contract = initContract(web3Provider, degaAddress, degaAbi);
  await sendTx(address, contract, "approve", [vaultAddress, amount], eventType.approveDega, web3Provider);
};
var blockchain = {
  getVaultBalance: getVaultBalance$1,
  withdrawConsensually: withdrawConsensually$1,
  getDegaBalance,
  depositDega: depositDega$1,
  approveDega: approveDega$1
};
const cashout$1 = async (claim, web3Provider) => {
  claimControls.isValidNewClaim(claim);
  {
    if (!_verifySignature(claim)) {
      throw new Error("Server's signature is not verified");
    }
    const balanceIsEnough = await _isBalanceEnough(claim, web3Provider);
    if (balanceIsEnough === true) {
      await _signClaim(claim);
      claimStorage.saveConfirmedClaim(claim);
      return claim;
    } else {
      throw new Error("Server's balance is not enough");
    }
  }
};
const _buildTypedClaim = (claim) => {
  return {
    types: {
      EIP712Domain: [
        { name: "name", type: "string" },
        { name: "version", type: "string" },
        { name: "chainId", type: "uint256" },
        { name: "verifyingContract", type: "address" }
      ],
      Claim: [
        { name: "id", type: "uint256" },
        { name: "alice", type: "address" },
        { name: "bob", type: "address" },
        { name: "nonce", type: "uint256" },
        { name: "timestamp", type: "uint256" },
        { name: "messageForAlice", type: "string" },
        { name: "cumulativeDebitAlice", type: "uint256" },
        { name: "cumulativeDebitBob", type: "uint256" },
        { name: "closed", type: "uint256" }
      ]
    },
    domain,
    primaryType: "Claim",
    message: {
      id: claim.id,
      alice: claim.addresses[ALICE],
      bob: claim.addresses[BOB],
      nonce: claim.nonce,
      timestamp: claim.timestamp,
      messageForAlice: claim.messageForAlice,
      cumulativeDebitAlice: claim.cumulativeDebits[ALICE],
      cumulativeDebitBob: claim.cumulativeDebits[BOB],
      closed: claim.closed
    }
  };
};
const _verifySignature = (claim, ofAlice = false) => {
  let signer = 1;
  if (ofAlice) {
    signer = 0;
  }
  const data = _buildTypedClaim(claim);
  const signature = claim.signatures[signer];
  try {
    const addressSigner = recoverTypedSignature({
      data,
      signature,
      version: SignTypedDataVersion.V4
    });
    return addressSigner.toUpperCase() === claim.addresses[signer].toUpperCase();
  } catch (error) {
    return false;
  }
};
const cashin$1 = async (claim, web3Provider) => {
  const claimWasntSigned = _isAliceClaimNotSigned(claim);
  claimControls.isValidNewClaim(claim);
  if (claimWasntSigned) {
    const balanceIsEnough = await _isBalanceEnough(claim, web3Provider);
    if (balanceIsEnough === true) {
      await _signClaim(claim);
      claimStorage.saveClaimAlice(claim);
      return claim;
    } else {
      throw new Error("Not enough balance");
    }
  }
};
const _isAliceClaimNotSigned = (claim) => {
  const lastAliceClaim = claimStorage.getClaimAlice();
  if (lastAliceClaim && lastAliceClaim.id === claim.id && lastAliceClaim.nonce >= claim.nonce) {
    throw new Error(`Claim with nonce ${claim.nonce} is already signed`);
  } else {
    return true;
  }
};
const _isBalanceEnough = async (claim, web3Provider) => {
  const index = claim.amount < 0 ? 0 : 1;
  if (index === 1)
    return true;
  return _checkBalance(claim, index, web3Provider);
};
const _checkBalance = async (claim, index, web3Provider) => {
  try {
    const { balance } = await blockchain.getVaultBalance(claim.addresses[index], web3Provider);
    if (bnUtils.gte(balance, claim.cumulativeDebits[index])) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    throw new Error("Can't get balance from Vault");
  }
};
const _signClaim = async (claim) => {
  const msg = _buildTypedClaim(claim);
  const from = claim.addresses[ALICE];
  claim.signatures[ALICE] = await signTypedData(msg, from);
};
const claimControfirmed$1 = async (claim) => {
  const claimIsValid = claimControls.isValidClaimAlice(claim);
  if (claimIsValid) {
    if (_verifySignature(claim)) {
      claimStorage.saveConfirmedClaim(claim);
    } else {
      throw new Error("Server's signature is not verified");
    }
  }
};
const signWithdraw$1 = async (claim, web3Provider) => {
  const claimWasntSigned = _isAliceClaimNotSigned(claim);
  let balance;
  try {
    const vaultBalance = await blockchain.getVaultBalance(claim.addresses[ALICE], web3Provider);
    balance = vaultBalance.balance;
  } catch (error) {
    throw new Error("Can't get balance from Vault");
  }
  const claimIsValid = claimControls.isValidWithdraw(claim, balance);
  if (claimIsValid && claimWasntSigned) {
    await _signClaim(claim);
    claimStorage.saveClaimAlice(claim);
    return claim;
  } else {
    throw new Error("Withdraw claim is not valid");
  }
};
const lastClaim$1 = (claim) => {
  const confirmedClaim = claimStorage.getConfirmedClaim();
  if (!confirmedClaim && claim === null) {
    return true;
  }
  if (!confirmedClaim && claim && claim.nonce) {
    claimStorage.saveConfirmedClaim(claim);
    return true;
  } else if (confirmedClaim && claim === null) {
    return confirmedClaim;
  } else if (claim.id >= confirmedClaim.id && claim.nonce > confirmedClaim.nonce) {
    if (_verifySignature(claim, true) && _verifySignature(claim)) {
      claimStorage.saveConfirmedClaim(claim);
      return true;
    } else {
      return confirmedClaim;
    }
  } else {
    try {
      const areEqual = claimControls.areEqualClaims(claim, confirmedClaim);
      if (areEqual === true && claim.signatures[ALICE] === confirmedClaim.signatures[ALICE] && claim.signatures[BOB] === confirmedClaim.signatures[BOB]) {
        return true;
      } else {
        return confirmedClaim;
      }
    } catch (error) {
      return confirmedClaim;
    }
  }
};
var claimLibrary = {
  cashin: cashin$1,
  claimControfirmed: claimControfirmed$1,
  cashout: cashout$1,
  signWithdraw: signWithdraw$1,
  lastClaim: lastClaim$1,
  downloadLastClaim: claimStorage.downloadLastClaim
};
const cashin = async (claim) => {
  try {
    await checkRightNetwork();
  } catch (error) {
    emitErrorEvent(eventType.claimNotSigned, error);
    throw error;
  }
  const web3Provider = getWeb3Provider();
  try {
    const claimResult = await claimLibrary.cashin(claim, web3Provider);
    emitEvent(eventType.claimSigned, { claim: claimResult });
    return claimResult;
  } catch (error) {
    emitErrorEvent(eventType.claimNotSigned, error);
    throw error;
  }
};
const getVaultBalance = async (address) => {
  const web3Provider = getWeb3Provider();
  try {
    const balance = await blockchain.getVaultBalance(address, web3Provider);
    return balance;
  } catch (error) {
    console.error(error);
  }
};
const claimControfirmed = async (claim) => {
  try {
    await checkRightNetwork();
  } catch (error) {
    emitErrorEvent(eventType.claimNotConfirmed, error);
    throw error;
  }
  try {
    await claimLibrary.claimControfirmed(claim);
    emitEvent(eventType.claimConfirmed, { claim });
  } catch (error) {
    emitErrorEvent(eventType.claimNotConfirmed, { error, claim });
    throw error;
  }
};
const cashout = async (claim) => {
  try {
    await checkRightNetwork();
  } catch (error) {
    emitErrorEvent(eventType.winNotConfirmed, error);
    throw error;
  }
  const web3Provider = getWeb3Provider();
  try {
    const claimResult = await claimLibrary.cashout(claim, web3Provider);
    emitEvent(eventType.winClaimSigned, { claim: claimResult });
    return claimResult;
  } catch (error) {
    emitErrorEvent(eventType.winNotConfirmed, error);
    throw error;
  }
};
const lastClaim = (claim) => {
  if (claim && claim.hasOwnProperty("error")) {
    emitErrorEvent(eventType.claimNotSynced, claim.error);
    return;
  }
  const trueOrClaim = claimLibrary.lastClaim(claim);
  if (trueOrClaim === true) {
    emitEvent(eventType.claimSynced, "Claims are synced");
  } else {
    emitErrorEvent(eventType.claimNotSynced, { lastClaim: trueOrClaim });
    return trueOrClaim;
  }
};
const signWithdraw = async (claim) => {
  try {
    await checkRightNetwork();
  } catch (error) {
    emitErrorEvent(eventType.claimNotSigned, error);
    throw error;
  }
  const web3Provider = getWeb3Provider();
  try {
    const claimResult = await claimLibrary.signWithdraw(claim, web3Provider);
    emitEvent(eventType.claimSigned, { claim: claimResult });
    return claimResult;
  } catch (error) {
    emitErrorEvent(eventType.claimNotSigned, error);
    throw error;
  }
};
const withdrawConsensually = async (claim) => {
  try {
    await checkRightNetwork();
  } catch (error) {
    emitErrorEvent(eventType.withdraw, error);
    throw error;
  }
  const web3Provider = getWeb3Provider();
  try {
    await blockchain.withdrawConsensually(claim, web3Provider);
    emitEvent(eventType.withdraw, "Consensual withdraw is sent to blockchain");
  } catch (error) {
    emitErrorEvent(eventType.withdraw, error);
  }
};
var claims = {
  cashin,
  claimControfirmed,
  cashout,
  lastClaim,
  signWithdraw,
  withdrawConsensually,
  getVaultBalance,
  downloadLastClaim: claimLibrary.downloadLastClaim
};
const depositDega = async (amount, address) => {
  try {
    checkRightNetwork();
  } catch (error) {
    emitErrorEvent(eventType.depositDega, error);
    throw error;
  }
  const web3Provider = getWeb3Provider();
  try {
    await checkDegaBalance(amount, address, web3Provider);
  } catch (error) {
    emitErrorEvent(eventType.depositDega, error);
    throw error;
  }
  try {
    await blockchain.depositDega(amount, address, web3Provider);
  } catch (error) {
    emitErrorEvent(eventType.depositDega, error);
    throw error;
  }
};
const checkDegaBalance = async (amount, address, web3Provider) => {
  let balance;
  try {
    balance = await blockchain.getDegaBalance(address, web3Provider);
  } catch (error) {
    throw new Error("Can't get balance of Dega");
  }
  if (bnUtils.lt(balance, amount)) {
    throw new Error("The balance of Dega is not enough");
  }
};
const approveDega = async (amount, address) => {
  try {
    checkRightNetwork();
  } catch (error) {
    emitErrorEvent(eventType.approveDega, error);
    throw error;
  }
  const web3Provider = getWeb3Provider();
  try {
    await blockchain.approveDega(amount, address, web3Provider);
  } catch (error) {
    emitErrorEvent(eventType.approveDega, error);
    throw error;
  }
};
var dega = {
  depositDega,
  approveDega
};
const CSDK_TYPE_CASHIN = "CASHIN";
const CSDK_TYPE_CASHOUT = "CASHOUT";
const CSDK_TYPE_WITHDRAW = "WITHDRAW";
const CSDK_TYPE_HANDSHAKE = "HANDSHAKE";
const receiveMsg = async (msg) => {
  if (msg) {
    const { action, claim, context, error } = JSON.parse(msg);
    if (error) {
      emitEvent(eventType.serverEvent, error);
    }
    switch (action) {
      case CSDK_TYPE_HANDSHAKE: {
        const lastClaimAlice = claims.lastClaim(claim);
        if (lastClaimAlice) {
          return {
            action,
            claim: lastClaimAlice,
            context
          };
        }
        break;
      }
      case CSDK_TYPE_CASHIN: {
        if (!claim.signatures[ALICE] && !claim.signatures[BOB]) {
          const signedClaim = await claims.cashin(claim);
          return {
            action,
            claim: signedClaim,
            context
          };
        } else if (claim.signatures[ALICE] && claim.signatures[BOB]) {
          await claims.claimControfirmed(claim);
        } else {
          throw new Error("Invalid claim");
        }
        break;
      }
      case CSDK_TYPE_CASHOUT: {
        if (!claim.signatures[ALICE] && claim.signatures[BOB]) {
          const signedClaim = await claims.cashout(claim);
          return {
            action,
            claim: signedClaim,
            context
          };
        } else {
          throw new Error("Invalid claim");
        }
      }
      case CSDK_TYPE_WITHDRAW: {
        if (!claim.signatures[ALICE] && !claim.signatures[BOB]) {
          const signedClaim = await claims.signWithdraw(claim);
          return {
            action,
            claim: signedClaim,
            context
          };
        } else if (claim.signatures[ALICE] && claim.signatures[BOB]) {
          await claims.claimControfirmed(claim);
          await claims.withdrawConsensually(claim);
        } else {
          throw new Error("Invalid claim");
        }
        break;
      }
      default: {
        emitEvent(eventType.serverEvent, JSON.parse(msg));
      }
    }
  }
};
const cryptoSDK = {
  getAddress,
  isMetamaskInstalled,
  isRightNet,
  setRightNet,
  addEventListener,
  receiveMsg,
  signChallenge: token.signChallenge,
  setToken: token.setToken,
  getToken: token.getToken,
  isLogged: token.isLogged,
  getVaultBalance: claims.getVaultBalance,
  downloadLastClaim: claims.downloadLastClaim,
  formatNumber,
  pay: claims.cashin,
  payReceived: claims.claimControfirmed,
  win: claims.cashout,
  depositDega: dega.depositDega,
  approveDega: dega.approveDega
};
export { cryptoSDK as default };
