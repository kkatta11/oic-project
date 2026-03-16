

# Remove "Native Tools Server" from Rate Limiting Enforcement & List All Active Servers

## Changes in `src/components/SecurityPoliciesCard.tsx`

### 1. Remove "Native Tools Server" option from t5 enforcement levels (line 94)
- Delete the `{ value: "native-tools", label: "Native Tools Server" }` option from the t5 schema, leaving only "MCP Gateway" and "MCP Server"

### 2. Update Target Server dropdown for t5 (line 1488-1492)
- When template is t5 and enforcement level is "server", list **all active MCP servers including Native Tools Server** in the target server dropdown
- Add a "Native Tools" option with value `"native-tools"` alongside activated MCP servers (this already exists at line 1490 — keep it as-is)

### 3. Update visibility logic for targetServerId (line 174)
- For t5, show the target server picker when `level === "server"` (already the case) — no change needed since we removed "native-tools" as a level

### 4. Clean up getEnforcementSuffix (line 1142-1144)
- Remove the `level === "native-tools"` branch for t5 since that enforcement level no longer exists
- The `serverId === "native-tools"` case in the "server" branch will handle naming when Native Tools is selected as a target server

### 5. Clean up getEnforcementLabel (line 188)
- Remove the `templateId === "t5" && level === "native-tools"` special case

