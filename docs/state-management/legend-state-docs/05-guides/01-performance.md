# Performance

Legend-State is designed to be the fastest React state library, achieving incredible performance through multiple optimization strategies. This guide explains how Legend-State achieves its performance and how to get the most out of it.

## Why Legend-State is Fast

### 1. Fine-grained Reactivity

Instead of re-rendering entire components, Legend-State updates only the specific DOM nodes that need to change.

```javascript
// Traditional React - entire component re-renders
function TraditionalComponent() {
    const [count, setCount] = useState(0)

    return (
        <div>
            <h1>App Title</h1>
            <p>Count: {count}</p>
            <button onClick={() => setCount(c => c + 1)}>+</button>
            <div>Other content that doesn't need to update</div>
        </div>
    )
}

// Legend-State - only the count text updates
function OptimizedComponent() {
    const count$ = useObservable(0)

    return (
        <div>
            <h1>App Title</h1>
            <p>Count: <Memo>{count$}</Memo></p>
            <button onClick={() => count$.set(c => c + 1)}>+</button>
            <div>Other content that doesn't need to update</div>
        </div>
    )
}
```

### 2. Minimal Object Creation

Legend-State uses Proxy objects efficiently and creates minimal intermediate objects during updates.

```javascript
// Efficient - no intermediate objects created
state$.user.profile.name.set('John')

// vs traditional immutable updates that create many objects
setState(prevState => ({
    ...prevState,
    user: {
        ...prevState.user,
        profile: {
            ...prevState.user.profile,
            name: 'John'
        }
    }
}))
```

### 3. Optimized Array Operations

Legend-State provides special optimizations for arrays that can outperform even vanilla JavaScript in some scenarios.

```javascript
const items$ = useObservable([])

// Highly optimized array operations
items$.push(newItem)
items$[index].delete()
items$.splice(index, 1, newItem)
```

## Performance Benchmarks

Legend-State consistently ranks #1 in React state library benchmarks:

- **Legend-State**: 1.02x baseline
- **Jotai**: 1.41x baseline
- **MobX**: 1.49x baseline
- **Recoil**: 1.53x baseline
- **Redux**: 1.55x baseline
- **Zustand**: 1.69x baseline
- **Valtio**: 1.82x baseline

## Performance Best Practices

### 1. Use Fine-grained Components

Break down your UI into fine-grained reactive components:

```javascript
// Good - fine-grained updates
function UserProfile() {
    const user$ = useObservable({ name: '', email: '', avatar: '' })

    return (
        <div>
            <img src={use$(user$.avatar)} />
            <h1><Memo>{user$.name}</Memo></h1>
            <p><Memo>{user$.email}</Memo></p>
        </div>
    )
}

// Better - even more fine-grained
function UserProfile() {
    const user$ = useObservable({ name: '', email: '', avatar: '' })

    return (
        <div>
            <UserAvatar avatar$={user$.avatar} />
            <UserName name$={user$.name} />
            <UserEmail email$={user$.email} />
        </div>
    )
}
```

### 2. Use Reactive Props

Reactive props update individual properties without re-rendering the component:

```javascript
function OptimizedButton() {
    const state$ = useObservable({ loading: false, disabled: false })

    return (
        <Reactive.button
            $disabled={() => state$.loading.get() || state$.disabled.get()}
            $className={() => state$.loading.get() ? 'loading' : 'normal'}
            onClick={() => handleClick()}
        >
            <Show if={state$.loading} else="Submit">
                Loading...
            </Show>
        </Reactive.button>
    )
}
```

### 3. Optimize Lists with For Component

Use the `For` component for efficient list rendering:

```javascript
function OptimizedList() {
    const items$ = useObservable([])

    return (
        <For each={items$} item={ItemComponent} />
    )
}

function ItemComponent({ item$ }) {
    return (
        <div>
            <Memo>{item$.name}</Memo>
            <button onClick={() => item$.delete()}>Delete</button>
        </div>
    )
}
```

### 4. Use Observer for Complex Components

