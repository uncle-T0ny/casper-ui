import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'

import { Buffer } from "buffer";

(window as any).Buffer = Buffer;

const app = createApp(App)

app.use(createPinia())

app.mount('#app')
