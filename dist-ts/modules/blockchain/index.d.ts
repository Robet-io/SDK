declare namespace _default {
    export { getVaultBalance };
    export { withdrawConsensually };
    export { getDegaBalance };
    export { depositDega };
    export { approveDega };
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
/**
 *
 * @param {string} address
 * @param {object} web3Provider
 * @returns {string} balance
 */
declare function getDegaBalance(address: string, web3Provider: object): string;
/**
 *
 * @param {string} amount
 * @param {string} address
 * @param {object} web3Provider
 * @returns {object} txHash
 */
declare function depositDega(amount: string, address: string, web3Provider: object): object;
/**
 *
 * @param {string} amount
 * @param {string} address
 * @param {object} web3Provider
 * @returns {object} txHash
 */
declare function approveDega(amount: string, address: string, web3Provider: object): object;
//# sourceMappingURL=index.d.ts.map