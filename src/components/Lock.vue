<template>
  <details class="Box">
    <summary>Lock CSPR: </summary>

    <div class="row">
      <div class="col-md-6">
        <label for="inputContractHash">Contract hash:</label>
        <input type="text" id="inputContractHash" class="form-control" aria-describedby="helpBlock" placeholder="spender" v-model="contractHash">
      </div>
       <div class="col-md-4">
        <label for="inputAmount">amount:</label>
        <input type="text" id="inputAmount" class="form-control" aria-describedby="helpBlock" placeholder="amount"
               v-model="amount">
      </div>
    </div>

    <br>
    <button
        class="btn btn-default"
        @click="lock"
        type="button"
    >
      Lock CSPR
    </button>
    <br>
  </details>
</template>


<script lang="ts">
import {defineComponent, ref} from "vue";
import {NODE_ADDRESS} from "@/constants";
import { BridgeAPI } from "../casper/bridge_api";

const api = new BridgeAPI(NODE_ADDRESS);

const Lock = defineComponent({
  props: {
    erc20TokenHash: String,
  },
  name: 'Lock',
  setup(props) {
    const contractHash = ref('');
    const amount = ref('0');

    async function lock() {
      if (!props.erc20TokenHash) {
        return;
      }

      console.log(`
      lock:
      contractHash: ${contractHash.value}
      tokenHash: ${props.erc20TokenHash}
      `);
      const activeKey = await window.casperlabsHelper.getActivePublicKey();

      await api.lockBase(activeKey, amount.value, contractHash.value, props.erc20TokenHash);
    }

    return {
      contractHash,
      amount,
      lock,
    }
  }
})

export default Lock;
</script>
