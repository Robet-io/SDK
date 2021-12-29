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
  paymentNotConfirmed: "paymentNotConfirmed"
};
const cryptoEvent = "cryptoSDK";
const CHAIN_ID$1 = 97;
const CHAIN_NAME$1 = "BSC Testnet2";
const RPC_URL = "https://data-seed-prebsc-1-s1.binance.org";
const CHAIN_EXPLORER = "https://testnet.bscscan.com/";
const CURRENCY_NAME = "BNB";
const CURRENCY_SYMBOL = "BNB";
const CURRENCY_DECIMALS = 18;
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
      return networksNames(CHAIN_ID$1);
    }
  } else {
    return names;
  }
};
const getValidNetworks = () => {
  return [Number(CHAIN_ID$1)];
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
    const chainIdHex = `0x${Number(CHAIN_ID$1).toString(16)}`;
    const data = [{
      chainId: chainIdHex,
      chainName: CHAIN_NAME$1,
      nativeCurrency: {
        name: CURRENCY_NAME,
        symbol: CURRENCY_SYMBOL,
        decimals: CURRENCY_DECIMALS
      },
      rpcUrls: [RPC_URL],
      blockExplorerUrls: [CHAIN_EXPLORER]
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
      window.ethereum.chainId = CHAIN_ID$1;
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
_initMetamask();
const savedClameType = {
  claimConfirmed: "claimConfirmed",
  claimAlice: "claimAlice"
};
const saveConfirmedClaim = (claim) => {
  localStorage.setItem(savedClameType.claimConfirmed, JSON.stringify(claim));
};
const getConfirmedClaim = async () => {
  return JSON.parse(await localStorage.getItem(savedClameType.claimConfirmed));
};
const saveClaimAlice = (claim) => {
  localStorage.setItem(savedClameType.claimAlice, JSON.stringify(claim));
};
const getClaimAlice = async () => {
  return JSON.parse(await localStorage.getItem(savedClameType.claimAlice));
};
var claimStorage = {
  saveConfirmedClaim,
  getConfirmedClaim,
  saveClaimAlice,
  getClaimAlice
};
const SERVER_ADDRESS = "0xeA085D9698651e76750F07d0dE0464476187b3ca";
const isValidNewClaim = async (claim) => {
  const lastClaim = await claimStorage.getConfirmedClaim();
  if (lastClaim) {
    if (lastClaim.id !== claim.id) {
      throw new Error(`Invalid claim id: ${claim.id} - last claim id: ${lastClaim.id}`);
    }
    if (lastClaim.nonce + 1 !== claim.nonce) {
      throw new Error(`Invalid claim nonce: ${claim.nonce} - last claim nonce: ${lastClaim.nonce}`);
    }
    if (claim.addresses[1] !== SERVER_ADDRESS) {
      throw new Error(`Invalid claim Server address: ${claim.addresses[1]} - expected: ${SERVER_ADDRESS}`);
    }
    const lastBalance = lastClaim.cumulativeDebits[1] - lastClaim.cumulativeDebits[0];
    const balance = lastBalance + claim.amount;
    _controlDebits(balance, claim.cumulativeDebits);
  } else {
    if (claim.id !== 1) {
      throw new Error(`Invalid claim id: ${claim.id}`);
    }
    if (claim.nonce !== 1) {
      throw new Error(`Invalid claim nonce: ${claim.nonce}`);
    }
    if (claim.addresses[1] !== SERVER_ADDRESS) {
      throw new Error(`Invalid claim Server address: ${claim.addresses[1]} - expected: ${SERVER_ADDRESS}`);
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
  const savedClaim = await claimStorage.getClaimAlice();
  let isValid = false;
  if (savedClaim) {
    isValid = _areEqualClaims(claim, savedClaim);
  } else {
    isValid = await isValidNewClaim(claim);
  }
  return isValid;
};
const _areEqualClaims = (claim, savedClaim) => {
  if (savedClaim.id !== claim.id) {
    throw new Error(`Invalid claim id: ${claim.id} - saved claim id: ${savedClaim.id}`);
  }
  if (savedClaim.nonce !== claim.nonce) {
    throw new Error(`Invalid claim nonce: ${claim.nonce} - saved claim nonce: ${savedClaim.nonce}`);
  }
  if (savedClaim.amount !== claim.amount) {
    throw new Error(`Invalid claim amount: ${claim.amount} - saved claim amount: ${savedClaim.amount}`);
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
  return true;
};
var claimControls = {
  isValidNewClaim,
  isValidClaimAlice
};
const CHAIN_ID = 97;
const CHAIN_NAME = "BSC Testnet";
const CONTRACT_VAULT_ADDRESS = "0xBC8655Fbb4ec8E3cc9edef00f05841A776907311";
const domain = {
  name: CHAIN_NAME,
  version: "1",
  chainId: CHAIN_ID,
  verifyingContract: CONTRACT_VAULT_ADDRESS
};
function _buildTypedClaim(claim) {
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
}
const _verifySignature = (claim, ofAlice = false) => {
  let signer = 1;
  if (ofAlice) {
    signer = 0;
  }
  _buildTypedClaim(claim);
  claim.signatures[signer];
  return true;
};
const pay$1 = async (web3Provider, claim) => {
  const claimIsValid = await claimControls.isValidNewClaim(claim);
  if (claimIsValid) {
    const msg = _buildTypedClaim(claim);
    const from = claim.addresses[0];
    claim.signatures[0] = await web3Provider.request({
      method: "eth_signTypedData_v4",
      params: [from, JSON.stringify(msg)],
      from
    });
    claimStorage.saveClaimAlice(claim);
    return claim;
  }
};
const payReceived$1 = async (claim) => {
  const claimIsValid = await claimControls.isValidClaimAlice(claim);
  if (claimIsValid) {
    if (_verifySignature(claim)) {
      claimStorage.saveConfirmedClaim(claim);
    }
  }
};
var claimLibrary = {
  pay: pay$1,
  payReceived: payReceived$1
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
    const claimResult = await claimLibrary.pay(web3Provider, claim);
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
const cryptoSDK = {
  getAddress,
  isMetamaskInstalled,
  isRightNet,
  setRightNet,
  addEventListener,
  pay,
  payReceived
};
export { cryptoSDK as default };
