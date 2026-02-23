import { useState } from "react";
import {
  Plus, Server, Database, Globe, MessageSquare, FileJson, Mail,
  ShieldCheck, ShieldAlert, FileCheck, Bug, Gauge, Package, Lock,
  Trash2, ChevronRight, ListChecks,
  type LucideIcon,
} from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import type { SecurityPolicy } from "@/components/SecurityPoliciesCard";
import type { BusinessPolicy } from "@/components/BusinessPoliciesCard";

const iconMap: Record<string, LucideIcon> = {
  ShieldAlert, FileCheck, Bug, ShieldCheck, Gauge, Package, Database, Lock,
};

const catalogServers = [
  { id: "c1", name: "Slack MCP Server", description: "Connect to Slack workspaces", icon: MessageSquare, defaultUrl: "https://mcp.slack.com/v1/stream" },
  { id: "c2", name: "GitHub MCP Server", description: "Access GitHub repositories", icon: Globe, defaultUrl: "https://mcp.github.com/v1/stream" },
  { id: "c3", name: "Notion MCP Server", description: "Read and write Notion pages", icon: FileJson, defaultUrl: "https://mcp.notion.so/v1/stream" },
  { id: "c4", name: "Gmail MCP Server", description: "Send and read emails", icon: Mail, defaultUrl: "https://mcp.googleapis.com/gmail/v1/stream" },
];

interface ActiveMCPServer {
  id: string;
  name: string;
  status: "Active" | "Configured";
  icon: LucideIcon;
}

interface GatewayServer {
  id: string;
  name: string;
  url: string;
  transport: string;
  auth: string;
  icon: LucideIcon;
}

interface SavedGateway {
  id: string;
  name: string;
  servers: GatewayServer[];
  securityPolicies: string[];
  businessPolicies: string[];
}

interface MCPGatewayCardProps {
  activeMCPServers?: ActiveMCPServer[];
  securityPolicies?: SecurityPolicy[];
  businessPolicies?: BusinessPolicy[];
}

