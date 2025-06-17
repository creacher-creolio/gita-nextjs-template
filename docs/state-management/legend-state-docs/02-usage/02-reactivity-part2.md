### when

`when` runs the given callback **only once** when the Selector returns a truthy value, and automatically tracks the observables accessed while running the Selector so it will update whenever one of them changes. When the value becomes truthy it will call the callback function and dispose the listeners.

It also returns a Promise that resolves when the Selector returns a truthy value that can be used instead of the callback function.

```javascript
import { when } from "@legendapp/state";

const state$ = observable({ ok: false });

// Option 1: Promise
await when(state$.ok);

// Option 2: callback
when(
  () => state$.ok.get(),
  () => console.log("Don't worry, it's ok")
);
```

### whenReady

`whenReady` is the same as `when` except it waits for objects and arrays to not be empty.

```javascript
import { whenReady } from "@legendapp/state";

const state$ = observable({ arr: [] });

whenReady(state$.arr, () => console.log("Array has some values"));
// Not ready yet

state$.arr.push("hello");

// "Array has some values"
```

### onChange

`onChange` listens to an observable for any changes anywhere within it. Use this as specifically as possible because it will fire notifications for every change recursively up the tree.

```javascript
const state$ = observable({ text: "hi" });

state$.text.onChange(({ value }) => console.log("text changed to", value));
state$.onChange(({ value }) => console.log("state changed to", value));

state$.text.set("hello");

// Log: text changed to "hello"
// Log: state changed to { text: "hello" }
```

`onChange` has some extra options for more advanced use:

1. `getPrevious`: Function to compare with the previous value. It is a function to let you opt into getting the previous value if needed, because it has some performance cost in cloning the object to compute the previous value.
2. `changes`: Array of all of the changes to this observable in the latest batch. This is intended mainly for internal usage by the persistence plugins to know what to sync/update and the history plugin to track all changes, but it may be good for other uses too.
3. `trackingType`: Whether to track only shallow changes
4. `initial`: Whether to run the callback immediately with the current value
5. `immediate`: Whether to run the callback immediately instead of within a batch. This is used internally by `computed` to make sure its value is always correct, but it may be useful for other specific uses.

```javascript
// Full example
state$.onChange(
  ({ value, getPrevious, changes }) => {
    const prev = getPrevious();
    changes.forEach(({ path, valueAtPath, prevAtPath }) => {
      console.log(valueAtPath, "changed at", path, "from", prevAtPath);
    });
  },
  { initial: true, trackingType: true }
);
```

#### Dispose of listeners

Listening to an observable returns a dispose function to stop listening. Just call it when you want to stop listening.

```javascript
const state$ = observable({ text: 'hello' })

const onChange = () => { ... }

const dispose = state$.text.onChange(onChange)

// Cancel listening manually
dispose()
```

## Batching

You may want to modify multiple observables at once without triggering callbacks for each change. Batching postpones renders and listeners until the end of the batch.

Batching can be done in two ways, wrapping between `beginBatch()` and `endBatch()` or in a callback with `batch(callback)`.

```javascript
import { batch, beginBatch, endBatch } from "@legendapp/state";

// Wrap in begin and end
beginBatch();
doManyChanges();
endBatch();

// Or batch with a callback
batch(() => {
  doManyChanges();
});
```

As we all know, you generally shouldn't optimize pre-emptively. `observable` functions like `assign` already batch changes under the hood, so listeners don't get called until the full change is complete. In many cases like setting unrelated observables you don't need to worry about it.

Batching is important in a few key situations:

### When observables depend on each other

Use `batch` to delay computations/renders until all dependent changes are complete or you might get weird intermediary states.

```javascript
const name$ = observable({ first: "", last: "" });

const fullName = observable(() => `${name$.first} ${name$.last}`);

observe(() => console.log("fullName = ", fullName.get()));

// Not batched:
name$.first.set("First");
name$.last.set("Last");
// ❌ fullName notifies its listeners with incomplete state
// fullName = "First "
// fullName = "First Last"

// Batched:
batch(() => {
  name$.first.set("First");
  name$.last.set("Last");
});
// ✅ fullName notifies only with final state
// fullName = "First Last"
```

### To prevent excessive renders

Making multiple changes in a row can cause React components and observers to re-run multiple times when they should wait until changes are complete.

```javascript
const state$ = observable({ items: [] });

function addItems() {
  for (let i = 0; i < 1000; i++) {
    state$.items.push({ text: `Item ${i}` });
  }
}

// ❌ This can render 1000 times while pushing to the array
addItems();

// ✅ Batching delays until complete and renders once
batch(addItems);
```

### When persisting

If you are using `synced` or `syncObservable` to automatically persist your changes, you can prevent excessive writes by delaying persistence until changes are complete. Pushing to an array 1000 times could save to storage 1000 times, which could be very slow!