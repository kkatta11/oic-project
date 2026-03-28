

# Default New MCP Servers to "Configured" State

## Problem
When users add MCP servers (via Register or Catalog), they are immediately set to "Active". They should default to "Configured" and require explicit activation — except for the auto-created project MCP server (enabled via Edit dialog), which should remain "Active".

## Changes

### `src/components/MCPServersCard.tsx`
1. **Catalog flow** (~line 246): Change `status: "Active"` to `status: "Configured"` when adding a server from the community catalog.
2. **Register flow** (~line 212): Already uses `status: "Configured"` — no change needed.

### `src/pages/Index.tsx`
No changes needed — the project-enabled MCP server (~lines 94, 159) correctly uses `status: "Active"` since it's explicitly enabled by the user in the Edit dialog.

### `src/data/projectsData.ts`
Check default server definitions for any that should also default to "Configured" instead of "Active".

