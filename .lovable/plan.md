

# Enhanced Intrusion Detection Policy Configuration

## Overview

Replace the current simple schema-based `t4` (Intrusion Detection) config with a dedicated custom dialog component (`IntrusionDetectionConfigDialog`) featuring 5 tabs, similar to the PII Detection (`t1`) pattern.

## Changes — `src/components/SecurityPoliciesCard.tsx`

### 1. Remove `t4` from `policyConfigSchemas`

Delete lines 72-90 (the `t4` entry in `policyConfigSchemas`). Intrusion Detection will now use custom handling like `t1` and `t9`.

### 2. Add Constants

```text
IDS_PATTERN_TYPES = [
  { id: "sql_injection", label: "SQL Injection", defaultThreshold: 85 },
  { id: "command_injection", label: "Command Injection", defaultThreshold: 90 },
  { id: "path_traversal", label: "Path Traversal", defaultThreshold: 95 },
  { id: "prompt_injection", label: "Prompt Injection", defaultThreshold: 80 },
]

IDS_EVASION_TECHNIQUES = [
  "url_encoding", "html_entity", "unicode_normalization",
  "base64", "hex_encoding", "double_url_encoding",
  "case_variation", "null_byte_injection"
]
```

### 3. Add `IDSConfig` Interface

```typescript
interface IDSConfig {
  // Detection tab
  enabledPatterns: string[];           // which of the 4 pattern types are active
  evasionHandling: string[];           // which evasion techniques to handle
  // Classification tab (per-pattern thresholds)
  confidenceThresholds: Record<string, number>; // e.g. { sql_injection: 85, ... }
  // Enforcement tab
  responseAction: string;              // "block" | "log-alert" | "throttle"
  blockWithLogging: boolean;
  blockWithAlerting: boolean;
  errorMessage: string;                // generic error message text
  includeRequestId: boolean;
  maxBlockLatencyMs: number;           // target blocking latency
  alertRecipients: string;
  // Scope tab
  globalEnabled: boolean;              // gateway-level toggle
  appliesTo: string;                   // request | response | both
  // Per-server config
  perServerOverrides: Record<string, {
    enabled: boolean;
    patterns: string[];
    thresholds: Record<string, number>;
  }>;
  // Whitelisting tab
  whitelistPatterns: { tool: string; pattern: string; description: string }[];
}
```

### 4. Add `IntrusionDetectionConfigDialog` Component

A dialog with 5 tabs following the same pattern as `PIIConfigDialog`:

**Tab 1 — Detection Patterns**
- Checklist of 4 pattern types (SQL Injection, Command Injection, Path Traversal, Prompt Injection) each with a brief description
- Multi-select checklist for evasion handling techniques (8 items)
- Each pattern type shows its target false-positive rate as helper text

**Tab 2 — Confidence Thresholds**
- For each enabled pattern type, a number input (0-100%) for the confidence threshold
- Shows default values and description of higher vs lower threshold tradeoffs

**Tab 3 — Enforcement**
- Primary Action select: Block (403), Log & Alert, Throttle
- When action=Block: toggles for logging, alerting, include request ID
- Error message text input (default: "Request validation failed")
- Max blocking latency number input (default: 50ms)
- Alert recipients text input

**Tab 4 — Scope**
- Global enable/disable toggle
- Applies To select: Request / Response / Both
- Per-server configuration section: list MCP servers from props, each with enable/disable toggle and pattern selection checkboxes

**Tab 5 — Whitelisting**
- List editor for whitelist entries: tool name (text), regex pattern (text), description (text)
- Add/Remove row buttons

### 5. State Management

Add state variables (same pattern as PII):
- `idsConfigOpen: boolean`
- `idsConfigValues: IDSConfig`
- `idsEditPolicy: SecurityPolicy | null`

### 6. Integration

- In `handleAddFromRepo`: when `templateId === "t4"`, open the IDS dialog with defaults instead of using generic schema
- In `handleEditPolicy`: when `templateId === "t4"`, hydrate `idsConfigValues` from `policy.config` and open dialog
- `handleIdsSave`: save config to policy, same pattern as `handlePiiSave`

### 7. Config Summary

Update `getConfigSummary` for `t4`:
```
"Action: Block · 4 patterns · Thresholds: 85-95%"
```

### 8. Default Config

All 4 patterns enabled, all 8 evasion techniques enabled, action=block, logging=true, alerting=false, error message="Request validation failed", includeRequestId=true, maxBlockLatencyMs=50, globalEnabled=true, appliesTo="both", empty per-server overrides and whitelist.

