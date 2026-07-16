import { copyFile, mkdir } from "node:fs/promises";
import { resolve } from "node:path";

const projectRoot = resolve(import.meta.dirname, "..");
const distRoot = resolve(projectRoot, "dist");

await Promise.all([
  mkdir(resolve(distRoot, "server"), { recursive: true }),
  mkdir(resolve(distRoot, ".openai"), { recursive: true }),
]);

await Promise.all([
  copyFile(resolve(projectRoot, "worker", "index.js"), resolve(distRoot, "server", "index.js")),
  copyFile(resolve(projectRoot, ".openai", "hosting.json"), resolve(distRoot, ".openai", "hosting.json")),
]);

console.log("Prepared the Sites server entrypoint and hosting metadata.");
