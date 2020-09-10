export default class EventEmitter<E extends Record<string, any[]>> {
  listeners: {
    [K in keyof E]?: Array<{
      once: boolean;
      cb: (...args: E[K]) => void;
    }>;
  } = Object.create(null);
  #writer: WritableStreamDefaultWriter<[keyof E, E[keyof E]]> | undefined;

  /**
   * Adds the listener function to the end of the listeners array for the event
   *  named eventName. No checks are made to see if the listener has already
   * been added. Multiple calls passing the same combination of eventName and
   * listener will result in the listener being added, and called, multiple
   * times.
   */
  on<K extends keyof E>(eventName: K, listener: (...args: E[K]) => void) {
    if (!this.listeners[eventName]) {
      this.listeners[eventName] = [];
    }
    this.listeners[eventName]!.push({
      once: false,
      cb: listener,
    });
  }

  /**
   * Adds a one-time listener function for the event named eventName. The next
   * time eventName is triggered, this listener is removed and then invoked.
   */
  once<K extends keyof E>(eventName: K, listener: (...args: E[K]) => void) {
    if (!this.listeners[eventName]) {
      this.listeners[eventName] = [];
    }
    this.listeners[eventName]!.push({
      once: true,
      cb: listener,
    });
  }

  /**
   * Removes the listener from eventName.
   * If no listener is passed, all listeners will be removed from eventName.
   * If no eventName is passed, all listeners will be removed from the EventEmitter.
   */
  off<K extends keyof E>(eventName?: K, listener?: (...args: E[K]) => void) {
    if (eventName) {
      if (listener) {
        this.listeners[eventName] = this.listeners[eventName]?.filter(
          ({ cb }) => cb !== listener,
        );
      } else {
        delete this.listeners[eventName];
      }
    } else {
      this.listeners = Object.create(null);
    }
  }

  /**
   * Synchronously calls each of the listeners registered for the event named
   * eventName, in the order they were registered, passing the supplied
   * arguments to each.
   */
  emit<K extends keyof E>(eventName: K, ...args: E[K]) {
    const listeners = this.listeners[eventName]?.slice() ?? [];
    for (const { cb, once } of listeners) {
      cb(...args);

      if (once) {
        this.off(eventName, cb);
      }
    }

    return this.#writer?.write([eventName, args]);
  }

  async *[Symbol.asyncIterator](): AsyncIterableIterator<
    { [K in keyof E]: [K, E[K]] }[keyof E]
  > {
    const { readable, writable } = new TransformStream<
      [keyof E, E[keyof E]],
      [keyof E, E[keyof E]]
    >();
    this.#writer = writable.getWriter();
    yield* readable.getIterator();
  }
}
