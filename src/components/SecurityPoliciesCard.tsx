import { useState } from "react";
import { Plus, ShieldCheck, ShieldAlert, FileCheck, Bug, Gauge, Package, Database, Lock, Filter, MoreHorizontal, Pencil, X, type LucideIcon } from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import type { MCPServer, MCPServerTool } from "@/components/MCPServersCard";
import { nativeTools, type NativeTool } from "@/components/ToolsCard";

const iconMap: Record<string, LucideIcon> = {
  ShieldAlert, FileCheck, Bug, ShieldCheck, Gauge, Package, Database, Lock, Filter,
};

export const securityPolicyRepository = [
  { templateId: "t1", name: "PII Detection", description: "Scan for sensitive data", icon: "ShieldAlert" },
  { templateId: "t2", name: "Schema Validation", description: "Ensure format compliance", icon: "FileCheck" },
  { templateId: "t3", name: "Tool Poisoning Check", description: "Detect malicious payloads", icon: "Bug" },
  { templateId: "t4", name: "Intrusion Detection", description: "Identify suspicious patterns", icon: "ShieldCheck" },
  { templateId: "t5", name: "Rate Limiting", description: "Check quota consumption", icon: "Gauge" },
  { templateId: "t6", name: "Payload Size", description: "Validate request size", icon: "Package" },
  
  { templateId: "t8", name: "Encryption", description: "Prepare encrypted transmission", icon: "Lock" },
  { templateId: "t9", name: "Tools Filter", description: "Allow specific tools from MCP servers", icon: "Filter" },
];

export interface SecurityPolicy {
  id: string;
  name: string;
  description: string;
  icon: string;
  active: boolean;
  templateId: string;
  config: Record<string, any>;
}

// --- Config schema definitions ---

interface PolicyFieldDef {
  key: string;
  label: string;
  type: "select" | "number" | "text" | "toggle" | "multi-select";
  options?: { value: string; label: string }[];
  default: any;
  suffix?: string;
}

const policyConfigSchemas: Record<string, PolicyFieldDef[]> = {
  // t1 — PII Detection: custom handling, not standard schema
  t2: [
    { key: "enforcementLevel", label: "Enforcement Level", type: "select", options: [
      { value: "gateway", label: "MCP Gateway" },
      { value: "server", label: "MCP Server" },
      { value: "tool", label: "Tool" },
    ], default: "gateway" },
    { key: "targetServerId", label: "Target Server", type: "select", options: [], default: "" },
    { key: "targetToolId", label: "Target Tool", type: "select", options: [], default: "" },
    { key: "validationMode", label: "Validation Mode", type: "select", options: [
      { value: "strict", label: "Strict" },
      { value: "lenient", label: "Lenient" },
    ], default: "strict" },
    { key: "action", label: "Action", type: "select", options: [
      { value: "block", label: "Block" },
      { value: "warn", label: "Warn" },
      { value: "log", label: "Log" },
    ], default: "block" },
  ],
  t3: [
    { key: "action", label: "Action", type: "select", options: [
      { value: "block", label: "Block" },
      { value: "log-alert", label: "Log & Alert" },
      { value: "redact", label: "Redact" },
    ], default: "block" },
    { key: "ipBlockDuration", label: "IP Block Duration", type: "select", options: [
      { value: "15min", label: "15 minutes" },
      { value: "1hour", label: "1 hour" },
      { value: "24hours", label: "24 hours" },
    ], default: "1hour" },
    { key: "alertRecipients", label: "Alert Recipients (emails)", type: "text", default: "" },
    { key: "whitelistExceptions", label: "Whitelist Exceptions", type: "text", default: "" },
  ],
  // t4 — Intrusion Detection: custom handling, not standard schema
  t5: [
    { key: "enforcementLevel", label: "Enforcement Level", type: "select", options: [
      { value: "gateway", label: "MCP Gateway" },
      { value: "server", label: "MCP Server" },
      { value: "native-tools", label: "Native Tools Server" },
    ], default: "gateway" },
    { key: "targetServerId", label: "Target Server", type: "select", options: [], default: "" },
    { key: "threshold", label: "Threshold (requests)", type: "number", default: 100 },
    { key: "timeWindow", label: "Time Window", type: "select", options: [
      { value: "per-minute", label: "Per Minute" },
      { value: "per-hour", label: "Per Hour" },
    ], default: "per-minute" },
    { key: "action", label: "Action on Violation", type: "select", options: [
      { value: "block", label: "Block" },
      { value: "throttle", label: "Throttle" },
      { value: "warn", label: "Warn" },
    ], default: "block" },
  ],
  t6: [
    { key: "enforcementLevel", label: "Enforcement Level", type: "select", options: [
      { value: "gateway", label: "MCP Gateway" },
      { value: "server", label: "MCP Server" },
      { value: "tool", label: "Tool" },
    ], default: "gateway" },
    { key: "targetServerId", label: "Target Server", type: "select", options: [], default: "" },
    { key: "targetToolId", label: "Target Tool", type: "select", options: [], default: "" },
    { key: "appliesTo", label: "Applies To", type: "select", options: [
      { value: "request", label: "Request Only" },
      { value: "response", label: "Response Only" },
      { value: "both", label: "Both" },
    ], default: "both" },
    { key: "maxRequestSize", label: "Max Request Size (MB)", type: "number", default: 10 },
    { key: "maxResponseSize", label: "Max Response Size (MB)", type: "number", default: 50 },
    { key: "action", label: "Action", type: "select", options: [
      { value: "block", label: "Block" },
      { value: "warn-throttle", label: "Warn & Throttle" },
      { value: "warn-only", label: "Warn Only" },
    ], default: "block" },
    { key: "allowedFileTypes", label: "Allowed File Types", type: "text", default: "images, PDFs, data" },
    { key: "compressionEnabled", label: "Allow gzip/brotli", type: "toggle", default: true },
    { key: "maxDecompressedSize", label: "Max Decompressed Size (MB)", type: "number", default: 100 },
  ],
  // t7 — no config fields (merged into Intrusion Detection)
  t8: [
    { key: "enforcementLevel", label: "Enforcement Level", type: "select", options: [
      { value: "gateway", label: "MCP Gateway" },
      { value: "server", label: "MCP Server" },
      { value: "tool", label: "Tool" },
    ], default: "gateway" },
    { key: "targetServerId", label: "Target Server", type: "select", options: [], default: "" },
    { key: "targetToolId", label: "Target Tool", type: "select", options: [], default: "" },
    { key: "appliesTo", label: "Applies To", type: "select", options: [
      { value: "request", label: "Request Only" },
      { value: "response", label: "Response Only" },
      { value: "both", label: "Both" },
    ], default: "response" },
    { key: "mode", label: "Mode", type: "select", options: [
      { value: "optional", label: "Optional" },
      { value: "required", label: "Required" },
    ], default: "required" },
    { key: "keyRotationDays", label: "Key Rotation (days)", type: "number", default: 90 },
    { key: "keyStorage", label: "Key Storage", type: "select", options: [
      { value: "hsm", label: "Hardware Security Module" },
      { value: "cloud-kms", label: "Cloud KMS" },
      { value: "internal-vault", label: "Internal Vault" },
    ], default: "cloud-kms" },
    { key: "complianceBadges", label: "Compliance Badges", type: "multi-select", options: [
      { value: "pci-dss", label: "PCI-DSS" },
      { value: "hipaa", label: "HIPAA" },
      { value: "gdpr", label: "GDPR" },
      { value: "fips", label: "FIPS" },
    ], default: [] },
  ],
  // t9 — Tools Filter: custom handling, not standard schema
};

// Helper to check if a field should be visible based on enforcement level
const ENFORCEMENT_LEVEL_TEMPLATES = ["t2", "t5", "t6", "t8"];

function isEnforcementFieldVisible(templateId: string, fieldKey: string, configValues: Record<string, any>): boolean {
  if (!ENFORCEMENT_LEVEL_TEMPLATES.includes(templateId)) return true;
  const level = configValues.enforcementLevel || "gateway";
  if (fieldKey === "targetServerId") {
    // For t5, "server" level means MCP server; "native-tools" is a separate level with no picker
    if (templateId === "t5") return level === "server";
    return level === "server" || level === "tool";
  }
  if (fieldKey === "targetToolId") {
    // t5 doesn't have tool-level
    if (templateId === "t5") return false;
    return level === "tool";
  }
  return true;
}

