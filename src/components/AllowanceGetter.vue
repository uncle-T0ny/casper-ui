<template>
  <div class="Box">
    <h4>Get allowance</h4>

    <div class="row">
      <div class="col-md-6">
        <label for="inputSpenderHash">Spender hash:</label>
        <input type="text" id="inputSpenderHash" class="form-control" aria-describedby="helpBlock" placeholder="spender"
               v-model="spenderHash">
      </div>
      <div class="col-md-6">
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
    const spenderHash = ref('dde7472639058717a42e22d297d6cf3e07906bb57bc28efceac3677f8a3dc83b');
    const allowance = ref('0');

    async function getAllowance() {
      console.log('erc20TokenHash', props.erc20TokenHash);
      console.log(`
      get allowance:
      contractHash: ${contractHash.value}
      spenderHash: ${spenderHash.value}
      `);
      const activeKey = await window.casperlabsHelper.getActivePublicKey();

      const allowanceVal = await api.erc20Allowance(contractHash.value, activeKey, spenderHash.value);
      console.log('allowance:', allowanceVal);
      allowance.value = allowanceVal;
    }

    return {
      contractHash,
      spenderHash,
      allowance,
      getAllowance,
    }
  }
})

export default AllowanceGetter;
</script>
