(function(y,g){typeof exports=="object"&&typeof module!="undefined"?module.exports=g(require("@metamask/eth-sig-util"),require("bignumber.js"),require("web3")):typeof define=="function"&&define.amd?define(["@metamask/eth-sig-util","bignumber.js","web3"],g):(y=typeof globalThis!="undefined"?globalThis:y||self,y.cryptoSDK=g(y["@metamask/eth-sig-util"],y.bignumber.js,y.Web3))})(this,function(y,g,te){"use strict";function M(e){return e&&typeof e=="object"&&"default"in e?e:{default:e}}var i=M(g),x=M(te);const ne=e=>{document.addEventListener(A,e)},c=(e,t)=>{const n=new CustomEvent(A,{detail:{type:e,msg:t}});document.dispatchEvent(n)},s=(e,t)=>{const n=new CustomEvent(A,{detail:{type:e,msg:t,error:!0}});document.dispatchEvent(n)},r={network:"network",accountsChanged:"accountsChanged",chainChanged:"chainChanged",message:"message",address:"address",wrongNetworkOnGetAddress:"wrongNetworkOnGetAddress",metamaskNotInstalled:"metamaskNotInstalled",general:"general",claimNotSigned:"claimNotSigned",claimSigned:"claimSigned",claimConfirmed:"claimConfirmed",claimNotConfirmed:"claimNotConfirmed",winClaimSigned:"winClaimSigned",winNotConfirmed:"winNotConfirmed",challengeSigned:"challengeSigned",challengeNotSigned:"challengeNotSigned",claimSynced:"claimSynced",claimNotSynced:"claimNotSynced",token:"jwtToken",withdraw:"withdraw"},A="cryptoSDK",D="97",ae="BSC Testnet",re="https://data-seed-prebsc-1-s1.binance.org",ie="https://testnet.bscscan.com/",se="BNB",oe="BNB",ce="18",p=async()=>{const e=q(),t=w();if(t){const n=Number(await t.request({method:"eth_chainId"}));if(Array.isArray(e)){if(e.includes(n))return!0;{const a="Please change your network on Metamask. Valid networks are: "+I(e);throw new Error(a)}}else if(Number(n)!==Number(e)){const a=`Please set your network on Metamask to ${I(e)}`;throw new Error(a)}else return!0}},I=(e=!1)=>{const t=[];if(t[1]="Ethereum Mainnet",t[3]="Ethereum Ropsten",t[42]="Ethereum Kovan",t[4]="Ethereum Rinkeby",t[5]="Ethereum Goerli",t[56]="Binance Smart Chain",t[97]="Binance Smart Chain Testnet",e)if(Array.isArray(e)){const n=[];for(let a=0;a<e.length;a++)n.push(t[e[a]]);return n}else return t[e]?t[e]:(console.error(`Network ID ${e} Not found in the networksNames list`),I(D));else return t},q=()=>[Number(D)],W=async()=>{try{const e=await p();return c(r.network,e),e}catch(e){return s(r.network,e),!1}},le=async()=>{if(window.ethereum){const e=window.ethereum,n=[{chainId:`0x${Number(D).toString(16)}`,chainName:ae,nativeCurrency:{name:se,symbol:oe,decimals:ce},rpcUrls:[re],blockExplorerUrls:[ie]}];try{await e.request({method:"wallet_addEthereumChain",params:n}),await p()?c(r.network,"Success, network is set to the right one"):s(r.network,"Add net error: network is not changed")}catch(a){s(r.network,`Add net error: ${a}`)}}else throw window.web3?(s(r.network,"This version of Metamask supports only manual network switching"),new Error("This version of Metamask supports only manual network switching")):(s(r.network,"Metamask is not installed"),new Error("Metamask is not installed"))},w=()=>{if(window.ethereum)return window.ethereum;if(window.web3)return window.web3.currentProvider;throw s(r.metamaskNotInstalled,{error:"Metamask is not installed"}),new Error("Metamask is not installed")},P=async e=>{try{await W()?c(r.chainChanged,{chainId:e}):s(r.chainChanged,{chainId:e})}catch{s(r.chainChanged,{chainId:e})}},ue=()=>{window.ethereum?(window.ethereum.chainId||(window.ethereum.chainId="97"),window.ethereum.on("accountsChanged",async e=>{console.log("#### - Metamask: accountsChanged - accounts",e),c(r.accountsChanged,{accounts:e})}),window.ethereum.on("chainChanged",async e=>{console.log("#### - Metamask: chainChanged",e),await P(e)}),window.ethereum.on("message",async e=>{c(r.message,{message:e})}),window.ethereum.on("error",async e=>{console.log("#### - Metamask: error",e),s(r.error,e)})):window.web3&&(window.web3.currentProvider.on("accountsChanged",async e=>{console.log("#### - Metamask web3: accountsChanged - accounts",e),c(r.accountsChanged,{accounts:e})}),window.web3.currentProvider.on("chainIdChanged",async e=>{console.log("#### - Metamask web3: chainChanged",e),await P(e)}),window.web3.currentProvider.on("error",async e=>{console.log("#### - Metamask web3: error",e),s(r.error,e)}))},de=async()=>{if(window.ethereum){const e=await window.ethereum.request({method:"eth_requestAccounts"});if(e&&e[0])return e[0];throw new Error("Can't get address")}else if(window.web3){const e=window.web3.eth.accounts;if(e&&e.length>0)return e[0];throw new Error("Can't get address")}else throw new Error("Metamask is not installed")},O=()=>!!(window.ethereum||window.web3),ye=async()=>{if(!O()){const t="Metamask is not installed, unable to get user address";throw s(r.metamaskNotInstalled,t),new Error(t)}const e=q();try{await p(e)}catch(t){throw s(r.wrongNetworkOnGetAddress,t),new Error(t)}try{return{address:await de()}}catch(t){throw s(r.address,t),new Error(t)}},F=async(e,t)=>(await p(),await w().request({method:"eth_signTypedData_v4",params:[t,JSON.stringify(e)],from:t}));ue();const K={name:"BSC Testnet",version:"1",chainId:"97",verifyingContract:"0xA0Af3739fBC126C287D2fd0b5372d939Baa36B17"},pe=e=>({types:{EIP712Domain:[{name:"name",type:"string"},{name:"version",type:"string"},{name:"chainId",type:"uint256"},{name:"verifyingContract",type:"address"}],Signin:[{name:"method",type:"string"},{name:"text",type:"string"}]},domain:K,primaryType:"Signin",message:{method:"signin",text:e}}),me=async(e,t)=>{const n=pe(e);try{const a=await F(n,t);return c(r.challengeSigned,{signature:a}),a}catch(a){throw s(r.challengeNotSigned,a),a}},L="authToken",U="expireToken",we=12e5,ge=e=>{try{localStorage.setItem(L,e),localStorage.setItem(U,Date.now()+we),c(r.token,"JWT token received")}catch(t){s(r.token,t)}},H=()=>localStorage.getItem(L);var T={signChallenge:me,setToken:ge,getToken:H,isLogged:()=>{if(H()){const t=localStorage.getItem(U);if(t&&t>Date.now())return!0}return!1}};const v={claimConfirmed:"claimConfirmed",claimAlice:"claimAlice"};var d={saveConfirmedClaim:e=>{localStorage.setItem(v.claimConfirmed,JSON.stringify(e))},getConfirmedClaim:()=>JSON.parse(localStorage.getItem(v.claimConfirmed)),saveClaimAlice:e=>{localStorage.setItem(v.claimAlice,JSON.stringify(e))},getClaimAlice:()=>JSON.parse(localStorage.getItem(v.claimAlice))};const he=(e,t=2)=>new i.default(e+"").toFixed(t),fe=(e,t)=>{const n=new i.default(e+""),a=new i.default(t+"");return n.minus(a).toFixed()},G=(e,t)=>{const n=new i.default(e+""),a=new i.default(t+"");return n.plus(a).toFixed()},be=(e,t=2)=>new i.default(e+"").toFixed(t),R=e=>{if(e==="0"||e===0)return"10";if(j(e,1)){const n=e.replace("0.","").length;console.log("l",n);const a=J(10,n);console.log({p:a});const o=N(e,a);console.log({b:o});const l=R(o);console.log({c:l});const b=S(l,a);return console.log({d:b}),b}else{const t=N(S(e,10,0,i.default.ROUND_UP),10);return t===e+""?R(G(e,1)):t}},N=(e,t,n=18,a=i.default.ROUND_FLOOR)=>{let o=new i.default(e+"");const l=new i.default(t+"");return o=o.times(l).toFixed(),n=parseInt(n),B(o,n,a)},Ce=(e,t,n=18)=>N(e,t,n),S=(e,t,n=18,a=i.default.ROUND_FLOOR)=>{let o=new i.default(e+"");const l=new i.default(t+"");return o=o.div(l).toFixed(),n=parseInt(n),B(o,n,a)},Te=(e,t,n=18)=>S(e,t,n),J=(e,t)=>{const n=new i.default(e+""),a=new i.default(t+"");return n.pow(a)},ve=(e,t)=>{const n=new i.default(e+""),a=new i.default(t+"");return n.eq(a)},j=(e,t)=>{const n=new i.default(e+""),a=new i.default(t+"");return n.lt(a)},Ne=(e,t)=>{const n=new i.default(e+""),a=new i.default(t+"");return n.gt(a)},Se=(e,t)=>{const n=new i.default(e+""),a=new i.default(t+"");return n.lte(a)},Ee=(e,t)=>{const n=new i.default(e+""),a=new i.default(t+"");return n.gte(a)},ke=e=>new i.default(e+"").isNaN(),B=(e,t,n)=>new i.default(e+"").dp(parseInt(t),n).toFixed();var m={minus:fe,plus:G,times:N,div:S,pow:J,eq:ve,lt:j,gt:Ne,lte:Se,gte:Ee,isNaN:ke,dp:B,negated:e=>new i.default(e+"").negated().toFixed(),timesFloor:Ce,divFloor:Te,toFixed:he,roundUpToTen:R,roundDecimals:be};const E="0xeA085D9698651e76750F07d0dE0464476187b3ca",Ae="wallet.withdraw",Y=e=>{const t=d.getConfirmedClaim();if(t){const n=t.type===Ae,a=n?t.id+1:t.id,o=n?1:t.nonce+1;if(a!==e.id)throw new Error(`Invalid claim id: ${e.id} - last claim id: ${t.id}${n?". id must change after withdraw":""}`);if(o!==e.nonce)throw new Error(`Invalid claim nonce: ${e.nonce} ${n?" - channel id is changed":`- last claim nonce: ${t.nonce}`}`);if(e.addresses[1]!==E)throw new Error(`Invalid address of Server: ${e.addresses[1]} - expected: ${E}`);const l=m.minus(t.cumulativeDebits[1],t.cumulativeDebits[0]),b=m.plus(l,e.amount);z(b,e.cumulativeDebits)}else{if(e.id!==1)throw new Error(`Invalid claim id: ${e.id}`);if(e.nonce!==1)throw new Error(`Invalid claim nonce: ${e.nonce}`);if(e.addresses[1]!==E)throw new Error(`Invalid address of Server: ${e.addresses[1]} - expected: ${E}`);const n=e.amount;z(n,e.cumulativeDebits)}return!0},z=(e,t)=>{if(m.gt(e,0)){if(!m.eq(t[0],0))throw new Error(`Invalid claim cumulative debit of Client: ${t[0]} - expected: 0`);if(!m.eq(t[1],e))throw new Error(`Invalid claim cumulative debit of Server: ${t[1]} - expected: ${e}`)}else{if(!m.eq(t[0],m.negated(e)))throw new Error(`Invalid claim cumulative debit of Client: ${t[0]} - expected: ${-e}`);if(!m.eq(t[1],0))throw new Error(`Invalid claim cumulative debit of Server: ${t[1]} - expected: 0`)}},De=e=>{let t=Y(e);if(t){const n=d.getClaimAlice();n&&(t=_(e,n))}return t},_=(e,t,n=!1)=>{if(t.id!==e.id)throw new Error(`Invalid claim id: ${e.id} - saved claim id: ${t.id}`);const a=n?e.nonce-1:e.nonce;if(t.nonce!==a)throw new Error(`Invalid claim nonce: ${e.nonce} - saved claim nonce: ${t.nonce}`);if(t.cumulativeDebits[0]!==e.cumulativeDebits[0])throw new Error(`Invalid claim cumulative debit of Client: ${e.cumulativeDebits[0]} - saved claim: ${t.cumulativeDebits[0]}`);if(t.cumulativeDebits[1]!==e.cumulativeDebits[1])throw new Error(`Invalid claim cumulative debit of Server: ${e.cumulativeDebits[1]} - saved claim: ${t.cumulativeDebits[1]}`);const o=n?"wallet.withdraw":t.type;if(e.type!==o)throw new Error(`Invalid claim type: ${e.type} - saved claim type: ${t.type}`);if(t.addresses[0]!==e.addresses[0])throw new Error(`Invalid address of Client: ${e.addresses[0]} - saved claim: ${t.addresses[0]}`);if(t.addresses[1]!==e.addresses[1])throw new Error(`Invalid address of Server: ${e.addresses[1]} - saved claim: ${t.addresses[1]}`);if(!n&&t.timestamp!==e.timestamp)throw new Error(`Invalid timestamp of Server: ${e.timestamp} - saved claim: ${t.timestamp}`);return!0};var h={isValidNewClaim:Y,isValidClaimAlice:De,areEqualClaims:_,isValidWithdraw:e=>{const t=d.getConfirmedClaim();return t?_(e,t,!0):!1}},Ie=[{anonymous:!1,inputs:[{components:[{components:[{internalType:"uint256",name:"id",type:"uint256"},{internalType:"uint256",name:"nonce",type:"uint256"},{internalType:"uint256",name:"timestamp",type:"uint256"},{internalType:"uint256[]",name:"cumulativeDebits",type:"uint256[]"}],internalType:"struct VaultV1.ClaimTransaction",name:"claimTransaction",type:"tuple"},{internalType:"uint256",name:"timestamp",type:"uint256"},{internalType:"address",name:"requester",type:"address"}],indexed:!1,internalType:"struct VaultV1.EmergencyWithdrawRequest",name:"emergencyWithdrawRequest",type:"tuple"}],name:"InitEmergencyWithdraw",type:"event"},{anonymous:!1,inputs:[{indexed:!0,internalType:"bytes32",name:"role",type:"bytes32"},{indexed:!0,internalType:"bytes32",name:"previousAdminRole",type:"bytes32"},{indexed:!0,internalType:"bytes32",name:"newAdminRole",type:"bytes32"}],name:"RoleAdminChanged",type:"event"},{anonymous:!1,inputs:[{indexed:!0,internalType:"bytes32",name:"role",type:"bytes32"},{indexed:!0,internalType:"address",name:"account",type:"address"},{indexed:!0,internalType:"address",name:"sender",type:"address"}],name:"RoleGranted",type:"event"},{anonymous:!1,inputs:[{indexed:!0,internalType:"bytes32",name:"role",type:"bytes32"},{indexed:!0,internalType:"address",name:"account",type:"address"},{indexed:!0,internalType:"address",name:"sender",type:"address"}],name:"RoleRevoked",type:"event"},{anonymous:!1,inputs:[{components:[{components:[{internalType:"uint256",name:"id",type:"uint256"},{internalType:"uint256",name:"nonce",type:"uint256"},{internalType:"uint256",name:"timestamp",type:"uint256"},{internalType:"uint256[]",name:"cumulativeDebits",type:"uint256[]"}],internalType:"struct VaultV1.ClaimTransaction",name:"claimTransaction",type:"tuple"},{internalType:"uint256",name:"timestamp",type:"uint256"},{internalType:"address",name:"requester",type:"address"}],indexed:!1,internalType:"struct VaultV1.EmergencyWithdrawRequest",name:"emergencyWithdrawRequest",type:"tuple"},{indexed:!1,internalType:"string",name:"cause",type:"string"}],name:"StopEmergencyWithdraw",type:"event"},{anonymous:!1,inputs:[{components:[{internalType:"uint256",name:"id",type:"uint256"},{internalType:"uint256",name:"nonce",type:"uint256"},{internalType:"uint256",name:"timestamp",type:"uint256"},{internalType:"uint256[]",name:"cumulativeDebits",type:"uint256[]"}],indexed:!1,internalType:"struct VaultV1.ClaimTransaction",name:"claimTransaction",type:"tuple"}],name:"Withdraw",type:"event"},{inputs:[],name:"DEFAULT_ADMIN_ROLE",outputs:[{internalType:"bytes32",name:"",type:"bytes32"}],stateMutability:"view",type:"function"},{inputs:[{internalType:"address",name:"clientAddress",type:"address"}],name:"balanceOf",outputs:[{internalType:"uint256",name:"",type:"uint256"}],stateMutability:"view",type:"function"},{inputs:[{internalType:"address",name:"",type:"address"}],name:"balances",outputs:[{internalType:"uint256",name:"",type:"uint256"}],stateMutability:"view",type:"function"},{inputs:[{internalType:"uint256",name:"amount",type:"uint256"}],name:"deposit",outputs:[],stateMutability:"nonpayable",type:"function"},{inputs:[{internalType:"address",name:"account",type:"address"},{internalType:"uint256",name:"amount",type:"uint256"}],name:"depositFor",outputs:[],stateMutability:"nonpayable",type:"function"},{inputs:[],name:"emergencyWithdrawAlice",outputs:[],stateMutability:"nonpayable",type:"function"},{inputs:[{internalType:"address",name:"",type:"address"}],name:"emergencyWithdrawRequests",outputs:[{components:[{internalType:"uint256",name:"id",type:"uint256"},{internalType:"uint256",name:"nonce",type:"uint256"},{internalType:"uint256",name:"timestamp",type:"uint256"},{internalType:"uint256[]",name:"cumulativeDebits",type:"uint256[]"}],internalType:"struct VaultV1.ClaimTransaction",name:"claimTransaction",type:"tuple"},{internalType:"uint256",name:"timestamp",type:"uint256"},{internalType:"address",name:"requester",type:"address"}],stateMutability:"view",type:"function"},{inputs:[],name:"getChainId",outputs:[{internalType:"uint256",name:"",type:"uint256"}],stateMutability:"view",type:"function"},{inputs:[{internalType:"bytes32",name:"role",type:"bytes32"}],name:"getRoleAdmin",outputs:[{internalType:"bytes32",name:"",type:"bytes32"}],stateMutability:"view",type:"function"},{inputs:[{internalType:"bytes32",name:"role",type:"bytes32"},{internalType:"address",name:"account",type:"address"}],name:"grantRole",outputs:[],stateMutability:"nonpayable",type:"function"},{inputs:[{internalType:"bytes32",name:"role",type:"bytes32"},{internalType:"address",name:"account",type:"address"}],name:"hasRole",outputs:[{internalType:"bool",name:"",type:"bool"}],stateMutability:"view",type:"function"},{inputs:[{components:[{internalType:"uint256",name:"id",type:"uint256"},{internalType:"address[]",name:"addresses",type:"address[]"},{internalType:"uint256",name:"nonce",type:"uint256"},{internalType:"uint256",name:"timestamp",type:"uint256"},{internalType:"string",name:"messageForAlice",type:"string"},{internalType:"uint256[]",name:"cumulativeDebits",type:"uint256[]"},{internalType:"bytes[]",name:"signatures",type:"bytes[]"}],internalType:"struct VaultV1.ClaimRequest",name:"req",type:"tuple"}],name:"initEmergencyWithdrawAlice",outputs:[],stateMutability:"nonpayable",type:"function"},{inputs:[],name:"initEmergencyWithdrawAliceWithoutClaim",outputs:[],stateMutability:"nonpayable",type:"function"},{inputs:[{internalType:"address",name:"alice",type:"address"}],name:"initEmergencyWithdrawBob",outputs:[],stateMutability:"nonpayable",type:"function"},{inputs:[{internalType:"address",name:"tokenAddress",type:"address"},{internalType:"address",name:"serverAddress",type:"address"},{internalType:"string",name:"name",type:"string"},{internalType:"string",name:"version",type:"string"}],name:"initialize",outputs:[],stateMutability:"nonpayable",type:"function"},{inputs:[{internalType:"bytes32",name:"role",type:"bytes32"},{internalType:"address",name:"account",type:"address"}],name:"renounceRole",outputs:[],stateMutability:"nonpayable",type:"function"},{inputs:[{internalType:"bytes32",name:"role",type:"bytes32"},{internalType:"address",name:"account",type:"address"}],name:"revokeRole",outputs:[],stateMutability:"nonpayable",type:"function"},{inputs:[{components:[{internalType:"uint256",name:"id",type:"uint256"},{internalType:"address[]",name:"addresses",type:"address[]"},{internalType:"uint256",name:"nonce",type:"uint256"},{internalType:"uint256",name:"timestamp",type:"uint256"},{internalType:"string",name:"messageForAlice",type:"string"},{internalType:"uint256[]",name:"cumulativeDebits",type:"uint256[]"},{internalType:"bytes[]",name:"signatures",type:"bytes[]"}],internalType:"struct VaultV1.ClaimRequest",name:"req",type:"tuple"}],name:"stopEmergencyWithdraw",outputs:[],stateMutability:"nonpayable",type:"function"},{inputs:[{internalType:"bytes4",name:"interfaceId",type:"bytes4"}],name:"supportsInterface",outputs:[{internalType:"bool",name:"",type:"bool"}],stateMutability:"view",type:"function"},{inputs:[{components:[{internalType:"uint256",name:"id",type:"uint256"},{internalType:"address[]",name:"addresses",type:"address[]"},{internalType:"uint256",name:"nonce",type:"uint256"},{internalType:"uint256",name:"timestamp",type:"uint256"},{internalType:"string",name:"messageForAlice",type:"string"},{internalType:"uint256[]",name:"cumulativeDebits",type:"uint256[]"},{internalType:"bytes[]",name:"signatures",type:"bytes[]"}],internalType:"struct VaultV1.ClaimRequest",name:"req",type:"tuple"}],name:"verify",outputs:[],stateMutability:"view",type:"function"},{inputs:[{components:[{internalType:"uint256",name:"id",type:"uint256"},{internalType:"address[]",name:"addresses",type:"address[]"},{internalType:"uint256",name:"nonce",type:"uint256"},{internalType:"uint256",name:"timestamp",type:"uint256"},{internalType:"string",name:"messageForAlice",type:"string"},{internalType:"uint256[]",name:"cumulativeDebits",type:"uint256[]"},{internalType:"bytes[]",name:"signatures",type:"bytes[]"}],internalType:"struct VaultV1.ClaimRequest",name:"req",type:"tuple"}],name:"withdrawAlice",outputs:[],stateMutability:"nonpayable",type:"function"},{inputs:[{internalType:"address",name:"",type:"address"}],name:"withdrawTransactions",outputs:[{internalType:"uint256",name:"id",type:"uint256"},{internalType:"uint256",name:"nonce",type:"uint256"},{internalType:"uint256",name:"timestamp",type:"uint256"}],stateMutability:"view",type:"function"}];const Re="0xA0Af3739fBC126C287D2fd0b5372d939Baa36B17",X=(e,t=Re,n=Ie)=>{const a=new x.default(e);return new a.eth.Contract(n,t)},Be=async(e,t,n)=>await e.methods[t](n).call();var $={getVaultBalance:async(e,t)=>{const n=X(t);return{balance:await Be(n,"balanceOf",e)}},withdrawConsensually:async(e,t)=>{const n=X(t),a=new x.default(t),o=e.addresses[0];try{const l=await n.methods.withdrawAlice(e).estimateGas({from:o}),xe={gasPrice:await a.eth.getGasPrice(),from:o,gas:l};try{await n.methods.withdrawAlice(e).send(xe).on("transactionHash",C=>{console.log("txHash",C)}).on("receipt",C=>{console.log("receipt",C)})}catch(C){throw new Error(C)}}catch(l){throw new Error(l)}}};const _e=async(e,t)=>{if(await h.isValidNewClaim(e)){if(!k(e))throw new Error("Server's signature is not verified");if(await ee(e,t)===!0)return await V(e),d.saveConfirmedClaim(e),e;throw new Error("Server's balance is not enough")}},Q=e=>({types:{EIP712Domain:[{name:"name",type:"string"},{name:"version",type:"string"},{name:"chainId",type:"uint256"},{name:"verifyingContract",type:"address"}],Claim:[{name:"id",type:"uint256"},{name:"alice",type:"address"},{name:"bob",type:"address"},{name:"nonce",type:"uint256"},{name:"timestamp",type:"uint256"},{name:"messageForAlice",type:"string"},{name:"cumulativeDebitAlice",type:"uint256"},{name:"cumulativeDebitBob",type:"uint256"}]},domain:K,primaryType:"Claim",message:{id:e.id,alice:e.addresses[0],bob:e.addresses[1],nonce:e.nonce,timestamp:e.timestamp,messageForAlice:e.messageForAlice,cumulativeDebitAlice:e.cumulativeDebits[0],cumulativeDebitBob:e.cumulativeDebits[1]}}),k=(e,t=!1)=>{let n=1;t&&(n=0);const a=Q(e),o=e.signatures[n];try{return y.recoverTypedSignature({data:a,signature:o,version:y.SignTypedDataVersion.V4}).toUpperCase()===e.addresses[n].toUpperCase()}catch{return!1}},$e=async(e,t)=>{const n=Z(e);if(h.isValidNewClaim(e),n){if(await ee(e,t)===!0)return await V(e),d.saveClaimAlice(e),e;throw new Error("Not enough balance")}},Z=e=>{const t=d.getClaimAlice();if(t&&t.id===e.id&&t.nonce>=e.nonce)throw new Error(`Claim with nonce ${e.nonce} is already signed`);return!0},ee=async(e,t)=>{const n=e.amount<0?0:1;return n===1?!0:await Ve(e,n,t)},Ve=async(e,t,n)=>{try{const{balance:a}=await $.getVaultBalance(e.addresses[t],n);return!!m.gte(a,e.cumulativeDebits[t])}catch{throw new Error("Can't get balance from Vault")}},V=async e=>{const t=Q(e),n=e.addresses[0];e.signatures[0]=await F(t,n)};var f={pay:$e,payReceived:async e=>{if(h.isValidClaimAlice(e))if(k(e))d.saveConfirmedClaim(e);else throw new Error("Server's signature is not verified")},win:_e,signWithdraw:async(e,t)=>{const n=Z(e);if(h.isValidWithdraw(e)&&n)return await V(e),d.saveClaimAlice(e),e},lastClaim:e=>{const t=d.getConfirmedClaim();if(!t&&e===null)return!0;if(!t&&e&&e.nonce)return d.saveConfirmedClaim(e),!0;if(t&&e===null)return{handshake:t};if(e.id>=t.id&&e.nonce>t.nonce)return k(e,!0)&&k(e)?(d.saveConfirmedClaim(e),!0):{handshake:t};try{return h.areEqualClaims(e,t)===!0&&e.signatures[0]===t.signatures[0]&&e.signatures[1]===t.signatures[1]?!0:{handshake:t}}catch{return{handshake:t}}}},u={pay:async e=>{try{await p()}catch(n){throw s(r.claimNotSigned,n),n}const t=w();try{const n=await f.pay(e,t);return c(r.claimSigned,{claim:n}),n}catch(n){throw s(r.claimNotSigned,n),n}},payReceived:async e=>{try{await p()}catch(t){throw s(r.claimNotConfirmed,t),t}try{await f.payReceived(e),c(r.claimConfirmed,{claim:e})}catch(t){throw s(r.claimNotConfirmed,{error:t,claim:e}),t}},win:async e=>{try{await p()}catch(n){throw s(r.winNotConfirmed,n),n}const t=w();try{const n=await f.win(e,t);return c(r.winClaimSigned,{claim:n}),n}catch(n){throw s(r.winNotConfirmed,n),n}},lastClaim:e=>{if(e&&e.hasOwnProperty("error")){s(r.claimNotSynced,e.error);return}const t=f.lastClaim(e);if(t===!0)c(r.claimSynced,"Claims are synced");else return s(r.claimNotSynced,{lastClaim:t}),t},signWithdraw:async e=>{try{await p()}catch(n){throw s(r.claimNotSigned,n),n}const t=w();try{const n=await f.signWithdraw(e,t);return c(r.claimSigned,{claim:n}),n}catch(n){throw s(r.claimNotSigned,n),n}},withdrawConsensually:async e=>{try{await p()}catch(n){throw s(r.withdraw,n),n}const t=w();try{await $.withdrawConsensually(e,t),c(r.withdraw,"Consensual withdraw is sent to blockchain")}catch(n){s(r.withdraw,n)}},getVaultBalance:async e=>{const t=w();try{return await $.getVaultBalance(e,t)}catch(n){console.error(n)}}};const Me=async e=>{if(e){const t=JSON.parse(e);if(t.hasOwnProperty("handshake"))return u.lastClaim(t.handshake);{const n=t;if(n&&n.type==="ticket.play"){if(!n.signatures[0]&&!n.signatures[1])return await u.pay(n);n.signatures[0]&&n.signatures[1]&&await u.payReceived(n)}else if(n&&n.type==="ticket.win"){if(!n.signatures[0]&&n.signatures[1])return await u.win(n)}else if(n&&n.type==="wallet.withdraw"){if(!n.signatures[0]&&!n.signatures[1])return await u.signWithdraw(n);n.signatures[0]&&n.signatures[1]&&(await u.payReceived(n),await u.withdrawConsensually(n))}}}};return{getAddress:ye,isMetamaskInstalled:O,isRightNet:W,setRightNet:le,addEventListener:ne,pay:u.pay,payReceived:u.payReceived,win:u.win,receiveMsg:Me,signChallenge:T.signChallenge,setToken:T.setToken,getToken:T.getToken,isLogged:T.isLogged,lastClaim:u.lastClaim,getVaultBalance:u.getVaultBalance}});
