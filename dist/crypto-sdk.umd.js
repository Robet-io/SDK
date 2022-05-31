(function(f,A){typeof exports=="object"&&typeof module!="undefined"?module.exports=A(require("@metamask/eth-sig-util"),require("bignumber.js"),require("web3")):typeof define=="function"&&define.amd?define(["@metamask/eth-sig-util","bignumber.js","web3"],A):(f=typeof globalThis!="undefined"?globalThis:f||self,f.cryptoSDK=A(f["@metamask/eth-sig-util"],f.bignumber.js,f.Web3))})(this,function(f,A,he){"use strict";function J(e){return e&&typeof e=="object"&&"default"in e?e:{default:e}}var l=J(A),E=J(he);const be=e=>{document.addEventListener(_,e)},fe=e=>{document.addEventListener(j,e)},p=(e,t)=>{const n=new CustomEvent(_,{detail:{type:e,msg:t}});document.dispatchEvent(n)},Te=e=>{const t=new CustomEvent(j,{detail:JSON.parse(e)});document.dispatchEvent(t)},s=(e,t)=>{const n=new CustomEvent(_,{detail:{type:e,msg:t,error:!0}});document.dispatchEvent(n)},r={network:"network",accountsChanged:"accountsChanged",chainChanged:"chainChanged",message:"message",address:"address",wrongNetworkOnGetAddress:"wrongNetworkOnGetAddress",metamaskNotInstalled:"metamaskNotInstalled",general:"general",claimNotSigned:"claimNotSigned",claimSigned:"claimSigned",claimConfirmed:"claimConfirmed",claimNotConfirmed:"claimNotConfirmed",winClaimSigned:"winClaimSigned",winNotConfirmed:"winNotConfirmed",challengeSigned:"challengeSigned",challengeNotSigned:"challengeNotSigned",claimSynced:"claimSynced",claimNotSynced:"claimNotSynced",token:"jwtToken",withdraw:"withdraw",withdrawReceipt:"withdrawReceipt",withdrawHash:"withdrawHash",depositDega:"depositDega",withdrawDega:"withdrawDega",approveDega:"approveDega",getBalance:"getBalance",degaAllowed:"degaAllowed"},_="cryptoSDK",j="cryptoSDK_WS",x="97",Ce="BSC Testnet",ve="https://data-seed-prebsc-1-s1.binance.org",De="https://testnet.bscscan.com/",Ne="BNB",Ae="BNB",Ee="18",y=async()=>{const e=z(),t=m();if(t){const n=Number(await t.request({method:"eth_chainId"}));if(Array.isArray(e)){if(e.includes(n))return!0;{const a="Please change your network on Metamask. Valid networks are: "+V(e);throw new Error(a)}}else if(Number(n)!==Number(e)){const a=`Please set your network on Metamask to ${V(e)}`;throw new Error(a)}else return!0}},V=(e=!1)=>{const t=[];if(t[1]="Ethereum Mainnet",t[3]="Ethereum Ropsten",t[42]="Ethereum Kovan",t[4]="Ethereum Rinkeby",t[5]="Ethereum Goerli",t[56]="Binance Smart Chain",t[97]="Binance Smart Chain Testnet",e)if(Array.isArray(e)){const n=[];for(let a=0;a<e.length;a++)n.push(t[e[a]]);return n}else return t[e]?t[e]:(console.error(`Network ID ${e} Not found in the networksNames list`),V(x));else return t},z=()=>[Number(x)],X=async()=>{try{const e=await y();return p(r.network,e),e}catch(e){return s(r.network,e),!1}},Be=async()=>{if(window.ethereum){const e=window.ethereum,n=[{chainId:`0x${Number(x).toString(16)}`,chainName:Ce,nativeCurrency:{name:Ne,symbol:Ae,decimals:Ee},rpcUrls:[ve],blockExplorerUrls:[De]}];try{await e.request({method:"wallet_addEthereumChain",params:n}),await y()?p(r.network,"Success, network is set to the right one"):s(r.network,"Add net error: network is not changed")}catch(a){s(r.network,`Add net error: ${a}`)}}else throw window.web3?(s(r.network,"This version of Metamask supports only manual network switching"),new Error("This version of Metamask supports only manual network switching")):(s(r.network,"Metamask is not installed"),new Error("Metamask is not installed"))},m=()=>{if(window.ethereum)return window.ethereum;if(window.web3)return window.web3.currentProvider;throw s(r.metamaskNotInstalled,{error:"Metamask is not installed"}),new Error("Metamask is not installed")},Q=async e=>{try{await X()?p(r.chainChanged,{chainId:e}):s(r.chainChanged,{chainId:e})}catch{s(r.chainChanged,{chainId:e})}},Se=()=>{window.ethereum?(window.ethereum.chainId||(window.ethereum.chainId="97"),window.ethereum.on("accountsChanged",async e=>{console.log("#### - Metamask: accountsChanged - accounts",e),p(r.accountsChanged,{accounts:e})}),window.ethereum.on("chainChanged",async e=>{console.log("#### - Metamask: chainChanged",e),await Q(e)}),window.ethereum.on("error",async e=>{console.log("#### - Metamask: error",e),s(r.error,e)})):window.web3&&(window.web3.currentProvider.on("accountsChanged",async e=>{console.log("#### - Metamask web3: accountsChanged - accounts",e),p(r.accountsChanged,{accounts:e})}),window.web3.currentProvider.on("chainIdChanged",async e=>{console.log("#### - Metamask web3: chainChanged",e),await Q(e)}),window.web3.currentProvider.on("error",async e=>{console.log("#### - Metamask web3: error",e),s(r.error,e)}))},ke=async()=>{if(window.ethereum){const e=await window.ethereum.request({method:"eth_requestAccounts"});if(e&&e[0])return e[0];throw new Error("Can't get address")}else if(window.web3){const e=window.web3.eth.accounts;if(e&&e.length>0)return e[0];throw new Error("Can't get address")}else throw new Error("Metamask is not installed")},Z=()=>!!(window.ethereum||window.web3),ee=async()=>{if(!Z()){const t="Metamask is not installed, unable to get user address";throw s(r.metamaskNotInstalled,t),new Error(t)}const e=z();try{await y(e)}catch(t){throw s(r.wrongNetworkOnGetAddress,t),new Error(t)}try{return{address:await ke()}}catch(t){throw s(r.address,t),new Error(t)}},te=async(e,t)=>(await y(),await m().request({method:"eth_signTypedData_v4",params:[t,JSON.stringify(e)],from:t}));Se();const ne={name:"BSC Testnet",version:"1",chainId:"97",verifyingContract:"0x9b9a5C1Af0A543d7dd243Bea6BDD53458dd0F067"},Ie=e=>({types:{EIP712Domain:[{name:"name",type:"string"},{name:"version",type:"string"},{name:"chainId",type:"uint256"},{name:"verifyingContract",type:"address"}],Signin:[{name:"method",type:"string"},{name:"text",type:"string"}]},domain:ne,primaryType:"Signin",message:{method:"signin",text:e}}),$e=async(e,t)=>{const n=Ie(e);try{const a=await te(n,t);return p(r.challengeSigned,{signature:a}),a}catch(a){throw s(r.challengeNotSigned,a),a}},Me="authToken",Re="expireToken",_e=12e5,ae=e=>`${Me}_${e.toLowerCase()}`,re=e=>`${Re}_${e.toLowerCase()}`,xe=(e,t)=>{try{localStorage.setItem(ae(e),t),localStorage.setItem(re(e),Date.now()+_e),p(r.token,"JWT token received")}catch(n){s(r.token,n)}},se=e=>localStorage.getItem(ae(e));var S={signChallenge:$e,setToken:xe,getToken:se,isLogged:e=>{if(se(e)){const n=localStorage.getItem(re(e));if(n&&n>Date.now())return!0}return!1}};const o=0,u=1,ie={claimConfirmed:"claimConfirmed",claimAlice:"claimAlice"},F=e=>`${ie.claimConfirmed}_${e.toLowerCase()}`,oe=e=>`${ie.claimAlice}_${e.toLowerCase()}`,Ve=e=>{localStorage.setItem(F(e.addresses[o]),JSON.stringify(e))},Fe=e=>JSON.parse(localStorage.getItem(F(e))),We=e=>{localStorage.setItem(oe(e.addresses[o]),JSON.stringify(e))},Le=e=>JSON.parse(localStorage.getItem(oe(e))),qe=e=>{const t=localStorage.getItem(F(e));if(!t)return;const n=Oe(t),a=document.createElement("a"),i=`lastConfirmedClaim-${new Date().toISOString()}.json`;a.setAttribute("href","data:application/json;charset=utf-8,"+encodeURIComponent(n)),a.setAttribute("download",i),a.style.display="none",document.body.appendChild(a),a.click(),document.body.removeChild(a)},Oe=e=>(e=e.replace("{",`{
`),e=e.replace("}",`
}`),e=e.replaceAll(",",`,
`),e);var w={saveConfirmedClaim:Ve,getConfirmedClaim:Fe,saveClaimAlice:We,getClaimAlice:Le,downloadLastClaim:qe};const Pe=(e,t=2)=>new l.default(e+"").toFixed(t),Ke=(e,t)=>{const n=new l.default(e+""),a=new l.default(t+"");return n.minus(a).toFixed()},ce=(e,t)=>{const n=new l.default(e+""),a=new l.default(t+"");return n.plus(a).toFixed()},He=(e,t=2)=>new l.default(e+"").toFixed(t),W=e=>{if(e==="0"||e===0)return"10";if(ue(e,1)){const n=e.replace("0.","").length;console.log("l",n);const a=le(10,n);console.log({p:a});const i=k(e,a);console.log({b:i});const c=W(i);console.log({c});const b=I(c,a);return console.log({d:b}),b}else{const t=k(I(e,10,0,l.default.ROUND_UP),10);return t===e+""?W(ce(e,1)):t}},k=(e,t,n=18,a=l.default.ROUND_FLOOR)=>{let i=new l.default(e+"");const c=new l.default(t+"");return i=i.times(c).toFixed(),n=parseInt(n),L(i,n,a)},Ue=(e,t,n=18)=>k(e,t,n),I=(e,t,n=18,a=l.default.ROUND_FLOOR)=>{let i=new l.default(e+"");const c=new l.default(t+"");return i=i.div(c).toFixed(),n=parseInt(n),L(i,n,a)},Ge=(e,t,n=18)=>I(e,t,n),le=(e,t)=>{const n=new l.default(e+""),a=new l.default(t+"");return n.pow(a)},Ye=(e,t)=>{const n=new l.default(e+""),a=new l.default(t+"");return n.eq(a)},ue=(e,t)=>{const n=new l.default(e+""),a=new l.default(t+"");return n.lt(a)},Je=(e,t)=>{const n=new l.default(e+""),a=new l.default(t+"");return n.gt(a)},je=(e,t)=>{const n=new l.default(e+""),a=new l.default(t+"");return n.lte(a)},ze=(e,t)=>{const n=new l.default(e+""),a=new l.default(t+"");return n.gte(a)},Xe=e=>new l.default(e+"").isNaN(),L=(e,t,n)=>new l.default(e+"").dp(parseInt(t),n).toFixed();var d={minus:Ke,plus:ce,times:k,div:I,pow:le,eq:Ye,lt:ue,gt:Je,lte:je,gte:ze,isNaN:Xe,dp:L,negated:e=>new l.default(e+"").negated().toFixed(),timesFloor:Ue,divFloor:Ge,toFixed:Pe,roundUpToTen:W,roundDecimals:He,abs:e=>new l.default(e+"").abs().toFixed()};const q=(e,t=18)=>{if(!e)return;const i=new E.default().utils.fromWei(e).split("."),c=i[0].toString().replace(/\b0+(?!$)/g,"").replace(/\B(?=(\d{3})+(?!\d))/g,",");if(i[1])if(t){const b=i[1].substring(0,t).replace(/0+$/,"");return c+`${b?"."+b:""}`}else return c+"."+i[1];else return c},$="0xeA085D9698651e76750F07d0dE0464476187b3ca",de=e=>{const t=w.getConfirmedClaim(e.addresses[o]);if(t){const n=t.closed===1,a=n?t.id+1:t.id,i=n?1:t.nonce+1;if(a!==e.id)throw new Error(`Invalid claim id: ${e.id} - last claim id: ${t.id}${n?". id must change after withdraw":""}`);if(i!==e.nonce)throw new Error(`Invalid claim nonce: ${e.nonce} ${n?" - channel id is changed":`- last claim nonce: ${t.nonce}`}`);if(e.addresses[u]!==$)throw new Error(`Invalid address of Server: ${e.addresses[u]} - expected: ${$}`);const c=n?e.amount:d.plus(d.minus(t.cumulativeDebits[u],t.cumulativeDebits[o]),e.amount);pe(c,e.cumulativeDebits)}else{if(e.id!==1)throw new Error(`Invalid claim id: ${e.id}`);if(e.nonce!==1)throw new Error(`Invalid claim nonce: ${e.nonce}`);if(e.addresses[u]!==$)throw new Error(`Invalid address of Server: ${e.addresses[u]} - expected: ${$}`);const n=e.amount;pe(n,e.cumulativeDebits)}return Qe(e),!0},Qe=e=>{if(e.closed===0){const t=`You ${d.gt(e.amount,"0")?"receive":"spend"}: ${q(d.abs(e.amount))} DE.GA`;if(e.messageForAlice!==t)throw new Error(`Invalid message for Alice: ${e.messageForAlice} - expected: ${t}`)}},pe=(e,t)=>{if(d.gt(e,0)){if(!d.eq(t[o],0))throw new Error(`Invalid claim cumulative debit of Client: ${t[o]} - expected: 0`);if(!d.eq(t[u],e))throw new Error(`Invalid claim cumulative debit of Server: ${t[u]} - expected: ${e}`)}else{if(!d.eq(t[o],d.negated(e)))throw new Error(`Invalid claim cumulative debit of Client: ${t[o]} - expected: ${-e}`);if(!d.eq(t[u],0))throw new Error(`Invalid claim cumulative debit of Server: ${t[u]} - expected: 0`)}},Ze=e=>{let t=de(e);if(t){const n=w.getClaimAlice(e.addresses[o]);n&&(t=O(e,n))}return t},O=(e,t,n=!1)=>{if(n&&t.closed===1){if(t.id+1!==e.id)throw new Error(`Invalid claim id: ${e.id} - channel was closed and saved claim id: ${t.id}`)}else if(t.id!==e.id)throw new Error(`Invalid claim id: ${e.id} - saved claim id: ${t.id}`);if(n&&t.closed===1){if(e.nonce!==1)throw new Error(`Invalid claim nonce: ${e.nonce} - channel was closed`)}else{const a=n?e.nonce-1:e.nonce;if(t.nonce!==a)throw new Error(`Invalid claim nonce: ${e.nonce} - saved claim nonce: ${t.nonce}`)}if(t.cumulativeDebits[o]!==e.cumulativeDebits[o])throw new Error(`Invalid claim cumulative debit of Client: ${e.cumulativeDebits[o]} - saved claim: ${t.cumulativeDebits[o]}`);if(t.cumulativeDebits[u]!==e.cumulativeDebits[u])throw new Error(`Invalid claim cumulative debit of Server: ${e.cumulativeDebits[u]} - saved claim: ${t.cumulativeDebits[u]}`);if(t.addresses[o]!==e.addresses[o])throw new Error(`Invalid address of Client: ${e.addresses[o]} - saved claim: ${t.addresses[o]}`);if(t.addresses[u]!==e.addresses[u])throw new Error(`Invalid address of Server: ${e.addresses[u]} - saved claim: ${t.addresses[u]}`);if(!n&&t.timestamp!==e.timestamp)throw new Error(`Invalid timestamp of Server: ${e.timestamp} - saved claim: ${t.timestamp}`);if(!n&&t.messageForAlice!==e.messageForAlice)throw new Error(`Invalid message for Alice: ${e.messageForAlice} - expected: ${t.messageForAlice}`);return!0},et=(e,t)=>{tt(e,t);const n=w.getConfirmedClaim(e.addresses[o]);return n?O(e,n,!0):!0},tt=(e,t)=>{const n=d.plus(t,d.minus(e.cumulativeDebits[u],e.cumulativeDebits[o])),a=`You are withdrawing: ${q(n)} DE.GA`;if(e.messageForAlice!==a)throw new Error(`Invalid message for Alice: ${e.messageForAlice} - expected: ${a}`)};var B={isValidNewClaim:de,isValidClaimAlice:Ze,areEqualClaims:O,isValidWithdraw:et},nt=[{anonymous:!1,inputs:[{components:[{components:[{internalType:"uint256",name:"id",type:"uint256"},{internalType:"uint256",name:"nonce",type:"uint256"},{internalType:"uint256",name:"timestamp",type:"uint256"},{internalType:"uint256[]",name:"cumulativeDebits",type:"uint256[]"}],internalType:"struct VaultV1.ClaimTransaction",name:"claimTransaction",type:"tuple"},{internalType:"uint256",name:"timestamp",type:"uint256"},{internalType:"address",name:"requester",type:"address"}],indexed:!1,internalType:"struct VaultV1.EmergencyWithdrawRequest",name:"emergencyWithdrawRequest",type:"tuple"}],name:"InitEmergencyWithdraw",type:"event"},{anonymous:!1,inputs:[{indexed:!0,internalType:"bytes32",name:"role",type:"bytes32"},{indexed:!0,internalType:"bytes32",name:"previousAdminRole",type:"bytes32"},{indexed:!0,internalType:"bytes32",name:"newAdminRole",type:"bytes32"}],name:"RoleAdminChanged",type:"event"},{anonymous:!1,inputs:[{indexed:!0,internalType:"bytes32",name:"role",type:"bytes32"},{indexed:!0,internalType:"address",name:"account",type:"address"},{indexed:!0,internalType:"address",name:"sender",type:"address"}],name:"RoleGranted",type:"event"},{anonymous:!1,inputs:[{indexed:!0,internalType:"bytes32",name:"role",type:"bytes32"},{indexed:!0,internalType:"address",name:"account",type:"address"},{indexed:!0,internalType:"address",name:"sender",type:"address"}],name:"RoleRevoked",type:"event"},{anonymous:!1,inputs:[{components:[{components:[{internalType:"uint256",name:"id",type:"uint256"},{internalType:"uint256",name:"nonce",type:"uint256"},{internalType:"uint256",name:"timestamp",type:"uint256"},{internalType:"uint256[]",name:"cumulativeDebits",type:"uint256[]"}],internalType:"struct VaultV1.ClaimTransaction",name:"claimTransaction",type:"tuple"},{internalType:"uint256",name:"timestamp",type:"uint256"},{internalType:"address",name:"requester",type:"address"}],indexed:!1,internalType:"struct VaultV1.EmergencyWithdrawRequest",name:"emergencyWithdrawRequest",type:"tuple"},{indexed:!1,internalType:"string",name:"cause",type:"string"}],name:"StopEmergencyWithdraw",type:"event"},{anonymous:!1,inputs:[{components:[{internalType:"uint256",name:"id",type:"uint256"},{internalType:"uint256",name:"nonce",type:"uint256"},{internalType:"uint256",name:"timestamp",type:"uint256"},{internalType:"uint256[]",name:"cumulativeDebits",type:"uint256[]"}],indexed:!1,internalType:"struct VaultV1.ClaimTransaction",name:"claimTransaction",type:"tuple"}],name:"WithdrawAlice",type:"event"},{anonymous:!1,inputs:[{indexed:!1,internalType:"uint256",name:"amount",type:"uint256"}],name:"WithdrawBob",type:"event"},{inputs:[],name:"DEFAULT_ADMIN_ROLE",outputs:[{internalType:"bytes32",name:"",type:"bytes32"}],stateMutability:"view",type:"function"},{inputs:[{internalType:"address",name:"clientAddress",type:"address"}],name:"balanceOf",outputs:[{internalType:"uint256",name:"",type:"uint256"}],stateMutability:"view",type:"function"},{inputs:[{internalType:"address",name:"",type:"address"}],name:"balances",outputs:[{internalType:"uint256",name:"",type:"uint256"}],stateMutability:"view",type:"function"},{inputs:[{internalType:"uint256",name:"amount",type:"uint256"}],name:"deposit",outputs:[],stateMutability:"nonpayable",type:"function"},{inputs:[{internalType:"address",name:"account",type:"address"},{internalType:"uint256",name:"amount",type:"uint256"}],name:"depositFor",outputs:[],stateMutability:"nonpayable",type:"function"},{inputs:[],name:"emergencyWithdrawAlice",outputs:[],stateMutability:"nonpayable",type:"function"},{inputs:[{internalType:"address",name:"",type:"address"}],name:"emergencyWithdrawRequests",outputs:[{components:[{internalType:"uint256",name:"id",type:"uint256"},{internalType:"uint256",name:"nonce",type:"uint256"},{internalType:"uint256",name:"timestamp",type:"uint256"},{internalType:"uint256[]",name:"cumulativeDebits",type:"uint256[]"}],internalType:"struct VaultV1.ClaimTransaction",name:"claimTransaction",type:"tuple"},{internalType:"uint256",name:"timestamp",type:"uint256"},{internalType:"address",name:"requester",type:"address"}],stateMutability:"view",type:"function"},{inputs:[],name:"getChainId",outputs:[{internalType:"uint256",name:"",type:"uint256"}],stateMutability:"view",type:"function"},{inputs:[{internalType:"bytes32",name:"role",type:"bytes32"}],name:"getRoleAdmin",outputs:[{internalType:"bytes32",name:"",type:"bytes32"}],stateMutability:"view",type:"function"},{inputs:[{internalType:"bytes32",name:"role",type:"bytes32"},{internalType:"address",name:"account",type:"address"}],name:"grantRole",outputs:[],stateMutability:"nonpayable",type:"function"},{inputs:[{internalType:"bytes32",name:"role",type:"bytes32"},{internalType:"address",name:"account",type:"address"}],name:"hasRole",outputs:[{internalType:"bool",name:"",type:"bool"}],stateMutability:"view",type:"function"},{inputs:[{components:[{internalType:"uint256",name:"id",type:"uint256"},{internalType:"address[]",name:"addresses",type:"address[]"},{internalType:"uint256",name:"nonce",type:"uint256"},{internalType:"uint256",name:"timestamp",type:"uint256"},{internalType:"string",name:"messageForAlice",type:"string"},{internalType:"uint256[]",name:"cumulativeDebits",type:"uint256[]"},{internalType:"bytes[]",name:"signatures",type:"bytes[]"},{internalType:"uint256",name:"closed",type:"uint256"}],internalType:"struct VaultV1.ClaimRequest",name:"req",type:"tuple"}],name:"initEmergencyWithdrawAlice",outputs:[],stateMutability:"nonpayable",type:"function"},{inputs:[],name:"initEmergencyWithdrawAliceWithoutClaim",outputs:[],stateMutability:"nonpayable",type:"function"},{inputs:[{internalType:"address",name:"alice",type:"address"}],name:"initEmergencyWithdrawBob",outputs:[],stateMutability:"nonpayable",type:"function"},{inputs:[{internalType:"address",name:"tokenAddress",type:"address"},{internalType:"address",name:"serverAddress",type:"address"},{internalType:"string",name:"name",type:"string"},{internalType:"string",name:"version",type:"string"}],name:"initialize",outputs:[],stateMutability:"nonpayable",type:"function"},{inputs:[{internalType:"bytes32",name:"role",type:"bytes32"},{internalType:"address",name:"account",type:"address"}],name:"renounceRole",outputs:[],stateMutability:"nonpayable",type:"function"},{inputs:[{internalType:"bytes32",name:"role",type:"bytes32"},{internalType:"address",name:"account",type:"address"}],name:"revokeRole",outputs:[],stateMutability:"nonpayable",type:"function"},{inputs:[{components:[{internalType:"uint256",name:"id",type:"uint256"},{internalType:"address[]",name:"addresses",type:"address[]"},{internalType:"uint256",name:"nonce",type:"uint256"},{internalType:"uint256",name:"timestamp",type:"uint256"},{internalType:"string",name:"messageForAlice",type:"string"},{internalType:"uint256[]",name:"cumulativeDebits",type:"uint256[]"},{internalType:"bytes[]",name:"signatures",type:"bytes[]"},{internalType:"uint256",name:"closed",type:"uint256"}],internalType:"struct VaultV1.ClaimRequest",name:"req",type:"tuple"}],name:"stopEmergencyWithdraw",outputs:[],stateMutability:"nonpayable",type:"function"},{inputs:[{internalType:"bytes4",name:"interfaceId",type:"bytes4"}],name:"supportsInterface",outputs:[{internalType:"bool",name:"",type:"bool"}],stateMutability:"view",type:"function"},{inputs:[{components:[{internalType:"uint256",name:"id",type:"uint256"},{internalType:"address[]",name:"addresses",type:"address[]"},{internalType:"uint256",name:"nonce",type:"uint256"},{internalType:"uint256",name:"timestamp",type:"uint256"},{internalType:"string",name:"messageForAlice",type:"string"},{internalType:"uint256[]",name:"cumulativeDebits",type:"uint256[]"},{internalType:"bytes[]",name:"signatures",type:"bytes[]"},{internalType:"uint256",name:"closed",type:"uint256"}],internalType:"struct VaultV1.ClaimRequest",name:"req",type:"tuple"}],name:"verify",outputs:[],stateMutability:"view",type:"function"},{inputs:[{components:[{internalType:"uint256",name:"id",type:"uint256"},{internalType:"address[]",name:"addresses",type:"address[]"},{internalType:"uint256",name:"nonce",type:"uint256"},{internalType:"uint256",name:"timestamp",type:"uint256"},{internalType:"string",name:"messageForAlice",type:"string"},{internalType:"uint256[]",name:"cumulativeDebits",type:"uint256[]"},{internalType:"bytes[]",name:"signatures",type:"bytes[]"},{internalType:"uint256",name:"closed",type:"uint256"}],internalType:"struct VaultV1.ClaimRequest",name:"req",type:"tuple"}],name:"withdrawAlice",outputs:[],stateMutability:"nonpayable",type:"function"},{inputs:[{internalType:"uint256",name:"amount",type:"uint256"}],name:"withdrawBob",outputs:[],stateMutability:"nonpayable",type:"function"},{inputs:[{internalType:"address",name:"",type:"address"}],name:"withdrawTransactions",outputs:[{internalType:"uint256",name:"id",type:"uint256"},{internalType:"uint256",name:"nonce",type:"uint256"},{internalType:"uint256",name:"timestamp",type:"uint256"}],stateMutability:"view",type:"function"}],M=[{inputs:[],stateMutability:"nonpayable",type:"constructor"},{anonymous:!1,inputs:[{indexed:!0,internalType:"address",name:"owner",type:"address"},{indexed:!0,internalType:"address",name:"spender",type:"address"},{indexed:!1,internalType:"uint256",name:"value",type:"uint256"}],name:"Approval",type:"event"},{anonymous:!1,inputs:[{indexed:!0,internalType:"bytes32",name:"role",type:"bytes32"},{indexed:!0,internalType:"bytes32",name:"previousAdminRole",type:"bytes32"},{indexed:!0,internalType:"bytes32",name:"newAdminRole",type:"bytes32"}],name:"RoleAdminChanged",type:"event"},{anonymous:!1,inputs:[{indexed:!0,internalType:"bytes32",name:"role",type:"bytes32"},{indexed:!0,internalType:"address",name:"account",type:"address"},{indexed:!0,internalType:"address",name:"sender",type:"address"}],name:"RoleGranted",type:"event"},{anonymous:!1,inputs:[{indexed:!0,internalType:"bytes32",name:"role",type:"bytes32"},{indexed:!0,internalType:"address",name:"account",type:"address"},{indexed:!0,internalType:"address",name:"sender",type:"address"}],name:"RoleRevoked",type:"event"},{anonymous:!1,inputs:[{indexed:!0,internalType:"address",name:"from",type:"address"},{indexed:!0,internalType:"address",name:"to",type:"address"},{indexed:!1,internalType:"uint256",name:"value",type:"uint256"}],name:"Transfer",type:"event"},{inputs:[],name:"DEFAULT_ADMIN_ROLE",outputs:[{internalType:"bytes32",name:"",type:"bytes32"}],stateMutability:"view",type:"function"},{inputs:[],name:"MINTER_ROLE",outputs:[{internalType:"bytes32",name:"",type:"bytes32"}],stateMutability:"view",type:"function"},{inputs:[{internalType:"address",name:"owner",type:"address"},{internalType:"address",name:"spender",type:"address"}],name:"allowance",outputs:[{internalType:"uint256",name:"",type:"uint256"}],stateMutability:"view",type:"function"},{inputs:[{internalType:"address",name:"spender",type:"address"},{internalType:"uint256",name:"amount",type:"uint256"}],name:"approve",outputs:[{internalType:"bool",name:"",type:"bool"}],stateMutability:"nonpayable",type:"function"},{inputs:[{internalType:"address",name:"account",type:"address"}],name:"balanceOf",outputs:[{internalType:"uint256",name:"",type:"uint256"}],stateMutability:"view",type:"function"},{inputs:[{internalType:"uint256",name:"amount",type:"uint256"}],name:"burn",outputs:[],stateMutability:"nonpayable",type:"function"},{inputs:[{internalType:"address",name:"account",type:"address"},{internalType:"uint256",name:"amount",type:"uint256"}],name:"burn",outputs:[],stateMutability:"nonpayable",type:"function"},{inputs:[{internalType:"address",name:"account",type:"address"},{internalType:"uint256",name:"amount",type:"uint256"}],name:"burnFrom",outputs:[],stateMutability:"nonpayable",type:"function"},{inputs:[],name:"decimals",outputs:[{internalType:"uint8",name:"",type:"uint8"}],stateMutability:"view",type:"function"},{inputs:[{internalType:"address",name:"spender",type:"address"},{internalType:"uint256",name:"subtractedValue",type:"uint256"}],name:"decreaseAllowance",outputs:[{internalType:"bool",name:"",type:"bool"}],stateMutability:"nonpayable",type:"function"},{inputs:[{internalType:"bytes32",name:"role",type:"bytes32"}],name:"getRoleAdmin",outputs:[{internalType:"bytes32",name:"",type:"bytes32"}],stateMutability:"view",type:"function"},{inputs:[{internalType:"bytes32",name:"role",type:"bytes32"},{internalType:"address",name:"account",type:"address"}],name:"grantRole",outputs:[],stateMutability:"nonpayable",type:"function"},{inputs:[{internalType:"bytes32",name:"role",type:"bytes32"},{internalType:"address",name:"account",type:"address"}],name:"hasRole",outputs:[{internalType:"bool",name:"",type:"bool"}],stateMutability:"view",type:"function"},{inputs:[{internalType:"address",name:"spender",type:"address"},{internalType:"uint256",name:"addedValue",type:"uint256"}],name:"increaseAllowance",outputs:[{internalType:"bool",name:"",type:"bool"}],stateMutability:"nonpayable",type:"function"},{inputs:[{internalType:"address",name:"to",type:"address"},{internalType:"uint256",name:"amount",type:"uint256"}],name:"mint",outputs:[],stateMutability:"nonpayable",type:"function"},{inputs:[],name:"name",outputs:[{internalType:"string",name:"",type:"string"}],stateMutability:"view",type:"function"},{inputs:[{internalType:"bytes32",name:"role",type:"bytes32"},{internalType:"address",name:"account",type:"address"}],name:"renounceRole",outputs:[],stateMutability:"nonpayable",type:"function"},{inputs:[{internalType:"bytes32",name:"role",type:"bytes32"},{internalType:"address",name:"account",type:"address"}],name:"revokeRole",outputs:[],stateMutability:"nonpayable",type:"function"},{inputs:[{internalType:"bytes4",name:"interfaceId",type:"bytes4"}],name:"supportsInterface",outputs:[{internalType:"bool",name:"",type:"bool"}],stateMutability:"view",type:"function"},{inputs:[],name:"symbol",outputs:[{internalType:"string",name:"",type:"string"}],stateMutability:"view",type:"function"},{inputs:[],name:"totalSupply",outputs:[{internalType:"uint256",name:"",type:"uint256"}],stateMutability:"view",type:"function"},{inputs:[{internalType:"address",name:"to",type:"address"},{internalType:"uint256",name:"amount",type:"uint256"}],name:"transfer",outputs:[{internalType:"bool",name:"",type:"bool"}],stateMutability:"nonpayable",type:"function"},{inputs:[{internalType:"address",name:"from",type:"address"},{internalType:"address",name:"to",type:"address"},{internalType:"uint256",name:"amount",type:"uint256"}],name:"transferFrom",outputs:[{internalType:"bool",name:"",type:"bool"}],stateMutability:"nonpayable",type:"function"}];const P="0x9b9a5C1Af0A543d7dd243Bea6BDD53458dd0F067",K="0x16B052D944c1b7731d7C240b6072530929C93b40",at="0x6ce8dA28E2f864420840cF74474eFf5fD80E65B8",T=(e,t=P,n=nt)=>{const a=new E.default(e);return new a.eth.Contract(n,t)},D=async(e,t,n)=>await e.methods[t](...n).call(),ye=async(e,t,n,a,i,c)=>{const b=new E.default(c),G=await t.methods[n](...a).estimateGas({from:e}),Dt={gasPrice:await b.eth.getGasPrice(),from:e,gas:G};await t.methods[n](...a).send(Dt).on("transactionHash",Y=>{p(i,{txHash:Y})}).on("receipt",Y=>{p(i,{receipt:Y})})};var g={getVaultBalance:async(e,t)=>{const n=T(t);return{balance:await D(n,"balanceOf",[e])}},withdrawConsensually:async(e,t)=>{const n=T(t),a=new E.default(t),i=e.addresses[0];try{const c=await n.methods.withdrawAlice(e).estimateGas({from:i}),G={gasPrice:await a.eth.getGasPrice(),from:i,gas:c};try{await n.methods.withdrawAlice(e).send(G).on("transactionHash",C=>{console.log("txHash",C),p(r.withdrawHash,C)}).on("receipt",C=>{console.log("receipt",C),p(r.withdrawReceipt,C)})}catch(C){throw new Error(C)}}catch(c){throw new Error(c)}},getDegaBalance:async(e,t)=>{const n=T(t,K,M);return await D(n,"balanceOf",[e])},depositDega:async(e,t,n)=>{const a=T(n);await ye(t,a,"deposit",[e],r.depositDega,n)},approveDega:async(e,t,n)=>{const a=T(n,K,M);await ye(t,a,"approve",[P,e],r.approveDega,n)},getBtcbBalance:async(e,t)=>{const n=T(t,at,M);return await D(n,"balanceOf",[e])},getBnbBalance:async(e,t)=>await new E.default(t).eth.getBalance(e),getLastClosedChannel:async(e,t)=>{const n=T(t),a=await D(n,"emergencyWithdrawRequests",[e]);return a.claimTransaction.id.toString()!=="0"?a.claimTransaction.id.toString():(await D(n,"withdrawTransactions",[e])).id.toString()},getDegaAllowance:async(e,t)=>{const n=T(t,K,M);return await D(n,"allowance",[e,P])}};const rt=async(e,t)=>{B.isValidNewClaim(e);{if(!R(e))throw new Error("Server's signature is not verified");const n=await U(e,t);if(await ge(e,t)===!0&&n)return await H(e),w.saveConfirmedClaim(e),e;throw new Error("Server's balance is not enough")}},me=e=>({types:{EIP712Domain:[{name:"name",type:"string"},{name:"version",type:"string"},{name:"chainId",type:"uint256"},{name:"verifyingContract",type:"address"}],Claim:[{name:"id",type:"uint256"},{name:"alice",type:"address"},{name:"bob",type:"address"},{name:"nonce",type:"uint256"},{name:"timestamp",type:"uint256"},{name:"messageForAlice",type:"string"},{name:"cumulativeDebitAlice",type:"uint256"},{name:"cumulativeDebitBob",type:"uint256"},{name:"closed",type:"uint256"}]},domain:ne,primaryType:"Claim",message:{id:e.id,alice:e.addresses[o],bob:e.addresses[u],nonce:e.nonce,timestamp:e.timestamp,messageForAlice:e.messageForAlice,cumulativeDebitAlice:e.cumulativeDebits[o],cumulativeDebitBob:e.cumulativeDebits[u],closed:e.closed}}),R=(e,t=!1)=>{let n=1;t&&(n=0);const a=me(e),i=e.signatures[n];try{return f.recoverTypedSignature({data:a,signature:i,version:f.SignTypedDataVersion.V4}).toUpperCase()===e.addresses[n].toUpperCase()}catch{return!1}},st=async(e,t)=>{const n=we(e);B.isValidNewClaim(e);const a=await U(e,t);if(n&&a){if(await ge(e,t)===!0)return await H(e),w.saveClaimAlice(e),e;throw new Error("Not enough balance")}},we=e=>{const t=w.getClaimAlice(e.addresses[o]);if(t&&t.id===e.id&&t.nonce>=e.nonce)throw new Error(`Claim with nonce ${e.nonce} is already signed`);return!0},ge=async(e,t)=>{const n=e.amount<0?0:1;return n===1?!0:it(e,n,t)},it=async(e,t,n)=>{try{const{balance:a}=await g.getVaultBalance(e.addresses[t],n);return!!d.gte(a,e.cumulativeDebits[t])}catch{throw new Error("Can't get balance from Vault")}},H=async e=>{const t=me(e),n=e.addresses[o];e.signatures[o]=await te(t,n)},ot=async e=>{if(B.isValidClaimAlice(e))if(R(e))w.saveConfirmedClaim(e);else throw new Error("Server's signature is not verified")},ct=async(e,t)=>{const n=we(e);let a;try{a=(await g.getVaultBalance(e.addresses[o],t)).balance}catch{throw new Error("Can't get balance from Vault")}const i=B.isValidWithdraw(e,a),c=await U(e,t);if(i&&n&&c)return await H(e),w.saveClaimAlice(e),e;throw new Error("Withdraw claim is not valid")},U=async(e,t)=>{const n=await g.getLastClosedChannel(e.addresses[o],t);if(d.eq(d.plus(n,"1"),e.id))return!0;throw new Error("Invalid channel id")};var v={cashin:st,claimControfirmed:ot,cashout:rt,signWithdraw:ct,lastClaim:(e,t)=>{const n=w.getConfirmedClaim(t);if(!n&&e===null)return!0;if(!n&&e&&e.nonce)return w.saveConfirmedClaim(e),!0;if(n&&e===null)return n;if(e.id>=n.id&&e.nonce>n.nonce)return R(e,!0)&&R(e)?(w.saveConfirmedClaim(e),!0):n;try{return B.areEqualClaims(e,n)===!0&&e.signatures[o]===n.signatures[o]&&e.signatures[u]===n.signatures[u]?!0:n}catch{return n}},downloadLastClaim:w.downloadLastClaim,getConfirmedClaim:w.getConfirmedClaim};const lt=async e=>{try{await y()}catch(n){throw s(r.claimNotSigned,n),n}const t=m();try{const n=await v.cashin(e,t);return p(r.claimSigned,{claim:n}),n}catch(n){throw s(r.claimNotSigned,n),n}},ut=async e=>{const t=m();try{return await g.getVaultBalance(e,t)}catch(n){console.error(n)}},dt=async e=>{try{await y()}catch(t){throw s(r.claimNotConfirmed,t),t}try{await v.claimControfirmed(e),p(r.claimConfirmed,{claim:e})}catch(t){throw s(r.claimNotConfirmed,{error:t,claim:e}),t}},pt=async e=>{try{await y()}catch(n){throw s(r.winNotConfirmed,n),n}const t=m();try{const n=await v.cashout(e,t);return p(r.winClaimSigned,{claim:n}),n}catch(n){throw s(r.winNotConfirmed,n),n}},yt=async e=>{if(e&&e.hasOwnProperty("error")){s(r.claimNotSynced,e.error);return}const{address:t}=await ee();if(e&&e.addresses[o].toLowerCase()!==t.toLowerCase()){s(r.claimNotSynced,e.error);return}const n=v.lastClaim(e,t);if(n===!0)p(r.claimSynced,"Claims are synced");else return s(r.claimNotSynced,{lastClaim:n}),n},mt=async e=>{try{await y()}catch(n){throw s(r.claimNotSigned,n),n}const t=m();try{const n=await v.signWithdraw(e,t);return p(r.claimSigned,{claim:n}),n}catch(n){throw s(r.claimNotSigned,n),n}},wt=async e=>{try{await y()}catch(n){throw s(r.withdraw,n),n}const t=m();try{await g.withdrawConsensually(e,t),p(r.withdraw,"Consensual withdraw is sent to blockchain")}catch(n){s(r.withdraw,n)}},gt=async e=>{try{await y()}catch(i){throw s(r.getBalance,i),i}const t=m();let n="0";try{n=d.plus(n,(await g.getVaultBalance(e,t)).balance)}catch(i){s(r.getBalance,i)}const a=v.getConfirmedClaim(e);return a&&a.closed!==1&&(n=d.plus(n,d.minus(a.cumulativeDebits[u],a.cumulativeDebits[o]))),n};var h={cashin:lt,claimControfirmed:dt,cashout:pt,lastClaim:yt,signWithdraw:mt,withdrawConsensually:wt,getVaultBalance:ut,downloadLastClaim:v.downloadLastClaim,getTotalBalance:gt};const ht=async(e,t)=>{try{y()}catch(a){throw s(r.depositDega,a),a}const n=m();try{await bt(e,t,n)}catch(a){throw s(r.depositDega,a),a}try{await g.depositDega(e,t,n)}catch(a){throw s(r.depositDega,a),a}},bt=async(e,t,n)=>{let a;try{a=await g.getDegaBalance(t,n)}catch{throw new Error("Can't get balance of Dega")}if(d.lt(a,e))throw new Error("The balance of Dega is not enough")};var N={depositDega:ht,approveDega:async(e,t)=>{try{y()}catch(a){throw s(r.approveDega,a),a}const n=m();try{await g.approveDega(e,t,n)}catch(a){throw s(r.approveDega,a),a}},getDegaBalance:async e=>{try{y()}catch(a){throw s(r.getBalance,a),a}const t=m();let n="0";try{n=await g.getDegaBalance(e,t)}catch{throw new Error("Can't get balance of Dega")}return n.toString()},getBtcbBalance:async e=>{try{y()}catch(a){throw s(r.getBalance,a),a}const t=m();let n="0";try{n=await g.getBtcbBalance(e,t)}catch{throw new Error("Can't get balance of BTCB")}return n.toString()},getBnbBalance:async e=>{try{y()}catch(a){throw s(r.getBalance,a),a}const t=m();let n="0";try{n=await g.getBnbBalance(e,t)}catch{throw new Error("Can't get balance of BNB")}return n.toString()},getDegaAllowance:async e=>{try{y()}catch(n){throw s(r.approveDega,n),n}const t=m();try{return await g.getDegaAllowance(e,t)}catch(n){throw s(r.approveDega,n),n}}};const ft="CASHIN",Tt="CASHOUT",Ct="WITHDRAW",vt="HANDSHAKE";return{getAddress:ee,isMetamaskInstalled:Z,isRightNet:X,setRightNet:Be,addEventListener:be,addEventListenerWS:fe,emitEventWS:Te,receiveMsg:async e=>{if(e){const{action:t,claim:n,context:a,error:i}=JSON.parse(e);switch(i&&s(r.general,i),t){case vt:{const c=await h.lastClaim(n);if(c)return{action:t,claim:c,context:a};break}case ft:{if(!n.signatures[o]&&!n.signatures[u]){const c=await h.cashin(n);return{action:t,claim:c,context:a}}else if(n.signatures[o]&&n.signatures[u])await h.claimControfirmed(n);else throw new Error("Invalid claim");break}case Tt:if(!n.signatures[o]&&n.signatures[u]){const c=await h.cashout(n);return{action:t,claim:c,context:a}}else throw new Error("Invalid claim");case Ct:{if(!n.signatures[o]&&!n.signatures[u]){const c=await h.signWithdraw(n);return{action:t,claim:c,context:a}}else if(n.signatures[o]&&n.signatures[u])await h.claimControfirmed(n),await h.withdrawConsensually(n);else throw new Error("Invalid claim");break}}}},signChallenge:S.signChallenge,setToken:S.setToken,getToken:S.getToken,isLogged:S.isLogged,getVaultBalance:h.getVaultBalance,getTotalBalance:h.getTotalBalance,downloadLastClaim:h.downloadLastClaim,formatNumber:q,pay:h.cashin,payReceived:h.claimControfirmed,win:h.cashout,depositDega:N.depositDega,approveDega:N.approveDega,getDegaAllowance:N.getDegaAllowance,getDegaBalance:N.getDegaBalance,getBtcbBalance:N.getBtcbBalance,getBnbBalance:N.getBnbBalance}});
