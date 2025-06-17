# TanStack Query Plugin

The built in `syncedFetch` and `synced` plugins should include all you need for remote sync, but this plugin can help when integrating into or migrating from an existing Query-based infrastructure.

This plugin takes all of the normal Query parameters, but it updates an observable instead of triggering a re-render. The queryKey can be a function that returns a key array dependent on some observables. If those observables change it will update the queryKey and re-run with the new key. That makes it super easy to do pagination, for example.

There are two ways to use this plugin:

## 1. React Hook

The `useObservableSyncedQuery` hook takes the normal Query parameters for the query and mutation, and gets the queryClient from Context.

```javascript
import { useObservableSyncedQuery } from '@legendapp/state/sync-plugins/tanstack-react-query';
import { useQueryClient } from '@tanstack/react-query';
import { use$ } from '@legendapp/state/react';

function Component() {
    const state$ = useObservableSyncedQuery({
        query: {
            queryKey: ['user'],
            queryFn: async () => {
                return fetch('https://reqres.in/api/users/1').then((v) => v.json())
            },
        },
        mutation: {
            mutationFn: async (variables) => {
                return fetch(
                    'https://reqres.in/api/users/1',
                    { body: JSON.stringify(variables), method: 'POST' }
                )
            },
        },
    })

    // get it with use$ to start the sync
    const state = use$(state$)

    // Or bind an input directly to a property, which will also start the sync
    return (
        <div>
            <input
                value={use$(state$.first_name)}
                onChange={(e) => state$.first_name.set(e.target.value)}
            />
        </div>
    )
}
```

## 2. Outside of React

`syncedQuery` takes the normal Query parameters for the query and mutation, and additionally just needs a queryClient. It uses `@tanstack/query-core` and does not need to be used within React components.

```javascript
import { syncedQuery } from '@legendapp/state/sync-plugins/tanstack-query';
import { QueryClient } from '@tanstack/react-query';

const queryClient = new QueryClient()

const state$ = observable(syncedQuery({
    queryClient,
    query: {
        queryKey: ['user'],
        queryFn: async () => {
            return fetch('https://reqres.in/api/users/1').then((v) => v.json())
        },
    },
    mutation: {
        mutationFn: async (variables) => {
            return fetch(
                'https://reqres.in/api/users/1',
                { body: JSON.stringify(variables), method: 'POST' }
            )
        },
    },
}))

observe(() => {
    // get() the value to start syncing, and it will be reactive to updates coming in
    console.log(state$.get())
})
```

## Features

### Reactive Query Keys

The queryKey can be a function that depends on observables, enabling reactive queries:

```javascript
const page$ = observable(1)

const users$ = observable(syncedQuery({
    queryClient,
    query: {
        // queryKey updates when page$ changes
        queryKey: () => ['users', page$.get()],
        queryFn: () => {
            return fetch(`https://reqres.in/api/users?page=${page$.get()}`)
                .then((res) => res.json())
        },
    },
}))

// Change page to trigger new query
page$.set(2)
```

### Automatic Mutations

When you modify the observable, it automatically triggers the mutation:

```javascript
const user$ = observable(syncedQuery({
    queryClient,
    query: {
        queryKey: ['user', 1],
        queryFn: () => fetch('/api/user/1').then(r => r.json()),
    },
    mutation: {
        mutationFn: (data) =>
            fetch('/api/user/1', {
                method: 'PUT',
                body: JSON.stringify(data)
            }),
    },
}))

// This will trigger the mutation automatically
user$.name.set('New Name')
```

### Integration with existing Query setup

This plugin works seamlessly with your existing TanStack Query setup:

```javascript
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useObservableSyncedQuery } from '@legendapp/state/sync-plugins/tanstack-react-query'

const queryClient = new QueryClient()

function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <UserProfile />
        </QueryClientProvider>
    )
}

function UserProfile() {
    const user$ = useObservableSyncedQuery({
        query: {
            queryKey: ['user'],
            queryFn: () => api.getUser(),
            staleTime: 5 * 60 * 1000, // 5 minutes
            cacheTime: 10 * 60 * 1000, // 10 minutes
        },
        mutation: {
            mutationFn: (data) => api.updateUser(data),
            onSuccess: () => {
                // Query cache is automatically updated
                console.log('User updated!')
            },
        },
    })

    const name = use$(user$.name)

    return (
        <div>
            <h1>{name}</h1>
            <input
                value={name}
                onChange={(e) => user$.name.set(e.target.value)}
            />
        </div>
    )
}
```

## Benefits

### Performance
- No re-renders on query state changes
- Fine-grained reactivity updates only what changed
- Automatic batching of multiple changes

### Developer Experience
- Familiar TanStack Query API
- Automatic mutation triggering
- Reactive query keys
- Type safety with TypeScript

### Migration Path
- Easy to migrate from existing TanStack Query usage
- Can be adopted incrementally
- Works with existing Query DevTools

## Comparison with traditional TanStack Query

### Traditional TanStack Query
```javascript
function UserProfile() {
    const { data, isLoading, error } = useQuery({
        queryKey: ['user'],
        queryFn: () => api.getUser(),
    })

    const mutation = useMutation({
        mutationFn: (data) => api.updateUser(data),
    })

    if (isLoading) return <div>Loading...</div>
    if (error) return <div>Error: {error.message}</div>

    return (
        <div>
            <h1>{data.name}</h1>
            <button onClick={() => mutation.mutate({ name: 'New Name' })}>
                Update Name
            </button>
        </div>
    )
}
```

### With Legend-State TanStack Query Plugin
```javascript
function UserProfile() {
    const user$ = useObservableSyncedQuery({
        query: {
            queryKey: ['user'],
            queryFn: () => api.getUser(),
        },
        mutation: {
            mutationFn: (data) => api.updateUser(data),
        },
    })

    const name = use$(user$.name)

    return (
        <div>
            <h1>{name}</h1>
            <button onClick={() => user$.name.set('New Name')}>
                Update Name
            </button>
        </div>
    )
}
```

The Legend-State version is simpler, more performant, and provides automatic synchronization between local state and server state.
