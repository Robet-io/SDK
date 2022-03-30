declare namespace _default {
    export { isValidNewClaim };
    export { isValidClaimAlice };
    export { areEqualClaims };
    export { isValidWithdraw };
}
export default _default;
/**
 *
 * @param {object} claim new claim for Alice
 */
declare function isValidNewClaim(claim: object): boolean;
/**
 *
 * @param {object} claim claim Alice, countersigned by Bob
 */
declare function isValidClaimAlice(claim: object): boolean;
/**
 *
 * @param {object} claim
 * @param {object} savedClaim
 * @param {boolean} [isWithdraw]
 */
declare function areEqualClaims(claim: object, savedClaim: object, isWithdraw?: boolean): boolean;
/**
 *
 * @param {object} claim claim Alice, countersigned by Bob
 * @param {int} balance
 */
declare function isValidWithdraw(claim: object, balance: int): boolean;
//# sourceMappingURL=claimControls.d.ts.map