import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { BaseTool } from "./base.tool";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Choose extension based on runtime (ts-node / dev vs built js)
const ext = process.env.NODE_ENV === "development" ? ".ts" : ".js";

export const tools: Record<string, any> = {};

const files = fs
  .readdirSync(__dirname)
  .filter(
    (f) =>
      f.endsWith(`.tool${ext}`) &&
      f !== `base.tool${ext}` &&
      f !== `index${ext}`
  );

// dynamic import must be async; export a loader function
export async function loadTools() {
  for (const file of files) {
    const modulePath = path.join(__dirname, file);
    const imported = await import(modulePath);
    for (const exported of Object.values(imported)) {
      if (typeof exported === "function") {
        // instance check: create temporary instance if constructor takes (apiBaseUrl?)
        try {
          const inst = new (exported as any)("","", "", true);
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
