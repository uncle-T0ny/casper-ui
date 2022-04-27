import { defineStore } from 'pinia'

export const useBridgeStore = defineStore({
  id: 'bridge',
  state: () => ({
    bridgeHash: import.meta.env.VITE_BRIDGE_CONTRACT_HASH
  }),
})
