declare namespace _default {
    export { cashin };
    export { claimControfirmed };
    export { cashout };
    export { lastClaim };
    export { signWithdraw };
    export { withdrawConsensually };
    export { getVaultBalance };
    export const downloadLastClaim: (address: string) => void;
    export { getTotalBalance };
}
export default _default;
/**
 * @param {object} claim
 * @return {object}
 */
declare function cashin(claim: object): object;
/**
 *
 * @param {object} claim
 */
declare function claimControfirmed(claim: object): Promise<void>;
/**
 * @param {object} claim
 * @return {object}
 */
declare function cashout(claim: object): object;
/**
 *
 * @param {object} claim
 * @return {object|boolean}
 */
declare function lastClaim(claim: object): object | boolean;
/**
 * @param {object} claim
 * @return {object}
 */
declare function signWithdraw(claim: object): object;
/**
 *
 * @param {object} claim
 */
declare function withdrawConsensually(claim: object): Promise<void>;
/**
 * @param {string} address
 * @return {object}
 */
declare function getVaultBalance(address: string): object;
/**
 * @param {string} address
 * @return {string}
 */
declare function getTotalBalance(address: string): string;
//# sourceMappingURL=claims.d.ts.map