<template>
  <div class="Box">
    <h4>Get allowance</h4>

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
  </div>
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
    const contractHash = ref('9b287f35b7c11659046cf575b13055dde7f9a309cae5fe1ce3ca985d87f029b0');
    const spenderHash = ref('');
    const ownerHash = ref('');
    const allowance = ref('0');

    async function getAllowance() {
      console.log('erc20TokenHash', props.erc20TokenHash);
      console.log(`
      get allowance:
      contractHash: ${contractHash.value}
      spenderHash: ${spenderHash.value}
      `);

      const allowanceVal = await api.erc20Allowance(contractHash.value, ownerHash.value, spenderHash.value);
      console.log('allowance:', allowanceVal);
      allowance.value = allowanceVal;
    }

    return {
      contractHash,
      spenderHash,
      allowance,
      ownerHash,
      getAllowance,
    }
  }
})

export default AllowanceGetter;
</script>
