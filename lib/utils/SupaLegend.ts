import { observable } from '@legendapp/state'
import { configureSynced } from '@legendapp/state/sync'
import {configureSyncedSupabase, syncedSupabase} from '@legendapp/state/sync-plugins/supabase'
import { ObservablePersistLocalStorage } from '@legendapp/state/persist-plugins/local-storage'
import { createClient } from "@/lib/supabase/client";
import { v4 as uuidv4 } from 'uuid'

const generateId = () => uuidv4();
// we're using next js not expo so we need to use the supabase client
const supabase = createClient()
configureSyncedSupabase({
    generateId,
})

const uid = ''

export const todos$ = observable(
  syncedSupabase({
    supabase,
    collection: 'todos',
    select: (from) => from.select('id,counter,text,done,created_at,updated_at,deleted'),
    actions: ['read', 'create', 'update', 'delete'],
    realtime: true,
    // Persist data and pending changes locally
    persist: {
      name: 'todos',
      plugin: ObservablePersistLocalStorage,
      retrySync: true, // Persist pending changes and retry
    },
    retry: {
      infinite: true, // Retry changes with exponential backoff
    },
    changesSince: 'last-sync',
  })
)


export function addTodo(text: string) {
    const id = generateId()
    todos$[id].assign({
        id,
        text,
        done: false,
    })
}

export function toggleDone(id: string) {
    todos$[id].done.set((prev) => !prev)
}

export function deleteTodo(id: string) {
    todos$[id].delete()
}

export function clearAllTodos() {
    const currentTodos = todos$.get()
    if (currentTodos) {
        Object.keys(currentTodos).forEach(id => {
            todos$[id].delete()
        })
    }
}