import { useState } from "react";
import { Plus, X, ListChecks, Eye, FolderSearch, Wrench, MoreHorizontal, Pencil, Server, Cpu } from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { MCPServer } from "@/components/MCPServersCard";
import { nativeTools } from "@/components/ToolsCard";

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
  selectedTools: string[]; // e.g. ["ServerName.ToolName"]
  conditions: PolicyCondition[];
  action: string;
}

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
  // Native tools
  "Risk Assessment": ["vendor_id", "amount", "risk_level", "category", "country"],
  "Get Invoice Details": ["invoice_id", "vendor_id", "date_range", "status"],
  "Contract Search": ["query", "vendor_id", "contract_type", "status"],
  "Validate and Create Invoice": ["invoice_data", "vendor_id", "amount", "currency", "line_items"],
  "Extract Invoice Data": ["document_url", "format", "language"],
  "Match PO": ["invoice_id", "po_number", "vendor_id", "tolerance"],
};

export function loadBusinessPolicies(projectId?: string): BusinessPolicy[] {
  const key = projectId ? `business-policies-${projectId}` : "business-policies";
  try {
    const stored = localStorage.getItem(key);
    if (stored) return JSON.parse(stored);
  } catch {}
  return [];
}

export function saveBusinessPolicies(policies: BusinessPolicy[], projectId?: string) {
  const key = projectId ? `business-policies-${projectId}` : "business-policies";
  localStorage.setItem(key, JSON.stringify(policies));
}

// --- Attribute Picker scoped to a single server ---
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

// --- Condition Row ---
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

// --- Server/Tool Selector with Native Tools toggle ---
type ToolSource = "mcp" | "native";

interface ServerToolSelectorProps {
  mcpServers: MCPServer[];
  toolSource: ToolSource;
  onToolSourceChange: (source: ToolSource) => void;
  selectedServerId: string;
  selectedToolId: string;
  onServerChange: (serverId: string) => void;
  onToolChange: (toolId: string) => void;
}

