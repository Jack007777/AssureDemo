import * as THREE from "/assets/vendor/three.module.js";
import { GLTFLoader } from "/assets/vendor/GLTFLoader.js";
import { DRACOLoader } from "/assets/vendor/DRACOLoader.js";
import { MeshoptDecoder } from "/assets/vendor/meshopt_decoder.module.js";
import html2canvas from "/assets/html2canvas.esm-CBrSDip1.js";

const TEXT = {
  "zh-CN": {
    title: "轮椅配置单",
    subtitle: "系统根据当前 3D 模型生成的导出视图",
    frontView: "正视图",
    sideView: "侧视图",
    isoView: "立体图",
    overview: "基本信息",
    selections: "配置明细",
    pricing: "汇总与报价",
    generated: "生成时间",
    model: "车型",
    finalModel: "最终型号",
    leadTime: "交货期",
    weight: "总重量",
    noSelections: "当前没有已选配置项",
    exporting: "导出中...",
    exportFailed: "PDF 导出失败，请重试。",
  },
  "en-US": {
    title: "Wheelchair Configuration Sheet",
    subtitle: "Rendered from the current 3D model",
    frontView: "Front View",
    sideView: "Side View",
    isoView: "Isometric View",
    overview: "Overview",
    selections: "Selections",
    pricing: "Summary & Quote",
    generated: "Generated",
    model: "Model",
    finalModel: "Final Model",
    leadTime: "Lead Time",
    weight: "Weight",
    noSelections: "No active configuration items",
    exporting: "Exporting...",
    exportFailed: "PDF export failed. Please try again.",
  },
};

const DEFAULT_FRAME_COLOR = "#9aa6bd";
const S5_PARTS = [
  { src: "/models/S5/Rahmen-standard.glb", tint: true },
  { src: "/models/S5/Sitzbespannung.glb", tint: false },
  { src: "/models/S5/Ruecken.glb", tint: false },
  { src: "/models/S5/Seitenteilen-standard.glb", tint: false },
  { src: "/models/S5/Fussbrett.glb", tint: false },
  { src: "/models/S5/Lenkraerder-standard.glb", tint: false },
  { src: "/models/S5/Antriebsraede-Klein.glb", tint: false },
];

let dracoLoader = null;
let exportInFlight = false;
let jspdfLoader = null;

function qs(selector, root = document) {
  return root.querySelector(selector);
}

function qsa(selector, root = document) {
  return Array.from(root.querySelectorAll(selector));
}

function getLanguage() {
  const context = window.WC_EXPORT_CONTEXT;
  const current = context && typeof context.getLanguage === "function" ? context.getLanguage() : "";
  if (TEXT[current]) {
    return current;
  }
  const select = qs(".card.header select.select");
  return TEXT[select && select.value] ? select.value : "en-US";
}

function t(key) {
  return TEXT[getLanguage()][key] || TEXT["en-US"][key] || key;
}

