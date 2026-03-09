

# Add "Expand All / Collapse All" Toggle to Instance Flow Dialog

## Problem
Currently, each flow step must be expanded individually, making it tedious to review all details at once.

## Change — `src/components/GatewayObserveDashboard.tsx`

### 1. Replace `expandedStep: number | null` with `expandedSteps: Set<number>`
- Change state from single-step tracking to a set of expanded step indices.
- Update all references: `isExpanded` checks membership in the set, click toggles add/remove from the set.

### 2. Add "Expand All / Collapse All" button
- Place a small button in the dialog header area (next to the title or below the description), labeled "Expand All" or "Collapse All" depending on current state.
- "Expand All" adds all step indices (that have detail) to the set.
- "Collapse All" clears the set.

### 3. Update dialog close handler
- Reset `expandedSteps` to empty set on dialog close (replacing current `setExpandedStep(null)`).

## UI
- A single text button (ghost variant, small size) reading "Expand All" / "Collapse All" positioned after the dialog description line.

