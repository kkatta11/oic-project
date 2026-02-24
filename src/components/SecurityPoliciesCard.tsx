import { useState } from "react";
import { Plus, ShieldCheck, ShieldAlert, FileCheck, Bug, Gauge, Package, Database, Lock, Trash2, Pencil, type LucideIcon } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

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
  config: Record<string, any>;
}

// --- Config schema definitions ---

interface PolicyFieldDef {
  key: string;
  label: string;
  type: "select" | "number" | "text" | "toggle" | "multi-select";
  options?: { value: string; label: string }[];
  default: any;
  suffix?: string;
}

const policyConfigSchemas: Record<string, PolicyFieldDef[]> = {
  t1: [
    { key: "appliesTo", label: "Applies To", type: "select", options: [
      { value: "request", label: "Request Only" },
      { value: "response", label: "Response Only" },
      { value: "both", label: "Both" },
    ], default: "both" },
    { key: "action", label: "Action", type: "select", options: [
      { value: "block", label: "Block" },
      { value: "redact", label: "Redact" },
      { value: "log-warning", label: "Log Warning" },
    ], default: "block" },
    { key: "sensitivity", label: "Sensitivity Level", type: "select", options: [
      { value: "low", label: "Low" },
      { value: "medium", label: "Medium" },
      { value: "high", label: "High" },
    ], default: "medium" },
  ],
  // t2 — no config fields
  t3: [
    { key: "action", label: "Action", type: "select", options: [
      { value: "block", label: "Block" },
      { value: "log-alert", label: "Log & Alert" },
      { value: "redact", label: "Redact" },
    ], default: "block" },
    { key: "ipBlockDuration", label: "IP Block Duration", type: "select", options: [
      { value: "15min", label: "15 minutes" },
      { value: "1hour", label: "1 hour" },
      { value: "24hours", label: "24 hours" },
    ], default: "1hour" },
    { key: "alertRecipients", label: "Alert Recipients (emails)", type: "text", default: "" },
    { key: "whitelistExceptions", label: "Whitelist Exceptions", type: "text", default: "" },
  ],
  t4: [
    { key: "sensitivity", label: "Sensitivity Level", type: "select", options: [
      { value: "low", label: "Low" },
      { value: "medium", label: "Medium" },
      { value: "high", label: "High" },
    ], default: "medium" },
    { key: "bruteForceThreshold", label: "Brute Force Threshold (attempts)", type: "number", default: 5 },
    { key: "bruteForceWindow", label: "Brute Force Window (seconds)", type: "number", default: 60 },
    { key: "rateSpikeMultiplier", label: "Rate Spike Multiplier", type: "number", default: 10, suffix: "x" },
    { key: "behavioralMonitoring", label: "Behavioral Monitoring", type: "toggle", default: false },
    { key: "geoCheckInterval", label: "Geographic Check Interval (min)", type: "number", default: 15 },
    { key: "responseAction", label: "Response Action", type: "select", options: [
      { value: "alert", label: "Alert" },
      { value: "throttle", label: "Throttle" },
      { value: "require-mfa", label: "Require MFA" },
      { value: "block", label: "Block" },
    ], default: "alert" },
    { key: "exceptions", label: "Exceptions (IPs / processors)", type: "text", default: "" },
  ],
  t5: [
    { key: "threshold", label: "Threshold (requests)", type: "number", default: 100 },
    { key: "timeWindow", label: "Time Window", type: "select", options: [
      { value: "per-minute", label: "Per Minute" },
      { value: "per-hour", label: "Per Hour" },
    ], default: "per-minute" },
    { key: "action", label: "Action on Violation", type: "select", options: [
      { value: "block", label: "Block" },
      { value: "throttle", label: "Throttle" },
      { value: "warn", label: "Warn" },
    ], default: "block" },
  ],
  t6: [
    { key: "appliesTo", label: "Applies To", type: "select", options: [
      { value: "request", label: "Request Only" },
      { value: "response", label: "Response Only" },
      { value: "both", label: "Both" },
    ], default: "both" },
    { key: "maxRequestSize", label: "Max Request Size (MB)", type: "number", default: 10 },
    { key: "maxResponseSize", label: "Max Response Size (MB)", type: "number", default: 50 },
    { key: "action", label: "Action", type: "select", options: [
      { value: "block", label: "Block" },
      { value: "warn-throttle", label: "Warn & Throttle" },
      { value: "warn-only", label: "Warn Only" },
    ], default: "block" },
    { key: "allowedFileTypes", label: "Allowed File Types", type: "text", default: "images, PDFs, data" },
    { key: "compressionEnabled", label: "Allow gzip/brotli", type: "toggle", default: true },
    { key: "maxDecompressedSize", label: "Max Decompressed Size (MB)", type: "number", default: 100 },
  ],
  // t7 — no config fields (merged into Intrusion Detection)
  t8: [
    { key: "appliesTo", label: "Applies To", type: "select", options: [
      { value: "request", label: "Request Only" },
      { value: "response", label: "Response Only" },
      { value: "both", label: "Both" },
    ], default: "response" },
    { key: "mode", label: "Mode", type: "select", options: [
      { value: "optional", label: "Optional" },
      { value: "required", label: "Required" },
    ], default: "required" },
    { key: "keyRotationDays", label: "Key Rotation (days)", type: "number", default: 90 },
    { key: "keyStorage", label: "Key Storage", type: "select", options: [
      { value: "hsm", label: "Hardware Security Module" },
      { value: "cloud-kms", label: "Cloud KMS" },
      { value: "internal-vault", label: "Internal Vault" },
    ], default: "cloud-kms" },
    { key: "complianceBadges", label: "Compliance Badges", type: "multi-select", options: [
      { value: "pci-dss", label: "PCI-DSS" },
      { value: "hipaa", label: "HIPAA" },
      { value: "gdpr", label: "GDPR" },
      { value: "fips", label: "FIPS" },
    ], default: [] },
  ],
};

