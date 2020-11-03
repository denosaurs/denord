/** Ratelimit options for TaskQueue */
export interface RateLimit {
  remaining: number;
  reset?: number;
}

/** Representation of a runnable task */
export type Task = () => Promise<unknown>;

/** Internal interface to keep track of promises */
interface Runtime {
  task: Task;
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}

/** Ratelimit tasks and execute them sequentially  */
export class TaskQueue {
  writer;
  reader;

  rateLimit: RateLimit;

  constructor() {
    this.rateLimit = {
      remaining: 1,
    };

    const stream = new TransformStream<Runtime, Runtime>();
    this.writer = stream.writable.getWriter();
    this.reader = stream.readable.getReader();
  }

  async run() {
    const { value } = await this.reader.read();
    if (this.rateLimit.remaining <= 0) {
      await new Promise((res) =>
        setTimeout(
          res,
          Math.max(0, ((this.rateLimit.reset || 0) - Date.now()) + 1),
        )
      );
    }
    this.rateLimit.remaining--;

    value!
      .task()
      .then(value!.resolve)
      .catch(value!.reject);
  }

  push(task: Task): Promise<unknown> {
    return new Promise(async (resolve, reject) => {
      await this.writer.write({
        task,
        resolve,
        reject,
      });
      await this.run();
    });
  }
}
