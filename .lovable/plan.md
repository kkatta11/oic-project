

# Edit MCP Server and Gateway Endpoint Metadata

## Overview

Two features to implement:
1. Make the "..." (MoreHorizontal) button on each MCP server row open an Edit dialog where users can modify server name, URL, transport, auth, status, and tool selection.
2. Add a Gateway Endpoint Metadata view when clicking on a gateway row, showing MCP server specification details and a consolidated list of all tools with proper server-namespaced prefixes.

---

## 1. Edit MCP Server

### Current State
The "..." button on each MCP server row renders but has no onClick handler or dialog attached.

### New Behavior
Clicking "..." opens an **Edit MCP Server** dialog pre-populated with the server's current configuration:
- **Server Name** (editable input)
- **URL** (editable input -- new field to store on the MCPServer interface)
- **Transport Type** (select)
- **Authorization** (select)
- **Status** toggle (Active / Configured)
- **Tool selection** checklist (same ToolChecklist component, pre-checked with currently selected tools)
- **Save** button to persist changes

### Data Model Change
Extend `MCPServer` interface to persist connection metadata:

```typescript
export interface MCPServer {
  id: string;
  name: string;
  status: "Active" | "Configured";
  icon: LucideIcon;
  tools: MCPServerTool[];
  url?: string;          // NEW
  transport?: string;    // NEW
  auth?: string;         // NEW
}
```

### File: `src/components/MCPServersCard.tsx`
- Add state for edit dialog: `editOpen`, `editServer` (the server being edited), and form fields (`editName`, `editUrl`, `editTransport`, `editAuth`, `editStatus`, `editSelectedToolIds`)
- On "..." click, populate edit state from the selected server and open the dialog
- The edit dialog shows the same fields as the Register New form but pre-populated
- Tool checklist shows all available tools for that server type (from `serverToolCatalog`), with currently selected ones pre-checked
- Save button updates the server in the list via `updateServers()`
- Also store `url`, `transport`, `auth` when registering/connecting servers so they can be edited later

---

## 2. Gateway Endpoint Metadata

### Current State
Each gateway row shows name, server/policy counts, and a delete button. The ChevronRight icon suggests a detail view but nothing happens on click.

### New Behavior
Clicking a gateway row (or the ChevronRight) opens a **Gateway Endpoint Metadata** dialog showing:

**Gateway Specification** (mirrors MCP server spec format):
- Gateway Name
- Gateway Endpoint URL (mock, e.g., `https://gateway.example.com/{gateway-name}/v1/stream`)
- Transport Type: Streamable HTTP
- Authorization: inherited from servers or gateway-level

**MCP Servers** section:
- List of servers included in the gateway, each showing name, URL, transport, auth

**Namespaced Tools** section:
- Consolidated flat list of all tools from all servers in the gateway
- Each tool prefixed with server name: `ServerName / ToolName`
- Example: `Filesystem / List Files`, `PostgreSQL / Run Query`

**Policies** section:
- Applied security policies (names)
- Applied business policies (names with condition counts)

### File: `src/components/MCPGatewayCard.tsx`
- Accept `mcpServers` (full `MCPServer[]` with tools) as a new prop so we can resolve server tools
- Add state for detail dialog: `detailOpen`, `detailGateway`
- On gateway row click, open the detail dialog
- The dialog renders:
  - Gateway spec metadata (name, mock URL, transport, auth)
  - Server list with their individual specs
  - Namespaced tools list built by iterating each gateway server, finding matching MCPServer from props, and prefixing tools with server name
  - Security and business policy names (resolved from props)

### File: `src/pages/Index.tsx`
- Pass `mcpServers` to `MCPGatewayCard` as a new prop (it currently only receives `activeMCPServers` which is the same data, but we need tools)

---

## Technical Details

### Files Modified

1. **`src/components/MCPServersCard.tsx`**
   - Extend `MCPServer` interface with `url?`, `transport?`, `auth?`
   - Add edit dialog state and handlers
   - Wire "..." button to open edit dialog
   - Save `url`, `transport`, `auth` during register/catalog flows
   - Render Edit Dialog with name, URL, transport, auth, status toggle, and tool checklist

2. **`src/components/MCPGatewayCard.tsx`**
   - Add `mcpServers` to props interface (full MCPServer[] with tools)
   - Add gateway detail dialog state
   - Wire gateway row click and ChevronRight to open detail
   - Render metadata dialog with: gateway spec, server list, namespaced tools, applied policies
   - Resolve policy names from `securityPolicies` and `businessPolicies` props

3. **`src/pages/Index.tsx`**
   - Pass `mcpServers` prop to `MCPGatewayCard`

### Gateway Metadata Display Structure

```text
+---------------------------------------------+
| Gateway: My MCP Gateway                     |
+---------------------------------------------+
| Endpoint Metadata                            |
|   Name: My MCP Gateway                      |
|   URL: https://gw.example.com/my-gw/v1/mcp  |
|   Transport: Streamable HTTP                 |
|   Auth: None                                 |
+---------------------------------------------+
| MCP Servers (2)                              |
|   Filesystem MCP Server                      |
|     URL: https://mcp.fs.com/v1/stream        |
|     Transport: Streamable HTTP | Auth: None  |
|   PostgreSQL MCP Server                      |
|     URL: https://mcp.pg.com/v1/stream        |
|     Transport: Streamable HTTP | Auth: API   |
+---------------------------------------------+
| Namespaced Tools (8)                         |
|   Filesystem / List Files                    |
|   Filesystem / Read File                     |
|   Filesystem / Write File                    |
|   PostgreSQL / Run Query                     |
|   PostgreSQL / List Tables                   |
|   ...                                        |
+---------------------------------------------+
| Security Policies: PII Detection, Rate Limit |
| Business Policies: Invoice Validation (3)    |
+---------------------------------------------+
```

