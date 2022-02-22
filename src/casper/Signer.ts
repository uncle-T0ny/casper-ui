import {DeployUtil, Signer} from "casper-js-sdk";

export class CasperSigner {
    static async sign(deploy: DeployUtil.Deploy, options: { activeKey: string, to: string }) {
        try {
            const signedJsonDeploy = await Signer.sign(DeployUtil.deployToJson(deploy), options.activeKey, options.to);
            const signedDeploy = await DeployUtil.deployFromJson(signedJsonDeploy);
            if (signedDeploy.ok) {
                return signedDeploy.val;
            } else {
                throw signedDeploy.val;
            }
        } catch (e) {
            console.log(e);
            throw new Error('Failed to sign the contract');
        }
    }
}
