

# Change MCP Server URL Suffix from `/sse` to `/mcp`

## Change
Update the two hardcoded `mcpServerUrl` values in `src/data/projectsData.ts`:
- `"https://oic-mcp.oracle.com/smart-invoice/sse"` → `"https://oic-mcp.oracle.com/smart-invoice/mcp"`
- `"https://oic-mcp.oracle.com/travel-supply-chain/sse"` → `"https://oic-mcp.oracle.com/travel-supply-chain/mcp"`

No other files need changes — all references read from `currentProject.mcpServerUrl` dynamically.

