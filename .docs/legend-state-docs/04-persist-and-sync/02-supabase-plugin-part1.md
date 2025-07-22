# Supabase Plugin

Supabase and Legend-State work very well together - all you need to do is provide a typed client and the observables will be fully typed and handle calling the correct action functions for you.

## Full Example

```javascript
import { createClient } from '@supabase/supabase-js'
import { Database } from './database.types'
import { observable } from '@legendapp/state'
import { configureSyncedSupabase, syncedSupabase } from '@legendapp/state/sync-plugins/supabase'
import { v4 as uuidv4 } from "uuid"

const supabase = createClient<Database>(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY)

// provide a function to generate ids locally
const generateId = () => uuidv4()
configureSyncedSupabase({
    generateId
})

const uid = ''

const messages$ = observable(syncedSupabase({
    supabase,
    collection: 'messages',
    // Optional:
    // Select only id and text fields
    select: (from) => from.select('id,text'),
    // Filter by the current user
    filter: (select) => select.eq('user_id', uid),
    // Don't allow delete
    actions: ['read', 'create', 'update'],
    // Realtime filter by user_id
    realtime: { filter: `user_id=eq.${uid}` },
    // Persist data and pending changes locally
    persist: { name: 'messages', retrySync: true },
    // Sync only diffs
    changesSince: 'last-sync'
}))

// get() activates and starts syncing
const messages = messages$.get()

function addMessage(text: string) {
    const id = generateId()
    // Add keyed by id to the messages$ observable to trigger a create in Supabase
    messages$[id].set({
        id,
        text,
        created_at: null,
        updated_at: null
    })
}

function updateMessage(id: string, text: string) {
    // Just set values in the observable to trigger an update to Supabase
    messages$[id].text.set(text)
}
```

## Set up Supabase types

The first step to getting strongly typed observables from Supabase is to follow their instructions to create a typed client.

[Supabase Type Generation Guide](https://supabase.com/docs/guides/api/rest/generating-types)

```javascript
import { createClient } from '@supabase/supabase-js'
import { Database } from './database.types'

const supabase = createClient<Database>(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY)
```

## Filter

By default it will use `select()` on the collection. If you want to filter the data, use the `filter` parameter.

```javascript
const messages$ = observable(syncedSupabase({
    supabase,
    collection: 'messages',
    // Filter by the current user
    filter: (select) => select.eq('user_id', 'uid')
}))
```

## Select

By default it will use `select()` on the collection. If you want to be more specific, use the `select` parameter to customize how you want to select.

```javascript
const messages$ = observable(syncedSupabase({
    supabase,
    collection: 'messages',
    // Select only id and text fields
    select: (from) => from.select('id,text'),
    // Or select and filter together
    select: (from) => from.select('id,text').eq('user_id', 'uid')
}))
```

## Actions

By default it will support create, read, update, and delete. But you can specify which actions you want to support with the `actions` parameter.

```javascript
const messages$ = observable(syncedSupabase({
    supabase,
    collection: 'messages',
    // Only read and create, no update or delete
    actions: ['read', 'create'],
}))
```