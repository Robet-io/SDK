declare namespace _default {
    export { getVaultBalance };
    export { withdrawConsensually };
    export { getDegaBalance };
    export { depositDega };
    export { approveDega };
    export { getBtcbBalance };
    export { getBnbBalance };
    export { getLastClosedChannel };
    export { getDegaAllowance };
}
export default _default;
/**
 * @param {string} address
 * @param {object} web3Provider
 * @returns {object}
 */
declare function getVaultBalance(address: string, web3Provider: object): object;
/**
 * @param {object} claim
 * @param {object} web3Provider
 */
declare function withdrawConsensually(claim: object, web3Provider: object): Promise<void>;
/**
 * @param {string} address
 * @param {object} web3Provider
 * @returns {string} balance
 */
declare function getDegaBalance(address: string, web3Provider: object): string;
/**
 * @param {string} amount
 * @param {string} address
 * @param {object} web3Provider
 */
declare function depositDega(amount: string, address: string, web3Provider: object): Promise<void>;
/**
 * @param {string} amount
 * @param {string} address
 * @param {object} web3Provider
 */
declare function approveDega(amount: string, address: string, web3Provider: object): Promise<void>;
/**
 * @param {string} address
 * @param {object} web3Provider
 * @returns {string} balance
 */
declare function getBtcbBalance(address: string, web3Provider: object): string;
/**
 * @param {string} address
 * @param {object} web3Provider
 * @returns {string} balance
 */
declare function getBnbBalance(address: string, web3Provider: object): string;
/**
 * @param {string} address
 * @param {object} web3Provider
 * @returns {string}
 */
declare function getLastClosedChannel(address: string, web3Provider: object): string;
/**
 * @param {string} address
 * @param {object} web3Provider
 * @returns {string}
 */
declare function getDegaAllowance(address: string, web3Provider: object): string;
//# sourceMappingURL=index.d.ts.map