const ServerToolSelector = ({ mcpServers, toolSource, onToolSourceChange, selectedServerId, selectedToolId, onServerChange, onToolChange }: ServerToolSelectorProps) => {
  const activeServers = mcpServers.filter((s) => s.status === "Active");
  const selectedServer = activeServers.find((s) => s.id === selectedServerId);
  const tools = selectedServer?.tools || [];

  return (
    <div className="space-y-3">
      {/* Toggle */}
      <div className="flex gap-1 rounded-md border border-border p-0.5 bg-muted/50">
        <button
          type="button"
          className={`flex-1 flex items-center justify-center gap-1.5 rounded px-3 py-1.5 text-xs font-medium transition-colors ${toolSource === "native" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
          onClick={() => { onToolSourceChange("native"); onServerChange(""); onToolChange(""); }}
        >
          <Cpu size={12} /> Native Tools
        </button>
        <button
          type="button"
          className={`flex-1 flex items-center justify-center gap-1.5 rounded px-3 py-1.5 text-xs font-medium transition-colors ${toolSource === "mcp" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
          onClick={() => { onToolSourceChange("mcp"); onToolChange(""); }}
        >
          <Server size={12} /> MCP Server
        </button>
      </div>

      {toolSource === "native" ? (
        <div className="space-y-1.5">
          <Label className="text-xs font-medium flex items-center gap-1.5"><Cpu size={12} /> Native Tool</Label>
          <Select value={selectedToolId} onValueChange={onToolChange}>
            <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Select a native tool…" /></SelectTrigger>
            <SelectContent>
              {nativeTools.map((t) => (
                <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ) : (
        <>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium flex items-center gap-1.5"><Server size={12} /> MCP Server</Label>
            {activeServers.length === 0 ? (
              <p className="text-xs text-muted-foreground py-1">No active MCP servers available.</p>
            ) : (
              <Select value={selectedServerId} onValueChange={(v) => { onServerChange(v); onToolChange(""); }}>
                <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Select an active server…" /></SelectTrigger>
                <SelectContent>
                  {activeServers.map((s) => (
                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
          {selectedServerId && (
            <div className="space-y-1.5">
              <Label className="text-xs font-medium flex items-center gap-1.5"><Wrench size={12} /> Tool</Label>
              {tools.length === 0 ? (
                <p className="text-xs text-muted-foreground py-1">No tools on this server.</p>
              ) : (
                <Select value={selectedToolId} onValueChange={onToolChange}>
                  <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Select a tool…" /></SelectTrigger>
                  <SelectContent>
                    {tools.map((t) => (
                      <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};
// --- Helper: derive selectedTools string from server + tool ---
function buildSelectedToolKey(server: MCPServer, toolId: string): string {
  const tool = server.tools.find((t) => t.id === toolId);
  if (!tool) return "";
  return `${server.name.replace(/\s+/g, "")}.${tool.name.replace(/\s+/g, "")}`;
}

function deriveServerAndTool(mcpServers: MCPServer[], selectedTools: string[]): { serverId: string; toolId: string; toolSource: ToolSource } {
  if (!selectedTools.length) return { serverId: "", toolId: "", toolSource: "mcp" };
  const key = selectedTools[0];
  if (key.startsWith("NativeTools.")) {
    const toolName = key.substring("NativeTools.".length);
    const nt = nativeTools.find((t) => t.name.replace(/\s+/g, "") === toolName);
    return { serverId: "", toolId: nt?.id || "", toolSource: "native" };
  }
  const dotIdx = key.indexOf(".");
  if (dotIdx < 0) return { serverId: "", toolId: "", toolSource: "mcp" };
  const serverPart = key.substring(0, dotIdx);
  const toolPart = key.substring(dotIdx + 1);
  for (const s of mcpServers) {
    if (s.name.replace(/\s+/g, "") === serverPart) {
      const tool = s.tools.find((t) => t.name.replace(/\s+/g, "") === toolPart);
      if (tool) return { serverId: s.id, toolId: tool.id, toolSource: "mcp" };
    }
  }
  return { serverId: "", toolId: "", toolSource: "mcp" };
}

function formatToolLabel(mcpServers: MCPServer[], selectedTools: string[]): string {
  if (!selectedTools.length) return "";
  const key = selectedTools[0];
  if (key.startsWith("NativeTools.")) {
    const toolName = key.substring("NativeTools.".length);
    const nt = nativeTools.find((t) => t.name.replace(/\s+/g, "") === toolName);
    return `Native Tools → ${nt?.name || toolName}`;
  }
  const { serverId, toolId } = deriveServerAndTool(mcpServers, selectedTools);
  const server = mcpServers.find((s) => s.id === serverId);
  const tool = server?.tools.find((t) => t.id === toolId);
  if (server && tool) return `${server.name} → ${tool.name}`;
  return selectedTools[0];
}

// --- Main Component ---
interface BusinessPoliciesCardProps {
  policies: BusinessPolicy[];
  onPoliciesChange: (policies: BusinessPolicy[]) => void;
  mcpServers?: MCPServer[];
  projectId?: string;
}

const BusinessPoliciesCard = ({ policies, onPoliciesChange, mcpServers = [], projectId }: BusinessPoliciesCardProps) => {
  const save = (p: BusinessPolicy[]) => saveBusinessPolicies(p, projectId);
  const [createOpen, setCreateOpen] = useState(false);
  const [editPolicy, setEditPolicy] = useState<BusinessPolicy | null>(null);

  const [policyName, setPolicyName] = useState("");
  const [toolSource, setToolSource] = useState<ToolSource>("mcp");
  const [selectedServerId, setSelectedServerId] = useState("");
  const [selectedToolId, setSelectedToolId] = useState("");
  const [conditions, setConditions] = useState<PolicyCondition[]>([]);
  const [selectedAction, setSelectedAction] = useState("block");

  const resetForm = () => {
    setPolicyName("");
    setToolSource("mcp");
    setSelectedServerId("");
    setSelectedToolId("");
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

  const nativeServerProxy: MCPServer[] = toolSource === "native"
    ? [{ id: "native-tools", name: "Native Tools", status: "Active" as const, icon: Cpu, tools: nativeTools.map(t => ({ id: t.id, name: t.name, description: "" })), allTools: nativeTools.map(t => ({ id: t.id, name: t.name, description: "" })), url: "", transport: "", authType: "" } as MCPServer]
    : [];
  const scopedServers = toolSource === "native" ? nativeServerProxy : mcpServers.filter((s) => s.id === selectedServerId);

  const selectedServer = mcpServers.find((s) => s.id === selectedServerId);
  const canSave = policyName.trim() && selectedToolId && conditions.length > 0 && (toolSource === "native" || selectedServerId);

  const buildToolKey = (): string => {
    if (toolSource === "native") {
      const nt = nativeTools.find((t) => t.id === selectedToolId);
      return nt ? `NativeTools.${nt.name.replace(/\s+/g, "")}` : "";
    }
    if (!selectedServer) return "";
    return buildSelectedToolKey(selectedServer, selectedToolId);
  };

  const handleCreate = () => {
    if (!canSave) return;
    const toolKey = buildToolKey();
    if (!toolKey) return;
    const newPolicy: BusinessPolicy = {
      id: `bp-${Date.now()}`,
      name: policyName.trim(),
      active: true,
      selectedTools: [toolKey],
      conditions: conditions.filter((c) => c.attribute.trim()),
      action: selectedAction,
    };
    const updated = [...policies, newPolicy];
    onPoliciesChange(updated);
    save(updated);
    resetForm();
    setCreateOpen(false);
  };

  const handleSaveEdit = () => {
    if (!editPolicy) return;
    const toolKey = buildToolKey();
    if (!toolKey) return;
    const updated = policies.map((p) =>
      p.id === editPolicy.id
        ? { ...editPolicy, selectedTools: [toolKey], conditions: conditions.filter((c) => c.attribute.trim()), action: selectedAction }
        : p
    );
    onPoliciesChange(updated);
    saveBusinessPolicies(updated);
    setEditPolicy(null);
    resetForm();
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
    const { serverId, toolId, toolSource: ts } = deriveServerAndTool(mcpServers, policy.selectedTools || []);
    setToolSource(ts);
    setSelectedServerId(serverId);
    setSelectedToolId(toolId);
    setConditions([...policy.conditions]);
    setSelectedAction(policy.action || "block");
  };

  const operatorLabel = (op: string) => operators.find((o) => o.value === op)?.label || op;
  const actionLabel = (a: string) => actions.find((ac) => ac.value === a)?.label || a;

  // Shared form content for create/edit dialogs
  const renderForm = (isEdit: boolean) => (
    <div className="mt-2 space-y-4">
      {!isEdit && (
        <div className="space-y-1.5">
          <Label className="text-xs">Policy Name</Label>
          <Input placeholder="e.g. Invoice Amount Check" value={policyName} onChange={(e) => setPolicyName(e.target.value)} className="h-8 text-xs" />
        </div>
      )}
      {/* Server & Tool selector */}
      <ServerToolSelector
        mcpServers={mcpServers}
        toolSource={toolSource}
        onToolSourceChange={setToolSource}
        selectedServerId={selectedServerId}
        selectedToolId={selectedToolId}
        onServerChange={setSelectedServerId}
        onToolChange={setSelectedToolId}
      />
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
          <ConditionRow key={c.id} condition={c} mcpServers={scopedServers} onUpdate={updateCondition} onRemove={removeCondition} />
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
      <Button
        className="w-full"
        onClick={isEdit ? handleSaveEdit : handleCreate}
        disabled={isEdit ? (!selectedToolId || conditions.length === 0 || (toolSource === "mcp" && !selectedServerId)) : !canSave}
      >
        {isEdit ? "Save Changes" : "Create Policy"}
      </Button>
    </div>
  );

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
              <DialogDescription>Select an active MCP server and tool, then define conditions.</DialogDescription>
            </DialogHeader>
            {renderForm(false)}
          </DialogContent>
        </Dialog>
      </div>

      {/* Edit dialog */}
      <Dialog open={!!editPolicy} onOpenChange={(v) => { if (!v) { setEditPolicy(null); resetForm(); } }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit: {editPolicy?.name}</DialogTitle>
            <DialogDescription>Modify server, tool, and conditions for this policy.</DialogDescription>
          </DialogHeader>
          {renderForm(true)}
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
                {formatToolLabel(mcpServers, policy.selectedTools || [])}
                {(policy.selectedTools || []).length > 0 ? " · " : ""}
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
                      <span className="inline-flex items-center rounded bg-accent px-1.5 py-0.5 text-[10px] text-accent-foreground">
                        {formatToolLabel(mcpServers, policy.selectedTools || [])}
                      </span>
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
            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${policy.active ? "bg-redwood-green-light text-redwood-green" : "bg-redwood-olive-light text-redwood-olive"}`}>
              {policy.active ? "Active" : "Configured"}
            </span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="ml-1 text-muted-foreground hover:text-foreground">
                  <MoreHorizontal size={16} />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => openEdit(policy)}>
                  <Pencil size={14} className="mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => toggleActive(policy.id)}>
                  {policy.active ? "Deactivate" : "Activate"}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleDelete(policy.id)} className="text-destructive focus:text-destructive">
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BusinessPoliciesCard;
