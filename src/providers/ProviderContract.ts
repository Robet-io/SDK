import { Inject, Service } from "typedi";
import Web3 from "web3";

@Service("provider.web3")
export class ProviderWeb3 {
    private readonly _web3: Web3;

    constructor(
        @Inject("env") env: any
    ) {
        this._web3 = new Web3(new Web3.providers.HttpProvider(env.rpcUrl));
    }

    get web3(): Web3 {
        return this._web3;
    }

}
