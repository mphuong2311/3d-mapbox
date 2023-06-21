<template>
  <div class="map-container">
    <MglMap
      class="map"
      :map-style="mapStyle"
      :center="center"
      :zoom="zoom"
      :attribution-control="false"
      @load="onMapLoad"
    >
    </MglMap>
  </div>
</template>

<script>
import { MAPBOX_STYLE } from "@/config/mapbox";
import customLayer from "./customLayer";
export default {
  name: "HelloWorld",
  components: {},
  data() {
    return {
      mapStyle: MAPBOX_STYLE,
      center: [105.74764, 20.9617],
      zoom: 18,
      bearing: 0,
      pitch: 60,
    };
  },
  methods: {
    onMapLoad({ map }) {
      this.map = map;
      console.log(this.map);
      map.on("style.load", () => {
        map.addLayer(customLayer, "waterway-label");
      });
    },
  },
};
</script>

<style>
.map-container {
  width: 100%;
  height: 90vh;
}
</style>
