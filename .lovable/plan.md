

# Fix Policy Scope Display in Gateway

## Problem
- `getPolicyScope` defaults to `"Both"` when no `appliesTo` is configured — should default to `"Request"`.
- Business policies hard-coded as `"Both"` — should always be `"Request"`.

## Changes — `src/components/MCPGatewayCard.tsx`

### 1. Update `getPolicyScope` default
Change the fallback from `"Both"` to `"Request"` (line 89).

### 2. Update `lookupPolicy` for business policies
Change business policy scope from `"Both"` to `"Request"` (line 337).

### 3. Update categorization filter
Remove business policies or unconfigured security policies from the response category since they now default to Request-only.

