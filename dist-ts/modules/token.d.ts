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
 *
 * @param {string} token
 */
declare function setToken(token: string): void;
/**
 *
 * @returns {string}
 */
declare function getToken(): string;
/**
 *
 * @returns {boolean}
 */
declare function isLogged(): boolean;
//# sourceMappingURL=token.d.ts.map