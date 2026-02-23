import { useState } from "react";
import { MoreHorizontal, Plus, Server, Globe, Database, MessageSquare, FileJson, Mail, Trash2, Loader2, type LucideIcon } from "lucide-react";
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

export interface MCPServerTool {
  id: string;
  name: string;
  description: string;
}

export interface MCPServer {
  id: string;
  name: string;
  status: "Active" | "Configured";
  icon: LucideIcon;
  tools: MCPServerTool[];
}

// Mock tool catalogs per server type
const serverToolCatalog: Record<string, MCPServerTool[]> = {
  "Filesystem MCP Server": [
    { id: "fs-1", name: "List Files", description: "List files in a directory" },
    { id: "fs-2", name: "Read File", description: "Read file contents" },
    { id: "fs-3", name: "Write File", description: "Write content to a file" },
    { id: "fs-4", name: "Delete File", description: "Delete a file" },
  ],
  "PostgreSQL MCP Server": [
    { id: "pg-1", name: "Run Query", description: "Execute a SQL query" },
    { id: "pg-2", name: "List Tables", description: "List database tables" },
    { id: "pg-3", name: "Describe Table", description: "Get table schema" },
    { id: "pg-4", name: "Insert Row", description: "Insert a row into a table" },
  ],
  "Slack MCP Server": [
    { id: "sl-1", name: "Send Message", description: "Send a message to a channel" },
    { id: "sl-2", name: "List Channels", description: "List available channels" },
    { id: "sl-3", name: "Search Messages", description: "Search messages in workspace" },
    { id: "sl-4", name: "Upload File", description: "Upload a file to a channel" },
  ],
  "GitHub MCP Server": [
    { id: "gh-1", name: "List Repos", description: "List repositories" },
    { id: "gh-2", name: "Create Issue", description: "Create a new issue" },
    { id: "gh-3", name: "Get PR", description: "Get pull request details" },
    { id: "gh-4", name: "Search Code", description: "Search code across repos" },
  ],
  "Notion MCP Server": [
    { id: "no-1", name: "Query Database", description: "Query a Notion database" },
    { id: "no-2", name: "Create Page", description: "Create a new page" },
    { id: "no-3", name: "Update Page", description: "Update an existing page" },
    { id: "no-4", name: "Search", description: "Search across workspace" },
  ],
  "Gmail MCP Server": [
    { id: "gm-1", name: "Send Email", description: "Send an email" },
    { id: "gm-2", name: "Search Emails", description: "Search emails" },
    { id: "gm-3", name: "Get Thread", description: "Get an email thread" },
    { id: "gm-4", name: "Create Draft", description: "Create a draft email" },
  ],
  _default: [
    { id: "def-1", name: "Execute", description: "Execute a server action" },
    { id: "def-2", name: "Query", description: "Query server data" },
    { id: "def-3", name: "List Resources", description: "List available resources" },
  ],
};

function getToolsForServer(name: string): MCPServerTool[] {
  return serverToolCatalog[name] ?? serverToolCatalog._default;
}

const defaultServers: MCPServer[] = [
  {
    id: "1", name: "Filesystem MCP Server", status: "Active", icon: Server,
    tools: serverToolCatalog["Filesystem MCP Server"],
  },
  {
    id: "2", name: "PostgreSQL MCP Server", status: "Configured", icon: Database,
    tools: serverToolCatalog["PostgreSQL MCP Server"],
  },
];

const catalogServers = [
  { id: "c1", name: "Slack MCP Server", description: "Connect to Slack workspaces", icon: MessageSquare, defaultUrl: "https://mcp.slack.com/v1/stream" },
  { id: "c2", name: "GitHub MCP Server", description: "Access GitHub repositories", icon: Globe, defaultUrl: "https://mcp.github.com/v1/stream" },
  { id: "c3", name: "Notion MCP Server", description: "Read and write Notion pages", icon: FileJson, defaultUrl: "https://mcp.notion.so/v1/stream" },
  { id: "c4", name: "Gmail MCP Server", description: "Send and read emails", icon: Mail, defaultUrl: "https://mcp.googleapis.com/gmail/v1/stream" },
];

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

// --- Tool Checklist Sub-component ---
const ToolChecklist = ({
  tools,
  selectedIds,
  onToggle,
}: {
  tools: MCPServerTool[];
  selectedIds: Set<string>;
  onToggle: (id: string) => void;
}) => (
  <div className="space-y-1 rounded-md border border-border p-3 max-h-48 overflow-y-auto">
    <p className="text-xs font-medium text-muted-foreground mb-2">Select tools to include</p>
    {tools.map((tool) => (
      <label key={tool.id} className="flex items-start gap-2 py-1.5 cursor-pointer hover:bg-muted/50 rounded px-1 -mx-1">
        <Checkbox
          checked={selectedIds.has(tool.id)}
          onCheckedChange={() => onToggle(tool.id)}
          className="mt-0.5"
        />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-foreground leading-tight">{tool.name}</p>
          <p className="text-xs text-muted-foreground">{tool.description}</p>
        </div>
      </label>
    ))}
  </div>
);

