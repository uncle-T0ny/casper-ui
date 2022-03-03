<template>
  <div class="Box">
    <h4>Send CSPR to contract</h4>

    <div class="row">
      <div class="col-md-6">
        <label for="inputReceiver">receiver:</label>
        <input type="text" id="inputReceiver" class="form-control" aria-describedby="helpBlock" placeholder="receiver"
               v-model="receiverHash">
      </div>
      <div class="col-md-6">
        <label for="inputAmount">amount:</label>
        <input type="text" id="inputAmount" class="form-control" aria-describedby="helpBlock" placeholder="amount"
               v-model="amountCSPR">
      </div>
    </div>

    <br>
    <button
        class="btn btn-default"
        @click="sendCSPR"
        type="button"
    >
      send CSPR
    </button>
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
    const amountCSPR = ref('10000000000');

    async function sendCSPR() {
      const activeKey = await window.casperlabsHelper.getActivePublicKey();

      await api.sendCSPRToContract(activeKey, amountCSPR.value, receiverHash.value);
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

