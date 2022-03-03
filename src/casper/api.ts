import {
    CasperClient,
    CasperServiceByJsonRPC,
    CLAccountHash,
    CLByteArray,
    CLKey,
    CLPublicKey,
    CLURef,
    CLValue,
    CLValueParsers,
    DeployUtil,
    Signer,
    PUBLIC_KEY_ID, RuntimeArgs, CLU256, CLValueBuilder,
} from "casper-js-sdk";
import * as blake from "blakejs";

import {utils} from 'casper-js-client-helper';
import {concat} from "@ethersproject/bytes";
import {NODE_ADDRESS} from "@/constants";
import {DeployParameters} from "@/casper/DeployParameters";
import {CasperSigner} from "@/casper/Signer";

export type Bytes = ArrayLike<number>;
export type BytesLike = Bytes | string;
export declare type RecipientType = CLPublicKey | CLAccountHash | CLByteArray;

const DEPLOY_GAS_PAYMENT_FOR_NATIVE_TRANSFER = 100000;

export class CasperAPI {
    constructor(private nodeAddress: string, private network: 'casper-test' = 'casper-test') {
    }

    async sendCSPR(senderPubKeyHex: string, receiverPubKeyHex: string, amount: string): Promise<any> {
        const senderKey = CLPublicKey.fromHex(senderPubKeyHex);
        // const receiverClPubKey = CLPublicKey.fromHex(receiverPubKeyHex);
        const receiverClPubKey = CLURef.fromFormattedStr(receiverPubKeyHex);
        const randomNumericId = () => Math.floor(Math.random() * 1000000000);

        const deploy = DeployUtil.makeDeploy(
            new DeployUtil.DeployParams(senderKey, this.network, 1, 1800000),
            DeployUtil.ExecutableDeployItem.newTransfer(
                amount,
                receiverClPubKey,
                null,
                randomNumericId()
            ),
            DeployUtil.standardPayment(DEPLOY_GAS_PAYMENT_FOR_NATIVE_TRANSFER)
        );

        const deployJSON = DeployUtil.deployToJson(deploy);
        const targetPubKey = deploy.session.transfer ? (deploy.session.transfer?.args.args.get("target") as CLURef).toFormattedStr() : senderPubKeyHex;

        const signedDeployJSON = await Signer.sign(
            deployJSON,
            senderPubKeyHex,
            targetPubKey
        );

        const casperService = new CasperServiceByJsonRPC(this.nodeAddress);

        const reconstructedDeploy =
            DeployUtil.deployFromJson(signedDeployJSON).unwrap();
        const {deploy_hash: deployHash} = await casperService.deploy(reconstructedDeploy);

        return deployHash;
    }

    async getAccountUref(publicKeyHex: string): Promise<{ balanceUref: string, stateRootHash: string }> {
        const casperService = new CasperServiceByJsonRPC(NODE_ADDRESS);
        const latestBlock = await casperService.getLatestBlockInfo();

        if (!latestBlock || !latestBlock.block) {
            throw new Error('Failed to get latest block');
        }
        const root = await casperService.getStateRootHash(latestBlock.block.hash);


        const balanceUref = await casperService.getAccountBalanceUrefByPublicKey(
            root,
            CLPublicKey.fromHex(publicKeyHex),
        )

        return {balanceUref, stateRootHash: latestBlock.block.header.state_root_hash};
    }

    async casperBalance(publicKeyHex: string): Promise<string> {
        const casperService = new CasperServiceByJsonRPC(this.nodeAddress);

        const {balanceUref, stateRootHash} = await this.getAccountUref(publicKeyHex);

        //account balance from the last block
        const balance = await casperService.getAccountBalance(
            stateRootHash,
            balanceUref
        );

        return balance.toString();
    }

    async balanceOf(account: RecipientType, seedUref: string) {
        const key = this.createRecipientAddress(account);
        const keyBytes = CLValueParsers.toBytes(key).unwrap();
        const itemKey = Buffer.from(keyBytes).toString("base64");
        const result = await utils.contractDictionaryGetter(
            this.nodeAddress,
            itemKey,
            seedUref,
        );
        return result.toString();
    }

    async getStateRootHash(nodeAddress: string) {
        const client = new CasperServiceByJsonRPC(this.nodeAddress);
        const {block} = await client.getLatestBlockInfo();
        if (block) {
            return block.header.state_root_hash;
        } else {
            throw Error("Problem when calling getLatestBlockInfo");
        }
    };


