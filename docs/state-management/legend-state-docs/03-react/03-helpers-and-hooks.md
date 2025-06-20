# Helpers and Hooks

Legend-State includes some helpful observables and hooks for common tasks. These are available at their own import paths so they don't increase the size of your bundle unless you use them.

## Helper observables

### currentDate

`currentDate` is an observable containing the current date (with no time) that changes automatically at midnight.

```javascript
import { currentDate } from "@legendapp/state/helpers/time"

observe(() => {
    console.log('Today is': currentDate.get())
})
```

### currentTime

`currentTime` is an observable containing the current time that changes automatically every minute.

```javascript
import { currentTime } from "@legendapp/state/helpers/time"

observe(() => {
    console.log('The time is is': currentTime.get())
})
```

### pageHash (web)

`pageHash` is an observable that updates with the page hash, and changes the page hash when the observable is changed. Use `configurePageHash` to control how it sets the page hash, with `pushState | replaceState | location.hash`

```javascript
import { pageHash, configurePageHash } from '@legendapp/state/helpers/pageHash'

configurePageHash({ setter: 'pushState' })

observe(() => {
    console.log('hash changed to': pageHash.get())
})

pageHash.set('value=test')
// location.hash == "#value=test"
```

### pageHashParams (web)

`pageHashParams` is an observable that updates with the page hash, and changes the page hash when the observable is changed. Use `configurePageHashParams` to control how it sets the page hash, with `pushState | replaceState | location.hash`

```javascript
import { pageHashParams, configurePageHash } from '@legendapp/state/helpers/pageHashParams'

observe(() => {
    console.log('userid param changed to': pageHashParams.userid.get())
})

pageHashParams.userid.set('newuser')
// location.hash == "#userid=newuser"
```

## Hooks

### useHover (web)

`useHover` returns an observable whose value is `true | false` based on whether the target element is hovered. This can be useful for using fine-grained reactivity features to update without re-rendering the component, or to pass the observable around to other components for them to consume it.

```javascript
import { Show } from "@legendapp/state/react";
import { useHover } from "@legendapp/state/react-hooks/useHover";
import { useRef } from "react";

function ButtonWithTooltip() {
  const refButton = useRef();
  const isHovered = useHover(refButton);

  return (
    <div>
      <button ref={refButton}>Click me</button>
      <Show if={isHovered}>
        {() => <Tooltip text="Tooltip!" target={refButton} />}
      </Show>
    </div>
  );
}
```

### useIsMounted

`useIsMounted` returns an observable whose value is `true | false` based on whether the component is mounted. This can be useful in delayed or asynchronous functions to make sure it's running an a component that's still mounted.

```javascript
import { useIsMounted } from "@legendapp/state/react/useIsMounted";

function Component() {
  const isMounted = useIsMounted();

  const onClick = () => {
    setTimeout(() => {
      if (isMounted.get()) {
        console.log("Debounced click");
      }
    }, 100);
  };

  return <button onClick={onClick}>Click me</button>;
}
```

### useMeasure (web)

`useMeasure` returns an observable whose value is the size (`{ width: number, height: number }`) of the target element. It starts with undefined values that get set after initial mount, and whenever the element resizes.

```javascript
import { useMeasure } from "@legendapp/state/react-hooks/useMeasure";
import { useRef } from "react";

function Component() {
  const ref = useRef();
  const { width, height } = useMeasure(ref);

  return (
    <div ref={ref}>
      Width: {width}, Height: {height}
    </div>
  );
}
```

One example of where this could be useful is to drive animations. This example measures the size of an inner element to animate a bottom sheet from the bottom to its height. It uses framer-motion and reactive to be able to drive animations with observable values.

```javascript
import { reactive } from "@legendapp/state/react";
import { useMeasure } from "@legendapp/state/react-hooks/useMeasure";
import { motion } from "framer-motion";
import { useRef } from "react";

const MotionDiv$ = reactive(motion.div);

function BottomSheet({ children }) {
  const refInner = useRef();
  const { width, height } = useMeasure(refInner);

  return (
    <MotionDiv$
      style={{ position: "fixed", bottom: 0, left: 0, right: 0 }}
      $animate={() => ({ y: -height.get() })}
    >
      <div ref={refInner}>{children}</div>
    </MotionDiv$>
  );
}
```

### createObservableHook

`createObservableHook` is a helper to convert an existing hook to return an observable. It works by overriding `useState` and `useReducer` in the hopes of catching and converting them into observable sets. So it may work for some hooks and it may not. Please let us know on GitHub if it's not working for some hooks.

```javascript
import { createObservableHook } from "@legendapp/state/react-hooks/createObservableHook"

const useMyHookObservable = createObservableHook(useMyHook)

function Component() {
    const value = useMyHookObservable()
    ...
}
```
