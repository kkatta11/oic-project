

# Update Sidebar Icons to Match Reference Screenshot

## Problem
The sidebar icons don't match the reference screenshot. The order and icons need to be updated, and Gateway should move to 9th (last) position.

## Icon Mapping (from screenshot)
Based on the screenshot shapes:

1. **Integration** → `Minimize2` (square with inward corner arrows)
2. **AI Agents** → `Diamond` (diamond/gem shape with dot)
3. **RPA Robot** → `Share2` (connected nodes)
4. **HITL** → `CircleDot` (simple circles representing people)
5. **Decision** → `LayoutGrid` (grid/table pattern)
6. **Healthcare** → `Cross` (medical cross shape)
7. **B2B** → `Building2` (building — keep as-is)
8. **Knowledge Base** → `Library` (bookshelf with shelves)
9. **Gateway** → `ShieldCheck` (keep current icon, move to last)

## Changes

### 1. `src/components/SidebarNav.tsx`
- Update imports: add `Minimize2`, `Diamond`, `Share2`, `CircleDot`, `LayoutGrid`, `Cross`; remove unused icons (`GitBranch`, `Bot`, `Cog`, `Users`, `Scale`, `Heart`, `BookOpen`)
- Update `iconMap` with the new icon references

### 2. `src/data/mockData.ts`
- Reorder `sidebarItems`: move gateway to position 9
- Update icon string references:
  - integrations: `"Minimize2"`
  - agent: `"Diamond"`
  - rpa: `"Share2"`
  - hitl: `"CircleDot"`
  - decision: `"LayoutGrid"`
  - healthcare: `"Cross"`
  - b2b: `"Building2"` (unchanged)
  - knowledge: `"Library"`
  - gateway: `"ShieldCheck"` (unchanged, moved to last)

