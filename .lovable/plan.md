

# Add Request/Response Scope to Applicable Security Policies

## Overview

Some security policies can logically apply to the inbound request, the outbound response, or both. This change adds an "Applies To" selector to the three policies where scope matters, letting admins control exactly where enforcement runs.

## Affected Policies

| Policy | Why scope matters | Default |
|--------|-------------------|---------|
| **PII Detection** (t1) | PII can appear in request payloads (user-submitted data) or response payloads (data returned from origin) | Both |
| **Payload Size** (t6) | Already has separate size limits for request and response; an explicit scope toggle makes it clear which direction is enforced | Both |
| **Encryption** (t8) | Primarily targets response data but may also apply to encrypting request payloads in transit | Response |

The remaining five policies (Schema Validation, Tool Poisoning, Intrusion Detection, Rate Limiting, SQL Injection) are inherently request-scoped and do not need this selector.

## Changes

### 1. Add "Applies To" config field to three schemas

Add a new `select` field with key `"appliesTo"` to the `policyConfigSchemas` for t1, t6, and t8:

Options:
- `request` -- Request Only
- `response` -- Response Only
- `both` -- Both

### 2. Schema updates

**t1 (PII Detection)** -- insert `appliesTo` field (default: `"both"`) as the first field in the schema, before Action.

**t6 (Payload Size)** -- insert `appliesTo` field (default: `"both"`) as the first field.

**t8 (Encryption)** -- insert `appliesTo` field (default: `"response"`) as the first field.

### 3. Config summary display

Update `getConfigSummary` output to include the scope label when present, e.g.:

```
Applies To: Both · Action: Block · Sensitivity: High
```

### 4. Migration

Existing saved policies without `appliesTo` in their config will use the default value from the schema (handled automatically by `getDefaultConfig` fallback already in `loadPolicies`).

---

## Technical Details

### File: `src/components/SecurityPoliciesCard.tsx`

| Area | Change |
|------|--------|
| `policyConfigSchemas.t1` | Prepend `appliesTo` field with options request/response/both, default `"both"` |
| `policyConfigSchemas.t6` | Prepend `appliesTo` field, default `"both"` |
| `policyConfigSchemas.t8` | Prepend `appliesTo` field, default `"response"` |

The `appliesTo` field definition (reused across three schemas):

```typescript
{
  key: "appliesTo",
  label: "Applies To",
  type: "select",
  options: [
    { value: "request", label: "Request Only" },
    { value: "response", label: "Response Only" },
    { value: "both", label: "Both" },
  ],
  default: "both" // or "response" for t8
}
```

No other files require changes. The existing config dialog, summary renderer, and persistence logic already handle any fields defined in the schema dynamically.
