import { useState } from "react";
import { Eye, CheckCircle2, XCircle, Shield, Briefcase, Server, Send, Inbox, Activity, Wifi, WifiOff, BarChart3, Clock, AlertTriangle, ChevronDown } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  ChartContainer, ChartTooltip, ChartTooltipContent,
} from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, AreaChart, Area } from "recharts";

// ── Mock Data ──────────────────────────────────────────────

const gatewayMetrics = [
  { name: "Invoice Validation Gateway", received: 1284, processed: 12, succeeded: 1248, errored: 24 },
  { name: "Procurement Gateway", received: 876, processed: 5, succeeded: 860, errored: 11 },
  { name: "HCM Data Gateway", received: 432, processed: 0, succeeded: 430, errored: 2 },
  { name: "ERP Sync Gateway", received: 2150, processed: 23, succeeded: 2098, errored: 29 },
];

// Time-series mock data for gateway detail metrics
const generateTimeSeriesData = (gatewayName: string) => {
  const hours = ["06:00", "07:00", "08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"];
  const seed = gatewayName.length;
  return hours.map((hour, i) => ({
    time: hour,
    uptime: Math.min(100, 97 + (Math.sin(i + seed) + 1) * 1.5),
    responseTime: Math.max(40, 80 + Math.sin(i * 0.8 + seed) * 60 + (i > 8 ? 30 : 0)),
    requestsPerMin: Math.max(5, Math.round(25 + Math.sin(i * 0.5 + seed) * 15 + (i > 4 && i < 10 ? 20 : 0))),
    errorRate: Math.max(0, +(1.5 + Math.sin(i * 1.2 + seed) * 1.5).toFixed(2)),
  }));
};

const metricsChartConfig = {
  uptime: { label: "Uptime %", color: "hsl(var(--redwood-green))" },
  responseTime: { label: "Response Time (ms)", color: "hsl(var(--redwood-gold))" },
  requestsPerMin: { label: "Requests / min", color: "hsl(var(--primary))" },
  errorRate: { label: "Error Rate %", color: "hsl(var(--destructive))" },
};

const gatewayHealth = [
  { name: "Invoice Validation Gateway", status: "Healthy", uptime: "99.97%", lastCheck: "2026-02-23 10:16:00", latencyP50: "120ms", latencyP99: "890ms", activeConnections: 14 },
  { name: "Procurement Gateway", status: "Healthy", uptime: "99.91%", lastCheck: "2026-02-23 10:16:00", latencyP50: "95ms", latencyP99: "620ms", activeConnections: 8 },
  { name: "HCM Data Gateway", status: "Degraded", uptime: "98.40%", lastCheck: "2026-02-23 10:15:45", latencyP50: "340ms", latencyP99: "2100ms", activeConnections: 3 },
  { name: "ERP Sync Gateway", status: "Healthy", uptime: "99.99%", lastCheck: "2026-02-23 10:16:01", latencyP50: "80ms", latencyP99: "450ms", activeConnections: 22 },
];

// ── Timeline Data ──────────────────────────────────────────

interface TimelineSegment {
  startTime: string;
  endTime: string;
  status: "healthy" | "degraded" | "down";
  description?: string;
  requestsAffected?: number;
}

interface GatewayTimeline {
  name: string;
  uptimePercent: number;
  latencyP50: string;
  latencyP99: string;
  activeConnections: number;
  segments: Record<string, TimelineSegment[]>; // keyed by timeRange
}

