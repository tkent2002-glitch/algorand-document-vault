# Development Guide

## Working directory

```powershell
cd C:\Projects\algorand-document-vault
```

## Terminal workflow

- **DEV SERVER**: `npm run dev` only
- **BUILD**: `npm run build` only
- **DEV**: PowerShell scripts, tests, audits, and file operations
- **GIT**: status, commit, and push checkpoints

## Standard milestone

1. Define the purpose and affected trust boundaries.
2. Apply one controlled implementation step.
3. Run `npm test`.
4. Run `npm run build`.
5. Perform runtime verification when behavior changes.
6. Review `git diff`.
7. Commit and push only after verification passes.

## Architecture rule

UI components depend on workflows, repositories, and services. They do not directly manipulate browser persistence or private wallet material.