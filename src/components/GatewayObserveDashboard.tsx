import { useState } from "react";
import { Eye, CheckCircle2, XCircle, Clock, ArrowDown, Shield, Briefcase, Server, Send, Inbox } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";

// ── Mock Data ──────────────────────────────────────────────

const gatewayMetrics = [
  { name: "Invoice Validation Gateway", received: 1284, processed: 12, succeeded: 1248, errored: 24 },
  { name: "Procurement Gateway", received: 876, processed: 5, succeeded: 860, errored: 11 },
  { name: "HCM Data Gateway", received: 432, processed: 0, succeeded: 430, errored: 2 },
  { name: "ERP Sync Gateway", received: 2150, processed: 23, succeeded: 2098, errored: 29 },
];

interface FlowStep {
  name: string;
  type: "request" | "security" | "business" | "mcp" | "response";
  status: "passed" | "failed";
  duration: string;
}

interface GatewayInstance {
  id: string;
  timestamp: string;
  gateway: string;
  toolName: string;
  status: "Succeeded" | "Failed" | "Running";
  duration: string;
  flow: FlowStep[];
}

const gatewayInstances: GatewayInstance[] = [
  {
    id: "inst-001", timestamp: "2026-02-23 10:15:32", gateway: "Invoice Validation Gateway",
    toolName: "validate_invoice", status: "Succeeded", duration: "1.2s",
    flow: [
      { name: "Request Received", type: "request", status: "passed", duration: "2ms" },
      { name: "PII Detection", type: "security", status: "passed", duration: "85ms" },
      { name: "Schema Validation", type: "security", status: "passed", duration: "42ms" },
      { name: "Invoice Amount Check", type: "business", status: "passed", duration: "15ms" },
      { name: "Slack MCP Server", type: "mcp", status: "passed", duration: "980ms" },
      { name: "Response Sent", type: "response", status: "passed", duration: "3ms" },
    ],
  },
  {
    id: "inst-002", timestamp: "2026-02-23 10:14:18", gateway: "Procurement Gateway",
    toolName: "create_purchase_order", status: "Failed", duration: "0.6s",
    flow: [
      { name: "Request Received", type: "request", status: "passed", duration: "1ms" },
      { name: "SQL Injection Prevention", type: "security", status: "passed", duration: "30ms" },
      { name: "Budget Threshold", type: "business", status: "failed", duration: "12ms" },
      { name: "GitHub MCP Server", type: "mcp", status: "passed", duration: "0ms" },
      { name: "Response Sent", type: "response", status: "failed", duration: "2ms" },
    ],
  },
  {
    id: "inst-003", timestamp: "2026-02-23 10:13:05", gateway: "Invoice Validation Gateway",
    toolName: "get_invoice_status", status: "Succeeded", duration: "0.4s",
    flow: [
      { name: "Request Received", type: "request", status: "passed", duration: "1ms" },
      { name: "PII Detection", type: "security", status: "passed", duration: "78ms" },
      { name: "Invoice Amount Check", type: "business", status: "passed", duration: "10ms" },
      { name: "Slack MCP Server", type: "mcp", status: "passed", duration: "290ms" },
      { name: "Response Sent", type: "response", status: "passed", duration: "2ms" },
    ],
  },
  {
    id: "inst-004", timestamp: "2026-02-23 10:12:47", gateway: "HCM Data Gateway",
    toolName: "sync_employee_data", status: "Running", duration: "2.1s",
    flow: [
      { name: "Request Received", type: "request", status: "passed", duration: "2ms" },
      { name: "Rate Limiting", type: "security", status: "passed", duration: "5ms" },
      { name: "Data Residency Check", type: "business", status: "passed", duration: "18ms" },
      { name: "Gmail MCP Server", type: "mcp", status: "passed", duration: "2050ms" },
      { name: "Response Sent", type: "response", status: "passed", duration: "—" },
    ],
  },
  {
    id: "inst-005", timestamp: "2026-02-23 10:11:30", gateway: "ERP Sync Gateway",
    toolName: "journal_entry", status: "Succeeded", duration: "0.9s",
    flow: [
      { name: "Request Received", type: "request", status: "passed", duration: "1ms" },
      { name: "Schema Validation", type: "security", status: "passed", duration: "55ms" },
      { name: "Approval Workflow", type: "business", status: "passed", duration: "22ms" },
      { name: "Notion MCP Server", type: "mcp", status: "passed", duration: "800ms" },
      { name: "Response Sent", type: "response", status: "passed", duration: "2ms" },
    ],
  },
];

const auditLog = [
  { timestamp: "2026-02-23 09:45:10", action: "Created", artifactType: "Gateway", name: "Invoice Validation Gateway", user: "admin@oracle.com" },
  { timestamp: "2026-02-23 09:30:22", action: "Updated", artifactType: "Security Policy", name: "PII Detection", user: "admin@oracle.com" },
  { timestamp: "2026-02-22 16:12:05", action: "Created", artifactType: "MCP Server", name: "Slack Community Server", user: "dev@oracle.com" },
  { timestamp: "2026-02-22 14:55:33", action: "Deleted", artifactType: "Business Policy", name: "Legacy Threshold Rule", user: "admin@oracle.com" },
  { timestamp: "2026-02-22 11:20:18", action: "Updated", artifactType: "Gateway", name: "Procurement Gateway", user: "dev@oracle.com" },
  { timestamp: "2026-02-21 17:08:44", action: "Created", artifactType: "Business Policy", name: "Invoice Amount Check", user: "admin@oracle.com" },
];

