<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js";

const props = defineProps<{
  baseSrc?: string;
  frameSrc?: string;
  frameColor?: string;
  frameOffset?: { x: number; y: number; z: number };
}>();

const container = ref<HTMLDivElement | null>(null);
const status = ref<"idle" | "loading" | "ready" | "empty" | "error">("idle");
const progressText = ref("");
const statusText = computed(() => {
  if (!props.baseSrc) return "等待模型";
  if (status.value === "loading") return progressText.value || "加载中...";
  if (status.value === "empty") return "模型为空或不含几何";
  if (status.value === "error") return "模型加载失败";
  return "";
});
let renderer: THREE.WebGLRenderer | null = null;
let scene: THREE.Scene | null = null;
let camera: THREE.PerspectiveCamera | null = null;
let controls: OrbitControls | null = null;
let baseObject: THREE.Object3D | null = null;
let dracoLoader: DRACOLoader | null = null;
let frameObject: THREE.Object3D | null = null;
let baseTransform: { center: THREE.Vector3; minY: number } | null = null;
let animationId = 0;
let resizeObserver: ResizeObserver | null = null;

function disposeObject(object: THREE.Object3D) {
  object.traverse(child => {
    if (child instanceof THREE.Mesh) {
      child.geometry.dispose();
      if (Array.isArray(child.material)) {
        child.material.forEach(mat => mat.dispose());
      } else {
        child.material.dispose();
      }
    }
  });
}

function clearObject() {
  if (scene && baseObject) {
    scene.remove(baseObject);
    disposeObject(baseObject);
    baseObject = null;
  }
  if (scene && frameObject) {
    scene.remove(frameObject);
    disposeObject(frameObject);
    frameObject = null;
  }
  baseTransform = null;
}

function fitCameraToObject(object: THREE.Object3D) {
  if (!camera || !controls) return;
  const box = new THREE.Box3().setFromObject(object);
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());

  const transform = normalizeToGrid(object, center);
  baseTransform = transform;
  const maxDim = Math.max(size.x, size.y, size.z);
  const distance = maxDim * 1.6 || 1;

  camera.position.set(distance, distance, distance);
  camera.near = distance / 100;
  camera.far = distance * 100;
  camera.updateProjectionMatrix();
  controls.target.set(0, 0, 0);
  controls.update();
}

function normalizeToGrid(object: THREE.Object3D, center?: THREE.Vector3) {
  const objectCenter = center ?? new THREE.Box3().setFromObject(object).getCenter(new THREE.Vector3());
  object.position.sub(objectCenter);
  const updatedBox = new THREE.Box3().setFromObject(object);
  const minY = updatedBox.min.y;
  if (Number.isFinite(minY)) {
    object.position.y -= minY;
  }
  return { center: objectCenter, minY };
}

function initScene() {
  if (!container.value) return;
  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(45, 1, 0.01, 1000);
  camera.position.set(2, 2, 2);

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(window.devicePixelRatio || 1);
  renderer.setSize(container.value.clientWidth, container.value.clientHeight);
  container.value.appendChild(renderer.domElement);

  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.06;

  const ambient = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambient);
  const dir = new THREE.DirectionalLight(0xffffff, 0.8);
  dir.position.set(5, 6, 4);
  scene.add(dir);

  const grid = new THREE.GridHelper(4, 20, 0x22304a, 0x22304a);
  scene.add(grid);
}

function animate() {
  if (!renderer || !scene || !camera) return;
  controls?.update();
  renderer.render(scene, camera);
  animationId = requestAnimationFrame(animate);
}

function resize() {
  if (!container.value || !renderer || !camera) return;
  const { clientWidth, clientHeight } = container.value;
  renderer.setSize(clientWidth, clientHeight);
  camera.aspect = clientWidth / clientHeight;
  camera.updateProjectionMatrix();
}

function createLoader() {
  const loader = new GLTFLoader();
  if (!dracoLoader) {
    dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath("/draco/");
    dracoLoader.setDecoderConfig({ type: "js" });
    dracoLoader.preload();
  }
  loader.setDRACOLoader(dracoLoader);
  loader.setMeshoptDecoder(MeshoptDecoder);
  return loader;
}

