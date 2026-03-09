

# Add Project-Specific Tools to ToolsCard

## Problem
The ToolsCard shows the same invoice-related tools (Risk Assessment, Get Invoice Details, etc.) for all projects, including "Travel Industry Supply Chain" where they are irrelevant.

## Solution
Make ToolsCard project-aware by defining per-project tool sets and passing the tools as a prop.

## Changes

### 1. `src/components/ToolsCard.tsx`
- Keep `nativeTools` as the default (Smart Invoice) tools export.
- Add a new exported array `travelTools` with supply-chain-relevant tools:
  - **Track Shipment** (Ship icon)
  - **Route Optimizer** (Globe icon)  
  - **Inventory Check** (Package icon)
  - **Validate Customs** (ShieldCheck icon)
  - **Supplier Lookup** (Search icon)
  - **Estimate Delivery** (Clock icon)
- Accept an optional `tools` prop; fall back to `nativeTools` if not provided.

### 2. `src/data/projectsData.ts`
- Import and add `travelTools` to the travel project data returned by `getProjectData`.
- Add `tools` field to the return type of `getProjectData`.

### 3. `src/pages/Index.tsx`
- Pass `projectData.tools` to `<ToolsCard tools={...} />`.

### 4. Update `nativeTools` references
- `MCPGatewayCard.tsx`, `BusinessPoliciesCard.tsx`, and `SecurityPoliciesCard.tsx` import `nativeTools` for policy configuration. These should also receive project-specific tools. Pass tools via props or use `projectData.tools` where available. Since these components already receive `projectId`, add a `nativeTools` prop to them as well.

