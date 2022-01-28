import { recoverTypedSignature, SignTypedDataVersion } from "@metamask/eth-sig-util";
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
  paymentConfirmed: "paymentConfirmed",
  paymentNotConfirmed: "paymentNotConfirmed",
  winClaimSigned: "winClaimSigned",
  winNotConfirmed: "winNotConfirmed",
  challengeSigned: "challengeSigned",
  challengeNotSigned: "challengeNotSigned",
  claimSynced: "claimSynced",
  claimNotSynced: "claimNotSynced",
  token: "jwtToken"
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
var claimStorage = {
  saveConfirmedClaim,
  getConfirmedClaim,
  saveClaimAlice,
  getClaimAlice
};
const CSDK_SERVER_ADDRESS = "0xeA085D9698651e76750F07d0dE0464476187b3ca";
const isValidNewClaim = async (claim) => {
  const lastClaim2 = await claimStorage.getConfirmedClaim();
  if (lastClaim2) {
    if (lastClaim2.id !== claim.id) {
      throw new Error(`Invalid claim id: ${claim.id} - last claim id: ${lastClaim2.id}`);
    }
    if (lastClaim2.nonce + 1 !== claim.nonce) {
      throw new Error(`Invalid claim nonce: ${claim.nonce} - last claim nonce: ${lastClaim2.nonce}`);
    }
    if (claim.addresses[1] !== CSDK_SERVER_ADDRESS) {
      throw new Error(`Invalid address of Server: ${claim.addresses[1]} - expected: ${CSDK_SERVER_ADDRESS}`);
    }
    const lastBalance = lastClaim2.cumulativeDebits[1] - lastClaim2.cumulativeDebits[0];
    const balance = lastBalance + claim.amount;
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
  if (balance > 0) {
    if (cumulativeDebits[0] !== 0) {
      throw new Error(`Invalid claim cumulative debit of Client: ${cumulativeDebits[0]} - expected: 0`);
    }
    if (cumulativeDebits[1] !== balance) {
      throw new Error(`Invalid claim cumulative debit of Server: ${cumulativeDebits[1]} - expected: ${balance}`);
    }
  } else {
    if (cumulativeDebits[0] !== -balance) {
      throw new Error(`Invalid claim cumulative debit of Client: ${cumulativeDebits[0]} - expected: ${-balance}`);
    }
    if (cumulativeDebits[1] !== 0) {
      throw new Error(`Invalid claim cumulative debit of Server: ${cumulativeDebits[1]} - expected: 0`);
    }
  }
};
const isValidClaimAlice = async (claim) => {
  let isValid = await isValidNewClaim(claim);
  if (isValid) {
    const savedClaim = await claimStorage.getClaimAlice();
    if (savedClaim) {
      isValid = areEqualClaims(claim, savedClaim);
    }
  }
  return isValid;
};
const areEqualClaims = (claim, savedClaim) => {
  if (savedClaim.id !== claim.id) {
    throw new Error(`Invalid claim id: ${claim.id} - saved claim id: ${savedClaim.id}`);
  }
  if (savedClaim.nonce !== claim.nonce) {
    throw new Error(`Invalid claim nonce: ${claim.nonce} - saved claim nonce: ${savedClaim.nonce}`);
  }
  if (savedClaim.cumulativeDebits[0] !== claim.cumulativeDebits[0]) {
    throw new Error(`Invalid claim cumulative debit of Client: ${claim.cumulativeDebits[0]} - saved claim: ${savedClaim.cumulativeDebits[0]}`);
  }
  if (savedClaim.cumulativeDebits[1] !== claim.cumulativeDebits[1]) {
    throw new Error(`Invalid claim cumulative debit of Server: ${claim.cumulativeDebits[1]} - saved claim: ${savedClaim.cumulativeDebits[1]}`);
  }
  if (savedClaim.type !== claim.type) {
    throw new Error(`Invalid claim type: ${claim.type} - saved claim type: ${savedClaim.type}`);
  }
  if (savedClaim.addresses[0] !== claim.addresses[0]) {
    throw new Error(`Invalid address of Client: ${claim.addresses[0]} - saved claim: ${savedClaim.addresses[0]}`);
  }
  if (savedClaim.addresses[1] !== claim.addresses[1]) {
    throw new Error(`Invalid address of Server: ${claim.addresses[1]} - saved claim: ${savedClaim.addresses[1]}`);
  }
  if (savedClaim.timestamp !== claim.timestamp) {
    throw new Error(`Invalid timestamp of Server: ${claim.timestamp} - saved claim: ${savedClaim.timestamp}`);
  }
  return true;
};
var claimControls = {
  isValidNewClaim,
  isValidClaimAlice,
  areEqualClaims
};
var abi = [
  {
    inputs: [],
    stateMutability: "nonpayable",
    type: "constructor"
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
const getVaultBalance = async (address, web3Provider) => {
  const contract = initContract(web3Provider);
  const web3 = new Web3();
  const balance = web3.utils.fromWei(await callMethod(contract, "balanceOf", address));
  return { balance };
};
var blockchain = {
  getVaultBalance
};
const win$1 = async (claim, web3Provider) => {
  const claimIsValid = await claimControls.isValidNewClaim(claim);
  if (claimIsValid) {
    if (!_verifySignature(claim)) {
      throw new Error("Server's signature is not verified");
    }
    const balanceIsEnough = await _isBalanceEnough(claim, web3Provider);
    if (balanceIsEnough === true) {
      await _signClaim(claim, web3Provider);
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
  const claimWasntSigned = await _isAliceClaimNotSigned(claim);
  const claimIsValid = await claimControls.isValidNewClaim(claim);
  if (claimIsValid && claimWasntSigned) {
    const balanceIsEnough = await _isBalanceEnough(claim, web3Provider);
    if (balanceIsEnough === true) {
      await _signClaim(claim, web3Provider);
      claimStorage.saveClaimAlice(claim);
      return claim;
    } else {
      throw new Error("Not enough balance");
    }
  }
};
const _isAliceClaimNotSigned = async (claim) => {
  const lastAliceClaim = await claimStorage.getClaimAlice();
  if (lastAliceClaim && lastAliceClaim.id === claim.id && lastAliceClaim.nonce >= claim.nonce) {
    throw new Error(`Claim with nonce ${claim.nonce} is already signed`);
  } else {
    return true;
  }
};
const _isBalanceEnough = async (claim, web3Provider) => {
  const index = claim.amount < 0 ? 0 : 1;
  return await _checkBalance(claim, index, web3Provider);
};
const _checkBalance = async (claim, index, web3Provider) => {
  try {
    const { balance } = await blockchain.getVaultBalance(claim.addresses[index], web3Provider);
    if (balance >= claim.cumulativeDebits[index]) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    throw new Error("Can't get balance from Vault");
  }
};
const _signClaim = async (claim, web3Provider) => {
  const msg = _buildTypedClaim(claim);
  const from = claim.addresses[0];
  claim.signatures[0] = await web3Provider.request({
    method: "eth_signTypedData_v4",
    params: [from, JSON.stringify(msg)],
    from
  });
};
const payReceived$1 = async (claim) => {
  const claimIsValid = await claimControls.isValidClaimAlice(claim);
  if (claimIsValid) {
    if (_verifySignature(claim)) {
      claimStorage.saveConfirmedClaim(claim);
    } else {
      throw new Error("Server's signature is not verified");
    }
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
  lastClaim: lastClaim$1
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
const payReceived = async (claim) => {
  try {
    await checkRightNetwork();
  } catch (error) {
    emitErrorEvent(eventType.paymentNotConfirmed, error);
    throw error;
  }
  try {
    await claimLibrary.payReceived(claim);
    emitEvent(eventType.paymentConfirmed, { claim });
  } catch (error) {
    emitErrorEvent(eventType.paymentNotConfirmed, { error, claim });
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
var claims = {
  pay,
  payReceived,
  win,
  lastClaim
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
  lastClaim: claims.lastClaim
};
export { cryptoSDK as default };
