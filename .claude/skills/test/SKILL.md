---
name: test
description: Run tests and check code quality (placeholder for future test suite)
disable-model-invocation: true
allowed-tools: Bash(npm run test*), Bash(npm test*), Bash(npx jest*)
---

# Run Tests

Execute the test suite for accra-rentals.

## Current Status

This project does not yet have a test suite configured.

## Recommended Setup

To add tests, install:
```bash
npm install -D jest @testing-library/react @testing-library/jest-dom jest-environment-jsdom @types/jest
```

## Priority Tests to Add

1. **Price Estimation Logic** (`lib/data.ts`)
   - `estimatePrice()` function
   - Edge cases: no data, single listing, outliers

2. **Data Utilities**
   - `getLocationStats()`
   - `calculateConfidence()`

3. **Component Tests**
   - PriceEstimator form submission
   - MarketOverview chart rendering

## For Now

Run type checking and linting as a proxy for tests:
```bash
npx tsc --noEmit && npm run lint
```
