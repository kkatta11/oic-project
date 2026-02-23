
# Fix Business Policy Condition Builder: Focus Bug and Declarative Attribute Picker

## Problems Identified

1. **Focus loss while typing**: The `ConditionBuilder` is defined as an inline component function inside `BusinessPoliciesCard`. Every keystroke triggers a state update, which re-creates the `ConditionBuilder` function, causing React to unmount and remount it -- losing input focus.

2. **No tool/payload browsing**: The attribute field is a plain free-text input with no way to browse available MCP server tools and their payload attributes.

---

## Solution

### 1. Fix Focus Loss

Move `ConditionBuilder` out of the component body. Instead of defining it as an inner function component, inline the JSX directly where it's used (in both create and edit dialogs), or extract it as a standalone component that receives stable props. The simplest fix is to inline the condition rows directly into the dialog JSX -- no wrapper component needed.

### 2. Add Declarative Attribute Picker

Add a "Browse" button next to each condition's attribute field. Clicking it opens a popover that shows:

- A list of MCP servers (from props)
- Under each server, its tools
- Under each tool, mock payload attributes (e.g., `amount`, `status`, `vendor_id`)

When a user clicks an attribute, it auto-fills the attribute field with a namespaced path like `ServerName.ToolName.attribute`.

This gives users a declarative way to pick attributes instead of typing them manually, while still allowing free-text input for custom attributes.

### 3. Mock Payload Schema

Each tool will have a simulated set of payload attributes, for example:
- `List Files` -> `path`, `recursive`, `pattern`
- `Send Message` -> `channel`, `message`, `thread_id`
- `Run Query` -> `query`, `database`, `timeout`

A static mapping `toolPayloadAttributes` will provide these.

---

## Technical Details

### Files Modified

**`src/components/BusinessPoliciesCard.tsx`** -- Primary changes:

1. Remove the inner `ConditionBuilder` function component. Inline the condition-building JSX directly into both dialogs.
2. Accept `mcpServers` as a new prop (`MCPServer[]`).
3. Add a `toolPayloadAttributes` map providing mock attribute names per tool.
4. Add a "Browse" button (folder/search icon) next to each attribute input that opens a Popover with a tree: Server -> Tool -> Attributes.
5. Clicking an attribute auto-fills the input with `ServerName.ToolName.attributeName`.

**`src/pages/Index.tsx`** -- Minor change:

1. Pass `mcpServers` prop to `BusinessPoliciesCard`.

### Attribute Browsing UI

Each condition row will look like:

```
[Browse icon] [Attribute input (pre-filled or free-text)] [Operator select] [Value input] [X]
```

The Browse popover will display:

```
Server: Filesystem
  Tool: List Files
    - path
    - recursive
    - pattern
  Tool: Read File
    - file_path
    - encoding
Server: PostgreSQL
  Tool: Run Query
    - query
    - database
    ...
```

Clicking an attribute like `path` under `List Files` under `Filesystem` sets the attribute field to `Filesystem.ListFiles.path`.

### Mock Payload Data

```typescript
const toolPayloadAttributes: Record<string, string[]> = {
  "List Files": ["path", "recursive", "pattern"],
  "Read File": ["file_path", "encoding"],
  "Write File": ["file_path", "content", "overwrite"],
  "Delete File": ["file_path", "force"],
  "Run Query": ["query", "database", "timeout"],
  "List Tables": ["schema", "include_views"],
  "Send Message": ["channel", "message", "thread_id"],
  "Send Email": ["to", "subject", "body", "cc"],
  // ... one entry per known tool
};
```
