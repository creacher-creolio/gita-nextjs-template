# Project Structure

The basic project structure is as follows:

```md
app/
components/
hooks/
lib/
├── api/
├── contexts/
├── data/
├── state/
├── supabase/
├── tasks/
├── types/
└── utils/
```

This way, we can keep the structure quite clean. Most subfolders can go inside of lib, but when a subfolder in lib gets big (maybe at least 5-6 files or folders in it), then we tend to move that to the root level.

## App

App usually contains a subfolder for auth

## Components

- Components always contains a 'ui' subfolder, which should only contain shadcn components.
- Usually also an auth folder
- Folders in 'app' tend to have a corresponding folder here
- Also usually a global or layout folder will go here for global components that don't apply to just one page

## Lib

- contexts is mostly whole-app wrappers, such as for auth
- data is mostly mock or dummy data for when we haven't connected to apis yet
- state holds global stores, etc,...
- tasks is for tracking the project roadmap and todo checklists. Useful for guiding and working with AI
