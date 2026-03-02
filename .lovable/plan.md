

# Add Current Gateway Health Summary to Timeline View

## Problem
The timeline view replaced the original Gateway Health table, so the current real-time health status (Healthy/Degraded/Down badge, last check time) is no longer visible.

## Solution
Add a "Current Status" summary section above the timeline bars, showing each gateway's live health status as a compact row with status badge, last check timestamp, and key metrics — using the existing `gatewayHealth` data.

## Changes — `src/components/GatewayObserveDashboard.tsx`

1. **Add a current-status summary section** at the top of the Gateway Health tab content (before the timeline bars), rendering each gateway as a compact row with:
   - Health status badge (Healthy/Degraded/Down) using existing `healthBadge()` helper
   - Last check timestamp from `gatewayHealth` data
   - P50/P99 latency and active connections (already in data)

2. **Layout**: A small card or bordered section titled "Current Status" with a simple horizontal layout per gateway, placed between the card header (with time range selector) and the timeline bars.

This is additive — the timeline view remains unchanged; we just restore visibility of the live health snapshot above it.

