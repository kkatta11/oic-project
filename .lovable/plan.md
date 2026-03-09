

# Replace Sidebar Icons with Custom Image Assets

## Problem
The sidebar currently uses Lucide icons. The user has provided 8 custom icon images that should replace positions 1-8, while keeping position 9 (Gateway / ShieldCheck) as the existing Lucide icon.

## Icon Mapping
1. `image-4.png` → Integration
2. `image-5.png` → AI Agents
3. `image-6.png` → RPA Robot
4. `image-7.png` → Human in the Loop
5. `image-8.png` → Decision
6. `image-9.png` → Healthcare
7. `image-10.png` → B2B
8. `image-11.png` → Knowledge Base
9. Gateway → keep `ShieldCheck` Lucide icon

## Changes

### 1. Copy images to `src/assets/sidebar/`
Copy all 8 uploaded images with descriptive names:
- `integration.png`, `ai-agents.png`, `rpa-robot.png`, `hitl.png`, `decision.png`, `healthcare.png`, `b2b.png`, `knowledge-base.png`

### 2. `src/data/mockData.ts`
- Update icon strings for items 1-8 to use new asset identifiers (e.g., `"integration"`, `"ai-agents"`, etc.)
- Keep gateway as `"ShieldCheck"`

### 3. `src/components/SidebarNav.tsx`
- Import all 8 images from `@/assets/sidebar/`
- Create an `imageIconMap` mapping the new string keys to imported image paths
- Keep `ShieldCheck` in a separate Lucide icon map
- In the render, check if the icon is a custom image or Lucide icon:
  - Custom image → render `<img src={...} alt={label} className="w-5 h-5" />`
  - Lucide icon → render `<Icon size={20} />` as before

