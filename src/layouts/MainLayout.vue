<template>
  <q-layout>
    <q-dialog v-if="!$store.state.keys.pub" v-model="initializeKeys" persistent>
      <TheKeyInitializationDialog style="max-height: 85vh" @look-around="setLookingAroundMode"/>
    </q-dialog>

    <div class="layout">
      <div class="layout-menu">
        <div class="layout-menu-fixed">
          <main-menu />
        </div>
      </div>

      <div class="layout-flow">
        <q-page-container ref="pageContainer">
          <router-view v-slot="{ Component }">
            <keep-alive :include="['Feed', 'Feed2', 'Messages', 'Notifications']">
              <component :is="Component" :key="$route.path" :looking-around="lookingAround" @scroll-to-rect="scrollToRect" @reply-event="setReplyEvent"/>
            </keep-alive>
          </router-view>
        </q-page-container>

        <!-- <div v-if="postEntryOpen || messageMode" id="post-entry" unelevated class="gt-xs flex column align-self relative-position"> -->
        <div v-if="($q.screen.width >= 600) && postEntryOpen" id="post-entry" unelevated class="gt-xs flex column align-self relative-position">
          <!-- <q-separator color="primary"/> -->
          <!-- <q-btn v-if="!messageMode" icon="close" flat dense @click="togglePostEntry" class="self-end" style="position: absolute; top: 0; right: 0; z-index: 1;"/> -->
          <q-btn icon="close" flat dense @click="togglePostEntry" class="self-end" style="position: absolute; top: 0; right: 0; z-index: 1;"/>
            <!-- :message-mode="messageMode" -->
          <BasePostEntry
            :event="replyEvent"
            @clear-event="replyEvent=null"
            @sent="togglePostEntry"
            class="q-px-md q-pt-sm"
          />
        </div>

        <div id="bottom-drawer-placeholder" />
        <!-- <div id="bottom-post-entry-placeholder" />
        <div id="bottom-message-entry-placeholder" />
        <div id="bottom-menu-placeholder" /> -->
      </div>

      <div class="layout-sidebar">
        <div class="layout-sidebar-fixed">
          <search-box />
          <trends />
        </div>
      </div>
    </div>

    <q-page-sticky v-if="($q.screen.width < 600)" @click.stop="resizePostEntryPlaceholder" id="bottom-drawer" position="bottom" class="z-top xs lt-sm">
      <!-- <q-separator color="primary"/> -->
      <!-- <div  v-if="postEntryOpen || messageMode" id="bottom-post-entry" unelevated class="flex column align-self relative-position"> -->
      <div  v-if="messageMode" id="bottom-message-entry" unelevated class="flex column align-self relative-position q-px-md">
        <BasePostEntry
          :event="replyEvent"
          :message-mode="messageMode"
          @clear-event="replyEvent=null"
          @sent="replyEvent=null"
          @resized="resizePostEntryPlaceholder"
          :auto-focus="false"
        />
      </div>
      <div v-if="messageMode" id="bottom-post-entry-top-border"></div>
      <div v-if="postEntryOpen" id="bottom-post-entry" unelevated class="flex column align-self relative-position q-px-md">
        <!-- <q-btn v-if="!messageMode" icon="close" flat dense @click="togglePostEntry" class="self-end" style="position: absolute; top: 0; right: 0; z-index: 1;"/> -->
        <BasePostEntry
          @sent="togglePostEntry"
          @resized="resizePostEntryPlaceholder"
          :auto-focus="false"

        />
      </div>

      <TheUserMenu
        id="bottom-menu"
        :compact-mode="true"
        :posting="postEntryOpen"
        @toggle-post-entry="togglePostEntry"
        @scroll-to-rect="scrollToRect"
        @set-user="lookingAround=false"
      />
    </q-page-sticky>
  </q-layout>
</template>

<script>
import { defineComponent} from 'vue'
import { scroll, useQuasar, LocalStorage } from 'quasar'
const { getVerticalScrollPosition, setVerticalScrollPosition} = scroll
import { activateSub, deactivateSub, destroyStreams } from '../query'
import MainMenu from 'components/MainMenu/index.vue'
import TheUserMenu from 'components/TheUserMenu.vue'
import TheKeyInitializationDialog from 'components/TheKeyInitializationDialog.vue'
import SearchBox from 'components/SearchBox/index.vue'
import Trends from 'components/Trends/index.vue'
import { setCssVar, getCssVar } from 'quasar'

