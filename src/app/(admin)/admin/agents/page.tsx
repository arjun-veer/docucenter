"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/features/auth/store";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatDate, formatRelativeTime } from "@/lib/formatters";
import { Bot, Plus, Play, Pause, Eye, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import type { Json } from "@/lib/supabase/types";

interface AgentRow {
  id: string;
  name: string;
  description: string | null;
  source_type: string;
  source_config: Record<string, unknown>;
  schedule: string | null;
  status: string;
  last_run_at: string | null;
  last_run_result: string | null;
  exams_found: number;
  created_at: string;
}

interface AgentLogRow {
  id: string;
  agent_id: string;
  status: string;
  exams_found: number;
  exams_added: number;
  error_message: string | null;
  duration_ms: number | null;
  created_at: string;
}

interface AgentFormData {
  name: string;
  description: string;
  source_type: string;
  source_config: string;
  schedule: string;
}

const emptyForm: AgentFormData = {
  name: "",
  description: "",
  source_type: "web_scraper",
  source_config: "{}",
  schedule: "",
};

const SOURCE_TYPES = [
  { value: "web_scraper", label: "Web Scraper" },
  { value: "rss_feed", label: "RSS Feed" },
  { value: "api", label: "API" },
  { value: "manual", label: "Manual" },
];

const agentStatusVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  active: "default",
  paused: "secondary",
  error: "destructive",
  disabled: "outline",
};

