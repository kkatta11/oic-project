# Replace Three-Dots Button with Dropdown Menu on MCP Servers

## Overview

Replace the current `MoreHorizontal` button (which directly opens the edit dialog) with a proper dropdown menu containing **Edit** and **Refresh Metadata** actions.

## Changes

### File: `src/components/MCPServersCard.tsx`

**1. Import additions**

Add `DropdownMenu`, `DropdownMenuContent`, `DropdownMenuItem`, `DropdownMenuTrigger` from the existing dropdown-menu component. Add `Pencil` and `RefreshCw` icons from lucide-react.

**2. Refresh Metadata handler**

Add a `handleRefreshMetadata(server)` function that:

- Sets a temporary "refreshing" state for that server (show a spinner or brief loading indicator)
- Simulates re-fetching tools from the server endpoint (reuses `getToolsForServer`)
- Updates the server's `allTools` with the fresh set
- Preserves currently selected tools where IDs still exist; auto-selects any new tools
- Updates the server in state and syncs the tool filter security policy

**3. Server row UI update (lines 578–601)**

Replace the current standalone `Trash2` and `MoreHorizontal` buttons with a single `DropdownMenu`:

```
[Icon] Server Name    [tools count]  [StatusBadge]  [⋯ dropdown]
```

Dropdown items:

- **Edit** (Pencil icon) — calls existing `handleEditClick(server)`
- **Refresh Metadata** (RefreshCw icon) — calls new `handleRefreshMetadata(server)`
- Separator
- **Delete** (Trash2 icon, destructive style) — calls existing `handleRemove(server.id)`

**4. Refreshing state**

Add `refreshingServerId` state (`string | null`). While refreshing, the dropdown trigger shows a spinner instead of the dots icon for that server. The refresh completes after the simulated delay (~800ms).