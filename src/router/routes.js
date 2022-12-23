const routes = [
  {
    path: '/',
    redirect: '/home',
  },
  {
    path: '/home',
    component: () => import('pages/Feed2.vue'),
    name: 'home',
  },
  {
    path: '/follow',
    component: () => import('pages/SearchFollow.vue'),
    name: 'follow',
  },
  {
    path: '/settings/:initUser?',
    component: () => import('pages/Settings.vue'),
    name: 'settings',
  },
  {
    path: '/messages/inbox',
    component: () => import('pages/Inbox.vue'),
    name: 'inbox',
  },
  {
    path: '/messages/:pubkey([a-f0-9A-F]{64})',
    component: () => import('pages/Messages.vue'),
    name: 'messages',
  },
  {
    path: '/event/:eventId([a-f0-9A-F]{64})',
    component: () => import('pages/Event.vue'),
    name: 'event',
  },
  {
    path: '/notifications',
    component: () => import('pages/Notifications.vue'),
    name: 'notifications',
  },
  {
    path: '/profile/:pubkey([a-f0-9A-F]{64})',
    component: () => import('pages/Profile.vue'),
    name: 'profile',
  },
  {
    path: '/hashtag/:hashtagId([a-zA-Z0-9_]{1,63})',
    component: () => import('pages/Hashtag.vue'),
    name: 'hashtag',
  },
  {
    path: '/devTools',
    component: () => import('pages/DevTools.vue'),
    name: 'devTools',
  },
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
]

export default routes
