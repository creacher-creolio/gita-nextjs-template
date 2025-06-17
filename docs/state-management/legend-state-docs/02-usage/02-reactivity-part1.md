# Reactivity

Listening for changes is the core purpose of observables, so Legend-State provides many options. You can listen to changes at any level in an object's hierarchy and it will be notified by changes in any children.

## Observing contexts

The core power of Legend-State is the "observing contexts". Calling `get()` within an observing context will track changes in that node, and re-run itself whenever it changes.

Most functions in Legend-State take what we call a "Selector", which is either a single observable or a function that calls `get()` on some observables and returns a value.

Most functions in Legend-State are observing contexts, including computed observables, `observe`, `when`, linked/synced `get` functions, as well as `observer` and reactive components in React. When you call `get()` on an observable inside an observing context it will track it for changes and re-run whenever it changes.

```javascript
observe(() => {
    console.log(settings$.theme.get())
})
```

### What tracks

`get()` is the primary way to access observables and track for changes, but there are actually a few ways:

1. Call `get()` on an observable: `settings.get()`
2. Array looping functions (shallow listener): `arr.map(settings.accounts, () => ...)`
3. Accessing array length (shallow listener): `if (arr.length > 0) ...`
4. Object.keys (shallow listener): `Object.keys(settings)`
5. Object.values (shallow listener): `Object.values(settings)`

These operation do not track:

1. Accessing through an observable: `state$.settings`
2. Call `peek()` on an observable: `settings.peek()`

### Observing examples

```javascript
const state$ = observable({
  settings: {
    theme: "dark",
  },
  chats: {
    messages: [{ id: 0, text: "hi" }],
  },
});

observe(() => {
  const theme = state$.settings.theme.get();
  // ✅ Tracking [state$.settings.theme] because of get()

  const theme = state$.settings.theme.peek();
  // ❌ Not tracking because of peek()

  const theme = state$.settings.get(true);
  // ✅ Tracking [state$.settings (shallow)] because of get(true)

  const settings$ = state$.settings;
  // ❌ Not tracking, just a reference to an observable

  state$.chats.messages.map((m) => <Message key={m.peek().id} message={m} />);
  // ✅ Tracking [state$.chats.messages (shallow)] because of map()

  const keys = Object.keys(state$.settings);
  // ✅ Tracking [state$.settings (shallow)] because of Object.keys
});
```

The automatic behavior can be modified with two observable functions:

| Function              | Tracked |
| --------------------- | ------- |
| get()                 | yes     |
| peek()                | no      |
| get(true)             | shallow |
| arr$.map(...)         | shallow |
| arr$.length           | shallow |
| Object.keys(state$)   | shallow |
| Object.values(state$) | shallow |

### get()

`get` returns the raw data of an observable and tracks it, so you can work with it without doing any further tracking. You may want to use `get()` to:

* Get the value of an observable wrapper of a primitive
* Track this object and not its individual fields. Minimizing the number of listeners is better for performance.

```javascript
const theme = state.settings.theme.get();
// ✅ Tracking [state.settings.theme]
```

### Shallow tracking

`get()` observes recursively by default, so any child changing will cause an update. You can modify it to be a shallow listener by just adding a `true` parameter. This can be useful when a component only needs to re-render if an object's keys or an array's items change. Array and Object functions also track shallowly - see What tracks above.

```javascript
const state$ = observable({ messages: [] });

observe(() => {
  // Only need this to update when messages added/removed
  const messages = state$.messages.get(true);

  console.log("Latest message", messages[0]);
});
```

### Selectors

Many of the functions in Legend-State take a Selector, which can be either an observable or a function that returns a value based on observables. The selector is run in an observing context so that `get()` tracks an observable for changes. Whenever an observable changes, it re-runs the function.

Using `when` as an example of using Selectors:

```javascript
const isSignedIn$ = observable(false);
const isOnline$ = observable(false);

// A selector can be just an observable, which will be tracked for changes
await when(isSignedIn$);

// Or selector can be a function which tracks all get() calls for changes
await when(() => isSignedIn$.get() && isOnline$.get());
```

### observe

`observe` can run arbitrary code when observables change, and automatically tracks the observables accessed while running, so it will update whenever any accessed observable changes.

This can be useful to use multiple observables at once, for the benefit of cleanup effects, or if you just like it more than onChange.

The callback parameter has some useful properties:

* `num`: How many times it's run. Use this to do something only the first time or not the first time.
* `previous`: The previous value, which will be undefined on the first run and set to the return value
* `cancel`: Set to `true` to stop tracking the observables when you are done observing
* `onCleanup`: A function to call before running the selector again

`observe` has an optional second `reaction` parameter which will run after the selector, and does not track changes. This can be useful for observing an `event` or a single `observable`.

```javascript
import { observe, observable } from "@legendapp/state";
const state$ = observable({ isOnline: false, toasts: [] });

const dispose = observe((e) => {
  // This observe will automatically track state.isOnline for changes
  if (!state$.isOnline.get()) {
    // Show an "Offline" toast when offline
    const toast = { id: "offline", text: "Offline", color: "red" };
    state$.toasts.push(toast);

    // Remove the toast when the observe is re-run, which will be when isOnline becomes true
    e.onCleanup = () => state$.toasts.splice(state$.toasts.indexOf(toast), 1);
  }
});

// Cancel the observe
dispose();
```

Or use the second parameter to run a reaction when a selector changes. It has an additional `value` parameter, which contains the value of the selector.

```javascript
// Observe the return value of a selector and observe all accessed observables
observe(state$.isOnline, (e) => {
  console.log("Online status", e.value);
});

// Observe the return value of a selector and observe all accessed observables
observe(
  () => state$.isOnline.get() && state$.user.get(),
  (e) => {
    console.log("Signed in status", e.value);
  }
);
```