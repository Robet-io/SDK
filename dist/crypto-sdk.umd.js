(function(g,C){typeof exports=="object"&&typeof module!="undefined"?module.exports=C(require("@metamask/eth-sig-util"),require("bignumber.js"),require("web3")):typeof define=="function"&&define.amd?define(["@metamask/eth-sig-util","bignumber.js","web3"],C):(g=typeof globalThis!="undefined"?globalThis:g||self,g.cryptoSDK=C(g["@metamask/eth-sig-util"],g.bignumber.js,g.Web3))})(this,function(g,C,ye){"use strict";function P(e){return e&&typeof e=="object"&&"default"in e?e:{default:e}}var u=P(C),A=P(ye);const me=e=>{document.addEventListener(B,e)},we=e=>{document.addEventListener(K,e)},d=(e,t)=>{const n=new CustomEvent(B,{detail:{type:e,msg:t}});document.dispatchEvent(n)},ge=e=>{const t=new CustomEvent(K,{detail:JSON.parse(e)});document.dispatchEvent(t)},r=(e,t)=>{const n=new CustomEvent(B,{detail:{type:e,msg:t,error:!0}});document.dispatchEvent(n)},s={network:"network",accountsChanged:"accountsChanged",chainChanged:"chainChanged",message:"message",address:"address",wrongNetworkOnGetAddress:"wrongNetworkOnGetAddress",metamaskNotInstalled:"metamaskNotInstalled",general:"general",claimNotSigned:"claimNotSigned",claimSigned:"claimSigned",claimConfirmed:"claimConfirmed",claimNotConfirmed:"claimNotConfirmed",winClaimSigned:"winClaimSigned",winNotConfirmed:"winNotConfirmed",challengeSigned:"challengeSigned",challengeNotSigned:"challengeNotSigned",claimSynced:"claimSynced",claimNotSynced:"claimNotSynced",token:"jwtToken",withdraw:"withdraw",withdrawReceipt:"withdrawReceipt",withdrawHash:"withdrawHash",depositDega:"depositDega",withdrawDega:"withdrawDega",approveDega:"approveDega"},B="cryptoSDK",K="cryptoSDK_WS",_="97",he="BSC Testnet",be="https://data-seed-prebsc-1-s1.binance.org",fe="https://testnet.bscscan.com/",Te="BNB",ve="BNB",Ce="18",w=async()=>{const e=H(),t=h();if(t){const n=Number(await t.request({method:"eth_chainId"}));if(Array.isArray(e)){if(e.includes(n))return!0;{const a="Please change your network on Metamask. Valid networks are: "+x(e);throw new Error(a)}}else if(Number(n)!==Number(e)){const a=`Please set your network on Metamask to ${x(e)}`;throw new Error(a)}else return!0}},x=(e=!1)=>{const t=[];if(t[1]="Ethereum Mainnet",t[3]="Ethereum Ropsten",t[42]="Ethereum Kovan",t[4]="Ethereum Rinkeby",t[5]="Ethereum Goerli",t[56]="Binance Smart Chain",t[97]="Binance Smart Chain Testnet",e)if(Array.isArray(e)){const n=[];for(let a=0;a<e.length;a++)n.push(t[e[a]]);return n}else return t[e]?t[e]:(console.error(`Network ID ${e} Not found in the networksNames list`),x(_));else return t},H=()=>[Number(_)],U=async()=>{try{const e=await w();return d(s.network,e),e}catch(e){return r(s.network,e),!1}},Ne=async()=>{if(window.ethereum){const e=window.ethereum,n=[{chainId:`0x${Number(_).toString(16)}`,chainName:he,nativeCurrency:{name:Te,symbol:ve,decimals:Ce},rpcUrls:[be],blockExplorerUrls:[fe]}];try{await e.request({method:"wallet_addEthereumChain",params:n}),await w()?d(s.network,"Success, network is set to the right one"):r(s.network,"Add net error: network is not changed")}catch(a){r(s.network,`Add net error: ${a}`)}}else throw window.web3?(r(s.network,"This version of Metamask supports only manual network switching"),new Error("This version of Metamask supports only manual network switching")):(r(s.network,"Metamask is not installed"),new Error("Metamask is not installed"))},h=()=>{if(window.ethereum)return window.ethereum;if(window.web3)return window.web3.currentProvider;throw r(s.metamaskNotInstalled,{error:"Metamask is not installed"}),new Error("Metamask is not installed")},G=async e=>{try{await U()?d(s.chainChanged,{chainId:e}):r(s.chainChanged,{chainId:e})}catch{r(s.chainChanged,{chainId:e})}},Ee=()=>{window.ethereum?(window.ethereum.chainId||(window.ethereum.chainId="97"),window.ethereum.on("accountsChanged",async e=>{console.log("#### - Metamask: accountsChanged - accounts",e),d(s.accountsChanged,{accounts:e})}),window.ethereum.on("chainChanged",async e=>{console.log("#### - Metamask: chainChanged",e),await G(e)}),window.ethereum.on("error",async e=>{console.log("#### - Metamask: error",e),r(s.error,e)})):window.web3&&(window.web3.currentProvider.on("accountsChanged",async e=>{console.log("#### - Metamask web3: accountsChanged - accounts",e),d(s.accountsChanged,{accounts:e})}),window.web3.currentProvider.on("chainIdChanged",async e=>{console.log("#### - Metamask web3: chainChanged",e),await G(e)}),window.web3.currentProvider.on("error",async e=>{console.log("#### - Metamask web3: error",e),r(s.error,e)}))},De=async()=>{if(window.ethereum){const e=await window.ethereum.request({method:"eth_requestAccounts"});if(e&&e[0])return e[0];throw new Error("Can't get address")}else if(window.web3){const e=window.web3.eth.accounts;if(e&&e.length>0)return e[0];throw new Error("Can't get address")}else throw new Error("Metamask is not installed")},Y=()=>!!(window.ethereum||window.web3),Ae=async()=>{if(!Y()){const t="Metamask is not installed, unable to get user address";throw r(s.metamaskNotInstalled,t),new Error(t)}const e=H();try{await w(e)}catch(t){throw r(s.wrongNetworkOnGetAddress,t),new Error(t)}try{return{address:await De()}}catch(t){throw r(s.address,t),new Error(t)}},J=async(e,t)=>(await w(),await h().request({method:"eth_signTypedData_v4",params:[t,JSON.stringify(e)],from:t}));Ee();const j={name:"BSC Testnet",version:"1",chainId:"97",verifyingContract:"0x9b9a5C1Af0A543d7dd243Bea6BDD53458dd0F067"},Se=e=>({types:{EIP712Domain:[{name:"name",type:"string"},{name:"version",type:"string"},{name:"chainId",type:"uint256"},{name:"verifyingContract",type:"address"}],Signin:[{name:"method",type:"string"},{name:"text",type:"string"}]},domain:j,primaryType:"Signin",message:{method:"signin",text:e}}),ke=async(e,t)=>{const n=Se(e);try{const a=await J(n,t);return d(s.challengeSigned,{signature:a}),a}catch(a){throw r(s.challengeNotSigned,a),a}},z="authToken",X="expireToken",Ie=12e5,Me=e=>{try{localStorage.setItem(z,e),localStorage.setItem(X,Date.now()+Ie),d(s.token,"JWT token received")}catch(t){r(s.token,t)}},Q=()=>localStorage.getItem(z);var S={signChallenge:ke,setToken:Me,getToken:Q,isLogged:()=>{if(Q()){const t=localStorage.getItem(X);if(t&&t>Date.now())return!0}return!1}};const N={claimConfirmed:"claimConfirmed",claimAlice:"claimAlice"},Re=e=>{localStorage.setItem(N.claimConfirmed,JSON.stringify(e))},Be=()=>JSON.parse(localStorage.getItem(N.claimConfirmed)),_e=e=>{localStorage.setItem(N.claimAlice,JSON.stringify(e))},xe=()=>JSON.parse(localStorage.getItem(N.claimAlice)),$e=()=>{const e=localStorage.getItem(N.claimConfirmed);if(!e)return;const t=Ve(e),n=document.createElement("a"),a=`lastConfirmedClaim-${new Date().toISOString()}.json`;n.setAttribute("href","data:application/json;charset=utf-8,"+encodeURIComponent(t)),n.setAttribute("download",a),n.style.display="none",document.body.appendChild(n),n.click(),document.body.removeChild(n)},Ve=e=>(e=e.replace("{",`{
`),e=e.replace("}",`
}`),e=e.replaceAll(",",`,
`),e);var y={saveConfirmedClaim:Re,getConfirmedClaim:Be,saveClaimAlice:_e,getClaimAlice:xe,downloadLastClaim:$e};const We=(e,t=2)=>new u.default(e+"").toFixed(t),Fe=(e,t)=>{const n=new u.default(e+""),a=new u.default(t+"");return n.minus(a).toFixed()},Z=(e,t)=>{const n=new u.default(e+""),a=new u.default(t+"");return n.plus(a).toFixed()},qe=(e,t=2)=>new u.default(e+"").toFixed(t),$=e=>{if(e==="0"||e===0)return"10";if(te(e,1)){const n=e.replace("0.","").length;console.log("l",n);const a=ee(10,n);console.log({p:a});const i=k(e,a);console.log({b:i});const o=$(i);console.log({c:o});const b=I(o,a);return console.log({d:b}),b}else{const t=k(I(e,10,0,u.default.ROUND_UP),10);return t===e+""?$(Z(e,1)):t}},k=(e,t,n=18,a=u.default.ROUND_FLOOR)=>{let i=new u.default(e+"");const o=new u.default(t+"");return i=i.times(o).toFixed(),n=parseInt(n),V(i,n,a)},Oe=(e,t,n=18)=>k(e,t,n),I=(e,t,n=18,a=u.default.ROUND_FLOOR)=>{let i=new u.default(e+"");const o=new u.default(t+"");return i=i.div(o).toFixed(),n=parseInt(n),V(i,n,a)},Le=(e,t,n=18)=>I(e,t,n),ee=(e,t)=>{const n=new u.default(e+""),a=new u.default(t+"");return n.pow(a)},Pe=(e,t)=>{const n=new u.default(e+""),a=new u.default(t+"");return n.eq(a)},te=(e,t)=>{const n=new u.default(e+""),a=new u.default(t+"");return n.lt(a)},Ke=(e,t)=>{const n=new u.default(e+""),a=new u.default(t+"");return n.gt(a)},He=(e,t)=>{const n=new u.default(e+""),a=new u.default(t+"");return n.lte(a)},Ue=(e,t)=>{const n=new u.default(e+""),a=new u.default(t+"");return n.gte(a)},Ge=e=>new u.default(e+"").isNaN(),V=(e,t,n)=>new u.default(e+"").dp(parseInt(t),n).toFixed();var p={minus:Fe,plus:Z,times:k,div:I,pow:ee,eq:Pe,lt:te,gt:Ke,lte:He,gte:Ue,isNaN:Ge,dp:V,negated:e=>new u.default(e+"").negated().toFixed(),timesFloor:Oe,divFloor:Le,toFixed:We,roundUpToTen:$,roundDecimals:qe,abs:e=>new u.default(e+"").abs().toFixed()};const c=0,l=1,W=(e,t=18)=>{if(!e)return;const i=new A.default().utils.fromWei(e).split("."),o=i[0].toString().replace(/\b0+(?!$)/g,"").replace(/\B(?=(\d{3})+(?!\d))/g,",");if(i[1])if(t){const b=i[1].substring(0,t).replace(/0+$/,"");return o+`${b?"."+b:""}`}else return o+"."+i[1];else return o},M="0xeA085D9698651e76750F07d0dE0464476187b3ca",ne=e=>{const t=y.getConfirmedClaim();if(t){const n=t.closed===1,a=n?t.id+1:t.id,i=n?1:t.nonce+1;if(a!==e.id)throw new Error(`Invalid claim id: ${e.id} - last claim id: ${t.id}${n?". id must change after withdraw":""}`);if(i!==e.nonce)throw new Error(`Invalid claim nonce: ${e.nonce} ${n?" - channel id is changed":`- last claim nonce: ${t.nonce}`}`);if(e.addresses[l]!==M)throw new Error(`Invalid address of Server: ${e.addresses[l]} - expected: ${M}`);const o=n?e.amount:p.plus(p.minus(t.cumulativeDebits[l],t.cumulativeDebits[c]),e.amount);ae(o,e.cumulativeDebits)}else{if(e.id!==1)throw new Error(`Invalid claim id: ${e.id}`);if(e.nonce!==1)throw new Error(`Invalid claim nonce: ${e.nonce}`);if(e.addresses[l]!==M)throw new Error(`Invalid address of Server: ${e.addresses[l]} - expected: ${M}`);const n=e.amount;ae(n,e.cumulativeDebits)}return Ye(e),!0},Ye=e=>{if(e.closed===0){const t=`You ${p.gt(e.amount,"0")?"receive":"spend"}: ${W(p.abs(e.amount))} DE.GA`;if(e.messageForAlice!==t)throw new Error(`Invalid message for Alice: ${e.messageForAlice} - expected: ${t}`)}},ae=(e,t)=>{if(p.gt(e,0)){if(!p.eq(t[c],0))throw new Error(`Invalid claim cumulative debit of Client: ${t[c]} - expected: 0`);if(!p.eq(t[l],e))throw new Error(`Invalid claim cumulative debit of Server: ${t[l]} - expected: ${e}`)}else{if(!p.eq(t[c],p.negated(e)))throw new Error(`Invalid claim cumulative debit of Client: ${t[c]} - expected: ${-e}`);if(!p.eq(t[l],0))throw new Error(`Invalid claim cumulative debit of Server: ${t[l]} - expected: 0`)}},Je=e=>{let t=ne(e);if(t){const n=y.getClaimAlice();n&&(t=F(e,n))}return t},F=(e,t,n=!1)=>{if(t.id!==e.id)throw new Error(`Invalid claim id: ${e.id} - saved claim id: ${t.id}`);const a=n?e.nonce-1:e.nonce;if(t.nonce!==a)throw new Error(`Invalid claim nonce: ${e.nonce} - saved claim nonce: ${t.nonce}`);if(t.cumulativeDebits[c]!==e.cumulativeDebits[c])throw new Error(`Invalid claim cumulative debit of Client: ${e.cumulativeDebits[c]} - saved claim: ${t.cumulativeDebits[c]}`);if(t.cumulativeDebits[l]!==e.cumulativeDebits[l])throw new Error(`Invalid claim cumulative debit of Server: ${e.cumulativeDebits[l]} - saved claim: ${t.cumulativeDebits[l]}`);if(t.addresses[c]!==e.addresses[c])throw new Error(`Invalid address of Client: ${e.addresses[c]} - saved claim: ${t.addresses[c]}`);if(t.addresses[l]!==e.addresses[l])throw new Error(`Invalid address of Server: ${e.addresses[l]} - saved claim: ${t.addresses[l]}`);if(!n&&t.timestamp!==e.timestamp)throw new Error(`Invalid timestamp of Server: ${e.timestamp} - saved claim: ${t.timestamp}`);if(!n&&t.messageForAlice!==e.messageForAlice)throw new Error(`Invalid message for Alice: ${e.messageForAlice} - expected: ${t.messageForAlice}`);return!0},je=(e,t)=>{ze(e,t);const n=y.getConfirmedClaim();return n?F(e,n,!0):!1},ze=(e,t)=>{const n=p.plus(t,p.minus(e.cumulativeDebits[l],e.cumulativeDebits[c])),a=`You are withdrawing: ${W(n)} DE.GA`;if(e.messageForAlice!==a)throw new Error(`Invalid message for Alice: ${e.messageForAlice} - expected: ${a}`)};var E={isValidNewClaim:ne,isValidClaimAlice:Je,areEqualClaims:F,isValidWithdraw:je},Xe=[{anonymous:!1,inputs:[{components:[{components:[{internalType:"uint256",name:"id",type:"uint256"},{internalType:"uint256",name:"nonce",type:"uint256"},{internalType:"uint256",name:"timestamp",type:"uint256"},{internalType:"uint256[]",name:"cumulativeDebits",type:"uint256[]"}],internalType:"struct VaultV1.ClaimTransaction",name:"claimTransaction",type:"tuple"},{internalType:"uint256",name:"timestamp",type:"uint256"},{internalType:"address",name:"requester",type:"address"}],indexed:!1,internalType:"struct VaultV1.EmergencyWithdrawRequest",name:"emergencyWithdrawRequest",type:"tuple"}],name:"InitEmergencyWithdraw",type:"event"},{anonymous:!1,inputs:[{indexed:!0,internalType:"bytes32",name:"role",type:"bytes32"},{indexed:!0,internalType:"bytes32",name:"previousAdminRole",type:"bytes32"},{indexed:!0,internalType:"bytes32",name:"newAdminRole",type:"bytes32"}],name:"RoleAdminChanged",type:"event"},{anonymous:!1,inputs:[{indexed:!0,internalType:"bytes32",name:"role",type:"bytes32"},{indexed:!0,internalType:"address",name:"account",type:"address"},{indexed:!0,internalType:"address",name:"sender",type:"address"}],name:"RoleGranted",type:"event"},{anonymous:!1,inputs:[{indexed:!0,internalType:"bytes32",name:"role",type:"bytes32"},{indexed:!0,internalType:"address",name:"account",type:"address"},{indexed:!0,internalType:"address",name:"sender",type:"address"}],name:"RoleRevoked",type:"event"},{anonymous:!1,inputs:[{components:[{components:[{internalType:"uint256",name:"id",type:"uint256"},{internalType:"uint256",name:"nonce",type:"uint256"},{internalType:"uint256",name:"timestamp",type:"uint256"},{internalType:"uint256[]",name:"cumulativeDebits",type:"uint256[]"}],internalType:"struct VaultV1.ClaimTransaction",name:"claimTransaction",type:"tuple"},{internalType:"uint256",name:"timestamp",type:"uint256"},{internalType:"address",name:"requester",type:"address"}],indexed:!1,internalType:"struct VaultV1.EmergencyWithdrawRequest",name:"emergencyWithdrawRequest",type:"tuple"},{indexed:!1,internalType:"string",name:"cause",type:"string"}],name:"StopEmergencyWithdraw",type:"event"},{anonymous:!1,inputs:[{components:[{internalType:"uint256",name:"id",type:"uint256"},{internalType:"uint256",name:"nonce",type:"uint256"},{internalType:"uint256",name:"timestamp",type:"uint256"},{internalType:"uint256[]",name:"cumulativeDebits",type:"uint256[]"}],indexed:!1,internalType:"struct VaultV1.ClaimTransaction",name:"claimTransaction",type:"tuple"}],name:"WithdrawAlice",type:"event"},{anonymous:!1,inputs:[{indexed:!1,internalType:"uint256",name:"amount",type:"uint256"}],name:"WithdrawBob",type:"event"},{inputs:[],name:"DEFAULT_ADMIN_ROLE",outputs:[{internalType:"bytes32",name:"",type:"bytes32"}],stateMutability:"view",type:"function"},{inputs:[{internalType:"address",name:"clientAddress",type:"address"}],name:"balanceOf",outputs:[{internalType:"uint256",name:"",type:"uint256"}],stateMutability:"view",type:"function"},{inputs:[{internalType:"address",name:"",type:"address"}],name:"balances",outputs:[{internalType:"uint256",name:"",type:"uint256"}],stateMutability:"view",type:"function"},{inputs:[{internalType:"uint256",name:"amount",type:"uint256"}],name:"deposit",outputs:[],stateMutability:"nonpayable",type:"function"},{inputs:[{internalType:"address",name:"account",type:"address"},{internalType:"uint256",name:"amount",type:"uint256"}],name:"depositFor",outputs:[],stateMutability:"nonpayable",type:"function"},{inputs:[],name:"emergencyWithdrawAlice",outputs:[],stateMutability:"nonpayable",type:"function"},{inputs:[{internalType:"address",name:"",type:"address"}],name:"emergencyWithdrawRequests",outputs:[{components:[{internalType:"uint256",name:"id",type:"uint256"},{internalType:"uint256",name:"nonce",type:"uint256"},{internalType:"uint256",name:"timestamp",type:"uint256"},{internalType:"uint256[]",name:"cumulativeDebits",type:"uint256[]"}],internalType:"struct VaultV1.ClaimTransaction",name:"claimTransaction",type:"tuple"},{internalType:"uint256",name:"timestamp",type:"uint256"},{internalType:"address",name:"requester",type:"address"}],stateMutability:"view",type:"function"},{inputs:[],name:"getChainId",outputs:[{internalType:"uint256",name:"",type:"uint256"}],stateMutability:"view",type:"function"},{inputs:[{internalType:"bytes32",name:"role",type:"bytes32"}],name:"getRoleAdmin",outputs:[{internalType:"bytes32",name:"",type:"bytes32"}],stateMutability:"view",type:"function"},{inputs:[{internalType:"bytes32",name:"role",type:"bytes32"},{internalType:"address",name:"account",type:"address"}],name:"grantRole",outputs:[],stateMutability:"nonpayable",type:"function"},{inputs:[{internalType:"bytes32",name:"role",type:"bytes32"},{internalType:"address",name:"account",type:"address"}],name:"hasRole",outputs:[{internalType:"bool",name:"",type:"bool"}],stateMutability:"view",type:"function"},{inputs:[{components:[{internalType:"uint256",name:"id",type:"uint256"},{internalType:"address[]",name:"addresses",type:"address[]"},{internalType:"uint256",name:"nonce",type:"uint256"},{internalType:"uint256",name:"timestamp",type:"uint256"},{internalType:"string",name:"messageForAlice",type:"string"},{internalType:"uint256[]",name:"cumulativeDebits",type:"uint256[]"},{internalType:"bytes[]",name:"signatures",type:"bytes[]"},{internalType:"uint256",name:"closed",type:"uint256"}],internalType:"struct VaultV1.ClaimRequest",name:"req",type:"tuple"}],name:"initEmergencyWithdrawAlice",outputs:[],stateMutability:"nonpayable",type:"function"},{inputs:[],name:"initEmergencyWithdrawAliceWithoutClaim",outputs:[],stateMutability:"nonpayable",type:"function"},{inputs:[{internalType:"address",name:"alice",type:"address"}],name:"initEmergencyWithdrawBob",outputs:[],stateMutability:"nonpayable",type:"function"},{inputs:[{internalType:"address",name:"tokenAddress",type:"address"},{internalType:"address",name:"serverAddress",type:"address"},{internalType:"string",name:"name",type:"string"},{internalType:"string",name:"version",type:"string"}],name:"initialize",outputs:[],stateMutability:"nonpayable",type:"function"},{inputs:[{internalType:"bytes32",name:"role",type:"bytes32"},{internalType:"address",name:"account",type:"address"}],name:"renounceRole",outputs:[],stateMutability:"nonpayable",type:"function"},{inputs:[{internalType:"bytes32",name:"role",type:"bytes32"},{internalType:"address",name:"account",type:"address"}],name:"revokeRole",outputs:[],stateMutability:"nonpayable",type:"function"},{inputs:[{components:[{internalType:"uint256",name:"id",type:"uint256"},{internalType:"address[]",name:"addresses",type:"address[]"},{internalType:"uint256",name:"nonce",type:"uint256"},{internalType:"uint256",name:"timestamp",type:"uint256"},{internalType:"string",name:"messageForAlice",type:"string"},{internalType:"uint256[]",name:"cumulativeDebits",type:"uint256[]"},{internalType:"bytes[]",name:"signatures",type:"bytes[]"},{internalType:"uint256",name:"closed",type:"uint256"}],internalType:"struct VaultV1.ClaimRequest",name:"req",type:"tuple"}],name:"stopEmergencyWithdraw",outputs:[],stateMutability:"nonpayable",type:"function"},{inputs:[{internalType:"bytes4",name:"interfaceId",type:"bytes4"}],name:"supportsInterface",outputs:[{internalType:"bool",name:"",type:"bool"}],stateMutability:"view",type:"function"},{inputs:[{components:[{internalType:"uint256",name:"id",type:"uint256"},{internalType:"address[]",name:"addresses",type:"address[]"},{internalType:"uint256",name:"nonce",type:"uint256"},{internalType:"uint256",name:"timestamp",type:"uint256"},{internalType:"string",name:"messageForAlice",type:"string"},{internalType:"uint256[]",name:"cumulativeDebits",type:"uint256[]"},{internalType:"bytes[]",name:"signatures",type:"bytes[]"},{internalType:"uint256",name:"closed",type:"uint256"}],internalType:"struct VaultV1.ClaimRequest",name:"req",type:"tuple"}],name:"verify",outputs:[],stateMutability:"view",type:"function"},{inputs:[{components:[{internalType:"uint256",name:"id",type:"uint256"},{internalType:"address[]",name:"addresses",type:"address[]"},{internalType:"uint256",name:"nonce",type:"uint256"},{internalType:"uint256",name:"timestamp",type:"uint256"},{internalType:"string",name:"messageForAlice",type:"string"},{internalType:"uint256[]",name:"cumulativeDebits",type:"uint256[]"},{internalType:"bytes[]",name:"signatures",type:"bytes[]"},{internalType:"uint256",name:"closed",type:"uint256"}],internalType:"struct VaultV1.ClaimRequest",name:"req",type:"tuple"}],name:"withdrawAlice",outputs:[],stateMutability:"nonpayable",type:"function"},{inputs:[{internalType:"uint256",name:"amount",type:"uint256"}],name:"withdrawBob",outputs:[],stateMutability:"nonpayable",type:"function"},{inputs:[{internalType:"address",name:"",type:"address"}],name:"withdrawTransactions",outputs:[{internalType:"uint256",name:"id",type:"uint256"},{internalType:"uint256",name:"nonce",type:"uint256"},{internalType:"uint256",name:"timestamp",type:"uint256"}],stateMutability:"view",type:"function"}],se=[{inputs:[],stateMutability:"nonpayable",type:"constructor"},{anonymous:!1,inputs:[{indexed:!0,internalType:"address",name:"owner",type:"address"},{indexed:!0,internalType:"address",name:"spender",type:"address"},{indexed:!1,internalType:"uint256",name:"value",type:"uint256"}],name:"Approval",type:"event"},{anonymous:!1,inputs:[{indexed:!0,internalType:"bytes32",name:"role",type:"bytes32"},{indexed:!0,internalType:"bytes32",name:"previousAdminRole",type:"bytes32"},{indexed:!0,internalType:"bytes32",name:"newAdminRole",type:"bytes32"}],name:"RoleAdminChanged",type:"event"},{anonymous:!1,inputs:[{indexed:!0,internalType:"bytes32",name:"role",type:"bytes32"},{indexed:!0,internalType:"address",name:"account",type:"address"},{indexed:!0,internalType:"address",name:"sender",type:"address"}],name:"RoleGranted",type:"event"},{anonymous:!1,inputs:[{indexed:!0,internalType:"bytes32",name:"role",type:"bytes32"},{indexed:!0,internalType:"address",name:"account",type:"address"},{indexed:!0,internalType:"address",name:"sender",type:"address"}],name:"RoleRevoked",type:"event"},{anonymous:!1,inputs:[{indexed:!0,internalType:"address",name:"from",type:"address"},{indexed:!0,internalType:"address",name:"to",type:"address"},{indexed:!1,internalType:"uint256",name:"value",type:"uint256"}],name:"Transfer",type:"event"},{inputs:[],name:"DEFAULT_ADMIN_ROLE",outputs:[{internalType:"bytes32",name:"",type:"bytes32"}],stateMutability:"view",type:"function"},{inputs:[],name:"MINTER_ROLE",outputs:[{internalType:"bytes32",name:"",type:"bytes32"}],stateMutability:"view",type:"function"},{inputs:[{internalType:"address",name:"owner",type:"address"},{internalType:"address",name:"spender",type:"address"}],name:"allowance",outputs:[{internalType:"uint256",name:"",type:"uint256"}],stateMutability:"view",type:"function"},{inputs:[{internalType:"address",name:"spender",type:"address"},{internalType:"uint256",name:"amount",type:"uint256"}],name:"approve",outputs:[{internalType:"bool",name:"",type:"bool"}],stateMutability:"nonpayable",type:"function"},{inputs:[{internalType:"address",name:"account",type:"address"}],name:"balanceOf",outputs:[{internalType:"uint256",name:"",type:"uint256"}],stateMutability:"view",type:"function"},{inputs:[{internalType:"uint256",name:"amount",type:"uint256"}],name:"burn",outputs:[],stateMutability:"nonpayable",type:"function"},{inputs:[{internalType:"address",name:"account",type:"address"},{internalType:"uint256",name:"amount",type:"uint256"}],name:"burn",outputs:[],stateMutability:"nonpayable",type:"function"},{inputs:[{internalType:"address",name:"account",type:"address"},{internalType:"uint256",name:"amount",type:"uint256"}],name:"burnFrom",outputs:[],stateMutability:"nonpayable",type:"function"},{inputs:[],name:"decimals",outputs:[{internalType:"uint8",name:"",type:"uint8"}],stateMutability:"view",type:"function"},{inputs:[{internalType:"address",name:"spender",type:"address"},{internalType:"uint256",name:"subtractedValue",type:"uint256"}],name:"decreaseAllowance",outputs:[{internalType:"bool",name:"",type:"bool"}],stateMutability:"nonpayable",type:"function"},{inputs:[{internalType:"bytes32",name:"role",type:"bytes32"}],name:"getRoleAdmin",outputs:[{internalType:"bytes32",name:"",type:"bytes32"}],stateMutability:"view",type:"function"},{inputs:[{internalType:"bytes32",name:"role",type:"bytes32"},{internalType:"address",name:"account",type:"address"}],name:"grantRole",outputs:[],stateMutability:"nonpayable",type:"function"},{inputs:[{internalType:"bytes32",name:"role",type:"bytes32"},{internalType:"address",name:"account",type:"address"}],name:"hasRole",outputs:[{internalType:"bool",name:"",type:"bool"}],stateMutability:"view",type:"function"},{inputs:[{internalType:"address",name:"spender",type:"address"},{internalType:"uint256",name:"addedValue",type:"uint256"}],name:"increaseAllowance",outputs:[{internalType:"bool",name:"",type:"bool"}],stateMutability:"nonpayable",type:"function"},{inputs:[{internalType:"address",name:"to",type:"address"},{internalType:"uint256",name:"amount",type:"uint256"}],name:"mint",outputs:[],stateMutability:"nonpayable",type:"function"},{inputs:[],name:"name",outputs:[{internalType:"string",name:"",type:"string"}],stateMutability:"view",type:"function"},{inputs:[{internalType:"bytes32",name:"role",type:"bytes32"},{internalType:"address",name:"account",type:"address"}],name:"renounceRole",outputs:[],stateMutability:"nonpayable",type:"function"},{inputs:[{internalType:"bytes32",name:"role",type:"bytes32"},{internalType:"address",name:"account",type:"address"}],name:"revokeRole",outputs:[],stateMutability:"nonpayable",type:"function"},{inputs:[{internalType:"bytes4",name:"interfaceId",type:"bytes4"}],name:"supportsInterface",outputs:[{internalType:"bool",name:"",type:"bool"}],stateMutability:"view",type:"function"},{inputs:[],name:"symbol",outputs:[{internalType:"string",name:"",type:"string"}],stateMutability:"view",type:"function"},{inputs:[],name:"totalSupply",outputs:[{internalType:"uint256",name:"",type:"uint256"}],stateMutability:"view",type:"function"},{inputs:[{internalType:"address",name:"to",type:"address"},{internalType:"uint256",name:"amount",type:"uint256"}],name:"transfer",outputs:[{internalType:"bool",name:"",type:"bool"}],stateMutability:"nonpayable",type:"function"},{inputs:[{internalType:"address",name:"from",type:"address"},{internalType:"address",name:"to",type:"address"},{internalType:"uint256",name:"amount",type:"uint256"}],name:"transferFrom",outputs:[{internalType:"bool",name:"",type:"bool"}],stateMutability:"nonpayable",type:"function"}];const re="0x9b9a5C1Af0A543d7dd243Bea6BDD53458dd0F067",ie="0x16B052D944c1b7731d7C240b6072530929C93b40",D=(e,t=re,n=Xe)=>{const a=new A.default(e);return new a.eth.Contract(n,t)},oe=async(e,t,n)=>await e.methods[t](n).call(),Qe=async(e,t)=>{const n=D(t);return{balance:await oe(n,"balanceOf",e)}},Ze=async(e,t)=>{const n=D(t),a=new A.default(t),i=e.addresses[0];try{const o=await n.methods.withdrawAlice(e).estimateGas({from:i}),O={gasPrice:await a.eth.getGasPrice(),from:i,gas:o};try{await n.methods.withdrawAlice(e).send(O).on("transactionHash",f=>{console.log("txHash",f),d(s.withdrawHash,f)}).on("receipt",f=>{console.log("receipt",f),d(s.withdrawReceipt,f)})}catch(f){throw new Error(f)}}catch(o){throw new Error(o)}},et=async(e,t)=>{const n=D(t,ie,se);return await oe(n,"balanceOf",e)},ue=async(e,t,n,a,i,o)=>{const b=new A.default(o),O=await t.methods[n](...a).estimateGas({from:e}),ct={gasPrice:await b.eth.getGasPrice(),from:e,gas:O};await t.methods[n](...a).send(ct).on("transactionHash",L=>{d(i,{txHash:L})}).on("receipt",L=>{d(i,{receipt:L})})};var T={getVaultBalance:Qe,withdrawConsensually:Ze,getDegaBalance:et,depositDega:async(e,t,n)=>{const a=D(n);await ue(t,a,"deposit",[e],s.depositDega,n)},approveDega:async(e,t,n)=>{const a=D(n,ie,se);await ue(t,a,"approve",[re,e],s.approveDega,n)}};const tt=async(e,t)=>{E.isValidNewClaim(e);{if(!R(e))throw new Error("Server's signature is not verified");if(await de(e,t)===!0)return await q(e),y.saveConfirmedClaim(e),e;throw new Error("Server's balance is not enough")}},le=e=>({types:{EIP712Domain:[{name:"name",type:"string"},{name:"version",type:"string"},{name:"chainId",type:"uint256"},{name:"verifyingContract",type:"address"}],Claim:[{name:"id",type:"uint256"},{name:"alice",type:"address"},{name:"bob",type:"address"},{name:"nonce",type:"uint256"},{name:"timestamp",type:"uint256"},{name:"messageForAlice",type:"string"},{name:"cumulativeDebitAlice",type:"uint256"},{name:"cumulativeDebitBob",type:"uint256"},{name:"closed",type:"uint256"}]},domain:j,primaryType:"Claim",message:{id:e.id,alice:e.addresses[c],bob:e.addresses[l],nonce:e.nonce,timestamp:e.timestamp,messageForAlice:e.messageForAlice,cumulativeDebitAlice:e.cumulativeDebits[c],cumulativeDebitBob:e.cumulativeDebits[l],closed:e.closed}}),R=(e,t=!1)=>{let n=1;t&&(n=0);const a=le(e),i=e.signatures[n];try{return g.recoverTypedSignature({data:a,signature:i,version:g.SignTypedDataVersion.V4}).toUpperCase()===e.addresses[n].toUpperCase()}catch{return!1}},nt=async(e,t)=>{const n=ce(e);if(E.isValidNewClaim(e),n){if(await de(e,t)===!0)return await q(e),y.saveClaimAlice(e),e;throw new Error("Not enough balance")}},ce=e=>{const t=y.getClaimAlice();if(t&&t.id===e.id&&t.nonce>=e.nonce)throw new Error(`Claim with nonce ${e.nonce} is already signed`);return!0},de=async(e,t)=>{const n=e.amount<0?0:1;return n===1?!0:at(e,n,t)},at=async(e,t,n)=>{try{const{balance:a}=await T.getVaultBalance(e.addresses[t],n);return!!p.gte(a,e.cumulativeDebits[t])}catch{throw new Error("Can't get balance from Vault")}},q=async e=>{const t=le(e),n=e.addresses[c];e.signatures[c]=await J(t,n)};var v={cashin:nt,claimControfirmed:async e=>{if(E.isValidClaimAlice(e))if(R(e))y.saveConfirmedClaim(e);else throw new Error("Server's signature is not verified")},cashout:tt,signWithdraw:async(e,t)=>{const n=ce(e);let a;try{a=(await T.getVaultBalance(e.addresses[c],t)).balance}catch{throw new Error("Can't get balance from Vault")}if(E.isValidWithdraw(e,a)&&n)return await q(e),y.saveClaimAlice(e),e;throw new Error("Withdraw claim is not valid")},lastClaim:e=>{const t=y.getConfirmedClaim();if(!t&&e===null)return!0;if(!t&&e&&e.nonce)return y.saveConfirmedClaim(e),!0;if(t&&e===null)return t;if(e.id>=t.id&&e.nonce>t.nonce)return R(e,!0)&&R(e)?(y.saveConfirmedClaim(e),!0):t;try{return E.areEqualClaims(e,t)===!0&&e.signatures[c]===t.signatures[c]&&e.signatures[l]===t.signatures[l]?!0:t}catch{return t}},downloadLastClaim:y.downloadLastClaim},m={cashin:async e=>{try{await w()}catch(n){throw r(s.claimNotSigned,n),n}const t=h();try{const n=await v.cashin(e,t);return d(s.claimSigned,{claim:n}),n}catch(n){throw r(s.claimNotSigned,n),n}},claimControfirmed:async e=>{try{await w()}catch(t){throw r(s.claimNotConfirmed,t),t}try{await v.claimControfirmed(e),d(s.claimConfirmed,{claim:e})}catch(t){throw r(s.claimNotConfirmed,{error:t,claim:e}),t}},cashout:async e=>{try{await w()}catch(n){throw r(s.winNotConfirmed,n),n}const t=h();try{const n=await v.cashout(e,t);return d(s.winClaimSigned,{claim:n}),n}catch(n){throw r(s.winNotConfirmed,n),n}},lastClaim:e=>{if(e&&e.hasOwnProperty("error")){r(s.claimNotSynced,e.error);return}const t=v.lastClaim(e);if(t===!0)d(s.claimSynced,"Claims are synced");else return r(s.claimNotSynced,{lastClaim:t}),t},signWithdraw:async e=>{try{await w()}catch(n){throw r(s.claimNotSigned,n),n}const t=h();try{const n=await v.signWithdraw(e,t);return d(s.claimSigned,{claim:n}),n}catch(n){throw r(s.claimNotSigned,n),n}},withdrawConsensually:async e=>{try{await w()}catch(n){throw r(s.withdraw,n),n}const t=h();try{await T.withdrawConsensually(e,t),d(s.withdraw,"Consensual withdraw is sent to blockchain")}catch(n){r(s.withdraw,n)}},getVaultBalance:async e=>{const t=h();try{return await T.getVaultBalance(e,t)}catch(n){console.error(n)}},downloadLastClaim:v.downloadLastClaim};const st=async(e,t)=>{try{w()}catch(a){throw r(s.depositDega,a),a}const n=h();try{await rt(e,t,n)}catch(a){throw r(s.depositDega,a),a}try{await T.depositDega(e,t,n)}catch(a){throw r(s.depositDega,a),a}},rt=async(e,t,n)=>{let a;try{a=await T.getDegaBalance(t,n)}catch{throw new Error("Can't get balance of Dega")}if(p.lt(a,e))throw new Error("The balance of Dega is not enough")};var pe={depositDega:st,approveDega:async(e,t)=>{try{w()}catch(a){throw r(s.approveDega,a),a}const n=h();try{await T.approveDega(e,t,n)}catch(a){throw r(s.approveDega,a),a}}};const it="CASHIN",ot="CASHOUT",ut="WITHDRAW",lt="HANDSHAKE";return{getAddress:Ae,isMetamaskInstalled:Y,isRightNet:U,setRightNet:Ne,addEventListener:me,addEventListenerWS:we,emitEventWS:ge,receiveMsg:async e=>{if(e){const{action:t,claim:n,context:a,error:i}=JSON.parse(e);switch(i&&r(s.general,i),t){case lt:{const o=m.lastClaim(n);if(o)return{action:t,claim:o,context:a};break}case it:{if(!n.signatures[c]&&!n.signatures[l]){const o=await m.cashin(n);return{action:t,claim:o,context:a}}else if(n.signatures[c]&&n.signatures[l])await m.claimControfirmed(n);else throw new Error("Invalid claim");break}case ot:if(!n.signatures[c]&&n.signatures[l]){const o=await m.cashout(n);return{action:t,claim:o,context:a}}else throw new Error("Invalid claim");case ut:{if(!n.signatures[c]&&!n.signatures[l]){const o=await m.signWithdraw(n);return{action:t,claim:o,context:a}}else if(n.signatures[c]&&n.signatures[l])await m.claimControfirmed(n),await m.withdrawConsensually(n);else throw new Error("Invalid claim");break}}}},signChallenge:S.signChallenge,setToken:S.setToken,getToken:S.getToken,isLogged:S.isLogged,getVaultBalance:m.getVaultBalance,downloadLastClaim:m.downloadLastClaim,formatNumber:W,pay:m.cashin,payReceived:m.claimControfirmed,win:m.cashout,depositDega:pe.depositDega,approveDega:pe.approveDega}});
