export default cryptoSDK;
declare namespace cryptoSDK {
    export { getAddress };
    export { isMetamaskInstalled };
    export { isRightNet };
    export { setRightNet };
    export { addEventListener };
    export { receiveMsg };
    export const signChallenge: (challenge: string, address: string) => string;
    export const setToken: (token: string) => void;
    export const getToken: () => string;
    export const isLogged: () => boolean;
    export const getVaultBalance: (address: string) => string;
    export const downloadLastClaim: () => void;
    export const pay: (claim: any) => any;
    export const payReceived: (claim: any) => Promise<void>;
    export const win: (claim: any) => any;
}
import { getAddress } from "./modules/metamask";
import { isMetamaskInstalled } from "./modules/metamask";
import { isRightNet } from "./modules/network";
import { setRightNet } from "./modules/network";
import { addEventListener } from "./modules/events";
/**
 * @param {string} msg
 * @return {object}
 */
declare function receiveMsg(msg: string): object;
//# sourceMappingURL=index.d.ts.map