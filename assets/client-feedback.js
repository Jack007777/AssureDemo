(function () {
  const MODEL_CARDS = [
    {
      id: "S2",
      sourceModel: "S2",
      accent: "#c99b45",
      texts: {
        "zh-CN": {
          badge: "轻量通用",
          name: "S2 车型",
          blurb: "适合日常高频使用，结构直接，维护成本更可控，便于快速进入标准化选配流程。",
          points: ["轻量化日常用车", "核心配置清晰", "适合常规交付与复购"],
        },
        "en-US": {
          badge: "Everyday Active",
          name: "S2 Model",
          blurb: "Built for everyday use with a straightforward structure, fast specification flow, and reliable repeat ordering.",
          points: ["Balanced daily-use platform", "Clear standard option set", "Suitable for routine delivery"],
        },
      },
    },
    {
      id: "S2D",
      sourceModel: "S2",
      accent: "#d7ac5b",
      texts: {
        "zh-CN": {
          badge: "舒适导向",
          name: "S2D 车型",
          blurb: "强调乘坐舒适和稳定体验，便于客户先根据使用场景判断需求，再进入细项配置。",
          points: ["更偏舒适取向", "适合稳态日常使用", "便于和 S2 做场景比较"],
        },
        "en-US": {
          badge: "Comfort Focus",
          name: "S2D Model",
          blurb: "Positioned around comfort and stability so customers can compare use cases first, then continue with detailed configuration.",
          points: ["Comfort-oriented variant", "Stable everyday positioning", "Easy side-by-side comparison with S2"],
        },
      },
    },
    {
      id: "S5",
      sourceModel: "S5",
      accent: "#f3c96b",
      texts: {
        "zh-CN": {
          badge: "高阶轻量",
          name: "S5 车型",
          blurb: "更偏性能与轻量化表达，适合先展示产品卖点，再进入高阶零部件和姿态参数的组合选择。",
          points: ["高阶轻量平台", "适合强调性能卖点", "便于展示细分零部件差异"],
        },
        "en-US": {
          badge: "Performance Light",
          name: "S5 Model",
          blurb: "Built around lightweight performance, making it easier to present premium selling points before detailed component selection.",
          points: ["Premium lightweight platform", "Performance-first positioning", "Better for advanced component comparison"],
        },
      },
    },
  ];

  const UI_TEXT = {
    "zh-CN": {
      stageKicker: "车型选择",
      stageTitle: "选择适合您的车型",
      stageCopy: "根据使用场景与核心需求选择车型，进入后可查看 3D 效果并完成详细配置。",
      stageEnter: "进入该车型",
      toolbarEyebrow: "当前车型",
      switchModel: "切换车型",
      summaryLabel: "当前总金额",
      summaryButton: "查看明细",
      summaryClose: "收起",
      desktopQuoteOpen: "展开报价",
      desktopQuoteClose: "收起报价",
      weightLabel: "总重量",
      weightSuffix: "kg",
      weightMeta: "总重量",
      summarySpecTitle: "当前配置",
      summarySpecEmpty: "暂无有效配置选项",
    },
    "en-US": {
      stageKicker: "Model Selection",
      stageTitle: "Choose the model that fits your needs",
      stageCopy: "Start with the model that best matches the intended use, then continue to the 3D view and detailed configuration.",
      stageEnter: "Configure this model",
      toolbarEyebrow: "Current Model",
      switchModel: "Switch model",
      summaryLabel: "Current Total",
      summaryButton: "Details",
      summaryClose: "Close",
      desktopQuoteOpen: "Show quote",
      desktopQuoteClose: "Hide quote",
      weightLabel: "Total Weight",
      weightSuffix: "kg",
      weightMeta: "Total weight",
      summarySpecTitle: "Current Configuration",
      summarySpecEmpty: "No active configuration items",
    },
  };

  const LANGUAGE_OPTIONS = [
    { value: "zh-CN", label: "中文" },
    { value: "en-US", label: "English" },
  ];

  const CLEAN_CARD_COPY = {
    S2: {
      "zh-CN": {
        badge: "\u65e5\u5e38\u6807\u51c6",
        name: "S2 \u8f66\u578b",
        blurb: "\u9002\u5408\u65e5\u5e38\u4f7f\u7528\uff0c\u914d\u7f6e\u6e05\u6670\uff0c\u4fbf\u4e8e\u5feb\u901f\u5b8c\u6210\u6807\u51c6\u9009\u914d\u3002",
        points: ["\u65e5\u5e38\u8f7b\u91cf\u8f66\u578b", "\u914d\u7f6e\u7ed3\u6784\u6e05\u6670", "\u9002\u5408\u6807\u51c6\u4ea4\u4ed8"],
      },
      "en-US": {
        badge: "Daily Standard",
        blurb: "Designed for daily use with a clear option structure and a straightforward configuration flow.",
        points: ["Lightweight daily-use model", "Clear option structure", "Suitable for standard delivery"],
      },
    },
    S2D: {
      "zh-CN": {
        badge: "\u8212\u9002\u52a0\u5f3a",
        name: "S2D \u8f66\u578b",
        blurb: "\u517c\u987e\u7a33\u5b9a\u4e0e\u8212\u9002\uff0c\u9002\u5408\u66f4\u6ce8\u91cd\u4e58\u5750\u4f53\u9a8c\u7684\u7528\u6237\u3002",
        points: ["\u8212\u9002\u53d6\u5411", "\u7a33\u5b9a\u6027\u66f4\u5f3a", "\u9002\u5408\u65e5\u5e38\u957f\u65f6\u95f4\u4f7f\u7528"],
      },
      "en-US": {
        badge: "Comfort Plus",
        blurb: "Built around comfort and stability for users who need more support in everyday use.",
        points: ["Comfort-oriented variant", "Greater day-to-day stability", "Suitable for longer daily use"],
      },
    },
    S5: {
      "zh-CN": {
        badge: "\u9ad8\u6027\u80fd\u8f7b\u91cf",
        name: "S5 \u8f66\u578b",
        blurb: "\u9002\u5408\u8ffd\u6c42\u8f7b\u91cf\u4e0e\u6027\u80fd\u8868\u73b0\u7684\u7528\u6237\uff0c\u53ef\u8fdb\u884c\u66f4\u4e30\u5bcc\u7684\u8fdb\u9636\u9009\u914d\u3002",
        points: ["\u9ad8\u6027\u80fd\u8f7b\u91cf\u8f66\u67b6", "\u9002\u5408\u8fdb\u9636\u9009\u914d", "\u90e8\u4ef6\u9009\u62e9\u66f4\u4e30\u5bcc"],
      },
      "en-US": {
        blurb: "Built for users who prioritize lightweight performance and a broader range of advanced options.",
        points: ["High-performance lightweight frame", "Suitable for advanced options", "Broader component selection"],
      },
    },
  };

  const CLEAN_UI_COPY = {
    "zh-CN": {
      stageKicker: "\u8f66\u578b\u9009\u62e9",
      stageTitle: "\u9009\u62e9\u9002\u5408\u60a8\u7684\u8f66\u578b",
      stageCopy: "\u6839\u636e\u4f7f\u7528\u573a\u666f\u4e0e\u6838\u5fc3\u9700\u6c42\u9009\u62e9\u8f66\u578b\uff0c\u8fdb\u5165\u540e\u53ef\u67e5\u770b 3D \u6548\u679c\u5e76\u5b8c\u6210\u8be6\u7ec6\u914d\u7f6e\u3002",
      stageEnter: "\u67e5\u770b\u8f66\u578b\u914d\u7f6e",
      toolbarEyebrow: "\u6240\u9009\u8f66\u578b",
      switchModel: "\u66f4\u6362\u8f66\u578b",
      summaryLabel: "\u603b\u91d1\u989d",
      summaryButton: "\u8ba2\u5355\u660e\u7ec6",
      summaryClose: "\u6536\u8d77\u660e\u7ec6",
      desktopQuoteOpen: "\u5c55\u5f00\u62a5\u4ef7",
      desktopQuoteClose: "\u6536\u8d77\u62a5\u4ef7",
      viewerMinimize: "\u6536\u8d77 3D",
      viewerRestore: "\u5c55\u5f00 3D",
      weightLabel: "\u603b\u91cd\u91cf",
      weightMeta: "\u603b\u91cd\u91cf",
      summarySpecTitle: "\u5f53\u524d\u914d\u7f6e",
      summarySpecEmpty: "\u6240\u9009\u914d\u7f6e\u5c06\u5728\u6b64\u663e\u793a",
    },
    "en-US": {
      stageCopy: "Choose the model that best matches the intended use, then continue to the 3D view and detailed configuration.",
      stageEnter: "View configuration",
      toolbarEyebrow: "Selected Model",
      switchModel: "Change model",
      summaryLabel: "Total",
      summaryButton: "Order details",
      summaryClose: "Hide details",
      desktopQuoteOpen: "Show quote",
      desktopQuoteClose: "Hide quote",
      viewerMinimize: "Hide 3D",
      viewerRestore: "Show 3D",
      summarySpecEmpty: "Selected specifications will appear here",
    },
  };

  MODEL_CARDS.forEach(function (card) {
    const patch = CLEAN_CARD_COPY[card.id];
    if (!patch) {
      return;
    }
    Object.keys(patch).forEach(function (lang) {
      card.texts[lang] = Object.assign({}, card.texts[lang] || {}, patch[lang]);
    });
  });

  Object.keys(CLEAN_UI_COPY).forEach(function (lang) {
    UI_TEXT[lang] = Object.assign({}, UI_TEXT[lang] || {}, CLEAN_UI_COPY[lang]);
  });

  const CATEGORY_LABELS = {
    "zh-CN": [
      "车架",
      "座椅布面",
      "靠背",
      "侧板和扶手",
      "脚踏板",
      "前轮",
      "后轮",
      "刹车",
      "F55 / 车架附件",
    ],
    "en-US": [
      "Frame",
      "Seat Upholstery",
      "Backrest",
      "Side Panels & Armrests",
      "Footrest",
      "Front Wheels",
      "Rear Wheels",
      "Brake",
      "F55 / Frame Accessories",
    ],
  };

  const WEIGHT_BASE = {
    S2: 13.4,
    S2D: 13.9,
    S5: 10.8,
  };

  const FRAME_COLOR_HEX = {
    "color-red": "#9b2731",
    "color-green": "#354a46",
    "color-pearl": "#e7d3ce",
    "color-blue": "#313c5a",
    "color-bronze": "#ba7640",
    "color-black": "#232323",
    "color-pastel-pink": "#f2c0c3",
    "color-pastel-blue": "#94a6c4",
    "color-pastel-green": "#a6b89b",
    "color-lavender-grey": "#aeabbc",
    "color-sky-blue": "#9dc3e3",
    "color-beige": "#bfae9b",
  };

  const FRAME_COLOR_SWATCH = {
    "color-red": "linear-gradient(145deg, #c96d75 0%, #9b2731 42%, #61171c 100%)",
    "color-green": "linear-gradient(145deg, #708b83 0%, #354a46 40%, #202b29 100%)",
    "color-pearl": "linear-gradient(145deg, #fff8f5 0%, #e7d3ce 48%, #bca7a2 100%)",
    "color-blue": "linear-gradient(145deg, #7582a6 0%, #313c5a 44%, #1e2640 100%)",
    "color-bronze": "linear-gradient(145deg, #d9aa77 0%, #ba7640 42%, #7d4d26 100%)",
    "color-black": "linear-gradient(145deg, #626262 0%, #232323 46%, #090909 100%)",
    "color-pastel-pink": "linear-gradient(145deg, #fff0f1 0%, #f2c0c3 52%, #cf969a 100%)",
    "color-pastel-blue": "linear-gradient(145deg, #d7e1f1 0%, #94a6c4 52%, #687c9e 100%)",
    "color-pastel-green": "linear-gradient(145deg, #dce8d6 0%, #a6b89b 52%, #788d6d 100%)",
    "color-lavender-grey": "linear-gradient(145deg, #dddbe5 0%, #aeabbc 52%, #817e91 100%)",
    "color-sky-blue": "linear-gradient(145deg, #dff2ff 0%, #9dc3e3 52%, #6898bf 100%)",
    "color-beige": "linear-gradient(145deg, #e7ded4 0%, #bfae9b 52%, #8e7d6c 100%)",
  };

  const ORDER_FORM_FRAME_COLORS = [
    { id: "color-red", label: "Deep metallic red", zh: "深金属红" },
    { id: "color-green", label: "Metallic green", zh: "金属绿" },
    { id: "color-pearl", label: "Pearl rose", zh: "珍珠玫瑰" },
    { id: "color-blue", label: "Metallic navy", zh: "金属海军蓝" },
    { id: "color-bronze", label: "Metallic bronze", zh: "金属古铜" },
    { id: "color-black", label: "Metallic black", zh: "金属黑" },
    { id: "color-pastel-pink", label: "Pastel pink", zh: "柔粉色" },
    { id: "color-pastel-blue", label: "Pastel blue", zh: "柔蓝色" },
    { id: "color-pastel-green", label: "Pastel green", zh: "柔绿色" },
    { id: "color-lavender-grey", label: "Lavender grey", zh: "薰衣草灰" },
    { id: "color-sky-blue", label: "Sky blue", zh: "天蓝色" },
    { id: "color-beige", label: "Warm beige", zh: "暖米色" },
  ];

  const ORDER_FORM_EXTRA_OPTIONS = new Set([
    "frame-magnesium", "lf-extended", "camber-4",
    "sg-carbon-straight", "sg-carbon-mudguard", "bh-folding",
    "seat-carbon", "seat-crossed", "foot-carbon", "foot-magnesium", "foot-none",
    "fw-3-alu", "fw-4-alu", "fw-5-alu", "ff-one-arm",
    "rw-22ul", "rw-24ul", "rw-24b", "hr-big-24",
    "brake-push-straight", "brake-pull-folding", "axle-tetra-stainless",
    "antitipp-left", "antitipp-right", "tiphelp-left", "tiphelp-right", "transit-pair",
  ]);

  const ORDER_FORM_ZH_LABELS = {
    "Deep metallic red": "深金属红",
    "Metallic green": "金属绿",
    "Pearl rose": "珍珠玫瑰",
    "Metallic navy": "金属海军蓝",
    "Metallic bronze": "金属古铜",
    "Metallic black": "金属黑",
    "Pastel pink": "柔粉色",
    "Pastel blue": "柔蓝色",
    "Pastel green": "柔绿色",
    "Lavender grey": "薰衣草灰",
    "Sky blue": "天蓝色",
    "Warm beige": "暖米色",
    "No backrest handles": "无推把",
  };

  const MODULE_ORDER = [
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

  const REAR_WHEEL_OPTIONS = [
    { id: "rw-22s", code: "22S", label: '22" light 18-spoke', size: 22, available: true, spokes: 18 },
    { id: "rw-24s", code: "24S", label: '24" light 18-spoke', size: 24, available: true, spokes: 18 },
    { id: "rw-22ul", code: "22UL", label: '22" ultralight 12-spoke', size: 22, available: true, spokes: 12 },
    { id: "rw-24ul", code: "24UL", label: '24" ultralight 12-spoke', size: 24, available: true, spokes: 12 },
    { id: "rw-24b", code: "24B", label: '24" large hub 12-spoke', size: 24, available: true, spokes: 12, largeHub: true },
  ];

  const HANDRIM_OPTIONS = [
    { id: "hr-al-silver-22", label: 'Aluminium anodized silver 22"', size: 22, profile: "round", finish: "silver", available: true },
    { id: "hr-al-black-22", label: 'Aluminium anodized black 22"', size: 22, profile: "round", finish: "black", available: true },
    { id: "hr-al-silver-24", label: 'Aluminium anodized silver 24"', size: 24, profile: "round", finish: "silver", available: true },
    { id: "hr-al-black-24", label: 'Aluminium anodized black 24"', size: 24, profile: "round", finish: "black", available: true },
    { id: "hr-big-24", label: 'Aluminium big ergonomic shape with rubber strip 24"', size: 24, profile: "ergonomic", finish: "rubber", available: true },
  ];

  const TYRE_OPTIONS = [
    { id: "tyre-pu", label: "PU tyre · anti-slip tread", tread: "pu", modelSizes: [22] },
    { id: "tyre-pneumatic", label: "Pneumatic tyre · smooth tread", tread: "pneumatic", modelSizes: [24] },
  ];

  // Only expose front-wheel variants that currently have verified 3D assets.
  const AVAILABLE_FRONT_WHEEL_IDS = new Set([
    "fw-3-alu",
    "fw-4-plastic",
    "fw-4-alu",
    "fw-5-plastic",
    "fw-5-alu",
  ]);

  const state = {
    cardId: "",
    sourceModel: "",
    mounted: false,
    summaryOpen: false,
    desktopSummaryOpen: false,
    viewerMinimized: false,
    applyingDefaults: false,
    defaultsAppliedKey: "",
    selectionLabels: {},
    selectionDetails: {},
    syncTimer: 0,
    categoryScrollTimers: [],
    mobileChipAlignTimers: [],
    mobilePendingCategoryIndex: -1,
    mobileCategoryTransitionDirection: "",
    mobileCategoryTransitionTimer: 0,
    mobileEdgeSwipeStartX: 0,
    mobileEdgeSwipeStartY: 0,
    mobileEdgeSwipeActive: false,
    mobileEdgeSwipeConsumed: false,
    mobileEdgeSwipeLockUntil: 0,
    boundaryWheelAmount: 0,
    boundaryWheelDirection: 0,
    boundaryWheelResetTimer: 0,
    boundarySwitchLockUntil: 0,
    boundaryTouchStartX: 0,
    boundaryTouchStartY: 0,
    boundaryTouchActive: false,
    boundaryTouchConsumed: false,
    viewerRuntime: null,
    viewerModulePromise: null,
    viewerUpdatePromise: null,
    partFocusTimer: 0,
    partFocusRequestId: 0,
    lastFocusedModuleId: "",
    applyingSeatDepthConstraint: false,
    applyingFrontForkWheelConstraint: false,
    syntheticSeatWidthMarkup: "",
    seatWidthDesktopGuardTimer: 0,
    observers: [],
  };

  function getLang() {
    const select = document.querySelector(".card.header select.select");
    const value = select && select.value;
    return UI_TEXT[value] ? value : "zh-CN";
  }

  function enforceBilingualLanguage() {
    const select = getLangSelect() || qs(".select.compact");
    if (!select) {
      return;
    }

    qsa("option", select).forEach(function (option) {
      const expected = LANGUAGE_OPTIONS.find(function (item) {
        return item.value === option.value;
      });
      if (!expected) {
        option.remove();
        return;
      }
      if (option.textContent !== expected.label) {
        option.textContent = expected.label;
      }
    });

    LANGUAGE_OPTIONS.forEach(function (item) {
      const existing = qsa("option", select).find(function (option) {
        return option.value === item.value;
      });
      if (!existing) {
        const option = document.createElement("option");
        option.value = item.value;
        option.textContent = item.label;
        select.appendChild(option);
      }
    });

    if (!UI_TEXT[select.value]) {
      dispatchNativeSelect(select, "zh-CN");
    }
  }

  function enforceCategoryLanguage() {
    const labels = CATEGORY_LABELS[getLang()] || CATEGORY_LABELS["zh-CN"];
    qsa(".category-btn").forEach(function (button, index) {
      const textNode = qsa("span", button).slice(-1)[0];
      if (textNode && labels[index] && textNode.textContent !== labels[index]) {
        textNode.textContent = labels[index];
      }
    });
  }

  function enforceBilingualUi() {
    enforceBilingualLanguage();
    enforceCategoryLanguage();
    enforceFrameLengthSeatDepthConstraint();
    enforceFrontForkWheelConstraint();
  }

  function tr(key) {
    const lang = getLang();
    return UI_TEXT[lang][key];
  }

  function translateUiText(value) {
    const raw = String(value == null ? "" : value);
    if (!raw) {
      return "";
    }
    if (getLang() === "zh-CN" && ORDER_FORM_ZH_LABELS[raw]) {
      return ORDER_FORM_ZH_LABELS[raw];
    }
    if (window.__WC_I18N && typeof window.__WC_I18N.translateText === "function") {
      return window.__WC_I18N.translateText(raw, getLang());
    }
    return raw;
  }

  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.from((root || document).querySelectorAll(selector));
  }

  function refreshRuntimeTranslations(delay) {
    const apply = function () {
      if (window.__WC_I18N && typeof window.__WC_I18N.refresh === "function") {
        window.__WC_I18N.refresh();
        return;
      }
      window.dispatchEvent(new CustomEvent("wc:refresh-i18n"));
    };

    if (delay && delay > 0) {
      window.setTimeout(apply, delay);
      return;
    }

    window.requestAnimationFrame(apply);
  }

  function heroSvg(accent) {
    return (
      '<svg viewBox="0 0 260 180" aria-hidden="true">' +
      '<defs>' +
      '<linearGradient id="wcg" x1="0%" y1="0%" x2="100%" y2="100%">' +
      '<stop offset="0%" stop-color="#ffffff" stop-opacity="0.96" />' +
      '<stop offset="100%" stop-color="#d6dce6" stop-opacity="0.68" />' +
      "</linearGradient>" +
      "</defs>" +
      '<circle cx="72" cy="115" r="52" fill="none" stroke="url(#wcg)" stroke-width="9" opacity="0.82" />' +
      '<circle cx="200" cy="132" r="16" fill="none" stroke="url(#wcg)" stroke-width="7" opacity="0.9" />' +
      '<path d="M82 66 H147 L192 81 L205 134 H180" fill="none" stroke="url(#wcg)" stroke-width="10" stroke-linecap="round" stroke-linejoin="round" />' +
      '<path d="M149 66 L173 142" fill="none" stroke="url(#wcg)" stroke-width="10" stroke-linecap="round" />' +
      '<path d="M112 83 L82 97 L137 103" fill="none" stroke="' + accent + '" stroke-width="10" stroke-linecap="round" stroke-linejoin="round" />' +
      '<path d="M72 56 V74" fill="none" stroke="url(#wcg)" stroke-width="8" stroke-linecap="round" opacity="0.78" />' +
      '<text x="54" y="34" fill="#ffffff" fill-opacity="0.88" font-size="34" font-family="Georgia, serif">1</text>' +
      "</svg>"
    );
  }

  function summaryIconSvg() {
    return (
      '<svg viewBox="0 0 20 20" aria-hidden="true">' +
      '<path d="M5.1 3.9h9.8a1.6 1.6 0 0 1 1.6 1.6v9a1.6 1.6 0 0 1-1.6 1.6H5.1a1.6 1.6 0 0 1-1.6-1.6v-9a1.6 1.6 0 0 1 1.6-1.6Z" fill="none" stroke="currentColor" stroke-width="1.5" />' +
      '<path d="M6.5 7.1h7" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />' +
      '<path d="M6.5 10.1h7" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />' +
      '<path d="M6.5 13.1h4.2" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />' +
      '<circle cx="14.3" cy="13.2" r="2.2" fill="currentColor" fill-opacity="0.14" />' +
      '<path d="M13.2 13.1l.8.8 1.5-1.8" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />' +
      "</svg>"
    );
  }

  function viewerToggleIconSvg(type) {
    if (type === "restore") {
      return (
        '<svg viewBox="0 0 20 20" aria-hidden="true">' +
        '<path d="M4.8 10.1h10.4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />' +
        '<path d="M10 4.9v10.4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />' +
        '<rect x="4.1" y="4.1" width="11.8" height="11.8" rx="3.2" fill="none" stroke="currentColor" stroke-width="1.4" opacity="0.42" />' +
        "</svg>"
      );
    }
    return (
      '<svg viewBox="0 0 20 20" aria-hidden="true">' +
      '<path d="M4.8 10.1h10.4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />' +
      '<rect x="4.1" y="4.1" width="11.8" height="11.8" rx="3.2" fill="none" stroke="currentColor" stroke-width="1.4" opacity="0.42" />' +
      "</svg>"
    );
  }

  function getCardConfig(cardId) {
    return MODEL_CARDS.find(function (card) {
      return card.id === cardId;
    }) || MODEL_CARDS[0];
  }

  function getActiveCardConfig() {
    return getCardConfig(state.cardId || "S5");
  }

  function getCardConfigBySourceModel(sourceModel) {
    return MODEL_CARDS.find(function (card) {
      return card.sourceModel === sourceModel;
    }) || getCardConfig(sourceModel || "S5");
  }

  function getRootContainer() {
    return qs("#app .container");
  }

  function getGrid() {
    return qs("#app .grid.grid-2");
  }

  function getHeaderCard() {
    return qs("#app .card.header");
  }

  function getConfiguratorCard() {
    return qs("#app .grid.grid-2 > .card:first-child");
  }

  function getSummaryCard() {
    return qs("#app .grid.grid-2 > .card:last-child");
  }

  function getNativeModelSelect() {
    return qs("#app .grid.grid-2 > .card:first-child select.select");
  }

  function getLangSelect() {
    return qs(".card.header select.select");
  }

  function wait(ms) {
    return new Promise(function (resolve) {
      window.setTimeout(resolve, ms);
    });
  }

  function dispatchNativeSelect(select, value) {
    if (!select) {
      return;
    }
    if (select.value !== value) {
      select.value = value;
    }
    select.dispatchEvent(new Event("input", { bubbles: true }));
    select.dispatchEvent(new Event("change", { bubbles: true }));
  }

  function syncCardStateFromModelSelect() {
    const select = getNativeModelSelect();
    if (!select || !select.value) {
      return;
    }
    const card = getCardConfigBySourceModel(select.value);
    if (card) {
      state.cardId = card.id;
      state.sourceModel = card.sourceModel;
    }
  }

  function getConfigStore() {
    const app = qs("#app");
    const vueApp = app && app.__vue_app__;
    const provides = vueApp && vueApp._context && vueApp._context.provides;
    if (!provides) {
      return null;
    }
    const piniaKey = Reflect.ownKeys(provides).find(function (key) {
      const value = provides[key];
      return value && value._s && typeof value._s.get === "function";
    });
    if (!piniaKey) {
      return null;
    }
    const pinia = provides[piniaKey];
    return pinia && pinia._s ? pinia._s.get("config") : null;
  }

  function getModuleDefinition(moduleId) {
    const store = getConfigStore();
    const modules = store && store.catalog && store.catalog.modules;
    return (modules || []).find(function (module) {
      return module.id === moduleId;
    }) || null;
  }

  function getGroupModuleId(group) {
    if (!group) {
      return "";
    }
    if (group.dataset && group.dataset.moduleId) {
      return group.dataset.moduleId;
    }

    const titleText = ((qs(".option-title", group) || {}).textContent || "").trim();
    const codeText = ((qs(".option-code", group) || {}).textContent || "").trim();
    const store = getConfigStore();
    const modules = (store && store.catalog && store.catalog.modules) || [];
    const candidates = [titleText, codeText]
      .filter(Boolean)
      .map(normalizeText);

    const matched = modules.find(function (module) {
      const aliases = [
        module.id,
        module.name,
        translateUiText(module.name),
      ]
        .filter(Boolean)
        .map(normalizeText);

      return candidates.some(function (candidate) {
        return aliases.indexOf(candidate) >= 0;
      });
    });

    const moduleId = matched ? matched.id : "";
    if (moduleId && group.dataset) {
      group.dataset.moduleId = moduleId;
    }
    return moduleId;
  }

  function getFrameColorHex(selection) {
    return FRAME_COLOR_HEX[(selection && selection.frameColor) || ""] || "#9aa6bd";
  }

  function patchOrderFormCatalog() {
    const store = getConfigStore();
    const modules = store && store.catalog && store.catalog.modules;
    if (!Array.isArray(modules)) return;

    const replaceOptions = function (moduleId, options) {
      const module = modules.find(function (item) { return item.id === moduleId; });
      if (!module) return;
      module.options = options.map(function (option) {
        return Object.assign({ priceDelta: 0 }, option, {
          pricingType: ORDER_FORM_EXTRA_OPTIONS.has(option.id) ? "extra" : "standard",
        });
      });
    };

    replaceOptions("frameColor", ORDER_FORM_FRAME_COLORS.map(function (color) {
      return { id: color.id, label: color.label, zh: color.zh };
    }));
    replaceOptions("legLength", [38, 39.5, 41, 42.5, 44].map(function (value) {
      return { id: "ll-" + String(value).replace(".", "-"), label: value + " cm" };
    }));
    replaceOptions("backrestHandles", [
      { id: "bh-std-bent", label: "STD bended backrest handles" },
      { id: "bh-folding", label: "Folding backrest handles" },
      { id: "bh-none", label: "No backrest handles" },
    ]);
    replaceOptions("axle", [
      { id: "axle-std-stainless", label: "Standard stainless steel axle" },
      { id: "axle-tetra-stainless", label: "Tetra release stainless steel axle" },
    ]);

    modules.forEach(function (module) {
      (module.options || []).forEach(function (option) {
        option.pricingType = ORDER_FORM_EXTRA_OPTIONS.has(option.id) ? "extra" : "standard";
      });
    });
  }

  function buildRuntimeSelection(store, sourceModel) {
    const selection = Object.assign({}, (store && store.selection) || {});
    const modelId = sourceModel || (store && store.modelId) || state.sourceModel || "S5";
    const modules = (((store || {}).catalog || {}).models || []).find(function (item) {
      return item.id === modelId;
    });
    const moduleIds = Array.isArray(modules && modules.modules) ? modules.modules : [];
    const modulesById = new Map((((store || {}).catalog || {}).modules || []).map(function (module) {
      return [module.id, module];
    }));

    moduleIds.forEach(function (moduleId) {
      if (selection[moduleId]) {
        return;
      }
      const labeledValue = state.selectionLabels[moduleId];
      if (labeledValue) {
        const option = findOptionByLabel(moduleId, labeledValue);
        if (option && option.id) {
          selection[moduleId] = option.id;
          return;
        }
      }
      const module = modulesById.get(moduleId);
      const firstOption = module && module.options && module.options[0];
      if (firstOption && firstOption.id) {
        selection[moduleId] = firstOption.id;
      }
    });

    Object.keys(state.selectionLabels || {}).forEach(function (moduleId) {
      if (selection[moduleId]) {
        return;
      }
      const option = findOptionByLabel(moduleId, state.selectionLabels[moduleId]);
      if (option && option.id) {
        selection[moduleId] = option.id;
      }
    });

    return selection;
  }

  function syncRuntimeViewer() {
    const card = getConfiguratorCard();
    const viewer = qs(".model-viewer", card);
    const store = getConfigStore();
    if (!viewer || !store) {
      return;
    }

    if (!state.viewerModulePromise) {
    state.viewerModulePromise = import("/assets/runtime-model-viewer.mjs?v=20260809-one-arm-sync-v126");
    }

    const sourceModel = state.sourceModel || store.modelId || "S5";
    const selection = buildRuntimeSelection(store, sourceModel);
    const frameColor = getFrameColorHex(selection);

    state.viewerModulePromise
      .then(function (viewerModule) {
        if (!viewerModule || typeof viewerModule.mountRuntimeModelViewer !== "function") {
          return;
        }
        if (!state.viewerRuntime || state.viewerRuntime.container !== viewer) {
          if (state.viewerRuntime && typeof state.viewerRuntime.dispose === "function") {
            state.viewerRuntime.dispose();
          }
          state.viewerRuntime = viewerModule.mountRuntimeModelViewer(viewer);
        }
        if (state.viewerRuntime && typeof state.viewerRuntime.update === "function") {
          state.viewerUpdatePromise = Promise.resolve(state.viewerRuntime.update({
            sourceModel: sourceModel,
            selection: selection,
            frameColor: frameColor,
          })).catch(function (error) {
            console.error("Runtime viewer update failed", error);
          });
        }
      })
      .catch(function (error) {
        console.error("Runtime viewer sync failed", error);
      });
  }

  function schedulePartFocus(moduleId) {
    if (!moduleId) return;
    const requestId = ++state.partFocusRequestId;
    window.clearTimeout(state.partFocusTimer);
    state.partFocusTimer = window.setTimeout(function () {
      const pendingUpdate = state.viewerUpdatePromise || Promise.resolve();
      Promise.resolve(pendingUpdate).finally(function () {
        if (requestId !== state.partFocusRequestId) return;
        const runtime = state.viewerRuntime;
        if (!runtime || typeof runtime.focusAndHighlightModule !== "function") return;
        const focusEnabled = runtime.selectionFocusEnabled !== false;
        const sameModule = state.lastFocusedModuleId === moduleId;
        runtime.focusAndHighlightModule(moduleId, undefined, {
          changeView: focusEnabled && !sameModule,
        });
        state.lastFocusedModuleId = focusEnabled ? moduleId : "";
      });
    }, 240);
  }

  function syncDesktopViewerSticky() {
    const card = getConfiguratorCard();
    const viewer = qs(".model-viewer", card);
    const viewerPanel = qs(".wc-desktop-viewer-panel", card);
    if (!viewer || !viewerPanel) {
      return;
    }
    if (isMobileViewport() || !document.body.classList.contains("wc-config-active")) {
      viewerPanel.classList.remove("wc-is-sticky");
      viewer.style.removeProperty("position");
      viewer.style.removeProperty("top");
      viewer.style.removeProperty("z-index");
      return;
    }
    viewerPanel.classList.add("wc-is-sticky");
  }

  function syncDesktopHeaderSpace() {
    const header = getHeaderCard();
    const toolbar = header && qs(".wc-inline-toolbar", header);
    const card = getConfiguratorCard();
    const main = card && qs(".wc-desktop-config-main", card);
    const viewerPanel = main && qs(".wc-desktop-viewer-panel", main);
    const optionsPanel = main && qs(".wc-desktop-options-panel", main);
    const enabled =
      window.matchMedia("(min-width: 1280px)").matches &&
      document.body.classList.contains("wc-config-active") &&
      header &&
      toolbar &&
      main &&
      viewerPanel &&
      optionsPanel;

    document.body.classList.remove("wc-desktop-header-space-reused");
    if (main) {
      main.style.removeProperty("--wc-desktop-options-lift");
      main.style.removeProperty("--wc-desktop-options-expanded-height");
    }
    if (header) {
      header.style.removeProperty("--wc-desktop-header-left-width");
    }
    if (!enabled) {
      return;
    }

    const toolbarRect = toolbar.getBoundingClientRect();
    const viewerRect = viewerPanel.getBoundingClientRect();
    const optionsRect = optionsPanel.getBoundingClientRect();
    const lift = Math.max(0, optionsRect.top - toolbarRect.top);
    const expandedHeight = optionsRect.height + lift;
    const leftWidth = Math.max(320, viewerRect.right - toolbarRect.left);

    main.style.setProperty("--wc-desktop-options-lift", lift.toFixed(2) + "px");
    main.style.setProperty("--wc-desktop-options-expanded-height", expandedHeight.toFixed(2) + "px");
    header.style.setProperty("--wc-desktop-header-left-width", leftWidth.toFixed(2) + "px");
    document.body.classList.add("wc-desktop-header-space-reused");
  }

  function findOptionByLabel(moduleId, label) {
    const module = getModuleDefinition(moduleId);
    if (!module || !module.options) {
      return null;
    }
    return module.options.find(function (option) {
      return (option.label || "").trim() === (label || "").trim();
    }) || null;
  }

  function annotateGroupOptionIds(group) {
    if (!group) {
      return;
    }
    const moduleId = getGroupModuleId(group);
    const module = getModuleDefinition(moduleId);
    const options = module && module.options ? module.options : [];
    qsa(".choice-btn", group).forEach(function (button, index) {
      if (options[index]) {
        button.dataset.optionId = options[index].id;
      }
    });
  }

  function annotateVisibleOptionButtons() {
    patchOrderFormCatalog();
    patchFrontWheelCatalog();
    patchRearWheelCatalog();
    patchHandrimCatalog();
    patchTyreCatalog();
    renderRearWheelOptions();
    renderHandrimOptions();
    renderTyreOptions();
    renderRearWheelSubcomponent();
    renderFrameColorOptions();
    decorateOrderFormOptions();
    qsa(".option-group", getConfiguratorCard()).forEach(annotateGroupOptionIds);
    enforceRearWheelAxleConstraint();
    enforceFrameLengthSeatDepthConstraint();
    enforceFrontForkWheelConstraint();
    enhanceRearWheelCamberOptions();
  }

  function patchFrontWheelCatalog() {
    const store = getConfigStore();
    const module = getModuleDefinition("frontWheel");
    if (!module || !Array.isArray(module.options)) return;

    const availableOptions = module.options.filter(function (option) {
      return AVAILABLE_FRONT_WHEEL_IDS.has(option.id);
    });
    if (availableOptions.length !== module.options.length) {
      module.options = availableOptions;
    }

    const selectedId = store && store.selection ? store.selection.frontWheel : "";
    if (
      store &&
      typeof store.setOption === "function" &&
      !AVAILABLE_FRONT_WHEEL_IDS.has(selectedId)
    ) {
      store.setOption("frontWheel", "fw-4-alu");
      state.selectionLabels.frontWheel = '4" alu rim';
    }
  }

  function patchRearWheelCatalog() {
    const module = getModuleDefinition("rearWheel");
    if (!module || module.wcRearWheelCatalogPatched) {
      return;
    }
    module.options = REAR_WHEEL_OPTIONS.map(function (option) {
      return { id: option.id, label: option.label, priceDelta: 0 };
    });
    module.wcRearWheelCatalogPatched = true;
  }

  function patchHandrimCatalog() {
    const module = getModuleDefinition("handrim");
    if (!module || module.wcHandrimCatalogPatched) {
      return;
    }
    module.options = HANDRIM_OPTIONS.map(function (option) {
      return { id: option.id, label: option.label, priceDelta: 0 };
    });
    module.wcHandrimCatalogPatched = true;
  }

  function patchTyreCatalog() {
    const module = getModuleDefinition("tyre");
    if (!module || module.wcTyreCatalogPatched) return;
    module.options = TYRE_OPTIONS.map(function (option) {
      return { id: option.id, label: option.label, priceDelta: 0 };
    });
    module.wcTyreCatalogPatched = true;
  }

  function getSelectedRearWheelSize(store) {
    const selectedId = store && store.selection ? store.selection.rearWheel : "";
    const selected = REAR_WHEEL_OPTIONS.find(function (option) {
      return option.id === selectedId;
    });
    return selected ? selected.size : 22;
  }

  function getCompatibleRearWheelSelection(store, rearWheelId) {
    const wheel = REAR_WHEEL_OPTIONS.find(function (option) {
      return option.id === rearWheelId;
    }) || REAR_WHEEL_OPTIONS[0];
    const currentHandrim = store && store.selection ? store.selection.handrim : "";
    const currentTyre = store && store.selection ? store.selection.tyre : "";
    const handrim = HANDRIM_OPTIONS.find(function (option) {
      return option.available && option.size === wheel.size && option.id === currentHandrim;
    }) || HANDRIM_OPTIONS.find(function (option) {
      return option.available && option.size === wheel.size && option.finish === "silver" && option.profile === "round";
    }) || HANDRIM_OPTIONS.find(function (option) {
      return option.available && option.size === wheel.size;
    });
    const tyre = TYRE_OPTIONS.find(function (option) {
      return option.id === currentTyre && option.modelSizes.includes(wheel.size);
    }) || TYRE_OPTIONS.find(function (option) {
      return option.modelSizes.includes(wheel.size);
    });

    return {
      rearWheel: wheel.id,
      handrim: handrim ? handrim.id : currentHandrim,
      tyre: tyre ? tyre.id : currentTyre,
      axle: wheel.id === "rw-24b"
        ? (store.selection.axle || "axle-std-stainless")
        : "axle-std-stainless",
    };
  }

  function setRearWheelSelection(store, rearWheelId) {
    if (!store || !store.selection) return;
    const next = getCompatibleRearWheelSelection(store, rearWheelId);
    if (typeof store.$patch === "function") {
      store.$patch(function (state) {
        state.selection.rearWheel = next.rearWheel;
        state.selection.handrim = next.handrim;
        state.selection.tyre = next.tyre;
        state.selection.axle = next.axle;
      });
      return;
    }
    store.selection.rearWheel = next.rearWheel;
    store.selection.handrim = next.handrim;
    store.selection.tyre = next.tyre;
    store.selection.axle = next.axle;
  }

  function enforceRearWheelAxleConstraint() {
    const store = getConfigStore();
    const card = getConfiguratorCard();
    if (!store || !store.selection || !card) return;
    const is24B = store.selection.rearWheel === "rw-24b";
    if (!is24B && store.selection.axle !== "axle-std-stainless") {
      if (typeof store.setOption === "function") {
        store.setOption("axle", "axle-std-stainless");
      } else {
        store.selection.axle = "axle-std-stainless";
      }
    }
    const axleGroup = qsa(".option-group", card).find(function (group) {
      return getGroupModuleId(group) === "axle";
    });
    if (!axleGroup) return;
    qsa('[data-option-id="axle-tetra-stainless"]', axleGroup).forEach(function (button) {
      button.hidden = !is24B;
      button.disabled = !is24B;
      button.setAttribute("aria-hidden", is24B ? "false" : "true");
    });
  }

  function getRearWheelCopy(option) {
    if (!option || getLang() === "en-US") return option ? option.label : "";
    const labels = {
      "rw-22s": "22英寸轻量18辐主轮",
      "rw-24s": "24英寸轻量18辐主轮",
      "rw-22ul": "22英寸超轻12辐主轮",
      "rw-24ul": "24英寸超轻12辐主轮",
      "rw-24b": "24英寸大轮毂12辐主轮",
    };
    return labels[option.id] || option.label;
  }

  function getHandrimCopy(option) {
    if (getLang() === "en-US") {
      return option.label;
    }
    if (option.id === "hr-big-24") return "铝合金大号异形截面（橡胶条）24英寸";
    const finish = option.finish === "black" ? "黑色阳极氧化铝" : "银色阳极氧化铝";
    return finish + " " + option.size + "英寸";
  }

  function createHandrimDiagram(option) {
    const diagram = document.createElement("span");
    diagram.className = "wc-handrim-diagram is-" + option.profile + " is-" + option.finish;
    diagram.setAttribute("aria-hidden", "true");
    const profilePath = option.profile === "round"
      ? '<circle cx="48" cy="35" r="15" />'
      : option.profile === "large-round"
        ? '<circle cx="48" cy="35" r="20" />'
        : option.profile === "tetra"
          ? '<path d="M35 24Q48 18 61 24L58 47Q48 54 38 47Z" />'
          : '<path d="M32 27Q48 15 64 27L59 49Q48 55 37 49Z" />';
    diagram.innerHTML =
      '<svg viewBox="0 0 96 70" focusable="false" role="presentation">' +
      '<path class="wc-handrim-arc" d="M12 55A40 40 0 0 1 84 55" />' +
      '<g class="wc-handrim-section">' + profilePath + "</g>" +
      '<text x="76" y="17" text-anchor="middle">' + option.size + "\u2033</text>" +
      "</svg>";
    return diagram;
  }

  function renderHandrimOptions() {
    const card = getConfiguratorCard();
    const store = getConfigStore();
    if (!card || !store || !store.selection) {
      return;
    }
    const group = qsa(".option-group", card).find(function (candidate) {
      return getGroupModuleId(candidate) === "handrim";
    });
    if (!group) {
      return;
    }
    const grid = qs(".choice-grid", group);
    if (!grid) {
      return;
    }

    const wheelSize = getSelectedRearWheelSize(store);
    const compatible = HANDRIM_OPTIONS.filter(function (option) {
      return option.available && option.size === wheelSize;
    });
    let selectedId = store.selection.handrim || "";
    if (!compatible.some(function (option) { return option.id === selectedId; })) {
      const fallback = compatible.find(function (option) {
        return option.finish === "silver" && option.profile === "round";
      }) || compatible[0];
      if (fallback && typeof store.setOption === "function") {
        selectedId = fallback.id;
        store.setOption("handrim", selectedId);
      }
    }

    const signature = HANDRIM_OPTIONS.map(function (option) {
      return option.id + ":" + (option.available ? "1" : "0");
    }).join("|");
    if (grid.dataset.wcHandrimSignature !== signature) {
      grid.textContent = "";
      HANDRIM_OPTIONS.forEach(function (option) {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "choice-btn wc-handrim-choice";
        button.dataset.optionId = option.id;
        button.dataset.wcBoundChoice = "1";
        button.appendChild(createHandrimDiagram(option));
        const label = document.createElement("span");
        label.className = "choice-label";
        button.appendChild(label);
        button.addEventListener("click", function () {
          const configStore = getConfigStore();
          const currentSize = getSelectedRearWheelSize(configStore);
          if (!option.available || option.size !== currentSize || !configStore || typeof configStore.setOption !== "function") {
            return;
          }
          configStore.setOption("handrim", option.id);
          state.selectionLabels.handrim = option.label;
          state.selectionDetails.handrim = {
            title: getLang() === "en-US" ? "Part 2 · Handrim" : "Part 2 · 扶手圈",
            value: getHandrimCopy(option),
          };
          setGroupSelectionVisual(group, option.label, option.id);
          syncSummaryExtras();
          window.setTimeout(function () {
            reflectSelectionsFromStore();
            syncVisibleSelections();
            syncRuntimeViewer();
          }, 40);
        });
        grid.appendChild(button);
      });
      grid.dataset.wcHandrimSignature = signature;
    }

    qsa(".wc-handrim-choice", grid).forEach(function (button) {
      const option = HANDRIM_OPTIONS.find(function (item) {
        return item.id === button.dataset.optionId;
      });
      if (!option) {
        return;
      }
      const wrongSize = option.size !== wheelSize;
      button.disabled = !option.available || wrongSize;
      button.classList.toggle("wc-option-unavailable", wrongSize);
      button.classList.toggle("active", option.id === selectedId);
      button.setAttribute("aria-disabled", button.disabled ? "true" : "false");
      const label = qs(".choice-label", button);
      if (label) {
        label.textContent = getHandrimCopy(option);
      }
      let note = qs(".wc-wheel-pending", button);
      if (!option.available && !note) {
        note = document.createElement("span");
        note.className = "wc-wheel-pending";
        button.appendChild(note);
      }
      if (note) {
        note.textContent = getLang() === "en-US" ? "3D model pending" : "3D 模型待补充";
      }
    });
    const selectedOption = HANDRIM_OPTIONS.find(function (option) {
      return option.id === selectedId;
    });
    setGroupSelectionVisual(group, selectedOption && selectedOption.label, selectedId);
  }

  function getTyreCopy(option) {
    if (getLang() === "en-US") return option.label;
    const labels = {
      pu: "PU 防滑纹轮胎",
      pneumatic: "空气光面轮胎",
    };
    return labels[option.tread] || option.label;
  }

  function createTyreDiagram(option) {
    const diagram = document.createElement("span");
    diagram.className = "wc-tyre-diagram is-" + option.tread;
    diagram.setAttribute("aria-hidden", "true");
    const tread = option.tread === "pu"
      ? '<path class="wc-tyre-tread" d="M20 42l10-6m-2 12 10-6m-2 12 10-6m-2 12 10-6m-2 12 10-6" />'
      : '<path class="wc-tyre-tread" d="M22 48Q48 35 74 48" />';
    diagram.innerHTML =
      '<svg viewBox="0 0 96 72" focusable="false" role="presentation">' +
      '<path class="wc-tyre-body" d="M14 57A38 38 0 0 1 82 57" />' +
      tread +
      "</svg>";
    return diagram;
  }

  function renderTyreOptions() {
    const card = getConfiguratorCard();
    const store = getConfigStore();
    if (!card || !store || !store.selection) return;
    const group = qsa(".option-group", card).find(function (candidate) {
      return getGroupModuleId(candidate) === "tyre";
    });
    if (!group) return;
    const grid = qs(".choice-grid", group);
    if (!grid) return;

    const wheelSize = getSelectedRearWheelSize(store);
    const available = TYRE_OPTIONS.filter(function (option) {
      return option.modelSizes.includes(wheelSize);
    });
    let selectedId = store.selection.tyre || "";
    if (!available.some(function (option) { return option.id === selectedId; })) {
      selectedId = available[0] && available[0].id;
      if (selectedId && typeof store.setOption === "function") store.setOption("tyre", selectedId);
    }

    const signature = wheelSize + "|" + TYRE_OPTIONS.map(function (option) {
      return option.id + ":" + option.modelSizes.join(",");
    }).join("|");
    if (grid.dataset.wcTyreSignature !== signature) {
      grid.textContent = "";
      TYRE_OPTIONS.forEach(function (option) {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "choice-btn wc-tyre-choice";
        button.dataset.optionId = option.id;
        button.dataset.wcBoundChoice = "1";
        const hasModel = option.modelSizes.includes(wheelSize);
        button.disabled = !hasModel;
        button.appendChild(createTyreDiagram(option));
        const label = document.createElement("span");
        label.className = "choice-label";
        button.appendChild(label);
        if (hasModel) {
          button.addEventListener("click", function () {
            const configStore = getConfigStore();
            if (!configStore || typeof configStore.setOption !== "function") return;
            configStore.setOption("tyre", option.id);
            state.selectionLabels.tyre = option.label;
            state.selectionDetails.tyre = {
              title: getLang() === "en-US" ? "Part 3 · Tyre" : "Part 3 · 轮胎",
              value: getTyreCopy(option),
            };
            setGroupSelectionVisual(group, option.label, option.id);
            syncSummaryExtras();
            window.setTimeout(function () {
              reflectSelectionsFromStore();
              syncVisibleSelections();
              syncRuntimeViewer();
            }, 40);
          });
        } else {
          const pending = document.createElement("span");
          pending.className = "wc-wheel-pending";
          button.appendChild(pending);
        }
        grid.appendChild(button);
      });
      grid.dataset.wcTyreSignature = signature;
    }

    qsa(".wc-tyre-choice", grid).forEach(function (button) {
      const option = TYRE_OPTIONS.find(function (item) { return item.id === button.dataset.optionId; });
      if (!option) return;
      button.classList.toggle("active", option.id === selectedId);
      const hasModel = option.modelSizes.includes(wheelSize);
      button.disabled = !hasModel;
      button.classList.toggle("wc-option-unavailable", !hasModel);
      button.setAttribute("aria-disabled", hasModel ? "false" : "true");
      const label = qs(".choice-label", button);
      if (label) label.textContent = getTyreCopy(option);
      const pending = qs(".wc-wheel-pending", button);
      if (pending) {
        pending.textContent = getLang() === "en-US"
          ? (wheelSize === 22 ? '22" 3D model pending' : '24" 3D model pending')
          : (wheelSize === 22 ? "缺少22英寸3D模型" : "缺少24英寸3D模型");
      }
    });
    const selectedOption = TYRE_OPTIONS.find(function (option) { return option.id === selectedId; });
    setGroupSelectionVisual(group, selectedOption && selectedOption.label, selectedId);
  }

  function renderRearWheelSubcomponent() {
    const card = getConfiguratorCard();
    const groupsWrap = card && qs(".option-groups", card);
    if (!groupsWrap) {
      return;
    }
    const rearWheelGroup = qsa(".option-group", groupsWrap).find(function (group) {
      return getGroupModuleId(group) === "rearWheel";
    });
    const handrimGroup = qsa(".option-group", groupsWrap).find(function (group) {
      return getGroupModuleId(group) === "handrim";
    });
    const tyreGroup = qsa(".option-group", groupsWrap).find(function (group) {
      return getGroupModuleId(group) === "tyre";
    });
    if (!rearWheelGroup || !handrimGroup || !tyreGroup) {
      return;
    }

    let component = qs(".wc-drive-wheel-component", groupsWrap);
    if (!component) {
      component = document.createElement("section");
      component.className = "wc-drive-wheel-component";
      component.innerHTML =
        '<header class="wc-drive-wheel-header">' +
        '<span class="wc-drive-wheel-kicker"></span>' +
        '<strong class="wc-drive-wheel-title"></strong>' +
        '<span class="wc-drive-wheel-copy"></span>' +
        "</header>" +
        '<div class="wc-drive-wheel-parts"></div>';
      groupsWrap.insertBefore(component, rearWheelGroup);
    }
    const parts = qs(".wc-drive-wheel-parts", component);
    if (rearWheelGroup.parentElement !== parts) {
      parts.appendChild(rearWheelGroup);
    }
    if (handrimGroup.parentElement !== parts) {
      parts.appendChild(handrimGroup);
    }
    if (tyreGroup.parentElement !== parts) {
      parts.appendChild(tyreGroup);
    }
    const english = getLang() === "en-US";
    qs(".wc-drive-wheel-kicker", component).textContent = english ? "SUB-COMPONENT" : "子组件";
    qs(".wc-drive-wheel-title", component).textContent = english ? "Main drive wheel assembly" : "主驱动轮组件";
    qs(".wc-drive-wheel-copy", component).textContent = english
      ? "Select the main wheel, compatible handrim, and tyre tread independently."
      : "主轮、扶手圈和轮胎胎纹可分别选择。";
    const rearTitle = qs(".option-title", rearWheelGroup);
    const handrimTitle = qs(".option-title", handrimGroup);
    const tyreTitle = qs(".option-title", tyreGroup);
    if (rearTitle) rearTitle.textContent = english ? "Part 1 · Main wheel" : "Part 1 · 主轮";
    if (handrimTitle) handrimTitle.textContent = english ? "Part 2 · Handrim" : "Part 2 · 扶手圈";
    if (tyreTitle) tyreTitle.textContent = english ? "Part 3 · Tyre" : "Part 3 · 轮胎";
    rearWheelGroup.classList.add("wc-drive-wheel-part", "is-part-one");
    handrimGroup.classList.add("wc-drive-wheel-part", "is-part-two");
    tyreGroup.classList.add("wc-drive-wheel-part", "is-part-three");
    syncRearWheelSubcomponentVisibility();
  }

  function syncRearWheelSubcomponentVisibility() {
    const card = getConfiguratorCard();
    const component = card && qs(".wc-drive-wheel-component", card);
    if (!component) {
      return;
    }
    // This supplemental header is outside Vue's tree, so category changes must
    // explicitly control its visibility.
    component.hidden = getActiveCategoryIndex() !== 6;
  }

  function createRearWheelDiagram(option) {
    const spokes = [];
    const count = option.spokes || 12;
    const hubRadius = option.largeHub ? 8 : 4;
    for (let index = 0; index < count; index += 1) {
      const angle = (Math.PI * 2 * index) / count;
      const innerX = 48 + Math.cos(angle) * hubRadius;
      const innerY = 44 + Math.sin(angle) * hubRadius;
      const outerX = 48 + Math.cos(angle) * 30;
      const outerY = 44 + Math.sin(angle) * 30;
      spokes.push('<path d="M' + innerX.toFixed(2) + " " + innerY.toFixed(2) + "L" + outerX.toFixed(2) + " " + outerY.toFixed(2) + '" />');
    }
    const diagram = document.createElement("span");
    diagram.className = "wc-rear-wheel-diagram";
    diagram.setAttribute("aria-hidden", "true");
    diagram.innerHTML =
      '<svg viewBox="0 0 96 88" focusable="false" role="presentation">' +
      '<circle class="wc-wheel-tyre' + (option.offroad ? " is-offroad" : "") + '" cx="48" cy="44" r="34" />' +
      '<circle class="wc-wheel-rim" cx="48" cy="44" r="30" />' +
      '<g class="wc-wheel-spokes">' + spokes.join("") + "</g>" +
      '<circle class="wc-wheel-hub" cx="48" cy="44" r="' + hubRadius + '" />' +
      "</svg>";
    return diagram;
  }

  function renderRearWheelOptions() {
    const card = getConfiguratorCard();
    const store = getConfigStore();
    if (!card || !store) {
      return;
    }
    const group = qsa(".option-group", card).find(function (candidate) {
      return getGroupModuleId(candidate) === "rearWheel";
    });
    if (!group) {
      return;
    }
    const grid = qs(".choice-grid", group);
    if (!grid) {
      return;
    }

    const availableIds = REAR_WHEEL_OPTIONS.filter(function (option) {
      return option.available;
    }).map(function (option) {
      return option.id;
    });
    let selectedId = (store.selection && store.selection.rearWheel) || "";
    if (!availableIds.includes(selectedId)) {
      selectedId = availableIds[0];
      setRearWheelSelection(store, selectedId);
    }

    const signature = REAR_WHEEL_OPTIONS.map(function (option) {
      return option.id + ":" + (option.available ? "1" : "0");
    }).join("|");
    if (grid.dataset.wcRearWheelSignature !== signature) {
      grid.textContent = "";
      REAR_WHEEL_OPTIONS.forEach(function (option) {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "choice-btn wc-rear-wheel-choice";
        button.dataset.optionId = option.id;
        button.dataset.wcBoundChoice = "1";
        button.disabled = !option.available;
        button.setAttribute("aria-disabled", option.available ? "false" : "true");
        button.appendChild(createRearWheelDiagram(option));

        const code = document.createElement("span");
        code.className = "wc-wheel-code";
        code.textContent = option.code;
        button.appendChild(code);

        const label = document.createElement("span");
        label.className = "choice-label";
        label.textContent = getRearWheelCopy(option);
        button.appendChild(label);

        if (!option.available) {
          const pending = document.createElement("span");
          pending.className = "wc-wheel-pending";
          pending.textContent = getLang() === "en-US" ? "3D model pending" : "3D 模型待补充";
          button.appendChild(pending);
        } else {
          button.addEventListener("click", function () {
            const configStore = getConfigStore();
            if (!configStore || typeof configStore.setOption !== "function") {
              return;
            }
            setRearWheelSelection(configStore, option.id);
            state.selectionLabels.rearWheel = option.label;
            state.selectionDetails.rearWheel = {
              title: translateUiText("Rear Wheels Setting") || "Rear Wheels Setting",
              value: translateUiText(option.label) || option.label,
            };
            setGroupSelectionVisual(group, option.label, option.id);
            renderHandrimOptions();
            renderTyreOptions();
            syncSummaryExtras();
            window.setTimeout(function () {
              reflectSelectionsFromStore();
              syncVisibleSelections();
              syncRuntimeViewer();
            }, 40);
          });
        }
        grid.appendChild(button);
      });
      grid.dataset.wcRearWheelSignature = signature;
    }

    qsa(".wc-rear-wheel-choice", grid).forEach(function (button) {
      const option = REAR_WHEEL_OPTIONS.find(function (item) {
        return item.id === button.dataset.optionId;
      });
      const label = qs(".choice-label", button);
      if (option && label) {
        label.textContent = getRearWheelCopy(option);
      }
      button.classList.toggle("active", button.dataset.optionId === selectedId);
    });
    const selectedOption = REAR_WHEEL_OPTIONS.find(function (option) {
      return option.id === selectedId;
    });
    setGroupSelectionVisual(group, selectedOption && selectedOption.label, selectedId);
  }

  function enforceFrameLengthSeatDepthConstraint() {
    const store = getConfigStore();
    const card = getConfiguratorCard();
    if (!store || !store.selection || !card || state.applyingSeatDepthConstraint) {
      return;
    }

    const isLongFrame = store.selection.frameLength === "fl-long";
    const allowedOptionIds = new Set(
      isLongFrame
        ? ["sd-42-5", "sd-45", "sd-47-5"]
        : ["sd-37-5", "sd-40", "sd-42-5"]
    );
    const fallbackOptionId = isLongFrame ? "sd-42-5" : "sd-37-5";
    const group = qsa(".option-group", card).find(function (candidate) {
      return getGroupModuleId(candidate) === "seatDepth";
    });

    if (group) {
      annotateGroupOptionIds(group);
      qsa(".choice-btn", group).forEach(function (button) {
        const available = allowedOptionIds.has(button.dataset.optionId || "");
        button.hidden = false;
        button.disabled = !available;
        button.classList.toggle("wc-option-unavailable", !available);
        button.setAttribute("aria-disabled", available ? "false" : "true");
      });

      let note = qs(".wc-seat-depth-rule-note", group);
      if (!note) {
        note = document.createElement("p");
        note.className = "wc-seat-depth-rule-note";
        group.appendChild(note);
      }
      note.textContent = getLang() === "en-US"
        ? "Grey options are unavailable for the current frame length. Change the frame length to select them."
        : "灰色选项不适用于当前车架长度。如需选择，请先更改车架长度。";
    }

    if (allowedOptionIds.has(store.selection.seatDepth)) {
      return;
    }

    const module = getModuleDefinition("seatDepth");
    const fallbackOption = module && module.options
      ? module.options.find(function (option) { return option.id === fallbackOptionId; })
      : null;
    if (!fallbackOption || typeof store.setOption !== "function") {
      return;
    }

    state.applyingSeatDepthConstraint = true;
    try {
      store.setOption("seatDepth", fallbackOptionId);
      state.selectionLabels.seatDepth = fallbackOption.label;
      state.selectionDetails.seatDepth = {
        title: translateUiText((module && module.name) || "Seat Depth"),
        value: translateUiText(fallbackOption.label) || fallbackOption.label,
      };
      if (group) {
        setGroupSelectionVisual(group, fallbackOption.label, fallbackOptionId);
      }
    } finally {
      state.applyingSeatDepthConstraint = false;
    }
    window.setTimeout(function () {
      reflectSelectionsFromStore();
      syncVisibleSelections();
      syncSummaryExtras();
      syncRuntimeViewer();
    }, 0);
  }

  function getFrontWheelSize(optionId) {
    const match = /^fw-(3|4|5)-/.exec(String(optionId || ""));
    return match ? Number(match[1]) : 0;
  }

  function isFrontForkWheelCompatible(frontForkId, frontWheelId) {
    const wheelSize = getFrontWheelSize(frontWheelId);
    if (!wheelSize) {
      return true;
    }
    return frontForkId === "ff-long"
      ? wheelSize === 4 || wheelSize === 5
      : wheelSize === 3 || wheelSize === 4;
  }

  function enforceFrontForkWheelConstraint(changedModuleId) {
    const store = getConfigStore();
    const card = getConfiguratorCard();
    if (!store || !store.selection || !card || state.applyingFrontForkWheelConstraint) {
      return;
    }

    const forkGroup = qsa(".option-group", card).find(function (candidate) {
      return getGroupModuleId(candidate) === "frontFork";
    });
    const wheelGroup = qsa(".option-group", card).find(function (candidate) {
      return getGroupModuleId(candidate) === "frontWheel";
    });
    const forkModule = getModuleDefinition("frontFork");
    const wheelModule = getModuleDefinition("frontWheel");
    let frontForkId = store.selection.frontFork || "ff-std";
    let frontWheelId = store.selection.frontWheel || "fw-4-alu";
    let correctedModuleId = "";
    let correctedOptionId = "";

    if (!isFrontForkWheelCompatible(frontForkId, frontWheelId)) {
      if (changedModuleId === "frontWheel") {
        correctedModuleId = "frontFork";
        correctedOptionId = getFrontWheelSize(frontWheelId) === 5 ? "ff-long" : "ff-std";
        frontForkId = correctedOptionId;
      } else {
        correctedModuleId = "frontWheel";
        correctedOptionId = "fw-4-alu";
        frontWheelId = correctedOptionId;
      }
    }

    if (correctedModuleId && typeof store.setOption === "function") {
      const correctedModule = correctedModuleId === "frontFork" ? forkModule : wheelModule;
      const correctedOption = correctedModule && correctedModule.options
        ? correctedModule.options.find(function (option) { return option.id === correctedOptionId; })
        : null;
      state.applyingFrontForkWheelConstraint = true;
      try {
        store.setOption(correctedModuleId, correctedOptionId);
        if (correctedOption) {
          state.selectionLabels[correctedModuleId] = correctedOption.label;
          state.selectionDetails[correctedModuleId] = {
            title: translateUiText((correctedModule && correctedModule.name) || correctedModuleId),
            value: translateUiText(correctedOption.label) || correctedOption.label,
          };
        }
      } finally {
        state.applyingFrontForkWheelConstraint = false;
      }
    }

    if (forkGroup) {
      annotateGroupOptionIds(forkGroup);
      qsa(".choice-btn", forkGroup).forEach(function (button) {
        const available = isFrontForkWheelCompatible(button.dataset.optionId || "", frontWheelId);
        button.hidden = false;
        button.disabled = !available;
        button.classList.toggle("wc-option-unavailable", !available);
        button.setAttribute("aria-disabled", available ? "false" : "true");
      });
    }

    if (wheelGroup) {
      annotateGroupOptionIds(wheelGroup);
      qsa(".choice-btn", wheelGroup).forEach(function (button) {
        const available = isFrontForkWheelCompatible(frontForkId, button.dataset.optionId || "");
        button.hidden = false;
        button.disabled = !available;
        button.classList.toggle("wc-option-unavailable", !available);
        button.setAttribute("aria-disabled", available ? "false" : "true");
      });
    }

    [forkGroup, wheelGroup].forEach(function (group) {
      if (!group) {
        return;
      }
      let note = qs(".wc-front-fork-wheel-rule-note", group);
      if (!note) {
        note = document.createElement("p");
        note.className = "wc-front-fork-wheel-rule-note";
        group.appendChild(note);
      }
      note.textContent = getLang() === "en-US"
        ? "Standard and one-arm forks support 3\u2033 and 4\u2033 front wheels; the long fork supports 4\u2033 and 5\u2033 front wheels. Grey options are incompatible."
        : "\u6807\u51c6\u524d\u53c9\u548c\u5355\u81c2\u524d\u53c9\u9002\u7528\u4e8e 3\u82f1\u5bf8\u30014\u82f1\u5bf8\u524d\u8f6e\uff1b\u52a0\u957f\u524d\u53c9\u9002\u7528\u4e8e 4\u82f1\u5bf8\u30015\u82f1\u5bf8\u524d\u8f6e\u3002\u7070\u8272\u9009\u9879\u4e0e\u5f53\u524d\u7ec4\u5408\u4e0d\u517c\u5bb9\u3002";
    });

    if (correctedModuleId) {
      window.setTimeout(function () {
        reflectSelectionsFromStore();
        syncVisibleSelections();
        syncSummaryExtras();
        syncRuntimeViewer();
      }, 0);
    }
  }

  function createRearWheelCamberDiagram(degrees) {
    const tilt = degrees === 4 ? 9 : degrees === 2 ? 5 : 0;
    const diagram = document.createElement("span");
    diagram.className = "wc-camber-diagram";
    diagram.setAttribute("aria-hidden", "true");
    diagram.innerHTML =
      '<svg viewBox="0 0 160 64" focusable="false" role="presentation">' +
      '<path class="wc-camber-ground" d="M10 55H150" />' +
      '<path class="wc-camber-axle" d="M30 33H130" />' +
      '<circle class="wc-camber-hub" cx="30" cy="33" r="3" />' +
      '<circle class="wc-camber-hub" cx="130" cy="33" r="3" />' +
      '<path class="wc-camber-wheel" d="M' + (30 + tilt) + ' 8L' + (30 - tilt) + ' 54" />' +
      '<path class="wc-camber-wheel" d="M' + (130 - tilt) + ' 8L' + (130 + tilt) + ' 54" />' +
      '<path class="wc-camber-frame" d="M58 18L66 33H94L102 18M66 33L60 47M94 33L100 47" />' +
      '<text class="wc-camber-angle" x="80" y="14" text-anchor="middle">' + degrees + '°</text>' +
      "</svg>";
    return diagram;
  }

  function enhanceRearWheelCamberOptions() {
    const card = getConfiguratorCard();
    if (!card) {
      return;
    }
    qsa('.option-group[data-module-id="rearWheelsBar"] .choice-btn', card).forEach(function (button) {
      if (button.dataset.wcCamberDiagram === "1") {
        return;
      }
      const optionId = button.dataset.optionId || "";
      const match = optionId.match(/^camber-(0|2|4)$/);
      if (!match) {
        return;
      }
      button.classList.add("wc-camber-choice");
      button.insertBefore(createRearWheelCamberDiagram(Number(match[1])), button.firstChild);
      button.dataset.wcCamberDiagram = "1";
    });
  }

  function setGroupSelectionVisual(group, value, optionId) {
    if (!group) {
      return;
    }
    const normalizedValue = (value || "").trim();
    const displayValue = translateUiText(normalizedValue).trim() || normalizedValue;
    qsa(".choice-btn", group).forEach(function (button) {
      const labelNode = qs(".choice-label", button) || button;
      const label = (labelNode.textContent || "").trim();
      const matches = optionId
        ? button.dataset.optionId === optionId
        : !!normalizedValue && (label === normalizedValue || label === displayValue);
      if (button.classList.contains("active") !== matches) button.classList.toggle("active", matches);
    });
    const currentNode = qs(".option-current", group);
    if (currentNode && displayValue && currentNode.textContent !== displayValue) {
      currentNode.textContent = displayValue;
    }
  }

  function applyRealisticFrameColorSwatches(scope) {
    const root = scope || getConfiguratorCard() || document;
    qsa('.option-group[data-module-id="frameColor"] .choice-btn', root).forEach(function (button) {
      const optionId = button.dataset.optionId || "";
      const swatch = qs(".chip-swatch", button);
      if (!swatch) {
        return;
      }
      const background = FRAME_COLOR_SWATCH[optionId];
      const solid = FRAME_COLOR_HEX[optionId];
      if (swatch.dataset.wcAppliedColor === optionId) return;
      swatch.dataset.wcAppliedColor = optionId;
      if (background) {
        swatch.style.background = background;
      } else {
        swatch.style.background = solid || "#9aa6bd";
      }
      swatch.style.backgroundColor = solid || "#9aa6bd";
    });
  }

  function getOrderFormOptionLabel(option) {
    if (!option) return "";
    if (getLang() === "zh-CN" && option.zh) return option.zh;
    return translateUiText(option.label) || option.label || "";
  }

  function renderFrameColorOptions() {
    const card = getConfiguratorCard();
    const group = card && qs('.option-group[data-module-id="frameColor"]', card);
    const store = getConfigStore();
    const module = getModuleDefinition("frameColor");
    const grid = group && qs(".choice-grid", group);
    if (!group || !grid || !store || !module) return;

    const selectedId = (store.selection && store.selection.frameColor) || "color-red";
    const renderKey = getLang() + ":" + module.options.map(function (option) { return option.id; }).join("|");
    if (grid.dataset.wcFrameColorRenderKey === renderKey && qsa(".wc-frame-color-choice", grid).length === module.options.length) {
      qsa(".wc-frame-color-choice", grid).forEach(function (button) {
        const active = button.dataset.optionId === selectedId;
        if (button.classList.contains("active") !== active) button.classList.toggle("active", active);
      });
      applyRealisticFrameColorSwatches(group);
      return;
    }
    grid.innerHTML = "";
    grid.dataset.wcFrameColorRenderKey = renderKey;
    module.options.forEach(function (option) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "choice-btn wc-frame-color-choice" + (option.id === selectedId ? " active" : "");
      button.dataset.optionId = option.id;
      button.innerHTML =
        '<span class="chip-swatch" aria-hidden="true"></span>' +
        '<span class="choice-label"></span>';
      qs(".choice-label", button).textContent = getOrderFormOptionLabel(option);
      button.addEventListener("click", function () {
        if (typeof store.setOption === "function") store.setOption("frameColor", option.id);
        state.selectionLabels.frameColor = option.label;
        setGroupSelectionVisual(group, option.label, option.id);
        window.setTimeout(function () {
          applyRealisticFrameColorSwatches(group);
          syncRuntimeViewer();
          schedulePartFocus("frameColor");
        }, 30);
      });
      grid.appendChild(button);
    });
    applyRealisticFrameColorSwatches(group);
  }

  function createOptionSchematic(moduleId, optionId) {
    if (["rearWheel", "handrim", "tyre", "rearWheelsBar", "frameColor"].indexOf(moduleId) >= 0) return null;
    const svg = document.createElement("span");
    svg.className = "wc-option-schematic";
    svg.dataset.optionId = optionId || "";
    svg.setAttribute("aria-hidden", "true");
    let drawing = "";
    if (moduleId === "frameAngle") {
      const angle = optionId === "fa-90" ? 90 : 100;
      drawing = '<path d="M17 48V25Q17 14 29 14H75"/><path d="M17 31L9 48"/><text x="55" y="38">' + angle + '°</text>';
    } else if (moduleId === "frameLength" || moduleId === "lateralFrame") {
      const long = /long|extended/.test(optionId);
      drawing = '<path d="M12 38H' + (long ? 84 : 68) + '"/><path d="M12 29V47M' + (long ? 84 : 68) + ' 29V47"/><path d="M20 19H' + (long ? 77 : 61) + '"/>';
    } else if (moduleId === "seatSetting") {
      drawing = optionId === "seat-crossed"
        ? '<path d="M15 14L81 50M37 14L81 38M15 26L59 50M15 50L81 14M15 38L59 14M37 50L81 26"/>'
        : '<rect x="15" y="14" width="66" height="36" rx="3"/><path d="M20 20H76M20 44H76"/>';
    } else if (moduleId === "footrestSetting") {
      drawing = optionId === "foot-none" ? '<path d="M16 17V45Q16 51 23 51H74Q81 51 81 44V17"/>' : '<path d="M16 14V41Q16 49 24 49H73Q81 49 81 41V14"/><rect x="25" y="28" width="47" height="15" rx="3"/>';
    } else if (moduleId === "frontWheel") {
      const size = (optionId.match(/fw-(\d)/) || [0, 4])[1];
      drawing = '<circle cx="48" cy="32" r="' + (Number(size) * 4 + 5) + '"/><circle cx="48" cy="32" r="3"/><text x="76" y="17">' + size + '″</text>';
    } else if (moduleId === "frontFork") {
      drawing = optionId === "ff-one-arm" ? '<path d="M35 9V41Q35 52 47 52H59"/><circle cx="59" cy="43" r="13"/>' : '<path d="M28 9V41Q28 52 40 52H56Q68 52 68 41V9"/><circle cx="48" cy="40" r="13"/>';
    } else if (moduleId === "brake") {
      drawing = '<path d="M20 45H67M35 45L56 18M52 18H76"/><circle cx="22" cy="45" r="5"/>';
    } else if (moduleId === "axle") {
      drawing = '<path d="M13 32H83"/><circle cx="20" cy="32" r="9"/><circle cx="76" cy="32" r="9"/><path d="M43 24L52 32L43 40"/>';
    } else if (moduleId === "backrestHandles") {
      drawing = optionId === "bh-none" ? '<path d="M30 49V17M66 49V17"/><path d="M21 14L75 52M75 14L21 52"/>' : '<path d="M29 50V19Q29 11 38 11H46M67 50V19Q67 11 76 11H84"/>';
    } else if (/^accessory/.test(moduleId)) {
      drawing = '<path d="M18 45H72L82 23"/><circle cx="27" cy="45" r="8"/><circle cx="67" cy="45" r="8"/><path d="M82 23L75 15M82 23L89 16"/>';
    } else {
      return null;
    }
    svg.innerHTML = '<svg viewBox="0 0 96 64" focusable="false"><g>' + drawing + '</g></svg>';
    return svg;
  }

  function decorateOrderFormOptions() {
    const english = getLang() === "en-US";
    const firstGroup = qs(".option-group", getConfiguratorCard());
    const groups = firstGroup && firstGroup.parentElement;
    if (groups) {
      let legend = qs(".wc-order-form-legend", groups);
      if (!legend) {
        legend = document.createElement("div");
        legend.className = "wc-order-form-legend";
        groups.insertBefore(legend, firstGroup);
      }
      const legendKey = english ? "en" : "zh";
      if (legend.dataset.lang !== legendKey) {
        legend.dataset.lang = legendKey;
        legend.innerHTML = english
          ? '<span><i></i>Standard choice</span><span class="is-extra"><i></i>Option with surcharge</span>'
          : '<span><i></i>标准免费项</span><span class="is-extra"><i></i>收费选配项</span>';
      }
    }
    qsa(".option-group", getConfiguratorCard()).forEach(function (group) {
      const moduleId = getGroupModuleId(group);
      const module = getModuleDefinition(moduleId);
      qsa(".choice-btn", group).forEach(function (button) {
        const optionId = button.dataset.optionId || "";
        const option = module && (module.options || []).find(function (item) { return item.id === optionId; });
        let badge = qs(".wc-price-type", button);
        if (!badge) {
          badge = document.createElement("span");
          badge.className = "wc-price-type";
          button.appendChild(badge);
        }
        const extra = ORDER_FORM_EXTRA_OPTIONS.has(optionId);
        if (badge.classList.contains("is-extra") !== extra) badge.classList.toggle("is-extra", extra);
        const badgeText = extra ? (english ? "Extra" : "加价") : (english ? "Standard" : "标准");
        if (badge.textContent !== badgeText) badge.textContent = badgeText;
        const badgeTitle = extra
          ? (english ? "Optional item with surcharge" : "收费选配项，具体金额以报价为准")
          : (english ? "Standard choice, no surcharge" : "标准免费选项");
        if (badge.title !== badgeTitle) badge.title = badgeTitle;
        const existingSchematic = qs(".wc-option-schematic", button);
        if (existingSchematic && existingSchematic.dataset.optionId !== optionId) {
          existingSchematic.remove();
        }
        if (!qs(".wc-option-schematic", button)) {
          const schematic = createOptionSchematic(moduleId, optionId);
          if (schematic) button.insertBefore(schematic, button.firstChild);
        }
        if (option && moduleId === "frameColor") {
          const label = qs(".choice-label", button);
          const nextLabel = getOrderFormOptionLabel(option);
          if (label && label.textContent !== nextLabel) label.textContent = nextLabel;
        }
      });
    });
  }

  function reflectSelectionsFromStore() {
    const store = getConfigStore();
    if (!store || !store.selection) {
      return;
    }
    annotateVisibleOptionButtons();
    qsa(".option-group", getConfiguratorCard()).forEach(function (group) {
      const moduleId = getGroupModuleId(group);
      if (!moduleId) {
        return;
      }
      const module = getModuleDefinition(moduleId);
      const selectedId = store.selection[moduleId];
      const selectedOption = module && module.options
        ? module.options.find(function (option) {
            return option.id === selectedId;
          })
        : null;
      if (selectedOption && selectedOption.label) {
        const selectedLabel = moduleId === "frameColor"
          ? getOrderFormOptionLabel(selectedOption)
          : selectedOption.label;
        setGroupSelectionVisual(group, selectedLabel, selectedOption.id);
      }
    });
    applyRealisticFrameColorSwatches();
  }

  function getActiveCategoryIndex() {
    return qsa(".category-btn", getConfiguratorCard()).findIndex(function (button) {
      return button.classList.contains("active");
    });
  }

  function isSeatUpholsteryCategoryActive() {
    return getActiveCategoryIndex() === 1;
  }

  function getSelectedOptionLabel(module, optionId) {
    if (!module || !module.options) {
      return "";
    }
    const selected = module.options.find(function (option) {
      return option.id === optionId;
    });
    return selected && selected.label ? selected.label : "";
  }

  function renderSyntheticSeatWidthGroup() {
    const card = getConfiguratorCard();
    const groupsWrap = qs(".option-groups", card);
    const store = getConfigStore();
    if (!card || !groupsWrap || !store) {
      return;
    }

    const existing = qs(".wc-synthetic-seat-width", groupsWrap);
    const nativeSeatWidthGroup = qsa(".option-group", groupsWrap).find(function (group) {
      return (
        group !== existing &&
        !group.classList.contains("wc-synthetic-seat-width") &&
        getGroupModuleId(group) === "seatWidth"
      );
    });
    if (nativeSeatWidthGroup) {
      if (existing) {
        existing.remove();
      }
      state.syntheticSeatWidthMarkup = "";
      return;
    }

    if (!isSeatUpholsteryCategoryActive()) {
      if (existing) {
        existing.remove();
      }
      state.syntheticSeatWidthMarkup = "";
      return;
    }

    const module = getModuleDefinition("seatWidth");
    if (!module || !module.options || !module.options.length) {
      if (existing) {
        existing.remove();
      }
      state.syntheticSeatWidthMarkup = "";
      return;
    }

    const selectedId = (store.selection && store.selection.seatWidth) || "";
    const selectedLabel = getSelectedOptionLabel(module, selectedId);
    const title = getSeatWidthDisplayTitle();
    const currentText = translateUiText(selectedLabel) || selectedLabel || "请选择...";

    const group = existing || document.createElement("section");
    group.className = "option-group wc-synthetic-seat-width";
    group.dataset.moduleId = "seatWidth";
    const markup =
      '<div class="option-header">' +
      '<div>' +
      '<div class="option-title">' + title + "</div>" +
      '<div class="option-code">seatWidth</div>' +
      "</div>" +
      '<div class="option-current">' + currentText + "</div>" +
      "</div>" +
      '<div class="choice-grid">' +
      module.options.map(function (option) {
        const active = option.id === selectedId ? " active" : "";
        const optionLabel = translateUiText(option.label) || option.label;
        return (
          '<button type="button" class="choice-btn' + active + '" data-option-id="' + option.id + '">' +
          '<span class="choice-label">' + optionLabel + "</span>" +
          '<span class="choice-meta">+0,00 €</span>' +
          "</button>"
        );
      }).join("") +
      "</div>";

    if (!existing || markup !== state.syntheticSeatWidthMarkup) {
      group.innerHTML = markup;
      state.syntheticSeatWidthMarkup = markup;
    }

    if (!existing) {
      groupsWrap.insertBefore(group, groupsWrap.firstElementChild || null);
    }

    qsa(".choice-btn", group).forEach(function (button) {
      if (button.dataset.wcBoundSyntheticChoice) {
        return;
      }
      button.dataset.wcBoundSyntheticChoice = "1";
      button.addEventListener("click", function () {
        const optionId = button.dataset.optionId;
        const configStore = getConfigStore();
        if (!configStore || typeof configStore.setOption !== "function" || !optionId) {
          return;
        }
        configStore.setOption("seatWidth", optionId);
        window.setTimeout(function () {
          renderSyntheticSeatWidthGroup();
          reflectSelectionsFromStore();
          syncVisibleSelections();
          syncSummaryExtras();
          syncRuntimeViewer();
        }, 80);
      });
    });
  }

  function normalizeText(value) {
    return (value || "")
      .toLowerCase()
      .replace(/\s+/g, " ")
      .trim();
  }

  function normalizeDesktopSeatWidthControl() {
    return;
  }

  function ensureSeatWidthDesktopGuard() {
    if (state.seatWidthDesktopGuardTimer) {
      window.clearInterval(state.seatWidthDesktopGuardTimer);
      state.seatWidthDesktopGuardTimer = 0;
    }
  }

  function renderSyntheticSeatWidthGroup() {
    const card = getConfiguratorCard();
    const groupsWrap = qs(".option-groups", card);
    const store = getConfigStore();
    if (!card || !groupsWrap || !store) {
      return;
    }

    const existing = qs(".wc-synthetic-seat-width", groupsWrap);
    const nativeSeatWidthGroup = qsa(".option-group", groupsWrap).find(function (group) {
      return (
        group !== existing &&
        !group.classList.contains("wc-synthetic-seat-width") &&
        getGroupModuleId(group) === "seatWidth"
      );
    });
    if (nativeSeatWidthGroup) {
      if (existing) {
        existing.remove();
      }
      state.syntheticSeatWidthMarkup = "";
      return;
    }

    if (!isSeatUpholsteryCategoryActive()) {
      if (existing) {
        existing.remove();
      }
      state.syntheticSeatWidthMarkup = "";
      return;
    }

    const module = getModuleDefinition("seatWidth");
    if (!module || !module.options || !module.options.length) {
      if (existing) {
        existing.remove();
      }
      state.syntheticSeatWidthMarkup = "";
      return;
    }

    const selectedId = (store.selection && store.selection.seatWidth) || "";
    const selectedLabel = getSelectedOptionLabel(module, selectedId);
    const title = getSeatWidthDisplayTitle();
    const currentText = translateUiText(selectedLabel) || selectedLabel || "Please choose...";

    const group = existing || document.createElement("section");
    group.className = "option-group wc-synthetic-seat-width";
    group.dataset.moduleId = "seatWidth";

    if (!existing) {
      group.innerHTML =
        '<div class="option-header">' +
        '<div>' +
        '<div class="option-title"></div>' +
        '<div class="option-code">seatWidth</div>' +
        "</div>" +
        '<div class="option-current"></div>' +
        "</div>" +
        '<div class="choice-grid"></div>';
      groupsWrap.insertBefore(group, groupsWrap.firstElementChild || null);
    }

    const titleNode = qs(".option-title", group);
    const currentNode = qs(".option-current", group);
    const gridNode = qs(".choice-grid", group);
    if (!titleNode || !currentNode || !gridNode) {
      return;
    }

    titleNode.textContent = title;
    currentNode.textContent = currentText;

    module.options.forEach(function (option) {
      let button = qs('.choice-btn[data-option-id="' + option.id + '"]', gridNode);
      const optionLabel = translateUiText(option.label) || option.label;
      if (!button) {
        button = document.createElement("button");
        button.type = "button";
        button.className = "choice-btn";
        button.dataset.optionId = option.id;
        button.innerHTML =
          '<span class="choice-label"></span>' +
          '<span class="choice-meta">+0,00 EUR</span>';
        gridNode.appendChild(button);
      }

      const labelNode = qs(".choice-label", button);
      if (labelNode) {
        labelNode.textContent = optionLabel;
      }
      button.classList.toggle("active", option.id === selectedId);

      if (!button.dataset.wcBoundSyntheticChoice) {
        button.dataset.wcBoundSyntheticChoice = "1";
        button.addEventListener("click", function () {
          const optionId = button.dataset.optionId;
          const configStore = getConfigStore();
          if (!configStore || typeof configStore.setOption !== "function" || !optionId) {
            return;
          }
          configStore.setOption("seatWidth", optionId);
          window.setTimeout(function () {
            renderSyntheticSeatWidthGroup();
            reflectSelectionsFromStore();
            syncVisibleSelections();
            syncSummaryExtras();
            syncRuntimeViewer();
          }, 80);
        });
      }
    });

    qsa(".choice-btn", gridNode).forEach(function (button) {
      if (!module.options.some(function (option) { return option.id === button.dataset.optionId; })) {
        button.remove();
      }
    });

    state.syntheticSeatWidthMarkup = module.options
      .map(function (option) {
        return option.id + ":" + (option.id === selectedId ? "1" : "0");
      })
      .join("|");

    setGroupSelectionVisual(group, selectedLabel, selectedId);
    if (currentNode && currentText) {
      currentNode.textContent = currentText;
    }
  }

  function includesAny(label, fragments) {
    return fragments.some(function (part) {
      return label.indexOf(part) >= 0;
    });
  }

  function isPlaceholderValue(value) {
    const text = (value || "").trim();
    if (!text) {
      return true;
    }
    return /^(请选择|please choose|not selected|\(not selected\)|—|-|暂无)/i.test(text);
  }

  function roundWeight(value) {
    return Math.round(value * 10) / 10;
  }

  function formatWeight(value) {
    return roundWeight(value).toFixed(1) + " " + tr("weightSuffix");
  }

  function parseMoneyCell() {
    const summaryCard = getSummaryCard();
    const totalRow = summaryCard && qsa("table tbody tr", summaryCard).slice(-1)[0];
    const valueCell = totalRow && totalRow.children[1];
    return valueCell ? valueCell.textContent.trim() : "—";
  }

  function getCurrentModelLabel() {
    return getActiveCardConfig().texts[getLang()].name;
  }

  function getSeatWidthDisplayTitle() {
    return getLang() === "en-US" ? "Seat Width (SW)" : "座椅宽度 (SW)";
  }

  function computeWeightDelta(moduleId, rawLabel) {
    const label = normalizeText(rawLabel);
    if (!label) {
      return 0;
    }
    switch (moduleId) {
      case "frameMaterial":
        return includesAny(label, ["镁", "magnesium", "magnes"]) ? -0.6 : 0;
      case "frameLength":
        return includesAny(label, ["加长", "long", "verl"]) ? 0.25 : 0;
      case "seatSetting":
        if (includesAny(label, ["carbon", "碳"])) return -0.25;
        if (includesAny(label, ["cross", "交叉"])) return 0.08;
        return 0;
      case "lateralFrame":
        if (includesAny(label, ["extend", "extended", "verl", "加长"])) return 0.18;
        if (includesAny(label, ["carbon", "碳"])) return -0.1;
        return 0;
      case "footrestSetting":
        if (includesAny(label, ["none", "ohne", "无"])) return -0.38;
        if (includesAny(label, ["carbon", "碳"])) return -0.12;
        if (includesAny(label, ["magnesium", "镁"])) return -0.08;
        return 0;
      case "frontFork":
        return includesAny(label, ["carbon", "碳"]) ? -0.08 : 0;
      case "rearWheel":
        if (includesAny(label, ["ultralight", "\u8d85\u8f7b"])) return -0.3;
        if (includesAny(label, ['22" light', '22" \u8f7b\u91cf'])) return -0.12;
        if (includesAny(label, ["large hub", "\u5927\u8f6e\u6bc2"])) return 0.18;
        if (includesAny(label, ["carbon", "cf"])) return -0.55;
        if (includesAny(label, ["24-big", "big", "大"])) return 0.18;
        if (includesAny(label, ["22-12"])) return -0.2;
        if (includesAny(label, ["22-18"])) return -0.12;
        return 0;
      case "handrim":
        return includesAny(label, ["carbon", "碳"]) ? -0.15 : 0;
      case "tyre":
        if (includesAny(label, ["offroad", "terrain", "越野"])) return 0.25;
        if (includesAny(label, ["light", "leicht", "轻"])) return -0.1;
        return 0;
      case "axle":
        return includesAny(label, ["titan", "钛"]) ? -0.05 : 0;
      case "rearWheelsBar":
        return includesAny(label, ["4°", "4° camber", "4° sturz"]) ? 0.06 : 0;
      case "brake":
        return includesAny(label, ["light", "leicht", "轻"]) ? -0.12 : 0;
      case "accessoryAntitipp":
        return includesAny(label, ["yes", "ja", "有", "standard"]) ? 0.35 : 0;
      case "accessoryTippingHelp":
        return includesAny(label, ["yes", "ja", "有", "standard"]) ? 0.2 : 0;
      case "accessoryTransitWheels":
        return includesAny(label, ["yes", "ja", "有", "standard"]) ? 0.5 : 0;
      default:
        return 0;
    }
  }

  function computeWeight() {
    const base = WEIGHT_BASE[state.cardId || state.sourceModel || "S5"] || WEIGHT_BASE.S5;
    const optionDelta = Object.keys(state.selectionLabels).reduce(function (total, moduleId) {
      return total + computeWeightDelta(moduleId, state.selectionLabels[moduleId]);
    }, 0);
    return roundWeight(base + optionDelta);
  }

  function ensureModelStage() {
    const container = getRootContainer();
    const grid = getGrid();
    if (!container || !grid) {
      return null;
    }
    let stage = qs(".wc-model-stage", container);
    if (!stage) {
      stage = document.createElement("section");
      stage.className = "wc-model-stage";
      container.insertBefore(stage, grid);
    }
    return stage;
  }

  function renderModelStage() {
    const stage = ensureModelStage();
    if (!stage) {
      return;
    }
    stage.innerHTML =
      '<div class="card wc-stage-header">' +
      '<div class="wc-stage-kicker">' + tr("stageKicker") + "</div>" +
      '<div class="wc-stage-title">' + tr("stageTitle") + "</div>" +
      '<div class="wc-stage-copy">' + tr("stageCopy") + "</div>" +
      "</div>" +
      '<div class="wc-model-grid">' +
      MODEL_CARDS.map(function (card) {
        const copy = card.texts[getLang()];
        return (
          '<article class="wc-model-card" data-card-id="' + card.id + '">' +
          '<div class="wc-model-badge">' + copy.badge + "</div>" +
          '<div class="wc-model-hero">' + heroSvg(card.accent) + "</div>" +
          '<div class="wc-model-name">' + copy.name + "</div>" +
          '<div class="wc-model-copy">' + copy.blurb + "</div>" +
          '<ul class="wc-model-points">' +
          copy.points.map(function (point) {
            return "<li>" + point + "</li>";
          }).join("") +
          "</ul>" +
          '<button class="btn wc-model-enter" type="button">' + tr("stageEnter") + "</button>" +
          "</article>"
        );
      }).join("") +
      "</div>";
  }

  function ensureToolbar() {
    const container = getRootContainer();
    const grid = getGrid();
    const header = getHeaderCard();
    if (!container || !grid) {
      return null;
    }
    let toolbar = qs(".wc-inline-toolbar", container);
    if (!toolbar) {
      toolbar = document.createElement("section");
      toolbar.className = "wc-inline-toolbar wc-hidden-source";
      toolbar.innerHTML =
        '<div class="wc-inline-copy-wrap">' +
        '<div class="wc-inline-eyebrow"></div>' +
        '<div class="wc-inline-title"></div>' +
        '<div class="wc-inline-copy"></div>' +
        "</div>" +
        '<button class="btn secondary wc-switch-model" type="button"></button>';
    }

    // Keep the selected-model context inside the primary page header instead
    // of presenting it as a second, visually competing header card.
    if (header && toolbar.parentNode !== header) {
      header.appendChild(toolbar);
    } else if (!header && toolbar.parentNode !== container) {
      container.insertBefore(toolbar, grid);
    }
    return toolbar;
  }

  function renderToolbar() {
    const toolbar = ensureToolbar();
    if (!toolbar) {
      return;
    }
    const card = getActiveCardConfig();
    const text = card.texts[getLang()];
    qs(".wc-inline-eyebrow", toolbar).textContent = tr("toolbarEyebrow");
    qs(".wc-inline-title", toolbar).textContent = text.name;
    qs(".wc-inline-copy", toolbar).textContent = text.blurb;
    qs(".wc-switch-model", toolbar).textContent = tr("switchModel");
  }

  function syncStageVisibility() {
    const stage = qs(".wc-model-stage");
    const grid = getGrid();
    const toolbar = qs(".wc-inline-toolbar");
    const isConfigActive = document.body.classList.contains("wc-config-active");

    if (stage) {
      stage.hidden = isConfigActive;
      stage.style.display = isConfigActive ? "none" : "";
    }
    if (grid) {
      grid.hidden = !isConfigActive;
      grid.style.display = isConfigActive ? "" : "none";
    }
    if (toolbar) {
      toolbar.hidden = !isConfigActive;
      toolbar.style.display = isConfigActive ? "" : "none";
    }
  }

  function isMobileViewport() {
    return window.innerWidth <= 768;
  }

  function ensureMobileLanguageSwitch() {
    const header = getHeaderCard();
    if (!header) {
      return null;
    }
    let bar = qs(".wc-mobile-lang-switch", header);
    if (!bar) {
      bar = document.createElement("div");
      bar.className = "wc-mobile-lang-switch";
      bar.innerHTML =
        '<button type="button" class="wc-mobile-lang-btn" data-lang="zh-CN">中文</button>' +
        '<button type="button" class="wc-mobile-lang-btn" data-lang="en-US">EN</button>';
      header.appendChild(bar);
    }
    return bar;
  }

  function renderMobileLanguageSwitch() {
    const bar = ensureMobileLanguageSwitch();
    const select = getLangSelect();
    if (!bar || !select) {
      return;
    }
    const current = getLang();
    qsa(".wc-mobile-lang-btn", bar).forEach(function (button) {
      const lang = button.getAttribute("data-lang");
      button.classList.toggle("active", lang === current);
      if (!button.dataset.wcLangBound) {
        button.dataset.wcLangBound = "1";
        button.addEventListener("click", function () {
          dispatchNativeSelect(select, lang);
        });
      }
    });
  }

  function ensureMobileConfigBar() {
    const container = getRootContainer();
    const grid = getGrid();
    if (!container || !grid) {
      return null;
    }
    let bar = qs(".wc-mobile-config-bar", container);
    if (!bar) {
      bar = document.createElement("section");
      bar.className = "wc-mobile-config-bar wc-hidden-source";
      bar.innerHTML =
        '<div class="wc-mobile-config-start">' +
        '<div class="wc-mobile-config-lang"></div>' +
        '<button type="button" class="btn secondary wc-switch-model wc-mobile-switch-model"></button>' +
        "</div>" +
        '<button type="button" class="wc-mobile-config-summary wc-mobile-summary-toggle">' +
        '<span class="wc-mobile-config-total-row">' +
        '<span class="wc-mobile-config-total"></span>' +
        '<span class="wc-mobile-config-summary-icon">' + summaryIconSvg() + "</span>" +
        "</span>" +
        '<span class="wc-mobile-config-meta-row">' +
        '<span class="wc-mobile-config-weight"></span>' +
        '<span class="wc-mobile-summary-text"></span>' +
        "</span>" +
        "</button>";
      container.insertBefore(bar, grid);
    }
    return bar;
  }

  function ensureMobileViewerControls() {
    const card = getConfiguratorCard();
    const viewer = qs(".model-viewer", card);
    if (!card || !viewer) {
      return null;
    }
    let toggle = qs(".wc-mobile-viewer-corner-toggle", viewer);
    if (!toggle) {
      toggle = document.createElement("button");
      toggle.type = "button";
      toggle.className = "wc-mobile-viewer-corner-toggle";
      viewer.appendChild(toggle);
    }
    let restore = qs(".wc-mobile-viewer-restore", card);
    if (!restore) {
      restore = document.createElement("button");
      restore.type = "button";
      restore.className = "wc-mobile-viewer-restore";
      restore.innerHTML =
        '<span class="wc-mobile-viewer-restore-icon">' + viewerToggleIconSvg("restore") + "</span>" +
        '<span class="wc-mobile-viewer-restore-text"></span>';
      viewer.insertAdjacentElement("afterend", restore);
    }
    return { toggle: toggle, restore: restore };
  }

  function renderMobileViewerState() {
    const isActive = document.body.classList.contains("wc-config-active") && isMobileViewport();
    const controls = ensureMobileViewerControls();
    const toggle = controls && controls.toggle;
    const restore = controls && controls.restore;
    const nextState = !!(isActive && state.viewerMinimized);

    document.body.classList.toggle("wc-mobile-viewer-minimized", nextState);

    if (toggle) {
      toggle.hidden = !isActive || nextState;
      toggle.innerHTML = viewerToggleIconSvg("minimize");
      toggle.setAttribute("aria-label", tr("viewerMinimize"));
    }

    if (restore) {
      restore.hidden = !nextState;
      qs(".wc-mobile-viewer-restore-text", restore).textContent = tr("viewerRestore");
      restore.setAttribute("aria-label", tr("viewerRestore"));
    }

    window.requestAnimationFrame(updateMobileStickyMetrics);
  }

  function renderMobileConfigBar() {
    const bar = ensureMobileConfigBar();
    const select = getLangSelect();
    if (!bar || !select) {
      updateMobileStickyMetrics();
      return;
    }

    const isActive = document.body.classList.contains("wc-config-active");
    bar.classList.toggle("wc-hidden-source", !isActive);

    const langWrap = qs(".wc-mobile-config-lang", bar);
    if (!langWrap.dataset.wcInit) {
      langWrap.dataset.wcInit = "1";
      langWrap.innerHTML =
        '<button type="button" class="wc-mobile-config-lang-btn" data-lang="zh-CN">中文</button>' +
        '<button type="button" class="wc-mobile-config-lang-btn" data-lang="en-US">EN</button>';
    }

    const current = getLang();
    qsa(".wc-mobile-config-lang-btn", langWrap).forEach(function (button) {
      const lang = button.getAttribute("data-lang");
      button.classList.toggle("active", lang === current);
      if (!button.dataset.wcLangBound) {
        button.dataset.wcLangBound = "1";
        button.addEventListener("click", function () {
          dispatchNativeSelect(select, lang);
        });
      }
    });

    qs(".wc-mobile-switch-model", bar).textContent = tr("switchModel");
    renderMobileViewerState();
    qs(".wc-mobile-config-total", bar).textContent = parseMoneyCell();
    qs(".wc-mobile-config-weight", bar).textContent = tr("weightMeta") + ": " + formatWeight(computeWeight());
    qs(".wc-mobile-summary-text", bar).textContent = document.body.classList.contains("wc-summary-open")
      ? tr("summaryClose")
      : tr("summaryButton");
    qs(".wc-mobile-summary-toggle", bar).setAttribute(
      "aria-label",
      parseMoneyCell() + " " + (document.body.classList.contains("wc-summary-open") ? tr("summaryClose") : tr("summaryButton"))
    );

    window.requestAnimationFrame(updateMobileStickyMetrics);
  }

  function updateMobileStickyMetrics() {
    const isActive = document.body.classList.contains("wc-config-active") && isMobileViewport();
    const bar = qs(".wc-mobile-config-bar");
    const viewer = qs(".model-viewer", getConfiguratorCard());
    const restore = qs(".wc-mobile-viewer-restore", getConfiguratorCard());
    const barHeight = isActive && bar ? Math.ceil(bar.getBoundingClientRect().height) : 0;
    const viewerHeight = isActive
      ? Math.ceil(
          state.viewerMinimized
            ? ((restore && !restore.hidden && restore.getBoundingClientRect().height) || 0)
            : ((viewer && viewer.getBoundingClientRect().height) || 0)
        )
      : 0;
    const stackHeight = isActive ? barHeight + viewerHeight + 28 : 0;

    document.documentElement.style.setProperty("--wc-mobile-config-bar-height", barHeight + "px");
    document.documentElement.style.setProperty("--wc-mobile-viewer-height", viewerHeight + "px");
    document.documentElement.style.setProperty("--wc-mobile-sticky-stack-height", stackHeight + "px");
  }

  function ensureSummaryUI() {
    let trigger = qs(".wc-summary-trigger");
    if (!trigger) {
      trigger = document.createElement("button");
      trigger.type = "button";
      trigger.className = "wc-summary-trigger";
      trigger.innerHTML =
        '<div class="wc-summary-main">' +
        '<div class="wc-summary-label"></div>' +
        '<div class="wc-summary-total"></div>' +
        '<div class="wc-summary-meta"></div>' +
        "</div>" +
        '<span class="btn secondary wc-summary-cta">' +
        '<span class="wc-summary-cta-icon">' + summaryIconSvg() + "</span>" +
        '<span class="wc-summary-cta-text"></span>' +
        "</span>";
      document.body.appendChild(trigger);
    }
    let backdrop = qs(".wc-summary-backdrop");
    if (!backdrop) {
      backdrop = document.createElement("div");
      backdrop.className = "wc-summary-backdrop";
      backdrop.hidden = true;
      document.body.appendChild(backdrop);
    }
    return { trigger: trigger, backdrop: backdrop };
  }

  function ensureDesktopSummaryDrawer() {
    let toggle = qs(".wc-desktop-summary-toggle");
    if (!toggle) {
      toggle = document.createElement("button");
      toggle.type = "button";
      toggle.className = "wc-desktop-summary-toggle";
      toggle.innerHTML =
        '<span class="wc-desktop-summary-toggle-icon">' + summaryIconSvg() + "</span>" +
        '<span class="wc-desktop-summary-toggle-text"></span>';
      document.body.appendChild(toggle);
    }
    return toggle;
  }

  function renderDesktopSummaryDrawer() {
    const toggle = ensureDesktopSummaryDrawer();
    const isDesktop =
      document.body.classList.contains("wc-config-active") &&
      !isMobileViewport() &&
      !!getSummaryCard();

    document.body.classList.toggle("wc-desktop-summary-open", !!(isDesktop && state.desktopSummaryOpen));
    toggle.hidden = !isDesktop;
    if (toggle.hidden) {
      return;
    }
    const textNode = qs(".wc-desktop-summary-toggle-text", toggle);
    if (textNode) {
      textNode.textContent = state.desktopSummaryOpen ? tr("desktopQuoteClose") : tr("desktopQuoteOpen");
    }
    toggle.setAttribute(
      "aria-label",
      state.desktopSummaryOpen ? tr("desktopQuoteClose") : tr("desktopQuoteOpen")
    );
  }

  function ensureMobileCategoryDock() {
    let dock = qs(".wc-mobile-category-dock");
    if (!dock) {
      dock = document.createElement("div");
      dock.className = "wc-mobile-category-dock";
      dock.hidden = true;
      dock.innerHTML =
        '<button type="button" class="wc-mobile-category-arrow is-prev" aria-label="Previous categories">‹</button>' +
        '<div class="wc-mobile-category-track"></div>' +
        '<button type="button" class="wc-mobile-category-arrow is-next" aria-label="Next categories">›</button>';
      document.body.appendChild(dock);

      const track = qs(".wc-mobile-category-track", dock);
      track.addEventListener("scroll", function () {
        updateMobileCategoryDockState();
      }, { passive: true });

      qsa(".wc-mobile-category-arrow", dock).forEach(function (arrow) {
        arrow.addEventListener("click", function () {
          const direction = arrow.classList.contains("is-prev") ? -1 : 1;
          const switched = switchMobileCategoryByOffset(direction);
          if (!switched) {
            track.scrollBy({
              left: direction * Math.max(180, track.clientWidth * 0.7),
              behavior: "smooth",
            });
          }
        });
      });
    }
    return dock;
  }

  function updateMobileCategoryDockState() {
    const dock = qs(".wc-mobile-category-dock");
    if (!dock || dock.hidden) {
      return;
    }
    const track = qs(".wc-mobile-category-track", dock);
    const prev = qs(".wc-mobile-category-arrow.is-prev", dock);
    const next = qs(".wc-mobile-category-arrow.is-next", dock);
    const overflow = track.scrollWidth > track.clientWidth + 6;
    const atStart = track.scrollLeft <= 4;
    const atEnd = track.scrollLeft + track.clientWidth >= track.scrollWidth - 4;
    const activeIndex = getActiveMobileCategoryIndex();
    const buttons = getMobileNativeCategoryButtons();
    const atFirstCategory = activeIndex <= 0;
    const atLastCategory = activeIndex >= buttons.length - 1;

    dock.classList.toggle("is-overflowing", overflow);
    prev.disabled = !overflow || (atStart && atFirstCategory);
    next.disabled = !overflow || (atEnd && atLastCategory);
  }

  function ensureActiveMobileCategoryChipVisible(behavior) {
    const dock = qs(".wc-mobile-category-dock");
    if (!dock || dock.hidden) {
      return;
    }
    const track = qs(".wc-mobile-category-track", dock);
    const activeChip =
      (state.mobilePendingCategoryIndex >= 0 &&
        qs('.wc-mobile-category-chip[data-index="' + state.mobilePendingCategoryIndex + '"]', track)) ||
      qs(".wc-mobile-category-chip.active", track);
    if (!track || !activeChip) {
      return;
    }

    const chipLeft = activeChip.offsetLeft;
    const chipRight = chipLeft + activeChip.offsetWidth;
    const visibleLeft = track.scrollLeft;
    const visibleRight = visibleLeft + track.clientWidth;
    const padding = 20;
    const alreadyVisible = chipLeft >= visibleLeft + padding && chipRight <= visibleRight - padding;

    if (alreadyVisible) {
      return;
    }
    activeChip.scrollIntoView({
      behavior: behavior === "instant" ? "auto" : behavior || "smooth",
      inline: "center",
      block: "nearest",
    });
  }

  function scheduleActiveMobileCategoryChipAlignment(behavior) {
    while (state.mobileChipAlignTimers.length) {
      window.clearTimeout(state.mobileChipAlignTimers.pop());
    }

    [40, 180, 340].forEach(function (delay, index) {
      const timer = window.setTimeout(function () {
        ensureActiveMobileCategoryChipVisible(index === 0 ? behavior : "auto");
        updateMobileCategoryDockState();
      }, delay);
      state.mobileChipAlignTimers.push(timer);
    });
  }

  function queuePendingMobileCategoryVisibilitySync() {
    [120, 260, 420].forEach(function (delay, index) {
      window.setTimeout(function () {
        ensureActiveMobileCategoryChipVisible(index === 0 ? "smooth" : "instant");
        updateMobileCategoryDockState();
      }, delay);
    });
  }

  function getMobileNativeCategoryButtons() {
    return qsa(".category-btn", getConfiguratorCard());
  }

  function triggerNativeCategoryButton(button) {
    if (!button) {
      return false;
    }
    button.dispatchEvent(new MouseEvent("click", {
      bubbles: true,
      cancelable: true,
      view: window,
    }));
    return true;
  }

  function getActiveMobileCategoryIndex() {
    return getMobileNativeCategoryButtons().findIndex(function (button) {
      return button.classList.contains("active");
    });
  }

  function scheduleMobileCategoryTransitionClear() {
    if (state.mobileCategoryTransitionTimer) {
      window.clearTimeout(state.mobileCategoryTransitionTimer);
    }
    state.mobileCategoryTransitionTimer = window.setTimeout(function () {
      state.mobileCategoryTransitionDirection = "";
      const dock = qs(".wc-mobile-category-dock");
      const card = getConfiguratorCard();
      if (dock) {
        dock.classList.remove("is-transitioning", "is-transitioning-next", "is-transitioning-prev");
      }
      if (card) {
        card.classList.remove("wc-mobile-content-transition", "is-transitioning-next", "is-transitioning-prev");
      }
    }, 420);
  }

  function triggerMobileCategoryTransition(direction) {
    state.mobileCategoryTransitionDirection = direction === "prev" ? "prev" : "next";
    const card = getConfiguratorCard();
    if (card) {
      card.classList.remove("wc-mobile-content-transition", "is-transitioning-next", "is-transitioning-prev");
      void card.offsetWidth;
      card.classList.add(
        "wc-mobile-content-transition",
        direction === "prev" ? "is-transitioning-prev" : "is-transitioning-next"
      );
    }
    scheduleMobileCategoryTransitionClear();
  }

  function switchMobileCategoryByOffset(offset) {
    if (!document.body.classList.contains("wc-config-active") || !isMobileViewport() || document.body.classList.contains("wc-summary-open")) {
      return false;
    }
    const buttons = getMobileNativeCategoryButtons();
    if (!buttons.length) {
      return false;
    }
    const currentIndex = getActiveMobileCategoryIndex();
    const nextIndex = Math.max(0, Math.min(buttons.length - 1, (currentIndex < 0 ? 0 : currentIndex) + offset));
    if (nextIndex === currentIndex || !buttons[nextIndex]) {
      return false;
    }
    const dock = qs(".wc-mobile-category-dock");
    const track = dock && qs(".wc-mobile-category-track", dock);
    const currentChip =
      track &&
      (qs('.wc-mobile-category-chip[data-index="' + (currentIndex < 0 ? 0 : currentIndex) + '"]', track) ||
        qs(".wc-mobile-category-chip.active", track));
    const scrollStep = currentChip ? currentChip.offsetWidth + 18 : 108;

    state.mobilePendingCategoryIndex = nextIndex;
    triggerMobileCategoryTransition(offset < 0 ? "prev" : "next");
    triggerNativeCategoryButton(buttons[nextIndex]);
    if (track) {
      track.scrollBy({
        left: offset * scrollStep,
        behavior: "smooth",
      });
    }
    queuePendingMobileCategoryVisibilitySync();
    window.setTimeout(function () {
      scrollCategoryContentToTop("smooth");
    }, 130);
    if (dock) {
      dock.classList.add("is-transitioning", offset < 0 ? "is-transitioning-prev" : "is-transitioning-next");
    }
    return true;
  }

  function switchCategoryByOffset(offset) {
    if (!document.body.classList.contains("wc-config-active") || document.body.classList.contains("wc-summary-open")) {
      return false;
    }
    if (isMobileViewport()) {
      return switchMobileCategoryByOffset(offset);
    }

    const buttons = getMobileNativeCategoryButtons();
    const currentIndex = getActiveMobileCategoryIndex();
    const nextIndex = currentIndex + offset;
    if (currentIndex < 0 || nextIndex < 0 || nextIndex >= buttons.length) {
      return false;
    }

    triggerNativeCategoryButton(buttons[nextIndex]);
    window.setTimeout(function () {
      scrollCategoryContentToTop("smooth");
    }, 130);
    return true;
  }

  function getBoundaryGestureTarget(target) {
    if (!target || !target.closest) {
      return null;
    }
    if (target.closest(".model-viewer, .wc-desktop-category-rail, .wc-mobile-category-dock, .wc-mobile-config-bar, .wc-summary-backdrop, .wc-object-tuner")) {
      return null;
    }
    const card = getConfiguratorCard();
    const optionsPanel = card && (qs(".wc-desktop-options-panel", card) || qs(".option-groups", card));
    return optionsPanel && optionsPanel.contains(target) ? optionsPanel : null;
  }

  function getCategoryContentBoundaryState() {
    const card = getConfiguratorCard();
    const optionsPanel = card && (qs(".wc-desktop-options-panel", card) || qs(".option-groups", card));
    const anchor = optionsPanel && (qs(".option-groups", optionsPanel) || optionsPanel);
    if (!optionsPanel || !anchor) {
      return { atTop: false, atBottom: false };
    }

    if (!isMobileViewport() && optionsPanel.classList.contains("wc-desktop-options-panel")) {
      const maxScrollTop = Math.max(0, optionsPanel.scrollHeight - optionsPanel.clientHeight);
      return {
        atTop: optionsPanel.scrollTop <= 3,
        atBottom: maxScrollTop <= 3 || optionsPanel.scrollTop >= maxScrollTop - 3,
      };
    }

    const anchorRect = anchor.getBoundingClientRect();
    const panelRect = optionsPanel.getBoundingClientRect();
    const stickyOffset = isMobileViewport()
      ? (parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--wc-mobile-sticky-stack-height")) || 0) + 10
      : 18;
    const dock = isMobileViewport() ? qs(".wc-mobile-category-dock:not([hidden])") : null;
    const bottomInset = dock ? dock.getBoundingClientRect().height + 12 : 18;
    const anchorDocumentTop = window.scrollY + anchorRect.top;
    const topScrollPosition = Math.max(0, anchorDocumentTop - stickyOffset);

    return {
      atTop: window.scrollY <= topScrollPosition + 6,
      atBottom: panelRect.bottom <= window.innerHeight - bottomInset + 6,
    };
  }

  function resetBoundaryWheelAmount() {
    state.boundaryWheelAmount = 0;
    state.boundaryWheelDirection = 0;
    if (state.boundaryWheelResetTimer) {
      window.clearTimeout(state.boundaryWheelResetTimer);
      state.boundaryWheelResetTimer = 0;
    }
  }

  function queueBoundaryWheelReset() {
    if (state.boundaryWheelResetTimer) {
      window.clearTimeout(state.boundaryWheelResetTimer);
    }
    state.boundaryWheelResetTimer = window.setTimeout(resetBoundaryWheelAmount, 260);
  }

  function tryBoundaryCategorySwitch(direction) {
    if (Date.now() < state.boundarySwitchLockUntil) {
      return false;
    }
    if (!switchCategoryByOffset(direction)) {
      return false;
    }
    state.boundarySwitchLockUntil = Date.now() + 760;
    resetBoundaryWheelAmount();
    return true;
  }

  function syncCategoryTitleVisibility() {
    const leftCard = getConfiguratorCard();
    if (!leftCard) {
      return;
    }
    const grid = qs(".category-grid", leftCard);
    const title = grid && grid.previousElementSibling;
    if (title && title.classList && title.classList.contains("section-title")) {
      title.classList.toggle(
        "wc-hidden-mobile-category-title",
        document.body.classList.contains("wc-config-active") && isMobileViewport()
      );
    }
  }

  function scrollCategoryContentToTop(behavior) {
    while (state.categoryScrollTimers.length) {
      window.clearTimeout(state.categoryScrollTimers.pop());
    }

    const align = function (scrollBehavior) {
      const card = getConfiguratorCard();
      const anchor = qs(".option-groups", card) || qs(".option-group", card);
      if (!anchor) {
        return;
      }
      const desktopOptionsPanel = qs(".wc-desktop-options-panel", card);
      if (!isMobileViewport() && desktopOptionsPanel) {
        const previousInlineBehavior = desktopOptionsPanel.style.scrollBehavior;
        desktopOptionsPanel.style.scrollBehavior = "auto";
        desktopOptionsPanel.scrollTop = 0;
        window.requestAnimationFrame(function () {
          desktopOptionsPanel.style.scrollBehavior = previousInlineBehavior;
        });
        return;
      }
      anchor.classList.add("wc-option-anchor");
      const stickyOffset = isMobileViewport() && document.body.classList.contains("wc-config-active")
        ? (parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--wc-mobile-sticky-stack-height")) || 0) + 10
        : 18;
      const targetTop = Math.max(0, window.scrollY + anchor.getBoundingClientRect().top - stickyOffset);
      window.scrollTo({
        top: targetTop,
        behavior: scrollBehavior || "auto",
      });
    };

    const delays = behavior === "smooth" ? [0, 140, 300] : [0];
    delays.forEach(function (delay, index) {
      const timer = window.setTimeout(function () {
        align(index === 0 ? behavior : "auto");
      }, delay);
      state.categoryScrollTimers.push(timer);
    });
  }

  const CATEGORY_ICON_KEYS = [
    "frame",
    "seat",
    "backrest",
    "sideguard",
    "footrest",
    "frontWheel",
    "rearWheel",
    "brake",
    "accessory",
  ];

  function categoryAccentSvg(key) {
    const accents = {
      frame: '<path class="accent" d="M22 18.5h21l8 21H35L22 18.5Z"/><path class="accent" d="M35 39.5h16"/>',
      seat: '<path class="accent accent-fill" d="M21 16.5h23.5l2 6H24Z"/>',
      backrest: '<path class="accent accent-fill" d="M35 5.5h9l2.5 14H39Z"/>',
      sideguard: '<path class="accent accent-fill" d="M27 11.5h15v5H29Z"/><path class="accent" d="M30 16.5v9"/>',
      footrest: '<path class="accent" d="M51 39.5l7 5"/><path class="accent accent-fill" d="M56 42h12v5H58Z"/>',
      frontWheel: '<circle class="accent" cx="58" cy="43" r="7"/><circle class="accent accent-fill" cx="58" cy="43" r="1.8"/>',
      rearWheel: '<circle class="accent" cx="22" cy="34" r="17"/><circle class="accent accent-fill" cx="22" cy="34" r="2"/>',
      brake: '<path class="accent" d="M13 16l10 4 7-2"/><path class="accent" d="M23 20l4 7"/><circle class="accent accent-fill" cx="13" cy="16" r="2"/>',
      accessory: '<path class="accent accent-fill" d="M58 3l2.2 4.5 5 .7-3.6 3.5.9 5-4.5-2.4-4.5 2.4.9-5-3.6-3.5 5-.7Z"/><path class="accent" d="M46 39.5h9l5 5"/>',
    };
    return accents[key] || accents.frame;
  }

  function categoryIconSvg(key) {
    return [
      '<svg viewBox="0 0 72 58" aria-hidden="true" focusable="false">',
      '<g class="base">',
      '<circle cx="22" cy="34" r="17"/>',
      '<circle cx="58" cy="43" r="6"/>',
      '<path d="M22 18.5h21l8 21H35"/>',
      '<path d="M35 5.5l4 14"/>',
      '<path d="M35 5.5h8.5"/>',
      '<path d="M43 19l8 20 7 4"/>',
      '<path d="M27 12.5h15"/>',
      '<path d="M51 39.5l7 5"/>',
      '</g>',
      categoryAccentSvg(key),
      '</svg>',
    ].join("");
  }

  function syncCategoryIcons() {
    qsa(".category-btn", getConfiguratorCard()).forEach(function (button, index) {
      const iconNode = qs(".category-icon", button);
      if (!iconNode) {
        return;
      }
      const key = CATEGORY_ICON_KEYS[index] || "frame";
      if (iconNode.getAttribute("data-wc-category-icon") === key) {
        return;
      }
      iconNode.setAttribute("data-wc-category-icon", key);
      iconNode.innerHTML = categoryIconSvg(key);
    });
  }

  function buildMobileCategoryChip(button, index) {
    const chip = document.createElement("button");
    chip.type = "button";
    chip.className = "wc-mobile-category-chip";
    chip.setAttribute("data-index", String(index));
    chip.addEventListener("click", function () {
      const targetIndex = Number(chip.getAttribute("data-index"));
      const target = getMobileNativeCategoryButtons()[targetIndex];
      if (!target) {
        return;
      }
      state.mobilePendingCategoryIndex = targetIndex;
      triggerNativeCategoryButton(target);
      chip.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
      queuePendingMobileCategoryVisibilitySync();
    });
    syncMobileCategoryChip(chip, button, index);
    return chip;
  }

  function syncMobileCategoryChip(chip, button, index) {
    const labelNode = qsa("span", button).slice(-1)[0];
    const label = (labelNode || button).textContent.trim();
    const iconNode = qs(".category-icon", button);
    const active = button.classList.contains("active");
    chip.setAttribute("data-index", String(index));
    chip.classList.toggle("active", active);
    chip.innerHTML = "";

    if (iconNode) {
      const icon = document.createElement("span");
      icon.className = "wc-mobile-category-icon";
      icon.setAttribute("aria-hidden", "true");
      icon.innerHTML = iconNode.innerHTML;
      chip.appendChild(icon);
    }

    const labelSpan = document.createElement("span");
    labelSpan.className = "wc-mobile-category-label";
    labelSpan.textContent = label;
    chip.appendChild(labelSpan);
  }

  function renderMobileCategoryDock() {
    syncCategoryIcons();
    const dock = ensureMobileCategoryDock();
    const track = qs(".wc-mobile-category-track", dock);
    const nativeButtons = qsa(".category-btn", getConfiguratorCard());
    const shouldShow =
      document.body.classList.contains("wc-config-active") &&
      isMobileViewport() &&
      nativeButtons.length > 0;

    dock.hidden = !shouldShow;
    syncCategoryTitleVisibility();
    if (!shouldShow) {
      return;
    }

    const existingChips = qsa(".wc-mobile-category-chip", track);
    nativeButtons.forEach(function (button, index) {
      const chip = existingChips[index] || buildMobileCategoryChip(button, index);
      syncMobileCategoryChip(chip, button, index);
      if (!chip.parentElement) {
        track.appendChild(chip);
      }
    });

    existingChips.slice(nativeButtons.length).forEach(function (chip) {
      chip.remove();
    });

    ensureActiveMobileCategoryChipVisible("instant");

    if (state.mobileCategoryTransitionDirection) {
      dock.classList.add("is-transitioning", state.mobileCategoryTransitionDirection === "prev" ? "is-transitioning-prev" : "is-transitioning-next");
      const activeChip = qs(".wc-mobile-category-chip.active", track);
      if (activeChip) {
        activeChip.classList.add("is-just-activated");
      }
      scheduleMobileCategoryTransitionClear();
    } else {
      dock.classList.remove("is-transitioning", "is-transitioning-next", "is-transitioning-prev");
    }

    window.requestAnimationFrame(function () {
      window.requestAnimationFrame(function () {
        ensureActiveMobileCategoryChipVisible(
          state.mobileCategoryTransitionDirection ? "smooth" : "instant"
        );
        updateMobileCategoryDockState();
      });
    });

    scheduleActiveMobileCategoryChipAlignment(
      state.mobileCategoryTransitionDirection ? "smooth" : "auto"
    );
  }

  function renderSummaryTrigger() {
    const ui = ensureSummaryUI();
    const total = parseMoneyCell();
    const weight = formatWeight(computeWeight());
    qs(".wc-summary-label", ui.trigger).textContent = tr("summaryLabel");
    qs(".wc-summary-total", ui.trigger).textContent = total;
    qs(".wc-summary-meta", ui.trigger).textContent = tr("weightMeta") + ": " + weight;
    qs(".wc-summary-cta-text", ui.trigger).textContent = document.body.classList.contains("wc-summary-open")
      ? tr("summaryClose")
      : tr("summaryButton");
    ui.trigger.hidden = true;
    ui.backdrop.hidden = !isMobileViewport() || !document.body.classList.contains("wc-summary-open");
    renderDesktopSummaryDrawer();
    renderMobileConfigBar();
    renderMobileCategoryDock();
  }

  function toggleSummary(open) {
    const next = typeof open === "boolean" ? open : !document.body.classList.contains("wc-summary-open");
    document.body.classList.toggle("wc-summary-open", next);
    state.summaryOpen = next;
    renderSummaryTrigger();
  }

  function toggleDesktopSummaryDrawer(open) {
    const next = typeof open === "boolean" ? open : !state.desktopSummaryOpen;
    state.desktopSummaryOpen = !!next;
    renderDesktopSummaryDrawer();
  }

  function toggleMobileViewer(force) {
    const next = typeof force === "boolean" ? force : !state.viewerMinimized;
    state.viewerMinimized = next;
    renderMobileViewerState();
    renderMobileCategoryDock();
  }

  function hideNativeControls() {
    const header = getHeaderCard();
    const headerButtons = header ? qsa("button", header) : [];
    const loginButton = headerButtons[headerButtons.length - 1] || null;
    if (loginButton) {
      loginButton.classList.add("wc-hidden-source");
    }

    const leftCard = getConfiguratorCard();
    if (!leftCard) {
      return;
    }
    const firstTitle = qs(".section-title", leftCard);
    const firstSelect = qs("select.select", leftCard);
    if (firstTitle) {
      firstTitle.classList.add("wc-hidden-source");
    }
    if (firstSelect) {
      firstSelect.classList.add("wc-hidden-source");
      if (firstSelect.nextElementSibling) {
        firstSelect.nextElementSibling.classList.add("wc-hidden-source");
      }
    }
    const discountSelects = qsa("select.select", leftCard).slice(1);
    discountSelects.forEach(function (select) {
      select.classList.add("wc-hidden-source");
    });
    const orderQty = qs("#order-qty");
    if (orderQty && orderQty.closest(".row")) {
      orderQty.closest(".row").classList.add("wc-hidden-source");
    }

    const summaryCard = getSummaryCard();
    if (summaryCard) {
      qsa("button", summaryCard).forEach(function (button) {
        if (/(下单|order|bestellen)/i.test(button.textContent || "")) {
          button.classList.add("wc-hidden-source");
        }
      });
    }
  }

  function ensureDesktopCategoryLayout() {
    const card = getConfiguratorCard();
    if (!card) {
      return;
    }

    syncCategoryIcons();

    const viewer = qs(".model-viewer", card);
    const categoryGrid = qs(".category-grid", card);
    if (!viewer || !categoryGrid) {
      return;
    }

    let previewTitle = viewer.previousElementSibling;
    while (previewTitle && !previewTitle.classList.contains("section-title")) {
      previewTitle = previewTitle.previousElementSibling;
    }

    let categoryTitle = categoryGrid.previousElementSibling;
    while (categoryTitle && !categoryTitle.classList.contains("section-title")) {
      categoryTitle = categoryTitle.previousElementSibling;
    }

    let configStart = categoryGrid.nextElementSibling;
    while (configStart) {
      if (qs(".h1", configStart) || configStart.classList.contains("option-groups")) {
        break;
      }
      configStart = configStart.nextElementSibling;
    }

    if (!categoryTitle || !configStart) {
      return;
    }

    configStart.classList.add("wc-config-section-heading");

    let shell = qs(".wc-desktop-config-shell", card);
    let rail = shell && qs(".wc-desktop-category-rail", shell);
    let main = shell && qs(".wc-desktop-config-main", shell);
    let viewerPanel = main && qs(".wc-desktop-viewer-panel", main);
    let optionsPanel = main && qs(".wc-desktop-options-panel", main);

    if (!shell) {
      shell = document.createElement("section");
      shell.className = "wc-desktop-config-shell";
      rail = document.createElement("aside");
      rail.className = "wc-desktop-category-rail";
      main = document.createElement("div");
      main.className = "wc-desktop-config-main";
      viewerPanel = document.createElement("div");
      viewerPanel.className = "wc-desktop-viewer-panel";
      optionsPanel = document.createElement("div");
      optionsPanel.className = "wc-desktop-options-panel";
      main.appendChild(viewerPanel);
      main.appendChild(optionsPanel);
      shell.appendChild(rail);
      shell.appendChild(main);
      card.appendChild(shell);
    }

    if (!viewerPanel) {
      viewerPanel = document.createElement("div");
      viewerPanel.className = "wc-desktop-viewer-panel";
      main.insertBefore(viewerPanel, main.firstChild || null);
    }

    if (!optionsPanel) {
      optionsPanel = document.createElement("div");
      optionsPanel.className = "wc-desktop-options-panel";
      main.appendChild(optionsPanel);
    }

    if (categoryTitle.parentNode !== rail) {
      rail.appendChild(categoryTitle);
    }
    if (categoryGrid.parentNode !== rail) {
      rail.appendChild(categoryGrid);
    }

    if (previewTitle && previewTitle.parentNode !== viewerPanel) {
      viewerPanel.appendChild(previewTitle);
    }
    if (viewer.parentNode !== viewerPanel) {
      viewerPanel.appendChild(viewer);
    }
    if (rail.parentNode !== main) {
      main.appendChild(rail);
    }

    let node = configStart;
    while (node) {
      const next = node.nextElementSibling;
      if (
        node !== shell &&
        node !== categoryTitle &&
        node !== categoryGrid &&
        node !== previewTitle &&
        node !== viewer &&
        node.parentNode !== optionsPanel
      ) {
        optionsPanel.appendChild(node);
      }
      node = next;
    }
  }

  function openConfigurator(cardId) {
    const card = getCardConfig(cardId);
    const select = getNativeModelSelect();
    state.cardId = card.id;
    state.sourceModel = card.sourceModel;
    state.selectionLabels = {};
    state.selectionDetails = {};
    state.desktopSummaryOpen = false;
    state.viewerMinimized = false;
    state.lastFocusedModuleId = "";
    state.partFocusRequestId += 1;
    dispatchNativeSelect(select, card.sourceModel);
    document.body.classList.remove("wc-preselect");
    document.body.classList.add("wc-config-active");
    syncStageVisibility();
    const toolbar = ensureToolbar();
    if (toolbar) {
      toolbar.classList.remove("wc-hidden-source");
    }
    renderToolbar();
    renderMobileConfigBar();
    renderSummaryTrigger();
    renderDesktopSummaryDrawer();
    renderMobileCategoryDock();
    ensureDesktopCategoryLayout();
    syncDesktopViewerSticky();
    syncDesktopHeaderSpace();
    renderSyntheticSeatWidthGroup();
    normalizeDesktopSeatWidthControl();
    syncVisibleSelections();
    syncSummaryExtras();
    refreshRuntimeTranslations(120);
    scheduleDefaultSelections(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function backToModelStage() {
    state.selectionLabels = {};
    state.selectionDetails = {};
    state.desktopSummaryOpen = false;
    state.viewerMinimized = false;
    state.lastFocusedModuleId = "";
    state.partFocusRequestId += 1;
    state.mobileCategoryTransitionDirection = "";
    toggleSummary(false);
    document.body.classList.add("wc-preselect");
    document.body.classList.remove("wc-config-active");
    syncStageVisibility();
    const toolbar = ensureToolbar();
    if (toolbar) {
      toolbar.classList.add("wc-hidden-source");
    }
    renderMobileConfigBar();
    renderSummaryTrigger();
    renderDesktopSummaryDrawer();
    renderMobileCategoryDock();
    syncDesktopViewerSticky();
    syncDesktopHeaderSpace();
    window.scrollTo({ top: 0, behavior: "smooth" });
    refreshRuntimeTranslations(80);
  }

  function syncVisibleSelections() {
    const groups = qsa(".option-group", getConfiguratorCard());
    groups.forEach(function (group) {
      const moduleId = getGroupModuleId(group);
      const title = (qs(".option-title", group) || {}).textContent;
      const activeButton = qs(".choice-btn.active", group);
      const activeText = activeButton && (qs(".choice-label", activeButton) || activeButton).textContent;
      const currentText = (qs(".option-current", group) || {}).textContent;
      if (!moduleId) {
        return;
      }
      const key = moduleId.trim();
      const value = (!isPlaceholderValue(activeText) ? activeText : currentText || "").trim();
      if (!isPlaceholderValue(value)) {
        const displayTitle = key === "seatWidth"
          ? getSeatWidthDisplayTitle()
          : (translateUiText((title || key).trim()) || (title || key).trim());
        const displayValue = translateUiText(value) || value;
        state.selectionLabels[key] = value;
        state.selectionDetails[key] = {
          title: displayTitle,
          value: displayValue,
        };
      } else {
        delete state.selectionLabels[key];
        delete state.selectionDetails[key];
      }
    });
  }

  function getActiveConfigurationItems() {
    return Object.keys(state.selectionDetails)
      .sort(function (a, b) {
        const indexA = MODULE_ORDER.indexOf(a);
        const indexB = MODULE_ORDER.indexOf(b);
        const safeA = indexA === -1 ? Number.MAX_SAFE_INTEGER : indexA;
        const safeB = indexB === -1 ? Number.MAX_SAFE_INTEGER : indexB;
        if (safeA !== safeB) {
          return safeA - safeB;
        }
        return a.localeCompare(b);
      })
      .map(function (moduleId) {
        const item = state.selectionDetails[moduleId];
        if (!item || isPlaceholderValue(item.value)) {
          return null;
        }
        return {
          title: item.title,
          value: item.value,
        };
      })
      .filter(Boolean);
  }

  function scheduleSelectionRefresh(delay) {
    if (state.syncTimer) {
      window.clearTimeout(state.syncTimer);
    }
    state.syncTimer = window.setTimeout(function () {
      state.syncTimer = 0;
      bindDynamicControls();
      ensureDesktopCategoryLayout();
      syncRearWheelSubcomponentVisibility();
      syncDesktopViewerSticky();
      syncDesktopHeaderSpace();
      renderSyntheticSeatWidthGroup();
      normalizeDesktopSeatWidthControl();
      annotateVisibleOptionButtons();
      reflectSelectionsFromStore();
      syncVisibleSelections();
      syncSummaryExtras();
      renderMobileCategoryDock();
      syncRuntimeViewer();
    }, delay || 80);
  }

  async function applyDefaultSelections(force) {
    if (state.applyingDefaults) {
      return;
    }

    syncCardStateFromModelSelect();
    const key = [state.cardId || "", state.sourceModel || ""].join("|");
    if (!force && state.defaultsAppliedKey === key) {
      return;
    }

    const store = getConfigStore();
    if (!store || !store.catalog || !store.catalog.models || !store.catalog.modules) {
      return;
    }

    state.applyingDefaults = true;
    state.defaultsAppliedKey = "";

    try {
      const sourceModel = state.sourceModel || store.modelId || "S5";
      const model = (store.catalog.models || []).find(function (item) {
        return item.id === sourceModel;
      });
      if (!model) {
        return;
      }

      if (typeof store.setModel === "function" && store.modelId !== sourceModel) {
        store.setModel(sourceModel);
      }

      const modulesById = new Map((store.catalog.modules || []).map(function (module) {
        return [module.id, module];
      }));

      model.modules.forEach(function (moduleId) {
        const module = modulesById.get(moduleId);
        const defaultOptionId = moduleId === "skirtGuards"
          ? "sg-plastic-straight"
          : moduleId === "frontWheel"
            ? "fw-4-alu"
            : module && module.options && module.options[0] && module.options[0].id;
        if (defaultOptionId && typeof store.setOption === "function") {
          store.setOption(moduleId, defaultOptionId);
        }
      });

      await wait(180);

      reflectSelectionsFromStore();
      syncVisibleSelections();
      syncSummaryExtras();
      renderMobileCategoryDock();
      syncRuntimeViewer();
      refreshRuntimeTranslations();
      state.defaultsAppliedKey = key;
    } finally {
      state.applyingDefaults = false;
    }
  }

  function scheduleDefaultSelections(force) {
    window.setTimeout(function () {
      applyDefaultSelections(force);
    }, force ? 220 : 140);
  }

  function bindDynamicControls() {
    qsa(".category-btn", getConfiguratorCard()).forEach(function (button) {
      if (button.dataset.wcBoundCategory) {
        return;
      }
      button.dataset.wcBoundCategory = "1";
      button.addEventListener("click", function () {
        window.setTimeout(function () {
          syncRearWheelSubcomponentVisibility();
          if (state.applyingDefaults) {
            reflectSelectionsFromStore();
            renderMobileCategoryDock();
            syncVisibleSelections();
            syncSummaryExtras();
            syncRuntimeViewer();
            return;
          }
          scrollCategoryContentToTop("smooth");
          reflectSelectionsFromStore();
          renderMobileCategoryDock();
          syncVisibleSelections();
          syncSummaryExtras();
          syncRuntimeViewer();
        }, 120);
      });
    });

    qsa(".choice-btn", getConfiguratorCard()).forEach(function (button) {
      if (button.dataset.wcBoundChoice) {
        return;
      }
      button.dataset.wcBoundChoice = "1";
      button.addEventListener("click", function () {
        const group = button.closest(".option-group");
        annotateGroupOptionIds(group);
        const moduleId = getGroupModuleId(group);
        const title = group && (qs(".option-title", group) || {}).textContent;
        const labelNode = qs(".choice-label", button);
        const clickedLabel = (labelNode || button).textContent;
        if (moduleId && clickedLabel) {
          const key = moduleId.trim();
          const value = clickedLabel.trim();
          const displayTitle = translateUiText((title || key).trim()) || (title || key).trim();
          const displayValue = translateUiText(value) || value;
          const store = getConfigStore();
          const option = button.dataset.optionId
            ? { id: button.dataset.optionId, label: value }
            : findOptionByLabel(key, value);
          if (store && option && typeof store.setOption === "function") {
            store.setOption(key, option.id);
            if (key === "frameLength") {
              enforceFrameLengthSeatDepthConstraint();
            }
            if (key === "frontFork" || key === "frontWheel") {
              enforceFrontForkWheelConstraint(key);
            }
          }
          state.selectionLabels[key] = value;
          state.selectionDetails[key] = {
            title: displayTitle,
            value: displayValue,
          };
          setGroupSelectionVisual(group, value, option && option.id);
          syncSummaryExtras();
        }
        window.setTimeout(function () {
          reflectSelectionsFromStore();
          renderMobileCategoryDock();
          syncVisibleSelections();
          syncSummaryExtras();
          syncRuntimeViewer();
          schedulePartFocus(moduleId);
        }, 60);
      });
    });
  }

  function syncSummaryExtras() {
    const summaryCard = getSummaryCard();
    if (!summaryCard) {
      return;
    }
    const rows = qsa("table tbody tr", summaryCard);
    if (rows[1] && rows[1].children[1] && rows[1].children[1].textContent !== getCurrentModelLabel()) {
      rows[1].children[1].textContent = getCurrentModelLabel();
    }
    let weightRow = qs(".wc-weight-row", summaryCard);
    if (!weightRow) {
      weightRow = document.createElement("tr");
      weightRow.className = "wc-weight-row";
      weightRow.innerHTML = "<td></td><td></td>";
      const anchorRow = rows[1] || rows[0] || null;
      if (anchorRow && anchorRow.parentNode) {
        anchorRow.parentNode.insertBefore(weightRow, anchorRow.nextSibling);
      } else {
        qs("table tbody", summaryCard).appendChild(weightRow);
      }
    }
    if (weightRow.children[0].textContent !== tr("weightLabel")) {
      weightRow.children[0].textContent = tr("weightLabel");
    }
    const weightText = formatWeight(computeWeight());
    if (weightRow.children[1].textContent !== weightText) {
      weightRow.children[1].textContent = weightText;
    }
    let specBlock = qs(".wc-summary-specs", summaryCard);
    if (!specBlock) {
      specBlock = document.createElement("section");
      specBlock.className = "wc-summary-specs";
      summaryCard.appendChild(specBlock);
    }
    const items = getActiveConfigurationItems();
    specBlock.innerHTML =
      '<div class="wc-summary-spec-title">' + tr("summarySpecTitle") + "</div>" +
      (
        items.length
          ? '<ul class="wc-summary-spec-list">' +
            items
              .map(function (item) {
                return (
                  '<li class="wc-summary-spec-item">' +
                  '<span class="wc-summary-spec-name">' + item.title + "</span>" +
                  '<span class="wc-summary-spec-value">' + item.value + "</span>" +
                  "</li>"
                );
              })
              .join("") +
            "</ul>"
          : '<div class="wc-summary-spec-empty">' + tr("summarySpecEmpty") + "</div>"
      );
    renderSummaryTrigger();
    window.WC_EXPORT_CONTEXT = {
      getModelLabel: function () {
        return getCurrentModelLabel();
      },
      getWeightText: function () {
        return weightText;
      },
      getConfigItems: function () {
        return items.slice();
      },
      getSourceModel: function () {
        return state.sourceModel || state.cardId || "";
      },
      getCardId: function () {
        return state.cardId || state.sourceModel || "";
      },
      getLanguage: function () {
        return getLang();
      },
      getSelection: function () {
        const store = getConfigStore();
        return buildRuntimeSelection(store, state.sourceModel || state.cardId || "");
      },
      getSummaryRows: function () {
        return qsa("table tbody tr", summaryCard)
          .map(function (row) {
            const cells = qsa("td", row);
            return {
              label: ((cells[0] && cells[0].textContent) || "").trim(),
              value: ((cells[1] && cells[1].textContent) || "").trim(),
            };
          })
          .filter(function (row) {
            return row.label || row.value;
          });
      },
    };
  }

  function bindEvents() {
    document.addEventListener("wheel", function (event) {
      if (!document.body.classList.contains("wc-config-active") || document.body.classList.contains("wc-summary-open")) {
        resetBoundaryWheelAmount();
        return;
      }
      if (!getBoundaryGestureTarget(event.target) || !Number.isFinite(event.deltaY) || Math.abs(event.deltaY) < 1) {
        resetBoundaryWheelAmount();
        return;
      }

      const direction = event.deltaY > 0 ? 1 : -1;
      const boundary = getCategoryContentBoundaryState();
      const isAtRequestedBoundary = direction > 0 ? boundary.atBottom : boundary.atTop;
      if (!isAtRequestedBoundary) {
        resetBoundaryWheelAmount();
        return;
      }

      if (state.boundaryWheelDirection !== direction) {
        state.boundaryWheelAmount = 0;
        state.boundaryWheelDirection = direction;
      }
      state.boundaryWheelAmount += Math.min(120, Math.abs(event.deltaY));
      queueBoundaryWheelReset();
      if (state.boundaryWheelAmount >= 96) {
        tryBoundaryCategorySwitch(direction);
      }
    }, { passive: true });

    document.addEventListener("touchstart", function (event) {
      state.boundaryTouchActive = false;
      state.boundaryTouchConsumed = false;
      if (!document.body.classList.contains("wc-config-active") || document.body.classList.contains("wc-summary-open")) {
        return;
      }
      if (!getBoundaryGestureTarget(event.target) || !event.touches || !event.touches.length) {
        return;
      }
      state.boundaryTouchActive = true;
      state.boundaryTouchStartX = event.touches[0].clientX;
      state.boundaryTouchStartY = event.touches[0].clientY;
    }, { passive: true });

    document.addEventListener("touchmove", function (event) {
      if (!state.boundaryTouchActive || state.boundaryTouchConsumed || !event.touches || !event.touches.length) {
        return;
      }
      const deltaX = event.touches[0].clientX - state.boundaryTouchStartX;
      const deltaY = event.touches[0].clientY - state.boundaryTouchStartY;
      if (Math.abs(deltaY) < 84 || Math.abs(deltaY) <= Math.abs(deltaX) * 1.15) {
        return;
      }

      const direction = deltaY < 0 ? 1 : -1;
      const boundary = getCategoryContentBoundaryState();
      if ((direction > 0 && !boundary.atBottom) || (direction < 0 && !boundary.atTop)) {
        return;
      }
      if (tryBoundaryCategorySwitch(direction)) {
        state.boundaryTouchConsumed = true;
      }
    }, { passive: true });

    document.addEventListener("touchend", function () {
      state.boundaryTouchActive = false;
      state.boundaryTouchConsumed = false;
    }, { passive: true });

    document.addEventListener("touchcancel", function () {
      state.boundaryTouchActive = false;
      state.boundaryTouchConsumed = false;
    }, { passive: true });

    document.addEventListener("touchstart", function (event) {
      if (!document.body.classList.contains("wc-config-active") || !isMobileViewport() || document.body.classList.contains("wc-summary-open")) {
        state.mobileEdgeSwipeActive = false;
        return;
      }
      if (event.target && event.target.closest && event.target.closest(".wc-mobile-category-dock, .wc-mobile-config-bar, .model-viewer, .wc-mobile-viewer-restore")) {
        state.mobileEdgeSwipeActive = false;
        return;
      }
      if (!event.touches || !event.touches.length) {
        state.mobileEdgeSwipeActive = false;
        return;
      }
      state.mobileEdgeSwipeActive = true;
      state.mobileEdgeSwipeConsumed = false;
      state.mobileEdgeSwipeStartX = event.touches[0].clientX;
      state.mobileEdgeSwipeStartY = event.touches[0].clientY;
    }, { passive: true });

    document.addEventListener("touchmove", function (event) {
      if (!state.mobileEdgeSwipeActive || state.mobileEdgeSwipeConsumed) {
        return;
      }
      if (Date.now() < state.mobileEdgeSwipeLockUntil) {
        return;
      }
      if (!event.touches || !event.touches.length) {
        return;
      }
      const currentX = event.touches[0].clientX;
      const currentY = event.touches[0].clientY;
      const deltaX = currentX - state.mobileEdgeSwipeStartX;
      const deltaY = currentY - state.mobileEdgeSwipeStartY;
      const horizontalEnough = Math.abs(deltaX) >= 72;
      const verticalDrift = Math.abs(deltaY);
      const isHorizontalGesture = Math.abs(deltaX) > verticalDrift * 1.15;

      if (!horizontalEnough || !isHorizontalGesture || verticalDrift > 72) {
        return;
      }

      if (deltaX < -72) {
        if (switchMobileCategoryByOffset(1)) {
          state.mobileEdgeSwipeConsumed = true;
          state.mobileEdgeSwipeLockUntil = Date.now() + 700;
        }
      } else if (deltaX > 72) {
        if (switchMobileCategoryByOffset(-1)) {
          state.mobileEdgeSwipeConsumed = true;
          state.mobileEdgeSwipeLockUntil = Date.now() + 700;
        }
      }
    }, { passive: true });

    document.addEventListener("touchend", function () {
      state.mobileEdgeSwipeActive = false;
      state.mobileEdgeSwipeConsumed = false;
    }, { passive: true });

    document.addEventListener("touchcancel", function () {
      state.mobileEdgeSwipeActive = false;
      state.mobileEdgeSwipeConsumed = false;
    }, { passive: true });

    document.addEventListener("click", function (event) {
      const enterCard = event.target.closest(".wc-model-card");
      if (enterCard && qs(".wc-model-enter", enterCard)) {
        openConfigurator(enterCard.getAttribute("data-card-id"));
        return;
      }

      if (event.target.closest(".wc-switch-model")) {
        backToModelStage();
        return;
      }

      if (event.target.closest(".wc-mobile-viewer-corner-toggle") || event.target.closest(".wc-mobile-viewer-restore")) {
        toggleMobileViewer();
        return;
      }

      if (event.target.closest(".wc-summary-trigger") || event.target.closest(".wc-mobile-summary-toggle")) {
        toggleSummary();
        return;
      }

      if (event.target.closest(".wc-desktop-summary-toggle")) {
        toggleDesktopSummaryDrawer();
        return;
      }

      if (event.target.closest(".wc-summary-backdrop")) {
        toggleSummary(false);
        return;
      }

      const categoryButton = event.target.closest(".category-btn");
      if (categoryButton) {
        window.setTimeout(function () {
          syncRearWheelSubcomponentVisibility();
          if (state.applyingDefaults) {
            reflectSelectionsFromStore();
            syncVisibleSelections();
            syncSummaryExtras();
            return;
          }
          scrollCategoryContentToTop("smooth");
          reflectSelectionsFromStore();
          syncVisibleSelections();
          syncSummaryExtras();
          refreshRuntimeTranslations();
        }, 120);
        return;
      }

      const choiceButton = event.target.closest(".choice-btn");
      if (choiceButton) {
        const group = choiceButton.closest(".option-group");
        annotateGroupOptionIds(group);
        const moduleId = getGroupModuleId(group);
        const title = group && (qs(".option-title", group) || {}).textContent;
        const labelNode = qs(".choice-label", choiceButton);
        const clickedLabel = (labelNode || choiceButton).textContent;
        if (moduleId && clickedLabel) {
          const key = moduleId.trim();
          const value = clickedLabel.trim();
          const displayTitle = translateUiText((title || key).trim()) || (title || key).trim();
          const displayValue = translateUiText(value) || value;
          const store = getConfigStore();
          const option = choiceButton.dataset.optionId
            ? { id: choiceButton.dataset.optionId, label: value }
            : findOptionByLabel(key, value);
          if (store && option && typeof store.setOption === "function") {
            store.setOption(key, option.id);
            if (key === "frameLength") {
              enforceFrameLengthSeatDepthConstraint();
            }
            if (key === "frontFork" || key === "frontWheel") {
              enforceFrontForkWheelConstraint(key);
            }
          }
          state.selectionLabels[key] = value;
          state.selectionDetails[key] = {
            title: displayTitle,
            value: displayValue,
          };
          setGroupSelectionVisual(group, value, option && option.id);
          syncSummaryExtras();
        }
        window.setTimeout(function () {
          reflectSelectionsFromStore();
          syncVisibleSelections();
          syncSummaryExtras();
          refreshRuntimeTranslations();
          schedulePartFocus(moduleId);
        }, 60);
        return;
      }

      const clearButton = event.target.closest(".card:last-child button");
      if (clearButton && /(清空|clear|zuruecksetzen|leeren)/i.test(clearButton.textContent || "")) {
        window.setTimeout(function () {
          state.selectionLabels = {};
          state.selectionDetails = {};
          syncVisibleSelections();
          syncSummaryExtras();
          refreshRuntimeTranslations();
        }, 80);
      }
    }, true);

    document.addEventListener("change", function () {
      window.setTimeout(function () {
        const modelSelect = getNativeModelSelect();
        if (document.activeElement === modelSelect || (modelSelect && modelSelect.value !== state.sourceModel)) {
          syncCardStateFromModelSelect();
          state.selectionLabels = {};
          state.selectionDetails = {};
          state.viewerMinimized = false;
          state.mobileCategoryTransitionDirection = "";
          state.defaultsAppliedKey = "";
          scheduleDefaultSelections(true);
        }
        enforceBilingualUi();
        renderToolbar();
        ensureDesktopCategoryLayout();
        syncRearWheelSubcomponentVisibility();
        renderMobileCategoryDock();
        reflectSelectionsFromStore();
        syncVisibleSelections();
        syncSummaryExtras();
        syncRuntimeViewer();
        refreshRuntimeTranslations();
      }, 80);
    }, true);

    const langSelect = getLangSelect();
    if (langSelect) {
      langSelect.addEventListener("change", function () {
        window.setTimeout(function () {
          enforceBilingualUi();
          renderMobileLanguageSwitch();
          renderModelStage();
        renderToolbar();
        renderMobileViewerState();
        renderMobileCategoryDock();
        syncSummaryExtras();
        syncRuntimeViewer();
        refreshRuntimeTranslations();
      }, 50);
        window.setTimeout(enforceBilingualUi, 180);
      });
    }

    window.addEventListener("resize", function () {
      window.setTimeout(function () {
        renderMobileViewerState();
        renderSummaryTrigger();
        renderDesktopSummaryDrawer();
        syncDesktopHeaderSpace();
      }, 60);
    });
  }

  function attachObservers() {
    state.observers.forEach(function (observer) {
      observer.disconnect();
    });
    state.observers = [];

    const configuratorCard = getConfiguratorCard();
    if (!configuratorCard) {
      return;
    }

    const observer = new MutationObserver(function (mutations) {
      const shouldRefresh = mutations.some(function (mutation) {
        if (
          mutation.type === "attributes" &&
          mutation.target &&
          mutation.target.nodeType === 1 &&
          (mutation.target.closest(".wc-synthetic-seat-width") ||
            mutation.target.closest(".choice-btn"))
        ) {
          return false;
        }
        const target =
          mutation.target && mutation.target.nodeType === 1
            ? mutation.target
            : mutation.target && mutation.target.parentElement;
        return target && target.closest(".option-group, .category-grid");
      });
      if (shouldRefresh) {
        scheduleSelectionRefresh(90);
      }
    });

    observer.observe(configuratorCard, {
      subtree: true,
      childList: true,
      characterData: true,
      attributes: true,
      attributeFilter: ["class"],
    });

    state.observers.push(observer);
  }

  function ensureInitialClasses() {
    document.body.classList.add("wc-preselect");
    document.body.classList.remove("wc-config-active");
    document.body.classList.remove("wc-summary-open");
    syncStageVisibility();
  }

  function mountEnhancements() {
    const grid = getGrid();
    const header = getHeaderCard();
    if (!grid || !header) {
      return false;
    }
    ensureInitialClasses();
    enforceBilingualUi();
    renderMobileLanguageSwitch();
    renderModelStage();
    renderToolbar();
    syncStageVisibility();
    ensureSummaryUI();
    ensureDesktopSummaryDrawer();
    hideNativeControls();
    ensureDesktopCategoryLayout();
    bindDynamicControls();
    annotateVisibleOptionButtons();
    renderMobileConfigBar();
    renderMobileViewerState();
    renderDesktopSummaryDrawer();
    renderMobileCategoryDock();
    reflectSelectionsFromStore();
    normalizeDesktopSeatWidthControl();
    syncVisibleSelections();
    syncSummaryExtras();
    syncRuntimeViewer();
    attachObservers();
    ensureSeatWidthDesktopGuard();
    scheduleDefaultSelections(false);
    window.setTimeout(enforceBilingualUi, 80);
    window.setTimeout(enforceBilingualUi, 260);
    if (!state.mounted) {
      bindEvents();
      state.mounted = true;
    }
    window.__WC_STATE = state;
    return true;
  }

  function waitForApp() {
    let attempts = 0;
    const timer = window.setInterval(function () {
      attempts += 1;
      if (mountEnhancements() || attempts > 120) {
        window.clearInterval(timer);
      }
    }, 250);
  }

  window.addEventListener("pageshow", function (event) {
    if (!event.persisted || !state.mounted) {
      return;
    }
    backToModelStage();
    window.scrollTo({ top: 0, behavior: "auto" });
  });

  waitForApp();
})();
