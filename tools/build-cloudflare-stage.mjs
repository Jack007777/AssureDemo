import fs from "node:fs";
import path from "node:path";

const workspace = path.resolve(".");
const stage = path.resolve(".publish-live");

if (path.dirname(stage) !== workspace || path.basename(stage) !== ".publish-live") {
  throw new Error(`Unsafe publish path: ${stage}`);
}

fs.rmSync(stage, { recursive: true, force: true });
fs.mkdirSync(stage, { recursive: true });

for (const file of ["index.html", "logo.png", "CNAME", "_headers"]) {
  fs.copyFileSync(path.join(workspace, file), path.join(stage, file));
}
for (const directory of ["assets", "draco"]) {
  fs.cpSync(path.join(workspace, directory), path.join(stage, directory), { recursive: true });
}

const modelReferences = new Set([
  "/models/S5/frame-split/middle body.lite.glb",
]);
for (const sourceFile of ["assets/model-parts.mjs", "assets/runtime-model-viewer.mjs"]) {
  const source = fs.readFileSync(path.join(workspace, sourceFile), "utf8");
  for (const match of source.matchAll(/["'`](\/models\/[^"'`?]+\.glb)/g)) {
    if (!match[1].includes("${")) modelReferences.add(decodeURI(match[1]));
  }
}

const s2Directory = path.join(workspace, "models/S2");
for (const name of fs.readdirSync(s2Directory)) {
  if (name.toLowerCase().endsWith(".glb")) modelReferences.add(`/models/S2/${name}`);
}

let modelBytes = 0;
for (const reference of modelReferences) {
  const source = path.join(workspace, reference.slice(1));
  if (!fs.existsSync(source)) throw new Error(`Missing referenced model: ${reference}`);
  const destination = path.join(stage, reference.slice(1));
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.copyFileSync(source, destination);
  modelBytes += fs.statSync(source).size;
}

console.log(`Cloudflare stage: ${stage}`);
console.log(`Models: ${modelReferences.size}, ${(modelBytes / 1048576).toFixed(2)} MB`);
