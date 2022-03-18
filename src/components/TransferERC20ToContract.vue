<template>
  <details class="Box">
    <summary>Transfer ERC20: </summary>

    <div class="row">
      <div class="col-md-6">
        <label for="inputContractHash">Contract hash:</label>
        <input type="text" id="inputContractHash" class="form-control" aria-describedby="helpBlock" placeholder="spender" v-model="contractHash">
      </div>
    </div>

    <br>
    <button
        class="btn btn-default"
        @click="transfer"
        type="button"
    >
      transfer
    </button>
    <br>
  </details>
</template>

<script lang="ts">
import {defineComponent, ref} from "vue";
import {CasperAPI} from "@/casper/api";
import {NODE_ADDRESS} from "@/constants";

const api = new CasperAPI(NODE_ADDRESS);

const TransferERC20ToContract = defineComponent({
  props: {
    erc20TokenHash: String,
  },
  name: 'TransferERC20ToContract',
  setup(props) {
    const contractHash = ref('');
    const allowance = ref('0');

    async function transfer() {
      if (!props.erc20TokenHash) {
        return;
      }
      console.log(`
      transfer:
      contractHash: ${contractHash.value}
      tokenHash: ${props.erc20TokenHash}
      `);
      const activeKey = await window.casperlabsHelper.getActivePublicKey();

      await api.transferERC201(activeKey, '10', contractHash.value, props.erc20TokenHash);
    }

    return {
      contractHash,
      allowance,
      transfer,
    }
  }
})

export default TransferERC20ToContract;
</script>
