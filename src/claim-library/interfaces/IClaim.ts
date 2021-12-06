export interface IClaim extends Record<string, any> {
    id: number;
    alice: string;
    bob: string;
    nonce: number;
    timestamp: number;
    messageForAlice: string;
    cumulativeDebitAlice: number;
    cumulativeDebitBob: number;
}