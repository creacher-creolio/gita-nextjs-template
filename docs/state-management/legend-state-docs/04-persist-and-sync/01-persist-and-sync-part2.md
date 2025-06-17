## Guides

### Persist data locally

Legend-State has a persistence system built in, with plugins for web and React Native. When you initialize the persistence it immediately loads and merges the changes on top of the initial value. Then any changes you make after initialization will be saved to persistence.

```javascript
import { observable } from "@legendapp/state"
import { syncObservable } from "@legendapp/state/sync"
import { ObservablePersistLocalStorage } from "@legendapp/state/persist-plugins/local-storage"

// Create an observable
const store$ = observable({
  todos: [],
})

// Persist the observable to the named key
syncObservable(store$, {
    persist: {
        name: 'persistKey',
        plugin: ObservablePersistLocalStorage
    }
})

// Any changes made after syncObservable will be persisted
store$.todos.push({ id: 0 })
```

### Sync with a server

```javascript
import { observable, observe } from "@legendapp/state"
import { syncedFetch } from "@legendapp/state/sync-plugins/fetch"

// Create an observable with "users" synced
const store$ = observable({
    users: syncedFetch({
        initial: [],
        get: 'https://reqres.in/api/users',
        set: 'https://reqres.in/api/users'
    })
})

observe(() => {
    const users = store$.users.get()
    if (users) {
        processUsers(users)
    }
})

// Any changes will be saved
store$.users.push({ id: 0, name: 'name' })
```

### Local first robust real-time sync

```javascript
import { observable } from '@legendapp/state'
import { syncedCrud } from '@legendapp/state/sync-plugins/crud'
import { ObservablePersistLocalStorage } from '@legendapp/state/persist-plugins/local-storage'

const profile$ = observable(syncedCrud({
    list: () => {/*...*/},
    create: () => {/*...*/},
    update: () => {/*...*/},

    // Local first configuration
    persist: {
        plugin: ObservablePersistLocalStorage,
        name: 'profile',
        retrySync: true,
    },
    retry: {
        infinite: true,
    },
    changesSince: 'last-sync',
    fieldUpdatedAt: 'updatedAt'
}))
```

## Persist plugins

### Local Storage (React)

```javascript
import { ObservablePersistLocalStorage } from '@legendapp/state/persist-plugins/local-storage'

syncObservable(state$, {
    persist: {
        name: "documents",
        plugin: ObservablePersistLocalStorage
    }
})
```

### IndexedDB (React)

```javascript
import { configureSynced, syncObservable } from "@legendapp/state/sync"
import { observablePersistIndexedDB } from "@legendapp/state/persist-plugins/indexeddb"

const persistOptions = configureSynced({
    persist: {
        plugin: observablePersistIndexedDB({
            databaseName: "Legend",
            version: 1,
            tableNames: ["documents", "store"]
        })
    }
})
```

### MMKV (React Native)

```javascript
import { syncObservable } from '@legendapp/state/sync'
import { ObservablePersistMMKV } from '@legendapp/state/persist-plugins/mmkv'

syncObservable(state$, {
    persist: {
        name: "documents",
        plugin: ObservablePersistMMKV
    }
})
```

### AsyncStorage (React Native)

```javascript
import { configureSynced, syncObservable } from '@legendapp/state/sync'
import { observablePersistAsyncStorage } from '@legendapp/state/persist-plugins/async-storage'
import AsyncStorage from '@react-native-async-storage/async-storage'

const persistOptions = configureSynced({
    persist: {
        plugin: observablePersistAsyncStorage({
            AsyncStorage
        })
    }
})
```

## Transform data

It's very common to need to transform data into and out of your persistence or remote server. Legend-State includes helpers for easily transforming data:

- `transformStringifyKeys`: JSON stringify/parse data at given keys
- `transformStringifyDates`: Transform dates to ISO string
- `combineTransforms`: Combine multiple transforms together

### Examples

**Migrate between versions:**
```javascript
const state$ = observable(synced({
    persist: {
        name: 'state',
        transform: {
            load: (value) => {
                if (value.version === 2) {
                    if (value.currentPeriodStart) {
                        value.periodStart = new Date(value.currentPeriodStart * 1000)
                        delete value.currentPeriodStart
                    }
                }
                return value
            }
        }
    }
}))
```

**Encrypt data:**
```javascript
const state$ = observable(synced({
    transform: {
        load: async (value) => {
            return decrypt(value)
        },
        save: async (value) => {
            return encrypt(value)
        }
    }
}))
```