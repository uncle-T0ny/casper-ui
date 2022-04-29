import {CasperServiceByJsonRPC} from "casper-js-sdk";
export const NODE_ADDRESS = "http://65.108.9.249:7777/rpc";

const casperService = new CasperServiceByJsonRPC(NODE_ADDRESS);

casperService.getStateRootHash();
console.log(casperService);
