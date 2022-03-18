<template>
  <details class="Box">
    <summary>Get allowance</summary>

    <div class="row">
      <div class="col-md-4">
        <label for="inputOwnerHash">Owner hash:</label>
        <input type="text" id="inputOwnerHash" class="form-control" aria-describedby="helpBlock" placeholder="owner hash"
               v-model="ownerHash">
      </div>
      <div class="col-md-4">
        <label for="inputSpenderHash">Spender hash:</label>
        <input type="text" id="inputSpenderHash" class="form-control" aria-describedby="helpBlock" placeholder="spender"
               v-model="spenderHash">
      </div>
      <div class="col-md-2">
        <div v-text="allowance"></div>
      </div>
    </div>

    <br>
    <button
        class="btn btn-default"
        @click="getAllowance"
        type="button"
    >
      get allowance
    </button>
  </details>
</template>

<script lang="ts">
import {defineComponent, ref} from "vue";
import {CasperAPI} from "@/casper/api";
import {NODE_ADDRESS} from "@/constants";

const api = new CasperAPI(NODE_ADDRESS);

const AllowanceGetter = defineComponent({
  props: {
    erc20TokenHash: String,
  },
  name: 'AllowanceGetter',
  setup(props) {
    const spenderHash = ref('');
    const ownerHash = ref('');
    const allowance = ref('0');

    async function getAllowance() {
      if (!props.erc20TokenHash) {
        return;
      }
      console.log('erc20TokenHash', props.erc20TokenHash);
      console.log(`
      get allowance:
      contractHash: ${props.erc20TokenHash}
      spenderHash: ${spenderHash.value}
      `);

      const allowanceVal = await api.erc20Allowance(props.erc20TokenHash, ownerHash.value, spenderHash.value);
      console.log('allowance:', allowanceVal);
      allowance.value = allowanceVal;
    }

    return {
      spenderHash,
      allowance,
      ownerHash,
      getAllowance,
    }
  }
})

export default AllowanceGetter;
</script>
