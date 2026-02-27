

# Remove Sidebar Items

## Changes — `src/data/mockData.ts`

Remove the following entries from the `sidebarItems` array: `connections`, `lookups`, `libraries`, `schedules`, `packages`.

Keep only: `integrations`, `agent`, `gateway`.

## Changes — `src/pages/Index.tsx`

Remove the now-unused imports: `ConnectionsCard` and `connections` from mockData.

Update `renderContent()` for the default `integrations` case — remove `ConnectionsCard`, `Lookups` SimpleCard, and `Libraries` SimpleCard. Keep only `IntegrationsCard`.

