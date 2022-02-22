<template>
  <div>
    <br>

    get allowance:
    <input placeholder="contract hash" v-model="contractHash">
    <input placeholder="user hash" v-model="userHash">
    <br>
    <button
        @click="getAllowance"
        type="button"
    >get allowance

    </button>
    <div v-text="allowance"></div>

    <br>
  </div>
</template>

<script lang="ts">
import {defineComponent, ref} from "vue";
import {CasperAPI} from "@/casper/api";
import {NODE_ADDRESS} from "@/constants";

const api = new CasperAPI(NODE_ADDRESS);

const AllowanceGetter = defineComponent({
  name: 'AllowanceGetter',
  setup() {
    const contractHash = ref('hash-9715402caba64421195a80159f83d96cc223bd7e6d80f631c372bb338b892ee9');
    const userHash = ref('017a12b82ef26c09af384a5e100ffbc8d9bf544551389bd9e5e01ea800509748ed');
    const allowance = ref('0');

    async function getAllowance() {
      console.log(`
      get allowance:
      contractHash: ${contractHash.value}
      userHash: ${userHash.value}
      `);
      const allowanceVal = await api.erc20Allowance(contractHash.value, userHash.value, contractHash.value);
      console.log('allowance:', allowanceVal);
      allowance.value = allowanceVal;
    }

    return {
      contractHash,
      userHash,
      allowance,
      getAllowance,
    }
  }
})

export default AllowanceGetter;
</script>
