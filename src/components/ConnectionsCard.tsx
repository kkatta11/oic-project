import { MoreHorizontal, Plus, Database, Globe, Mail, HardDrive, Server, Plug } from "lucide-react";
import type { Connection } from "@/data/mockData";

const connectionIcons: Record<string, React.ElementType> = {
  "Oracle ERP Cloud": Database,
  "Oracle HCM Cloud": Database,
  "REST": Globe,
  "Oracle ATP": Server,
  "FTP": HardDrive,
  "SOAP": Globe,
  "Oracle CX": Database,
  "Email": Mail,
  "Object Storage": HardDrive,
};

const StatusBadge = ({ status }: { status: string }) => {
  if (status === "Active") {
    return (
      <span className="inline-flex items-center rounded-full bg-redwood-green-light px-2 py-0.5 text-[11px] font-medium text-redwood-green">
        {status}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center rounded-full bg-redwood-olive-light px-2 py-0.5 text-[11px] font-medium text-redwood-olive">
      {status}
    </span>
  );
};

interface ConnectionsCardProps {
  connections: Connection[];
}

const ConnectionsCard = ({ connections }: ConnectionsCardProps) => {
  const displayed = connections.slice(0, 5);
  const total = connections.length;

  return (
    <div className="rounded-lg border border-border bg-card shadow-sm">
      <div className="flex items-center justify-between border-b border-border px-5 py-3">
        <h3 className="text-sm font-semibold text-foreground">Connections</h3>
        <button className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground">
          <Plus size={16} />
        </button>
      </div>

      <div className="divide-y divide-border">
        {displayed.map((conn) => {
          const Icon = connectionIcons[conn.type] || Plug;
          return (
            <div key={conn.id} className="flex items-center gap-3 px-5 py-3">
              <div className="flex h-8 w-8 items-center justify-center rounded bg-muted text-muted-foreground">
                <Icon size={16} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">{conn.name}</p>
                <p className="text-[11px] text-muted-foreground">{conn.type} · {conn.role}</p>
              </div>
              <StatusBadge status={conn.status} />
              <button className="ml-1 text-muted-foreground hover:text-foreground">
                <MoreHorizontal size={16} />
              </button>
            </div>
          );
        })}
      </div>

      <div className="border-t border-border px-5 py-2.5">
        <button className="text-xs font-medium text-redwood-gold hover:underline">
          View all {total} connection(s)
        </button>
      </div>
    </div>
  );
};

export default ConnectionsCard;