function escapeHtml(value) {
  return String(value == null ? "" : value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function slugify(value) {
  return String(value || "wheelchair")
    .trim()
    .replace(/[^\w-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase() || "wheelchair";
}

function isExportButton(button) {
  return !!(
    button &&
    button.tagName === "BUTTON" &&
    /pdf/i.test(button.textContent || "") &&
    button.closest("#app .grid.grid-2 > .card:last-child")
  );
}

function readSummaryRows() {
  const context = window.WC_EXPORT_CONTEXT;
  if (context && typeof context.getSummaryRows === "function") {
    const rows = context.getSummaryRows();
    if (Array.isArray(rows) && rows.length) {
      return rows;
    }
  }
  return qsa("#app .grid.grid-2 > .card:last-child table tbody tr")
    .map((row) => {
      const cells = qsa("td", row);
      return {
        label: ((cells[0] && cells[0].textContent) || "").trim(),
        value: ((cells[1] && cells[1].textContent) || "").trim(),
      };
    })
    .filter((row) => row.label || row.value);
}

function readConfigItems() {
  const context = window.WC_EXPORT_CONTEXT;
  if (context && typeof context.getConfigItems === "function") {
    const items = context.getConfigItems();
    if (Array.isArray(items) && items.length) {
      const filtered = items.filter((item) => item && item.title && item.value);
      if (filtered.length) {
        return filtered;
      }
    }
  }
  if (window.__WC_STATE && window.__WC_STATE.selectionDetails) {
    const details = window.__WC_STATE.selectionDetails;
    const order = [
      "frameMaterial",
      "frameColor",
      "frameAngle",
      "frameLength",
      "seatWidth",
      "seatDepth",
      "seatSetting",
      "backrestHeight",
      "backrestTube",
      "backrestHandles",
      "lateralFrame",
      "skirtGuards",
      "legLength",
      "footrestSetting",
      "frontWheel",
      "frontFork",
      "rearWheel",
      "handrim",
      "tyre",
      "axle",
      "rearWheelsBar",
      "brake",
      "accessoryAntitipp",
      "accessoryTippingHelp",
      "accessoryTransitWheels",
    ];
    const stateItems = order
      .map((key) => details[key])
      .filter((item) => item && item.title && item.value);
    if (stateItems.length) {
      return stateItems;
    }
  }
  return qsa(".wc-summary-spec-item").map((item) => ({
    title: ((qs(".wc-summary-spec-name", item) || {}).textContent || "").trim(),
    value: ((qs(".wc-summary-spec-value", item) || {}).textContent || "").trim(),
  })).filter((item) => item.title || item.value);
}

function readExportContext() {
  const context = window.WC_EXPORT_CONTEXT || {};
  const modelLabel = typeof context.getModelLabel === "function" ? context.getModelLabel() : "";
  const weightText = typeof context.getWeightText === "function" ? context.getWeightText() : "";
  const sourceModel = typeof context.getSourceModel === "function" ? context.getSourceModel() : "";
  const cardId = typeof context.getCardId === "function" ? context.getCardId() : "";
  const summaryRows = readSummaryRows();
  const configItems = readConfigItems();
  const generatedAt = new Date().toLocaleString(getLanguage() === "zh-CN" ? "zh-CN" : "en-GB");
  return {
    language: getLanguage(),
    modelLabel,
    weightText,
    sourceModel: sourceModel || cardId || "S5",
    cardId: cardId || sourceModel || "S5",
    summaryRows,
    configItems,
    generatedAt,
  };
}

function findSummaryValue(rows, patterns) {
  const hit = rows.find((row) => {
    const label = (row.label || "").toLowerCase();
    return patterns.some((pattern) => label.indexOf(pattern) >= 0);
  });
  return hit ? hit.value : "";
}

function rgbToHex(value) {
  if (!value) {
    return "";
  }
  if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(value)) {
    if (value.length === 4) {
      return "#" + value.slice(1).split("").map((char) => char + char).join("");
    }
    return value;
  }
  const match = value.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/i);
  if (!match) {
    return "";
  }
  return (
    "#" +
    [match[1], match[2], match[3]]
      .map((part) => Number(part).toString(16).padStart(2, "0"))
      .join("")
  );
}

function getFrameColorHex() {
  const group = qsa(".option-group").find((item) => {
    const code = ((qs(".option-code", item) || {}).textContent || "").trim();
    return code === "frameColor";
  });
  if (!group) {
    return DEFAULT_FRAME_COLOR;
  }
  const activeButton = qs(".choice-btn.active", group);
  const swatch = activeButton && qs(".chip-swatch", activeButton);
  const color = swatch ? getComputedStyle(swatch).backgroundColor : "";
  return rgbToHex(color) || DEFAULT_FRAME_COLOR;
}

function getModelParts(sourceModel) {
  if ((sourceModel || "").toUpperCase() === "S5") {
    return S5_PARTS;
  }
  return [
    { src: `/models/${sourceModel}/${sourceModel}.glb`, tint: false },
    { src: `/models/${sourceModel}/frame.glb`, tint: true },
  ];
}

function ensureJsPdf() {
  if (window.jspdf && window.jspdf.jsPDF) {
    return Promise.resolve(window.jspdf.jsPDF);
  }
  if (jspdfLoader) {
    return jspdfLoader;
  }
  jspdfLoader = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "/assets/vendor/jspdf.umd.min.js";
    script.onload = () => {
      if (window.jspdf && window.jspdf.jsPDF) {
        resolve(window.jspdf.jsPDF);
        return;
      }
      reject(new Error("jsPDF UMD bundle did not expose window.jspdf.jsPDF"));
    };
    script.onerror = () => {
      reject(new Error("Failed to load jsPDF UMD bundle"));
    };
    document.head.appendChild(script);
  });
  return jspdfLoader;
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

function loadObject(src) {
  return new Promise((resolve, reject) => {
    const loader = createLoader();
    const timeoutId = window.setTimeout(() => {
      reject(new Error(`GLB load timeout: ${src}`));
    }, 60000);
    loader.load(
      src,
      (gltf) => {
        window.clearTimeout(timeoutId);
        resolve(gltf.scene);
      },
      undefined,
      (error) => {
        window.clearTimeout(timeoutId);
        reject(error);
      }
    );
  });
}

function disposeObject(object) {
  object.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      child.geometry.dispose();
      if (Array.isArray(child.material)) {
        child.material.forEach((material) => material.dispose());
      } else if (child.material) {
        child.material.dispose();
      }
    }
  });
}

