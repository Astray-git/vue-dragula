import { createApp } from "vue";
import VueDragula from "../src/vue-dragula";

import App from "./app.vue";

const app = createApp(App);
app.use(VueDragula);
// app.config.debug = true
app.mount("#app");
