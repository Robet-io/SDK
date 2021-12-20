import { ClaimTypeEnum } from "../enums/ClaimTypeEnum";

export interface IClaimRequest extends Record<string, any> {
    id: number;
    type: ClaimTypeEnum,
    addresses: string[];
    cumulativeDebits: number[];
    nonce: number;
    timestamp: number;
    amount: number;
    messageForAlice: string;
    signatures: Array<string | undefined>;
}
