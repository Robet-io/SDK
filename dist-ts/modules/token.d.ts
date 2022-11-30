declare namespace _default {
    export { signChallenge };
    export { setToken };
    export { getToken };
    export { isLogged };
}
export default _default;
/**
 *
 * @param {string} challenge
 * @param {string} address
 * @return {string}
 */
declare function signChallenge(challenge: string, address: string): string;
/**
 * @param {string} address
 * @param {string} token
 */
declare function setToken(address: string, token: string): void;
/**
 * @param {string} address
 * @returns {string}
 */
declare function getToken(address: string): string;
/**
 * @param {string} address
 * @returns {boolean}
 */
declare function isLogged(address: string): boolean;
//# sourceMappingURL=token.d.ts.map