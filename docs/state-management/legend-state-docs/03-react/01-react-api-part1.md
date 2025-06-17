# React API

## Reading state

### use$

> **Note**
>
> In previous version this was called useSelector. If you were using `useSelector` it will still work for a while, but we suggest changing them to `use$` as we'll remove `useSelector` in a later version. Many people were unsure of what a "selector" was so it was unclear what it did. Plus, `use$` is shorter 😀

`use$` computes a value and automatically listens to any observables accessed while running, and only re-renders if the computed value changes. This can take either an observable or a function that consumes observables.

Props:

* `selector`: Observable or computation function that listens to observables accessed while running
* `options`: `{ suspense: boolean }`: Enable suspense when the value is a Promise and you're using it within React.Suspense.

```javascript
import { observable } from "@legendapp/state"
import { use$ } from "@legendapp/state/react"

const state$ = observable({ selected: 1, theme })

const Component = ({ id }) => {
    // Only re-renders if the return value changes
    const isSelected = use$(() => id === state$.selected.get())

    // Get the raw value of an observable and re-render when it changes
    const theme = use$(state$.theme)

    ...
}
```

#### Using with React Suspense

Using `{ suspense: true }` as the second parameter makes the component work with Suspense. If the observable is a Promise, Suspense will render the fallback until it resolves to a non-undefined value.

```javascript
import { useObservable, useSelector } from "@legendapp/state/react"
import { Suspense } from "react"

function Test({ state$ }) {
  const value = useSelector(state$, { suspense: true })
  return <div>{value}</div>
}

export default function App() {
  const state$ = useObservable(
    new Promise((resolve) => {
      setTimeout(() => {
        resolve("hello")
      }, 1000)
    })
  )

  return (
    <div>
      <div>Suspense test</div>
      <Suspense fallback={<div>Loading...</div>}>
        <Test state$={state$} />
      </Suspense>
    </div>
  )
}
```

### observer

`observer` is a good optimization if you have want to consume observables/selectors conditionally or if you consume many of them in one component. It inserts a single hook into the component and tracks all observables in the one hook. Because `use$` normally runs three hooks, this can drastically reduce the number of hooks in your components if you use `use$` many times.

> **Note**
>
> Although observer looks like an HOC, it actually creates a Proxy around the component, with effectively no performance cost. It tracks all overable access with a single hook so it is much more efficient than using multiple hooks.
>
> In previous versions this allowed calling `get()` directly within components, but that is discouraged as of 3.0.0-beta.20. See migrating for more info.

See Observing Contexts for more about when it tracks.

```javascript
import { observable } from "@legendapp/state"
import { observer, use$ } from "@legendapp/state/react"

const state$ = observable({ count: 0 })

const Component = observer(function Component() {
  // Accessing state automatically makes this component track changes to re-render
  const count = use$(state$.count)

  // Re-renders whenever count changes
  return <div>{count}</div>
})
```

### useObserve

`useObserve` creates an observe which you can use to take actions when observables change. This can be effectively similar to `useEffect` for observables, except that it runs when observables change and not because of a deps array changing.

Like `observe`, `useObserve` has an optional second callback parameter which will run after the selector, and does not track changes. This can be useful for observing an `event` or a single `observable`.

Note that `useObserve` runs during component render, not after render like `useEffect`. If you want an observer that runs after render, see useObserveEffect.

```javascript
import { event } from "@legendapp/state"
import { useObserve, useObservable } from "@legendapp/state/react"
import { $React } from "@legendapp/state/react-web"

const eventUpdateTitle = event()

function ProfilePage() {
  const profile$ = useObservable({ name: "" })

  // This runs whenever profile changes
  useObserve(() => {
    document.title = `${profile$.name.get()} - Profile`
  })

  // Observe a single observable with a callback when it changes
  useObserve(profile$.name, ({ value }) => {
    document.title = `${value} - Profile`
  })

  // Observe an event with a callback when it changes
  useObserve(eventUpdateTitle, () => {
    document.title = `${profile$.name.get()} - Profile`
  })

  return (
    <div>
      <span>Name:</span>
      <$React.input $value={profile$.name} />
    </div>
  )
}
```

### useObserveEffect

`useObserveEffect` is the same as useObserve except that it runs after the component is mounted.

### useWhen, useWhenReady

These are hook versions of when.
