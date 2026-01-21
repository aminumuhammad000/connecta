"use strict";
// Rate limiter to prevent overwhelming target sites
Object.defineProperty(exports, "__esModule", { value: true });
exports.rateLimiter = exports.RateLimiter = void 0;
class RateLimiter {
    constructor(maxConcurrent = 1, minDelayMs = 1000) {
        this.queue = [];
        this.running = 0;
        this.maxConcurrent = maxConcurrent;
        this.minDelay = minDelayMs;
    }
    async execute(fn) {
        return new Promise((resolve, reject) => {
            this.queue.push(async () => {
                try {
                    this.running++;
                    const result = await fn();
                    resolve(result);
                }
                catch (error) {
                    reject(error);
                }
                finally {
                    this.running--;
                    await this.delay(this.minDelay);
                    this.processNext();
                }
            });
            this.processNext();
        });
    }
    processNext() {
        if (this.running < this.maxConcurrent && this.queue.length > 0) {
            const next = this.queue.shift();
            if (next)
                next();
        }
    }
    delay(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
}
exports.RateLimiter = RateLimiter;
exports.rateLimiter = new RateLimiter(2, 2000); // 2 concurrent, 2s delay
