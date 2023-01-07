export class Observable {
  constructor() {
    this.listeners = {}
  }

  on(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = [callback]
    } else {
      this.listeners[event].push(callback)
    }
  }

  emit(event, ...args) {
    const listeners = this.listeners[event]
    if (!listeners) return

    for (const listener of listeners) {
      try {
        listener.apply(null, args)
      } catch (e) {
        console.error(`Exception thrown from '${event}' listener: ${e.message || e}`, e)
      }
    }
  }
}
