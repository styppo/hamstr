import {useMessageStore} from 'src/nostr/store/MessageStore'
import {useAppStore} from 'stores/App'

export const MENU_ITEMS = [
  {
    name: 'Home',
    path: '/home',
  },
  // {
  //   name: 'Explore',
  //   path: '/explore',
  // },
  {
    name: 'Notifications',
    path: '/notifications',
    signInRequired: true,
  },
  {
    name: 'Messages',
    path: '/messages',
    signInRequired: true,
    indicator: () => useMessageStore().getNumUnread(useAppStore().myPubkey) > 0
  },
  // {
  //   name: 'Settings',
  //   path: '/settings',
  //   req: true,
  // },
  // {
  //   name: 'Bookmarks',
  //   path: '/bookmarks'
  // },
]

export const MORE_MENU_ITEMS = [
  {
    name: 'Topics',
    icon: 'topics'
  },
  {
    name: 'Moments',
    icon: 'moments'
  },
  {
    name: 'Help Center',
    icon: 'help'
  },
  {
    name: 'Settings & privacy',
    icon: 'settings'
  },
]
