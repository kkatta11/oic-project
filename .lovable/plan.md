

# Persist MCP Server Enable State and Server List

## Problem
When enabling the MCP server via the Edit dialog, the changes are only stored in React state and in-memory object mutation (`Object.assign`). When navigating away and returning, the component re-initializes from static data, losing the enabled state and the auto-added MCP server entry.

## Solution
Persist two things to localStorage (project-scoped, matching existing persistence patterns):

### 1. `src/pages/Index.tsx`
- **Persist `mcpServerEnabled`**: On save in `handleSaveEdit`, write the enabled flag to `localStorage` with key `mcp-server-enabled-{projectId}`.
- **Initialize from localStorage**: When initializing state, check localStorage for the persisted enabled flag. If enabled, auto-generate the project's MCP server entry and prepend it to the default `projectData.mcpServers` list.
- **Persist `mcpServers` list**: Save the full MCP servers array to `localStorage` with key `mcp-servers-{projectId}` whenever it changes (in `handleSaveEdit` and pass a wrapper around `setMcpServers` that also persists). Load from localStorage on init, falling back to `projectData.mcpServers`.
- **Remove `Object.assign` mutation**: Instead of mutating the imported project object directly, persist project edit overrides to localStorage (key `project-overrides-{projectId}`) and merge on load.

### 2. Key details
- Uses same localStorage pattern as existing `mcp-gateways-{projectId}`, `security-policies-{projectId}`, `business-policies-{projectId}`.
- MCP server entries contain an `icon` property (a React component) which can't be serialized — on load, restore the `Server` icon for project server entries (id starts with `project-`) and use a lookup for catalog servers.
- The `mcpServerEnabled` flag on `currentProject` needs to reflect persisted state so the Edit dialog checkbox initializes correctly.

