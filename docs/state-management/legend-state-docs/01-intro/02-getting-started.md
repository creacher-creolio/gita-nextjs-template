# Getting Started

This guide will help you get started with Legend-State in a React or React Native App.

## Which Platform?

Select React or React Native to customize this guide for your platform.

### Install Legend-State

```bash
pnpm add @legendapp/state@beta
```

## Quick Start

We'll build a little Todo example app to show what a Legend-State app looks like. It works a bit differently than normal React apps - components re-render themselves when the state they care about changes. And Legend-State includes many helpful components to reduce the amount of boilerplate code you have to write, like components that two-way bind directly to state.

### Create our first observable

First we'll create an observable store for the example. An observable can be a single primitive or a massive tree of all of your state - it's up to you. It can infer its type from the data you initialize it with, or you can type it with an interface if you prefer, which we do in this example.

We'll set up the example with a Record of todos, some computed functions to track counts, and an action function to add a todo. These functions can be within an observable or separate, it doesn't matter, but we will include it all together in this example.

```javascript
import { observable } from "@legendapp/state";

// Type your Store interface
interface Todo {
  id: number;
  text: string;
  completed?: boolean;
}

interface Store {
  todos: Todo[];
  total: number;
  numCompleted: number;
  addTodo: () => void;
}

// Create a global observable for the Todos
let nextId = 0;
const store$ = observable<Store>({
  todos: [],
  // Computeds
  total: (): number => {
    return store$.todos.length;
  },
  numCompleted: (): number => {
    return store$.todos.get().filter((todo) => todo.completed).length;
  },
  addTodo: () => {
    const todo: Todo = {
      id: nextId++,
      text: "",
    };
    store$.todos.push(todo);
  },
});
```

Now that we have an observable for our Todos, let's hook it up to React.

### Observables in React

To consume an observable in React, just `use$` it. This will track it automatically so that the component re-renders whenever it changes.

Legend-State also includes reactive components for both React and React Native. See Reactive components for more about that.

```javascript
import { observer, use$, useObservable } from "@legendapp/state/react"
import { $TextInput } from "@legendapp/state/react-native"

export function App() {
    // Consume the computed observables from the global store$
    const total = use$(store$.total)
    const completed = use$(store$.numCompleted)
    // Create a local observable
    const theme$ = useObservable<'light' | 'dark'>('dark')
    const theme = use$(theme$)

    const onClickClear = () => store$.todos.set([])

    return (
        <Box theme={theme}>
            <ThemeButton $value={theme$} />
            <Text>Total: {total}</Text>
            <Text>Completed: {completed}</Text>
            <For each={store$.todos} item={TodoItem} />
            <View className="flex justify-between">
                <Button onClick={store$.addTodo}>Add</Button>
                <Button onClick={onClickClear}>Clear</Button>
            </View>
        </Box>
    )
}

// Receives item$ prop from the For component
function TodoItem({ item$ }: { item$: Observable<Todo> }) {
    const onKeyDown = (e) => {
        // Call addTodo from the global store$
        if (e.key === 'Enter') store$.addTodo()
    }

    // The child components are bound directly to the observable properties
    // so this component never has to re-render.
    return (
        <View className="row">
            <Checkbox $value={item$.completed} />
            <$TextInput
                $value={item$.text}
                onKeyDown={onKeyDown}
            />
        </View>
    );
}
```

Now that our Todo app is rendering nicely, let's persist its state to storage.

### Persistence

Legend-State has a built-in full-featured sync and persistence layer. In this example we'll show basic persistence and you can read persist and sync for details.

In this example we first set up a global configuration for sync and persistence. These options can also be set or overriden in each individual observable. Since most apps will use the same persistence for everything it's easiest to set that up once in a global configuration.

Then all you have to do is `syncObservable` with the name you want it to have in storage. Any changes made after that will be saved to storage automatically.

```javascript
import { observable } from "@legendapp/state"
import { syncObservable } from '@legendapp/state/sync'
import { ObservablePersistMMKV } from "@legendapp/state/persist-plugins/mmkv"

const store$ = observable<Store>({
    todos: {},
})

// Persist the observable to the named key of the global persist plugin
syncObservable(store$, {
    persist: {
        name: 'gettingStarted',
        plugin: ObservablePersistMMKV
    }
})
```

And that's it! Now we have a full React app that persists its changes.

### Full Example

Now let's put it all together into a live editable example. Feel free to play around in this sandbox on the left and see it running to the right.

```javascript
import { observable, Observable } from "@legendapp/state"
import { configureSynced, synced } from "@legendapp/state/sync"
import { observer, use$, useObservable } from "@legendapp/state/react"
import { $React } from "@legendapp/state/react-web"
import { $TextInput } from "@legendapp/state/react-native"
import { observablePersistAsyncStorage } from
    "@legendapp/state/persist-plugins/async-storage"

interface Todo {
    id: number;
    text: string;
    completed?: boolean;
}

interface Store {
    todos: Todo[];
    total: number;
    numCompleted: number;
    addTodo: () => void;
}

interface TodoItemProps {
    item$: Observable<Todo>;
}

// Setup a configured persist options
const mySynced = configureSynced(synced, {
  persist: {
    plugin: observablePersistAsyncStorage({
      AsyncStorage
    })
  }
})

// Create a global observable for the Todos
let nextId = 0;
const store$ = observable<Store>({
  todos: mySynced({
    initial: [],
    persist: {
      name: 'getting-started'
    },
  }),
  // Computeds
  total: (): number => {
    return store$.todos.length;
  },
  numCompleted: (): number => {
    return store$.todos.get().filter((todo) => todo.completed).length;
  },
  addTodo: () => {
    const todo: Todo = {
      id: nextId++,
      text: "",
    };
    store$.todos.push(todo);
  },
});

// Receives item$ prop from the For component
function TodoItem({ item$ }: TodoItemProps) {
    const onKeyDown = (e) => {
        // Call addTodo from the global store$
        if (e.key === 'Enter') store$.addTodo()
    }

    // The child components are bound directly to the observable properties
    // so this component never has to re-render.
    return (
        <View className="row">
            <Checkbox $value={item$.completed} />
            <$TextInput
                $value={item$.text}
                onKeyDown={onKeyDown}
            />
        </View>
    );
}

function App() {
    const theme$ = useObservable<'light' | 'dark'>('dark')
    const theme = use$(theme$)
    const total = use$(store$.total)
    const completed = use$(store$.numCompleted)

    return (
        <Box theme={theme}>
            <ThemeButton $value={theme$} />
            <Text>Total: {total}</Text>
            <Text>Completed: {completed}</Text>
            <For each={store$.todos} item={TodoItem} />
            <View className="flex justify-between">
                <Button onClick={() => store$.addTodo()}>Add</Button>
                <Button onClick={() => store$.todos.set([])}>Clear</Button>
            </View>
        </Box>
    )
}
```
