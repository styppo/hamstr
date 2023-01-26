import JobQueue from 'src/utils/JobQueue'

export default class Nip07 {
  static isAvailable() {
    return !!window.nostr
  }

  static enforceAvailable() {
    if (!Nip07.isAvailable()) throw new Error('Nip07 support not available')
  }

  static getPublicKey() {
    Nip07.enforceAvailable()
    return Nip07.queue.push(() => window.nostr.getPublicKey())
  }

  static signEvent(event) {
    Nip07.enforceAvailable()
    return Nip07.queue.push(() => window.nostr.signEvent(event))
  }

  static encrypt(pubkey, plaintext) {
    Nip07.enforceAvailable()
    return Nip07.queue.push(() => window.nostr.nip04.encrypt(pubkey, plaintext))
  }

  static decrypt(pubkey, ciphertext) {
    Nip07.enforceAvailable()
    return Nip07.queue.push(() => window.nostr.nip04.decrypt(pubkey, ciphertext))
  }
}
Nip07.queue = new JobQueue()
