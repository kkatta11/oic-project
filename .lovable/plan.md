

# Revert Tools Filter to Single-Server-Per-Policy Model

## Problem
The current Tools Filter shows all MCP servers' tools in one consolidated list. The user wants each Tools Filter policy to target a single MCP server, requiring users to create separate policies per server.

## Changes

### `src/components/SecurityPoliciesCard.tsx`

**1. Add server selector state** — Add `toolsFilterServerId` state to track the selected MCP server.

**2. Update dialog UI** — Replace the multi-server expandable list with:
- A "Tool Source" dropdown (`Select`) listing active MCP servers
- Once a server is selected, show that server's tools as checkboxes
- Keep the policy name input

**3. Simplify state** — Replace `toolsFilterSelections: Record<string, Set<string>>` with a simple `toolsFilterIncludedTools: Set<string>` since only one server's tools are relevant at a time.

**4. Update save handler** — `handleToolsFilterSave` saves config as `{ serverId, serverName, includedTools[] }` (single server, no `servers` array).

**5. Update edit handler** — When editing, populate `toolsFilterServerId` and `toolsFilterIncludedTools` from the stored config. Handle backward compat: if config has `servers` array (from the multi-server format), take the first entry.

**6. Update summary** — `getConfigSummary` for t9: show "Includes N tools from {serverName}" instead of "across N servers".

**7. Update toggle helpers** — Replace `toggleIncludedTool(serverId, toolId)` and `toggleAllServerTools` with simpler versions that operate on the single included tools set.

### `src/components/MCPGatewayCard.tsx`

**8. Update tool resolution** — `getNamespacedTools` reads `config.includedTools` directly (single array). Add fallback: if `config.servers` exists (legacy multi-server), flatten all server tools.

