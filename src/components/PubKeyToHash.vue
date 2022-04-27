<template>
  <details class="Box">
    <summary>Get HASH</summary>

    <div class="row">
      <div class="col-md-4">
        <label for="inputPubKey">Pub key:</label>
        <input type="text" id="inputPubKey" class="form-control" aria-describedby="helpBlock" placeholder="pub key"
               v-model="pubKey">
      </div>
      <div class="col-md-2">
        <div v-text="hashFromPubKey"></div>
      </div>
    </div>

    <br>
    <button
        class="btn btn-default"
        @click="getHash"
        type="button"
    >
      get HEX
    </button>
  </details>
</template>

<script lang="ts">
import {defineComponent, ref} from "vue";
import {CasperAPI} from "@/casper/api";
import {NODE_ADDRESS} from "@/constants";

const api = new CasperAPI(NODE_ADDRESS);

const PubKeyToHash = defineComponent({
  name: 'PubKeyToHash',
  setup() {
    const pubKey = ref('');
    const hashFromPubKey = ref('-');

    async function getHash() {
      hashFromPubKey.value = await api.getHashFromPubKey(pubKey.value);
    }

    return {
      hashFromPubKey,
      pubKey,
      getHash,
    }
  }
})

export default PubKeyToHash;
</script>
