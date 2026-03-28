

# MCP Gateway: Three-State Status (Draft / Configured / Active)

## Problem
Gateways currently use a boolean `active` field producing only "Active" or "Inactive" states. The user wants three states:
- **Draft** — no MCP servers assigned to the gateway
- **Configured** — servers assigned but not yet activated
- **Active** — explicitly activated by user

"Inactive" state should be removed entirely.

## Changes

### `src/components/MCPGatewayCard.tsx`

1. **Add a status helper function** that derives the display status from gateway data:
   - If `active === true` → "Active"
   - Else if `servers.length === 0` → "Draft"
   - Else → "Configured"

2. **Update badge styling** (lines ~831-832 and ~703-704) to use the three-state logic with appropriate colors:
   - Active: green (existing)
   - Configured: olive (existing secondary color)
   - Draft: a muted/gray style

3. **Update detail dialog** (line ~704): Replace `"Inactive"` label with the derived status.

4. **Update dropdown action label** (line ~846): Change `"Deactivate"` to show "Deactivate" only when active; when not active, show "Activate". Keep this logic as-is since it still toggles `active` boolean. When deactivating, gateway returns to Configured/Draft based on server count.

5. **Remove "Inactive" text** from all display locations — replaced by the derived status.