    async getContractData(
        nodeAddress: string,
        stateRootHash: string,
        contractHash: string,
        path: string[] = []
    ) {
        const client = new CasperServiceByJsonRPC(nodeAddress);
        const blockState = await client.getBlockState(
            stateRootHash,
            `hash-${contractHash}`,
            path
        );
        return blockState;
    };

    async erc20Allowance(erc20ContractHash: string, owner: string, spender: string): Promise<string> {

        console.log(`parse owner ${owner}`);
        const keyOwner = this.createRecipientAddress(CLPublicKey.fromHex(owner));
        console.log(`parse spender ${spender}`);
        const keySpender = this.createRecipientAddress(new CLByteArray(Uint8Array.from(Buffer.from(spender, "hex"))));
        const finalBytes = concat([CLValueParsers.toBytes(keyOwner).unwrap(), CLValueParsers.toBytes(keySpender).unwrap()]);
        const blaked = blake.blake2b(finalBytes, undefined, 32);
        const encodedBytes = Buffer.from(blaked).toString("hex");

        const {namedKeys} = await this.getContractDataByHash(erc20ContractHash);

        try {
            const result = await utils.contractDictionaryGetter(
                this.nodeAddress,
                encodedBytes,
                // @ts-ignore
                namedKeys.allowances
            );

            return result.toString();
        } catch (err) {
            return '0';
        }

    }

    async getContractDataByHash(erc20ContractHash: string): Promise<{ namedKeys: object, contractPackageHash: string }> {
        const stateRootHash = await this.getStateRootHash(this.nodeAddress);

        const contractData = await this.getContractData(
            this.nodeAddress,
            stateRootHash,
            erc20ContractHash
        );

        const {contractPackageHash, namedKeys} = contractData.Contract!;
        const namedKeysParsed = namedKeys.reduce((acc, val) => {
            return {...acc, [this.camelCased(val.name)]: val.key};
        }, {});
        return {namedKeys: namedKeysParsed, contractPackageHash};
    }

    async erc20BalanceOf(publicKeyHex: string, erc20ContractHash: string): Promise<string> {

        const {namedKeys} = await this.getContractDataByHash(erc20ContractHash);

        console.log('namedKeysParsed', namedKeys);

        const publicKey = CLPublicKey.fromHex(publicKeyHex);
        // @ts-ignore
        return await this.balanceOf(publicKey, namedKeys!.balances);
    }

    async getDeploy(deployHash: string) {
        const sleep = (ms: number) => {
            return new Promise((resolve) => setTimeout(resolve, ms));
        };

        const client = new CasperClient(this.nodeAddress);
        let i = 300;
        while (i != 0) {
            const [deploy, raw] = await client.getDeploy(deployHash);
            if (raw.execution_results.length !== 0) {
                // @ts-ignore
                if (raw.execution_results[0].result.Success) {
                    return deploy;
                } else {
                    // @ts-ignore
                    throw Error(
                        "Contract execution: " +
                        // @ts-ignore
                        raw.execution_results[0].result.Failure.error_message
                    );
                }
            } else {
                i--;
                await sleep(1000);
                continue;
            }
        }
        throw Error("Timeout after " + i + "s. Something's wrong");
    }

    async sendCSPRToContract(activeKey: string, amount: string, receiverHash: string) {
        const {balanceUref} = await this.getAccountUref(activeKey);

        console.log('balanceUref', balanceUref);

        const args = RuntimeArgs.fromMap({
            purse: CLURef.fromFormattedStr(balanceUref),
            amount: new CLU256(amount),
        });

        const deployParams = new DeployParameters(
            activeKey,
            'casper-test',
            receiverHash,
            'testing_cspr_transfer',
            args,
            '300000000'
        );
        const deploy = deployParams.makeDeploy;

        const to = activeKey;
        const signedDeploy = await CasperSigner.sign(deploy, {activeKey, to});
        const casperService = new CasperServiceByJsonRPC(NODE_ADDRESS);
        const {deploy_hash: deployHash} = await casperService.deploy(signedDeploy);

        console.log('deployHash', deployHash);
    }

