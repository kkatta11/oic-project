import { MoreHorizontal, Plus, DollarSign, ListChecks, BarChart3, UserCheck } from "lucide-react";

const policies = [
  { id: "1", name: "Invoice Amount Check", icon: DollarSign },
  { id: "2", name: "No Line Items", icon: ListChecks },
  { id: "3", name: "Variance Tolerance", icon: BarChart3 },
  { id: "4", name: "Vendor Validation", icon: UserCheck },
];

const BusinessPoliciesCard = () => {
  return (
    <div className="rounded-lg border border-border bg-card shadow-sm">
      <div className="flex items-center justify-between border-b border-border px-5 py-3">
        <h3 className="text-sm font-semibold text-foreground">Business Policies</h3>
        <button className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground">
          <Plus size={16} />
        </button>
      </div>

      <div className="divide-y divide-border">
        {policies.map((policy) => {
          const Icon = policy.icon;
          return (
            <div key={policy.id} className="flex items-center gap-3 px-5 py-3">
              <div className="flex h-8 w-8 items-center justify-center rounded bg-muted text-muted-foreground">
                <Icon size={16} />
              </div>
              <span className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">
                {policy.name}
              </span>
              <button className="text-muted-foreground hover:text-foreground">
                <MoreHorizontal size={16} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BusinessPoliciesCard;
