

# Save & Reactivate Dependent Gateways

## Problem
When an MCP server's metadata changes (e.g., tools refreshed) or a security/business policy configuration is updated and activated, the gateways using those resources are unaware. Users have no visibility into which gateways depend on the changed resource and no way to reactivate them to pick up the changes.

## Solution
Add a "Save & Reactivate" dialog (inspired by the screenshot) that appears after activating or saving changes to an MCP server or policy. The dialog shows dependent gateways split into **Active gateways** and **Inactive gateways** (Draft/Configured) tabs, letting users selectively reactivate active gateways to apply the updated configuration.

## Changes

### 1. Gateway dependency lookup utility

Create a shared helper (inside `MCPGatewayCard.tsx` or a new small util) that reads gateways from localStorage and finds which gateways reference a given server ID or policy ID:

```typescript
function findDependentGateways(projectId: string, resourceId: string, resourceType: 'server' | 'policy'): SavedGateway[]
```

Since gateways are stored in localStorage (`mcp-gateways-{projectId}`), this function reads and filters them. Export the `SavedGateway` interface from MCPGatewayCard.

### 2. Reactivate dialog component

Create a reusable `ReactivateGatewaysDialog` component that:
- Accepts: `open`, `onOpenChange`, `resourceName` (what changed), `projectId`
- On open, reads dependent gateways and splits into Active vs Inactive (Draft/Configured)
- Displays an info banner: "There are unsaved changes. Click save & reactivate if you want to apply the changes to active gateways."
- Shows two tabs: **Active gateways (N)** and **Inactive gateways (N)**
- Each tab lists gateway name + status badge
- Footer buttons: **Close**, **Save**, **Save & reactivate**
  - **Save**: just closes (changes already saved)
  - **Save & reactivate**: triggers a "reactivation" timestamp update on all active dependent gateways in localStorage (simulating a redeploy)

### 3. Integrate into MCPServersCard

After these actions trigger the dialog:
- **Activate** (status toggle to Active)
- **Refresh Metadata** (tools re-fetched)
- **Edit Save** (server details changed)

Pass `projectId` prop to MCPServersCard (currently not passed — add it in Index.tsx).

### 4. Integrate into SecurityPoliciesCard

After these actions:
- **Activate** (toggleActive)
- **Edit/Save** policy configuration

Show the dialog with dependent gateways that reference the changed policy ID.

### 5. Integrate into BusinessPoliciesCard

Same pattern as SecurityPoliciesCard — after activate or edit/save, show dependent gateways.

### 6. Update Index.tsx

Pass `projectId` to `MCPServersCard` (it's already passed to the others).

## UI Layout (Reactivate Dialog)

```text
Save & reactivate
{Resource Name}
─────────────────────────────────────
ⓘ There are unsaved changes. Click save &
  reactivate if you want to apply the changes
  to active gateways.

Active gateways (1)    Inactive gateways (1)
─────────────────────────────────────
🔍
🛡 Invoice Validation Gateway    Active

                [Close] [Save] [Save & reactivate]
```

## Files Modified
- `src/components/MCPGatewayCard.tsx` — Export `SavedGateway` interface and gateway storage key helper
- `src/components/ReactivateGatewaysDialog.tsx` — New reusable dialog component
- `src/components/MCPServersCard.tsx` — Add `projectId` prop, show reactivate dialog after activate/edit/refresh
- `src/components/SecurityPoliciesCard.tsx` — Show reactivate dialog after activate/edit
- `src/components/BusinessPoliciesCard.tsx` — Show reactivate dialog after activate/edit
- `src/pages/Index.tsx` — Pass `projectId` to MCPServersCard

