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
    "color-red": "#ff3b30",
    "color-green": "#34c759",
    "color-yellow": "#ffd60a",
    "color-blue": "#0a84ff",
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

  const state = {
    cardId: "",
    sourceModel: "",
    mounted: false,
    summaryOpen: false,
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
    viewerRuntime: null,
    viewerModulePromise: null,
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

  function syncRuntimeViewer() {
    const card = getConfiguratorCard();
    const viewer = qs(".model-viewer", card);
    const store = getConfigStore();
    if (!viewer || !store) {
      return;
    }

    if (!state.viewerModulePromise) {
      state.viewerModulePromise = import("/assets/runtime-model-viewer.mjs?v=20260618-seatwidth-click-stability-fix1");
    }

    const sourceModel = state.sourceModel || store.modelId || "S5";
    const selection = Object.assign({}, store.selection || {});
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
          state.viewerRuntime.update({
            sourceModel: sourceModel,
            selection: selection,
            frameColor: frameColor,
          });
        }
      })
      .catch(function (error) {
        console.error("Runtime viewer sync failed", error);
      });
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
    qsa(".option-group", getConfiguratorCard()).forEach(annotateGroupOptionIds);
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
      button.classList.toggle("active", matches);
    });
    const currentNode = qs(".option-current", group);
    if (currentNode && displayValue) {
      currentNode.textContent = displayValue;
    }
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
        setGroupSelectionVisual(group, selectedOption.label, selectedOption.id);
      }
    });
  }

  function getActiveCategoryIndex() {
    return qsa(".category-btn", getConfiguratorCard()).findIndex(function (button) {
      return button.classList.contains("active");
    });
  }

  function isFrameCategoryActive() {
    return getActiveCategoryIndex() === 0;
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
    if (!isFrameCategoryActive()) {
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
    if (!isFrameCategoryActive()) {
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
    return getLang() === "en-US"
      ? "Frame Width / Seat Width (SW)"
      : "车架宽度 / 座宽 (SW)";
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
    renderMobileConfigBar();
    renderMobileCategoryDock();
  }

  function toggleSummary(open) {
    const next = typeof open === "boolean" ? open : !document.body.classList.contains("wc-summary-open");
    document.body.classList.toggle("wc-summary-open", next);
    state.summaryOpen = next;
    renderSummaryTrigger();
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
    state.viewerMinimized = false;
    dispatchNativeSelect(select, card.sourceModel);
    document.body.classList.remove("wc-preselect");
    document.body.classList.add("wc-config-active");
    const toolbar = ensureToolbar();
    if (toolbar) {
      toolbar.classList.remove("wc-hidden-source");
    }
    renderToolbar();
    renderMobileConfigBar();
    renderSummaryTrigger();
    renderMobileCategoryDock();
    ensureDesktopCategoryLayout();
    syncDesktopViewerSticky();
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
    state.viewerMinimized = false;
    state.mobileCategoryTransitionDirection = "";
    toggleSummary(false);
    document.body.classList.add("wc-preselect");
    document.body.classList.remove("wc-config-active");
    const toolbar = ensureToolbar();
    if (toolbar) {
      toolbar.classList.add("wc-hidden-source");
    }
    renderMobileConfigBar();
    renderSummaryTrigger();
    renderMobileCategoryDock();
    syncDesktopViewerSticky();
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
      syncDesktopViewerSticky();
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
        const firstOption = module && module.options && module.options[0];
        if (firstOption && typeof store.setOption === "function") {
          store.setOption(moduleId, firstOption.id);
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
        return Object.assign({}, (store && store.selection) || {});
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

      if (event.target.closest(".wc-summary-backdrop")) {
        toggleSummary(false);
        return;
      }

      const categoryButton = event.target.closest(".category-btn");
      if (categoryButton) {
        window.setTimeout(function () {
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
    ensureSummaryUI();
    hideNativeControls();
    ensureDesktopCategoryLayout();
    bindDynamicControls();
    annotateVisibleOptionButtons();
    renderMobileConfigBar();
    renderMobileViewerState();
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

  waitForApp();
})();
