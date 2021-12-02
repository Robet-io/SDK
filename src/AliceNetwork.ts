import { NetworkBase } from "@coingames/claim-library";

class AliceNetwork extends NetworkBase {
    socket: WebSocket | undefined;

    constructor() {
        super();
    }

    connect() {
        // Create WebSocket connection.
        this.socket = new WebSocket("ws://localhost:8666");
        // Connection opened
        this.socket.addEventListener("open", event => {
            console.log("Connection established!");
        });

        // Listen for messages
        this.socket.addEventListener("message", async event => {
            console.log("Message from server ", event.data);
            this.listener.onMessageReceived(event.data);
        });
    }

    send(message: string) {
        this.socket?.send(message);
    }
}

export { AliceNetwork };
