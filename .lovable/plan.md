

# PII Body Scan Exclusion List — Per-Tool Attribute Exclusions

## Problem
When "Body" is selected as a scan target in the PII Detection policy's Scope tab, all payload attributes across all tools are scanned. Users need the ability to exclude specific attributes (e.g., `invoice_data`, `query`) from PII scanning on a per-tool basis to reduce false positives and avoid scanning known-safe fields.

## Solution
Add a conditional "Body Exclusions" section that appears when "Body" is checked in Scan Targets. It reuses the existing `toolPayloadAttributes` catalog from `BusinessPoliciesCard.tsx` and presents a grouped, collapsible tool-attribute picker where users can select attributes to exclude from scanning.

## Changes

### `src/components/SecurityPoliciesCard.tsx`

**1. Update PIIConfig type** — Add `bodyExclusions: Record<string, string[]>` (map of tool name to excluded attribute names).

**2. Update getDefaultPIIConfig** — Add `bodyExclusions: {}` default.

**3. Add exclusion UI in Scope tab** — After the Scan Targets checkboxes, when `config.scanTargets.includes("body")`, render a "Body Exclusions" section:
- Collapsible section with header: "Attribute Exclusions" + count badge
- Lists active MCP servers and their tools (from `mcpServers` prop)
- Each tool is expandable, showing its payload attributes from `toolPayloadAttributes`
- Each attribute has a checkbox to toggle exclusion
- Format: Server > Tool > Attributes (grouped)

**4. Add toggle helpers** — `toggleBodyExclusion(toolName, attribute)` to add/remove from `bodyExclusions[toolName]`.

**5. Import toolPayloadAttributes** — Export `toolPayloadAttributes` from `BusinessPoliciesCard.tsx` and import it in `SecurityPoliciesCard.tsx`.

### `src/components/BusinessPoliciesCard.tsx`

**6. Export toolPayloadAttributes** — Add `export` keyword to the existing `toolPayloadAttributes` constant.

## UI Layout (inside Scope tab, below Scan Targets)

```text
Scan Targets
[✓] Body  [ ] Headers  [ ] Query Params  [ ] Metadata

▼ Attribute Exclusions (3 excluded)
┌─────────────────────────────────────────┐
│ ▼ Jira MCP Server                       │
│   ▼ Create Issue                        │
│     [✓] repo                            │
│     [✓] title                           │
│     [ ] body                            │
│     [✓] labels                          │
│   ▸ Get PR                              │
│                                         │
│ ▸ Slack MCP Server                      │
└─────────────────────────────────────────┘
```

Checked = excluded from PII scanning. The section is hidden when "Body" is not a selected scan target.

## Files Modified
- `src/components/SecurityPoliciesCard.tsx` — Add exclusion UI, state, and config field
- `src/components/BusinessPoliciesCard.tsx` — Export `toolPayloadAttributes`

