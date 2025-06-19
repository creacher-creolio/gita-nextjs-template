"use client";

import { useState } from "react";
import { observer, use$ } from "@legendapp/state/react";
import { addTodo, todos$ as _todos$, toggleDone, clearAllTodos, deleteTodo } from "@/lib/utils/SupaLegend";
import { Tables } from "@/lib/types/supabase";
import { CheckSquare, Plus, X } from "lucide-react";

// Emojis to decorate each todo.
const NOT_DONE_ICON = String.fromCodePoint(0x1f7e0);
const DONE_ICON = String.fromCodePoint(0x2705);

// The text input component to add a new todo.
const NewTodo = () => {
    const [text, setText] = useState("");

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && text.trim()) {
            setText("");
            addTodo(text.trim());
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (text.trim()) {
            setText("");
            addTodo(text.trim());
        }
    };

    return (
        <form onSubmit={handleSubmit} className="w-full">
            <input
                type="text"
                value={text}
                onChange={e => setText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="What do you want to do today?"
                className="h-16 w-full rounded-lg border-2 border-gray-300 px-4 text-xl focus:border-blue-500 focus:outline-none"
            />
        </form>
    );
};

// A single todo component, either 'not done' or 'done': press to toggle.
const Todo = ({ todo }: { todo: Tables<"todos"> }) => {
    const handleToggle = () => {
        toggleDone(todo.id);
    };

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent toggle when clicking delete
        deleteTodo(todo.id);
    };

    return (
        <div
            className={`mb-4 flex w-full items-center justify-between rounded-lg p-4 transition-colors ${
                todo.done ? "bg-green-100 text-green-800" : "bg-yellow-50 text-gray-800"
            }`}>
            <button onClick={handleToggle} className="flex-1 text-left text-xl transition-opacity hover:opacity-80">
                {todo.done ? DONE_ICON : NOT_DONE_ICON} {todo.text}
            </button>
            <button
                onClick={handleDelete}
                className="ml-4 rounded-full p-2 text-red-500 transition-colors hover:bg-red-50 hover:text-red-700"
                title="Delete todo">
                <X className="h-5 w-5" />
            </button>
        </div>
    );
};

// A list component to show all the todos.
const Todos = observer(({ todos$ }: { todos$: typeof _todos$ }) => {
    // Get the todos from the state and subscribe to updates
    const todos = todos$.get();

    if (!todos || Object.keys(todos).length === 0) {
        return (
            <div className="flex items-center justify-center py-8">
                <p className="text-lg text-gray-500">No todos yet. Add one above!</p>
            </div>
        );
    }

    return (
        <div className="flex-1 space-y-2">
            {Object.values(todos).map(todo => (
                <Todo key={todo.id} todo={todo} />
            ))}
        </div>
    );
});

// A button component to delete all the todos, only shows when there are some.
const ClearTodos = observer(() => {
    const todos = use$(_todos$);
    const todosArray = todos ? Object.values(todos) : [];

    const handleClick = () => {
        if (window.confirm("Are you sure you want to clear all todos?")) {
            clearAllTodos();
        }
    };

    return todosArray.length > 0 ? (
        <button
            onClick={handleClick}
            className="w-full py-3 text-center text-lg text-red-600 transition-colors hover:text-red-800">
            Clear all
        </button>
    ) : null;
});

// The main app component.
export default observer(function TodosPage() {
    return (
        <div className="mx-auto min-h-screen max-w-2xl bg-white p-4">
            <div className="flex flex-col gap-6">
                {/* Header */}
                <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-3">
                        <CheckSquare className="h-8 w-8 text-blue-600" />
                        <h1 className="text-center text-3xl font-bold">Legend-State Example</h1>
                    </div>
                    <p className="text-center text-gray-600">A powerful todo app with Legend-State and Supabase</p>
                </div>

                {/* Add Todo Form */}
                <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                    <div className="mb-4 flex items-center gap-2">
                        <Plus className="h-5 w-5 text-gray-600" />
                        <h2 className="text-lg font-semibold">Add New Todo</h2>
                    </div>
                    <NewTodo />
                </div>

                {/* Todo List */}
                <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                    <h2 className="mb-4 text-lg font-semibold">Your Tasks</h2>
                    <Todos todos$={_todos$} />
                </div>

                {/* Clear Button */}
                <ClearTodos />
            </div>
        </div>
    );
});
