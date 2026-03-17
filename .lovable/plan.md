

# Add Project "Edit Details" Dialog with MCP Server Toggle

## Summary
Add an "Edit details" dialog triggered by the Pencil icon on the project page, matching the screenshot reference. The dialog includes project metadata fields and an "Enable MCP server" checkbox that reveals the server URL.

## Data Model Changes (`src/data/projectsData.ts`)
- Extend the `Project` interface with: `identifier`, `description`, `keywords`, `mcpServerEnabled`, `mcpServerUrl`, `createdBy`, `createdOn`
- Populate these fields for both existing projects with realistic mock data

## UI Changes (`src/pages/Index.tsx`)
1. **Wire Pencil button** to open a Dialog containing the edit form
2. **Dialog content** (matching the screenshot):
   - **Name** — editable text input
   - **Identifier** — editable text input (auto-generated uppercase snake_case from name)
   - **Description** — editable textarea
   - **Generate** button (placeholder, no-op for now)
   - **Keywords** — editable text input
   - **Enable MCP server** — Checkbox; when checked, displays the MCP server URL with a copy-to-clipboard button
   - **Created by** — read-only text
   - **Created on** — read-only text
   - **Last updated** — read-only text
   - **Cancel / Save changes** buttons in footer
3. **State**: Local component state for the dialog form fields. "Save changes" updates the in-memory project data (no persistence beyond session).
4. **Styling**: Oracle Redwood theme — gold/brown label colors for field labels like "Name:", "Identifier:", "Description:", matching the screenshot's aesthetic with bordered input groups.

## Components Used
- `Dialog`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogFooter` from existing UI library
- `Input`, `Textarea`, `Checkbox`, `Button` from existing UI library
- Copy icon button for the MCP server URL