function tintFrame(target, colorHex) {
  const color = new THREE.Color(colorHex || DEFAULT_FRAME_COLOR);
  target.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      child.material = new THREE.MeshStandardMaterial({
        color,
        metalness: 0.15,
        roughness: 0.55,
        side: THREE.DoubleSide,
      });
    }
  });
}

function normalizeToGround(group) {
  const initialBox = new THREE.Box3().setFromObject(group);
  const center = initialBox.getCenter(new THREE.Vector3());
  group.position.sub(center);
  const liftedBox = new THREE.Box3().setFromObject(group);
  const minY = liftedBox.min.y;
  if (Number.isFinite(minY)) {
    group.position.y -= minY;
  }
  group.updateMatrixWorld(true);
  const finalBox = new THREE.Box3().setFromObject(group);
  return {
    box: finalBox,
    size: finalBox.getSize(new THREE.Vector3()),
  };
}

async function buildCompositeModel(sourceModel, frameColor) {
  const group = new THREE.Group();
  const parts = getModelParts(sourceModel);
  for (const part of parts) {
    const object = await loadObject(part.src);
    if (part.tint) {
      tintFrame(object, frameColor);
    }
    group.add(object);
  }
  return group;
}

function createRenderScene(group, size) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xffffff);

  const ambient = new THREE.AmbientLight(0xffffff, 1.2);
  scene.add(ambient);

  const hemi = new THREE.HemisphereLight(0xffffff, 0xe7eef9, 0.95);
  scene.add(hemi);

  const key = new THREE.DirectionalLight(0xffffff, 1.1);
  key.position.set(5, 8, 6);
  scene.add(key);

  const fill = new THREE.DirectionalLight(0xffffff, 0.45);
  fill.position.set(-5, 4, -4);
  scene.add(fill);

  const floor = new THREE.Mesh(
    new THREE.CircleGeometry(Math.max(size.x, size.z) * 0.72 + 0.08, 64),
    new THREE.MeshBasicMaterial({
      color: 0x0f172a,
      transparent: true,
      opacity: 0.06,
      depthWrite: false,
    })
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = 0.01;
  scene.add(floor);

  scene.add(group);
  return { scene, floor, lights: [ambient, hemi, key, fill] };
}

function createOrthoCamera(size, aspect, axis) {
  const maxDim = Math.max(size.x, size.y, size.z) || 1;
  const targetY = size.y * 0.44;
  const frameHeight = Math.max(size.y * 1.18, size.x * 0.95, size.z * 0.95, maxDim * 0.9);
  const halfHeight = frameHeight / 2;
  const halfWidth = halfHeight * aspect;
  const camera = new THREE.OrthographicCamera(-halfWidth, halfWidth, halfHeight, -halfHeight, 0.1, maxDim * 12);
  const distance = maxDim * 4;
  if (axis === "x") {
    camera.position.set(distance, targetY, 0);
  } else {
    camera.position.set(0, targetY, distance);
  }
  camera.lookAt(0, targetY, 0);
  camera.updateProjectionMatrix();
  return camera;
}

