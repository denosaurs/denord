/** Ratelimit options for TaskQueue */
export interface RateLimit {
  bucket?: string;
  limit: number;
  remaining: number;
  reset?: number;
  resetAfter: number;
}

/** Representation of a runnable task */
export type Task = () => Promise<unknown>;

/** Internal interface to keep track of promises */
interface Runtime {
  task: Task;
  resolve: (value?: unknown) => void;
  reject: (reason?: any) => void;
}

/** Ratelimit tasks and execute them sequentially  */
export class TaskQueue {
  ratelimit: RateLimit;

  queue: Runtime[];
  busy?: number;

  constructor(rate: RateLimit) {
    this.ratelimit = rate;
    this.queue = [];
    this.busy = undefined;
  }

  private run(override: boolean) {
    if (this.queue.length === 0) {
      if (this.busy) {
        clearTimeout(this.busy);
        this.busy = undefined;
      }
      console.log("Queue empty");
      return;
    }
    if (this.busy && !override) {
      console.log("Busy");
      return;
    }
    const now = Date.now();
    const delay = this.ratelimit.resetAfter;
    if (!this.ratelimit.reset || this.ratelimit.reset < now - delay) {
      this.ratelimit.reset = now - delay;
      this.ratelimit.remaining = this.ratelimit.limit;
    }
    if (this.ratelimit.remaining <= 0) {
      this.busy = setTimeout(() => {
        this.busy = undefined;
        this.run(true);
      }, Math.max(0, (this.ratelimit.reset || 0) - now + delay) + 1);
      return;
    }
    --this.ratelimit.remaining;

    this.busy = 1;
    const runtime = this.queue.shift()!;
    runtime
      .task()
      .then(runtime.resolve)
      .catch(runtime.reject)
      .finally(() => {
        if (this.queue.length > 0) {
          this.run(true);
        } else {
          this.busy = undefined;
        }
      });
  }

  async push(task: Task): Promise<unknown> {
    return new Promise((resolve, reject) => {
      this.queue.push({
        task,
        resolve,
        reject,
      });
      this.run(false);
    });
  }
}
