declare namespace _default {
    export { depositDega };
    export { approveDega };
    export { getDegaBalance };
    export { getBtcbBalance };
    export { getBnbBalance };
}
export default _default;
/**
 * @param {number} amount
 * @param {string} address
 * @return {object} txhash
 */
declare function depositDega(amount: number, address: string): object;
/**
 * @param {number} amount
 * @param {string} address
 */
declare function approveDega(amount: number, address: string): Promise<void>;
/**
 * @param {string} address
 * @returns {string} balance
 */
declare function getDegaBalance(address: string): string;
/**
 * @param {string} address
 * @returns {string} balance
 */
declare function getBtcbBalance(address: string): string;
/**
 * @param {string} address
 * @returns {string} balance
 */
declare function getBnbBalance(address: string): string;
//# sourceMappingURL=erc20.d.ts.map