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

## Realtime

Enable realtime on the observable with the `realtime` option. This will update the observable immediately whenever any realtime changes come in.

```javascript
const messages$ = observable(syncedSupabase({
    supabase,
    collection: 'messages',
    // Simply enable it
    realtime: true,
    // Or set options
    realtime: { schema: 'public', filter: `user_id=eq.${uid}`},
}))
```

## RPC and Edge Functions

You can override any or all of the default list/create/update/delete actions with an rpc or function call.

```javascript
const messages$ = observable(syncedSupabase({
    supabase,
    collection: 'messages',
    realtime: true,
    // Use an rpc function for listing
    list: () => supabase.rpc("list_messages"),
    // Use an rpc function for creating
    create: (input) => supabase.rpc("create_country", input),
    // Or use functions
    list: () => supabase.functions.invoke("list_messages"),
}))
```

## Sync only diffs

An optional but very useful feature is the `changesSince: 'last-sync'` option. This can massively reduce bandwidth usage when you're persisting list results since it only needs to list changes since the last query.

### Database Setup

```sql
-- Add new columns to table
ALTER TABLE YOUR_TABLE_NAME
ADD COLUMN created_at timestamptz default now(),
ADD COLUMN updated_at timestamptz default now(),
-- Add column for soft deletes, remove this if you don't need that
ADD COLUMN deleted boolean default false;

-- This will set the `created_at` column on create and `updated_at` column on every update
CREATE OR REPLACE FUNCTION handle_times()
    RETURNS trigger AS
    $$
    BEGIN
    IF (TG_OP = 'INSERT') THEN
        NEW.created_at := now();
        NEW.updated_at := now();
    ELSEIF (TG_OP = 'UPDATE') THEN
        NEW.created_at = OLD.created_at;
        NEW.updated_at = now();
    END IF;
    RETURN NEW;
    END;
    $$ language plpgsql;

CREATE TRIGGER handle_times
    BEFORE INSERT OR UPDATE ON YOUR_TABLE_NAME
    FOR EACH ROW
EXECUTE PROCEDURE handle_times();
```

### Enable in Legend-State

```javascript
// Sync diffs of a list
syncedSupabase({
    supabase,
    collection: 'messages',
    persist: {
        name: 'messages'
    },
    // Enable syncing only changes since last-sync
    changesSince: 'last-sync',
    fieldCreatedAt: 'created_at',
    fieldUpdatedAt: 'updated_at',
    // Optionally enable soft deletes
    fieldDeleted: 'deleted'
})

// Or configure globally
configureSyncedSupabase({
    changesSince: 'last-sync',
    fieldCreatedAt: 'created_at',
    fieldUpdatedAt: 'updated_at',
    fieldDeleted: 'deleted'
})
```

## Soft deletes

The delete parameter does not need to be an actual `delete` action in Supabase. You could also implement it as a soft delete if you prefer, just setting a `deleted` field to true.

```javascript
syncedSupabase({
    supabase,
    collection: 'messages',
    fieldDeleted: 'deleted'
})
```

## Local-first Example with Expo

Here's a complete example of building a local-first app with Expo and Supabase:

```javascript
import { createClient } from '@supabase/supabase-js'
import { observable } from '@legendapp/state'
import { syncedSupabase } from '@legendapp/state/sync-plugins/supabase'
import { configureSynced } from '@legendapp/state/sync'
import { observablePersistAsyncStorage } from '@legendapp/state/persist-plugins/async-storage'
import AsyncStorage from '@react-native-async-storage/async-storage'
import 'react-native-get-random-values'
import { v4 as uuidv4 } from 'uuid'

const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY
)

const generateId = () => uuidv4()

// Create a configured sync function
const customSynced = configureSynced(syncedSupabase, {
  persist: {
    plugin: observablePersistAsyncStorage({
      AsyncStorage,
    }),
  },
  generateId,
  supabase,
  changesSince: 'last-sync',
  fieldCreatedAt: 'created_at',
  fieldUpdatedAt: 'updated_at',
  fieldDeleted: 'deleted',
})

export const todos$ = observable(
  customSynced({
    supabase,
    collection: 'todos',
    select: (from) => from.select('id,counter,text,done,created_at,updated_at,deleted'),
    actions: ['read', 'create', 'update', 'delete'],
    realtime: true,
    persist: {
      name: 'todos',
      retrySync: true,
    },
    retry: {
      infinite: true,
    },
  })
)

export function addTodo(text: string) {
  const id = generateId()
  todos$[id].assign({
    id,
    text,
  })
}

export function toggleDone(id: string) {
  todos$[id].done.set((prev) => !prev)
}
```

## Benefits

- **Type Safety**: Full TypeScript support with generated Supabase types
- **Real-time Updates**: Automatic UI updates when data changes
- **Offline Support**: Works offline with automatic sync when reconnected
- **Optimistic Updates**: UI updates immediately, syncs in background
- **Efficient Syncing**: Only sync changes since last update
- **Simple API**: Just get/set observables, syncing happens automatically
