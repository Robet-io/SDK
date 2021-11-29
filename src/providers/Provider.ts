import { Inject, Service } from "typedi";
import { ProviderWeb3 } from "./ProviderWeb3";
import Web3 from "web3";

@Service("provider")
class Provider {
    private readonly _web3: Web3

    constructor(
        @Inject("provider.web3") web3Provider: ProviderWeb3
    ) {
        this._web3 = web3Provider.web3;
    }

    get web3(): Web3 {
        return this._web3;
    }
}
