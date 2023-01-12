import {hexToBech32, isBech32} from 'src/utils/utils'

function ensureBech32(str, prefix) {
  return isBech32(str)
    ? str
    : hexToBech32(str, prefix)
}

export default {
  methods: {
    goToProfile(pubkey) {
      this.$router.push({
        name: 'profile',
        params: {
          pubkey: ensureBech32(pubkey, 'npub')
        }
      })
    },
    goToThread(id) {
      this.$router.push({
        name: 'thread',
        params: {
          id: ensureBech32(id, 'note')
        }
      })
    },
    // TODO There must be a better way to do this
    linkToProfile(pubkey) {
      return `/profile/${ensureBech32(pubkey, 'npub')}`
    },
    linkToThread(id) {
      return `/thread/${ensureBech32(id, 'note')}`
    }
  }
}
