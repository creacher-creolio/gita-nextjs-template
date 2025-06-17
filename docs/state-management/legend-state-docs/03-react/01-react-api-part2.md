# React API

## Hooks for creating local state

### useObservable

The `useObservable` hook creates an observable within a React component. This can be useful when state is specific to the lifetime of the component, or to hold multiple values in local state.

Its observables will not be automatically tracked for re-rendering, so you can track them the same as any other observable.

As with normal observables you can create a computed observable by just using a function.

```javascript
import { observer, useObservable } from "@legendapp/state/react"

const Component = function Component() {
    const state$ = useObservable({
        title: 'Title',
        first: '',
        last: '',
        profile: {...}
    })

    const fullname$ = useObservable(() => `${state$.fname.get()} ${state$.lname.get()}`)

    return (
        <div>
            <div>{fullname$}</div>
            <Input text={state$.first} />
            <Input text={state$.last} />
            <Profile name={fullname$} />
        </div>
    )
}
```

### useObservableReducer

`useObservableReducer` works the same way as `useReducer` but sets an observable rather than triggering a render.

```javascript
import { useObservableReducer } from "@legendapp/state/react"

function reducer(state, action) {
    if (action.type === 'incremented_age') {
        return {
            age: state.age + 1
        }
    }
}

const Component = () => {
    // Only re-renders if the return value changes
    const [age$, dispatch] = useObservableReducer(reducer, { age: 42 })

    // Get the value of the reducer
    const theme = age$.get()
}
```

### Using with Context

Passing an observable object through Context gives you all the benfits of Context without the downsides, like any change to context normally re-renders all consumers.

Simply set an observable as a Context value and consume it from a child component as usual. The observable itself is a stable object so useContext will never cause a re-render - only observing contexts will be updated as usual.

```javascript
import { createContext, useContext } from "react"
import { observer, useObservable } from "@legendapp/state/react"

interface UserState {
    profile: {
        name: string;
    };
}

// Create a typed context. It can have a default value of undefined because
// the Provider will always be created with an Observable.
const StateContext = createContext<Observable<UserState>>(undefined as any);

function App() {
  const state$ = useObservable({
    profile: {
      name: "",
    },
  })

  return (
    <StateContext.Provider value={state$}>
      <div>
        <Sidebar />
        <Main />
      </div>
    </StateContext.Provider>
  )
}

const Sidebar = function Sidebar() {
  // StateContext will never change so this will never cause a render
  const state$ = useContext(StateContext)

  // This component never re-renders, but name re-renders itself
  return (
    <div>
      Name: <Memo>{state$.profile.name}</Memo>
    </div>
  )
}
```

## Miscellaneous hooks

### useEffectOnce

This is `useEffect` with a workaround in development mode to make sure it only runs once.

```javascript
import { useEffectOnce } from "@legendapp/state/react"

const Component = () => {
  useEffectOnce(() => {
    console.log("mounted")
  }, [])
}
```

### useMount

Using observable hooks we generally avoid the built-in hooks and dependency arrays, so we have `useMount` and `useUnmount` hooks for convenience, which are just `useEffectOnce` under the hood.

```javascript
import { useMount } from "@legendapp/state/react"

const Component = () => {
  useMount(() => console.log("mounted"))
}
```

### useUnmount

Like the `useMount` hook, `useUnmount` just uses `useEffectOnce` under the hood.

```javascript
import { useUnmount } from "@legendapp/state/react"

const Component = () => {
  useUnmount(() => console.log("mounted"))
}
```

### usePauseProvider

This creates a React Context Provider with a `paused$` observable. Set `paused$` to `true` to pause all rendering from observable changes under the context, and set it `false` to resume. This applies to everything within Legend-State like observer, useSelector, $React, Memo, etc… But normal renders coming from React or other state is not affected.

This can be very useful to stop all updating when UI is not even visible, such as when a fullscreen modal is covering app UI or in inactivate tabs in React Native.

```javascript
import { useInterval } from "usehooks-ts"
import { Memo, usePauseProvider, useObservable } from '@legendapp/state/react'

function App() {
    const { PauseProvider, isPaused$ } = usePauseProvider()

    const int$ = useObservable(0)
    useInterval(() => {
        int$.set((val) => val + 1)
    }, 100)

    return (
        <Box center>
            <Button onClick={isPaused$.toggle}>
                <Memo>{() => (isPaused$.get() ? 'Resume' : 'Pause')}</Memo>
            </Button>
            <PauseProvider>
                <Memo>{int$}</Memo>
            </PauseProvider>
        </Box>
    )
}
```
