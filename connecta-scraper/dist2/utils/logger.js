"use strict";
// Simple logger utility
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
class Logger {
    constructor() {
        this.logLevel = "info";
    }
    setLevel(level) {
        this.logLevel = level;
    }
    info(message, ...args) {
        console.log(`[INFO] ${new Date().toISOString()} - ${message}`, ...args);
    }
    warn(message, ...args) {
        console.warn(`[WARN] ${new Date().toISOString()} - ${message}`, ...args);
    }
    error(message, ...args) {
        console.error(`[ERROR] ${new Date().toISOString()} - ${message}`, ...args);
    }
    debug(message, ...args) {
        if (this.logLevel === "debug") {
            console.log(`[DEBUG] ${new Date().toISOString()} - ${message}`, ...args);
        }
    }
}
exports.logger = new Logger();
