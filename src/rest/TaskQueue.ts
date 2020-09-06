type Task = () => Promise<unknown>;

interface Latency {
  value: number;
  offset: number;
}

interface Runtime {
  task: Task;
  resolve: (value?: unknown) => void;
  reject: (reason?: any) => void;
}

export class TaskQueue {
  remaining: number;
  limit: number;
  latency: Latency;

  queue: Runtime[];
  busy?: number;

  reset: number;

  constructor(limit: number, latency: Latency) {
    this.limit = this.remaining = limit;
    this.latency = latency;
    this.queue = [];
    this.busy = undefined;
    this.reset = 0;
  }

  private run(override: boolean) {
    if (this.queue.length === 0) {
      if (this.busy) {
        clearTimeout(this.busy);
        this.busy = undefined;
      }
      return;
    }
    if (this.busy && !override) {
      return;
    }
    const now = Date.now();
    const offset = this.latency.value + (this.latency.offset || 0);
    if (!this.reset || this.reset < now - offset) {
      this.reset = now;
      this.remaining = this.limit;
    }
    if (this.remaining <= 0) {
      this.busy = setTimeout(() => {
        this.busy = undefined;
        this.run(true);
      }, Math.max(0, (this.reset || 0) - now + offset) + 1);
      return;
    }
    --this.remaining;

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
    const promise = new Promise((resolve, reject) => {
      this.queue.push({
        task,
        resolve,
        reject,
      });
      this.run(false);
    });
    return promise;
  }
}