// ── Helpers ────────────────────────────────────────────────

const statusBadge = (status: string) => {
  if (status === "Succeeded" || status === "passed")
    return <Badge className="bg-[hsl(var(--redwood-green))] text-white border-transparent">{status === "passed" ? "Passed" : status}</Badge>;
  if (status === "Failed" || status === "failed")
    return <Badge variant="destructive">{status === "failed" ? "Failed" : status}</Badge>;
  return <Badge className="bg-[hsl(var(--redwood-gold))] text-[hsl(var(--accent-foreground))] border-transparent">Running</Badge>;
};

const actionBadge = (action: string) => {
  if (action === "Created") return <Badge className="bg-[hsl(var(--redwood-green))] text-white border-transparent">Created</Badge>;
  if (action === "Updated") return <Badge className="bg-[hsl(var(--redwood-gold))] text-[hsl(var(--accent-foreground))] border-transparent">Updated</Badge>;
  return <Badge variant="destructive">Deleted</Badge>;
};

const stepIcon = (type: FlowStep["type"]) => {
  switch (type) {
    case "request": return <Inbox size={16} />;
    case "security": return <Shield size={16} />;
    case "business": return <Briefcase size={16} />;
    case "mcp": return <Server size={16} />;
    case "response": return <Send size={16} />;
  }
};

// ── Component ──────────────────────────────────────────────

const GatewayObserveDashboard = () => {
  const [selectedInstance, setSelectedInstance] = useState<GatewayInstance | null>(null);

  return (
    <div className="space-y-6">
      {/* Gateways Metrics */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Gateways</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Gateway Name</TableHead>
                <TableHead className="text-center">Received</TableHead>
                <TableHead className="text-center">Processed</TableHead>
                <TableHead className="text-center">Succeeded</TableHead>
                <TableHead className="text-center">Errored</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {gatewayMetrics.map((g) => (
                <TableRow key={g.name}>
                  <TableCell className="font-medium">{g.name}</TableCell>
                  <TableCell className="text-center font-semibold text-foreground">{g.received.toLocaleString()}</TableCell>
                  <TableCell className="text-center font-semibold text-[hsl(var(--redwood-gold))]">{g.processed}</TableCell>
                  <TableCell className="text-center font-semibold text-[hsl(var(--redwood-green))]">{g.succeeded.toLocaleString()}</TableCell>
                  <TableCell className="text-center font-semibold text-destructive">{g.errored}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Gateway Instances */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Gateway Instances</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>Gateway</TableHead>
                <TableHead>Tool Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead className="w-12">View</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {gatewayInstances.map((inst) => (
                <TableRow key={inst.id}>
                  <TableCell className="text-muted-foreground text-xs font-mono">{inst.timestamp}</TableCell>
                  <TableCell className="font-medium">{inst.gateway}</TableCell>
                  <TableCell className="font-mono text-xs">{inst.toolName}</TableCell>
                  <TableCell>{statusBadge(inst.status)}</TableCell>
                  <TableCell>{inst.duration}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setSelectedInstance(inst)}>
                      <Eye size={16} />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Audit Log */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Audit Log</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Artifact Type</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>User</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {auditLog.map((entry, i) => (
                <TableRow key={i}>
                  <TableCell className="text-muted-foreground text-xs font-mono">{entry.timestamp}</TableCell>
                  <TableCell>{actionBadge(entry.action)}</TableCell>
                  <TableCell>{entry.artifactType}</TableCell>
                  <TableCell className="font-medium">{entry.name}</TableCell>
                  <TableCell className="text-muted-foreground text-xs">{entry.user}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Instance Detail Dialog */}
      <Dialog open={!!selectedInstance} onOpenChange={(open) => !open && setSelectedInstance(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-base">Instance Flow — {selectedInstance?.toolName}</DialogTitle>
            <DialogDescription>
              {selectedInstance?.gateway} · {selectedInstance?.timestamp}
            </DialogDescription>
          </DialogHeader>

          {selectedInstance && (
            <div className="space-y-0">
              {selectedInstance.flow.map((step, idx) => (
                <div key={idx} className="relative flex items-start gap-3 pb-4 last:pb-0">
                  {/* Connecting line */}
                  {idx < selectedInstance.flow.length - 1 && (
                    <div className="absolute left-[15px] top-8 h-[calc(100%-16px)] w-px bg-border" />
                  )}

                  {/* Icon circle */}
                  <div className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border ${
                    step.status === "passed"
                      ? "border-[hsl(var(--redwood-green))] bg-[hsl(var(--redwood-green-light))] text-[hsl(var(--redwood-green))]"
                      : "border-destructive bg-destructive/10 text-destructive"
                  }`}>
                    {stepIcon(step.type)}
                  </div>

                  {/* Details */}
                  <div className="flex flex-1 items-center justify-between pt-1">
                    <div>
                      <p className="text-sm font-medium">{step.name}</p>
                      <p className="text-xs text-muted-foreground capitalize">{step.type}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-muted-foreground">{step.duration}</span>
                      {step.status === "passed"
                        ? <CheckCircle2 size={14} className="text-[hsl(var(--redwood-green))]" />
                        : <XCircle size={14} className="text-destructive" />}
                    </div>
                  </div>
                </div>
              ))}

              {/* Total duration */}
              <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
                <span className="text-sm font-medium">Total Duration</span>
                <span className="text-sm font-semibold font-mono">{selectedInstance.duration}</span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default GatewayObserveDashboard;