function createPerspectiveCamera(size, frontAxis) {
  const maxDim = Math.max(size.x, size.y, size.z) || 1;
  const targetY = size.y * 0.4;
  const camera = new THREE.PerspectiveCamera(26, 1, 0.1, maxDim * 20);
  const distance = maxDim * 2.3;
  if (frontAxis === "x") {
    camera.position.set(distance * 0.88, maxDim * 1.15, distance * 0.96);
  } else {
    camera.position.set(distance * 0.96, maxDim * 1.15, distance * 0.88);
  }
  camera.lookAt(0, targetY, 0);
  camera.updateProjectionMatrix();
  return camera;
}

function captureRenderer(renderer) {
  return renderer.domElement.toDataURL("image/png");
}

async function renderModelViews(sourceModel, frameColor) {
  const group = await buildCompositeModel(sourceModel, frameColor);
  const { size } = normalizeToGround(group);
  const { scene } = createRenderScene(group, size);
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: false,
    preserveDrawingBuffer: true,
    powerPreference: "high-performance",
  });
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.setPixelRatio(1);
  renderer.setSize(900, 700, false);

  const frontAxis = size.x >= size.z ? "x" : "z";
  const sideAxis = frontAxis === "x" ? "z" : "x";
  const aspect = 900 / 700;
  const views = [];

  const frontCamera = createOrthoCamera(size, aspect, frontAxis);
  renderer.render(scene, frontCamera);
  views.push({ title: t("frontView"), src: captureRenderer(renderer) });

  const sideCamera = createOrthoCamera(size, aspect, sideAxis);
  renderer.render(scene, sideCamera);
  views.push({ title: t("sideView"), src: captureRenderer(renderer) });

  const isoCamera = createPerspectiveCamera(size, frontAxis);
  renderer.render(scene, isoCamera);
  views.push({ title: t("isoView"), src: captureRenderer(renderer) });

  renderer.dispose();
  if (typeof renderer.forceContextLoss === "function") {
    renderer.forceContextLoss();
  }
  disposeObject(group);
  return views;
}

function waitForImages(root) {
  const images = qsa("img", root);
  return Promise.all(
    images.map((img) => {
      if (img.complete) {
        return Promise.resolve();
      }
      return new Promise((resolve) => {
        img.addEventListener("load", resolve, { once: true });
        img.addEventListener("error", resolve, { once: true });
      });
    })
  );
}

