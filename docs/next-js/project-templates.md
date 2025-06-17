# Project Templates

## Next.js w/ Shadcn/UI

1. pnpm dlx shadcn@latest init -d
2. move app and lib folders to src folder
   a. mkdir src
   b. mv app src/
   c. mv lib src/
3. git branch -m master main
4. add essential files from template
    - overrides.react-is needs to match react version
5. run lint and format commands
   a. pnpm run polish
6. pnpm install
7. (optional) install all shadcn components:
    - pnpm dlx shadcn@latest add
      -o: override existing components
      -a: add all components
    - pnpm dlx shadcn@latest add accordion alert alert-dialog aspect-ratio avatar badge breadcrumb button calendar card carousel chart checkbox collapsible command context-menu dialog drawer dropdown-menu form hover-card input input-otp label menubar navigation-menu pagination popover progress radio-group resizable scroll-area select separator sheet sidebar skeleton slider sonner switch table tabs textarea toggle toggle-group tooltip
8. run lint and format commands
   a. pnpm run lint:fix
   b. pnpm run format
9. pnpm run dev
