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
 *
 * @return {object} claim
 */
declare function getConfirmedClaim(): object;
/**
 *
 * @param {object} claim
 */
declare function saveClaimAlice(claim: object): void;
/**
 *
 * @return {object} claim
 */
declare function getClaimAlice(): object;
declare function downloadLastClaim(): void;
//# sourceMappingURL=claimStorage.d.ts.map