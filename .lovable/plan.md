

# Add MCP Server Name to Observe → Instances Table

## Overview

Add an "MCP Server" column to the Instances table in the Observe dashboard so users can see which MCP server handled each request instance.

## Changes

### File: `src/components/GatewayObserveDashboard.tsx`

**1. Add "MCP Server" column header** (line 247)

Insert a new `<TableHead>MCP Server</TableHead>` between "Gateway" and "Tool Name".

**2. Add MCP Server cell** (line 258)

Insert a new `<TableCell>` between Gateway and Tool Name that derives the server name from the instance's flow:

```typescript
<TableCell className="text-sm">
  {inst.flow.find(s => s.type === "mcp")?.name ?? "—"}
</TableCell>
```

This extracts the MCP server name from the flow step with `type: "mcp"` — no data model changes needed since all instances already have this information in their flow arrays (e.g. "Slack MCP Server", "GitHub MCP Server", etc.).

### Result

The Instances table columns become:

```
Timestamp | Gateway | MCP Server | Tool Name | Status | Duration | View
```

