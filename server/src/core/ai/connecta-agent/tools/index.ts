import fs from "fs";
import path from "path";
import { BaseTool } from "./base.tool";

// Choose extension based on runtime (ts-node / dev vs built js)
const ext = process.env.NODE_ENV === "development" ? ".ts" : ".js";

export const tools: Record<string, any> = {};

const currentDir = __dirname;

const files = fs
  .readdirSync(currentDir)
  .filter(
    (f) =>
      f.endsWith(`.tool${ext}`) &&
      f !== `base.tool${ext}` &&
      f !== `index${ext}`
  );

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
