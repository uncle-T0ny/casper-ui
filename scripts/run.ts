import {
  CasperServiceByJsonRPC,
  CLValueParsers,
  CLByteArray,
  CLString,
  CLKey,
  CLAccountHash,
  CLPublicKey
} from "casper-js-sdk";
import {utils} from "casper-js-client-helper";
import {concat} from "@ethersproject/bytes";
import * as blake from "blakejs";
export const NODE_ADDRESS = "http://65.108.9.249:7777/rpc";

const client = new CasperServiceByJsonRPC(NODE_ADDRESS);
const BRIDGE_CONTRACT_HASH = '007c0c86b8a8b7bc19eb288875c203421d24f365972d8220a2fb855971166b8d';
const LOCK_DEPLOY_HASH = 'b8dc91fec7e625b913b545cf7208c9a75b86846ac4c4916c44063c64d66a4eeb';

const ERC20_CONTRACT_HASH = 'f14592ab3940cd07e88b79c597f0cbb874ee22d8b833df292c8ceac1263ea86a';
const ERC20_MINTER_PUB_KEY = '020294cd34c20d10f367dfcb9abdf7a800194e539c9dd40c46108e3f1c7613764eb4';

type StoredLock = {
    sender: String,
    recipient: String,
    destination: String,
    amount: String,
    token_source: String,
    token_source_address: String,
}
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
    console.log('deployArgs:', deployArgs)
    // @ts-ignore
    const lockIdEl = deployArgs.find(param => param[0] === 'lock_id');
    console.log('lock id:', lockIdEl)
    console.log(JSON.stringify(lockIdEl[1].parsed, null, 2));
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
    const { namedKeys } = await this.getContractDataByHash(BRIDGE_CONTRACT_HASH);
    console.log('namedKeys', namedKeys);
    // @ts-ignore
    const locksURef = namedKeys!.locks;
    const itemKey = Buffer.from(lockId).toString("base64");
    const finalBytes = concat([
      CLValueParsers.toBytes(new CLString(lockId)).unwrap()
    ]);

    const blaked = blake.blake2b(finalBytes, undefined, 32);
    const encodedBytes = Buffer.from(blaked).toString("hex");

    console.log('encodedBytes', encodedBytes);

    const storedValue = await client.getDictionaryItemByURef(
      await this.getStateRootHash(),
      lockId,
      locksURef,
      { rawData : true }
    );

    // @ts-ignore
    console.log('storedValue.bytes', storedValue.CLValue.bytes);
    // @ts-ignore
    console.log('lock result:', Buffer.from(storedValue.CLValue.bytes, 'hex').toString('utf-8'))
  }

  async getBalanceByPubKey() {
    const { namedKeys } = await this.getContractDataByHash(ERC20_CONTRACT_HASH);


    const keyBytes = CLValueParsers.toBytes(new CLKey(
      new CLAccountHash((CLPublicKey.fromHex(ERC20_MINTER_PUB_KEY)).toAccountHash())
    )).unwrap();
    const itemKey = Buffer.from(keyBytes).toString("base64");

    const storedValue = await client.getDictionaryItemByURef(
      await this.getStateRootHash(),
      itemKey,
      //@ts-ignore
      namedKeys!.balances,
      { rawData : false }
    );

    console.log('storedValue', storedValue)
  }
}



(async () => {
  const api = new API();
  // await api.run();
  await api.getBalanceByPubKey();
})();
