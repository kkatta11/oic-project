import { MoreHorizontal, Plus, FileText, CheckSquare, FileSearch, GitMerge, ShieldCheck, Search, Ship, Globe, Package, Clock } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface NativeTool {
  id: string;
  name: string;
  icon: LucideIcon;
}

export const nativeTools: NativeTool[] = [
  { id: "1", name: "Risk Assessment", icon: ShieldCheck },
  { id: "2", name: "Get Invoice Details", icon: FileText },
  { id: "3", name: "Contract Search", icon: Search },
  { id: "4", name: "Validate and Create Invoice", icon: CheckSquare },
  { id: "5", name: "Extract Invoice Data", icon: FileSearch },
  { id: "6", name: "Match PO", icon: GitMerge },
];

export const travelTools: NativeTool[] = [
  { id: "t1", name: "Track Shipment", icon: Ship },
  { id: "t2", name: "Route Optimizer", icon: Globe },
  { id: "t3", name: "Inventory Check", icon: Package },
  { id: "t4", name: "Validate Customs", icon: ShieldCheck },
  { id: "t5", name: "Supplier Lookup", icon: Search },
  { id: "t6", name: "Estimate Delivery", icon: Clock },
];

interface ToolsCardProps {
  tools?: NativeTool[];
}

const ToolsCard = ({ tools }: ToolsCardProps) => {
  const displayTools = tools || nativeTools;
  return (
    <div className="rounded-lg border border-border bg-card shadow-sm">
      <div className="flex items-center justify-between border-b border-border px-5 py-3">
        <h3 className="text-sm font-semibold text-foreground">Tools</h3>
        <button className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground">
          <Plus size={16} />
        </button>
      </div>

      <div className="divide-y divide-border">
        {nativeTools.map((tool) => {
          const Icon = tool.icon;
          return (
            <div key={tool.id} className="flex items-center gap-3 px-5 py-3">
              <div className="flex h-8 w-8 items-center justify-center rounded bg-muted text-muted-foreground">
                <Icon size={16} />
              </div>
              <span className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">
                {tool.name}
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

export default ToolsCard;
