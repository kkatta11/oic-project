

# Add "Native Tools" to PII Detection Target Server Dropdown

## Problem
The PII Detection (t1) policy's Enforcement tab is missing the "Native Tools" option in the Target Server dropdown when "MCP Server" or "Tool" enforcement level is selected. All other multi-instance policies (t2, t5, t6, t8, t9) already include it.

## Changes in `src/components/SecurityPoliciesCard.tsx`

### 1. Target Server dropdown in PII config dialog (~line 643-646)
Add `<SelectItem value="native-tools">Native Tools</SelectItem>` before the MCP servers map, matching the pattern used in the generic config dialog (line 1489).

### 2. Target Tool dropdown in PII config dialog (~line 657-660)
Add handling for `native-tools` server ID: when `config.targetServerId === "native-tools"`, show `activeTools` (native tools) instead of looking up `mcpServers.find(...)?.allTools`.

This matches the pattern already used in the generic dialog at line 1510-1512.

### No other policies affected
- t2, t5, t6, t8 use the generic config dialog which already includes Native Tools
- t9 (Tools Filter) has its own dialog which already includes Native Tools
- t3, t4 are gateway-only (no enforcement level selection)