export default defineComponent({
  name: 'MainLayout',
  components: {
    MainMenu,
    SearchBox,
    Trends,
    TheUserMenu,
    TheKeyInitializationDialog,
  },

  setup () {
    const $q = useQuasar()
    // const cachedPages = ref(['feed', 'notifications', 'messages'])

    return $q
  },

  data() {
    return {
      cachedPages: ['Feed', 'Feed2', 'Notifications', 'Messages'],
      middlePagePos: {},
      broadcastChannel: new BroadcastChannel('hamstr'),
      activeWindow: false,
      timeout: null,
      hasLaunched: false,
      postEntryOpen: false,
      replyEvent: null,
      lookingAround: false,
    }
  },

  computed: {
    scrollingContainer() {
      if (this.$q.screen.width < 600) return window
      return this.$refs.pageContainer?.$el
    },
    messageMode() {
      if (this.$route.name === 'messages') {
        if (this.replyEvent) return 'reply'
        else return 'message'
      } else return null
    },
    initializeKeys() {
      return !this.lookingAround
    }
  },

  // beforeCreate() {
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
    // TODO Shoudl this go in the function?
    this.resizePostEntryPlaceholder()
  },

  beforeUnmount() {
    // document.querySelector('#left-drawer').removeEventListener('wheel', this.redirectScroll)
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

    back() {
      this.$router.go(-1)
    },

    forward() {
      this.$router.go(1)
    },

    moveFab(ev) {
      this.draggingFab = ev.isFirst !== true && ev.isFinal !== true

      this.fabPos = [
        this.fabPos[0] - ev.delta.x,
        this.fabPos[1] + ev.delta.y
      ]
    },

    scrollToRect(rect) {
      let offset = Math.max(rect.top, 0)
      setVerticalScrollPosition(this.scrollingContainer, offset, 500)
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

    togglePostEntry() {
      // if (this.messageMode) {
      //   this.replyEvent = null
      // } else this.postEntryOpen = !this.postEntryOpen
      this.postEntryOpen = !this.postEntryOpen
      // console.log('togglepostentry', this.postEntryOpen)
    },

    setReplyEvent(event) {
      this.replyEvent = event
      console.log('event', event, this.replyEvent)
    },

    resizePostEntryPlaceholder() {
      setTimeout(() => {
        document.querySelector('#bottom-drawer-placeholder').style.minHeight = `${document.querySelector('#bottom-drawer')?.clientHeight || 0}px`
        // document.querySelector('#bottom-post-entry-placeholder').style.minHeight = `${document.querySelector('#bottom-post-entry')?.clientHeight || 0}px`
      }, 1000)
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
    setLookingAroundMode() {
      this.lookingAround = true
    }
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
      position: fixed;
      width: 100%;
      max-width: inherit;
    }
  }
  &-flow {
    border-right: $border-dark;
    border-left: $border-dark;
    width: 100%;
    max-width: 660px;
    min-height: 100vh;
  }
  &-sidebar {
    width: 100%;
    max-width: 330px;
    margin-left: 1rem;
    margin-top: 1rem;
    &-fixed {
      position: fixed;
      width: 100%;
      max-width: inherit;
    }
  }
  .mobile-menu-toggler {
    display: none;
  }
}

@media screen and (max-width: $phone) {
  .layout-menu-fixed-container{
    background-color: $color-bg;
    transform: translateX(-100%);
    box-shadow: $shadow-white;
    transition: 200ms ease;
    padding-left: 20px;
    &.active {
      transform: translateX(0%);
      z-index: 666;
    }
  }
  .layout-sidebar {
    &-fixed {
      display: none;
    }
  }

  .layout {
    &-sidebar {
      display: none;
      max-width: unset;
    }
    &-menu {
      max-width: 300px;
      width: unset;
    }
    .mobile-menu-toggler {
      position: fixed;
      bottom: 1rem;
      left: 1rem;
      width: 3rem;
      height: 3rem;
      padding: 8px;
      border-radius: 999px;
      background-color: $color-blue;
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

// >>>> OLD CSS

//body {
//  display: block;
//  height: 100vh;
//  overflow: auto;
//}

//#layout-container {
//  display: flex;
//  justify-content: center;
//  width: 100%;
//  position: relative;
//  flex-wrap: nowrap;
//  background: var(--q-background);
//}


#left-drawer, #right-drawer {
  display: none;
  transition: all 1s linear;
  margin: .5rem;
}

#middle-page {
  width: 700px;
  max-width: 100%;
  height: auto;
  padding-bottom: 2rem;
  border-right: 1px solid var(--q-accent);
  border-left: 1px solid var(--q-accent);
  display: flex;
  flex-direction: column;
}

#middle-page .q-page-container {
}


#post-entry {
  border-top: 1px solid var(--q-accent);
}
#post-entry .post-entry-form {
  border: 2px solid var(--q-primary);
  border-radius: .5rem;
  margin: .3rem;
}
#bottom-post-entry-placeholder {
}

