import { MoreHorizontal, Plus, GitBranch, Clock, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Integration } from "@/data/mockData";

const typeIcons = {
  app: GitBranch,
  schedule: Clock,
  api: Zap,
};

interface IntegrationsCardProps {
  integrations: Integration[];
}

const StatusBadge = ({ status }: { status: string }) => {
  if (status === "Active") {
    return (
      <span className="inline-flex items-center rounded-full bg-redwood-green-light px-2 py-0.5 text-[11px] font-medium text-redwood-green">
        {status}
      </span>
    );
  }
  if (status === "Configured") {
    return (
      <span className="inline-flex items-center rounded-full bg-redwood-olive-light px-2 py-0.5 text-[11px] font-medium text-redwood-olive">
        {status}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
      {status}
    </span>
  );
};

const IntegrationsCard = ({ integrations }: IntegrationsCardProps) => {
  const displayed = integrations.slice(0, 5);
  const total = integrations.length;

  return (
    <div className="rounded-lg border border-border bg-card shadow-sm">
      <div className="flex items-center justify-between border-b border-border px-5 py-3">
        <h3 className="text-sm font-semibold text-foreground">Integrations</h3>
        <button className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground">
          <Plus size={16} />
        </button>
      </div>

      <div className="divide-y divide-border">
        {displayed.map((item) => {
          const TypeIcon = typeIcons[item.type];
          return (
            <div key={item.id} className="flex items-center gap-3 px-5 py-3">
              <div className="flex h-8 w-8 items-center justify-center rounded bg-muted text-muted-foreground">
                <TypeIcon size={16} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="truncate text-sm font-medium text-foreground">{item.name}</span>
                  <span className="whitespace-nowrap text-[11px] text-muted-foreground">{item.version}</span>
                </div>
                {item.description && (
                  <p className="truncate text-xs text-muted-foreground">{item.description}</p>
                )}
              </div>
              <StatusBadge status={item.status} />
              <button className="ml-1 text-muted-foreground hover:text-foreground">
                <MoreHorizontal size={16} />
              </button>
            </div>
          );
        })}
      </div>

      <div className="border-t border-border px-5 py-2.5">
        <button className="text-xs font-medium text-redwood-gold hover:underline">
          View all {total} integration(s)
        </button>
      </div>
    </div>
  );
};

export default IntegrationsCard;
