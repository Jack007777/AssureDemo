const DEBUG_LEFT_FORK_ONLY = false;
const S5_MODEL_CACHE_BUSTER = "v=20260808-local-options-v44";

function withS5ModelVersion(path) {
  return `${path}?${S5_MODEL_CACHE_BUSTER}`;
}

function getS5SeatPart(selection = {}) {
  const seatStyle = selection.seatSetting || "seat-std";
  const sourceByStyle = {
    "seat-std": "/models/S5/Standard%20Seat%20with%20underseat%20pouch.web.glb",
    "seat-carbon": "/models/S5/Sitzbespannung.lite.glb",
    "seat-crossed": "/models/S5/crossed%20band%20seat.glb",
  };
  return {
    key: "seat",
    src: withS5ModelVersion(sourceByStyle[seatStyle] || sourceByStyle["seat-std"]),
    tint: false,
    seatStyle,
  };
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
      src: withS5ModelVersion("/models/S5/Seitenteilen-standard.lite.glb"),
      tint: false,
      sideguardStyle: style,
    },
  ];
}

function getS5BaseParts(selection = {}) {
  const skirtGuardStyle = selection.skirtGuards || "sg-none";
  const frontWheelSource = selection.frontWheel === "fw-3-alu"
    ? "/models/S5/front-wheel-3-inch-alu-single.glb"
    : selection.frontWheel === "fw-4-alu" || selection.frontWheel === "fw-4-plastic"
      ? "/models/S5/front-wheel-4-inch-alu-single.glb"
      : "/models/S5/front-wheel-5-inch-alu-single.glb";
  const plasticFrontWheel = selection.frontWheel === "fw-4-plastic"
    || selection.frontWheel === "fw-5-plastic";
  const frontForkSource = selection.frontFork === "ff-std"
    ? "/models/S5/front-fork-standard-alu-single.glb"
    : selection.frontFork === "ff-one-arm"
      ? "/models/S5/front-fork-one-arm-alu-single.glb"
      : "/models/S5/front-fork-long-alu-single.glb";
  return [
  getS5SeatPart(selection),
  {
    key: "backrest",
    src: withS5ModelVersion("/models/S5/Ruecken.lite.glb"),
    tint: false,
    backrestStyle: "black-fabric",
  },
  ...getS5SideguardParts(skirtGuardStyle),
  {
    key: "frontCasterLeft",
    src: withS5ModelVersion(frontWheelSource),
    tint: false,
    blackWheel: plasticFrontWheel,
    mirrorX: true,
  },
  {
    key: "frontCasterRight",
    src: withS5ModelVersion(frontWheelSource),
    tint: false,
    blackWheel: plasticFrontWheel,
    mirrorX: false,
  },
  {
    key: "frontForkLeft",
    src: withS5ModelVersion(frontForkSource),
    tint: false,
    mirrorX: true,
  },
  {
    key: "frontForkRight",
    src: withS5ModelVersion(frontForkSource),
    tint: false,
    mirrorX: false,
  },
  ];
}

function getS5LateralFrameParts(selection = {}) {
  if (selection.lateralFrame !== "lf-extended") return [];
  const src = withS5ModelVersion("/models/S5/Extend%20length%20lateral%20frame%20carbon.glb");
  return [
    { key: "lateralFrameLeft", src, tint: true },
    { key: "lateralFrameRight", src, tint: true },
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
      // The merged lightweight mesh has missing triangles along both crossbars.
      // Keep the original clean meshes; runtime width adjustment handles both.
      src: `${withS5ModelVersion("/models/S5/frame-split/middle body.glb")}&middleMesh=20260806-v1`,
      tint: true,
    },
    { key: "frame-left-body", src: withS5ModelVersion("/models/S5/frame-split/left body.lite.glb"), tint: true },
    { key: "frame-right-body", src: withS5ModelVersion("/models/S5/frame-split/right body.lite.glb"), tint: true },
    ...getS5ForkParts(selection),
  ];
}

