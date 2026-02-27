

# Standardize Status Badges and Dropdown Action Menus Across All Cards

## Overview

Replace the toggle switches, standalone edit buttons, and delete icon buttons across all four card components with a consistent pattern: a `StatusBadge` (Active/Configured or Active/Inactive) and a three-dots `DropdownMenu` for all actions.

## Changes

### 1. `src/components/MCPServersCard.tsx`

**Add Activate/Deactivate to dropdown menu:**

The MCP Servers card already has the dropdown menu pattern. Changes needed:
- Add "Activate" / "Deactivate" menu item to the existing dropdown (calls a toggle on `server.status` between "Active" and "Configured")
- Remove the `Switch` from the Edit dialog's status section (lines 605-617), replacing it with a simpler display or removing the status toggle entirely from the edit dialog since activation is now in the dropdown
- The `StatusBadge` component already exists and renders Active/Configured states -- no change needed there

Updated dropdown items:
- Edit
- Refresh Metadata
- Separator
- Activate / Deactivate (dynamic label based on current status)
- Separator
- Remove (destructive)

**Add toggle handler:**
```typescript
const handleToggleStatus = (serverId: string) => {
  const updated = servers.map((s) =>
    s.id === serverId
      ? { ...s, status: s.status === "Active" ? "Configured" : "Active" }
      : s
  );
  updateServers(updated);
};
```

### 2. `src/components/MCPGatewayCard.tsx`

**Import changes:** Add `MoreHorizontal` from lucide-react. Add `DropdownMenu`, `DropdownMenuContent`, `DropdownMenuItem`, `DropdownMenuSeparator`, `DropdownMenuTrigger` from the dropdown-menu component.

**Replace gateway row controls (lines 700-712):**

Remove the `Switch`, `Pencil` button, `Trash2` button, and replace with:
- A `StatusBadge` showing "Active" or "Inactive" (already has the `Badge` but switch to the same `StatusBadge` pattern from MCPServersCard for consistency)
- A three-dots `DropdownMenu` with:
  - Edit
  - Separator
  - Activate / Deactivate (dynamic)
  - Separator
  - Delete (destructive)

**Refactor handlers:** Remove `e.stopPropagation()` dependency from `handleToggleActive` and `handleDeleteGateway` -- instead call `e.stopPropagation()` within the dropdown item `onClick` or on the trigger.

**Add StatusBadge component** (same pattern as MCPServersCard, using "Active"/"Inactive" labels with green/olive colors).

### 3. `src/components/SecurityPoliciesCard.tsx`

**Import changes:** Add `MoreHorizontal` from lucide-react. Add `DropdownMenu`, `DropdownMenuContent`, `DropdownMenuItem`, `DropdownMenuSeparator`, `DropdownMenuTrigger`.

**Replace policy row controls (lines 474-482):**

Remove the `Switch` and standalone `Pencil`/`Trash2` buttons. Replace with:
- A `StatusBadge` showing "Active" or "Configured" based on `policy.active`
- A three-dots `DropdownMenu` with:
  - Edit (only if `hasEditableConfig`)
  - Separator (only if edit shown)
  - Activate / Deactivate (dynamic)
  - Separator
  - Delete (destructive)

**Add StatusBadge component** (same green/olive pattern).

### 4. `src/components/BusinessPoliciesCard.tsx`

**Import changes:** Add `MoreHorizontal, Pencil` from lucide-react. Add `DropdownMenu`, `DropdownMenuContent`, `DropdownMenuItem`, `DropdownMenuSeparator`, `DropdownMenuTrigger`.

**Replace policy row controls (lines 484-488):**

Remove the `Switch` and `Trash2` button. Replace with:
- A `StatusBadge` showing "Active" or "Configured" based on `policy.active`
- A three-dots `DropdownMenu` with:
  - Edit (calls existing `openEdit(policy)`)
  - Separator
  - Activate / Deactivate (dynamic)
  - Separator
  - Delete (destructive)

Keep the existing `Eye` popover for viewing details -- it stays as-is.

**Add StatusBadge component** (same pattern).

## Consistent StatusBadge Pattern

All four components will use the same styling:

```typescript
const StatusBadge = ({ status }: { status: string }) => {
  const isActive = status === "Active";
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${
      isActive
        ? "bg-redwood-green-light text-redwood-green"
        : "bg-redwood-olive-light text-redwood-olive"
    }`}>
      {status}
    </span>
  );
};
```

## Consistent Row Layout

All card item rows follow:
```text
[Icon] Name + description    [StatusBadge]  [⋯ dropdown]
```

## Summary of Removals
- All `Switch` toggle components from item rows (and import cleanup where no longer used)
- All standalone `Trash2` icon buttons from item rows
- All standalone `Pencil` icon buttons from item rows
- Status toggle section from MCP Servers edit dialog

