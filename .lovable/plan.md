

# Add Sample Connections to Integrations Tab

## Changes — `src/pages/Index.tsx`

1. Import `ConnectionsCard` and `connections` from their respective modules.
2. Replace the `SimpleCard` for "Connections" (line 92) with `<ConnectionsCard connections={connections} />`.

Two lines added to imports, one line replaced in `renderContent()`.

