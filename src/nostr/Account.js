import {getEventHash, getPublicKey, signEvent, nip04} from 'nostr-tools'
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

  canDecrypt() {
    return this.canSign()
  }

  decrypt(pubkey, content) {
    if (this.privkey) {
      return nip04.decrypt(this.privkey, pubkey, content)
    } else if (this.useExtension && Nip07.isAvailable()) {
      return Nip07.decrypt(pubkey, content)
    } else {
      throw new Error('cannot decrypt')
    }
  }

  canEncrypt() {
    return this.canSign()
  }

  encrypt(pubkey, content) {
    if (this.privkey) {
      return nip04.encrypt(this.privkey, pubkey, content)
    } else if (this.useExtension && Nip07.isAvailable()) {
      return Nip07.encrypt(pubkey, content)
    } else {
      throw new Error('cannot encrypt')
    }
  }
}
