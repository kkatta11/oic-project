

# Default Policies to "Configured" (Inactive) on Creation

## Problem
Both Security and Business policies are created with `active: true`, immediately activating them. Users should explicitly activate policies after creation.

## Changes

### `src/components/SecurityPoliciesCard.tsx`
Change all `active: true` to `active: false` in every policy creation path (~5 locations around lines 1195, 1261, 1293, 1322, 1359).

### `src/components/BusinessPoliciesCard.tsx`
Change `active: true` to `active: false` in the policy creation handler (~line 287).

