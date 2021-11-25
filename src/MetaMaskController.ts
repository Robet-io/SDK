import Web3 from "web3";

class MetaMaskController {
  public account: string | undefined;
  public networkId: number | undefined;
  resolve: ((account: string | undefined) => void) | undefined;
  ethereum: any;

  constructor(private web3: Web3, private environment: any) {
    // @ts-ignore
    this.ethereum = window.ethereum;
  }

  async onNetwork() {
    this.web3.eth.net
      .getId()
      .then((_networkId: number) => {
        this.networkId = _networkId;
        console.log("Network id: " + this.networkId);
        if (this.networkId != this.environment.chainId) {
          return this.switchChain();
        } else {
          console.log("getBalance for account: " + this.account);
          this.web3.eth
            .getBalance(this.account as string)
            .then((balance: string) => {
              console.log("Balance: " + balance);
            });
          if (this.resolve) this.resolve(this.account);
        }
      })
      .then(() => {});
  }

  async switchChain() {
    try {
      await this.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: this.environment.chainIdHex }]
      });
    } catch (switchError) {
      // This error code indicates that the chain has not been added to MetaMask.
      if ((switchError as { code: number }).code === 4902) {
        try {
          await this.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: this.environment.chainIdHex,
                rpcUrls: [this.environment.rpcUrlTestnet],
                chainName: this.environment.chainName
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
      console.log("init");

      if (typeof this.ethereum !== "undefined") {
        console.log("MetaMask is installed!");
        console.log("Network: " + this.ethereum.networkVersion);
        console.log("Address: " + this.ethereum.selectedAddress);
        this.ethereum
          .request({ method: "eth_requestAccounts" })
          .then((accounts: Array<string>) => {
            this.account = accounts[0];
            console.log("Accounts: " + accounts[0]);

            this.onNetwork();
          });
        this.ethereum.on("accountsChanged", (accounts: Array<string>) => {
          // Time to reload your interface with accounts[0]!
          this.account = accounts[0];
          console.log("Accounts changed: " + accounts[0]);

          this.onNetwork();
        });
        this.ethereum.on("chainChanged", (chain: number) => {
          return this.switchChain();
        });
      }
    });
  }
}

export { MetaMaskController };
