declare namespace _default {
    export { getVaultBalance };
    export { withdrawConsensually };
}
export default _default;
/**
 *
 * @param {string} address
 * @param {object} web3Provider
 * @returns { balance: string }
 */
declare function getVaultBalance(address: string, web3Provider: object): any;
/**
 *
 * @param {object} claim
 * @param {object} web3Provider
 */
declare function withdrawConsensually(claim: object, web3Provider: object): Promise<void>;
//# sourceMappingURL=index.d.ts.map