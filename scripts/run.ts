import {
  CasperServiceByJsonRPC,
  CLValueParsers,
  CLByteArray,
  CLString,
  CLMapBytesParser,
  CLMapType,
  CLStringType,
  CLMap,
  CLStringBytesParser,
  CLType,
  CLU32BytesParser,
  CLAccountHashBytesParser,
  CLAccountHash,
  CLU128BytesParser,
  CLU256BytesParser,
} from "casper-js-sdk";
import { utils } from "casper-js-client-helper";
import { concat } from "@ethersproject/bytes";
import * as blake from "blakejs";
import { jsonMapMember, jsonObject, jsonMember } from "typedjson";
import assert from "assert";

export const NODE_ADDRESS = "http://65.108.9.249:7777/rpc";

const client = new CasperServiceByJsonRPC(NODE_ADDRESS);
const BRIDGE_CONTRACT_HASH =
  "007c0c86b8a8b7bc19eb288875c203421d24f365972d8220a2fb855971166b8d";
const LOCK_DEPLOY_HASH =
  "b8dc91fec7e625b913b545cf7208c9a75b86846ac4c4916c44063c64d66a4eeb";

type StoredLock = {
  sender: String;
  recipient: String;
  destination: String;
  amount: String;
  token_source: String;
  token_source_address: String;
};
class API {
  async getStateRootHash() {
    const { block } = await client.getLatestBlockInfo();
    if (block) {
      return block.header.state_root_hash;
    } else {
      throw Error("Problem when calling getLatestBlockInfo");
    }
  }

  async getDeployInfo() {
    const client = new CasperServiceByJsonRPC(NODE_ADDRESS);

    return await client.getDeployInfo(LOCK_DEPLOY_HASH);
  }

  async getLockId(): Promise<string> {
    const deployInfo = await this.getDeployInfo();
    // @ts-ignore
    const deployArgs = deployInfo.deploy?.session?.StoredContractByHash?.args;
    // console.log("deployArgs:", deployArgs);
    // @ts-ignore
    const lockIdEl = deployArgs.find((param) => param[0] === "lock_id");
    // console.log('lock id:', lockIdEl)
    // console.log(JSON.stringify(lockIdEl[1].parsed, null, 2));
    return lockIdEl[1].parsed;
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

  async getContractDataByHash(
    erc20ContractHash: string
  ): Promise<{ namedKeys: object; contractPackageHash: string }> {
    const stateRootHash = await this.getStateRootHash();

    const contractData = await this.getContractData(
      NODE_ADDRESS,
      stateRootHash,
      erc20ContractHash
    );

    const { contractPackageHash, namedKeys } = contractData.Contract!;
    const namedKeysParsed = namedKeys.reduce((acc, val) => {
      return { ...acc, [this.camelCased(val.name)]: val.key };
    }, {});
    return { namedKeys: namedKeysParsed, contractPackageHash };
  }

  private camelCased(myString: string) {
    return myString.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
  }

  async run() {
    const lockId = await this.getLockId();
    const { namedKeys } = await this.getContractDataByHash(
      BRIDGE_CONTRACT_HASH
    );
    // console.log("namedKeys", namedKeys);
    // @ts-ignore
    const locksURef = namedKeys!.locks;
    const itemKey = Buffer.from(lockId).toString("base64");
    const finalBytes = concat([
      CLValueParsers.toBytes(new CLString(lockId)).unwrap(),
    ]);

    const blaked = blake.blake2b(finalBytes, undefined, 32);
    const encodedBytes = Buffer.from(blaked).toString("hex");

    // console.log('encodedBytes', encodedBytes);

    const storedValue = await client.getDictionaryItemByURef(
      await this.getStateRootHash(),
      lockId,
      locksURef,
      { rawData: true }
    );

    // @ts-expect-error
    let bytes: string = storedValue?.CLValue?.bytes;
    let buffer = new Uint8Array(Buffer.from(bytes, "hex"));

    const fullBufferAsString = new CLStringBytesParser()
      .fromBytesWithRemainder(buffer)
      .result.unwrap();
    // �\b�\x06T�\x0B���\x10N���l�\x0E�ז��Z����fB\x00\x00\x000xa11bd36801d8fa4448f0ac4ea7a62e3634ce8c7c000000000000000000000000\x03\x00\x00\x00ETH\x01M\x03\x00\x00\x00ETHB\x00\x00\x000xa11bd36801d8fa4448f0ac4ea7a62e3634ce8c7c000000000000000000000000
    // account hash = �\b�\x06T�\x0B���\x10N���l�\x0E�ז��Z����fB\x00\x00\x00
    // recipient = 0xa11bd36801d8fa4448f0ac4ea7a62e3634ce8c7c000000000000000000000000\x03\x00\x00\x00 = 0xa11bd36801d8fa4448f0ac4ea7a62e3634ce8c7c000000000000000000000000
    // destination = ETH\x01M\x03\x00\x00\x00 = ETH
    // token_source = ETH
    // amount (?) = B = 11
    // token_source_address = 0xa11bd36801d8fa4448f0ac4ea7a62e3634ce8c7c000000000000000000000000

    const blockchainIdLen = 7;

    const accountHashSize = [0, 32];
    const addressSize = [accountHashSize[1] + 1, accountHashSize[1] + 1 + 78];
    const blockchainIdSize = [
      addressSize[1] + 1,
      addressSize[1] + 1 + blockchainIdLen,
    ];

    let [accountHashBytes, recipientBytes, destinationBytes, otherBytes] = [
      buffer!.subarray(accountHashSize[0], accountHashSize[1]),
      buffer!.subarray(addressSize[0], addressSize[1]),
      buffer!.subarray(blockchainIdSize[0], blockchainIdSize[1]),
      buffer!.subarray(blockchainIdSize[1] + 1),
    ];

    let accountHash = new CLAccountHashBytesParser()
      .fromBytesWithRemainder(accountHashBytes)
      .result.unwrap()
      .value();

    let recipient = new CLStringBytesParser()
      .fromBytesWithRemainder(recipientBytes)
      .result.unwrap()
      .value();

    let destination = new CLStringBytesParser()
      .fromBytesWithRemainder(destinationBytes)
      .result.unwrap()
      .value();

    const lock = {
      accountHash,
      recipient,
      destination,
    };

    let other = new CLStringBytesParser()
      .fromBytesWithRemainder(otherBytes)
      .result.unwrap();

    console.log("lock", lock);
    console.log("other", other);
    console.log("fullBufferAsString", fullBufferAsString);

    // console.log("accountHashBytes", accountHashBytes);
    // console.log("recipientBytes", recipientBytes);
    // console.log("destinationBytes", destinationBytes);
    // console.log("otherBytes", otherBytes);
    console.log("full", buffer);
  }
}

(async () => {
  const api = new API();
  await api.run();
})();
