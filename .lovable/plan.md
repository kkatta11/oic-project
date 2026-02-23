
# MCP Server Tools Discovery and Agent Tools Integration

## Overview

When registering a new MCP server or connecting a community catalog server, the system will simulate fetching the tools served by that endpoint and let users select which tools to include. Selected tools will then appear in the Agent tab's Tools card, namespaced by server name (e.g., `Filesystem / List Files`).

---

## 1. Data Model Changes

### Extend `MCPServer` interface
Add a `tools` array to track which tools were selected from the server:

```typescript
export interface MCPServerTool {
  id: string;
  name: string;
  description: string;
}

export interface MCPServer {
  id: string;
  name: string;
  status: "Active" | "Configured";
  icon: LucideIcon;
  tools: MCPServerTool[];  // NEW - selected tools from this server
}
```

### Simulated tool catalogs per server
Each server (both manual and catalog) will have a mock set of "discovered" tools. For example:
- **Filesystem MCP Server**: List Files, Read File, Write File, Delete File
- **Slack MCP Server**: Send Message, List Channels, Search Messages, Upload File
- **GitHub MCP Server**: List Repos, Create Issue, Get PR, Search Code
- **Notion MCP Server**: Query Database, Create Page, Update Page, Search
- **Gmail MCP Server**: Send Email, Search Emails, Get Thread, Create Draft

For manually registered servers, a generic set of placeholder tools will be shown (simulating endpoint discovery).

---

## 2. MCPServersCard.tsx Changes

### Register New tab
After filling in server name/URL/auth, add a **"Fetch Tools"** button that simulates discovering tools from the endpoint. Once fetched:
- Display a checklist of tools with checkboxes
- Users select which tools to include
- The "Register Server" button saves the server with selected tools

### Browse Catalog tab (detail dialog)
When clicking "Connect" on a catalog server, the detail dialog will:
- Show the pre-filled URL/auth fields (existing)
- Additionally display the server's available tools as a checklist
- Users select tools before confirming

### Default servers update
The two default servers will also have pre-assigned tools so they show up in the Agent tab immediately.

---

## 3. ToolsCard.tsx Changes

### Accept MCP servers as a prop
Convert from static `tools` array to dynamic: display both the existing hardcoded agent tools AND tools from MCP servers.

### Namespaced display
MCP server tools will be shown with a namespace badge/prefix:
- `Filesystem / List Files`
- `GitHub / Create Issue`

This distinguishes them from native agent tools (Risk Assessment, etc.) and prevents name clashes.

### Visual grouping
- Native tools shown first (existing 6 tools)
- A subtle separator or section header "MCP Server Tools"
- MCP tools listed below, grouped by server, each showing `ServerName / ToolName`

---

## 4. Index.tsx Changes

- Pass `mcpServers` as a prop to `ToolsCard` so it can render MCP-sourced tools
- Update default MCP servers to include their pre-selected tools

---

## Technical Details

### Files Modified

1. **`src/components/MCPServersCard.tsx`**
   - Add `MCPServerTool` interface export
   - Add mock tool catalogs for each server type (manual + catalog)
   - Register New: add "Fetch Tools" button and checkbox list of discovered tools
   - Catalog detail dialog: add checkbox list of tools
   - Save selected tools into the `MCPServer.tools` array
   - Update default servers to include tools

2. **`src/components/ToolsCard.tsx`**
   - Accept `mcpServers?: MCPServer[]` prop
   - Render native tools first, then MCP server tools with namespace prefix
   - Add section divider between native and MCP tools

3. **`src/pages/Index.tsx`**
   - Pass `mcpServers` to `ToolsCard`
   - Update `defaultMCPServers` to include pre-selected tools

### Mock Tool Data Structure

```typescript
const serverToolCatalog: Record<string, MCPServerTool[]> = {
  "Filesystem MCP Server": [
    { id: "t1", name: "List Files", description: "List files in a directory" },
    { id: "t2", name: "Read File", description: "Read file contents" },
    { id: "t3", name: "Write File", description: "Write content to a file" },
    { id: "t4", name: "Delete File", description: "Delete a file" },
  ],
  "Slack MCP Server": [
    { id: "t1", name: "Send Message", description: "Send a message to a channel" },
    { id: "t2", name: "List Channels", description: "List available channels" },
    // ...
  ],
  // ... similar for GitHub, Notion, Gmail, PostgreSQL
  "_default": [
    { id: "t1", name: "Execute", description: "Execute a server action" },
    { id: "t2", name: "Query", description: "Query server data" },
    { id: "t3", name: "List Resources", description: "List available resources" },
  ],
};
```
