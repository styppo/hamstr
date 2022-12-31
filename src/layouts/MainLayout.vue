<template>
  <q-layout>
    <div class="layout" @click="mobileMenuOpen = false">
      <div class="layout-menu">
        <div class="layout-menu-fixed" :class="{active: mobileMenuOpen}">
          <MainMenu @click.stop @mobile-menu-close="mobileMenuOpen = false" hide-items-requiring-sign-in />
        </div>
      </div>

      <div class="layout-flow">
        <q-page-container ref="pageContainer">
          <router-view v-slot="{ Component }">
            <keep-alive :include="['Feed', 'Messages', 'Notifications']">
              <component :is="Component" :key="$route.path" @scroll-to-rect="scrollToRect" />
            </keep-alive>
          </router-view>
        </q-page-container>
      </div>

      <div class="layout-sidebar">
        <div class="layout-sidebar-fixed">
          <SearchBox />
          <WelcomeBox />
          <Trends />
        </div>
      </div>

      <div
        class="mobile-menu-toggler"
        @click.stop="mobileMenuOpen = !mobileMenuOpen"
      >
        <BaseIcon icon="hamburger" />
      </div>
    </div>

    <SignInDialog />
    <CreatePostDialog />
  </q-layout>
</template>

<script>
import { defineComponent} from 'vue'
import { scroll, useQuasar, LocalStorage } from 'quasar'
const { getVerticalScrollPosition, setVerticalScrollPosition} = scroll
import { activateSub, deactivateSub, destroyStreams } from '../query'
import MainMenu from 'components/MainMenu/MainMenu.vue'
import SearchBox from 'components/SearchBox/SearchBox.vue'
import Trends from 'components/Trends/index.vue'
import BaseIcon from 'components/BaseIcon/index.vue'
import SignInDialog from 'components/SignIn/SignInDialog.vue'
import CreatePostDialog from 'components/CreatePost/CreatePostDialog.vue'
import WelcomeBox from 'components/Sidebar/WelcomeBox.vue'
import { setCssVar, getCssVar } from 'quasar'

export default defineComponent({
  name: 'MainLayout',
  components: {
    WelcomeBox,
    CreatePostDialog,
    SignInDialog,
    BaseIcon,
    MainMenu,
    SearchBox,
    Trends,
  },

  setup () {
    const $q = useQuasar()
    // const cachedPages = ref(['feed', 'notifications', 'messages'])

    return $q
  },

  data() {
    return {
      cachedPages: ['Feed', 'Notifications', 'Messages'],
      middlePagePos: {},
      broadcastChannel: new BroadcastChannel('hamstr'),
      activeWindow: false,
      timeout: null,
      hasLaunched: false,
      postEntryOpen: false,
      replyEvent: null,
      lookingAround: false,

      mobileMenuOpen: false,
    }
  },

  computed: {
    scrollingContainer() {
      return window
    },
    messageMode() {
      if (this.$route.name === 'messages') {
        if (this.replyEvent) return 'reply'
        else return 'message'
      } else return null
    }
  },

  created() {
    this.loadPreferences()
  },

  mounted() {
    // coordinate closing/opening of db if multiple hamstr windows
    this.broadcastChannel.onmessage = (event) => {
      let {type} = event.data

      if (type === 'active' && this.activeWindow) this.deactivateWindow()
      else if (type === 'closing' && this.timeout) clearTimeout(this.timeout)
      else if (type === 'done' && this.activeWindow) this.launch()
    }
    this.activateWindow()
    document.addEventListener('visibilitychange', this.activateWindow())
    window.onfocus = this.activateWindow

    // setup scrolling
    // document.querySelector('#left-drawer').addEventListener('wheel', this.redirectScroll)
    this.$router.beforeEach((to, from) => { this.preserveScrollPos(to, from) })
    this.$router.afterEach((to, from) => { this.restoreScrollPos(to, from) })

    // destroy streams before unloading window
    window.onbeforeunload = async () => {
      await destroyStreams()
    }
  },

  methods: {
    redirectScroll(event) {
      let pos = getVerticalScrollPosition(this.scrollingContainer)
      setVerticalScrollPosition(this.scrollingContainer, pos + event.deltaY)
    },

    preserveScrollPos(to, from) {
      if (this.cachedPages.map(page => page.toLowerCase()).includes(from.name)) this.middlePagePos[from.fullPath] = getVerticalScrollPosition(this.scrollingContainer)
    },

    restoreScrollPos(to, from) {
      if (this.middlePagePos[to.fullPath]) setVerticalScrollPosition(this.scrollingContainer, this.middlePagePos[to.fullPath], 500)
      else this.scrollToTop()
    },

    scrollToTop() {
      setVerticalScrollPosition(this.scrollingContainer, 0, 500)
    },

    scrollToRect(rect) {
      let offset = Math.max(rect.top, 0) - 78
      setVerticalScrollPosition(this.scrollingContainer, offset, 0)
    },

    async launch() {
      // await dbInit()
      this.timeout = null
      if (this.hasLaunched) {
        activateSub()
      }
      if (this.$store.state.keys.pub) this.$store.dispatch('launch')
      else this.$store.dispatch('launchWithoutKey')
      this.hasLaunched = true
    },

    async activateWindow() {
      if (document.hidden || this.activeWindow) return
      this.activeWindow = true
      this.broadcastChannel.postMessage({ type: 'active' })
      if (!this.timeout) this.timeout = setTimeout(this.launch, 100)
    },

    async deactivateWindow() {
      this.broadcastChannel.postMessage({ type: 'closing' })
      this.activeWindow = false
      // deactivateSub will post 'done' message to broadcastChannel
      deactivateSub()
    },

    lightOrDark(color) {
      // Variables for red, green, blue values
      var r, g, b, hsp

      // Check the format of the color, HEX or RGB?
      if (color.match(/^rgb/)) {
          // If RGB --> store the red, green, blue values in separate variables
          color = color.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+(?:\.\d+)?))?\)$/)

          r = color[1]
          g = color[2]
          b = color[3]
      } else {
          // If hex --> Convert it to RGB: http://gist.github.com/983661
          color = +('0x' + color.slice(1).replace(
          color.length < 5 && /./g, '$&$&'))

          r = color >> 16
          g = color >> 8 & 255
          b = color & 255
      }

      // HSP (Highly Sensitive Poo) equation from http://alienryderflex.com/hsp.html
      hsp = Math.sqrt(
      0.299 * (r * r) +
      0.587 * (g * g) +
      0.114 * (b * b)
      )

      // Using the HSP value, determine whether the color is light or dark
      if (hsp > 127.5) {
          return 'light'
      } else {
          return 'dark'
      }
    },
    loadPreferences() {
       // set customization
    let config = LocalStorage.getItem('config') || {}
    // console.log('config', config)
    let preferences = config.preferences
    if (preferences) {
      let color = preferences.color
      if (color) {
        let {primary, secondary, accent, background} = color
        if (primary) setCssVar('primary', primary)
        // else primary = getCssVar('primary')
        if (secondary) setCssVar('secondary', secondary)
        // else secondary = getCssVar('secondary')
        if (accent) setCssVar('accent', accent)
        // else accent = getCssVar('accent')
        if (!background) background = getCssVar('background') || getCssVar('dark')
        setCssVar('background', background)
        this.$q.dark.set(this.lightOrDark(background) === 'dark')
      }
    } else {
        let background = getCssVar('background') || getCssVar('dark')
        setCssVar('background', background)
        this.$q.dark.set(this.lightOrDark(background) === 'dark')
      // config.preferences = {
      //   color: {
      //     primary: getCssVar('primary'),
      //     secondary: getCssVar('secondary'),
      //     accent: getCssVar('accent'),
      //     background: getCssVar('background') || getCssVar('dark'),
      //   }
      }
      // console.log('font', getCssVar('font'), this.googleFontsName)
    },
  },
})

