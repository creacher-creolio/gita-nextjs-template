## Linked observables

### Two-Way Linked

`linked` creates an observable bound to both `get` and `set` functions. This lets you bind or transform a single or multiple other observable values. For example it could be used to create a "Select All" checkbox.

```javascript
import { linked, observable } from "@legendapp/state"

const selected$ = observable([false, false, false])
const selectedAll$ = observable(linked({
  // selectedAll is true when every element is selected
  get: () => selected$.every((val$) => val$.get()),

  // setting selectedAll sets the value of every element
  set: (value) => selected$.forEach((val$) => val$.set(value))
}))

selectedAll$.set(true)
// selected.get() === [true, true, true]
```

Or it could be used to automatically deserialize/serialize a string value.

```javascript
const str$ = observable('[1,2,3]')
const arr$ = observable(linked({
  get: () => JSON.parse(str$.get())
  set: (value) => str$.set(JSON.stringify(value))
}))
```

#### Initial value

When creating an asynchronous observable with a Promise you may want it to have an initial default value until the promise resolves. You can use the `initial` property of `linked` to do that.

```javascript
import { linked } from "@legendapp/state"

const state$ = observable(linked({
    get: () => fetch('url').then(res => res.json()),
    initial: { numUsers: 0, messages: [] }
}))
```

## Advanced Computeds

### Link to another observable

If you return an observable from a computed function, it will create a two-way link to the target observable. Interaction with the linked observable will then pass through to the target.

Observing contexts tracking the linking observable will re-run both when the linked observable's value changes and when the link itself changes.

In this example, the observable that `selectedItem` points to is changed by setting `selectedIndex`. And because it's a direct link to the target observable, `set` operations will pass through to the target observable.

```javascript
const state$ = observable({
  items: ["hi", "there", "hello"],
  selectedIndex: 0,
  selectedItem: () => state$.items[state$.selectedIndex.get()],
})

observe(() => {
    console.log('observe:' + state$.selectedItem.get())
})
// observe: 'hi'

state$.selectedIndex.set(2)
// observe: 'hello'

state$.selectedItem.set('HELLO!')
// observe: 'HELLO!'

// items = ["hi", "there", "HELLO!"]
```

This could also be used to transform objects to another shape while still linking to the original value. So for example you could filter the values of an object into an array, with each element in the array pointing to the original observable.

```javascript
const state$ = observable({
  items: {
    id1: { id: 'id1', status: 'ready' },
    id2: { id: 'id2', status: 'disabled' }
  },
  itemsReady: () => Object.values(state$.items)
                    .filter(item => item.status.get() === 'ready')
})

observe(() => {
    console.log('observe:' + state$.itemsReady.get())
})
// observe: [{ id: 'id1', status: 'ready' }]

// modifying the target object recomputes the computed array
state$.items.id2.status.set('ready')
// observe: [{ id: 'id1', status: 'ready' }, { id: 'id2', status: 'ready' }]

// set on the computed array goes into the target object
state$.itemsReady[0].status.set('disabled')
// observe: [{ id: 'id2', status: 'ready' }]
```

### Lookup table

A function with a single `string` key can be used as a lookup table (an object with a string key). Accessing it by index will call the function to create a computed observable by that key.

```javascript
const state$ = observable({
    selector: 'text',
    items: {
        test1: { text: 'hi', othertext: 'bye' },
        test2: { text: 'hello', othertext: 'goodbye' }
    },
    // Return a link to the [selector] property in the given item
    texts: (key: string) => {
        return state$.items[key][state$.selector.get()]
    },
})

// Now these reference the same thing:
state$.items.test1.text.get()
state$.texts['test1'].get()

// And setting a text goes through to the linked observable
state$.texts.test1.set('hello')
state$.items.test1.text.get() // 'hello'
```

### event

`event` works like an observable without a value. You can listen for changes as usual, and dispatch it manually whenever you want. This can be useful for simple events with no value, like onClosed.

```javascript
import { event } from "@legendapp/state"

const onClosed$ = event()

// Simply pass a callback to the `onChange` function
onClosed$.onChange(() => { ... })

// Or use 'on' which is an alias of `onChange`
onClosed$.on(() => { ... })

// Dispatch the event to call listeners
onClosed$.fire()
```

## Notes

### Safety

