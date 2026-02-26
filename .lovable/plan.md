

# Add MCP Server Filter to Business Policies

## Overview

Replace the current flat tool checklist with a two-step selection flow: (1) select an active MCP server from a dropdown, (2) select a tool from that server. Conditions and attribute picker are then scoped to the selected server/tool.

## Changes — `src/components/BusinessPoliciesCard.tsx`

### New state variables
- `selectedServerId: string` — the chosen active MCP server ID
- Replace `selectedTools: string[]` with a single tool selection derived from server + tool

### Create/Edit dialog — replace "Apply to Tools" section
1. **Step 1 — Select MCP Server**: A `<Select>` dropdown listing only `mcpServers` with `status === "Active"`. When changed, reset tool selection.
2. **Step 2 — Select Tool**: A `<Select>` dropdown listing tools from the selected server. Only shown after a server is picked.
3. Store `selectedTools` as `["ServerName.ToolName"]` (single-element array) to preserve the existing `BusinessPolicy` interface.

### Attribute picker scoping
- Filter `AttributePicker` to only show tools from the selected server (pass filtered `mcpServers` array containing only the selected server).
- The condition row attribute picker will only browse the selected server's tools.

### Edit dialog
- When opening edit, derive `selectedServerId` from the existing `selectedTools[0]` by matching against server names.
- Pre-select the tool in the tool dropdown.

### Policy list summary
- Show server name and tool name in the subtitle (e.g., "Slack → Send Message · 2 conditions · Block Request").

### Validation
- Create/Save button disabled unless server selected, tool selected, and at least one condition defined.

