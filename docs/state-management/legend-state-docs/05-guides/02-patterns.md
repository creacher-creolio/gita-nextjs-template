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

## Form Handling Patterns

### 1. Simple Form

```javascript
function ContactForm() {
    const form$ = useObservable({
        name: '',
        email: '',
        message: '',
        submitting: false
    })

    const handleSubmit = async (e) => {
        e.preventDefault()

        form$.submitting.set(true)

        try {
            await submitContact(form$.get())
            form$.assign({ name: '', email: '', message: '', submitting: false })
            alert('Message sent!')
        } catch (error) {
            form$.submitting.set(false)
            alert('Failed to send message')
        }
    }

    return (
        <form onSubmit={handleSubmit}>
            <input
                placeholder="Name"
                value={use$(form$.name)}
                onChange={(e) => form$.name.set(e.target.value)}
            />
            <input
                placeholder="Email"
                value={use$(form$.email)}
                onChange={(e) => form$.email.set(e.target.value)}
            />
            <textarea
                placeholder="Message"
                value={use$(form$.message)}
                onChange={(e) => form$.message.set(e.target.value)}
            />
            <button type="submit" disabled={use$(form$.submitting)}>
                {use$(form$.submitting) ? 'Sending...' : 'Send'}
            </button>
        </form>
    )
}
```

### 2. Form with Validation

```javascript
function UserForm() {
    const form$ = useObservable({
        data: {
            name: '',
            email: '',
            age: ''
        },
        errors: {},
        touched: {},
        submitting: false
    })

    const validate = (field, value) => {
        const errors = {}

        switch (field) {
            case 'name':
                if (!value.trim()) errors.name = 'Name is required'
                break
            case 'email':
                if (!value.includes('@')) errors.email = 'Invalid email'
                break
            case 'age':
                if (isNaN(value) || value < 18) errors.age = 'Must be 18 or older'
                break
        }

        form$.errors.assign(errors)
    }

    const handleFieldChange = (field, value) => {
        form$.data[field].set(value)
        form$.touched[field].set(true)
        validate(field, value)
    }

    return (
        <form>
            <div>
                <input
                    placeholder="Name"
                    value={use$(form$.data.name)}
                    onChange={(e) => handleFieldChange('name', e.target.value)}
                />
                <Show if={form$.errors.name}>
                    <span className="error"><Memo>{form$.errors.name}</Memo></span>
                </Show>
            </div>

            <div>
                <input
                    placeholder="Email"
                    value={use$(form$.data.email)}
                    onChange={(e) => handleFieldChange('email', e.target.value)}
                />
                <Show if={form$.errors.email}>
                    <span className="error"><Memo>{form$.errors.email}</Memo></span>
                </Show>
            </div>

            <div>
                <input
                    placeholder="Age"
                    value={use$(form$.data.age)}
                    onChange={(e) => handleFieldChange('age', e.target.value)}
                />
                <Show if={form$.errors.age}>
                    <span className="error"><Memo>{form$.errors.age}</Memo></span>
                </Show>
            </div>
        </form>
    )
}
```

## List Management Patterns

### 1. CRUD Operations

```javascript
const todos$ = observable({
    items: {},
    filter: 'all', // all, active, completed
    newTodo: ''
})

const todoActions = {
    add: (text) => {
        const id = Date.now().toString()
        todos$.items[id].set({
            id,
            text,
            completed: false,
            createdAt: new Date()
        })
        todos$.newTodo.set('')
    },

    toggle: (id) => {
        todos$.items[id].completed.set(prev => !prev)
    },

    remove: (id) => {
        todos$.items[id].delete()
    },

    updateText: (id, text) => {
        todos$.items[id].text.set(text)
    },

    clearCompleted: () => {
        const items = todos$.items.get()
        Object.keys(items).forEach(id => {
            if (items[id].completed) {
                todos$.items[id].delete()
            }
        })
    }
}

// Computed values
const filteredTodos$ = observable(() => {
    const items = todos$.items.get()
    const filter = todos$.filter.get()

    return Object.values(items).filter(todo => {
        switch (filter) {
            case 'active': return !todo.completed
            case 'completed': return todo.completed
            default: return true
        }
    })
})
```

### 2. Optimistic Updates

```javascript
const posts$ = observable({
    items: {},
    creating: false
})

const createPost = async (postData) => {
    const tempId = `temp-${Date.now()}`

    // Optimistic update
    posts$.items[tempId].set({
        ...postData,
        id: tempId,
        pending: true,
        createdAt: new Date()
    })

    try {
        const response = await fetch('/api/posts', {
            method: 'POST',
            body: JSON.stringify(postData)
        })
        const savedPost = await response.json()

        // Replace temp post with real post
        posts$.items[tempId].delete()
        posts$.items[savedPost.id].set(savedPost)

    } catch (error) {
        // Remove failed post
        posts$.items[tempId].delete()
        alert('Failed to create post')
    }
}
```

## Error Handling Patterns

### 1. Global Error State

