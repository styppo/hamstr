# Hamstr

[Hamstr](https://hamstr.to) is a twitter-style [Nostr](https://github.com/fiatjaf/nostr) web client.

### Install the dependencies
```bash
yarn
# or
npm install
```

### Start the app in development mode
```bash
npm run dev
```


### Lint the files
```bash
yarn lint
# or
npm run lint
```


### Format the files
```bash
yarn format
# or
npm run format
```


### Build the app for production
```bash
npm run build
```

## Gerbil Notes

### Data Control Flow 

* DM events are pulled in via the `useNostrStore().init` line called in `src/App.vue`, and the chain of calls is as follow:

* [`src/App.vue/useNostrStore().init`](./src/App.vue) -> [`src/nostr/NostrStore.js/init()`](./src/nostr/NostrStore.js) -> [`src/nostr/NostrStore.js/subscribeForUser()`](./src/nostr/NostrStore.js) -> [`src/nostr/NostrStore.js/fetch()`](./src/nostr/NostrStore.js)

* The `fetch()` method subscribes to the [`Observable`](./src/nostr/Observable.js) class which emits events (after having subscribed to a relay). Once the event is emitted, it is picked up by a listener which is instantiated in the same method (`fetch()`). In other words, `fetch()` creates a subscription, using filters and options, and then uses the `.on` hook on that subscription to handle events (`sub.on('event')` (line 338 in `src/nostr/NostrStore.js`))

* Once the events are received, they are passed to [`src/nostr/NostrStore.js/addEvent()`](./src/nostr/NostrStore.js), which uses a `switch` statement to handle the event properly

* Afterwards, specific logic for handling DMs is handled in [`src/nostr/store/MessageStore.js`](./src/nostr/store/MessageStore.js)


### How events are sent
* [`src/nostr/Relay.js/publish()`](./src/nostr/Relay.js)

### TODOs
- [ ] Implement logic which grabs all conversations data:
    - [ ] Retreive kind 1031 message which contains the entropy for HD derviation and the counter
    - [ ] Derive all keys iteratively using the counter
    - [ ] Create data structure based on previous step which is then stored locally 
- [ ] Update [`src/nostr/NostrStore.js/addEvent()`] to handle incognito DMs properly
- [ ] Update [`src/nostr/store/MessageStore`](./src/nostr/store/MessageStore.js) logic, to parse incognito DMs properly, and store them as a regular DM (with some metadata so we know it's a incognito DM and can show a little lock symbol, and do further relational work like tying together reactions etc.) (TODOs left in the file)
    * The private DMs which are incognito should include metadata which makes it easy to identify them as incognito, and access additional data from the HD derivation data set, in order to do things like: show the disposable identities, show the count of disposable identities, display a "lock" icon, etc
- [ ] Implement logic for creating invitation messages
