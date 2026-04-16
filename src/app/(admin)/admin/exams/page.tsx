"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
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
import { EXAM_CATEGORIES } from "@/lib/constants";
import { formatDate } from "@/lib/formatters";
import {
  Search,
  BookOpen,
  Plus,
  Pencil,
  Trash2,
  Check,
  X,
} from "lucide-react";
import { toast } from "sonner";

interface ExamRow {
  id: string;
  name: string;
  slug: string;
  category: string;
  description: string;
  registration_start: string;
  registration_end: string;
  exam_date: string | null;
  website_url: string;
  eligibility: string | null;
  application_fee: string | null;
  status: string;
  is_verified: boolean;
  source: string;
  created_at: string;
}

interface ExamFormData {
  name: string;
  slug: string;
  category: string;
  description: string;
  registration_start: string;
  registration_end: string;
  exam_date: string;
  website_url: string;
  eligibility: string;
  application_fee: string;
}

const emptyForm: ExamFormData = {
  name: "",
  slug: "",
  category: "",
  description: "",
  registration_start: "",
  registration_end: "",
  exam_date: "",
  website_url: "",
  eligibility: "",
  application_fee: "",
};

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

export default function AdminExamsPage() {
  const [approvedExams, setApprovedExams] = useState<ExamRow[]>([]);
  const [pendingExams, setPendingExams] = useState<ExamRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ExamFormData>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [actioningId, setActioningId] = useState<string | null>(null);

  const fetchExams = useCallback(async () => {
    const supabase = createClient();
    setLoading(true);
    try {
      let approvedQuery = supabase
        .from("exams")
        .select("*")
        .eq("status", "approved")
        .order("created_at", { ascending: false });

      let pendingQuery = supabase
        .from("exams")
        .select("*")
        .eq("status", "pending")
        .order("created_at", { ascending: false });

      if (search.trim()) {
        const filter = `name.ilike.%${search.trim()}%,category.ilike.%${search.trim()}%`;
        approvedQuery = approvedQuery.or(filter);
        pendingQuery = pendingQuery.or(filter);
      }

      const [approvedRes, pendingRes] = await Promise.all([
        approvedQuery.limit(100),
        pendingQuery.limit(100),
      ]);

      if (approvedRes.error) throw approvedRes.error;
      if (pendingRes.error) throw pendingRes.error;

      setApprovedExams(approvedRes.data ?? []);
      setPendingExams(pendingRes.data ?? []);
    } catch {
      toast.error("Failed to load exams");
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    const timeout = setTimeout(fetchExams, 300);
    return () => clearTimeout(timeout);
  }, [fetchExams]);

  function openCreateDialog() {
    setEditingId(null);
    setForm(emptyForm);
    setDialogOpen(true);
  }

  function openEditDialog(exam: ExamRow) {
    setEditingId(exam.id);
    setForm({
      name: exam.name,
      slug: exam.slug,
      category: exam.category,
      description: exam.description,
      registration_start: exam.registration_start?.slice(0, 10) ?? "",
      registration_end: exam.registration_end?.slice(0, 10) ?? "",
      exam_date: exam.exam_date?.slice(0, 10) ?? "",
      website_url: exam.website_url,
      eligibility: exam.eligibility || "",
      application_fee: exam.application_fee || "",
    });
    setDialogOpen(true);
  }

  async function handleSave() {
    if (!form.name.trim() || !form.category || !form.description.trim()) {
      toast.error("Name, category, and description are required");
      return;
    }
    if (!form.registration_start || !form.registration_end) {
      toast.error("Registration dates are required");
      return;
    }
    if (!form.website_url.trim()) {
      toast.error("Website URL is required");
      return;
    }

    setSaving(true);
    const supabase = createClient();
    try {
      const payload = {
        name: form.name.trim(),
        slug: form.slug.trim() || generateSlug(form.name),
        category: form.category,
        description: form.description.trim(),
        registration_start: form.registration_start,
        registration_end: form.registration_end,
        exam_date: form.exam_date || null,
        website_url: form.website_url.trim(),
        eligibility: form.eligibility.trim() || null,
        application_fee: form.application_fee.trim() || null,
      };

      if (editingId) {
        const { error } = await supabase
          .from("exams")
          .update(payload)
          .eq("id", editingId);
        if (error) throw error;
        toast.success("Exam updated");
      } else {
        const { error } = await supabase.from("exams").insert({
          ...payload,
          is_verified: true,
          status: "approved",
          source: "manual",
          result_date: null,
          answer_key_date: null,
          syllabus_url: null,
          agent_id: null,
          created_by: null,
          tags: null,
          meta: null,
        });
        if (error) throw error;
        toast.success("Exam created");
      }

      setDialogOpen(false);
      setForm(emptyForm);
      setEditingId(null);
      fetchExams();
    } catch {
      toast.error(editingId ? "Failed to update exam" : "Failed to create exam");
    } finally {
      setSaving(false);
    }
  }

  async function handleApprove(id: string) {
    setActioningId(id);
    const supabase = createClient();
    try {
      const { error } = await supabase
        .from("exams")
        .update({ status: "approved", is_verified: true })
        .eq("id", id);
      if (error) throw error;

      const exam = pendingExams.find((e) => e.id === id);
      if (exam) {
        setPendingExams((prev) => prev.filter((e) => e.id !== id));
        setApprovedExams((prev) => [
          { ...exam, status: "approved", is_verified: true },
          ...prev,
        ]);
      }
      toast.success("Exam approved");
    } catch {
      toast.error("Failed to approve exam");
    } finally {
      setActioningId(null);
    }
  }

  async function handleReject(id: string) {
    setActioningId(id);
    const supabase = createClient();
    try {
      const { error } = await supabase
        .from("exams")
        .update({ status: "rejected" })
        .eq("id", id);
      if (error) throw error;

      setPendingExams((prev) => prev.filter((e) => e.id !== id));
      toast.success("Exam rejected");
    } catch {
      toast.error("Failed to reject exam");
    } finally {
      setActioningId(null);
    }
  }

  async function handleDelete(id: string) {
    setActioningId(id);
    const supabase = createClient();
    try {
      const { error } = await supabase.from("exams").delete().eq("id", id);
      if (error) throw error;
      setApprovedExams((prev) => prev.filter((e) => e.id !== id));
      setPendingExams((prev) => prev.filter((e) => e.id !== id));
      toast.success("Exam deleted");
    } catch {
      toast.error("Failed to delete exam");
    } finally {
      setActioningId(null);
    }
  }

  function updateForm(field: keyof ExamFormData, value: string) {
    setForm((prev) => {
      const updated = { ...prev, [field]: value };
      if (field === "name" && !editingId) {
        updated.slug = generateSlug(value);
      }
      return updated;
    });
  }

  function renderExamList(exams: ExamRow[], showApproveReject: boolean) {
    if (loading) {
      return (
        <div className="divide-y divide-border">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 p-4">
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-3 w-32" />
              </div>
              <Skeleton className="h-8 w-20" />
            </div>
          ))}
        </div>
      );
    }

    if (exams.length === 0) {
      return (
        <EmptyState
          icon={<BookOpen />}
          title={
            showApproveReject ? "No pending exams" : "No approved exams found"
          }
          description={
            showApproveReject
              ? "All exams have been reviewed"
              : search
                ? "Try adjusting your search query"
                : "Add your first exam to get started"
          }
        />
      );
    }

    return (
      <div className="divide-y divide-border">
        {exams.map((exam) => (
          <div
            key={exam.id}
            className="flex flex-col md:flex-row md:items-center gap-3 p-4"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium text-sm truncate">
                  {exam.name}
                </span>
                <Badge variant="secondary" className="text-xs shrink-0">
                  {exam.category}
                </Badge>
                {exam.source !== "manual" && (
                  <Badge variant="outline" className="text-xs shrink-0">
                    {exam.source}
                  </Badge>
                )}
              </div>
              <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                <span>
                  Reg: {formatDate(exam.registration_start)} -{" "}
                  {formatDate(exam.registration_end)}
                </span>
                {exam.exam_date && (
                  <span>Exam: {formatDate(exam.exam_date)}</span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              {showApproveReject ? (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleApprove(exam.id)}
                    disabled={actioningId === exam.id}
                    className="text-green-600 hover:text-green-700"
                  >
                    <Check className="h-4 w-4 mr-1" />
                    Approve
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleReject(exam.id)}
                    disabled={actioningId === exam.id}
                    className="text-destructive hover:text-destructive"
                  >
                    <X className="h-4 w-4 mr-1" />
                    Reject
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => openEditDialog(exam)}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={() => handleDelete(exam.id)}
                    disabled={actioningId === exam.id}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Exam Management"
        description="Approve, edit, and manage exams"
      >
        <Button onClick={openCreateDialog}>
          <Plus className="h-4 w-4 mr-2" />
          Add Exam
        </Button>
      </PageHeader>

      {/* Search */}
      <div className="relative mb-6 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by name or category..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Tabs */}
      <Tabs defaultValue="approved">
        <TabsList>
          <TabsTrigger value="approved">
            Approved ({approvedExams.length})
          </TabsTrigger>
          <TabsTrigger value="pending">
            Pending ({pendingExams.length})
          </TabsTrigger>
        </TabsList>
        <TabsContent value="approved">
          <Card>
            <CardContent className="p-0">
              {renderExamList(approvedExams, false)}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="pending">
          <Card>
            <CardContent className="p-0">
              {renderExamList(pendingExams, true)}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingId ? "Edit Exam" : "Add Exam"}
            </DialogTitle>
            <DialogDescription>
              {editingId
                ? "Update the exam details below."
                : "Fill in the details to add a new exam. It will be automatically approved."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>
                  Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  value={form.name}
                  onChange={(e) => updateForm("name", e.target.value)}
                  placeholder="e.g. UPSC CSE 2025"
                />
              </div>
              <div className="space-y-2">
                <Label>Slug</Label>
                <Input
                  value={form.slug}
                  onChange={(e) => updateForm("slug", e.target.value)}
                  placeholder="Auto-generated from name"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>
                  Category <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={form.category}
                  onValueChange={(val) => updateForm("category", val)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {EXAM_CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>
                  Website URL <span className="text-destructive">*</span>
                </Label>
                <Input
                  value={form.website_url}
                  onChange={(e) => updateForm("website_url", e.target.value)}
                  placeholder="https://..."
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>
                Description <span className="text-destructive">*</span>
              </Label>
              <Textarea
                value={form.description}
                onChange={(e) => updateForm("description", e.target.value)}
                placeholder="Brief description of the exam..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>
                  Registration Start <span className="text-destructive">*</span>
                </Label>
                <Input
                  type="date"
                  value={form.registration_start}
                  onChange={(e) =>
                    updateForm("registration_start", e.target.value)
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>
                  Registration End <span className="text-destructive">*</span>
                </Label>
                <Input
                  type="date"
                  value={form.registration_end}
                  onChange={(e) =>
                    updateForm("registration_end", e.target.value)
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Exam Date</Label>
                <Input
                  type="date"
                  value={form.exam_date}
                  onChange={(e) => updateForm("exam_date", e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Eligibility</Label>
                <Input
                  value={form.eligibility}
                  onChange={(e) => updateForm("eligibility", e.target.value)}
                  placeholder="e.g. Graduate with 60%"
                />
              </div>
              <div className="space-y-2">
                <Label>Application Fee</Label>
                <Input
                  value={form.application_fee}
                  onChange={(e) =>
                    updateForm("application_fee", e.target.value)
                  }
                  placeholder="e.g. Rs. 500"
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving
                ? "Saving..."
                : editingId
                  ? "Update"
                  : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
