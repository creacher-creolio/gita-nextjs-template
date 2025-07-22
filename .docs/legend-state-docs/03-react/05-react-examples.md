# React Examples

The examples on this page use Tailwind CSS for styling and Framer Motion for animations. These examples all use the fine grained reactivity components so that the parent component renders only once and all renders are optimized to be as small as possible.

## Persisted global state

This example creates a global state object and persists it to Local Storage. Try changing the username and toggling the sidebar and refreshing - it will restore it to the previous state.

## Auto-saving Form

This example uses the useObservableSyncedQuery hook to create an observable using TanStack Query that automatically sends mutations back to the server whenever the observable changes.

It then uses the `Reactive` two-way binding components to bind those observable directly to the inputs.

So in effect this binds the inputs directly to your server data.

## Form validating

This example uses useObserve to listen to changes in the form state to update the error messages as you type. It waits for the first click of the Save button for a better user experience.

## List of messages

This example uses the syncedFetch helper to get data from a server as an observable, useComputed to create a computed observable, and For to display the array of messages in a high-performance way.

## Animations with reactive props

This example uses reactive to make a version of `motion.div` with reactive props that can animate using observable values. Animating with reactive props is faster than re-rendering the whole component because when the tracked observable changes it triggers a render of only the `motion.div`, so it doesn't need to re-render the parent or children.

This example also creates a computed observable text value from the boolean and renders it directly in JSX, which (under the hood) creates a reactive text element that re-renders itself when it changes.

## Persistence with animations

This example shows:

1. State persisted to local storage
2. Reactive components

## Show a modal with multiple pages

This example uses Show to show/hide a modal based on an observable value, and Switch to render the active page in the modal.

## Router

This example demonstrates how to create a basic router using Legend-State observables to manage navigation state and URL synchronization.

## Performance comparison

These examples demonstrate the performance benefits of Legend-State's fine-grained reactivity. Components using Legend-State render once and individual elements update themselves, resulting in significantly better performance compared to traditional React patterns.

### Traditional React
- Components re-render on every state change
- Entire component trees may re-render unnecessarily
- Performance degrades with complex state

### Legend-State
- Components render once
- Individual elements update themselves
- Consistent performance regardless of state complexity

## Best practices demonstrated

1. **Component structure**: Keep components simple and focused
2. **State organization**: Use observables for both local and global state
3. **Fine-grained updates**: Use `Memo`, `Show`, `For`, and reactive props for optimal performance
4. **Persistence**: Automatically save and restore state
5. **Two-way binding**: Connect UI directly to state with reactive props
