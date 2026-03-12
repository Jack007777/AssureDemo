<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js";

type ModelPart = {
  src: string;
  tint?: boolean;
};

const props = defineProps<{
  baseSrc?: string;
  frameSrc?: string;
  frameColor?: string;
  frameOffset?: { x: number; y: number; z: number };
  partSources?: ModelPart[];
}>();

const container = ref<HTMLDivElement | null>(null);
const status = ref<"idle" | "loading" | "ready" | "empty" | "error">("idle");
const progressText = ref("");
const statusText = computed(() => {
  if (!getModelParts().length) return "ç­‰å¾…æ¨¡åž‹";
  if (status.value === "loading") return progressText.value || "åŠ è½½ä¸­...";
  if (status.value === "empty") return "æ¨¡åž‹ä¸ºç©ºæˆ–ä¸å«å‡ ä½•";
  if (status.value === "error") return "æ¨¡åž‹åŠ è½½å¤±è´¥";
  return "";
});

let renderer: THREE.WebGLRenderer | null = null;
let scene: THREE.Scene | null = null;
let camera: THREE.PerspectiveCamera | null = null;
let controls: OrbitControls | null = null;
let modelRoot: THREE.Object3D | null = null;
let dracoLoader: DRACOLoader | null = null;
let baseTransform: { center: THREE.Vector3; minY: number } | null = null;
let animationId = 0;
let resizeObserver: ResizeObserver | null = null;
let colorTargets: THREE.Object3D[] = [];
let loadToken = 0;

function getModelParts() {
  if (props.partSources?.length) return props.partSources;
  const parts: ModelPart[] = [];
  if (props.baseSrc) parts.push({ src: props.baseSrc });
  if (props.frameSrc) parts.push({ src: props.frameSrc, tint: true });
  return parts;
}

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
  if (scene && modelRoot) {
    scene.remove(modelRoot);
    disposeObject(modelRoot);
    modelRoot = null;
  }
  baseTransform = null;
  colorTargets = [];
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

function loadModelAsync(url: string, onProgress?: (evt: ProgressEvent) => void) {
  return new Promise<THREE.Object3D>((resolve, reject) => {
    const loader = createLoader();
    const timeoutId = window.setTimeout(() => {
      reject(new Error(`GLB load timeout: ${url}`));
    }, 20000);

    loader.load(
      url,
      gltf => {
        window.clearTimeout(timeoutId);
        resolve(gltf.scene);
      },
      evt => {
        onProgress?.(evt);
      },
      error => {
        window.clearTimeout(timeoutId);
        reject(error);
      }
    );
  });
}

async function reloadScene() {
  clearObject();
  if (!scene) return;

  const parts = getModelParts();
  if (!parts.length) return;

  const currentToken = ++loadToken;
  status.value = "loading";
  progressText.value = "åŠ è½½ä¸­...";
  colorTargets = [];

  try {
    const group = new THREE.Group();
    let meshCount = 0;

    for (let index = 0; index < parts.length; index += 1) {
      const part = parts[index];
      const sceneObj = await loadModelAsync(part.src, evt => {
        if (evt.total > 0 || evt.loaded > 0) {
          const total = Math.max(evt.total || 0, evt.loaded || 0);
          const pct = total > 0 ? Math.min(100, Math.round((evt.loaded / total) * 100)) : 0;
          const combined = Math.round(((index + pct / 100) / parts.length) * 100);
          progressText.value = `åŠ è½½ä¸­... ${combined}%`;
        }
      });

      sceneObj.traverse(child => {
        if (child instanceof THREE.Mesh) meshCount += 1;
      });

      if (part.tint) colorTargets.push(sceneObj);
      group.add(sceneObj);
    }

    if (currentToken !== loadToken) {
      disposeObject(group);
      return;
    }

    modelRoot = group;
    scene.add(modelRoot);
    fitCameraToObject(modelRoot);
    status.value = meshCount ? "ready" : "empty";
    progressText.value = "";
    applyFrameColor();
  } catch (error) {
    if (currentToken !== loadToken) return;
    status.value = "error";
    progressText.value = "åŠ è½½ä¸­...";
    console.error("GLB load failed", error);
  }
}

function applyFrameColor() {
  if (!props.frameColor || !colorTargets.length) return;
  const color = new THREE.Color(props.frameColor);
  colorTargets.forEach(target => {
    target.traverse(child => {
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
  });
}

onMounted(() => {
  initScene();
  void reloadScene();
  resizeObserver = new ResizeObserver(resize);
  if (container.value) resizeObserver.observe(container.value);
  animate();
});

onBeforeUnmount(() => {
  loadToken += 1;
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
  () => [props.baseSrc, props.frameSrc, props.partSources],
  () => {
    status.value = getModelParts().length ? "loading" : "idle";
    if (!scene) return;
    void reloadScene();
  },
  { immediate: true, deep: true }
);

watch(
  () => props.frameColor,
  () => {
    applyFrameColor();
  }
);
</script>

<template>
  <div class="model-viewer" ref="container">
    <div v-if="statusText" class="model-placeholder">{{ statusText }}</div>
  </div>
</template>
