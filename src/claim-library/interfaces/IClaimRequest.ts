export interface IClaimRequest extends Record<string, any> {
    id: number;
    addresses: string[];
    cumulativeDebits: number[];
    nonce: number;
    timestamp: number;
    amount: number;
    messageForAlice: string;
    signatures: Array<string>;
}
