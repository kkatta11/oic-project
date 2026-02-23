import { Plus, ShieldCheck, ShieldAlert, FileCheck, Bug, Gauge, Package, Database, Lock } from "lucide-react";

const policies = [
  { id: "1", name: "PII Detection", description: "Scan for sensitive data", icon: ShieldAlert, enabled: true },
  { id: "2", name: "Schema Validation", description: "Ensure format compliance", icon: FileCheck, enabled: true },
  { id: "3", name: "Tool Poisoning Check", description: "Detect malicious payloads", icon: Bug, enabled: true },
  { id: "4", name: "Intrusion Detection", description: "Identify suspicious patterns", icon: ShieldCheck, enabled: false },
  { id: "5", name: "Rate Limiting", description: "Check quota consumption", icon: Gauge, enabled: true },
  { id: "6", name: "Payload Size", description: "Validate request size", icon: Package, enabled: false },
  { id: "7", name: "SQL Injection", description: "Detect injection attempts", icon: Database, enabled: true },
  { id: "8", name: "Encryption", description: "Prepare encrypted transmission", icon: Lock, enabled: true },
];

const SecurityPoliciesCard = () => {
  return (
    <div className="rounded-lg border border-border bg-card shadow-sm">
      <div className="flex items-center justify-between border-b border-border px-5 py-3">
        <h3 className="text-sm font-semibold text-foreground">Security Policies</h3>
        <button className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground">
          <Plus size={16} />
        </button>
      </div>

      <div className="divide-y divide-border">
        {policies.map((policy) => {
          const Icon = policy.icon;
          return (
            <div key={policy.id} className="flex items-center gap-3 px-5 py-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded bg-muted text-muted-foreground">
                <Icon size={14} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-foreground">{policy.name}</p>
                <p className="text-xs text-muted-foreground">{policy.description}</p>
              </div>
              <span
                className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${
                  policy.enabled
                    ? "bg-redwood-green-light text-redwood-green"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {policy.enabled ? "Enabled" : "Disabled"}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SecurityPoliciesCard;
