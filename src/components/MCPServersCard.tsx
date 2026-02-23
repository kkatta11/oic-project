import { useState } from "react";
import { MoreHorizontal, Plus, Server, Globe, Database, MessageSquare, FileJson, Mail } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

const servers = [
  { id: "1", name: "Filesystem MCP Server", status: "Active", icon: Server },
  { id: "2", name: "PostgreSQL MCP Server", status: "Configured", icon: Database },
];

const catalogServers = [
  { id: "c1", name: "Slack MCP Server", description: "Connect to Slack workspaces", icon: MessageSquare },
  { id: "c2", name: "GitHub MCP Server", description: "Access GitHub repositories", icon: Globe },
  { id: "c3", name: "Notion MCP Server", description: "Read and write Notion pages", icon: FileJson },
  { id: "c4", name: "Gmail MCP Server", description: "Send and read emails", icon: Mail },
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

const MCPServersCard = () => {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-lg border border-border bg-card shadow-sm">
      <div className="flex items-center justify-between border-b border-border px-5 py-3">
        <h3 className="text-sm font-semibold text-foreground">MCP Servers</h3>
        <Dialog open={open} onOpenChange={setOpen}>
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
                  <Input id="server-name" placeholder="My MCP Server" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="server-url">URL</Label>
                  <Input id="server-url" placeholder="https://mcp.example.com" />
                </div>
                <div className="space-y-2">
                  <Label>Transport Type</Label>
                  <Select defaultValue="streamable-http">
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="streamable-http">Streamable HTTP</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Authorization</Label>
                  <Select defaultValue="none">
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="api-key">API Key</SelectItem>
                      <SelectItem value="jwt">JWT</SelectItem>
                      <SelectItem value="client-credentials">Client Credentials</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button className="w-full" onClick={() => setOpen(false)}>Register Server</Button>
              </TabsContent>
              <TabsContent value="catalog" className="pt-4">
                <div className="divide-y divide-border rounded-md border border-border">
                  {catalogServers.map((s) => {
                    const Icon = s.icon;
                    return (
                      <div key={s.id} className="flex items-center gap-3 px-4 py-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded bg-muted text-muted-foreground">
                          <Icon size={16} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-foreground">{s.name}</p>
                          <p className="text-xs text-muted-foreground">{s.description}</p>
                        </div>
                        <Button variant="outline" size="sm">Connect</Button>
                      </div>
                    );
                  })}
                </div>
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      </div>

      <div className="divide-y divide-border">
        {servers.map((server) => {
          const Icon = server.icon;
          return (
            <div key={server.id} className="flex items-center gap-3 px-5 py-3">
              <div className="flex h-8 w-8 items-center justify-center rounded bg-muted text-muted-foreground">
                <Icon size={16} />
              </div>
              <span className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">
                {server.name}
              </span>
              <StatusBadge status={server.status} />
              <button className="ml-1 text-muted-foreground hover:text-foreground">
                <MoreHorizontal size={16} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MCPServersCard;