function getEnforcementLevelLabel(templateId: string, config: Record<string, any>, mcpServers: MCPServer[]): string {
  const level = config?.enforcementLevel;
  if (!level || level === "gateway") return "";
  if (templateId === "t5" && level === "native-tools") return "Level: Native Tools Server";
  const serverId = config?.targetServerId;
  const serverName = serverId === "native-tools" ? "Native Tools" : mcpServers.find(s => s.id === serverId)?.name;
  if (level === "server") return serverName ? `Level: MCP Server (${serverName})` : "Level: MCP Server";
  if (level === "tool") {
    const toolId = config?.targetToolId;
    const server = serverId === "native-tools" ? null : mcpServers.find(s => s.id === serverId);
    const toolName = serverId === "native-tools"
      ? nativeTools.find(t => t.id === toolId)?.name  // uses global fallback for label lookup
      : server?.allTools?.find(t => t.id === toolId)?.name;
    const target = toolName ? `${serverName || "Server"} / ${toolName}` : serverName || "Server";
    return `Level: Tool (${target})`;
  }
  return "";
}

// --- PII Detection constants ---

const PII_DETECTORS = [
  { id: "email", label: "Email Addresses" },
  { id: "phone", label: "Phone Numbers" },
  { id: "ssn", label: "Social Security Numbers" },
  { id: "credit_card", label: "Credit Card Numbers" },
  { id: "drivers_license", label: "Driver's License Numbers" },
  { id: "passport", label: "Passport Numbers" },
  { id: "government_id", label: "Government ID Numbers" },
  { id: "bank_account", label: "Bank Account Numbers" },
  { id: "ip_address", label: "IP Addresses" },
  { id: "sensitive_url", label: "Sensitive URLs" },
  { id: "api_key", label: "API Keys & Tokens" },
  { id: "home_address", label: "Home Addresses" },
  { id: "dob", label: "Dates of Birth" },
];

const PII_DATA_CATEGORIES = [
  { value: "financial", label: "Financial" },
  { value: "health", label: "Health" },
  { value: "identity", label: "Identity" },
  { value: "contact", label: "Contact" },
  { value: "authentication", label: "Authentication" },
];

const PII_COMPLIANCE_TAGS = [
  { value: "gdpr", label: "GDPR" },
  { value: "ccpa", label: "CCPA" },
  { value: "hipaa", label: "HIPAA" },
  { value: "pci-dss", label: "PCI-DSS" },
  { value: "sox", label: "SOX" },
];

const PII_SCAN_TARGETS = [
  { value: "body", label: "Body" },
  { value: "headers", label: "Headers" },
  { value: "url_params", label: "URL Parameters" },
  { value: "path_segments", label: "Path Segments" },
];

interface PIICustomPattern {
  label: string;
  regex: string;
}

interface PIIConfig {
  detectors: string[];
  customPatterns: PIICustomPattern[];
  mlEnabled: boolean;
  severity: string;
  dataCategories: string[];
  complianceTags: string[];
  confidenceThreshold: number;
  action: string;
  blockWithLogging: boolean;
  blockWithAlerting: boolean;
  blockConfidenceThreshold: number;
  redactionStyle: string;
  selectiveRedaction: boolean;
  replacementStyle: string;
  alertRecipients: string;
  appliesTo: string;
  scanTargets: string[];
  granularity: string;
  piiCountThreshold: number;
  timeBased: boolean;
  timeStart: string;
  timeEnd: string;
}

function getDefaultPIIConfig(): PIIConfig {
  return {
    detectors: PII_DETECTORS.map((d) => d.id),
    customPatterns: [],
    mlEnabled: false,
    severity: "medium",
    dataCategories: [],
    complianceTags: [],
    confidenceThreshold: 80,
    action: "block",
    blockWithLogging: true,
    blockWithAlerting: false,
    blockConfidenceThreshold: 90,
    redactionStyle: "partial-mask",
    selectiveRedaction: false,
    replacementStyle: "placeholder",
    alertRecipients: "",
    appliesTo: "both",
    scanTargets: ["body"],
    granularity: "global",
    piiCountThreshold: 1,
    timeBased: false,
    timeStart: "09:00",
    timeEnd: "17:00",
  };
}

// --- Intrusion Detection constants ---

const IDS_PATTERN_TYPES = [
  { id: "sql_injection", label: "SQL Injection", defaultThreshold: 85, fpRate: "< 2%", description: "Detect UNION-based, time-based, error-based injection, SQL keywords, escape sequences, hex payloads" },
  { id: "command_injection", label: "Command Injection", defaultThreshold: 90, fpRate: "< 2%", description: "Detect shell metacharacters, command substitution, Bash/PowerShell/cmd.exe payloads" },
  { id: "path_traversal", label: "Path Traversal", defaultThreshold: 95, fpRate: "< 1%", description: "Detect ../ sequences, URL-encoded traversal, absolute paths to restricted directories" },
  { id: "prompt_injection", label: "Prompt Injection", defaultThreshold: 80, fpRate: "< 5%", description: "Detect system prompt overrides, IGNORE PREVIOUS, role-playing injection, prompt reveal attempts" },
];

const IDS_EVASION_TECHNIQUES = [
  { id: "url_encoding", label: "URL Encoding (%27, %3D)" },
  { id: "html_entity", label: "HTML Entity Encoding" },
  { id: "unicode_normalization", label: "Unicode Normalization" },
  { id: "base64", label: "Base64 Encoding" },
  { id: "hex_encoding", label: "Hex Encoding (0x...)" },
  { id: "double_url_encoding", label: "Double URL Encoding" },
  { id: "case_variation", label: "Case Variations" },
  { id: "null_byte_injection", label: "Null Byte Injection" },
];

interface IDSConfig {
  enabledPatterns: string[];
  evasionHandling: string[];
  confidenceThresholds: Record<string, number>;
  responseAction: string;
  blockWithLogging: boolean;
  blockWithAlerting: boolean;
  errorMessage: string;
  includeRequestId: boolean;
  maxBlockLatencyMs: number;
  alertRecipients: string;
  globalEnabled: boolean;
  appliesTo: string;
  perServerOverrides: Record<string, { enabled: boolean; patterns: string[]; thresholds: Record<string, number> }>;
  whitelistPatterns: { tool: string; pattern: string; description: string }[];
}

function getDefaultIDSConfig(): IDSConfig {
  const thresholds: Record<string, number> = {};
  IDS_PATTERN_TYPES.forEach((p) => { thresholds[p.id] = p.defaultThreshold; });
  return {
    enabledPatterns: IDS_PATTERN_TYPES.map((p) => p.id),
    evasionHandling: IDS_EVASION_TECHNIQUES.map((e) => e.id),
    confidenceThresholds: thresholds,
    responseAction: "block",
    blockWithLogging: true,
    blockWithAlerting: false,
    errorMessage: "Request validation failed",
    includeRequestId: true,
    maxBlockLatencyMs: 50,
    alertRecipients: "",
    globalEnabled: true,
    appliesTo: "both",
    perServerOverrides: {},
    whitelistPatterns: [],
  };
}

function getDefaultConfig(templateId: string): Record<string, any> {
  const schema = policyConfigSchemas[templateId];
  if (!schema) return {};
  const cfg: Record<string, any> = {};
  schema.forEach((f) => { cfg[f.key] = f.default; });
  return cfg;
}

