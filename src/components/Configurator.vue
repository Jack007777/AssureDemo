<script setup lang="ts">
import { computed, ref } from "vue";
import { useConfigStore } from "../stores/config";
import { formatMoney } from "../lib/pricing";
import { exportConfigPdf } from "../lib/pdf";
import ModelViewer from "./ModelViewer.vue";

const store = useConfigStore();
const props = defineProps<{
  isLoggedIn: boolean;
}>();
const modelSrc = computed(() => `/models/${store.modelId}/${store.modelId}.glb`);
const frameSrc = computed(() => `/models/${store.modelId}/frame.glb`);
const frameOffsetMap: Record<string, { x: number; y: number; z: number }> = {
  S5: { x: 0, y: 0, z: 0 },
  S2: { x: 0, y: 0, z: 0 }
};
const frameOffset = computed(() => frameOffsetMap[store.modelId] ?? { x: 0, y: 0, z: 0 });
const orderQuantity = ref(1);

const model = computed(() => store.model);
const modules = computed(() => {
  if (!model.value) return [];
  const moduleMap = new Map(store.catalog.modules.map(m => [m.id, m]));
  return model.value.modules.map(id => moduleMap.get(id)).filter(Boolean);
});
const categories = [
  {
    id: "frame",
    label: "车架",
    modules: [
      "frameMaterial",
      "frameColor",
      "frameAngle",
      "frameLength",
      "lateralFrame",
      "rearWheelsBar"
    ]
  },
  {
    id: "seating",
    label: "座椅",
    modules: ["seatWidth", "seatDepth", "backrestHeight", "backrestTube", "backrestHandles", "seatSetting"]
  },
  {
    id: "wheels",
    label: "轮子",
    modules: ["frontWheel", "frontFork", "rearWheel", "handrim", "tyre", "brake", "axle"]
  },
  {
    id: "footrest",
    label: "踏板",
    modules: ["legLength", "footrestSetting", "skirtGuards"]
  },
  {
    id: "accessories",
    label: "附件",
    modules: ["accessoryAntitipp", "accessoryTippingHelp", "accessoryTransitWheels"]
  }
];
const activeCategory = ref("frame");
const modulesByCategory = computed(() => {
  const category = categories.find(c => c.id === activeCategory.value) ?? categories[0];
  const moduleMap = new Map(modules.value.map(m => [m.id, m]));
  return category.modules.map(id => moduleMap.get(id)).filter(Boolean);
});
const leadTime = computed(() => model.value?.leadTime ?? "—");
const optionCodeMap: Record<string, string> = {
  "sw-36": "36",
  "sw-39": "39",
  "sw-42": "42",
  "sw-45": "45",
  "sw-48": "48",
  "sd-37-5": "375",
  "sd-40": "40",
  "sd-42-5": "425",
  "sd-45": "45",
  "sd-47-5": "475",
  "fa-100": "A100",
  "fa-90": "A90",
  "fl-std": "STD",
  "fl-long": "LONG",
  "rw-22-12": "22-12",
  "rw-22-18": "22-18",
  "rw-24-12": "24-12",
  "rw-24-18": "24-18",
  "rw-24-big": "24-BIG",
  "rw-24-carbon": "24-CF"
};
const finalModelCode = computed(() => {
  const parts: string[] = [];
  const order = ["seatWidth", "seatDepth", "frameAngle", "frameLength", "rearWheel"];
  for (const moduleId of order) {
    const optId = store.selection[moduleId];
    if (!optId) continue;
    parts.push(optionCodeMap[optId] ?? optId.toUpperCase());
  }
  return [store.modelId, ...parts].join("-");
});
const frameColorMap: Record<string, string> = {
  "color-red": "#ff3b30",
  "color-green": "#34c759",
  "color-yellow": "#ffd60a",
  "color-blue": "#0a84ff"
};
const frameColorHex = computed(() => frameColorMap[store.selection.frameColor] ?? "#9aa6bd");
const frameColorLabel = computed(() => {
  const mod = modules.value.find(item => item?.id === "frameColor");
  const opt = mod?.options.find(option => option.id === store.selection.frameColor);
  return opt?.label ?? "请选择...";
});
const frameColorOpen = ref(false);

function onExportPdf() {
  exportConfigPdf({
    catalog: store.catalog,
    pricing: store.pricing,
    modelId: store.modelId,
    selection: store.selection,
    discountProfileId: store.discountProfileId
  });
}

</script>

