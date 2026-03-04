

# Rename Enforcement Level Labels for Consistency

## Problem
The enforcement level labels are inconsistent across policies. Some say "Gateway" / "Server", while Rate Limiting (t5) says "Gateway" / "MCP Server". Need to standardize all to "MCP Gateway" and "MCP Server".

## Changes — `src/components/SecurityPoliciesCard.tsx`

Rename the following labels in the `policyConfigSchemas` object:

| Template | Current | New |
|---|---|---|
| t2 (Schema Validation) | "Gateway" → "MCP Gateway", "Server" → "MCP Server" |
| t5 (Rate Limiting) | "Gateway" → "MCP Gateway" (MCP Server already correct) |
| t6 (Payload Size) | "Gateway" → "MCP Gateway", "Server" → "MCP Server" |
| t8 (Encryption) | "Gateway" → "MCP Gateway", "Server" → "MCP Server" |

Also update `getEnforcementLevelLabel` and `getConfigSummary` if they reference "Gateway" or "Server" as display strings — ensure summary output uses the new naming.

