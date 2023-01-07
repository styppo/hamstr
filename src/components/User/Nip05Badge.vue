<template>
  <q-dialog v-model="NIP05Dialog">
    <q-card class="flex column no-wrap" style="max-height: 90%">
      <div class="flex row justify-end">
        <q-btn icon="close" flat dense v-close-popup/>
      </div>
      <div class="overflow-auto">
        <q-card-section>
          <div class="text-subtitle1 flex row overflow-auto items-end q-gutter-sm">
            NIP05 identifier
          <a :href="NIP05Link" target="_">{{ NIP05Link }}</a>
          </div>
          <pre v-if="NIP05Loaded">{{ NIP05Formatted }}</pre>
          <q-inner-loading :showing="!NIP05Loaded">
            <q-spinner-orbit color="accent" size="2rem" />
          </q-inner-loading>
          <div>
            Learn how to get NIP05 verified&nbsp;<a href="https://gist.github.com/metasikander/609a538e6a03b2f67e5c8de625baed3e" target='_'>here</a>
          </div>
        </q-card-section>
      </div>
    </q-card>
  </q-dialog>
  <q-btn
    v-if="$store.getters.NIP05Id(pubkey)"
    icon="verified"
    flat
    dense
    :size="size"
    class="no-padding"
    clickable
    @click.stop="openNIP05"
  >
    <q-tooltip>
      NIP05 verified
    </q-tooltip>
  </q-btn>
</template>

<script>
import fetch from 'cross-fetch'

export default {
  name: 'Nip05Badge',
  props: {
    pubkey: {
      type: String,
      required: true,
    },
    size: {
      type: String,
      default: 'xs'
    }
  },
  data() {
    return {
      NIP05Dialog: false,
      NIP05Data: {},
    }
  },

  computed: {
    NIP05Link() {
      // let [name, domain] = this.$store.getters
      //   .NIP05Id(this.pubkey)
      //   .split('@')
      // if (!domain) {
      //   domain = name
      //   name = '_'
      // }
      // return `https://${domain}/.well-known/nostr.json?name=${name}`
      return 'TODO'
    },
    NIP05Formatted() {
      return this.json(this.NIP05Data)
    },
    NIP05Loaded() {
      if (Object.keys(this.NIP05Data).length) return true
      return false
    }
  },

  methods: {
    openNIP05() {
      this.loadNIP05Data()
      this.NIP05Dialog = !this.NIP05Dialog
    },

    async loadNIP05Data() {
      try {
        this.NIP05Data = await (await fetch(this.NIP05Link)).json()
      } catch (e) {
        console.warn(`Failed to fetch NIP05 identifier ${this.NIP05Link}`, e)
      }
    },
  }
}
</script>

