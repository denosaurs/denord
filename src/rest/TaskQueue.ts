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
  writer: WritableStreamDefaultWriter<Runtime>;
  reader: ReadableStreamDefaultReader<Runtime>;

  rateLimit = {
    remaining: 1,
    reset: 0,
  };

  constructor() {
    const stream = new TransformStream<Runtime, Runtime>();
    this.writer = stream.writable.getWriter();
    this.reader = stream.readable.getReader();
  }

  async run() {
    const { value } = await this.reader.read();
    if (this.rateLimit.remaining === 0) {
      await new Promise((res) =>
        setTimeout(
          res,
          Math.max(0, this.rateLimit.reset - Date.now()),
        )
      );
    } else {
      this.rateLimit.remaining--;
    }

    value!
      .task()
      .then(value!.resolve)
      .catch(value!.reject);
  }

  push(task: Task): Promise<unknown> {
    return new Promise((resolve, reject) => {
      this.writer.write({
        task,
        resolve,
        reject,
      });
      this.run();
    });
  }
}
