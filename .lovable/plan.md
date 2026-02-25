

# Add Search to Browse Catalog Tab

## Overview

Add a search input to the "Browse Catalog" tab in the MCP Servers dialog, allowing users to filter catalog servers by name or description.

## Changes

### File: `src/components/MCPServersCard.tsx`

**1. Add `Search` icon import** — add to the existing lucide-react import line.

**2. New state variable** — `catalogSearch` (`string`, default `""`) to track the search query. Reset it in `resetForm`.

**3. Search input in catalog tab** — Insert a search input with a `Search` icon above the catalog list (lines 457-458), styled consistently with the existing search bar in the app.

**4. Filter catalog list** — Replace `catalogServers.map(...)` with a filtered list:
```typescript
const filteredCatalog = catalogServers.filter(
  (s) =>
    s.name.toLowerCase().includes(catalogSearch.toLowerCase()) ||
    s.description.toLowerCase().includes(catalogSearch.toLowerCase())
);
```

Render `filteredCatalog.map(...)` instead, and show an empty state message when no results match.

### UI Layout

```text
┌─────────────────────────────┐
│ Browse Catalog              │
│ ┌─────────────────────────┐ │
│ │ 🔍 Search servers...    │ │
│ └─────────────────────────┘ │
│ ┌─────────────────────────┐ │
│ │ Slack MCP Server    [+] │ │
│ │ GitHub MCP Server   [+] │ │
│ │ ...                     │ │
│ └─────────────────────────┘ │
└─────────────────────────────┘
```

