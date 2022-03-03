<template>
  <div class="Box">
    <h4>Approve ERC20:</h4>

    <div class="row">
      <div class="col-md-6">
        <label for="inputSpenderHash">Spender hash:</label>
        <input type="text" id="inputSpenderHash" class="form-control" aria-describedby="helpBlock" placeholder="spender" v-model="spenderHash">
      </div>
    </div>

    <br>
    <button
        class="btn btn-default"
        @click="approve"
        type="button"
    >
      approve
    </button>
    <br>
  </div>
</template>

<script lang="ts">
import {defineComponent, ref} from "vue";
import {CasperAPI} from "@/casper/api";
import {NODE_ADDRESS} from "@/constants";

const api = new CasperAPI(NODE_ADDRESS);

const Approve = defineComponent({
  props: {
    erc20TokenHash: String,
  },
  name: 'Approve',
  setup(props) {
    const spenderHash = ref('');
    const allowance = ref('0');

    async function approve() {
      if (!props.erc20TokenHash) {
        return;
      }
      console.log(`
      approve:
      erc20 token contractHash: ${props.erc20TokenHash}
      spenderHash: ${spenderHash.value}
      `);
      const activeKey = await window.casperlabsHelper.getActivePublicKey();

      await api.approve(props.erc20TokenHash, activeKey, spenderHash.value, '115792089237316195423570985008687907853269984665640564039457584007913129639123');
    }

    return {
      spenderHash,
      allowance,
      approve,
    }
  }
})

export default Approve;
</script>
