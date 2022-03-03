<template>
  <div class="Box">
    <br>

    TransferERC20:
    <input placeholder="receiver hash" v-model="receiver">
    <br>
    <button
        class="btn btn-default"
        @click="transfer"
        type="button"
    >transfer

    </button>
    <br>
  </div>
</template>

<script lang="ts">
import {defineComponent, ref} from "vue";
import {CasperAPI} from "@/casper/api";
import {NODE_ADDRESS} from "@/constants";

const api = new CasperAPI(NODE_ADDRESS);

const TransferERC20 = defineComponent({
  props: {
    erc20TokenHash: String,
  },
  name: 'TransferERC20',
  setup(props) {
    const receiver = ref('341989826f0d1e55b2d6305c95f1992830d127b72642e9f0d4ee8e64b337d3d4');
    const allowance = ref('0');

    async function transfer() {
      if (!props.erc20TokenHash) {
        return;
      }
      console.log(`
      transfer erc20:
      receiver: ${receiver.value}
      tokenHash: ${props.erc20TokenHash}
      `);
      const activeKey = await window.casperlabsHelper.getActivePublicKey();

      await api.transferERC20(activeKey, '100000', receiver.value, props.erc20TokenHash);
    }

    return {
      receiver,
      allowance,
      transfer,
    }
  }
})

export default TransferERC20;
</script>
