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
  withdraw: "withdraw"
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
    window.ethereum.on("message", async (message) => {
      emitEvent(eventType.message, { message });
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
const CSDK_CONTRACT_VAULT_ADDRESS = "0xA0Af3739fBC126C287D2fd0b5372d939Baa36B17";
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
  roundDecimals
};
const CSDK_SERVER_ADDRESS = "0xeA085D9698651e76750F07d0dE0464476187b3ca";
const CSDK_TYPE_WITHDRAW = "wallet.withdraw";
const isValidNewClaim = (claim) => {
  const lastClaim2 = claimStorage.getConfirmedClaim();
  if (lastClaim2) {
    const wasWithdraw = lastClaim2.type === CSDK_TYPE_WITHDRAW;
    const id = wasWithdraw ? lastClaim2.id + 1 : lastClaim2.id;
    const nonce = wasWithdraw ? 1 : lastClaim2.nonce + 1;
    if (id !== claim.id) {
      throw new Error(`Invalid claim id: ${claim.id} - last claim id: ${lastClaim2.id}${wasWithdraw ? ". id must change after withdraw" : ""}`);
    }
    if (nonce !== claim.nonce) {
      throw new Error(`Invalid claim nonce: ${claim.nonce} ${wasWithdraw ? " - channel id is changed" : `- last claim nonce: ${lastClaim2.nonce}`}`);
    }
    if (claim.addresses[1] !== CSDK_SERVER_ADDRESS) {
      throw new Error(`Invalid address of Server: ${claim.addresses[1]} - expected: ${CSDK_SERVER_ADDRESS}`);
    }
    const lastBalance = bnUtils.minus(lastClaim2.cumulativeDebits[1], lastClaim2.cumulativeDebits[0]);
    const balance = bnUtils.plus(lastBalance, claim.amount);
    _controlDebits(balance, claim.cumulativeDebits);
  } else {
    if (claim.id !== 1) {
      throw new Error(`Invalid claim id: ${claim.id}`);
    }
    if (claim.nonce !== 1) {
      throw new Error(`Invalid claim nonce: ${claim.nonce}`);
    }
    if (claim.addresses[1] !== CSDK_SERVER_ADDRESS) {
      throw new Error(`Invalid address of Server: ${claim.addresses[1]} - expected: ${CSDK_SERVER_ADDRESS}`);
    }
    const balance = claim.amount;
    _controlDebits(balance, claim.cumulativeDebits);
  }
  return true;
};
const _controlDebits = (balance, cumulativeDebits) => {
  if (bnUtils.gt(balance, 0)) {
    if (!bnUtils.eq(cumulativeDebits[0], 0)) {
      throw new Error(`Invalid claim cumulative debit of Client: ${cumulativeDebits[0]} - expected: 0`);
    }
    if (!bnUtils.eq(cumulativeDebits[1], balance)) {
      throw new Error(`Invalid claim cumulative debit of Server: ${cumulativeDebits[1]} - expected: ${balance}`);
    }
  } else {
    if (!bnUtils.eq(cumulativeDebits[0], bnUtils.negated(balance))) {
      throw new Error(`Invalid claim cumulative debit of Client: ${cumulativeDebits[0]} - expected: ${-balance}`);
    }
    if (!bnUtils.eq(cumulativeDebits[1], 0)) {
      throw new Error(`Invalid claim cumulative debit of Server: ${cumulativeDebits[1]} - expected: 0`);
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
  if (savedClaim.cumulativeDebits[0] !== claim.cumulativeDebits[0]) {
    throw new Error(`Invalid claim cumulative debit of Client: ${claim.cumulativeDebits[0]} - saved claim: ${savedClaim.cumulativeDebits[0]}`);
  }
  if (savedClaim.cumulativeDebits[1] !== claim.cumulativeDebits[1]) {
    throw new Error(`Invalid claim cumulative debit of Server: ${claim.cumulativeDebits[1]} - saved claim: ${savedClaim.cumulativeDebits[1]}`);
  }
  const type = isWithdraw ? "wallet.withdraw" : savedClaim.type;
  if (claim.type !== type) {
    throw new Error(`Invalid claim type: ${claim.type} - saved claim type: ${savedClaim.type}`);
  }
  if (savedClaim.addresses[0] !== claim.addresses[0]) {
    throw new Error(`Invalid address of Client: ${claim.addresses[0]} - saved claim: ${savedClaim.addresses[0]}`);
  }
  if (savedClaim.addresses[1] !== claim.addresses[1]) {
    throw new Error(`Invalid address of Server: ${claim.addresses[1]} - saved claim: ${savedClaim.addresses[1]}`);
  }
  if (!isWithdraw && savedClaim.timestamp !== claim.timestamp) {
    throw new Error(`Invalid timestamp of Server: ${claim.timestamp} - saved claim: ${savedClaim.timestamp}`);
  }
  return true;
};
const isValidWithdraw = (claim) => {
  const savedClaim = claimStorage.getConfirmedClaim();
  if (savedClaim) {
    return areEqualClaims(claim, savedClaim, true);
  }
  return false;
};
var claimControls = {
  isValidNewClaim,
  isValidClaimAlice,
  areEqualClaims,
  isValidWithdraw
};
var abi = [
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
    name: "Withdraw",
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
const vaultAddress = "0xA0Af3739fBC126C287D2fd0b5372d939Baa36B17";
const initContract = (web3Provider, contractAddress = vaultAddress, contractAbi = abi) => {
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
      }).on("receipt", (receipt) => {
        console.log("receipt", receipt);
      });
    } catch (error) {
      throw new Error(error);
    }
  } catch (error) {
    throw new Error(error);
  }
};
var blockchain = {
  getVaultBalance: getVaultBalance$1,
  withdrawConsensually: withdrawConsensually$1
};
const win$1 = async (claim, web3Provider) => {
  const claimIsValid = await claimControls.isValidNewClaim(claim);
  if (claimIsValid) {
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
        { name: "cumulativeDebitBob", type: "uint256" }
      ]
    },
    domain,
    primaryType: "Claim",
    message: {
      id: claim.id,
      alice: claim.addresses[0],
      bob: claim.addresses[1],
      nonce: claim.nonce,
      timestamp: claim.timestamp,
      messageForAlice: claim.messageForAlice,
      cumulativeDebitAlice: claim.cumulativeDebits[0],
      cumulativeDebitBob: claim.cumulativeDebits[1]
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
const pay$1 = async (claim, web3Provider) => {
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
  return await _checkBalance(claim, index, web3Provider);
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
  const from = claim.addresses[0];
  claim.signatures[0] = await signTypedData(msg, from);
};
const payReceived$1 = async (claim) => {
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
  const claimIsValid = claimControls.isValidWithdraw(claim);
  if (claimIsValid && claimWasntSigned) {
    await _signClaim(claim);
    claimStorage.saveClaimAlice(claim);
    return claim;
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
    return { handshake: confirmedClaim };
  } else if (claim.id >= confirmedClaim.id && claim.nonce > confirmedClaim.nonce) {
    if (_verifySignature(claim, true) && _verifySignature(claim)) {
      claimStorage.saveConfirmedClaim(claim);
      return true;
    } else {
      return { handshake: confirmedClaim };
    }
  } else {
    try {
      const areEqual = claimControls.areEqualClaims(claim, confirmedClaim);
      if (areEqual === true && claim.signatures[0] === confirmedClaim.signatures[0] && claim.signatures[1] === confirmedClaim.signatures[1]) {
        return true;
      } else {
        return { handshake: confirmedClaim };
      }
    } catch (error) {
      return { handshake: confirmedClaim };
    }
  }
};
var claimLibrary = {
  pay: pay$1,
  payReceived: payReceived$1,
  win: win$1,
  signWithdraw: signWithdraw$1,
  lastClaim: lastClaim$1,
  downloadLastClaim: claimStorage.downloadLastClaim
};
const pay = async (claim) => {
  try {
    await checkRightNetwork();
  } catch (error) {
    emitErrorEvent(eventType.claimNotSigned, error);
    throw error;
  }
  const web3Provider = getWeb3Provider();
  try {
    const claimResult = await claimLibrary.pay(claim, web3Provider);
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
const payReceived = async (claim) => {
  try {
    await checkRightNetwork();
  } catch (error) {
    emitErrorEvent(eventType.claimNotConfirmed, error);
    throw error;
  }
  try {
    await claimLibrary.payReceived(claim);
    emitEvent(eventType.claimConfirmed, { claim });
  } catch (error) {
    emitErrorEvent(eventType.claimNotConfirmed, { error, claim });
    throw error;
  }
};
const win = async (claim) => {
  try {
    await checkRightNetwork();
  } catch (error) {
    emitErrorEvent(eventType.winNotConfirmed, error);
    throw error;
  }
  const web3Provider = getWeb3Provider();
  try {
    const claimResult = await claimLibrary.win(claim, web3Provider);
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
  pay,
  payReceived,
  win,
  lastClaim,
  signWithdraw,
  withdrawConsensually,
  getVaultBalance,
  downloadLastClaim: claimLibrary.downloadLastClaim
};
const receiveMsg = async (msg) => {
  if (msg) {
    const message = JSON.parse(msg);
    if (message.hasOwnProperty("handshake")) {
      return claims.lastClaim(message.handshake);
    } else {
      const claim = message;
      if (claim && claim.type === "ticket.play") {
        if (!claim.signatures[0] && !claim.signatures[1]) {
          const signedClaim = await claims.pay(claim);
          return signedClaim;
        } else if (claim.signatures[0] && claim.signatures[1]) {
          await claims.payReceived(claim);
        }
      } else if (claim && claim.type === "ticket.win") {
        if (!claim.signatures[0] && claim.signatures[1]) {
          const signedClaim = await claims.win(claim);
          return signedClaim;
        }
      } else if (claim && claim.type === "wallet.withdraw") {
        if (!claim.signatures[0] && !claim.signatures[1]) {
          const signedClaim = await claims.signWithdraw(claim);
          return signedClaim;
        } else if (claim.signatures[0] && claim.signatures[1]) {
          await claims.payReceived(claim);
          await claims.withdrawConsensually(claim);
        }
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
  pay: claims.pay,
  payReceived: claims.payReceived,
  win: claims.win,
  receiveMsg,
  signChallenge: token.signChallenge,
  setToken: token.setToken,
  getToken: token.getToken,
  isLogged: token.isLogged,
  lastClaim: claims.lastClaim,
  getVaultBalance: claims.getVaultBalance,
  downloadLastClaim: claims.downloadLastClaim
};
export { cryptoSDK as default };
