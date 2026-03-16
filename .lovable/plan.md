

# Enable Multi-Instance Security Policies

## Summary
Allow security policies that have enforcement levels to be added multiple times (once per target), while keeping policies without enforcement levels as single-instance (gateway-only).

## Policy Classification

**Multi-instance** (have enforcement levels): t1 (PII Detection), t2 (Schema Validation), t5 (Rate Limiting), t6 (Payload Size), t8 (Encryption), t9 (Tools Filter — already supported)

**Single-instance** (gateway-only, no enforcement level): t3 (Tool Poisoning Check), t4 (Intrusion Detection)

## Changes

### `src/components/SecurityPoliciesCard.tsx`

1. **Update `availableTemplates` filter (line 1133-1135)**
   - Currently only t9 is excluded from the duplicate check
   - Change to: exclude multi-instance template IDs (t1, t2, t5, t6, t8, t9) from the `usedTemplateIds` filter so they always appear in the "Add Policy" list
   - Single-instance templates (t3, t4) remain filtered out once added

2. **Policy naming for multi-instance policies**
   - When adding a multi-instance policy, auto-append the enforcement target to the name for disambiguation (e.g., "Schema Validation — MCP Gateway", "PII Detection — Server: Jira MCP", "Encryption — Tool: Risk Assessment")
   - For t9 (Tools Filter), keep existing naming behavior

3. **No structural changes needed** — the config dialogs already capture enforcement level and target. The only gate was the `availableTemplates` filter preventing re-adding templates.

