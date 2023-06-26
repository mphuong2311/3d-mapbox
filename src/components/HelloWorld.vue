<template>
  <div ref="mount"></div>
</template>

<script>
import * as THREE from "three";
import * as Stats from "stats.js";

export default {
  name: "RoadComponent",
  data() {
    return {
      scene: null,
      camera: null,
      renderer: null,
      xbus: null,
      road: null,
      object: null,
      person: null,
    };
  },
  mounted() {
    this.initThree();
    this.animate();
  },
  methods: {
    initThree() {
      this.stats = new Stats();
      this.stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
      this.$refs.mount.appendChild(this.stats.dom);
      // Khởi tạo scene, camera và renderer
      this.scene = new THREE.Scene();
      this.camera = new THREE.PerspectiveCamera(75, 500 / 500, 0.1, 1000);
      this.renderer = new THREE.WebGLRenderer();
      this.renderer.setClearColor("#f7f7f7");
      this.renderer.setSize(500, 500);
      this.$refs.mount.appendChild(this.renderer.domElement);

      // Đặt vị trí camera
      this.camera.position.set(0, 50, 50); // Đặt camera ở trên cao nhìn xuống
      this.camera.lookAt(0, 0, 0); // Hướng nhìn của camera vào tâm của scene

      // Tạo đường
      var roadWidth = 20; // Chiều rộng của mỗi làn đường
      var pointsLeft = [];
      var pointsRight = [];
      var pointsCenter = [];
      for (var i = 0; i < 10; i++) {
        pointsLeft.push(new THREE.Vector3(-roadWidth, 0, i * 10 - 50));
        pointsRight.push(new THREE.Vector3(roadWidth, 0, i * 10 - 50));
        pointsCenter.push(new THREE.Vector3(0, 0, i * 10 - 55));
        pointsCenter.push(new THREE.Vector3(0, 0, i * 10 - 45));
      }

      // Tạo hình hộp để mô phỏng ô tô
      var xbusGeometry = new THREE.BoxGeometry(6, 12, 12); // Chiều dài, chiều rộng, chiều cao
      var xbusMaterial = new THREE.MeshBasicMaterial({ color: "pink" });
      this.xbus = new THREE.Mesh(xbusGeometry, xbusMaterial);
      // Đặt vị trí của ô tô
      this.xbus.position.set(0, 0, 0); // Đặt ô tô ở trên mặt đường

      // Tạo object
      var objectGeometry = new THREE.BoxGeometry(6, 12, 12); // Chiều dài, chiều rộng, chiều cao
      var objectMaterial = new THREE.MeshBasicMaterial({ color: "green" });
      this.object = new THREE.Mesh(objectGeometry, objectMaterial);
      this.object.position.set(10, 0, -35); // Đặt ô tô ở trên mặt đường

      // Tạo person
      var personGeometry = new THREE.BoxGeometry(2, 5, 5); // Chiều dài, chiều rộng, chiều cao
      var personMaterial = new THREE.MeshBasicMaterial({ color: "green" });
      this.person = new THREE.Mesh(personGeometry, personMaterial);
      this.person.position.set(-10, 0, -35); // Đặt ô tô ở trên mặt đường

      var geometryLeft = new THREE.BufferGeometry().setFromPoints(pointsLeft);
      var geometryRight = new THREE.BufferGeometry().setFromPoints(pointsRight);
      var geometryCenter = new THREE.BufferGeometry().setFromPoints(
        pointsCenter
      );
      var material = new THREE.LineBasicMaterial({ color: "gray" });
      var dashedMaterial = new THREE.LineDashedMaterial({
        color: "gray",
        dashSize: 2,
        gapSize: 1,
      });
      var lineLeft = new THREE.Line(geometryLeft, material);
      var lineRight = new THREE.Line(geometryRight, material);
      var lineCenter = new THREE.LineSegments(geometryCenter, dashedMaterial);
      lineCenter.computeLineDistances();

      // Thêm đường vào scene
      this.scene.add(lineLeft);
      this.scene.add(lineRight);
      this.scene.add(lineCenter);
      // Thêm ô tô vào scene
      this.scene.add(this.xbus);
      this.scene.add(this.object);
      this.scene.add(this.person);

      // Vẽ scene
      this.renderer.render(this.scene, this.camera);
      this.animate();
    },
    animate() {
      this.stats.begin();
      // Cập nhật vị trí z của ô tô
      this.object.position.z += 0.2;
      this.person.position.z += 0.1;
      // Vẽ lại scene
      this.renderer.render(this.scene, this.camera);
      this.stats.end();
      // Yêu cầu trình duyệt gọi hàm animate trong frame tiếp theo
      requestAnimationFrame(this.animate);
    },
  },
};
</script>

<style scoped>
div {
  width: 100%;
  height: 50%;
}
</style>
