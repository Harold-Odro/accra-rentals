---
name: techdebt
description: Identify technical debt, code duplication, and improvement opportunities in the codebase
allowed-tools: Read, Grep, Glob
---

# Technical Debt Analysis

Analyze the accra-rentals codebase for technical debt and improvement opportunities.

## Areas to Check

### 1. Code Duplication
- Search for repeated patterns across components
- Identify copy-pasted logic that should be extracted
- Look for similar utility functions that could be consolidated

### 2. Type Safety
- Find uses of `any` type
- Identify missing type annotations
- Check for unsafe type assertions

### 3. Component Quality
- Large components (>200 lines) that should be split
- Missing error boundaries
- Prop drilling that could use context
- Components mixing concerns

### 4. Performance Issues
- Missing `useMemo`/`useCallback` for expensive operations
- Large re-renders from poor state management
- Unoptimized images or assets

### 5. Code Smells
- Magic numbers without constants
- Deeply nested conditionals
- Long parameter lists
- Dead code or unused imports

## Focus Areas

Priority directories to analyze:
- `components/` - React components
- `lib/` - Utility functions
- `app/` - Page components

## Output Format

For each issue found, report:
- **File**: Path and line number
- **Severity**: Critical | High | Medium | Low
- **Issue**: What the problem is
- **Impact**: Why it matters
- **Fix**: How to resolve it

## Scope

If `$ARGUMENTS` is provided, focus analysis on that specific file or directory.
Otherwise, analyze the entire codebase.
