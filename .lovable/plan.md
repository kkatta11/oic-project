

# Add "Select All" to Tools Filter

## Change — `src/components/SecurityPoliciesCard.tsx`

In the Tools Filter dialog, add a "Select All / Deselect All" checkbox above the tools list (lines 1032-1049).

**Location**: Between the `<Label>` showing "Include Tools (X of Y included)" and the tools checklist div.

**Implementation**:
- Replace the static `<Label>` with a row containing a `Checkbox` + label text "Include Tools (X of Y included)"
- The checkbox state: checked when all tools are selected, indeterminate when some are selected, unchecked when none are selected
- On toggle: if not all selected → select all (`setToolsFilterIncluded(new Set(serverTools.map(t => t.id)))`), otherwise deselect all (`setToolsFilterIncluded(new Set())`)

This is a single edit of ~10 lines in the tools list section.

