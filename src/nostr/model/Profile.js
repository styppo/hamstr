import {EventKind} from 'src/nostr/model/Event'

export default class Profile {
  constructor(pubkey, lastUpdatedAt, metadata) {
    this.pubkey = pubkey
    this.lastUpdatedAt = lastUpdatedAt

    this.name = metadata.name
    this.about = metadata.about
    this.picture = metadata.picture
    this.nip05 = {
      url: metadata.nip05,
      verified: false,
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
}
