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
  PUBLIC_KEY_ID,
  RuntimeArgs,
  CLU256,
  CLValueBuilder,
  CLU128,
  CLString,
} from "casper-js-sdk";
import * as blake from "blakejs";

import { utils } from "casper-js-client-helper";
import { concat } from "@ethersproject/bytes";
import { NODE_ADDRESS, PK } from "@/constants";
import { DeployParameters } from "@/casper/DeployParameters";
import { CasperSigner } from "@/casper/Signer";
import BN from "bn.js";
import type { UnlockArgsToSign } from "@/interfaces";
import { signMessage } from "@/web3Helper";
import { CasperAPI } from "./api";
export type Bytes = ArrayLike<number>;
export type BytesLike = Bytes | string;
export declare type RecipientType = CLPublicKey | CLAccountHash | CLByteArray;

const DEPLOY_GAS_PAYMENT_FOR_NATIVE_TRANSFER = 100000;
export const DEFAULT_CONTRACT_VERSION = 1;

export class BridgeAPI {
  constructor(
    private nodeAddress: string,
    private network: "casper-test" = "casper-test"
  ) {}

  generateLockId(version: number = DEFAULT_CONTRACT_VERSION): string {
    const lockId = new Uint8Array(16);
    window.crypto.getRandomValues(lockId);
    console.log("buf", lockId);
    lockId[0] = version;
    const res = new BN(lockId).toString();
    console.log("res", res);
    return res;
  }
  async lockBase(
    activeKey: string,
    amount: string,
    receiverHash: string,
    tokenAddress: string
  ) {
    const { balanceUref } = await this.getAccountUref(activeKey);

    console.log("balanceUref", balanceUref);

    const args = RuntimeArgs.fromMap({
      caller_purse: CLURef.fromFormattedStr(balanceUref),
      lock_id: new CLU128(this.generateLockId()),
      amount: new CLU256(amount),
      token_address: new CLString(tokenAddress),
      recipient: new CLString("0x3f23E1554afe9e3c30DCB692A274d95307361326"),
      destination: new CLString("ETH"),
    });

    const deployParams = new DeployParameters(
      activeKey,
      "casper-test",
      receiverHash,
      "lock_base",
      args,
      "300000000"
    );
    const deploy = deployParams.makeDeploy;

    const to = activeKey;
    const signedDeploy = await CasperSigner.sign(deploy, { activeKey, to });
    const casperService = new CasperServiceByJsonRPC(NODE_ADDRESS);
    const { deploy_hash: deployHash } = await casperService.deploy(
      signedDeploy
    );

    console.log("deployHash", deployHash);
  }

  async lockNative(
    activeKey: string,
    amount: string,
    receiverHash: string,
    tokenAddress: string
  ) {
    const { balanceUref } = await this.getAccountUref(activeKey);

    console.log("balanceUref", balanceUref);

    const args = RuntimeArgs.fromMap({
      // caller_purse: CLURef.fromFormattedStr(balanceUref),
      lock_id: new CLU128(this.generateLockId()),
      amount: new CLU256(amount),
      token_address: new CLString(tokenAddress),
      recipient: new CLString("0x3f23E1554afe9e3c30DCB692A274d95307361326"),
      destination: new CLString("ETH"),
    });

    const deployParams = new DeployParameters(
      activeKey,
      "casper-test",
      receiverHash,
      "lock",
      args,
      "1000000000"
    );
    const deploy = deployParams.makeDeploy;

    const to = activeKey;
    const signedDeploy = await CasperSigner.sign(deploy, { activeKey, to });
    const casperService = new CasperServiceByJsonRPC(NODE_ADDRESS);
    const { deploy_hash: deployHash } = await casperService.deploy(
      signedDeploy
    );

    console.log("deployHash", deployHash);
  }

  async lockWrapped(
    activeKey: string,
    amount: string,
    receiverHash: string,
    tokenAddress: string
  ) {
    const { balanceUref } = await this.getAccountUref(activeKey);

    console.log("balanceUref", balanceUref);

    const args = RuntimeArgs.fromMap({
      caller_purse: CLURef.fromFormattedStr(balanceUref),
      lock_id: new CLU128(this.generateLockId()),
      amount: new CLU256(amount),
      token_address: new CLString(tokenAddress),
      recipient: new CLString("0x3f23E1554afe9e3c30DCB692A274d95307361326"),
      destination: new CLString("ETH"),
    });

    const deployParams = new DeployParameters(
      activeKey,
      "casper-test",
      receiverHash,
      "lock_base",
      args,
      "300000000"
    );
    const deploy = deployParams.makeDeploy;

    const to = activeKey;
    const signedDeploy = await CasperSigner.sign(deploy, { activeKey, to });
    const casperService = new CasperServiceByJsonRPC(NODE_ADDRESS);
    const { deploy_hash: deployHash } = await casperService.deploy(
      signedDeploy
    );

    console.log("deployHash", deployHash);
  }

