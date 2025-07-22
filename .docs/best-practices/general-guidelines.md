# Next.js Development Guidelines

## Code Quality

- Use ESLint and Prettier (follow .prettierrc.js rules)
- Write meaningful comments for complex logic
- Use meaningful variable names (10-30 characters)
- Follow DRY, SOLID, and KISS principles
- Remove unused code and imports

## Performance Optimization

- Use `next/image` for image optimization
- Implement lazy loading for components
- Use `next/dynamic` for code splitting
- Optimize bundle size with proper imports
- Use Server Components to reduce client-side JavaScript
- Implement proper caching strategies with `revalidate`
