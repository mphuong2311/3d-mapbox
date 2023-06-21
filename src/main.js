import Vue from "vue";
import App from "./App.vue";
// Mapbox CSS
import "mapbox-gl/dist/mapbox-gl.css";
import VueMgl, { mgl } from "vue-mgl";
import { MAPBOX_ACCESS_TOKEN } from "@/config/mapbox";
Vue.use(VueMgl);
mgl.accessToken = MAPBOX_ACCESS_TOKEN;

Vue.config.productionTip = false;

new Vue({
  render: (h) => h(App),
}).$mount("#app");
