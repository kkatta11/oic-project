
# Enrich Agent and Gateway Tab Cards with Detailed Content

## Overview
Replace the simple description-only cards for Tools, MCP Servers, Security Policies, and Business Policies with rich list-based cards showing specific items. Add an "Add MCP Server" dialog with options for creating a new server or browsing a catalog.

## Changes

### 1. Tools Card (Agent tab)
Create a new `ToolsCard` component (similar to IntegrationsCard pattern) listing 6 tools:
1. Risk Assessment
2. Get Invoice Details
3. Contract Search
4. Validate and Create Invoice
5. Extract Invoice Data
6. Match PO

Each tool shown as a row with an icon, name, and action menu. Header has an Add (+) button.

### 2. MCP Servers Card (Gateway tab)
Create a new `MCPServersCard` component listing 1-2 pre-configured servers (e.g., "Filesystem MCP Server", "PostgreSQL MCP Server") with status badges.

Includes an Add (+) button that opens a **Dialog** with two options:
- **Register New Server** -- form with fields for Server Name, URL, Transport Type (Streamable HTTP), and Authorization (dropdown: None, API Key, JWT, Client Credentials)
- **Browse Catalog** -- a list view of community MCP servers the user can connect to

### 3. Security Policies Card (Gateway tab)
Create a new `SecurityPoliciesCard` component listing 8 policies as toggleable rows:
1. PII Detection -- Scan for sensitive data
2. Schema Validation -- Ensure format compliance
3. Tool Poisoning Check -- Detect malicious payloads
4. Intrusion Detection -- Identify suspicious patterns
5. Rate Limiting -- Check quota consumption
6. Payload Size -- Validate request size
7. SQL Injection -- Detect injection attempts
8. Encryption -- Prepare encrypted transmission

Each row shows: policy name, description, and a status indicator (enabled/disabled style).

### 4. Business Policies Card (Gateway tab)
Create a new `BusinessPoliciesCard` component listing 4 policies:
1. Invoice Amount Check
2. No Line Items
3. Variance Tolerance
4. Vendor Validation

Each row shows a policy name with an action menu.

### 5. Update Index.tsx
Replace the `SimpleCard` usage for these specific cards with the new dedicated components in the `renderContent` function. The Agents, Agent Patterns, and Prompt Templates cards remain as SimpleCards. MCP Gateway also remains as a SimpleCard.

## Technical Details

### New Files
- `src/components/ToolsCard.tsx` -- List card with 6 tool items, follows IntegrationsCard pattern
- `src/components/MCPServersCard.tsx` -- List card with 1-2 servers + Add dialog (using Radix Dialog) with Register New / Browse Catalog tabs
- `src/components/SecurityPoliciesCard.tsx` -- List card with 8 policy rows showing name + description
- `src/components/BusinessPoliciesCard.tsx` -- List card with 4 policy rows

### Modified Files
- `src/pages/Index.tsx` -- Import new card components; update `renderContent()` to use them for Agent and Gateway sidebar items instead of generic SimpleCards

### Patterns
- All new cards follow the existing card styling: `rounded-lg border border-border bg-card shadow-sm`, header with Plus button, `divide-y divide-border` rows
- MCP Server Add dialog uses existing Radix `Dialog` component already installed
- Mock data for tools, servers, and policies will be defined inline in each component (keeps it simple and self-contained)
