import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Search, LayoutGrid, List, Pencil, Save, MoreHorizontal, ArrowLeft, Copy, Sparkles } from "lucide-react";
import OracleHeader from "@/components/OracleHeader";
import SidebarNav from "@/components/SidebarNav";
import IntegrationsCard from "@/components/IntegrationsCard";
import SimpleCard from "@/components/SimpleCard";
import ToolsCard from "@/components/ToolsCard";
import MCPServersCard, { type MCPServer } from "@/components/MCPServersCard";
import SecurityPoliciesCard, { type SecurityPolicy, loadSecurityPolicies, saveSecurityPolicies } from "@/components/SecurityPoliciesCard";
import BusinessPoliciesCard, { type BusinessPolicy, loadBusinessPolicies, saveBusinessPolicies } from "@/components/BusinessPoliciesCard";
import MCPGatewayCard from "@/components/MCPGatewayCard";
import GatewayObserveDashboard from "@/components/GatewayObserveDashboard";
import { sidebarItems } from "@/data/mockData";
import { getProjectData, projects } from "@/data/projectsData";
import ConnectionsCard from "@/components/ConnectionsCard";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";


const tabs = ["Design", "Deploy", "Observe"];


const Index = () => {
  const { projectId = "smart-invoice" } = useParams();
  const navigate = useNavigate();
  const projectData = getProjectData(projectId);
  const currentProject = projects.find((p) => p.id === projectId) ?? projects[0];

  const [activeTab, setActiveTab] = useState("Design");
  const [activeSidebarItem, setActiveSidebarItem] = useState("integrations");
  const [mcpServers, setMcpServers] = useState<MCPServer[]>(projectData.mcpServers);
  const [securityPolicies, setSecurityPolicies] = useState<SecurityPolicy[]>(() => loadSecurityPolicies(projectId));
  const [businessPolicies, setBusinessPolicies] = useState<BusinessPolicy[]>(() => loadBusinessPolicies(projectId));

  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    name: currentProject.name,
    identifier: currentProject.identifier,
    description: currentProject.description,
    keywords: currentProject.keywords,
    mcpServerEnabled: currentProject.mcpServerEnabled,
  });

  const openEditDialog = () => {
    setEditForm({
      name: currentProject.name,
      identifier: currentProject.identifier,
      description: currentProject.description,
      keywords: currentProject.keywords,
      mcpServerEnabled: currentProject.mcpServerEnabled,
    });
    setEditOpen(true);
  };

  const handleSaveEdit = () => {
    // Update in-memory project data
    Object.assign(currentProject, {
      name: editForm.name,
      identifier: editForm.identifier,
      description: editForm.description,
      keywords: editForm.keywords,
      mcpServerEnabled: editForm.mcpServerEnabled,
    });
    setEditOpen(false);
    toast({ title: "Project updated", description: "Project details have been saved." });
  };

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(currentProject.mcpServerUrl);
    toast({ title: "Copied", description: "MCP server URL copied to clipboard." });
  };
  const renderContent = () => {
    if (activeTab === "Observe" && activeSidebarItem === "gateway") {
      return <GatewayObserveDashboard />;
    }
    if (activeTab === "Observe") {
      return (
        <SimpleCard title="Observe" description="Monitoring and observability for this section is coming soon." />
      );
    }
    if (activeSidebarItem === "agent") {
      return (
        <>
          <SimpleCard title="Agents" description="Create and manage AI agents for your integration workflows." />
          <ToolsCard tools={projectData.tools} />
          <SimpleCard title="Agent Patterns" description="Configure reusable patterns for agent behavior." />
          <SimpleCard title="Prompt Templates" description="Design and manage prompt templates for agent interactions." />
        </>
      );
    }
    if (activeSidebarItem === "gateway") {
      return (
        <>
          <MCPGatewayCard activeMCPServers={mcpServers} mcpServers={mcpServers} securityPolicies={securityPolicies} businessPolicies={businessPolicies} projectId={projectId} tools={projectData.tools} />
          <MCPServersCard servers={mcpServers} onServersChange={setMcpServers} />
          <SecurityPoliciesCard policies={securityPolicies} onPoliciesChange={setSecurityPolicies} mcpServers={mcpServers} projectId={projectId} tools={projectData.tools} />
          <BusinessPoliciesCard policies={businessPolicies} onPoliciesChange={setBusinessPolicies} mcpServers={mcpServers} projectId={projectId} tools={projectData.tools} />
        </>
      );
    }
    if (activeSidebarItem === "rpa") {
      return (
        <>
          <SimpleCard title="Robots" description="Configure and manage RPA robots for task automation." />
          <SimpleCard title="Environment Pools" description="Define pools of environments where robots execute." />
          <SimpleCard title="Robot Connection Types" description="Manage connection type definitions for robots." />
          <SimpleCard title="Robot Connections" description="Configure active connections used by robots." />
        </>
      );
    }
    if (activeSidebarItem === "hitl") {
      return (
        <>
          <SimpleCard title="Workflows" description="Design and manage human approval and review workflows." />
          <SimpleCard title="Forms" description="Create forms for human input within automated processes." />
        </>
      );
    }
    if (activeSidebarItem === "decision") {
      return (
        <SimpleCard title="Decisions" description="Define and manage business rules and decision logic." />
      );
    }
    if (activeSidebarItem === "healthcare") {
      return <SimpleCard title="Healthcare" description="Healthcare integrations — HL7, FHIR, and clinical data exchange workflows." />;
    }
    if (activeSidebarItem === "b2b") {
      return <SimpleCard title="B2B" description="B2B commerce — manage EDI, partner onboarding, and trading partner integrations." />;
    }
    if (activeSidebarItem === "knowledge") {
      return (
        <SimpleCard title="Knowledge Base" description="Curate and manage knowledge sources for AI-powered workflows." />
      );
    }
    return (
      <>
        <IntegrationsCard integrations={projectData.integrations} />
        <ConnectionsCard connections={projectData.connections} />
        <SimpleCard title="Lookups" description="Configure lookup tables for data mapping and transformation." />
        <SimpleCard title="Libraries" description="Manage reusable libraries and shared resources." />
      </>
    );
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <OracleHeader />
      <div className="h-1.5 bg-gradient-to-r from-redwood-gold via-redwood-banner to-redwood-gold" />

      <div className="border-b border-border bg-card px-6 py-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft size={16} />
            <span>Projects</span>
          </button>
          <div className="h-5 w-px bg-border" />
          <h1 className="text-xl font-bold text-foreground">{projectData.name}</h1>
        </div>
      </div>

      <div className="flex items-center justify-between border-b border-border bg-card px-6">
        <div className="flex">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`relative px-5 py-3 text-sm font-medium transition-colors ${
                activeTab === tab
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab}
              {activeTab === tab && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-redwood-gold" />
              )}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1">
          <button className="rounded p-2 text-muted-foreground hover:bg-muted hover:text-foreground">
            <LayoutGrid size={16} />
          </button>
          <button className="rounded p-2 text-muted-foreground hover:bg-muted hover:text-foreground">
            <List size={16} />
          </button>
          <div className="mx-1 h-5 w-px bg-border" />
          <button onClick={openEditDialog} className="rounded p-2 text-muted-foreground hover:bg-muted hover:text-foreground">
            <Pencil size={16} />
          </button>
          <button className="rounded p-2 text-muted-foreground hover:bg-muted hover:text-foreground">
            <Save size={16} />
          </button>
          <button className="rounded p-2 text-muted-foreground hover:bg-muted hover:text-foreground">
            <MoreHorizontal size={16} />
          </button>
        </div>
      </div>

      <div className="flex flex-1" key={projectId}>
        <SidebarNav
          activeItem={activeSidebarItem}
          onItemClick={setActiveSidebarItem}
          items={sidebarItems}
        />

        <main className="flex-1 p-6">
          <div className="mb-6 flex justify-end">
            <div className="relative w-full max-w-md">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Full or partial name or keyword or description"
                className="h-9 w-full rounded-md border border-input bg-card pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
          </div>

          {activeTab === "Observe" ? (
            renderContent()
          ) : (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {renderContent()}
            </div>
          )}
        </main>
      </div>

      {/* Edit Details Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit details</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-accent-foreground">Name</label>
              <Input
                value={editForm.name}
                onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-accent-foreground">Identifier</label>
              <Input
                value={editForm.identifier}
                onChange={(e) => setEditForm((f) => ({ ...f, identifier: e.target.value }))}
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-accent-foreground">Description</label>
                <Button variant="ghost" size="sm" className="h-7 gap-1 text-xs text-muted-foreground">
                  <Sparkles size={12} />
                  Generate
                </Button>
              </div>
              <Textarea
                value={editForm.description}
                onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))}
                rows={3}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-accent-foreground">Keywords</label>
              <Input
                value={editForm.keywords}
                onChange={(e) => setEditForm((f) => ({ ...f, keywords: e.target.value }))}
                placeholder="Comma-separated keywords"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="mcp-server-enabled"
                  checked={editForm.mcpServerEnabled}
                  onCheckedChange={(checked) =>
                    setEditForm((f) => ({ ...f, mcpServerEnabled: checked === true }))
                  }
                />
                <label htmlFor="mcp-server-enabled" className="text-sm font-medium text-foreground cursor-pointer">
                  Enable MCP server
                </label>
              </div>
              {editForm.mcpServerEnabled && (
                <div className="flex items-center gap-2 rounded-md border border-input bg-muted/50 px-3 py-2">
                  <code className="flex-1 text-xs text-foreground truncate">{currentProject.mcpServerUrl}</code>
                  <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={handleCopyUrl}>
                    <Copy size={14} />
                  </Button>
                </div>
              )}
            </div>

            <div className="space-y-2 rounded-md border border-border bg-muted/30 p-3">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Created by</span>
                <span className="text-foreground">{currentProject.createdBy}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Created on</span>
                <span className="text-foreground">{currentProject.createdOn}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Last updated</span>
                <span className="text-foreground">{currentProject.lastUpdated}</span>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveEdit}>Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;
