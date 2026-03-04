

# Add Enforcement Level (Scope) to Security Policies

## Summary

Add an "Enforcement Level" selector to four security policy types, controlling at what granularity each policy is applied. The level options vary by policy type:

| Policy | Levels |
|---|---|
| Rate Limiting (t5) | Gateway, MCP Server, Native Tools Server |
| Schema Validation (t2) | Gateway, Server, Tool |
| Payload Size (t6) | Gateway, Server, Tool |
| Encryption (t8) | Gateway, Server, Tool |

When "Server" or "Tool" is selected, a secondary selector appears to pick the specific server (from active MCP servers + Native Tools) and optionally the specific tool.

## Changes — `src/components/SecurityPoliciesCard.tsx`

### 1. Add `enforcementLevel` field to config schemas

For each of the four templates, add an `enforcementLevel` select field as the **first** config field:

- **t5 (Rate Limiting)**: Options — `gateway` (default), `server`, `native-tools`. "Server" means a specific MCP server; "native-tools" targets the Native Tools Server specifically.
- **t2 (Schema Validation)**: Needs a config schema created. Options — `gateway` (default), `server`, `tool`.
- **t6 (Payload Size)**: Add as first field. Options — `gateway` (default), `server`, `tool`.
- **t8 (Encryption)**: Add as first field. Options — `gateway` (default), `server`, `tool`.

### 2. Add conditional server/tool picker fields

Add two additional fields to the schemas that are **conditionally rendered** based on `enforcementLevel`:

- `targetServerId`: A select field showing active MCP servers + "Native Tools". Shown when level is `server` or `tool`.
- `targetToolId`: A select field showing tools from the selected server. Shown only when level is `tool`.

Since the standard config dialog renders fields from the schema generically, add special handling in the config dialog render loop: when rendering `targetServerId` or `targetToolId`, dynamically populate their options from `mcpServers` and the selected server's tools rather than using static options.

### 3. Update config dialog rendering

In the config dialog's field rendering section, add conditional logic:
- Hide `targetServerId` when `enforcementLevel` is `gateway`.
- Hide `targetToolId` when `enforcementLevel` is not `tool`.
- Populate `targetServerId` options dynamically from `activeServers` + a "Native Tools" entry.
- Populate `targetToolId` options dynamically from the selected server's tools (or `nativeTools` if Native Tools is selected).

### 4. Update `getConfigSummary`

Enhance the summary string for these templates to include the enforcement level and target, e.g., "Level: Server (Oracle ERP Cloud) · 100 req/min · Block".

### 5. Schema Validation (t2) — add config schema

Currently t2 has no config schema. Create one with:
- `enforcementLevel` (gateway/server/tool)
- `targetServerId` / `targetToolId` (conditional)
- `validationMode`: Strict / Lenient
- `action`: Block / Warn / Log

## Technical Notes

- The `PolicyFieldDef` type already supports `select` with dynamic options — but currently all options are static. The conditional server/tool fields will need special-case rendering in the dialog (check `field.key === "targetServerId"` etc.) to inject dynamic options from props.
- No new components needed; all changes are within the existing config dialog render logic.
- Rate Limiting uses "Native Tools Server" as a distinct top-level option rather than listing it under a generic "Server" picker, since the requirement specifically calls out "Gateway / MCP Server / Native Tools Server" as the three levels.

