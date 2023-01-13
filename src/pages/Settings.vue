<template>
  <PageHeader />
  <div class="settings">
    <h3>Relays</h3>
    <RelaySettings />
  </div>
</template>

<script>
import PageHeader from 'components/PageHeader.vue'
import RelaySettings from 'components/Settings/RelaySettings.vue'

export default {
  name: 'Settings',
  components: {
    PageHeader,
    RelaySettings
  }
}
</script>

<style scoped>
.settings {
  padding: 0 1rem;
}
</style>