const generateTimelineSegments = (gatewayName: string, range: "24h" | "7d" | "30d"): TimelineSegment[] => {
  const seed = gatewayName.length;
  const segmentCount = range === "24h" ? 24 : range === "7d" ? 7 : 30;
  const now = new Date("2026-02-23T10:00:00");
  const segments: TimelineSegment[] = [];

  for (let i = segmentCount - 1; i >= 0; i--) {
    const start = new Date(now);
    const end = new Date(now);
    if (range === "24h") {
      start.setHours(now.getHours() - i - 1);
      end.setHours(now.getHours() - i);
    } else {
      start.setDate(now.getDate() - i - 1);
      end.setDate(now.getDate() - i);
    }

    const val = Math.sin(i * 1.3 + seed) + Math.cos(i * 0.7 + seed * 0.5);
    let status: TimelineSegment["status"] = "healthy";
    let description: string | undefined;
    let requestsAffected: number | undefined;

    if (val > 1.3) {
      status = "down";
      description = ["MCP Server timeout", "Connection pool exhausted", "Certificate expired", "DNS resolution failure"][i % 4];
      requestsAffected = Math.round(Math.abs(val) * 120);
    } else if (val > 0.8) {
      status = "degraded";
      description = ["High latency detected", "Partial MCP Server failures", "Memory pressure", "Rate limit approaching"][i % 4];
      requestsAffected = Math.round(Math.abs(val) * 45);
    }

    const fmt = (d: Date) => range === "24h"
      ? d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false })
      : d.toLocaleDateString("en-US", { month: "short", day: "numeric" });

    segments.push({ startTime: fmt(start), endTime: fmt(end), status, description, requestsAffected });
  }
  return segments;
};

const gatewayTimelines: GatewayTimeline[] = gatewayHealth.map((g) => ({
  name: g.name,
  uptimePercent: parseFloat(g.uptime),
  latencyP50: g.latencyP50,
  latencyP99: g.latencyP99,
  activeConnections: g.activeConnections,
  segments: {
    "24h": generateTimelineSegments(g.name, "24h"),
    "7d": generateTimelineSegments(g.name, "7d"),
    "30d": generateTimelineSegments(g.name, "30d"),
  },
}));

const mcpServerHealth = [
  { name: "Slack MCP Server", status: "Online", uptime: "99.99%", lastPing: "2026-02-23 10:16:02", responseTime: "45ms", requestsServed: 3420 },
  { name: "GitHub MCP Server", status: "Online", uptime: "99.95%", lastPing: "2026-02-23 10:16:01", responseTime: "82ms", requestsServed: 1870 },
  { name: "Gmail MCP Server", status: "Offline", uptime: "94.20%", lastPing: "2026-02-23 09:42:18", responseTime: "—", requestsServed: 980 },
  { name: "Notion MCP Server", status: "Online", uptime: "99.88%", lastPing: "2026-02-23 10:16:00", responseTime: "110ms", requestsServed: 2150 },
  { name: "Jira MCP Server", status: "Degraded", uptime: "97.60%", lastPing: "2026-02-23 10:15:50", responseTime: "520ms", requestsServed: 640 },
];

