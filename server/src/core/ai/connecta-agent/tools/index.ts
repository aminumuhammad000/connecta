import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { BaseTool } from "./base.tool";

export const tools: Record<string, any> = {};

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const currentDir = __dirname;

// Support both TS (dev with ts-node) and JS (built) tool files
const files = fs
  .readdirSync(currentDir)
  .filter((f) => {
    const isTool = f.endsWith(".tool.ts") || f.endsWith(".tool.js");
    const isIndex = f === "index.ts" || f === "index.js";
    const isBase = f === "base.tool.ts" || f === "base.tool.js";
    return isTool && !isIndex && !isBase;
  });

// Loader function to register tool classes
export async function loadTools() {
  for (const file of files) {
    try {
      const modulePath = path.join(currentDir, file);
      // Use dynamic import for ESM compatibility
      const moduleUrl = `file://${modulePath}`;
      const imported = await import(moduleUrl);
      for (const exported of Object.values(imported)) {
        if (typeof exported === "function") {
          try {
            const inst = new (exported as any)("", "", "", true);
            if (inst instanceof BaseTool) {
              tools[inst.name] = exported;
            }
          } catch {
            // skip if cannot instantiate with mock args
          }
        }
      }
    } catch (err) {
      console.error(`❌ Failed to load tool file ${file}:`, err);
    }
  }
}
