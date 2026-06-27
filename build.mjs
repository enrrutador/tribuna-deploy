import { build } from "esbuild";
import { execSync } from "node:child_process";

console.log("Building frontend (Vite)...");
execSync("npx vite build", { stdio: "inherit" });

console.log("\nBuilding server (esbuild)...");
await build({
  entryPoints: ["server/index.ts"],
  bundle: true,
  platform: "node",
  target: "node20",
  format: "esm",
  outdir: "dist-server",
  packages: "external",
  sourcemap: true,
  banner: {
    js: `import { createRequire as __createRequire } from "node:module"; const require = __createRequire(import.meta.url);`,
  },
});

console.log("\nBuild completo: dist/ (frontend) + dist-server/ (server)");
