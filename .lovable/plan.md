
# Gateway Activate/Deactivate and Edit Functionality

## Overview

Add two capabilities to each gateway in the list:
1. **Activate/Deactivate toggle** -- a status field on each gateway that controls whether its endpoint is available
2. **Edit button** -- opens the same creation form, pre-populated with the gateway's current configuration, allowing changes to name, servers, and policies

When a gateway is deactivated, its endpoint metadata dialog will show the endpoint as unavailable/offline.

---

## Changes

### 1. Data Model -- Add `active` field to `SavedGateway`

```typescript
interface SavedGateway {
  id: string;
  name: string;
  servers: GatewayServer[];
  securityPolicies: string[];
  businessPolicies: string[];
  active: boolean;  // NEW -- defaults to true on creation
}
```

### 2. Gateway List Row -- Add status badge and action buttons

Each gateway row in the list will show:
- A colored status badge: green "Active" or gray "Inactive"
- A **toggle button** (or Switch) to activate/deactivate
- A **pencil/edit button** to open the edit dialog
- The existing delete button

When toggling active/inactive, persist to localStorage immediately.

### 3. Edit Gateway Dialog

- Add state: `editGateway` (the gateway being edited, or null)
- When the edit button is clicked, populate the creation form fields (`gatewayName`, `registeredServers`, `selectedSecurityPolicies`, `selectedBusinessPolicies`) from the saved gateway and open the dialog
- Change the dialog title to "Edit MCP Gateway" and the submit button to "Save Changes"
- On save, update the gateway in the `gateways` array and persist to localStorage (instead of appending a new one)
- Reuse the existing creation dialog by checking whether we're in "create" or "edit" mode

### 4. Deactivated Gateway Behavior

- In the **Endpoint Metadata** detail dialog, if the gateway is inactive:
  - Show a warning banner: "This gateway is deactivated. The endpoint is not available."
  - Display the endpoint URL with a strikethrough or dimmed style
- In the **gateway list row**, inactive gateways appear slightly dimmed

### 5. Observe Tab

- If the gateway is inactive, the Observe dashboard could note the gateway status (minor visual indicator)

---

## Technical Details

### File: `src/components/MCPGatewayCard.tsx`

| Area | Change |
|------|--------|
| `SavedGateway` interface | Add `active: boolean` |
| `handleCreate` | Set `active: true` on new gateways |
| New: `handleToggleActive` | Toggle `active` field, persist to localStorage |
| New: `editGateway` state | Track which gateway is being edited (null = create mode) |
| New: `handleEditClick` | Populate form state from gateway, set `editGateway`, open dialog |
| New: `handleSaveEdit` | Update existing gateway in array, persist to localStorage |
| Dialog title/button | Conditional: "Add MCP Gateway" / "Create Gateway" vs "Edit MCP Gateway" / "Save Changes" |
| Gateway list row | Add Switch or toggle for active/inactive, edit (Pencil) icon button, status badge |
| Detail dialog | Show "Gateway Deactivated" warning banner when `active === false`; dim/strikethrough endpoint URL |
| `resetForm` | Also clear `editGateway` state |

### Gateway Row Layout (updated)

```text
[Icon] Gateway Name                    [Active/Inactive badge] [Toggle] [Edit] [Delete] [>]
       2 servers - 1 security - 1 business
```

### Migration

Existing gateways in localStorage without an `active` field will default to `true` via a fallback: `gw.active !== false` (treating undefined as active).
