import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import process from "node:process";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const modeArg = (process.argv[2] || process.env.BACKEND_ENV_MODE || "local").toLowerCase();
const mode = modeArg === "deploy" ? "deploy" : "local";

const sourceEnvFile = mode === "local" ? "localhost.env" : "deploy.env";
const sourcePath = path.join(projectRoot, "config", "backend-urls", sourceEnvFile);
const targetPath = path.join(projectRoot, ".env.local");

try {
  const envContent = await fs.readFile(sourcePath, "utf8");
  await fs.writeFile(targetPath, envContent.endsWith("\n") ? envContent : `${envContent}\n`, "utf8");
  console.log(`[backend-env] loaded ${mode}.env -> .env.local`);
  console.log(`[backend-env] source: ${sourcePath}`);
} catch (error) {
  console.error(`[backend-env] failed to load ${mode}.env`);
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}