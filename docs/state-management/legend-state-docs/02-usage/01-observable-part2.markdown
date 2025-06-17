## Computed Observables

### Functions

Observables can have functions anywhere within them. You can use these for whatever you want, such as adding extra behavior when setting.

```javascript
const state$ = observable({
    isReady: false,
    toggle: () => {
        state$.isReady.toggle()
        console.log('set to', state$.isReady.get())
    }
})
```

Note that observing contexts track all observable `get()` calls, including within any called functions. So if a function called from within a `use$` hook calls `get()` that will be tracked too.

```javascript
const state$ = observable({
    fname: 'Annyong',
    lname: 'Bluth',
    fullName: () => state$.fname.get() + ' ' + state$.lname.get()
})

function Name() {
    // Tracks [state$.fname, state$.lname]
    const name = use$(() => state$.fullName())
    return <div>{name}</div>
}
```

### Computed Functions

Any function in an observable can be used a computed observable, whether at the root or in any child. Computed functions are lazy: a function is turned into an observable when you first call `get()` or `peek()` on it. It will then re-compute itself whenever the observables it accesses with `get()` are changed.

```javascript
const state$ = observable({
    fname: 'Annyong',
    lname: 'Bluth',
    // A child is computed
    fullName: () => state$.fname.get() + ' ' + state$.lname.get()
})
// An observable with a function is a computed
const name$ = observable(() => state$.fname.get() + ' ' + state$.lname.get())
```

```javascript
// Calling it like a function returns the value and computes when called.
const fullName = state$.fullName()

// Calling .get() activates it as a computed observable that recomputes itself on changes
const reactiveFullName = state$.fullName.get()
```

A computed function can be used like an observable or as a function.

```javascript
function Name() {
    // Use it as a function
    const name1 = use$(() => state$.fullName())

    // Use it as an observable
    const name2 = use$(state$.fullName)

    return <div>{name2}</div>
}
```

The difference between using it as a function vs. as a computed observable is that a computed observable is an object that caches the value.

* `fullName()` is a function that re-computes whenever you call it.
* `fullName.get()` creates a computed observable that re-computes itself whenever its dependencies change.

## Async Observables

Creating an observable with a Promise or async function will initialize it to `undefined`, and it will be updated with the value of the Promise when it resolves.

```javascript
const serverState$ = observable(() => fetch('url').then(res => res.json()))

observe(() => {
    // Getting the value activates the observable to fetch, and it
    // updates its value when it resolves.
    const data = serverState$.get()
    if (data) {
        ...
    }
})
```

Asynchronous observables can be paired with when to activate the function and resolve when the observable's Promise is resolved.

```javascript
// Await the promise to resolve and then get the data from it
const data = await when(serverState$)
console.log(data)
```

You can access the status of an async observable with the syncState helper, which is an observable itself. The most common usage is to check its loaded or error states:

```javascript
const status$ = syncState(serverState$)
observe(() => {
    // This will re-run as the status changes
    const { isLoaded, error } = status$.get()
    if (error) {
        // Handle error
    } else if (isLoaded) {
        // Do the thing
    }
})
```