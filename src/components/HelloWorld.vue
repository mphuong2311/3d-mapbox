<template>
  <div ref="mount"></div>
</template>

<script>
import * as THREE from "three";
import * as Stats from "stats.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import Xbus from "@/assets/xbus/Xbus2.gltf";
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
      lineLeft: null,
      lineRight: null,
      lineCenter: null,
    };
  },
  mounted() {
    this.load3DModel();
    this.initThree();
  },

  methods: {
    load3DModel() {
      const loader = new GLTFLoader();
      loader.load(Xbus, (gltf) => {
        // Xác định mô hình từ file đã tải
        this.xbus = gltf.scene;

        // Đặt vị trí và kích thước của mô hình
        this.xbus.position.set(5, 0, 35); // Đặt mô hình ở trên mặt đường
        this.xbus.scale.set(5, 5, 5); // Đặt tỷ lệ kích thước của mô hình

        // Tạo vật liệu MeshPhongMaterial cho mô hình
        var xbusMaterial = new THREE.MeshPhongMaterial({
          color: "gray",
          shininess: 100,
        });

        // Gán vật liệu vào mô hình
        this.xbus.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.material = xbusMaterial;
          }
        });
        // Thêm mô hình vào scene
        this.scene.add(this.xbus);
      });
    },
    initThree() {
      this.stats = new Stats();
      this.stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
      this.$refs.mount.appendChild(this.stats.dom);
      // Khởi tạo scene, camera và renderer
      this.scene = new THREE.Scene();
      this.camera = new THREE.PerspectiveCamera(75, 500 / 500, 0.1, 1000);
      this.renderer = new THREE.WebGLRenderer();
      this.renderer.setClearColor("#232330");
      this.renderer.setSize(800, 800);
      this.$refs.mount.appendChild(this.renderer.domElement);

      // Đặt vị trí camera
      this.camera.position.set(0, 35, 80); // Đặt camera ở trên cao nhìn xuống
      this.camera.lookAt(0, 0, 0); // Hướng nhìn của camera vào tâm của scene

      // Tạo đường
      var roadWidth = 11; // Chiều rộng của mỗi làn đường
      var pointsLeft = [];
      var pointsRight = [];
      var pointsCenter = [];
      for (var i = 0; i < 100; i++) {
        pointsLeft.push(new THREE.Vector3(-roadWidth, 0, i * 10 - 500));
        pointsRight.push(new THREE.Vector3(roadWidth, 0, i * 10 - 500));
        pointsCenter.push(new THREE.Vector3(0, 0, i * 10 - 505));
        pointsCenter.push(new THREE.Vector3(0, 0, i * 10 - 495));
      }

      // // Tạo hình hộp để mô phỏng ô tô
      // var xbusGeometry = new THREE.BoxGeometry(6, 12, 12); // Chiều dài, chiều rộng, chiều cao
      // var xbusMaterial = new THREE.MeshBasicMaterial({ color: "pink" });
      // this.xbus = new THREE.Mesh(xbusGeometry, xbusMaterial);
      // // Đặt vị trí của ô tô
      // this.xbus.position.set(0, 0, 0); // Đặt ô tô ở trên mặt đường

      // Tạo object
      var objectGeometry = new THREE.BoxGeometry(6, 12, 12); // Chiều dài, chiều rộng, chiều cao
      var objectMaterial = new THREE.MeshBasicMaterial({ color: "green" });
      this.object = new THREE.Mesh(objectGeometry, objectMaterial);
      this.object.position.set(16, 0, -35); // Đặt ô tô ở trên mặt đường

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
        color: "white",
        dashSize: 2,
        gapSize: 1,
      });
      this.lineLeft = new THREE.Line(geometryLeft, material);
      this.lineRight = new THREE.Line(geometryRight, material);
      this.lineCenter = new THREE.LineSegments(geometryCenter, dashedMaterial);
      this.lineCenter.computeLineDistances();
      // Thêm ánh sáng ambient
      var ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
      this.scene.add(ambientLight);

      // Thêm ánh sáng điểm (point light)
      var pointLight = new THREE.PointLight(0xffffff, 1);
      pointLight.position.set(0, 50, 50);
      this.scene.add(pointLight);
      // Thêm đường vào scene
      this.scene.add(this.lineLeft);
      this.scene.add(this.lineRight);
      this.scene.add(this.lineCenter);
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
      this.object.position.z += 0.5;
      this.person.position.z += 0.2;
      this.lineLeft.position.z += 0.2;
      this.lineRight.position.z += 0.2;
      this.lineCenter.position.z += 0.2;
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
