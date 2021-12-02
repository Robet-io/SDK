import "reflect-metadata";
import "core-js/stable";
import "regenerator-runtime/runtime";
import "dotenv/config";
export declare class SDK {
    private readonly environment;
    private communicationController;
    constructor();
    init(): Promise<any>;
    protected connectToServer(account: string): Promise<void>;
    pay(amount: number): Promise<void>;
}
