(function(f,A){typeof exports=="object"&&typeof module!="undefined"?module.exports=A(require("@metamask/eth-sig-util"),require("bignumber.js"),require("web3")):typeof define=="function"&&define.amd?define(["@metamask/eth-sig-util","bignumber.js","web3"],A):(f=typeof globalThis!="undefined"?globalThis:f||self,f.cryptoSDK=A(f["@metamask/eth-sig-util"],f.bignumber.js,f.Web3))})(this,function(f,A,he){"use strict";function J(e){return e&&typeof e=="object"&&"default"in e?e:{default:e}}var c=J(A),B=J(he);const be=e=>{document.addEventListener(_,e)},fe=e=>{document.addEventListener(j,e)},p=(e,t)=>{const n=new CustomEvent(_,{detail:{type:e,msg:t}});document.dispatchEvent(n)},Te=e=>{const t=new CustomEvent(j,{detail:JSON.parse(e)});document.dispatchEvent(t)},i=(e,t)=>{const n=new CustomEvent(_,{detail:{type:e,msg:t,error:!0}});document.dispatchEvent(n)},s={network:"network",accountsChanged:"accountsChanged",chainChanged:"chainChanged",message:"message",address:"address",wrongNetworkOnGetAddress:"wrongNetworkOnGetAddress",metamaskNotInstalled:"metamaskNotInstalled",general:"general",claimNotSigned:"claimNotSigned",claimSigned:"claimSigned",claimConfirmed:"claimConfirmed",claimNotConfirmed:"claimNotConfirmed",winClaimSigned:"winClaimSigned",winNotConfirmed:"winNotConfirmed",challengeSigned:"challengeSigned",challengeNotSigned:"challengeNotSigned",claimSynced:"claimSynced",claimNotSynced:"claimNotSynced",token:"jwtToken",withdraw:"withdraw",withdrawReceipt:"withdrawReceipt",withdrawHash:"withdrawHash",depositDega:"depositDega",withdrawDega:"withdrawDega",approveDega:"approveDega",getBalance:"getBalance",degaAllowed:"degaAllowed"},_="cryptoSDK",j="cryptoSDK_WS",x="97",Ce="BSC Testnet",ve="https://data-seed-prebsc-1-s1.binance.org",De="https://testnet.bscscan.com/",Ne="BNB",Ae="BNB",Be="18",y=async()=>{const e=z(),t=m();if(t){const n=Number(await t.request({method:"eth_chainId"}));if(Array.isArray(e)){if(e.includes(n))return!0;{const a="Please change your network on Metamask. Valid networks are: "+V(e);throw new Error(a)}}else if(Number(n)!==Number(e)){const a=`Please set your network on Metamask to ${V(e)}`;throw new Error(a)}else return!0}},V=(e=!1)=>{const t=[];if(t[1]="Ethereum Mainnet",t[3]="Ethereum Ropsten",t[42]="Ethereum Kovan",t[4]="Ethereum Rinkeby",t[5]="Ethereum Goerli",t[56]="Binance Smart Chain",t[97]="Binance Smart Chain Testnet",e)if(Array.isArray(e)){const n=[];for(let a=0;a<e.length;a++)n.push(t[e[a]]);return n}else return t[e]?t[e]:(console.error(`Network ID ${e} Not found in the networksNames list`),V(x));else return t},z=()=>[Number(x)],X=async()=>{try{const e=await y();return p(s.network,e),e}catch(e){return i(s.network,e),!1}},Ee=async()=>{if(window.ethereum){const e=window.ethereum,n=[{chainId:`0x${Number(x).toString(16)}`,chainName:Ce,nativeCurrency:{name:Ne,symbol:Ae,decimals:parseInt(Be)},rpcUrls:[ve],blockExplorerUrls:[De]}];try{await e.request({method:"wallet_addEthereumChain",params:n}),await y()?p(s.network,"Success, network is set to the right one"):i(s.network,"Add net error: network is not changed")}catch(a){i(s.network,a.message?a.message:a)}}else throw window.web3?(i(s.network,"This version of Metamask supports only manual network switching"),new Error("This version of Metamask supports only manual network switching")):(i(s.network,"Metamask is not installed"),new Error("Metamask is not installed"))},m=()=>{if(window.ethereum)return window.ethereum;if(window.web3)return window.web3.currentProvider;throw i(s.metamaskNotInstalled,"Metamask is not installed"),new Error("Metamask is not installed")},Q=async e=>{try{await X()?p(s.chainChanged,{chainId:e}):i(s.chainChanged,{chainId:e})}catch{i(s.chainChanged,{chainId:e})}},Se=()=>{window.ethereum?(window.ethereum.chainId||(window.ethereum.chainId="97"),window.ethereum.on("accountsChanged",async e=>{console.log("#### - Metamask: accountsChanged - accounts",e),p(s.accountsChanged,{accounts:e})}),window.ethereum.on("chainChanged",async e=>{console.log("#### - Metamask: chainChanged",e),await Q(e)}),window.ethereum.on("error",async e=>{console.log("#### - Metamask: error",e),i(s.error,e)})):window.web3&&(window.web3.currentProvider.on("accountsChanged",async e=>{console.log("#### - Metamask web3: accountsChanged - accounts",e),p(s.accountsChanged,{accounts:e})}),window.web3.currentProvider.on("chainIdChanged",async e=>{console.log("#### - Metamask web3: chainChanged",e),await Q(e)}),window.web3.currentProvider.on("error",async e=>{console.log("#### - Metamask web3: error",e),i(s.error,e)}))},ke=async()=>{if(window.ethereum){const e=await window.ethereum.request({method:"eth_requestAccounts"});if(e&&e[0])return e[0];throw new Error("Can't get address")}else if(window.web3){const e=window.web3.eth.accounts;if(e&&e.length>0)return e[0];throw new Error("Can't get address")}else throw new Error("Metamask is not installed")},Z=()=>!!(window.ethereum||window.web3),ee=async()=>{if(!Z()){const t="Metamask is not installed, unable to get user address";throw i(s.metamaskNotInstalled,t),new Error(t)}const e=z();try{await y(e)}catch(t){throw i(s.wrongNetworkOnGetAddress,t),new Error(t)}try{return{address:await ke()}}catch(t){throw i(s.address,t),new Error(t)}},te=async(e,t)=>(await y(),await m().request({method:"eth_signTypedData_v4",params:[t,JSON.stringify(e)],from:t}));Se();const ne={name:"BSC Testnet",version:"1",chainId:"97",verifyingContract:"0x9b9a5C1Af0A543d7dd243Bea6BDD53458dd0F067"},Ie=e=>({types:{EIP712Domain:[{name:"name",type:"string"},{name:"version",type:"string"},{name:"chainId",type:"uint256"},{name:"verifyingContract",type:"address"}],Signin:[{name:"method",type:"string"},{name:"text",type:"string"}]},domain:ne,primaryType:"Signin",message:{method:"signin",text:e}}),$e=async(e,t)=>{const n=Ie(e);try{const a=await te(n,t);return p(s.challengeSigned,{signature:a}),a}catch(a){throw i(s.challengeNotSigned,a),a}},Me="authToken",Re="expireToken",_e=12e5,ae=e=>`${Me}_${e.toLowerCase()}`,se=e=>`${Re}_${e.toLowerCase()}`,xe=(e,t)=>{try{localStorage.setItem(ae(e),t),localStorage.setItem(se(e),Date.now()+_e),p(s.token,"JWT token received")}catch(n){i(s.token,n)}},re=e=>localStorage.getItem(ae(e));var S={signChallenge:$e,setToken:xe,getToken:re,isLogged:e=>{if(re(e)){const n=localStorage.getItem(se(e));if(n&&n>Date.now())return!0}return!1}};const o=0,u=1,ie={claimConfirmed:"claimConfirmed",claimAlice:"claimAlice"},F=e=>`${ie.claimConfirmed}_${e.toLowerCase()}`,oe=e=>`${ie.claimAlice}_${e.toLowerCase()}`,Ve=e=>{localStorage.setItem(F(e.addresses[o]),JSON.stringify(e))},Fe=e=>JSON.parse(localStorage.getItem(F(e))),Le=e=>{localStorage.setItem(oe(e.addresses[o]),JSON.stringify(e))},We=e=>JSON.parse(localStorage.getItem(oe(e))),qe=e=>{const t=localStorage.getItem(F(e));if(!t)return;const n=Oe(t),a=document.createElement("a"),r=`lastConfirmedClaim-${new Date().toISOString()}.json`;a.setAttribute("href","data:application/json;charset=utf-8,"+encodeURIComponent(n)),a.setAttribute("download",r),a.style.display="none",document.body.appendChild(a),a.click(),document.body.removeChild(a)},Oe=e=>(e=e.replace("{",`{
`),e=e.replace("}",`
}`),e=e.replaceAll(",",`,
`),e);var g={saveConfirmedClaim:Ve,getConfirmedClaim:Fe,saveClaimAlice:Le,getClaimAlice:We,downloadLastClaim:qe};const Pe=(e,t=2)=>new c.default(e+"").toFixed(t),Ke=(e,t)=>{const n=new c.default(e+""),a=new c.default(t+"");return n.minus(a).toFixed()},ce=(e,t)=>{const n=new c.default(e+""),a=new c.default(t+"");return n.plus(a).toFixed()},He=(e,t=2)=>new c.default(e+"").toFixed(t),L=e=>{if(e==="0"||e===0)return"10";if(ue(e,1)){const n=e.replace("0.","").length;console.log("l",n);const a=le(10,n);console.log({p:a});const r=k(e,a);console.log({b:r});const l=L(r);console.log({c:l});const b=I(l,a);return console.log({d:b}),b}else{const t=k(I(e,10,0,c.default.ROUND_UP),10);return t===e+""?L(ce(e,1)):t}},k=(e,t,n=18,a=c.default.ROUND_FLOOR)=>{let r=new c.default(e+"");const l=new c.default(t+"");return r=r.times(l).toFixed(),n=parseInt(n),W(r,n,a)},Ue=(e,t,n=18)=>k(e,t,n),I=(e,t,n=18,a=c.default.ROUND_FLOOR)=>{let r=new c.default(e+"");const l=new c.default(t+"");return r=r.div(l).toFixed(),n=parseInt(n),W(r,n,a)},Ge=(e,t,n=18)=>I(e,t,n),le=(e,t)=>{const n=new c.default(e+""),a=new c.default(t+"");return n.pow(a)},Ye=(e,t)=>{const n=new c.default(e+""),a=new c.default(t+"");return n.eq(a)},ue=(e,t)=>{const n=new c.default(e+""),a=new c.default(t+"");return n.lt(a)},Je=(e,t)=>{const n=new c.default(e+""),a=new c.default(t+"");return n.gt(a)},je=(e,t)=>{const n=new c.default(e+""),a=new c.default(t+"");return n.lte(a)},ze=(e,t)=>{const n=new c.default(e+""),a=new c.default(t+"");return n.gte(a)},Xe=e=>new c.default(e+"").isNaN(),W=(e,t,n)=>new c.default(e+"").dp(parseInt(t),n).toFixed();var d={minus:Ke,plus:ce,times:k,div:I,pow:le,eq:Ye,lt:ue,gt:Je,lte:je,gte:ze,isNaN:Xe,dp:W,negated:e=>new c.default(e+"").negated().toFixed(),timesFloor:Ue,divFloor:Ge,toFixed:Pe,roundUpToTen:L,roundDecimals:He,abs:e=>new c.default(e+"").abs().toFixed()};const q=(e,t=18)=>{if(!e)return;const r=new B.default().utils.fromWei(e).split("."),l=r[0].toString().replace(/\b0+(?!$)/g,"").replace(/\B(?=(\d{3})+(?!\d))/g,",");if(r[1])if(t){const b=r[1].substring(0,t).replace(/0+$/,"");return l+`${b?"."+b:""}`}else return l+"."+r[1];else return l},$="0xeA085D9698651e76750F07d0dE0464476187b3ca",de=e=>{const t=g.getConfirmedClaim(e.addresses[o]);if(t){const n=t.closed===1,a=n?t.id+1:t.id,r=n?1:t.nonce+1;if(a!==e.id)throw new Error(`Invalid claim id: ${e.id} - last claim id: ${t.id}${n?". id must change after withdraw":""}`);if(r!==e.nonce)throw new Error(`Invalid claim nonce: ${e.nonce} ${n?" - channel id is changed":`- last claim nonce: ${t.nonce}`}`);if(e.addresses[u]!==$)throw new Error(`Invalid address of Server: ${e.addresses[u]} - expected: ${$}`);const l=n?e.amount:d.plus(d.minus(t.cumulativeDebits[u],t.cumulativeDebits[o]),e.amount);pe(l,e.cumulativeDebits)}else{if(e.id!==1)throw new Error(`Invalid claim id: ${e.id}`);if(e.nonce!==1)throw new Error(`Invalid claim nonce: ${e.nonce}`);if(e.addresses[u]!==$)throw new Error(`Invalid address of Server: ${e.addresses[u]} - expected: ${$}`);const n=e.amount;pe(n,e.cumulativeDebits)}return Qe(e),!0},Qe=e=>{if(e.closed===0){const t=`You ${d.gt(e.amount,"0")?"receive":"spend"}: ${q(d.abs(e.amount))} DE.GA`;if(e.messageForAlice!==t)throw new Error(`Invalid message for Alice: ${e.messageForAlice} - expected: ${t}`)}},pe=(e,t)=>{if(d.gt(e,0)){if(!d.eq(t[o],0))throw new Error(`Invalid claim cumulative debit of Client: ${t[o]} - expected: 0`);if(!d.eq(t[u],e))throw new Error(`Invalid claim cumulative debit of Server: ${t[u]} - expected: ${e}`)}else{if(!d.eq(t[o],d.negated(e)))throw new Error(`Invalid claim cumulative debit of Client: ${t[o]} - expected: ${-e}`);if(!d.eq(t[u],0))throw new Error(`Invalid claim cumulative debit of Server: ${t[u]} - expected: 0`)}},Ze=e=>{let t=de(e);if(t){const n=g.getClaimAlice(e.addresses[o]);n&&(t=O(e,n))}return t},O=(e,t,n=!1)=>{if(n&&t.closed===1){if(t.id+1!==e.id)throw new Error(`Invalid claim id: ${e.id} - channel was closed and saved claim id: ${t.id}`)}else if(t.id!==e.id)throw new Error(`Invalid claim id: ${e.id} - saved claim id: ${t.id}`);if(n&&t.closed===1){if(e.nonce!==1)throw new Error(`Invalid claim nonce: ${e.nonce} - channel was closed`)}else{const a=n?e.nonce-1:e.nonce;if(t.nonce!==a)throw new Error(`Invalid claim nonce: ${e.nonce} - saved claim nonce: ${t.nonce}`)}if(t.cumulativeDebits[o]!==e.cumulativeDebits[o])throw new Error(`Invalid claim cumulative debit of Client: ${e.cumulativeDebits[o]} - saved claim: ${t.cumulativeDebits[o]}`);if(t.cumulativeDebits[u]!==e.cumulativeDebits[u])throw new Error(`Invalid claim cumulative debit of Server: ${e.cumulativeDebits[u]} - saved claim: ${t.cumulativeDebits[u]}`);if(t.addresses[o]!==e.addresses[o])throw new Error(`Invalid address of Client: ${e.addresses[o]} - saved claim: ${t.addresses[o]}`);if(t.addresses[u]!==e.addresses[u])throw new Error(`Invalid address of Server: ${e.addresses[u]} - saved claim: ${t.addresses[u]}`);if(!n&&t.timestamp!==e.timestamp)throw new Error(`Invalid timestamp of Server: ${e.timestamp} - saved claim: ${t.timestamp}`);if(!n&&t.messageForAlice!==e.messageForAlice)throw new Error(`Invalid message for Alice: ${e.messageForAlice} - expected: ${t.messageForAlice}`);return!0},et=(e,t)=>{tt(e,t);const n=g.getConfirmedClaim(e.addresses[o]);return n?O(e,n,!0):!0},tt=(e,t)=>{const n=d.plus(t,d.minus(e.cumulativeDebits[u],e.cumulativeDebits[o])),a=`You are withdrawing: ${q(n)} DE.GA`;if(e.messageForAlice!==a)throw new Error(`Invalid message for Alice: ${e.messageForAlice} - expected: ${a}`)};var E={isValidNewClaim:de,isValidClaimAlice:Ze,areEqualClaims:O,isValidWithdraw:et},nt=[{anonymous:!1,inputs:[{components:[{components:[{internalType:"uint256",name:"id",type:"uint256"},{internalType:"uint256",name:"nonce",type:"uint256"},{internalType:"uint256",name:"timestamp",type:"uint256"},{internalType:"uint256[]",name:"cumulativeDebits",type:"uint256[]"}],internalType:"struct VaultV1.ClaimTransaction",name:"claimTransaction",type:"tuple"},{internalType:"uint256",name:"timestamp",type:"uint256"},{internalType:"address",name:"requester",type:"address"}],indexed:!1,internalType:"struct VaultV1.EmergencyWithdrawRequest",name:"emergencyWithdrawRequest",type:"tuple"}],name:"InitEmergencyWithdraw",type:"event"},{anonymous:!1,inputs:[{indexed:!0,internalType:"bytes32",name:"role",type:"bytes32"},{indexed:!0,internalType:"bytes32",name:"previousAdminRole",type:"bytes32"},{indexed:!0,internalType:"bytes32",name:"newAdminRole",type:"bytes32"}],name:"RoleAdminChanged",type:"event"},{anonymous:!1,inputs:[{indexed:!0,internalType:"bytes32",name:"role",type:"bytes32"},{indexed:!0,internalType:"address",name:"account",type:"address"},{indexed:!0,internalType:"address",name:"sender",type:"address"}],name:"RoleGranted",type:"event"},{anonymous:!1,inputs:[{indexed:!0,internalType:"bytes32",name:"role",type:"bytes32"},{indexed:!0,internalType:"address",name:"account",type:"address"},{indexed:!0,internalType:"address",name:"sender",type:"address"}],name:"RoleRevoked",type:"event"},{anonymous:!1,inputs:[{components:[{components:[{internalType:"uint256",name:"id",type:"uint256"},{internalType:"uint256",name:"nonce",type:"uint256"},{internalType:"uint256",name:"timestamp",type:"uint256"},{internalType:"uint256[]",name:"cumulativeDebits",type:"uint256[]"}],internalType:"struct VaultV1.ClaimTransaction",name:"claimTransaction",type:"tuple"},{internalType:"uint256",name:"timestamp",type:"uint256"},{internalType:"address",name:"requester",type:"address"}],indexed:!1,internalType:"struct VaultV1.EmergencyWithdrawRequest",name:"emergencyWithdrawRequest",type:"tuple"},{indexed:!1,internalType:"string",name:"cause",type:"string"}],name:"StopEmergencyWithdraw",type:"event"},{anonymous:!1,inputs:[{components:[{internalType:"uint256",name:"id",type:"uint256"},{internalType:"uint256",name:"nonce",type:"uint256"},{internalType:"uint256",name:"timestamp",type:"uint256"},{internalType:"uint256[]",name:"cumulativeDebits",type:"uint256[]"}],indexed:!1,internalType:"struct VaultV1.ClaimTransaction",name:"claimTransaction",type:"tuple"}],name:"WithdrawAlice",type:"event"},{anonymous:!1,inputs:[{indexed:!1,internalType:"uint256",name:"amount",type:"uint256"}],name:"WithdrawBob",type:"event"},{inputs:[],name:"DEFAULT_ADMIN_ROLE",outputs:[{internalType:"bytes32",name:"",type:"bytes32"}],stateMutability:"view",type:"function"},{inputs:[{internalType:"address",name:"clientAddress",type:"address"}],name:"balanceOf",outputs:[{internalType:"uint256",name:"",type:"uint256"}],stateMutability:"view",type:"function"},{inputs:[{internalType:"address",name:"",type:"address"}],name:"balances",outputs:[{internalType:"uint256",name:"",type:"uint256"}],stateMutability:"view",type:"function"},{inputs:[{internalType:"uint256",name:"amount",type:"uint256"}],name:"deposit",outputs:[],stateMutability:"nonpayable",type:"function"},{inputs:[{internalType:"address",name:"account",type:"address"},{internalType:"uint256",name:"amount",type:"uint256"}],name:"depositFor",outputs:[],stateMutability:"nonpayable",type:"function"},{inputs:[],name:"emergencyWithdrawAlice",outputs:[],stateMutability:"nonpayable",type:"function"},{inputs:[{internalType:"address",name:"",type:"address"}],name:"emergencyWithdrawRequests",outputs:[{components:[{internalType:"uint256",name:"id",type:"uint256"},{internalType:"uint256",name:"nonce",type:"uint256"},{internalType:"uint256",name:"timestamp",type:"uint256"},{internalType:"uint256[]",name:"cumulativeDebits",type:"uint256[]"}],internalType:"struct VaultV1.ClaimTransaction",name:"claimTransaction",type:"tuple"},{internalType:"uint256",name:"timestamp",type:"uint256"},{internalType:"address",name:"requester",type:"address"}],stateMutability:"view",type:"function"},{inputs:[],name:"getChainId",outputs:[{internalType:"uint256",name:"",type:"uint256"}],stateMutability:"view",type:"function"},{inputs:[{internalType:"bytes32",name:"role",type:"bytes32"}],name:"getRoleAdmin",outputs:[{internalType:"bytes32",name:"",type:"bytes32"}],stateMutability:"view",type:"function"},{inputs:[{internalType:"bytes32",name:"role",type:"bytes32"},{internalType:"address",name:"account",type:"address"}],name:"grantRole",outputs:[],stateMutability:"nonpayable",type:"function"},{inputs:[{internalType:"bytes32",name:"role",type:"bytes32"},{internalType:"address",name:"account",type:"address"}],name:"hasRole",outputs:[{internalType:"bool",name:"",type:"bool"}],stateMutability:"view",type:"function"},{inputs:[{components:[{internalType:"uint256",name:"id",type:"uint256"},{internalType:"address[]",name:"addresses",type:"address[]"},{internalType:"uint256",name:"nonce",type:"uint256"},{internalType:"uint256",name:"timestamp",type:"uint256"},{internalType:"string",name:"messageForAlice",type:"string"},{internalType:"uint256[]",name:"cumulativeDebits",type:"uint256[]"},{internalType:"bytes[]",name:"signatures",type:"bytes[]"},{internalType:"uint256",name:"closed",type:"uint256"}],internalType:"struct VaultV1.ClaimRequest",name:"req",type:"tuple"}],name:"initEmergencyWithdrawAlice",outputs:[],stateMutability:"nonpayable",type:"function"},{inputs:[],name:"initEmergencyWithdrawAliceWithoutClaim",outputs:[],stateMutability:"nonpayable",type:"function"},{inputs:[{internalType:"address",name:"alice",type:"address"}],name:"initEmergencyWithdrawBob",outputs:[],stateMutability:"nonpayable",type:"function"},{inputs:[{internalType:"address",name:"tokenAddress",type:"address"},{internalType:"address",name:"serverAddress",type:"address"},{internalType:"string",name:"name",type:"string"},{internalType:"string",name:"version",type:"string"}],name:"initialize",outputs:[],stateMutability:"nonpayable",type:"function"},{inputs:[{internalType:"bytes32",name:"role",type:"bytes32"},{internalType:"address",name:"account",type:"address"}],name:"renounceRole",outputs:[],stateMutability:"nonpayable",type:"function"},{inputs:[{internalType:"bytes32",name:"role",type:"bytes32"},{internalType:"address",name:"account",type:"address"}],name:"revokeRole",outputs:[],stateMutability:"nonpayable",type:"function"},{inputs:[{components:[{internalType:"uint256",name:"id",type:"uint256"},{internalType:"address[]",name:"addresses",type:"address[]"},{internalType:"uint256",name:"nonce",type:"uint256"},{internalType:"uint256",name:"timestamp",type:"uint256"},{internalType:"string",name:"messageForAlice",type:"string"},{internalType:"uint256[]",name:"cumulativeDebits",type:"uint256[]"},{internalType:"bytes[]",name:"signatures",type:"bytes[]"},{internalType:"uint256",name:"closed",type:"uint256"}],internalType:"struct VaultV1.ClaimRequest",name:"req",type:"tuple"}],name:"stopEmergencyWithdraw",outputs:[],stateMutability:"nonpayable",type:"function"},{inputs:[{internalType:"bytes4",name:"interfaceId",type:"bytes4"}],name:"supportsInterface",outputs:[{internalType:"bool",name:"",type:"bool"}],stateMutability:"view",type:"function"},{inputs:[{components:[{internalType:"uint256",name:"id",type:"uint256"},{internalType:"address[]",name:"addresses",type:"address[]"},{internalType:"uint256",name:"nonce",type:"uint256"},{internalType:"uint256",name:"timestamp",type:"uint256"},{internalType:"string",name:"messageForAlice",type:"string"},{internalType:"uint256[]",name:"cumulativeDebits",type:"uint256[]"},{internalType:"bytes[]",name:"signatures",type:"bytes[]"},{internalType:"uint256",name:"closed",type:"uint256"}],internalType:"struct VaultV1.ClaimRequest",name:"req",type:"tuple"}],name:"verify",outputs:[],stateMutability:"view",type:"function"},{inputs:[{components:[{internalType:"uint256",name:"id",type:"uint256"},{internalType:"address[]",name:"addresses",type:"address[]"},{internalType:"uint256",name:"nonce",type:"uint256"},{internalType:"uint256",name:"timestamp",type:"uint256"},{internalType:"string",name:"messageForAlice",type:"string"},{internalType:"uint256[]",name:"cumulativeDebits",type:"uint256[]"},{internalType:"bytes[]",name:"signatures",type:"bytes[]"},{internalType:"uint256",name:"closed",type:"uint256"}],internalType:"struct VaultV1.ClaimRequest",name:"req",type:"tuple"}],name:"withdrawAlice",outputs:[],stateMutability:"nonpayable",type:"function"},{inputs:[{internalType:"uint256",name:"amount",type:"uint256"}],name:"withdrawBob",outputs:[],stateMutability:"nonpayable",type:"function"},{inputs:[{internalType:"address",name:"",type:"address"}],name:"withdrawTransactions",outputs:[{internalType:"uint256",name:"id",type:"uint256"},{internalType:"uint256",name:"nonce",type:"uint256"},{internalType:"uint256",name:"timestamp",type:"uint256"}],stateMutability:"view",type:"function"}],M=[{inputs:[],stateMutability:"nonpayable",type:"constructor"},{anonymous:!1,inputs:[{indexed:!0,internalType:"address",name:"owner",type:"address"},{indexed:!0,internalType:"address",name:"spender",type:"address"},{indexed:!1,internalType:"uint256",name:"value",type:"uint256"}],name:"Approval",type:"event"},{anonymous:!1,inputs:[{indexed:!0,internalType:"bytes32",name:"role",type:"bytes32"},{indexed:!0,internalType:"bytes32",name:"previousAdminRole",type:"bytes32"},{indexed:!0,internalType:"bytes32",name:"newAdminRole",type:"bytes32"}],name:"RoleAdminChanged",type:"event"},{anonymous:!1,inputs:[{indexed:!0,internalType:"bytes32",name:"role",type:"bytes32"},{indexed:!0,internalType:"address",name:"account",type:"address"},{indexed:!0,internalType:"address",name:"sender",type:"address"}],name:"RoleGranted",type:"event"},{anonymous:!1,inputs:[{indexed:!0,internalType:"bytes32",name:"role",type:"bytes32"},{indexed:!0,internalType:"address",name:"account",type:"address"},{indexed:!0,internalType:"address",name:"sender",type:"address"}],name:"RoleRevoked",type:"event"},{anonymous:!1,inputs:[{indexed:!0,internalType:"address",name:"from",type:"address"},{indexed:!0,internalType:"address",name:"to",type:"address"},{indexed:!1,internalType:"uint256",name:"value",type:"uint256"}],name:"Transfer",type:"event"},{inputs:[],name:"DEFAULT_ADMIN_ROLE",outputs:[{internalType:"bytes32",name:"",type:"bytes32"}],stateMutability:"view",type:"function"},{inputs:[],name:"MINTER_ROLE",outputs:[{internalType:"bytes32",name:"",type:"bytes32"}],stateMutability:"view",type:"function"},{inputs:[{internalType:"address",name:"owner",type:"address"},{internalType:"address",name:"spender",type:"address"}],name:"allowance",outputs:[{internalType:"uint256",name:"",type:"uint256"}],stateMutability:"view",type:"function"},{inputs:[{internalType:"address",name:"spender",type:"address"},{internalType:"uint256",name:"amount",type:"uint256"}],name:"approve",outputs:[{internalType:"bool",name:"",type:"bool"}],stateMutability:"nonpayable",type:"function"},{inputs:[{internalType:"address",name:"account",type:"address"}],name:"balanceOf",outputs:[{internalType:"uint256",name:"",type:"uint256"}],stateMutability:"view",type:"function"},{inputs:[{internalType:"uint256",name:"amount",type:"uint256"}],name:"burn",outputs:[],stateMutability:"nonpayable",type:"function"},{inputs:[{internalType:"address",name:"account",type:"address"},{internalType:"uint256",name:"amount",type:"uint256"}],name:"burn",outputs:[],stateMutability:"nonpayable",type:"function"},{inputs:[{internalType:"address",name:"account",type:"address"},{internalType:"uint256",name:"amount",type:"uint256"}],name:"burnFrom",outputs:[],stateMutability:"nonpayable",type:"function"},{inputs:[],name:"decimals",outputs:[{internalType:"uint8",name:"",type:"uint8"}],stateMutability:"view",type:"function"},{inputs:[{internalType:"address",name:"spender",type:"address"},{internalType:"uint256",name:"subtractedValue",type:"uint256"}],name:"decreaseAllowance",outputs:[{internalType:"bool",name:"",type:"bool"}],stateMutability:"nonpayable",type:"function"},{inputs:[{internalType:"bytes32",name:"role",type:"bytes32"}],name:"getRoleAdmin",outputs:[{internalType:"bytes32",name:"",type:"bytes32"}],stateMutability:"view",type:"function"},{inputs:[{internalType:"bytes32",name:"role",type:"bytes32"},{internalType:"address",name:"account",type:"address"}],name:"grantRole",outputs:[],stateMutability:"nonpayable",type:"function"},{inputs:[{internalType:"bytes32",name:"role",type:"bytes32"},{internalType:"address",name:"account",type:"address"}],name:"hasRole",outputs:[{internalType:"bool",name:"",type:"bool"}],stateMutability:"view",type:"function"},{inputs:[{internalType:"address",name:"spender",type:"address"},{internalType:"uint256",name:"addedValue",type:"uint256"}],name:"increaseAllowance",outputs:[{internalType:"bool",name:"",type:"bool"}],stateMutability:"nonpayable",type:"function"},{inputs:[{internalType:"address",name:"to",type:"address"},{internalType:"uint256",name:"amount",type:"uint256"}],name:"mint",outputs:[],stateMutability:"nonpayable",type:"function"},{inputs:[],name:"name",outputs:[{internalType:"string",name:"",type:"string"}],stateMutability:"view",type:"function"},{inputs:[{internalType:"bytes32",name:"role",type:"bytes32"},{internalType:"address",name:"account",type:"address"}],name:"renounceRole",outputs:[],stateMutability:"nonpayable",type:"function"},{inputs:[{internalType:"bytes32",name:"role",type:"bytes32"},{internalType:"address",name:"account",type:"address"}],name:"revokeRole",outputs:[],stateMutability:"nonpayable",type:"function"},{inputs:[{internalType:"bytes4",name:"interfaceId",type:"bytes4"}],name:"supportsInterface",outputs:[{internalType:"bool",name:"",type:"bool"}],stateMutability:"view",type:"function"},{inputs:[],name:"symbol",outputs:[{internalType:"string",name:"",type:"string"}],stateMutability:"view",type:"function"},{inputs:[],name:"totalSupply",outputs:[{internalType:"uint256",name:"",type:"uint256"}],stateMutability:"view",type:"function"},{inputs:[{internalType:"address",name:"to",type:"address"},{internalType:"uint256",name:"amount",type:"uint256"}],name:"transfer",outputs:[{internalType:"bool",name:"",type:"bool"}],stateMutability:"nonpayable",type:"function"},{inputs:[{internalType:"address",name:"from",type:"address"},{internalType:"address",name:"to",type:"address"},{internalType:"uint256",name:"amount",type:"uint256"}],name:"transferFrom",outputs:[{internalType:"bool",name:"",type:"bool"}],stateMutability:"nonpayable",type:"function"}];const P="0x9b9a5C1Af0A543d7dd243Bea6BDD53458dd0F067",K="0x16B052D944c1b7731d7C240b6072530929C93b40",at="0x6ce8dA28E2f864420840cF74474eFf5fD80E65B8",T=(e,t=P,n=nt)=>{const a=new B.default(e);return new a.eth.Contract(n,t)},v=async(e,t,n)=>await e.methods[t](...n).call(),ye=async(e,t,n,a,r,l)=>{const b=new B.default(l),G=await t.methods[n](...a).estimateGas({from:e}),Dt={gasPrice:await b.eth.getGasPrice(),from:e,gas:G};await t.methods[n](...a).send(Dt).on("transactionHash",Y=>{p(r,{txHash:Y})}).on("receipt",Y=>{p(r,{receipt:Y})})};var w={getVaultBalance:async(e,t)=>{const n=T(t);return{balance:await v(n,"balanceOf",[e])}},withdrawConsensually:async(e,t)=>{const n=T(t),a=new B.default(t),r=e.addresses[0],l=await n.methods.withdrawAlice(e).estimateGas({from:r}),G={gasPrice:await a.eth.getGasPrice(),from:r,gas:l};await n.methods.withdrawAlice(e).send(G).on("transactionHash",N=>{console.log("txHash",N),p(s.withdrawHash,N)}).on("receipt",N=>{console.log("receipt",N),p(s.withdrawReceipt,N)})},getDegaBalance:async(e,t)=>{const n=T(t,K,M);return await v(n,"balanceOf",[e])},depositDega:async(e,t,n)=>{const a=T(n);await ye(t,a,"deposit",[e],s.depositDega,n)},approveDega:async(e,t,n)=>{const a=T(n,K,M);await ye(t,a,"approve",[P,e],s.approveDega,n)},getBtcbBalance:async(e,t)=>{const n=T(t,at,M);return await v(n,"balanceOf",[e])},getBnbBalance:async(e,t)=>await new B.default(t).eth.getBalance(e),getLastClosedChannel:async(e,t)=>{const n=T(t),a=await v(n,"emergencyWithdrawRequests",[e]);return a.claimTransaction.id.toString()!=="0"?a.claimTransaction.id.toString():(await v(n,"withdrawTransactions",[e])).id.toString()},getDegaAllowance:async(e,t)=>{const n=T(t,K,M);return await v(n,"allowance",[e,P])}};const st=async(e,t)=>{E.isValidNewClaim(e);{if(!R(e))throw new Error("Server's signature is not verified");const n=await U(e,t);if(await ge(e,t)===!0&&n)return await H(e),g.saveConfirmedClaim(e),e;throw new Error("Server's balance is not enough")}},me=e=>({types:{EIP712Domain:[{name:"name",type:"string"},{name:"version",type:"string"},{name:"chainId",type:"uint256"},{name:"verifyingContract",type:"address"}],Claim:[{name:"id",type:"uint256"},{name:"alice",type:"address"},{name:"bob",type:"address"},{name:"nonce",type:"uint256"},{name:"timestamp",type:"uint256"},{name:"messageForAlice",type:"string"},{name:"cumulativeDebitAlice",type:"uint256"},{name:"cumulativeDebitBob",type:"uint256"},{name:"closed",type:"uint256"}]},domain:ne,primaryType:"Claim",message:{id:e.id,alice:e.addresses[o],bob:e.addresses[u],nonce:e.nonce,timestamp:e.timestamp,messageForAlice:e.messageForAlice,cumulativeDebitAlice:e.cumulativeDebits[o],cumulativeDebitBob:e.cumulativeDebits[u],closed:e.closed}}),R=(e,t=!1)=>{let n=1;t&&(n=0);const a=me(e),r=e.signatures[n];try{return f.recoverTypedSignature({data:a,signature:r,version:f.SignTypedDataVersion.V4}).toUpperCase()===e.addresses[n].toUpperCase()}catch{return!1}},rt=async(e,t)=>{const n=we(e);E.isValidNewClaim(e);const a=await U(e,t);if(n&&a){if(await ge(e,t)===!0)return await H(e),g.saveClaimAlice(e),e;throw new Error("Not enough balance")}},we=e=>{const t=g.getClaimAlice(e.addresses[o]);if(t&&t.id===e.id&&t.nonce>=e.nonce)throw new Error(`Claim with nonce ${e.nonce} is already signed`);return!0},ge=async(e,t)=>{const n=e.amount<0?0:1;return n===1?!0:it(e,n,t)},it=async(e,t,n)=>{try{const{balance:a}=await w.getVaultBalance(e.addresses[t],n);return!!d.gte(a,e.cumulativeDebits[t])}catch{throw new Error("Can't get balance from Vault")}},H=async e=>{const t=me(e),n=e.addresses[o];e.signatures[o]=await te(t,n)},ot=async e=>{if(E.isValidClaimAlice(e))if(R(e))g.saveConfirmedClaim(e);else throw new Error("Server's signature is not verified")},ct=async(e,t)=>{const n=we(e);let a;try{a=(await w.getVaultBalance(e.addresses[o],t)).balance}catch{throw new Error("Can't get balance from Vault")}const r=E.isValidWithdraw(e,a),l=await U(e,t);if(r&&n&&l)return await H(e),g.saveClaimAlice(e),e;throw new Error("Withdraw claim is not valid")},U=async(e,t)=>{const n=await w.getLastClosedChannel(e.addresses[o],t);if(d.eq(d.plus(n,"1"),e.id))return!0;throw new Error("Invalid channel id")};var C={cashin:rt,claimControfirmed:ot,cashout:st,signWithdraw:ct,lastClaim:(e,t)=>{const n=g.getConfirmedClaim(t);if(!n&&e===null)return!0;if(!n&&e&&e.nonce)return g.saveConfirmedClaim(e),!0;if(n&&e===null)return n;if(e.id>=n.id&&e.nonce>n.nonce)return R(e,!0)&&R(e)?(g.saveConfirmedClaim(e),!0):n;try{return E.areEqualClaims(e,n)===!0&&e.signatures[o]===n.signatures[o]&&e.signatures[u]===n.signatures[u]?!0:n}catch{return n}},downloadLastClaim:g.downloadLastClaim,getConfirmedClaim:g.getConfirmedClaim};const lt=async e=>{try{await y()}catch(n){throw i(s.claimNotSigned,n),n}const t=m();try{const n=await C.cashin(e,t);return p(s.claimSigned,{claim:n}),n}catch(n){throw i(s.claimNotSigned,n),n}},ut=async e=>{const t=m();try{return await w.getVaultBalance(e,t)}catch(n){console.error(n)}},dt=async e=>{try{await y()}catch(t){throw i(s.claimNotConfirmed,t),t}try{await C.claimControfirmed(e),p(s.claimConfirmed,{claim:e})}catch(t){throw i(s.claimNotConfirmed,{message:t,claim:e}),t}},pt=async e=>{try{await y()}catch(n){throw i(s.winNotConfirmed,n),n}const t=m();try{const n=await C.cashout(e,t);return p(s.winClaimSigned,{claim:n}),n}catch(n){throw i(s.winNotConfirmed,n),n}},yt=async e=>{if(e&&e.hasOwnProperty("error")){i(s.claimNotSynced,e.error);return}const{address:t}=await ee();if(e&&e.addresses[o].toLowerCase()!==t.toLowerCase()){i(s.claimNotSynced,e.error);return}const n=C.lastClaim(e,t);if(n===!0)p(s.claimSynced,"Claims are synced");else return i(s.claimNotSynced,{message:"Claims are not synced",lastClaim:n}),n},mt=async e=>{try{await y()}catch(n){throw i(s.claimNotSigned,n),n}const t=m();try{const n=await C.signWithdraw(e,t);return p(s.claimSigned,{claim:n}),n}catch(n){throw i(s.claimNotSigned,n),n}},wt=async e=>{try{await y()}catch(n){throw i(s.withdraw,n),n}const t=m();try{await w.withdrawConsensually(e,t),p(s.withdraw,"Consensual withdraw is sent to blockchain")}catch(n){console.log("error",n),i(s.withdraw,n)}},gt=async e=>{if(!e)return"0";try{await y()}catch(r){throw i(s.getBalance,r),r}let t="0";const n=m(),a=C.getConfirmedClaim(e);if(a&&a.closed===1&&await w.getLastClosedChannel(e,n)!==a.id.toString())return t;try{t=d.plus(t,(await w.getVaultBalance(e,n)).balance)}catch(r){i(s.getBalance,r)}return a&&a.closed!==1&&(t=d.plus(t,d.minus(a.cumulativeDebits[u],a.cumulativeDebits[o]))),t};var h={cashin:lt,claimControfirmed:dt,cashout:pt,lastClaim:yt,signWithdraw:mt,withdrawConsensually:wt,getVaultBalance:ut,downloadLastClaim:C.downloadLastClaim,getTotalBalance:gt};const ht=async(e,t)=>{try{y()}catch(a){throw i(s.depositDega,a),a}const n=m();try{await bt(e,t,n)}catch(a){throw i(s.depositDega,a),a}try{await w.depositDega(e,t,n)}catch(a){throw i(s.depositDega,a),a}},bt=async(e,t,n)=>{let a;try{a=await w.getDegaBalance(t,n)}catch{throw new Error("Can't get balance of Dega")}if(d.lt(a,e))throw new Error("The balance of Dega is not enough")};var D={depositDega:ht,approveDega:async(e,t)=>{try{y()}catch(a){throw i(s.approveDega,a),a}const n=m();try{await w.approveDega(e,t,n)}catch(a){throw i(s.approveDega,a),a}},getDegaBalance:async e=>{try{y()}catch(a){throw i(s.getBalance,a),a}const t=m();let n="0";try{n=await w.getDegaBalance(e,t)}catch{throw new Error("Can't get balance of Dega")}return n.toString()},getBtcbBalance:async e=>{try{y()}catch(a){throw i(s.getBalance,a),a}const t=m();let n="0";try{n=await w.getBtcbBalance(e,t)}catch{throw new Error("Can't get balance of BTCB")}return n.toString()},getBnbBalance:async e=>{try{y()}catch(a){throw i(s.getBalance,a),a}const t=m();let n="0";try{n=await w.getBnbBalance(e,t)}catch{throw new Error("Can't get balance of BNB")}return n.toString()},getDegaAllowance:async e=>{try{y()}catch(n){throw i(s.approveDega,n),n}const t=m();try{return await w.getDegaAllowance(e,t)}catch(n){throw i(s.approveDega,n),n}}};const ft="CASHIN",Tt="CASHOUT",Ct="WITHDRAW",vt="HANDSHAKE";return{getAddress:ee,isMetamaskInstalled:Z,isRightNet:X,setRightNet:Ee,addEventListener:be,addEventListenerWS:fe,emitEventWS:Te,receiveMsg:async e=>{if(e){const{action:t,claim:n,context:a,error:r}=JSON.parse(e);switch(r&&i(s.general,r),t){case vt:{const l=await h.lastClaim(n);if(l)return{action:t,claim:l,context:a};break}case ft:{if(!n.signatures[o]&&!n.signatures[u]){const l=await h.cashin(n);return{action:t,claim:l,context:a}}else if(n.signatures[o]&&n.signatures[u])await h.claimControfirmed(n);else throw new Error("Invalid claim");break}case Tt:if(!n.signatures[o]&&n.signatures[u]){const l=await h.cashout(n);return{action:t,claim:l,context:a}}else throw new Error("Invalid claim");case Ct:{if(!n.signatures[o]&&!n.signatures[u]){const l=await h.signWithdraw(n);return{action:t,claim:l,context:a}}else if(n.signatures[o]&&n.signatures[u])await h.claimControfirmed(n),await h.withdrawConsensually(n);else throw new Error("Invalid claim");break}}}},signChallenge:S.signChallenge,setToken:S.setToken,getToken:S.getToken,isLogged:S.isLogged,getVaultBalance:h.getVaultBalance,getTotalBalance:h.getTotalBalance,downloadLastClaim:h.downloadLastClaim,formatNumber:q,pay:h.cashin,payReceived:h.claimControfirmed,win:h.cashout,depositDega:D.depositDega,approveDega:D.approveDega,getDegaAllowance:D.getDegaAllowance,getDegaBalance:D.getDegaBalance,getBtcbBalance:D.getBtcbBalance,getBnbBalance:D.getBnbBalance}});
