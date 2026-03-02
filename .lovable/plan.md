

# Add Table Headers to Gateway Health Current Status

## Change — `src/components/GatewayObserveDashboard.tsx`

Replace the current status section (lines 375-395) to use a proper HTML table with headers instead of flex divs.

**Table columns**: Gateway Name | Status | P50 Latency | P99 Latency | Active Connections | Last Check

Use the existing `Table`, `TableHeader`, `TableHead`, `TableRow`, `TableBody`, `TableCell` components from `@/components/ui/table` for consistent styling with the rest of the app.

