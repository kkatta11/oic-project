
# Gateway Observe Tab -- Monitoring Dashboard

## Overview
When the user selects the "Observe" top tab while the "Gateway" sidebar item is active, the main content area will switch from the design-time cards to a runtime monitoring view with three sections: Gateways metrics matrix, Instances table, and an Instance Detail visualization dialog.

## Changes

### 1. Gateways Metrics Card
A card showing a summary matrix for each configured gateway with columns:
- **Gateway Name**
- **Received** (total requests)
- **Processed** (currently processing)
- **Succeeded** (completed successfully)
- **Errored** (failed)

Each metric displayed as a colored number in a grid/table layout. Uses mock data for several gateways.

### 2. Gateway Instances Card
A table listing individual gateway invocations with columns:
- **Timestamp** (e.g., "2026-02-23 10:15:32")
- **Gateway** (name of the gateway)
- **Tool Name** (which tool was invoked)
- **Status** (Succeeded / Failed / Running -- shown as colored badge)
- **Duration** (e.g., "1.2s")
- **View** icon button (Eye icon) to open the detail dialog

### 3. Instance Detail Dialog (Flow Visualization)
Clicking the View icon opens a Dialog showing an end-to-end request-to-response flow:
- A vertical timeline/step visualization showing each artifact that executed in sequence:
  1. Request Received
  2. Security Policy checks (e.g., PII Detection, Schema Validation) with pass/fail and duration
  3. Business Policy checks with pass/fail and duration
  4. MCP Server invocation with duration
  5. Response Sent
- Each step shows: artifact name, status (passed/failed), and time taken
- Total duration displayed at the bottom

### 4. Audit Log Card
A card showing recent create/update/delete operations on gateway design-time artifacts:
- Columns: **Timestamp**, **Action** (Created/Updated/Deleted), **Artifact Type** (Gateway/MCP Server/Security Policy/Business Policy), **Name**, **User**
- Mock data with ~6 audit entries

### 5. Index.tsx Logic Update
The `renderContent` function will check both `activeTab` and `activeSidebarItem`:
- When `activeTab === "Observe"` AND `activeSidebarItem === "gateway"`: render the Observe components
- Otherwise keep existing behavior (Design tab content)

## Technical Details

### New Files
- `src/components/GatewayObserveDashboard.tsx` -- Single component containing all four sections (Gateways Metrics, Instances table, Audit log). Uses inline mock data. Contains the instance detail dialog with flow visualization.

### Modified Files
- `src/pages/Index.tsx` -- Import `GatewayObserveDashboard`, update `renderContent` to check `activeTab === "Observe" && activeSidebarItem === "gateway"` and render the observe dashboard. For other Observe tab + sidebar combinations, show a placeholder.

### Mock Data (inline in GatewayObserveDashboard)
- `gatewayMetrics`: Array of gateway stats (name, received, processed, succeeded, errored)
- `gatewayInstances`: Array of instance records (id, timestamp, gateway, toolName, status, duration, flow steps)
- `auditLog`: Array of audit entries (timestamp, action, artifactType, name, user)

### UI Patterns
- Metrics matrix uses the existing card + table styling
- Instances table uses the existing Table components from `@/components/ui/table`
- Status badges use the existing Badge component with color variants
- Flow visualization in the detail dialog uses a vertical list with connecting lines (CSS borders), step icons, and duration labels
- All styling consistent with the Oracle Redwood design tokens already in use
