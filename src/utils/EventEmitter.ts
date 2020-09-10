export default class EventEmitter<E extends Record<string, unknown[]>> {
  listeners: {
    [K in keyof E]?: Array<{
      once: boolean;
      cb: (...args: E[K]) => void;
    }>;
  } = Object.create(null);
  #writer: WritableStreamDefaultWriter<[keyof E, E[keyof E]]> | undefined;
  #writers: {
    [K in keyof E]?: WritableStreamDefaultWriter<E[K]>;
  } = Object.create(null);

  /**
   * Appends the listener to the listeners array of the corresponding eventName.
   * No checks are made if the listener was already added, so adding multiple
   * listeners will result in the listener being called multiple times.
   *
   * If no listener is supplied, an asyncIterator is returned which will fire
   * every time an event with the eventName is emitted.
   */
  on<K extends keyof E>(eventName: K): AsyncIterableIterator<E[K]>;
  on<K extends keyof E>(eventName: K, listener: (...args: E[K]) => void): void;
  on<K extends keyof E>(
    eventName: K,
    listener?: (...args: E[K]) => void,
  ): AsyncIterableIterator<E[K]> | void {
    if (listener) {
      if (!this.listeners[eventName]) {
        this.listeners[eventName] = [];
      }
      this.listeners[eventName]!.push({
        once: false,
        cb: listener,
      });
    } else {
      return this.asyncOn(eventName);
    }
  }

  async *asyncOn<K extends keyof E>(eventName: K): AsyncIterableIterator<E[K]> {
    const { readable, writable } = new TransformStream<E[K], E[K]>();
    this.#writers[eventName] = writable.getWriter();
    yield* readable.getIterator();
  }

  /**
   * Adds a one-time listener function for the event named eventName. The next
   * time eventName is emitted, listener is called and then removed.
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

    this.#writer?.write([eventName, args]);
    this.#writers[eventName]?.write(args);
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
