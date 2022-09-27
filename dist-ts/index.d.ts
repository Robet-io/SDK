export default cryptoSDK;
declare namespace cryptoSDK {
    export { getAddress };
    export { isMetamaskInstalled };
    export { isRightNet };
    export { setRightNet };
    export { addEventListener };
    export { addEventListenerWS };
    export { emitEventWS };
    export { receiveMsg };
    export const signChallenge: (challenge: string, address: string) => string;
    export const setToken: (address: string, token: string) => void;
    export const getToken: (address: string) => string;
    export const isLogged: (address: string) => boolean;
    export const getVaultBalance: (address: string) => any;
    export const getTotalBalance: (address: string) => string;
    export const downloadLastClaim: (address: string) => void;
    export { formatNumber };
    export const pay: (claim: any) => any;
    export const payReceived: (claim: any) => Promise<void>;
    export const win: (claim: any) => any;
    export const depositDega: (amount: string, address: string) => any;
    export const approveDega: (amount: string, address: string) => Promise<void>;
    export const getDegaAllowance: (address: string) => string;
    export const getDegaBalance: (address: string) => string;
    export const getBtcbBalance: (address: string) => string;
    export const getBnbBalance: (address: string) => string;
    export function sendConsensualWithdraw(): Promise<void>;
}
import { getAddress } from "./modules/metamask";
import { isMetamaskInstalled } from "./modules/metamask";
import { isRightNet } from "./modules/network";
import { setRightNet } from "./modules/network";
import { addEventListener } from "./modules/events";
import { addEventListenerWS } from "./modules/events";
import { emitEventWS } from "./modules/events";
/**
 * @param {string} msg
 * @return {object}
 */
declare function receiveMsg(msg: string): object;
import { formatNumber } from "./modules/utils";
//# sourceMappingURL=index.d.ts.map