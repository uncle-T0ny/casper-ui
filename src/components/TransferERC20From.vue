<template>
  <details class="Box">
    <summary>Transfer ERC20 From: </summary>

    <div class="row">
      <div class="col-md-4">
        <label for="inputOwnerHash">Owner hash:</label>
        <input type="text" id="inputOwnerHash" class="form-control" aria-describedby="helpBlock" placeholder="owner" v-model="ownerHash">
      </div>
      <div class="col-md-1">
        <label for="inputAmount">Amount:</label>
        <input type="text" id="inputAmount" class="form-control" aria-describedby="helpBlock" placeholder="amount" v-model="inputAmount">
      </div>
    </div>

    <br>
    <button
        class="btn btn-default"
        @click="transfer"
        type="button"
    >
      transfer FROM
    </button>
    <br>
  </details>
</template>

<script lang="ts">
import {defineComponent, ref} from "vue";
import {CasperAPI} from "@/casper/api";
import {NODE_ADDRESS} from "@/constants";

const api = new CasperAPI(NODE_ADDRESS);

const TransferERC20From = defineComponent({
  props: {
    erc20TokenHash: String,
  },
  name: 'TransferERC20From',
  setup(props) {
    const ownerHash = ref('');
    const inputAmount = ref('0');

    async function transfer() {
      if (!props.erc20TokenHash) {
        return;
      }
      console.log(`
      transfer:
      ownerHash: ${ownerHash.value}
      tokenHash: ${props.erc20TokenHash}
      inputAmount: ${inputAmount.value}
      `);
      const activeKey = await window.casperlabsHelper.getActivePublicKey();

      await api.transferERC20From(activeKey, inputAmount.value, ownerHash.value, props.erc20TokenHash);
    }

    return {
      ownerHash,
      inputAmount,
      transfer,
    }
  }
})

export default TransferERC20From;
</script>