function getDefaultConfig(templateId: string): Record<string, any> {
  const schema = policyConfigSchemas[templateId];
  if (!schema) return {};
  const cfg: Record<string, any> = {};
  schema.forEach((f) => { cfg[f.key] = f.default; });
  return cfg;
}

function getConfigSummary(templateId: string, config: Record<string, any>): string {
  const schema = policyConfigSchemas[templateId];
  if (!schema || schema.length === 0) return "";
  const parts: string[] = [];
  for (const field of schema) {
    if (field.type === "text") continue;
    const val = config?.[field.key];
    if (val === undefined || val === null) continue;
    if (field.type === "toggle") {
      parts.push(`${field.label}: ${val ? "Yes" : "No"}`);
    } else if (field.type === "multi-select" && Array.isArray(val)) {
      if (val.length > 0) {
        const labels = val.map((v: string) => field.options?.find((o) => o.value === v)?.label ?? v);
        parts.push(labels.join(", "));
      }
    } else if (field.options) {
      const label = field.options.find((o) => o.value === val)?.label ?? val;
      parts.push(`${field.label}: ${label}`);
    } else {
      parts.push(`${field.label}: ${val}${field.suffix ?? ""}`);
    }
    if (parts.length >= 3) break; // keep summary short
  }
  return parts.join(" · ");
}

// --- Storage ---

const STORAGE_KEY = "security-policies";

function loadPolicies(): SecurityPolicy[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as SecurityPolicy[];
      // migrate: ensure config exists
      return parsed.map((p) => ({ ...p, config: p.config ?? {} }));
    }
  } catch {}
  return [];
}

function savePolicies(policies: SecurityPolicy[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(policies));
}

// --- Component ---

interface SecurityPoliciesCardProps {
  policies: SecurityPolicy[];
  onPoliciesChange: (policies: SecurityPolicy[]) => void;
}

