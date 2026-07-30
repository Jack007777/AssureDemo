const DEBUG_LEFT_FORK_ONLY = false;
const S5_MODEL_CACHE_BUSTER = "v=20260715-lite-first-load-v1";

function withS5ModelVersion(path) {
  return `${path}?${S5_MODEL_CACHE_BUSTER}`;
}

function getS5SideguardParts(style) {
  if (style === "sg-none") {
    return [];
  }
  if (style === "sg-plastic-straight" || style === "sg-carbon-straight") {
    const src = withS5ModelVersion("/models/S5/seitenteile-simple.glb");
    return [
      { key: "sideguardLeft", src, tint: false, sideguardStyle: style, mirrorX: true },
      { key: "sideguardRight", src, tint: false, sideguardStyle: style, mirrorX: false },
    ];
  }
  return [
    {
      key: "sideguards",
      src: withS5ModelVersion("/models/S5/Seitenteilen-standard.glb"),
      tint: false,
      sideguardStyle: style,
    },
  ];
}

function getS5BaseParts(selection = {}) {
  const skirtGuardStyle = selection.skirtGuards || "sg-none";
  return [
  {
    key: "seat",
    src: withS5ModelVersion("/models/S5/Sitzbespannung.lite.glb"),
    tint: false,
    seatStyle: selection.seatSetting || "seat-std",
  },
  {
    key: "backrest",
    src: withS5ModelVersion("/models/S5/Ruecken.lite.glb"),
    tint: false,
    backrestStyle: "black-fabric",
  },
  ...getS5SideguardParts(skirtGuardStyle),
  {
    key: "frontCasterLeft",
    src: withS5ModelVersion("/models/S5/Lenkraerder-single.lite.glb"),
    tint: false,
    blackWheel: true,
    mirrorX: true,
  },
  {
    key: "frontCasterRight",
    src: withS5ModelVersion("/models/S5/Lenkraerder-single.lite.glb"),
    tint: false,
    blackWheel: true,
    mirrorX: false,
  },
  ];
}

function getS5StepPart(selection = {}) {
  const isFrontAngle90 = selection.frameAngle === "fa-90";
  return {
    key: "footrest",
    src: withS5ModelVersion(
      isFrontAngle90
        ? "/models/S5/frame-split/90 step.lite.glb"
        : "/models/S5/frame-split/100 step.lite.glb"
    ),
    tint: true,
  };
}

function getS5FootrestPlatePart(selection = {}) {
  const setting = selection.footrestSetting || "foot-plastic";
  if (setting === "foot-none") {
    return null;
  }
  return {
    key: "footrestPlate",
    src: withS5ModelVersion("/models/S5/FootrestPlate.glb"),
    tint: false,
    footrestPlateStyle: setting,
  };
}

function getS5ForkParts(selection = {}) {
  const isFrontAngle90 = selection.frameAngle === "fa-90";
  const isLongFrame = selection.frameLength === "fl-long";
  const leftForkSrc = withS5ModelVersion(isFrontAngle90
    ? (isLongFrame
        ? "/models/S5/frame-split/90 left long fork .lite.glb"
        : "/models/S5/frame-split/90 left short fork .lite.glb")
    : (isLongFrame
        ? "/models/S5/frame-split/100 left long fork.lite.glb"
        : "/models/S5/frame-split/100 left short fork.lite.glb"));
  const rightForkSrc = withS5ModelVersion(isFrontAngle90
    ? (isLongFrame
        ? "/models/S5/frame-split/90 right long fork.lite.glb"
        : "/models/S5/frame-split/90 right short fork.lite.glb")
    : (isLongFrame
        ? "/models/S5/frame-split/100 right long fork.lite.glb"
        : "/models/S5/frame-split/100 right short fork.lite.glb"));
  const parts = [];
  parts.push({
    key: isFrontAngle90 ? "frame-left-fork-90" : "frame-left-fork-100",
    src: leftForkSrc,
    tint: true,
  });
  if (!DEBUG_LEFT_FORK_ONLY) {
    parts.push({
      key: isFrontAngle90 ? "frame-right-fork-90" : "frame-right-fork-100",
      src: rightForkSrc,
      tint: true,
    });
  }
  return parts;
}

function getS5FrameParts(selection = {}) {
  return [
    {
      key: "frame-middle",
      src: `${withS5ModelVersion("/models/S5/frame-split/middle body.lite.glb")}&middleTrim=20260730-v1`,
      tint: true,
    },
    { key: "frame-left-body", src: withS5ModelVersion("/models/S5/frame-split/left body.lite.glb"), tint: true },
    { key: "frame-right-body", src: withS5ModelVersion("/models/S5/frame-split/right body.lite.glb"), tint: true },
    ...getS5ForkParts(selection),
  ];
}

