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
  action: string; // "block" | "log_warning" | "flag_review" | "notify_admin"
}

const STORAGE_KEY = "business-policies";
const actions = [
  { value: "block", label: "Block Request" },
  { value: "log_warning", label: "Log Warning" },
  { value: "flag_review", label: "Flag for Review" },
  { value: "notify_admin", label: "Notify Admin" },
];
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
  const [selectedAction, setSelectedAction] = useState("block");

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
    setSelectedAction("block");
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
      action: selectedAction,
    };
    const updated = [...policies, newPolicy];
    onPoliciesChange(updated);
    saveBusinessPolicies(updated);
    resetForm();
    setCreateOpen(false);
  };

  const handleSaveEdit = () => {
    if (!editPolicy) return;
    const updated = policies.map((p) => p.id === editPolicy.id ? { ...editPolicy, selectedTools: [...selectedTools], conditions: conditions.filter((c) => c.attribute.trim()), action: selectedAction } : p);
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
    setSelectedTools([...(policy.selectedTools || [])]);
    setConditions([...policy.conditions]);
    setSelectedAction(policy.action || "block");
  };

  const operatorLabel = (op: string) => operators.find((o) => o.value === op)?.label || op;
  const actionLabel = (a: string) => actions.find((ac) => ac.value === a)?.label || a;

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
              {/* Tool selector */}
              <div className="space-y-2">
                <Label className="text-xs font-medium flex items-center gap-1.5"><Wrench size={12} /> Apply to Tools</Label>
                {availableTools.length === 0 ? (
                  <p className="text-xs text-muted-foreground py-1">No tools available. Configure MCP servers first.</p>
                ) : (
                  <ScrollArea className="max-h-36 rounded border border-border p-2">
                    <div className="space-y-1.5">
                      {availableTools.map((tool) => (
                        <label key={tool.id} className="flex items-center gap-2 text-xs cursor-pointer hover:bg-muted rounded px-1 py-0.5">
                          <Checkbox checked={selectedTools.includes(tool.id)} onCheckedChange={() => toggleTool(tool.id)} className="h-3.5 w-3.5" />
                          <span className="text-foreground">{tool.label}</span>
                        </label>
                      ))}
                    </div>
                  </ScrollArea>
                )}
                {selectedTools.length > 0 && (
                  <p className="text-[11px] text-muted-foreground">{selectedTools.length} tool{selectedTools.length !== 1 ? "s" : ""} selected</p>
                )}
              </div>
              {/* Condition builder */}
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
              {/* Action selector */}
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Action (when conditions match)</Label>
                <Select value={selectedAction} onValueChange={setSelectedAction}>
                  <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {actions.map((a) => (
                      <SelectItem key={a.value} value={a.value}>{a.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button className="w-full" onClick={handleCreate} disabled={!policyName.trim() || conditions.length === 0 || selectedTools.length === 0}>
                Create Policy
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Edit dialog */}
      <Dialog open={!!editPolicy} onOpenChange={(v) => { if (!v) { setEditPolicy(null); setSelectedTools([]); setConditions([]); } }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit: {editPolicy?.name}</DialogTitle>
            <DialogDescription>Modify tool scope and conditions for this policy.</DialogDescription>
          </DialogHeader>
          <div className="mt-2 space-y-4">
            {/* Tool selector */}
            <div className="space-y-2">
              <Label className="text-xs font-medium flex items-center gap-1.5"><Wrench size={12} /> Apply to Tools</Label>
              {availableTools.length === 0 ? (
                <p className="text-xs text-muted-foreground py-1">No tools available.</p>
              ) : (
                <ScrollArea className="max-h-36 rounded border border-border p-2">
                  <div className="space-y-1.5">
                    {availableTools.map((tool) => (
                      <label key={tool.id} className="flex items-center gap-2 text-xs cursor-pointer hover:bg-muted rounded px-1 py-0.5">
                        <Checkbox checked={selectedTools.includes(tool.id)} onCheckedChange={() => toggleTool(tool.id)} className="h-3.5 w-3.5" />
                        <span className="text-foreground">{tool.label}</span>
                      </label>
                    ))}
                  </div>
                </ScrollArea>
              )}
              {selectedTools.length > 0 && (
                <p className="text-[11px] text-muted-foreground">{selectedTools.length} tool{selectedTools.length !== 1 ? "s" : ""} selected</p>
              )}
            </div>
            {/* Conditions */}
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
            {/* Action selector */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Action (when conditions match)</Label>
              <Select value={selectedAction} onValueChange={setSelectedAction}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {actions.map((a) => (
                    <SelectItem key={a.value} value={a.value}>{a.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
              <p className="text-xs text-muted-foreground">
                {(policy.selectedTools || []).length > 0
                  ? `${(policy.selectedTools || []).length} tool${(policy.selectedTools || []).length !== 1 ? "s" : ""} · `
                  : ""}
                {policy.conditions.length} condition{policy.conditions.length !== 1 ? "s" : ""} · {actionLabel(policy.action || "block")}
              </p>
            </div>
            <Popover>
              <PopoverTrigger asChild>
                <button className="text-muted-foreground hover:text-foreground">
                  <Eye size={14} />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-foreground">{policy.name}</p>
                  {(policy.selectedTools || []).length > 0 && (
                    <div>
                      <p className="text-[11px] font-medium text-muted-foreground mb-1">Applied to:</p>
                      <div className="flex flex-wrap gap-1">
                        {(policy.selectedTools || []).map((t) => (
                          <span key={t} className="inline-flex items-center rounded bg-accent px-1.5 py-0.5 text-[10px] text-accent-foreground">{t}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="mt-1">
                    <p className="text-[11px] font-medium text-muted-foreground mb-1">When matched:</p>
                    <span className="inline-flex items-center rounded bg-accent px-1.5 py-0.5 text-[10px] font-medium text-accent-foreground">{actionLabel(policy.action || "block")}</span>
                  </div>
                  <p className="text-[11px] font-medium text-muted-foreground mt-1">Conditions:</p>
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
                    Edit Policy
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
