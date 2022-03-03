<template>
  <div class="Box">

    <h4>Get ERC20 balance:</h4>
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

  </div>
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
    const erc20Balance = ref('0');

    async function getErc20Balance() {
      if (!props.erc20TokenHash) {
        return;
      }

      const publicKey = await window.casperlabsHelper.getActivePublicKey();

      erc20Balance.value = await api.erc20BalanceOf(publicKey, props.erc20TokenHash);
    }

    return {
      contractHash,
      getErc20Balance,
      erc20Balance,
    }
  }
})

export default ERC20BalanceGetter;
</script>
