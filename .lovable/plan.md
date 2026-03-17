

# Auto-add Project as MCP Server When Enabled in Edit Dialog

## What
When the user enables "Enable MCP server" in the Edit details dialog and saves, automatically add the project itself as an MCP Server entry in the Gateway tab's MCP Servers card with status "Active". When disabled, remove it.

## Changes

### `src/pages/Index.tsx` — `handleSaveEdit`
After saving the edit form, check `editForm.mcpServerEnabled`:
- **If enabled**: Check if an MCP server with id matching the project (e.g., `project-${projectId}`) already exists in `mcpServers`. If not, add a new `MCPServer` entry:
  - `id`: `project-${projectId}`
  - `name`: project name (e.g., "Smart Invoice Validation AgAI")
  - `status`: "Active"
  - `icon`: Server (from lucide-react)
  - `tools`: the project's native tools mapped to `MCPServerTool` format
  - `allTools`: same as tools
  - `url`: `currentProject.mcpServerUrl`
  - `transport`: "SSE"
  - `auth`: "oauth2"
- **If disabled**: Remove the server entry with id `project-${projectId}` from `mcpServers` state.

Update `setMcpServers` accordingly within `handleSaveEdit`.

### Import
Add `Server` icon import from lucide-react in Index.tsx (if not already imported).

