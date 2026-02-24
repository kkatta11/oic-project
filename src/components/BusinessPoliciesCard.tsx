import { useState } from "react";
import { Plus, Trash2, X, ListChecks, Eye, FolderSearch, Wrench } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import type { MCPServer } from "@/components/MCPServersCard";

export interface PolicyCondition {
  id: string;
  attribute: string;
  operator: string;
  value: string;
}

export interface BusinessPolicy {
  id: string;
  name: string;
  active: boolean;
  selectedTools: string[]; // e.g. ["ServerName.ToolName", ...]
  conditions: PolicyCondition[];
}

const STORAGE_KEY = "business-policies";
const operators = [
  { value: "equals", label: "Equals" },
  { value: "not_equals", label: "Not Equals" },
  { value: "gt", label: "Greater Than" },
  { value: "lt", label: "Less Than" },
  { value: "contains", label: "Contains" },
  { value: "is_empty", label: "Is Empty" },
  { value: "is_not_empty", label: "Is Not Empty" },
];

const toolPayloadAttributes: Record<string, string[]> = {
  "List Files": ["path", "recursive", "pattern"],
  "Read File": ["file_path", "encoding"],
  "Write File": ["file_path", "content", "overwrite"],
  "Delete File": ["file_path", "force"],
  "Run Query": ["query", "database", "timeout"],
  "List Tables": ["schema", "include_views"],
  "Send Message": ["channel", "message", "thread_id"],
  "List Channels": ["limit", "cursor"],
  "Search Messages": ["query", "channel", "sort"],
  "Upload File": ["file", "channel", "title"],
  "Send Email": ["to", "subject", "body", "cc"],
  "Search Emails": ["query", "max_results", "label"],
  "Get Thread": ["thread_id", "format"],
  "Create Draft": ["to", "subject", "body"],
  "List Repos": ["org", "type", "sort"],
  "Create Issue": ["repo", "title", "body", "labels"],
  "Get PR": ["repo", "pr_number"],
  "Search Code": ["query", "repo", "language"],
  "Query Database": ["database_id", "filter", "sorts"],
  "Create Page": ["parent_id", "title", "content"],
  "Update Page": ["page_id", "properties"],
  "Search": ["query", "filter", "sort"],
  "Execute": ["action", "parameters"],
  "Query": ["query", "format"],
  "List Resources": ["type", "limit"],
};

export function loadBusinessPolicies(): BusinessPolicy[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  return [];
}

export function saveBusinessPolicies(policies: BusinessPolicy[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(policies));
}

// --- Attribute Picker Popover (standalone) ---
interface AttributePickerProps {
  mcpServers: MCPServer[];
  onSelect: (attribute: string) => void;
}

