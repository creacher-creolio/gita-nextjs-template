## Control-flow components

### Computed

Computed extracts children so that their changes do not affect the parent, but the parent's changes will still re-render them. Use this when children use observables that change often without affecting the parent, but also depends on local state in the parent.

This is equivalent to extracting it as a separate component (and passing in all needed props).

The child needs to be a function to be able to extract it into a separate tracking context, but the Babel plugin lets you pass it children directly.

```javascript
function Component() {
  return (
    <Computed>
      {() =>
        state$.messages.map((message) => (
          <div key={message.id}>
            {message.text} {localVar}
          </div>
        ))
      }
    </Computed>
  );
}
```

### Memo

Memo is similar to Computed, but it will never re-render when the parent component renders - only if its own observables change. Use `Memo` when children are truly independent from the parent component. This is equivalent to extracting it as a separate component (and passing in all needed props) with `React.memo`.

The child needs to be a function to be able to extract it into a separate tracking context, but the Babel plugin lets you pass it children directly.

```javascript
function Component() {
  return (
    <Memo>
      {() =>
        state.messages.map((message) => (
          <div key={message.id}>
            {message.text} {localVar}
          </div>
        ))
      }
    </Memo>
  );
}
```

### Show

Show renders child components conditionally based on the if/else props, and does not re-render the parent when the condition changes.

Passing children as a function can prevent the JSX from being created until it needs to render. That's done automatically if you use the babel plugin.

Props:

* `if`: A computed function or an observable
* `ifReady`: A computed function or an observable. This will not render if the value is an empty object or empty array.
* `else`: Optionally provide a component to render if the condition is not met
* `children`: The components to show conditionally. This can be React elements or a function given the value returned from `if` which you can use to do more complex conditional rendering.
* `wrap`: A component to wrap the children. For example this could be Framer Motion's AnimatePresence to animate the element entering/exiting.

```javascript
<Show
  if={state.show}
  else={() => <div>Nothing to see here</div>}
  wrap={AnimatePresence}
>
  {() => <Modal />}
</Show>
```

```javascript
import { Show, useObservable } from "@legendapp/state/react";
import { AnimatePresence } from "framer-motion";

function ShowExampleWithSelector() {
  const state$ = useObservable({ collection: [] });
  return (
    <Show
      if={() => state$.collection.get().length > 0}
      else={() => <div>Nothing to see here</div>}
      wrap={AnimatePresence}
    >
      {() => <Modal />}
    </Show>
  );
}
```

### Switch

Switch renders one child component conditionally based on the `value` prop, and does not re-render the parent when the condition changes.

Props:

* `value`: A computed function or an observable
* `children`: An object with the possible cases of `value` as keys. If `value` doesn't match any of the cases it will use the `default` case if available.

```javascript
<Switch value={state.index}>
  {{
    0: () => <div>Tab 1</div>,
    1: () => <div>Tab 2</div>,
    default: () => <div>Error</div>,
  }}
</Switch>
```

### For

The `For` component is optimized for rendering arrays of observable objects so that they are extracted into a separate tracking context and don't re-render the parent.

An `optimized` prop adds additional optimizations, but in an unusual way by re-using React nodes. See Optimized rendering for more details.

Props:

* `each`: An observable (array, object, or Map)
* `item`: A render function which receives the item id, and item observable or undefined
* `itemProps`: Extra props to pass down to each item
* `sortValues`: If the `each` parameter is an object or Map, this is a sort function for how to sort the elements. `(A: T, B: T, AKey: string, BKey: string) => number`
* `children`: A render function or, you can pass a render function as children instead of in the `item` prop if you prefer.

```javascript
import { observable } from "@legendapp/state"
import { For, use$ } from "@legendapp/state/react"

const state$ = observable({ arr: [{ id: 1, text: 'hi' }]})

const Row = function Row({ item$ }) {
    const text = use$(item$.text)
    return <div>{text}</div>
}

function List() {
    // 1. Use the For component with an item prop
    return <For each={state$.arr} item={Row} />

    // 2. Use the For component with a render function as the child
    return (
        <For each={list} optimized>
            {item$ => (
                <div>
                    {item$.text.get()}
                </div>
            )}
        </For>
    )
}
```

