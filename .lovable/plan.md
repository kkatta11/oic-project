

# Enhanced Instance Flow Dialog — Payload & Security Policy Details

## Overview

Enhance the Instance Flow dialog in `GatewayObserveDashboard.tsx` to show request/response payloads and security policy condition details when clicking on individual flow steps.

## Changes — `src/components/GatewayObserveDashboard.tsx`

### 1. Extend Mock Data

Add `payload` and `policyDetail` fields to the `FlowStep` interface and mock data:

```typescript
interface FlowStep {
  name: string;
  type: "request" | "security" | "business" | "mcp" | "response";
  status: "passed" | "failed";
  duration: string;
  payload?: { request?: Record<string, any>; response?: Record<string, any> };
  policyDetail?: {
    conditionEvaluated: string;    // e.g. "invoice_amount > 10000"
    conditionResult: boolean;
    action: string;                // e.g. "Block Request", "Passed"
    matchedPattern?: string;       // e.g. "PII: SSN detected in field 'vendor_tax_id'"
    confidence?: number;           // e.g. 92
  };
}
```

Populate existing mock instances with realistic payloads (JSON objects for request/response on request, mcp, and response steps) and policy details (on security and business steps showing which condition fired and the outcome).

### 2. Make Flow Steps Expandable

Replace the static flow step rows with clickable/expandable rows. When a step is clicked, expand it inline to show:

- **For request/response/mcp steps**: A tabbed view with "Request Payload" and "Response Payload" tabs showing formatted JSON in a `<pre>` block with monospace styling.
- **For security/business steps**: A "Policy Evaluation" section showing:
  - Condition evaluated (e.g., `"PII scan on field 'vendor_tax_id'"`)
  - Result: Passed/Failed badge
  - Action taken (e.g., "Allowed", "Blocked — 403 Forbidden")
  - Matched pattern (if any, e.g., `"SQL Injection: UNION SELECT detected"`)
  - Confidence score (if applicable, shown as percentage)

### 3. State

Add `expandedStep: number | null` state inside the Instance Detail Dialog section to track which step is expanded. Clicking a step toggles it.

### 4. Visual Treatment

- Add a subtle chevron indicator on each step row to signal expandability.
- Expanded content appears below the step row with a light background (`bg-muted/50`), rounded corners, and compact padding.
- Payload JSON uses `text-xs font-mono` with max-height and overflow scroll.
- Policy details use a small key-value layout with labels and badges.

### 5. Dialog Width

Increase `max-w-lg` to `max-w-2xl` to accommodate payload content.

