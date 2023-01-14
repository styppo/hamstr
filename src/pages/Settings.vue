<template>
  <PageHeader back-button />
  <div class="settings">
    <ProfileSettings />
    <RelaySettings />
  </div>
</template>

<script>
import PageHeader from 'components/PageHeader.vue'
import RelaySettings from 'components/Settings/RelaySettings.vue'
import ProfileSettings from 'components/Settings/ProfileSettings.vue'

export default {
  name: 'Settings',
  components: {
    PageHeader,
    ProfileSettings,
    RelaySettings
  }
}
</script>

<style lang="scss" scoped>
.settings {
  padding: 0 1rem;
  > * {
    margin-bottom: 2rem;
  }
}
</style>
