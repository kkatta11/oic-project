# Add Action Field to Business Policies

## Overview

When a business policy's conditions evaluate to true, the gateway needs to know what to do. This adds an **action** selector to each business policy, letting the user choose what happens when conditions match.

## Actions

The following actions will be available:


| Action              | Description                                                           |
| ------------------- | --------------------------------------------------------------------- |
| **Block**           | Reject the request with an error; do not forward to the origin server |
| **Log Warning**     | Allow the request but log a warning entry in the audit trail          |
| &nbsp;              | &nbsp;                                                                |
| **Flag for Review** | Allow the request but mark it for post-execution review               |
| **Notify Admin**    | Allow the request but send an alert notification to administrators    |
| &nbsp;              | &nbsp;                                                                |


## Changes

### 1. Data Model (`BusinessPolicy` interface)

Add an `action` field:

```typescript
export interface BusinessPolicy {
  id: string;
  name: string;
  active: boolean;
  selectedTools: string[];
  conditions: PolicyCondition[];
  action: string; // "block" | "log_warning" | "require_approval" | "flag_review" | "notify_admin" | "throttle"
}
```

### 2. Action Options Constant

Define an `actions` array similar to the existing `operators` array:

```typescript
const actions = [
  { value: "block", label: "Block Request" },
  { value: "log_warning", label: "Log Warning" },
  { value: "notify_admin", label: "Notify Admin" },
];
```

### 3. Create and Edit Dialogs

Add an **Action** `Select` dropdown after the conditions section in both the Create and Edit dialogs. Default value: `"block"`.

### 4. Form State

- Add `selectedAction` state variable, defaulting to `"block"`
- Include in `resetForm`
- Populate from policy in `openEdit`
- Include in `handleCreate` and `handleSaveEdit`

### 5. Policy Row Display

Update the summary line to include the action label, e.g.:

```
2 tools · 3 conditions · Block Request
```

### 6. Popover Detail View

Show the configured action in the detail popover alongside tools and conditions.

### 7. Migration

Existing policies without an `action` field default to `"block"` via fallback: `policy.action || "block"`.

---

## Technical Details

### File: `src/components/BusinessPoliciesCard.tsx`


| Area                       | Change                                             |
| -------------------------- | -------------------------------------------------- |
| `BusinessPolicy` interface | Add `action: string`                               |
| New constant `actions`     | Array of action options                            |
| New state `selectedAction` | Tracks selected action in form, default `"block"`  |
| `resetForm`                | Reset `selectedAction` to `"block"`                |
| `openEdit`                 | Set `selectedAction` from `policy.action`          |
| `handleCreate`             | Include `action: selectedAction` in new policy     |
| `handleSaveEdit`           | Include `action: selectedAction` in updated policy |
| Create dialog              | Add Action Select dropdown after conditions        |
| Edit dialog                | Add Action Select dropdown after conditions        |
| Policy row summary         | Append action label                                |
| Popover detail             | Show action under a "When matched" heading         |
