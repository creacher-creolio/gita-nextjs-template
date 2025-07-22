# Patterns

This guide covers common patterns and best practices for using Legend-State effectively in your applications.

## State Organization Patterns

### 1. Global State Structure

Organize global state in a logical hierarchy:

```javascript
// store/index.js
import { observable } from '@legendapp/state'

export const store$ = observable({
    user: {
        profile: {
            id: null,
            name: '',
            email: '',
            avatar: ''
        },
        preferences: {
            theme: 'light',
            language: 'en',
            notifications: true
        }
    },
    ui: {
        modals: {
            userProfile: false,
            settings: false
        },
        sidebar: {
            collapsed: false
        },
        notifications: []
    },
    data: {
        posts: {},
        comments: {},
        users: {}
    }
})
```

### 2. Feature-based State

Organize state by feature modules:

```javascript
// features/auth/state.js
export const auth$ = observable({
    user: null,
    isLoading: false,
    error: null
})

// features/posts/state.js
export const posts$ = observable({
    items: {},
    loading: false,
    selectedId: null
})

// features/ui/state.js
export const ui$ = observable({
    theme: 'light',
    sidebar: false,
    modals: {}
})
```

### 3. Component State

Use local state for component-specific data:

```javascript
function TodoForm() {
    const form$ = useObservable({
        title: '',
        description: '',
        priority: 'medium',
        errors: {}
    })

    const handleSubmit = () => {
        const data = form$.get()
        if (validateForm(data)) {
            createTodo(data)
            form$.assign({ title: '', description: '' })
        }
    }

    return (
        <form onSubmit={handleSubmit}>
            <input
                value={use$(form$.title)}
                onChange={(e) => form$.title.set(e.target.value)}
            />
            <textarea
                value={use$(form$.description)}
                onChange={(e) => form$.description.set(e.target.value)}
            />
        </form>
    )
}
```

## Data Fetching Patterns

### 1. Simple Fetch Pattern

```javascript
function useUserData(userId) {
    const user$ = useObservable({
        data: null,
        loading: false,
        error: null
    })

    useEffect(() => {
        if (!userId) return

        user$.loading.set(true)

        fetchUser(userId)
            .then(data => {
                user$.assign({ data, loading: false, error: null })
            })
            .catch(error => {
                user$.assign({ data: null, loading: false, error })
            })
    }, [userId])

    return user$
}
```

### 2. Synced Data Pattern

```javascript
import { syncedFetch } from '@legendapp/state/sync-plugins/fetch'

const users$ = observable(syncedFetch({
    get: 'https://api.example.com/users',
    set: 'https://api.example.com/users',
    persist: {
        name: 'users',
        plugin: ObservablePersistLocalStorage
    }
}))

// Usage
function UserList() {
    const users = use$(users$)

    return (
        <For each={users$} item={UserItem} />
    )
}
```

### 3. Paginated Data Pattern

```javascript
const posts$ = observable({
    items: [],
    page: 1,
    hasMore: true,
    loading: false
})

const loadPosts = async (page = 1) => {
    posts$.loading.set(true)

    try {
        const response = await fetch(`/api/posts?page=${page}`)
        const data = await response.json()

        if (page === 1) {
            posts$.items.set(data.items)
        } else {
            posts$.items.push(...data.items)
        }

        posts$.assign({
            page: data.page,
            hasMore: data.hasMore,
            loading: false
        })
    } catch (error) {
        posts$.loading.set(false)
        console.error('Failed to load posts:', error)
    }
}

function PostList() {
    const { items, loading, hasMore } = use$(posts$)

    useEffect(() => {
        loadPosts(1)
    }, [])

    return (
        <div>
            <For each={posts$.items} item={PostItem} />
            {hasMore && (
                <button
                    onClick={() => loadPosts(posts$.page.get() + 1)}
                    disabled={loading}
                >
                    {loading ? 'Loading...' : 'Load More'}
                </button>
            )}
        </div>
    )
}
```