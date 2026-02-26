

# Policy Priority Ordering and Request/Response Categorization in Gateway

## Overview

Add priority ordering for all selected policies in a gateway, and categorize security policies into "Request" and "Response" groups based on their `appliesTo` config.

## Changes — `src/components/MCPGatewayCard.tsx`

### 1. Update `SavedGateway` interface
- Add `policyOrder: string[]` — ordered array of all policy IDs (security + business) representing execution priority.

### 2. Replace flat policy checkboxes with ordered, categorized lists

**Security Policies section in create/edit dialog:**
- Split active security policies into two sub-sections: **"Request Policies"** and **"Response Policies"**.
- Policies with `config.appliesTo === "request"` or `"both"` appear under Request.
- Policies with `config.appliesTo === "response"` or `"both"` appear under Response.
- Policies without `appliesTo` (e.g., Rate Limiting, Tools Filter) appear under both categories or a general section.
- Each policy still has a checkbox for selection.

**Business Policies section:** Unchanged selection UI.

### 3. Add "Execution Priority" section below policy selection
- Show all selected policies (security + business) in a single ordered list.
- Each row shows: drag handle (or up/down arrow buttons), policy name, type badge ("Security" / "Business"), and scope badge ("Request" / "Response" / "Both").
- Up/down arrow buttons to reorder. The list order defines `policyOrder`.
- Default order: selected security policies first (in selection order), then business policies.

### 4. Persist and restore priority order
- Save `policyOrder` in `SavedGateway` and persist to localStorage.
- On edit, restore order from `policyOrder`. New policies appended at end.

### 5. Update gateway detail dialog
- In "Applied Policies" section, display policies in priority order with numbered priority badges (1, 2, 3...).
- Show scope badge (Request/Response/Both) next to each security policy.

### 6. State management
- Add `policyOrder: string[]` state, updated whenever policies are checked/unchecked.
- On check: append to end. On uncheck: remove from order.
- `handleCreate`: include `policyOrder` in saved gateway.