const MCPGatewayCard = ({ activeMCPServers = [], securityPolicies = [], businessPolicies = [] }: MCPGatewayCardProps) => {
  const [open, setOpen] = useState(false);
  const [gateways, setGateways] = useState<SavedGateway[]>(() => {
    try {
      const stored = localStorage.getItem("mcp-gateways");
      return stored ? JSON.parse(stored) : [];
    } catch { return []; }
  });

  const [gatewayName, setGatewayName] = useState("");
  const [registeredServers, setRegisteredServers] = useState<GatewayServer[]>([]);
  const [newServerName, setNewServerName] = useState("");
  const [newServerUrl, setNewServerUrl] = useState("");
  const [transportType, setTransportType] = useState("streamable-http");
  const [authType, setAuthType] = useState("none");

  const activeSecurityPolicies = securityPolicies.filter((p) => p.active);
  const activeBusinessPolicies = businessPolicies.filter((p) => p.active);

  const [selectedSecurityPolicies, setSelectedSecurityPolicies] = useState<string[]>([]);
  const [selectedBusinessPolicies, setSelectedBusinessPolicies] = useState<string[]>([]);

  const [catalogDetailOpen, setCatalogDetailOpen] = useState(false);
  const [catalogDetailServer, setCatalogDetailServer] = useState<typeof catalogServers[0] | null>(null);
  const [catalogUrl, setCatalogUrl] = useState("");
  const [catalogTransport, setCatalogTransport] = useState("streamable-http");
  const [catalogAuth, setCatalogAuth] = useState("none");

  const resetForm = () => {
    setGatewayName("");
    setRegisteredServers([]);
    setNewServerName("");
    setNewServerUrl("");
    setTransportType("streamable-http");
    setAuthType("none");
    setSelectedSecurityPolicies([]);
    setSelectedBusinessPolicies([]);
  };

  const handleAddRegisteredServer = () => {
    if (!newServerName.trim()) return;
    setRegisteredServers((prev) => [
      ...prev,
      { id: `rs-${Date.now()}`, name: newServerName.trim(), url: newServerUrl.trim(), transport: transportType, auth: authType, icon: Server },
    ]);
    setNewServerName("");
    setNewServerUrl("");
    setAuthType("none");
  };

  const handleCatalogClick = (s: typeof catalogServers[0]) => {
    if (registeredServers.some((r) => r.name === s.name)) return;
    setCatalogDetailServer(s);
    setCatalogUrl(s.defaultUrl);
    setCatalogTransport("streamable-http");
    setCatalogAuth("none");
    setCatalogDetailOpen(true);
  };

  const handleCatalogConfirm = () => {
    if (!catalogDetailServer) return;
    setRegisteredServers((prev) => [
      ...prev,
      { id: `cat-${Date.now()}`, name: catalogDetailServer.name, url: catalogUrl, transport: catalogTransport, auth: catalogAuth, icon: catalogDetailServer.icon },
    ]);
    setCatalogDetailOpen(false);
    setCatalogDetailServer(null);
  };

  const toggleSecurityPolicy = (id: string) => {
    setSelectedSecurityPolicies((prev) => prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]);
  };

  const toggleBusinessPolicy = (id: string) => {
    setSelectedBusinessPolicies((prev) => prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]);
  };

  const handleCreate = () => {
    if (!gatewayName.trim()) return;
    const newGateway: SavedGateway = {
      id: `gw-${Date.now()}`,
      name: gatewayName.trim(),
      servers: [...registeredServers],
      securityPolicies: [...selectedSecurityPolicies],
      businessPolicies: [...selectedBusinessPolicies],
    };
    setGateways((prev) => {
      const updated = [...prev, newGateway];
      localStorage.setItem("mcp-gateways", JSON.stringify(updated));
      return updated;
    });
    resetForm();
    setOpen(false);
  };

  const handleDeleteGateway = (id: string) => {
    setGateways((prev) => {
      const updated = prev.filter((g) => g.id !== id);
      localStorage.setItem("mcp-gateways", JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <div className="rounded-lg border border-border bg-card shadow-sm">
      <div className="flex items-center justify-between border-b border-border px-5 py-3">
        <h3 className="text-sm font-semibold text-foreground">MCP Gateway</h3>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm(); }}>
          <DialogTrigger asChild>
            <button className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground">
              <Plus size={16} />
            </button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add MCP Gateway</DialogTitle>
              <DialogDescription>Configure a gateway with MCP servers, security policies, and business policies.</DialogDescription>
            </DialogHeader>

            <div className="mt-4 space-y-6">
              <div className="space-y-2">
                <Label htmlFor="gw-name">Gateway Name</Label>
                <Input id="gw-name" placeholder="My MCP Gateway" value={gatewayName} onChange={(e) => setGatewayName(e.target.value)} />
              </div>

              {/* MCP Servers Section */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-foreground">MCP Servers</h4>
                <Tabs defaultValue="active" className="w-full">
                  <TabsList className="w-full">
                    <TabsTrigger value="active" className="flex-1">Active Servers</TabsTrigger>
                    <TabsTrigger value="register" className="flex-1">Register New</TabsTrigger>
                    <TabsTrigger value="catalog" className="flex-1">Browse Catalog</TabsTrigger>
                  </TabsList>
                  <TabsContent value="active" className="pt-3">
                    {activeMCPServers.filter((s) => s.status === "Active").length === 0 ? (
                      <p className="text-xs text-muted-foreground py-3 text-center">No active MCP servers available.</p>
                    ) : (
                      <div className="divide-y divide-border rounded-md border border-border">
                        {activeMCPServers.filter((s) => s.status === "Active").map((s) => {
                          const Icon = s.icon;
                          const added = registeredServers.some((r) => r.name === s.name);
                          return (
                            <div key={s.id} className="flex items-center gap-3 px-3 py-2.5">
                              <div className="flex h-7 w-7 items-center justify-center rounded bg-muted text-muted-foreground"><Icon size={14} /></div>
                              <div className="min-w-0 flex-1">
                                <p className="text-xs font-medium text-foreground">{s.name}</p>
                                <span className="inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-medium bg-redwood-green-light text-redwood-green">Active</span>
                              </div>
                              <Button variant={added ? "ghost" : "outline"} size="sm" disabled={added} onClick={() => {
                                if (added) return;
                                setRegisteredServers((prev) => [...prev, { id: `active-${Date.now()}-${s.id}`, name: s.name, url: "", transport: "streamable-http", auth: "none", icon: s.icon }]);
                              }} className="h-7 text-xs">{added ? "Added" : "Add"}</Button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </TabsContent>
                  <TabsContent value="register" className="space-y-3 pt-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label className="text-xs">Server Name</Label>
                        <Input placeholder="My MCP Server" value={newServerName} onChange={(e) => setNewServerName(e.target.value)} className="h-8 text-xs" />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs">URL</Label>
                        <Input placeholder="https://mcp.example.com" value={newServerUrl} onChange={(e) => setNewServerUrl(e.target.value)} className="h-8 text-xs" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label className="text-xs">Transport Type</Label>
                        <Select value={transportType} onValueChange={setTransportType}>
                          <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                          <SelectContent><SelectItem value="streamable-http">Streamable HTTP</SelectItem></SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs">Authorization</Label>
                        <Select value={authType} onValueChange={setAuthType}>
                          <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">None</SelectItem>
                            <SelectItem value="api-key">API Key</SelectItem>
                            <SelectItem value="jwt">JWT</SelectItem>
                            <SelectItem value="client-credentials">Client Credentials</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <Button size="sm" variant="outline" onClick={handleAddRegisteredServer} disabled={!newServerName.trim()} className="w-full">Add Server</Button>
                  </TabsContent>
                  <TabsContent value="catalog" className="pt-3">
                    <div className="divide-y divide-border rounded-md border border-border">
                      {catalogServers.map((s) => {
                        const Icon = s.icon;
                        const added = registeredServers.some((r) => r.name === s.name);
                        return (
                          <div key={s.id} className="flex items-center gap-3 px-3 py-2.5">
                            <div className="flex h-7 w-7 items-center justify-center rounded bg-muted text-muted-foreground"><Icon size={14} /></div>
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-medium text-foreground">{s.name}</p>
                              <p className="text-[11px] text-muted-foreground">{s.description}</p>
                            </div>
                            <Button variant={added ? "ghost" : "outline"} size="sm" disabled={added} onClick={() => handleCatalogClick(s)} className="h-7 text-xs">{added ? "Added" : "Connect"}</Button>
                          </div>
                        );
                      })}
                    </div>
                  </TabsContent>
                </Tabs>

                {registeredServers.length > 0 && (
                  <div className="rounded-md border border-border divide-y divide-border">
                    {registeredServers.map((s) => {
                      const Icon = s.icon;
                      return (
                        <div key={s.id} className="flex items-center gap-2 px-3 py-2">
                          <div className="flex h-6 w-6 items-center justify-center rounded bg-muted text-muted-foreground"><Icon size={12} /></div>
                          <div className="flex-1 min-w-0">
                            <span className="text-xs font-medium text-foreground">{s.name}</span>
                            <p className="text-[10px] text-muted-foreground truncate">{s.url}</p>
                          </div>
                          <span className="text-[10px] text-muted-foreground capitalize">{s.auth === "none" ? "No Auth" : s.auth}</span>
                          <button onClick={() => setRegisteredServers((p) => p.filter((x) => x.id !== s.id))} className="text-xs text-muted-foreground hover:text-destructive">Remove</button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Security Policies - from props, active only */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-foreground">Security Policies</h4>
                {activeSecurityPolicies.length === 0 ? (
                  <p className="text-xs text-muted-foreground py-2 text-center">No active security policies available. Add and activate them in the Security Policies card.</p>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    {activeSecurityPolicies.map((p) => {
                      const Icon = iconMap[p.icon] || ShieldCheck;
                      const checked = selectedSecurityPolicies.includes(p.id);
                      return (
                        <label key={p.id} className="flex items-center gap-2.5 rounded-md border border-border p-2.5 cursor-pointer hover:bg-muted/50">
                          <Checkbox checked={checked} onCheckedChange={() => toggleSecurityPolicy(p.id)} />
                          <div className="flex h-6 w-6 items-center justify-center rounded bg-muted text-muted-foreground"><Icon size={12} /></div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-medium text-foreground">{p.name}</p>
                            <p className="text-[10px] text-muted-foreground">{p.description}</p>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Business Policies - from props, active only */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-foreground">Business Policies</h4>
                {activeBusinessPolicies.length === 0 ? (
                  <p className="text-xs text-muted-foreground py-2 text-center">No active business policies available. Create and activate them in the Business Policies card.</p>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    {activeBusinessPolicies.map((p) => {
                      const checked = selectedBusinessPolicies.includes(p.id);
                      return (
                        <label key={p.id} className="flex items-center gap-2.5 rounded-md border border-border p-2.5 cursor-pointer hover:bg-muted/50">
                          <Checkbox checked={checked} onCheckedChange={() => toggleBusinessPolicy(p.id)} />
                          <div className="flex h-6 w-6 items-center justify-center rounded bg-muted text-muted-foreground"><ListChecks size={12} /></div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-medium text-foreground">{p.name}</p>
                            <p className="text-[10px] text-muted-foreground">{p.conditions.length} condition{p.conditions.length !== 1 ? "s" : ""}</p>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>

              <Button className="w-full" onClick={handleCreate} disabled={!gatewayName.trim()}>Create Gateway</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Catalog connect detail dialog */}
      <Dialog open={catalogDetailOpen} onOpenChange={setCatalogDetailOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Connect {catalogDetailServer?.name}</DialogTitle>
            <DialogDescription>Review and confirm the server details below.</DialogDescription>
          </DialogHeader>
          {catalogDetailServer && (
            <div className="mt-3 space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs">Server Name</Label>
                <Input value={catalogDetailServer.name} disabled className="h-8 text-xs" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">URL</Label>
                <Input value={catalogUrl} onChange={(e) => setCatalogUrl(e.target.value)} className="h-8 text-xs" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Transport Type</Label>
                  <Select value={catalogTransport} onValueChange={setCatalogTransport}>
                    <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="streamable-http">Streamable HTTP</SelectItem></SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Authorization</Label>
                  <Select value={catalogAuth} onValueChange={setCatalogAuth}>
                    <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="api-key">API Key</SelectItem>
                      <SelectItem value="jwt">JWT</SelectItem>
                      <SelectItem value="client-credentials">Client Credentials</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button className="w-full" onClick={handleCatalogConfirm}>Add to Gateway</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Gateway list */}
      <div className="divide-y divide-border">
        {gateways.length === 0 && (
          <p className="px-5 py-4 text-sm text-muted-foreground">No gateways configured. Click + to create one.</p>
        )}
        {gateways.map((gw) => (
          <div key={gw.id} className="flex items-center gap-3 px-5 py-3">
            <div className="flex h-8 w-8 items-center justify-center rounded bg-muted text-muted-foreground"><Server size={16} /></div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-foreground">{gw.name}</p>
              <p className="text-xs text-muted-foreground">
                {gw.servers.length} server{gw.servers.length !== 1 ? "s" : ""} · {gw.securityPolicies.length} security · {gw.businessPolicies.length} business
              </p>
            </div>
            <button onClick={() => handleDeleteGateway(gw.id)} className="text-muted-foreground hover:text-destructive"><Trash2 size={14} /></button>
            <ChevronRight size={14} className="text-muted-foreground" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default MCPGatewayCard;
