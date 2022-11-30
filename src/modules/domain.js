import { options } from "../options";
import { getEnv } from "../env";

/**
 * @type {object}
 */
export const getDomain = () => ({
        name: options[getEnv()].vaultName,
        version: options[getEnv()].vaultVersion,
        chainId: options[getEnv()].chainId,
        verifyingContract: options[getEnv()].vaultAddress
    }
)
