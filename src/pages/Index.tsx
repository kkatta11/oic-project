import { useState } from "react";
import { Search, LayoutGrid, List, Pencil, Save, MoreHorizontal } from "lucide-react";
import OracleHeader from "@/components/OracleHeader";
import SidebarNav from "@/components/SidebarNav";
import IntegrationsCard from "@/components/IntegrationsCard";
import ConnectionsCard from "@/components/ConnectionsCard";
import SimpleCard from "@/components/SimpleCard";
import { integrations, connections, sidebarItems } from "@/data/mockData";

const tabs = ["Design", "Agent", "MCP Gateway"];

const Index = () => {
  const [activeTab, setActiveTab] = useState("Design");
  const [activeSidebarItem, setActiveSidebarItem] = useState("integrations");

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <OracleHeader />

      {/* Gold decorative banner */}
      <div className="h-1.5 bg-gradient-to-r from-redwood-gold via-redwood-banner to-redwood-gold" />

      {/* Project title bar */}
      <div className="border-b border-border bg-card px-6 py-4">
        <h1 className="text-xl font-bold text-foreground">Smart Invoice Validation AgAI</h1>
      </div>

      {/* Tabs bar */}
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

      {/* Main area */}
      <div className="flex flex-1">
        {/* Sidebar */}
        <SidebarNav
          activeItem={activeSidebarItem}
          onItemClick={setActiveSidebarItem}
          items={sidebarItems}
        />

        {/* Content */}
        <main className="flex-1 p-6">
          {/* Search */}
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

          {/* Card grid */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {activeTab === "Design" && (
              <>
                <IntegrationsCard integrations={integrations} />
                <ConnectionsCard connections={connections} />
                <SimpleCard
                  title="Lookups"
                  description="Map values between applications."
                />
                <SimpleCard
                  title="Libraries"
                  description="Use JavaScript functions and libraries in your integrations."
                />
              </>
            )}
            {activeTab === "Agent" && (
              <>
                <SimpleCard
                  title="Agents"
                  description="Create and manage AI agents for automating tasks and workflows."
                />
                <SimpleCard
                  title="Tools"
                  description="Define tools that agents can use to interact with external services."
                />
                <SimpleCard
                  title="Agent Patterns"
                  description="Pre-built patterns for common agent architectures and behaviors."
                />
                <SimpleCard
                  title="Prompt Templates"
                  description="Reusable prompt templates for consistent agent interactions."
                />
              </>
            )}
            {activeTab === "MCP Gateway" && (
              <>
                <SimpleCard
                  title="MCP Gateway"
                  description="Configure and manage Model Context Protocol gateway endpoints."
                />
                <SimpleCard
                  title="MCP Servers"
                  description="Register and monitor MCP server instances and their availability."
                />
                <SimpleCard
                  title="Security Policies"
                  description="Define security rules and access controls for MCP communications."
                />
                <SimpleCard
                  title="Business Policies"
                  description="Set business rules and governance policies for agent operations."
                />
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Index;
