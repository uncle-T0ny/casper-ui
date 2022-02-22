<template>
  <header>
    <div class="wrapper">
      <div>Hello world</div>

      <button
          class="LoginBtn"
          @click="signerConnect"
          type="button"
      >connect
      </button>
    </div>
  </header>

  <main>

    <div>
      user public key:
      <div v-text="pubKey"></div>
      <br>

      casper balance:
      <div v-text="casperBalance"></div>
      <br>


      contract hash:
      <input v-model="contractHash">
      <br>
      <button
          @click="getErc20Balance"
          type="button"
      >get erc20 balance
      </button>

      <Sender/>

      <AllowanceGetter/>

      erc20 balance:
      <div v-text="erc20Balance"></div>
      <br>
    </div>
  </main>
</template>

<script lang="ts">

import {defineComponent, ref, onMounted} from 'vue'

import {useSignerStore} from './stores/signer';
import {CasperServiceByJsonRPC, CLPublicKey} from "casper-js-sdk";
import {CasperAPI} from "@/casper/api";
import Sender from "./components/SenderToContract.vue";
import AllowanceGetter from "./components/AllowanceGetter.vue";
import {NODE_ADDRESS} from "@/constants";

declare global {
  interface Window {
    // @ts-ignore
    casperlabsHelper: any,
    stores: any
  }
}

const api = new CasperAPI(NODE_ADDRESS);

const App = defineComponent({
  name: 'App',
  components: {
    Sender,
    AllowanceGetter
  },
  setup() {
    const signer = useSignerStore();

    const pubKey = ref('');
    const casperBalance = ref('');
    const erc20Balance = ref('');
    const contractHash = ref('');

    const activeKey = ref('0');

    window.addEventListener("signer:locked", (msg) => {
      activeKey.value = '';
    });
    window.addEventListener("signer:unlocked", (msg: any) => {
      if (msg.detail.isConnected) {
        activeKey.value = msg.detail.activeKey;
      }
    });
    window.addEventListener("signer:activeKeyChanged", (msg: any) => {
      if (msg.detail.isConnected) {
        activeKey.value = msg.detail.activeKey;
      }
    });
    window.addEventListener("signer:connected", (msg: any) => {
      activeKey.value = msg.detail.activeKey;

    });
    window.addEventListener("signer:disconnected", (msg) => {
      activeKey.value = '';
    });

    window.stores = {signer};

    function signerConnect() {
      console.log('request signer connection...');
      // @ts-ignore
      window.casperlabsHelper.requestConnection();
    }

    async function getErc20Balance() {
      const publicKey = await window.casperlabsHelper.getActivePublicKey();
      erc20Balance.value = await api.erc20BalanceOf(publicKey, contractHash.value);
    }

    onMounted(async () => {
      const isConnected = await window.casperlabsHelper.isConnected()

      if (isConnected) {
        const publicKey = await window.casperlabsHelper.getActivePublicKey();

        const balance = await api.casperBalance(publicKey);
        casperBalance.value = balance.toString();

        pubKey.value = publicKey;
      } else {
        console.log('Signer not connected');
      }
    });


    return {
      pubKey,
      signerConnect,
      signer,
      casperBalance,
      erc20Balance,
      contractHash,
      getErc20Balance,
    }
  }
})

export default App;
</script>

<style>
 .LoginBtn {
   position: absolute;
   right: 20px;
   top: 20px;
   font-size: 20px;
   color: #55151f;
 }

 .Box {
   border: 1px solid;
   padding: 50px;
 }
</style>
