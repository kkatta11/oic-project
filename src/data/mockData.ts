export interface Integration {
  id: string;
  name: string;
  description?: string;
  version: string;
  status: "Active" | "Configured" | "Draft";
  type: "app" | "schedule" | "api";
}

export interface Connection {
  id: string;
  name: string;
  type: string;
  role: "Trigger" | "Invoke" | "Trigger and Invoke";
  status: "Active" | "Configured";
}

export const integrations: Integration[] = [
  { id: "1", name: "Smart Invoice Validation Flow", version: "01.00.0000", status: "Active", type: "app", description: "Validates invoices using AI before processing" },
  { id: "2", name: "ERP Cloud Sync Integration", version: "01.02.0000", status: "Active", type: "schedule" },
  { id: "3", name: "HCM Data Loader", version: "02.00.0000", status: "Active", type: "app" },
  { id: "4", name: "Procurement Approval Workflow", version: "01.01.0000", status: "Configured", type: "app", description: "Routes procurement requests for approval" },
  { id: "5", name: "ATP Order Fulfillment", version: "01.00.0000", status: "Active", type: "api" },
  { id: "6", name: "Supplier Portal Integration", version: "03.00.0000", status: "Active", type: "app" },
  { id: "7", name: "GL Journal Entry Automation", version: "01.00.0000", status: "Configured", type: "schedule" },
  { id: "8", name: "Customer Data Migration", version: "01.05.0000", status: "Draft", type: "app" },
  { id: "9", name: "Inventory Sync Process", version: "02.01.0000", status: "Active", type: "schedule" },
  { id: "10", name: "Payment Processing Flow", version: "01.00.0000", status: "Active", type: "api" },
  { id: "11", name: "AR Invoice Generation", version: "01.03.0000", status: "Active", type: "app" },
  { id: "12", name: "Benefits Enrollment Sync", version: "01.00.0000", status: "Configured", type: "app" },
  { id: "13", name: "Expense Report Automation", version: "02.00.0000", status: "Active", type: "schedule" },
  { id: "14", name: "Asset Tracking Integration", version: "01.00.0000", status: "Draft", type: "app" },
];

export const connections: Connection[] = [
  { id: "1", name: "Oracle ERP Cloud", type: "Oracle ERP Cloud", role: "Trigger and Invoke", status: "Active" },
  { id: "2", name: "Oracle HCM Cloud", type: "Oracle HCM Cloud", role: "Invoke", status: "Active" },
  { id: "3", name: "REST API Trigger", type: "REST", role: "Trigger", status: "Active" },
  { id: "4", name: "Oracle ATP Database", type: "Oracle ATP", role: "Invoke", status: "Configured" },
  { id: "5", name: "FTP Secure Connection", type: "FTP", role: "Invoke", status: "Active" },
  { id: "6", name: "SOAP Web Service", type: "SOAP", role: "Trigger and Invoke", status: "Active" },
  { id: "7", name: "Oracle Commerce Cloud", type: "Oracle CX", role: "Invoke", status: "Configured" },
  { id: "8", name: "Email Notification", type: "Email", role: "Invoke", status: "Active" },
  { id: "9", name: "Oracle Object Storage", type: "Object Storage", role: "Invoke", status: "Active" },
];

export const sidebarItems = [
  { id: "integrations", label: "Integrations", icon: "GitBranch" as const },
  { id: "agent", label: "Agent", icon: "Bot" as const },
  { id: "gateway", label: "Gateway", icon: "ShieldCheck" as const },
  { id: "rpa", label: "RPA", icon: "Cog" as const },
  { id: "hitl", label: "HITL", icon: "Users" as const },
  { id: "decision", label: "Decision", icon: "Scale" as const },
  { id: "healthcare", label: "Healthcare", icon: "Heart" as const },
  { id: "b2b", label: "B2B", icon: "Building2" as const },
  { id: "knowledge", label: "Knowledge Base", icon: "BookOpen" as const },
];
