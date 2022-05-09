/**
 * @param {function(): void} cb
 */
export function addEventListener(cb: () => void): void;
/**
 * @param {string} type
 * @param {string} msg
 */
export function emitEvent(type: string, msg: string): void;
/**
 * @param {string} type
 * @param {string} msg
 */
export function emitErrorEvent(type: string, msg: string): void;
/**
 * @type {object}
 */
export const eventType: object;
/**
 * @param {function(): void} cb
 */
export function addEventListenerWS(cb: () => void): void;
/**
 * @param {string} msg
 */
export function emitEventWS(msg: string): void;
//# sourceMappingURL=events.d.ts.map