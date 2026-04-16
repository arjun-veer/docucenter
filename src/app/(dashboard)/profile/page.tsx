"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/features/auth/store";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Loader2, Save } from "lucide-react";

interface ProfileData {
  full_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  bio: string | null;
  degree: string | null;
  branch: string | null;
  graduation_year: number | null;
  skills: string[] | null;
}

export default function ProfilePage() {
  const { user, setUser } = useAuthStore();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [skillInput, setSkillInput] = useState("");
  const supabase = createClient();

  useEffect(() => {
    if (!user) return;
    const fetchProfile = async () => {
      const { data } = await supabase
        .from("profiles")
        .select(
          "full_name, avatar_url, phone, bio, degree, branch, graduation_year, skills"
        )
        .eq("user_id", user.id)
        .single();
      if (data) setProfile(data);
      setLoading(false);
    };
    fetchProfile();
  }, [user]);

  const handleSave = async () => {
    if (!user || !profile) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: profile.full_name,
        phone: profile.phone,
        bio: profile.bio,
        degree: profile.degree,
        branch: profile.branch,
        graduation_year: profile.graduation_year,
        skills: profile.skills,
      })
      .eq("user_id", user.id);

    if (error) {
      toast.error("Failed to update profile");
    } else {
      toast.success("Profile updated");
      setUser({ ...user, fullName: profile.full_name });
    }
    setSaving(false);
  };

  const addSkill = () => {
    if (!skillInput.trim() || !profile) return;
    const skills = [...(profile.skills || []), skillInput.trim()];
    setProfile({ ...profile, skills });
    setSkillInput("");
  };

  const removeSkill = (index: number) => {
    if (!profile) return;
    const skills = (profile.skills || []).filter((_, i) => i !== index);
    setProfile({ ...profile, skills });
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="animate-fade-in max-w-2xl">
      <PageHeader
        title="Profile"
        description="Manage your personal information"
      />

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={profile?.avatar_url || undefined} />
              <AvatarFallback className="bg-foreground text-background text-xl">
                {profile?.full_name?.charAt(0)?.toUpperCase() ||
                  user?.email?.charAt(0)?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle>{profile?.full_name || "User"}</CardTitle>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
              <Badge variant="secondary" className="mt-1 capitalize">
                {user?.role?.replace("_", " ")}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input
                value={profile?.full_name || ""}
                onChange={(e) =>
                  setProfile({ ...profile!, full_name: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input
                value={profile?.phone || ""}
                onChange={(e) =>
                  setProfile({ ...profile!, phone: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Degree</Label>
              <Input
                placeholder="B.Tech, MBA, etc."
                value={profile?.degree || ""}
                onChange={(e) =>
                  setProfile({ ...profile!, degree: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Branch</Label>
              <Input
                placeholder="Computer Science, etc."
                value={profile?.branch || ""}
                onChange={(e) =>
                  setProfile({ ...profile!, branch: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Graduation Year</Label>
              <Input
                type="number"
                value={profile?.graduation_year || ""}
                onChange={(e) =>
                  setProfile({
                    ...profile!,
                    graduation_year: parseInt(e.target.value) || null,
                  })
                }
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Bio</Label>
            <Textarea
              placeholder="Tell us about yourself..."
              value={profile?.bio || ""}
              onChange={(e) =>
                setProfile({ ...profile!, bio: e.target.value })
              }
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label>Skills</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Add a skill"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={(e) =>
                  e.key === "Enter" && (e.preventDefault(), addSkill())
                }
              />
              <Button type="button" variant="outline" onClick={addSkill}>
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {(profile?.skills || []).map((skill, i) => (
                <Badge
                  key={i}
                  variant="secondary"
                  className="cursor-pointer"
                  onClick={() => removeSkill(i)}
                >
                  {skill} &times;
                </Badge>
              ))}
            </div>
          </div>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="w-full md:w-auto"
          >
            {saving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Save Changes
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