    async transferERC20(activeKey: string, amount: string, receiverHash: string, tokenHash: string) {
        // const token = this.createRecipientAddress();
        const args = RuntimeArgs.fromMap({
            token: CLValueBuilder.key(new CLByteArray(Uint8Array.from(Buffer.from(tokenHash, "hex")))),
            value: new CLU256(amount),
        });

        const deployParams = new DeployParameters(
            activeKey,
            'casper-test',
            receiverHash,
            'testing_erc20_transfer',
            args,
            '3000000000'
        );
        const deploy = deployParams.makeDeploy;

        const to = activeKey;
        const signedDeploy = await CasperSigner.sign(deploy, {activeKey, to});
        const casperService = new CasperServiceByJsonRPC(NODE_ADDRESS);
        const {deploy_hash: deployHash} = await casperService.deploy(signedDeploy);

        console.log('deployHash', deployHash);
    }

    async transferERC201(activeKey: string, amount: string, contractHash: string, tokenHash: string) {
        const deployParams = new DeployUtil.DeployParams(
            CLPublicKey.fromHex(activeKey),
            this.network
        );

        console.log('tokenHash', tokenHash);

        const session = DeployUtil.ExecutableDeployItem.newStoredContractByHash(
            Uint8Array.from(Buffer.from(contractHash, "hex")),
            'testing_erc20_transfer',
            RuntimeArgs.fromMap({
                token: CLValueBuilder.key(new CLByteArray(Uint8Array.from(Buffer.from(tokenHash, "hex")))),
                // token: this.createRecipientAddress(new CLByteArray(Uint8Array.from(Buffer.from(tokenHash, "hex")))),
                value: new CLU256(amount),
            })
        );
        const payment = DeployUtil.standardPayment('3000000000');
        const deploy = DeployUtil.makeDeploy(deployParams, session, payment);

        const to = activeKey;
        const signedDeploy = await CasperSigner.sign(deploy, {activeKey, to});
        const casperService = new CasperServiceByJsonRPC(NODE_ADDRESS);
        const {deploy_hash: deployHash} = await casperService.deploy(signedDeploy);

        console.log('deployHash', deployHash);
    }

    async transferERC20From(activeKey: string, amount: string, ownerHash: string, tokenHash: string) {
        const deployParams = new DeployUtil.DeployParams(
            CLPublicKey.fromHex(activeKey),
            this.network
        );

        const session = DeployUtil.ExecutableDeployItem.newStoredContractByHash(
            Uint8Array.from(Buffer.from(tokenHash, "hex")),
            'testing_erc20_transfer',
            RuntimeArgs.fromMap({
                owner: this.createRecipientAddress(new CLByteArray(Uint8Array.from(Buffer.from(ownerHash, "hex")))),
                recipient: this.createRecipientAddress(new CLByteArray(Uint8Array.from(Buffer.from(activeKey, "hex")))),
                value: new CLU256(amount),
            })
        );
        const payment = DeployUtil.standardPayment('3000000000');
        const deploy = DeployUtil.makeDeploy(deployParams, session, payment);

        const to = activeKey;
        const signedDeploy = await CasperSigner.sign(deploy, {activeKey, to});
        const casperService = new CasperServiceByJsonRPC(NODE_ADDRESS);
        const {deploy_hash: deployHash} = await casperService.deploy(signedDeploy);

        console.log('deployHash', deployHash);
    }

    async approve(erc20ContractHash: string, activeKey: string, spender: string, approveAmount: string) {
        const keySpender = this.createRecipientAddress(new CLByteArray(Uint8Array.from(Buffer.from(spender, "hex"))));

        const args = RuntimeArgs.fromMap({
            spender: keySpender,
            amount: CLValueBuilder.u256(approveAmount),
        });

        const deployParams = new DeployParameters(
            activeKey,
            'casper-test',
            erc20ContractHash,
            'approve',
            args,
            '300000000'
        );
        const deploy = deployParams.makeDeploy;

        const to = activeKey;
        const signedDeploy = await CasperSigner.sign(deploy, {activeKey, to});
        const casperService = new CasperServiceByJsonRPC(NODE_ADDRESS);
        const {deploy_hash: deployHash} = await casperService.deploy(signedDeploy);

        console.log('deployHash', deployHash);
    }

    private camelCased(myString: string) {
        return myString.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
    }

    private createRecipientAddress(recipient: RecipientType): CLKey {
        console.log('recipient.clType()', recipient.clType().toString());

        try {
            if (recipient.clType().toString() === PUBLIC_KEY_ID) {
                return new CLKey(new CLAccountHash((recipient as CLPublicKey).toAccountHash()));
            } else {
                return new CLKey(recipient);
            }
        } catch (err) {
            console.log(`failed to create recipient address for ${recipient.value().toString()}`)
            throw  err;
        }
    }
}

