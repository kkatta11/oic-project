

# Stop Adding MCP Tools to Agent Tools Card; Auto-Create Filter Policy Instead

## Overview

Currently, when an MCP server is connected, its selected tools appear in the Agent tab's Tools card. The new behavior:

1. **Remove** the MCP Server Tools section from the Agent Tools card entirely
2. **Store all available tools** on the MCP server, along with which ones the user selected
3. **Auto-create a security policy** (e.g., "Tool Filter: Filesystem MCP Server") that explicitly blocks the unselected tools

This way, the gateway controls tool access through policies rather than the Agent tools list.

---

## Changes

### 1. MCPServersCard.tsx -- Track all tools + selected subset

- Add a new field `allTools: MCPServerTool[]` to `MCPServer` interface to hold every tool discovered from the endpoint
- `tools` continues to hold only the user-selected tools (for gateway metadata display)
- When registering or connecting a server, store both `allTools` (full catalog) and `tools` (selected subset)
- When editing, same behavior: `allTools` stays constant, `tools` reflects current selection

### 2. SecurityPoliciesCard.tsx -- Support auto-generated policies

- Add a new helper export `createToolFilterPolicy(serverName: string, blockedToolNames: string[]): SecurityPolicy` that creates a policy object
- Auto-generated policies will have a special `templateId` prefix (e.g., `auto-tool-filter-{serverId}`) so they can be identified and updated
- The policy name will be "Tool Filter: {ServerName}" with a description listing the blocked tools
- These policies are active by default

### 3. MCPServersCard.tsx -- Auto-create/update filter policies on server save

- Accept `securityPolicies` and `onPoliciesChange` as new props
- After registering, connecting, or editing a server:
  - Compute unselected tools (allTools minus selected)
  - If there are unselected tools, create or update a "Tool Filter: {ServerName}" security policy
  - If all tools are selected, remove the auto-generated policy (no filtering needed)
- On server delete, also remove the corresponding auto-generated policy

### 4. ToolsCard.tsx -- Remove MCP tools section

- Remove the `mcpServers` prop
- Remove the "MCP Server Tools" section that renders namespaced server tools
- Keep only the native agent tools (Risk Assessment, Invoice Extraction, etc.)

### 5. Index.tsx -- Wire up new props

- Stop passing `mcpServers` to `ToolsCard`
- Pass `securityPolicies` and `onPoliciesChange` (i.e., `setSecurityPolicies`) to `MCPServersCard` so it can auto-manage filter policies

---

## Technical Details

### Updated MCPServer Interface

```typescript
export interface MCPServer {
  id: string;
  name: string;
  status: "Active" | "Configured";
  icon: LucideIcon;
  tools: MCPServerTool[];       // selected tools only
  allTools: MCPServerTool[];    // all discovered tools (NEW)
  url?: string;
  transport?: string;
  auth?: string;
}
```

### Auto-Generated Security Policy Example

When a user connects "Filesystem MCP Server" and selects only "List Files" and "Read File" (leaving out "Write File" and "Delete File"):

```
Policy Name: "Tool Filter: Filesystem MCP Server"
Description: "Blocks: Write File, Delete File"
templateId: "auto-tool-filter-1"  (tied to server id)
active: true
```

### Files Modified

| File | Change |
|------|--------|
| `src/components/MCPServersCard.tsx` | Add `allTools` field, accept policy props, auto-create/update/remove filter policies on register/connect/edit/delete |
| `src/components/SecurityPoliciesCard.tsx` | Export helper to create auto-filter policy objects |
| `src/components/ToolsCard.tsx` | Remove `mcpServers` prop and MCP tools section |
| `src/pages/Index.tsx` | Remove `mcpServers` from ToolsCard, pass policy state to MCPServersCard |

