import * as THREE from "three";
import { OrbitControls } from "/assets/vendor/OrbitControls.js";
import { DRACOLoader } from "/assets/vendor/DRACOLoader.js";
import { GLTFLoader } from "/assets/vendor/GLTFLoader.js";
import { MeshoptDecoder } from "/assets/vendor/meshopt_decoder.module.js";
import { FRAME_WIDTH_GROUPS } from "/assets/frame-width-groups.mjs";
import { getModelPartsForSourceModel } from "/assets/model-parts.mjs?v=20260715-desktop-preview-v1";

function isMobileViewport() {
  return window.innerWidth <= 768;
}

function getRendererPixelRatio() {
  const pixelRatio = window.devicePixelRatio || 1;
  return isMobileViewport() ? Math.min(pixelRatio, 1.5) : pixelRatio;
}

function getLoadTimeoutMs() {
  return isMobileViewport() ? 60000 : 30000;
}

function buildRenderFrameMaterial(colorValue) {
  const color = colorValue instanceof THREE.Color ? colorValue.clone() : new THREE.Color(colorValue || "#ffffff");
  const emissive = color.clone().multiplyScalar(0.01);
  return new THREE.MeshPhysicalMaterial({
    color,
    emissive,
    emissiveIntensity: 0.05,
    metalness: 0.18,
    roughness: 0.24,
    clearcoat: 1,
    clearcoatRoughness: 0.08,
    sheen: 0.08,
    sheenRoughness: 0.42,
    specularIntensity: 1,
    envMapIntensity: 1.18,
    side: THREE.DoubleSide,
  });
}

function buildBlackWheelMaterial() {
  return new THREE.MeshPhysicalMaterial({
    color: new THREE.Color("#111419"),
    emissive: new THREE.Color("#000000"),
    metalness: 0.48,
    roughness: 0.3,
    clearcoat: 0.18,
    clearcoatRoughness: 0.2,
    envMapIntensity: 1.3,
    side: THREE.DoubleSide,
  });
}

function buildSeatTexture(style) {
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");

  if (style === "seat-carbon") {
    ctx.fillStyle = "#12171b";
    ctx.fillRect(0, 0, size, size);
    for (let row = -size; row < size * 2; row += 16) {
      ctx.strokeStyle = "rgba(160, 178, 188, 0.22)";
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(row, 0);
      ctx.lineTo(row + size, size);
      ctx.stroke();
      ctx.strokeStyle = "rgba(0, 0, 0, 0.36)";
      ctx.beginPath();
      ctx.moveTo(row + 8, 0);
      ctx.lineTo(row + size + 8, size);
      ctx.stroke();
    }
    for (let row = 0; row < size * 2; row += 16) {
      ctx.strokeStyle = "rgba(8, 10, 12, 0.44)";
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(row, 0);
      ctx.lineTo(row - size, size);
      ctx.stroke();
    }
  } else if (style === "seat-crossed") {
    ctx.fillStyle = "#20262b";
    ctx.fillRect(0, 0, size, size);
    ctx.fillStyle = "#697178";
    for (let x = 0; x < size; x += 38) {
      ctx.fillRect(x, 0, 17, size);
    }
    ctx.fillStyle = "rgba(16, 20, 23, 0.7)";
    for (let y = 0; y < size; y += 38) {
      ctx.fillRect(0, y, size, 17);
    }
    ctx.strokeStyle = "rgba(214, 222, 225, 0.24)";
    ctx.lineWidth = 2;
    for (let x = 1; x < size; x += 38) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, size);
      ctx.stroke();
    }
  } else {
    ctx.fillStyle = "#1b2024";
    ctx.fillRect(0, 0, size, size);
    for (let x = 0; x < size; x += 8) {
      ctx.fillStyle = x % 16 === 0 ? "rgba(154, 164, 169, 0.16)" : "rgba(0, 0, 0, 0.16)";
      ctx.fillRect(x, 0, 3, size);
    }
    for (let y = 0; y < size; y += 8) {
      ctx.fillStyle = y % 16 === 0 ? "rgba(221, 226, 229, 0.1)" : "rgba(0, 0, 0, 0.14)";
      ctx.fillRect(0, y, size, 3);
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(style === "seat-crossed" ? 2 : 3, style === "seat-crossed" ? 2 : 3);
  texture.anisotropy = 4;
  return texture;
}

function buildSeatMaterial(style) {
  const isCarbon = style === "seat-carbon";
  const isCrossed = style === "seat-crossed";
  return new THREE.MeshPhysicalMaterial({
    color: isCrossed ? "#9aa0a4" : isCarbon ? "#20262c" : "#343a3e",
    map: buildSeatTexture(style),
    metalness: isCarbon ? 0.56 : 0.05,
    roughness: isCarbon ? 0.2 : isCrossed ? 0.52 : 0.67,
    clearcoat: isCarbon ? 0.45 : 0.06,
    clearcoatRoughness: isCarbon ? 0.14 : 0.35,
    side: THREE.DoubleSide,
  });
}

function buildFootrestPlateMaterial(style) {
  const isCarbon = style === "foot-carbon";
  const isMetal = style === "foot-magnesium" || style === "foot-aluminium";
  return new THREE.MeshPhysicalMaterial({
    color: isMetal ? "#16191d" : isCarbon ? "#15191d" : "#111315",
    roughness: isMetal ? 0.24 : isCarbon ? 0.28 : 0.52,
    metalness: isMetal ? 0.62 : isCarbon ? 0.32 : 0.03,
    clearcoat: isMetal ? 0.32 : isCarbon ? 0.22 : 0.06,
    clearcoatRoughness: 0.2,
    side: THREE.DoubleSide,
  });
}

function buildBlackFabricMaterial() {
  return new THREE.MeshPhysicalMaterial({
    color: "#171b1e",
    map: buildSeatTexture("seat-std"),
    metalness: 0,
    roughness: 0.76,
    clearcoat: 0,
    side: THREE.DoubleSide,
  });
}

function buildSideguardMaterial(style) {
  const isCarbon = style === "sg-carbon-straight" || style === "sg-carbon-mudguard";
  return new THREE.MeshPhysicalMaterial({
    color: isCarbon ? "#1a1f24" : "#101214",
    map: isCarbon ? buildSeatTexture("seat-carbon") : null,
    metalness: isCarbon ? 0.42 : 0.03,
    roughness: isCarbon ? 0.24 : 0.48,
    clearcoat: isCarbon ? 0.34 : 0.08,
    clearcoatRoughness: isCarbon ? 0.14 : 0.26,
    side: THREE.DoubleSide,
  });
}

function buildStudioEnvironment(renderer) {
  const pmrem = new THREE.PMREMGenerator(renderer);
  pmrem.compileEquirectangularShader();

  const envScene = new THREE.Scene();
  envScene.background = new THREE.Color(0x0b1220);

  const makePanel = (width, height, color, intensity, position, rotation) => {
    const panelColor = new THREE.Color(color).multiplyScalar(intensity);
    const mesh = new THREE.Mesh(
      new THREE.PlaneGeometry(width, height),
      new THREE.MeshBasicMaterial({
        color: panelColor,
        toneMapped: false,
      })
    );
    mesh.position.copy(position);
    mesh.rotation.set(rotation.x, rotation.y, rotation.z);
    envScene.add(mesh);
  };

  makePanel(8, 8, 0xf8fbff, 1.1, new THREE.Vector3(0, 4.5, -2), new THREE.Euler(-0.65, 0, 0));
  makePanel(5, 7, 0xffffff, 0.9, new THREE.Vector3(4.2, 2.2, 1.6), new THREE.Euler(0, -1.05, 0));
  makePanel(4, 6, 0xd7e5ff, 0.72, new THREE.Vector3(-3.8, 1.8, 2.6), new THREE.Euler(0, 0.92, 0));
  makePanel(10, 10, 0x0f1728, 0.35, new THREE.Vector3(0, -4, 0), new THREE.Euler(Math.PI / 2, 0, 0));

  const sky = new THREE.HemisphereLight(0xf1f7ff, 0x111827, 1.1);
  envScene.add(sky);

  const key = new THREE.DirectionalLight(0xffffff, 2.4);
  key.position.set(3.2, 5.6, 4.5);
  envScene.add(key);

  const fill = new THREE.DirectionalLight(0xdce8ff, 1.35);
  fill.position.set(-4.8, 2.6, 3.8);
  envScene.add(fill);

  const texture = pmrem.fromScene(envScene, 0.05).texture;
  pmrem.dispose();
  envScene.clear();
  return texture;
}

function isLocalDebugSession() {
  const host = (window.location.hostname || "").toLowerCase();
  return host === "localhost" || host === "127.0.0.1" || window.location.search.includes("debugObjects=1");
}

function getDebugApiBase() {
  return "http://localhost:4181/api/debug-adjustments";
}

function getLocalDebugAdjustmentStorageKey() {
  return "wc_local_object_adjustments_v1";
}

const FRAME_LEFT_WIDTH_TARGETS = new Set(FRAME_WIDTH_GROUPS.left || []);
const FRAME_MIDDLE_WIDTH_TARGETS = new Set(FRAME_WIDTH_GROUPS.middle || []);
const FRAME_RIGHT_WIDTH_TARGETS = new Set(FRAME_WIDTH_GROUPS.right || []);

const FRAME_BASE_SEAT_WIDTH_CM = 40;
const S5_WHEEL_FOOTREST_REFERENCE_SEAT_WIDTH_CM = 36;
const S5_POSITION_REFERENCE_SEAT_DEPTH_ID = "sd-37-5";
const S5_POSITION_REFERENCE_SEAT_WIDTH_ID = "sw-36";
const S5_POSITION_REFERENCE_OBJECTS = new Set([
  "frontCasterLeft",
  "frontCasterRight",
  "footrest",
  "footrestPlate",
]);
// The assembled S5 model was aligned against the 37.5 cm seat-depth setup.
// Keep every non-seat component on this fixed reference geometry.
const S5_SEAT_DEPTH_REFERENCE_CM = 37.5;
const LEGACY_SEAT_DEPTH_REFERENCE_CM = 40;
const FRONT_CASTER_BASE_HALF_SPAN_M = 0.244422;
const FRONT_CASTER_MODEL_OFFSET = {
  x: 0.06020637988906841,
  y: 0.2299719881569695,
  z: -0.32363139354549375,
};
const ADJUSTMENT_IGNORED_SELECTION_KEYS = new Set(["frameMaterial", "frameColor"]);
const LEFT_FORK_LENGTH_TUBE_NAME = "Object_113";
const LEFT_FORK_LENGTH_FOLLOWER_NAMES = ["Object_188", "Object_189"];
const LEFT_FORK_ANGLE_TARGET_NAMES = ["Object_113", "Object_188", "Object_189"];
const LEFT_FORK_PIVOT_HELPER_NAMES = ["Object_188", "Object_189"];
const LEFT_FORK_LONG_EXTENSION_M = 0.03;
const LEFT_FORK_BASE_TUBE_LENGTH_M = 0.492804;
const LEFT_FORK_ANGLE_OVERLAP_90_M = 0.01;
const BUILT_IN_OBJECT_ADJUSTMENTS = [
  {
    sourceModel: "S5",
    selectionKey:
      "accessoryAntitipp=antitipp-none&accessoryTippingHelp=tiphelp-none&accessoryTransitWheels=transit-none&axle=axle-std-stainless&backrestHandles=bh-std-bent&backrestHeight=bh-30-40&backrestTube=bt-std&brake=brake-push-bent&footrestSetting=foot-plastic&frameAngle=fa-100&frameColor=color-green&frameLength=fl-std&frameMaterial=frame-aluminium&frontFork=ff-std&frontWheel=fw-3-solid&handrim=hr-al-silver-22&lateralFrame=lf-std&legLength=ll-38-43&rearWheel=rw-22-12&rearWheelsBar=camber-0&seatDepth=sd-40&seatSetting=seat-std&seatWidth=sw-39&skirtGuards=sg-none&tyre=tyre-pu",
    objectName: "Object_100001",
    position: { x: -0.01, y: 0, z: 0 },
    rotationDeg: { x: 0, y: 0, z: 0 },
  },
  {
    sourceModel: "S5",
    selectionKey:
      "frameAngle=fa-100&frameLength=fl-std",
    objectName: "frontCasterLeft",
    mode: "absolute",
    position: { x: -0.5302156201109316, y: -0.2299719881569695, z: 0.3011313935454938 },
    rotationDeg: { x: 0, y: 0, z: 0 },
  },
  {
    sourceModel: "S5",
    selectionKey:
      "frameAngle=fa-100&frameLength=fl-long",
    objectName: "frontCasterLeft",
    mode: "absolute",
    position: { x: -0.5302156201109316, y: -0.2269719881569695, z: 0.3811313935454938 },
    rotationDeg: { x: 0, y: 0, z: 0 },
  },
    {
      sourceModel: "S5",
      selectionKey:
        "frameAngle=fa-90&frameLength=fl-std",
      objectName: "frontCasterLeft",
      mode: "absolute",
      position: { x: -0.5312156201109316, y: -0.2349719881569695, z: 0.27413139354549375 },
      rotationDeg: { x: 0, y: 0, z: 0 },
    },
    {
      sourceModel: "S5",
      selectionKey:
        "frameAngle=fa-90&frameLength=fl-long",
      objectName: "frontCasterLeft",
      mode: "absolute",
      position: { x: -0.5302156201109316, y: -0.2299719881569695, z: 0.3531313935454938 },
      rotationDeg: { x: 0, y: 0, z: 0 },
    },
  {
    sourceModel: "S5",
    selectionKey:
      "frameAngle=fa-100&frameLength=fl-std",
    objectName: "frontCasterRight",
    mode: "absolute",
    position: { x: -0.07878437988906839, y: -0.2299719881569695, z: 0.3011313935454938 },
    rotationDeg: { x: 0, y: 0, z: 0 },
  },
  {
    sourceModel: "S5",
    selectionKey:
      "frameAngle=fa-100&frameLength=fl-long",
    objectName: "frontCasterRight",
    mode: "absolute",
    position: { x: -0.08178437988906839, y: -0.2269719881569695, z: 0.3811313935454938 },
    rotationDeg: { x: 0, y: 0, z: 0 },
  },
    {
      sourceModel: "S5",
      selectionKey:
        "frameAngle=fa-90&frameLength=fl-std",
      objectName: "frontCasterRight",
      mode: "absolute",
      position: { x: -0.08078437988906839, y: -0.2499719881569695, z: 0.27313139354549375 },
      rotationDeg: { x: 0, y: 0, z: 0 },
    },
    {
      sourceModel: "S5",
      selectionKey:
        "frameAngle=fa-90&frameLength=fl-long",
      objectName: "frontCasterRight",
      mode: "absolute",
      position: { x: -0.08078437988906839, y: -0.2299719881569695, z: 0.3531313935454938 },
      rotationDeg: { x: 0, y: 0, z: 0 },
    },
    {
      sourceModel: "S5",
      selectionKey:
        "frameAngle=fa-90&frameLength=fl-std",
      objectName: "footrest",
      mode: "absolute",
      position: { x: -0.03, y: -0.057, z: 0.092 },
      rotationDeg: { x: 0, y: 0, z: 0 },
    },
    {
      sourceModel: "S5",
      selectionKey:
        "frameAngle=fa-90&frameLength=fl-long",
      objectName: "footrest",
      mode: "absolute",
      position: { x: -0.04, y: -0.033, z: 0.142 },
      rotationDeg: { x: 0, y: 0, z: 0 },
    },
    {
      sourceModel: "S5",
      selectionKey:
        "frameAngle=fa-100&frameLength=fl-std",
      objectName: "footrest",
      mode: "absolute",
      position: { x: -0.03, y: 0, z: 0.028 },
      rotationDeg: { x: 0, y: 0, z: 0 },
    },
    {
      sourceModel: "S5",
      selectionKey:
        "frameAngle=fa-100&frameLength=fl-long",
      objectName: "footrest",
      mode: "absolute",
      position: { x: -0.03, y: 0.005, z: 0.079 },
      rotationDeg: { x: 0, y: 0, z: 0 },
    },
];

// Final fit values for the separate footrest plate. Deliberately keyed only by
// front angle and frame length, so changing plate material never moves it.
const FOOTREST_PLATE_FINAL_ADJUSTMENTS = [
  {
    sourceModel: "S5",
    selectionKey: "frameAngle=fa-100&frameLength=fl-std",
    objectName: "footrestPlate",
    mode: "delta",
    position: { x: -0.03, y: 0, z: -0.93 },
    rotationDeg: { x: 0, y: 0, z: 0 },
  },
  {
    sourceModel: "S5",
    selectionKey: "frameAngle=fa-100&frameLength=fl-long",
    objectName: "footrestPlate",
    mode: "delta",
    position: { x: -0.03, y: 0.003, z: -0.876 },
    rotationDeg: { x: 0, y: 0, z: 0 },
  },
  {
    sourceModel: "S5",
    selectionKey: "frameAngle=fa-90&frameLength=fl-std",
    objectName: "footrestPlate",
    mode: "delta",
    position: { x: -0.03, y: -0.018, z: -0.975 },
    rotationDeg: { x: 10, y: 0, z: 0 },
  },
  {
    sourceModel: "S5",
    selectionKey: "frameAngle=fa-90&frameLength=fl-long",
    objectName: "footrestPlate",
    mode: "delta",
    position: { x: -0.03, y: 0.004, z: -0.926 },
    rotationDeg: { x: 10, y: 0, z: 0 },
  },
];

// Verified reference fit: seat width 36 cm, seat depth 37.5 cm. These values
// deliberately omit seat width/depth so wheels and footrest retain the same
// placement while the seat itself is resized.
const S5_WHEEL_FOOTREST_REFERENCE_ADJUSTMENTS = [
  ["fa-100", "fl-std", "frontCasterLeft", -0.366, 0, -0.04],
  ["fa-100", "fl-std", "frontCasterRight", -0.243, 0, -0.04],
  ["fa-90", "fl-std", "frontCasterLeft", -0.367, -0.005, -0.067],
  ["fa-90", "fl-std", "frontCasterRight", -0.245, -0.02, -0.068],
  ["fa-100", "fl-long", "frontCasterLeft", -0.366, 0.003, 0.01],
  ["fa-100", "fl-long", "frontCasterRight", -0.246, 0.003, 0.01],
  ["fa-90", "fl-long", "frontCasterLeft", -0.366, 0, -0.018],
  ["fa-90", "fl-long", "frontCasterRight", -0.245, 0, -0.018],
  ["fa-100", "fl-std", "footrest", -0.03, 0, 0.028],
  ["fa-100", "fl-long", "footrest", -0.03, 0.005, 0.079],
  ["fa-90", "fl-std", "footrest", -0.03, -0.057, 0.092],
  ["fa-90", "fl-long", "footrest", -0.04, -0.033, 0.142],
  ["fa-100", "fl-std", "footrestPlate", -0.004, 0, -0.96],
  ["fa-100", "fl-long", "footrestPlate", 0.01, 0.003, -0.906],
  ["fa-90", "fl-std", "footrestPlate", 0, -0.018, -1.005],
  ["fa-90", "fl-long", "footrestPlate", 0, 0.007, -0.956],
].map(([frameAngle, frameLength, objectName, x, y, z]) => ({
  sourceModel: "S5",
  selectionKey: `frameAngle=${frameAngle}&frameLength=${frameLength}`,
  objectName,
  mode: "delta",
  position: { x, y, z },
  rotationDeg: {
    x: objectName === "footrestPlate" && frameAngle === "fa-90" ? 10 : 0,
    y: 0,
    z: 0,
  },
}));

// Values approved in the local configurator. These are part of the production
// assembly definition and must not depend on localhost debug logs.
const S5_FINAL_PUBLIC_OBJECT_ADJUSTMENTS = [
  {
    sourceModel: "S5",
    selectionKey: "",
    objectName: "sideguardLeft",
    mode: "delta",
    position: { x: -0.118, y: -0.154, z: 0.346 },
    rotationDeg: { x: 0, y: 0, z: 0 },
  },
  {
    sourceModel: "S5",
    selectionKey: "",
    objectName: "sideguardRight",
    mode: "delta",
    position: { x: -0.488, y: -0.153, z: 0.345 },
    rotationDeg: { x: 0, y: 0, z: 0 },
  },
  {
    sourceModel: "S5",
    selectionKey: "frameAngle=fa-100&frameLength=fl-std",
    objectName: "footrestPlate",
    mode: "absolute",
    position: { x: -0.024, y: 0, z: -0.92 },
    rotationDeg: { x: 0, y: 0, z: 0 },
  },
  {
    sourceModel: "S5",
    selectionKey: "frameAngle=fa-100&frameLength=fl-long",
    objectName: "footrestPlate",
    mode: "absolute",
    position: { x: -0.03, y: 0.003, z: -0.876 },
    rotationDeg: { x: 0, y: 0, z: 0 },
  },
  {
    sourceModel: "S5",
    selectionKey: "frameAngle=fa-90&frameLength=fl-std",
    objectName: "footrestPlate",
    mode: "absolute",
    position: { x: -0.026, y: 0.2108, z: -0.919 },
    rotationDeg: { x: 10, y: 0, z: 0 },
  },
  {
    sourceModel: "S5",
    selectionKey: "frameAngle=fa-90&frameLength=fl-long",
    objectName: "footrestPlate",
    mode: "absolute",
    position: { x: -0.03, y: 0.2358, z: -0.87 },
    rotationDeg: { x: 10, y: 0, z: 0 },
  },
];

export function mountRuntimeModelViewer(container) {
  return new RuntimeModelViewer(container);
}

function cloneMaterialInstance(material) {
  return material && material.clone ? material.clone() : material;
}

function cloneSceneForUse(scene) {
  const clone = scene.clone(true);
  clone.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) {
      return;
    }
    if (Array.isArray(child.material)) {
      child.material = child.material.map((material) => cloneMaterialInstance(material));
      return;
    }
    child.material = cloneMaterialInstance(child.material);
  });
  return clone;
}

