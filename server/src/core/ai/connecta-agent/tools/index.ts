import fs from "fs";
import path from "path";
import { BaseTool } from "./base.tool";

export const tools: Record<string, any> = {};

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
    const modulePath = path.join(currentDir, file);
    // Use require() for CommonJS runtime (ts-node dev) to avoid ESM import.meta
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const imported = require(modulePath);
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
  }
}