function buildSheetMarkup(context, views) {
  const summaryRows = context.summaryRows;
  const configItems = context.configItems;
  const finalModel = findSummaryValue(summaryRows, ["型号", "model"]);
  const leadTime = findSummaryValue(summaryRows, ["交货期", "lead"]);
  const weightText = context.weightText || findSummaryValue(summaryRows, ["重量", "weight"]);
  const overviewItems = [
    { label: t("model"), value: context.modelLabel || context.cardId || context.sourceModel },
    { label: t("finalModel"), value: finalModel || context.cardId || context.sourceModel },
    { label: t("leadTime"), value: leadTime || "—" },
    { label: t("weight"), value: weightText || "—" },
    { label: t("generated"), value: context.generatedAt },
  ].filter((item) => item.value);

  return (
    '<style>' +
    ".wc-pdf-sheet,*{box-sizing:border-box;}" +
    ".wc-pdf-sheet{width:860px;padding:36px 40px 40px;background:#ffffff;color:#0f172a;font:14px/1.5 'Segoe UI',Arial,'PingFang SC','Microsoft YaHei',sans-serif;}" +
    ".wc-pdf-title{font-size:28px;font-weight:800;letter-spacing:.02em;margin:0 0 6px;}" +
    ".wc-pdf-subtitle{font-size:13px;color:#475569;margin:0 0 18px;}" +
    ".wc-pdf-overview{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:10px;margin-bottom:22px;}" +
    ".wc-pdf-overview-card{border:1px solid #d9e2ef;border-radius:14px;padding:12px 14px;background:#f8fbff;min-height:72px;}" +
    ".wc-pdf-overview-label{font-size:11px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:#64748b;margin-bottom:6px;}" +
    ".wc-pdf-overview-value{font-size:14px;font-weight:700;word-break:break-word;}" +
    ".wc-pdf-view-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px;margin-bottom:24px;}" +
    ".wc-pdf-view-card{border:1px solid #d9e2ef;border-radius:18px;padding:12px;background:linear-gradient(180deg,#fbfdff 0%,#f3f7fd 100%);}" +
    ".wc-pdf-view-label{font-size:12px;font-weight:800;letter-spacing:.04em;text-transform:uppercase;color:#274169;margin-bottom:10px;}" +
    ".wc-pdf-view-frame{height:200px;border-radius:14px;background:#ffffff;border:1px solid #e3ebf6;display:flex;align-items:center;justify-content:center;overflow:hidden;}" +
    ".wc-pdf-view-frame img{width:100%;height:100%;object-fit:contain;display:block;}" +
    ".wc-pdf-sections{display:grid;grid-template-columns:minmax(0,1.35fr) minmax(0,.9fr);gap:18px;align-items:start;}" +
    ".wc-pdf-section{border:1px solid #d9e2ef;border-radius:18px;padding:16px 18px;background:#ffffff;}" +
    ".wc-pdf-section-title{font-size:16px;font-weight:800;margin:0 0 14px;color:#0f172a;}" +
    ".wc-pdf-config-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px 12px;}" +
    ".wc-pdf-config-item{padding:10px 12px;border-radius:14px;background:#f8fbff;border:1px solid #e6edf8;}" +
    ".wc-pdf-config-name{font-size:11px;font-weight:700;color:#64748b;letter-spacing:.04em;text-transform:uppercase;margin-bottom:4px;}" +
    ".wc-pdf-config-value{font-size:13px;font-weight:700;word-break:break-word;}" +
    ".wc-pdf-empty{padding:16px;border-radius:14px;background:#f8fbff;border:1px dashed #c7d4e6;color:#64748b;}" +
    ".wc-pdf-summary-table{width:100%;border-collapse:collapse;}" +
    ".wc-pdf-summary-table td{padding:8px 0;border-bottom:1px solid #e8eef7;vertical-align:top;}" +
    ".wc-pdf-summary-table td:first-child{font-weight:700;color:#475569;padding-right:14px;}" +
    ".wc-pdf-summary-table td:last-child{text-align:right;font-weight:700;}" +
    ".wc-pdf-summary-table tr:last-child td{border-bottom:none;font-size:15px;color:#0f172a;}" +
    "</style>" +
    '<div class="wc-pdf-sheet">' +
    '<div class="wc-pdf-title">' + escapeHtml(t("title")) + "</div>" +
    '<div class="wc-pdf-subtitle">' + escapeHtml(t("subtitle")) + "</div>" +
    '<div class="wc-pdf-overview">' +
    overviewItems
      .map((item) => {
        return (
          '<div class="wc-pdf-overview-card">' +
          '<div class="wc-pdf-overview-label">' + escapeHtml(item.label) + "</div>" +
          '<div class="wc-pdf-overview-value">' + escapeHtml(item.value) + "</div>" +
          "</div>"
        );
      })
      .join("") +
    "</div>" +
    '<div class="wc-pdf-view-grid">' +
    views
      .map((view) => {
        return (
          '<div class="wc-pdf-view-card">' +
          '<div class="wc-pdf-view-label">' + escapeHtml(view.title) + "</div>" +
          '<div class="wc-pdf-view-frame"><img src="' + view.src + '" alt="' + escapeHtml(view.title) + '" /></div>' +
          "</div>"
        );
      })
      .join("") +
    "</div>" +
    '<div class="wc-pdf-sections">' +
    '<section class="wc-pdf-section">' +
    '<h2 class="wc-pdf-section-title">' + escapeHtml(t("selections")) + "</h2>" +
    (
      configItems.length
        ? '<div class="wc-pdf-config-grid">' +
          configItems
            .map((item) => {
              return (
                '<div class="wc-pdf-config-item">' +
                '<div class="wc-pdf-config-name">' + escapeHtml(item.title) + "</div>" +
                '<div class="wc-pdf-config-value">' + escapeHtml(item.value) + "</div>" +
                "</div>"
              );
            })
            .join("") +
          "</div>"
        : '<div class="wc-pdf-empty">' + escapeHtml(t("noSelections")) + "</div>"
    ) +
    "</section>" +
    '<section class="wc-pdf-section">' +
    '<h2 class="wc-pdf-section-title">' + escapeHtml(t("pricing")) + "</h2>" +
    '<table class="wc-pdf-summary-table"><tbody>' +
    summaryRows
      .map((row) => {
        return (
          "<tr>" +
          "<td>" + escapeHtml(row.label) + "</td>" +
          "<td>" + escapeHtml(row.value) + "</td>" +
          "</tr>"
        );
      })
      .join("") +
    "</tbody></table>" +
    "</section>" +
    "</div>" +
    "</div>"
  );
}

