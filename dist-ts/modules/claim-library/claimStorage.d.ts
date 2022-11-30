declare namespace _default {
    export { saveConfirmedClaim };
    export { getConfirmedClaim };
    export { saveClaimAlice };
    export { getClaimAlice };
    export { downloadLastClaim };
}
export default _default;
/**
 *
 * @param {object} claim
 */
declare function saveConfirmedClaim(claim: object): void;
/**
 * @param {string} address
 * @return {object} claim
 */
declare function getConfirmedClaim(address: string): object;
/**
 *
 * @param {object} claim
 */
declare function saveClaimAlice(claim: object): void;
/**
 * @param {string} address
 * @return {object} claim
 */
declare function getClaimAlice(address: string): object;
/**
 * @param {string} address
 */
declare function downloadLastClaim(address: string): void;
//# sourceMappingURL=claimStorage.d.ts.map