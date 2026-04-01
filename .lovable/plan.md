

# Split Policy Execution Priority by Request/Response Pipeline

## Problem
The current Execution Priority section shows all policies in a single flat list. Users can reorder any policy freely, even moving request-only policies above response-only ones — which is invalid. There's no visibility into which policies run in the request pipeline vs. the response pipeline.

## Solution
Replace the single `policyOrder` list with two independent lists: `requestPolicyOrder` and `responsePolicyOrder`. Each pipeline has its own numbered priority and reorder controls. Policies scoped to "Both" appear in both lists independently.

## Changes

### `src/components/MCPGatewayCard.tsx`

**1. Data model** — Update `SavedGateway` interface:
- Replace `policyOrder: string[]` with `requestPolicyOrder: string[]` and `responsePolicyOrder: string[]`
- Add backward compatibility: when loading from localStorage, migrate old `policyOrder` by splitting policies into the two lists based on their scope

**2. State** — Replace `policyOrder` / `setPolicyOrder` with two state pairs:
- `requestPolicyOrder` / `setRequestPolicyOrder`
- `responsePolicyOrder` / `setResponsePolicyOrder`

**3. Toggle handlers** — When a policy is selected/deselected:
- Determine its scope via `getPolicyScope()`
- If Request or Both → add/remove from `requestPolicyOrder`
- If Response or Both → add/remove from `responsePolicyOrder`
- Business policies (always "Request") → only add to `requestPolicyOrder`

**4. Move functions** — Create scoped move helpers:
- `moveRequestPolicyUp/Down` operating on `requestPolicyOrder`
- `moveResponsePolicyUp/Down` operating on `responsePolicyOrder`

**5. Create/Edit handler** — Save both order arrays to the gateway object

**6. Reset form** — Clear both order arrays

**7. Execution Priority UI (create/edit dialog, ~lines 586-630)** — Replace single list with two sections:
```text
Execution Priority

Request Pipeline
  1. PII Detection         [Security] [↑] [↓]
  2. Rate Limiting          [Security] [↑] [↓]
  3. Invoice Validation     [Business] [↑] [↓]

Response Pipeline
  1. PII Detection         [Security] [↑] [↓]
  2. Payload Size           [Security] [↑] [↓]
```
- Each section has independent numbering and reorder arrows
- Scope badges can be removed since the section heading makes scope obvious (or kept for "Both" clarity)
- Show section only if it has policies

**8. Detail dialog (~lines 785-820)** — Same split display for the read-only gateway spec view, showing Request Pipeline and Response Pipeline separately with independent numbering

**9. localStorage migration** — In the gateway loading logic (~line 103), if a gateway has `policyOrder` but no `requestPolicyOrder`, migrate by classifying each policy ID into the appropriate list(s) using `getPolicyScope`