  async unlockBase() {}
  async unlockNative() {}

  async unlockWrapped(activeKey: string, amount: string, receiverHash: string) {
    const unlockArgs: UnlockArgsToSign = {
      lock_id: this.generateLockId(),
      amount: amount,
      recipient: activeKey,
      lock_source: "CSPR",
      token_source: "CAD",
      token_source_address: "0xffa3a3eFc1229116c9F1DEC71B788e6F89338C7c",
    };

    const signature = new CLString(await signMessage(PK, unlockArgs));

    let recipient = CasperAPI.createRecipientAddress(
      CLPublicKey.fromHex(activeKey)
    );

    const args = RuntimeArgs.fromMap({
      lock_id: new CLU128(unlockArgs.lock_id),
      amount: new CLU256(unlockArgs.amount),
      lock_source: new CLString(unlockArgs.lock_source),
      token_source: new CLString(unlockArgs.token_source),
      token_source_address: new CLString(unlockArgs.token_source_address),
      recipient,
      signature,
    });

    const deployParams = new DeployParameters(
      activeKey,
      "casper-test",
      receiverHash,
      "unlock",
      args,
      "300000000"
    );
    const deploy = deployParams.makeDeploy;

    const to = activeKey;
    const signedDeploy = await CasperSigner.sign(deploy, { activeKey, to });
    const casperService = new CasperServiceByJsonRPC(NODE_ADDRESS);
    const { deploy_hash: deployHash } = await casperService.deploy(
      signedDeploy
    );

    console.log("deployHash", deployHash);
  }

  async getAccountUref(
    publicKeyHex: string
  ): Promise<{ balanceUref: string; stateRootHash: string }> {
    const casperService = new CasperServiceByJsonRPC(NODE_ADDRESS);
    const latestBlock = await casperService.getLatestBlockInfo();

    if (!latestBlock || !latestBlock.block) {
      throw new Error("Failed to get latest block");
    }
    const root = await casperService.getStateRootHash(latestBlock.block.hash);

    const balanceUref = await casperService.getAccountBalanceUrefByPublicKey(
      root,
      CLPublicKey.fromHex(publicKeyHex)
    );

    return {
      balanceUref,
      stateRootHash: latestBlock.block.header.state_root_hash,
    };
  }

  async getStateRootHash() {
    const client = new CasperServiceByJsonRPC(this.nodeAddress);
    const { block } = await client.getLatestBlockInfo();
    if (block) {
      return block.header.state_root_hash;
    } else {
      throw Error("Problem when calling getLatestBlockInfo");
    }
  }

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
  }

  getHashFromPubKey(pubKey: string): string {
    const accountHash = CLPublicKey.fromHex(pubKey).toAccountHashStr();
    console.log(`
            pub key: ${pubKey},
            hex: ${accountHash}
        `);
    return accountHash;
  }

  async getContractDataByHash(
    erc20ContractHash: string
  ): Promise<{ namedKeys: object; contractPackageHash: string }> {
    const stateRootHash = await this.getStateRootHash();

    const contractData = await this.getContractData(
      this.nodeAddress,
      stateRootHash,
      erc20ContractHash
    );

    const { contractPackageHash, namedKeys } = contractData.Contract!;
    const namedKeysParsed = namedKeys.reduce((acc, val) => {
      return { ...acc, [this.camelCased(val.name)]: val.key };
    }, {});
    return { namedKeys: namedKeysParsed, contractPackageHash };
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

  private camelCased(myString: string) {
    return myString.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
  }

  private createRecipientAddress(recipient: RecipientType): CLKey {
    console.log("recipient.clType()", recipient.clType().toString());

    try {
      if (recipient.clType().toString() === PUBLIC_KEY_ID) {
        return new CLKey(
          new CLAccountHash((recipient as CLPublicKey).toAccountHash())
        );
      } else {
        return new CLKey(recipient);
      }
    } catch (err) {
      console.log(
        `failed to create recipient address for ${recipient.value().toString()}`
      );
      throw err;
    }
  }
}
