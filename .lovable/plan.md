

# Add Native Tools Toggle to Business Policies

## Changes — `src/components/BusinessPoliciesCard.tsx`

### 1. Add toggle state and import native tools
- Import `nativeTools` from `ToolsCard.tsx`.
- Add `toolSource` state: `"mcp" | "native"` (default `"mcp"`).

### 2. Update `ServerToolSelector` to support toggle
- Add a two-button toggle (Native Tools / MCP Server) above the server/tool dropdowns.
- When **"Native Tools"** is selected:
  - Hide the MCP Server dropdown.
  - Show a tool dropdown populated from `nativeTools` (mapped to `{ id, name }`).
- When **"MCP Server"** is selected:
  - Show existing server → tool flow (unchanged).

### 3. Update save/edit handlers
- When `toolSource === "native"`, store `selectedTools` as `["NativeTools.<ToolName>"]` (e.g., `["NativeTools.RiskAssessment"]`).
- When editing, detect `"NativeTools."` prefix to restore `toolSource` to `"native"` and pre-select the correct tool.

### 4. Update display helpers
- `formatToolLabel`: detect `"NativeTools."` prefix → display as `"Native Tools → <ToolName>"`.
- `deriveServerAndTool`: handle `"NativeTools."` prefix, returning `serverId: "native-tools"`.

### 5. Update `toolPayloadAttributes` map
- Add entries for each native tool name with reasonable attribute lists (e.g., `"Risk Assessment": ["vendor_id", "amount", "risk_level"]`).

### 6. Reset form
- Reset `toolSource` to `"mcp"` in `resetForm()`.

