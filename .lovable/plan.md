# Add Custom Policy Name to Security Policy Creation

## Overview

Currently, when creating a new security policy, the name is auto-set from the template name (e.g., "PII Detection", "Intrusion Detection"). This change adds an editable "Policy Name" input field to all create/edit flows so users can provide a custom name. Prefill the Name with the Template name by default for ease.

## Changes — `src/components/SecurityPoliciesCard.tsx`

### 1. Add `policyName` State

Add a new state variable `policyName: string` to the main component for tracking the user-provided name across all policy creation flows.

### 2. Standard Config Dialog (Rate Limiting, Payload Size, Encryption, etc.)

- Add a "Policy Name" `<Input>` field above the existing config fields in the config dialog, pre-filled with the template name on create or the existing policy name on edit.
- Set `policyName` in `handleAddFromRepo` (for schema-based templates) and `handleEditPolicy`.
- Use `policyName` in `handleConfigSave` instead of `configTemplate.name`.
- Also use it when saving no-schema policies (direct add without config dialog) — for these, auto-use the template name as before (no dialog to show a name field).

### 3. PII Detection Dialog (`PIIConfigDialog`)

- Pass `policyName` and `onPolicyNameChange` as new props.
- Add a "Policy Name" input at the top of the dialog (above the tabs), pre-filled with "PII Detection" on create or the existing name on edit.
- Set `policyName` in the add/edit handlers before opening the dialog.
- Use `policyName` in `handlePiiSave`.

### 4. Intrusion Detection Dialog (`IntrusionDetectionConfigDialog`)

- Same pattern as PII: pass `policyName`/`onPolicyNameChange` props.
- Add "Policy Name" input at the top of the dialog.
- Use in `handleIdsSave`.

### 5. Tools Filter Dialog

- Add the "Policy Name" input to the inline Tools Filter dialog, pre-filled with `Tools Filter: <server>`.
- Use in `handleToolsFilterSave` — but still auto-append the server name if the user leaves the default.

### 6. Edit Flow

When editing any policy, populate `policyName` from `policy.name`. On save, update the policy's `name` field with the edited value.

## UI Treatment

- The "Policy Name" field is a simple `<Input>` with a `<Label>` reading "Policy Name", placed as the first field in each dialog, before any tabs or config fields.
- Default value is the template name; user can override it.