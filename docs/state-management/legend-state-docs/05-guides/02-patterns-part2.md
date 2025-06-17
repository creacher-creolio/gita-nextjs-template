# Patterns

This guide covers common patterns and best practices for using Legend-State effectively in your applications.

## Form Handling Patterns

### 1. Simple Form

```javascript
function ContactForm() {
    const form$ = useObservable({
        name: '',
        email: '',
        message: '',
        submitting: false
    })

    const handleSubmit = async (e) => {
        e.preventDefault()

        form$.submitting.set(true)

        try {
            await submitContact(form$.get())
            form$.assign({ name: '', email: '', message: '', submitting: false })
            alert('Message sent!')
        } catch (error) {
            form$.submitting.set(false)
            alert('Failed to send message')
        }
    }

    return (
        <form onSubmit={handleSubmit}>
            <input
                placeholder="Name"
                value={use$(form$.name)}
                onChange={(e) => form$.name.set(e.target.value)}
            />
            <input
                placeholder="Email"
                value={use$(form$.email)}
                onChange={(e) => form$.email.set(e.target.value)}
            />
            <textarea
                placeholder="Message"
                value={use$(form$.message)}
                onChange={(e) => form$.message.set(e.target.value)}
            />
            <button type="submit" disabled={use$(form$.submitting)}>
                {use$(form$.submitting) ? 'Sending...' : 'Send'}
            </button>
        </form>
    )
}
```

### 2. Form with Validation

```javascript
function UserForm() {
    const form$ = useObservable({
        data: {
            name: '',
            email: '',
            age: ''
        },
        errors: {},
        touched: {},
        submitting: false
    })

    const validate = (field, value) => {
        const errors = {}

        switch (field) {
            case 'name':
                if (!value.trim()) errors.name = 'Name is required'
                break
            case 'email':
                if (!value.includes('@')) errors.email = 'Invalid email'
                break
            case 'age':
                if (isNaN(value) || value < 18) errors.age = 'Must be 18 or older'
                break
        }

        form$.errors.assign(errors)
    }

    const handleFieldChange = (field, value) => {
        form$.data[field].set(value)
        form$.touched[field].set(true)
        validate(field, value)
    }

    return (
        <form>
            <div>
                <input
                    placeholder="Name"
                    value={use$(form$.data.name)}
                    onChange={(e) => handleFieldChange('name', e.target.value)}
                />
                <Show if={form$.errors.name}>
                    <span className="error"><Memo>{form$.errors.name}</Memo></span>
                </Show>
            </div>

            <div>
                <input
                    placeholder="Email"
                    value={use$(form$.data.email)}
                    onChange={(e) => handleFieldChange('email', e.target.value)}
                />
                <Show if={form$.errors.email}>
                    <span className="error"><Memo>{form$.errors.email}</Memo></span>
                </Show>
            </div>

            <div>
                <input
                    placeholder="Age"
                    value={use$(form$.data.age)}
                    onChange={(e) => handleFieldChange('age', e.target.value)}
                />
                <Show if={form$.errors.age}>
                    <span className="error"><Memo>{form$.errors.age}</Memo></span>
                </Show>
            </div>
        </form>
    )
}
```

## List Management Patterns

### 1. CRUD Operations

```javascript
const todos$ = observable({
    items: {},
    filter: 'all', // all, active, completed
    newTodo: ''
})

const todoActions = {
    add: (text) => {
        const id = Date.now().toString()
        todos$.items[id].set({
            id,
            text,
            completed: false,
            createdAt: new Date()
        })
        todos$.newTodo.set('')
    },

    toggle: (id) => {
        todos$.items[id].completed.set(prev => !prev)
    },

    remove: (id) => {
        todos$.items[id].delete()
    },

    updateText: (id, text) => {
        todos$.items[id].text.set(text)
    },

    clearCompleted: () => {
        const items = todos$.items.get()
        Object.keys(items).forEach(id => {
            if (items[id].completed) {
                todos$.items[id].delete()
            }
        })
    }
}

// Computed values
const filteredTodos$ = observable(() => {
    const items = todos$.items.get()
    const filter = todos$.filter.get()

    return Object.values(items).filter(todo => {
        switch (filter) {
            case 'active': return !todo.completed
            case 'completed': return todo.completed
            default: return true
        }
    })
})
```

### 2. Optimistic Updates

```javascript
const posts$ = observable({
    items: {},
    creating: false
})

const createPost = async (postData) => {
    const tempId = `temp-${Date.now()}`

    // Optimistic update
    posts$.items[tempId].set({
        ...postData,
        id: tempId,
        pending: true,
        createdAt: new Date()
    })

    try {
        const response = await fetch('/api/posts', {
            method: 'POST',
            body: JSON.stringify(postData)
        })
        const savedPost = await response.json()

        // Replace temp post with real post
        posts$.items[tempId].delete()
        posts$.items[savedPost.id].set(savedPost)

    } catch (error) {
        // Remove failed post
        posts$.items[tempId].delete()
        alert('Failed to create post')
    }
}
```