class RuntimeModelViewer {
  constructor(container) {
    this.container = container;
    this.root = null;
    this.statusNode = null;
    this.objectDebugPanel = null;
    this.objectDebugSelect = null;
    this.objectDebugValueNode = null;
    this.objectDebugStatusNode = null;
    this.objectDebugTargetName = "";
    this.objectDebugDragHandle = null;
    this.objectDebugDragState = null;
    this.debugPanel = null;
    this.debugValueNode = null;
    this.debugFrontCasterPanel = null;
    this.debugFrontCasterValueNode = null;
    this.debugFootrestPanel = null;
    this.debugFootrestValueNode = null;
    this.renderer = null;
    this.scene = null;
    this.camera = null;
    this.controls = null;
    this.axesScene = null;
    this.axesCamera = null;
    this.axesHelper = null;
    this.axesVisible = true;
    this.axesToggleButton = null;
    this.axesLabelLayer = null;
    this.axesLabelNodes = null;
    this.raycaster = null;
    this.pointerNdc = null;
    this.debugPickState = null;
    this.modelRoot = null;
    this.dracoLoader = null;
    this.resizeObserver = null;
    this.animationId = 0;
    this.colorTargets = [];
    this.partObjects = [];
    this.glbCache = new Map();
    this.glbPreloadPromises = new Map();
    this.loadToken = 0;
    this.signature = "";
    this.partsSignature = "";
    this.currentSourceModel = "";
    this.transitions = [];
    this.lastSourceModel = "";
    this.lastSelection = {};
    this.lastFrameColor = "";
    this.manualAdjustmentEntries = [];
    this.manualAdjustmentsLoaded = false;
    this.manualAdjustmentsLoadingPromise = null;
    this.debugFrame90Adjust = {
      rotationDeg: 8,
      x: 0.0001,
      y: -0.0223,
      z: -0.0621,
    };
    this.debugFrame100Adjust = {
      rotationDeg: 0,
      x: 0,
      y: 0,
      z: 0,
    };
    this.debugFrontCaster90Adjust = {
      rotationDeg: 7,
      x: 0,
      y: 0.036,
      z: -0.039,
    };
    this.debugFootrest90Adjust = {
      rotationDeg: -0.5,
      x: 0,
      y: 0.02,
      z: 0.035,
    };
    this.init();
  }

  init() {
    this.container.style.position = this.container.style.position || "relative";

    Array.from(this.container.children).forEach((child) => {
      if (!(child instanceof HTMLElement)) {
        return;
      }
      if (child.classList.contains("wc-mobile-viewer-corner-toggle")) {
        return;
      }
      child.classList.add("wc-hidden-source");
      child.setAttribute("aria-hidden", "true");
      child.style.display = "none";
      child.querySelectorAll("canvas").forEach((canvas) => {
        if (canvas instanceof HTMLCanvasElement) {
          canvas.style.display = "none";
        }
      });
    });

    const root = document.createElement("div");
    root.className = "wc-runtime-model-viewer";
    root.style.position = "absolute";
    root.style.inset = "0";
    root.style.zIndex = "1";
    root.style.background = "#e8eef3";
    root.style.overflow = "visible";
    this.container.style.overflow = "visible";

    const statusNode = document.createElement("div");
    statusNode.className = "wc-runtime-model-status";
    statusNode.style.position = "absolute";
    statusNode.style.left = "50%";
    statusNode.style.top = "50%";
    statusNode.style.transform = "translate(-50%, -50%)";
    statusNode.style.color = "rgba(33, 48, 68, 0.78)";
    statusNode.style.fontSize = isMobileViewport() ? "14px" : "15px";
    statusNode.style.pointerEvents = "none";
    statusNode.style.textAlign = "center";
    statusNode.style.display = "none";

    root.appendChild(statusNode);
    root.appendChild(this.createAxesToggleButton());
    root.appendChild(this.createAxesLabelLayer());
    root.appendChild(this.createDraggableObjectDebugPanel());
    this.container.appendChild(root);

    this.root = root;
    this.statusNode = statusNode;

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(45, 1, 0.01, 1000);
    this.camera.position.set(2, 2, 2);

    this.renderer = new THREE.WebGLRenderer({
      antialias: !isMobileViewport(),
      alpha: false,
      powerPreference: "high-performance",
    });
    this.renderer.domElement.className = `${this.renderer.domElement.className} wc-runtime-canvas`.trim();
    this.renderer.domElement.setAttribute("data-runtime-canvas", "true");
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.14;
    this.renderer.setPixelRatio(getRendererPixelRatio());
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    this.root.appendChild(this.renderer.domElement);

    this.scene.background = new THREE.Color(0xe8eef3);
    this.environmentMap = buildStudioEnvironment(this.renderer);
    this.scene.environment = this.environmentMap;

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.06;
    this.controls.target.set(0, 0.55, 0);
    this.controls.update();
    this.raycaster = new THREE.Raycaster();
    this.pointerNdc = new THREE.Vector2();
    this.bindDebugObjectPicking();

    const ambient = new THREE.AmbientLight(0xffffff, 0.58);
    this.scene.add(ambient);

    const hemi = new THREE.HemisphereLight(0xffffff, 0x93a4b5, 1.0);
    hemi.position.set(0, 8, 0);
    this.scene.add(hemi);

    const dir = new THREE.DirectionalLight(0xffffff, 1.35);
    dir.position.set(4.8, 6.2, 5.1);
    this.scene.add(dir);

    const fill = new THREE.DirectionalLight(0xdce8ff, 0.58);
    fill.position.set(-4.6, 4.5, -1.8);
    this.scene.add(fill);

    const rim = new THREE.DirectionalLight(0xffffff, 0.62);
    rim.position.set(-2.2, 2.8, 6.8);
    this.scene.add(rim);

    const grid = new THREE.GridHelper(4, 20, 0x7790a9, 0xb4c3d0);
    grid.material.opacity = 0.62;
    grid.material.transparent = true;
    this.scene.add(grid);

    this.initAxesOverlay();

    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(this.container);
    this.animate();
  }

  createAxesToggleButton() {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "wc-runtime-axes-toggle";
    button.textContent = "XYZ";
    button.setAttribute("aria-label", "切换3D坐标显示");
    Object.assign(button.style, {
      position: "absolute",
      left: "12px",
      top: "50%",
      transform: "translateY(-50%)",
      zIndex: "7",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      width: "40px",
      height: "88px",
      borderRadius: "14px",
      border: "1px solid rgba(120, 154, 219, 0.38)",
      background: "rgba(10, 18, 34, 0.88)",
      color: "rgba(236, 244, 255, 0.94)",
      fontSize: "12px",
      fontWeight: "700",
      letterSpacing: "0.08em",
      writingMode: "vertical-rl",
      textOrientation: "mixed",
      cursor: "pointer",
      userSelect: "none",
      boxShadow: "0 10px 24px rgba(0, 0, 0, 0.26)",
      backdropFilter: "blur(10px)",
      WebkitBackdropFilter: "blur(10px)",
    });
    button.addEventListener("click", () => {
      this.axesVisible = !this.axesVisible;
      this.syncAxesToggleButton();
    });
    this.axesToggleButton = button;
    this.syncAxesToggleButton();
    return button;
  }

  syncAxesToggleButton() {
    if (!this.axesToggleButton) return;
    this.axesToggleButton.textContent = this.axesVisible ? "XYZ" : "坐标";
    this.axesToggleButton.style.opacity = this.axesVisible ? "1" : "0.7";
    this.axesToggleButton.style.borderColor = this.axesVisible
      ? "rgba(255, 174, 44, 0.72)"
      : "rgba(120, 154, 219, 0.38)";
    if (this.axesLabelLayer) {
      this.axesLabelLayer.style.display = this.axesVisible ? "block" : "none";
    }
  }

  createAxesLabelLayer() {
    const layer = document.createElement("div");
    layer.className = "wc-runtime-axes-labels";
    Object.assign(layer.style, {
      position: "absolute",
      inset: "0",
      pointerEvents: "none",
      zIndex: "6",
      display: this.axesVisible ? "block" : "none",
    });

    const createLabel = (text, color) => {
      const node = document.createElement("div");
      node.textContent = text;
      Object.assign(node.style, {
        position: "absolute",
        minWidth: "16px",
        height: "16px",
        padding: "0 4px",
        borderRadius: "999px",
        background: "rgba(8, 13, 24, 0.92)",
        border: `1px solid ${color}`,
        color,
        fontSize: "10px",
        fontWeight: "700",
        lineHeight: "14px",
        textAlign: "center",
        boxShadow: "0 4px 10px rgba(0, 0, 0, 0.24)",
        transform: "translate(-50%, -50%)",
      });
      layer.appendChild(node);
      return node;
    };

    this.axesLabelLayer = layer;
    this.axesLabelNodes = {
      x: createLabel("X", "#f4b000"),
      y: createLabel("Y", "#8aff47"),
      z: createLabel("Z", "#49b7ff"),
    };
    return layer;
  }

  initAxesOverlay() {
    this.axesScene = new THREE.Scene();
    this.axesCamera = new THREE.PerspectiveCamera(50, 1, 0.1, 10);
    this.axesCamera.position.set(0, 0, 2.2);
    this.axesHelper = new THREE.AxesHelper(0.8);
    this.axesScene.add(this.axesHelper);
    const ambient = new THREE.AmbientLight(0xffffff, 1);
    this.axesScene.add(ambient);
  }

  renderAxesOverlay() {
    if (!this.axesVisible || !this.renderer || !this.camera || !this.axesScene || !this.axesCamera || !this.axesHelper) {
      return;
    }
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    if (!width || !height) return;
    const size = Math.max(72, Math.min(118, Math.round(Math.min(width, height) * 0.16)));
    const offset = 18;
    const viewportX = offset;
    const viewportY = Math.max(12, Math.round(height * 0.12));

    this.axesHelper.quaternion.copy(this.camera.quaternion).invert();
    this.axesCamera.aspect = 1;
    this.axesCamera.updateProjectionMatrix();

    this.renderer.autoClear = false;
    this.renderer.clearDepth();
    this.renderer.setViewport(viewportX, viewportY, size, size);
    this.renderer.setScissor(viewportX, viewportY, size, size);
    this.renderer.setScissorTest(true);
    this.renderer.render(this.axesScene, this.axesCamera);
    this.renderer.setScissorTest(false);
    this.renderer.setViewport(0, 0, width, height);
    this.renderer.autoClear = true;
    this.updateAxesLabels(viewportX, viewportY, size);
  }

  updateAxesLabels(viewportX, viewportY, size) {
    if (!this.axesVisible || !this.axesLabelNodes || !this.axesHelper || !this.axesCamera) {
      return;
    }
    const helperQuaternion = this.axesHelper.quaternion.clone();
    const projectAxis = (vector, node) => {
      const projected = vector.clone().applyQuaternion(helperQuaternion).project(this.axesCamera);
      const x = viewportX + ((projected.x + 1) * 0.5) * size;
      const y = this.container.clientHeight - (viewportY + ((projected.y + 1) * 0.5) * size);
      node.style.left = `${x}px`;
      node.style.top = `${y}px`;
    };

    projectAxis(new THREE.Vector3(1.15, 0, 0), this.axesLabelNodes.x);
    projectAxis(new THREE.Vector3(0, 1.15, 0), this.axesLabelNodes.y);
    projectAxis(new THREE.Vector3(0, 0, 1.15), this.axesLabelNodes.z);
  }

  isDebugApiEnabled() {
    return isLocalDebugSession() && (window.location.protocol === "http:" || window.location.protocol === "https:");
  }

  buildSelectionKey(selection) {
    const source = selection && typeof selection === "object" ? selection : {};
    return Object.keys(source)
      .sort()
      .map((key) => `${key}=${source[key]}`)
      .join("&");
  }

  normalizeAdjustmentSelectionKey(selectionOrKey) {
    const source =
      typeof selectionOrKey === "string"
        ? selectionOrKey
            .split("&")
            .map((entry) => entry.split("="))
            .reduce((acc, [key, value]) => {
              if (key) {
                acc[key] = value || "";
              }
              return acc;
            }, {})
        : selectionOrKey && typeof selectionOrKey === "object"
          ? selectionOrKey
          : {};

    return Object.keys(source)
      .filter((key) => !ADJUSTMENT_IGNORED_SELECTION_KEYS.has(key))
      .sort()
      .map((key) => `${key}=${source[key]}`)
      .join("&");
  }

  parseAdjustmentSelectionPairs(selectionOrKey) {
    const normalized = this.normalizeAdjustmentSelectionKey(selectionOrKey);
    if (!normalized) {
      return [];
    }
    return normalized
      .split("&")
      .map((entry) => entry.split("="))
      .filter(([key]) => Boolean(key))
      .map(([key, value]) => [key, value || ""]);
  }

  getAdjustmentSelectionSpecificity(selectionOrKey) {
    return this.parseAdjustmentSelectionPairs(selectionOrKey).length;
  }

  doesAdjustmentMatchSelection(entrySelectionKey, activeSelection) {
    const requiredPairs = this.parseAdjustmentSelectionPairs(entrySelectionKey);
    if (!requiredPairs.length) {
      return true;
    }
    const activePairs = new Map(this.parseAdjustmentSelectionPairs(activeSelection));
    return requiredPairs.every(([key, value]) => activePairs.get(key) === value);
  }

  getAdjustmentEntryId(sourceModel, selectionKey, objectName) {
    return [sourceModel || "", this.normalizeAdjustmentSelectionKey(selectionKey), objectName || ""].join("::");
  }

  normalizeAdjustmentEntry(entry) {
    const source = entry && typeof entry === "object" ? entry : {};
    return {
      sourceModel: source.sourceModel || "",
      selectionKey: this.normalizeAdjustmentSelectionKey(source.selectionKey || ""),
      objectName: source.objectName || "",
      mode: source.mode === "absolute" ? "absolute" : "delta",
      position: {
        x: Number((((source.position || {}).x) || 0).toFixed(4)),
        y: Number((((source.position || {}).y) || 0).toFixed(4)),
        z: Number((((source.position || {}).z) || 0).toFixed(4)),
      },
      rotationDeg: {
        x: Number((((source.rotationDeg || {}).x) || 0).toFixed(2)),
        y: Number((((source.rotationDeg || {}).y) || 0).toFixed(2)),
        z: Number((((source.rotationDeg || {}).z) || 0).toFixed(2)),
      },
      updatedAt: source.updatedAt || "",
    };
  }

  readLocalManualAdjustments() {
    try {
      const raw = window.localStorage.getItem(getLocalDebugAdjustmentStorageKey());
      if (!raw) {
        return [];
      }
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed.map((entry) => this.normalizeAdjustmentEntry(entry)) : [];
    } catch (error) {
      console.warn("Read local manual adjustments failed", error);
      return [];
    }
  }

  writeLocalManualAdjustments(entries) {
    if (!isLocalDebugSession()) {
      return;
    }
    try {
      const normalized = Array.isArray(entries) ? entries.map((entry) => this.normalizeAdjustmentEntry(entry)) : [];
      window.localStorage.setItem(getLocalDebugAdjustmentStorageKey(), JSON.stringify(normalized));
    } catch (error) {
      console.warn("Write local manual adjustments failed", error);
    }
  }

  upsertManualAdjustmentEntry(entry) {
    const normalized = this.normalizeAdjustmentEntry(entry);
    const normalizedId = this.getAdjustmentEntryId(
      normalized.sourceModel,
      normalized.selectionKey,
      normalized.objectName
    );
    const next = this.manualAdjustmentEntries
      .filter(
        (item) =>
          this.getAdjustmentEntryId(item.sourceModel, item.selectionKey, item.objectName) !== normalizedId
      )
      .concat(normalized);
    this.manualAdjustmentEntries = next;
    this.manualAdjustmentsLoaded = true;
    this.writeLocalManualAdjustments(next);
    return normalized;
  }

  mergeManualAdjustmentEntries(remoteEntries, protectedEntry = null) {
    const merged = new Map();
    const add = (entry) => {
      const normalized = this.normalizeAdjustmentEntry(entry);
      const id = this.getAdjustmentEntryId(
        normalized.sourceModel,
        normalized.selectionKey,
        normalized.objectName
      );
      const current = merged.get(id);
      const currentTime = Date.parse(current && current.updatedAt ? current.updatedAt : "") || 0;
      const nextTime = Date.parse(normalized.updatedAt || "") || 0;
      if (!current || nextTime >= currentTime) {
        merged.set(id, normalized);
      }
    };

    (Array.isArray(remoteEntries) ? remoteEntries : []).forEach(add);
    (Array.isArray(this.manualAdjustmentEntries) ? this.manualAdjustmentEntries : []).forEach(add);
    if (protectedEntry) {
      // A just-saved value must never be replaced by a stale API response.
      const normalized = this.normalizeAdjustmentEntry(protectedEntry);
      const id = this.getAdjustmentEntryId(
        normalized.sourceModel,
        normalized.selectionKey,
        normalized.objectName
      );
      merged.set(id, normalized);
    }
    return Array.from(merged.values());
  }

  removeManualAdjustmentEntry(entry) {
    const entryId = this.getAdjustmentEntryId(entry.sourceModel, entry.selectionKey, entry.objectName);
    const next = this.manualAdjustmentEntries.filter(
      (item) => this.getAdjustmentEntryId(item.sourceModel, item.selectionKey, item.objectName) !== entryId
    );
    this.manualAdjustmentEntries = next;
    this.manualAdjustmentsLoaded = true;
    this.writeLocalManualAdjustments(next);
  }