interface MCPServersCardProps {
  servers?: MCPServer[];
  onServersChange?: (servers: MCPServer[]) => void;
}

const MCPServersCard = ({ servers: externalServers, onServersChange }: MCPServersCardProps) => {
  const [internalServers, setInternalServers] = useState<MCPServer[]>(defaultServers);
  const [open, setOpen] = useState(false);
  const [serverName, setServerName] = useState("");
  const [serverUrl, setServerUrl] = useState("");
  const [transportType, setTransportType] = useState("streamable-http");
  const [authType, setAuthType] = useState("none");

  // Tool discovery state for Register New
  const [fetchedTools, setFetchedTools] = useState<MCPServerTool[]>([]);
  const [selectedToolIds, setSelectedToolIds] = useState<Set<string>>(new Set());
  const [isFetching, setIsFetching] = useState(false);
  const [toolsFetched, setToolsFetched] = useState(false);

  // Catalog detail dialog
  const [catalogDetailOpen, setCatalogDetailOpen] = useState(false);
  const [catalogDetailServer, setCatalogDetailServer] = useState<typeof catalogServers[0] | null>(null);
  const [catalogUrl, setCatalogUrl] = useState("");
  const [catalogTransport, setCatalogTransport] = useState("streamable-http");
  const [catalogAuth, setCatalogAuth] = useState("none");
  const [catalogTools, setCatalogTools] = useState<MCPServerTool[]>([]);
  const [catalogSelectedToolIds, setCatalogSelectedToolIds] = useState<Set<string>>(new Set());

  const servers = externalServers ?? internalServers;

  const updateServers = (updated: MCPServer[]) => {
    if (onServersChange) {
      onServersChange(updated);
    } else {
      setInternalServers(updated);
    }
  };

  const handleFetchTools = () => {
    setIsFetching(true);
    // Simulate network delay
    setTimeout(() => {
      const tools = getToolsForServer(serverName.trim());
      setFetchedTools(tools);
      setSelectedToolIds(new Set(tools.map((t) => t.id)));
      setToolsFetched(true);
      setIsFetching(false);
    }, 800);
  };

  const toggleToolId = (id: string) => {
    setSelectedToolIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleRegister = () => {
    if (!serverName.trim()) return;
    const selectedTools = fetchedTools.filter((t) => selectedToolIds.has(t.id));
    const newServer: MCPServer = {
      id: `reg-${Date.now()}`,
      name: serverName.trim(),
      status: "Configured",
      icon: Server,
      tools: selectedTools,
    };
    updateServers([...servers, newServer]);
    // Reset
    setServerName("");
    setServerUrl("");
    setAuthType("none");
    setFetchedTools([]);
    setSelectedToolIds(new Set());
    setToolsFetched(false);
    setOpen(false);
  };

  const handleCatalogClick = (catalogServer: typeof catalogServers[0]) => {
    if (servers.some((s) => s.name === catalogServer.name)) return;
    setCatalogDetailServer(catalogServer);
    setCatalogUrl(catalogServer.defaultUrl);
    setCatalogTransport("streamable-http");
    setCatalogAuth("none");
    // Pre-load tools for this catalog server
    const tools = getToolsForServer(catalogServer.name);
    setCatalogTools(tools);
    setCatalogSelectedToolIds(new Set(tools.map((t) => t.id)));
    setCatalogDetailOpen(true);
  };

  const toggleCatalogToolId = (id: string) => {
    setCatalogSelectedToolIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleCatalogConfirm = () => {
    if (!catalogDetailServer) return;
    const selectedTools = catalogTools.filter((t) => catalogSelectedToolIds.has(t.id));
    const newServer: MCPServer = {
      id: `cat-${Date.now()}`,
      name: catalogDetailServer.name,
      status: "Active",
      icon: catalogDetailServer.icon,
      tools: selectedTools,
    };
    updateServers([...servers, newServer]);
    setCatalogDetailOpen(false);
    setCatalogDetailServer(null);
  };

  const handleRemove = (id: string) => {
    updateServers(servers.filter((s) => s.id !== id));
  };

  const resetRegisterForm = () => {
    setServerName("");
    setServerUrl("");
    setAuthType("none");
    setFetchedTools([]);
    setSelectedToolIds(new Set());
    setToolsFetched(false);
  };

  return (
    <div className="rounded-lg border border-border bg-card shadow-sm">
      <div className="flex items-center justify-between border-b border-border px-5 py-3">
        <h3 className="text-sm font-semibold text-foreground">MCP Servers</h3>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetRegisterForm(); }}>
          <DialogTrigger asChild>
            <button className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground">
              <Plus size={16} />
            </button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Add MCP Server</DialogTitle>
              <DialogDescription>Register a new server or browse community catalog.</DialogDescription>
            </DialogHeader>
            <Tabs defaultValue="register" className="mt-2">
              <TabsList className="w-full">
                <TabsTrigger value="register" className="flex-1">Register New</TabsTrigger>
                <TabsTrigger value="catalog" className="flex-1">Browse Catalog</TabsTrigger>
              </TabsList>
              <TabsContent value="register" className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="server-name">Server Name</Label>
                  <Input id="server-name" placeholder="My MCP Server" value={serverName} onChange={(e) => setServerName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="server-url">URL</Label>
                  <Input id="server-url" placeholder="https://mcp.example.com" value={serverUrl} onChange={(e) => setServerUrl(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Transport Type</Label>
                  <Select value={transportType} onValueChange={setTransportType}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="streamable-http">Streamable HTTP</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Authorization</Label>
                  <Select value={authType} onValueChange={setAuthType}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="api-key">API Key</SelectItem>
                      <SelectItem value="jwt">JWT</SelectItem>
                      <SelectItem value="client-credentials">Client Credentials</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Fetch Tools */}
                {!toolsFetched ? (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={handleFetchTools}
                    disabled={!serverUrl.trim() || isFetching}
                  >
                    {isFetching ? (
                      <>
                        <Loader2 size={14} className="mr-2 animate-spin" />
                        Discovering Tools…
                      </>
                    ) : (
                      "Fetch Tools"
                    )}
                  </Button>
                ) : (
                  <ToolChecklist tools={fetchedTools} selectedIds={selectedToolIds} onToggle={toggleToolId} />
                )}

                <Button className="w-full" onClick={handleRegister} disabled={!serverName.trim() || !toolsFetched || selectedToolIds.size === 0}>
                  Register Server
                </Button>
              </TabsContent>
              <TabsContent value="catalog" className="pt-4">
                <div className="divide-y divide-border rounded-md border border-border">
                  {catalogServers.map((s) => {
                    const Icon = s.icon;
                    const alreadyAdded = servers.some((srv) => srv.name === s.name);
                    return (
                      <div key={s.id} className="flex items-center gap-3 px-4 py-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded bg-muted text-muted-foreground">
                          <Icon size={16} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-foreground">{s.name}</p>
                          <p className="text-xs text-muted-foreground">{s.description}</p>
                        </div>
                        <Button
                          variant={alreadyAdded ? "ghost" : "outline"}
                          size="sm"
                          disabled={alreadyAdded}
                          onClick={() => handleCatalogClick(s)}
                        >
                          {alreadyAdded ? "Connected" : "Connect"}
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      </div>

      {/* Catalog connect detail dialog */}
      <Dialog open={catalogDetailOpen} onOpenChange={setCatalogDetailOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Connect {catalogDetailServer?.name}</DialogTitle>
            <DialogDescription>Review details, select tools, and configure authorization.</DialogDescription>
          </DialogHeader>
          {catalogDetailServer && (
            <div className="mt-3 space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs">Server Name</Label>
                <Input value={catalogDetailServer.name} disabled className="h-9 text-sm" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">URL</Label>
                <Input value={catalogUrl} onChange={(e) => setCatalogUrl(e.target.value)} className="h-9 text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Transport Type</Label>
                  <Select value={catalogTransport} onValueChange={setCatalogTransport}>
                    <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="streamable-http">Streamable HTTP</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Authorization</Label>
                  <Select value={catalogAuth} onValueChange={setCatalogAuth}>
                    <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="api-key">API Key</SelectItem>
                      <SelectItem value="jwt">JWT</SelectItem>
                      <SelectItem value="client-credentials">Client Credentials</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Tool selection for catalog server */}
              <ToolChecklist tools={catalogTools} selectedIds={catalogSelectedToolIds} onToggle={toggleCatalogToolId} />

              <Button className="w-full" onClick={handleCatalogConfirm} disabled={catalogSelectedToolIds.size === 0}>
                Connect Server
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <div className="divide-y divide-border">
        {servers.length === 0 && (
          <p className="px-5 py-4 text-sm text-muted-foreground">No MCP servers configured.</p>
        )}
        {servers.map((server) => {
          const Icon = server.icon;
          return (
            <div key={server.id} className="flex items-center gap-3 px-5 py-3">
              <div className="flex h-8 w-8 items-center justify-center rounded bg-muted text-muted-foreground">
                <Icon size={16} />
              </div>
              <div className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium text-foreground">
                  {server.name}
                </span>
                {server.tools.length > 0 && (
                  <span className="text-xs text-muted-foreground">{server.tools.length} tools</span>
                )}
              </div>
              <StatusBadge status={server.status} />
              <button onClick={() => handleRemove(server.id)} className="ml-1 text-muted-foreground hover:text-destructive">
                <Trash2 size={14} />
              </button>
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

export { defaultServers };
export default MCPServersCard;
