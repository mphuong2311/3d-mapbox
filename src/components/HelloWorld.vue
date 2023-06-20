<template>
  <div class="map-view">
    <MglMap
      ref="pkamap"
      :accessToken="accessToken"
      :mapStyle="mapStyle"
      :center="center"
      :zoom="zoom"
      :bearing="bearing"
      :pitch="pitch"
    />
  </div>
</template>

<script>
import { MAPBOX_ACCESS_TOKEN, MAPBOX_STYLE } from "@/config/mapbox";
import { MglMap } from "vue-mapbox";

export default {
  name: "HelloWorld",
  components: {
    MglMap,
  },
  data() {
    return {
      accessToken: MAPBOX_ACCESS_TOKEN,
      mapStyle: MAPBOX_STYLE,
      center: [105.74764, 20.9617],
      zoom: 17,
      bearing: 60,
      pitch: 60,
    };
  },
};
</script>

<style lang="css">
.map-view {
  height: 90vh;
}
</style>