Modifying an observable can have a large effect such as re-rendering or syncing with a database, so it uses a purposeful `set` rather than simple assignments. This prevents potentially catastrophic mistakes and looks visually different than a variable assignment so that it is clear what is happening.

```javascript
const state$ = observable({ text: "hello", num: 10, obj: {} })

state$.text = "hi"
// ❌ Can't set directly

state$.text.set("hi")
// ✅ Calling set on a primitive works.

state$ = {}
// ❌ Error. This would delete the observable.

state$.obj = {}
// ❌ Error. Cannot assign to objects directly.

state$.set({ text: "hi", num: 20 })
// ✅ Calling set on an object works.

state$.assign({ text: "hello there" })
// ✅ Calling assign on an object works.

state$.text.assign({ value: "hello there" })
// ❌ Error. Cannot call assign on a primitive.
```

If you really want to assign directly to observables, there is an extension to add `$` as a property you can get get/set. See configuration for details.

```javascript
import { enable$get } from "@legendapp/state/config/enable$get"
enable$get()

// Now you can use $ as a shorthand for get()
const testValue = state$.test.$

// Assign to $ as a shorthand for set()
state$.test.$ = "hello"

// Assign objects too just like you can with set()
state$.$ = { test: "hello" }
```

### undefined

Because observables track nodes by path and not the underlying data, an observable points to a path within an object regardless of its actual value. So it is perfectly fine to access observables when they are currently undefined in the object.

You could to do this to set up a listener to a field whenever it becomes available.

```javascript
const state$ = observable({ user: undefined })

when(state$.user.uid, (uid) => {
  // Handle login
})
```

Or you could set a value inside an undefined object, and it will fill out the object tree to make it work.

```javascript
const state$ = observable({ user: undefined })

observe(() => {
  // This will be undefined until the full user profile is set
  console.log(`Name: ${state$.user.profile.name.get()}`)
})

state$.user.profile.name.set("Annyong")

// state$ == { user: { profile: { name: 'Annyong' } } }
```

### Arrays

Observable arrays have all of the normal array functions as you'd expect, but some are modified for observables.

All looping functions set up shallow tracking automatically, as well as provide the observable in the callback. This includes:

* every
* filter
* find
* findIndex
* forEach
* includes
* join
* map
* some

Additionally, `filter` returns an array of observables and `find` returns an observable (or undefined).

If you don't want this extra observable behavior, `get()` or `peek()` the observable to get the raw array to act on.

### Observables are mutable

Legend-State does not use immutability because immutability is slow. It needs to do deep equality checking of changes to know which nodes to notify anyway, so immutability just isn't needed. So there are two things to be careful of.

#### 1. Modifying raw data breaks notifying of changes.

Observables are just wrappers around the underlying data, so if you modify the raw data you're actually modifying the observable data without notifying of changes. Then if you set it back onto the observable, that just sets it to itself so nothing happens.

```javascript
// ❌ This sets it to itself, nothing happens
const value = state$.get()
value.key = 'newValue'
state$.set(value)

// ✅ Set the value directly in the observable
state$.key.set('newValue')

// ✅ Assign the key/value to the observable
state$.assign({ key: 'newValue' })
```

#### 2. Don't need to clone

A common pattern in React is to set state with a clone of the previous value, which is required because of immutability constraints in React. Legend-State does not have that constraint and cloning is bad for performance, so it's better to do operations directly on the observables.

```javascript
// ❌ Setting with a cloned object creates a new object unnecessarily
const record = record$.get()
const newRecord = { ...record, key: 'value' }
record$.set(newRecord)

// ✅ Set the key directly in the observable
record$.key.set('value')
```

```javascript
// ❌ Setting with a cloned array creates a new array unnecessarily
const list = list$.get()
const newList = [ ...list, 'value' ]
list$.set(newList)

// ✅ Just push it
list$.push('value')
```

```javascript
// ❌ Delete by clone and destructure creates a new object unnecessarily
const record = record$.get()
const { key, ...rest } = record
record$.set(rest)

// ✅ Delete the key directly in the observable
record$.key.delete()
```

```javascript
// ❌ Setting a filtered array creates a new array unnecessarily
const list = list$.get()
const newList = list.filter((item) => item.id != itemId)
list$.set(newList)

// ✅ Delete it from the array directly
const list = list$.get()
const idx = list.findIndex((item) => item.id === itemId)
list$[idx].delete()
```