function getConfigSummary(templateId: string, config: Record<string, any>, mcpServers?: MCPServer[]): string {
  if (templateId === "t1") {
    const detectors = Array.isArray(config?.detectors) ? config.detectors.length : 0;
    const action = config?.action || "block";
    const actionLabel = { block: "Block", redact: "Redact", replace: "Replace", truncate: "Truncate", encrypt: "Encrypt", "log-warning": "Log Warning" }[action] || action;
    const severity = config?.severity || "medium";
    const sevLabel = severity.charAt(0).toUpperCase() + severity.slice(1);
    const parts = [`Action: ${actionLabel}`, `${detectors} detectors`, `Severity: ${sevLabel}`];
    const tags = Array.isArray(config?.complianceTags) && config.complianceTags.length > 0
      ? config.complianceTags.map((t: string) => PII_COMPLIANCE_TAGS.find((c) => c.value === t)?.label || t).join(", ")
      : null;
    if (tags) parts.push(tags);
    return parts.join(" · ");
  }
  if (templateId === "t4") {
    const patterns = Array.isArray(config?.enabledPatterns) ? config.enabledPatterns.length : 0;
    const action = config?.responseAction || "block";
    const actionLabel = { block: "Block (403)", "log-alert": "Log & Alert", throttle: "Throttle" }[action] || action;
    const thresholds = config?.confidenceThresholds as Record<string, number> | undefined;
    let thresholdRange = "";
    if (thresholds) {
      const vals = Object.values(thresholds).filter((v) => typeof v === "number");
      if (vals.length > 0) thresholdRange = ` · Thresholds: ${Math.min(...vals)}-${Math.max(...vals)}%`;
    }
    return `Action: ${actionLabel} · ${patterns} pattern${patterns !== 1 ? "s" : ""}${thresholdRange}`;
  }
  if (templateId === "t9") {
    const serverName = config?.serverName || "Unknown";
    const included = Array.isArray(config?.includedTools) ? config.includedTools.length : 0;
    return `Server: ${serverName} · Includes: ${included} tool${included !== 1 ? "s" : ""}`;
  }
  const schema = policyConfigSchemas[templateId];
  if (!schema || schema.length === 0) return "";
  // Build enforcement level prefix
  const enforcementPrefix = mcpServers ? getEnforcementLevelLabel(templateId, config, mcpServers) : "";
  const parts: string[] = [];
  if (enforcementPrefix) parts.push(enforcementPrefix);
  for (const field of schema) {
    if (field.type === "text") continue;
    // Skip enforcement meta-fields from summary
    if (["enforcementLevel", "targetServerId", "targetToolId"].includes(field.key)) continue;
    const val = config?.[field.key];
    if (val === undefined || val === null) continue;
    if (field.type === "toggle") {
      parts.push(`${field.label}: ${val ? "Yes" : "No"}`);
    } else if (field.type === "multi-select" && Array.isArray(val)) {
      if (val.length > 0) {
        const labels = val.map((v: string) => field.options?.find((o) => o.value === v)?.label ?? v);
        parts.push(labels.join(", "));
      }
    } else if (field.options) {
      const label = field.options.find((o) => o.value === val)?.label ?? val;
      parts.push(`${field.label}: ${label}`);
    } else {
      parts.push(`${field.label}: ${val}${field.suffix ?? ""}`);
    }
    if (parts.length >= 4) break;
  }
  return parts.join(" · ");
}

// --- Storage ---

function loadPolicies(projectId?: string): SecurityPolicy[] {
  const key = projectId ? `security-policies-${projectId}` : "security-policies";
  try {
    const stored = localStorage.getItem(key);
    if (stored) {
      const parsed = JSON.parse(stored) as SecurityPolicy[];
      return parsed.map((p) => ({ ...p, config: p.config ?? {} }));
    }
  } catch {}
  return [];
}

function savePolicies(policies: SecurityPolicy[], projectId?: string) {
  const key = projectId ? `security-policies-${projectId}` : "security-policies";
  localStorage.setItem(key, JSON.stringify(policies));
}

// --- PII Config Dialog Component ---

