import {useProfileStore} from 'src/nostr/store/ProfileStore'
import Nip05 from 'src/utils/Nip05'
import {bech32prefix, bech32ToHex, isBech32} from 'src/utils/utils'

export default class SearchProvider {
  constructor() {
    this.profiles = useProfileStore()
  }

  async queryProfiles(query) {
    const results = new Set()
    const [user, domain] = (query?.split('@') || [])
    if (domain) {
      (await SearchProvider.queryNip05(user, domain)).forEach(pubkey => results.add(pubkey))
      this.profiles.findByNip05(query).forEach(pubkey => results.add(pubkey))
    } else if (isBech32(query) && bech32prefix(query) === 'npub') {
      results.add(bech32ToHex(query))
    } else {
      this.profiles.findByName(query).forEach(pubkey => results.add(pubkey))
    }
    return Array.from(results)
  }

  static async queryNip05(user, domain) {
    const names = await Nip05.fetchNames(domain)
    if (!names) return []
    if (user) {
      return Object.entries(names)
        .filter(([name, _]) => name?.toLowerCase().startsWith(user.toLowerCase()))
        .map(([_, pubkey]) => pubkey)
    }
    return Object.values(names)
  }
}
