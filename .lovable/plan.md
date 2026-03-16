

# Move PII Policy Granularity to Enforcement Tab with Schema Validation Enforcement Levels

## Problem
The PII Detection policy has a "Policy Granularity" dropdown in the Scope tab with values Global/Per-Server/Per-Request-Type. This should instead use the same enforcement level pattern as Schema Validation (t2): **MCP Gateway / MCP Server / Tool** — and live in the Enforcement tab.

## Changes

### 1. `src/components/SecurityPoliciesCard.tsx`

**PIIConfig interface (~line 268)**
- Replace `granularity: string` with `enforcementLevel: string` (values: `"gateway"`, `"server"`, `"tool"`)
- Add `targetServerId: string` and `targetToolId: string` fields for server/tool selection

**getDefaultPIIConfig (~line 294)**
- Replace `granularity: "global"` with `enforcementLevel: "gateway"`, `targetServerId: ""`, `targetToolId: ""`

**PIIConfigDialog — Enforcement tab (~lines 611-687)**
- Add an "Enforcement Level" select at the top with options: MCP Gateway, MCP Server, Tool (matching Schema Validation t2 pattern)
- When "MCP Server" is selected, show a Target Server dropdown (populated from `mcpServers` prop — needs to be passed in)
- When "Tool" is selected, show both Target Server and Target Tool dropdowns
- This replaces the granularity concept with the standard enforcement level pattern

**PIIConfigDialog — Scope tab (~lines 690-749)**
- Remove the "Policy Granularity" select (lines 715-725) entirely
- Keep the remaining Scope tab fields: Applies To, Scan Targets, PII Count Threshold, Time-Based Restriction

**PIIConfigDialog props**
- Add `mcpServers` and `tools` props to populate the server/tool dropdowns

**Callers of PIIConfigDialog (~line 1054+)**
- Pass `mcpServers` and `tools` props through from the parent `SecurityPoliciesCard`

**getConfigSummary (~line 360+)**
- Update PII summary to show enforcement level instead of granularity

