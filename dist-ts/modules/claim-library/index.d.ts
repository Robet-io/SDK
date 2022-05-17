declare namespace _default {
    export { cashin };
    export { claimControfirmed };
    export { cashout };
    export { signWithdraw };
    export { lastClaim };
    export const downloadLastClaim: (address: string) => void;
    export const getConfirmedClaim: (address: string) => any;
}
export default _default;
/**
 *
 * @param {object} claim New claim for sign
 * @param {object} web3Provider
 * @return {object}
 */
declare function cashin(claim: object, web3Provider: object): object;
/**
 *
 * @param {object} claim
 */
declare function claimControfirmed(claim: object): Promise<void>;
/**
 *
 * @param {object} claim
 * @param {object} web3Provider
 * @return {object}
 */
declare function cashout(claim: object, web3Provider: object): object;
/**
 *
 * @param {object} claim New claim for sign
 * @param {object} web3Provider
 * @return {object}
 */
declare function signWithdraw(claim: object, web3Provider: object): object;
/**
 * @param {object|null} claim
 * @param {string} address
 * @return {object|boolean}
 */
declare function lastClaim(claim: object | null, address: string): object | boolean;
//# sourceMappingURL=index.d.ts.map