import {EventKind} from 'src/nostr/model/Event'
import Nip05 from 'src/utils/Nip05'

export default class Profile {
  constructor(pubkey, lastUpdatedAt, metadata) {
    this.pubkey = pubkey
    this.lastUpdatedAt = lastUpdatedAt

    this.name = metadata.name
    this.about = metadata.about
    this.picture = metadata.picture
    this.nip05 = {
      url: metadata.nip05,
      verified: null,
    }
  }

  static from(event) {
    console.assert(event.kind === EventKind.METADATA)
    try {
      const metadata = JSON.parse(event.content)
      return new Profile(event.pubkey, event.createdAt, metadata)
    } catch (e) {
      console.error(`Failed to parse METADATA event: ${e.message || e}`, event, e)
      return null
    }
  }

  async isNip05Verified() {
    if (this.nip05.verified !== null) {
      return this.nip05.verified
    }
    if (!this.nip05.url) { // TODO more validation
      return false
    }
    this.nip05.verified = await Nip05.verify(this.pubkey, this.nip05.url)
    return this.nip05.verified
  }
}
