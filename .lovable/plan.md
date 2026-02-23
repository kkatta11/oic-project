# Add Agent and Gateway Tabs with Card Content

## Overview

## Changes

### 2. Agent Tab Content (4 SimpleCards in 2x2 grid)

- **Agents** -- "Create and manage AI agents for your integration workflows."
- **Tools** -- "Define tools and capabilities available to your agents."
- **Agent Patterns** -- "Configure reusable patterns for agent behavior."
- **Prompt Templates** -- "Design and manage prompt templates for agent interactions."

All cards include the existing Add (+) button.

### 3. Gateway Tab Content (4 SimpleCards in 2x2 grid)

- **MCP Gateway** -- "Manage your Model Context Protocol gateway configuration."
- **MCP Servers** -- "Configure and monitor MCP server connections."
- **Security Policies** -- "Define security rules and access controls."
- **Business Policies** -- "Set up business rules and policy enforcement."

All cards include the existing Add (+) button.

### 4. Sidebar Icon Updates

- 2nd sidebar item: Change from "Connections" / Plug icon to **Bot** icon (for Agent tab)
- 3rd sidebar item: Change from "Lookups" / Search icon to **Shield** icon (for Gateway tab)

## Technical Details

### Files Modified

`**src/data/mockData.ts**`

- Add `agentSidebarItems` array with 4 items and appropriate Lucide icons
- Add `gatewaySidebarItems` array with 4 items and appropriate Lucide icons

`**src/components/SidebarNav.tsx**`

- Add new icon imports: `Bot`, `Wrench`, `Workflow`, `FileText`, `Network`, `Server`, `ShieldCheck`, `BookOpen`
- Register them in the `iconMap`

`**src/pages/Index.tsx**`

- Import `agentSidebarItems` and `gatewaySidebarItems` from mockData
- Conditionally render sidebar items and card content based on `activeTab`
- Agent tab: render 4 SimpleCards (Agents, Tools, Agent Patterns, Prompt Templates)
- Gateway tab: render 4 SimpleCards (MCP Gateway, MCP Servers, Security Policies, Business Policies)
- Reset `activeSidebarItem` when switching tabs