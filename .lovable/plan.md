

# Make "Current Status" a Separate Filter Option

## Problem
The "Current Status" summary is always visible above the timeline. The user wants it to be a selectable view alongside 24h/7d/30d — so when "Current Status" is selected, only the live health table shows; when a time range is selected, only the timeline bars show.

## Changes — `src/components/GatewayObserveDashboard.tsx`

1. **Extend `healthTimeRange` state type** from `"24h" | "7d" | "30d"` to `"current" | "24h" | "7d" | "30d"`, defaulting to `"current"`.

2. **Add "Current Status" button** to the time range selector (before 24h/7d/30d).

3. **Conditionally render content**:
   - When `healthTimeRange === "current"`: show only the Current Status summary section (the bordered table with badges, latency, connections, last check).
   - When `healthTimeRange` is `"24h"`, `"7d"`, or `"30d"`: show only the timeline bars (hide the current status summary).

This is a small restructuring of the existing JSX — wrap each section in a conditional based on `healthTimeRange`.

