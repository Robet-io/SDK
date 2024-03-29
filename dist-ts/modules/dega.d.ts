declare namespace _default {
    export { depositDega };
    export { approveDega };
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
//# sourceMappingURL=dega.d.ts.map