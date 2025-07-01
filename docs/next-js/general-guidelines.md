# Next.js Development Guidelines

## Naming Conventions

### Files and Folders

- **General rule**: Use `kebab-case` for all file and folder names
    -- **Pages**: Use `kebab-case` (e.g., `about-us/page.tsx`, `user-profile/page.tsx`)
    -- **Utilities**: Use `kebab-case` (e.g., `date-utils.ts`, `api-helpers.ts`)
    -- **Types**: Use `kebab-case` (e.g., `user-types.ts`, `api-types.ts`)
- **Components**: Use `PascalCase` for component files (e.g., `UserCard.tsx`, `NavigationMenu.tsx`)
- **Hooks**: Use `camelCase` with `use` prefix (e.g., `useAuthState.ts`, `useLocalStorage.ts`)
    -- **Some Hooks**: Use `kebab-case` (e.g., `use-mobile.ts`, which is automatically installed by shadcn in kebab-case and referred to by some of its UI components)

### Functions and Variables

- **Components**: Use `PascalCase` (e.g., `UserProfile`, `NavigationBar`)
- **Functions**: Use `camelCase` (e.g., `handleSubmit`, `fetchUserData`)
- **Variables**: Use `camelCase` (e.g., `userData`, `isLoading`, `hasError`)
- **Constants**: Use `SCREAMING_SNAKE_CASE` (e.g., `API_BASE_URL`, `MAX_RETRY_ATTEMPTS`)
- **Boolean variables**: Use auxiliary verbs (e.g., `isLoading`, `hasError`, `canEdit`, `shouldUpdate`)

### Special Next.js Files

- **Pages**: Always use `page.tsx` for page components
- **Layouts**: Always use `layout.tsx` for layout components
- **Loading**: Use `loading.tsx` for loading UI
- **Error**: Use `error.tsx` for error boundaries
- **Not Found**: Use `not-found.tsx` for 404 pages
- **API Routes**: Use `route.ts` for API endpoints

## Project Structure

### App Router Structure

```md
app/
├── (auth)/                 # Route groups for organization
│   ├── login/
│   │   └── page.tsx
│   └── layout.tsx
├── dashboard/
│   ├── settings/
│   │   └── page.tsx
│   ├── layout.tsx
│   └── page.tsx
├── api/
│   └── users/
│       └── route.ts
├── globals.css
└── layout.tsx
```

## State Management

- Use React hooks for local state
- Use Legend State for global state (as per project setup)
- Prefer server state management for data fetching
- Keep state as close to where it's used as possible

## Code Quality

- Use ESLint and Prettier (follow .prettierrc.js rules)
- Write meaningful comments for complex logic
- Use meaningful variable names (10-30 characters)
- Follow DRY, SOLID, and KISS principles
- Remove unused code and imports

## Development Workflow

- Use `pnpm` for package management
- Use PowerShell for terminal commands on Windows
- Check for type issues after making changes

## Performance Optimization

- Use `next/image` for image optimization
- Implement lazy loading for components
- Use `next/dynamic` for code splitting
- Optimize bundle size with proper imports
- Use Server Components to reduce client-side JavaScript
- Implement proper caching strategies with `revalidate`
