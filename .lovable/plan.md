

# Remove "Native Tools Server" Concept Across the Codebase

## Rationale
The user has streamlined the approach: instead of a separate "Native Tools Server" concept, the project itself is now added as an MCP server (with its tools) when enabled via the Edit dialog. The "Native Tools" toggle, proxy server, and special-case handling should all be removed since these tools now appear as a regular MCP server entry.

## Changes

### 1. `src/components/MCPGatewayCard.tsx`
- **Remove the "Native Tools Server" section** (lines 441-469) from the gateway create/edit dialog's "Active" tab — the entire "Native" subsection with the hardcoded Wrench icon entry and "Add" button.
- **Remove special-case in `getNamespacedTools`** (lines 321-325): Remove the `if (gwServer.name === "Native Tools Server")` branch that bypasses Tools Filter for native tools. All servers now follow the same tool resolution path.
- **Remove special-case in `handleEditClick`** (line 288): Remove the `if (srv.name === "Native Tools Server") return { ...srv, icon: Wrench }` icon restoration logic.
- **Clean up imports**: Remove `Wrench` from lucide-react if no longer used elsewhere.

### 2. `src/components/BusinessPoliciesCard.tsx`
- **Remove the `ServerToolSelector` component** (lines 200-290) and the "Native Tools" / "MCP Server" toggle UI. Replace with a simplified selector that only shows MCP servers (which now includes the project server when enabled).
- **Remove `ToolSource` type** and all `toolSource` state references.
- **Remove `nativeServerProxy`** construction (lines 379-381).
- **Update `buildSelectedToolKey`**: Remove the `NativeTools.` prefix logic. All tools are now keyed by their MCP server name.
- **Update `deriveServerAndTool`**: Remove the `NativeTools.` prefix parsing branch.
- **Update `formatToolLabel`**: Remove the `NativeTools.` prefix formatting branch — use the standard `ServerName → ToolName` format.
- **Clean up imports**: Remove `Cpu` from lucide-react, remove `nativeTools` import from ToolsCard if no longer needed.

### 3. `src/components/SecurityPoliciesCard.tsx`
- **Remove all `"native-tools"` special-case handling**:
  - PII config dialog (lines 644, 659): Remove the `<SelectItem value="native-tools">Native Tools</SelectItem>` option and the conditional tool resolution for native-tools.
  - Generic config dialog (line 1493): Remove the `native-tools` entry from server options.
  - Tools Filter dialog (lines 1350-1351, 1667, 1720): Remove `native-tools` option and its tool resolution.
  - `getEnforcementLevelLabel` (lines 1147, 1189-195): Remove native-tools label mapping.
  - `isEnforcementFieldVisible` (line 172): Remove native-tools comment.
- All server dropdowns will now simply list active MCP servers (which includes the project server when enabled).
- **Clean up imports**: Remove `nativeTools` import from ToolsCard if no longer used.

### 4. `src/components/ToolsCard.tsx`
- Keep the `nativeTools` export and `NativeTool` type — they are still used by `projectsData.ts` to define project tools and by `ToolsCard` for rendering the agent tools card.

## What stays the same
- The Edit dialog's "Enable MCP server" checkbox and auto-add to Gateway (implemented in previous step) remains unchanged.
- The `tools` prop passed from Index.tsx to policy cards continues to work — it feeds into the MCP server's tool list when the project is enabled as a server.

