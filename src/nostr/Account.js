import {getEventHash, getPublicKey, signEvent} from 'nostr-tools'
import Nip07 from 'src/utils/Nip07'

export class Account {
  constructor(opts) {
    this.pubkey = opts.pubkey || null
    this.privkey = opts.privkey || null
    this.useExtension = opts.useExtension || false

    if (this.privkey && !this.pubkey) {
      this.pubkey = getPublicKey(this.privkey)
    }

    if (!this.pubkey) throw new Error('pubkey is required')
  }

  canSign() {
    return !!this.privkey || (this.useExtension && Nip07.isAvailable())
  }

  async sign(event) {
    event.id = getEventHash(event)
    if (this.privkey) {
      event.sig = signEvent(event, this.privkey)
    } else if (this.useExtension && Nip07.isAvailable()) {
      let {sig} = await Nip07.signEvent(event)
      event.sig = sig
    } else {
      throw new Error('cannot sign')
    }
    return event
  }
}
