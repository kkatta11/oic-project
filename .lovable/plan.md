

# Unified Tools Filter: Multi-Server Tool Selection

## Problem
Currently, each Tools Filter policy requires selecting a single MCP server as the "Tool Source", then picking tools from only that server. To cover tools across multiple servers, users must create separate Tools Filter policies per server. This is cumbersome and hard to manage.

## Solution
Replace the single-server selector with a multi-server tools view that shows all active MCP servers and their tools in one policy. Users can pick tools from any/all servers in a single Tools Filter instance. Multiple Tools Filter instances are still supported for use with different gateways.

## Changes

### `src/components/SecurityPoliciesCard.tsx`

**1. Update data model** — Change Tools Filter config from `{ serverId, serverName, includedTools[] }` to `{ servers: [{ serverId, serverName, includedTools[] }] }`. This stores per-server tool selections in a single policy.

**2. Replace state management** — Remove `toolsFilterServerId` single-server state. Add a `toolsFilterSelections` state of type `Map<serverId, Set<toolId>>` to track included tools per server.

**3. Redesign dialog UI** — Replace the "Tool Source" dropdown with an expandable list of all active MCP servers. Each server section shows:
   - Server name header with a "Select All" checkbox and tool count
   - Collapsible list of tools with individual checkboxes
   - Format: grouped by server, all in one scrollable view

**4. Update save handler** — `handleToolsFilterSave` serializes the map into the new config format. Description summarizes total included tools across all servers.

**5. Update edit handler** — When editing, reconstruct the selections map from the stored config.

**6. Update summary** — `getConfigSummary` for t9 shows total tools across all servers (e.g., "Includes: 8 tools across 3 servers").

**7. Backward compatibility** — When loading a policy with old `serverId`/`includedTools` format (no `servers` array), migrate it to the new `servers: [{ serverId, serverName, includedTools }]` format.

### `src/components/MCPGatewayCard.tsx`

**8. Update tool resolution** — `getNamespacedTools` already collects `includedToolIds` from all t9 policies. Update it to read from `config.servers[].includedTools` (with fallback to old `config.includedTools` for backward compat).

## UI Layout (Tools Filter Dialog)

```text
Add Tools Filter
─────────────────────────────
Policy Name: [Tools Filter          ]

Include Tools
┌─────────────────────────────────┐
│ [✓] Jira MCP Server (3/5)       │
│   [✓] Create Issue              │
│   [✓] Search Issues             │
│   [ ] Delete Issue              │
│   [✓] Update Issue              │
│   [ ] List Projects             │
│                                 │
│ [─] Slack MCP Server (1/3)      │
│   [ ] Send Message              │
│   [✓] List Channels             │
│   [ ] Upload File               │
└─────────────────────────────────┘

              [Cancel] [Add Policy]
```