```javascript
const errors$ = observable({
    global: null,
    field: {},
    network: null
})

const errorActions = {
    setGlobal: (error) => {
        errors$.global.set(error)
        setTimeout(() => errors$.global.set(null), 5000)
    },

    setField: (field, error) => {
        errors$.field[field].set(error)
    },

    clearField: (field) => {
        errors$.field[field].delete()
    },

    setNetwork: (error) => {
        errors$.network.set(error)
    }
}

// Global error display
function ErrorBoundary() {
    const globalError = use$(errors$.global)
    const networkError = use$(errors$.network)

    return (
        <>
            <Show if={globalError}>
                <div className="error-banner">
                    <Memo>{globalError}</Memo>
                    <button onClick={() => errors$.global.set(null)}>×</button>
                </div>
            </Show>

            <Show if={networkError}>
                <div className="network-error">
                    Network error: <Memo>{networkError}</Memo>
                </div>
            </Show>
        </>
    )
}
```

### 2. Async Error Handling

```javascript
const useAsyncAction = (asyncFn) => {
    const state$ = useObservable({
        loading: false,
        error: null,
        data: null
    })

    const execute = async (...args) => {
        state$.assign({ loading: true, error: null })

        try {
            const result = await asyncFn(...args)
            state$.assign({ data: result, loading: false })
            return result
        } catch (error) {
            state$.assign({ error: error.message, loading: false })
            throw error
        }
    }

    return { state$, execute }
}

// Usage
function UserProfile({ userId }) {
    const { state$: userState$, execute: loadUser } = useAsyncAction(fetchUser)

    useEffect(() => {
        loadUser(userId)
    }, [userId])

    const { data: user, loading, error } = use$(userState$)

    if (loading) return <div>Loading...</div>
    if (error) return <div>Error: {error}</div>
    if (!user) return <div>User not found</div>

    return <div>Welcome, {user.name}!</div>
}
```

## Performance Patterns

### 1. Memoized Computations

```javascript
const expensiveComputation$ = observable(() => {
    const data = largeDataSet$.get()

    // Expensive calculation only runs when data changes
    return data.reduce((acc, item) => {
        return acc + complexCalculation(item)
    }, 0)
})
```

### 2. Lazy Loading

```javascript
const lazyData$ = observable(() => {
    // Only loads when first accessed
    return fetch('/api/expensive-data').then(r => r.json())
})

function LazyComponent() {
    const [shouldLoad, setShouldLoad] = useState(false)

    return (
        <div>
            <button onClick={() => setShouldLoad(true)}>
                Load Data
            </button>

            {shouldLoad && (
                <Suspense fallback={<div>Loading...</div>}>
                    <Memo>{lazyData$}</Memo>
                </Suspense>
            )}
        </div>
    )
}
```

### 3. Virtual Scrolling Pattern

```javascript
const virtualList$ = observable({
    items: [],
    visibleRange: { start: 0, end: 10 },
    itemHeight: 50,
    containerHeight: 500
})

const visibleItems$ = observable(() => {
    const { items, visibleRange } = virtualList$.get()
    return items.slice(visibleRange.start, visibleRange.end)
})

function VirtualList() {
    const { visibleRange, itemHeight, containerHeight } = use$(virtualList$)
    const visibleItems = use$(visibleItems$)

    const handleScroll = (e) => {
        const scrollTop = e.target.scrollTop
        const start = Math.floor(scrollTop / itemHeight)
        const end = start + Math.ceil(containerHeight / itemHeight)

        virtualList$.visibleRange.set({ start, end })
    }

    return (
        <div
            style={{ height: containerHeight, overflow: 'auto' }}
            onScroll={handleScroll}
        >
            <div style={{ height: virtualList$.items.get().length * itemHeight }}>
                <div style={{ transform: `translateY(${visibleRange.start * itemHeight}px)` }}>
                    <For each={visibleItems$} item={ListItem} />
                </div>
            </div>
        </div>
    )
}
```

## Testing Patterns

### 1. State Testing

```javascript
// __tests__/store.test.js
import { observable } from '@legendapp/state'
import { todoActions, todos$ } from '../store/todos'

describe('Todo Store', () => {
    beforeEach(() => {
        todos$.set({ items: {}, filter: 'all', newTodo: '' })
    })

    test('should add todo', () => {
        todoActions.add('Test todo')

        const items = todos$.items.get()
        const todoIds = Object.keys(items)

        expect(todoIds).toHaveLength(1)
        expect(items[todoIds[0]].text).toBe('Test todo')
        expect(items[todoIds[0]].completed).toBe(false)
    })

    test('should toggle todo', () => {
        todoActions.add('Test todo')
        const id = Object.keys(todos$.items.get())[0]

        todoActions.toggle(id)

        expect(todos$.items[id].completed.get()).toBe(true)
    })
})
```

### 2. Component Testing

```javascript
// __tests__/TodoItem.test.jsx
import { render, fireEvent } from '@testing-library/react'
import { observable } from '@legendapp/state'
import TodoItem from '../components/TodoItem'

test('should toggle todo when clicked', () => {
    const todo$ = observable({
        id: '1',
        text: 'Test todo',
        completed: false
    })

    const { getByText } = render(<TodoItem todo$={todo$} />)

    fireEvent.click(getByText('Test todo'))

    expect(todo$.completed.get()).toBe(true)
})
```

These patterns provide a solid foundation for building maintainable and performant applications with Legend-State. Choose the patterns that best fit your use case and don't hesitate to adapt them to your specific needs.
