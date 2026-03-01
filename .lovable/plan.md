

# Change Tools Filter from Exclude to Include Model

## Rationale
Currently, the Tools Filter policy lets users select tools to **exclude**. If new tools are discovered via metadata refresh, they are automatically available — a security leak. Switching to an **include** model means only explicitly selected tools are allowed; new tools are blocked by default.

## Changes

### 1. `src/components/SecurityPoliciesCard.tsx`
- Rename state variable `toolsFilterExcluded` → `toolsFilterIncluded` and update all references.
- Rename `toggleExcludedTool` → `toggleIncludedTool`.
- Change config key from `excludedTools` to `includedTools` in save handler.
- Update description text from "Excludes N tools" → "Includes N tools".
- Update `getConfigSummary` for t9: "Excludes: N tools" → "Includes: N tools".
- Update dialog UI labels: "Exclude Tools" → "Include Tools", counter text "excluded" → "included".
- Update repository description for t9: "Exclude specific tools" → "Allow specific tools from MCP servers".
- Update save button disabled condition: require at least one included tool selected.
- Edit handler: read `includedTools` from config instead of `excludedTools`.

### 2. `src/components/MCPGatewayCard.tsx`
- In `getNamespacedTools` (~line 307-311): Invert the filter logic. Instead of collecting excluded tool IDs and filtering them out, collect **included** tool IDs from `includedTools` config and only keep tools that appear in the included set. If no Tools Filter policy applies to a server, no tools from that server pass through (secure by default).

