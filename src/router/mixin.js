import {hexToBech32} from 'src/utils/utils'

export default {
  methods: {
    linkToProfile(pubkey) {
      this.$router.push({
        name: 'profile',
        params: {
          pubkey: hexToBech32(pubkey, 'npub')
        }
      })
    },
    linkToEvent(id) {
      this.$router.push({name: 'event', params: {id}})
    }
  }
}
