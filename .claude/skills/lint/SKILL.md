---
name: lint
description: Run ESLint and TypeScript checks on the codebase
disable-model-invocation: true
allowed-tools: Bash(npm run lint*), Bash(npx eslint*), Bash(npx tsc*)
---

# Lint & Type Check

Run code quality checks on accra-rentals:

## Steps

1. **ESLint**: Run `npm run lint`
2. **TypeScript**: Run `npx tsc --noEmit`

## On Errors

For each error found:
- Show file path and line number
- Show the error message
- Provide a suggested fix

## On Success

Report that all checks passed with no errors or warnings.
