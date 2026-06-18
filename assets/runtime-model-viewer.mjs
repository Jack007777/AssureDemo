import * as THREE from "three";
import { OrbitControls } from "/assets/vendor/OrbitControls.js";
import { DRACOLoader } from "/assets/vendor/DRACOLoader.js";
import { GLTFLoader } from "/assets/vendor/GLTFLoader.js";
import { MeshoptDecoder } from "/assets/vendor/meshopt_decoder.module.js";
import { getModelPartsForSourceModel } from "/assets/model-parts.mjs";

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

export function mountRuntimeModelViewer(container) {
  return new RuntimeModelViewer(container);
}

class RuntimeModelViewer {
  constructor(container) {
    this.container = container;
    this.root = null;
    this.statusNode = null;
    this.renderer = null;
    this.scene = null;
    this.camera = null;
    this.controls = null;
    this.modelRoot = null;
    this.dracoLoader = null;
    this.resizeObserver = null;
    this.animationId = 0;
    this.colorTargets = [];
    this.partObjects = [];
    this.loadToken = 0;
    this.signature = "";
    this.partsSignature = "";
    this.currentSourceModel = "";
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
    root.style.background = "transparent";

    const statusNode = document.createElement("div");
    statusNode.className = "wc-runtime-model-status";
    statusNode.style.position = "absolute";
    statusNode.style.left = "50%";
    statusNode.style.top = "50%";
    statusNode.style.transform = "translate(-50%, -50%)";
    statusNode.style.color = "rgba(230, 238, 255, 0.82)";
    statusNode.style.fontSize = isMobileViewport() ? "14px" : "15px";
    statusNode.style.pointerEvents = "none";
    statusNode.style.textAlign = "center";
    statusNode.style.display = "none";

    root.appendChild(statusNode);
    this.container.appendChild(root);

    this.root = root;
    this.statusNode = statusNode;

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(45, 1, 0.01, 1000);
    this.camera.position.set(2, 2, 2);

    this.renderer = new THREE.WebGLRenderer({
      antialias: !isMobileViewport(),
      alpha: true,
      powerPreference: "high-performance",
    });
    this.renderer.domElement.className = `${this.renderer.domElement.className} wc-runtime-canvas`.trim();
    this.renderer.domElement.setAttribute("data-runtime-canvas", "true");
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.setPixelRatio(getRendererPixelRatio());
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    this.root.appendChild(this.renderer.domElement);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.06;

    const ambient = new THREE.AmbientLight(0xffffff, 0.72);
    this.scene.add(ambient);

    const dir = new THREE.DirectionalLight(0xffffff, 0.95);
    dir.position.set(5, 6, 4);
    this.scene.add(dir);

    const fill = new THREE.DirectionalLight(0xffffff, 0.28);
    fill.position.set(-4, 5, -3);
    this.scene.add(fill);

    const grid = new THREE.GridHelper(4, 20, 0x22304a, 0x22304a);
    this.scene.add(grid);

    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(this.container);
    this.animate();
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

  loadObject(part, onProgress) {
    return this.loadGlb(part.src, onProgress);
  }

  loadGlb(src, onProgress) {
    return new Promise((resolve, reject) => {
      const loader = this.getGlbLoader();
      const timeoutId = window.setTimeout(() => {
        reject(new Error(`GLB load timeout: ${src}`));
      }, getLoadTimeoutMs());

      loader.load(
        src,
        (gltf) => {
          window.clearTimeout(timeoutId);
          resolve(gltf.scene);
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

  applyDimensionAdjustments(selection) {
    if (!this.partObjects.length) {
      return;
    }

    const baseSeatWidthCm = 40;
    const baseSeatDepthCm = 40;
    const seatWidthCm = this.getSeatWidthCm(selection);
    const seatDepthCm = this.getSeatDepthCm(selection);
    const widthScale = seatWidthCm / baseSeatWidthCm;
    const depthScale = seatDepthCm / baseSeatDepthCm;
    const depthDelta = (seatDepthCm - baseSeatDepthCm) * 0.01;

    this.partObjects.forEach(({ key, object }) => {
      object.scale.set(1, 1, 1);
      object.position.set(0, 0, 0);

      switch (key) {
        case "frame":
          object.scale.x = widthScale;
          object.scale.z = depthScale;
          break;
        case "seat":
        case "backrest":
        case "footrest":
        case "sideguards":
          object.scale.x = widthScale;
          object.scale.z = depthScale;
          break;
        case "frontCaster":
          object.scale.x = widthScale;
          object.position.z -= depthDelta * 0.7;
          break;
        case "rearWheel":
        case "handrim":
        case "axle":
        case "brake":
        case "backrestHandles":
        case "antiTip":
        case "tippingHelp":
        case "transitWheels":
          object.scale.x = widthScale;
          if (key === "antiTip" || key === "tippingHelp" || key === "transitWheels") {
            object.position.z -= depthDelta * 0.45;
          }
          break;
        default:
          break;
      }
    });
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
          child.material = new THREE.MeshStandardMaterial({
            color,
            metalness: 0.15,
            roughness: 0.55,
            side: THREE.DoubleSide,
          });
        }
      });
    });
  }

  getPartEntrySignature(entry) {
    if (!entry) {
      return "";
    }
    return `${entry.src || ""}|${entry.object && entry.object.userData && entry.object.userData.partTint ? 1 : 0}`;
  }

  async update({ sourceModel, selection, frameColor }) {
    const parts = getModelPartsForSourceModel(sourceModel, selection || {});
    const partsSignature = JSON.stringify({
      sourceModel,
      parts: parts.map((part) => `${part.key || ""}:${part.src}|${part.tint ? 1 : 0}`),
    });
    const signature = JSON.stringify({
      sourceModel,
      frameColor,
      selection: selection || {},
      parts: parts.map((part) => `${part.key || ""}:${part.src}|${part.tint ? 1 : 0}`),
    });

    if (signature === this.signature) {
      return;
    }

    if (partsSignature === this.partsSignature && this.modelRoot) {
      this.signature = signature;
      this.applyDimensionAdjustments(selection || {});
      this.applyFrameColor(frameColor);
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
          const desiredSignature = `${part.src}|${part.tint ? 1 : 0}`;
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

          if (existingEntry) {
            group.remove(existingEntry.object);
            this.disposeObject(existingEntry.object);
            existingByKey.delete(partKey);
          }

          group.add(object);
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
          group.remove(entry.object);
          this.disposeObject(entry.object);
        });

        this.partObjects = nextPartObjects;
        this.colorTargets = nextColorTargets;
        this.currentSourceModel = sourceModel;
        this.applyDimensionAdjustments(selection || {});
        this.applyFrameColor(frameColor);
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
        this.partObjects.push({
          key: part.key || "",
          src: part.src,
          object,
        });
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
      this.fitCameraToObject(group);
      this.applyFrameColor(frameColor);
      this.showStatus(meshCount ? "" : "Model is empty");
    } catch (error) {
      if (currentToken !== this.loadToken) return;
      console.error("Runtime model load failed", error);
      this.showStatus("Model failed to load");
      this.partsSignature = "";
    }
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
    this.controls && this.controls.update();
    this.renderer.render(this.scene, this.camera);
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
    this.root = null;
    this.statusNode = null;
    this.partsSignature = "";
  }
}
