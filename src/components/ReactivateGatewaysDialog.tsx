import { useState, useEffect } from "react";
import { Info, Search, Shield } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

interface SavedGatewayInfo {
  id: string;
  name: string;
  active: boolean;
}

export function findDependentGateways(
  projectId: string,
  resourceId: string,
  resourceType: "server" | "policy"
): SavedGatewayInfo[] {
  const key = `mcp-gateways-${projectId}`;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const gateways = JSON.parse(raw) as any[];
    return gateways.filter((gw) => {
      if (resourceType === "server") {
        return gw.servers?.some((s: any) => s.id === resourceId || s.sourceId === resourceId);
      }
      // policy — check securityPolicies, businessPolicies, requestPolicyOrder, responsePolicyOrder
      return (
        gw.securityPolicies?.includes(resourceId) ||
        gw.businessPolicies?.includes(resourceId) ||
        gw.requestPolicyOrder?.includes(resourceId) ||
        gw.responsePolicyOrder?.includes(resourceId)
      );
    }).map((gw) => ({ id: gw.id, name: gw.name, active: !!gw.active }));
  } catch {
    return [];
  }
}

function reactivateGateways(projectId: string, gatewayIds: string[]) {
  const key = `mcp-gateways-${projectId}`;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return;
    const gateways = JSON.parse(raw) as any[];
    const idSet = new Set(gatewayIds);
    const updated = gateways.map((gw) =>
      idSet.has(gw.id) ? { ...gw, reactivatedAt: new Date().toISOString() } : gw
    );
    localStorage.setItem(key, JSON.stringify(updated));
  } catch {}
}

interface ReactivateGatewaysDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  resourceName: string;
  projectId: string;
  resourceId: string;
  resourceType: "server" | "policy";
}

export default function ReactivateGatewaysDialog({
  open,
  onOpenChange,
  resourceName,
  projectId,
  resourceId,
  resourceType,
}: ReactivateGatewaysDialogProps) {
  const [dependentGateways, setDependentGateways] = useState<SavedGatewayInfo[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (open) {
      setDependentGateways(findDependentGateways(projectId, resourceId, resourceType));
      setSearch("");
    }
  }, [open, projectId, resourceId, resourceType]);

  const activeGateways = dependentGateways.filter((g) => g.active);
  const inactiveGateways = dependentGateways.filter((g) => !g.active);

  const filterBySearch = (gateways: SavedGatewayInfo[]) =>
    search.trim()
      ? gateways.filter((g) => g.name.toLowerCase().includes(search.toLowerCase()))
      : gateways;

  const handleSave = () => {
    onOpenChange(false);
  };

  const handleSaveAndReactivate = () => {
    const activeIds = activeGateways.map((g) => g.id);
    if (activeIds.length > 0) {
      reactivateGateways(projectId, activeIds);
    }
    onOpenChange(false);
  };

  if (dependentGateways.length === 0 && open) {
    // No dependent gateways — auto-close
    setTimeout(() => onOpenChange(false), 0);
    return null;
  }

  const renderGatewayList = (gateways: SavedGatewayInfo[]) => {
    const filtered = filterBySearch(gateways);
    if (filtered.length === 0) {
      return (
        <p className="py-4 text-center text-xs text-muted-foreground">
          {search.trim() ? "No matching gateways." : "None."}
        </p>
      );
    }
    return (
      <ScrollArea className="max-h-48">
        <div className="divide-y divide-border">
          {filtered.map((gw) => (
            <div key={gw.id} className="flex items-center gap-3 px-3 py-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded bg-muted text-muted-foreground">
                <Shield size={14} />
              </div>
              <span className="flex-1 text-sm font-medium text-foreground truncate">{gw.name}</span>
              <Badge
                variant={gw.active ? "default" : "secondary"}
                className={`text-[10px] px-2 py-0.5 ${gw.active ? "bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-100" : ""}`}
              >
                {gw.active ? "Active" : "Inactive"}
              </Badge>
            </div>
          ))}
        </div>
      </ScrollArea>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base">Save & reactivate</DialogTitle>
          <DialogDescription className="text-sm">{resourceName}</DialogDescription>
        </DialogHeader>

        <div className="flex items-start gap-2 rounded-md border border-blue-200 bg-blue-50 px-3 py-2.5 text-xs text-blue-800 dark:border-blue-800 dark:bg-blue-950/40 dark:text-blue-300">
          <Info size={14} className="mt-0.5 shrink-0" />
          <span>
            There are unsaved changes. Click <strong>save &amp; reactivate</strong> if you want to
            apply the changes to active gateways.
          </span>
        </div>

        <Tabs defaultValue="active" className="mt-1">
          <TabsList className="w-full">
            <TabsTrigger value="active" className="flex-1 text-xs">
              Active gateways ({activeGateways.length})
            </TabsTrigger>
            <TabsTrigger value="inactive" className="flex-1 text-xs">
              Inactive gateways ({inactiveGateways.length})
            </TabsTrigger>
          </TabsList>

          <div className="relative mt-3 mb-2">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search gateways…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-8 pl-8 text-xs"
            />
          </div>

          <TabsContent value="active" className="mt-0">
            {renderGatewayList(activeGateways)}
          </TabsContent>
          <TabsContent value="inactive" className="mt-0">
            {renderGatewayList(inactiveGateways)}
          </TabsContent>
        </Tabs>

        <DialogFooter className="gap-2 sm:gap-2">
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button variant="secondary" size="sm" onClick={handleSave}>
            Save
          </Button>
          <Button size="sm" onClick={handleSaveAndReactivate} disabled={activeGateways.length === 0}>
            Save &amp; reactivate
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
