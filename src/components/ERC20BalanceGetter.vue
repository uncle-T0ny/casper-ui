<template>
  <details class="Box">
    <summary>Get ERC20 balance:</summary>

    <div class="row">
      <div class="col-md-4">
        <button
            class="btn btn-default"
            @click="getErc20Balance"
            type="button"
        >get erc20 balance
        </button>
      </div>
      <div class="col-md-4">
        erc20 balance:
        <div v-text="erc20Balance"></div>
      </div>
    </div>

    <div class="row">
      <div class="col-md-4">
        <button
            class="btn btn-default"
            @click="getErc20ContractBalance"
            type="button"
        >get erc20 contract balance
        </button>
      </div>
      <div class="col-md-4">
        <input type="text" id="inputContractPackageHash" class="form-control" aria-describedby="helpBlock" placeholder="contract package hash"
               v-model="contractPackageHash">
      </div>
      <div class="col-md-4">
        erc20 contract balance:
        <p v-text="erc20ContractBalance"></p>
      </div>
    </div>

  </details>
</template>

<script lang="ts">
import {defineComponent, ref} from "vue";
import {CasperAPI} from "@/casper/api";
import {NODE_ADDRESS} from "@/constants";

const api = new CasperAPI(NODE_ADDRESS);

const ERC20BalanceGetter = defineComponent({
  props: {
    erc20TokenHash: String,
  },
  name: 'ERC20BalanceGetter',
  setup(props) {
    const contractHash = ref('9b287f35b7c11659046cf575b13055dde7f9a309cae5fe1ce3ca985d87f029b0');
    const contractPackageHash = ref('');
    const erc20Balance = ref('0');
    const erc20ContractBalance = ref('0');

    async function getErc20Balance() {
      if (!props.erc20TokenHash) {
        return;
      }

      const publicKey = await window.casperlabsHelper.getActivePublicKey();

      erc20Balance.value = await api.erc20BalanceOf(publicKey, props.erc20TokenHash);
    }

    async function getErc20ContractBalance() {
      if (!props.erc20TokenHash) {
        return;
      }

      erc20ContractBalance.value = await api.erc20ContractBalanceOf(contractPackageHash.value, props.erc20TokenHash);
    }

    return {
      getErc20Balance,
      getErc20ContractBalance,
      contractHash,
      erc20Balance,
      erc20ContractBalance,
      contractPackageHash
    }
  }
})

export default ERC20BalanceGetter;
</script>
