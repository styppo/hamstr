import fetch from 'cross-fetch'

export default class Nip05 {
  static async fetchPubkey(nip05Id) {
    const [user, host] = nip05Id.split('@')
    const url = `https://${host}/.well-known/nostr.json?name=${user}`
    try {
      const res = await fetch(url)
      const json = await res.json()
      console.log('nip05 data', json)
      return json.names[user]
    } catch (e) {
      console.error(`Failed to fetch NIP05 data for ${nip05Id}`, e)
      throw e
    }
  }
}