function getS5RearWheelParts(selection) {
  const makeWheelPair = (src, options = {}) => {
    const reverseFacing = !!options.reverseFacing;
    const alignmentYDeg = Number(options.alignmentYDeg) || 0;
    const alignmentZDeg = Number(options.alignmentZDeg) || 0;
    const role = options.role || "wheel";
    const keyStem = role === "wheel" ? "rearWheel" : `rearWheel${role[0].toUpperCase()}${role.slice(1)}`;
    return [
    {
      key: `${keyStem}Left`,
      src: withS5ModelVersion(src),
      tint: false,
      blackWheel: role === "tyre",
      rearWheelRole: role,
      mirrorX: reverseFacing,
      instanceOffsetX: 0,
      reverseWheelFacing: reverseFacing,
      wheelAlignmentYDeg: -alignmentYDeg,
      wheelAlignmentZDeg: alignmentZDeg,
    },
    {
      key: `${keyStem}Right`,
      src: withS5ModelVersion(src),
      tint: false,
      blackWheel: role === "tyre",
      rearWheelRole: role,
      mirrorX: !reverseFacing,
      instanceOffsetX: -0.609255862,
      reverseWheelFacing: reverseFacing,
      wheelAlignmentYDeg: alignmentYDeg,
      wheelAlignmentZDeg: -alignmentZDeg,
    },
    ];
  };

  const wheelCatalog = {
    "rw-22s": { size: 22, wheel: "/models/S5/rear-component-wheel-22S.lite.glb" },
    "rw-24s": {
      size: 24,
      wheel: "/models/S5/rear-component-wheel-24S.lite.glb",
      alignmentZDeg: { wheel: 2, handrim: 2.03, tyre: 2.01 },
    },
    "rw-22ul": { size: 22, wheel: "/models/S5/rear-component-wheel-22UL.lite.glb" },
    "rw-24ul": {
      size: 24,
      wheel: "/models/S5/rear-component-wheel-24UL.lite.glb",
      alignmentZDeg: { wheel: 1.82, handrim: 2.03, tyre: 2.01 },
    },
    "rw-24b": {
      size: 24,
      wheel: "/models/S5/rear-component-wheel-24B.lite.glb",
      largeHub: true,
      alignmentZDeg: { wheel: 0.03, handrim: 0.01, tyre: 2.01 },
    },
  };
  const legacyIds = {
    "rw-22sl": "rw-22s",
    "rw-22-18": "rw-22s",
    "rw-24sl": "rw-24s",
    "rw-24-18": "rw-24s",
    "rw-24-12": "rw-24ul",
    "rw-24bh": "rw-24b",
    "rw-24-big": "rw-24b",
  };
  const wheelId = legacyIds[selection.rearWheel] || selection.rearWheel || "rw-22s";
  const wheel = wheelCatalog[wheelId] || wheelCatalog["rw-22s"];
  const wheelAlignment = wheel.alignmentZDeg || {};
  const handrimSource = wheel.largeHub
    ? "/models/S5/rear-component-handrim-24B.lite.glb"
    : wheel.size === 22
      ? "/models/S5/rear-component-handrim-22.lite.glb"
      : "/models/S5/rear-component-handrim-24.lite.glb";
  const tyreSource = wheel.size === 22
    ? "/models/S5/rear-component-tyre-22-pu.lite.glb"
    : "/models/S5/rear-component-tyre-24-pneumatic.lite.glb";

  return [
    ...makeWheelPair(wheel.wheel, {
      role: "wheel",
      alignmentZDeg: wheelAlignment.wheel,
    }),
    ...makeWheelPair(handrimSource, {
      role: "handrim",
      alignmentZDeg: wheelAlignment.handrim,
    }),
    ...makeWheelPair(tyreSource, {
      role: "tyre",
      alignmentZDeg: wheelAlignment.tyre,
    }),
  ];
}

function getS5BrakeParts(selection) {
  let src = "";
  switch (selection.brake) {
    case "brake-push-bent":
      src = "/models/S5/前倒刹车 _ push to brake bended lever.optimized.glb";
      break;
    case "brake-push-folding":
      src = "/models/S5/延长车柄刹车-推刹 _ push to brake folding extended lever.optimized.glb";
      break;
    case "brake-pull-folding":
      src = "/models/S5/延长车柄刹车-拉刹 _ Pull to brake folding extended lever.optimized.glb";
      break;
    case "brake-scissors":
      src = "/models/S5/剪刀款刹车scissors folding brak aluminum.lite.glb";
      break;
    case "brake-push-straight":
    case "brake-pull-straight":
      src = "/models/S5/普通刹车 _ standard brake.optimized.glb";
      break;
    default:
      return [];
  }

  const versionedSrc = withS5ModelVersion(src);
  return [
    { key: "brakeRight", src: versionedSrc, tint: false },
    { key: "brakeLeft", src: versionedSrc, tint: false },
  ];
}

function getS5AxleParts(selection) {
  const axleId = String(selection.axle || "");
  const isTetra = axleId.indexOf("tetra") >= 0;
  const isStandard = axleId.indexOf("std") >= 0;
  const is24B = selection.rearWheel === "rw-24b";

  // Quick-release axle models only exist for the 24B wheel. Other wheels use
  // the implicit standard axle and must never render either axle asset.
  if (!is24B || (!isTetra && !isStandard)) {
    return [];
  }

  const src = withS5ModelVersion(
    isTetra
      ? "/models/S5/手板杆快拆 _ tetra quick release.optimized.glb"
      : "/models/S5/普通快拆 _ standard quick release.optimized.glb"
  );
  return [
    { key: "axleRight", src, tint: false },
    { key: "axleLeft", src, tint: false },
  ];
}

function getS5BackrestHandleParts(selection) {
  if (selection.backrestHandles === "bh-none") {
    return [];
  }
  const folding = selection.backrestHandles === "bh-folding";
  const src = withS5ModelVersion(
    folding
      ? "/models/S5/可折手把folding grip handle.optimized.glb"
      : "/models/S5/backrest-handle-standard.glb"
  );
  const handleStyle = folding ? "folding" : "standard";
  return [
    {
      key: "backrestHandleLeft",
      src,
      tint: !folding,
      blackWheel: folding,
      handleStyle,
      handleSide: -1,
    },
    {
      key: "backrestHandleRight",
      src,
      tint: !folding,
      blackWheel: folding,
      handleStyle,
      handleSide: 1,
    },
  ];
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
      ...getS5LateralFrameParts(selection),
      getS5StepPart(selection),
      getS5FootrestPlatePart(selection),
      ...getS5BaseParts(selection),
      ...getS5RearWheelParts(selection),
      ...getS5BrakeParts(selection),
      ...getS5AxleParts(selection),
      ...getS5BackrestHandleParts(selection),
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
