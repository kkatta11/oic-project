

# Add Panels to Sidebar Tabs

## Changes — `src/pages/Index.tsx`

### 1. Integrations tab (default case, ~line 73)
Add three `SimpleCard` panels alongside `IntegrationsCard`: Connections, Lookups, Libraries.

### 2. RPA tab (~line 55-56)
Replace single `SimpleCard` with four panels: Robots, Environment Pools, Robot Connection Types, Robot Connections.

### 3. HITL tab (~line 58-59)
Replace single `SimpleCard` with two panels: Workflows, Forms.

### 4. Decision tab (~line 61-62)
Replace single `SimpleCard` with one panel: Decisions.

### 5. Knowledge Base tab (~line 70-71)
Replace single `SimpleCard` with one panel: Knowledge Base.

All new panels use existing `SimpleCard` component with appropriate titles and descriptions. No new components needed.

