<template>
  <div class="Box">
    <h4>Lock: </h4>

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
            @click="lock('Native')"
            type="button"
        >
          Lock NATIVE
        </button>
      </div>

      <div class="col-md-1">
        <button
            class="btn btn-default"
            @click="lock('Wrapped')"
            type="button"
        >
          Lock WRAPPED
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

const Lock = defineComponent({
  props: {
    erc20TokenHash: String,
  },
  name: 'Lock',
  setup() {
    const amount = ref('0');

    async function lock(type: string) {
      const activeKey = await window.casperlabsHelper.getActivePublicKey();

      switch (type) {
        case 'Native':
          await api.lockNative(activeKey, amount.value, config.BRIDGE_HASH, config.ERC20_HASH);
          break;
        case 'Wrapped':
          await api.lockWrapped(activeKey, amount.value, config.BRIDGE_HASH, config.ERC20_WRAPPED_HASH);
          break;
      }
    }

    return {
      amount,
      lock,
    }
  }
})

export default Lock;
</script>