#bottom-drawer {
  background: var(--q-background);
  width: 100%;
  left: 0;
  border: 1px solid var(--q-accent);
  border-bottom: 2px solid var(--q-accent);
}
#bottom-drawer > div {
  width: 100%;
}

#bottom-message-entry {
}
#bottom-post-entry {
  border: 2px solid var(--q-primary);
  border-radius: .5rem;
  margin: .3rem;
}
#bottom-post-entry-top-border {
  height: 0;
  border-bottom: 1px solid var(--q-accent);
}
#bottom-menu {
}
#bottom-menu,
#bottom-menu-placeholder {
  height: 1rem;
  min-height: 3rem;
  width: 100%;
  background: var(--q-background);
}
#navagation-buttons .q-fab__actions .q-btn{
  background: var(--q-background) !important;
}
#navagation-buttons .q-btn{
  font-size: .8rem;
}
.q-page-sticky {
  z-index: 2;
}
.q-fab__actions--left {
  margin: 0;
}

@media screen and (min-width: 600px) {
  body {
    height: unset;
    overflow: unset;
  }
  #navagation-buttons .q-btn{
    font-size: .8rem;
  }
  #layout-container {
    justify-content: flex-start;
    overflow: hidden;
    height: 100vh;
  }
  #left-drawer {
    display: flex;
    overflow: hidden;
    width: 50px;
    max-width: 50px;
    min-width: 50px;
    flex: 0;
    flex-shrink: 0;
    flex-grow: 0;
  }
  #middle-page {
    display: flex;
    flex-direction: column;
    width: 100%;
    min-width: 550px;
    max-width: 650px;
    height: 100vh;
    padding-bottom: 0;
    flex: 1;
    flex-shrink: 1;
    flex-grow: 1;
  }
  #middle-page .q-page-container {
    overflow: auto;
    height: 100%;
    flex: 1;
    flex-shrink: 1;
    flex-grow: 1;
  }
  #post-entry {
    height: fit-content;
    display: unset;
  }
  #bottom-menu,
  #bottom-menu-placeholder,
  #bottom-post-entry-placeholder {
    display: none;
  }
}

@media screen and (min-width: 700px) {
  #layout-container {
    justify-content: flex-start;
    overflow: hidden;
    height: 100vh;
  }
  #left-drawer, #right-drawer {
    display: flex;
    visibility: inherit;
    height: auto;
    -webkit-overflow-scrolling: touch;
    -ms-overflow-style: none;
  }
  #right-drawer {
    width: auto;
    max-width: 300px;
    overflow-y: auto;
    overflow-x: hidden;
    flex: 1;
    flex-shrink: 1;
    flex-grow: 1;
  }
  #middle-page {
    min-width: 400px;
    max-width: 600px;
  }
}
@media screen and (min-width: 1023px) {
  #left-drawer {
    width: 200px;
    min-width: 200px;
    max-width: 300px;
  }
  #middle-page {
    width: 600px;
    min-width: 600px;
    max-width: 600px;
    flex: 0;
    flex-shrink: 0;
    flex-grow: 0;
  }
  #navagation-buttons .q-btn{
    font-size: .9rem;
  }
}
@media screen and (min-width: 1100px) {
  #left-drawer {
    width: 200px;
    min-width: 200px;
    max-width: 300px;
    flex: 1;
    flex-shrink: 1;
    flex-grow: 1;
  }
  #right-drawer {
    width: 300px;
    min-width: 300px;
    max-width: 300px;
    flex: 0;
    flex-shrink: 0;
    flex-grow: 0;
  }
}
@media screen and (min-width: 1200px) {
  #layout-container {
    justify-content: center;
  }
  #left-drawer, #right-drawer {
    width: calc((100vw - 600px) / 2);
    max-width: 300px;
    flex: 1;
    flex-shrink: 1;
    flex-grow: 1;
  }
  #middle-page {
    width: 600px;
    min-width: 600px;
    max-width: 600px;
    flex: 0;
    flex-shrink: 0;
    flex-grow: 0;
  }
}
</style>