For components that access many observables, use `observer` to batch all tracking:

```javascript
const Dashboard = observer(function Dashboard() {
    const user = user$.get()
    const settings = settings$.get()
    const notifications = notifications$.get()

    // All observables are tracked efficiently in one observer
    return (
        <div>
            <UserInfo user={user} />
            <SettingsPanel settings={settings} />
            <NotificationList notifications={notifications} />
        </div>
    )
})
```

### 5. Batch Updates

Use batching for multiple related updates:

```javascript
import { batch } from '@legendapp/state'

function updateUserProfile(userData) {
    batch(() => {
        user$.name.set(userData.name)
        user$.email.set(userData.email)
        user$.avatar.set(userData.avatar)
        user$.lastUpdated.set(new Date())
    })
}
```

### 6. Use Computed Values

Computed observables cache their results and only recalculate when dependencies change:

```javascript
const user$ = useObservable({ firstName: 'John', lastName: 'Doe' })

// Computed value is cached
const fullName$ = useObservable(() =>
    `${user$.firstName.get()} ${user$.lastName.get()}`
)

function UserDisplay() {
    return <h1><Memo>{fullName$}</Memo></h1>
}
```

### 7. Optimize Large Objects

For very large objects, consider using shallow tracking:

```javascript
const largeData$ = useObservable(massiveDataObject)

// Only track top-level changes
const summary = use$(largeData$, { shallow: true })
```

## Memory Optimization

### 1. Clean up Observers

Remove observers when components unmount:

```javascript
function Component() {
    useEffect(() => {
        const dispose = observe(() => {
            console.log(state$.value.get())
        })

        return dispose // Cleanup on unmount
    }, [])
}
```

### 2. Use WeakMap for Component State

For component-specific state, consider using WeakMap patterns:

```javascript
const componentStates = new WeakMap()

function Component() {
    if (!componentStates.has(Component)) {
        componentStates.set(Component, observable({ count: 0 }))
    }

    const state$ = componentStates.get(Component)
    return <Memo>{state$.count}</Memo>
}
```

## Performance Monitoring

### 1. Use Tracing Hooks

Debug performance issues with built-in tracing:

```javascript
import { useTraceUpdates, useTraceListeners } from '@legendapp/state/trace'

function Component() {
    useTraceUpdates() // Log what causes re-renders
    useTraceListeners() // Log what observables are being tracked

    // Your component code
}
```

### 2. Monitor Render Counts

Track component render counts in development:

```javascript
function Component() {
    const renderCount = useRef(0)
    renderCount.current++

    console.log(`Component rendered ${renderCount.current} times`)

    // Component code
}
```

## Common Performance Pitfalls

### 1. Avoid Unnecessary Observers

```javascript
// Bad - creates new observer on every render
function Component() {
    observe(() => {
        console.log(state$.value.get())
    })
}

// Good - observer created once
function Component() {
    useObserve(() => {
        console.log(state$.value.get())
    })
}
```

### 2. Don't Overuse Computed

```javascript
// Bad - unnecessary computation
const doubled$ = useObservable(() => value$.get() * 2)

// Good - simple transformation
const doubled = use$(value$) * 2
```

### 3. Avoid Large Object Assignments

```javascript
// Bad - replaces entire object
state$.set(newLargeObject)

// Good - update only changed fields
state$.assign(changedFields)
```

## Performance in Different Scenarios

### Small Apps
- Use `observer` and basic observables
- Fine-grained reactivity provides good performance out of the box

### Medium Apps
- Introduce `Memo`, `Show`, `For` components
- Use reactive props for dynamic styling
- Implement computed values for derived state

### Large Apps
- Extensive use of fine-grained components
- Careful batching of updates
- Performance monitoring with tracing hooks
- Memory management with proper cleanup

## Conclusion

Legend-State's performance comes from its fundamental design around fine-grained reactivity. By updating only what actually changes and minimizing component re-renders, it provides exceptional performance while maintaining a simple developer experience. Following these best practices will help you build the fastest possible React applications.