export default function AdminAgentsPage() {
  const [agents, setAgents] = useState<AgentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<AgentFormData>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [actioningId, setActioningId] = useState<string | null>(null);
  const [logsDialogOpen, setLogsDialogOpen] = useState(false);
  const [selectedAgentName, setSelectedAgentName] = useState("");
  const [logs, setLogs] = useState<AgentLogRow[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const currentUser = useAuthStore((s) => s.user);

  const isSuperAdmin = currentUser?.role === "super_admin";

  const fetchAgents = useCallback(async () => {
    const supabase = createClient();
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("agents")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      setAgents((data as AgentRow[]) ?? []);
    } catch {
      toast.error("Failed to load agents");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAgents();
  }, [fetchAgents]);

  async function handleCreate() {
    if (!form.name.trim()) {
      toast.error("Agent name is required");
      return;
    }

    let parsedConfig: Json;
    try {
      parsedConfig = JSON.parse(form.source_config) as Json;
    } catch {
      toast.error("Source config must be valid JSON");
      return;
    }

    setSaving(true);
    const supabase = createClient();
    try {
      const { error } = await supabase.from("agents").insert({
        name: form.name.trim(),
        description: form.description.trim() || null,
        source_type: form.source_type,
        source_config: parsedConfig,
        schedule: form.schedule.trim() || null,
        created_by: currentUser?.id ?? null,
      });
      if (error) throw error;

      toast.success("Agent created");
      setDialogOpen(false);
      setForm(emptyForm);
      fetchAgents();
    } catch {
      toast.error("Failed to create agent");
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleStatus(agent: AgentRow) {
    const newStatus = agent.status === "active" ? "paused" : "active";
    setActioningId(agent.id);
    const supabase = createClient();
    try {
      const { error } = await supabase
        .from("agents")
        .update({ status: newStatus })
        .eq("id", agent.id);
      if (error) throw error;

      setAgents((prev) =>
        prev.map((a) =>
          a.id === agent.id ? { ...a, status: newStatus } : a
        )
      );
      toast.success(
        newStatus === "active" ? "Agent activated" : "Agent paused"
      );
    } catch {
      toast.error("Failed to update agent status");
    } finally {
      setActioningId(null);
    }
  }

  async function viewLogs(agent: AgentRow) {
    setSelectedAgentName(agent.name);
    setLogsDialogOpen(true);
    setLogsLoading(true);
    const supabase = createClient();
    try {
      const { data, error } = await supabase
        .from("agent_logs")
        .select("*")
        .eq("agent_id", agent.id)
        .order("created_at", { ascending: false })
        .limit(20);
      if (error) throw error;
      setLogs(data ?? []);
    } catch {
      toast.error("Failed to load agent logs");
    } finally {
      setLogsLoading(false);
    }
  }

  function updateForm(field: keyof AgentFormData, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  return (
    <div>
      <PageHeader
        title="Agent Management"
        description="Manage automated exam scraping agents"
      >
        {isSuperAdmin && (
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Agent
          </Button>
        )}
      </PageHeader>

      {/* Agent List */}
      <div className="space-y-4">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <Skeleton className="h-10 w-10 rounded" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-3 w-64" />
                  </div>
                  <Skeleton className="h-8 w-24" />
                </div>
              </CardContent>
            </Card>
          ))
        ) : agents.length === 0 ? (
          <Card>
            <CardContent className="p-0">
              <EmptyState
                icon={<Bot />}
                title="No agents configured"
                description="Create an agent to start automatically scraping exam data"
                action={
                  isSuperAdmin ? (
                    <Button onClick={() => setDialogOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Agent
                    </Button>
                  ) : undefined
                }
              />
            </CardContent>
          </Card>
        ) : (
          agents.map((agent) => (
            <Card key={agent.id}>
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row md:items-center gap-3">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                      <Bot className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="font-medium text-sm truncate">
                          {agent.name}
                        </span>
                        <Badge
                          variant={
                            agentStatusVariant[agent.status] ?? "outline"
                          }
                          className="text-xs"
                        >
                          {agent.status}
                        </Badge>
                      </div>
                      {agent.description && (
                        <p className="text-xs text-muted-foreground truncate">
                          {agent.description}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-3 mt-1 text-xs text-muted-foreground">
                        <span>Type: {agent.source_type}</span>
                        {agent.schedule && (
                          <span>Schedule: {agent.schedule}</span>
                        )}
                        <span>Exams found: {agent.exams_found}</span>
                        {agent.last_run_at && (
                          <span>
                            Last run: {formatRelativeTime(agent.last_run_at)}
                          </span>
                        )}
                        {agent.last_run_result && (
                          <span
                            className={
                              agent.last_run_result === "error"
                                ? "text-destructive"
                                : ""
                            }
                          >
                            Result: {agent.last_run_result}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => viewLogs(agent)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Logs
                    </Button>
                    {isSuperAdmin && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleStatus(agent)}
                        disabled={actioningId === agent.id}
                      >
                        {agent.status === "active" ? (
                          <>
                            <Pause className="h-4 w-4 mr-1" />
                            Pause
                          </>
                        ) : (
                          <>
                            <Play className="h-4 w-4 mr-1" />
                            Activate
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Create Agent Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Agent</DialogTitle>
            <DialogDescription>
              Configure a new automated agent for scraping exam data.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>
                Name <span className="text-destructive">*</span>
              </Label>
              <Input
                value={form.name}
                onChange={(e) => updateForm("name", e.target.value)}
                placeholder="e.g. UPSC Scraper"
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Input
                value={form.description}
                onChange={(e) => updateForm("description", e.target.value)}
                placeholder="Brief description of what this agent does"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Source Type</Label>
                <Select
                  value={form.source_type}
                  onValueChange={(val) => updateForm("source_type", val)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SOURCE_TYPES.map((st) => (
                      <SelectItem key={st.value} value={st.value}>
                        {st.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Schedule (cron)</Label>
                <Input
                  value={form.schedule}
                  onChange={(e) => updateForm("schedule", e.target.value)}
                  placeholder="e.g. 0 6 * * *"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Source Config (JSON)</Label>
              <Textarea
                value={form.source_config}
                onChange={(e) => updateForm("source_config", e.target.value)}
                placeholder='{"url": "https://...", "selector": "..."}'
                rows={4}
                className="font-mono text-sm"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={saving}>
              {saving ? "Creating..." : "Create Agent"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Agent Logs Dialog */}
      <Dialog open={logsDialogOpen} onOpenChange={setLogsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Agent Logs: {selectedAgentName}</DialogTitle>
            <DialogDescription>
              Recent execution history for this agent.
            </DialogDescription>
          </DialogHeader>

          {logsLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-8">
              <AlertCircle className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">
                No logs available for this agent
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className="border rounded-lg p-3 text-sm space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <Badge
                      variant={
                        log.status === "success"
                          ? "default"
                          : log.status === "error"
                            ? "destructive"
                            : "secondary"
                      }
                    >
                      {log.status}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(log.created_at)}
                    </span>
                  </div>
                  <div className="flex gap-4 text-xs text-muted-foreground">
                    <span>Found: {log.exams_found}</span>
                    <span>Added: {log.exams_added}</span>
                    {log.duration_ms && (
                      <span>Duration: {(log.duration_ms / 1000).toFixed(1)}s</span>
                    )}
                  </div>
                  {log.error_message && (
                    <p className="text-xs text-destructive mt-1">
                      {log.error_message}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
