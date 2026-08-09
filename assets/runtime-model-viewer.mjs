import * as THREE from "three";
import { OrbitControls } from "/assets/vendor/OrbitControls.js";
import { DRACOLoader } from "/assets/vendor/DRACOLoader.js";
import { GLTFLoader } from "/assets/vendor/GLTFLoader.js";
import { MeshoptDecoder } from "/assets/vendor/meshopt_decoder.module.js";
import { FRAME_WIDTH_GROUPS } from "/assets/frame-width-groups.mjs";
import { getModelPartsForSourceModel } from "/assets/model-parts.mjs?v=20260808-local-options-v44";

function isMobileViewport() {
  return window.innerWidth <= 768;
}

function getRendererPixelRatio() {
  const pixelRatio = window.devicePixelRatio || 1;
  // Avoid rendering several million pixels per frame on high-DPI displays.
  return Math.min(pixelRatio, isMobileViewport() ? 1.25 : 1.5);
}

function getLoadTimeoutMs() {
  return isMobileViewport() ? 180000 : 120000;
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

function buildStableMiddleFrameMaterial(colorValue) {
  const color = colorValue instanceof THREE.Color ? colorValue.clone() : new THREE.Color(colorValue || "#ffffff");
  return new THREE.MeshBasicMaterial({
    color,
    side: THREE.DoubleSide,
    toneMapped: false,
    depthWrite: true,
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

function getHandrimMaterialPreset(handrimId) {
  switch (handrimId) {
    case "hr-al-black-22":
    case "hr-al-black-24":
      return { color: "#16191d", metalness: 0.84, roughness: 0.25, clearcoat: 0.34 };
    case "hr-titanium-24":
      return { color: "#777d82", metalness: 0.92, roughness: 0.3, clearcoat: 0.2 };
    case "hr-pvc-24":
      return { color: "#151719", metalness: 0.04, roughness: 0.52, clearcoat: 0.08 };
    case "hr-big-24":
      return { color: "#17191c", metalness: 0.34, roughness: 0.38, clearcoat: 0.2 };
    case "hr-al-silver-22":
    case "hr-al-silver-24":
    default:
      return { color: "#cbd1d7", metalness: 0.9, roughness: 0.22, clearcoat: 0.42 };
  }
}

function buildHandrimMaterial(handrimId, sourceMaterial) {
  const preset = getHandrimMaterialPreset(handrimId);
  const opacity = Number.isFinite(sourceMaterial && sourceMaterial.opacity) ? sourceMaterial.opacity : 1;
  return new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(preset.color),
    emissive: new THREE.Color("#000000"),
    metalness: preset.metalness,
    roughness: preset.roughness,
    clearcoat: preset.clearcoat,
    clearcoatRoughness: 0.18,
    envMapIntensity: 1.35,
    transparent: opacity < 1,
    opacity,
    depthWrite: opacity >= 1,
    side: THREE.DoubleSide,
  });
}

const tyreTreadTextureCache = new Map();

function getTyreTreadTexture(tyreId) {
  // The supplied tyre meshes already contain their physical tread geometry.
  if (tyreId === "tyre-pu" || tyreId === "tyre-pneumatic") return null;
  if (tyreTreadTextureCache.has(tyreId)) return tyreTreadTextureCache.get(tyreId);
  const canvas = document.createElement("canvas");
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#777777";
  ctx.fillRect(0, 0, 128, 128);
  ctx.strokeStyle = "#b8b8b8";
  ctx.lineWidth = tyreId === "tyre-offroad" ? 18 : 7;
  for (let offset = -128; offset < 256; offset += tyreId === "tyre-offroad" ? 42 : 24) {
    ctx.beginPath();
    ctx.moveTo(offset, 0);
    ctx.lineTo(offset + 128, 128);
    ctx.stroke();
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(5, 2);
  texture.needsUpdate = true;
  tyreTreadTextureCache.set(tyreId, texture);
  return texture;
}

function buildTyreMaterial(tyreId, sourceMaterial) {
  const opacity = Number.isFinite(sourceMaterial && sourceMaterial.opacity) ? sourceMaterial.opacity : 1;
  const treadTexture = getTyreTreadTexture(tyreId);
  return new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(tyreId === "tyre-pu" ? "#0b0d10" : "#111316"),
    emissive: new THREE.Color("#000000"),
    metalness: 0.02,
    roughness: tyreId === "tyre-pu" ? 0.48 : 0.68,
    clearcoat: tyreId === "tyre-pu" ? 0.12 : 0.04,
    clearcoatRoughness: 0.42,
    bumpMap: treadTexture,
    bumpScale: treadTexture ? 0.0018 : 0,
    envMapIntensity: 0.75,
    transparent: opacity < 1,
    opacity,
    depthWrite: opacity >= 1,
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
    // Keep the seat and its underseat pouch on the same near-black fabric.
    // The weave is intentionally subtle so separate mesh normals do not read
    // as two different fabric colours.
    ctx.fillStyle = "#25282a";
    ctx.fillRect(0, 0, size, size);
    for (let x = 0; x < size; x += 6) {
      ctx.fillStyle = x % 12 === 0 ? "rgba(235, 238, 240, 0.024)" : "rgba(0, 0, 0, 0.024)";
      ctx.fillRect(x, 0, 1, size);
    }
    for (let y = 0; y < size; y += 6) {
      ctx.fillStyle = y % 12 === 0 ? "rgba(235, 238, 240, 0.018)" : "rgba(0, 0, 0, 0.018)";
      ctx.fillRect(0, y, size, 1);
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
  const isStandard = !isCarbon && !isCrossed;

  if (isStandard) {
    // The source CAD mesh contains inconsistent vertex normals. A light-reactive
    // material exposes those normals as large triangular patches, so the fabric
    // uses an unlit woven map instead. This keeps the seat and pouch uniform.
    return new THREE.MeshBasicMaterial({
      color: "#ffffff",
      map: buildSeatTexture(style),
      side: THREE.DoubleSide,
      toneMapped: false,
    });
  }

  return new THREE.MeshPhysicalMaterial({
    color: isCrossed ? "#a8adb0" : "#293139",
    map: buildSeatTexture(style),
    emissive: new THREE.Color("#000000"),
    emissiveIntensity: 0,
    metalness: isCarbon ? 0.56 : 0.05,
    roughness: isCarbon ? 0.24 : 0.58,
    clearcoat: isCarbon ? 0.45 : 0.06,
    clearcoatRoughness: isCarbon ? 0.14 : 0.35,
    sheen: isCarbon ? 0 : 0.24,
    sheenColor: new THREE.Color("#d7dde0"),
    sheenRoughness: 0.84,
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
  return new THREE.MeshBasicMaterial({
    color: "#30363a",
    side: THREE.DoubleSide,
    toneMapped: false,
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
const S5_SEAT_REFERENCE_BOUNDS = Object.freeze({
  center: Object.freeze({ x: -0.3046279556, y: 0.1367690647, z: 0.0914394346 }),
  size: Object.freeze({ x: 0.3895132475, y: 0.046596525, z: 0.4001122474 }),
});
const S5_STANDARD_HANDLE_CENTER_X = Object.freeze({
  left: -0.4928778005100476,
  right: -0.11637808780305292,
});
const S5_FOLDING_HANDLE_POSITION = Object.freeze({
  y: 0.34,
  z: -0.255,
});
const S5_WHEEL_FOOTREST_REFERENCE_SEAT_WIDTH_CM = 36;
const S5_REAR_WHEEL_REFERENCE_ADJUSTMENT = Object.freeze({
  left: Object.freeze({ x: 0.03, y: -0.004, z: 0 }),
  right: Object.freeze({ x: -0.03, y: -0.003, z: 0 }),
});
const S5_REAR_WHEEL_SUBCOMPONENT_OFFSETS = Object.freeze({
  handrim: 0.051,
  tyre: 0.023,
});
const S5_REAR_WHEEL_VARIANT_ASSEMBLY = Object.freeze({
  "rw-24s": Object.freeze({
    mainWheelOutward: 0.023,
    handrim: 0.028,
    tyre: 0,
  }),
  "rw-24ul": Object.freeze({
    mainWheelOutward: 0.023,
    handrim: 0.028,
    tyre: 0,
  }),
});
const S5_POSITION_REFERENCE_SEAT_DEPTH_ID = "sd-37-5";
const S5_POSITION_REFERENCE_SEAT_WIDTH_ID = "sw-36";
const S5_POSITION_REFERENCE_OBJECTS = new Set([
  "backrest",
  "frontCasterLeft",
  "frontCasterRight",
  "footrest",
  "footrestPlate",
]);
// The assembled S5 model was aligned against the 37.5 cm seat-depth setup.
// Keep every non-seat component on this fixed reference geometry.
const S5_SEAT_DEPTH_REFERENCE_CM = 37.5;
const LEGACY_SEAT_DEPTH_REFERENCE_CM = 40;
// Authored caster half-span at the verified 36 cm seat-width assembly.
const FRONT_CASTER_BASE_HALF_SPAN_M = 0.224422;
const FRONT_CASTER_MODEL_OFFSET = {
  x: 0.06020637988906841,
  y: 0.2299719881569695,
  z: -0.32363139354549375,
};
// Appearance-only choices must never create another position configuration.
const ADJUSTMENT_IGNORED_SELECTION_KEYS = new Set([
  "frameMaterial",
  "frameColor",
  "handrim",
  "tyre",
]);
const LEFT_FORK_LENGTH_TUBE_NAME = "Object_113";
const LEFT_FORK_LENGTH_FOLLOWER_NAMES = ["Object_188", "Object_189"];
const LEFT_FORK_ANGLE_TARGET_NAMES = ["Object_113", "Object_188", "Object_189"];
const LEFT_FORK_PIVOT_HELPER_NAMES = ["Object_188", "Object_189"];
const LEFT_FORK_LONG_EXTENSION_M = 0.03;
const LEFT_FORK_BASE_TUBE_LENGTH_M = 0.492804;
const LEFT_FORK_ANGLE_OVERLAP_90_M = 0.01;
// Verified 36 cm assembly positions before separating fork and caster controls.
// Values exclude the existing fork-type manual deltas applied later.
const S5_INDEPENDENT_FRONT_FORK_BASELINES = Object.freeze({
  "ff-std|fa-100|fl-std": Object.freeze({
    left: Object.freeze({ position: [-0.55021562, -0.220971988, 0.297131394], rotation: [0, 0, 0] }),
    right: Object.freeze({ position: [-0.05678438, -0.219971988, 0.296131394], rotation: [0, 0, 0] }),
  }),
  "ff-std|fa-100|fl-long": Object.freeze({
    left: Object.freeze({ position: [-0.55021562, -0.220155306, 0.310742771], rotation: [0, 0, 0] }),
    right: Object.freeze({ position: [-0.057056607, -0.218883078, 0.309742771], rotation: [0, 0, 0] }),
  }),
  "ff-std|fa-90|fl-std": Object.freeze({
    left: Object.freeze({ position: [-0.550470929, -0.22180648, 0.300111424], rotation: [-0.893581, 0, 0] }),
    right: Object.freeze({ position: [-0.057497723, -0.222735409, 0.296821242], rotation: [1.787161, 0, 0] }),
  }),
  "ff-std|fa-90|fl-long": Object.freeze({
    left: Object.freeze({ position: [-0.55039552, -0.221795404, 0.301144196], rotation: [-0.899974, 0, 0] }),
    right: Object.freeze({ position: [-0.057574882, -0.222608677, 0.29804954], rotation: [1.62002, 0, 0] }),
  }),
  "ff-long|fa-100|fl-std": Object.freeze({
    left: Object.freeze({ position: [-0.55021562, -0.230971988, 0.301131394], rotation: [0, 0, 0] }),
    right: Object.freeze({ position: [-0.05678438, -0.230971988, 0.301131394], rotation: [0, 0, 0] }),
  }),
  "ff-long|fa-100|fl-long": Object.freeze({
    left: Object.freeze({ position: [-0.549738247, -0.2311152, 0.302420301], rotation: [0, 0, 0] }),
    right: Object.freeze({ position: [-0.057331828, -0.231114801, 0.302440509], rotation: [0, 0, 0] }),
  }),
  "ff-long|fa-90|fl-std": Object.freeze({
    left: Object.freeze({ position: [-0.549664202, -0.231173194, 0.302319089], rotation: [-0.013991, 0, 0] }),
    right: Object.freeze({ position: [-0.05742558, -0.23121017, 0.302307355], rotation: [0.027983, 0, 0] }),
  }),
  "ff-long|fa-90|fl-long": Object.freeze({
    left: Object.freeze({ position: [-0.549161029, -0.231405701, 0.302884665], rotation: [-0.038254, 0, 0] }),
    right: Object.freeze({ position: [-0.058000365, -0.231466374, 0.302922433], rotation: [0.002687, 0, 0] }),
  }),
});
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
  ["fa-100", "fl-long", "frontCasterRight", -0.244, 0.004, 0.01],
  ["fa-90", "fl-long", "frontCasterLeft", -0.365, 0, -0.017],
  ["fa-90", "fl-long", "frontCasterRight", -0.245, 0, -0.016],
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
  // One-arm fork fit approved at the 36 cm reference width. Seat-width
  // placement remains parametric, so one production entry covers every width.
  {
    sourceModel: "S5",
    selectionKey: "frontFork=ff-one-arm",
    objectName: "frontForkLeft",
    mode: "delta",
    position: { x: -0.37, y: 0.078, z: -0.041 },
    rotationDeg: { x: -174, y: -180, z: 0 },
  },
  {
    sourceModel: "S5",
    selectionKey: "frontFork=ff-one-arm",
    objectName: "frontForkRight",
    mode: "delta",
    position: { x: -0.238, y: 0.079, z: -0.042 },
    rotationDeg: { x: -174, y: -180, z: 0 },
  },
  // Front-caster production calibration inherited from the approved
  // 36 cm / 100-degree / standard-length reference. Angle/length-specific
  // vertical offsets and rotations remain intact.
  {
    sourceModel: "S5",
    selectionKey: "frameAngle=fa-100&frameLength=fl-std",
    objectName: "frontCasterLeft",
    mode: "delta",
    position: { x: -0.386, y: 0.009, z: -0.044 },
    rotationDeg: { x: 0, y: 0, z: 0 },
  },
  {
    sourceModel: "S5",
    selectionKey: "frameAngle=fa-100&frameLength=fl-std",
    objectName: "frontCasterRight",
    mode: "delta",
    position: { x: -0.221, y: 0.01, z: -0.045 },
    rotationDeg: { x: 0, y: 0, z: 0 },
  },
  {
    sourceModel: "S5",
    selectionKey: "frameAngle=fa-90&frameLength=fl-std",
    objectName: "frontCasterLeft",
    mode: "delta",
    position: { x: -0.387, y: -0.033, z: -0.028 },
    rotationDeg: { x: -10.5, y: 0, z: 0 },
  },
  {
    sourceModel: "S5",
    selectionKey: "frameAngle=fa-90&frameLength=fl-std",
    objectName: "frontCasterRight",
    mode: "delta",
    position: { x: -0.223, y: -0.04, z: -0.043 },
    rotationDeg: { x: 0, y: 0, z: 0 },
  },
  {
    sourceModel: "S5",
    selectionKey: "frameAngle=fa-100&frameLength=fl-long",
    objectName: "frontCasterLeft",
    mode: "delta",
    position: { x: -0.386, y: 0.012, z: -0.024 },
    rotationDeg: { x: 0, y: 0, z: 0 },
  },
  {
    sourceModel: "S5",
    selectionKey: "frameAngle=fa-100&frameLength=fl-long",
    objectName: "frontCasterRight",
    mode: "delta",
    position: { x: -0.222, y: 0.014, z: -0.025 },
    rotationDeg: { x: 0, y: 0, z: 0 },
  },
  {
    sourceModel: "S5",
    selectionKey: "frameAngle=fa-90&frameLength=fl-long",
    objectName: "frontCasterLeft",
    mode: "delta",
    position: { x: -0.385, y: -0.028, z: -0.011 },
    rotationDeg: { x: -8, y: 0, z: 0 },
  },
  {
    sourceModel: "S5",
    selectionKey: "frameAngle=fa-90&frameLength=fl-long",
    objectName: "frontCasterRight",
    mode: "delta",
    position: { x: -0.223, y: -0.027, z: -0.011 },
    rotationDeg: { x: -8, y: 0, z: 0 },
  },
  {
    sourceModel: "S5",
    selectionKey: "rearWheel=rw-24ul",
    objectName: "rearWheelRight",
    mode: "delta",
    position: { x: 0.012, y: 0, z: 0 },
    rotationDeg: { x: 0, y: 0, z: 0 },
  },
  {
    sourceModel: "S5",
    selectionKey: "rearWheel=rw-24bh",
    objectName: "rearWheelLeft",
    mode: "delta",
    position: { x: -0.038, y: 0, z: 0 },
    rotationDeg: { x: 0, y: 0, z: 0 },
  },
  {
    sourceModel: "S5",
    selectionKey: "rearWheel=rw-24bh",
    objectName: "rearWheelRight",
    mode: "delta",
    position: { x: 0.039, y: 0, z: 0 },
    rotationDeg: { x: 0, y: 0, z: 0 },
  },
  {
    sourceModel: "S5",
    selectionKey: "backrestHandles=bh-std-bent",
    objectName: "backrestHandleLeft",
    mode: "delta",
    position: { x: 0, y: 0.02, z: 0 },
    rotationDeg: { x: 0, y: 0, z: 0 },
  },
  {
    sourceModel: "S5",
    selectionKey: "backrestHandles=bh-std-bent",
    objectName: "backrestHandleRight",
    mode: "delta",
    position: { x: 0, y: 0.02, z: 0 },
    rotationDeg: { x: 0, y: 0, z: 0 },
  },
  {
    sourceModel: "S5",
    selectionKey: "backrestHandles=bh-folding",
    objectName: "backrestHandleLeft",
    mode: "delta",
    position: { x: -0.003, y: 0.137, z: -0.05 },
    rotationDeg: { x: -186, y: 0, z: -180 },
  },
  {
    sourceModel: "S5",
    selectionKey: "backrestHandles=bh-folding",
    objectName: "backrestHandleRight",
    mode: "delta",
    position: { x: 0.003, y: 0.137, z: -0.05 },
    rotationDeg: { x: -186, y: 0, z: -180 },
  },
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
    selectionKey: "",
    objectName: "sideguards::mesh-0",
    mode: "delta",
    position: { x: 0.037, y: 0, z: 0 },
    rotationDeg: { x: 0, y: 0, z: 0 },
  },
  {
    sourceModel: "S5",
    selectionKey: "",
    objectName: "brakeRight",
    mode: "delta",
    position: { x: -0.106, y: 0.16, z: 0.39 },
    rotationDeg: { x: -180, y: 0, z: -90 },
  },
  {
    sourceModel: "S5",
    selectionKey: "",
    objectName: "brakeRight::mesh-0",
    mode: "delta",
    position: { x: -0.015, y: 0, z: 0 },
    rotationDeg: { x: 0, y: 0, z: 0 },
  },
  {
    sourceModel: "S5",
    selectionKey: "",
    objectName: "brakeLeft::mesh-0",
    mode: "delta",
    position: { x: -0.595, y: 0, z: 0 },
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

// Final front-assembly calibration promoted from the local adjustment log.
// Fork type is part of every caster key so standard and long forks cannot
// inherit one another's wheel placement when the debug log is unavailable.
const S5_FINAL_FRONT_ASSEMBLY_ADJUSTMENTS = [
  ["frontFork=ff-std", "frontForkLeft", 0, -0.012, 0.004, 0, 0, 0],
  ["frontFork=ff-std", "frontForkRight", 0, -0.013, 0.005, 0, 0, 0],
  ["frontFork=ff-long", "frontForkLeft", 0, -0.01, 0.004, 0, 0, 0],
  ["frontFork=ff-long", "frontForkRight", 0, -0.011, 0.005, 0, 0, 0],
  ["frameAngle=fa-100&frameLength=fl-std&frontFork=ff-long", "frontForkLeft", 0, -0.001, -0.001, 0, 0, 0],
  ["frameAngle=fa-100&frameLength=fl-std&frontFork=ff-long", "frontForkRight", 0, -0.001, -0.001, 0, 0, 0],

  ["frameAngle=fa-100&frameLength=fl-std&frontFork=ff-std", "frontCasterLeft", -0.385, -0.003, -0.041, 0, 0, 0],
  ["frameAngle=fa-100&frameLength=fl-std&frontFork=ff-std", "frontCasterRight", -0.22, -0.003, -0.04, 0, 0, 0],
  ["frameAngle=fa-90&frameLength=fl-std&frontFork=ff-std", "frontCasterLeft", -0.387, 0.004, -0.071, 0, 0, 0],
  ["frameAngle=fa-90&frameLength=fl-std&frontFork=ff-std", "frontCasterRight", -0.223, -0.01, -0.073, 0, 0, 0],
  ["frameAngle=fa-100&frameLength=fl-long&frontFork=ff-std", "frontCasterLeft", -0.386, 0.012, 0.006, 0, 0, 0],
  ["frameAngle=fa-100&frameLength=fl-long&frontFork=ff-std", "frontCasterRight", -0.222, 0.014, 0.005, 0, 0, 0],
  ["frameAngle=fa-90&frameLength=fl-long&frontFork=ff-std", "frontCasterLeft", -0.385, 0.009, -0.021, 0, 0, 0],
  ["frameAngle=fa-90&frameLength=fl-long&frontFork=ff-std", "frontCasterRight", -0.223, 0.01, -0.021, 0, 0, 0],

  ["frameAngle=fa-100&frameLength=fl-std&frontFork=ff-long", "frontCasterLeft", -0.386, -0.002, -0.041, 0, 0, 0],
  ["frameAngle=fa-100&frameLength=fl-std&frontFork=ff-long", "frontCasterRight", -0.221, -0.002, -0.041, 0, 0, 0],
  ["frameAngle=fa-90&frameLength=fl-std&frontFork=ff-long", "frontCasterLeft", -0.387, -0.054, -0.021, -10.5, 0, 0],
  ["frameAngle=fa-90&frameLength=fl-std&frontFork=ff-long", "frontCasterRight", -0.223, -0.063, -0.034, 0, 0, 0],
  ["frameAngle=fa-100&frameLength=fl-long&frontFork=ff-long", "frontCasterLeft", -0.386, -0.009, -0.017, 0, 0, 0],
  ["frameAngle=fa-100&frameLength=fl-long&frontFork=ff-long", "frontCasterRight", -0.222, -0.009, -0.016, 0, 0, 0],
  ["frameAngle=fa-90&frameLength=fl-long&frontFork=ff-long", "frontCasterLeft", -0.385, -0.049, -0.004, -8, 0, 0],
  ["frameAngle=fa-90&frameLength=fl-long&frontFork=ff-long", "frontCasterRight", -0.223, -0.05, -0.002, -8, 0, 0],
].map(([selectionKey, objectName, x, y, z, rx, ry, rz]) => ({
  sourceModel: "S5",
  selectionKey,
  objectName,
  mode: "delta",
  position: { x, y, z },
  rotationDeg: { x: rx, y: ry, z: rz },
}));

export function mountRuntimeModelViewer(container) {
  const viewer = new RuntimeModelViewer(container);
  if (isLocalDebugSession()) {
    window.__wcRuntimeModelViewer = viewer;
  }
  return viewer;
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

const VIEWER_BACKGROUND_PRESETS = {
  "cool-grey": { background: 0xcbd5dd, gridPrimary: 0x687f94, gridSecondary: 0x9daeba },
  "warm-grey": { background: 0xd8d1c7, gridPrimary: 0x81776c, gridSecondary: 0xb5aa9d },
  "studio-blue": { background: 0xaebdca, gridPrimary: 0x526b83, gridSecondary: 0x8399aa },
  "graphite": { background: 0x65717b, gridPrimary: 0x2f4354, gridSecondary: 0x52616d },
};

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
    this.perspectiveCamera = null;
    this.orthographicCamera = null;
    this.projectionMode = "perspective";
    this.projectionToggleButton = null;
    this.projectionLanguageObserver = null;
    this.standardViewControls = null;
    this.settingsButton = null;
    this.settingsPanel = null;
    this.backgroundPreset = window.localStorage.getItem("wc_viewer_background") || "cool-grey";
    this.highlightDurationSeconds = Number(window.localStorage.getItem("wc_part_highlight_seconds") || 3);
    this.selectionFocusEnabled = window.localStorage.getItem("wc_selection_focus_enabled") !== "0";
    this.gridHelper = null;
    this.selectionHighlight = null;
    this.cameraFocusTransition = null;
    this.objectDebugToggleButton = null;
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
    this.objectDebugPickLeafMeshes = false;
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
    this.targetRearWheelCamber = 0;
    this.lastFrameColor = "";
    this.manualAdjustmentEntries = [];
    this.dirtyManualAdjustmentIds = new Set();
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
    root.style.background = "#cbd5dd";
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
    root.appendChild(this.createProjectionToggleButton());
    root.appendChild(this.createStandardViewControls());
    root.appendChild(this.createSettingsControl());
    this.projectionLanguageObserver = new MutationObserver(() => {
      this.syncProjectionToggleButton();
      this.syncStandardViewControls();
    });
    this.projectionLanguageObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["lang"],
    });
    root.appendChild(this.createAxesLabelLayer());
    root.appendChild(this.createDraggableObjectDebugPanel());
    this.container.appendChild(root);

    this.root = root;
    this.statusNode = statusNode;

    this.scene = new THREE.Scene();
    this.perspectiveCamera = new THREE.PerspectiveCamera(45, 1, 0.01, 1000);
    this.orthographicCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.01, 1000);
    this.perspectiveCamera.position.set(2, 2, 2);
    this.orthographicCamera.position.copy(this.perspectiveCamera.position);
    this.projectionMode = window.localStorage.getItem("wc_projection_mode") === "orthographic"
      ? "orthographic"
      : "perspective";
    this.camera = this.projectionMode === "orthographic"
      ? this.orthographicCamera
      : this.perspectiveCamera;
    this.syncProjectionToggleButton();

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

    this.scene.background = new THREE.Color(0xcbd5dd);
    this.environmentMap = buildStudioEnvironment(this.renderer);
    this.scene.environment = this.environmentMap;

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enabled = true;
    this.controls.enableRotate = true;
    this.controls.enableZoom = true;
    this.controls.enablePan = true;
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.06;
    this.controls.rotateSpeed = 1.05;
    this.controls.zoomSpeed = 1.1;
    this.controls.panSpeed = 1.0;
    this.controls.screenSpacePanning = true;
    this.controls.zoomToCursor = true;
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
    this.gridHelper = grid;
    this.setBackgroundPreset(this.backgroundPreset);

    this.initAxesOverlay();

    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(this.container);
    this.animate();
  }

  createSettingsControl() {
    const wrapper = document.createElement("div");
    wrapper.className = "wc-runtime-settings";
    Object.assign(wrapper.style, { position: "absolute", right: "12px", top: "12px", zIndex: "9" });

    const button = document.createElement("button");
    button.type = "button";
    button.className = "wc-runtime-settings-button";
    button.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 8.2a3.8 3.8 0 1 0 0 7.6 3.8 3.8 0 0 0 0-7.6Zm8.1 4.9v-2.2l-2.2-.7a7 7 0 0 0-.7-1.6l1.1-2-1.6-1.6-2 1.1a7 7 0 0 0-1.6-.7L12.4 3h-2.2l-.7 2.2a7 7 0 0 0-1.6.7L5.9 4.8 4.3 6.4l1.1 2a7 7 0 0 0-.7 1.6l-2.2.7v2.2l2.2.7a7 7 0 0 0 .7 1.6l-1.1 2 1.6 1.6 2-1.1a7 7 0 0 0 1.6.7l.7 2.2h2.2l.7-2.2a7 7 0 0 0 1.6-.7l2 1.1 1.6-1.6-1.1-2a7 7 0 0 0 .7-1.6l2.2-.7Z"/></svg>';
    Object.assign(button.style, {
      width: "40px", height: "38px", display: "grid", placeItems: "center", padding: "9px",
      borderRadius: "12px", border: "1px solid rgba(120,154,219,.42)",
      background: "rgba(10,18,34,.88)", color: "#ecf4ff", cursor: "pointer",
      boxShadow: "0 10px 24px rgba(0,0,0,.2)",
    });
    button.querySelector("svg").style.cssText = "width:20px;height:20px;fill:none;stroke:currentColor;stroke-width:1.5";

    const panel = document.createElement("div");
    panel.className = "wc-runtime-settings-panel";
    Object.assign(panel.style, {
      position: "absolute", right: "0", top: "46px", width: "260px", padding: "14px",
      borderRadius: "14px", border: "1px solid rgba(120,154,219,.38)",
      background: "rgba(10,18,34,.95)", color: "#ecf4ff", boxShadow: "0 18px 44px rgba(0,0,0,.3)",
      display: "none", fontSize: "12px", backdropFilter: "blur(14px)",
    });

    const english = () => (document.documentElement.lang || "").toLowerCase().startsWith("en");
    panel.innerHTML =
      '<strong class="wc-settings-title" style="display:block;font-size:14px;margin-bottom:12px"></strong>' +
      '<label style="display:grid;gap:6px;margin-bottom:11px"><span data-setting-label="duration"></span><select data-setting="duration"><option value="0">0 s</option><option value="1.5">1.5 s</option><option value="3">3 s</option><option value="5">5 s</option></select></label>' +
      '<label style="display:flex;align-items:center;gap:9px;margin-bottom:12px;cursor:pointer"><input data-setting="selection-focus" type="checkbox" style="width:16px;height:16px;accent-color:#f3c96b"><span data-setting-label="selection-focus"></span></label>' +
      '<div style="display:grid;gap:7px"><span data-setting-label="background"></span><div class="wc-background-presets" style="display:grid;grid-template-columns:repeat(4,1fr);gap:7px"></div></div>';
    panel.querySelectorAll("select").forEach((select) => {
      Object.assign(select.style, { width: "100%", height: "34px", borderRadius: "8px", border: "1px solid #40536d", background: "#101c30", color: "#edf4ff", padding: "0 8px" });
    });

    const durationSelect = panel.querySelector('[data-setting="duration"]');
    durationSelect.value = String(this.highlightDurationSeconds);
    durationSelect.addEventListener("change", () => {
      this.highlightDurationSeconds = Math.max(0, Number(durationSelect.value) || 0);
      window.localStorage.setItem("wc_part_highlight_seconds", String(this.highlightDurationSeconds));
    });
    const selectionFocusInput = panel.querySelector('[data-setting="selection-focus"]');
    selectionFocusInput.checked = this.selectionFocusEnabled;
    selectionFocusInput.addEventListener("change", () => {
      this.selectionFocusEnabled = selectionFocusInput.checked;
      window.localStorage.setItem("wc_selection_focus_enabled", this.selectionFocusEnabled ? "1" : "0");
    });

    const presets = panel.querySelector(".wc-background-presets");
    Object.entries(VIEWER_BACKGROUND_PRESETS).forEach(([id, preset]) => {
      const swatch = document.createElement("button");
      swatch.type = "button";
      swatch.dataset.backgroundPreset = id;
      swatch.title = id;
      Object.assign(swatch.style, { height: "30px", borderRadius: "8px", cursor: "pointer", background: `#${preset.background.toString(16).padStart(6, "0")}`, border: "2px solid transparent" });
      swatch.addEventListener("click", () => this.setBackgroundPreset(id));
      presets.appendChild(swatch);
    });

    const syncText = () => {
      const en = english();
      button.title = en ? "3D settings" : "3D 设置";
      button.setAttribute("aria-label", button.title);
      panel.querySelector(".wc-settings-title").textContent = en ? "3D settings" : "3D 设置";
      panel.querySelector('[data-setting-label="duration"]').textContent = en ? "Part highlight duration" : "部件高亮时长";
      panel.querySelector('[data-setting-label="selection-focus"]').textContent = en ? "Change view when selecting a part" : "选择配置时自动改变视角";
      panel.querySelector('[data-setting-label="background"]').textContent = en ? "Preview background" : "预览背景";
    };
    syncText();
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      panel.style.display = panel.style.display === "none" ? "block" : "none";
    });
    panel.addEventListener("click", (event) => event.stopPropagation());
    document.addEventListener("click", () => { panel.style.display = "none"; });
    new MutationObserver(syncText).observe(document.documentElement, { attributes: true, attributeFilter: ["lang"] });

    wrapper.append(button, panel);
    this.settingsButton = button;
    this.settingsPanel = panel;
    return wrapper;
  }

  setBackgroundPreset(presetId) {
    const id = VIEWER_BACKGROUND_PRESETS[presetId] ? presetId : "cool-grey";
    const preset = VIEWER_BACKGROUND_PRESETS[id];
    this.backgroundPreset = id;
    window.localStorage.setItem("wc_viewer_background", id);
    if (this.scene) this.scene.background = new THREE.Color(preset.background);
    if (this.root) this.root.style.background = `#${preset.background.toString(16).padStart(6, "0")}`;
    if (this.gridHelper && this.gridHelper.material) {
      const materials = Array.isArray(this.gridHelper.material) ? this.gridHelper.material : [this.gridHelper.material];
      materials.forEach((material, index) => {
        if (material && material.color) material.color.setHex(index === 0 ? preset.gridPrimary : preset.gridSecondary);
      });
    }
    if (this.settingsPanel) {
      this.settingsPanel.querySelectorAll("[data-background-preset]").forEach((button) => {
        button.style.borderColor = button.dataset.backgroundPreset === id ? "#f3c96b" : "transparent";
      });
    }
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

  createProjectionToggleButton() {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "wc-runtime-projection-toggle";
    Object.assign(button.style, {
      position: "absolute",
      right: "60px",
      top: "12px",
      zIndex: "7",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      minWidth: "72px",
      height: "38px",
      padding: "0 12px",
      borderRadius: "12px",
      border: "1px solid rgba(120, 154, 219, 0.42)",
      background: "rgba(10, 18, 34, 0.88)",
      color: "rgba(236, 244, 255, 0.96)",
      fontSize: "12px",
      fontWeight: "700",
      cursor: "pointer",
      userSelect: "none",
      boxShadow: "0 10px 24px rgba(0, 0, 0, 0.2)",
      backdropFilter: "blur(10px)",
      WebkitBackdropFilter: "blur(10px)",
    });
    button.addEventListener("click", () => {
      this.setProjectionMode(this.projectionMode === "perspective" ? "orthographic" : "perspective");
    });
    this.projectionToggleButton = button;
    this.syncProjectionToggleButton();
    return button;
  }

  syncProjectionToggleButton() {
    if (!this.projectionToggleButton) {
      return;
    }
    const orthographic = this.projectionMode === "orthographic";
    const english = (document.documentElement.lang || "").toLowerCase().startsWith("en");
    this.projectionToggleButton.textContent = english
      ? (orthographic ? "Orthographic" : "Perspective")
      : (orthographic ? "正交" : "透视");
    this.projectionToggleButton.setAttribute(
      "aria-label",
      english
        ? (orthographic
          ? "Orthographic view; switch to perspective view"
          : "Perspective view; switch to orthographic view")
        : (orthographic
          ? "当前为正交视图，点击切换透视视图"
          : "当前为透视视图，点击切换正交视图")
    );
    this.projectionToggleButton.title = english
      ? (orthographic ? "Orthographic view (no perspective)" : "Perspective view")
      : (orthographic ? "正交视图（无透视）" : "透视视图");
    this.projectionToggleButton.style.borderColor = orthographic
      ? "rgba(243, 201, 107, 0.88)"
      : "rgba(120, 154, 219, 0.42)";
    this.projectionToggleButton.style.color = orthographic ? "#f3c96b" : "rgba(236, 244, 255, 0.96)";
  }

  setProjectionMode(mode) {
    if (!this.controls || !this.perspectiveCamera || !this.orthographicCamera) {
      return;
    }
    const nextMode = mode === "orthographic" ? "orthographic" : "perspective";
    if (nextMode === this.projectionMode) {
      return;
    }

    const target = this.controls.target.clone();
    const sourceCamera = this.camera;
    const aspect = Math.max(0.1, this.container.clientWidth / Math.max(1, this.container.clientHeight));

    if (nextMode === "orthographic") {
      const distance = Math.max(0.1, sourceCamera.position.distanceTo(target));
      const halfHeight = Math.tan(THREE.MathUtils.degToRad(this.perspectiveCamera.fov * 0.5)) * distance;
      this.orthographicCamera.left = -halfHeight * aspect;
      this.orthographicCamera.right = halfHeight * aspect;
      this.orthographicCamera.top = halfHeight;
      this.orthographicCamera.bottom = -halfHeight;
      this.orthographicCamera.zoom = 1;
      this.orthographicCamera.position.copy(sourceCamera.position);
      this.orthographicCamera.quaternion.copy(sourceCamera.quaternion);
      this.orthographicCamera.up.copy(sourceCamera.up);
      this.orthographicCamera.near = sourceCamera.near;
      this.orthographicCamera.far = sourceCamera.far;
      this.camera = this.orthographicCamera;
    } else {
      const halfHeight = Math.max(
        0.01,
        (this.orthographicCamera.top - this.orthographicCamera.bottom) /
          (2 * Math.max(0.0001, this.orthographicCamera.zoom))
      );
      const distance = halfHeight /
        Math.tan(THREE.MathUtils.degToRad(this.perspectiveCamera.fov * 0.5));
      const direction = sourceCamera.position.clone().sub(target);
      if (direction.lengthSq() < 0.000001) {
        direction.set(1, 1, 1);
      }
      direction.normalize();
      this.perspectiveCamera.position.copy(target).addScaledVector(direction, distance);
      this.perspectiveCamera.quaternion.copy(sourceCamera.quaternion);
      this.perspectiveCamera.up.copy(sourceCamera.up);
      this.perspectiveCamera.near = sourceCamera.near;
      this.perspectiveCamera.far = sourceCamera.far;
      this.camera = this.perspectiveCamera;
    }

    this.projectionMode = nextMode;
    window.localStorage.setItem("wc_projection_mode", nextMode);
    this.camera.updateProjectionMatrix();
    this.controls.object = this.camera;
    this.controls.update();
    this.syncProjectionToggleButton();
    this.resize();
  }

  createStandardViewControls() {
    const panel = document.createElement("div");
    panel.className = "wc-runtime-standard-views";
    Object.assign(panel.style, {
      position: "absolute",
      right: "12px",
      top: "58px",
      zIndex: "7",
      display: "grid",
      gridTemplateColumns: "repeat(2, 38px)",
      gap: "5px",
      padding: "6px",
      borderRadius: "12px",
      border: "1px solid rgba(120, 154, 219, 0.3)",
      background: "rgba(10, 18, 34, 0.82)",
      boxShadow: "0 10px 24px rgba(0, 0, 0, 0.18)",
      backdropFilter: "blur(10px)",
      WebkitBackdropFilter: "blur(10px)",
    });

    [
      { id: "front", zh: "前", en: "Front" },
      { id: "rear", zh: "后", en: "Rear" },
      { id: "left", zh: "左", en: "Left" },
      { id: "right", zh: "右", en: "Right" },
      { id: "top", zh: "顶", en: "Top" },
      { id: "bottom", zh: "底", en: "Bottom" },
    ].forEach((view) => {
      const button = document.createElement("button");
      button.type = "button";
      button.dataset.standardView = view.id;
      button.dataset.labelZh = view.zh;
      button.dataset.labelEn = view.en;
      button.innerHTML = this.createStandardViewIcon(view.id);
      Object.assign(button.style, {
        width: "38px",
        height: "32px",
        padding: "0",
        borderRadius: "8px",
        border: "1px solid rgba(120, 154, 219, 0.34)",
        background: "rgba(18, 31, 55, 0.92)",
        color: "rgba(236, 244, 255, 0.96)",
        fontSize: "11px",
        fontWeight: "700",
        cursor: "pointer",
        display: "grid",
        placeItems: "center",
      });
      const icon = button.querySelector("svg");
      if (icon) {
        icon.style.cssText = "width:29px;height:25px;display:block;overflow:visible";
      }
      button.addEventListener("click", () => this.setStandardView(view.id));
      panel.appendChild(button);
    });

    if (isLocalDebugSession() && !isMobileViewport()) {
      const debugButton = document.createElement("button");
      debugButton.type = "button";
      debugButton.dataset.debugPanelToggle = "1";
      Object.assign(debugButton.style, {
        gridColumn: "1 / -1",
        minHeight: "30px",
        padding: "0 6px",
        borderRadius: "8px",
        border: "1px solid rgba(243, 201, 107, 0.58)",
        background: "rgba(42, 34, 20, 0.9)",
        color: "#f3c96b",
        fontSize: "10px",
        fontWeight: "700",
        cursor: "pointer",
      });
      debugButton.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        this.toggleObjectDebugPanel();
      });
      panel.appendChild(debugButton);
      this.objectDebugToggleButton = debugButton;
    }

    this.standardViewControls = panel;
    this.syncStandardViewControls();
    return panel;
  }

  createStandardViewIcon(viewName) {
    const arrows = {
      front: '<path class="wc-view-arrow" d="M16 26V20M12.5 23.5 16 20l3.5 3.5"/>',
      rear: '<path class="wc-view-arrow" d="M16 0v6M12.5 2.5 16 6l3.5-3.5"/>',
      left: '<path class="wc-view-arrow" d="M0 13h7M3.5 9.5 7 13l-3.5 3.5"/>',
      right: '<path class="wc-view-arrow" d="M32 13h-7M28.5 9.5 25 13l3.5 3.5"/>',
      top: '<path class="wc-view-arrow" d="M16 0v7M12.5 3.5 16 7l3.5-3.5"/><path class="wc-view-depth" d="M11 10h10"/>',
      bottom: '<path class="wc-view-arrow" d="M16 26v-7M12.5 22.5 16 19l3.5 3.5"/><path class="wc-view-depth" d="M11 16h10"/>',
    };
    const vertical = viewName === "top" || viewName === "bottom";
    const chair = vertical
      ? '<rect class="wc-view-seat" x="10" y="8" width="12" height="10" rx="2"/><path class="wc-view-wheel" d="M7 7v12M25 7v12"/><path class="wc-view-frame" d="M10 10 7 8M22 10l3-2"/>'
      : '<rect class="wc-view-seat" x="11" y="8" width="10" height="9" rx="2"/><path class="wc-view-wheel" d="M8 7v12M24 7v12"/><path class="wc-view-frame" d="M11 10 8 8M21 10l3-2"/>';
    return '<svg viewBox="0 0 32 26" aria-hidden="true" focusable="false">' +
      '<g fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round">' +
      chair + (arrows[viewName] || "") + '</g></svg>';
  }

  syncStandardViewControls() {
    if (!this.standardViewControls) {
      return;
    }
    const english = (document.documentElement.lang || "").toLowerCase().startsWith("en");
    this.standardViewControls.querySelectorAll("[data-standard-view]").forEach((button) => {
      const label = english ? button.dataset.labelEn : button.dataset.labelZh;
      button.title = english ? `${label} view` : `${label}视图`;
      button.setAttribute("aria-label", button.title);
    });
    if (this.objectDebugToggleButton) {
      this.objectDebugToggleButton.textContent = english ? "Part tuning" : "部件微调";
    }
  }

  setStandardView(viewName) {
    if (!this.camera || !this.controls || !this.modelRoot) {
      return;
    }
    const box = new THREE.Box3().setFromObject(this.modelRoot);
    if (box.isEmpty()) {
      return;
    }
    const center = box.getCenter(new THREE.Vector3());
    const sphere = box.getBoundingSphere(new THREE.Sphere());
    const radius = Math.max(0.1, sphere.radius);
    const directions = {
      front: new THREE.Vector3(0, 0, -1),
      rear: new THREE.Vector3(0, 0, 1),
      left: new THREE.Vector3(1, 0, 0),
      right: new THREE.Vector3(-1, 0, 0),
      top: new THREE.Vector3(0, 1, 0),
      bottom: new THREE.Vector3(0, -1, 0),
    };
    const direction = directions[viewName] || directions.front;
    const up = viewName === "top"
      ? new THREE.Vector3(0, 0, -1)
      : viewName === "bottom"
        ? new THREE.Vector3(0, 0, 1)
        : new THREE.Vector3(0, 1, 0);
    const distance = Math.max(radius * 3, 1);
    this.camera.position.copy(center).addScaledVector(direction, distance);
    this.camera.up.copy(up);
    this.setSafeCameraClipping(distance);

    if (this.camera.isOrthographicCamera) {
      const aspect = Math.max(0.1, this.container.clientWidth / Math.max(1, this.container.clientHeight));
      const halfHeight = radius * 1.18;
      this.camera.left = -halfHeight * aspect;
      this.camera.right = halfHeight * aspect;
      this.camera.top = halfHeight;
      this.camera.bottom = -halfHeight;
      this.camera.zoom = 1;
    }

    this.controls.target.copy(center);
    this.camera.lookAt(center);
    this.camera.updateProjectionMatrix();
    this.controls.update();
  }

  toggleObjectDebugPanel() {
    if (!this.objectDebugPanel) {
      return;
    }
    const cameraView = this.captureCameraView();
    this.cameraFocusTransition = null;
    const rect = this.objectDebugPanel.getBoundingClientRect();
    const outsideViewport =
      rect.right < 0 || rect.bottom < 0 || rect.left > window.innerWidth || rect.top > window.innerHeight;
    const shouldShow = this.objectDebugPanel.style.display === "none" || outsideViewport;
    this.objectDebugPanel.style.display = shouldShow ? "flex" : "none";
    if (shouldShow) {
      const next = this.clampObjectDebugPanelPosition(16, 16);
      this.objectDebugPanel.style.left = `${next.left}px`;
      this.objectDebugPanel.style.top = `${next.top}px`;
      this.objectDebugPanel.style.bottom = "auto";
      this.persistObjectDebugPanelPosition();
    }
    this.restoreCameraView(cameraView);
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
    return [
      sourceModel || "",
      this.normalizeAdjustmentSelectionKey(selectionKey),
      this.normalizeAdjustmentObjectName(objectName),
    ].join("::");
  }

  normalizeAdjustmentObjectName(objectName) {
    const normalized = objectName || "";
    if (normalized === "axle") {
      return "axleRight";
    }
    if (normalized.startsWith("axle::")) {
      return `axleRight${normalized.slice("axle".length)}`;
    }
    return normalized;
  }

  normalizeAdjustmentSelectionKeyForObject(objectName, selectionOrKey) {
    const normalized = this.normalizeAdjustmentSelectionKey(selectionOrKey);
    const normalizedObjectName = objectName || "";
    if (/^rearWheel(?:Handrim|Tyre)?(?:Left|Right)(?:::|$)/.test(normalizedObjectName)) {
      const pairs = new Map(this.parseAdjustmentSelectionPairs(normalized));
      // Wheel roots already receive seat-width and camber transforms from the
      // assembly. Keep only the wheel specification here so unrelated options
      // cannot create stale copies of the same calibration.
      const rearWheel = pairs.get("rearWheel") || "";
      return rearWheel ? `rearWheel=${rearWheel}` : "";
    }
    if (/^sideguards?(?:Left|Right)?(?:::|$)/.test(normalizedObjectName)) {
      const pairs = new Map(this.parseAdjustmentSelectionPairs(normalized));
      // Sideguard roots follow seat width parametrically. Plastic and carbon
      // variants may share geometry, but each style keeps its own calibration.
      const skirtGuards = pairs.get("skirtGuards") || "";
      return skirtGuards ? `skirtGuards=${skirtGuards}` : "";
    }
    if (/^lateralFrame(?:Left|Right)(?:::|$)/.test(normalizedObjectName)) {
      const pairs = new Map(this.parseAdjustmentSelectionPairs(normalized));
      const lateralFrame = pairs.get("lateralFrame") || "";
      return lateralFrame ? `lateralFrame=${lateralFrame}` : "";
    }
    if (/^frontFork(?:Left|Right)(?:::|$)/.test(normalizedObjectName)) {
      const pairs = new Map(this.parseAdjustmentSelectionPairs(normalized));
      // Forks are independent from caster wheels and keep separate calibration
      // for each physical fork, angle and frame-length assembly.
      return ["frameAngle", "frameLength", "frontFork"]
        .map((key) => (pairs.get(key) ? `${key}=${pairs.get(key)}` : ""))
        .filter(Boolean)
        .join("&");
    }
    if (/^frontCaster(?:Left|Right)(?:::|$)/.test(normalizedObjectName)) {
      const pairs = new Map(this.parseAdjustmentSelectionPairs(normalized));
      // Caster placement follows the selected fork asset as well as angle and
      // frame length. Keeping the fork type prevents long/one-arm calibration
      // from moving the caster used by the standard fork.
      return ["frameAngle", "frameLength", "frontFork"]
        .map((key) => (pairs.get(key) ? `${key}=${pairs.get(key)}` : ""))
        .filter(Boolean)
        .join("&");
    }
    if (/^seat(?:::|$)/.test(normalizedObjectName)) {
      const pairs = new Map(this.parseAdjustmentSelectionPairs(normalized));
      const seatSetting = pairs.get("seatSetting") || "";
      return seatSetting ? `seatSetting=${seatSetting}` : "";
    }
    if (/^axle(?:Left|Right)?(?:::|$)/.test(normalizedObjectName)) {
      const pairs = new Map(this.parseAdjustmentSelectionPairs(normalized));
      // Axle roots already follow the live seat-width assembly offset. Keep a
      // single local calibration across every width instead of storing five
      // duplicate positions that fight the automatic lateral placement.
      return ["axle", "rearWheel", "rearWheelsBar"]
        .map((key) => (pairs.get(key) ? `${key}=${pairs.get(key)}` : ""))
        .filter(Boolean)
        .join("&");
    }
    if (!/^brake(?:Left|Right)?(?:::|$)/.test(normalizedObjectName)) {
      return normalized;
    }
    const pairs = new Map(this.parseAdjustmentSelectionPairs(normalized));
    const brake = pairs.get("brake") || "";
    const seatWidth = pairs.get("seatWidth") || "";
    return [brake ? `brake=${brake}` : "", seatWidth ? `seatWidth=${seatWidth}` : ""]
      .filter(Boolean)
      .join("&");
  }

  normalizeAdjustmentEntry(entry) {
    const source = entry && typeof entry === "object" ? entry : {};
    const cameraViewSource = source.cameraView && typeof source.cameraView === "object"
      ? source.cameraView
      : null;
    const normalizeVector = (value, fallback = 0) => ({
      x: Number.isFinite(Number(value && value.x)) ? Number(Number(value.x).toFixed(6)) : fallback,
      y: Number.isFinite(Number(value && value.y)) ? Number(Number(value.y).toFixed(6)) : fallback,
      z: Number.isFinite(Number(value && value.z)) ? Number(Number(value.z).toFixed(6)) : fallback,
    });
    return {
      sourceModel: source.sourceModel || "",
      selectionKey: this.normalizeAdjustmentSelectionKeyForObject(
        source.objectName || "",
        source.selectionKey || ""
      ),
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
      cameraView: cameraViewSource
        ? {
            position: normalizeVector(cameraViewSource.position),
            target: normalizeVector(cameraViewSource.target),
            up: normalizeVector(cameraViewSource.up, 0),
            zoom: Math.max(0.0001, Number(cameraViewSource.zoom) || 1),
            projection: cameraViewSource.projection === "orthographic" ? "orthographic" : "perspective",
          }
        : null,
      updatedAt: source.updatedAt || "",
    };
  }

  captureSerializableCameraView() {
    const view = this.captureCameraView();
    if (!view) return null;
    const serializeVector = (value) => ({
      x: Number(value.x.toFixed(6)),
      y: Number(value.y.toFixed(6)),
      z: Number(value.z.toFixed(6)),
    });
    return {
      position: serializeVector(view.position),
      target: serializeVector(view.target),
      up: serializeVector(view.up),
      zoom: Number(view.zoom.toFixed(6)),
      projection: this.projectionMode,
    };
  }

  getCustomCameraViewForTargets(targets) {
    const targetKeys = new Set((targets || []).map((entry) => entry && entry.key).filter(Boolean));
    if (!targetKeys.size) return null;
    const sourceModel = this.lastSourceModel || this.currentSourceModel || "";
    const activeSelection = this.normalizeAdjustmentSelectionKey(this.lastSelection || {});
    const matches = this.manualAdjustmentEntries.filter((entry) => {
      if (!entry || !entry.cameraView || entry.sourceModel !== sourceModel) return false;
      const partKey = this.parseAdjustableObjectKey(entry.objectName || "").partKey;
      return targetKeys.has(partKey) && this.doesAdjustmentMatchSelection(entry.selectionKey, activeSelection);
    });
    matches.sort((left, right) => {
      const specificity = this.getAdjustmentSelectionSpecificity(right.selectionKey) -
        this.getAdjustmentSelectionSpecificity(left.selectionKey);
      if (specificity) return specificity;
      return (Date.parse(right.updatedAt || "") || 0) - (Date.parse(left.updatedAt || "") || 0);
    });
    return matches.length ? matches[0].cameraView : null;
  }

  setSafeCameraClipping(distance = 1) {
    if (!this.camera) return;
    this.camera.near = Math.min(0.005, Math.max(0.0005, Number(distance) / 1000));
    this.camera.far = Math.max(100, Number(distance) * 100);
    this.camera.updateProjectionMatrix();
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
    const selectionKey = this.normalizeAdjustmentSelectionKeyForObject(
      objectName,
      this.lastSelection || {}
    );
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
    const objectName = this.objectDebugTargetName || "";
    if (!objectName) {
      return null;
    }
    const selectionKey = this.normalizeAdjustmentSelectionKeyForObject(
      objectName,
      this.lastSelection || {}
    );
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
    if (!partKey) {
      return meshName || "";
    }
    return meshName ? `${partKey}::${meshName}` : partKey;
  }

  parseAdjustableObjectKey(objectKey) {
    const value = objectKey || "";
    const separatorIndex = value.indexOf("::");
    if (separatorIndex >= 0) {
      return {
        partKey: value.slice(0, separatorIndex),
        meshName: value.slice(separatorIndex + 2),
      };
    }
    return {
      partKey: value,
      meshName: "",
    };
  }

  getAdjustableLabel(key) {
    const { partKey, meshName } = this.parseAdjustableObjectKey(key);
    const entry = this.partObjects.find((item) => item && item.key === partKey);
    const src = entry && entry.src ? entry.src : "";
    const fileName = (src.split("/").pop() || partKey || "").split("?")[0];
    const sideLabel =
      partKey === "brakeRight"
        ? "左侧"
        : partKey === "brakeLeft"
          ? "右侧"
          : "";
    const partLabel = sideLabel ? `${sideLabel} - ${fileName}` : fileName;
    if (!meshName) {
      return partLabel || key || "";
    }
    const mesh = this.getObjectsByAdjustableName(key)[0];
    const meshLabel = mesh && mesh.name ? mesh.name : meshName;
    return `${partLabel} › ${meshLabel} [${meshName}]`;
  }

  getAdjustableMeshIdentifier(partEntry, targetMesh) {
    if (!partEntry || !partEntry.object || !(targetMesh instanceof THREE.Mesh)) {
      return "";
    }
    let meshIndex = -1;
    let currentIndex = 0;
    partEntry.object.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) {
        return;
      }
      if (child === targetMesh) {
        meshIndex = currentIndex;
      }
      currentIndex += 1;
    });
    return meshIndex >= 0 ? `mesh-${meshIndex}` : "";
  }

  getAdjustableMeshByIdentifier(partEntry, meshIdentifier) {
    if (!partEntry || !partEntry.object || !meshIdentifier) {
      return null;
    }
    const indexMatch = /^mesh-(\d+)$/.exec(meshIdentifier);
    const targetIndex = indexMatch ? Number.parseInt(indexMatch[1], 10) : -1;
    let currentIndex = 0;
    let match = null;
    partEntry.object.traverse((child) => {
      if (!(child instanceof THREE.Mesh) || match) {
        return;
      }
      if (
        (targetIndex >= 0 && currentIndex === targetIndex) ||
        (targetIndex < 0 && (child.name || child.uuid) === meshIdentifier)
      ) {
        match = child;
      }
      currentIndex += 1;
    });
    return match;
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

  translateObjectAlongWorldAxis(object, axis, distance) {
    if (!object || !Number.isFinite(distance) || Math.abs(distance) < 1e-8) {
      return;
    }

    const direction = new THREE.Vector3(
      axis === "x" ? distance : 0,
      axis === "y" ? distance : 0,
      axis === "z" ? distance : 0
    );

    if (!object.parent) {
      object.position.add(direction);
      object.updateWorldMatrix(true, true);
      return;
    }

    object.parent.updateWorldMatrix(true, false);
    const worldOrigin = object.parent.localToWorld(new THREE.Vector3());
    const worldTarget = worldOrigin.clone().add(direction);
    const localOrigin = object.parent.worldToLocal(worldOrigin.clone());
    const localTarget = object.parent.worldToLocal(worldTarget);
    object.position.add(localTarget.sub(localOrigin));
    object.updateWorldMatrix(true, true);
  }

  translateObjectAlongWorldX(object, distance) {
    this.translateObjectAlongWorldAxis(object, "x", distance);
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

  resolvePartKeyFromObject(object) {
    let current = object || null;
    while (current) {
      if (current.userData && current.userData.partKey) {
        return current.userData.partKey;
      }
      current = current.parent || null;
    }
    return "";
  }

  resolveAdjustableObjectKeyFromObject(object) {
    const partKey = this.resolvePartKeyFromObject(object);
    if (!partKey) {
      return "";
    }
    if (this.objectDebugPickLeafMeshes && object instanceof THREE.Mesh) {
      const entry = this.getPartEntryByObjectName(partKey);
      const meshIdentifier = this.getAdjustableMeshIdentifier(entry, object);
      return this.buildAdjustableObjectKey(partKey, meshIdentifier);
    }
    return this.buildAdjustableObjectKey(partKey, "");
  }

  getAdjustableObjectNames() {
    const names = [];
    this.getAdjustablePartEntries().forEach((entry) => {
      names.push(entry.key);
      if (!this.objectDebugPickLeafMeshes) {
        return;
      }
      entry.object.traverse((child) => {
        if (!(child instanceof THREE.Mesh)) {
          return;
        }
        const meshIdentifier = this.getAdjustableMeshIdentifier(entry, child);
        if (meshIdentifier) {
          names.push(this.buildAdjustableObjectKey(entry.key, meshIdentifier));
        }
      });
    });
    return Array.from(new Set(names)).sort((a, b) => a.localeCompare(b));
  }

  getObjectsByAdjustableName(objectName) {
    const { partKey, meshName } = this.parseAdjustableObjectKey(objectName);
    // Existing axle calibration records used the former single-part key.
    const resolvedPartKey = partKey === "axle" ? "axleRight" : partKey;
    const entry = this.getPartEntryByObjectName(resolvedPartKey);
    if (!entry || !entry.object) {
      return [];
    }
    if (!meshName) {
      return [entry.object];
    }
    const mesh = this.getAdjustableMeshByIdentifier(entry, meshName);
    return mesh ? [mesh] : [];
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

  syncFrontForksToCasterRoots(selection = {}) {
    // Intentionally empty. Fork roots and caster roots are independent
    // adjustable assemblies; neither is allowed to overwrite the other.
  }

  applyManualObjectAdjustments(selection) {
    if (!this.modelRoot) {
      return;
    }

    this.resetManualAdjustmentsOnObjects();
    // Establish automatic assembly positions first. Manual adjustments must be
    // applied afterwards so locally edited backrest and rear-wheel positions
    // are not overwritten on every refresh.
    this.alignCenteredBackrest();
    this.applyRearWheelPlacements(selection);

    const sourceModel = this.lastSourceModel || this.currentSourceModel || "";
    const selectionKey = this.normalizeAdjustmentSelectionKey(selection || this.lastSelection || {});
    const relevantEntries = [
      ...[
        ...BUILT_IN_OBJECT_ADJUSTMENTS,
        ...FOOTREST_PLATE_FINAL_ADJUSTMENTS,
        ...S5_WHEEL_FOOTREST_REFERENCE_ADJUSTMENTS,
        ...S5_FINAL_PUBLIC_OBJECT_ADJUSTMENTS,
        ...S5_FINAL_FRONT_ASSEMBLY_ADJUSTMENTS,
        ...this.getS5AxleBaselineEntries(selection),
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
        const objectName = this.normalizeAdjustmentObjectName(entry.objectName);
        map.set(objectName, objectName === entry.objectName ? entry : { ...entry, objectName });
        return map;
      }, new Map());
    S5_POSITION_REFERENCE_OBJECTS.forEach((objectName) => {
      const referenceEntry = this.getS5PositionReferenceAdjustment(objectName, selection);
      if (referenceEntry) {
        resolvedMap.set(objectName, referenceEntry);
      }
    });
    this.applyBrakeSeatWidthReferenceAdjustments(resolvedMap, selection);
    const resolvedEntries = Array.from(resolvedMap.values());

    const applyResolvedEntry = (entry, forceCurrentBase = false) => {
      this.getObjectsByAdjustableName(entry.objectName).forEach((object) => {
        const isRearWheel = this.isRearWheelComponentKey(entry.objectName);
        if (forceCurrentBase || !object.userData.baseManualAdjustPosition || isRearWheel) {
          // Rear-wheel camber is an automatic transform and may change while the
          // same model remains loaded. Use the current cambered transform as the
          // manual-adjustment base instead of restoring a cached 0-degree pose.
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
          this.applySeatWidthRootOffset(entry.objectName, object, selection, entry.mode);
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
        const rearWheelReference =
          entry.objectName === "rearWheelLeft"
            ? S5_REAR_WHEEL_REFERENCE_ADJUSTMENT.left
            : entry.objectName === "rearWheelRight"
              ? S5_REAR_WHEEL_REFERENCE_ADJUSTMENT.right
              : null;
        const positionDelta = {
          x: entry.position.x - (rearWheelReference ? rearWheelReference.x : 0),
          y: entry.position.y - (rearWheelReference ? rearWheelReference.y : 0),
          z: entry.position.z - (rearWheelReference ? rearWheelReference.z : 0),
        };
        if (/^(?:brake|frontFork)(?:Left|Right)(?:::|$)/.test(entry.objectName)) {
          // Imported brake and fork nodes use rotated or mirrored local axes.
          // Debug controls are labelled against the viewport axes, so convert
          // each delta through the parent transform before applying it.
          this.translateObjectAlongWorldAxis(object, "x", positionDelta.x);
          this.translateObjectAlongWorldAxis(object, "y", positionDelta.y);
          this.translateObjectAlongWorldAxis(object, "z", positionDelta.z);
        } else {
          object.position.x += positionDelta.x;
          object.position.y += positionDelta.y;
          object.position.z += positionDelta.z;
        }
        this.applySeatWidthRootOffset(entry.objectName, object, selection, entry.mode);
      });
    };

    const useIndependentFoldingBrakes =
      (selection && selection.brake) === "brake-push-folding";
    const foldingBrakeBaselineEntries = useIndependentFoldingBrakes
      ? this.getPushFoldingBrakeBaselineEntries(selection)
      : [];
    const foldingBrakeBaselineMap = new Map(
      foldingBrakeBaselineEntries.map((entry) => [entry.objectName, entry])
    );
    const deferredLeftBrakeEntries = [];
    const deferredLeftAxleEntries = [];
    const deferredFrontForkEntries = [];
    resolvedEntries.forEach((entry) => {
      if (
        useIndependentFoldingBrakes &&
        /^brake(?:Left|Right)(?:::|$)/.test(entry.objectName)
      ) {
        return;
      }
      if (/^brakeLeft(?:::|$)/.test(entry.objectName)) {
        deferredLeftBrakeEntries.push(entry);
        return;
      }
      if (/^axleLeft(?:::|$)/.test(entry.objectName)) {
        deferredLeftAxleEntries.push(entry);
        return;
      }
      if (/^frontFork(?:Left|Right)(?:::|$)/.test(entry.objectName)) {
        deferredFrontForkEntries.push(entry);
        return;
      }
      applyResolvedEntry(entry);
    });

    // Both axle instances use the same, non-mirrored GLB. Reproduce the
    // calibrated right-side assembly on the left and translate it by the live
    // distance between the two rear-wheel roots.
    if (useIndependentFoldingBrakes) {
      foldingBrakeBaselineEntries
        .filter((entry) => /^brakeRight(?:::|$)/.test(entry.objectName))
        .forEach((entry) => applyResolvedEntry(entry));
    }

    // Brake assets are authored and calibrated on the wheelchair's right side.
    // Reflect the completed right-side transform first, then allow the left
    // instance to receive its own world-axis calibration without being reset.
    this.mirrorPartAcrossModelX("brakeRight", "brakeLeft");
    if (useIndependentFoldingBrakes) {
      foldingBrakeBaselineEntries
        .filter((entry) => /^brakeLeft(?:::|$)/.test(entry.objectName))
        .forEach((entry) => applyResolvedEntry(entry, true));
    } else {
      deferredLeftBrakeEntries.forEach((entry) => applyResolvedEntry(entry, true));
    }
    this.applyBrakeSeatWidthPlacement(selection);
    this.finalizePushFoldingBrakePlacement(selection);
    if (useIndependentFoldingBrakes) {
      this.applyPushFoldingBrakeIndependentAdjustments(
        resolvedMap,
        foldingBrakeBaselineMap
      );
      this.ensureOppositeBrakeHandedness("brakeLeft", "brakeRight");
    }

    // The footplate and its supporting frame are fixed-width center assemblies.
    // Saved per-configuration offsets must not move them away from the frame center.
    this.alignCenteredFootrestAssembly();
    this.applyRearWheelVariantAssemblyCorrection(selection);
    this.alignRearWheelSubcomponentsToMainWheels();
    // A left-side mesh calibration already contains the complete handed
    // placement. Deriving another root offset from the right axle would apply
    // the wheel separation twice and move the calibrated Tetra axle across the
    // chair. Only synthesize the left assembly when no left entry exists.
    if (deferredLeftAxleEntries.length === 0) {
      this.syncLeftAxleFromRight({
        copyChildren: true,
        referenceSeatWidthCm: S5_WHEEL_FOOTREST_REFERENCE_SEAT_WIDTH_CM,
        selection,
      });
    }
    deferredLeftAxleEntries.forEach((entry) => applyResolvedEntry(entry, true));
    this.applyAxleSeatWidthPlacement(selection);
    // Apply fork calibration independently after caster placement.
    deferredFrontForkEntries.forEach((entry) => applyResolvedEntry(entry, true));
    this.syncOrbitTargetToModelCenter();
  }

  getS5AxleBaselineEntries(selection) {
    if (!selection || selection.rearWheel !== "rw-24b") {
      return [];
    }
    const axle = String(selection.axle || "");
    const isTetra = axle.indexOf("tetra") >= 0;
    const isStandard24B = axle.indexOf("std") >= 0 && selection.rearWheel === "rw-24b";
    if (!isTetra && !isStandard24B) {
      return [];
    }
    const selectionKey = isTetra
      ? "axle=axle-tetra-stainless"
      : "axle=axle-std-stainless&rearWheel=rw-24b";
    return [
      {
        sourceModel: "S5",
        selectionKey,
        objectName: "axleRight",
        mode: "delta",
        position: { x: -0.03, y: 0, z: 0 },
        rotationDeg: { x: 0, y: 0, z: 0 },
      },
      {
        sourceModel: "S5",
        selectionKey,
        objectName: "axleRight::mesh-0",
        mode: "delta",
        position: { x: -0.173, y: 0.04, z: 0.12 },
        rotationDeg: { x: -5, y: -90, z: 0 },
      },
    ].map((entry) => this.normalizeAdjustmentEntry(entry));
  }

  syncLeftAxleFromRight({ copyChildren = true, referenceSeatWidthCm = null, selection = null } = {}) {
    const rightAxle = this.getPartEntryByObjectName("axleRight")?.object;
    const leftAxle = this.getPartEntryByObjectName("axleLeft")?.object;
    const rightWheel = this.getPartEntryByObjectName("rearWheelRight")?.object;
    const leftWheel = this.getPartEntryByObjectName("rearWheelLeft")?.object;
    if (!rightAxle || !leftAxle || !rightWheel || !leftWheel) {
      return;
    }

    const copyChildTransforms = (source, target) => {
      const count = Math.min(source.children.length, target.children.length);
      for (let index = 0; index < count; index += 1) {
        const sourceChild = source.children[index];
        const targetChild = target.children[index];
        targetChild.position.copy(sourceChild.position);
        targetChild.quaternion.copy(sourceChild.quaternion);
        targetChild.scale.copy(sourceChild.scale);
        copyChildTransforms(sourceChild, targetChild);
      }
    };

    if (copyChildren) {
      copyChildTransforms(rightAxle, leftAxle);
    }
    const wheelDelta = leftWheel.position.clone().sub(rightWheel.position);
    if (Number.isFinite(referenceSeatWidthCm)) {
      const currentSeatWidthCm = this.getSeatWidthCm(selection || this.lastSelection || {});
      const widthDeltaMeters = (currentSeatWidthCm - referenceSeatWidthCm) * 0.01;
      if (Math.abs(wheelDelta.x) > 1e-8) {
        // The imported rear-wheel roots face inward, so increasing seat width
        // reduces their local X separation. Add that reduction back to recover
        // the calibrated 36 cm root distance before applying per-side offsets.
        wheelDelta.x += Math.sign(wheelDelta.x) * widthDeltaMeters;
      }
    }
    leftAxle.position.copy(rightAxle.position).add(wheelDelta);
    leftAxle.quaternion.copy(rightAxle.quaternion);
    leftAxle.scale.copy(rightAxle.scale);
    leftAxle.updateMatrixWorld(true);
  }

  applyAxleSeatWidthPlacement(selection) {
    const seatWidthCm = this.getSeatWidthCm(selection || this.lastSelection || {});
    const halfDeltaMeters =
      ((seatWidthCm - FRAME_BASE_SEAT_WIDTH_CM) * 0.01) * 0.5;
    const leftAxle = this.getPartEntryByObjectName("axleLeft")?.object;
    const rightAxle = this.getPartEntryByObjectName("axleRight")?.object;
    if (leftAxle) {
      if (!leftAxle.userData.axleSeatWidthReferencePosition) {
        leftAxle.userData.axleSeatWidthReferencePosition = leftAxle.position.clone();
      }
      leftAxle.position.copy(leftAxle.userData.axleSeatWidthReferencePosition);
      // Preserve the manually calibrated 36 cm position exactly. Only the
      // additional half-width is applied, matching the paired rear wheels.
      // This calibrated instance is displayed on the chair's physical right
      // side, so it follows the right wheel as the chair widens.
      leftAxle.position.x += halfDeltaMeters;
      leftAxle.updateMatrixWorld(true);
    }
    if (rightAxle) {
      if (!rightAxle.userData.axleSeatWidthReferencePosition) {
        rightAxle.userData.axleSeatWidthReferencePosition = rightAxle.position.clone();
      }
      rightAxle.position.copy(rightAxle.userData.axleSeatWidthReferencePosition);
      // This calibrated instance is displayed on the chair's physical left
      // side, so it follows the left wheel as the chair widens.
      rightAxle.position.x -= halfDeltaMeters;
      rightAxle.updateMatrixWorld(true);
    }
  }

  getPushFoldingBrakeBaselineEntries(selection) {
    const calibratedLeftMeshX =
      (selection && selection.seatWidth) === "sw-45" ? -0.595 : -0.491;
    return [
      {
        sourceModel: "S5",
        selectionKey: "",
        objectName: "brakeRight",
        mode: "delta",
        position: { x: -0.106, y: 0.16, z: 0.39 },
        rotationDeg: { x: -180, y: 0, z: -90 },
      },
      {
        sourceModel: "S5",
        selectionKey: "",
        objectName: "brakeRight::mesh-0",
        mode: "delta",
        position: { x: -0.015, y: 0, z: 0 },
        rotationDeg: { x: 0, y: 0, z: 0 },
      },
      {
        sourceModel: "S5",
        selectionKey: "brake=brake-push-folding&seatWidth=sw-45",
        objectName: "brakeLeft",
        mode: "delta",
        position: { x: 0.367, y: 0.06, z: -0.03 },
        rotationDeg: { x: -180, y: -180, z: 0 },
      },
      {
        sourceModel: "S5",
        selectionKey: "brake=brake-push-folding&seatWidth=sw-45",
        objectName: "brakeLeft::mesh-0",
        mode: "delta",
        position: { x: calibratedLeftMeshX, y: 0.02, z: 0 },
        rotationDeg: { x: 0, y: 0, z: 0 },
      },
    ].map((entry) => this.normalizeAdjustmentEntry(entry));
  }

  applyPushFoldingBrakeIndependentAdjustments(resolvedMap, baselineMap) {
    if (!resolvedMap || !baselineMap) {
      return;
    }
    resolvedMap.forEach((entry, objectName) => {
      if (!/^brake(?:Left|Right)(?:::|$)/.test(objectName)) {
        return;
      }
      const baseline = baselineMap.get(objectName);
      if (!baseline || entry.mode !== "delta") {
        return;
      }
      const positionDelta = {
        x: entry.position.x - baseline.position.x,
        y: entry.position.y - baseline.position.y,
        z: entry.position.z - baseline.position.z,
      };
      const rotationDelta = {
        x: entry.rotationDeg.x - baseline.rotationDeg.x,
        y: entry.rotationDeg.y - baseline.rotationDeg.y,
        z: entry.rotationDeg.z - baseline.rotationDeg.z,
      };
      this.getObjectsByAdjustableName(objectName).forEach((object) => {
        const basePosition = object.position.clone();
        const baseRotation = object.rotation.clone();
        const targetRotation = baseRotation.clone();
        targetRotation.x += THREE.MathUtils.degToRad(rotationDelta.x);
        targetRotation.y += THREE.MathUtils.degToRad(rotationDelta.y);
        targetRotation.z += THREE.MathUtils.degToRad(rotationDelta.z);
        this.applyRotationAroundGeometryCenter(
          object,
          basePosition,
          baseRotation,
          targetRotation
        );
        this.translateObjectAlongWorldAxis(object, "x", positionDelta.x);
        this.translateObjectAlongWorldAxis(object, "y", positionDelta.y);
        this.translateObjectAlongWorldAxis(object, "z", positionDelta.z);
        object.updateMatrixWorld(true);
      });
    });
  }

  ensureOppositeBrakeHandedness(sourceKey, mirroredKey) {
    const source = this.getPartEntryByObjectName(sourceKey);
    const mirrored = this.getPartEntryByObjectName(mirroredKey);
    if (!source?.object || !mirrored?.object) {
      return;
    }

    source.object.updateMatrixWorld(true);
    mirrored.object.updateMatrixWorld(true);
    const sourceSign = Math.sign(source.object.matrixWorld.determinant()) || 1;
    const mirroredSign = Math.sign(mirrored.object.matrixWorld.determinant()) || 1;
    if (sourceSign !== mirroredSign) {
      return;
    }

    // Preserve the calibrated world-space center while changing the mesh
    // handedness. This creates a true left/right pair instead of two rotated
    // copies of the same part.
    const beforeBounds = new THREE.Box3().setFromObject(mirrored.object);
    const beforeCenter = beforeBounds.getCenter(new THREE.Vector3());
    mirrored.object.scale.x *= -1;
    mirrored.object.updateMatrixWorld(true);
    const afterBounds = new THREE.Box3().setFromObject(mirrored.object);
    const afterCenter = afterBounds.getCenter(new THREE.Vector3());
    this.translateObjectAlongWorldAxis(
      mirrored.object,
      "x",
      beforeCenter.x - afterCenter.x
    );
    this.translateObjectAlongWorldAxis(
      mirrored.object,
      "y",
      beforeCenter.y - afterCenter.y
    );
    this.translateObjectAlongWorldAxis(
      mirrored.object,
      "z",
      beforeCenter.z - afterCenter.z
    );
    mirrored.object.updateMatrixWorld(true);
  }

  finalizePushFoldingBrakePlacement(selection) {
    if ((selection && selection.brake) !== "brake-push-folding") {
      return;
    }
    const authoredRight = this.getPartEntryByObjectName("brakeRight");
    const calibratedLeft = this.getPartEntryByObjectName("brakeLeft");
    if (
      !authoredRight ||
      !authoredRight.object ||
      !calibratedLeft ||
      !calibratedLeft.object
    ) {
      return;
    }

    // The saved calibration was authored on the instance currently used on the
    // physical right side. Keep that calibrated placement, then create the left
    // counterpart from its rendered bounds. The imported GLB origin is offset,
    // so a root-matrix reflection alone does not place it on the opposite side.
    calibratedLeft.object.updateMatrix();
    const reflection = new THREE.Matrix4().makeScale(-1, 1, 1);
    const calibratedRightMatrix = reflection.multiply(calibratedLeft.object.matrix.clone());
    calibratedRightMatrix.decompose(
      calibratedLeft.object.position,
      calibratedLeft.object.quaternion,
      calibratedLeft.object.scale
    );
    calibratedLeft.object.visible = true;
    calibratedLeft.object.updateMatrixWorld(true);

    calibratedLeft.object.updateMatrix();
    const mirroredLeftMatrix = reflection.multiply(calibratedLeft.object.matrix.clone());
    mirroredLeftMatrix.decompose(
      authoredRight.object.position,
      authoredRight.object.quaternion,
      authoredRight.object.scale
    );
    authoredRight.object.visible = true;
    authoredRight.object.updateMatrixWorld(true);

    const rightBounds = new THREE.Box3().setFromObject(calibratedLeft.object);
    const leftBounds = new THREE.Box3().setFromObject(authoredRight.object);
    if (!rightBounds.isEmpty() && !leftBounds.isEmpty()) {
      const rightCenterX = (rightBounds.min.x + rightBounds.max.x) * 0.5;
      const rightCenterY = (rightBounds.min.y + rightBounds.max.y) * 0.5;
      const rightCenterZ = (rightBounds.min.z + rightBounds.max.z) * 0.5;
      const leftCenterX = (leftBounds.min.x + leftBounds.max.x) * 0.5;
      const leftCenterY = (leftBounds.min.y + leftBounds.max.y) * 0.5;
      const leftCenterZ = (leftBounds.min.z + leftBounds.max.z) * 0.5;
      this.translateObjectAlongWorldAxis(
        authoredRight.object,
        "x",
        -rightCenterX - leftCenterX
      );
      this.translateObjectAlongWorldAxis(
        authoredRight.object,
        "y",
        rightCenterY - leftCenterY
      );
      this.translateObjectAlongWorldAxis(
        authoredRight.object,
        "z",
        rightCenterZ - leftCenterZ
      );
      authoredRight.object.updateMatrixWorld(true);
    }
  }

  getS5PositionReferenceAdjustment(objectName, selection) {
    if (!S5_POSITION_REFERENCE_OBJECTS.has(objectName)) {
      return null;
    }
    const sourceModel = this.lastSourceModel || this.currentSourceModel || "";
    const frameAngle = (selection && selection.frameAngle) || "";
    const frameLength = (selection && selection.frameLength) || "";
    const frontFork = (selection && selection.frontFork) || "";

    const matchingEntries = [];
    for (let index = 0; index < this.manualAdjustmentEntries.length; index += 1) {
      const entry = this.manualAdjustmentEntries[index];
      if (!entry || entry.sourceModel !== sourceModel || entry.objectName !== objectName) {
        continue;
      }
      const pairs = new Map(this.parseAdjustmentSelectionPairs(entry.selectionKey));
      if (objectName === "backrest") {
        if (
          pairs.has("seatWidth") &&
          pairs.get("seatWidth") !== S5_POSITION_REFERENCE_SEAT_WIDTH_ID
        ) {
          continue;
        }
        if (
          pairs.has("seatDepth") &&
          pairs.get("seatDepth") !== S5_POSITION_REFERENCE_SEAT_DEPTH_ID
        ) {
          continue;
        }
        matchingEntries.push(entry);
        continue;
      }
      if (pairs.has("frameAngle") && pairs.get("frameAngle") !== frameAngle) {
        continue;
      }
      if (pairs.has("frameLength") && pairs.get("frameLength") !== frameLength) {
        continue;
      }
      if (pairs.has("frontFork") && pairs.get("frontFork") !== frontFork) {
        continue;
      }
      if (pairs.has("seatWidth") && pairs.get("seatWidth") !== S5_POSITION_REFERENCE_SEAT_WIDTH_ID) {
        continue;
      }
      if (pairs.has("seatDepth") && pairs.get("seatDepth") !== S5_POSITION_REFERENCE_SEAT_DEPTH_ID) {
        continue;
      }
      matchingEntries.push(entry);
    }
    matchingEntries.sort((left, right) => {
      const specificity =
        this.getAdjustmentSelectionSpecificity(right.selectionKey) -
        this.getAdjustmentSelectionSpecificity(left.selectionKey);
      if (specificity) {
        return specificity;
      }
      return (Date.parse(right.updatedAt || "") || 0) - (Date.parse(left.updatedAt || "") || 0);
    });
    const matchedEntry = matchingEntries[0] || null;
    if (!matchedEntry) {
      return null;
    }
    if (objectName === "frontCasterLeft" || objectName === "frontCasterRight") {
      return this.inheritFrontCasterReferenceCalibration(
        objectName,
        frameAngle,
        frameLength,
        frontFork,
        matchedEntry
      );
    }
    return matchedEntry;
  }

  inheritFrontCasterReferenceCalibration(
    objectName,
    frameAngle,
    frameLength,
    frontFork,
    matchedEntry
  ) {
    const referenceAngle = "fa-100";
    const referenceLength = "fl-std";
    if (frameAngle === referenceAngle && frameLength === referenceLength) {
      return matchedEntry;
    }

    const sourceModel = this.lastSourceModel || this.currentSourceModel || "";
    const findLatestManualEntry = (targetAngle, targetLength) => {
      for (let index = this.manualAdjustmentEntries.length - 1; index >= 0; index -= 1) {
        const entry = this.manualAdjustmentEntries[index];
        if (!entry || entry.sourceModel !== sourceModel || entry.objectName !== objectName) {
          continue;
        }
        const pairs = new Map(this.parseAdjustmentSelectionPairs(entry.selectionKey));
        if (
          pairs.get("frameAngle") !== targetAngle ||
          pairs.get("frameLength") !== targetLength
        ) {
          continue;
        }
        if (pairs.has("frontFork") && pairs.get("frontFork") !== frontFork) {
          continue;
        }
        if (
          pairs.has("seatWidth") &&
          pairs.get("seatWidth") !== S5_POSITION_REFERENCE_SEAT_WIDTH_ID
        ) {
          continue;
        }
        return entry;
      }
      return null;
    };

    const referenceEntry = findLatestManualEntry(referenceAngle, referenceLength);
    if (!referenceEntry) {
      return matchedEntry;
    }
    const matchedTime = Date.parse(matchedEntry.updatedAt || "") || 0;
    const referenceTime = Date.parse(referenceEntry.updatedAt || "") || 0;
    if (matchedTime > referenceTime) {
      return matchedEntry;
    }

    const originalReference = S5_WHEEL_FOOTREST_REFERENCE_ADJUSTMENTS.find((entry) => {
      if (!entry || entry.objectName !== objectName) return false;
      const pairs = new Map(this.parseAdjustmentSelectionPairs(entry.selectionKey));
      return (
        pairs.get("frameAngle") === referenceAngle &&
        pairs.get("frameLength") === referenceLength
      );
    });
    if (!originalReference) {
      return matchedEntry;
    }

    const positionCorrection = {
      x: referenceEntry.position.x - originalReference.position.x,
      y: referenceEntry.position.y - originalReference.position.y,
      z: referenceEntry.position.z - originalReference.position.z,
    };
    const rotationCorrection = {
      x: referenceEntry.rotationDeg.x - originalReference.rotationDeg.x,
      y: referenceEntry.rotationDeg.y - originalReference.rotationDeg.y,
      z: referenceEntry.rotationDeg.z - originalReference.rotationDeg.z,
    };
    return {
      ...matchedEntry,
      position: {
        x: matchedEntry.position.x + positionCorrection.x,
        y: matchedEntry.position.y + positionCorrection.y,
        z: matchedEntry.position.z + positionCorrection.z,
      },
      rotationDeg: {
        x: matchedEntry.rotationDeg.x + rotationCorrection.x,
        y: matchedEntry.rotationDeg.y + rotationCorrection.y,
        z: matchedEntry.rotationDeg.z + rotationCorrection.z,
      },
    };
  }

  applySeatWidthRootOffset(objectName, object, selection, adjustmentMode = "") {
    if (!object) {
      return;
    }
    const seatWidthCm = this.getSeatWidthCm(selection);
    const halfDeltaMeters =
      ((seatWidthCm - S5_WHEEL_FOOTREST_REFERENCE_SEAT_WIDTH_CM) * 0.01) * 0.5;
    if (objectName === "sideguardLeft" || objectName === "sideguardRight") {
      object.position.x += (objectName === "sideguardLeft" ? 1 : -1) * halfDeltaMeters;
      return;
    }
    // Saved caster roots are absolute coordinates measured on the verified
    // 36 cm setup. Their final lateral position must still follow seat width.
    // Delta adjustments already inherit the parametric root movement below,
    // so applying this correction to them would move the caster twice.
    if (
      adjustmentMode === "absolute" &&
      (objectName === "frontCasterLeft" || objectName === "frontCasterRight")
    ) {
      object.position.x += (objectName === "frontCasterLeft" ? -1 : 1) * halfDeltaMeters;
    }
  }

  applyBrakeSeatWidthReferenceAdjustments(resolvedMap, selection) {
    const sourceModel = this.lastSourceModel || this.currentSourceModel || "";
    const activeBrake = (selection && selection.brake) || "";
    const activeSeatWidth = (selection && selection.seatWidth) || "";
    const allEntries = [
      ...BUILT_IN_OBJECT_ADJUSTMENTS,
      ...S5_FINAL_PUBLIC_OBJECT_ADJUSTMENTS,
      ...S5_FINAL_FRONT_ASSEMBLY_ADJUSTMENTS,
      ...this.manualAdjustmentEntries,
    ].map((entry) => this.normalizeAdjustmentEntry(entry));

    const referenceByObject = new Map();
    const fallbackByObject = new Map();
    allEntries.forEach((entry) => {
      if (
        !entry ||
        entry.sourceModel !== sourceModel ||
        !/^brake(?:Left|Right)(?:::|$)/.test(entry.objectName || "")
      ) {
        return;
      }
      const pairs = new Map(this.parseAdjustmentSelectionPairs(entry.selectionKey));
      if (pairs.get("brake") !== activeBrake) {
        return;
      }
      fallbackByObject.set(entry.objectName, entry);
      if (pairs.get("seatWidth") === S5_POSITION_REFERENCE_SEAT_WIDTH_ID) {
        referenceByObject.set(entry.objectName, entry);
      }
    });

    fallbackByObject.forEach((entry, objectName) => {
      if (!referenceByObject.has(objectName)) {
        referenceByObject.set(objectName, entry);
      }
    });

    referenceByObject.forEach((entry, objectName) => {
      const activeEntry = resolvedMap.get(objectName);
      const activePairs = new Map(
        this.parseAdjustmentSelectionPairs(activeEntry && activeEntry.selectionKey)
      );
      if (activePairs.get("seatWidth") !== activeSeatWidth) {
        resolvedMap.set(objectName, entry);
      }
    });
  }

  applyBrakeSeatWidthPlacement(selection) {
    const seatWidthCm = this.getSeatWidthCm(selection);
    const halfDeltaMeters =
      ((seatWidthCm - S5_WHEEL_FOOTREST_REFERENCE_SEAT_WIDTH_CM) * 0.01) * 0.5;
    const right = this.getPartEntryByObjectName("brakeRight");
    const left = this.getPartEntryByObjectName("brakeLeft");
    if (right && right.object) {
      // The imported brake roots are mirrored, so their local X axis points
      // opposite to the wheelchair's world-space lateral direction.
      right.object.position.x += halfDeltaMeters;
    }
    if (left && left.object) {
      left.object.position.x -= halfDeltaMeters;
    }
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
        ...S5_FINAL_FRONT_ASSEMBLY_ADJUSTMENTS,
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
      const objectName = this.normalizeAdjustmentObjectName(entry.objectName);
      map.set(objectName, objectName === entry.objectName ? entry : { ...entry, objectName });
      return map;
    }, new Map());
    S5_POSITION_REFERENCE_OBJECTS.forEach((objectName) => {
      const referenceEntry = this.getS5PositionReferenceAdjustment(objectName, selection);
      if (referenceEntry) {
        resolvedMap.set(objectName, referenceEntry);
      }
    });
    this.applyBrakeSeatWidthReferenceAdjustments(resolvedMap, selection);
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

    const leafPickLabel = document.createElement("label");
    leafPickLabel.style.display = "flex";
    leafPickLabel.style.alignItems = "center";
    leafPickLabel.style.gap = "8px";
    leafPickLabel.style.padding = "7px 9px";
    leafPickLabel.style.borderRadius = "9px";
    leafPickLabel.style.background = "rgba(18, 31, 55, 0.58)";
    leafPickLabel.style.cursor = "pointer";
    leafPickLabel.style.fontSize = "12px";

    const leafPickCheckbox = document.createElement("input");
    leafPickCheckbox.type = "checkbox";
    leafPickCheckbox.checked = this.objectDebugPickLeafMeshes;
    leafPickCheckbox.addEventListener("change", () => {
      this.objectDebugPickLeafMeshes = leafPickCheckbox.checked;
      this.refreshObjectDebugOptions();
      this.highlightDebugTargetObject();
      this.setObjectDebugStatus(
        leafPickCheckbox.checked
          ? "已开启最底层网格选择，可直接点击 Part 内部零件"
          : "已恢复按整个 GLB Part 选择"
      );
    });
    leafPickLabel.appendChild(leafPickCheckbox);

    const leafPickText = document.createElement("span");
    leafPickText.textContent = "选择最底层网格零件";
    leafPickLabel.appendChild(leafPickText);
    panel.appendChild(leafPickLabel);
    this.objectDebugLeafPickCheckbox = leafPickCheckbox;

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
      { group: "rotationDeg", key: "x", label: "RX", coarse: 2, fine: 0.1, unit: "°" },
      { group: "rotationDeg", key: "y", label: "RY", coarse: 2, fine: 0.1, unit: "°" },
      { group: "rotationDeg", key: "z", label: "RZ", coarse: 2, fine: 0.1, unit: "°" },
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
    panel.dataset.runtimeDebugUi = "1";
    ["click", "dblclick", "pointerdown", "pointerup", "pointercancel", "wheel"].forEach(
      (eventName) => {
        panel.addEventListener(eventName, (event) => event.stopPropagation());
      }
    );

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
      const next = this.clampObjectDebugPanelPosition(left, top);
      this.objectDebugPanel.style.left = `${next.left}px`;
      this.objectDebugPanel.style.top = `${next.top}px`;
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
    const activeTarget = this.parseAdjustableObjectKey(activeName);
    const activeObjects = new Set(this.getObjectsByAdjustableName(activeName));
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
        const childMatches = activeTarget.meshName
          ? activeObjects.has(child)
          : this.resolvePartKeyFromObject(child) === activeTarget.partKey;
        if (childMatches && activeTarget.partKey !== "backrest") {
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
    const target = this.parseAdjustableObjectKey(entry.objectName);
    const useWorldAxisRotation =
      group === "rotationDeg" &&
      target.partKey === "brakeRight" &&
      (this.lastSelection && this.lastSelection.brake) === "brake-scissors";
    if (useWorldAxisRotation && this.adjustSelectedBrakeAroundWorldAxis(entry, key, delta)) {
      this.dirtyManualAdjustmentIds.add(
        this.getAdjustmentEntryId(entry.sourceModel, entry.selectionKey, entry.objectName)
      );
      this.refreshCurrentModelState();
      this.updateObjectDebugPanel();
      return;
    }
    const precision = group === "position" ? 4 : 2;
    entry[group][key] = Number((entry[group][key] + delta).toFixed(precision));
    this.dirtyManualAdjustmentIds.add(
      this.getAdjustmentEntryId(entry.sourceModel, entry.selectionKey, entry.objectName)
    );

    this.refreshCurrentModelState();
    this.updateObjectDebugPanel();
  }

  adjustSelectedBrakeAroundWorldAxis(entry, axis, deltaDeg) {
    const object = this.getObjectsByAdjustableName(entry.objectName)[0];
    if (!object || !object.parent || !["x", "y", "z"].includes(axis)) {
      return false;
    }

    object.parent.updateWorldMatrix(true, false);
    object.updateWorldMatrix(true, false);
    const worldAxis = new THREE.Vector3(
      axis === "x" ? 1 : 0,
      axis === "y" ? 1 : 0,
      axis === "z" ? 1 : 0
    );
    const worldDelta = new THREE.Quaternion().setFromAxisAngle(
      worldAxis,
      THREE.MathUtils.degToRad(deltaDeg)
    );
    const currentWorld = object.getWorldQuaternion(new THREE.Quaternion());
    const nextWorld = worldDelta.multiply(currentWorld);
    const parentWorld = object.parent.getWorldQuaternion(new THREE.Quaternion());
    const nextLocal = parentWorld.invert().multiply(nextWorld);
    const baseRotation = object.userData.baseManualAdjustRotation || object.rotation;
    const nextEuler = new THREE.Euler().setFromQuaternion(nextLocal, baseRotation.order);
    const normalizeDeltaDegrees = (value) => {
      let normalized = THREE.MathUtils.radToDeg(value);
      while (normalized > 180) normalized -= 360;
      while (normalized < -180) normalized += 360;
      return Number(normalized.toFixed(2));
    };

    entry.rotationDeg.x = normalizeDeltaDegrees(nextEuler.x - baseRotation.x);
    entry.rotationDeg.y = normalizeDeltaDegrees(nextEuler.y - baseRotation.y);
    entry.rotationDeg.z = normalizeDeltaDegrees(nextEuler.z - baseRotation.z);
    return true;
  }

  async saveSelectedObjectAdjustmentWithFallback() {
    const entry = this.getCurrentObjectAdjustmentEntry();
    if (!entry) {
      this.setObjectDebugStatus("没有可保存的对象");
      return;
    }

    const saveCameraView = window.confirm(
      "是否同时保存当前3D视角？\n\n确定：保存部件位置和当前视角\n取消：仅保存部件位置"
    );

    const finalizedEntry = this.upsertManualAdjustmentEntry({
      ...entry,
      cameraView: saveCameraView ? this.captureSerializableCameraView() : entry.cameraView,
      updatedAt: new Date().toISOString(),
    });
    const finalizedId = this.getAdjustmentEntryId(
      finalizedEntry.sourceModel,
      finalizedEntry.selectionKey,
      finalizedEntry.objectName
    );
    this.dirtyManualAdjustmentIds.add(finalizedId);
    const pendingEntries = this.manualAdjustmentEntries
      .filter((item) =>
        this.dirtyManualAdjustmentIds.has(
          this.getAdjustmentEntryId(item.sourceModel, item.selectionKey, item.objectName)
        )
      )
      .map((item) => this.normalizeAdjustmentEntry({
        ...item,
        updatedAt: new Date().toISOString(),
      }));
    this.refreshCurrentModelState();
    this.updateObjectDebugPanel();

    if (!this.isDebugApiEnabled()) {
      this.dirtyManualAdjustmentIds.clear();
      this.setObjectDebugStatus(`已保存本轮 ${pendingEntries.length} 个修改到本地`);
      return;
    }

    this.setObjectDebugStatus(`正在写入本轮 ${pendingEntries.length} 个修改...`);
    try {
      let remoteEntries = [];
      for (const pendingEntry of pendingEntries) {
        const response = await fetch(`${getDebugApiBase()}/save`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(pendingEntry),
        });
        if (!response.ok) {
          throw new Error(`Save failed ${response.status}`);
        }
        const payload = await response.json();
        remoteEntries = Array.isArray(payload && payload.entries) ? payload.entries : remoteEntries;
      }
      this.manualAdjustmentEntries = this.mergeManualAdjustmentEntries(remoteEntries);
      this.manualAdjustmentsLoaded = true;
      this.writeLocalManualAdjustments(this.manualAdjustmentEntries);
      this.dirtyManualAdjustmentIds.clear();
      this.setObjectDebugStatus(`已保存并固化本轮 ${pendingEntries.length} 个修改`);
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
    const adjustableTarget = this.parseAdjustableObjectKey(entry.objectName);
    const isRearWheel = this.isRearWheelComponentKey(adjustableTarget.partKey);
    if (isRearWheel) {
      const activePairs = new Map(this.parseAdjustmentSelectionPairs(this.lastSelection || {}));
      const rearWheel = activePairs.get("rearWheel") || "";
      return this.normalizeAdjustmentEntry({
        ...entry,
        selectionKey: rearWheel ? `rearWheel=${rearWheel}` : "",
        mode: "delta",
        updatedAt: new Date().toISOString(),
      });
    }
    if (/^sideguards?(?:Left|Right)?$/.test(adjustableTarget.partKey)) {
      const activePairs = new Map(this.parseAdjustmentSelectionPairs(this.lastSelection || {}));
      const skirtGuards = activePairs.get("skirtGuards") || "";
      return this.normalizeAdjustmentEntry({
        ...entry,
        selectionKey: skirtGuards ? `skirtGuards=${skirtGuards}` : "",
        mode: "delta",
        updatedAt: new Date().toISOString(),
      });
    }
    if (/^lateralFrame(?:Left|Right)$/.test(adjustableTarget.partKey)) {
      const activePairs = new Map(this.parseAdjustmentSelectionPairs(this.lastSelection || {}));
      const lateralFrame = activePairs.get("lateralFrame") || "";
      return this.normalizeAdjustmentEntry({
        ...entry,
        selectionKey: lateralFrame ? `lateralFrame=${lateralFrame}` : "",
        mode: "delta",
        updatedAt: new Date().toISOString(),
      });
    }
    if (adjustableTarget.partKey === "seat") {
      const activePairs = new Map(this.parseAdjustmentSelectionPairs(this.lastSelection || {}));
      const seatSetting = activePairs.get("seatSetting") || "";
      return this.normalizeAdjustmentEntry({
        ...entry,
        selectionKey: seatSetting ? `seatSetting=${seatSetting}` : "",
        mode: "delta",
        updatedAt: new Date().toISOString(),
      });
    }
    if (/^frontFork(?:Left|Right)$/.test(adjustableTarget.partKey)) {
      const activePairs = new Map(this.parseAdjustmentSelectionPairs(this.lastSelection || {}));
      const frontFork = activePairs.get("frontFork") || "";
      return this.normalizeAdjustmentEntry({
        ...entry,
        selectionKey: frontFork ? `frontFork=${frontFork}` : "",
        mode: "delta",
        updatedAt: new Date().toISOString(),
      });
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

    const propagationScope = new Map(
      this.parseAdjustmentSelectionPairs(globalEntry.selectionKey)
    );
    const isInPropagationScope = (item) => {
      if (!propagationScope.size) {
        return true;
      }
      const itemPairs = new Map(this.parseAdjustmentSelectionPairs(item.selectionKey));
      return Array.from(propagationScope.entries()).every(
        ([key, value]) => itemPairs.get(key) === value
      );
    };

    // Rear-wheel adjustments are shared only inside the selected wheel type.
    // Frame angle, frame length and seat depth do not create new wheel positions.
    this.manualAdjustmentEntries = this.manualAdjustmentEntries.filter(
      (item) =>
        !(
          item.sourceModel === globalEntry.sourceModel &&
          item.objectName === globalEntry.objectName &&
          isInPropagationScope(item)
        )
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
        body: JSON.stringify({
          entry: globalEntry,
          scopeSelectionKey: globalEntry.selectionKey,
        }),
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
    const cameraView = this.captureCameraView();
    this.cameraFocusTransition = null;
    this.applyDimensionAdjustments(this.lastSelection || {});
    this.applyManualObjectAdjustments(this.lastSelection || {});
    this.applyFrameColor(this.lastFrameColor);
    this.highlightDebugTargetObject();
    this.restoreCameraView(cameraView);
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
    this.classifyRearWheelHandrimMeshes(object);
  }

  classifyRearWheelHandrimMeshes(object) {
    if (!object) return;
    const circularMeshes = [];
    object.traverse((child) => {
      if (!(child instanceof THREE.Mesh) || !child.geometry) return;
      const box = new THREE.Box3().setFromObject(child);
      if (!box || box.isEmpty()) return;
      const dimensions = box.getSize(new THREE.Vector3()).toArray().map(Math.abs).sort((a, b) => a - b);
      const diameter = dimensions[2];
      const secondDiameter = dimensions[1];
      if (!diameter || secondDiameter / diameter < 0.92 || dimensions[0] / diameter > 0.2) return;
      circularMeshes.push({ child, diameter });
    });

    const wheelDiameter = circularMeshes.reduce((largest, entry) => Math.max(largest, entry.diameter), 0);
    circularMeshes.forEach(({ child, diameter }) => {
      const ratio = wheelDiameter ? diameter / wheelDiameter : 0;
      child.userData.wcHandrimMesh = ratio >= 0.84 && ratio <= 0.9;
      child.userData.wcTyreMesh = ratio >= 0.96;
    });
  }

  isRearWheelComponentKey(key) {
    return /^rearWheel(?:Handrim|Tyre)?(?:Left|Right)$/.test(key || "");
  }

  getRearWheelComponentSide(key) {
    if (!this.isRearWheelComponentKey(key)) return 0;
    return key.endsWith("Left") ? -1 : 1;
  }

  applyHandrimAppearance(handrimId) {
    const selectedHandrim = handrimId || "hr-al-silver-22";
    this.partObjects.forEach((entry) => {
      if (!entry || !entry.object || !["rearWheelHandrimLeft", "rearWheelHandrimRight"].includes(entry.key)) return;
      entry.object.traverse((child) => {
        if (!(child instanceof THREE.Mesh)) return;
        child.visible = true;
        const sourceMaterial = Array.isArray(child.material) ? child.material[0] : child.material;
        if (child.userData.wcRuntimeHandrimMaterial && sourceMaterial && sourceMaterial.dispose) {
          sourceMaterial.dispose();
        }
        child.material = buildHandrimMaterial(selectedHandrim, sourceMaterial);
        child.userData.wcRuntimeHandrimMaterial = true;
        child.frustumCulled = false;
      });
    });
  }

  applyTyreAppearance(tyreId) {
    const selectedTyre = tyreId || "tyre-pu";
    this.partObjects.forEach((entry) => {
      if (!entry || !entry.object || !["rearWheelTyreLeft", "rearWheelTyreRight"].includes(entry.key)) return;
      entry.object.traverse((child) => {
        if (!(child instanceof THREE.Mesh)) return;
        const sourceMaterial = Array.isArray(child.material) ? child.material[0] : child.material;
        if (child.userData.wcRuntimeTyreMaterial && sourceMaterial && sourceMaterial.dispose) {
          sourceMaterial.dispose();
        }
        child.material = buildTyreMaterial(selectedTyre, sourceMaterial);
        child.userData.wcRuntimeTyreMaterial = true;
        child.visible = true;
        child.frustumCulled = false;
      });
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

  normalizeSeatAsset(object, style) {
    if (!object || style === "seat-carbon") {
      return object;
    }

    object.updateMatrixWorld(true);
    const bounds = new THREE.Box3().setFromObject(object);
    const sourceSize = bounds.getSize(new THREE.Vector3());
    const sourceCenter = bounds.getCenter(new THREE.Vector3());
    if (sourceSize.x <= 0 || sourceSize.y <= 0 || sourceSize.z <= 0) {
      return object;
    }

    const reference = S5_SEAT_REFERENCE_BOUNDS;
    const scale = new THREE.Vector3(
      reference.size.x / sourceSize.x,
      reference.size.y / sourceSize.y,
      reference.size.z / sourceSize.z
    );
    object.scale.multiply(scale);
    object.position.set(
      reference.center.x - sourceCenter.x * scale.x,
      reference.center.y - sourceCenter.y * scale.y,
      reference.center.z - sourceCenter.z * scale.z
    );
    object.updateMatrixWorld(true);

    // Keep asset normalization below the configurable root. Width and depth
    // changes may then reset the root without losing the imported alignment.
    const normalizedRoot = new THREE.Group();
    normalizedRoot.name = `seat-${style}-normalized`;
    normalizedRoot.add(object);
    return normalizedRoot;
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

  enforceBackrestAppearance() {
    this.partObjects.forEach((entry) => {
      if (!entry || entry.key !== "backrest" || !entry.object) return;
      this.applyBackrestStyle(entry.object);
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
        object = this.normalizeSeatAsset(object, part.seatStyle);
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

  async loadObjectsConcurrently(parts, onProgress) {
    const results = new Array(parts.length);
    const progress = new Array(parts.length).fill(0);
    let nextIndex = 0;
    const workerCount = Math.min(parts.length, isMobileViewport() ? 4 : 6);
    const reportProgress = () => {
      const total = progress.reduce((sum, value) => sum + value, 0);
      onProgress?.(Math.round((total / Math.max(1, parts.length)) * 100));
    };
    const worker = async () => {
      while (nextIndex < parts.length) {
        const index = nextIndex;
        nextIndex += 1;
        results[index] = await this.loadObject(parts[index], (evt) => {
          if (!evt || (!evt.total && !evt.loaded)) return;
          const total = Math.max(evt.total || 0, evt.loaded || 0);
          progress[index] = total > 0 ? Math.min(1, evt.loaded / total) : 0;
          reportProgress();
        });
        progress[index] = 1;
        reportProgress();
      }
    };
    await Promise.all(Array.from({ length: workerCount }, () => worker()));
    return results;
  }

  getPreloadSourcesForModel(sourceModel) {
    // Parsing optional GLBs on the main thread after first paint blocks camera
    // gestures, especially over a network. Variants are small and load on demand.
    return [];
  }

  preloadSources(sources = []) {
    const queue = sources.filter((src) => (
      src && !this.glbCache.has(src) && !this.glbPreloadPromises.has(src)
    ));
    const preloadNext = async () => {
      for (const src of queue) {
        if (this.glbCache.has(src) || this.glbPreloadPromises.has(src)) {
          continue;
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
        await promise;
        await new Promise((resolve) => window.setTimeout(resolve, 250));
      }
    };
    preloadNext();
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
    const halfOffsetMeters =
      ((seatWidthCm - S5_WHEEL_FOOTREST_REFERENCE_SEAT_WIDTH_CM) * 0.01) * 0.5;
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

    if (middle && middle.object) {
      this.trimSplitFrameMiddleOverlap(middle.object);
    }

    allForks.forEach((entry) => {
      if (entry && entry.object) {
        entry.object.visible = false;
      }
    });

    if (leftBody && leftBody.object) {
      leftBody.object.position.x -= halfOffsetMeters;
      this.resetSeatWidthGeometry(leftBody.object);
      this.applySideBodyRearTubeWidthCompensation(
        leftBody.object,
        -1,
        halfOffsetMeters
      );
    }
    if (rightBody && rightBody.object) {
      rightBody.object.position.x += halfOffsetMeters;
      this.resetSeatWidthGeometry(rightBody.object);
      this.applySideBodyRearTubeWidthCompensation(
        rightBody.object,
        1,
        halfOffsetMeters
      );
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
      this.applyCenteredGeometryWidthStretch(
        middle.object,
        (seatWidthCm - FRAME_BASE_SEAT_WIDTH_CM) * 0.01
      );
    }

    return true;
  }

  trimSplitFrameMiddleOverlap(object) {
    if (!object || object.userData.middleOverlapTrimApplied) {
      return;
    }

    object.updateMatrixWorld(true);
    const bounds = new THREE.Box3().setFromObject(object);
    const spanX = bounds.max.x - bounds.min.x;
    // The source middle bars overlap the left/right body tubes by about 20 mm
    // at each end. Remove that duplicate axial length to prevent z-fighting.
    const trimPerSideMeters = 0.02;
    const trimmedSpanX = spanX - trimPerSideMeters * 2;
    if (!Number.isFinite(spanX) || trimmedSpanX <= 0.05) {
      return;
    }

    const centerX = (bounds.min.x + bounds.max.x) * 0.5;
    const widthScale = trimmedSpanX / spanX;
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
        worldVertex.x = centerX + (worldVertex.x - centerX) * widthScale;
        localVertex.copy(worldVertex).applyMatrix4(inverseWorld);
        geometryData.position.setXYZ(index, localVertex.x, localVertex.y, localVertex.z);
        geometryData.base[offset] = localVertex.x;
        geometryData.base[offset + 1] = localVertex.y;
        geometryData.base[offset + 2] = localVertex.z;
      }
      this.finishSeatWidthGeometryUpdate(child, geometryData.position);
    });

    object.userData.middleOverlapTrimApplied = true;
  }

  applyBackrestHandleInstancePlacement(object, side, seatWidthCm) {
    if (!object) {
      return;
    }
    const direction = side < 0 ? -1 : 1;
    const halfOffsetMeters = ((seatWidthCm - FRAME_BASE_SEAT_WIDTH_CM) * 0.01) * 0.5;
    const style = object.userData.partHandleStyle || "standard";
    const baseX = direction < 0
      ? S5_STANDARD_HANDLE_CENTER_X.left
      : S5_STANDARD_HANDLE_CENTER_X.right;

    object.position.x = baseX + direction * halfOffsetMeters;
    if (style === "folding") {
      // Mirror the reusable single-side asset across the wheelchair centerline.
      // With the 90-degree Z rotation, world X reflection maps to local Y.
      object.scale.y = direction < 0 ? -1 : 1;
      object.position.y = S5_FOLDING_HANDLE_POSITION.y;
      object.position.z = S5_FOLDING_HANDLE_POSITION.z;
      object.rotation.z = Math.PI * 0.5;
    }
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
    // Width deformation changes the surface direction as well as vertex positions.
    // Refresh normals here so stretched frame sections do not render as dark bands.
    mesh.geometry.computeVertexNormals();
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

  applyCenteredGeometryWidthStretch(object, widthDeltaMeters) {
    if (!object) {
      return;
    }
    object.updateMatrixWorld(true);
    const bounds = new THREE.Box3().setFromObject(object);
    const centerX = (bounds.min.x + bounds.max.x) * 0.5;
    const spanX = bounds.max.x - bounds.min.x;
    if (!Number.isFinite(spanX) || spanX <= 1e-7) {
      return;
    }
    const widthScale = Math.max(0.05, (spanX + widthDeltaMeters) / spanX);
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
        worldVertex.x = centerX + (worldVertex.x - centerX) * widthScale;
        localVertex.copy(worldVertex).applyMatrix4(inverseWorld);
        geometryData.position.setXYZ(index, localVertex.x, localVertex.y, localVertex.z);
      }
      this.finishSeatWidthGeometryUpdate(child, geometryData.position);
    });
  }

  applyCrossedSeatWidthStretch(object, widthDeltaMeters) {
    if (!object) {
      return;
    }
    object.updateMatrixWorld(true);
    const bounds = new THREE.Box3().setFromObject(object);
    const centerX = (bounds.min.x + bounds.max.x) * 0.5;
    const spanX = bounds.max.x - bounds.min.x;
    if (!Number.isFinite(spanX) || spanX <= 1e-7) {
      return;
    }

    const widthScale = Math.max(0.05, (spanX + widthDeltaMeters) / spanX);
    const worldVertex = new THREE.Vector3();
    const localVertex = new THREE.Vector3();
    object.traverse((child) => {
      const geometryData = this.ensureMutableSeatWidthGeometry(child);
      if (!geometryData) {
        return;
      }
      child.updateMatrixWorld(true);
      const childBounds = new THREE.Box3().setFromObject(child);
      const childSpanX = childBounds.max.x - childBounds.min.x;
      const childCenterX = (childBounds.min.x + childBounds.max.x) * 0.5;
      const spansSeatWidth = childSpanX >= spanX * 0.5;
      const narrowBandOffset = (childCenterX - centerX) * (widthScale - 1);
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
        if (spansSeatWidth) {
          // Horizontal straps lengthen continuously with the selected width.
          worldVertex.x = centerX + (worldVertex.x - centerX) * widthScale;
        } else {
          // Vertical straps keep their own width and move apart evenly.
          worldVertex.x += narrowBandOffset;
        }
        localVertex.copy(worldVertex).applyMatrix4(inverseWorld);
        geometryData.position.setXYZ(index, localVertex.x, localVertex.y, localVertex.z);
      }
      this.finishSeatWidthGeometryUpdate(child, geometryData.position);
    });
  }

  applySideBodyRearTubeWidthCompensation(object, side, halfOffsetMeters) {
    if (!object || !Number.isFinite(halfOffsetMeters)) {
      return;
    }
    const targetName = side < 0 ? "Object_102" : "Object_213";
    const target = object.getObjectByName(targetName);
    const geometryData = this.ensureMutableSeatWidthGeometry(target);
    if (!target || !geometryData) {
      return;
    }

    object.updateMatrixWorld(true);
    target.updateMatrixWorld(true);
    const inverseWorld = target.matrixWorld.clone().invert();
    const worldVertex = new THREE.Vector3();
    const localVertex = new THREE.Vector3();
    let minX = Infinity;
    let maxX = -Infinity;

    for (let index = 0; index < geometryData.position.count; index += 1) {
      const offset = index * 3;
      worldVertex
        .set(
          geometryData.base[offset],
          geometryData.base[offset + 1],
          geometryData.base[offset + 2]
        )
        .applyMatrix4(target.matrixWorld);
      minX = Math.min(minX, worldVertex.x);
      maxX = Math.max(maxX, worldVertex.x);
    }

    const spanX = maxX - minX;
    if (!Number.isFinite(spanX) || spanX <= 1e-7) {
      return;
    }
    const widthScale = Math.max(0.05, (spanX + halfOffsetMeters) / spanX);
    const outerAnchorX = side < 0 ? minX : maxX;

    for (let index = 0; index < geometryData.position.count; index += 1) {
      const offset = index * 3;
      worldVertex
        .set(
          geometryData.base[offset],
          geometryData.base[offset + 1],
          geometryData.base[offset + 2]
        )
        .applyMatrix4(target.matrixWorld);
      worldVertex.x = outerAnchorX + (worldVertex.x - outerAnchorX) * widthScale;
      localVertex.copy(worldVertex).applyMatrix4(inverseWorld);
      geometryData.position.setXYZ(index, localVertex.x, localVertex.y, localVertex.z);
    }
    this.finishSeatWidthGeometryUpdate(target, geometryData.position);
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

  mirrorPartAcrossModelX(sourceKey, targetKey) {
    const sourceEntry = this.getPartEntryByObjectName(sourceKey);
    const targetEntry = this.getPartEntryByObjectName(targetKey);
    if (!sourceEntry || !sourceEntry.object || !targetEntry || !targetEntry.object) {
      return;
    }

    sourceEntry.object.updateMatrix();
    const reflection = new THREE.Matrix4().makeScale(-1, 1, 1);
    const mirroredMatrix = reflection.multiply(sourceEntry.object.matrix.clone());
    mirroredMatrix.decompose(
      targetEntry.object.position,
      targetEntry.object.quaternion,
      targetEntry.object.scale
    );
    targetEntry.object.updateMatrixWorld(true);
  }

  getRearWheelCamberDegrees(selection) {
    switch ((selection && selection.rearWheelsBar) || "") {
      case "camber-2":
        return 2;
      case "camber-4":
        return 4;
      default:
        return 0;
    }
  }

  applyRearWheelInstancePlacement(object, side, seatWidthCm, camberDegrees = 0) {
    if (!object) {
      return;
    }

    const direction = side < 0 ? -1 : 1;
    const halfDeltaMeters =
      ((seatWidthCm - S5_WHEEL_FOOTREST_REFERENCE_SEAT_WIDTH_CM) * 0.01) * 0.5;
    const mirrorX = !!object.userData.partMirrorX;
    const instanceOffsetX = Number(object.userData.partInstanceOffsetX) || 0;
    const referenceAdjustment =
      side < 0
        ? S5_REAR_WHEEL_REFERENCE_ADJUSTMENT.left
        : S5_REAR_WHEEL_REFERENCE_ADJUSTMENT.right;

    object.position.set(
      instanceOffsetX + referenceAdjustment.x + direction * halfDeltaMeters,
      referenceAdjustment.y,
      referenceAdjustment.z
    );
    object.rotation.set(0, 0, 0);
    object.scale.set(mirrorX ? -1 : 1, 1, 1);

    if (object.userData.partReverseWheelFacing) {
      const pivotLocal = this.getManualRotationPivotLocal(object);
      const originalScaleX = side < 0 ? 1 : -1;
      object.position.x += (originalScaleX - object.scale.x) * pivotLocal.x;
    }

    const alignmentYDeg = Number(object.userData.partWheelAlignmentYDeg) || 0;
    const alignmentZDeg = Number(object.userData.partWheelAlignmentZDeg) || 0;
    if (camberDegrees || alignmentYDeg || alignmentZDeg) {
      const basePosition = object.position.clone();
      const baseRotation = object.rotation.clone();
      const targetRotation = baseRotation.clone();
      // Seen from the rear, both wheel tops incline toward the chair centre.
      targetRotation.y = THREE.MathUtils.degToRad(alignmentYDeg);
      targetRotation.z = THREE.MathUtils.degToRad(alignmentZDeg + camberDegrees * direction);
      this.applyRotationAroundGeometryCenter(
        object,
        basePosition,
        baseRotation,
        targetRotation
      );
    }
  }

  applyRearWheelPlacements(selection) {
    if ((this.lastSourceModel || this.currentSourceModel || "") !== "S5") {
      return;
    }

    const seatWidthCm = this.getSeatWidthCm(selection || {});
    const camberDegrees = this.getRearWheelCamberDegrees(selection || {});
    this.partObjects.forEach((entry) => {
      const side = this.getRearWheelComponentSide(entry && entry.key);
      if (!side || !entry.object) return;
      this.applyRearWheelInstancePlacement(entry.object, side, seatWidthCm, camberDegrees);
    });
  }

  alignRearWheelSubcomponentsToMainWheels() {
    const objectsByKey = new Map(
      this.partObjects
        .filter((entry) => entry && entry.key && entry.object)
        .map((entry) => [entry.key, entry.object])
    );

    const variantAssembly =
      S5_REAR_WHEEL_VARIANT_ASSEMBLY[(this.lastSelection && this.lastSelection.rearWheel) || ""] ||
      S5_REAR_WHEEL_SUBCOMPONENT_OFFSETS;

    ["Left", "Right"].forEach((sideName) => {
      const mainWheel = objectsByKey.get(`rearWheel${sideName}`);
      if (!mainWheel) return;

      const direction = sideName === "Left" ? -1 : 1;
      [
        ["Handrim", variantAssembly.handrim],
        ["Tyre", variantAssembly.tyre],
      ].forEach(([partName, distance]) => {
        const component = objectsByKey.get(`rearWheel${partName}${sideName}`);
        if (!component) return;

        component.position.copy(mainWheel.position);
        component.quaternion.copy(mainWheel.quaternion);
        component.scale.copy(mainWheel.scale);

        const localOffset = new THREE.Vector3(direction * distance, 0, 0);
        localOffset.applyQuaternion(mainWheel.quaternion);
        component.position.add(localOffset);
        const relativeAlignmentZDeg =
          (Number(component.userData.partWheelAlignmentZDeg) || 0) -
          (Number(mainWheel.userData.partWheelAlignmentZDeg) || 0);
        if (relativeAlignmentZDeg) {
          const basePosition = component.position.clone();
          const baseRotation = component.rotation.clone();
          const targetRotation = baseRotation.clone();
          targetRotation.z += THREE.MathUtils.degToRad(relativeAlignmentZDeg);
          this.applyRotationAroundGeometryCenter(
            component,
            basePosition,
            baseRotation,
            targetRotation
          );
        }
        component.updateMatrixWorld(true);
      });
    });
  }

  applyRearWheelVariantAssemblyCorrection(selection) {
    const variantAssembly =
      S5_REAR_WHEEL_VARIANT_ASSEMBLY[(selection && selection.rearWheel) || ""];
    if (!variantAssembly || !variantAssembly.mainWheelOutward) return;

    ["Left", "Right"].forEach((sideName) => {
      const mainWheel = this.partObjects.find(
        (entry) => entry && entry.key === `rearWheel${sideName}`
      )?.object;
      if (!mainWheel) return;

      const direction = sideName === "Left" ? -1 : 1;
      const localOffset = new THREE.Vector3(
        direction * variantAssembly.mainWheelOutward,
        0,
        0
      );
      localOffset.applyQuaternion(mainWheel.quaternion);
      mainWheel.position.add(localOffset);
      mainWheel.updateMatrixWorld(true);
    });
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

    const halfOffsetMeters =
      ((seatWidthCm - S5_WHEEL_FOOTREST_REFERENCE_SEAT_WIDTH_CM) * 0.01) * 0.5;
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
        absoluteAdjust.position.x + direction * halfOffsetMeters,
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

  applyIndependentFrontForkPlacement(
    object,
    side,
    seatWidthCm,
    depthDelta,
    activeAdjust,
    frameLengthOffset,
    selection
  ) {
    // Preserve asset setup and the one-arm fallback, but do not consume a
    // caster wheel's saved adjustment when placing a standard or long fork.
    this.applyFrontCasterInstancePlacement(
      object,
      side,
      seatWidthCm,
      depthDelta,
      activeAdjust,
      frameLengthOffset,
      null
    );

    const frontFork = (selection && selection.frontFork) || "ff-std";
    const frameAngle = (selection && selection.frameAngle) || "fa-100";
    const frameLength = (selection && selection.frameLength) || "fl-std";
    const baseline =
      S5_INDEPENDENT_FRONT_FORK_BASELINES[`${frontFork}|${frameAngle}|${frameLength}`];
    if (!baseline) {
      return;
    }

    const sideBaseline = side < 0 ? baseline.left : baseline.right;
    const halfOffsetMeters =
      ((seatWidthCm - S5_WHEEL_FOOTREST_REFERENCE_SEAT_WIDTH_CM) * 0.01) * 0.5;
    object.position.fromArray(sideBaseline.position);
    object.position.x += (side < 0 ? -1 : 1) * halfOffsetMeters;
    object.rotation.set(
      THREE.MathUtils.degToRad(sideBaseline.rotation[0]),
      THREE.MathUtils.degToRad(sideBaseline.rotation[1]),
      THREE.MathUtils.degToRad(sideBaseline.rotation[2])
    );
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
    const rearWheelCamberDegrees = this.getRearWheelCamberDegrees(selection);
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

    const useExtendedLateralFrame = selection.lateralFrame === "lf-extended";
    this.partObjects.forEach(({ key, object }) => {
      if (!object || (key !== "frame-left-body" && key !== "frame-right-body")) return;
      const standardNodeName = key === "frame-left-body" ? "Object_182" : "Object_269";
      object.traverse((child) => {
        if (child.name !== standardNodeName) return;
        child.userData.wcHiddenByLateralFrame = useExtendedLateralFrame;
        child.visible = !useExtendedLateralFrame;
      });
    });

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
          if (object.userData.partSeatStyle === "seat-crossed") {
            // The crossed-band seat is a continuous woven surface. Distribute
            // width changes across every band and gap instead of separating
            // the left and right halves at the centre line.
            this.applyCrossedSeatWidthStretch(
              object,
              (seatWidthCm - baseSeatWidthCm) * 0.01
            );
          } else {
            this.applyCenteredGeometryWidthDelta(
              object,
              (seatWidthCm - baseSeatWidthCm) * 0.01
            );
          }
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
        case "frontForkLeft":
          this.applyIndependentFrontForkPlacement(
            object,
            -1,
            seatWidthCm,
            fixedReferenceDepthDelta,
            isFrontAngle90 ? this.debugFrontCaster90Adjust : activeFrameAdjust,
            frameLengthOffset,
            selection
          );
          break;
        case "frontForkRight":
          this.applyIndependentFrontForkPlacement(
            object,
            1,
            seatWidthCm,
            fixedReferenceDepthDelta,
            isFrontAngle90 ? this.debugFrontCaster90Adjust : activeFrameAdjust,
            frameLengthOffset,
            selection
          );
          break;
        case "lateralFrameLeft":
          object.position.x = -0.52 - (seatWidthCm - baseSeatWidthCm) * 0.005;
          break;
        case "lateralFrameRight":
          object.position.x = -0.083 + (seatWidthCm - baseSeatWidthCm) * 0.005;
          break;
        case "rearWheel":
        case "handrim":
          this.applySeatWidthLateralOffset(object, S5_WHEEL_FOOTREST_REFERENCE_SEAT_WIDTH_CM);
          this.applyPairedWheelGeometryWidthOffset(object, seatWidthCm);
          break;
        case "rearWheelLeft":
        case "rearWheelHandrimLeft":
        case "rearWheelTyreLeft":
          this.applyRearWheelInstancePlacement(
            object,
            -1,
            seatWidthCm,
            rearWheelCamberDegrees
          );
          break;
        case "rearWheelRight":
        case "rearWheelHandrimRight":
        case "rearWheelTyreRight":
          this.applyRearWheelInstancePlacement(
            object,
            1,
            seatWidthCm,
            rearWheelCamberDegrees
          );
          break;
        case "axleRight":
        case "axleLeft":
          // Axle positions are calibrated at 36 cm. Their explicit left/right
          // width offsets are applied after manual adjustments, so the shared
          // non-mirrored GLB cannot make both instances move in one direction.
          break;
        case "brakeRight":
        case "brakeLeft":
          break;
        case "backrestHandleLeft":
          this.applyBackrestHandleInstancePlacement(object, -1, seatWidthCm);
          break;
        case "backrestHandleRight":
          this.applyBackrestHandleInstancePlacement(object, 1, seatWidthCm);
          break;
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
    const normalizedCenter = new THREE.Box3()
      .setFromObject(object)
      .getCenter(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    const desktopCompactPreview = window.innerWidth >= 1280;
    const distance = maxDim * (desktopCompactPreview ? 1.44 : 1.6) || 1;

    this.camera.position.set(
      normalizedCenter.x + distance,
      normalizedCenter.y + distance,
      normalizedCenter.z + distance
    );
    this.camera.near = distance / 100;
    this.camera.far = distance * 100;
    if (this.camera.isOrthographicCamera) {
      const aspect = Math.max(0.1, this.container.clientWidth / Math.max(1, this.container.clientHeight));
      const halfHeight = Math.max(
        0.1,
        Math.tan(THREE.MathUtils.degToRad(this.perspectiveCamera.fov * 0.5)) * distance
      );
      this.camera.left = -halfHeight * aspect;
      this.camera.right = halfHeight * aspect;
      this.camera.top = halfHeight;
      this.camera.bottom = -halfHeight;
      this.camera.zoom = 1;
    }
    this.camera.updateProjectionMatrix();
    this.controls.target.copy(normalizedCenter);
    this.controls.update();
  }

  syncOrbitTargetToModelCenter() {
    if (!this.modelRoot || !this.camera || !this.controls) {
      return;
    }
    const box = new THREE.Box3().setFromObject(this.modelRoot);
    if (box.isEmpty()) {
      return;
    }
    const center = box.getCenter(new THREE.Vector3());
    const targetDelta = center.clone().sub(this.controls.target);
    this.controls.target.copy(center);
    this.camera.position.add(targetDelta);
    this.controls.update();
  }

  captureCameraView() {
    if (!this.camera || !this.controls) return null;
    return {
      position: this.camera.position.clone(),
      target: this.controls.target.clone(),
      up: this.camera.up.clone(),
      zoom: Number(this.camera.zoom) || 1,
    };
  }

  restoreCameraView(view) {
    if (!view || !this.camera || !this.controls) return;
    this.camera.position.copy(view.position);
    this.controls.target.copy(view.target);
    this.camera.up.copy(view.up);
    this.camera.zoom = view.zoom;
    this.camera.updateProjectionMatrix();
    this.controls.update();
  }

  applyFrameColor(frameColor) {
    if (!frameColor || !this.colorTargets.length) return;
    const color = new THREE.Color(frameColor);
    this.colorTargets.forEach((target) => {
      const useStableMiddleMaterial = target.userData.partKey === "frame-middle";
      target.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.visible = !child.userData.wcHiddenByLateralFrame;
          child.frustumCulled = false;
          child.renderOrder = 1;
          const materials = Array.isArray(child.material) ? child.material : [child.material];
          const useStableRearCrossbarMaterial =
            (target.userData.partKey === "frame-left-body" && child.name === "Object_102") ||
            (target.userData.partKey === "frame-right-body" && child.name === "Object_213");
          if (useStableMiddleMaterial || useStableRearCrossbarMaterial) {
            if (child.userData.wcStableFrameMaterial && !Array.isArray(child.material)) {
              child.material.color.copy(color);
              child.material.needsUpdate = true;
              return;
            }
            materials.forEach((material) => material && material.dispose && material.dispose());
            child.material = buildStableMiddleFrameMaterial(color);
            child.userData.wcStableFrameMaterial = true;
            return;
          }
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
          nextMaterials.forEach((material) => {
            if (material && "flatShading" in material) {
              material.flatShading = false;
            }
            if (material) {
              material.polygonOffset = false;
              material.polygonOffsetFactor = 0;
              material.polygonOffsetUnits = 0;
              material.depthWrite = true;
              material.needsUpdate = true;
            }
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
    return `${entry.src || ""}|${entry.object && entry.object.userData && entry.object.userData.partTint ? 1 : 0}|${entry.object && entry.object.userData && entry.object.userData.partBlackWheel ? 1 : 0}|${entry.object && entry.object.userData && entry.object.userData.partSeatStyle ? entry.object.userData.partSeatStyle : ""}|${entry.object && entry.object.userData && entry.object.userData.partFootrestPlateStyle ? entry.object.userData.partFootrestPlateStyle : ""}|${entry.object && entry.object.userData && entry.object.userData.partBackrestStyle ? entry.object.userData.partBackrestStyle : ""}|${entry.object && entry.object.userData && entry.object.userData.partSideguardStyle ? entry.object.userData.partSideguardStyle : ""}|${entry.object && entry.object.userData && entry.object.userData.partHandleStyle ? entry.object.userData.partHandleStyle : ""}|${entry.object && entry.object.userData ? entry.object.userData.partHandleSide || 0 : 0}|${entry.object && entry.object.userData && entry.object.userData.partMirrorX ? 1 : 0}|${entry.object && entry.object.userData ? entry.object.userData.partInstanceOffsetX || 0 : 0}|${entry.object && entry.object.userData && entry.object.userData.partReverseWheelFacing ? 1 : 0}|${entry.object && entry.object.userData ? entry.object.userData.partWheelAlignmentYDeg || 0 : 0}|${entry.object && entry.object.userData ? entry.object.userData.partWheelAlignmentZDeg || 0 : 0}`;
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

  captureDimensionTransitionState(previousSelection, nextSelection) {
    if (!this.modelRoot || !previousSelection) {
      return null;
    }
    const seatWidthChanged =
      !!previousSelection.seatWidth &&
      previousSelection.seatWidth !== (nextSelection && nextSelection.seatWidth);
    const frameLengthChanged =
      !!previousSelection.frameLength &&
      previousSelection.frameLength !== (nextSelection && nextSelection.frameLength);
    if (!seatWidthChanged && !frameLengthChanged) {
      return null;
    }

    const centeredGeometry = new Map();
    const centeredGeometryKeys = new Set(["seat", "backrest", "frame-middle"]);
    this.partObjects.forEach((entry) => {
      if (!entry || !entry.object || !centeredGeometryKeys.has(entry.key)) {
        return;
      }
      const meshes = [];
      entry.object.traverse((child) => {
        const position = child && child.geometry && child.geometry.attributes
          ? child.geometry.attributes.position
          : null;
        if (!position || !position.array) {
          return;
        }
        meshes.push({
          mesh: child,
          position,
          values: new Float32Array(position.array),
        });
      });
      if (meshes.length) {
        centeredGeometry.set(entry.key, meshes);
      }
    });

    return {
      seatWidthChanged,
      frameLengthChanged,
      previousSeatWidthCm: this.getSeatWidthCm(previousSelection),
      nextSeatWidthCm: this.getSeatWidthCm(nextSelection || {}),
      nextFrameLong: (nextSelection && nextSelection.frameLength) === "fl-long",
      centeredGeometry,
      roots: new Map(
        this.partObjects
          .filter((entry) => entry && entry.key && entry.object)
          .map((entry) => [entry.key, {
            object: entry.object,
            position: entry.object.position.clone(),
            quaternion: entry.object.quaternion.clone(),
            scale: entry.object.scale.clone(),
          }])
      ),
    };
  }

  queueDimensionTransitions(state) {
    if (!state) {
      return;
    }
    const centeredGeometryKeys = new Set(["seat", "backrest", "frame-middle"]);

    this.partObjects.forEach((entry) => {
      if (!entry || !entry.object || !entry.object.visible) {
        return;
      }
      const object = entry.object;
      const previous = state.roots.get(entry.key);
      const finalPosition = object.position.clone();
      const finalQuaternion = object.quaternion.clone();
      const finalScale = object.scale.clone();
      let startPosition = finalPosition.clone();
      let startQuaternion = finalQuaternion.clone();
      let startScale = finalScale.clone();

      if (state.seatWidthChanged && centeredGeometryKeys.has(entry.key)) {
        const previousMeshes = state.centeredGeometry && state.centeredGeometry.get(entry.key);
        (previousMeshes || []).forEach((previousMesh) => {
          const position = previousMesh.mesh && previousMesh.mesh.geometry
            ? previousMesh.mesh.geometry.attributes.position
            : null;
          if (
            !position ||
            position !== previousMesh.position ||
            position.array.length !== previousMesh.values.length
          ) {
            return;
          }
          const finalValues = new Float32Array(position.array);
          let geometryChanged = false;
          for (let index = 0; index < finalValues.length; index += 1) {
            if (Math.abs(finalValues[index] - previousMesh.values[index]) > 1e-7) {
              geometryChanged = true;
              break;
            }
          }
          if (!geometryChanged) {
            return;
          }
          position.array.set(previousMesh.values);
          position.needsUpdate = true;
          this.transitions = this.transitions.filter(
            (transition) => transition.positionAttribute !== position
          );
          this.transitions.push({
            object: previousMesh.mesh,
            mode: "geometry-width",
            start: performance.now(),
            duration: 720,
            recomputeNormalsDuringTransition: entry.key === "frame-middle",
            positionAttribute: position,
            startValues: previousMesh.values,
            finalValues,
          });
        });
      }

      if (previous && previous.object === object) {
        startPosition = previous.position.clone();
        startQuaternion = previous.quaternion.clone();
        startScale = previous.scale.clone();
      } else if (state.frameLengthChanged && /^frame-(?:left|right)-fork-/.test(entry.key)) {
        startPosition.z += state.nextFrameLong ? 0.05 : -0.05;
      }

      const changed =
        startPosition.distanceToSquared(finalPosition) > 1e-10 ||
        1 - Math.abs(startQuaternion.dot(finalQuaternion)) > 1e-8 ||
        startScale.distanceToSquared(finalScale) > 1e-10;
      if (!changed) {
        return;
      }

      this.transitions = this.transitions.filter(
        (transition) => transition.object !== object || transition.mode !== "pose"
      );
      object.position.copy(startPosition);
      object.quaternion.copy(startQuaternion);
      object.scale.copy(startScale);
      object.updateMatrixWorld(true);
      this.transitions.push({
        object,
        mode: "pose",
        start: performance.now(),
        duration: 720,
        startPosition,
        startQuaternion,
        startScale,
        finalPosition,
        finalQuaternion,
        finalScale,
      });
    });
  }

  queueRearWheelCamberTransition(previousDegrees, nextDegrees) {
    if (previousDegrees === nextDegrees) {
      return;
    }

    this.partObjects.forEach((entry) => {
      const side = this.getRearWheelComponentSide(entry && entry.key);
      if (!side || !entry.object) return;
      const object = entry.object;
        const finalPosition = object.position.clone();
        const finalRotation = object.rotation.clone();
        const startRotation = finalRotation.clone();
        startRotation.z += THREE.MathUtils.degToRad(
          (previousDegrees - nextDegrees) * side
        );

        this.transitions = this.transitions.filter(
          (transition) => transition.object !== object || transition.mode !== "camber"
        );
        this.applyRotationAroundGeometryCenter(
          object,
          finalPosition,
          finalRotation,
          startRotation
        );
        this.transitions.push({
          object,
          mode: "camber",
          start: performance.now(),
          duration: 720,
          startRotation,
          finalRotation,
          finalPosition,
        });
    });
  }

  updateTransitions() {
    if (!this.transitions.length) {
      return;
    }
    const now = performance.now();
    this.transitions = this.transitions.filter((transition) => {
      const progress = Math.min(1, (now - transition.start) / transition.duration);
      if (transition.mode === "geometry-width") {
        const eased = 0.5 - Math.cos(Math.PI * progress) * 0.5;
        const attribute = transition.positionAttribute;
        const target = attribute && attribute.array;
        if (!target || target.length !== transition.finalValues.length) {
          return false;
        }
        for (let index = 0; index < target.length; index += 1) {
          target[index] = THREE.MathUtils.lerp(
            transition.startValues[index],
            transition.finalValues[index],
            eased
          );
        }
        attribute.needsUpdate = true;
        const geometry = transition.object && transition.object.geometry;
        if (geometry && transition.recomputeNormalsDuringTransition) {
          geometry.computeVertexNormals();
        }
        if (progress >= 1) {
          target.set(transition.finalValues);
          attribute.needsUpdate = true;
          if (geometry) {
            geometry.computeVertexNormals();
            geometry.computeBoundingBox();
            geometry.computeBoundingSphere();
          }
          return false;
        }
        return true;
      }
      if (transition.mode === "pose") {
        const eased = 0.5 - Math.cos(Math.PI * progress) * 0.5;
        transition.object.position.lerpVectors(
          transition.startPosition,
          transition.finalPosition,
          eased
        );
        transition.object.quaternion.slerpQuaternions(
          transition.startQuaternion,
          transition.finalQuaternion,
          eased
        );
        transition.object.scale.lerpVectors(
          transition.startScale,
          transition.finalScale,
          eased
        );
        transition.object.updateMatrixWorld(true);
        if (progress >= 1) {
          transition.object.position.copy(transition.finalPosition);
          transition.object.quaternion.copy(transition.finalQuaternion);
          transition.object.scale.copy(transition.finalScale);
          return false;
        }
        return true;
      }
      if (transition.mode === "camber") {
        const eased = 0.5 - Math.cos(Math.PI * progress) * 0.5;
        const nextRotation = transition.startRotation.clone();
        nextRotation.x = THREE.MathUtils.lerp(
          transition.startRotation.x,
          transition.finalRotation.x,
          eased
        );
        nextRotation.y = THREE.MathUtils.lerp(
          transition.startRotation.y,
          transition.finalRotation.y,
          eased
        );
        nextRotation.z = THREE.MathUtils.lerp(
          transition.startRotation.z,
          transition.finalRotation.z,
          eased
        );
        this.applyRotationAroundGeometryCenter(
          transition.object,
          transition.finalPosition,
          transition.finalRotation,
          nextRotation
        );
        if (progress >= 1) {
          transition.object.position.copy(transition.finalPosition);
          transition.object.rotation.copy(transition.finalRotation);
          return false;
        }
        return true;
      }
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
    // Camber animation rotates every wheel asset around its own geometry centre.
    // Re-anchor Parts 2 and 3 after each frame so the three files behave as one assembly.
    this.alignRearWheelSubcomponentsToMainWheels();
  }

  async update({ sourceModel, selection, frameColor }) {
    const preservedCameraView = this.modelRoot ? this.captureCameraView() : null;
    const previousSelection = Object.assign({}, this.lastSelection || {});
    const dimensionTransitionState = this.captureDimensionTransitionState(
      previousSelection,
      selection || {}
    );
    const previousRearWheelCamber = this.targetRearWheelCamber;
    const nextRearWheelCamber = this.getRearWheelCamberDegrees(selection || {});
    // Lock the requested target before awaiting model/debug data. Several UI
    // listeners can request the same update, but only the first should animate.
    this.targetRearWheelCamber = nextRearWheelCamber;
    this.lastSourceModel = sourceModel;
    this.lastSelection = Object.assign({}, selection || {});
    this.lastFrameColor = frameColor || "";
    await this.ensureManualAdjustmentsLoaded();
    const parts = getModelPartsForSourceModel(sourceModel, selection || {});
    const partsSignature = JSON.stringify({
      sourceModel,
      parts: parts.map((part) => `${part.key || ""}:${part.src}|${part.tint ? 1 : 0}|${part.blackWheel ? 1 : 0}|${part.seatStyle || ""}|${part.footrestPlateStyle || ""}|${part.backrestStyle || ""}|${part.sideguardStyle || ""}|${part.handleStyle || ""}|${part.handleSide || 0}|${part.mirrorX ? 1 : 0}|${part.reverseWheelFacing ? 1 : 0}|${part.wheelAlignmentYDeg || 0}|${part.wheelAlignmentZDeg || 0}`),
    });
    const signature = JSON.stringify({
      sourceModel,
      frameColor,
      selection: selection || {},
      parts: parts.map((part) => `${part.key || ""}:${part.src}|${part.tint ? 1 : 0}|${part.blackWheel ? 1 : 0}|${part.seatStyle || ""}|${part.footrestPlateStyle || ""}|${part.backrestStyle || ""}|${part.sideguardStyle || ""}|${part.handleStyle || ""}|${part.handleSide || 0}|${part.mirrorX ? 1 : 0}|${part.reverseWheelFacing ? 1 : 0}|${part.wheelAlignmentYDeg || 0}|${part.wheelAlignmentZDeg || 0}`),
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
      this.restoreCameraView(preservedCameraView);
      this.applyFrameColor(frameColor);
      this.enforceBackrestAppearance();
      this.applyHandrimAppearance(selection && selection.handrim);
      this.applyTyreAppearance(selection && selection.tyre);
      this.queueDimensionTransitions(dimensionTransitionState);
      this.queueRearWheelCamberTransition(previousRearWheelCamber, nextRearWheelCamber);
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
    try {
      if (canPatchExisting && this.modelRoot) {
        const group = this.modelRoot;
        const existingByKey = new Map(
          this.partObjects.map((entry) => [entry.key || "", entry])
        );
        const nextPartObjects = [];
        const nextColorTargets = [];
        const pendingFadeIns = [];
        const pendingFadeOuts = [];

        for (let index = 0; index < parts.length; index += 1) {
          const part = parts[index];
          const partKey = part.key || "";
          const desiredSignature = `${part.src}|${part.tint ? 1 : 0}|${part.blackWheel ? 1 : 0}|${part.seatStyle || ""}|${part.footrestPlateStyle || ""}|${part.backrestStyle || ""}|${part.sideguardStyle || ""}|${part.handleStyle || ""}|${part.handleSide || 0}|${part.mirrorX ? 1 : 0}|${part.instanceOffsetX || 0}|${part.reverseWheelFacing ? 1 : 0}|${part.wheelAlignmentYDeg || 0}|${part.wheelAlignmentZDeg || 0}`;
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
          object.userData.partHandleStyle = part.handleStyle || "";
          object.userData.partHandleSide = Number(part.handleSide) || 0;
          object.userData.partMirrorX = !!part.mirrorX;
          object.userData.partInstanceOffsetX = Number(part.instanceOffsetX) || 0;
          object.userData.partReverseWheelFacing = !!part.reverseWheelFacing;
          object.userData.partWheelAlignmentYDeg = Number(part.wheelAlignmentYDeg) || 0;
          object.userData.partWheelAlignmentZDeg = Number(part.wheelAlignmentZDeg) || 0;
          // Keep replacement parts completely out of the render pass until all
          // placement and material work has finished. Opacity alone is not
          // sufficient because appearance updates may replace a material and
          // briefly render the freshly loaded object at its authored origin.
          object.visible = false;
          this.setObjectOpacity(object, 0);

          if (existingEntry) {
            pendingFadeOuts.push(existingEntry.object);
            existingByKey.delete(partKey);
          }

          group.add(object);
          pendingFadeIns.push(object);
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
          pendingFadeOuts.push(entry.object);
        });

        // Manual-placement reset traverses modelRoot. Move outgoing parts out of
        // that hierarchy first, while preserving their rendered world pose, so
        // the old brake cannot jump back to its authored origin before fading.
        if (pendingFadeOuts.length) {
          const outgoingObjects = new Set(pendingFadeOuts);
          this.transitions = this.transitions.filter(
            (transition) => !outgoingObjects.has(transition.object)
          );
          pendingFadeOuts.forEach((object) => {
            if (object && object.parent && this.scene) {
              this.scene.attach(object);
            }
          });
        }

        this.partObjects = nextPartObjects;
        this.colorTargets = nextColorTargets;
        this.currentSourceModel = sourceModel;
        this.applyDimensionAdjustments(selection || {});
        this.applyManualObjectAdjustments(selection || {});
        this.restoreCameraView(preservedCameraView);
        this.applyFrameColor(frameColor);
        this.enforceBackrestAppearance();
        this.applyHandrimAppearance(selection && selection.handrim);
        this.applyTyreAppearance(selection && selection.tyre);
        const replacingFrameLength = !!(dimensionTransitionState && dimensionTransitionState.frameLengthChanged);
        pendingFadeOuts.forEach((object) => {
          this.queueTransition(object, "fade-out", replacingFrameLength ? 520 : 240, () => {
            object.removeFromParent();
            this.disposeObject(object);
          });
        });
        pendingFadeIns.forEach((object) => {
          this.setObjectOpacity(object, 0);
          object.visible = true;
          this.queueTransition(object, "fade-in", replacingFrameLength ? 620 : 300);
        });
        this.queueDimensionTransitions(dimensionTransitionState);
        this.queueRearWheelCamberTransition(previousRearWheelCamber, nextRearWheelCamber);
        this.refreshObjectDebugOptions();
        this.highlightDebugTargetObject();
        this.showStatus("");
        return;
      }

      const group = new THREE.Group();
      const loadedPartObjects = [];
      const loadedColorTargets = [];
      const pendingFadeIns = [];
      let meshCount = 0;

      const loadedObjects = await this.loadObjectsConcurrently(parts, (percent) => {
        this.showStatus(`Loading... ${percent}%`);
      });

      for (let index = 0; index < parts.length; index += 1) {
        const part = parts[index];
        const object = loadedObjects[index];

        object.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            meshCount += 1;
            child.castShadow = false;
            child.receiveShadow = false;
          }
        });

        if (part.tint) {
          loadedColorTargets.push(object);
        }
        object.userData.partKey = part.key || "";
        object.userData.partSrc = part.src;
        object.userData.partTint = !!part.tint;
        object.userData.partBlackWheel = !!part.blackWheel;
        object.userData.partSeatStyle = part.seatStyle || "";
        object.userData.partFootrestPlateStyle = part.footrestPlateStyle || "";
        object.userData.partBackrestStyle = part.backrestStyle || "";
        object.userData.partSideguardStyle = part.sideguardStyle || "";
        object.userData.partHandleStyle = part.handleStyle || "";
        object.userData.partHandleSide = Number(part.handleSide) || 0;
        object.userData.partMirrorX = !!part.mirrorX;
        object.userData.partInstanceOffsetX = Number(part.instanceOffsetX) || 0;
        object.userData.partReverseWheelFacing = !!part.reverseWheelFacing;
        object.userData.partWheelAlignmentYDeg = Number(part.wheelAlignmentYDeg) || 0;
        object.userData.partWheelAlignmentZDeg = Number(part.wheelAlignmentZDeg) || 0;
        loadedPartObjects.push({
          key: part.key || "",
          src: part.src,
          object,
        });
        object.visible = false;
        this.setObjectOpacity(object, 0);
        pendingFadeIns.push(object);
        group.add(object);
      }

      if (currentToken !== this.loadToken) {
        this.disposeObject(group);
        return;
      }

      this.partObjects = loadedPartObjects;
      this.colorTargets = loadedColorTargets;
      this.modelRoot = group;
      this.scene.add(group);
      this.currentSourceModel = sourceModel;
      this.applyDimensionAdjustments(selection || {});
      this.applyManualObjectAdjustments(selection || {});
      this.fitCameraToObject(group);
      this.applyFrameColor(frameColor);
      this.enforceBackrestAppearance();
      this.applyHandrimAppearance(selection && selection.handrim);
      this.applyTyreAppearance(selection && selection.tyre);
      pendingFadeIns.forEach((object) => {
        this.setObjectOpacity(object, 0);
        object.visible = true;
        this.queueTransition(object, "fade-in", 300);
      });
      this.refreshObjectDebugOptions();
      this.highlightDebugTargetObject();
      this.showStatus(meshCount ? "" : "Model is empty");
      // Do not let optional fork variants compete with the parts required for
      // the first complete wheelchair. Warm the cache only after first paint.
      window.setTimeout(() => {
        if (this.currentSourceModel === sourceModel) {
          this.preloadSources(this.getPreloadSourcesForModel(sourceModel));
        }
      }, 8000);
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
    const activeTarget = this.parseAdjustableObjectKey(activeName);
    const activeObjects = new Set(this.getObjectsByAdjustableName(activeName));
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
        const childMatches = activeTarget.meshName
          ? activeObjects.has(child)
          : this.resolvePartKeyFromObject(child) === activeTarget.partKey;
        if (childMatches && activeTarget.partKey !== "backrest") {
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

  getFocusPartKeys(moduleId) {
    const map = {
      frameMaterial: [/^frame-/, /^footrest$/, /^backrestHandle/],
      frameColor: [/^frame-/, /^footrest$/, /^backrestHandle/],
      frameAngle: [/^frame-.*fork/i, /^footrest$/, /^footrestPlate$/, /^frontCaster/],
      frameLength: [/^frame-/, /^footrest$/, /^footrestPlate$/, /^frontCaster/],
      lateralFrame: [/^lateralFrame/],
      seatWidth: [/^seat$/, /^backrest$/, /^sideguard/, /^rearWheel/],
      seatDepth: [/^seat$/],
      seatSetting: [/^seat$/],
      backrestHeight: [/^backrest/],
      backrestTube: [/^backrest/],
      backrestHandles: [/^backrestHandle/],
      skirtGuards: [/^sideguard/],
      legLength: [/^footrest$/, /^footrestPlate$/],
      footrestSetting: [/^footrestPlate$/, /^footrest$/],
      frontWheel: [/^frontCaster/],
      frontFork: [/^frontCaster/, /Fork/],
      rearWheel: [/^rearWheel/],
      handrim: [/^rearWheelHandrim/],
      tyre: [/^rearWheelTyre/],
      axle: [/^axle/],
      rearWheelsBar: [/^rearWheel/, /^axle/],
      brake: [/^brake/],
      accessoryAntitipp: [/antiTip/i],
      accessoryTippingHelp: [/tippingHelp/i],
      accessoryTransitWheels: [/transitWheel/i],
    };
    return map[moduleId] || [];
  }

  restoreSelectionHighlight() {
    if (!this.selectionHighlight) return;
    this.selectionHighlight.materials.forEach((entry) => {
      if (entry.material.color && entry.color) entry.material.color.copy(entry.color);
      if (entry.material.emissive && entry.emissive) entry.material.emissive.copy(entry.emissive);
      if ("emissiveIntensity" in entry.material) entry.material.emissiveIntensity = entry.emissiveIntensity;
    });
    this.selectionHighlight = null;
  }

  focusAndHighlightModule(moduleId, durationSeconds, options = {}) {
    if (!this.modelRoot || !this.camera || !this.controls) return;
    const matchers = this.getFocusPartKeys(moduleId);
    if (!matchers.length) return;
    const targets = this.partObjects.filter((entry) => matchers.some((matcher) => matcher.test(entry.key || "")));
    if (!targets.length) return;

    const box = new THREE.Box3();
    targets.forEach((entry) => box.expandByObject(entry.object));
    if (box.isEmpty()) return;
    const changeView = options.changeView !== false && this.selectionFocusEnabled;
    if (changeView) {
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());
      const customView = this.getCustomCameraViewForTargets(targets);
      if (customView && customView.projection !== this.projectionMode) {
        this.setProjectionMode(customView.projection);
      }
      const direction = this.camera.position.clone().sub(this.controls.target);
      if (direction.lengthSq() < 0.000001) direction.set(1, 0.7, 1);
      direction.normalize();
      const modelBox = new THREE.Box3().setFromObject(this.modelRoot);
      const modelSphere = modelBox.getBoundingSphere(new THREE.Sphere());
      const targetSize = Math.max(size.x, size.y, size.z);
      const distance = customView
        ? new THREE.Vector3(
            customView.position.x,
            customView.position.y,
            customView.position.z
          ).distanceTo(new THREE.Vector3(
            customView.target.x,
            customView.target.y,
            customView.target.z
          ))
        : Math.max(0.8, targetSize * 3.2, modelSphere.radius * 1.15);
      const toPosition = customView
        ? new THREE.Vector3(customView.position.x, customView.position.y, customView.position.z)
        : center.clone().addScaledVector(direction, distance);
      const toTarget = customView
        ? new THREE.Vector3(customView.target.x, customView.target.y, customView.target.z)
        : center.clone();
      if (customView) {
        this.camera.up.set(customView.up.x, customView.up.y, customView.up.z);
        this.camera.zoom = Math.max(0.0001, Number(customView.zoom) || 1);
      }
      this.setSafeCameraClipping(Math.max(0.1, distance));
      this.cameraFocusTransition = {
        start: performance.now(),
        duration: 420,
        fromPosition: this.camera.position.clone(),
        toPosition,
        fromTarget: this.controls.target.clone(),
        toTarget,
      };
    } else {
      // A second choice inside the same option group must not continue or
      // restart a camera movement that was initiated by the previous choice.
      this.cameraFocusTransition = null;
    }

    this.restoreSelectionHighlight();
    const seconds = durationSeconds == null ? this.highlightDurationSeconds : Number(durationSeconds);
    if (!(seconds > 0)) return;
    const materials = [];
    const seen = new Set();
    targets.forEach((entry) => entry.object.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) return;
      (Array.isArray(child.material) ? child.material : [child.material]).forEach((material) => {
        if (!material || seen.has(material)) return;
        seen.add(material);
        const snapshot = {
          material,
          color: material.color ? material.color.clone() : null,
          emissive: material.emissive ? material.emissive.clone() : null,
          emissiveIntensity: Number(material.emissiveIntensity) || 0,
        };
        materials.push(snapshot);
        if (material.color) material.color.lerp(new THREE.Color(0xffd36a), 0.24);
        if (material.emissive) material.emissive.set(0xffa928);
        if ("emissiveIntensity" in material) material.emissiveIntensity = 0.7;
      });
    }));
    this.selectionHighlight = {
      materials,
      start: performance.now(),
      hold: Math.max(0, seconds * 1000 - 650),
      fade: 650,
    };
  }

  updateFocusAndHighlight() {
    const now = performance.now();
    if (this.cameraFocusTransition) {
      const transition = this.cameraFocusTransition;
      const progress = Math.min(1, (now - transition.start) / transition.duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      this.camera.position.lerpVectors(transition.fromPosition, transition.toPosition, eased);
      this.controls.target.lerpVectors(transition.fromTarget, transition.toTarget, eased);
      this.camera.lookAt(this.controls.target);
      this.controls.update();
      if (progress >= 1) this.cameraFocusTransition = null;
    }
    if (!this.selectionHighlight) return;
    const highlight = this.selectionHighlight;
    const elapsed = now - highlight.start;
    if (elapsed <= highlight.hold) return;
    const progress = Math.min(1, (elapsed - highlight.hold) / highlight.fade);
    highlight.materials.forEach((entry) => {
      if (entry.material.color && entry.color) entry.material.color.lerp(entry.color, progress);
      if (entry.material.emissive && entry.emissive) entry.material.emissive.lerp(entry.emissive, progress);
      if ("emissiveIntensity" in entry.material) {
        entry.material.emissiveIntensity = THREE.MathUtils.lerp(0.7, entry.emissiveIntensity, progress);
      }
    });
    if (progress >= 1) this.restoreSelectionHighlight();
  }

  resize() {
    if (!this.renderer || !this.camera) return;
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    this.renderer.setPixelRatio(getRendererPixelRatio());
    this.renderer.setSize(width, height);
    const aspect = width / Math.max(1, height);
    if (this.camera.isOrthographicCamera) {
      const halfHeight = Math.max(0.01, (this.camera.top - this.camera.bottom) * 0.5);
      this.camera.left = -halfHeight * aspect;
      this.camera.right = halfHeight * aspect;
    } else {
      this.camera.aspect = aspect;
    }
    this.camera.updateProjectionMatrix();
  }

  animate() {
    if (!this.renderer || !this.scene || !this.camera) return;
    this.updateTransitions();
    this.updateFocusAndHighlight();
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
    this.projectionLanguageObserver && this.projectionLanguageObserver.disconnect();
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
    this.perspectiveCamera = null;
    this.orthographicCamera = null;
    this.projectionToggleButton = null;
    this.projectionLanguageObserver = null;
    this.standardViewControls = null;
    this.objectDebugToggleButton = null;
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