async function renderSheetCanvas(context, views) {
  const mount = document.createElement("div");
  mount.style.position = "fixed";
  mount.style.left = "-100000px";
  mount.style.top = "0";
  mount.style.zIndex = "-1";
  mount.style.pointerEvents = "none";
  mount.innerHTML = buildSheetMarkup(context, views);
  document.body.appendChild(mount);

  try {
    await waitForImages(mount);
    return await html2canvas(qs(".wc-pdf-sheet", mount), {
      backgroundColor: "#ffffff",
      scale: 2,
      useCORS: true,
      logging: false,
      imageTimeout: 30000,
    });
  } finally {
    mount.remove();
  }
}

async function exportCanvasToPdf(canvas, filename) {
  const JsPdf = await ensureJsPdf();
  const pdf = new JsPdf({
    orientation: "p",
    unit: "pt",
    format: "a4",
    compress: true,
  });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 24;
  const targetWidth = pageWidth - margin * 2;
  const targetHeight = pageHeight - margin * 2;
  const sliceHeight = Math.floor((targetHeight / targetWidth) * canvas.width);
  let offsetY = 0;
  let page = 0;

  while (offsetY < canvas.height) {
    if (page > 0) {
      pdf.addPage();
    }
    const currentSliceHeight = Math.min(sliceHeight, canvas.height - offsetY);
    const sliceCanvas = document.createElement("canvas");
    sliceCanvas.width = canvas.width;
    sliceCanvas.height = currentSliceHeight;
    const context = sliceCanvas.getContext("2d");
    context.drawImage(
      canvas,
      0,
      offsetY,
      canvas.width,
      currentSliceHeight,
      0,
      0,
      canvas.width,
      currentSliceHeight
    );
    const renderHeight = (currentSliceHeight * targetWidth) / canvas.width;
    pdf.addImage(sliceCanvas.toDataURL("image/jpeg", 0.94), "JPEG", margin, margin, targetWidth, renderHeight, undefined, "FAST");
    offsetY += currentSliceHeight;
    page += 1;
  }

  pdf.save(filename);
}

async function generatePdf() {
  const context = readExportContext();
  const views = await renderModelViews(context.sourceModel, getFrameColorHex());
  const canvas = await renderSheetCanvas(context, views);
  const filename = `wheelchair-config-${slugify(context.cardId || context.sourceModel)}.pdf`;
  await exportCanvasToPdf(canvas, filename);
}

function setBusy(button, busy) {
  if (!button) {
    return;
  }
  if (busy) {
    button.dataset.wcPdfOriginalHtml = button.innerHTML;
    button.disabled = true;
    button.textContent = t("exporting");
    return;
  }
  if (button.dataset.wcPdfOriginalHtml) {
    button.innerHTML = button.dataset.wcPdfOriginalHtml;
    delete button.dataset.wcPdfOriginalHtml;
  }
  button.disabled = false;
}

document.addEventListener(
  "click",
  async (event) => {
    const button = event.target && event.target.closest ? event.target.closest("button") : null;
    if (!isExportButton(button)) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();

    if (exportInFlight) {
      return;
    }

    exportInFlight = true;
    setBusy(button, true);

    try {
      await generatePdf();
    } catch (error) {
      console.error("Custom PDF export failed", error);
      window.alert(t("exportFailed"));
    } finally {
      setBusy(button, false);
      exportInFlight = false;
    }
  },
  true
);

window.WC_PDF_EXPORT = {
  export: generatePdf,
};
