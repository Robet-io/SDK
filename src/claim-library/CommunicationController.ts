import { EventEmitter } from "events";
import WebSocket from "ws";
import { IncomingMessage } from "http";
import { randomUUID } from "crypto";
import { ClaimDAOInterface } from "./interfaces/ClaimDAOInterface";
import { ClaimController } from "./ClaimController";
import { IEnvOptions } from "./interfaces/IEnvOptions";

export class CommunicationController extends EventEmitter {
    private _websocket!: WebSocket.Server;
    private onClientConnectedListeners: ({
        listener: (id: string | number, ws: WebSocket, request: IncomingMessage) => void
    })[] = [];
    private onConnectionCloseListeners: ({
        listener: (id: string | number, ws: WebSocket, code: number, reason: Buffer) => void
    })[] = [];
    private onMessageListeners: ({
        listener: (id: string | number, ws: WebSocket, data: WebSocket.RawData, isBinary: boolean) => void
    })[] = [];

    constructor() {
        super();
    }

    private _account = "";

    get account() {
        return this._account;
    }

    private _options!: IEnvOptions;

    get options(): IEnvOptions {
        return this._options;
    }

    private _clients = new Map();

    get clients(): Map<string | number, WebSocket> {
        return this._clients;
    }

    private _dao!: ClaimDAOInterface;

    get dao(): ClaimDAOInterface {
        return this._dao;
    }

    setOptions(value: IEnvOptions): CommunicationController {
        this._options = value;

        return this;
    }

    setDao(value: ClaimDAOInterface) {
        this._dao = value;

        return this;
    }

    getClient(id: string | number): WebSocket {
        return this._clients.get(id);
    }

    setAccount(value: string) {
        this._account = value;

        return this;
    }

    setWebSocketServer(value: WebSocket.Server) {
        this._websocket = value;

        this._websocket.on("connection", (ws: WebSocket, request: IncomingMessage) => {
            const id = randomUUID();
            this._clients.set(id, ws);

            this.emit("client.open", id, ws, request);

            ws.on("close", (code: number, reason: Buffer) => {
                this._clients.delete(id);

                this.emit("client.close", id, ws, code, reason);
            });

            ws.on("message", async (data: WebSocket.RawData, isBinary: boolean) => {
                const claim = await new ClaimController()
                    .setOptions(this.options)
                    .setUserAddress("")
                    .setDao(this.dao)
                    .processRequest(JSON.parse(data.toString()));

                ws.send(JSON.stringify(claim));

                this.emit("client.message", id, ws, claim);
            });
        });

        return this;
    }

    run() {
        this.onClientConnectedListeners.forEach((h) => this.on("client.open", h.listener));
        this.onConnectionCloseListeners.forEach((h) => this.on("client.close", h.listener));
        this.onMessageListeners.forEach((h) => this.on("client.message", h.listener));

        return this;
    }

    onClientConnected(listener: (id: string | number, ws: WebSocket, request: IncomingMessage) => void) {
        this.onClientConnectedListeners.push({ listener });

        return this;
    }

    onClientClose(listener: (id: string | number, ws: WebSocket, code: number, reason: Buffer) => void) {
        this.onConnectionCloseListeners.push({ listener });

        return this;
    }

    onMessage(listener: (id: string | number, ws: WebSocket, data: WebSocket.RawData, isBinary: boolean) => void) {
        this.onMessageListeners.push({ listener });

        return this;
    }

    /*
        async onMessageReceived(ws: WebSocket, message: string) {
            const newClaim = await ClaimTransaction.parse(message, this.dao);

            if (newClaim.signatures[this.they] && !newClaim.signatures[this.me] && newClaim.amount < 0
            ) {
                // pagamento suo
                await this.checkAndCountersign(ws, newClaim);
                await this.saveTransaction(ws, newClaim);
                await this.sendClaim(ws, newClaim);
            } else if (
                newClaim.signatures[this.they] &&
                newClaim.signatures[this.me] &&
                newClaim.amount > 0 &&
                await this.isProposedTransaction(newClaim)
            ) {
                // controfirma ad un mio pagamento
                await ClaimTransaction.checkSignature(newClaim, newClaim.signatures[this.me], newClaim.addresses[this.me]);
                await this.saveTransaction(ws, newClaim);
            } else if (
                !newClaim.signatures[this.they] &&
                !newClaim.signatures[this.me] &&
                newClaim.amount > 0
            ) {
                // proposta di pagamento da parte mia
                if (
                    !this.config.onTransactionRequestReceived(
                        newClaim.claim.amount,
                        newClaim.claim.addresses[this._they]
                    )
                ) {
                    throw new LibException("Transaction refused.");
                }

                await this.checkAndSign(ws, newClaim);

                await this.sendClaim(ws, newClaim);
            }
        }

        async pay(amount: number) {
            const newClaim = new ClaimTransaction(this._account, this.dao, this.web3);
            await newClaim.createPayment(amount, this._account);
            await this.sendClaim(newClaim);
        }

        async checkAndSign(ws: WebSocket, claim: IClaimRequest): Promise<IClaimRequest> {
            await ClaimTransaction.check(claim, this.dao, this.they, this.me);

            const privateKey = String(process.env.SERVER_PRIVATE_KEY);
            claim.signatures[this.me] = signTypedClaim(ClaimTransaction.encode(claim), privateKey);

            return claim;
        }

        async checkAndCountersign(ws: WebSocket, claim: IClaimRequest): Promise<IClaimRequest> {
            await ClaimTransaction.check(claim, this._dao, this.me, this.they);

            ClaimTransaction.checkSignature(claim, claim.addresses[this.they], claim.addresses[this.they]);

            const privateKey = String(process.env.SERVER_PRIVATE_KEY);
            claim.signatures[this.me] = signTypedClaim(ClaimTransaction.encode(claim), privateKey);

            return claim;
        }

        async isProposedTransaction(claim: IClaimRequest) {
            const sentClaim = await this._dao.getProposedTransaction(claim.addresses[this._they]);

            if (!sentClaim) {
                return false;
            }

            const relevantFields = [
                "addresses",
                "cumulativeDebits",
                "nonce",
                "timestamp"
            ];

            return isEqual(pick(claim, relevantFields), pick(sentClaim, relevantFields)) &&
                sentClaim.signatures[this.me] === claim.signatures[this.me];
        }

        protected async saveTransaction(ws: WebSocket, claim: IClaimRequest) {
            await this.dao.saveTransaction(claim, claim.addresses[this.they]);

            this.emit("transaction.completed", ws, claim);

            this.dao.deleteProposedTransaction(claim.addresses[this.they]);
        }

        protected async sendClaim(ws: WebSocket, claim: IClaimRequest) {
            const message = JSON.stringify(claim);

            ws.send(message);

            if (claim.signatures[this._me] && !claim.signatures[this._they]) {
                await this.dao.saveProposedTransaction(claim);
            }
        }*/
}
