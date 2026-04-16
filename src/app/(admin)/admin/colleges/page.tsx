"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
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
import { Search, Building2, Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface CollegeRow {
  id: string;
  name: string;
  code: string;
  city: string | null;
  state: string | null;
  university: string | null;
  website_url: string | null;
  student_count: number | null;
  created_at: string;
}

interface CollegeFormData {
  name: string;
  code: string;
  city: string;
  state: string;
  university: string;
  website_url: string;
}

const emptyForm: CollegeFormData = {
  name: "",
  code: "",
  city: "",
  state: "",
  university: "",
  website_url: "",
};

export default function AdminCollegesPage() {
  const [colleges, setColleges] = useState<CollegeRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<CollegeFormData>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchColleges = useCallback(async () => {
    const supabase = createClient();
    setLoading(true);
    try {
      let query = supabase
        .from("colleges")
        .select("id, name, code, city, state, university, website_url, student_count, created_at")
        .order("name");

      if (search.trim()) {
        query = query.or(
          `name.ilike.%${search.trim()}%,code.ilike.%${search.trim()}%,city.ilike.%${search.trim()}%`
        );
      }

      const { data, error } = await query.limit(100);
      if (error) throw error;
      setColleges(data ?? []);
    } catch {
      toast.error("Failed to load colleges");
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    const timeout = setTimeout(fetchColleges, 300);
    return () => clearTimeout(timeout);
  }, [fetchColleges]);

  function openCreateDialog() {
    setEditingId(null);
    setForm(emptyForm);
    setDialogOpen(true);
  }

  function openEditDialog(college: CollegeRow) {
    setEditingId(college.id);
    setForm({
      name: college.name,
      code: college.code,
      city: college.city || "",
      state: college.state || "",
      university: college.university || "",
      website_url: college.website_url || "",
    });
    setDialogOpen(true);
  }

  async function handleSave() {
    if (!form.name.trim() || !form.code.trim()) {
      toast.error("Name and code are required");
      return;
    }

    setSaving(true);
    const supabase = createClient();
    try {
      const payload = {
        name: form.name.trim(),
        code: form.code.trim().toUpperCase(),
        city: form.city.trim() || null,
        state: form.state.trim() || null,
        university: form.university.trim() || null,
        website_url: form.website_url.trim() || null,
        logo_url: null as string | null,
        student_count: null as number | null,
      };

      if (editingId) {
        const { error } = await supabase
          .from("colleges")
          .update(payload)
          .eq("id", editingId);
        if (error) throw error;
        toast.success("College updated");
      } else {
        const { error } = await supabase.from("colleges").insert(payload);
        if (error) throw error;
        toast.success("College created");
      }

      setDialogOpen(false);
      setForm(emptyForm);
      setEditingId(null);
      fetchColleges();
    } catch {
      toast.error(editingId ? "Failed to update college" : "Failed to create college");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    const supabase = createClient();
    try {
      const { error } = await supabase.from("colleges").delete().eq("id", id);
      if (error) throw error;
      setColleges((prev) => prev.filter((c) => c.id !== id));
      toast.success("College deleted");
    } catch {
      toast.error("Failed to delete college. It may be referenced by other records.");
    } finally {
      setDeletingId(null);
    }
  }

  function updateForm(field: keyof CollegeFormData, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  return (
    <div>
      <PageHeader
        title="College Management"
        description="Manage colleges and institutions"
      >
        <Button onClick={openCreateDialog}>
          <Plus className="h-4 w-4 mr-2" />
          Add College
        </Button>
      </PageHeader>

      {/* Search */}
      <div className="relative mb-6 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by name, code, or city..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* College List */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="divide-y divide-border">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 p-4">
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-3 w-56" />
                  </div>
                  <Skeleton className="h-8 w-16" />
                  <Skeleton className="h-8 w-16" />
                </div>
              ))}
            </div>
          ) : colleges.length === 0 ? (
            <EmptyState
              icon={<Building2 />}
              title="No colleges found"
              description={
                search
                  ? "Try adjusting your search query"
                  : "Add your first college to get started"
              }
              action={
                !search ? (
                  <Button onClick={openCreateDialog}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add College
                  </Button>
                ) : undefined
              }
            />
          ) : (
            <div className="divide-y divide-border">
              <div className="hidden md:grid md:grid-cols-[1fr_auto_auto_auto_auto_auto] gap-4 p-4 bg-muted/50 text-sm font-medium text-muted-foreground">
                <span>Name</span>
                <span>Code</span>
                <span>City</span>
                <span>State</span>
                <span>University</span>
                <span>Actions</span>
              </div>
              {colleges.map((college) => (
                <div
                  key={college.id}
                  className="flex flex-col md:grid md:grid-cols-[1fr_auto_auto_auto_auto_auto] gap-2 md:gap-4 p-4 md:items-center"
                >
                  <div>
                    <span className="font-medium text-sm">{college.name}</span>
                    {college.website_url && (
                      <a
                        href={college.website_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block text-xs text-blue-600 hover:underline truncate max-w-[200px]"
                      >
                        {college.website_url}
                      </a>
                    )}
                  </div>
                  <span className="text-sm font-mono text-muted-foreground">
                    {college.code}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {college.city || "---"}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {college.state || "---"}
                  </span>
                  <span className="text-sm text-muted-foreground truncate max-w-[150px]">
                    {college.university || "---"}
                  </span>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => openEditDialog(college)}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => handleDelete(college.id)}
                      disabled={deletingId === college.id}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingId ? "Edit College" : "Add College"}
            </DialogTitle>
            <DialogDescription>
              {editingId
                ? "Update the college details below."
                : "Fill in the details to add a new college."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="college-name">
                  Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="college-name"
                  value={form.name}
                  onChange={(e) => updateForm("name", e.target.value)}
                  placeholder="e.g. IIT Delhi"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="college-code">
                  Code <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="college-code"
                  value={form.code}
                  onChange={(e) => updateForm("code", e.target.value)}
                  placeholder="e.g. IITD"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="college-city">City</Label>
                <Input
                  id="college-city"
                  value={form.city}
                  onChange={(e) => updateForm("city", e.target.value)}
                  placeholder="e.g. New Delhi"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="college-state">State</Label>
                <Input
                  id="college-state"
                  value={form.state}
                  onChange={(e) => updateForm("state", e.target.value)}
                  placeholder="e.g. Delhi"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="college-university">University</Label>
              <Input
                id="college-university"
                value={form.university}
                onChange={(e) => updateForm("university", e.target.value)}
                placeholder="e.g. Indian Institute of Technology"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="college-website">Website URL</Label>
              <Input
                id="college-website"
                value={form.website_url}
                onChange={(e) => updateForm("website_url", e.target.value)}
                placeholder="https://www.iitd.ac.in"
              />
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
