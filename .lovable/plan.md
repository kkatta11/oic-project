

# Security Policy Configuration and Edit Capability

## Overview

Add per-policy configurable parameters that are exposed when a security policy is added from the repository, and provide an edit button to modify those parameters after creation. Each policy template has its own unique set of configuration fields based on the specifications provided.

## Changes

### 1. Data Model Updates (`SecurityPoliciesCard.tsx`)

Extend the `SecurityPolicy` interface to include a `config` record:

```typescript
export interface SecurityPolicy {
  id: string;
  name: string;
  description: string;
  icon: string;
  active: boolean;
  templateId: string;
  config: Record<string, any>; // Policy-specific configuration
}
```

### 2. Policy Configuration Definitions

Define a configuration schema for each template that describes the fields, types, options, and defaults:

| Template | Configurable Parameters |
|----------|------------------------|
| **PII Detection** (t1) | Action: Block / Redact / Log Warning; Sensitivity: Low / Medium / High |
| **Schema Validation** (t2) | (enabled/disabled only -- no additional params beyond the toggle) |
| **Tool Poisoning Check** (t3) | Action: Block / Log & Alert / Redact; IP block duration: 15 min / 1 hour / 24 hours; Alert recipients (text); Whitelist exceptions (text) |
| **Intrusion Detection** (t4) | Sensitivity: Low / Medium / High; Brute force threshold (number) in (number) seconds; Rate spike multiplier (number); Behavioral monitoring: Yes / No; Geographic checks interval (number) minutes; Response action: Alert / Throttle / Require MFA / Block; Exceptions (text) |
| **Rate Limiting** (t5) | Threshold (number); Time window: Per Minute / Per Hour; Action on violation: Block / Throttle / Warn |
| **Payload Size** (t6) | Max request size (number) MB; Max response size (number) MB; Action: Block / Warn & Throttle / Warn Only; Allowed file types (text); Compression: Allow gzip/brotli (toggle); Max decompressed size (number) MB |
| **SQL Injection** (t7) | (merged into Intrusion Detection -- no separate config, or minimal: enabled only) |
| **Encryption** (t8) | Mode: Optional / Required; Key rotation days (number); Key storage: HSM / Cloud KMS / Internal Vault; Compliance badges multi-select: PCI-DSS, HIPAA, GDPR, FIPS |

### 3. UI Flow -- Add Policy with Configuration

When the user clicks "Add" on a policy template:
- Instead of immediately adding, open a **configuration dialog** showing the relevant fields for that template
- Fields are pre-populated with defaults
- User adjusts settings and clicks "Save" to add the policy with the chosen configuration

### 4. UI Flow -- Edit Policy

- Add a **Pencil icon button** next to the toggle and delete button on each policy row
- Clicking it opens the same configuration dialog, pre-populated with current `config` values
- User modifies settings and clicks "Save" to persist changes

### 5. Policy Row Display

Each policy row will show a brief summary of key configuration values beneath the description (e.g., "Action: Block | Sensitivity: High").

---

## Technical Details

### File: `src/components/SecurityPoliciesCard.tsx`

**New data structure** -- policy config schema definitions:

```typescript
interface PolicyFieldDef {
  key: string;
  label: string;
  type: "select" | "number" | "text" | "toggle" | "multi-select";
  options?: { value: string; label: string }[];
  default: any;
}

const policyConfigSchemas: Record<string, PolicyFieldDef[]> = {
  t1: [ // PII Detection
    { key: "action", label: "Action", type: "select",
      options: [
        { value: "block", label: "Block" },
        { value: "redact", label: "Redact" },
        { value: "log-warning", label: "Log Warning" }
      ], default: "block" },
    { key: "sensitivity", label: "Sensitivity Level", type: "select",
      options: [
        { value: "low", label: "Low" },
        { value: "medium", label: "Medium" },
        { value: "high", label: "High" }
      ], default: "medium" },
  ],
  // ... similar for t2-t8
};
```

**New state variables:**

| State | Type | Purpose |
|-------|------|---------|
| `configDialogOpen` | boolean | Controls the config dialog visibility |
| `configTemplate` | template object or null | The template being configured (add mode) |
| `configEditPolicy` | SecurityPolicy or null | The policy being edited (edit mode) |
| `configValues` | Record<string, any> | Current form values in the config dialog |

**Modified functions:**

- `handleAddFromRepo` -- instead of immediately adding, opens config dialog with defaults
- New `handleConfigSave` -- creates or updates the policy with config values, persists
- New `handleEditPolicy` -- opens config dialog pre-populated from existing policy's config

**Config dialog rendering:**

- Dynamically renders form fields based on the schema for the given templateId
- Uses Select for dropdowns, Input for numbers/text, Switch for toggles, Checkbox group for multi-select
- Displays field labels and groups logically

**Policy row update:**

```
[Icon] Policy Name                    [config summary]  [Toggle] [Edit] [Delete]
       Description
```

**Auto-generated tool filter policies** (templateId starting with `auto-tool-filter-`) will NOT have a config dialog -- they remain as-is since they are system-managed.

### File: `src/components/MCPGatewayCard.tsx`

No changes needed -- the gateway card already references policies by ID and the new `config` field is purely additive.

