import { IEnvironmentOptions } from "./interfaces/IEnvironmentOptions";
import { IEnvironment } from "./interfaces/IEnvironment";

const ALICE = 0;
const BOB = 1;

export class env {
    private static _options: IEnvironment;

    static setUp(options: IEnvironmentOptions) {
        this._options = {
            ALICE: ALICE,
            BOB: BOB,
            ...options
        };
    }

    static get options(): IEnvironment {
        return this._options;
    }

    static get<K extends keyof IEnvironment>(prop: K): IEnvironment[K] {
        return this._options[prop];
    }
}
