

# Add New Sidebar Tabs

## Changes

### 1. `src/data/mockData.ts`
Add 6 new entries to `sidebarItems` after Gateway: RPA, HITL, Decision, Healthcare, B2B, Knowledge Base — each with an appropriate Lucide icon.

### 2. `src/components/SidebarNav.tsx`
Add new icons to `iconMap`: `Cog` (RPA), `Users` (HITL), `Scale` (Decision), `Heart` (Healthcare), `Building2` (B2B), `BookOpen` (Knowledge Base — already imported).

### 3. `src/pages/Index.tsx`
Add placeholder `SimpleCard` content in `renderContent()` for each new sidebar item so clicking them shows a basic card.

