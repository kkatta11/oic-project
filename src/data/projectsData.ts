import type { Integration, Connection } from "./mockData";
import { integrations as defaultIntegrations, connections as defaultConnections, sidebarItems as defaultSidebarItems } from "./mockData";
import type { MCPServer } from "@/components/MCPServersCard";
import { defaultServers as defaultMCPServers } from "@/components/MCPServersCard";
import { nativeTools, travelTools, type NativeTool } from "@/components/ToolsCard";
import { Ship, Globe } from "lucide-react";

export interface Project {
  id: string;
  name: string;
  type: string;
  lastUpdated: string;
  subtitle?: string;
}

export const projects: Project[] = [
  {
    id: "smart-invoice",
    name: "Smart Invoice Validation AgAI",
    type: "Developed",
    lastUpdated: "Mar 3, 2026 03:10:40 PM IST",
    
  },
  {
    id: "travel-supply-chain",
    name: "Travel Industry Supply Chain",
    type: "Developed",
    lastUpdated: "Mar 7, 2026 08:41:17 AM IST",
  },
];

// --- Project 2: Travel Industry Supply Chain data ---

const travelIntegrations: Integration[] = [
  { id: "t1", name: "Shipment Tracking Flow", version: "01.00.0000", status: "Active", type: "app", description: "Real-time shipment tracking and updates" },
  { id: "t2", name: "Customs Declaration Sync", version: "01.01.0000", status: "Active", type: "schedule" },
  { id: "t3", name: "Supplier Onboarding API", version: "02.00.0000", status: "Configured", type: "api" },
  { id: "t4", name: "Route Optimization Engine", version: "01.00.0000", status: "Active", type: "app", description: "Optimizes delivery routes using AI" },
  { id: "t5", name: "Inventory Replenishment", version: "01.02.0000", status: "Active", type: "schedule" },
];

const travelConnections: Connection[] = [
  { id: "tc1", name: "Oracle SCM Cloud", type: "Oracle ERP Cloud", role: "Trigger and Invoke", status: "Active" },
  { id: "tc2", name: "Logistics REST API", type: "REST", role: "Invoke", status: "Active" },
  { id: "tc3", name: "Customs SOAP Service", type: "SOAP", role: "Trigger", status: "Configured" },
  { id: "tc4", name: "Warehouse FTP", type: "FTP", role: "Invoke", status: "Active" },
];

const travelMCPServers: MCPServer[] = [
  {
    id: "scm-1",
    name: "Oracle SCM Cloud",
    status: "Active",
    icon: Ship,
    tools: [
      { id: "scm-t1", name: "Track Shipment", description: "Track shipment status and location in real-time" },
      { id: "scm-t2", name: "Inventory Check", description: "Check inventory levels across warehouses" },
      { id: "scm-t3", name: "Supplier Lookup", description: "Look up supplier details and performance metrics" },
    ],
    allTools: [
      { id: "scm-t1", name: "Track Shipment", description: "Track shipment status and location in real-time" },
      { id: "scm-t2", name: "Inventory Check", description: "Check inventory levels across warehouses" },
      { id: "scm-t3", name: "Supplier Lookup", description: "Look up supplier details and performance metrics" },
      { id: "scm-t4", name: "Create PO", description: "Create a purchase order" },
    ],
    url: "https://scm-mcp.oracle.com/sse",
    transport: "SSE",
    auth: "oauth2",
  },
  {
    id: "log-1",
    name: "Logistics API",
    status: "Active",
    icon: Globe,
    tools: [
      { id: "log-t1", name: "Route Optimizer", description: "Calculate optimal delivery routes" },
      { id: "log-t2", name: "Validate Customs Declaration", description: "Validate customs paperwork for compliance" },
    ],
    allTools: [
      { id: "log-t1", name: "Route Optimizer", description: "Calculate optimal delivery routes" },
      { id: "log-t2", name: "Validate Customs Declaration", description: "Validate customs paperwork for compliance" },
      { id: "log-t3", name: "Estimate Delivery", description: "Estimate delivery time and cost" },
    ],
    url: "https://logistics-mcp.example.com/sse",
    transport: "SSE",
    auth: "api_key",
  },
];

export function getProjectData(projectId: string) {
  if (projectId === "travel-supply-chain") {
    return {
      name: "Travel Industry Supply Chain",
      integrations: travelIntegrations,
      connections: travelConnections,
      mcpServers: travelMCPServers,
      sidebarItems: defaultSidebarItems,
    };
  }
  // Default: smart-invoice
  return {
    name: "Smart Invoice Validation AgAI",
    integrations: defaultIntegrations,
    connections: defaultConnections,
    mcpServers: defaultMCPServers,
    sidebarItems: defaultSidebarItems,
  };
}
