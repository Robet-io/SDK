import { ClaimTransaction } from "./ClaimTransaction";
declare class PaymentController {
    protected config: any;
    constructor(config: any);
    onMessageReceived(message: string): Promise<void>;
    pay(amount: number): Promise<void>;
    withdraw(): Promise<void>;
    protected saveTransaction(newClaim: ClaimTransaction): void;
    protected sendClaim(claim: ClaimTransaction): void;
}
declare const SDK: {
    init: (_config: any) => Promise<PaymentController>;
};
export default SDK;
