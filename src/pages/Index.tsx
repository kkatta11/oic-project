import { useState } from "react";
import { Search, LayoutGrid, List, Pencil, Save, MoreHorizontal } from "lucide-react";
import OracleHeader from "@/components/OracleHeader";
import SidebarNav from "@/components/SidebarNav";
import IntegrationsCard from "@/components/IntegrationsCard";
import ConnectionsCard from "@/components/ConnectionsCard";
import SimpleCard from "@/components/SimpleCard";
import ToolsCard from "@/components/ToolsCard";
import MCPServersCard, { type MCPServer, defaultServers as defaultMCPServers } from "@/components/MCPServersCard";
import SecurityPoliciesCard, { type SecurityPolicy, loadSecurityPolicies, saveSecurityPolicies } from "@/components/SecurityPoliciesCard";
import BusinessPoliciesCard, { type BusinessPolicy, loadBusinessPolicies, saveBusinessPolicies } from "@/components/BusinessPoliciesCard";
import MCPGatewayCard from "@/components/MCPGatewayCard";
import GatewayObserveDashboard from "@/components/GatewayObserveDashboard";
import { integrations, connections, sidebarItems } from "@/data/mockData";


const tabs = ["Design", "Deploy", "Observe"];


const Index = () => {
  const [activeTab, setActiveTab] = useState("Design");
  const [activeSidebarItem, setActiveSidebarItem] = useState("integrations");
  const [mcpServers, setMcpServers] = useState<MCPServer[]>(defaultMCPServers);
  const [securityPolicies, setSecurityPolicies] = useState<SecurityPolicy[]>(loadSecurityPolicies);
  const [businessPolicies, setBusinessPolicies] = useState<BusinessPolicy[]>(loadBusinessPolicies);

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
          <ToolsCard />
          <SimpleCard title="Agent Patterns" description="Configure reusable patterns for agent behavior." />
          <SimpleCard title="Prompt Templates" description="Design and manage prompt templates for agent interactions." />
        </>
      );
    }
    if (activeSidebarItem === "gateway") {
      return (
        <>
          <MCPGatewayCard activeMCPServers={mcpServers} mcpServers={mcpServers} securityPolicies={securityPolicies} businessPolicies={businessPolicies} />
          <MCPServersCard servers={mcpServers} onServersChange={setMcpServers} securityPolicies={securityPolicies} onPoliciesChange={setSecurityPolicies} />
          <SecurityPoliciesCard policies={securityPolicies} onPoliciesChange={setSecurityPolicies} />
          <BusinessPoliciesCard policies={businessPolicies} onPoliciesChange={setBusinessPolicies} mcpServers={mcpServers} />
        </>
      );
    }
    return (
      <>
        <IntegrationsCard integrations={integrations} />
        <ConnectionsCard connections={connections} />
        <SimpleCard title="Lookups" description="Map values between applications." />
        <SimpleCard title="Libraries" description="Use JavaScript functions and libraries in your integrations." />
      </>
    );
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <OracleHeader />
      <div className="h-1.5 bg-gradient-to-r from-redwood-gold via-redwood-banner to-redwood-gold" />

      <div className="border-b border-border bg-card px-6 py-4">
        <h1 className="text-xl font-bold text-foreground">Smart Invoice Validation AgAI</h1>
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
          <button className="rounded p-2 text-muted-foreground hover:bg-muted hover:text-foreground">
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

      <div className="flex flex-1">
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
    </div>
  );
};

export default Index;