  async ensureManualAdjustmentsLoaded(force = false) {
    if (!isLocalDebugSession()) {
      this.manualAdjustmentEntries = [];
      this.manualAdjustmentsLoaded = true;
      return;
    }
    if (!this.isDebugApiEnabled()) {
      this.manualAdjustmentEntries = this.readLocalManualAdjustments();
      this.manualAdjustmentsLoaded = true;
      return;
    }
    if (this.manualAdjustmentsLoaded && !force) {
      return;
    }
    if (this.manualAdjustmentsLoadingPromise && !force) {
      return this.manualAdjustmentsLoadingPromise;
    }

    this.setObjectDebugStatus("读取本地调试日志中...");
    this.manualAdjustmentsLoadingPromise = fetch(`${getDebugApiBase()}/current`, {
      method: "GET",
      cache: "no-store",
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`Debug API ${response.status}`);
        }
        return response.json();
      })
      .then((payload) => {
        const entries = Array.isArray(payload && payload.entries) ? payload.entries : [];
        this.manualAdjustmentEntries = this.mergeManualAdjustmentEntries(entries);
        this.manualAdjustmentsLoaded = true;
        this.writeLocalManualAdjustments(this.manualAdjustmentEntries);
        this.setObjectDebugStatus(`已载入 ${this.manualAdjustmentEntries.length} 条调试记录`);
      })
      .catch((error) => {
        console.warn("Manual adjustment log unavailable", error);
        this.manualAdjustmentEntries = this.readLocalManualAdjustments();
        this.manualAdjustmentsLoaded = true;
        this.setObjectDebugStatus(
          this.manualAdjustmentEntries.length
            ? `日志未连接，已载入本地 ${this.manualAdjustmentEntries.length} 条调试记录`
            : "本地调试日志未连接"
        );
      })
      .finally(() => {
        this.manualAdjustmentsLoadingPromise = null;
      });

    return this.manualAdjustmentsLoadingPromise;
  }

  getCurrentObjectAdjustmentEntry() {
    const objectName = this.objectDebugTargetName || "";
    if (!objectName) {
      return null;
    }
    const sourceModel = this.lastSourceModel || this.currentSourceModel || "";
    const selectionKey = this.normalizeAdjustmentSelectionKey(this.lastSelection || {});
    const entryId = this.getAdjustmentEntryId(sourceModel, selectionKey, objectName);
    return (
      this.manualAdjustmentEntries.find(
        (entry) =>
          this.getAdjustmentEntryId(entry.sourceModel, entry.selectionKey, entry.objectName) === entryId
      ) || null
    );
  }

  ensureCurrentObjectAdjustmentEntry() {
    const sourceModel = this.lastSourceModel || this.currentSourceModel || "";
    const selectionKey = this.normalizeAdjustmentSelectionKey(this.lastSelection || {});
    const objectName = this.objectDebugTargetName || "";
    if (!objectName) {
      return null;
    }
    const entryId = this.getAdjustmentEntryId(sourceModel, selectionKey, objectName);
    let entry = this.manualAdjustmentEntries.find(
      (item) => this.getAdjustmentEntryId(item.sourceModel, item.selectionKey, item.objectName) === entryId
    );
    if (!entry) {
      // Preserve any less-specific preview delta when creating the first
      // per-configuration adjustment, so the part does not jump on first edit.
      const inherited = this.getResolvedObjectAdjustments(this.lastSelection || {}).get(objectName);
      entry = this.normalizeAdjustmentEntry({
        sourceModel,
        selectionKey,
        objectName,
        position: inherited && inherited.mode === "delta" ? inherited.position : undefined,
        rotationDeg: inherited && inherited.mode === "delta" ? inherited.rotationDeg : undefined,
      });
      this.manualAdjustmentEntries.push(entry);
    }
    return entry;
  }

  getAdjustablePartEntries() {
    return this.partObjects
      .filter((entry) => entry && entry.key && entry.object)
      .slice()
      .sort((a, b) => (a.key || "").localeCompare(b.key || ""));
  }

  buildAdjustableObjectKey(partKey, meshName) {
    return partKey || meshName || "";
  }

  parseAdjustableObjectKey(objectKey) {
    const value = objectKey || "";
    return {
      partKey: value,
      meshName: "",
    };
  }

  getAdjustableLabel(key) {
    const { partKey } = this.parseAdjustableObjectKey(key);
    const entry = this.partObjects.find((item) => item && item.key === partKey);
    const src = entry && entry.src ? entry.src : "";
    const fileName = src.split("/").pop() || partKey || "";
    return fileName || key || "";
  }

  getPartEntryByObjectName(objectName) {
    return this.partObjects.find((entry) => entry && entry.key === objectName) || null;
  }

  getFrameCenterWorldX() {
    const leftFrame = this.getPartEntryByObjectName("frame-left-body");
    const rightFrame = this.getPartEntryByObjectName("frame-right-body");
    if (leftFrame && leftFrame.object && rightFrame && rightFrame.object) {
      leftFrame.object.updateWorldMatrix(true, true);
      rightFrame.object.updateWorldMatrix(true, true);
      const leftCenter = new THREE.Box3()
        .setFromObject(leftFrame.object)
        .getCenter(new THREE.Vector3());
      const rightCenter = new THREE.Box3()
        .setFromObject(rightFrame.object)
        .getCenter(new THREE.Vector3());
      return (leftCenter.x + rightCenter.x) * 0.5;
    }

    const middleFrame = this.getPartEntryByObjectName("frame-middle");
    if (middleFrame && middleFrame.object) {
      middleFrame.object.updateWorldMatrix(true, true);
      const box = new THREE.Box3().setFromObject(middleFrame.object);
      if (!box.isEmpty()) {
        return box.getCenter(new THREE.Vector3()).x;
      }
    }

    return null;
  }

  translateObjectAlongWorldX(object, distance) {
    if (!object || !Number.isFinite(distance) || Math.abs(distance) < 1e-8) {
      return;
    }

    if (!object.parent) {
      object.position.x += distance;
      object.updateWorldMatrix(true, true);
      return;
    }

    object.parent.updateWorldMatrix(true, false);
    const worldOrigin = object.parent.localToWorld(new THREE.Vector3());
    const worldTarget = worldOrigin.clone().add(new THREE.Vector3(distance, 0, 0));
    const localOrigin = object.parent.worldToLocal(worldOrigin.clone());
    const localTarget = object.parent.worldToLocal(worldTarget);
    object.position.add(localTarget.sub(localOrigin));
    object.updateWorldMatrix(true, true);
  }

  alignCenteredFootrestAssembly() {
    const targetCenterX = this.getFrameCenterWorldX();
    if (!Number.isFinite(targetCenterX)) {
      return;
    }

    ["footrest", "footrestPlate"].forEach((partKey) => {
      const entry = this.getPartEntryByObjectName(partKey);
      const object = entry && entry.object;
      if (!object || object.visible === false) {
        return;
      }

      object.updateWorldMatrix(true, true);
      const box = new THREE.Box3().setFromObject(object);
      if (box.isEmpty()) {
        return;
      }
      const objectCenterX = box.getCenter(new THREE.Vector3()).x;
      this.translateObjectAlongWorldX(object, targetCenterX - objectCenterX);
    });
  }

  alignCenteredBackrest() {
    const targetCenterX = this.getFrameCenterWorldX();
    const entry = this.getPartEntryByObjectName("backrest");
    const object = entry && entry.object;
    if (!Number.isFinite(targetCenterX) || !object || object.visible === false) {
      return;
    }

    object.updateWorldMatrix(true, true);
    const box = new THREE.Box3().setFromObject(object);
    if (box.isEmpty()) {
      return;
    }
    const objectCenterX = box.getCenter(new THREE.Vector3()).x;
    this.translateObjectAlongWorldX(object, targetCenterX - objectCenterX);
  }

  resolveAdjustableObjectKeyFromObject(object) {
    let current = object || null;
    while (current) {
      if (current.userData && current.userData.partKey) {
        return this.buildAdjustableObjectKey(current.userData.partKey, "");
      }
      current = current.parent || null;
    }
    return "";
  }

  getAdjustableObjectNames() {
    return this.getAdjustablePartEntries()
      .map((entry) => entry.key)
      .sort((a, b) => a.localeCompare(b));
  }

  getObjectsByAdjustableName(objectName) {
    const { partKey } = this.parseAdjustableObjectKey(objectName);
    const entry = this.getPartEntryByObjectName(partKey);
    return entry && entry.object ? [entry.object] : [];
  }

  resetManualAdjustmentsOnObjects() {
    if (!this.modelRoot) {
      return;
    }
    this.modelRoot.traverse((child) => {
      if (!child || !child.userData) {
        return;
      }
      if (child.userData.baseManualAdjustPosition) {
        child.position.copy(child.userData.baseManualAdjustPosition);
      }
      if (child.userData.baseManualAdjustRotation) {
        child.rotation.copy(child.userData.baseManualAdjustRotation);
      }
    });
  }

  getManualRotationPivotLocal(object) {
    if (!object) {
      return new THREE.Vector3();
    }
    if (object.userData.manualRotationPivotLocal) {
      return object.userData.manualRotationPivotLocal.clone();
    }
    object.updateWorldMatrix(true, true);
    const centerWorld = new THREE.Box3().setFromObject(object).getCenter(new THREE.Vector3());
    const centerLocal = object.worldToLocal(centerWorld.clone());
    object.userData.manualRotationPivotLocal = centerLocal.clone();
    return centerLocal;
  }

  applyRotationAroundGeometryCenter(object, basePosition, baseRotation, targetRotation) {
    const pivot = this.getManualRotationPivotLocal(object).multiply(object.scale);
    const baseQuaternion = new THREE.Quaternion().setFromEuler(baseRotation);
    const targetQuaternion = new THREE.Quaternion().setFromEuler(targetRotation);
    const basePivotPosition = pivot.clone().applyQuaternion(baseQuaternion);
    const targetPivotPosition = pivot.clone().applyQuaternion(targetQuaternion);

    object.rotation.copy(targetRotation);
    object.position.copy(basePosition).add(basePivotPosition).sub(targetPivotPosition);
  }

  applyManualObjectAdjustments(selection) {
    if (!this.modelRoot) {
      return;
    }

    this.resetManualAdjustmentsOnObjects();

    const sourceModel = this.lastSourceModel || this.currentSourceModel || "";
    const selectionKey = this.normalizeAdjustmentSelectionKey(selection || this.lastSelection || {});
    const relevantEntries = [
      ...[
        ...BUILT_IN_OBJECT_ADJUSTMENTS,
        ...FOOTREST_PLATE_FINAL_ADJUSTMENTS,
        ...S5_WHEEL_FOOTREST_REFERENCE_ADJUSTMENTS,
        ...S5_FINAL_PUBLIC_OBJECT_ADJUSTMENTS,
      ].filter(
        (entry) =>
          entry.sourceModel === sourceModel &&
          this.doesAdjustmentMatchSelection(entry.selectionKey, selectionKey)
      ).map((entry) => this.normalizeAdjustmentEntry(entry)),
      ...this.manualAdjustmentEntries.filter(
        (entry) =>
          entry.sourceModel === sourceModel &&
          this.doesAdjustmentMatchSelection(entry.selectionKey, selectionKey)
      ),
    ].sort(
      (a, b) =>
        this.getAdjustmentSelectionSpecificity(a.selectionKey) -
        this.getAdjustmentSelectionSpecificity(b.selectionKey)
    );
    const resolvedMap = relevantEntries.reduce((map, entry) => {
        map.set(entry.objectName, entry);
        return map;
      }, new Map());
    S5_POSITION_REFERENCE_OBJECTS.forEach((objectName) => {
      const referenceEntry = this.getS5PositionReferenceAdjustment(objectName, selection);
      if (referenceEntry) {
        resolvedMap.set(objectName, referenceEntry);
      }
    });
    const resolvedEntries = Array.from(resolvedMap.values());

    resolvedEntries.forEach((entry) => {
      this.getObjectsByAdjustableName(entry.objectName).forEach((object) => {
        if (!object.userData.baseManualAdjustPosition) {
          object.userData.baseManualAdjustPosition = object.position.clone();
          object.userData.baseManualAdjustRotation = object.rotation.clone();
        }

        if (entry.mode === "absolute") {
          // Spreadsheet values are the object's final local transform. Applying
          // geometry-center compensation here changes the exported position a
          // second time, so absolute imports must be assigned verbatim.
          object.position.set(entry.position.x, entry.position.y, entry.position.z);
          object.rotation.set(
            THREE.MathUtils.degToRad(entry.rotationDeg.x),
            THREE.MathUtils.degToRad(entry.rotationDeg.y),
            THREE.MathUtils.degToRad(entry.rotationDeg.z),
            object.userData.baseManualAdjustRotation.order
          );
          this.applySeatWidthRootOffset(entry.objectName, object, selection);
          return;
        }

        const targetRotation = object.userData.baseManualAdjustRotation.clone();
        targetRotation.x += THREE.MathUtils.degToRad(entry.rotationDeg.x);
        targetRotation.y += THREE.MathUtils.degToRad(entry.rotationDeg.y);
        targetRotation.z += THREE.MathUtils.degToRad(entry.rotationDeg.z);
        this.applyRotationAroundGeometryCenter(
          object,
          object.userData.baseManualAdjustPosition,
          object.userData.baseManualAdjustRotation,
          targetRotation
        );
        object.position.x += entry.position.x;
        object.position.y += entry.position.y;
        object.position.z += entry.position.z;
        this.applySeatWidthRootOffset(entry.objectName, object, selection);
      });
    });

    // The footplate and its supporting frame are fixed-width center assemblies.
    // Saved per-configuration offsets must not move them away from the frame center.
    this.alignCenteredFootrestAssembly();
    this.alignCenteredBackrest();
  }

  getS5PositionReferenceAdjustment(objectName, selection) {
    if (!S5_POSITION_REFERENCE_OBJECTS.has(objectName)) {
      return null;
    }
    const sourceModel = this.lastSourceModel || this.currentSourceModel || "";
    const frameAngle = (selection && selection.frameAngle) || "";
    const frameLength = (selection && selection.frameLength) || "";

    for (let index = this.manualAdjustmentEntries.length - 1; index >= 0; index -= 1) {
      const entry = this.manualAdjustmentEntries[index];
      if (!entry || entry.sourceModel !== sourceModel || entry.objectName !== objectName) {
        continue;
      }
      const pairs = new Map(this.parseAdjustmentSelectionPairs(entry.selectionKey));
      if (pairs.has("frameAngle") && pairs.get("frameAngle") !== frameAngle) {
        continue;
      }
      if (pairs.has("frameLength") && pairs.get("frameLength") !== frameLength) {
        continue;
      }
      if (pairs.has("seatWidth") && pairs.get("seatWidth") !== S5_POSITION_REFERENCE_SEAT_WIDTH_ID) {
        continue;
      }
      if (pairs.has("seatDepth") && pairs.get("seatDepth") !== S5_POSITION_REFERENCE_SEAT_DEPTH_ID) {
        continue;
      }
      return entry;
    }
    return null;
  }

  applySeatWidthRootOffset(objectName, object, selection) {
    if (!object || (objectName !== "sideguardLeft" && objectName !== "sideguardRight")) {
      return;
    }
    const seatWidthCm = this.getSeatWidthCm(selection);
    const halfDeltaMeters =
      ((seatWidthCm - S5_WHEEL_FOOTREST_REFERENCE_SEAT_WIDTH_CM) * 0.01) * 0.5;
    object.position.x += (objectName === "sideguardLeft" ? 1 : -1) * halfDeltaMeters;
  }

  getResolvedObjectAdjustments(selection) {
    const sourceModel = this.lastSourceModel || this.currentSourceModel || "";
    const selectionKey = this.normalizeAdjustmentSelectionKey(selection || this.lastSelection || {});
    const relevantEntries = [
      ...[
        ...BUILT_IN_OBJECT_ADJUSTMENTS,
        ...FOOTREST_PLATE_FINAL_ADJUSTMENTS,
        ...S5_WHEEL_FOOTREST_REFERENCE_ADJUSTMENTS,
        ...S5_FINAL_PUBLIC_OBJECT_ADJUSTMENTS,
      ].filter(
        (entry) =>
          entry.sourceModel === sourceModel &&
          this.doesAdjustmentMatchSelection(entry.selectionKey, selectionKey)
      ).map((entry) => this.normalizeAdjustmentEntry(entry)),
      ...this.manualAdjustmentEntries.filter(
        (entry) =>
          entry.sourceModel === sourceModel &&
          this.doesAdjustmentMatchSelection(entry.selectionKey, selectionKey)
      ),
    ].sort(
      (a, b) =>
        this.getAdjustmentSelectionSpecificity(a.selectionKey) -
        this.getAdjustmentSelectionSpecificity(b.selectionKey)
    );
    const resolvedMap = relevantEntries.reduce((map, entry) => {
      map.set(entry.objectName, entry);
      return map;
    }, new Map());
    S5_POSITION_REFERENCE_OBJECTS.forEach((objectName) => {
      const referenceEntry = this.getS5PositionReferenceAdjustment(objectName, selection);
      if (referenceEntry) {
        resolvedMap.set(objectName, referenceEntry);
      }
    });
    return resolvedMap;
  }

  createObjectDebugPanel() {
    const panel = document.createElement("section");
    panel.className = "wc-runtime-object-debug-panel";
    panel.style.position = "fixed";
    panel.style.left = "16px";
    panel.style.bottom = "16px";
    panel.style.zIndex = "40";
    panel.style.display = !isLocalDebugSession() || isMobileViewport() ? "none" : "flex";
    panel.style.flexDirection = "column";
    panel.style.gap = "8px";
    panel.style.width = "320px";
    panel.style.maxHeight = "calc(100vh - 32px)";
    panel.style.overflow = "auto";
    panel.style.padding = "12px";
    panel.style.borderRadius = "14px";
    panel.style.background = "rgba(10, 18, 33, 0.92)";
    panel.style.border = "1px solid rgba(120, 150, 210, 0.28)";
    panel.style.backdropFilter = "blur(12px)";
    panel.style.boxShadow = "0 24px 60px rgba(0, 0, 0, 0.32)";
    panel.style.color = "#e6eeff";
    panel.style.pointerEvents = "auto";

    const title = document.createElement("div");
    title.textContent = "本地对象微调";
    title.style.fontWeight = "700";
    title.style.fontSize = "13px";
    panel.appendChild(title);

    const hint = document.createElement("div");
    hint.textContent = "以下拉对象为准，保存后写入本地日志。";
    hint.style.opacity = "0.72";
    hint.style.fontSize = "11px";
    panel.appendChild(hint);

    const select = document.createElement("select");
    select.style.width = "100%";
    select.style.padding = "8px 10px";
    select.style.borderRadius = "10px";
    select.style.border = "1px solid rgba(120, 150, 210, 0.28)";
    select.style.background = "rgba(18, 31, 55, 0.96)";
    select.style.color = "#e6eeff";
    select.addEventListener("change", () => {
      this.objectDebugTargetName = select.value || "";
      this.updateObjectDebugPanel();
      this.highlightDebugTargetObject();
    });
    panel.appendChild(select);
    this.objectDebugSelect = select;

    const valueNode = document.createElement("pre");
    valueNode.style.margin = "0";
    valueNode.style.padding = "10px";
    valueNode.style.borderRadius = "10px";
    valueNode.style.background = "rgba(18, 31, 55, 0.5)";
    valueNode.style.whiteSpace = "pre-wrap";
    valueNode.style.fontFamily = "Consolas, monospace";
    valueNode.style.fontSize = "11px";
    valueNode.style.lineHeight = "1.45";
    panel.appendChild(valueNode);
    this.objectDebugValueNode = valueNode;

    [
      { group: "position", key: "x", label: "X", coarse: 0.01, fine: 0.001, unit: "m" },
      { group: "position", key: "y", label: "Y", coarse: 0.01, fine: 0.001, unit: "m" },
      { group: "position", key: "z", label: "Z", coarse: 0.01, fine: 0.001, unit: "m" },
      { group: "rotationDeg", key: "x", label: "RX", coarse: 1, fine: 0.1, unit: "°" },
      { group: "rotationDeg", key: "y", label: "RY", coarse: 1, fine: 0.1, unit: "°" },
      { group: "rotationDeg", key: "z", label: "RZ", coarse: 1, fine: 0.1, unit: "°" },
    ].forEach((axis) => {
      const row = document.createElement("div");
      row.style.display = "grid";
      row.style.gridTemplateColumns = "36px 1fr 1fr 1fr 1fr";
      row.style.gap = "6px";
      row.style.alignItems = "center";

      const label = document.createElement("span");
      label.textContent = axis.label;
      label.style.fontWeight = "600";
      row.appendChild(label);

      [
        { label: `-${axis.coarse}${axis.unit}`, delta: -axis.coarse },
        { label: `-${axis.fine}${axis.unit}`, delta: -axis.fine },
        { label: `+${axis.fine}${axis.unit}`, delta: axis.fine },
        { label: `+${axis.coarse}${axis.unit}`, delta: axis.coarse },
      ].forEach((buttonConfig) => {
        const button = document.createElement("button");
        button.type = "button";
        button.textContent = buttonConfig.label;
        this.styleDebugButton(button);
        button.addEventListener("click", () => {
          this.adjustSelectedObjectValue(axis.group, axis.key, buttonConfig.delta);
        });
        row.appendChild(button);
      });

      panel.appendChild(row);
    });

    const actionRow = document.createElement("div");
    actionRow.style.display = "grid";
    actionRow.style.gridTemplateColumns = "1fr 1fr";
    actionRow.style.gap = "6px";

    const saveButton = document.createElement("button");
    saveButton.type = "button";
    saveButton.textContent = "保存并固化";
    this.styleDebugButton(saveButton);
    saveButton.addEventListener("click", () => {
      this.saveSelectedObjectAdjustmentWithFallback();
    });
    actionRow.appendChild(saveButton);

    const applyAllButton = document.createElement("button");
    applyAllButton.type = "button";
    applyAllButton.textContent = "应用全部并固化";
    this.styleDebugButton(applyAllButton);
    applyAllButton.addEventListener("click", () => {
      this.applySelectedObjectAdjustmentToAllConfigurations();
    });
    actionRow.appendChild(applyAllButton);

    const reloadButton = document.createElement("button");
    reloadButton.type = "button";
    reloadButton.textContent = "重载日志";
    this.styleDebugButton(reloadButton);
    reloadButton.addEventListener("click", async () => {
      await this.ensureManualAdjustmentsLoaded(true);
      this.refreshCurrentModelState();
      this.updateObjectDebugPanel();
    });
    actionRow.appendChild(reloadButton);

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.textContent = "删除当前";
    this.styleDebugButton(deleteButton);
    deleteButton.addEventListener("click", () => {
      this.deleteSelectedObjectAdjustmentWithFallback();
    });
    actionRow.appendChild(deleteButton);
    panel.appendChild(actionRow);

    const spreadsheetRow = document.createElement("div");
    spreadsheetRow.style.display = "grid";
    spreadsheetRow.style.gridTemplateColumns = "1fr 1fr";
    spreadsheetRow.style.gap = "6px";

    const exportSpreadsheetButton = document.createElement("button");
    exportSpreadsheetButton.type = "button";
    exportSpreadsheetButton.textContent = "导出零件 Excel";
    this.styleDebugButton(exportSpreadsheetButton);
    exportSpreadsheetButton.addEventListener("click", () => {
      this.exportSelectedObjectSpreadsheet();
    });
    spreadsheetRow.appendChild(exportSpreadsheetButton);

    const importSpreadsheetButton = document.createElement("button");
    importSpreadsheetButton.type = "button";
    importSpreadsheetButton.textContent = "导入 Excel 并固化";
    this.styleDebugButton(importSpreadsheetButton);
    const spreadsheetInput = document.createElement("input");
    spreadsheetInput.type = "file";
    spreadsheetInput.accept = ".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
    spreadsheetInput.style.display = "none";
    spreadsheetInput.addEventListener("change", () => {
      const [file] = Array.from(spreadsheetInput.files || []);
      if (file) {
        this.importObjectSpreadsheet(file);
      }
      spreadsheetInput.value = "";
    });
    importSpreadsheetButton.addEventListener("click", () => spreadsheetInput.click());
    spreadsheetRow.appendChild(importSpreadsheetButton);
    panel.appendChild(spreadsheetRow);
    panel.appendChild(spreadsheetInput);

    const statusNode = document.createElement("div");
    statusNode.style.minHeight = "16px";
    statusNode.style.fontSize = "11px";
    statusNode.style.opacity = "0.76";
    panel.appendChild(statusNode);
    this.objectDebugStatusNode = statusNode;

    this.objectDebugPanel = panel;
    this.updateObjectDebugPanel();
    return panel;
  }

  createDraggableObjectDebugPanel() {
    const panel = this.createObjectDebugPanel();
    if (!panel) {
      return panel;
    }

    panel.style.touchAction = "none";

    const firstNode = panel.firstElementChild;
    if (firstNode) {
      const header = document.createElement("div");
      header.style.display = "flex";
      header.style.alignItems = "center";
      header.style.justifyContent = "space-between";
      header.style.gap = "10px";
      header.style.cursor = "move";
      header.style.userSelect = "none";

      const title = document.createElement("div");
      title.textContent = firstNode.textContent || "本地对象微调";
      title.style.fontWeight = "700";
      title.style.fontSize = "13px";
      header.appendChild(title);

      const dragHint = document.createElement("div");
      dragHint.textContent = "拖动";
      dragHint.style.opacity = "0.58";
      dragHint.style.fontSize = "11px";
      header.appendChild(dragHint);

      firstNode.remove();
      panel.insertBefore(header, panel.firstChild || null);
      this.objectDebugDragHandle = header;
    }

    this.objectDebugPanel = panel;
    this.applyStoredObjectDebugPanelPosition();
    this.enableObjectDebugPanelDrag();
    return panel;
  }

  getObjectDebugPanelStorageKey() {
    return "wc-runtime-object-debug-panel-position";
  }

  applyStoredObjectDebugPanelPosition() {
    if (!this.objectDebugPanel) {
      return;
    }
    try {
      const raw = window.localStorage.getItem(this.getObjectDebugPanelStorageKey());
      if (!raw) {
        return;
      }
      const parsed = JSON.parse(raw);
      const left = Number(parsed && parsed.left);
      const top = Number(parsed && parsed.top);
      if (!Number.isFinite(left) || !Number.isFinite(top)) {
        return;
      }
      this.objectDebugPanel.style.left = `${Math.max(8, left)}px`;
      this.objectDebugPanel.style.top = `${Math.max(8, top)}px`;
      this.objectDebugPanel.style.bottom = "auto";
    } catch (error) {
      console.warn("Restore debug panel position failed", error);
    }
  }

  persistObjectDebugPanelPosition() {
    if (!this.objectDebugPanel) {
      return;
    }
    try {
      const rect = this.objectDebugPanel.getBoundingClientRect();
      window.localStorage.setItem(
        this.getObjectDebugPanelStorageKey(),
        JSON.stringify({
          left: Number(rect.left.toFixed(1)),
          top: Number(rect.top.toFixed(1)),
        })
      );
    } catch (error) {
      console.warn("Persist debug panel position failed", error);
    }
  }

  clampObjectDebugPanelPosition(left, top) {
    if (!this.objectDebugPanel) {
      return { left, top };
    }
    const width = this.objectDebugPanel.offsetWidth || 320;
    const height = this.objectDebugPanel.offsetHeight || 420;
    const maxLeft = Math.max(8, window.innerWidth - width - 8);
    const maxTop = Math.max(8, window.innerHeight - height - 8);
    return {
      left: Math.min(Math.max(8, left), maxLeft),
      top: Math.min(Math.max(8, top), maxTop),
    };
  }

  enableObjectDebugPanelDrag() {
    if (!this.objectDebugPanel || !this.objectDebugDragHandle || this.objectDebugDragHandle.dataset.dragBound) {
      return;
    }
    this.objectDebugDragHandle.dataset.dragBound = "1";

    this.objectDebugDragHandle.addEventListener("pointerdown", (event) => {
      if (event.button !== 0) {
        return;
      }
      const rect = this.objectDebugPanel.getBoundingClientRect();
      this.objectDebugDragState = {
        pointerId: event.pointerId,
        offsetX: event.clientX - rect.left,
        offsetY: event.clientY - rect.top,
      };
      this.objectDebugPanel.style.right = "auto";
      this.objectDebugPanel.style.bottom = "auto";
      this.objectDebugPanel.style.left = `${rect.left}px`;
      this.objectDebugPanel.style.top = `${rect.top}px`;
      this.objectDebugDragHandle.setPointerCapture(event.pointerId);
      event.preventDefault();
    });

    this.objectDebugDragHandle.addEventListener("pointermove", (event) => {
      if (!this.objectDebugDragState || event.pointerId !== this.objectDebugDragState.pointerId) {
        return;
      }
      const next = this.clampObjectDebugPanelPosition(
        event.clientX - this.objectDebugDragState.offsetX,
        event.clientY - this.objectDebugDragState.offsetY
      );
      this.objectDebugPanel.style.left = `${next.left}px`;
      this.objectDebugPanel.style.top = `${next.top}px`;
      event.preventDefault();
    });

    const stopDrag = (event) => {
      if (!this.objectDebugDragState || event.pointerId !== this.objectDebugDragState.pointerId) {
        return;
      }
      try {
        this.objectDebugDragHandle.releasePointerCapture(event.pointerId);
      } catch {}
      this.objectDebugDragState = null;
      this.persistObjectDebugPanelPosition();
    };

    this.objectDebugDragHandle.addEventListener("pointerup", stopDrag);
    this.objectDebugDragHandle.addEventListener("pointercancel", stopDrag);
  }

  setObjectDebugStatus(text) {
    if (this.objectDebugStatusNode) {
      this.objectDebugStatusNode.textContent = text || "";
    }
  }

  bindDebugObjectPicking() {
    if (!this.renderer || !this.renderer.domElement) {
      return;
    }
    const canvas = this.renderer.domElement;
    canvas.addEventListener("pointerdown", (event) => {
      if (!this.isDebugApiEnabled() || isMobileViewport()) {
        return;
      }
      if (event.button !== 0) {
        return;
      }
      this.debugPickState = {
        pointerId: event.pointerId,
        startX: event.clientX,
        startY: event.clientY,
      };
    });

    canvas.addEventListener("pointerup", (event) => {
      if (!this.isDebugApiEnabled() || isMobileViewport()) {
        return;
      }
      const pickState = this.debugPickState;
      this.debugPickState = null;
      if (!pickState || pickState.pointerId !== event.pointerId || event.button !== 0) {
        return;
      }
      const deltaX = event.clientX - pickState.startX;
      const deltaY = event.clientY - pickState.startY;
      const moved = Math.hypot(deltaX, deltaY);
      if (moved > 6) {
        return;
      }
      this.pickDebugObjectAtClientPoint(event.clientX, event.clientY);
    });

    canvas.addEventListener("pointercancel", () => {
      this.debugPickState = null;
    });
  }

  pickDebugObjectAtClientPoint(clientX, clientY) {
    if (
      !this.modelRoot ||
      !this.camera ||
      !this.renderer ||
      !this.renderer.domElement ||
      !this.raycaster ||
      !this.pointerNdc
    ) {
      return;
    }
    const rect = this.renderer.domElement.getBoundingClientRect();
    if (!rect.width || !rect.height) {
      return;
    }
    this.pointerNdc.x = ((clientX - rect.left) / rect.width) * 2 - 1;
    this.pointerNdc.y = -(((clientY - rect.top) / rect.height) * 2 - 1);
    this.raycaster.setFromCamera(this.pointerNdc, this.camera);

    const pickTargets = [];
    this.modelRoot.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        pickTargets.push(child);
      }
    });
    if (!pickTargets.length) {
      return;
    }

    const intersections = this.raycaster.intersectObjects(pickTargets, false);
    const hit = intersections.find((entry) => entry && entry.object && entry.object.name);
    if (!hit || !hit.object || !hit.object.name) {
      return;
    }
    const partKey = this.resolveAdjustableObjectKeyFromObject(hit.object);
    if (!partKey) {
      return;
    }
    this.selectDebugObjectByName(partKey);
  }

  selectDebugObjectByName(objectName) {
    if (!objectName) {
      return;
    }
    this.objectDebugTargetName = objectName;
    if (this.objectDebugSelect) {
      this.objectDebugSelect.value = objectName;
    }
    this.updateObjectDebugPanel();
    this.highlightDebugTargetObject();
    this.setObjectDebugStatus(`已选中: ${objectName}`);
  }

  refreshObjectDebugOptions() {
    if (!this.objectDebugSelect) {
      return;
    }
    const names = this.getAdjustableObjectNames();
    const nextValue =
      names.includes(this.objectDebugTargetName) ? this.objectDebugTargetName : names[0] || "";
    this.objectDebugTargetName = nextValue;
    this.objectDebugSelect.innerHTML = names
      .map((name) => `<option value="${name.replace(/"/g, "&quot;")}">${name}</option>`)
      .join("");
    this.objectDebugSelect.value = nextValue;
    this.updateObjectDebugPanel();
  }

  updateObjectDebugPanel() {
    if (!this.objectDebugValueNode) {
      return;
    }
    const entry = this.getCurrentObjectAdjustmentEntry();
    const selectionKey = this.buildSelectionKey(this.lastSelection || {});
    if (!this.objectDebugTargetName) {
      this.objectDebugValueNode.textContent = "当前配置下暂无可调对象";
      return;
    }
    const values = entry || this.normalizeAdjustmentEntry({});
    this.objectDebugValueNode.textContent = [
      `model: ${this.lastSourceModel || this.currentSourceModel || "-"}`,
      `selection: ${selectionKey || "-"}`,
      `object: ${this.objectDebugTargetName}`,
      "",
      `x: ${values.position.x.toFixed(4)}`,
      `y: ${values.position.y.toFixed(4)}`,
      `z: ${values.position.z.toFixed(4)}`,
      `rx: ${values.rotationDeg.x.toFixed(2)}`,
      `ry: ${values.rotationDeg.y.toFixed(2)}`,
      `rz: ${values.rotationDeg.z.toFixed(2)}`,
    ].join("\n");
  }

  highlightDebugTargetObject() {
    if (!this.modelRoot) {
      return;
    }
    const activeName = this.objectDebugTargetName || "";
    this.modelRoot.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) {
        return;
      }
      if (child.userData.baseEmissive === undefined) {
        const material = Array.isArray(child.material) ? child.material[0] : child.material;
        child.userData.baseEmissive = material && material.emissive ? material.emissive.clone() : null;
        child.userData.baseEmissiveIntensity =
          material && typeof material.emissiveIntensity === "number" ? material.emissiveIntensity : 0;
      }
      const materials = Array.isArray(child.material) ? child.material : [child.material];
      materials.forEach((material) => {
        if (!material || !material.emissive) {
          return;
        }
        if (this.resolveAdjustableObjectKeyFromObject(child) === activeName) {
          material.emissive.setHex(0x335ea8);
          material.emissiveIntensity = 0.6;
        } else {
          if (child.userData.baseEmissive) {
            material.emissive.copy(child.userData.baseEmissive);
          }
          material.emissiveIntensity = child.userData.baseEmissiveIntensity || 0;
        }
      });
    });
  }

  adjustSelectedObjectValue(group, key, delta) {
    const entry = this.ensureCurrentObjectAdjustmentEntry();
    if (!entry || !entry[group] || !Object.prototype.hasOwnProperty.call(entry[group], key)) {
      return;
    }
    const precision = group === "position" ? 4 : 2;
    entry[group][key] = Number((entry[group][key] + delta).toFixed(precision));

    this.refreshCurrentModelState();
    this.updateObjectDebugPanel();
  }

  async saveSelectedObjectAdjustmentWithFallback() {
    const entry = this.getCurrentObjectAdjustmentEntry();
    if (!entry) {
      this.setObjectDebugStatus("没有可保存的对象");
      return;
    }

    const finalizedEntry = this.upsertManualAdjustmentEntry({
      ...entry,
      updatedAt: new Date().toISOString(),
    });
    this.refreshCurrentModelState();
    this.updateObjectDebugPanel();

    if (!this.isDebugApiEnabled()) {
      this.setObjectDebugStatus(`已保存到本地: ${entry.objectName}`);
      return;
    }

    this.setObjectDebugStatus("写入日志中...");
    try {
      const response = await fetch(`${getDebugApiBase()}/save`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(finalizedEntry),
      });
      if (!response.ok) {
        throw new Error(`Save failed ${response.status}`);
      }
      const payload = await response.json();
      const entries = Array.isArray(payload && payload.entries) ? payload.entries : [];
      this.manualAdjustmentEntries = this.mergeManualAdjustmentEntries(entries, finalizedEntry);
      this.manualAdjustmentsLoaded = true;
      this.writeLocalManualAdjustments(this.manualAdjustmentEntries);
      this.setObjectDebugStatus(`已写入日志: ${entry.objectName}`);
      this.refreshCurrentModelState();
      this.updateObjectDebugPanel();
    } catch (error) {
      console.error("Save debug adjustment failed", error);
      this.setObjectDebugStatus(`日志服务未连接，已保存到本地: ${entry.objectName}`);
    }
  }

  getCurrentObjectAdjustmentAsGlobalDelta() {
    const entry = this.getCurrentObjectAdjustmentEntry();
    if (!entry) {
      return null;
    }
    const object = this.getObjectsByAdjustableName(entry.objectName)[0];
    if (!object || !object.userData.baseManualAdjustPosition || !object.userData.baseManualAdjustRotation) {
      return this.normalizeAdjustmentEntry({
        ...entry,
        selectionKey: "",
        mode: "delta",
      });
    }

    const basePosition = object.userData.baseManualAdjustPosition;
    const baseRotation = object.userData.baseManualAdjustRotation;
    return this.normalizeAdjustmentEntry({
      sourceModel: entry.sourceModel,
      selectionKey: "",
      objectName: entry.objectName,
      mode: "delta",
      position: {
        x: object.position.x - basePosition.x,
        y: object.position.y - basePosition.y,
        z: object.position.z - basePosition.z,
      },
      rotationDeg: {
        x: THREE.MathUtils.radToDeg(object.rotation.x - baseRotation.x),
        y: THREE.MathUtils.radToDeg(object.rotation.y - baseRotation.y),
        z: THREE.MathUtils.radToDeg(object.rotation.z - baseRotation.z),
      },
      updatedAt: new Date().toISOString(),
    });
  }

  async applySelectedObjectAdjustmentToAllConfigurations() {
    const globalEntry = this.getCurrentObjectAdjustmentAsGlobalDelta();
    if (!globalEntry) {
      this.setObjectDebugStatus("没有可应用的对象位置");
      return;
    }

    // Replace every configuration-specific override for this part with one
    // global delta. The part keeps each configuration's own base geometry.
    this.manualAdjustmentEntries = this.manualAdjustmentEntries.filter(
      (item) => !(item.sourceModel === globalEntry.sourceModel && item.objectName === globalEntry.objectName)
    );
    this.manualAdjustmentEntries.push(globalEntry);
    this.manualAdjustmentsLoaded = true;
    this.writeLocalManualAdjustments(this.manualAdjustmentEntries);
    this.refreshCurrentModelState();
    this.updateObjectDebugPanel();

    if (!this.isDebugApiEnabled()) {
      this.setObjectDebugStatus(`已应用全部配置并固化到本地: ${globalEntry.objectName}`);
      return;
    }

    this.setObjectDebugStatus("正在应用到全部配置...");
    try {
      const response = await fetch(`${getDebugApiBase()}/replace-object`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entry: globalEntry }),
      });
      if (!response.ok) {
        throw new Error(`Replace failed ${response.status}`);
      }
      const payload = await response.json();
      const entries = Array.isArray(payload && payload.entries) ? payload.entries : [];
      this.manualAdjustmentEntries = entries.map((item) => this.normalizeAdjustmentEntry(item));
      this.manualAdjustmentsLoaded = true;
      this.writeLocalManualAdjustments(this.manualAdjustmentEntries);
      this.refreshCurrentModelState();
      this.updateObjectDebugPanel();
      this.setObjectDebugStatus(`已应用全部配置并固化: ${globalEntry.objectName}`);
    } catch (error) {
      console.error("Apply adjustment to all configurations failed", error);
      this.setObjectDebugStatus(`日志服务未连接，已应用全部配置并固化到本地: ${globalEntry.objectName}`);
    }
  }

  getPositionSpreadsheetVariants() {
    return {
      frameAngle: ["fa-100", "fa-90"],
      frameLength: ["fl-std", "fl-long"],
      seatWidth: ["sw-36", "sw-39", "sw-42", "sw-45", "sw-48"],
      seatDepth: ["sd-37-5", "sd-40", "sd-42-5", "sd-45", "sd-47-5"],
    };
  }

  collectSelectedObjectSpreadsheetRows() {
    const objectName = this.objectDebugTargetName || "";
    const sourceModel = this.lastSourceModel || this.currentSourceModel || "";
    if (!objectName || !sourceModel) {
      return [];
    }

    const originalSelection = { ...(this.lastSelection || {}) };
    const variants = this.getPositionSpreadsheetVariants();
    const rows = [];
    try {
      variants.frameAngle.forEach((frameAngle) => {
        variants.frameLength.forEach((frameLength) => {
          variants.seatWidth.forEach((seatWidth) => {
            variants.seatDepth.forEach((seatDepth) => {
              const selection = {
                ...originalSelection,
                frameAngle,
                frameLength,
                seatWidth,
                seatDepth,
              };
              this.applyDimensionAdjustments(selection);
              const object = this.getObjectsByAdjustableName(objectName)[0];
              if (!object) {
                return;
              }
              rows.push({
                sourceModel,
                objectName,
                frameAngle,
                frameLength,
                seatWidth,
                seatDepth,
                selectionKey: this.normalizeAdjustmentSelectionKey(selection),
                mode: "absolute",
                x: Number(object.position.x.toFixed(4)),
                y: Number(object.position.y.toFixed(4)),
                z: Number(object.position.z.toFixed(4)),
                rx: Number(THREE.MathUtils.radToDeg(object.rotation.x).toFixed(2)),
                ry: Number(THREE.MathUtils.radToDeg(object.rotation.y).toFixed(2)),
                rz: Number(THREE.MathUtils.radToDeg(object.rotation.z).toFixed(2)),
              });
            });
          });
        });
      });
    } finally {
      this.applyDimensionAdjustments(originalSelection);
    }
    return rows;
  }

  async exportSelectedObjectSpreadsheet() {
    if (!this.isDebugApiEnabled()) {
      this.setObjectDebugStatus("Excel 导出仅在本地调试服务中可用");
      return;
    }
    const rows = this.collectSelectedObjectSpreadsheetRows();
    if (!rows.length) {
      this.setObjectDebugStatus("当前没有可导出的零件定位数据");
      return;
    }

    this.setObjectDebugStatus(`正在导出 ${rows.length} 条绝对定位数据...`);
    try {
      const response = await fetch(`${getDebugApiBase()}/export-xlsx`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ objectName: this.objectDebugTargetName, rows }),
      });
      if (!response.ok) {
        throw new Error(`Export failed ${response.status}`);
      }
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `S5_${this.objectDebugTargetName}_absolute_positions.xlsx`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      this.setObjectDebugStatus(`已导出 ${rows.length} 条绝对定位数据`);
    } catch (error) {
      console.error("Export spreadsheet failed", error);
      this.setObjectDebugStatus("Excel 导出失败，请确认本地调试服务已启动");
    }
  }

  async importObjectSpreadsheet(file) {
    if (!this.isDebugApiEnabled()) {
      this.setObjectDebugStatus("Excel 导入仅在本地调试服务中可用");
      return;
    }
    this.setObjectDebugStatus(`正在导入 ${file.name}...`);
    try {
      const response = await fetch(`${getDebugApiBase()}/import-xlsx`, {
        method: "POST",
        headers: {
          "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        },
        body: await file.arrayBuffer(),
      });
      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || `Import failed ${response.status}`);
      }
      const payload = await response.json();
      const entries = Array.isArray(payload && payload.entries) ? payload.entries : [];
      this.manualAdjustmentEntries = entries.map((entry) => this.normalizeAdjustmentEntry(entry));
      this.manualAdjustmentsLoaded = true;
      this.writeLocalManualAdjustments(this.manualAdjustmentEntries);
      this.refreshCurrentModelState();
      this.updateObjectDebugPanel();
      this.setObjectDebugStatus(`已导入并固化 ${payload.imported || 0} 条定位数据`);
    } catch (error) {
      console.error("Import spreadsheet failed", error);
      this.setObjectDebugStatus("Excel 导入失败，请检查表头和本地调试服务");
    }
  }

  async deleteSelectedObjectAdjustmentWithFallback() {
    const entry = this.getCurrentObjectAdjustmentEntry();
    if (!entry) {
      this.setObjectDebugStatus("当前对象没有日志记录");
      return;
    }

    this.removeManualAdjustmentEntry(entry);
    this.refreshCurrentModelState();
    this.updateObjectDebugPanel();

    if (!this.isDebugApiEnabled()) {
      this.setObjectDebugStatus(`已从本地删除: ${entry.objectName}`);
      return;
    }

    this.setObjectDebugStatus("删除日志中...");
    try {
      const response = await fetch(`${getDebugApiBase()}/delete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourceModel: entry.sourceModel,
          selectionKey: entry.selectionKey,
          objectName: entry.objectName,
        }),
      });
      if (!response.ok) {
        throw new Error(`Delete failed ${response.status}`);
      }
      const payload = await response.json();
      const entries = Array.isArray(payload && payload.entries) ? payload.entries : [];
      this.manualAdjustmentEntries = entries.map((item) => this.normalizeAdjustmentEntry(item));
      this.manualAdjustmentsLoaded = true;
      this.writeLocalManualAdjustments(this.manualAdjustmentEntries);
      this.setObjectDebugStatus(`已删除: ${entry.objectName}`);
      this.refreshCurrentModelState();
      this.updateObjectDebugPanel();
    } catch (error) {
      console.error("Delete debug adjustment failed", error);
      this.setObjectDebugStatus(`日志服务未连接，已从本地删除: ${entry.objectName}`);
    }
  }

  async saveSelectedObjectAdjustment() {
    const entry = this.getCurrentObjectAdjustmentEntry();
    if (!entry) {
      this.setObjectDebugStatus("没有可保存的对象");
      return;
    }
    if (!this.isDebugApiEnabled()) {
      this.setObjectDebugStatus("当前环境不支持写日志");
      return;
    }

    this.setObjectDebugStatus("写入日志中...");
    try {
      const response = await fetch(`${getDebugApiBase()}/save`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(entry),
      });
      if (!response.ok) {
        throw new Error(`Save failed ${response.status}`);
      }
      const payload = await response.json();
      const entries = Array.isArray(payload && payload.entries) ? payload.entries : [];
      this.manualAdjustmentEntries = entries.map((item) => this.normalizeAdjustmentEntry(item));
      this.manualAdjustmentsLoaded = true;
      this.setObjectDebugStatus(`已写入日志: ${entry.objectName}`);
      this.refreshCurrentModelState();
      this.updateObjectDebugPanel();
    } catch (error) {
      console.error("Save debug adjustment failed", error);
      this.setObjectDebugStatus("写日志失败");
    }
  }

  async deleteSelectedObjectAdjustment() {
    const entry = this.getCurrentObjectAdjustmentEntry();
    if (!entry) {
      this.setObjectDebugStatus("当前对象没有日志记录");
      return;
    }
    if (!this.isDebugApiEnabled()) {
      this.setObjectDebugStatus("当前环境不支持写日志");
      return;
    }

    this.setObjectDebugStatus("删除日志中...");
    try {
      const response = await fetch(`${getDebugApiBase()}/delete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourceModel: entry.sourceModel,
          selectionKey: entry.selectionKey,
          objectName: entry.objectName,
        }),
      });
      if (!response.ok) {
        throw new Error(`Delete failed ${response.status}`);
      }
      const payload = await response.json();
      const entries = Array.isArray(payload && payload.entries) ? payload.entries : [];
      this.manualAdjustmentEntries = entries.map((item) => this.normalizeAdjustmentEntry(item));
      this.manualAdjustmentsLoaded = true;
      this.setObjectDebugStatus(`已删除: ${entry.objectName}`);
      this.refreshCurrentModelState();
      this.updateObjectDebugPanel();
    } catch (error) {
      console.error("Delete debug adjustment failed", error);
      this.setObjectDebugStatus("删除日志失败");
    }
  }

  createDebugPanel() {
    const panel = document.createElement("div");
    panel.className = "wc-runtime-debug-panel";
    panel.style.position = isMobileViewport() ? "absolute" : "fixed";
    panel.style.left = "12px";
    panel.style.top = isMobileViewport() ? "12px" : "88px";
    panel.style.zIndex = "4";
    panel.style.display = "flex";
    panel.style.flexDirection = "column";
    panel.style.gap = "6px";
    panel.style.padding = "10px";
    panel.style.borderRadius = "10px";
    panel.style.background = "rgba(10, 18, 33, 0.82)";
    panel.style.border = "1px solid rgba(120, 150, 210, 0.28)";
    panel.style.backdropFilter = "blur(10px)";
    panel.style.color = "#e6eeff";
    panel.style.fontSize = "12px";
    panel.style.pointerEvents = "auto";
    panel.style.maxWidth = "248px";

    const title = document.createElement("div");
    title.textContent = "90° 对位临时调节";
    title.style.fontWeight = "700";
    panel.appendChild(title);

    const hint = document.createElement("div");
    hint.textContent = "只用于本地微调前叉 90°";
    hint.style.opacity = "0.72";
    panel.appendChild(hint);

    title.textContent = "车架 100° 调节";

    const valueNode = document.createElement("pre");
    valueNode.style.margin = "0";
    valueNode.style.whiteSpace = "pre-wrap";
    valueNode.style.fontFamily = "Consolas, monospace";
    valueNode.style.fontSize = "11px";
    valueNode.style.lineHeight = "1.35";
    valueNode.style.opacity = "0.92";
    panel.appendChild(valueNode);
    this.debugValueNode = valueNode;
    title.textContent = "前叉脚 100° 调节";
    title.textContent = "前叉脚 100° 调节";

    const axes = [
      { key: "rotationDeg", label: "角度", step: 0.5, unit: "deg" },
      { key: "x", label: "X", step: 0.01, unit: "m" },
      { key: "y", label: "Y", step: 0.01, unit: "m" },
      { key: "z", label: "Z", step: 0.01, unit: "m" },
    ];

    axes.forEach((axis) => {
      const row = document.createElement("div");
      row.style.display = "grid";
      row.style.gridTemplateColumns = "34px 1fr 1fr 1fr 1fr";
      row.style.gap = "6px";
      row.style.alignItems = "center";

      const label = document.createElement("span");
      label.textContent = axis.label;
      label.style.fontWeight = "600";
      row.appendChild(label);

      const minusBtn = document.createElement("button");
      minusBtn.type = "button";
      minusBtn.textContent = `-${axis.step}${axis.unit === "deg" ? "°" : ""}`;
      this.styleDebugButton(minusBtn);
      minusBtn.addEventListener("click", () => {
        this.adjustDebugValue(axis.key, -axis.step);
      });
      row.appendChild(minusBtn);

      const minusFineBtn = document.createElement("button");
      minusFineBtn.type = "button";
      minusFineBtn.textContent = `-${axis.fineStep}${axis.unit === "deg" ? "??" : ""}`;
      this.styleDebugButton(minusFineBtn);
      minusFineBtn.addEventListener("click", () => {
        this.adjustFrontCasterDebugValue(axis.key, -axis.fineStep);
      });
      row.appendChild(minusFineBtn);

      const plusFineBtn = document.createElement("button");
      plusFineBtn.type = "button";
      plusFineBtn.textContent = `+${axis.fineStep}${axis.unit === "deg" ? "??" : ""}`;
      this.styleDebugButton(plusFineBtn);
      plusFineBtn.addEventListener("click", () => {
        this.adjustFrontCasterDebugValue(axis.key, axis.fineStep);
      });
      row.appendChild(plusFineBtn);

      const plusBtn = document.createElement("button");
      plusBtn.type = "button";
      plusBtn.textContent = `+${axis.step}${axis.unit === "deg" ? "°" : ""}`;
      this.styleDebugButton(plusBtn);
      plusBtn.addEventListener("click", () => {
        this.adjustDebugValue(axis.key, axis.step);
      });
      row.appendChild(plusBtn);

      panel.appendChild(row);
    });

    const actions = document.createElement("div");
    actions.style.display = "grid";
    actions.style.gridTemplateColumns = "1fr 1fr";
    actions.style.gap = "6px";

    const resetBtn = document.createElement("button");
    resetBtn.type = "button";
    resetBtn.textContent = "重置前叉脚";
    resetBtn.textContent = "重置";
    this.styleDebugButton(resetBtn);
    resetBtn.addEventListener("click", () => {
      this.debugFrame90Adjust = {
        rotationDeg: 8,
        x: 0.0001,
        y: -0.0223,
        z: -0.0621,
      };
      this.refreshCurrentModelState();
      this.updateDebugPanel();
    });
    actions.appendChild(resetBtn);

    const copyBtn = document.createElement("button");
    copyBtn.type = "button";
    copyBtn.textContent = "复制数值";
    this.styleDebugButton(copyBtn);
    copyBtn.addEventListener("click", async () => {
      const text = JSON.stringify(this.debugFrame90Adjust);
      try {
        await navigator.clipboard.writeText(text);
        copyBtn.textContent = "已复制";
        window.setTimeout(() => {
          copyBtn.textContent = "复制数值";
        }, 1200);
      } catch (error) {
        console.error("Copy debug values failed", error);
      }
    });
    actions.appendChild(copyBtn);

    panel.appendChild(actions);
    this.debugPanel = panel;
    this.updateDebugPanel();
    return panel;
  }

  styleDebugButton(button) {
    button.style.border = "1px solid rgba(120, 150, 210, 0.28)";
    button.style.borderRadius = "8px";
    button.style.background = "rgba(18, 31, 55, 0.9)";
    button.style.color = "#e6eeff";
    button.style.padding = "6px 8px";
    button.style.cursor = "pointer";
    button.style.fontSize = "11px";
  }

  adjustDebugValue(key, delta) {
    if (!Object.prototype.hasOwnProperty.call(this.debugFrame90Adjust, key)) {
      return;
    }
    const nextValue = this.debugFrame90Adjust[key] + delta;
    this.debugFrame90Adjust[key] = Number(nextValue.toFixed(4));
    this.refreshCurrentModelState();
    this.updateDebugPanel();
  }

  updateDebugPanel() {
    if (!this.debugValueNode) {
      return;
    }
    const values = this.debugFrame90Adjust;
    this.debugValueNode.textContent = [
      `rotationDeg: ${values.rotationDeg.toFixed(2)}`,
      `x: ${values.x.toFixed(4)}`,
      `y: ${values.y.toFixed(4)}`,
      `z: ${values.z.toFixed(4)}`,
    ].join("\n");
  }

  createFrontCasterDebugPanel() {
    const panel = document.createElement("div");
    panel.className = "wc-runtime-debug-panel wc-runtime-debug-front-caster";
    panel.style.position = isMobileViewport() ? "absolute" : "fixed";
    panel.style.left = "12px";
    panel.style.top = isMobileViewport() ? "260px" : "352px";
    panel.style.zIndex = "4";
    panel.style.display = "flex";
    panel.style.flexDirection = "column";
    panel.style.gap = "6px";
    panel.style.padding = "10px";
    panel.style.borderRadius = "10px";
    panel.style.background = "rgba(10, 18, 33, 0.82)";
    panel.style.border = "1px solid rgba(120, 150, 210, 0.28)";
    panel.style.backdropFilter = "blur(10px)";
    panel.style.color = "#e6eeff";
    panel.style.fontSize = "12px";
    panel.style.pointerEvents = "auto";
    panel.style.maxWidth = "248px";

    const title = document.createElement("div");
    title.textContent = "前轮组 90° 调节";
    title.style.fontWeight = "700";
    panel.appendChild(title);

    const valueNode = document.createElement("pre");
    valueNode.style.margin = "0";
    valueNode.style.whiteSpace = "pre-wrap";
    valueNode.style.fontFamily = "Consolas, monospace";
    valueNode.style.fontSize = "11px";
    valueNode.style.lineHeight = "1.35";
    valueNode.style.opacity = "0.92";
    panel.appendChild(valueNode);
    this.debugFrontCasterValueNode = valueNode;

    const axes = [
      { key: "rotationDeg", label: "角度", step: 0.5, unit: "deg" },
      { key: "x", label: "X", step: 0.01, unit: "m" },
      { key: "y", label: "Y", step: 0.01, unit: "m" },
      { key: "z", label: "Z", step: 0.01, unit: "m" },
    ];

    axes.forEach((axis) => {
      const row = document.createElement("div");
      row.style.display = "grid";
      row.style.gridTemplateColumns =
        axis.unit === "deg" ? "44px 1fr 1fr" : "44px 1fr 1fr 1fr 1fr";
      row.style.gap = "6px";
      row.style.alignItems = "center";

      const label = document.createElement("span");
      label.textContent = axis.label;
      label.style.fontWeight = "600";
      row.appendChild(label);

      const minusBtn = document.createElement("button");
      minusBtn.type = "button";
      minusBtn.textContent = `-${axis.step}${axis.unit === "deg" ? "°" : ""}`;
      this.styleDebugButton(minusBtn);
      minusBtn.addEventListener("click", () => {
        this.adjustFrontCasterDebugValue(axis.key, -axis.step);
      });
      row.appendChild(minusBtn);

      if (axis.unit !== "deg") {
        const fineMinusBtn = document.createElement("button");
        fineMinusBtn.type = "button";
        fineMinusBtn.textContent = "-0.001";
        this.styleDebugButton(fineMinusBtn);
        fineMinusBtn.addEventListener("click", () => {
          this.adjustFrontCasterDebugValue(axis.key, -0.001);
        });
        row.appendChild(fineMinusBtn);
      }

      const plusBtn = document.createElement("button");
      plusBtn.type = "button";
      plusBtn.textContent = `+${axis.step}${axis.unit === "deg" ? "°" : ""}`;
      this.styleDebugButton(plusBtn);
      plusBtn.addEventListener("click", () => {
        this.adjustFrontCasterDebugValue(axis.key, axis.step);
      });
      if (axis.unit !== "deg") {
        const finePlusBtn = document.createElement("button");
        finePlusBtn.type = "button";
        finePlusBtn.textContent = "+0.001";
        this.styleDebugButton(finePlusBtn);
        finePlusBtn.addEventListener("click", () => {
          this.adjustFrontCasterDebugValue(axis.key, 0.001);
        });
        row.appendChild(finePlusBtn);
      }
      row.appendChild(plusBtn);

      panel.appendChild(row);
    });

    const resetBtn = document.createElement("button");
    resetBtn.type = "button";
    resetBtn.textContent = "重置前轮组";
    this.styleDebugButton(resetBtn);
    resetBtn.addEventListener("click", () => {
      this.debugFrontCaster90Adjust = {
        rotationDeg: 7,
        x: 0,
        y: 0.036,
        z: -0.039,
      };
      this.refreshCurrentModelState();
      this.updateFrontCasterDebugPanel();
    });
    panel.appendChild(resetBtn);

    const syncBtn = document.createElement("button");
    syncBtn.type = "button";
    syncBtn.textContent = "同步前叉管参数";
    this.styleDebugButton(syncBtn);
    syncBtn.addEventListener("click", () => {
      this.debugFrontCaster90Adjust = {
        rotationDeg: this.debugFrame90Adjust.rotationDeg,
        x: this.debugFrame90Adjust.x,
        y: this.debugFrame90Adjust.y,
        z: this.debugFrame90Adjust.z,
      };
      this.refreshCurrentModelState();
      this.updateFrontCasterDebugPanel();
    });
    panel.appendChild(syncBtn);

    this.debugFrontCasterPanel = panel;
    this.updateFrontCasterDebugPanel();
    return panel;
  }

  adjustFrontCasterDebugValue(key, delta) {
    if (!Object.prototype.hasOwnProperty.call(this.debugFrontCaster90Adjust, key)) {
      return;
    }
    const nextValue = this.debugFrontCaster90Adjust[key] + delta;
    this.debugFrontCaster90Adjust[key] = Number(nextValue.toFixed(4));
    this.refreshCurrentModelState();
    this.updateFrontCasterDebugPanel();
  }

  updateFrontCasterDebugPanel() {
    if (!this.debugFrontCasterValueNode) {
      return;
    }
    const values = this.debugFrontCaster90Adjust;
    this.debugFrontCasterValueNode.textContent = [
      `rotationDeg: ${values.rotationDeg.toFixed(2)}`,
      `x: ${values.x.toFixed(4)}`,
      `y: ${values.y.toFixed(4)}`,
      `z: ${values.z.toFixed(4)}`,
    ].join("\n");
  }

  createFootrestDebugPanel() {
    const panel = document.createElement("div");
    panel.className = "wc-runtime-debug-panel wc-runtime-debug-footrest";
    panel.style.position = isMobileViewport() ? "absolute" : "fixed";
    panel.style.left = "12px";
    panel.style.top = isMobileViewport() ? "508px" : "616px";
    panel.style.zIndex = "4";
    panel.style.display = "flex";
    panel.style.flexDirection = "column";
    panel.style.gap = "6px";
    panel.style.padding = "10px";
    panel.style.borderRadius = "10px";
    panel.style.background = "rgba(10, 18, 33, 0.82)";
    panel.style.border = "1px solid rgba(120, 150, 210, 0.28)";
    panel.style.backdropFilter = "blur(10px)";
    panel.style.color = "#e6eeff";
    panel.style.fontSize = "12px";
    panel.style.pointerEvents = "auto";
    panel.style.maxWidth = "248px";

    const title = document.createElement("div");
    title.textContent = "踏板 90° 调节";
    title.style.fontWeight = "700";
    panel.appendChild(title);

    const valueNode = document.createElement("pre");
    valueNode.style.margin = "0";
    valueNode.style.whiteSpace = "pre-wrap";
    valueNode.style.fontFamily = "Consolas, monospace";
    valueNode.style.fontSize = "11px";
    valueNode.style.lineHeight = "1.35";
    valueNode.style.opacity = "0.92";
    panel.appendChild(valueNode);
    this.debugFootrestValueNode = valueNode;
    title.textContent = "前叉脚 100° 调节";
    title.textContent = "踏板 100° 调节";

    const axes = [
      { key: "rotationDeg", label: "角度", step: 0.5, unit: "deg" },
      { key: "x", label: "X", step: 0.01, unit: "m" },
      { key: "y", label: "Y", step: 0.01, unit: "m" },
      { key: "z", label: "Z", step: 0.01, unit: "m" },
    ];

    axes.forEach((axis) => {
      const row = document.createElement("div");
      row.style.display = "grid";
      row.style.gridTemplateColumns = "44px 1fr 1fr";
      row.style.gap = "6px";
      row.style.alignItems = "center";

      const label = document.createElement("span");
      label.textContent = axis.label;
      label.style.fontWeight = "600";
      row.appendChild(label);

      const minusBtn = document.createElement("button");
      minusBtn.type = "button";
      minusBtn.textContent = `-${axis.step}${axis.unit === "deg" ? "°" : ""}`;
      this.styleDebugButton(minusBtn);
      minusBtn.addEventListener("click", () => {
        this.adjustFootrestDebugValue(axis.key, -axis.step);
      });
      row.appendChild(minusBtn);

      const plusBtn = document.createElement("button");
      plusBtn.type = "button";
      plusBtn.textContent = `+${axis.step}${axis.unit === "deg" ? "°" : ""}`;
      this.styleDebugButton(plusBtn);
      plusBtn.addEventListener("click", () => {
        this.adjustFootrestDebugValue(axis.key, axis.step);
      });
      row.appendChild(plusBtn);

      panel.appendChild(row);
    });

    const resetBtn = document.createElement("button");
    resetBtn.type = "button";
    resetBtn.textContent = "重置踏板";
    this.styleDebugButton(resetBtn);
    resetBtn.addEventListener("click", () => {
      this.debugFrame100Adjust = {
        rotationDeg: 0,
        x: 0,
        y: 0,
        z: 0,
      };
      this.refreshCurrentModelState();
      this.updateFootrestDebugPanel();
    });
    panel.appendChild(resetBtn);

    this.debugFootrestPanel = panel;
    this.updateFootrestDebugPanel();
    return panel;
  }

  adjustFootrestDebugValue(key, delta) {
    if (!Object.prototype.hasOwnProperty.call(this.debugFrame100Adjust, key)) {
      return;
    }
    const nextValue = this.debugFrame100Adjust[key] + delta;
    this.debugFrame100Adjust[key] = Number(nextValue.toFixed(4));
    this.refreshCurrentModelState();
    this.updateFootrestDebugPanel();
  }

  updateFootrestDebugPanel() {
    if (!this.debugFootrestValueNode) {
      return;
    }
    const values = this.debugFrame100Adjust;
    this.debugFootrestValueNode.textContent = [
      `rotationDeg: ${values.rotationDeg.toFixed(2)}`,
      `x: ${values.x.toFixed(4)}`,
      `y: ${values.y.toFixed(4)}`,
      `z: ${values.z.toFixed(4)}`,
    ].join("\n");
  }

  refreshCurrentModelState() {
    if (!this.modelRoot) {
      return;
    }
    this.applyDimensionAdjustments(this.lastSelection || {});
    this.applyManualObjectAdjustments(this.lastSelection || {});
    this.applyFrameColor(this.lastFrameColor);
    this.highlightDebugTargetObject();
    this.showStatus("");
  }

  showStatus(text) {
    if (!this.statusNode) return;
    this.statusNode.textContent = text || "";
    this.statusNode.style.display = text ? "block" : "none";
  }

  getGlbLoader() {
    const loader = new GLTFLoader();
    if (!this.dracoLoader) {
      this.dracoLoader = new DRACOLoader();
      this.dracoLoader.setDecoderPath("/draco/");
      this.dracoLoader.setDecoderConfig({ type: "js" });
      this.dracoLoader.preload();
    }
    loader.setDRACOLoader(this.dracoLoader);
    loader.setMeshoptDecoder(MeshoptDecoder);
    return loader;
  }

  applySolidTintMaterials(object) {
    if (!object) {
      return;
    }
    object.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) {
        return;
      }
      const nextMaterial = buildRenderFrameMaterial("#ffffff");
      child.material = nextMaterial;
      child.userData.wcSolidTintMaterial = true;
      child.visible = true;
      child.frustumCulled = false;
      child.renderOrder = 1;
    });
  }

  applyBlackWheelMaterials(object) {
    if (!object) {
      return;
    }
    object.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) {
        return;
      }
      child.material = buildBlackWheelMaterial();
      child.visible = true;
      child.frustumCulled = false;
    });
  }

  applySeatStyle(object, style) {
    if (!object) {
      return;
    }
    object.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) {
        return;
      }
      const previous = Array.isArray(child.material) ? child.material : [child.material];
      previous.forEach((material) => material && material.dispose && material.dispose());
      child.material = buildSeatMaterial(style || "seat-std");
      child.visible = true;
      child.frustumCulled = false;
    });
  }

  applyFootrestPlateStyle(object, style) {
    if (!object) {
      return;
    }
    object.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) {
        return;
      }
      const previous = Array.isArray(child.material) ? child.material : [child.material];
      previous.forEach((material) => material && material.dispose && material.dispose());
      child.material = buildFootrestPlateMaterial(style);
      child.visible = true;
      child.frustumCulled = false;
    });
  }

  applyBackrestStyle(object) {
    if (!object) {
      return;
    }
    object.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) {
        return;
      }
      const previous = Array.isArray(child.material) ? child.material : [child.material];
      previous.forEach((material) => material && material.dispose && material.dispose());
      child.material = buildBlackFabricMaterial();
      child.visible = true;
      child.frustumCulled = false;
    });
  }

  applySideguardStyle(object, style) {
    if (!object) {
      return;
    }
    object.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) {
        return;
      }
      const previous = Array.isArray(child.material) ? child.material : [child.material];
      previous.forEach((material) => material && material.dispose && material.dispose());
      child.material = buildSideguardMaterial(style);
      child.visible = true;
      child.frustumCulled = false;
    });
  }

  loadObject(part, onProgress) {
    return this.loadGlb(part.src, onProgress).then((object) => {
      if (part && part.tint) {
        this.applySolidTintMaterials(object);
      }
      if (part && part.blackWheel) {
        this.applyBlackWheelMaterials(object);
      }
      if (part && part.seatStyle) {
        this.applySeatStyle(object, part.seatStyle);
      }
      if (part && part.footrestPlateStyle) {
        this.applyFootrestPlateStyle(object, part.footrestPlateStyle);
      }
      if (part && part.backrestStyle) {
        this.applyBackrestStyle(object);
      }
      if (part && part.sideguardStyle) {
        this.applySideguardStyle(object, part.sideguardStyle);
      }
      return object;
    });
  }

  getPreloadSourcesForModel(sourceModel) {
    if ((sourceModel || "").toUpperCase() !== "S5") {
      return [];
    }
    return [
      "/models/S5/frame-split/100 left short fork.glb",
      "/models/S5/frame-split/100 left long fork.glb",
      "/models/S5/frame-split/90 left short fork .glb",
      "/models/S5/frame-split/90 left long fork .glb",
      "/models/S5/frame-split/100 right short fork.glb",
      "/models/S5/frame-split/100 right long fork.glb",
      "/models/S5/frame-split/90 right short fork.glb",
      "/models/S5/frame-split/90 right long fork.glb",
      "/models/S5/frame-split/100 step.glb",
      "/models/S5/frame-split/90 step.glb",
    ];
  }

  preloadSources(sources = []) {
    sources.forEach((src) => {
      if (!src || this.glbCache.has(src) || this.glbPreloadPromises.has(src)) {
        return;
      }
      const promise = this.loadGlb(src)
        .then((scene) => {
          this.glbCache.set(src, scene);
          this.glbPreloadPromises.delete(src);
          return scene;
        })
        .catch(() => {
          this.glbPreloadPromises.delete(src);
        });
      this.glbPreloadPromises.set(src, promise);
    });
  }

  loadGlb(src, onProgress) {
    if (this.glbCache.has(src)) {
      return Promise.resolve(cloneSceneForUse(this.glbCache.get(src)));
    }
    const inflightPreload = this.glbPreloadPromises.get(src);
    if (inflightPreload) {
      return inflightPreload.then((scene) => cloneSceneForUse(scene || this.glbCache.get(src)));
    }
    return new Promise((resolve, reject) => {
      const loader = this.getGlbLoader();
      const timeoutId = window.setTimeout(() => {
        reject(new Error(`GLB load timeout: ${src}`));
      }, getLoadTimeoutMs());

      loader.load(
        src,
        (gltf) => {
          window.clearTimeout(timeoutId);
          this.glbCache.set(src, gltf.scene);
          resolve(cloneSceneForUse(gltf.scene));
        },
        (evt) => onProgress && onProgress(evt),
        (error) => {
          window.clearTimeout(timeoutId);
          reject(error);
        }
      );
    });
  }

  disposeObject(object) {
    object.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.geometry.dispose();
        if (Array.isArray(child.material)) {
          child.material.forEach((material) => material && material.dispose && material.dispose());
        } else if (child.material && child.material.dispose) {
          child.material.dispose();
        }
      }
    });
  }

  clearObject() {
    if (this.scene && this.modelRoot) {
      this.scene.remove(this.modelRoot);
      this.disposeObject(this.modelRoot);
      this.modelRoot = null;
    }
    this.colorTargets = [];
    this.partObjects = [];
    this.transitions = [];
  }

  getSeatWidthCm(selection) {
    const value = (selection && selection.seatWidth) || "";
    switch (value) {
      case "sw-36":
        return 36;
      case "sw-39":
        return 39;
      case "sw-42":
        return 42;
      case "sw-45":
        return 45;
      case "sw-48":
        return 48;
      default:
        return 40;
    }
  }

  getSeatDepthCm(selection) {
    const value = (selection && selection.seatDepth) || "";
    switch (value) {
      case "sd-37-5":
        return 37.5;
      case "sd-42-5":
        return 42.5;
      case "sd-45":
        return 45;
      case "sd-47-5":
        return 47.5;
      case "sd-40":
      default:
        return 40;
    }
  }

  getFrameAngleTargets(frameObject) {
    if (!frameObject) {
      return [];
    }

    if (Array.isArray(frameObject.userData.frameAngleTargets)) {
      return frameObject.userData.frameAngleTargets;
    }

    const targets = [];
    frameObject.updateMatrixWorld(true);
    const frameBox = new THREE.Box3().setFromObject(frameObject);
    const zThreshold = frameBox.min.z + (frameBox.max.z - frameBox.min.z) * 0.54;
    const yThreshold = frameBox.min.y + (frameBox.max.y - frameBox.min.y) * 0.74;

    frameObject.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) {
        return;
      }

      if (!child.geometry) {
        return;
      }
      if (!child.geometry.boundingBox) {
        child.geometry.computeBoundingBox();
      }
      if (!child.geometry.boundingBox) {
        return;
      }

      const center = child.geometry.boundingBox.getCenter(new THREE.Vector3()).applyMatrix4(child.matrixWorld);

      if (center.z <= zThreshold || center.y >= yThreshold) {
        return;
      }

      child.userData.basePosition = child.position.clone();
      child.userData.baseRotation = child.rotation.clone();
      child.userData.baseQuaternion = child.quaternion.clone();
      targets.push(child);
    });

    frameObject.userData.frameAngleTargets = targets;
    return targets;
  }

  getFrameLengthMode(selection) {
    return (selection && selection.frameLength) === "fl-long" ? 1 : 0;
  }

  findNamedFramePivot(frameObject) {
    if (!frameObject) {
      return null;
    }

    if (frameObject.userData.namedFramePivot !== undefined) {
      return frameObject.userData.namedFramePivot;
    }

    let pivot = null;
    frameObject.traverse((child) => {
      if (pivot || !child || child === frameObject) {
        return;
      }
      if (child.name === "FrontAnglePivot") {
        pivot = child;
      }
    });

    frameObject.userData.namedFramePivot = pivot || null;
    return frameObject.userData.namedFramePivot;
  }

  getFramePartObject() {
    const frameEntry = this.partObjects.find(
      (entry) => entry && (entry.key === "frame-middle" || entry.key === "frame")
    ) || this.partObjects.find((entry) => entry && this.isFramePartKey(entry.key));
    return frameEntry ? frameEntry.object : null;
  }

  isFramePartKey(key) {
    return key === "frame" || (typeof key === "string" && key.indexOf("frame-") === 0);
  }

  getFramePartEntries() {
    return this.partObjects.filter((entry) => entry && this.isFramePartKey(entry.key));
  }

  getFramePartEntry(key) {
    return this.partObjects.find((entry) => entry && entry.key === key) || null;
  }

  hasSplitFrameParts() {
    return !!this.getFramePartEntry("frame-middle");
  }

  getActiveForkEntries(selection) {
    const isFrontAngle90 = (selection && selection.frameAngle) === "fa-90";
    return {
      leftFork: this.getFramePartEntry(isFrontAngle90 ? "frame-left-fork-90" : "frame-left-fork-100"),
      rightFork: this.getFramePartEntry(isFrontAngle90 ? "frame-right-fork-90" : "frame-right-fork-100"),
    };
  }

  resetFramePartTransform(object) {
    if (!object) {
      return;
    }
    if (!object.userData.baseSplitFramePosition) {
      object.userData.baseSplitFramePosition = object.position.clone();
      object.userData.baseSplitFrameRotation = object.rotation.clone();
      object.userData.baseSplitFrameScale = object.scale.clone();
    }
    object.position.copy(object.userData.baseSplitFramePosition);
    object.rotation.copy(object.userData.baseSplitFrameRotation);
    object.scale.copy(object.userData.baseSplitFrameScale);
  }

  getNamedDescendant(rootObject, name) {
    if (!rootObject || !name) {
      return null;
    }
    let match = null;
    rootObject.traverse((child) => {
      if (match || !child) {
        return;
      }
      if (child.name === name) {
        match = child;
      }
    });
    return match;
  }

  getObjectLocalBoundsCenter(object) {
    if (!object) {
      return null;
    }
    const box = new THREE.Box3().setFromObject(object);
    if (box.isEmpty()) {
      return null;
    }
    return object.parent ? object.parent.worldToLocal(box.getCenter(new THREE.Vector3())) : box.getCenter(new THREE.Vector3());
  }

  rotateChildAroundPivot(child, pivotPoint, angleRadians) {
    if (!child || !pivotPoint) {
      return;
    }

    const basePosition = child.position.clone();
    const baseRotation = child.rotation.clone();
    const nextPosition = basePosition.clone().sub(pivotPoint).applyAxisAngle(new THREE.Vector3(1, 0, 0), angleRadians).add(pivotPoint);
    child.position.copy(nextPosition);
    child.rotation.copy(baseRotation);
    child.rotation.x += angleRadians;
  }

  applyLeftForkAngleVariant(object, isFrontAngle90) {
    if (!object) {
      return;
    }

    const angleRadians = isFrontAngle90 ? THREE.MathUtils.degToRad(-10) : 0;
    const pivotCenters = LEFT_FORK_PIVOT_HELPER_NAMES.map((name) =>
      this.getObjectLocalBoundsCenter(this.getNamedDescendant(object, name))
    ).filter(Boolean);

    if (!pivotCenters.length) {
      return;
    }

    const pivotPoint = pivotCenters.reduce(
      (sum, point) => sum.add(point),
      new THREE.Vector3()
    ).multiplyScalar(1 / pivotCenters.length);

    LEFT_FORK_ANGLE_TARGET_NAMES.forEach((name) => {
      const child = this.getNamedDescendant(object, name);
      if (!child) {
        return;
      }
      this.rotateChildAroundPivot(child, pivotPoint, angleRadians);
    });

    if (isFrontAngle90) {
      const tube = this.getNamedDescendant(object, LEFT_FORK_LENGTH_TUBE_NAME);
      if (tube) {
        const baseScaleZ =
          (tube.userData.baseForkLengthScale && tube.userData.baseForkLengthScale.z) || tube.scale.z || 1;
        const currentLengthFactor = tube.scale.z / baseScaleZ;
        const currentLengthMeters = LEFT_FORK_BASE_TUBE_LENGTH_M * currentLengthFactor;
        const overlapScaleFactor = 1 + LEFT_FORK_ANGLE_OVERLAP_90_M / currentLengthMeters;
        tube.scale.z *= overlapScaleFactor;

        const toPivot = pivotPoint.clone().sub(tube.position);
        if (toPivot.lengthSq() > 1e-8) {
          tube.position.add(toPivot.normalize().multiplyScalar(-LEFT_FORK_ANGLE_OVERLAP_90_M));
        }
      }
    }
  }

  applySplitFrameParametricControls(selection) {
    if (!this.hasSplitFrameParts()) {
      return false;
    }

    const seatWidthCm = this.getSeatWidthCm(selection);
    const halfOffsetMeters = ((seatWidthCm - FRAME_BASE_SEAT_WIDTH_CM) * 0.01) * 0.5;
    const middle = this.getFramePartEntry("frame-middle");
    const leftBody = this.getFramePartEntry("frame-left-body");
    const rightBody = this.getFramePartEntry("frame-right-body");
    const { leftFork, rightFork } = this.getActiveForkEntries(selection);
    const allForks = [
      this.getFramePartEntry("frame-left-fork-100"),
      this.getFramePartEntry("frame-left-fork-90"),
      this.getFramePartEntry("frame-right-fork-100"),
      this.getFramePartEntry("frame-right-fork-90"),
    ].filter(Boolean);

    [middle, leftBody, rightBody, ...allForks].forEach((entry) => {
      if (entry && entry.object) {
        this.resetFramePartTransform(entry.object);
      }
    });

    allForks.forEach((entry) => {
      if (entry && entry.object) {
        entry.object.visible = false;
      }
    });

    if (leftBody && leftBody.object) {
      leftBody.object.position.x -= halfOffsetMeters;
    }
    if (rightBody && rightBody.object) {
      rightBody.object.position.x += halfOffsetMeters;
    }

    const applyForkTransform = (entry, direction) => {
      if (!entry || !entry.object) {
        return;
      }
      const object = entry.object;
      object.visible = true;
      object.position.x += direction * halfOffsetMeters;
    };

    applyForkTransform(leftFork, -1);
    applyForkTransform(rightFork, 1);
    if (middle && middle.object) {
      this.resetSeatWidthGeometry(middle.object);
      this.applyCenteredGeometryWidthDelta(
        middle.object,
        (seatWidthCm - FRAME_BASE_SEAT_WIDTH_CM) * 0.01
      );
    }

    return true;
  }

  getFrontAnglePivotLocalPoint() {
    if (!this.modelRoot) {
      return null;
    }
    const frameObject = this.getFramePartObject();
    if (!frameObject) {
      return null;
    }
    const pivot = this.findNamedFramePivot(frameObject);
    if (!pivot) {
      return null;
    }
    frameObject.updateMatrixWorld(true);
    this.modelRoot.updateMatrixWorld(true);
    const pivotWorld = new THREE.Vector3();
    pivot.getWorldPosition(pivotWorld);
    return this.modelRoot.worldToLocal(pivotWorld.clone());
  }

  applyRotationAroundSharedPivot(object, pivotPoint, angleRadians, offsets = null) {
    if (!object || !pivotPoint) {
      return false;
    }

    const rotation = new THREE.Euler(angleRadians, 0, 0, "XYZ");
    object.rotation.copy(rotation);

    const rotatedPivot = pivotPoint.clone().applyEuler(rotation);
    object.position.copy(pivotPoint).sub(rotatedPivot);

    if (offsets) {
      object.position.x += offsets.x || 0;
      object.position.y += offsets.y || 0;
      object.position.z += offsets.z || 0;
    }

    return true;
  }

  applyFrameParametricControls(frameObject, selection) {
    if (!frameObject) {
      return false;
    }

    const pivot = this.findNamedFramePivot(frameObject);
    if (!pivot) {
      return false;
    }

    if (!pivot.userData.basePosition) {
      pivot.userData.basePosition = pivot.position.clone();
      pivot.userData.baseRotation = pivot.rotation.clone();
      frameObject.updateMatrixWorld(true);
      pivot.updateMatrixWorld(true);
      pivot.userData.baseMatrixWorld = pivot.matrixWorld.clone();
      pivot.userData.baseMatrixWorldInverse = pivot.matrixWorld.clone().invert();
    }

    const isFrontAngle90 = (selection && selection.frameAngle) === "fa-90";
    const frameLengthMode = this.getFrameLengthMode(selection);
    const activeFrameAdjust = isFrontAngle90 ? this.debugFrame90Adjust : this.debugFrame100Adjust;
    const seatWidthCm = this.getSeatWidthCm(selection);

    pivot.position.copy(pivot.userData.basePosition);
    pivot.rotation.copy(pivot.userData.baseRotation);
    pivot.rotation.x += THREE.MathUtils.degToRad(activeFrameAdjust.rotationDeg);
    pivot.position.x += activeFrameAdjust.x;
    pivot.position.y += activeFrameAdjust.y;
    pivot.position.z += activeFrameAdjust.z;
    pivot.position.y += frameLengthMode ? -0.03 : 0;
    frameObject.updateMatrixWorld(true);
    pivot.updateMatrixWorld(true);
    pivot.userData.currentDeltaWorldMatrix = pivot.matrixWorld
      .clone()
      .multiply(pivot.userData.baseMatrixWorldInverse.clone());

    frameObject.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) {
        return;
      }
      if (!child.userData.baseMorphInfluences && Array.isArray(child.morphTargetInfluences)) {
        child.userData.baseMorphInfluences = child.morphTargetInfluences.slice();
      }
      if (!child.morphTargetDictionary || !Array.isArray(child.morphTargetInfluences)) {
        return;
      }

      const longLengthIndex = child.morphTargetDictionary.LongLength;
      if (longLengthIndex === undefined) {
        return;
      }

      const baseInfluences = child.userData.baseMorphInfluences || child.morphTargetInfluences;
      for (let index = 0; index < child.morphTargetInfluences.length; index += 1) {
        child.morphTargetInfluences[index] = baseInfluences[index] || 0;
      }
      child.morphTargetInfluences[longLengthIndex] = frameLengthMode;
    });

    this.applyFrameSeatWidthTargets(frameObject, seatWidthCm);

    return true;
  }

  applyFrameSeatWidthTargets(frameObject, seatWidthCm) {
    if (!frameObject) {
      return;
    }

    const halfOffsetMeters = ((seatWidthCm - FRAME_BASE_SEAT_WIDTH_CM) * 0.01) * 0.5;
    const widthDeltaMeters = (seatWidthCm - FRAME_BASE_SEAT_WIDTH_CM) * 0.01;

    frameObject.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) {
        return;
      }

      const childName = child.name || "";
      const isLeft = FRAME_LEFT_WIDTH_TARGETS.has(childName);
      const isMiddle = FRAME_MIDDLE_WIDTH_TARGETS.has(childName);
      const isRight = FRAME_RIGHT_WIDTH_TARGETS.has(childName);

      if (!isLeft && !isMiddle && !isRight) {
        return;
      }

      if (!child.userData.baseSeatWidthPosition) {
        child.userData.baseSeatWidthPosition = child.position.clone();
        child.userData.baseSeatWidthScale = child.scale.clone();
      }

      child.position.copy(child.userData.baseSeatWidthPosition);
      child.scale.copy(child.userData.baseSeatWidthScale);

      if (isLeft) {
        child.position.x -= halfOffsetMeters;
        return;
      }

      if (isRight) {
        child.position.x += halfOffsetMeters;
        return;
      }

      if (isMiddle) {
        this.resetSeatWidthGeometry(child);
        this.applyCenteredGeometryWidthDelta(child, widthDeltaMeters);
      }
    });
  }

  clearManualAdjustmentBases() {
    this.partObjects.forEach(({ object }) => {
      if (!object || !object.userData) {
        return;
      }
      delete object.userData.baseManualAdjustPosition;
      delete object.userData.baseManualAdjustRotation;
      delete object.userData.manualRotationPivotLocal;
    });
  }

  ensureMutableSeatWidthGeometry(mesh) {
    if (!(mesh instanceof THREE.Mesh) || !mesh.geometry) {
      return null;
    }
    if (!mesh.userData.seatWidthGeometryBase) {
      mesh.geometry = mesh.geometry.clone();
      let position = mesh.geometry.getAttribute("position");
      if (!position) {
        return null;
      }
      if (position.normalized || !(position.array instanceof Float32Array)) {
        const floatPositions = new Float32Array(position.count * 3);
        for (let index = 0; index < position.count; index += 1) {
          const offset = index * 3;
          floatPositions[offset] = position.getX(index);
          floatPositions[offset + 1] = position.getY(index);
          floatPositions[offset + 2] = position.getZ(index);
        }
        mesh.geometry.setAttribute(
          "position",
          new THREE.Float32BufferAttribute(floatPositions, 3)
        );
        position = mesh.geometry.getAttribute("position");
      }
      mesh.geometry.computeBoundingBox();
      const box = mesh.geometry.boundingBox;
      const base = new Float32Array(position.count * 3);
      for (let index = 0; index < position.count; index += 1) {
        const offset = index * 3;
        base[offset] = position.getX(index);
        base[offset + 1] = position.getY(index);
        base[offset + 2] = position.getZ(index);
      }
      mesh.userData.seatWidthGeometryBase = base;
      mesh.userData.seatWidthGeometryCenterX = (box.min.x + box.max.x) * 0.5;
      mesh.userData.seatWidthGeometrySpanX = box.max.x - box.min.x;
    }
    return {
      position: mesh.geometry.getAttribute("position"),
      base: mesh.userData.seatWidthGeometryBase,
      centerX: mesh.userData.seatWidthGeometryCenterX,
      spanX: mesh.userData.seatWidthGeometrySpanX,
    };
  }

  finishSeatWidthGeometryUpdate(mesh, position) {
    position.needsUpdate = true;
    mesh.geometry.computeBoundingBox();
    mesh.geometry.computeBoundingSphere();
  }

  resetSeatWidthGeometry(object) {
    if (!object) {
      return;
    }
    object.traverse((child) => {
      if (!(child instanceof THREE.Mesh) || !child.geometry || !child.userData.seatWidthGeometryBase) {
        return;
      }
      const position = child.geometry.getAttribute("position");
      for (let index = 0; index < position.count; index += 1) {
        const offset = index * 3;
        position.setXYZ(
          index,
          child.userData.seatWidthGeometryBase[offset],
          child.userData.seatWidthGeometryBase[offset + 1],
          child.userData.seatWidthGeometryBase[offset + 2]
        );
      }
      this.finishSeatWidthGeometryUpdate(child, position);
    });
  }

  applyCenteredGeometryWidthDelta(object, widthDeltaMeters) {
    if (!object) {
      return;
    }
    object.updateMatrixWorld(true);
    const bounds = new THREE.Box3().setFromObject(object);
    const centerX = (bounds.min.x + bounds.max.x) * 0.5;
    const halfDeltaMeters = widthDeltaMeters * 0.5;
    const worldVertex = new THREE.Vector3();
    const localVertex = new THREE.Vector3();
    object.traverse((child) => {
      const geometryData = this.ensureMutableSeatWidthGeometry(child);
      if (!geometryData) {
        return;
      }
      child.updateMatrixWorld(true);
      const inverseWorld = child.matrixWorld.clone().invert();
      for (let index = 0; index < geometryData.position.count; index += 1) {
        const offset = index * 3;
        worldVertex
          .set(
            geometryData.base[offset],
            geometryData.base[offset + 1],
            geometryData.base[offset + 2]
          )
          .applyMatrix4(child.matrixWorld);
        if (worldVertex.x < centerX - 1e-7) {
          worldVertex.x -= halfDeltaMeters;
        } else if (worldVertex.x > centerX + 1e-7) {
          worldVertex.x += halfDeltaMeters;
        }
        localVertex.copy(worldVertex).applyMatrix4(inverseWorld);
        geometryData.position.setXYZ(index, localVertex.x, localVertex.y, localVertex.z);
      }
      this.finishSeatWidthGeometryUpdate(child, geometryData.position);
    });
  }

  applyPairedAssemblyWidthOffset(object, seatWidthCm, referenceWidthCm = FRAME_BASE_SEAT_WIDTH_CM) {
    if (!object) {
      return;
    }
    object.updateMatrixWorld(true);
    if (!object.userData.seatWidthAssemblyCenterX) {
      const bounds = new THREE.Box3().setFromObject(object);
      object.userData.seatWidthAssemblyCenterX = (bounds.min.x + bounds.max.x) * 0.5;
    }
    const assemblyCenterX = object.userData.seatWidthAssemblyCenterX;
    const halfDeltaMeters = ((seatWidthCm - referenceWidthCm) * 0.01) * 0.5;
    object.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) {
        return;
      }
      if (!child.userData.baseSeatWidthPartPosition) {
        child.userData.baseSeatWidthPartPosition = child.position.clone();
        const bounds = new THREE.Box3().setFromObject(child);
        const centerX = (bounds.min.x + bounds.max.x) * 0.5;
        child.userData.seatWidthPartDirection =
          centerX < assemblyCenterX - 0.005 ? -1 : centerX > assemblyCenterX + 0.005 ? 1 : 0;
      }
      child.position.copy(child.userData.baseSeatWidthPartPosition);
      child.position.x += child.userData.seatWidthPartDirection * halfDeltaMeters;
    });
  }

  applyPairedWheelGeometryWidthOffset(
    object,
    seatWidthCm,
    referenceWidthCm = S5_WHEEL_FOOTREST_REFERENCE_SEAT_WIDTH_CM
  ) {
    if (!object) {
      return;
    }
    object.updateMatrixWorld(true);
    object.traverse((child) => {
      const geometryData = this.ensureMutableSeatWidthGeometry(child);
      if (!geometryData) {
        return;
      }
      const worldScale = child.getWorldScale(new THREE.Vector3());
      const worldSpanX = geometryData.spanX * Math.abs(worldScale.x);
      if (worldSpanX < 0.25) {
        return;
      }
      const localHalfDelta =
        (((seatWidthCm - referenceWidthCm) * 0.01) * 0.5) /
        Math.max(Math.abs(worldScale.x), 1e-8);
      for (let index = 0; index < geometryData.position.count; index += 1) {
        const offset = index * 3;
        const baseX = geometryData.base[offset];
        geometryData.position.setXYZ(
          index,
          baseX + (baseX < geometryData.centerX ? -localHalfDelta : localHalfDelta),
          geometryData.base[offset + 1],
          geometryData.base[offset + 2]
        );
      }
      this.finishSeatWidthGeometryUpdate(child, geometryData.position);
    });
  }

  applySeatWidthLateralOffset(object, seatWidthCm) {
    if (!object) {
      return;
    }

    const halfOffsetMeters = ((seatWidthCm - FRAME_BASE_SEAT_WIDTH_CM) * 0.01) * 0.5;

    if (!object.userData.baseSeatWidthPosition) {
      object.userData.baseSeatWidthPosition = object.position.clone();
      const bounds = new THREE.Box3().setFromObject(object);
      object.userData.baseSeatWidthCenterX = (bounds.min.x + bounds.max.x) * 0.5;
    }

    const centerX = object.userData.baseSeatWidthCenterX || 0;
    const direction = centerX < 0 ? -1 : centerX > 0 ? 1 : 0;
    object.position.copy(object.userData.baseSeatWidthPosition);
    object.position.x += direction * halfOffsetMeters;
  }

  applyFrontCasterInstancePlacement(
    object,
    side,
    seatWidthCm,
    depthDelta,
    activeAdjust,
    frameLengthOffset = 0,
    absoluteAdjust = null
  ) {
    if (!object) {
      return;
    }

    const halfOffsetMeters = ((seatWidthCm - FRAME_BASE_SEAT_WIDTH_CM) * 0.01) * 0.5;
    const direction = side < 0 ? -1 : 1;
    const mirrorX = !!(object.userData && object.userData.partMirrorX);

    object.position.set(0, 0, 0);
    object.rotation.set(0, 0, 0);
    object.scale.set(mirrorX ? -1 : 1, 1, 1);

    object.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) {
        return;
      }
      child.visible = true;
      child.frustumCulled = false;
      if (Array.isArray(child.material)) {
        child.material.forEach((material) => {
          if (material) material.side = THREE.DoubleSide;
        });
        return;
      }
      if (child.material) {
        child.material.side = THREE.DoubleSide;
      }
    });

    if (absoluteAdjust && absoluteAdjust.mode === "absolute") {
      object.position.set(
        absoluteAdjust.position.x,
        absoluteAdjust.position.y,
        absoluteAdjust.position.z
      );
      object.rotation.set(
        THREE.MathUtils.degToRad(absoluteAdjust.rotationDeg.x || 0),
        THREE.MathUtils.degToRad(absoluteAdjust.rotationDeg.y || 0),
        THREE.MathUtils.degToRad(absoluteAdjust.rotationDeg.z || 0)
      );
      return;
    }

    object.position.x = direction * (FRONT_CASTER_BASE_HALF_SPAN_M + halfOffsetMeters) + (activeAdjust.x || 0);
    object.position.y = activeAdjust.y || 0;
    object.position.z = (activeAdjust.z || 0) - depthDelta * 0.7 + frameLengthOffset;
    object.rotation.x = THREE.MathUtils.degToRad(activeAdjust.rotationDeg || 0);

    // Neutralize the baked local offset inside Lenkraerder-single.glb.
    object.position.x -= direction * FRONT_CASTER_MODEL_OFFSET.x;
    object.position.y -= FRONT_CASTER_MODEL_OFFSET.y;
    object.position.z -= FRONT_CASTER_MODEL_OFFSET.z;

  }

  applySharedFrontDeltaFromFrame(object, frameObject, offsets = null) {
    if (!object || !frameObject || !this.modelRoot) {
      return false;
    }

    const pivot = this.findNamedFramePivot(frameObject);
    if (!pivot || !pivot.userData.currentDeltaWorldMatrix) {
      return false;
    }

    this.modelRoot.updateMatrixWorld(true);
    object.updateMatrixWorld(true);

    if (!object.userData.baseMatrixWorld) {
      object.userData.baseMatrixWorld = object.matrixWorld.clone();
    }

    const nextWorldMatrix = pivot.userData.currentDeltaWorldMatrix
      .clone()
      .multiply(object.userData.baseMatrixWorld.clone());
    const parentInverse = this.modelRoot.matrixWorld.clone().invert();
    const nextLocalMatrix = parentInverse.multiply(nextWorldMatrix);
    const nextPosition = new THREE.Vector3();
    const nextQuaternion = new THREE.Quaternion();
    const nextScale = new THREE.Vector3();
    nextLocalMatrix.decompose(nextPosition, nextQuaternion, nextScale);

    object.position.copy(nextPosition);
    object.quaternion.copy(nextQuaternion);
    object.scale.copy(nextScale);

    if (offsets) {
      object.position.x += offsets.x || 0;
      object.position.y += offsets.y || 0;
      object.position.z += offsets.z || 0;
      if (offsets.rotationDeg) {
        object.rotation.x += THREE.MathUtils.degToRad(offsets.rotationDeg);
      }
    }

    return true;
  }

  ensureFrameAngleRig(frameObject) {
    if (!frameObject) {
      return null;
    }

    if (frameObject.userData.frameAngleRig) {
      return frameObject.userData.frameAngleRig;
    }

    const targets = this.getFrameAngleTargets(frameObject);
    if (!targets.length) {
      return null;
    }

    const rig = new THREE.Group();
    rig.name = "wc-frame-angle-rig";

    const box = new THREE.Box3().setFromObject(frameObject);
    const pivotWorld = new THREE.Vector3(
      (box.min.x + box.max.x) * 0.5,
      box.min.y + (box.max.y - box.min.y) * 0.24,
      box.min.z + (box.max.z - box.min.z) * 0.58
    );
    const pivotLocal = frameObject.worldToLocal(pivotWorld.clone());

    rig.position.copy(pivotLocal);
    frameObject.add(rig);

    targets.forEach((child) => {
      rig.attach(child);
    });

    const rigData = { rig, pivotLocal };
    frameObject.userData.frameAngleRig = rigData;
    return rigData;
  }

  applyFrameAngleFallback(frameObject, isFrontAngle90) {
    if (!frameObject) {
      return;
    }

    const rigData = this.ensureFrameAngleRig(frameObject);
    if (!rigData || !rigData.rig) {
      return;
    }

    const rig = rigData.rig;
    rig.rotation.set(0, 0, 0);
    rig.position.copy(rigData.pivotLocal);

    if (!isFrontAngle90) {
      return;
    }

    rig.rotation.x = THREE.MathUtils.degToRad(-8);
    rig.position.y += 0.004;
    rig.position.z += 0.008;
  }

  applyDimensionAdjustments(selection) {
    if (!this.partObjects.length) {
      return;
    }

    const baseSeatWidthCm = 40;
    const seatWidthCm = this.getSeatWidthCm(selection);
    const seatDepthCm = this.getSeatDepthCm(selection);
    // Only Sitzbespannung follows the selected seat depth. The rest of the
    // assembly stays at the verified 37.5 cm reference placement.
    // The GLB seat mesh itself is authored at 40 cm. Keeping this scale base
    // restores the verified 37.5 cm assembly while only the seat changes for
    // the remaining depth options.
    const seatDepthScale = seatDepthCm / LEGACY_SEAT_DEPTH_REFERENCE_CM;
    const fixedReferenceDepthScale = S5_SEAT_DEPTH_REFERENCE_CM / LEGACY_SEAT_DEPTH_REFERENCE_CM;
    const fixedReferenceDepthDelta =
      (S5_SEAT_DEPTH_REFERENCE_CM - LEGACY_SEAT_DEPTH_REFERENCE_CM) * 0.01;
    const isFrontAngle90 = (selection && selection.frameAngle) === "fa-90";
    const frameLengthMode = this.getFrameLengthMode(selection);
    const frameLengthOffset = frameLengthMode ? LEFT_FORK_LONG_EXTENSION_M : 0;
    const activeFrameAdjust = isFrontAngle90 ? this.debugFrame90Adjust : this.debugFrame100Adjust;
    const hasSplitFrame = this.hasSplitFrameParts();
    const resolvedAdjustments = this.getResolvedObjectAdjustments(selection || {});
    const footrestAbsoluteAdjust = resolvedAdjustments.get("footrest");
    const frontCasterLeftAbsoluteAdjust = resolvedAdjustments.get("frontCasterLeft");
    const frontCasterRightAbsoluteAdjust = resolvedAdjustments.get("frontCasterRight");

    // Manual deltas must be based on the current parametric assembly, not on a
    // position cached by the previously selected width.
    this.clearManualAdjustmentBases();

    this.partObjects.forEach(({ key, object }) => {
      const preserveSplitFrameBase = hasSplitFrame && this.isFramePartKey(key);
      if (!preserveSplitFrameBase) {
        object.scale.set(1, 1, 1);
        object.position.set(0, 0, 0);
        object.rotation.set(0, 0, 0);
      }

      switch (key) {
        case "frame":
          if (!this.applyFrameParametricControls(object, selection)) {
            object.scale.z = fixedReferenceDepthScale;
            this.applyFrameAngleFallback(object, isFrontAngle90);
          }
          break;
        case "frame-middle":
        case "frame-left-body":
        case "frame-right-body":
        case "frame-left-fork-100":
        case "frame-right-fork-100":
        case "frame-left-fork-90":
        case "frame-right-fork-90":
          break;
        case "seat":
          object.scale.z = seatDepthScale;
          this.resetSeatWidthGeometry(object);
          this.applyCenteredGeometryWidthDelta(
            object,
            (seatWidthCm - baseSeatWidthCm) * 0.01
          );
          break;
        case "backrest":
          object.scale.z = fixedReferenceDepthScale;
          this.resetSeatWidthGeometry(object);
          this.applyCenteredGeometryWidthDelta(
            object,
            (seatWidthCm - baseSeatWidthCm) * 0.01
          );
          break;
        case "sideguards":
          object.scale.x = 1;
          object.scale.z = fixedReferenceDepthScale;
          if (isFrontAngle90) {
            object.position.y += 0.003;
            object.position.z += 0.01;
          }
          break;
        case "sideguardLeft":
        case "sideguardRight":
          object.scale.x = object.userData.partMirrorX ? -1 : 1;
          object.scale.z = fixedReferenceDepthScale;
          if (isFrontAngle90) {
            object.position.y += 0.003;
            object.position.z += 0.01;
          }
          break;
        case "footrest":
          object.scale.x = 1;
          object.scale.z = fixedReferenceDepthScale;
          if (footrestAbsoluteAdjust && footrestAbsoluteAdjust.mode === "absolute") {
            object.position.set(
              footrestAbsoluteAdjust.position.x,
              footrestAbsoluteAdjust.position.y,
              footrestAbsoluteAdjust.position.z
            );
            object.rotation.set(
              THREE.MathUtils.degToRad(footrestAbsoluteAdjust.rotationDeg.x || 0),
              THREE.MathUtils.degToRad(footrestAbsoluteAdjust.rotationDeg.y || 0),
              THREE.MathUtils.degToRad(footrestAbsoluteAdjust.rotationDeg.z || 0)
            );
            break;
          }
          if (!footrestAbsoluteAdjust) {
            object.position.z += frameLengthOffset;
          }
          if (isFrontAngle90 && !footrestAbsoluteAdjust) {
            object.rotation.x = THREE.MathUtils.degToRad(
              this.debugFootrest90Adjust.rotationDeg + activeFrameAdjust.rotationDeg
            );
            object.position.x += this.debugFootrest90Adjust.x + activeFrameAdjust.x;
            object.position.y += this.debugFootrest90Adjust.y + activeFrameAdjust.y;
            object.position.z += this.debugFootrest90Adjust.z + activeFrameAdjust.z;
          }
          break;
        case "footrestPlate":
          object.scale.x = 1;
          object.scale.z = fixedReferenceDepthScale;
          this.resetSeatWidthGeometry(object);
          break;
        case "frontCasterLeft":
          this.applyFrontCasterInstancePlacement(
            object,
            -1,
            seatWidthCm,
            fixedReferenceDepthDelta,
            isFrontAngle90 ? this.debugFrontCaster90Adjust : activeFrameAdjust,
            frameLengthOffset,
            frontCasterLeftAbsoluteAdjust
          );
          break;
        case "frontCasterRight":
          this.applyFrontCasterInstancePlacement(
            object,
            1,
            seatWidthCm,
            fixedReferenceDepthDelta,
            isFrontAngle90 ? this.debugFrontCaster90Adjust : activeFrameAdjust,
            frameLengthOffset,
            frontCasterRightAbsoluteAdjust
          );
          break;
        case "rearWheel":
        case "handrim":
          this.applySeatWidthLateralOffset(object, S5_WHEEL_FOOTREST_REFERENCE_SEAT_WIDTH_CM);
          this.applyPairedWheelGeometryWidthOffset(object, seatWidthCm);
          break;
        case "axle":
        case "brake":
          this.applySeatWidthLateralOffset(object, seatWidthCm);
          break;
        case "backrestHandles":
        case "antiTip":
        case "tippingHelp":
        case "transitWheels":
          if (key === "antiTip" || key === "tippingHelp" || key === "transitWheels") {
            object.position.z -= fixedReferenceDepthDelta * 0.45;
          }
          break;
        default:
          break;
      }
    });

    if (hasSplitFrame) {
      this.applySplitFrameParametricControls(selection);
    }

    this.applyManualObjectAdjustments(selection || {});
  }

  normalizeToGrid(object, center) {
    const objectCenter = center || new THREE.Box3().setFromObject(object).getCenter(new THREE.Vector3());
    object.position.sub(objectCenter);
    const updatedBox = new THREE.Box3().setFromObject(object);
    const minY = updatedBox.min.y;
    if (Number.isFinite(minY)) {
      object.position.y -= minY;
    }
  }

  fitCameraToObject(object) {
    if (!this.camera || !this.controls) return;
    const box = new THREE.Box3().setFromObject(object);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    this.normalizeToGrid(object, center);
    const maxDim = Math.max(size.x, size.y, size.z);
    const distance = maxDim * 1.6 || 1;

    this.camera.position.set(distance, distance, distance);
    this.camera.near = distance / 100;
    this.camera.far = distance * 100;
    this.camera.updateProjectionMatrix();
    this.controls.target.set(0, 0, 0);
    this.controls.update();
  }

  applyFrameColor(frameColor) {
    if (!frameColor || !this.colorTargets.length) return;
    const color = new THREE.Color(frameColor);
    this.colorTargets.forEach((target) => {
      target.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.visible = true;
          child.frustumCulled = false;
          child.renderOrder = 1;
          const materials = Array.isArray(child.material) ? child.material : [child.material];
          const nextMaterials = materials.map((material) => {
            if (child.userData && child.userData.wcSolidTintMaterial) {
              if (material && material.color) {
                material.color.copy(color);
                if ("emissive" in material && material.emissive) {
                  material.emissive.copy(color).multiplyScalar(0.01);
                }
                if ("emissiveIntensity" in material) {
                  material.emissiveIntensity = 0.05;
                }
                if ("metalness" in material) {
                  material.metalness = 0.18;
                }
                if ("roughness" in material) {
                  material.roughness = 0.24;
                }
                if ("clearcoat" in material) {
                  material.clearcoat = 1;
                }
                if ("clearcoatRoughness" in material) {
                  material.clearcoatRoughness = 0.08;
                }
                if ("sheen" in material) {
                  material.sheen = 0.08;
                }
                if ("sheenRoughness" in material) {
                  material.sheenRoughness = 0.42;
                }
                if ("specularIntensity" in material) {
                  material.specularIntensity = 1;
                }
                if ("envMapIntensity" in material) {
                  material.envMapIntensity = 1.18;
                }
                material.side = THREE.DoubleSide;
                material.needsUpdate = true;
                return material;
              }
              return buildRenderFrameMaterial(color);
            }
            if (material && material.color) {
              material.color.copy(color);
              if ("map" in material) {
                material.map = null;
              }
              if ("aoMap" in material) {
                material.aoMap = null;
              }
              if ("lightMap" in material) {
                material.lightMap = null;
              }
              if ("emissiveMap" in material) {
                material.emissiveMap = null;
              }
              if ("metalnessMap" in material) {
                material.metalnessMap = null;
              }
              if ("roughnessMap" in material) {
                material.roughnessMap = null;
              }
              if ("normalMap" in material) {
                material.normalMap = null;
              }
              if ("bumpMap" in material) {
                material.bumpMap = null;
              }
              if ("alphaMap" in material) {
                material.alphaMap = null;
              }
              if ("vertexColors" in material) {
                material.vertexColors = false;
              }
              if ("emissive" in material && material.emissive) {
                material.emissive.copy(color).multiplyScalar(0.01);
              }
              if ("emissiveIntensity" in material) {
                material.emissiveIntensity = 0.05;
              }
              if ("metalness" in material) {
                material.metalness = 0.18;
              }
              if ("roughness" in material) {
                material.roughness = 0.24;
              }
              if ("clearcoat" in material) {
                material.clearcoat = 1;
              }
              if ("clearcoatRoughness" in material) {
                material.clearcoatRoughness = 0.08;
              }
              if ("sheen" in material) {
                material.sheen = 0.08;
              }
              if ("sheenRoughness" in material) {
                material.sheenRoughness = 0.42;
              }
              if ("specularIntensity" in material) {
                material.specularIntensity = 1;
              }
              if ("envMapIntensity" in material) {
                material.envMapIntensity = 1.18;
              }
              material.side = THREE.DoubleSide;
              material.needsUpdate = true;
              return material;
            }
            return buildRenderFrameMaterial(color);
          });
          child.material = Array.isArray(child.material) ? nextMaterials : nextMaterials[0];
        }
      });
    });
  }

  getPartEntrySignature(entry) {
    if (!entry) {
      return "";
    }
    return `${entry.src || ""}|${entry.object && entry.object.userData && entry.object.userData.partTint ? 1 : 0}|${entry.object && entry.object.userData && entry.object.userData.partBlackWheel ? 1 : 0}|${entry.object && entry.object.userData && entry.object.userData.partSeatStyle ? entry.object.userData.partSeatStyle : ""}|${entry.object && entry.object.userData && entry.object.userData.partFootrestPlateStyle ? entry.object.userData.partFootrestPlateStyle : ""}|${entry.object && entry.object.userData && entry.object.userData.partBackrestStyle ? entry.object.userData.partBackrestStyle : ""}|${entry.object && entry.object.userData && entry.object.userData.partSideguardStyle ? entry.object.userData.partSideguardStyle : ""}|${entry.object && entry.object.userData && entry.object.userData.partMirrorX ? 1 : 0}`;
  }

  setObjectOpacity(object, opacity) {
    if (!object) {
      return;
    }
    object.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) {
        return;
      }
      const materials = Array.isArray(child.material) ? child.material : [child.material];
      materials.forEach((material) => {
        if (!material) {
          return;
        }
        material.transparent = opacity < 1;
        material.opacity = opacity;
        material.needsUpdate = true;
      });
    });
  }

  queueTransition(object, mode, duration, onComplete) {
    if (!object) {
      return;
    }
    this.transitions.push({
      object,
      mode,
      start: performance.now(),
      duration: duration || 220,
      onComplete: typeof onComplete === "function" ? onComplete : null,
    });
  }

  updateTransitions() {
    if (!this.transitions.length) {
      return;
    }
    const now = performance.now();
    this.transitions = this.transitions.filter((transition) => {
      const progress = Math.min(1, (now - transition.start) / transition.duration);
      const opacity = transition.mode === "fade-in" ? progress : 1 - progress;
      this.setObjectOpacity(transition.object, opacity);
      if (progress >= 1) {
        if (transition.onComplete) {
          transition.onComplete();
        }
        return false;
      }
      return true;
    });
  }

  async update({ sourceModel, selection, frameColor }) {
    this.lastSourceModel = sourceModel;
    this.lastSelection = Object.assign({}, selection || {});
    this.lastFrameColor = frameColor || "";
    await this.ensureManualAdjustmentsLoaded();
    const parts = getModelPartsForSourceModel(sourceModel, selection || {});
    const partsSignature = JSON.stringify({
      sourceModel,
      parts: parts.map((part) => `${part.key || ""}:${part.src}|${part.tint ? 1 : 0}|${part.blackWheel ? 1 : 0}|${part.seatStyle || ""}|${part.footrestPlateStyle || ""}|${part.backrestStyle || ""}|${part.sideguardStyle || ""}`),
    });
    const signature = JSON.stringify({
      sourceModel,
      frameColor,
      selection: selection || {},
      parts: parts.map((part) => `${part.key || ""}:${part.src}|${part.tint ? 1 : 0}|${part.blackWheel ? 1 : 0}|${part.seatStyle || ""}|${part.footrestPlateStyle || ""}|${part.backrestStyle || ""}|${part.sideguardStyle || ""}`),
    });

    if (signature === this.signature) {
      this.refreshObjectDebugOptions();
      this.highlightDebugTargetObject();
      return;
    }

    if (partsSignature === this.partsSignature && this.modelRoot) {
      this.signature = signature;
      this.applyDimensionAdjustments(selection || {});
      // A configuration change can reuse the same GLB files. Re-apply saved
      // per-configuration placement after the base dimension transform.
      this.applyManualObjectAdjustments(selection || {});
      this.applyFrameColor(frameColor);
      this.refreshObjectDebugOptions();
      this.highlightDebugTargetObject();
      this.showStatus("");
      return;
    }

    const canPatchExisting = this.currentSourceModel === sourceModel && !!this.modelRoot;
    this.signature = signature;
    this.partsSignature = partsSignature;
    if (!canPatchExisting) {
      this.clearObject();
    }

    if (!this.scene || !parts.length) {
      this.showStatus("Waiting for model");
      this.currentSourceModel = sourceModel;
      return;
    }

    const currentToken = ++this.loadToken;
    this.showStatus("Loading...");
    this.colorTargets = [];
    this.preloadSources(this.getPreloadSourcesForModel(sourceModel));

    try {
      if (canPatchExisting && this.modelRoot) {
        const group = this.modelRoot;
        const existingByKey = new Map(
          this.partObjects.map((entry) => [entry.key || "", entry])
        );
        const nextPartObjects = [];
        const nextColorTargets = [];

        for (let index = 0; index < parts.length; index += 1) {
          const part = parts[index];
          const partKey = part.key || "";
          const desiredSignature = `${part.src}|${part.tint ? 1 : 0}|${part.blackWheel ? 1 : 0}|${part.seatStyle || ""}|${part.footrestPlateStyle || ""}|${part.backrestStyle || ""}|${part.sideguardStyle || ""}|${part.mirrorX ? 1 : 0}`;
          const existingEntry = existingByKey.get(partKey);

          if (existingEntry && this.getPartEntrySignature(existingEntry) === desiredSignature) {
            nextPartObjects.push(existingEntry);
            if (part.tint) {
              nextColorTargets.push(existingEntry.object);
            }
            existingByKey.delete(partKey);
            continue;
          }

          const object = await this.loadObject(part, (evt) => {
            if (!evt || (!evt.total && !evt.loaded)) return;
            const total = Math.max(evt.total || 0, evt.loaded || 0);
            const pct = total > 0 ? Math.min(100, Math.round((evt.loaded / total) * 100)) : 0;
            const combined = Math.round(((index + pct / 100) / parts.length) * 100);
            this.showStatus(`Loading... ${combined}%`);
          });

          if (currentToken !== this.loadToken) {
            this.disposeObject(object);
            return;
          }

          object.userData.partKey = partKey;
          object.userData.partSrc = part.src;
          object.userData.partTint = !!part.tint;
          object.userData.partBlackWheel = !!part.blackWheel;
          object.userData.partSeatStyle = part.seatStyle || "";
          object.userData.partFootrestPlateStyle = part.footrestPlateStyle || "";
          object.userData.partBackrestStyle = part.backrestStyle || "";
          object.userData.partSideguardStyle = part.sideguardStyle || "";
          object.userData.partMirrorX = !!part.mirrorX;
          this.setObjectOpacity(object, 0);

          if (existingEntry) {
            this.queueTransition(existingEntry.object, "fade-out", 180, () => {
              group.remove(existingEntry.object);
              this.disposeObject(existingEntry.object);
            });
            existingByKey.delete(partKey);
          }

          group.add(object);
          this.queueTransition(object, "fade-in", 220);
          nextPartObjects.push({
            key: partKey,
            src: part.src,
            object,
          });
          if (part.tint) {
            nextColorTargets.push(object);
          }
        }

        existingByKey.forEach((entry) => {
          this.queueTransition(entry.object, "fade-out", 180, () => {
            group.remove(entry.object);
            this.disposeObject(entry.object);
          });
        });

        this.partObjects = nextPartObjects;
        this.colorTargets = nextColorTargets;
        this.currentSourceModel = sourceModel;
        this.applyDimensionAdjustments(selection || {});
        this.applyManualObjectAdjustments(selection || {});
        this.applyFrameColor(frameColor);
        this.refreshObjectDebugOptions();
        this.highlightDebugTargetObject();
        this.showStatus("");
        return;
      }

      const group = new THREE.Group();
      let meshCount = 0;

      for (let index = 0; index < parts.length; index += 1) {
        const part = parts[index];
        const object = await this.loadObject(part, (evt) => {
          if (!evt || (!evt.total && !evt.loaded)) return;
          const total = Math.max(evt.total || 0, evt.loaded || 0);
          const pct = total > 0 ? Math.min(100, Math.round((evt.loaded / total) * 100)) : 0;
          const combined = Math.round(((index + pct / 100) / parts.length) * 100);
          this.showStatus(`Loading... ${combined}%`);
        });

        object.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            meshCount += 1;
            child.castShadow = false;
            child.receiveShadow = false;
          }
        });

        if (part.tint) {
          this.colorTargets.push(object);
        }
        object.userData.partKey = part.key || "";
        object.userData.partSrc = part.src;
        object.userData.partTint = !!part.tint;
        object.userData.partBlackWheel = !!part.blackWheel;
        object.userData.partSeatStyle = part.seatStyle || "";
        object.userData.partFootrestPlateStyle = part.footrestPlateStyle || "";
        object.userData.partBackrestStyle = part.backrestStyle || "";
        object.userData.partSideguardStyle = part.sideguardStyle || "";
        object.userData.partMirrorX = !!part.mirrorX;
        this.partObjects.push({
          key: part.key || "",
          src: part.src,
          object,
        });
        this.setObjectOpacity(object, 0);
        this.queueTransition(object, "fade-in", 260);
        group.add(object);
      }

      if (currentToken !== this.loadToken) {
        this.disposeObject(group);
        return;
      }

      this.modelRoot = group;
      this.scene.add(group);
      this.currentSourceModel = sourceModel;
      this.applyDimensionAdjustments(selection || {});
      this.applyManualObjectAdjustments(selection || {});
      this.fitCameraToObject(group);
      this.applyFrameColor(frameColor);
      this.refreshObjectDebugOptions();
      this.highlightDebugTargetObject();
      this.showStatus(meshCount ? "" : "Model is empty");
    } catch (error) {
      if (currentToken !== this.loadToken) return;
      console.error("Runtime model load failed", error);
      this.showStatus("Model failed to load");
      this.partsSignature = "";
    }
  }

  pickDebugObjectAtClientPoint(clientX, clientY) {
    if (
      !this.modelRoot ||
      !this.camera ||
      !this.renderer ||
      !this.renderer.domElement ||
      !this.raycaster ||
      !this.pointerNdc
    ) {
      return;
    }
    const rect = this.renderer.domElement.getBoundingClientRect();
    if (!rect.width || !rect.height) {
      return;
    }
    this.pointerNdc.x = ((clientX - rect.left) / rect.width) * 2 - 1;
    this.pointerNdc.y = -(((clientY - rect.top) / rect.height) * 2 - 1);
    this.raycaster.setFromCamera(this.pointerNdc, this.camera);

    const pickTargets = [];
    this.modelRoot.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        pickTargets.push(child);
      }
    });
    if (!pickTargets.length) {
      return;
    }

    const intersections = this.raycaster.intersectObjects(pickTargets, false);
    const hit = intersections.find((entry) => entry && entry.object);
    if (!hit || !hit.object) {
      return;
    }
    const objectKey = this.resolveAdjustableObjectKeyFromObject(hit.object);
    if (!objectKey) {
      return;
    }
    this.selectDebugObjectByName(objectKey);
  }

  selectDebugObjectByName(objectName) {
    if (!objectName) {
      return;
    }
    this.objectDebugTargetName = objectName;
    if (this.objectDebugSelect) {
      this.objectDebugSelect.value = objectName;
    }
    this.updateObjectDebugPanel();
    this.highlightDebugTargetObject();
    this.setObjectDebugStatus(`已选中: ${this.getAdjustableLabel(objectName)}`);
  }

  refreshObjectDebugOptions() {
    if (!this.objectDebugSelect) {
      return;
    }
    const names = this.getAdjustableObjectNames();
    const nextValue =
      names.includes(this.objectDebugTargetName) ? this.objectDebugTargetName : names[0] || "";
    this.objectDebugTargetName = nextValue;
    this.objectDebugSelect.innerHTML = names
      .map(
        (name) =>
          `<option value="${name.replace(/"/g, "&quot;")}">${this.getAdjustableLabel(name).replace(/"/g, "&quot;")}</option>`
      )
      .join("");
    this.objectDebugSelect.value = nextValue;
    this.updateObjectDebugPanel();
  }

  updateObjectDebugPanel() {
    if (!this.objectDebugValueNode) {
      return;
    }
    const entry = this.getCurrentObjectAdjustmentEntry();
    const selectionKey = this.buildSelectionKey(this.lastSelection || {});
    if (!this.objectDebugTargetName) {
      this.objectDebugValueNode.textContent = "当前配置下暂无可调部件";
      return;
    }
    const values = entry || this.normalizeAdjustmentEntry({});
    this.objectDebugValueNode.textContent = [
      `model: ${this.lastSourceModel || this.currentSourceModel || "-"}`,
      `selection: ${selectionKey || "-"}`,
      `part: ${this.objectDebugTargetName}`,
      `file: ${this.getAdjustableLabel(this.objectDebugTargetName)}`,
      "",
      `x: ${values.position.x.toFixed(4)}`,
      `y: ${values.position.y.toFixed(4)}`,
      `z: ${values.position.z.toFixed(4)}`,
      `rx: ${values.rotationDeg.x.toFixed(2)}`,
      `ry: ${values.rotationDeg.y.toFixed(2)}`,
      `rz: ${values.rotationDeg.z.toFixed(2)}`,
    ].join("\n");
  }

  highlightDebugTargetObject() {
    if (!this.modelRoot) {
      return;
    }
    const activeName = this.objectDebugTargetName || "";
    this.modelRoot.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) {
        return;
      }
      if (child.userData.baseEmissive === undefined) {
        const material = Array.isArray(child.material) ? child.material[0] : child.material;
        child.userData.baseEmissive = material && material.emissive ? material.emissive.clone() : null;
        child.userData.baseEmissiveIntensity =
          material && typeof material.emissiveIntensity === "number" ? material.emissiveIntensity : 0;
      }
      const materials = Array.isArray(child.material) ? child.material : [child.material];
      materials.forEach((material) => {
        if (!material || !material.emissive) {
          return;
        }
        if (child.userData.baseEmissive) {
          material.emissive.copy(child.userData.baseEmissive);
        }
        material.emissiveIntensity = child.userData.baseEmissiveIntensity || 0;
      });
    });
  }

  resize() {
    if (!this.renderer || !this.camera) return;
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    this.renderer.setPixelRatio(getRendererPixelRatio());
    this.renderer.setSize(width, height);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
  }

  animate() {
    if (!this.renderer || !this.scene || !this.camera) return;
    this.updateTransitions();
    this.controls && this.controls.update();
    this.renderer.render(this.scene, this.camera);
    this.renderAxesOverlay();
    this.animationId = requestAnimationFrame(() => this.animate());
  }

  dispose() {
    this.loadToken += 1;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    this.resizeObserver && this.resizeObserver.disconnect();
    this.clearObject();
    this.controls && this.controls.dispose();
    this.dracoLoader && this.dracoLoader.dispose();
    this.dracoLoader = null;
    if (this.environmentMap) {
      this.environmentMap.dispose && this.environmentMap.dispose();
      this.environmentMap = null;
    }
    if (this.renderer) {
      this.renderer.dispose();
      this.renderer.domElement.remove();
    }
    if (this.root) {
      this.root.remove();
    }
    this.scene = null;
    this.camera = null;
    this.controls = null;
    this.renderer = null;
    this.axesScene = null;
    this.axesCamera = null;
    this.axesHelper = null;
    this.axesToggleButton = null;
    this.axesLabelLayer = null;
    this.axesLabelNodes = null;
    this.root = null;
    this.statusNode = null;
    this.partsSignature = "";
  }
}
