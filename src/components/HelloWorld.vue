<template>
  <div ref="mount"></div>
</template>

<script>
import * as THREE from "three";
import ROSLIB from "roslib";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import Xbus from "@/assets/xbus/Xbus2.gltf";
import { LineDashedMaterial } from "three";
import { AmbientLight, DirectionalLight } from "three";
export default {
  name: "RoadComponent",
  data() {
    return {
      scene: null,
      camera: null,
      renderer: null,
      objects: [],
      rightLine: [],
      leftLine: [],
      centerLine: [],
      messageFromROS: null,
      road: null,
      carMessageFromROS: null,
    };
  },
  mounted() {
    this.initThree();
    this.load3DModel();
    this.initROS();
    this.animate();
  },
  methods: {
    load3DModel() {
      const loader = new GLTFLoader();
      loader.load(Xbus, (gltf) => {
        // Xác định mô hình từ file đã tải
        this.xbus = gltf.scene;

        // Đặt vị trí và kích thước của mô hình
        this.xbus.position.set(0, 0, 0); // Đặt mô hình ở trên mặt đường
        this.xbus.scale.set(1, 1, 1); // Đặt tỷ lệ kích thước của mô hình

        // Thêm mô hình vào scene
        this.scene.add(this.xbus);
      });
    },
    initThree() {
      // Khởi tạo scene, camera và renderer
      this.scene = new THREE.Scene();
      this.camera = new THREE.PerspectiveCamera(75, 500 / 500, 0.1, 1000);
      this.renderer = new THREE.WebGLRenderer();
      this.renderer.setClearColor("#232330");
      this.renderer.setSize(800, 800);
      this.$refs.mount.appendChild(this.renderer.domElement);

      // Đặt vị trí camera
      this.camera.position.set(0, 20, 20); // Đặt camera ở trên cao nhìn xuống
      this.camera.lookAt(0, 0, 0); // Hướng nhìn của camera vào tâm của scene

      const ambientLight = new AmbientLight(0xeeeeee, 0.5);
      this.scene.add(ambientLight);

      const directionalLight = new DirectionalLight(0xffffff, 1);
      directionalLight.position.set(100, 100, 100);
      this.scene.add(directionalLight);

      // Vẽ scene
      this.renderer.render(this.scene, this.camera);
      this.animate();
    },
    createObjectBox(msg) {
      // Remove existing objects from the scene
      this.objects.forEach((object) => {
        this.scene.remove(object);
      });

      // Vẽ vật thể
      this.objects = [];
      msg.objects.forEach((obj) => {
        const position = obj.position.pose;
        const dimensions = obj.shape.dimensions;
        const geometry = new THREE.BoxGeometry(
          -dimensions.y,
          dimensions.z,
          -dimensions.x
        );
        const material = new THREE.MeshBasicMaterial({ color: "green" });
        const box = new THREE.Mesh(geometry, material);
        const boxObj = new THREE.Object3D();
        boxObj.add(box);
        this.scene.add(boxObj);
        box.position.set(-position.y, position.z, -position.x);
        box.rotation.set(0, obj.position.angle.yaw, 0);
        boxObj.rotateY(this.messageFromROS.angle.yaw);

        this.objects.push(boxObj);
      });

      //vẽ đường
      if (msg.map.length > 0) {
        // Remove existing objects from the scene
        this.rightLine.forEach((object) => {
          this.scene.remove(object);
        });
        // Vẽ vật thể
        this.rightLine = [];
        this.leftLine.forEach((object) => {
          this.scene.remove(object);
        });
        // Vẽ vật thể
        this.leftLine = [];
        this.centerLine.forEach((object) => {
          this.scene.remove(object);
        });
        // Vẽ vật thể
        this.centerLine = [];
        msg.map.forEach((line) => {
          const rightPoints = line.right.map(
            (point) => new THREE.Vector3(-point.y, point.z, -point.x)
          );
          const leftPoints = line.left.map(
            (point) => new THREE.Vector3(-point.y, point.z, -point.x)
          );
          const centerPoints = line.center.map(
            (point) => new THREE.Vector3(-point.y, point.z, -point.x)
          );
          const rightGeometry = new THREE.BufferGeometry().setFromPoints(
            rightPoints
          );
          const leftGeometry = new THREE.BufferGeometry().setFromPoints(
            leftPoints
          );
          const centerGeometry = new THREE.BufferGeometry().setFromPoints(
            centerPoints
          );
          const centerMaterial = new LineDashedMaterial({
            color: 0x00ff00,
            dashSize: 1,
            gapSize: 1.5,
          }); // Sử dụng LineDashedMaterial và cấu hình dashSize và gapSize theo ý muốn
          centerMaterial.transparent = true; // Đặt thuộc tính transparent là true để có thể hiển thị đường nét đứt

          const material = new THREE.LineBasicMaterial({ color: 0x00ff00 });

          const rightLine = new THREE.Line(rightGeometry, material);
          const leftLine = new THREE.Line(leftGeometry, material);
          const centerLine = new THREE.Line(centerGeometry, centerMaterial);
          centerLine.computeLineDistances();
          this.scene.add(rightLine);
          this.scene.add(leftLine);
          this.scene.add(centerLine);
          this.rightLine.push(rightLine);
          this.leftLine.push(leftLine);
          this.centerLine.push(centerLine);
        });
      }
    },

    initROS() {
      const ros = new ROSLIB.Ros({
        url: "ws://localhost:9090",
      });

      ros.on("connection", () => {
        console.log("Kết nối tới websocket server đã được mở.");
      });

      const topic = new ROSLIB.Topic({
        ros: ros,
        name: "/show_visualization/visualization",
        messageType: "autoware_lanelet2_msgs/Visualization",
        throttle_rate: 200,
      });

      topic.subscribe((message) => {
        this.messageFromROS = JSON.parse(JSON.stringify(message));
        this.createObjectBox(this.messageFromROS);
        // Cập nhật góc xoay của mô hình 3D
        if (this.xbus) {
          let euler = new THREE.Euler(
            0,
            this.messageFromROS.angle.yaw,
            0,

            "XYZ"
          );
          this.xbus.quaternion.setFromEuler(euler);
        }
      });
    },
    animate() {
      requestAnimationFrame(this.animate.bind(this));
      if (this.xbus && this.messageFromROS) {
        let cameraDistance = 10;
        // Thay đổi vị trí camera để nhìn về hướng ngược lại
        this.camera.position.x =
          this.xbus.position.x +
          cameraDistance * Math.sin(this.messageFromROS.angle.yaw);
        this.camera.position.y = cameraDistance;
        this.camera.position.z =
          this.xbus.position.z +
          cameraDistance * Math.cos(this.messageFromROS.angle.yaw);

        // Hướng camera về mô hình xe
        this.camera.lookAt(this.xbus.position);
      }

      this.renderer.render(this.scene, this.camera);
    },
  },
};
</script>

<style scoped>
div {
  width: 100%;
  height: 100%;
}
</style>
