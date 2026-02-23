import { useState } from "react";
import { Plus, ShieldCheck, ShieldAlert, FileCheck, Bug, Gauge, Package, Database, Lock, Trash2, type LucideIcon } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";

const iconMap: Record<string, LucideIcon> = {
  ShieldAlert, FileCheck, Bug, ShieldCheck, Gauge, Package, Database, Lock,
};

export const securityPolicyRepository = [
  { templateId: "t1", name: "PII Detection", description: "Scan for sensitive data", icon: "ShieldAlert" },
  { templateId: "t2", name: "Schema Validation", description: "Ensure format compliance", icon: "FileCheck" },
  { templateId: "t3", name: "Tool Poisoning Check", description: "Detect malicious payloads", icon: "Bug" },
  { templateId: "t4", name: "Intrusion Detection", description: "Identify suspicious patterns", icon: "ShieldCheck" },
  { templateId: "t5", name: "Rate Limiting", description: "Check quota consumption", icon: "Gauge" },
  { templateId: "t6", name: "Payload Size", description: "Validate request size", icon: "Package" },
  { templateId: "t7", name: "SQL Injection", description: "Detect injection attempts", icon: "Database" },
  { templateId: "t8", name: "Encryption", description: "Prepare encrypted transmission", icon: "Lock" },
];

export interface SecurityPolicy {
  id: string;
  name: string;
  description: string;
  icon: string;
  active: boolean;
  templateId: string;
}

const STORAGE_KEY = "security-policies";

function loadPolicies(): SecurityPolicy[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  return [];
}

function savePolicies(policies: SecurityPolicy[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(policies));
}

interface SecurityPoliciesCardProps {
  policies: SecurityPolicy[];
  onPoliciesChange: (policies: SecurityPolicy[]) => void;
}

const SecurityPoliciesCard = ({ policies, onPoliciesChange }: SecurityPoliciesCardProps) => {
  const [addOpen, setAddOpen] = useState(false);

  const usedTemplateIds = new Set(policies.map((p) => p.templateId));
  const availableTemplates = securityPolicyRepository.filter((t) => !usedTemplateIds.has(t.templateId));

  const handleAddFromRepo = (template: typeof securityPolicyRepository[0]) => {
    const newPolicy: SecurityPolicy = {
      id: `sp-${Date.now()}`,
      name: template.name,
      description: template.description,
      icon: template.icon,
      active: true,
      templateId: template.templateId,
    };
    const updated = [...policies, newPolicy];
    onPoliciesChange(updated);
    savePolicies(updated);
    if (availableTemplates.length <= 1) setAddOpen(false);
  };

  const toggleActive = (id: string) => {
    const updated = policies.map((p) => p.id === id ? { ...p, active: !p.active } : p);
    onPoliciesChange(updated);
    savePolicies(updated);
  };

  const handleDelete = (id: string) => {
    const updated = policies.filter((p) => p.id !== id);
    onPoliciesChange(updated);
    savePolicies(updated);
  };

  return (
    <div className="rounded-lg border border-border bg-card shadow-sm">
      <div className="flex items-center justify-between border-b border-border px-5 py-3">
        <h3 className="text-sm font-semibold text-foreground">Security Policies</h3>
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <button className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground">
              <Plus size={16} />
            </button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add Security Policy</DialogTitle>
              <DialogDescription>Select a policy from the repository to add.</DialogDescription>
            </DialogHeader>
            <div className="mt-2 divide-y divide-border rounded-md border border-border">
              {availableTemplates.length === 0 ? (
                <p className="px-4 py-3 text-sm text-muted-foreground text-center">All policies have been added.</p>
              ) : (
                availableTemplates.map((t) => {
                  const Icon = iconMap[t.icon] || ShieldCheck;
                  return (
                    <div key={t.templateId} className="flex items-center gap-3 px-4 py-2.5">
                      <div className="flex h-7 w-7 items-center justify-center rounded bg-muted text-muted-foreground">
                        <Icon size={14} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-foreground">{t.name}</p>
                        <p className="text-xs text-muted-foreground">{t.description}</p>
                      </div>
                      <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => handleAddFromRepo(t)}>
                        Add
                      </Button>
                    </div>
                  );
                })
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="divide-y divide-border">
        {policies.length === 0 && (
          <p className="px-5 py-4 text-sm text-muted-foreground">No security policies configured. Click + to add from the repository.</p>
        )}
        {policies.map((policy) => {
          const Icon = iconMap[policy.icon] || ShieldCheck;
          return (
            <div key={policy.id} className="flex items-center gap-3 px-5 py-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded bg-muted text-muted-foreground">
                <Icon size={14} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-foreground">{policy.name}</p>
                <p className="text-xs text-muted-foreground">{policy.description}</p>
              </div>
              <Switch checked={policy.active} onCheckedChange={() => toggleActive(policy.id)} className="scale-75" />
              <button onClick={() => handleDelete(policy.id)} className="text-muted-foreground hover:text-destructive">
                <Trash2 size={14} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export { loadPolicies as loadSecurityPolicies, savePolicies as saveSecurityPolicies };
export default SecurityPoliciesCard;
