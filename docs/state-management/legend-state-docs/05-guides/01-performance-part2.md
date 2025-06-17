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