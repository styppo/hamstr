export class Observable {
  constructor() {
    this.listeners = {}
  }

  on(event, callback) {
    this.addListener(event, {callback, once: false})
  }

  once(event, callback) {
    this.addListener(event, {callback, once: true})
  }

  off(event, callback) {
    const listeners = this.listeners[event]
    if (!listeners) return
    const idx = listeners.findIndex(listener => listener.callback === callback)
    if (idx >= 0) listeners.splice(idx, 1)
  }

  addListener(event, listener) {
    if (!this.listeners[event]) {
      this.listeners[event] = [listener]
    } else {
      this.listeners[event].push(listener)
    }
  }

  emit(event, ...args) {
    const listeners = this.listeners[event]
    if (!listeners) return

    for (const listener of listeners) {
      try {
        listener.callback.apply(null, args)
      } catch (e) {
        console.error(`Exception thrown from '${event}' listener: ${e.message || e}`, e)
      }
    }

    this.listeners[event] = listeners.filter(listener => !listener.once)
  }
}
