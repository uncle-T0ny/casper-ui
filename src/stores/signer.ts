import { defineStore } from 'pinia'

export const useSignerStore = defineStore({
  id: 'signer',
  state: () => ({
    isConnected: false
  }),
  actions: {
    setConnected() {
      this.isConnected = true;
    }
  }
})
