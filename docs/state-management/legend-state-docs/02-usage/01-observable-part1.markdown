# Observable

You can put anything in an observable: primitives, deeply nested objects, arrays, functions, etc… Observables work just like normal objects so you can interact with them without any extra complication. Just call `get()` to get a value and `set(...)` to modify it.

Observables do not modify the underlying data at all. They use Proxy to expose observable functions and track changes, so an observable is a Proxy pointing to the actual data.

> **Note**
>
> We use a `$` suffix on variables as a naming convention to indicate an observable but it's not required. It just helps differentiate between observables and regular variables.

```javascript
import { observable } from "@legendapp/state"

// Create observable objects as large and deep as you want. They can include computed functions
// and action functions.
const state$ = observable({
    fname: 'Annyong',
    lname: 'Bluth',
    // Computeds
    name: () => state$.fname.get() + ' ' + state$.lname.get(),
    // Actions
    setName: (name: string) => {
        const [fname, lname] = name.split(' ');
        state$.assign({ fname, lname })
    }
})

// Or create small individual atoms if you prefer
const fname$ = observable('Annyong')
const lname$ = observable('Bluth')
```

## Observable methods

### get()

You can use `get()` to get the actual value of any observable.

```javascript
const profile = { name: "Test user" }
const state$ = observable({ profile, test: 0 })

// get the underlying value from the observable
const name = state$.profile.name.get()
```

Accessing properties through the observable will create a Proxy for every property accessed, but it will not do that while accessing the raw data. So you may want to retrieve the raw data before doing expensive computations that do not need to notify.

```javascript
const state$ = observable({ data: someHugeThing })
const { data } = state$.get()

// Nothing special happens when working with the raw data
processData(data)
```

Calling `get()` within a tracking context tracks the observable automatically. You can change that behavior with a parameter `true` to track only when keys are added/removed. See observing contexts for more details.

```javascript
state$.get(true) // Create a shallow listener
```

### peek()

`peek()` returns the raw value in the same way as `get()`, but it does not automatically track it. Use this when you don't want the component/observing context to update when the value changes.

```javascript
const state$ = observable({ name: 'Test user' })

// get the underlying value from the observable
const name = state$.name.peek()
```

### set()

You can use `set()` to modify the observable, at any path within it. You can even `set()` on a node that is currently undefined, and it will fill in the object tree to make it work.

```javascript
const state$ = observable({ text: "hi" })

// Set directly
state$.text.set("hello there")

// Set with a function relative to previous value
state$.text.set((prev) => prev + " there")

// Set will automatically fill out objects that were undefined
state$.otherKey.otherProp.set("hi")
```

Note that `set` sets the given value into the raw data without modifying it. Legend-State does deep equality checking to notify of changes to each property, so setting with a clone of an object will not notify of any changes because all properties are the same.

### assign()

Assign is a shallow operation matching `Object.assign` to set multiple properties at once. If you want a deep merge, see mergeIntoObservable. These batch all individual set operations so that observers only update once.

```javascript
const state$ = observable({ text: "hi", text2: "there" })

// Assign
state$.assign({
    text: "hi!" ,
    text2: "there!"
})
```

### delete()

Observables provide a `delete` function to delete a key from an object.

```javascript
const state$ = observable({ text: "hi" })

// Delete text
state$.text.delete()

// Set the whole value to undefined
state$.delete()
```

`delete` works on array elements as well, removing the element from the array.

```javascript
const state$ = observable([ 'apple', 'orange' ])

// Delete from the array
state$[0].delete()
// state === ['orange']
```