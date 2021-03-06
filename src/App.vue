<template>
  <header>
    <div class="wrapper">
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
      <div class="bg-success Box">
        user public key:
        <div v-text="pubKey"></div>
        <div v-text="accountHash"></div>
      </div>

      <div class="Box">
        BRIDGE HASH:
        <div v-text="config.BRIDGE_HASH"></div>

        ERC20 HASH:
        <div v-text="config.ERC20_HASH"></div>

        WCSPR HASH:
        <div v-text="config.WCSPR_HASH"></div>
      </div>


      <div class="bg-primary Box">
      casper balance:
      <div v-text="casperBalance"/>
      </div>

      <p class="bg-success Box">
        <label for="inputTokenHash">ERC20 Token Hash:</label>
        <input type="text" id="inputTokenHash" class="form-control" aria-describedby="helpBlock" placeholder="ERC20 token hash" v-model="erc20TokenHash">
      </p>

      <Lock :erc20TokenHash="erc20TokenHash" />
      
      <Unlock :erc20TokenHash="erc20TokenHash" />

      <Sender/>

      <AllowanceGetter :erc20TokenHash="erc20TokenHash"/>

      <ERC20BalanceGetter />

      <Approve :erc20TokenHash="erc20TokenHash"/>

      <TransferERC20ToContract :erc20TokenHash="erc20TokenHash"/>

      <TransferERC20From :erc20TokenHash="erc20TokenHash" />

      <PubKeyToHash/>
    </div>
  </main>
</template>

<script lang="ts">

import {defineComponent, ref, onMounted} from 'vue'

import {useSignerStore} from './stores/signer';
import {CasperAPI} from "@/casper/api";
import Sender from "./components/SenderToContract.vue";
import AllowanceGetter from "./components/AllowanceGetter.vue";
import ERC20BalanceGetter from "./components/ERC20BalanceGetter.vue";
import TransferERC20ToContract from "./components/TransferERC20ToContract.vue";
import Approve from "./components/Approve.vue";
import TransferERC20From from "./components/TransferERC20From.vue";
import Lock from "./components/Lock.vue";
import Unlock from "./components/Unlock.vue";
import PubKeyToHash from "./components/PubKeyToHash.vue";
import {NODE_ADDRESS} from "@/constants";
import {
  config
} from "./config";
import {useBridgeStore} from "@/stores/bridge";

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
    AllowanceGetter,
    ERC20BalanceGetter,
    Approve,
    TransferERC20ToContract,
    TransferERC20From,
    PubKeyToHash,
    Lock,
    Unlock,
  },
  setup() {
    const signer = useSignerStore();
    console.log('bridge: ', config.BRIDGE_HASH);

    const pubKey = ref('');
    const accountHash = ref('');
    const casperBalance = ref('');
    const contractHash = ref('');
    const erc20TokenHash = ref('df2800159ce5990fdbeb92099359ad361c44a4fd3b1f38a1a15c9d0f795c014e');

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

    onMounted(async () => {
      const isConnected = await window.casperlabsHelper.isConnected()

      if (isConnected) {
        const publicKey = await window.casperlabsHelper.getActivePublicKey();

        const balance = await api.casperBalance(publicKey);
        casperBalance.value = balance.toString();

        pubKey.value = publicKey;
        accountHash.value = api.getHashFromPubKey(publicKey);
      } else {
        console.log('Signer not connected');
      }
    });


    return {
      config,
      pubKey,
      accountHash,
      signerConnect,
      signer,
      casperBalance,
      contractHash,
      erc20TokenHash,
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
   width: 200px;
   height: 80px;
   color: #55151f;
 }

 .Box {
    padding: 10px;
    border-bottom: 1px solid slategray;
  }

  .Box summary {
    font-size: 20px;
  }

  .Box summary:hover {
    cursor: pointer;
  }

 input {
   padding: 5px;
   border-radius: 5px;
   width: 30%;
   margin: 2px;
 }
</style>
