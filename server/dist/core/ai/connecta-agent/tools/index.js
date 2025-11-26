"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.tools = void 0;
exports.loadTools = loadTools;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const base_tool_1 = require("./base.tool");
exports.tools = {};
const currentDir = __dirname;
// Support both TS (dev with ts-node) and JS (built) tool files
const files = fs_1.default
    .readdirSync(currentDir)
    .filter((f) => {
    const isTool = f.endsWith(".tool.ts") || f.endsWith(".tool.js");
    const isIndex = f === "index.ts" || f === "index.js";
    const isBase = f === "base.tool.ts" || f === "base.tool.js";
    return isTool && !isIndex && !isBase;
});
// Loader function to register tool classes
async function loadTools() {
    for (const file of files) {
        const modulePath = path_1.default.join(currentDir, file);
        // Use require() for CommonJS runtime (ts-node dev) to avoid ESM import.meta
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const imported = require(modulePath);
        for (const exported of Object.values(imported)) {
            if (typeof exported === "function") {
                try {
                    const inst = new exported("", "", "", true);
                    if (inst instanceof base_tool_1.BaseTool) {
                        exports.tools[inst.name] = exported;
                    }
                }
                catch {
                    // skip if cannot instantiate with mock args
                }
            }
        }
    }
}