</script>

<style lang="scss">
@import 'assets/theme/colors.scss';
@import 'assets/variables.scss';

.layout {
  min-height: 100%;
  max-width: 1290px;
  width: 100%;
  margin: 0 auto;
  display: flex;
  &-menu {
    width: 100%;
    max-width: 300px;
    &-fixed {
      position: sticky;
      top: 0;
      width: 100%;
      max-width: inherit;
      z-index: 1000;
    }
  }
  &-flow {
    border-right: $border-dark;
    border-left: $border-dark;
    width: 100%;
    min-width: 660px;
    max-width: 660px;
    min-height: 100vh;
  }
  &-sidebar {
    width: 100%;
    min-width: 330px;
    margin: 0 1rem;
    &-fixed {
      position: fixed;
      width: 330px;
      max-width: inherit;
    }
  }
  .mobile-menu-toggler {
    display: none;
  }
}

@media screen and (max-width: $tablet-sm) {
  .layout-sidebar {
    display: none;
  }
}

@media screen and (max-width: $phone-lg) {
  .layout-menu {
    max-width: 80px;
  }
  .layout-flow {
    min-width: unset;
  }
}

@media screen and (max-width: $phone) {
  .layout {
    &-menu {
      max-width: 300px;
      width: unset;
      &-fixed {
        position: fixed;
        background-color: $color-bg;
        transform: translateX(-100%);
        transition: 200ms ease;
        z-index: 1000;
        &.active {
          transform: translateX(0%);
          box-shadow: $shadow-white;
        }
      }
    }
    &-flow {
      border: 0;
    }
    &-sidebar {
      display: none;
      max-width: unset;
      &-fixed {
        display: none;
      }
    }
    .mobile-menu-toggler {
      position: fixed;
      bottom: 1rem;
      left: 1rem;
      width: 3rem;
      height: 3rem;
      padding: 6px 8px 8px;
      border-radius: 999px;
      background-color: $color-primary;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 555;
      svg {
        width: 100%;
        height: 100%;
        fill: #fff;
      }
    }
  }
}
</style>
