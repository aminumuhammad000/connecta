// Simple logger utility

type LogLevel = "info" | "warn" | "error" | "debug";

class Logger {
    private logLevel: LogLevel = "info";

    setLevel(level: LogLevel) {
        this.logLevel = level;
    }

    info(message: string, ...args: any[]) {
        console.log(`[INFO] ${new Date().toISOString()} - ${message}`, ...args);
    }

    warn(message: string, ...args: any[]) {
        console.warn(`[WARN] ${new Date().toISOString()} - ${message}`, ...args);
    }

    error(message: string, ...args: any[]) {
        console.error(`[ERROR] ${new Date().toISOString()} - ${message}`, ...args);
    }

    debug(message: string, ...args: any[]) {
        if (this.logLevel === "debug") {
            console.log(`[DEBUG] ${new Date().toISOString()} - ${message}`, ...args);
        }
    }
}

export const logger = new Logger();
