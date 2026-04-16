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
import { Switch } from "@/components/ui/switch";
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
import { JOB_TYPES } from "@/lib/constants";
import { generateUniqueSlug } from "@/lib/slugify";
import { toast } from "sonner";

interface JobFormData {
  title: string;
  companyName: string;
  companyLogoUrl: string;
  description: string;
  requirements: string;
  location: string;
  remoteAllowed: boolean;
  jobType: string;
  salaryMin: string;
  salaryMax: string;
  experienceMin: string;
  experienceMax: string;
  eligibility: string;
  applicationUrl: string;
  applicationDeadline: string;
}

const emptyForm: JobFormData = {
  title: "",
  companyName: "",
  companyLogoUrl: "",
  description: "",
  requirements: "",
  location: "",
  remoteAllowed: false,
  jobType: "full_time",
  salaryMin: "",
  salaryMax: "",
  experienceMin: "",
  experienceMax: "",
  eligibility: "",
  applicationUrl: "",
  applicationDeadline: "",
};

export default function NewAmbassadorJobPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [form, setForm] = useState<JobFormData>(emptyForm);
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      router.push("/");
    }
  }, [user, router]);

  function updateForm(field: keyof JobFormData, value: string | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function addSkill() {
    const trimmed = skillInput.trim();
    if (!trimmed) return;
    if (!skills.includes(trimmed)) {
      setSkills((prev) => [...prev, trimmed]);
    }
    setSkillInput("");
  }

  function addTag() {
    const trimmed = tagInput.trim();
    if (!trimmed) return;
    if (!tags.includes(trimmed)) {
      setTags((prev) => [...prev, trimmed]);
    }
    setTagInput("");
  }

  async function handleSubmit(status: "active" | "draft") {
    setError(null);

    if (!user?.collegeId) {
      setError("You must be assigned to a college to post jobs.");
      return;
    }
    if (!form.title.trim()) {
      setError("Job title is required.");
      return;
    }
    if (!form.companyName.trim()) {
      setError("Company name is required.");
      return;
    }
    if (!form.description.trim()) {
      setError("Job description is required.");
      return;
    }

    setSubmitting(true);
    const supabase = createClient();

    try {
      const slug = generateUniqueSlug(form.title);
      const { error: insertError } = await supabase.from("jobs").insert({
        title: form.title.trim(),
        slug,
        company_name: form.companyName.trim(),
        company_logo_url: form.companyLogoUrl.trim() || null,
        description: form.description.trim(),
        requirements: form.requirements.trim() || null,
        location: form.location.trim() || null,
        remote_allowed: form.remoteAllowed,
        job_type: form.jobType,
        salary_min: form.salaryMin ? parseInt(form.salaryMin, 10) : null,
        salary_max: form.salaryMax ? parseInt(form.salaryMax, 10) : null,
        salary_currency: "INR",
        experience_min: form.experienceMin
          ? parseInt(form.experienceMin, 10)
          : null,
        experience_max: form.experienceMax
          ? parseInt(form.experienceMax, 10)
          : null,
        skills_required: skills,
        eligibility: form.eligibility.trim() || null,
        application_url: form.applicationUrl.trim() || null,
        application_deadline: form.applicationDeadline || null,
        status,
        posted_by: user.id,
        college_id: user.collegeId,
        is_featured: false,
        tags,
      });

      if (insertError) throw insertError;

      toast.success(
        status === "active"
          ? "Job posted successfully!"
          : "Job saved as draft."
      );
      router.push("/ambassador/jobs");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to post job.");
    } finally {
      setSubmitting(false);
    }
  }

  if (!user) return null;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/ambassador/jobs">
            <ArrowLeft className="h-4 w-4" />
            Back to Jobs
          </Link>
        </Button>
      </div>

      <PageHeader
        title="Post a College Job"
        description="Post a job specific for your college students."
      />

      {error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive mb-6">
          {error}
        </div>
      )}

      <div className="space-y-6">
        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Basic Information</CardTitle>
          </CardHeader>
          <Separator />
          <CardContent className="pt-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>
                  Job Title <span className="text-destructive">*</span>
                </Label>
                <Input
                  placeholder="e.g. Software Engineer Intern"
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
                  placeholder="e.g. Infosys"
                  value={form.companyName}
                  onChange={(e) => updateForm("companyName", e.target.value)}
                  disabled={submitting}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <Label>Job Type</Label>
                <Select
                  value={form.jobType}
                  onValueChange={(val) => updateForm("jobType", val)}
                  disabled={submitting}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {JOB_TYPES.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>
                Description <span className="text-destructive">*</span>
              </Label>
              <Textarea
                placeholder="Describe the role, responsibilities, and what you're looking for..."
                value={form.description}
                onChange={(e) => updateForm("description", e.target.value)}
                disabled={submitting}
                rows={5}
              />
            </div>
            <div className="space-y-2">
              <Label>Requirements</Label>
              <Textarea
                placeholder="List the requirements and qualifications..."
                value={form.requirements}
                onChange={(e) => updateForm("requirements", e.target.value)}
                disabled={submitting}
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Location & Compensation */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Location & Compensation</CardTitle>
          </CardHeader>
          <Separator />
          <CardContent className="pt-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Location</Label>
                <Input
                  placeholder="e.g. Bangalore, India"
                  value={form.location}
                  onChange={(e) => updateForm("location", e.target.value)}
                  disabled={submitting}
                />
              </div>
              <div className="flex items-center gap-3 pt-6">
                <Switch
                  checked={form.remoteAllowed}
                  onCheckedChange={(checked) =>
                    updateForm("remoteAllowed", checked)
                  }
                  disabled={submitting}
                />
                <Label>Remote work allowed</Label>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label>Salary Min (₹)</Label>
                <Input
                  type="number"
                  placeholder="e.g. 300000"
                  value={form.salaryMin}
                  onChange={(e) => updateForm("salaryMin", e.target.value)}
                  disabled={submitting}
                />
              </div>
              <div className="space-y-2">
                <Label>Salary Max (₹)</Label>
                <Input
                  type="number"
                  placeholder="e.g. 600000"
                  value={form.salaryMax}
                  onChange={(e) => updateForm("salaryMax", e.target.value)}
                  disabled={submitting}
                />
              </div>
              <div className="space-y-2">
                <Label>Exp Min (years)</Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={form.experienceMin}
                  onChange={(e) => updateForm("experienceMin", e.target.value)}
                  disabled={submitting}
                />
              </div>
              <div className="space-y-2">
                <Label>Exp Max (years)</Label>
                <Input
                  type="number"
                  placeholder="2"
                  value={form.experienceMax}
                  onChange={(e) => updateForm("experienceMax", e.target.value)}
                  disabled={submitting}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Skills, Eligibility & Application */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              Skills, Eligibility & Application
            </CardTitle>
          </CardHeader>
          <Separator />
          <CardContent className="pt-6 space-y-4">
            {/* Skills */}
            <div className="space-y-2">
              <Label>Required Skills</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="e.g. React, Node.js"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addSkill();
                    }
                  }}
                  disabled={submitting}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={addSkill}
                  disabled={submitting}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {skills.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {skills.map((skill, i) => (
                    <Badge
                      key={i}
                      variant="secondary"
                      className="cursor-pointer gap-1"
                      onClick={() =>
                        setSkills((prev) => prev.filter((_, idx) => idx !== i))
                      }
                    >
                      {skill}
                      <X className="h-3 w-3" />
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <Label>Tags</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="e.g. campus, freshers"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addTag();
                    }
                  }}
                  disabled={submitting}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={addTag}
                  disabled={submitting}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {tags.map((tag, i) => (
                    <Badge
                      key={i}
                      variant="outline"
                      className="cursor-pointer gap-1"
                      onClick={() =>
                        setTags((prev) => prev.filter((_, idx) => idx !== i))
                      }
                    >
                      {tag}
                      <X className="h-3 w-3" />
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>Eligibility</Label>
              <Input
                placeholder="e.g. B.Tech students with 60%+"
                value={form.eligibility}
                onChange={(e) => updateForm("eligibility", e.target.value)}
                disabled={submitting}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>External Application URL</Label>
                <Input
                  type="url"
                  placeholder="https://careers.company.com/apply"
                  value={form.applicationUrl}
                  onChange={(e) => updateForm("applicationUrl", e.target.value)}
                  disabled={submitting}
                />
              </div>
              <div className="space-y-2">
                <Label>Application Deadline</Label>
                <Input
                  type="date"
                  value={form.applicationDeadline}
                  onChange={(e) =>
                    updateForm("applicationDeadline", e.target.value)
                  }
                  disabled={submitting}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex items-center gap-3">
          <Button
            onClick={() => handleSubmit("active")}
            disabled={submitting}
          >
            {submitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            Post Job
          </Button>
          <Button
            variant="outline"
            onClick={() => handleSubmit("draft")}
            disabled={submitting}
          >
            Save as Draft
          </Button>
          <Button
            variant="ghost"
            onClick={() => router.push("/ambassador/jobs")}
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}