<template>
  <div class="grid grid-2">
    <!-- Left: options -->
    <div class="card">
      <div class="section-title">轮椅系列</div>
      <select class="select" v-model="store.modelId" @change="store.setModel(store.modelId)">
        <option v-for="m in store.catalog.models" :key="m.id" :value="m.id">{{ m.name }}</option>
      </select>
      <div style="height: 12px;"></div>
      <div class="section-title">3D Preview</div>
      <ModelViewer :base-src="modelSrc" :frame-src="frameSrc" :frame-color="frameColorHex" :frame-offset="frameOffset" />
      <div style="height: 16px;"></div>

      <div class="section-title">Categories</div>
      <div class="category-grid">
        <button
          v-for="cat in categories"
          :key="cat.id"
          type="button"
          class="category-btn"
          :class="{ active: activeCategory === cat.id }"
          @click="activeCategory = cat.id"
        >
          <span class="category-icon">
            <svg v-if="cat.id === 'frame'" viewBox="0 0 24 24" aria-hidden="true">
              <rect x="4" y="7" width="16" height="10" rx="2" />
              <path d="M6 17l3-3h6l3 3" fill="none" stroke="currentColor" stroke-width="2" />
            </svg>
            <svg v-else-if="cat.id === 'seating'" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M7 6h7a3 3 0 0 1 3 3v3h-4v-2H7v7H4V9a3 3 0 0 1 3-3z" />
            </svg>
            <svg v-else-if="cat.id === 'wheels'" viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" stroke-width="2" />
              <circle cx="12" cy="12" r="2" />
            </svg>
            <svg v-else-if="cat.id === 'footrest'" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M6 5h4v9h8v3H6z" />
            </svg>
            <svg v-else viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 3l2.2 4.6L19 8l-3.5 3.4.9 4.9-4.4-2.4-4.4 2.4.9-4.9L5 8l4.8-.4z" />
            </svg>
          </span>
          <span>{{ cat.label }}</span>
        </button>
      </div>
      <div style="height: 12px;"></div>
      <div class="row" style="justify-content: space-between; gap: 12px;">
        <div>
          <div class="h1" style="margin-bottom: 6px;">配置</div>
          <div class="muted">切换选项会实时校验规则并更新价格</div>
        </div>
        <div class="row">
          <select class="select" style="width: 220px;" v-model="store.discountProfileId">
            <option v-for="d in store.pricing.pricing.discountProfiles" :key="d.id" :value="d.id">
              {{ d.name }}
            </option>
          </select>
        </div>
      </div>

      <div style="height: 10px;"></div>

      <div v-for="mod in modulesByCategory" :key="mod!.id" style="margin-bottom: 14px;">
        <div class="row" style="justify-content: space-between;">
          <div style="font-weight: 600;">{{ mod!.name }}</div>
          <div class="muted">{{ mod!.id }}</div>
        </div>
        <div v-if="mod!.id === 'frameColor'" class="color-dropdown">
          <button type="button" class="select color-toggle" @click="frameColorOpen = !frameColorOpen">
            <span class="color-toggle-text">{{ frameColorLabel }}</span>
            <span class="chip-swatch" :style="{ backgroundColor: frameColorHex }"></span>
            <span class="color-caret">▾</span>
          </button>
          <div v-if="frameColorOpen" class="color-menu">
            <button
              v-for="opt in mod!.options"
              :key="opt.id"
              type="button"
              class="color-option"
              @click="store.setOption(mod!.id, opt.id); frameColorOpen = false;"
            >
              <span class="color-option-text">{{ opt.label }}</span>
              <span class="chip-swatch" :style="{ backgroundColor: frameColorMap[opt.id] || '#9aa6bd' }"></span>
            </button>
          </div>
        </div>
        <select v-else class="select" :value="store.selection[mod!.id] || ''"
                @change="store.setOption(mod!.id, ($event.target as HTMLSelectElement).value)">
          <option value="" disabled>请选择…</option>
          <option v-for="opt in mod!.options" :key="opt.id" :value="opt.id">
            {{ opt.label }}  ({{ opt.priceDelta >= 0 ? "+" : "" }}{{ formatMoney(opt.priceDelta, store.pricing.pricing.currency) }})
          </option>
        </select>
      </div>

      <div v-if="store.issues.length" class="warn">
        <div style="font-weight: 700; margin-bottom: 6px;">规则提示</div>
        <ul style="margin: 0; padding-left: 18px;">
          <li v-for="i in store.issues" :key="i.ruleId">{{ i.message }}</li>
        </ul>
      </div>
      <div v-else class="ok">
        当前配置无冲突 ✅
      </div>
    </div>

    <!-- Right: summary -->
    <div class="card">
      <div class="h1" style="margin-bottom: 6px;">汇总与报价</div>

      <div style="height: 10px;"></div>

      <table class="table">
        <tbody>

          <tr>
            <td>交货期</td>
            <td>{{ leadTime }}</td>
          </tr>
          <tr>
            <td>型号</td>
            <td>{{ finalModelCode }}</td>
          </tr>
          <tr>
            <td>基础价</td>
            <td>{{ formatMoney(store.price.base, store.price.currency) }}</td>
          </tr>
          <tr>
            <td>选配加价</td>
            <td>{{ formatMoney(store.price.options, store.price.currency) }}</td>
          </tr>
          <tr>
            <td>小计</td>
            <td>{{ formatMoney(store.price.subtotal, store.price.currency) }}</td>
          </tr>
          <tr>
            <td>折扣</td>
            <td>- {{ formatMoney(store.price.discount, store.price.currency) }}</td>
          </tr>
          <tr>
            <td>未税</td>
            <td>{{ formatMoney(store.price.net, store.price.currency) }}</td>
          </tr>
          <tr>
            <td>VAT</td>
            <td>{{ formatMoney(store.price.vat, store.price.currency) }}</td>
          </tr>
          <tr>
            <td style="font-weight:800;">总价</td>
            <td style="font-weight:800;">{{ formatMoney(store.price.total, store.price.currency) }}</td>
          </tr>
        </tbody>
      </table>

      <div style="height: 14px;"></div>

      <div class="row">
        <button class="btn" :disabled="!store.isValid" @click="onExportPdf">导出配置单 PDF</button>
        <button class="btn secondary" @click="store.selection = {}">清空选择</button>
      </div>

      <div style="height: 16px;"></div>

      <div class="row" style="justify-content: space-between; align-items: center;">
        <label class="muted" for="order-qty">数量</label>
        <input id="order-qty" class="input" type="number" min="1" v-model.number="orderQuantity" />
      </div>

      <div style="height: 10px;"></div>

      <button class="btn" :disabled="!props.isLoggedIn">下单</button>

      <div style="height: 12px;"></div>
    </div>
  </div>
</template>
