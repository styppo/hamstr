import {hexToBech32} from 'src/utils/utils'

export default {
  methods: {
    goToProfile(pubkey) {
      this.$router.push({
        name: 'profile',
        params: {
          pubkey: hexToBech32(pubkey, 'npub')
        }
      })
    },
    goToThread(id) {
      this.$router.push({
        name: 'thread',
        params: {
          id: hexToBech32(id, 'note')
        }
      })
    }
  }
}
