# Persist and Sync

A primary goal of Legend-State is to make automatic persisting and syncing both easy and very robust, as it's meant to be used to power all storage and sync of complex apps - it was built as the backbone of both Legend and Bravely. It's designed to support local first apps: any changes made while offline are persisted between sessions to be retried whenever connected. To do this, the sync engine subscribes to changes on an observable, then on change goes through a multi-step flow to ensure that changes are persisted and synced.

1. Save the pending changes to local persistence
2. Save the changes to local persistence
3. Save the changes to remote persistence
4. On remote save, set any needed changes (like updatedAt) back into the observable and local persistence
5. Clear the pending changes in local persistence

## Plugins

The sync features are designed to be used through a plugin for your backend of choice. The plugins are all built on top of synced and are configurable with their own options as well as general sync and persist options.

### Database plugins

- **Keel**: Powerful schema-driven SQL backend we use in Bravely
- **Supabase**: Popular PostgreSQL backend
- **Firebase RTDB**: Documentation under construction

These are built on top of the CRUD plugin.

### General

- **CRUD**: Supports any backend with list, get, create, update, delete actions
- **Fetch**: A wrapper around fetch to reduce boilerplate
- **TanStack Query**: Query updates observables rather than re-rendering

## Example

We'll start with an example to give you an idea of how Legend-State's sync works. Because sync and persistence are defined in the observables, your app and UI just needs to work with observables. That immediately updates the UI optimistically, persists changes, and syncs to your database with eventual consistency.

```javascript
import { observable } from "@legendapp/state"
import { use$ } from "@legendapp/state/react"
import { configureSynced } from "@legendapp/state/sync"
import { syncedFetch } from "@legendapp/state/sync-plugins/fetch";
import { ObservablePersistLocalStorage } from "@legendapp/state/persist-plugins/local-storage"

// Setup global sync and persist configuration
const mySyncedFetch = configureSynced(syncedFetch, {
    persist: {
        plugin: ObservablePersistLocalStorage,
        retrySync: true // Persist pending changes and retry
    },
    retry: {
        infinite: true // Retry changes with exponential backoff
    }
})

// Create a synced observable
const profile$ = observable(mySyncedFetch({
    get: 'https://reqres.in/api/users/1',
    set: 'https://reqres.in/api/users/1',
    setInit: { method: 'PUT' },

    // Transform server data to local format
    transform: {
        load: (value, method) => method === 'get' ? value.data : value
    },

    // Update observable with updatedAt time from server
    onSaved: (result) => ({ updatedAt: new Date(result.saved.updatedAt) }),

    // Persist in local storage
    persist: {
        name: 'persistSyncExample',
    },

    // Don't want to overwrite updatedAt
    mode: 'assign'
}))

function App() {
    const updatedAt = use$(profile$.updatedAt)
    const saved = updatedAt ? new Date(updatedAt).toLocaleString() : 'Never'

    return (
        <div>
            <input value={use$(profile$.first_name)} onChange={(e) => profile$.first_name.set(e.target.value)} />
            <input value={use$(profile$.last_name)} onChange={(e) => profile$.last_name.set(e.target.value)} />
            <div>Saved: {saved}</div>
        </div>
    )
}
```