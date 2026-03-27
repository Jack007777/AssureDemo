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

  const state = {
    cardId: "",
    sourceModel: "",
    mounted: false,
    summaryOpen: false,
    selectionLabels: {},
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

  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.from((root || document).querySelectorAll(selector));
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
      '<path d="M4.5 5.5h11" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" />' +
      '<path d="M4.5 10h8.5" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" />' +
      '<path d="M4.5 14.5h6.5" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" />' +
      '<circle cx="14.8" cy="13.8" r="2.4" fill="none" stroke="currentColor" stroke-width="1.5" />' +
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

  function normalizeText(value) {
    return (value || "")
      .toLowerCase()
      .replace(/\s+/g, " ")
      .trim();
  }

  function includesAny(label, fragments) {
    return fragments.some(function (part) {
      return label.indexOf(part) >= 0;
    });
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
        '<div class="wc-mobile-config-summary">' +
        '<div class="wc-mobile-config-total"></div>' +
        '<div class="wc-mobile-config-weight"></div>' +
        "</div>" +
        '<button type="button" class="btn secondary wc-mobile-summary-toggle">' +
        '<span class="wc-summary-cta-icon">' + summaryIconSvg() + "</span>" +
        '<span class="wc-mobile-summary-text"></span>' +
        "</button>";
      container.insertBefore(bar, grid);
    }
    return bar;
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
    qs(".wc-mobile-config-total", bar).textContent = parseMoneyCell();
    qs(".wc-mobile-config-weight", bar).textContent = tr("weightMeta") + ": " + formatWeight(computeWeight());
    qs(".wc-mobile-summary-text", bar).textContent = document.body.classList.contains("wc-summary-open")
      ? tr("summaryClose")
      : tr("summaryButton");

    window.requestAnimationFrame(updateMobileStickyMetrics);
  }

  function updateMobileStickyMetrics() {
    const isActive = document.body.classList.contains("wc-config-active") && isMobileViewport();
    const bar = qs(".wc-mobile-config-bar");
    const viewer = qs(".model-viewer", getConfiguratorCard());
    const barHeight = isActive && bar ? Math.ceil(bar.getBoundingClientRect().height) : 0;
    const viewerHeight = isActive && viewer ? Math.ceil(viewer.getBoundingClientRect().height) : 0;
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
          track.scrollBy({
            left: direction * Math.max(180, track.clientWidth * 0.7),
            behavior: "smooth",
          });
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

    dock.classList.toggle("is-overflowing", overflow);
    prev.disabled = !overflow || atStart;
    next.disabled = !overflow || atEnd;
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

    track.innerHTML = nativeButtons
      .map(function (button, index) {
        const labelNode = qsa("span", button).slice(-1)[0];
        const label = (labelNode || button).textContent.trim();
        const active = button.classList.contains("active") ? " active" : "";
        return (
          '<button type="button" class="wc-mobile-category-chip' + active + '" data-index="' + index + '">' +
          label +
          "</button>"
        );
      })
      .join("");

    qsa(".wc-mobile-category-chip", track).forEach(function (button) {
      button.addEventListener("click", function () {
        const index = Number(button.getAttribute("data-index"));
        const target = nativeButtons[index];
        if (!target) {
          return;
        }
        target.click();
        button.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
      });
    });

    window.setTimeout(updateMobileCategoryDockState, 40);
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
    ui.trigger.hidden = !document.body.classList.contains("wc-config-active") || isMobileViewport();
    ui.backdrop.hidden = !document.body.classList.contains("wc-summary-open");
    renderMobileConfigBar();
    renderMobileCategoryDock();
  }

  function toggleSummary(open) {
    const next = typeof open === "boolean" ? open : !document.body.classList.contains("wc-summary-open");
    document.body.classList.toggle("wc-summary-open", next);
    state.summaryOpen = next;
    renderSummaryTrigger();
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

  function openConfigurator(cardId) {
    const card = getCardConfig(cardId);
    const select = getNativeModelSelect();
    state.cardId = card.id;
    state.sourceModel = card.sourceModel;
    state.selectionLabels = {};
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
    syncVisibleSelections();
    syncSummaryExtras();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function backToModelStage() {
    state.selectionLabels = {};
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
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function syncVisibleSelections() {
    const groups = qsa(".option-group", getConfiguratorCard());
    groups.forEach(function (group) {
      const moduleId = (qs(".option-code", group) || {}).textContent;
      const activeButton = qs(".choice-btn.active", group);
      const label = activeButton && (qs(".choice-label", activeButton) || activeButton).textContent;
      if (moduleId) {
        if (label) {
          state.selectionLabels[moduleId.trim()] = label.trim();
        }
      }
    });
  }

  function getActiveConfigurationItems() {
    return qsa(".option-group", getConfiguratorCard())
      .map(function (group) {
        const title = (qs(".option-title", group) || {}).textContent;
        const activeButton = qs(".choice-btn.active", group);
        const value = activeButton && (qs(".choice-label", activeButton) || activeButton).textContent;
        if (!title || !value) {
          return null;
        }
        return {
          title: title.trim(),
          value: value.trim(),
        };
      })
      .filter(Boolean);
  }

  function bindDynamicControls() {
    qsa(".category-btn", getConfiguratorCard()).forEach(function (button) {
      if (button.dataset.wcBoundCategory) {
        return;
      }
      button.dataset.wcBoundCategory = "1";
      button.addEventListener("click", function () {
        window.setTimeout(function () {
          const anchor = qs(".option-groups", getConfiguratorCard());
          if (anchor) {
            anchor.classList.add("wc-option-anchor");
            anchor.scrollIntoView({ behavior: "smooth", block: "start" });
          }
          renderMobileCategoryDock();
          syncVisibleSelections();
          syncSummaryExtras();
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
        const moduleId = group && (qs(".option-code", group) || {}).textContent;
        const labelNode = qs(".choice-label", button);
        const clickedLabel = (labelNode || button).textContent;
        if (moduleId && clickedLabel) {
          state.selectionLabels[moduleId.trim()] = clickedLabel.trim();
          syncSummaryExtras();
        }
        window.setTimeout(function () {
          renderMobileCategoryDock();
          syncVisibleSelections();
          syncSummaryExtras();
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
    };
  }

  function bindEvents() {
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
          const anchor = qs(".option-groups", getConfiguratorCard());
          if (anchor) {
            anchor.classList.add("wc-option-anchor");
            anchor.scrollIntoView({ behavior: "smooth", block: "start" });
          }
          syncVisibleSelections();
          syncSummaryExtras();
        }, 120);
        return;
      }

      const choiceButton = event.target.closest(".choice-btn");
      if (choiceButton) {
        const group = choiceButton.closest(".option-group");
        const moduleId = group && (qs(".option-code", group) || {}).textContent;
        const labelNode = qs(".choice-label", choiceButton);
        const clickedLabel = (labelNode || choiceButton).textContent;
        if (moduleId && clickedLabel) {
          state.selectionLabels[moduleId.trim()] = clickedLabel.trim();
          syncSummaryExtras();
        }
        window.setTimeout(function () {
          syncVisibleSelections();
          syncSummaryExtras();
        }, 60);
        return;
      }

      const clearButton = event.target.closest(".card:last-child button");
      if (clearButton && /(清空|clear|zuruecksetzen|leeren)/i.test(clearButton.textContent || "")) {
        window.setTimeout(function () {
          state.selectionLabels = {};
          syncVisibleSelections();
          syncSummaryExtras();
        }, 80);
      }
    }, true);

    document.addEventListener("change", function () {
      window.setTimeout(function () {
        enforceBilingualUi();
        renderToolbar();
        renderMobileCategoryDock();
        syncVisibleSelections();
        syncSummaryExtras();
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
          renderMobileCategoryDock();
          syncSummaryExtras();
        }, 50);
        window.setTimeout(enforceBilingualUi, 180);
      });
    }

    window.addEventListener("resize", function () {
      window.setTimeout(function () {
        renderSummaryTrigger();
      }, 60);
    });
  }

  function attachObservers() {
    state.observers.forEach(function (observer) {
      observer.disconnect();
    });
    state.observers = [];
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
    bindDynamicControls();
    renderMobileConfigBar();
    renderMobileCategoryDock();
    syncVisibleSelections();
    syncSummaryExtras();
    attachObservers();
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
