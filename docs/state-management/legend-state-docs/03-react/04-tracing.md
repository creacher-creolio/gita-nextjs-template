# React Tracing

If you notice your components feeling too slow or seeming to render too often, four helpful functions can show you exactly what observables they're listening to and why they're rendering.

## useTraceListeners()

Call `useTraceListeners()` anywhere within `observer` or any React component to console.log a list of every observable being tracked for changes. This can help you find and reduce the number of listeners.

```javascript
import { useTraceListeners } from "@legendapp/state/trace";

const Component = observer(function Component(props) {
  // Call useTraceListeners anywhere inside the component
  useTraceListeners();

  const count = use$(state.count)

  return <div>{count}</div>;

  /* This logs:

    [legend-state] tracking 1 observable:
    1: count

    */
});
```

## useTraceUpdates()

Call `useTraceUpdates()` anywhere within `observer` or any React component to console.log information about the observable change that causes each render. This can help you track down why components are rendering too often.

```javascript
import { useTraceUpdates } from "@legendapp/state/trace";

const Component = observer(function Component(props) {
  // Call useTraceUpdates anywhere inside the component
  useTraceUpdates();

  const count = use$(state$.count)

  return <div>{count}</div>;

  /* This logs:

    [legend-state] Rendering because "count" changed:
    from: 0
    to: 1

    */
});
```

## useVerifyNotTracking()

Call `useVerifyNotTracking()` anywhere within any React component to console.error if it is tracking anything. This is useful if you are going for fine-grained reactivity and want to make sure parent components are not tracking any observables.

```javascript
import { useVerifyNotTracking } from "@legendapp/state/trace";

const Component = observer(function Component(props) {
  // Call useVerifyNotTracking anywhere inside the component
  useVerifyNotTracking();

  const count = use$(state$.count)

  // This will log an error because get() makes it track
  return <div>{count}</div>;
});

const FineComponent = observer(function FineComponent(props) {
  // Call useVerifyNotTracking anywhere inside the component
  useVerifyNotTracking();

  // This will not log because rendering the observable directly
  // does not re-render this component
  return <Memo>{state$.count}</Memo>;
});
```

## useVerifyOneRender()

Call `useVerifyOneRender()` anywhere within any React component to console.error if it renders more than once. This is useful if you want to make sure components are not rendered more than once.

```javascript
import { useVerifyOneRender } from "@legendapp/state/trace";

const Component = observer(function Component(props) {
  // Call useVerifyOneRender anywhere inside the component
  useVerifyOneRender();

  const count = use$(state$.count)

  // This will log an error after one render when count is updated
  return <div>{count}</div>;
});

const Component = observer(function Component(props) {
  // Call useVerifyOneRender anywhere inside the component
  useVerifyOneRender();

  const count = state$.count.peek()

  // This will not log because `peek()` does not track observable
  // does not re-render this component
  return <div>{state.count.peek()}</div>;
});
```

**Note:** All these hooks take name as an argument which can be used to identify which component is logging it.

## What to do with this information

- You may want to call `get()` at a higher level in an object to only listen to it, and not every single child.
- Use a shallow listener with `get(true)` to only update when keys are added to or removed from the object.
- You may want to call `peek()` to not listen at all.

If you find an observable changing often and you're not sure why, you can put a breakpoint on the console log to catch it. Or add your own listener to the observable to watch every change:

```javascript
// Why is count rendering so often?
state.count.onChange(({ value }) => {
  console.log("Count changed", value);
  console.trace();
  debugger;
});
```
