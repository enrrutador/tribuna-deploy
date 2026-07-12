import { createRequire } from "node:module";
const require = createRequire(import.meta.url);

console.log("[start] Node version:", process.version);
console.log("[start] Starting server...");

try {
  await import("./dist-server/index.js");
} catch (err) {
  console.error("[start] FATAL:", err);
  console.error("[start] Stack:", err.stack);
  process.exit(1);
}
