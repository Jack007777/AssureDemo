const S5_BASE_PARTS = [
  { key: "seat", src: "/models/S5/Sitzbespannung.glb", tint: false },
  { key: "backrest", src: "/models/S5/Ruecken.glb", tint: false },
  { key: "sideguards", src: "/models/S5/Seitenteilen-standard.glb", tint: false },
  { key: "footrest", src: "/models/S5/Fussbrett.glb", tint: false },
  { key: "frontCaster", src: "/models/S5/Lenkraerder-standard.glb", tint: false },
];

function getS5FramePart(selection) {
  const frameAngle = selection.frameAngle || "";
  const frameLength = selection.frameLength || "";
  if (frameAngle === "fa-90" && frameLength === "fl-long") {
    return { key: "frame", src: "/models/S5/90度长车架 _ 90-degree long frame.glb", tint: true };
  }
  if (frameAngle === "fa-90") {
    return { key: "frame", src: "/models/S5/90度短车架 _ 90-degree short frame.glb", tint: true };
  }
  return { key: "frame", src: "/models/S5/Rahmen-standard.glb", tint: true };
}

function getS5RearWheelPart(selection) {
  switch (selection.rearWheel) {
    case "rw-22-18":
      return { key: "rearWheel", src: "/models/S5/22寸18辐后轮 _ light wheel.optimized.glb", tint: false };
    case "rw-24-12":
    case "rw-24-18":
      return { key: "rearWheel", src: "/models/S5/24寸12辐条后轮 _ ultra light wheel.optimized.glb", tint: false };
    case "rw-24-big":
      return { key: "rearWheel", src: "/models/S5/S5加强后轮 _ S5 large hub rear wheels.optimized.glb", tint: false };
    default:
      return { key: "rearWheel", src: "/models/S5/Antriebsraede-Klein.glb", tint: false };
  }
}

function getS5HandrimPart(selection) {
  if (selection.handrim === "hr-big-24") {
    return { key: "handrim", src: "/models/S5/S5异形手轮 _ S5 big ergonom handrail incl rubber strap.optimized.glb", tint: false };
  }
  return null;
}

function getS5BrakePart(selection) {
  switch (selection.brake) {
    case "brake-push-bent":
      return { key: "brake", src: "/models/S5/前倒刹车 _ push to brake bended lever.optimized.glb", tint: false };
    case "brake-push-folding":
      return { key: "brake", src: "/models/S5/延长车柄刹车-推刹 _ push to brake folding extended lever.optimized.glb", tint: false };
    case "brake-pull-folding":
      return { key: "brake", src: "/models/S5/延长车柄刹车-拉刹 _ Pull to brake folding extended lever.optimized.glb", tint: false };
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
      getS5FramePart(selection),
      ...S5_BASE_PARTS,
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
