# Patterns

This guide covers common patterns and best practices for using Legend-State effectively in your applications.

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