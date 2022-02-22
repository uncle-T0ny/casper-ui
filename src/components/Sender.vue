<template>
  <div class="Box">
      <br>

      receiver:
      <input placeholder="receiver" v-model="receiverHash">
      <input placeholder="amount" v-model="amountCSPR">
      <br>
      <button
          @click="sendCSPR"
          type="button"
      >send CSPR</button>

     <br>
  </div>
</template>

<script lang="ts">
import {defineComponent, ref} from "vue";
import {CasperAPI} from "@/casper/api";
import {NODE_ADDRESS} from "@/constants";

const api = new CasperAPI(NODE_ADDRESS);

const Sender = defineComponent({
  name: 'Sender',
  setup() {
    const receiverHash = ref('');
    const amountCSPR = ref('0');

    async function sendCSPR() {
      const publicKey = await window.casperlabsHelper.getActivePublicKey();
      const deployHash = await api.sendCSPR(publicKey, receiverHash.value, amountCSPR.value);
      console.log('deployHash', deployHash);
    }

    return {
      receiverHash,
      amountCSPR,
      sendCSPR,
    }
  }
})

export default Sender;
</script>

