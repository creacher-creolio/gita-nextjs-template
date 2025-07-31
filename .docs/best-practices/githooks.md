# Githooks

## Setup

Configure git to use custom hooks directory:

```bash
git config core.hooksPath .githooks
```

To disable custom hooks:

```bash
git config --unset core.hooksPath
```

## Pre-Push Hook

The pre-push hook automatically runs the `polish` command before each push:

- Runs `next lint --fix` to fix linting issues
- Runs `prettier --write` to format code
- Prevents push if any issues can't be automatically fixed

### Windows Setup

On Windows, you may need to make the hook executable:

```powershell
# Make the shell script executable (if using Git Bash)
chmod +x .githooks/pre-push

# Or use the PowerShell version directly
# Git will automatically use .githooks/pre-push.ps1 on Windows
```

### Manual Polish

You can also run the polish command manually:

```bash
pnpm run polish
```
