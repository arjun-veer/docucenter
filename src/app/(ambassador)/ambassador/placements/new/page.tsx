"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, Plus, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/features/auth/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageHeader } from "@/components/layout/page-header";
import { DRIVE_STATUSES } from "@/lib/constants";
import { generateUniqueSlug } from "@/lib/slugify";
import { toast } from "sonner";

interface DriveFormData {
  title: string;
  companyName: string;
  companyLogoUrl: string;
  description: string;
  driveDate: string;
  registrationDeadline: string;
  eligibility: string;
  minCgpa: string;
  packageOffered: string;
  status: string;
}

const emptyForm: DriveFormData = {
  title: "",
  companyName: "",
  companyLogoUrl: "",
  description: "",
  driveDate: "",
  registrationDeadline: "",
  eligibility: "",
  minCgpa: "",
  packageOffered: "",
  status: "upcoming",
};

export default function NewPlacementDrivePage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [form, setForm] = useState<DriveFormData>(emptyForm);
  const [rolesOffered, setRolesOffered] = useState<string[]>([]);
  const [roleInput, setRoleInput] = useState("");
  const [processRounds, setProcessRounds] = useState<string[]>([]);
  const [roundInput, setRoundInput] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      router.push("/");
    }
  }, [user, router]);

  function updateForm(field: keyof DriveFormData, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function addRole() {
    const trimmed = roleInput.trim();
    if (!trimmed) return;
    if (!rolesOffered.includes(trimmed)) {
      setRolesOffered((prev) => [...prev, trimmed]);
    }
    setRoleInput("");
  }

  function removeRole(index: number) {
    setRolesOffered((prev) => prev.filter((_, i) => i !== index));
  }

  function addRound() {
    const trimmed = roundInput.trim();
    if (!trimmed) return;
    setProcessRounds((prev) => [...prev, trimmed]);
    setRoundInput("");
  }

  function removeRound(index: number) {
    setProcessRounds((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!user?.collegeId) {
      setError("You must be assigned to a college to create drives.");
      return;
    }
    if (!form.title.trim()) {
      setError("Title is required.");
      return;
    }
    if (!form.companyName.trim()) {
      setError("Company name is required.");
      return;
    }
    if (!form.description.trim()) {
      setError("Description is required.");
      return;
    }

    setSubmitting(true);
    const supabase = createClient();

    try {
      const slug = generateUniqueSlug(form.title);
      const { error: insertError } = await supabase
        .from("placement_drives")
        .insert({
          title: form.title.trim(),
          slug,
          company_name: form.companyName.trim(),
          company_logo_url: form.companyLogoUrl.trim() || null,
          description: form.description.trim(),
          college_id: user.collegeId,
          drive_date: form.driveDate || null,
          registration_deadline: form.registrationDeadline || null,
          eligibility: form.eligibility.trim() || null,
          min_cgpa: form.minCgpa ? parseFloat(form.minCgpa) : null,
          package_offered: form.packageOffered.trim() || null,
          roles_offered: rolesOffered,
          process_rounds: processRounds,
          status: form.status,
          created_by: user.id,
        });

      if (insertError) throw insertError;

      toast.success("Placement drive created successfully!");
      router.push("/ambassador/placements");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create placement drive."
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (!user) return null;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/ambassador/placements">
            <ArrowLeft className="h-4 w-4" />
            Back to Placements
          </Link>
        </Button>
      </div>

      <PageHeader
        title="Create Placement Drive"
        description="Fill in the details for the new placement drive."
      />

      {error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          {/* Company & Title */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Basic Information</CardTitle>
            </CardHeader>
            <Separator />
            <CardContent className="pt-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>
                    Drive Title <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    placeholder="e.g. TCS Campus Recruitment 2025"
                    value={form.title}
                    onChange={(e) => updateForm("title", e.target.value)}
                    disabled={submitting}
                  />
                </div>
                <div className="space-y-2">
                  <Label>
                    Company Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    placeholder="e.g. Tata Consultancy Services"
                    value={form.companyName}
                    onChange={(e) => updateForm("companyName", e.target.value)}
                    disabled={submitting}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Company Logo URL</Label>
                <Input
                  placeholder="https://example.com/logo.png"
                  value={form.companyLogoUrl}
                  onChange={(e) => updateForm("companyLogoUrl", e.target.value)}
                  disabled={submitting}
                />
              </div>
              <div className="space-y-2">
                <Label>
                  Description <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  placeholder="Describe the drive, interview process, and compensation details..."
                  value={form.description}
                  onChange={(e) => updateForm("description", e.target.value)}
                  disabled={submitting}
                  rows={5}
                />
              </div>
            </CardContent>
          </Card>

          {/* Dates & Eligibility */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Dates & Eligibility</CardTitle>
            </CardHeader>
            <Separator />
            <CardContent className="pt-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Drive Date</Label>
                  <Input
                    type="date"
                    value={form.driveDate}
                    onChange={(e) => updateForm("driveDate", e.target.value)}
                    disabled={submitting}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Registration Deadline</Label>
                  <Input
                    type="date"
                    value={form.registrationDeadline}
                    onChange={(e) =>
                      updateForm("registrationDeadline", e.target.value)
                    }
                    disabled={submitting}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select
                    value={form.status}
                    onValueChange={(val) => updateForm("status", val)}
                    disabled={submitting}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DRIVE_STATUSES.map((s) => (
                        <SelectItem key={s.value} value={s.value}>
                          {s.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Minimum CGPA</Label>
                  <Input
                    type="number"
                    step="0.1"
                    min="0"
                    max="10"
                    placeholder="e.g. 7.0"
                    value={form.minCgpa}
                    onChange={(e) => updateForm("minCgpa", e.target.value)}
                    disabled={submitting}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Package Offered</Label>
                  <Input
                    placeholder="e.g. 6-8 LPA"
                    value={form.packageOffered}
                    onChange={(e) =>
                      updateForm("packageOffered", e.target.value)
                    }
                    disabled={submitting}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Eligibility Criteria</Label>
                <Textarea
                  placeholder="e.g. B.Tech / M.Tech students from CS, IT, ECE branches with no active backlogs..."
                  value={form.eligibility}
                  onChange={(e) => updateForm("eligibility", e.target.value)}
                  disabled={submitting}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Roles & Process */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Roles & Process</CardTitle>
            </CardHeader>
            <Separator />
            <CardContent className="pt-6 space-y-4">
              {/* Roles */}
              <div className="space-y-2">
                <Label>Roles Offered</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="e.g. Software Developer"
                    value={roleInput}
                    onChange={(e) => setRoleInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addRole();
                      }
                    }}
                    disabled={submitting}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addRole}
                    disabled={submitting}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {rolesOffered.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {rolesOffered.map((role, i) => (
                      <Badge
                        key={i}
                        variant="secondary"
                        className="cursor-pointer gap-1"
                        onClick={() => removeRole(i)}
                      >
                        {role}
                        <X className="h-3 w-3" />
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* Process Rounds */}
              <div className="space-y-2">
                <Label>Selection Process Rounds</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="e.g. Online Test"
                    value={roundInput}
                    onChange={(e) => setRoundInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addRound();
                      }
                    }}
                    disabled={submitting}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addRound}
                    disabled={submitting}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {processRounds.length > 0 && (
                  <div className="space-y-1 mt-2">
                    {processRounds.map((round, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-2 text-sm group"
                      >
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-muted text-xs font-semibold shrink-0">
                          {i + 1}
                        </span>
                        <span className="flex-1">{round}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 opacity-0 group-hover:opacity-100"
                          onClick={() => removeRound(i)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Submit */}
          <div className="flex items-center gap-3">
            <Button type="submit" disabled={submitting}>
              {submitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Create Drive
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/ambassador/placements")}
            >
              Cancel
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}