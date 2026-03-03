

# Enhanced PII Detection Policy Configuration

## Overview

Replace the current 3-field PII config (appliesTo, action, sensitivity) with a comprehensive tabbed configuration dialog covering the key areas from the requirements: Detection, Classification, Enforcement Actions, and Policy Scope.

## Change — `src/components/SecurityPoliciesCard.tsx`

### 1. Replace simple schema with custom dialog

Like `t9` (Tools Filter), the PII policy `t1` will get its own custom dialog instead of using the generic `policyConfigSchemas` renderer. Remove `t1` from `policyConfigSchemas` and add dedicated state + dialog.

### 2. PII Configuration Dialog — Tabbed Layout

A dialog with 4 tabs:

**Tab 1: Detection**
- **Built-in Detectors** — Multi-select checklist of PII types: Email, Phone, SSN, Credit Card, Driver's License, Passport, Government ID, Bank Account, IP Address, Sensitive URLs, API Keys/Tokens, Home Address, Date of Birth
- **Custom Patterns** — Small list editor: each row has a label (text) + regex pattern (text) + Add/Remove buttons
- **ML Enhancement** — Toggle for NER-based detection (optional enhancement flag)

**Tab 2: Classification**
- **Severity Level** — Select: Critical / High / Medium / Low
- **Data Categories** — Multi-select: Financial, Health, Identity, Contact, Authentication
- **Compliance Tags** — Multi-select: GDPR, CCPA, HIPAA, PCI-DSS, SOX
- **Confidence Threshold** — Number input (0-100%) for minimum detection confidence

**Tab 3: Enforcement**
- **Primary Action** — Select: Block, Redact, Replace, Truncate, Encrypt, Log Warning
- **Block Options** (shown when action=Block): block with logging toggle, block with alerting toggle, confidence threshold for conditional block
- **Redaction Style** (shown when action=Redact): Select — Partial Mask, Hash, Tokenize, Format-Preserving. Selective redaction toggle (response only)
- **Replacement Style** (shown when action=Replace): Select — Placeholder Values, Synthetic Data
- **Alert Recipients** — Text input for email addresses

**Tab 4: Scope**
- **Applies To** — Select: Request / Response / Both (existing field)
- **Scan Targets** — Multi-select: Body, Headers, URL Parameters, Path Segments
- **Policy Granularity** — Select: Global, Per-Server, Per-Request-Type
- **PII Count Threshold** — Number input: only trigger if N+ PII fields detected
- **Time-based** — Toggle + time range inputs for business hours restriction

### 3. Config Summary Update

Update `getConfigSummary` for `t1` to show key selections: e.g. "Action: Redact · 8 detectors · Severity: High · HIPAA, GDPR"

### 4. Default Config

Sensible defaults: all 13 built-in detectors enabled, severity=medium, action=block, appliesTo=both, scan targets=[body], confidence threshold=80, granularity=global.

### 5. State Management

New state variables for the PII dialog (similar pattern to Tools Filter):
- `piiConfigOpen` boolean
- `piiConfigValues` object holding all nested config
- `piiEditPolicy` for edit vs. add mode

The config object stored in the policy will contain all fields, and the dialog will hydrate from it on edit.

