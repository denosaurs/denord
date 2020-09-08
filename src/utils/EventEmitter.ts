export default class EventEmitter<E> {
  listeners = {} as Record<any, ((args: any) => void)[]>; //TODO: proper types

  /**
   * Adds the listener function to the end of the listeners array for the event
   *  named eventName. No checks are made to see if the listener has already
   * been added. Multiple calls passing the same combination of eventName and
   * listener will result in the listener being added, and called, multiple
   * times.
   */
  on<K extends keyof E, T extends E[K]>(
    eventName: K,
    listener: (args: T) => void,
  ) {
    if (!(eventName in this.listeners)) {
      this.listeners[eventName] = [];
    }
    this.listeners[eventName].push(listener);
  }

  /**
   * Adds a one-time listener function for the event named eventName. The next
   * time eventName is triggered, this listener is removed and then invoked.
   */
  once<K extends keyof E, T extends E[K]>(
    eventName: K,
    listener: (args: T) => void,
  ) {
    const wrapped = (args: T): void => {
      listener(args);
      this.off(eventName, listener);
    };

    this.on(eventName, wrapped);
  }

  /**
   * Removes the listener from eventName.
   * If no listener is passed, all listeners will be removed from eventName.
   * If no eventName is passed, all listeners will be removed from the EventEmitter.
   */
  off<K extends keyof E, T extends E[K]>(
    eventName?: K,
    listener?: (args: T) => void,
  ) {
    if (eventName) {
      if (eventName in this.listeners) {
        if (listener) {
          this.listeners[eventName] = this.listeners[eventName].filter(
            (cb) => cb !== listener,
          );
        } else {
          delete this.listeners[eventName];
        }
      }
    } else {
      this.listeners = {} as Record<K, ((args: T) => void)[]>;
    }
  }

  /**
   * Synchronously calls each of the listeners registered for the event named
   * eventName, in the order they were registered, passing the supplied
   * arguments to each.
   */
  emit<K extends keyof E, T extends E[K]>(eventName: K, args: T) {
    if (eventName in this.listeners) {
      for (const listener of this.listeners[eventName]) {
        listener(args);
      }
    }
  }
}
