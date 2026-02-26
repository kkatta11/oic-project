

# Remove Tool Selection from MCP Server Registration & Add Explicit Tools Filter Security Policy

## Overview

Three major changes: (1) MCP server registration shows fetched tools as read-only list, no selection; all tools are included. (2) Add a new "Tools Filter" security policy template where users explicitly pick an active MCP server and exclude tools. (3) Remove all auto-generated tool filter logic.

## Changes

### 1. `src/components/MCPServersCard.tsx`

**Remove tool selection during registration and catalog connect:**

- Change `ToolChecklist` to a read-only `ToolList` component (no checkboxes, just displays tools)
- Remove `selectedToolIds`, `toggleToolId`, `catalogSelectedToolIds`, `toggleCatalogToolId`, `editSelectedToolIds`, `toggleEditToolId` state and handlers
- In `handleRegister`: set `tools` and `allTools` to all `fetchedTools` (no filtering)
- In `handleCatalogConfirm`: set `tools` and `allTools` to all `catalogTools` (no filtering)
- In `handleEditSave`: set `tools` and `allTools` to all `editAvailableTools` (no filtering)
- Remove "Register Server" button's `selectedToolIds.size === 0` disabled condition; only require `serverName` and `toolsFetched`
- Same for catalog "Connect Server" and edit "Save Changes" buttons

**Remove auto tool filter logic:**

- Remove `updateFilterPolicy` function entirely
- Remove all calls to `updateFilterPolicy` (in `handleRegister`, `handleCatalogConfirm`, `handleRefreshMetadata`, `handleEditSave`)
- Remove auto-filter cleanup from `handleRemove`
- Remove `securityPolicies` and `onPoliciesChange` from props interface and imports
- Remove import of `createToolFilterPolicy`, `saveSecurityPolicies` from SecurityPoliciesCard

**Edit dialog tool display:**

- Show tools as read-only list in edit dialog (same `ToolList` component)
- The edit dialog still shows connection config (name, URL, transport, auth)

### 2. `src/components/SecurityPoliciesCard.tsx`

**Add "Tools Filter" template (t9) to the repository:**

```typescript
{ templateId: "t9", name: "Tools Filter", description: "Exclude specific tools from MCP servers", icon: "ShieldCheck" }
```

**Add `Filter` icon** to iconMap (reuse `ShieldCheck` or add a suitable icon).

**New props:** Accept `mcpServers` prop (array of `MCPServer`) to know which active servers and their tools are available.

**Config schema for t9** — custom handling (not the standard `policyConfigSchemas`):
- When adding/editing a Tools Filter policy, show a custom dialog:
  1. Select an active MCP server (dropdown of servers with status "Active")
  2. Show that server's `allTools` as a checklist where checked = excluded
  3. Store in config: `{ serverId: string, serverName: string, excludedTools: string[] }` (array of tool IDs)

**Display in list:**
- Summary shows: "Server: {name} · Excludes: {count} tools"
- Edit opens the same custom dialog pre-populated

**Remove auto-filter references:**
- Remove `createToolFilterPolicy` export
- Remove `auto-tool-filter` template ID checks from `handleEditPolicy` and rendering
- Remove `isAutoFilter` logic from the policy list rendering

### 3. `src/components/MCPGatewayCard.tsx`

**Remove auto-filter logic:**
- Remove `autoSelectFilterPolicy` helper function
- Remove calls to `autoSelectFilterPolicy` when selecting servers
- Remove auto-filter pre-selection in gateway creation dialog (lines 295-298)
- Remove the special `auto-tool-filter-` warning logic in `toggleSecurityPolicy` (lines 183-187)
- Keep the `warnFilterPolicyId` state but repurpose for Tools Filter policies (templateId `t9`) or remove if no longer needed
- Update tool namespace resolution: instead of deriving excluded tools from auto-filter policies, derive from `t9` Tools Filter policies in config

### 4. `src/pages/Index.tsx`

- Remove `securityPolicies` and `onPoliciesChange` props from `MCPServersCard`
- Add `mcpServers` prop to `SecurityPoliciesCard`

### Result

- MCP Server registration/catalog/edit: shows tools as read-only list, all tools included
- Tools Filter: explicit security policy where user picks active server + excludes specific tools
- No auto-generated policies