function getS5RearWheelPart(selection) {
  switch (selection.rearWheel) {
    case "rw-22-18":
      return { key: "rearWheel", src: "/models/S5/22寸18辐后轮 _ light wheel.optimized.glb", tint: false, blackWheel: true };
    case "rw-24-12":
    case "rw-24-18":
      return { key: "rearWheel", src: "/models/S5/24寸12辐条后轮 _ ultra light wheel.optimized.glb", tint: false, blackWheel: true };
    case "rw-24-big":
      return { key: "rearWheel", src: "/models/S5/S5加强后轮 _ S5 large hub rear wheels.optimized.glb", tint: false, blackWheel: true };
    default:
      return { key: "rearWheel", src: "/models/S5/Antriebsraede-Klein.glb", tint: false, blackWheel: true };
  }
}

function getS5HandrimPart(selection) {
  if (selection.handrim === "hr-big-24") {
    return {
      key: "handrim",
      src: "/models/S5/S5异形手轮 _ S5 big ergonom handrail incl rubber strap.optimized.glb",
      tint: false,
    };
  }
  return null;
}

function getS5BrakePart(selection) {
  switch (selection.brake) {
    case "brake-push-bent":
      return { key: "brake", src: "/models/S5/前倒刹车 _ push to brake bended lever.optimized.glb", tint: false };
    case "brake-push-folding":
      return {
        key: "brake",
        src: "/models/S5/延长车柄刹车-推刹 _ push to brake folding extended lever.optimized.glb",
        tint: false,
      };
    case "brake-pull-folding":
      return {
        key: "brake",
        src: "/models/S5/延长车柄刹车-拉刹 _ Pull to brake folding extended lever.optimized.glb",
        tint: false,
      };
    case "brake-scissors":
      return { key: "brake", src: "/models/S5/剪刀款刹车scissors folding brak aluminum.optimized.glb", tint: false };
    case "brake-push-straight":
    case "brake-pull-straight":
      return { key: "brake", src: "/models/S5/普通刹车 _ standard brake.optimized.glb", tint: false };
    default:
      return null;
  }
}

function getS5AxlePart(selection) {
  if (!selection.axle) {
    return null;
  }
  if (selection.axle.indexOf("tetra") >= 0) {
    return { key: "axle", src: "/models/S5/手板杆快拆 _ tetra quick release.optimized.glb", tint: false };
  }
  return { key: "axle", src: "/models/S5/普通快拆 _ standard quick release.optimized.glb", tint: false };
}

function getS5BackrestHandlePart(selection) {
  if (selection.backrestHandles === "bh-folding") {
    return { key: "backrestHandles", src: "/models/S5/可折手把folding grip handle.optimized.glb", tint: false };
  }
  return null;
}

function getS5AntiTipPart(selection) {
  if (selection.accessoryAntitipp && selection.accessoryAntitipp !== "antitipp-none") {
    return { key: "antiTip", src: "/models/S5/防倾管 _ anti tip wheels.optimized.glb", tint: false };
  }
  return null;
}

function getS5TippingHelpPart(selection) {
  if (selection.accessoryTippingHelp && selection.accessoryTippingHelp !== "tiphelp-none") {
    return { key: "tippingHelp", src: "/models/S5/脚踏管 _ tipping aid.optimized.glb", tint: false };
  }
  return null;
}

function getS5TransitWheelsPart(selection) {
  if (selection.accessoryTransitWheels === "transit-pair") {
    return { key: "transitWheels", src: "/models/S5/转换轮管 _ transit wheels.optimized.glb", tint: false };
  }
  return null;
}

export function getModelPartsForSourceModel(sourceModel, selection = {}) {
  if ((sourceModel || "").toUpperCase() === "S5") {
    return [
      ...getS5FrameParts(selection),
      getS5StepPart(selection),
      getS5FootrestPlatePart(selection),
      ...getS5BaseParts(selection),
      getS5RearWheelPart(selection),
      getS5HandrimPart(selection),
      getS5BrakePart(selection),
      selection.axle && selection.axle.indexOf("tetra") >= 0 ? getS5AxlePart(selection) : null,
      getS5BackrestHandlePart(selection),
      getS5AntiTipPart(selection),
      getS5TippingHelpPart(selection),
      getS5TransitWheelsPart(selection),
    ].filter(Boolean);
  }

  return [
    { key: "base", src: `/models/${sourceModel}/${sourceModel}.glb`, tint: false },
    { key: "frame", src: `/models/${sourceModel}/frame.glb`, tint: true },
  ];
}
