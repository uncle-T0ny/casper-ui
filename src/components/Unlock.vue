<template>
  <div class="Box">
    <h4>Unlock: </h4>

    <div class="row">
       <div class="col-md-4">
        <label for="inputAmount">amount:</label>
        <input type="text" id="inputAmount" class="form-control" aria-describedby="helpBlock" placeholder="amount"
               v-model="amount">
      </div>
    </div>

    <br>

    <div class="row">
      <div class="col-md-1">
        <button
            class="btn btn-default"
            @click="unlock('Base')"
            type="button"
        >
          Unlock BASE
        </button>
      </div>

      <div class="col-md-1">
        <button
            class="btn btn-default"
            @click="unlock('Native')"
            type="button"
        >
          Unlock NATIVE
        </button>
      </div>

      <div class="col-md-1">
        <button
            class="btn btn-default"
            @click="unlock('Wrapped')"
            type="button"
        >
          Unlock WRAPPED
        </button>
      </div>
    </div>

    <br>
  </div>
</template>


<script lang="ts">
import {defineComponent, ref} from "vue";
import {NODE_ADDRESS} from "@/constants";
import { BridgeAPI } from "../casper/bridge_api";
import {config} from "@/config";

const api = new BridgeAPI(NODE_ADDRESS);

const Unlock = defineComponent({
  props: {
    erc20TokenHash: String,
  },
  name: 'Unlock',
  setup(props) {
    const amount = ref('0');

    async function lock(type: string) {
      const activeKey = await window.casperlabsHelper.getActivePublicKey();

      switch (type) {
        case 'Base':
          await api.unlockBase();
          break;
        case 'Native':
          await api.unlockNative();
          break;
        case 'Wrapped':
          await api.unlockWrapped();
          break;
      }
    }

    return {
      amount,
      unlock: lock,
    }
  }
})

export default Unlock;
</script>
