import { SDK } from "./SDK";

const sdk = new SDK();

export function init() {
    return sdk.init();
}

export function pay(amount: number) {
    return sdk.pay(amount);
}
