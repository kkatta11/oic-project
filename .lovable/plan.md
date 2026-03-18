

# Fix: Gateway Not Showing Project MCP Server Tools

## Root Cause Analysis

Two issues in `src/components/MCPGatewayCard.tsx`:

1. **`getNamespacedTools` uses `fullServer.tools` instead of `fullServer.allTools`** — The Tools Filter dialog lets users select from `allTools`, but when resolving tools in the gateway detail, only `tools` (which can be a subset) is checked. Any tool in `allTools` but not in `tools` won't resolve.

2. **Server matching by `name` is fragile** — Gateway servers are matched to `mcpServers` via `s.name === gwServer.name`. If the project name changes (via Edit dialog) after the gateway was created, the lookup fails and `fullServer` is `null`, so zero tools resolve. The gateway already stores a reference to the original server ID in its `id` field (`active-{ts}-{originalId}`), but it's not used for matching.

## Changes

### `src/components/MCPGatewayCard.tsx`

1. **Add `sourceId` to `GatewayServer` interface** — Store the original MCP server ID when adding a server to a gateway (in both Active tab and Register/Catalog flows).

2. **Fix `getNamespacedTools`** — Match servers by `sourceId` (falling back to name), and iterate `fullServer.allTools || fullServer.tools` instead of just `fullServer.tools`.

3. **Fix gateway detail MCP Servers section** (line 723) — Also match by `sourceId` for consistent resolution.

4. **Update all places that create `GatewayServer` entries** (Active tab ~line 418, Register ~line 204, Catalog ~line 224, Edit restore ~line 286) to include `sourceId`.

