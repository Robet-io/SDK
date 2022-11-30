/**
 * @return {boolean}
 */
export function isMetamaskInstalled(): boolean;
/**
 * @return {{ address: string}}
 */
export function getAddress(): {
    address: string;
};
/**
 * @param {object} msg
 * @param {string} from
 */
export function signTypedData(msg: object, from: string): Promise<any>;
//# sourceMappingURL=metamask.d.ts.map