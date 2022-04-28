import Web3 from "web3";
import BN from "bn.js";
import { randomBytes } from "crypto";

import type { UnlockArgsToSign } from "./interfaces";

export const DEFAULT_CONTRACT_VERSION = 1;

export function generateLockId(
  version: number = DEFAULT_CONTRACT_VERSION
): string {
  const buf = randomBytes(16);
  buf[0] = version;
  return new BN(buf).toString();
}

async function getSignature(
  web3: Web3,
  pk: string,
  messageHash: string
): Promise<string> {
  const sig = web3.eth.accounts.sign(messageHash, pk);
  return sig.signature;
}

export function bufferToHex(buff: Buffer): string {
  return "0x" + buff.toString("hex");
}

function getParamsToEncode(web3: Web3, messageToSign: UnlockArgsToSign) {
  let recipient =
    messageToSign.recipient.length > 32
      ? keccak256(messageToSign.recipient)
      : web3.utils.asciiToHex(messageToSign.recipient);
  return [
    { t: "uint128", v: messageToSign.lock_id },
    { t: "bytes32", v: recipient },
    { t: "uint128", v: messageToSign.amount },
    { t: "bytes4", v: web3.utils.asciiToHex(messageToSign.lock_source) },
    { t: "bytes4", v: web3.utils.asciiToHex(messageToSign.token_source) },
    { t: "bytes32", v: messageToSign.token_source_address },
    { t: "bytes4", v: web3.utils.asciiToHex("CSPR") },
    { t: "string", v: "unlock" },
  ];
}

export async function signMessage(
  validatorPK: string,
  args: UnlockArgsToSign
): Promise<string> {
  const web3 = new Web3();
  const dataHash = web3.utils.soliditySha3(...getParamsToEncode(web3, args));
  console.log("dataHash", dataHash);
  const sig = await getSignature(web3, validatorPK, dataHash!);

  console.log("signature:", sig);
  return Buffer.from(sig.replace("0x", ""), "hex").toString("hex");
}

export function getAddressFromPK(pk: string): string {
  const web3 = new Web3();
  return web3.eth.accounts.privateKeyToAccount(pk).address;
}

export function keccak256(input: string): string {
  const web3 = new Web3();
  return web3.utils.sha3(input)!;
}

export function asciiToHex(input: string): string {
  const web3 = new Web3();
  return web3.utils.asciiToHex(input);
}
