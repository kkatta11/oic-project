

# Timeline-Based Gateway Health View

## Overview
Replace the current Gateway Health table with a timeline-based uptime view. Each gateway gets a horizontal bar spanning a configurable time period (e.g., last 7 days), color-coded to show uptime (green), degraded (amber), and outage (red) segments. Clicking a segment reveals details about what happened during that period.

## Changes — `src/components/GatewayObserveDashboard.tsx`

### 1. Add mock timeline data
Create a `gatewayUptimeTimeline` dataset for each gateway with hourly/daily segments, each having a status (`healthy`, `degraded`, `down`) and optional incident description (e.g., "MCP Server timeout", "High latency detected").

### 2. Replace Gateway Health table with timeline view
Replace the current table (lines 277-311) with:
- A time range selector (Last 24h / 7 days / 30 days) using tabs or buttons
- For each gateway: a row with the gateway name, overall uptime %, and a horizontal segmented bar representing the time period
- Each segment is color-coded: green = healthy, amber = degraded, red = down
- A tooltip on hover shows the time range and status of each segment
- Keep the current health badge and key stats (latency, active connections) as a summary line below each bar

### 3. Add incident detail dialog
When clicking a red/amber segment, open a dialog showing:
- Time range of the incident
- Status and duration
- Root cause description
- Requests affected count

### 4. Visual design
- Use a horizontal bar chart approach (div-based, not recharts) for precise segment rendering
- Segments use existing design tokens: `--redwood-green`, `--redwood-gold`, `destructive`
- Time labels along the bottom axis
- Overall uptime percentage displayed prominently per gateway

## Technical Details
- Timeline segments rendered as flex divs with proportional widths
- Time range state managed via `useState`
- Mock data generated with a helper function similar to `generateTimeSeriesData`
- Tooltip via existing Radix `Tooltip` component
- Incident dialog via existing `Dialog` component

