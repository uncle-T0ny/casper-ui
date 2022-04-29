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
  CLOption,
  CLType,
  CLURefType,
} from "casper-js-sdk";
import * as blake from "blakejs";

import { None } from "ts-results";

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

  async unlockWrapped(
    activeKey: string,
    amount: string,
    receiverHash: string
    // tokenAddress: string
  ) {
    // amount = 2
    const signature = new CLString(
      "f9a4177980b72f4d471718a692fec147b23ef6e5d1b29e5c5eabfd8ff8f0ac180cbf76d0b565cf081b3550ab1e4a256f8c61a556d642935bfbeccb858a04c7b01c"
    );

    let recipient = CasperAPI.createRecipientAddress(
      CLPublicKey.fromHex(activeKey)
    );

    const args = RuntimeArgs.fromMap({
      lock_id: new CLU128("1439534115550340545136032164909163587"),
      amount: new CLU256(amount),
      lock_source: new CLString("KVN"),
      token_source: new CLString("KVN"),
      token_source_address: new CLString(
        "0xd0a1e359811322d97991e03f863a0c30c2cf029c"
      ),
      recipient,
      signature,
    });

    const fee = 1_000_000_000;

    const deployParams = new DeployParameters(
      activeKey,
      "casper-test",
      receiverHash,
      "unlock",
      args,
      "5000000000"
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
