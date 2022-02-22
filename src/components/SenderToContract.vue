<template>
  <div class="Box">
    <br>

    receiver:
    <input placeholder="receiver" v-model="receiverHash">
    <input placeholder="amount" v-model="amountCSPR">
    <br>
    <button
        @click="sendCSPR"
        type="button"
    >send CSPR
    </button>

    <br>
  </div>
</template>

<script lang="ts">
import {defineComponent, ref} from "vue";
import {CasperAPI} from "@/casper/api";
import {NODE_ADDRESS} from "@/constants";
import {
  CasperServiceByJsonRPC,
  CLPublicKey,
  CLString,
  CLU256,
  CLU512,
  CLURef,
  DeployUtil,
  RuntimeArgs
} from "casper-js-sdk";
import {CasperSigner} from "@/casper/Signer";
import {DeployParameters} from "@/casper/DeployParameters";

const api = new CasperAPI(NODE_ADDRESS);

const Sender = defineComponent({
  name: 'Sender',
  setup() {
    const receiverHash = ref('39e0d9fc1dbc943c5c5929182e960ff4505cddccb3cd3357a3c84360155a440d');
    const amountCSPR = ref('10000000000');

    async function sendCSPR() {
      const activeKey = await window.casperlabsHelper.getActivePublicKey();

      const {  balanceUref, stateRootHash } = await api.getAccountUref(activeKey);

      console.log('balanceUref', balanceUref);

      const args = RuntimeArgs.fromMap({
        purse: CLURef.fromFormattedStr(balanceUref),
        amount: new CLU256(amountCSPR.value),
      });

      const smartContractHash = receiverHash.value;
      const deployParams = new DeployParameters(
          activeKey,
          'casper-test',
          smartContractHash,
          'testing_cspr_transfer',
          args,
          '30000000000'
      );
      const deploy = deployParams.makeDeploy;

      const to = activeKey;
      const signedDeploy = await CasperSigner.sign(deploy, { activeKey, to });
      const casperService = new CasperServiceByJsonRPC(NODE_ADDRESS);
      const { deploy_hash: deployHash }= await casperService.deploy(signedDeploy);

      console.log('deployHash', deployHash);
    }

    return {
      receiverHash,
      amountCSPR,
      sendCSPR,
    }
  }
})

export default Sender;
</script>

