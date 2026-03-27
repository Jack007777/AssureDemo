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
        "de-DE": {
          badge: "Aktiv Alltag",
          name: "S2 Modell",
          blurb: "Fuer den alltaeglichen Einsatz mit klarer Struktur, einfacher Auswahl und stabilem Standardprozess ausgelegt.",
          points: ["Leicht fuer den Alltag", "Klare Standardoptionen", "Geeignet fuer regulaere Auslieferung"],
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
        "de-DE": {
          badge: "Komfort Fokus",
          name: "S2D Modell",
          blurb: "Komfort- und stabilitaetsorientierte Variante, damit Kunden zuerst den Einsatzzweck einordnen und dann konfigurieren koennen.",
          points: ["Komfortorientierte Variante", "Stabile Alltagspositionierung", "Gut mit S2 vergleichbar"],
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
        "de-DE": {
          badge: "Performance Light",
          name: "S5 Modell",
          blurb: "Leichtbau- und performanceorientierte Plattform, ideal um zuerst Produktvorteile zu zeigen und danach ins Detail zu gehen.",
          points: ["Leichte Premium-Plattform", "Performance-orientiert", "Gut fuer detaillierte Komponentenvergleiche"],
        },
      },
    },
  ];

  const UI_TEXT = {
    "zh-CN": {
      stageKicker: "车型入口",
      stageTitle: "先选择车型，再进入 3D 选配",
      stageCopy: "客户先看车型和卖点，再进入对应的配置页面。这样比直接把 3D 和所有配置项一起抛出来更利于判断。",
      stageEnter: "进入该车型",
      toolbarEyebrow: "当前车型",
      switchModel: "切换车型",
      summaryLabel: "当前总金额",
      summaryButton: "查看明细",
      summaryClose: "收起",
      weightLabel: "总重量",
      weightSuffix: "kg",
      weightMeta: "总重量",
    },
    "en-US": {
      stageKicker: "Model Entry",
      stageTitle: "Choose a model first, then enter 3D configuration",
      stageCopy: "Customers see each model and its selling points first, then continue to the matching configuration flow.",
      stageEnter: "Configure this model",
      toolbarEyebrow: "Current Model",
      switchModel: "Switch model",
      summaryLabel: "Current Total",
      summaryButton: "Details",
      summaryClose: "Close",
      weightLabel: "Total Weight",
      weightSuffix: "kg",
      weightMeta: "Total weight",
    },
    "de-DE": {
      stageKicker: "Modelleinstieg",
      stageTitle: "Zuerst Modell waehlen, dann in die 3D-Konfiguration gehen",
      stageCopy: "Kunden sehen zuerst Modell und Verkaufsargumente und wechseln danach in den passenden Konfigurationsablauf.",
      stageEnter: "Dieses Modell konfigurieren",
      toolbarEyebrow: "Aktuelles Modell",
      switchModel: "Modell wechseln",
      summaryLabel: "Aktueller Gesamtpreis",
      summaryButton: "Details",
      summaryClose: "Schliessen",
      weightLabel: "Gesamtgewicht",
      weightSuffix: "kg",
      weightMeta: "Gesamtgewicht",
    },
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
        '<span class="btn secondary wc-summary-cta"></span>';
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

  function renderSummaryTrigger() {
    const ui = ensureSummaryUI();
    const total = parseMoneyCell();
    const weight = formatWeight(computeWeight());
    qs(".wc-summary-label", ui.trigger).textContent = tr("summaryLabel");
    qs(".wc-summary-total", ui.trigger).textContent = total;
    qs(".wc-summary-meta", ui.trigger).textContent = tr("weightMeta") + ": " + weight;
    qs(".wc-summary-cta", ui.trigger).textContent = document.body.classList.contains("wc-summary-open")
      ? tr("summaryClose")
      : tr("summaryButton");
    ui.trigger.hidden = !document.body.classList.contains("wc-config-active");
    ui.backdrop.hidden = !document.body.classList.contains("wc-summary-open");
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
    renderSummaryTrigger();
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
    renderSummaryTrigger();
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
    renderSummaryTrigger();
    window.WC_EXPORT_CONTEXT = {
      getModelLabel: function () {
        return getCurrentModelLabel();
      },
      getWeightText: function () {
        return weightText;
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

      if (event.target.closest(".wc-summary-trigger")) {
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

    const langSelect = getLangSelect();
    if (langSelect) {
      langSelect.addEventListener("change", function () {
        window.setTimeout(function () {
          renderModelStage();
          renderToolbar();
          syncSummaryExtras();
        }, 50);
      });
    }
  }

  function attachObservers() {
    state.observers.forEach(function (observer) {
      observer.disconnect();
    });
    state.observers = [];

    const summaryCard = getSummaryCard();
    if (summaryCard) {
      const observer = new MutationObserver(function () {
        hideNativeControls();
        syncSummaryExtras();
      });
      observer.observe(summaryCard, { childList: true, subtree: true, characterData: true });
      state.observers.push(observer);
    }

    const leftCard = getConfiguratorCard();
    if (leftCard) {
      const observer = new MutationObserver(function () {
        hideNativeControls();
        bindDynamicControls();
        syncVisibleSelections();
        syncSummaryExtras();
      });
      observer.observe(leftCard, { childList: true, subtree: true, characterData: true });
      state.observers.push(observer);
    }
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
    renderModelStage();
    renderToolbar();
    ensureSummaryUI();
    hideNativeControls();
    bindDynamicControls();
    syncVisibleSelections();
    syncSummaryExtras();
    attachObservers();
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
