import { useState } from "react";
import { Plus, Trash2, X, ListChecks, Eye } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

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

interface BusinessPoliciesCardProps {
  policies: BusinessPolicy[];
  onPoliciesChange: (policies: BusinessPolicy[]) => void;
}

const BusinessPoliciesCard = ({ policies, onPoliciesChange }: BusinessPoliciesCardProps) => {
  const [createOpen, setCreateOpen] = useState(false);
  const [editPolicy, setEditPolicy] = useState<BusinessPolicy | null>(null);

  // Create form state
  const [policyName, setPolicyName] = useState("");
  const [conditions, setConditions] = useState<PolicyCondition[]>([]);

  const resetForm = () => {
    setPolicyName("");
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
    if (!policyName.trim() || conditions.length === 0) return;
    const newPolicy: BusinessPolicy = {
      id: `bp-${Date.now()}`,
      name: policyName.trim(),
      active: true,
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
    const updated = policies.map((p) => p.id === editPolicy.id ? { ...editPolicy, conditions: conditions.filter((c) => c.attribute.trim()) } : p);
    onPoliciesChange(updated);
    saveBusinessPolicies(updated);
    setEditPolicy(null);
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

  const ConditionBuilder = () => (
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
        <div key={c.id} className="flex items-center gap-2">
          <Input placeholder="e.g. invoice.amount" value={c.attribute} onChange={(e) => updateCondition(c.id, "attribute", e.target.value)} className="h-8 text-xs flex-1" />
          <Select value={c.operator} onValueChange={(v) => updateCondition(c.id, "operator", v)}>
            <SelectTrigger className="h-8 text-xs w-[130px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              {operators.map((op) => (
                <SelectItem key={op.value} value={op.value}>{op.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {!["is_empty", "is_not_empty"].includes(c.operator) && (
            <Input placeholder="Value" value={c.value} onChange={(e) => updateCondition(c.id, "value", e.target.value)} className="h-8 text-xs flex-1" />
          )}
          <button onClick={() => removeCondition(c.id)} className="text-muted-foreground hover:text-destructive">
            <X size={14} />
          </button>
        </div>
      ))}
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
              <DialogDescription>Define conditional expressions on tool payload attributes.</DialogDescription>
            </DialogHeader>
            <div className="mt-2 space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs">Policy Name</Label>
                <Input placeholder="e.g. Invoice Amount Check" value={policyName} onChange={(e) => setPolicyName(e.target.value)} className="h-8 text-xs" />
              </div>
              <ConditionBuilder />
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
            <ConditionBuilder />
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
