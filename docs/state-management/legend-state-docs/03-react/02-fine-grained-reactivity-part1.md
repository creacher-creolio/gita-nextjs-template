# Fine Grained Reactivity

Legend-State enables a new way of thinking about how React components update: to **observe state changing** rather than observing renders. In this pattern, components render once and individual elements re-render themselves. This enables what we call a "render once" style - components render only the first time and state changes trigger only the tiniest possible re-renders.

You can render observable primitives directly in mini self-updating components, use reactive props to update props based on state, or use a set of control-flow components to optimize conditional rendering and arrays to re-render as little as possible.

Some teams may prefer to use Legend-State in a way that's more canonically React and skip some or all of these concepts, at least at first. But the fine-grained reactivity features can improve performance and reduce the amount of code you need to write. See Making React fast by default and truly reactive for more details.

## Render an observable/selector directly

Use the `Memo` component to create a mini element that re-renders itself when it changes, without needing the parent component to re-render. This is the most basic and recommended way for using Legend-State with React. The children inside of `Memo` re-render themselves when the value changes, but the parent component does not re-render.

```javascript
import { Memo } from "@legendapp/state/react";

const count$ = observable(0);

// These components never re-render.
// The Memo element re-renders itself when its value changes.
function WithObservable() {
  return (
    <div>
      Count:
      <Memo>{count$}</Memo>
    </div>
  );
}

function WithSelector() {
  return (
    <div>
      <Memo>{() => <div>Count: {count$.get()}</div>}</Memo>
    </div>
  );
}
```

## Reactive components

Legend-State provides reactive versions of all platform components with reactive props. This lets you provide a Selector to props so that the component will update itself whenever the Selector changes.

For input elements it can create a two-way binding to the value, so that the observable is always in sync with the displayed value of the element.

Under the hood this extracts the reactive props to a separate component which re-renders when they change. This can be a big performance boost if these props change often and your outer component is very heavy, as it will move those re-renders down into a tiny wrapper component. But keep in mind that overdoing it can potentially add slightly extra overhead if it's adding more components to the React tree.

### React Web

Legend State includes reactive versions of all of the DOM elements on the `$React` namespace.

```javascript
import { $React } from "@legendapp/state/react-web"

function Component() {
    // This component renders only once
    const state$ = useObservable({ name: '', age: 18 })

    return (
        <div>
            {/* Reactive styling */}
            <$React.div
                $style={() => ({
                    color: state$.age.get() > 5 ? 'green' : 'red'
                })}
                $className={() => state$.age.get() > 5 ? 'kid' : 'baby'}
            />
            {/* Reactive children */}
            <$React.div>
                {() => (
                    <div>{state$.age.get() > 5 ? <Kid /> : <Baby />}</div>
                )}
            </$React.div>
            {/* Two-way bind to inputs */}
            <$React.textarea $value={state$.name} />
            <$React.select $value={state$.age}>...</$React.select>
            <$React.input
                $value={state$.name}
                $className={() => !state$.name.get() && "border-red-500"}
                $style={() => !state$.name.get() && { borderWidth: 1 }}
            />
        </div>
    )
}
```

### React Native

Legend State includes reactive versions of all of the built-in React Native components, prefixed with `$` to differentiate them from the normal components.

```javascript
import { $View, $Text, $TextInput } from "@legendapp/state/react-native"

function Component() {
    // This component renders only once
    const state$ = useObservable({ name: '', age: 18 })

    return (
        <div>
            {/* Reactive styling */}
            <$View
                $style={() => ({
                    color: state$.age.get() > 5 ? 'green' : 'red'
                })}
            />
            {/* Reactive children */}
            <$Text>
                {() => state$.age.get() > 5 ? 'child' : 'baby'}
            </$Text>
            {/* Two-way bind to inputs */}
            <$TextInput $value={state$.name} />
        </div>
    )
}
```