function loadModel(url: string, onLoad: (sceneObj: THREE.Object3D) => void, onProgress?: (evt: ProgressEvent) => void) {
  const loader = createLoader();
  const timeoutId = window.setTimeout(() => {
    if (status.value === "loading") {
      status.value = "error";
      console.error("GLB load timeout");
    }
  }, 20000);
  loader.load(
    url,
    gltf => {
      onLoad(gltf.scene);
      window.clearTimeout(timeoutId);
    },
    evt => {
      if (onProgress) onProgress(evt);
    },
    error => {
      status.value = "error";
      progressText.value = "";
      window.clearTimeout(timeoutId);
      console.error("GLB load failed", error);
    }
  );
}

function reloadScene() {
  clearObject();
  if (!scene || !props.baseSrc) return;

  status.value = "loading";
  progressText.value = "加载中...";

  loadModel(
    props.baseSrc,
    sceneObj => {
      baseObject = sceneObj;
      let meshCount = 0;
      baseObject.traverse(child => {
        if (child instanceof THREE.Mesh) meshCount += 1;
      });
      scene.add(baseObject);
      fitCameraToObject(baseObject);
      hideFrameInBase(baseObject);
      status.value = meshCount ? "ready" : "empty";
      progressText.value = "";
      loadFrame();
    },
    evt => {
      if (evt.total > 0 || evt.loaded > 0) {
        const total = Math.max(evt.total || 0, evt.loaded || 0);
        const pct = total > 0 ? Math.min(100, Math.round((evt.loaded / total) * 100)) : 0;
        progressText.value = `加载中... ${pct}%`;
      }
    }
  );
}

function loadFrame() {
  if (!props.frameSrc || !scene) return;
  loadModel(props.frameSrc, sceneObj => {
    frameObject = sceneObj;
    positionFrame();
    scene.add(frameObject);
    applyFrameColor();
  });
}

function positionFrame() {
  if (!frameObject) return;
  if (baseTransform) {
    frameObject.position.sub(baseTransform.center);
    frameObject.position.y -= baseTransform.minY;
  }
  if (props.frameOffset) {
    frameObject.position.x += props.frameOffset.x;
    frameObject.position.y += props.frameOffset.y;
    frameObject.position.z += props.frameOffset.z;
  }
}

function applyFrameColor() {
  if (!frameObject || !props.frameColor) return;
  const color = new THREE.Color(props.frameColor);
  frameObject.traverse(child => {
    if (child instanceof THREE.Mesh) {
      child.visible = true;
      child.frustumCulled = false;
      child.renderOrder = 1;
      child.material = new THREE.MeshStandardMaterial({
        color,
        metalness: 0.15,
        roughness: 0.55,
        side: THREE.DoubleSide
      });
    }
  });
}

function hideFrameInBase(root: THREE.Object3D) {
  root.traverse(child => {
    if (!(child instanceof THREE.Mesh)) return;
    const name = child.name.toLowerCase();
    if (name.includes("frame")) {
      child.visible = false;
    }
  });
}

onMounted(() => {
  initScene();
  reloadScene();
  resizeObserver = new ResizeObserver(resize);
  if (container.value) resizeObserver.observe(container.value);
  animate();
});

onBeforeUnmount(() => {
  if (animationId) cancelAnimationFrame(animationId);
  resizeObserver?.disconnect();
  clearObject();
  controls?.dispose();
  dracoLoader?.dispose();
  dracoLoader = null;
  renderer?.dispose();
  renderer?.domElement.remove();
  scene = null;
  camera = null;
  controls = null;
  renderer = null;
});

watch(
  () => [props.baseSrc, props.frameSrc],
  () => {
    status.value = props.baseSrc ? "loading" : "idle";
    if (!scene) return;
    reloadScene();
  },
  { immediate: true }
);

watch(
  () => props.frameColor,
  () => {
    applyFrameColor();
  }
);

watch(
  () => props.frameOffset,
  () => {
    positionFrame();
  },
  { deep: true }
);
</script>

<template>
  <div class="model-viewer" ref="container">
    <div v-if="statusText" class="model-placeholder">{{ statusText }}</div>
  </div>
</template>
