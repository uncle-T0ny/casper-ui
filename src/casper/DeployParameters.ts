import {CLPublicKey, DeployUtil, RuntimeArgs} from "casper-js-sdk";

export class DeployParameters {
    /** @type {string} */
    activeKey;
    /** @type {string} */
    network;
    /** @type {string} */
    hash;
    /** @type {string} */
    entrypoint;
    /** @type {DeployUtil.RuntimeArgs} */
    args;
    /** @type {number} */
    fee;

    /**
     * Constructor
     *
     * @param {string} activeKey - Current active key in the public hex format
     * @param {string} network - Current network to execute the deployment
     * @param {string} hash - Current hash of the stored SmartContract
     * @param {string} entrypoint - Entrypoint of the SmartContract
     * @param {DeployUtil.RuntimeArgs} args - Arguments of the SmartContract
     * @param {number} fee - Runtime fee for the given SmartContract operation
     */
    constructor(activeKey: string, network: string, hash: string, entrypoint: string, args: RuntimeArgs, fee: string) {
        this.activeKey = activeKey;
        this.network = network;
        this.hash = hash;
        this.entrypoint = entrypoint;
        this.args = args;
        this.fee = fee;
    }

    get deployParams() {
        return new DeployUtil.DeployParams(
            CLPublicKey.fromHex(this.activeKey),
            this.network
        );
    }

    get session() {
        return DeployUtil.ExecutableDeployItem.newStoredContractByHash(
            Uint8Array.from(Buffer.from(this.hash, "hex")),
            this.entrypoint,
            this.args
        );
    }

    get payment() {
        return DeployUtil.standardPayment(this.fee);
    }

    get makeDeploy(): DeployUtil.Deploy {
        return DeployUtil.makeDeploy(this.deployParams, this.session, this.payment)
    }
}
