interface NetworkListener {
    onMessageReceived(message: string): void;
}

interface NetworkInterface {
    connect(): void;

    send(message: string): void;

    setListener(listener: NetworkListener): void;
}

abstract class NetworkBase implements NetworkInterface {
    listener: NetworkListener;

    protected constructor() {
        this.listener = {
            onMessageReceived(message: string): void {
            }
        };
    }

    abstract connect(): void;

    abstract send(message: string): void;

    setListener(listener: NetworkListener): void {
        this.listener = listener;
    }
}

export { NetworkInterface, NetworkBase, NetworkListener };
