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
    export const setToken: (token: string) => void;
    export const getToken: () => string;
    export const isLogged: () => boolean;
    export const getVaultBalance: (address: string) => string;
    export const downloadLastClaim: () => void;
    export { formatNumber };
    export const pay: (claim: any) => any;
    export const payReceived: (claim: any) => Promise<void>;
    export const win: (claim: any) => any;
    export const depositDega: (amount: number, address: string) => any;
    export const approveDega: (amount: number, address: string) => Promise<void>;
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