import { createApp } from "vue";
import { createPinia } from "pinia";
// @ts-expect-error
import App from "./App.vue";

import { Buffer } from "buffer";

window.Buffer = Buffer;
window.global = window.globalThis;

const app = createApp(App);

app.use(createPinia());

app.mount("#app");