const SecurityPoliciesCard = ({ policies, onPoliciesChange }: SecurityPoliciesCardProps) => {
  const [addOpen, setAddOpen] = useState(false);
  const [configDialogOpen, setConfigDialogOpen] = useState(false);
  const [configTemplate, setConfigTemplate] = useState<typeof securityPolicyRepository[0] | null>(null);
  const [configEditPolicy, setConfigEditPolicy] = useState<SecurityPolicy | null>(null);
  const [configValues, setConfigValues] = useState<Record<string, any>>({});

  const usedTemplateIds = new Set(policies.map((p) => p.templateId));
  const availableTemplates = securityPolicyRepository.filter((t) => !usedTemplateIds.has(t.templateId));

  const currentTemplateId = configEditPolicy?.templateId ?? configTemplate?.templateId ?? "";
  const schema = policyConfigSchemas[currentTemplateId] ?? [];
  const hasConfig = schema.length > 0;
  const dialogTitle = configEditPolicy ? `Edit: ${configEditPolicy.name}` : `Configure: ${configTemplate?.name ?? ""}`;

  // Add flow: open config dialog (or add immediately if no config fields)
  const handleAddFromRepo = (template: typeof securityPolicyRepository[0]) => {
    const templateSchema = policyConfigSchemas[template.templateId];
    if (!templateSchema || templateSchema.length === 0) {
      // No config — add immediately
      const newPolicy: SecurityPolicy = {
        id: `sp-${Date.now()}`,
        name: template.name,
        description: template.description,
        icon: template.icon,
        active: true,
        templateId: template.templateId,
        config: {},
      };
      const updated = [...policies, newPolicy];
      onPoliciesChange(updated);
      savePolicies(updated);
      if (availableTemplates.length <= 1) setAddOpen(false);
      return;
    }
    // Has config — open config dialog
    setConfigTemplate(template);
    setConfigEditPolicy(null);
    setConfigValues(getDefaultConfig(template.templateId));
    setAddOpen(false);
    setConfigDialogOpen(true);
  };

  // Edit flow
  const handleEditPolicy = (policy: SecurityPolicy) => {
    if (policy.templateId.startsWith("auto-tool-filter-")) return;
    const templateSchema = policyConfigSchemas[policy.templateId];
    if (!templateSchema || templateSchema.length === 0) return;
    setConfigEditPolicy(policy);
    setConfigTemplate(null);
    setConfigValues({ ...getDefaultConfig(policy.templateId), ...policy.config });
    setConfigDialogOpen(true);
  };

  // Save config (add or edit)
  const handleConfigSave = () => {
    if (configEditPolicy) {
      const updated = policies.map((p) =>
        p.id === configEditPolicy.id ? { ...p, config: { ...configValues } } : p
      );
      onPoliciesChange(updated);
      savePolicies(updated);
    } else if (configTemplate) {
      const newPolicy: SecurityPolicy = {
        id: `sp-${Date.now()}`,
        name: configTemplate.name,
        description: configTemplate.description,
        icon: configTemplate.icon,
        active: true,
        templateId: configTemplate.templateId,
        config: { ...configValues },
      };
      const updated = [...policies, newPolicy];
      onPoliciesChange(updated);
      savePolicies(updated);
    }
    setConfigDialogOpen(false);
    setConfigTemplate(null);
    setConfigEditPolicy(null);
    setConfigValues({});
  };

  const updateConfigValue = (key: string, value: any) => {
    setConfigValues((prev) => ({ ...prev, [key]: value }));
  };

  const toggleMultiSelect = (key: string, optionValue: string) => {
    setConfigValues((prev) => {
      const arr: string[] = Array.isArray(prev[key]) ? [...prev[key]] : [];
      const idx = arr.indexOf(optionValue);
      if (idx >= 0) arr.splice(idx, 1);
      else arr.push(optionValue);
      return { ...prev, [key]: arr };
    });
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

      {/* Config dialog (add / edit) */}
      <Dialog open={configDialogOpen} onOpenChange={(open) => {
        if (!open) {
          setConfigDialogOpen(false);
          setConfigTemplate(null);
          setConfigEditPolicy(null);
          setConfigValues({});
        }
      }}>
        <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{dialogTitle}</DialogTitle>
            <DialogDescription>
              {configEditPolicy ? "Modify the configuration for this policy." : "Configure the policy before adding."}
            </DialogDescription>
          </DialogHeader>
          {hasConfig && (
            <div className="grid gap-4 py-2">
              {schema.map((field) => (
                <div key={field.key} className="grid gap-1.5">
                  <Label className="text-xs font-medium">{field.label}</Label>

                  {field.type === "select" && (
                    <Select value={String(configValues[field.key] ?? field.default)} onValueChange={(v) => updateConfigValue(field.key, v)}>
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {field.options?.map((o) => (
                          <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}

                  {field.type === "number" && (
                    <Input
                      type="number"
                      className="h-8 text-xs"
                      value={configValues[field.key] ?? field.default}
                      onChange={(e) => updateConfigValue(field.key, Number(e.target.value))}
                    />
                  )}

                  {field.type === "text" && (
                    <Input
                      type="text"
                      className="h-8 text-xs"
                      placeholder={field.label}
                      value={configValues[field.key] ?? field.default}
                      onChange={(e) => updateConfigValue(field.key, e.target.value)}
                    />
                  )}

                  {field.type === "toggle" && (
                    <Switch
                      checked={!!configValues[field.key]}
                      onCheckedChange={(v) => updateConfigValue(field.key, v)}
                      className="scale-75 origin-left"
                    />
                  )}

                  {field.type === "multi-select" && (
                    <div className="flex flex-wrap gap-3">
                      {field.options?.map((o) => {
                        const checked = Array.isArray(configValues[field.key]) && configValues[field.key].includes(o.value);
                        return (
                          <label key={o.value} className="flex items-center gap-1.5 text-xs cursor-pointer">
                            <Checkbox checked={checked} onCheckedChange={() => toggleMultiSelect(field.key, o.value)} />
                            {o.label}
                          </label>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setConfigDialogOpen(false)}>Cancel</Button>
            <Button size="sm" onClick={handleConfigSave}>
              {configEditPolicy ? "Save Changes" : "Add Policy"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="divide-y divide-border">
        {policies.length === 0 && (
          <p className="px-5 py-4 text-sm text-muted-foreground">No security policies configured. Click + to add from the repository.</p>
        )}
        {policies.map((policy) => {
          const Icon = iconMap[policy.icon] || ShieldCheck;
          const isAutoFilter = policy.templateId.startsWith("auto-tool-filter-");
          const summary = !isAutoFilter ? getConfigSummary(policy.templateId, policy.config) : "";
          const hasEditableConfig = !isAutoFilter && (policyConfigSchemas[policy.templateId]?.length ?? 0) > 0;
          return (
            <div key={policy.id} className="flex items-center gap-3 px-5 py-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded bg-muted text-muted-foreground">
                <Icon size={14} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-foreground">{policy.name}</p>
                <p className="text-xs text-muted-foreground">{policy.description}</p>
                {summary && (
                  <p className="text-[10px] text-muted-foreground/70 mt-0.5">{summary}</p>
                )}
              </div>
              <Switch checked={policy.active} onCheckedChange={() => toggleActive(policy.id)} className="scale-75" />
              {hasEditableConfig && (
                <button onClick={() => handleEditPolicy(policy)} className="text-muted-foreground hover:text-foreground">
                  <Pencil size={13} />
                </button>
              )}
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

export function createToolFilterPolicy(serverId: string, serverName: string, blockedToolNames: string[]): SecurityPolicy {
  return {
    id: `sp-auto-${serverId}`,
    name: `Tool Filter: ${serverName}`,
    description: `Blocks: ${blockedToolNames.join(", ")}`,
    icon: "ShieldCheck",
    active: true,
    templateId: `auto-tool-filter-${serverId}`,
    config: {},
  };
}

export { loadPolicies as loadSecurityPolicies, savePolicies as saveSecurityPolicies };
export default SecurityPoliciesCard;