const AttributePicker = ({ mcpServers, onSelect }: AttributePickerProps) => {
  const [open, setOpen] = useState(false);

  const handleSelect = (serverName: string, toolName: string, attr: string) => {
    const ns = serverName.replace(/\s+/g, "");
    const tn = toolName.replace(/\s+/g, "");
    onSelect(`${ns}.${tn}.${attr}`);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button type="button" className="text-muted-foreground hover:text-foreground shrink-0" title="Browse attributes">
          <FolderSearch size={14} />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-0" align="start">
        <ScrollArea className="max-h-64">
          <div className="p-2 space-y-1">
            {mcpServers.length === 0 && (
              <p className="text-xs text-muted-foreground p-2">No MCP servers configured.</p>
            )}
            {mcpServers.map((server) => (
              <div key={server.id}>
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide px-2 pt-2 pb-1">{server.name}</p>
                {server.tools.length === 0 && (
                  <p className="text-xs text-muted-foreground px-4 pb-1">No tools</p>
                )}
                {server.tools.map((tool) => {
                  const attrs = toolPayloadAttributes[tool.name] || [];
                  if (attrs.length === 0) return null;
                  return (
                    <div key={tool.id} className="ml-2">
                      <p className="text-xs font-medium text-foreground px-2 py-0.5">{tool.name}</p>
                      {attrs.map((attr) => (
                        <button
                          key={attr}
                          type="button"
                          className="block w-full text-left text-xs px-4 py-1 rounded hover:bg-accent hover:text-accent-foreground text-muted-foreground"
                          onClick={() => handleSelect(server.name, tool.name, attr)}
                        >
                          {attr}
                        </button>
                      ))}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};

// --- Condition Row (standalone to preserve focus) ---
interface ConditionRowProps {
  condition: PolicyCondition;
  mcpServers: MCPServer[];
  onUpdate: (id: string, field: keyof PolicyCondition, val: string) => void;
  onRemove: (id: string) => void;
}

const ConditionRow = ({ condition, mcpServers, onUpdate, onRemove }: ConditionRowProps) => (
  <div className="flex items-center gap-2">
    <AttributePicker mcpServers={mcpServers} onSelect={(attr) => onUpdate(condition.id, "attribute", attr)} />
    <Input
      placeholder="e.g. invoice.amount"
      value={condition.attribute}
      onChange={(e) => onUpdate(condition.id, "attribute", e.target.value)}
      className="h-8 text-xs flex-1"
    />
    <Select value={condition.operator} onValueChange={(v) => onUpdate(condition.id, "operator", v)}>
      <SelectTrigger className="h-8 text-xs w-[130px]"><SelectValue /></SelectTrigger>
      <SelectContent>
        {operators.map((op) => (
          <SelectItem key={op.value} value={op.value}>{op.label}</SelectItem>
        ))}
      </SelectContent>
    </Select>
    {!["is_empty", "is_not_empty"].includes(condition.operator) && (
      <Input
        placeholder="Value"
        value={condition.value}
        onChange={(e) => onUpdate(condition.id, "value", e.target.value)}
        className="h-8 text-xs flex-1"
      />
    )}
    <button onClick={() => onRemove(condition.id)} className="text-muted-foreground hover:text-destructive">
      <X size={14} />
    </button>
  </div>
);

// --- Main Component ---
interface BusinessPoliciesCardProps {
  policies: BusinessPolicy[];
  onPoliciesChange: (policies: BusinessPolicy[]) => void;
  mcpServers?: MCPServer[];
}

const BusinessPoliciesCard = ({ policies, onPoliciesChange, mcpServers = [] }: BusinessPoliciesCardProps) => {
  const [createOpen, setCreateOpen] = useState(false);
  const [editPolicy, setEditPolicy] = useState<BusinessPolicy | null>(null);

  const [policyName, setPolicyName] = useState("");
  const [selectedTools, setSelectedTools] = useState<string[]>([]);
  const [conditions, setConditions] = useState<PolicyCondition[]>([]);

  // Build flat list of tool identifiers from MCP servers
  const availableTools = mcpServers.flatMap((server) =>
    server.tools.map((tool) => ({
      id: `${server.name.replace(/\s+/g, "")}.${tool.name.replace(/\s+/g, "")}`,
      label: `${server.name} → ${tool.name}`,
    }))
  );

  const toggleTool = (toolId: string) => {
    setSelectedTools((prev) =>
      prev.includes(toolId) ? prev.filter((t) => t !== toolId) : [...prev, toolId]
    );
  };

  const resetForm = () => {
    setPolicyName("");
    setSelectedTools([]);
    setConditions([]);
  };

  const addCondition = () => {
    setConditions((prev) => [...prev, { id: `c-${Date.now()}`, attribute: "", operator: "equals", value: "" }]);
  };

  const updateCondition = (id: string, field: keyof PolicyCondition, val: string) => {
    setConditions((prev) => prev.map((c) => c.id === id ? { ...c, [field]: val } : c));
  };

  const removeCondition = (id: string) => {
    setConditions((prev) => prev.filter((c) => c.id !== id));
  };

  const handleCreate = () => {
    if (!policyName.trim() || conditions.length === 0 || selectedTools.length === 0) return;
    const newPolicy: BusinessPolicy = {
      id: `bp-${Date.now()}`,
      name: policyName.trim(),
      active: true,
      selectedTools: [...selectedTools],
      conditions: conditions.filter((c) => c.attribute.trim()),
    };
    const updated = [...policies, newPolicy];
    onPoliciesChange(updated);
    saveBusinessPolicies(updated);
    resetForm();
    setCreateOpen(false);
  };

  const handleSaveEdit = () => {
    if (!editPolicy) return;
    const updated = policies.map((p) => p.id === editPolicy.id ? { ...editPolicy, selectedTools: [...selectedTools], conditions: conditions.filter((c) => c.attribute.trim()) } : p);
    onPoliciesChange(updated);
    saveBusinessPolicies(updated);
    setEditPolicy(null);
    setSelectedTools([]);
    setConditions([]);
  };

  const toggleActive = (id: string) => {
    const updated = policies.map((p) => p.id === id ? { ...p, active: !p.active } : p);
    onPoliciesChange(updated);
    saveBusinessPolicies(updated);
  };

  const handleDelete = (id: string) => {
    const updated = policies.filter((p) => p.id !== id);
    onPoliciesChange(updated);
    saveBusinessPolicies(updated);
  };

  const openEdit = (policy: BusinessPolicy) => {
    setEditPolicy(policy);
    setConditions([...policy.conditions]);
  };

  const operatorLabel = (op: string) => operators.find((o) => o.value === op)?.label || op;

  return (
    <div className="rounded-lg border border-border bg-card shadow-sm">
      <div className="flex items-center justify-between border-b border-border px-5 py-3">
        <h3 className="text-sm font-semibold text-foreground">Business Policies</h3>
        <Dialog open={createOpen} onOpenChange={(v) => { setCreateOpen(v); if (!v) resetForm(); }}>
          <DialogTrigger asChild>
            <button className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground">
              <Plus size={16} />
            </button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Create Business Policy</DialogTitle>
              <DialogDescription>Define conditional expressions on tool payload attributes.</DialogDescription>
            </DialogHeader>
            <div className="mt-2 space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs">Policy Name</Label>
                <Input placeholder="e.g. Invoice Amount Check" value={policyName} onChange={(e) => setPolicyName(e.target.value)} className="h-8 text-xs" />
              </div>
              {/* Inlined condition builder */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-medium">Conditions (AND logic)</Label>
                  <Button size="sm" variant="outline" className="h-7 text-xs" onClick={addCondition}>
                    <Plus size={12} className="mr-1" /> Add Condition
                  </Button>
                </div>
                {conditions.length === 0 && (
                  <p className="text-xs text-muted-foreground text-center py-2">No conditions. Click "Add Condition" to start.</p>
                )}
                {conditions.map((c) => (
                  <ConditionRow key={c.id} condition={c} mcpServers={mcpServers} onUpdate={updateCondition} onRemove={removeCondition} />
                ))}
              </div>
              <Button className="w-full" onClick={handleCreate} disabled={!policyName.trim() || conditions.length === 0}>
                Create Policy
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Edit dialog */}
      <Dialog open={!!editPolicy} onOpenChange={(v) => { if (!v) { setEditPolicy(null); setConditions([]); } }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit: {editPolicy?.name}</DialogTitle>
            <DialogDescription>Modify conditions for this policy.</DialogDescription>
          </DialogHeader>
          <div className="mt-2 space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-medium">Conditions (AND logic)</Label>
                <Button size="sm" variant="outline" className="h-7 text-xs" onClick={addCondition}>
                  <Plus size={12} className="mr-1" /> Add Condition
                </Button>
              </div>
              {conditions.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-2">No conditions. Click "Add Condition" to start.</p>
              )}
              {conditions.map((c) => (
                <ConditionRow key={c.id} condition={c} mcpServers={mcpServers} onUpdate={updateCondition} onRemove={removeCondition} />
              ))}
            </div>
            <Button className="w-full" onClick={handleSaveEdit}>Save Changes</Button>
          </div>
        </DialogContent>
      </Dialog>

      <div className="divide-y divide-border">
        {policies.length === 0 && (
          <p className="px-5 py-4 text-sm text-muted-foreground">No business policies configured. Click + to create one.</p>
        )}
        {policies.map((policy) => (
          <div key={policy.id} className="flex items-center gap-3 px-5 py-3">
            <div className="flex h-8 w-8 items-center justify-center rounded bg-muted text-muted-foreground">
              <ListChecks size={16} />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-sm font-medium text-foreground">{policy.name}</span>
              <p className="text-xs text-muted-foreground">{policy.conditions.length} condition{policy.conditions.length !== 1 ? "s" : ""}</p>
            </div>
            <Popover>
              <PopoverTrigger asChild>
                <button className="text-muted-foreground hover:text-foreground">
                  <Eye size={14} />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-foreground">{policy.name} – Conditions</p>
                  {policy.conditions.length === 0 ? (
                    <p className="text-xs text-muted-foreground">No conditions defined.</p>
                  ) : (
                    policy.conditions.map((c) => (
                      <div key={c.id} className="rounded bg-muted px-2 py-1.5 text-xs text-foreground">
                        <span className="font-medium">{c.attribute}</span>{" "}
                        <span className="text-muted-foreground">{operatorLabel(c.operator)}</span>{" "}
                        {!["is_empty", "is_not_empty"].includes(c.operator) && (
                          <span className="font-medium">{c.value}</span>
                        )}
                      </div>
                    ))
                  )}
                  <Button size="sm" variant="outline" className="w-full h-7 text-xs mt-1" onClick={() => openEdit(policy)}>
                    Edit Conditions
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
            <Switch checked={policy.active} onCheckedChange={() => toggleActive(policy.id)} className="scale-75" />
            <button onClick={() => handleDelete(policy.id)} className="text-muted-foreground hover:text-destructive">
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BusinessPoliciesCard;
