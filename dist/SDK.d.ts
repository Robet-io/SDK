declare class ClaimTransaction {
    id: number;
    addresses: Array<string>;
    cumulativeDebits: Array<number>;
    signatures: Array<string>;
    nonce: number;
    timestamp: number;
    amount: number;
    messageForAlice: string;
    constructor();
    createPayment(amount: number, theirAddress: string): Promise<this>;
    serialize(): string;
    parse(body: any): this;
    encode(): any;
    checkSignature(): Promise<true>;
    check(): void;
    checkAndSign(): Promise<this>;
    checkAndCountersign(): Promise<this>;
    _sign(encodedClaim: any): Promise<void>;
    _checkSignature(encodedClaim: any): true;
    isSentClaim(): any;
}
declare function onMessageReceived(message: string): Promise<void>;
declare const SDK: {
    init: (_config: any) => Promise<void>;
    pay: (amount: number) => Promise<void>;
    onMessageReceived: typeof onMessageReceived;
    withdraw: () => Promise<void>;
};
export { SDK, ClaimTransaction };
