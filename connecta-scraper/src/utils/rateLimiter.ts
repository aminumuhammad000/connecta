// Rate limiter to prevent overwhelming target sites

export class RateLimiter {
    private queue: Array<() => Promise<void>> = [];
    private running = 0;
    private maxConcurrent: number;
    private minDelay: number;

    constructor(maxConcurrent: number = 1, minDelayMs: number = 1000) {
        this.maxConcurrent = maxConcurrent;
        this.minDelay = minDelayMs;
    }

    async execute<T>(fn: () => Promise<T>): Promise<T> {
        return new Promise((resolve, reject) => {
            this.queue.push(async () => {
                try {
                    this.running++;
                    const result = await fn();
                    resolve(result);
                } catch (error) {
                    reject(error);
                } finally {
                    this.running--;
                    await this.delay(this.minDelay);
                    this.processNext();
                }
            });

            this.processNext();
        });
    }

    private processNext() {
        if (this.running < this.maxConcurrent && this.queue.length > 0) {
            const next = this.queue.shift();
            if (next) next();
        }
    }

    private delay(ms: number): Promise<void> {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
}

export const rateLimiter = new RateLimiter(2, 2000); // 2 concurrent, 2s delay