interface FlowStep {
  name: string;
  type: "request" | "security" | "business" | "mcp" | "response";
  status: "passed" | "failed";
  duration: string;
  payload?: { request?: Record<string, any>; response?: Record<string, any> };
  policyDetail?: {
    conditionEvaluated: string;
    conditionResult: boolean;
    action: string;
    matchedPattern?: string;
    confidence?: number;
  };
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
      { name: "Request Received", type: "request", status: "passed", duration: "2ms",
        payload: { request: { method: "POST", path: "/api/v1/validate", headers: { "Content-Type": "application/json", "Authorization": "Bearer ey...truncated" }, body: { invoice_id: "INV-2026-0042", vendor: "Acme Corp", amount: 4500.00, currency: "USD", vendor_tax_id: "12-3456789" } } } },
      { name: "PII Detection", type: "security", status: "passed", duration: "85ms",
        policyDetail: { conditionEvaluated: "Scan all string fields for PII patterns (SSN, credit card, email)", conditionResult: true, action: "Redact & Allow", matchedPattern: "Tax ID pattern detected in field 'vendor_tax_id' — classified as EIN (not SSN)", confidence: 96 } },
      { name: "Schema Validation", type: "security", status: "passed", duration: "42ms",
        policyDetail: { conditionEvaluated: "Validate request body against invoice_v1 JSON schema", conditionResult: true, action: "Passed" } },
      { name: "Invoice Amount Check", type: "business", status: "passed", duration: "15ms",
        policyDetail: { conditionEvaluated: "invoice_amount <= 10000 (auto-approve threshold)", conditionResult: true, action: "Auto-Approved — below threshold" } },
      { name: "Slack MCP Server", type: "mcp", status: "passed", duration: "980ms",
        payload: { request: { tool: "validate_invoice", arguments: { invoice_id: "INV-2026-0042", vendor: "Acme Corp", amount: 4500.00 } }, response: { status: "valid", validation_score: 0.97, flags: [], message: "Invoice validated successfully" } } },
      { name: "Response Sent", type: "response", status: "passed", duration: "3ms",
        payload: { response: { status: 200, body: { result: "validated", invoice_id: "INV-2026-0042", validation_score: 0.97 } } } },
    ],
  },
  {
    id: "inst-002", timestamp: "2026-02-23 10:14:18", gateway: "Procurement Gateway",
    toolName: "create_purchase_order", status: "Failed", duration: "0.6s",
    flow: [
      { name: "Request Received", type: "request", status: "passed", duration: "1ms",
        payload: { request: { method: "POST", path: "/api/v1/purchase-order", body: { po_number: "PO-88210", department: "Engineering", items: [{ sku: "HW-4090", qty: 25, unit_price: 1899.99 }], total: 47499.75 } } } },
      { name: "SQL Injection Prevention", type: "security", status: "passed", duration: "30ms",
        policyDetail: { conditionEvaluated: "Scan input fields for SQL injection patterns (UNION, DROP, --, etc.)", conditionResult: true, action: "Passed — no threats detected" } },
      { name: "Budget Threshold", type: "business", status: "failed", duration: "12ms",
        policyDetail: { conditionEvaluated: "department_budget_remaining >= po_total ($47,499.75)", conditionResult: false, action: "Block Request — 403 Forbidden", matchedPattern: "Engineering department remaining budget: $12,340.00 < $47,499.75" } },
      { name: "GitHub MCP Server", type: "mcp", status: "passed", duration: "0ms",
        payload: { request: null, response: null } },
      { name: "Response Sent", type: "response", status: "failed", duration: "2ms",
        payload: { response: { status: 403, body: { error: "BUDGET_EXCEEDED", message: "Purchase order total exceeds department budget", remaining_budget: 12340.00, requested: 47499.75 } } } },
    ],
  },
  {
    id: "inst-003", timestamp: "2026-02-23 10:13:05", gateway: "Invoice Validation Gateway",
    toolName: "get_invoice_status", status: "Succeeded", duration: "0.4s",
    flow: [
      { name: "Request Received", type: "request", status: "passed", duration: "1ms",
        payload: { request: { method: "GET", path: "/api/v1/invoice/INV-2026-0039/status", headers: { "Authorization": "Bearer ey...truncated" } } } },
      { name: "PII Detection", type: "security", status: "passed", duration: "78ms",
        policyDetail: { conditionEvaluated: "Scan response payload for PII before returning to caller", conditionResult: true, action: "Passed — no PII in response", confidence: 99 } },
      { name: "Invoice Amount Check", type: "business", status: "passed", duration: "10ms",
        policyDetail: { conditionEvaluated: "Read-only request — no amount threshold applicable", conditionResult: true, action: "Passed" } },
      { name: "Slack MCP Server", type: "mcp", status: "passed", duration: "290ms",
        payload: { request: { tool: "get_invoice_status", arguments: { invoice_id: "INV-2026-0039" } }, response: { invoice_id: "INV-2026-0039", status: "approved", approved_by: "finance@acme.com", approved_at: "2026-02-22T14:30:00Z" } } },
      { name: "Response Sent", type: "response", status: "passed", duration: "2ms",
        payload: { response: { status: 200, body: { invoice_id: "INV-2026-0039", status: "approved" } } } },
    ],
  },
  {
    id: "inst-004", timestamp: "2026-02-23 10:12:47", gateway: "HCM Data Gateway",
    toolName: "sync_employee_data", status: "Running", duration: "2.1s",
    flow: [
      { name: "Request Received", type: "request", status: "passed", duration: "2ms",
        payload: { request: { method: "POST", path: "/api/v1/hcm/sync", body: { batch_id: "BATCH-4401", employee_count: 150, sync_type: "incremental" } } } },
      { name: "Rate Limiting", type: "security", status: "passed", duration: "5ms",
        policyDetail: { conditionEvaluated: "Requests from client IP 10.0.4.22 < 100/min (current: 34/min)", conditionResult: true, action: "Passed — within rate limit" } },
      { name: "Data Residency Check", type: "business", status: "passed", duration: "18ms",
        policyDetail: { conditionEvaluated: "Target data region == source data region (both: us-east-1)", conditionResult: true, action: "Passed — same region" } },
      { name: "Gmail MCP Server", type: "mcp", status: "passed", duration: "2050ms",
        payload: { request: { tool: "sync_employee_data", arguments: { batch_id: "BATCH-4401", employee_count: 150 } }, response: { status: "in_progress", synced: 87, remaining: 63 } } },
      { name: "Response Sent", type: "response", status: "passed", duration: "—" },
    ],
  },
  {
    id: "inst-005", timestamp: "2026-02-23 10:11:30", gateway: "ERP Sync Gateway",
    toolName: "journal_entry", status: "Succeeded", duration: "0.9s",
    flow: [
      { name: "Request Received", type: "request", status: "passed", duration: "1ms",
        payload: { request: { method: "POST", path: "/api/v1/erp/journal", body: { journal_id: "JE-20260223-017", entries: [{ account: "6100", debit: 15000 }, { account: "2100", credit: 15000 }], period: "FEB-2026" } } } },
      { name: "Schema Validation", type: "security", status: "passed", duration: "55ms",
        policyDetail: { conditionEvaluated: "Validate journal entry against GL schema — balanced debits/credits", conditionResult: true, action: "Passed — debits equal credits ($15,000)" } },
      { name: "Approval Workflow", type: "business", status: "passed", duration: "22ms",
        policyDetail: { conditionEvaluated: "journal_total <= manager_approval_limit ($25,000)", conditionResult: true, action: "Auto-Approved — within manager limit" } },
      { name: "Notion MCP Server", type: "mcp", status: "passed", duration: "800ms",
        payload: { request: { tool: "create_journal_entry", arguments: { journal_id: "JE-20260223-017", total: 15000 } }, response: { status: "posted", journal_id: "JE-20260223-017", posted_at: "2026-02-23T10:11:29Z" } } },
      { name: "Response Sent", type: "response", status: "passed", duration: "2ms",
        payload: { response: { status: 200, body: { result: "posted", journal_id: "JE-20260223-017" } } } },
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

const healthBadge = (status: string) => {
  if (status === "Healthy" || status === "Online")
    return <Badge className="bg-[hsl(var(--redwood-green))] text-white border-transparent">{status}</Badge>;
  if (status === "Degraded")
    return <Badge className="bg-[hsl(var(--redwood-gold))] text-[hsl(var(--accent-foreground))] border-transparent">{status}</Badge>;
  return <Badge variant="destructive">{status}</Badge>;
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
  const [selectedMetricsGateway, setSelectedMetricsGateway] = useState<string | null>(null);
  const [healthTimeRange, setHealthTimeRange] = useState<"current" | "24h" | "7d" | "30d">("current");
  const [selectedIncident, setSelectedIncident] = useState<{ gateway: string; segment: TimelineSegment } | null>(null);
  const [expandedStep, setExpandedStep] = useState<number | null>(null);
  const [payloadTab, setPayloadTab] = useState<"request" | "response">("request");

  return (
    <div className="space-y-4">
      <Tabs defaultValue="gateways" className="w-full">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="gateways">Gateways</TabsTrigger>
          <TabsTrigger value="instances">Instances</TabsTrigger>
          <TabsTrigger value="gateway-health">Gateway Health</TabsTrigger>
          <TabsTrigger value="mcp-health">MCP Servers Health</TabsTrigger>
          <TabsTrigger value="audit">Audit Log</TabsTrigger>
        </TabsList>

        {/* Gateways Metrics */}
        <TabsContent value="gateways">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Gateways Metrics</CardTitle>
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
                    <TableHead className="w-12">Metrics</TableHead>
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
                      <TableCell>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setSelectedMetricsGateway(g.name)}>
                          <BarChart3 size={16} />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Instances */}
        <TabsContent value="instances">
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
                    <TableHead>MCP Server</TableHead>
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
                      <TableCell className="text-sm">{inst.flow.find(s => s.type === "mcp")?.name ?? "—"}</TableCell>
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
        </TabsContent>

        {/* Gateway Health — Timeline View */}
        <TabsContent value="gateway-health">
          <Card>
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-base font-semibold">Gateway Uptime Timeline</CardTitle>
              <div className="flex gap-1">
                {(["current", "24h", "7d", "30d"] as const).map((range) => (
                  <Button
                    key={range}
                    variant={healthTimeRange === range ? "default" : "outline"}
                    size="sm"
                    className="h-7 text-xs px-3"
                    onClick={() => setHealthTimeRange(range)}
                  >
                    {range === "current" ? "Current Status" : range === "24h" ? "Last 24h" : range === "7d" ? "7 Days" : "30 Days"}
                  </Button>
                ))}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {healthTimeRange === "current" ? (
                <div className="rounded-md border border-border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Gateway</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>P50 Latency</TableHead>
                        <TableHead>P99 Latency</TableHead>
                        <TableHead>Connections</TableHead>
                        <TableHead className="text-right">Last Check</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {gatewayHealth.map((gw) => (
                        <TableRow key={gw.name}>
                          <TableCell className="font-medium">{gw.name}</TableCell>
                          <TableCell>{healthBadge(gw.status)}</TableCell>
                          <TableCell className="font-mono">{gw.latencyP50}</TableCell>
                          <TableCell className="font-mono">{gw.latencyP99}</TableCell>
                          <TableCell className="font-mono">{gw.activeConnections}</TableCell>
                          <TableCell className="text-right font-mono text-muted-foreground">{gw.lastCheck}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <>
                  <TooltipProvider delayDuration={100}>
                    {gatewayTimelines.map((gw) => {
                      const segments = gw.segments[healthTimeRange as "24h" | "7d" | "30d"];
                      const healthyCount = segments.filter(s => s.status === "healthy").length;
                      const computedUptime = ((healthyCount / segments.length) * 100).toFixed(1);

                      return (
                        <div key={gw.name} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <span className="text-sm font-medium">{gw.name}</span>
                              <span className={`text-sm font-bold font-mono ${
                                parseFloat(computedUptime) >= 99.5 ? "text-[hsl(var(--redwood-green))]" :
                                parseFloat(computedUptime) >= 95 ? "text-[hsl(var(--redwood-gold))]" :
                                "text-destructive"
                              }`}>
                                {computedUptime}%
                              </span>
                            </div>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span>P50: <span className="font-mono font-medium text-foreground">{gw.latencyP50}</span></span>
                              <span>P99: <span className="font-mono font-medium text-foreground">{gw.latencyP99}</span></span>
                              <span>Conn: <span className="font-mono font-medium text-foreground">{gw.activeConnections}</span></span>
                            </div>
                          </div>

                          <div className="flex gap-[1px] h-8 rounded-md overflow-hidden">
                            {segments.map((seg, idx) => (
                              <Tooltip key={idx}>
                                <TooltipTrigger asChild>
                                  <button
                                    className={`flex-1 transition-all hover:opacity-80 ${
                                      seg.status === "healthy" ? "bg-[hsl(var(--redwood-green))]" :
                                      seg.status === "degraded" ? "bg-[hsl(var(--redwood-gold))]" :
                                      "bg-destructive"
                                    } ${seg.status !== "healthy" ? "cursor-pointer hover:scale-y-110" : "cursor-default"}`}
                                    onClick={() => {
                                      if (seg.status !== "healthy") {
                                        setSelectedIncident({ gateway: gw.name, segment: seg });
                                      }
                                    }}
                                  />
                                </TooltipTrigger>
                                <TooltipContent side="top" className="text-xs">
                                  <div className="font-medium">{seg.startTime} – {seg.endTime}</div>
                                  <div className="capitalize">{seg.status}</div>
                                  {seg.description && <div className="text-muted-foreground">{seg.description}</div>}
                                </TooltipContent>
                              </Tooltip>
                            ))}
                          </div>

                          <div className="flex justify-between text-[10px] text-muted-foreground font-mono">
                            <span>{segments[0]?.startTime}</span>
                            <span>{segments[Math.floor(segments.length / 2)]?.startTime}</span>
                            <span>{segments[segments.length - 1]?.endTime}</span>
                          </div>
                        </div>
                      );
                    })}
                  </TooltipProvider>

                  <div className="flex gap-4 pt-2 border-t border-border">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <div className="w-3 h-3 rounded-sm bg-[hsl(var(--redwood-green))]" />
                      Healthy
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <div className="w-3 h-3 rounded-sm bg-[hsl(var(--redwood-gold))]" />
                      Degraded
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <div className="w-3 h-3 rounded-sm bg-destructive" />
                      Down
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* MCP Servers Health */}
        <TabsContent value="mcp-health">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">MCP Servers Health & Status</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Server Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Uptime</TableHead>
                    <TableHead>Response Time</TableHead>
                    <TableHead className="text-center">Requests Served</TableHead>
                    <TableHead>Last Ping</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mcpServerHealth.map((s) => (
                    <TableRow key={s.name}>
                      <TableCell className="font-medium flex items-center gap-2">
                        {s.status === "Online" ? <Wifi size={14} className="text-[hsl(var(--redwood-green))]" /> :
                         s.status === "Offline" ? <WifiOff size={14} className="text-destructive" /> :
                         <Activity size={14} className="text-[hsl(var(--redwood-gold))]" />}
                        {s.name}
                      </TableCell>
                      <TableCell>{healthBadge(s.status)}</TableCell>
                      <TableCell className="font-mono text-sm">{s.uptime}</TableCell>
                      <TableCell className="font-mono text-sm">{s.responseTime}</TableCell>
                      <TableCell className="text-center font-semibold">{s.requestsServed.toLocaleString()}</TableCell>
                      <TableCell className="text-muted-foreground text-xs font-mono">{s.lastPing}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Audit Log */}
        <TabsContent value="audit">
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
        </TabsContent>
      </Tabs>

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
                  {idx < selectedInstance.flow.length - 1 && (
                    <div className="absolute left-[15px] top-8 h-[calc(100%-16px)] w-px bg-border" />
                  )}
                  <div className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border ${
                    step.status === "passed"
                      ? "border-[hsl(var(--redwood-green))] bg-[hsl(var(--redwood-green-light))] text-[hsl(var(--redwood-green))]"
                      : "border-destructive bg-destructive/10 text-destructive"
                  }`}>
                    {stepIcon(step.type)}
                  </div>
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
              <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
                <span className="text-sm font-medium">Total Duration</span>
                <span className="text-sm font-semibold font-mono">{selectedInstance.duration}</span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Gateway Metrics Detail Dialog */}
      <Dialog open={!!selectedMetricsGateway} onOpenChange={(open) => !open && setSelectedMetricsGateway(null)}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base flex items-center gap-2">
              <BarChart3 size={18} /> {selectedMetricsGateway} — Metrics
            </DialogTitle>
            <DialogDescription>Last 12 hours performance overview</DialogDescription>
          </DialogHeader>

          {selectedMetricsGateway && (() => {
            const data = generateTimeSeriesData(selectedMetricsGateway);
            return (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                {/* Uptime */}
                <Card>
                  <CardHeader className="pb-2 pt-3 px-4">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Uptime %</CardTitle>
                  </CardHeader>
                  <CardContent className="px-4 pb-3">
                    <ChartContainer config={metricsChartConfig} className="h-[160px] w-full">
                      <AreaChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-border/40" />
                        <XAxis dataKey="time" tick={{ fontSize: 10 }} className="text-muted-foreground" />
                        <YAxis domain={[95, 100]} tick={{ fontSize: 10 }} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Area type="monotone" dataKey="uptime" stroke="var(--color-uptime)" fill="var(--color-uptime)" fillOpacity={0.15} strokeWidth={2} />
                      </AreaChart>
                    </ChartContainer>
                  </CardContent>
                </Card>

                {/* Response Time */}
                <Card>
                  <CardHeader className="pb-2 pt-3 px-4">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Response Time (ms)</CardTitle>
                  </CardHeader>
                  <CardContent className="px-4 pb-3">
                    <ChartContainer config={metricsChartConfig} className="h-[160px] w-full">
                      <LineChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-border/40" />
                        <XAxis dataKey="time" tick={{ fontSize: 10 }} />
                        <YAxis tick={{ fontSize: 10 }} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Line type="monotone" dataKey="responseTime" stroke="var(--color-responseTime)" strokeWidth={2} dot={false} />
                      </LineChart>
                    </ChartContainer>
                  </CardContent>
                </Card>

                {/* Requests per Minute */}
                <Card>
                  <CardHeader className="pb-2 pt-3 px-4">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Requests / min</CardTitle>
                  </CardHeader>
                  <CardContent className="px-4 pb-3">
                    <ChartContainer config={metricsChartConfig} className="h-[160px] w-full">
                      <AreaChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-border/40" />
                        <XAxis dataKey="time" tick={{ fontSize: 10 }} />
                        <YAxis tick={{ fontSize: 10 }} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Area type="monotone" dataKey="requestsPerMin" stroke="var(--color-requestsPerMin)" fill="var(--color-requestsPerMin)" fillOpacity={0.15} strokeWidth={2} />
                      </AreaChart>
                    </ChartContainer>
                  </CardContent>
                </Card>

                {/* Error Rate */}
                <Card>
                  <CardHeader className="pb-2 pt-3 px-4">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Error Rate %</CardTitle>
                  </CardHeader>
                  <CardContent className="px-4 pb-3">
                    <ChartContainer config={metricsChartConfig} className="h-[160px] w-full">
                      <LineChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-border/40" />
                        <XAxis dataKey="time" tick={{ fontSize: 10 }} />
                        <YAxis tick={{ fontSize: 10 }} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Line type="monotone" dataKey="errorRate" stroke="var(--color-errorRate)" strokeWidth={2} dot={false} />
                      </LineChart>
                    </ChartContainer>
                  </CardContent>
                </Card>
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>

      {/* Incident Detail Dialog */}
      <Dialog open={!!selectedIncident} onOpenChange={(open) => !open && setSelectedIncident(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base flex items-center gap-2">
              <AlertTriangle size={18} className={selectedIncident?.segment.status === "down" ? "text-destructive" : "text-[hsl(var(--redwood-gold))]"} />
              Incident Details
            </DialogTitle>
            <DialogDescription>{selectedIncident?.gateway}</DialogDescription>
          </DialogHeader>

          {selectedIncident && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Time Range</p>
                  <p className="text-sm font-mono font-medium">{selectedIncident.segment.startTime} – {selectedIncident.segment.endTime}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Status</p>
                  <Badge className={
                    selectedIncident.segment.status === "down"
                      ? "bg-destructive text-destructive-foreground border-transparent"
                      : "bg-[hsl(var(--redwood-gold))] text-[hsl(var(--accent-foreground))] border-transparent"
                  }>
                    {selectedIncident.segment.status === "down" ? "Outage" : "Degraded"}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Root Cause</p>
                  <p className="text-sm font-medium">{selectedIncident.segment.description || "Unknown"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Requests Affected</p>
                  <p className="text-sm font-mono font-semibold">{selectedIncident.segment.requestsAffected?.toLocaleString() ?? "—"}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default GatewayObserveDashboard;
