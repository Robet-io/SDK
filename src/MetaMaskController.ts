import Web3 from "web3";
import { env } from "@coingames/claim-library";
import { Web3Provider } from "./Web3Provider";

class MetaMaskController {
    public account: string | undefined;
    public networkId: number | undefined;
    resolve: ((value: string | PromiseLike<string>) => void) | undefined;
    private readonly ethereum: any;
    private readonly web3: Web3;

    constructor() {
        this.ethereum = (window as any).ethereum;
        this.web3 = Web3Provider.getInstance();
    }

    async onNetwork() {
        this.web3.eth.net
            .getId()
            .then((_networkId: number) => {
                this.networkId = _networkId;
                console.log("Network id: " + this.networkId);
                if (this.networkId != env.get("chainId")) {
                    return this.switchChain();
                } else {
                    console.log("getBalance for account: " + this.account);
                    this.web3.eth
                        .getBalance(this.account as string)
                        .then((balance: string) => {
                            console.log("Balance: " + balance);
                        });
                    if (this.resolve) this.resolve(this.account as string);
                }
            })
            .then(() => {
            });
    }

    async switchChain() {
        try {
            await this.ethereum.request({
                method: "wallet_switchEthereumChain",
                params: [{ chainId: `0x${ env.get("chainId").toString(16) }` }]
            });
        } catch (switchError) {
            // This error code indicates that the chain has not been added to MetaMask.
            if ((switchError as { code: number }).code === 4902) {
                try {
                    await this.ethereum.request({
                        method: "wallet_addEthereumChain",
                        params: [
                            {
                                chainId: env.get("chainId").toString(16),
                                rpcUrls: [env.get("rpcUrl")],
                                chainName: env.get("chainName")
                            }
                        ]
                    });
                } catch (addError) {
                    // handle "add" error
                }
            }
            // handle other "switch" errors
        }
    }

    initMetamask(): Promise<string> {
        return new Promise((resolve, reject) => {
            this.resolve = resolve;
            console.log("init");

            if (typeof this.ethereum !== "undefined") {
                console.log("MetaMask is installed!");
                console.log("Network: " + this.ethereum.networkVersion);
                console.log("Address: " + this.ethereum.selectedAddress);
                this.ethereum
                    .request({ method: "eth_requestAccounts" })
                    .then(async (accounts: Array<string>) => {
                        this.account = accounts[0];
                        console.log("Accounts: " + accounts[0]);

                        await this.onNetwork();
                    });
                this.ethereum.on("accountsChanged", async (accounts: Array<string>) => {
                    // Time to reload your interface with accounts[0]!
                    this.account = accounts[0];
                    console.log("Accounts changed: " + accounts[0]);

                    await this.onNetwork();
                });
                this.ethereum.on("chainChanged", (chain: number) => {
                    return this.switchChain();
                });
            }
        });
    }
}

export { MetaMaskController };