function PIIConfigDialog({
  open,
  onOpenChange,
  config,
  onConfigChange,
  onSave,
  isEdit,
  policyName,
  onPolicyNameChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  config: PIIConfig;
  onConfigChange: (config: PIIConfig) => void;
  onSave: () => void;
  isEdit: boolean;
  policyName: string;
  onPolicyNameChange: (name: string) => void;
}) {
  const update = <K extends keyof PIIConfig>(key: K, value: PIIConfig[K]) => {
    onConfigChange({ ...config, [key]: value });
  };

  const toggleDetector = (id: string) => {
    const next = config.detectors.includes(id)
      ? config.detectors.filter((d) => d !== id)
      : [...config.detectors, id];
    update("detectors", next);
  };

  const toggleArrayItem = (key: "dataCategories" | "complianceTags" | "scanTargets", value: string) => {
    const arr = config[key];
    const next = arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value];
    update(key, next);
  };

  const addCustomPattern = () => {
    update("customPatterns", [...config.customPatterns, { label: "", regex: "" }]);
  };

  const updateCustomPattern = (idx: number, field: "label" | "regex", value: string) => {
    const next = config.customPatterns.map((p, i) => i === idx ? { ...p, [field]: value } : p);
    update("customPatterns", next);
  };

  const removeCustomPattern = (idx: number) => {
    update("customPatterns", config.customPatterns.filter((_, i) => i !== idx));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit: PII Detection" : "Configure: PII Detection"}</DialogTitle>
          <DialogDescription>
            {isEdit ? "Modify PII detection policy configuration." : "Configure the PII detection policy before adding."}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-1.5 mt-2">
          <Label className="text-xs font-medium">Policy Name</Label>
          <Input className="h-8 text-xs" value={policyName} onChange={(e) => onPolicyNameChange(e.target.value)} placeholder="PII Detection" />
        </div>

        <Tabs defaultValue="detection" className="mt-1">
          <TabsList className="w-full">
            <TabsTrigger value="detection" className="flex-1 text-xs">Detection</TabsTrigger>
            <TabsTrigger value="classification" className="flex-1 text-xs">Classification</TabsTrigger>
            <TabsTrigger value="enforcement" className="flex-1 text-xs">Enforcement</TabsTrigger>
            <TabsTrigger value="scope" className="flex-1 text-xs">Scope</TabsTrigger>
          </TabsList>

          {/* Detection Tab */}
          <TabsContent value="detection" className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Built-in Detectors ({config.detectors.length} of {PII_DETECTORS.length})</Label>
              <div className="grid grid-cols-2 gap-1 rounded-md border border-border p-3 max-h-52 overflow-y-auto">
                {PII_DETECTORS.map((d) => (
                  <label key={d.id} className="flex items-center gap-2 py-1 cursor-pointer hover:bg-muted/50 rounded px-1">
                    <Checkbox checked={config.detectors.includes(d.id)} onCheckedChange={() => toggleDetector(d.id)} />
                    <span className="text-xs text-foreground">{d.label}</span>
                  </label>
                ))}
              </div>
              <div className="flex gap-2 mt-1">
                <Button variant="ghost" size="sm" className="h-6 text-[10px] px-2" onClick={() => update("detectors", PII_DETECTORS.map((d) => d.id))}>Select All</Button>
                <Button variant="ghost" size="sm" className="h-6 text-[10px] px-2" onClick={() => update("detectors", [])}>Clear All</Button>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Custom Patterns</Label>
              <div className="space-y-2">
                {config.customPatterns.map((p, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <Input className="h-7 text-xs flex-1" placeholder="Label" value={p.label} onChange={(e) => updateCustomPattern(idx, "label", e.target.value)} />
                    <Input className="h-7 text-xs flex-1 font-mono" placeholder="Regex pattern" value={p.regex} onChange={(e) => updateCustomPattern(idx, "regex", e.target.value)} />
                    <button onClick={() => removeCustomPattern(idx)} className="text-muted-foreground hover:text-destructive"><X size={14} /></button>
                  </div>
                ))}
                <Button variant="outline" size="sm" className="h-7 text-xs" onClick={addCustomPattern}>
                  <Plus size={12} className="mr-1" /> Add Pattern
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between rounded-md border border-border p-3">
              <div>
                <p className="text-xs font-medium text-foreground">ML-Based Detection (NER)</p>
                <p className="text-[10px] text-muted-foreground">Named Entity Recognition for person/org names</p>
              </div>
              <Switch checked={config.mlEnabled} onCheckedChange={(v) => update("mlEnabled", v)} className="scale-75" />
            </div>
          </TabsContent>

          {/* Classification Tab */}
          <TabsContent value="classification" className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Severity Level</Label>
              <Select value={config.severity} onValueChange={(v) => update("severity", v)}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Data Categories</Label>
              <div className="flex flex-wrap gap-3">
                {PII_DATA_CATEGORIES.map((c) => (
                  <label key={c.value} className="flex items-center gap-1.5 text-xs cursor-pointer">
                    <Checkbox checked={config.dataCategories.includes(c.value)} onCheckedChange={() => toggleArrayItem("dataCategories", c.value)} />
                    {c.label}
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Compliance Tags</Label>
              <div className="flex flex-wrap gap-3">
                {PII_COMPLIANCE_TAGS.map((c) => (
                  <label key={c.value} className="flex items-center gap-1.5 text-xs cursor-pointer">
                    <Checkbox checked={config.complianceTags.includes(c.value)} onCheckedChange={() => toggleArrayItem("complianceTags", c.value)} />
                    {c.label}
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Confidence Threshold (%)</Label>
              <Input type="number" className="h-8 text-xs w-24" min={0} max={100} value={config.confidenceThreshold} onChange={(e) => update("confidenceThreshold", Number(e.target.value))} />
            </div>
          </TabsContent>

          {/* Enforcement Tab */}
          <TabsContent value="enforcement" className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Primary Action</Label>
              <Select value={config.action} onValueChange={(v) => update("action", v)}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="block">Block</SelectItem>
                  <SelectItem value="redact">Redact</SelectItem>
                  <SelectItem value="replace">Replace</SelectItem>
                  <SelectItem value="truncate">Truncate</SelectItem>
                  <SelectItem value="encrypt">Encrypt</SelectItem>
                  <SelectItem value="log-warning">Log Warning</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {config.action === "block" && (
              <div className="space-y-3 rounded-md border border-border p-3">
                <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Block Options</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-foreground">Block with Logging</span>
                  <Switch checked={config.blockWithLogging} onCheckedChange={(v) => update("blockWithLogging", v)} className="scale-75" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-foreground">Block with Alerting</span>
                  <Switch checked={config.blockWithAlerting} onCheckedChange={(v) => update("blockWithAlerting", v)} className="scale-75" />
                </div>
                <div className="space-y-1">
                  <span className="text-xs text-foreground">Conditional Block Threshold (%)</span>
                  <Input type="number" className="h-7 text-xs w-24" min={0} max={100} value={config.blockConfidenceThreshold} onChange={(e) => update("blockConfidenceThreshold", Number(e.target.value))} />
                </div>
              </div>
            )}

            {config.action === "redact" && (
              <div className="space-y-3 rounded-md border border-border p-3">
                <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Redaction Options</p>
                <div className="space-y-1.5">
                  <Label className="text-xs">Redaction Style</Label>
                  <Select value={config.redactionStyle} onValueChange={(v) => update("redactionStyle", v)}>
                    <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="partial-mask">Partial Mask</SelectItem>
                      <SelectItem value="hash">Hash</SelectItem>
                      <SelectItem value="tokenize">Tokenize</SelectItem>
                      <SelectItem value="format-preserving">Format-Preserving</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-foreground">Selective Redaction (response only)</span>
                  <Switch checked={config.selectiveRedaction} onCheckedChange={(v) => update("selectiveRedaction", v)} className="scale-75" />
                </div>
              </div>
            )}

            {config.action === "replace" && (
              <div className="space-y-3 rounded-md border border-border p-3">
                <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Replacement Options</p>
                <div className="space-y-1.5">
                  <Label className="text-xs">Replacement Style</Label>
                  <Select value={config.replacementStyle} onValueChange={(v) => update("replacementStyle", v)}>
                    <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="placeholder">Placeholder Values</SelectItem>
                      <SelectItem value="synthetic">Synthetic Data</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Alert Recipients (emails)</Label>
              <Input type="text" className="h-8 text-xs" placeholder="security@example.com, admin@example.com" value={config.alertRecipients} onChange={(e) => update("alertRecipients", e.target.value)} />
            </div>
          </TabsContent>

          {/* Scope Tab */}
          <TabsContent value="scope" className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Applies To</Label>
              <Select value={config.appliesTo} onValueChange={(v) => update("appliesTo", v)}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="request">Request Only</SelectItem>
                  <SelectItem value="response">Response Only</SelectItem>
                  <SelectItem value="both">Both</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Scan Targets</Label>
              <div className="flex flex-wrap gap-3">
                {PII_SCAN_TARGETS.map((t) => (
                  <label key={t.value} className="flex items-center gap-1.5 text-xs cursor-pointer">
                    <Checkbox checked={config.scanTargets.includes(t.value)} onCheckedChange={() => toggleArrayItem("scanTargets", t.value)} />
                    {t.label}
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Policy Granularity</Label>
              <Select value={config.granularity} onValueChange={(v) => update("granularity", v)}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="global">Global</SelectItem>
                  <SelectItem value="per-server">Per-Server</SelectItem>
                  <SelectItem value="per-request-type">Per-Request-Type</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium">PII Count Threshold</Label>
              <Input type="number" className="h-8 text-xs w-24" min={1} value={config.piiCountThreshold} onChange={(e) => update("piiCountThreshold", Number(e.target.value))} />
              <p className="text-[10px] text-muted-foreground">Only trigger if this many PII fields are detected</p>
            </div>

            <div className="space-y-2 rounded-md border border-border p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-foreground">Time-Based Restriction</p>
                  <p className="text-[10px] text-muted-foreground">Only enforce during specific hours</p>
                </div>
                <Switch checked={config.timeBased} onCheckedChange={(v) => update("timeBased", v)} className="scale-75" />
              </div>
              {config.timeBased && (
                <div className="flex items-center gap-2 mt-1">
                  <Input type="time" className="h-7 text-xs w-28" value={config.timeStart} onChange={(e) => update("timeStart", e.target.value)} />
                  <span className="text-xs text-muted-foreground">to</span>
                  <Input type="time" className="h-7 text-xs w-28" value={config.timeEnd} onChange={(e) => update("timeEnd", e.target.value)} />
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button size="sm" onClick={onSave}>
            {isEdit ? "Save Changes" : "Add Policy"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// --- Intrusion Detection Config Dialog ---

function IntrusionDetectionConfigDialog({
  open,
  onOpenChange,
  config,
  onConfigChange,
  onSave,
  isEdit,
  mcpServers,
  policyName,
  onPolicyNameChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  config: IDSConfig;
  onConfigChange: (config: IDSConfig) => void;
  onSave: () => void;
  isEdit: boolean;
  mcpServers: MCPServer[];
  policyName: string;
  onPolicyNameChange: (name: string) => void;
}) {
  const update = <K extends keyof IDSConfig>(key: K, value: IDSConfig[K]) => {
    onConfigChange({ ...config, [key]: value });
  };

  const toggleArrayItem = (key: "enabledPatterns" | "evasionHandling", value: string) => {
    const arr = config[key];
    const next = arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value];
    update(key, next);
  };

  const updateThreshold = (patternId: string, value: number) => {
    update("confidenceThresholds", { ...config.confidenceThresholds, [patternId]: value });
  };

  const activeServers = mcpServers.filter((s) => s.status === "Active");

  const updateServerOverride = (serverId: string, field: string, value: any) => {
    const existing = config.perServerOverrides[serverId] || { enabled: true, patterns: IDS_PATTERN_TYPES.map(p => p.id), thresholds: {} };
    update("perServerOverrides", { ...config.perServerOverrides, [serverId]: { ...existing, [field]: value } });
  };

  const toggleServerPattern = (serverId: string, patternId: string) => {
    const existing = config.perServerOverrides[serverId] || { enabled: true, patterns: IDS_PATTERN_TYPES.map(p => p.id), thresholds: {} };
    const patterns = existing.patterns.includes(patternId)
      ? existing.patterns.filter((p: string) => p !== patternId)
      : [...existing.patterns, patternId];
    update("perServerOverrides", { ...config.perServerOverrides, [serverId]: { ...existing, patterns } });
  };

  const addWhitelistEntry = () => {
    update("whitelistPatterns", [...config.whitelistPatterns, { tool: "", pattern: "", description: "" }]);
  };

  const updateWhitelistEntry = (idx: number, field: "tool" | "pattern" | "description", value: string) => {
    const next = config.whitelistPatterns.map((e, i) => i === idx ? { ...e, [field]: value } : e);
    update("whitelistPatterns", next);
  };

  const removeWhitelistEntry = (idx: number) => {
    update("whitelistPatterns", config.whitelistPatterns.filter((_, i) => i !== idx));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit: Intrusion Detection" : "Configure: Intrusion Detection"}</DialogTitle>
          <DialogDescription>
            {isEdit ? "Modify intrusion detection policy configuration." : "Configure the intrusion detection policy before adding."}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-1.5 mt-2">
          <Label className="text-xs font-medium">Policy Name</Label>
          <Input className="h-8 text-xs" value={policyName} onChange={(e) => onPolicyNameChange(e.target.value)} placeholder="Intrusion Detection" />
        </div>

        <Tabs defaultValue="detection" className="mt-1">
          <TabsList className="w-full">
            <TabsTrigger value="detection" className="flex-1 text-xs">Detection</TabsTrigger>
            <TabsTrigger value="thresholds" className="flex-1 text-xs">Thresholds</TabsTrigger>
            <TabsTrigger value="enforcement" className="flex-1 text-xs">Enforcement</TabsTrigger>
            <TabsTrigger value="scope" className="flex-1 text-xs">Scope</TabsTrigger>
            <TabsTrigger value="whitelisting" className="flex-1 text-xs">Whitelisting</TabsTrigger>
          </TabsList>

          {/* Detection Tab */}
          <TabsContent value="detection" className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Attack Pattern Detection ({config.enabledPatterns.length} of {IDS_PATTERN_TYPES.length})</Label>
              <div className="space-y-1 rounded-md border border-border p-3 max-h-60 overflow-y-auto">
                {IDS_PATTERN_TYPES.map((p) => (
                  <label key={p.id} className="flex items-start gap-2 py-1.5 cursor-pointer hover:bg-muted/50 rounded px-1 -mx-1">
                    <Checkbox checked={config.enabledPatterns.includes(p.id)} onCheckedChange={() => toggleArrayItem("enabledPatterns", p.id)} className="mt-0.5" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium text-foreground">{p.label}</p>
                      <p className="text-[10px] text-muted-foreground">{p.description}</p>
                      <p className="text-[10px] text-muted-foreground/70">Target false-positive rate: {p.fpRate}</p>
                    </div>
                  </label>
                ))}
              </div>
              <div className="flex gap-2 mt-1">
                <Button variant="ghost" size="sm" className="h-6 text-[10px] px-2" onClick={() => update("enabledPatterns", IDS_PATTERN_TYPES.map(p => p.id))}>Select All</Button>
                <Button variant="ghost" size="sm" className="h-6 text-[10px] px-2" onClick={() => update("enabledPatterns", [])}>Clear All</Button>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Evasion Handling ({config.evasionHandling.length} of {IDS_EVASION_TECHNIQUES.length})</Label>
              <div className="grid grid-cols-2 gap-1 rounded-md border border-border p-3">
                {IDS_EVASION_TECHNIQUES.map((e) => (
                  <label key={e.id} className="flex items-center gap-2 py-1 cursor-pointer hover:bg-muted/50 rounded px-1">
                    <Checkbox checked={config.evasionHandling.includes(e.id)} onCheckedChange={() => toggleArrayItem("evasionHandling", e.id)} />
                    <span className="text-xs text-foreground">{e.label}</span>
                  </label>
                ))}
              </div>
              <div className="flex gap-2 mt-1">
                <Button variant="ghost" size="sm" className="h-6 text-[10px] px-2" onClick={() => update("evasionHandling", IDS_EVASION_TECHNIQUES.map(e => e.id))}>Select All</Button>
                <Button variant="ghost" size="sm" className="h-6 text-[10px] px-2" onClick={() => update("evasionHandling", [])}>Clear All</Button>
              </div>
            </div>
          </TabsContent>

          {/* Thresholds Tab */}
          <TabsContent value="thresholds" className="space-y-4 py-2">
            <p className="text-[10px] text-muted-foreground">Higher threshold = fewer false positives but may miss some attacks. Lower threshold = more protection but more false positives.</p>
            <div className="space-y-3">
              {IDS_PATTERN_TYPES.filter((p) => config.enabledPatterns.includes(p.id)).map((p) => (
                <div key={p.id} className="flex items-center justify-between rounded-md border border-border p-3">
                  <div>
                    <p className="text-xs font-medium text-foreground">{p.label}</p>
                    <p className="text-[10px] text-muted-foreground">Default: {p.defaultThreshold}%</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Input
                      type="number"
                      className="h-7 text-xs w-20"
                      min={0}
                      max={100}
                      value={config.confidenceThresholds[p.id] ?? p.defaultThreshold}
                      onChange={(e) => updateThreshold(p.id, Number(e.target.value))}
                    />
                    <span className="text-xs text-muted-foreground">%</span>
                  </div>
                </div>
              ))}
              {config.enabledPatterns.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-4">Enable detection patterns to configure thresholds.</p>
              )}
            </div>
          </TabsContent>

          {/* Enforcement Tab */}
          <TabsContent value="enforcement" className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Primary Action</Label>
              <Select value={config.responseAction} onValueChange={(v) => update("responseAction", v)}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="block">Block (403 Forbidden)</SelectItem>
                  <SelectItem value="log-alert">Log & Alert</SelectItem>
                  <SelectItem value="throttle">Throttle</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {config.responseAction === "block" && (
              <div className="space-y-3 rounded-md border border-border p-3">
                <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Block Options</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-foreground">Block with Logging</span>
                  <Switch checked={config.blockWithLogging} onCheckedChange={(v) => update("blockWithLogging", v)} className="scale-75" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-foreground">Block with Alerting</span>
                  <Switch checked={config.blockWithAlerting} onCheckedChange={(v) => update("blockWithAlerting", v)} className="scale-75" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-foreground">Include Request ID in Response</span>
                  <Switch checked={config.includeRequestId} onCheckedChange={(v) => update("includeRequestId", v)} className="scale-75" />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Error Message</Label>
              <Input type="text" className="h-8 text-xs" value={config.errorMessage} onChange={(e) => update("errorMessage", e.target.value)} />
              <p className="text-[10px] text-muted-foreground">Generic message returned to clients. No attack details are disclosed.</p>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Max Blocking Latency (ms)</Label>
              <Input type="number" className="h-8 text-xs w-24" min={1} value={config.maxBlockLatencyMs} onChange={(e) => update("maxBlockLatencyMs", Number(e.target.value))} />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Alert Recipients (emails)</Label>
              <Input type="text" className="h-8 text-xs" placeholder="security@example.com" value={config.alertRecipients} onChange={(e) => update("alertRecipients", e.target.value)} />
            </div>
          </TabsContent>

          {/* Scope Tab */}
          <TabsContent value="scope" className="space-y-4 py-2">
            <div className="flex items-center justify-between rounded-md border border-border p-3">
              <div>
                <p className="text-xs font-medium text-foreground">Global IDS Enable</p>
                <p className="text-[10px] text-muted-foreground">Enable/disable at gateway level. Changes take effect immediately.</p>
              </div>
              <Switch checked={config.globalEnabled} onCheckedChange={(v) => update("globalEnabled", v)} className="scale-75" />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Applies To</Label>
              <Select value={config.appliesTo} onValueChange={(v) => update("appliesTo", v)}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="request">Request Only</SelectItem>
                  <SelectItem value="response">Response Only</SelectItem>
                  <SelectItem value="both">Both</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {activeServers.length > 0 && (
              <div className="space-y-2">
                <Label className="text-xs font-medium">Per-Server Configuration</Label>
                <p className="text-[10px] text-muted-foreground">Override detection settings for individual MCP servers.</p>
                <div className="space-y-2">
                  {activeServers.map((server) => {
                    const override = config.perServerOverrides[server.id] || { enabled: true, patterns: IDS_PATTERN_TYPES.map(p => p.id), thresholds: {} };
                    return (
                      <div key={server.id} className="rounded-md border border-border p-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium text-foreground">{server.name}</span>
                          <Switch checked={override.enabled} onCheckedChange={(v) => updateServerOverride(server.id, "enabled", v)} className="scale-75" />
                        </div>
                        {override.enabled && (
                          <div className="flex flex-wrap gap-2 ml-1">
                            {IDS_PATTERN_TYPES.map((p) => (
                              <label key={p.id} className="flex items-center gap-1 text-[10px] cursor-pointer">
                                <Checkbox checked={override.patterns.includes(p.id)} onCheckedChange={() => toggleServerPattern(server.id, p.id)} />
                                {p.label}
                              </label>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </TabsContent>

          {/* Whitelisting Tab */}
          <TabsContent value="whitelisting" className="space-y-4 py-2">
            <p className="text-[10px] text-muted-foreground">Define safe patterns per tool to reduce false positives. Regex-based whitelist patterns bypass detection for known-safe invocations.</p>
            <div className="space-y-2">
              {config.whitelistPatterns.map((entry, idx) => (
                <div key={idx} className="flex items-start gap-2 rounded-md border border-border p-2">
                  <div className="flex-1 space-y-1.5">
                    <Input className="h-7 text-xs" placeholder="Tool name" value={entry.tool} onChange={(e) => updateWhitelistEntry(idx, "tool", e.target.value)} />
                    <Input className="h-7 text-xs font-mono" placeholder="Regex pattern" value={entry.pattern} onChange={(e) => updateWhitelistEntry(idx, "pattern", e.target.value)} />
                    <Input className="h-7 text-xs" placeholder="Description" value={entry.description} onChange={(e) => updateWhitelistEntry(idx, "description", e.target.value)} />
                  </div>
                  <button onClick={() => removeWhitelistEntry(idx)} className="text-muted-foreground hover:text-destructive mt-1"><X size={14} /></button>
                </div>
              ))}
              <Button variant="outline" size="sm" className="h-7 text-xs" onClick={addWhitelistEntry}>
                <Plus size={12} className="mr-1" /> Add Whitelist Entry
              </Button>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button size="sm" onClick={onSave}>
            {isEdit ? "Save Changes" : "Add Policy"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// --- Component ---

interface SecurityPoliciesCardProps {
  policies: SecurityPolicy[];
  onPoliciesChange: (policies: SecurityPolicy[]) => void;
  mcpServers?: MCPServer[];
  projectId?: string;
  tools?: NativeTool[];
}

const SecurityPoliciesCard = ({ policies, onPoliciesChange, mcpServers = [], projectId, tools: projectTools }: SecurityPoliciesCardProps) => {
  const activeTools = projectTools || nativeTools;
  const save = (p: SecurityPolicy[]) => savePolicies(p, projectId);
  const [addOpen, setAddOpen] = useState(false);
  const [configDialogOpen, setConfigDialogOpen] = useState(false);
  const [configTemplate, setConfigTemplate] = useState<typeof securityPolicyRepository[0] | null>(null);
  const [configEditPolicy, setConfigEditPolicy] = useState<SecurityPolicy | null>(null);
  const [configValues, setConfigValues] = useState<Record<string, any>>({});
  const [policyName, setPolicyName] = useState("");

  // Tools Filter state
  const [toolsFilterOpen, setToolsFilterOpen] = useState(false);
  const [toolsFilterServerId, setToolsFilterServerId] = useState("");
  const [toolsFilterIncluded, setToolsFilterIncluded] = useState<Set<string>>(new Set());
  const [toolsFilterEditPolicy, setToolsFilterEditPolicy] = useState<SecurityPolicy | null>(null);

  // PII Detection state
  const [piiConfigOpen, setPiiConfigOpen] = useState(false);
  const [piiConfigValues, setPiiConfigValues] = useState<PIIConfig>(getDefaultPIIConfig());
  const [piiEditPolicy, setPiiEditPolicy] = useState<SecurityPolicy | null>(null);

  // Intrusion Detection state
  const [idsConfigOpen, setIdsConfigOpen] = useState(false);
  const [idsConfigValues, setIdsConfigValues] = useState<IDSConfig>(getDefaultIDSConfig());
  const [idsEditPolicy, setIdsEditPolicy] = useState<SecurityPolicy | null>(null);

  const usedTemplateIds = new Set(policies.map((p) => p.templateId));
  // Tools Filter (t9) can be added multiple times (one per server), so don't exclude it
  const availableTemplates = securityPolicyRepository.filter((t) => t.templateId === "t9" || !usedTemplateIds.has(t.templateId));

  const currentTemplateId = configEditPolicy?.templateId ?? configTemplate?.templateId ?? "";
  const schema = policyConfigSchemas[currentTemplateId] ?? [];
  const hasConfig = schema.length > 0;
  const dialogTitle = configEditPolicy ? `Edit: ${configEditPolicy.name}` : `Configure: ${configTemplate?.name ?? ""}`;

  const activeServers = mcpServers.filter((s) => s.status === "Active");

  const selectedServer = toolsFilterServerId === "native-tools" ? null : mcpServers.find((s) => s.id === toolsFilterServerId);
  const serverTools: MCPServerTool[] = toolsFilterServerId === "native-tools"
    ? nativeTools.map((t) => ({ id: t.id, name: t.name, description: "" }))
    : selectedServer?.allTools ?? [];

  // Add flow
  const handleAddFromRepo = (template: typeof securityPolicyRepository[0]) => {
    if (template.templateId === "t9") {
      setToolsFilterEditPolicy(null);
      setToolsFilterServerId("");
      setToolsFilterIncluded(new Set());
      setPolicyName(`Tools Filter`);
      setAddOpen(false);
      setToolsFilterOpen(true);
      return;
    }
    if (template.templateId === "t1") {
      setPiiEditPolicy(null);
      setPiiConfigValues(getDefaultPIIConfig());
      setPolicyName(template.name);
      setAddOpen(false);
      setPiiConfigOpen(true);
      return;
    }
    if (template.templateId === "t4") {
      setIdsEditPolicy(null);
      setIdsConfigValues(getDefaultIDSConfig());
      setPolicyName(template.name);
      setAddOpen(false);
      setIdsConfigOpen(true);
      return;
    }
    const templateSchema = policyConfigSchemas[template.templateId];
    if (!templateSchema || templateSchema.length === 0) {
      const newPolicy: SecurityPolicy = {
        id: `sp-${Date.now()}`,
        name: template.name,
        description: template.description,
        icon: template.icon,
        active: true,
        templateId: template.templateId,
        config: {},
      };
      const updated = [...policies, newPolicy];
      onPoliciesChange(updated);
      save(updated);
      if (availableTemplates.length <= 1) setAddOpen(false);
      return;
    }
    setConfigTemplate(template);
    setConfigEditPolicy(null);
    setConfigValues(getDefaultConfig(template.templateId));
    setPolicyName(template.name);
    setAddOpen(false);
    setConfigDialogOpen(true);
  };

  // Edit flow
  const handleEditPolicy = (policy: SecurityPolicy) => {
    setPolicyName(policy.name);
    if (policy.templateId === "t9") {
      setToolsFilterEditPolicy(policy);
      setToolsFilterServerId(policy.config?.serverId || "");
      setToolsFilterIncluded(new Set(policy.config?.includedTools || []));
      setToolsFilterOpen(true);
      return;
    }
    if (policy.templateId === "t1") {
      setPiiEditPolicy(policy);
      setPiiConfigValues({ ...getDefaultPIIConfig(), ...policy.config });
      setPiiConfigOpen(true);
      return;
    }
    if (policy.templateId === "t4") {
      setIdsEditPolicy(policy);
      setIdsConfigValues({ ...getDefaultIDSConfig(), ...policy.config } as IDSConfig);
      setIdsConfigOpen(true);
      return;
    }
    const templateSchema = policyConfigSchemas[policy.templateId];
    if (!templateSchema || templateSchema.length === 0) return;
    setConfigEditPolicy(policy);
    setConfigTemplate(null);
    setConfigValues({ ...getDefaultConfig(policy.templateId), ...policy.config });
    setConfigDialogOpen(true);
  };

  // Save config (add or edit) for standard policies
  const handleConfigSave = () => {
    const finalName = policyName.trim() || configTemplate?.name || configEditPolicy?.name || "";
    if (configEditPolicy) {
      const updated = policies.map((p) =>
        p.id === configEditPolicy.id ? { ...p, name: finalName, config: { ...configValues } } : p
      );
      onPoliciesChange(updated);
      save(updated);
    } else if (configTemplate) {
      const newPolicy: SecurityPolicy = {
        id: `sp-${Date.now()}`,
        name: finalName,
        description: configTemplate.description,
        icon: configTemplate.icon,
        active: true,
        templateId: configTemplate.templateId,
        config: { ...configValues },
      };
      const updated = [...policies, newPolicy];
      onPoliciesChange(updated);
      save(updated);
    }
    setConfigDialogOpen(false);
    setConfigTemplate(null);
    setConfigEditPolicy(null);
    setConfigValues({});
  };

  // Save PII config
  const handlePiiSave = () => {
    const configObj = { ...piiConfigValues } as Record<string, any>;
    const finalName = policyName.trim() || "PII Detection";
    if (piiEditPolicy) {
      const updated = policies.map((p) =>
        p.id === piiEditPolicy.id ? { ...p, name: finalName, config: configObj } : p
      );
      onPoliciesChange(updated);
      save(updated);
    } else {
      const template = securityPolicyRepository.find((t) => t.templateId === "t1")!;
      const newPolicy: SecurityPolicy = {
        id: `sp-${Date.now()}`,
        name: finalName,
        description: template.description,
        icon: template.icon,
        active: true,
        templateId: "t1",
        config: configObj,
      };
      const updated = [...policies, newPolicy];
      onPoliciesChange(updated);
      save(updated);
    }
    setPiiConfigOpen(false);
    setPiiEditPolicy(null);
  };

  // Save IDS config
  const handleIdsSave = () => {
    const configObj = { ...idsConfigValues } as Record<string, any>;
    const finalName = policyName.trim() || "Intrusion Detection";
    if (idsEditPolicy) {
      const updated = policies.map((p) =>
        p.id === idsEditPolicy.id ? { ...p, name: finalName, config: configObj } : p
      );
      onPoliciesChange(updated);
      save(updated);
    } else {
      const template = securityPolicyRepository.find((t) => t.templateId === "t4")!;
      const newPolicy: SecurityPolicy = {
        id: `sp-${Date.now()}`,
        name: finalName,
        description: template.description,
        icon: template.icon,
        active: true,
        templateId: "t4",
        config: configObj,
      };
      const updated = [...policies, newPolicy];
      onPoliciesChange(updated);
      save(updated);
    }
    setIdsConfigOpen(false);
    setIdsEditPolicy(null);
  };

  // Save Tools Filter
  const handleToolsFilterSave = () => {
    if (!toolsFilterServerId) return;
    const isNative = toolsFilterServerId === "native-tools";
    if (!isNative && !selectedServer) return;
    const displayName = isNative ? "Native Tools" : selectedServer!.name;
    const config = {
      serverId: toolsFilterServerId,
      serverName: displayName,
      includedTools: Array.from(toolsFilterIncluded),
    };
    const finalName = policyName.trim() || `Tools Filter: ${displayName}`;
    const desc = `Includes ${toolsFilterIncluded.size} tool${toolsFilterIncluded.size !== 1 ? "s" : ""} from ${displayName}`;
    if (toolsFilterEditPolicy) {
      const updated = policies.map((p) =>
        p.id === toolsFilterEditPolicy.id
          ? { ...p, name: finalName, description: desc, config }
          : p
      );
      onPoliciesChange(updated);
      save(updated);
    } else {
      const newPolicy: SecurityPolicy = {
        id: `sp-${Date.now()}`,
        name: finalName,
        description: desc,
        icon: "Filter",
        active: true,
        templateId: "t9",
        config,
      };
      const updated = [...policies, newPolicy];
      onPoliciesChange(updated);
      save(updated);
    }
    setToolsFilterOpen(false);
    setToolsFilterEditPolicy(null);
  };

  const toggleIncludedTool = (toolId: string) => {
    setToolsFilterIncluded((prev) => {
      const next = new Set(prev);
      if (next.has(toolId)) next.delete(toolId);
      else next.add(toolId);
      return next;
    });
  };

  const updateConfigValue = (key: string, value: any) => {
    setConfigValues((prev) => ({ ...prev, [key]: value }));
  };

  const toggleMultiSelect = (key: string, optionValue: string) => {
    setConfigValues((prev) => {
      const arr: string[] = Array.isArray(prev[key]) ? [...prev[key]] : [];
      const idx = arr.indexOf(optionValue);
      if (idx >= 0) arr.splice(idx, 1);
      else arr.push(optionValue);
      return { ...prev, [key]: arr };
    });
  };

  const toggleActive = (id: string) => {
    const updated = policies.map((p) => p.id === id ? { ...p, active: !p.active } : p);
    onPoliciesChange(updated);
    save(updated);
  };

  const handleDelete = (id: string) => {
    const updated = policies.filter((p) => p.id !== id);
    onPoliciesChange(updated);
    save(updated);
  };

  return (
    <div className="rounded-lg border border-border bg-card shadow-sm">
      <div className="flex items-center justify-between border-b border-border px-5 py-3">
        <h3 className="text-sm font-semibold text-foreground">Security Policies</h3>
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <button className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground">
              <Plus size={16} />
            </button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add Security Policy</DialogTitle>
              <DialogDescription>Select a policy from the repository to add.</DialogDescription>
            </DialogHeader>
            <div className="mt-2 divide-y divide-border rounded-md border border-border">
              {availableTemplates.length === 0 ? (
                <p className="px-4 py-3 text-sm text-muted-foreground text-center">All policies have been added.</p>
              ) : (
                availableTemplates.map((t) => {
                  const Icon = iconMap[t.icon] || ShieldCheck;
                  return (
                    <div key={t.templateId} className="flex items-center gap-3 px-4 py-2.5">
                      <div className="flex h-7 w-7 items-center justify-center rounded bg-muted text-muted-foreground">
                        <Icon size={14} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-foreground">{t.name}</p>
                        <p className="text-xs text-muted-foreground">{t.description}</p>
                      </div>
                      <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => handleAddFromRepo(t)}>
                        Add
                      </Button>
                    </div>
                  );
                })
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Config dialog (add / edit) for standard policies */}
      <Dialog open={configDialogOpen} onOpenChange={(open) => {
        if (!open) {
          setConfigDialogOpen(false);
          setConfigTemplate(null);
          setConfigEditPolicy(null);
          setConfigValues({});
        }
      }}>
        <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{dialogTitle}</DialogTitle>
            <DialogDescription>
              {configEditPolicy ? "Modify the configuration for this policy." : "Configure the policy before adding."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-1.5">
              <Label className="text-xs font-medium">Policy Name</Label>
              <Input className="h-8 text-xs" value={policyName} onChange={(e) => setPolicyName(e.target.value)} placeholder="Policy name" />
            </div>
          {hasConfig && (
            <>
              {schema.map((field) => {
                // Conditional visibility for enforcement-related fields
                if (!isEnforcementFieldVisible(currentTemplateId, field.key, configValues)) return null;

                // Dynamic options for targetServerId
                if (field.key === "targetServerId") {
                  const serverOptions = [
                    { value: "native-tools", label: "Native Tools" },
                    ...activeServers.map((s) => ({ value: s.id, label: s.name })),
                  ];
                  return (
                    <div key={field.key} className="grid gap-1.5">
                      <Label className="text-xs font-medium">{field.label}</Label>
                      <Select value={String(configValues[field.key] ?? "")} onValueChange={(v) => { updateConfigValue(field.key, v); updateConfigValue("targetToolId", ""); }}>
                        <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Select a server" /></SelectTrigger>
                        <SelectContent>
                          {serverOptions.map((o) => (
                            <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  );
                }

                // Dynamic options for targetToolId
                if (field.key === "targetToolId") {
                  const selectedServerId = configValues.targetServerId;
                  const toolOptions = selectedServerId === "native-tools"
                    ? nativeTools.map((t) => ({ value: t.id, label: t.name }))
                    : (mcpServers.find((s) => s.id === selectedServerId)?.allTools ?? []).map((t) => ({ value: t.id, label: t.name }));
                  return (
                    <div key={field.key} className="grid gap-1.5">
                      <Label className="text-xs font-medium">{field.label}</Label>
                      <Select value={String(configValues[field.key] ?? "")} onValueChange={(v) => updateConfigValue(field.key, v)}>
                        <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Select a tool" /></SelectTrigger>
                        <SelectContent>
                          {toolOptions.map((o) => (
                            <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  );
                }

                return (
                <div key={field.key} className="grid gap-1.5">
                  <Label className="text-xs font-medium">{field.label}</Label>

                  {field.type === "select" && (
                    <Select value={String(configValues[field.key] ?? field.default)} onValueChange={(v) => updateConfigValue(field.key, v)}>
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {field.options?.map((o) => (
                          <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}

                  {field.type === "number" && (
                    <Input
                      type="number"
                      className="h-8 text-xs"
                      value={configValues[field.key] ?? field.default}
                      onChange={(e) => updateConfigValue(field.key, Number(e.target.value))}
                    />
                  )}

                  {field.type === "text" && (
                    <Input
                      type="text"
                      className="h-8 text-xs"
                      placeholder={field.label}
                      value={configValues[field.key] ?? field.default}
                      onChange={(e) => updateConfigValue(field.key, e.target.value)}
                    />
                  )}

                  {field.type === "toggle" && (
                    <Switch
                      checked={!!configValues[field.key]}
                      onCheckedChange={(v) => updateConfigValue(field.key, v)}
                      className="scale-75 origin-left"
                    />
                  )}

                  {field.type === "multi-select" && (
                    <div className="flex flex-wrap gap-3">
                      {field.options?.map((o) => {
                        const checked = Array.isArray(configValues[field.key]) && configValues[field.key].includes(o.value);
                        return (
                          <label key={o.value} className="flex items-center gap-1.5 text-xs cursor-pointer">
                            <Checkbox checked={checked} onCheckedChange={() => toggleMultiSelect(field.key, o.value)} />
                            {o.label}
                          </label>
                        );
                      })}
                    </div>
                  )}
                </div>
                );
              })}
            </>
          )}
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setConfigDialogOpen(false)}>Cancel</Button>
            <Button size="sm" onClick={handleConfigSave}>
              {configEditPolicy ? "Save Changes" : "Add Policy"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Intrusion Detection dialog */}
      <IntrusionDetectionConfigDialog
        open={idsConfigOpen}
        onOpenChange={(open) => {
          if (!open) {
            setIdsConfigOpen(false);
            setIdsEditPolicy(null);
          }
        }}
        config={idsConfigValues}
        onConfigChange={setIdsConfigValues}
        onSave={handleIdsSave}
        isEdit={!!idsEditPolicy}
        mcpServers={mcpServers}
        policyName={policyName}
        onPolicyNameChange={setPolicyName}
      />

      {/* PII Detection dialog */}
      <PIIConfigDialog
        open={piiConfigOpen}
        onOpenChange={(open) => {
          if (!open) {
            setPiiConfigOpen(false);
            setPiiEditPolicy(null);
          }
        }}
        config={piiConfigValues}
        onConfigChange={setPiiConfigValues}
        onSave={handlePiiSave}
        isEdit={!!piiEditPolicy}
        policyName={policyName}
        onPolicyNameChange={setPolicyName}
      />

      {/* Tools Filter dialog */}
      <Dialog open={toolsFilterOpen} onOpenChange={(open) => {
        if (!open) {
          setToolsFilterOpen(false);
          setToolsFilterEditPolicy(null);
          setToolsFilterServerId("");
          setToolsFilterIncluded(new Set());
        }
      }}>
        <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{toolsFilterEditPolicy ? "Edit Tools Filter" : "Add Tools Filter"}</DialogTitle>
            <DialogDescription>Select a tool source and choose tools to include.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Policy Name</Label>
              <Input className="h-8 text-xs" value={policyName} onChange={(e) => setPolicyName(e.target.value)} placeholder="Tools Filter" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Tool Source</Label>
              <Select value={toolsFilterServerId} onValueChange={(v) => { setToolsFilterServerId(v); setToolsFilterIncluded(new Set()); }}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="Select a source" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="native-tools">Native Tools</SelectItem>
                  {activeServers.map((s) => (
                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {toolsFilterServerId && serverTools.length > 0 && (
              <div className="space-y-1.5">
                <label className="flex items-center gap-2 cursor-pointer">
                  <Checkbox
                    checked={toolsFilterIncluded.size === serverTools.length}
                    ref={(el) => {
                      if (el) {
                        (el as unknown as HTMLButtonElement).dataset.state =
                          toolsFilterIncluded.size > 0 && toolsFilterIncluded.size < serverTools.length
                            ? "indeterminate"
                            : toolsFilterIncluded.size === serverTools.length
                              ? "checked"
                              : "unchecked";
                      }
                    }}
                    onCheckedChange={() => {
                      if (toolsFilterIncluded.size < serverTools.length) {
                        setToolsFilterIncluded(new Set(serverTools.map(t => t.id)));
                      } else {
                        setToolsFilterIncluded(new Set());
                      }
                    }}
                  />
                  <span className="text-xs font-medium">Include Tools ({toolsFilterIncluded.size} of {serverTools.length} included)</span>
                </label>
                <div className="space-y-1 rounded-md border border-border p-3 max-h-48 overflow-y-auto">
                  {serverTools.map((tool) => (
                    <label key={tool.id} className="flex items-start gap-2 py-1.5 cursor-pointer hover:bg-muted/50 rounded px-1 -mx-1">
                      <Checkbox
                        checked={toolsFilterIncluded.has(tool.id)}
                        onCheckedChange={() => toggleIncludedTool(tool.id)}
                        className="mt-0.5"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-foreground leading-tight">{tool.name}</p>
                        <p className="text-xs text-muted-foreground">{tool.description}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setToolsFilterOpen(false)}>Cancel</Button>
            <Button size="sm" onClick={handleToolsFilterSave} disabled={!toolsFilterServerId || toolsFilterIncluded.size === 0 || (toolsFilterServerId !== "native-tools" && !selectedServer)}>
              {toolsFilterEditPolicy ? "Save Changes" : "Add Policy"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="divide-y divide-border">
        {policies.length === 0 && (
          <p className="px-5 py-4 text-sm text-muted-foreground">No security policies configured. Click + to add from the repository.</p>
        )}
        {policies.map((policy) => {
          const Icon = iconMap[policy.icon] || ShieldCheck;
          const summary = getConfigSummary(policy.templateId, policy.config, mcpServers);
          const hasEditableConfig = policy.templateId === "t9" || policy.templateId === "t1" || policy.templateId === "t4" || (policyConfigSchemas[policy.templateId]?.length ?? 0) > 0;
          return (
            <div key={policy.id} className="flex items-center gap-3 px-5 py-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded bg-muted text-muted-foreground">
                <Icon size={14} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-foreground">{policy.name}</p>
                <p className="text-xs text-muted-foreground">{policy.description}</p>
                {summary && (
                  <p className="text-[10px] text-muted-foreground/70 mt-0.5">{summary}</p>
                )}
              </div>
              <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${policy.active ? "bg-redwood-green-light text-redwood-green" : "bg-redwood-olive-light text-redwood-olive"}`}>
                {policy.active ? "Active" : "Configured"}
              </span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="ml-1 text-muted-foreground hover:text-foreground">
                    <MoreHorizontal size={16} />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  {hasEditableConfig && (
                    <>
                      <DropdownMenuItem onClick={() => handleEditPolicy(policy)}>
                        <Pencil size={14} className="mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}
                  <DropdownMenuItem onClick={() => toggleActive(policy.id)}>
                    {policy.active ? "Deactivate" : "Activate"}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => handleDelete(policy.id)} className="text-destructive focus:text-destructive">
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export { loadPolicies as loadSecurityPolicies, savePolicies as saveSecurityPolicies };
export default SecurityPoliciesCard;
