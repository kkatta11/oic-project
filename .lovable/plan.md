
# Auto-Select Tool Filter Policies in Gateway Creation

## Problem
When creating a gateway, tool filter security policies (auto-generated from MCP server configurations) are not pre-selected. Users could accidentally expose blocked tools to the gateway by not selecting them.

## Solution

### 1. Auto-select tool filter policies when servers are added

In `src/components/MCPGatewayCard.tsx`:

- When a server is added to the gateway (via Active Servers tab, Register New, or Catalog), automatically check any corresponding tool filter security policy (identified by `templateId` starting with `auto-tool-filter-{serverId}`)
- Also pre-select all tool filter policies when the dialog initially opens with servers already added

### 2. Warning on uncheck

- When a user unchecks a security policy whose `templateId` starts with `auto-tool-filter-`, show a confirmation dialog (using AlertDialog) warning: "Removing this tool filter policy will expose unselected tools to the gateway. Are you sure?"
- If confirmed, uncheck proceeds. If cancelled, the checkbox stays checked.

---

## Technical Details

### File: `src/components/MCPGatewayCard.tsx`

**Auto-select logic:**
- Modify the server-add handlers (active server add button, `handleAddRegisteredServer`, `handleCatalogConfirm`) to also add matching tool filter policy IDs to `selectedSecurityPolicies`
- Match by checking `activeSecurityPolicies` for policies where `templateId` starts with `auto-tool-filter-` and the server ID portion matches the added server

**Warning on uncheck:**
- Add state for a confirmation alert: `warnFilterPolicyId` (string or null)
- In `toggleSecurityPolicy`, if the policy being unchecked has a `templateId` starting with `auto-tool-filter-`, set `warnFilterPolicyId` instead of immediately unchecking
- Render an `AlertDialog` that warns about tool exposure and provides Confirm/Cancel actions
- On confirm: remove the policy from `selectedSecurityPolicies`; on cancel: clear `warnFilterPolicyId`

**Matching logic:**
- For each server added, find its corresponding `MCPServer` from props to get the server ID
- Look for a security policy with `templateId === "auto-tool-filter-{serverId}"`
- If found and active, auto-add its `id` to `selectedSecurityPolicies`
