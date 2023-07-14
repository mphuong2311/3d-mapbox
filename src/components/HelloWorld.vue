<template>
  <div ref="mount"></div>
</template>

<script>
import * as THREE from "three";
import ROSLIB from "roslib";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import Xbus from "@/assets/xbus/Xbus2.gltf";

export default {
  name: "RoadComponent",
  data() {
    return {
      scene: null,
      camera: null,
      renderer: null,
      objects: [],
      messageFromROS: null,
      road: null,
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
      // Tạo đường
      var roadWidth = 2; // Chiều rộng của mỗi làn đường
      var pointsLeft = [];
      var pointsRight = [];
      var pointsCenter = [];
      for (var i = 0; i < 100; i++) {
        pointsLeft.push(new THREE.Vector3(-roadWidth, 0, i * 10 - 500));
        pointsRight.push(new THREE.Vector3(roadWidth, 0, i * 10 - 500));
        pointsCenter.push(new THREE.Vector3(0, 0, i * 10 - 505));
        pointsCenter.push(new THREE.Vector3(0, 0, i * 10 - 495));
      }
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
      // Thêm đường vào scene
      this.scene.add(this.lineLeft);
      this.scene.add(this.lineRight);
      this.scene.add(this.lineCenter);
      // Thêm ánh sáng ambient
      var ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
      this.scene.add(ambientLight);

      // Thêm ánh sáng điểm (point light)
      var pointLight = new THREE.PointLight(0xffffff, 1);
      pointLight.position.set(0, 50, 50);
      this.scene.add(pointLight);

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
        var geometry = new THREE.BoxGeometry(
          -dimensions.y,
          dimensions.z,
          -dimensions.x
        );
        var material = new THREE.MeshBasicMaterial({ color: "green" });
        var box = new THREE.Mesh(geometry, material);
        box.position.set(-position.y, position.z, -position.x);
        box.rotation.set(0, obj.position.angle.roll, 0);
        this.scene.add(box);
        this.objects.push(box);
      });
      // if (this.road) {
      //   this.scene.remove(this.road);
      //   this.road = null;
      // }

      // const pointsList = msg.map;
      // const points = [];

      // pointsList.forEach((point, index) => {
      //   // Kiểm tra điều kiện để chỉ nối các điểm ở giữa
      //   if (index > 0 && index < pointsList.length - 1) {
      //     const vector = new THREE.Vector3(-point.y, point.z, -point.x);

      //     // Tạo ma trận quay 45 độ theo trục Z
      //     const angle = Math.PI / -3; // Góc quay 45 độ (được chuyển từ radian sang độ bằng cách chia cho 180 và nhân cho Math.PI)
      //     const rotationMatrix = new THREE.Matrix4().makeRotationY(angle);

      //     // Áp dụng ma trận quay vào vector
      //     vector.applyMatrix4(rotationMatrix);

      //     points.push(vector);
      //   }
      // });

      // const geometryPoint = new THREE.BufferGeometry().setFromPoints(points);

      // const material = new THREE.LineBasicMaterial({ color: "gray" });

      // // Tạo đối tượng Line (hoặc LineSegments) với các điểm chỉ nối ở giữa
      // this.road = new THREE.Line(geometryPoint, material);

      // this.scene.add(this.road);
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
        throttle_rate: 0,
      });

      topic.subscribe((message) => {
        this.messageFromROS = JSON.parse(JSON.stringify(message));
        this.createObjectBox(this.messageFromROS);
      });
    },
    animate() {
      // Cập nhật vị trí z của ô tô
      this.lineLeft.position.z += 0.1;
      this.lineRight.position.z += 0.1;
      this.lineCenter.position.z += 0.1;

      // Kiểm tra vị trí z của lineLeft
      if (this.lineLeft.position.z > 100) {
        this.lineLeft.position.z = -100;
      }

      // Kiểm tra vị trí z của lineRight
      if (this.lineRight.position.z > 100) {
        this.lineRight.position.z = -100;
      }

      // Kiểm tra vị trí z của lineCenter
      if (this.lineCenter.position.z > 100) {
        this.lineCenter.position.z = -100;
      }
      requestAnimationFrame(this.animate.bind(this));
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
