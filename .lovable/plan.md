

# Add Native Tools to Tools Filter Security Policy

## Overview

Add "Native Tools" as a selectable option in the Tools Filter policy dialog alongside MCP servers, allowing users to exclude native tools (from the Agent tab's Tools card).

## Changes

### 1. `src/components/ToolsCard.tsx`

- Export the `nativeTools` array so it can be imported by SecurityPoliciesCard.

### 2. `src/components/SecurityPoliciesCard.tsx`

**Server dropdown — add "Native Tools" entry:**

- Add a synthetic "native-tools" option to the server `<Select>` dropdown, labeled "Native Tools", appearing before the active MCP servers.

**Tool list resolution — handle native tools:**

- When `toolsFilterServerId === "native-tools"`, populate `serverTools` from the exported `nativeTools` array (map to `MCPServerTool` shape: `{ id, name, description: "" }`).

**Save handler — handle native tools:**

- When saving with `serverId: "native-tools"`, set `serverName: "Native Tools"` in the config.
- The `excludedTools` array will contain native tool IDs (e.g., "1", "2", etc.).

**Edit handler — handle native tools:**

- When editing a Tools Filter policy with `config.serverId === "native-tools"`, pre-populate correctly from the native tools list.

### Result

The Tools Filter dialog dropdown shows:
- **Native Tools** (always available, no "Active" status requirement)
- Active MCP Servers (existing behavior)

Users can exclude native tools the same way they exclude MCP server tools.

