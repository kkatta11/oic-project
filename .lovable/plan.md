
# Security Policies Repository and Business Policies Expression Builder

## Overview

Transform the static Security Policies and Business Policies cards into fully functional CRUD components with persistence. Security policies will be sourced from a "repository" of seeded templates, and business policies will support conditional expression building on tool payload attributes.

---

## 1. Security Policies Card Enhancements

### Current State
- Static list of 8 hardcoded policies with fixed enabled/disabled status
- "+" button does nothing

### New Behavior
- A **repository** (seeded data) of security policy templates is available
- Clicking "+" opens a dialog where the user picks a policy from the repository, gives it a name/description override if desired, and adds it
- Each created policy has an **Active/Inactive toggle** (switch) to activate or deactivate it
- Only **Active** policies will appear as selectable in the Gateway Creation dialog
- Policies persist in `localStorage` (key: `security-policies`)
- Users can delete policies they created

### Repository (Seeded Templates)
The existing 8 policies become the repository catalog:
- PII Detection, Schema Validation, Tool Poisoning Check, Intrusion Detection, Rate Limiting, Payload Size, SQL Injection, Encryption

### UI Changes to `SecurityPoliciesCard.tsx`
- State: `useState` initialized from `localStorage`, falling back to a default seeded set
- "+" button opens a Dialog listing repository templates not yet added
- Each policy row gets a `Switch` toggle for active/inactive and a `Trash2` delete icon
- Status badge changes to reflect active (green) / inactive (muted)

### Gateway Creation Integration
- In `MCPGatewayCard.tsx`, replace the hardcoded `availableSecurityPolicies` array with a prop (`securityPolicies`) passed from `Index.tsx`
- Only policies with `active: true` are shown as checkboxes in the gateway creation dialog

---

## 2. Business Policies Card Enhancements

### Current State
- Static list of 4 hardcoded policies
- "+" button and "..." menu do nothing

### New Behavior
- Clicking "+" opens a dialog to **create a new business policy** with a conditional expression builder
- Expression builder lets users define rules on tool payload attributes:
  - **Attribute** (free-text field, e.g., `invoice.amount`, `vendor.status`)
  - **Operator** (dropdown: equals, not equals, greater than, less than, contains, is empty, is not empty)
  - **Value** (free-text field)
- Multiple conditions can be added per policy (AND logic)
- Each policy has an **Active/Inactive toggle**
- Only active policies appear in gateway creation
- Policies persist in `localStorage` (key: `business-policies`)
- Users can view/edit conditions via the "..." menu and delete policies

### UI for Expression Builder (inside Dialog)
- Policy Name input
- "Add Condition" button that appends a row: `[Attribute input] [Operator select] [Value input] [Remove button]`
- List of configured conditions displayed as compact rows
- Create button saves to state and localStorage

### Gateway Creation Integration
- In `MCPGatewayCard.tsx`, replace hardcoded `availableBusinessPolicies` with a prop (`businessPolicies`) passed from `Index.tsx`
- Only policies with `active: true` shown

---

## 3. State Lifting in Index.tsx

- Create shared state for security policies and business policies in `Index.tsx`
- Pass them as props to `SecurityPoliciesCard`, `BusinessPoliciesCard`, and `MCPGatewayCard`

---

## Technical Details

### Files Modified

1. **`src/components/SecurityPoliciesCard.tsx`** -- Full rewrite
   - Add state management with localStorage persistence
   - Add "Create from Repository" dialog
   - Add Switch toggle per policy for active/inactive
   - Add delete functionality
   - Export the `SecurityPolicy` interface

2. **`src/components/BusinessPoliciesCard.tsx`** -- Full rewrite
   - Add state management with localStorage persistence
   - Add "Create Policy with Conditions" dialog
   - Expression builder UI with attribute/operator/value rows
   - Add Switch toggle and delete
   - Add view/edit conditions via popover or dialog
   - Export the `BusinessPolicy` interface

3. **`src/components/MCPGatewayCard.tsx`** -- Modify
   - Accept `securityPolicies` and `businessPolicies` as props
   - Filter to show only active policies in the gateway creation dialog
   - Remove hardcoded `availableSecurityPolicies` and `availableBusinessPolicies` arrays

4. **`src/pages/Index.tsx`** -- Modify
   - Add state for `securityPolicies` and `businessPolicies` (initialized from localStorage)
   - Pass as props to all three components

### Data Structures

```typescript
// Security Policy
interface SecurityPolicy {
  id: string;
  name: string;
  description: string;
  icon: string; // icon name stored as string for serialization
  active: boolean;
  templateId: string; // reference to repository template
}

// Business Policy
interface BusinessPolicy {
  id: string;
  name: string;
  active: boolean;
  conditions: PolicyCondition[];
}

interface PolicyCondition {
  id: string;
  attribute: string;   // e.g. "invoice.amount"
  operator: string;     // "equals" | "not_equals" | "gt" | "lt" | "contains" | "is_empty" | "is_not_empty"
  value: string;        // e.g. "1000"
}
```
