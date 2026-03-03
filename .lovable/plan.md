

# Add Native Tools Server Entry Under Active Servers Tab

## Change — `src/components/MCPGatewayCard.tsx`

Instead of a separate tab, add "Native Tools Server" as an always-visible entry at the bottom of the **Active Servers** tab content (after the list of active MCP servers). It will appear as a row with the `Wrench` icon, name "Native Tools Server", description "Built-in agent capabilities", and an Add/Added button — same pattern as the existing active server rows.

### Specific edits:

1. **Import** `nativeTools` from `@/components/ToolsCard`.

2. **Active Servers tab** (~line 396-427): After the existing active servers list (or the "no active servers" message), add a separator label ("Native") and a single row for "Native Tools Server" with the `Wrench` icon. The Add button adds it to `registeredServers` with transport `"native"`, auth `"none"`, empty URL, and `Wrench` icon.

3. **`getNamespacedTools` update** (~line 305-325): When a gateway includes a server named "Native Tools Server", resolve its tools from the imported `nativeTools` array (namespaced as `"Native Tools / {tool.name}"`), bypassing the MCP server lookup. These tools are included regardless of Tools Filter policies since they are built-in.

4. **`handleEditClick` icon restoration** (~line 282-285): Add a check for "Native Tools Server" to restore the `Wrench` icon (alongside the existing catalog icon lookup).