## Optionally add the Babel plugin

The Babel plugin can make the syntax for Computed, Memo, and Show less verbose. But they work fine without Babel if you don't want to or can't use it. The Babel plugin converts the JSX under the hood so you don't need to use functions as children. It converts inline elements to functions so that they can be treated reactively:

```javascript
// You write
<Computed><div>Count: {state$.count.get()}</div></Computed>
<Memo><div>Count: {state$.count.get()}</div></Memo>
<Show if={state$.visible}><Modal /></Show>

// Babel transforms it to
<Computed>{() => <div>Count: {state.count.get()}</div>}</Computed>
<Memo>{() => <div>Count: {state$.count.get()}</div>}</Memo>
<Show if={state$.visible}>{() => <Modal />}</Show>
```

To install it, add `@legendapp/state/babel` to the plugins in your `babel.config.js`:

```javascript
module.exports = {
  plugins: ["@legendapp/state/babel"],
};
```

If you're using typescript you can add a `.d.ts` file to your project with this in it, to expand the types to allow direct JSX children to Computed and Memo.

```typescript
/// <reference types="@legendapp/state/types/babel" />
```

## Create your own reactive components

### reactive

You can wrap external components in `reactive` to create reactive versions of all of their props, prefixed with `$`. This makes it so that the reactive component can accept reactive props but the target receives regular props as usual. `reactive` creates a Proxy (not an HOC) that extracts all reactive props and observes them for changes, passing the regular prop down to the component.

In this example, `reactive` adds a `$message` prop which takes a Selector, while the target component receives a normal `message` prop and is only re-rendered when `message` changes.

```javascript
import { observable } from "@legendapp/state";
import { reactive } from "@legendapp/state/react";

const isSignedIn$ = observable(false);

const Component = reactive(function Component({ message }) {
  return <div>{message}</div>;
});

function App() {
  return (
    <Component $message={() => isSignedIn$.get() ? "Hello" : "Goodbye"} />
  );
}
```

In addition to wrapping your own functions, you can wrap external library components to make them reactive. In this example we make a Framer Motion component reactive so that we can update its animations based on observables without needing to re-render the parent component or its children.

```javascript
import { reactive } from "@legendapp/state/react";
import { motion } from "framer-motion";

const $MotionDiv = reactive(motion.div);

function Component() {
  // This component renders only once
  const width$ = useObservable(100);

  return (
    <$MotionDiv
      $animate={() => ({
        x: width$.get(),
      })}
    >
      ...
    </$MotionDiv>
  );
}
```

### reactiveObserver

This is a single HOC with the functionality of both `observer` and `reactive`. They both run the same function under the hood, with slightly different options, so this is the optimal way to have one HOC that does both at once.

```javascript
import { observable } from "@legendapp/state";
import { reactiveObserver, use$ } from "@legendapp/state/react";

const name$ = observable("Annyong");
const isSignedIn$ = observable(false);

const Component = reactiveObserver(function Component({ message }) {
  const name = use$(name$);

  return (
    <div>
      {message} {name}
    </div>
  );
});

function App() {
  return (
    <Component $message={() => (isSignedIn$.get() ? "Hello" : "Goodbye")} />
  );
}
```

### reactiveComponents

`reactiveComponents` makes multiple reactive components at once. You can use this to create your own internal library of reactive components, or to wrap UI libraries that have multiple components in a namespace like `Modal.Header` and `Modal.Footer`.

```javascript
import { reactiveComponents } from "@legendapp/state/react";
import { motion } from "framer-motion";

const $Motion = reactiveComponents(motion);

function Component() {
  // This component renders only once
  const width$ = useObservable(100);

  return (
    <$Motion.div
      $animate={() => ({
        x: width$.get(),
      })}
    >
      ...
    </$Motion.div>
  );
}
```