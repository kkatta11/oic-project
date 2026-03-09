

# Add Projects Listing Page with Navigation

## Summary

Add a top-level "Projects" page matching the Oracle Integration screenshot. The current detail view becomes a project-specific page. Two projects: the existing "Smart Invoice Validation AgAI" and a new project (e.g., "Travel Industry Supply Chain") with one MCP gateway and a set of tools.

## Changes

### 1. Create `src/pages/Projects.tsx` — Projects listing page

A full-page view with:
- `OracleHeader` at top, gold gradient bar
- Left sidebar with navigation items matching the screenshot (Home, Projects, Design, B2B, Healthcare, Observability, Settings, Visual Builder, Process) — "Projects" highlighted
- Main content: "Projects" title, count, search/filter icons, table with columns: Name, Type, Last updated
- Two project rows:
  1. **Smart Invoice Validation AgAI** — Type: "Developed", Last updated: "Mar 3, 2026 03:10:40 PM IST", subtitle: "DO NOT MODIFY. USED FOR DEMOS"
  2. **Travel Industry Supply Chain** — Type: "Developed", Last updated: "Mar 7, 2026 08:41:17 AM IST"
- Clicking a project name navigates to `/project/:id`

### 2. Create `src/data/projectsData.ts` — Project definitions

Define a projects array and per-project data:
- Project 1 (`smart-invoice`): Uses existing `mockData` integrations/connections, existing MCP servers, tools, policies
- Project 2 (`travel-supply-chain`): Has one MCP gateway with a few servers, a unique set of tools (e.g., "Track Shipment", "Validate Customs", "Route Optimizer"), minimal integrations/connections

### 3. Update `src/pages/Index.tsx` → `src/pages/ProjectDetail.tsx`

- Rename conceptually (or keep file, add route param)
- Read `projectId` from URL params
- Load project-specific data (integrations, connections, MCP servers, tools) based on project ID
- Add a breadcrumb or back link "← Projects" at the top to navigate back

### 4. Update `src/App.tsx` — Add routes

```
<Route path="/" element={<Projects />} />
<Route path="/project/:projectId" element={<Index />} />
```

### 5. Create `src/components/ProjectsSidebar.tsx`

A wider sidebar (matching screenshot) with labeled nav items: Home, Projects, Design, B2B, Healthcare, Observability, Settings, Visual Builder, Process — with chevrons for expandable items.

### 6. Project 2 data — "Travel Industry Supply Chain"

- 1 MCP Gateway: "Supply Chain Gateway"
- MCP Servers: e.g., "Oracle SCM Cloud", "Logistics API"
- Tools: "Track Shipment", "Validate Customs Declaration", "Route Optimizer", "Inventory Check", "Supplier Lookup"
- A few integrations and connections relevant to supply chain

## Technical Notes

- The existing `Index.tsx` state management stays intact for Project 1; Project 2 gets its own default data sets
- Project selection is via URL routing (`/project/smart-invoice`, `/project/travel-supply-chain`)
- The projects sidebar is distinct from the in-project sidebar (wider, text labels, different items)

