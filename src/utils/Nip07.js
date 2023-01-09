export default class Nip07 {
  static isAvailable() {
    return !!window.nostr
  }

  static enforceAvailable() {
    if (!Nip07.isAvailable()) throw new Error('Nip07 support not available')
  }

  static getPublicKey() {
    Nip07.enforceAvailable()
    return window.nostr.getPublicKey()
  }

  static signEvent(event) {
    Nip07.enforceAvailable()
    return window.nostr.signEvent(event)
  }
}
