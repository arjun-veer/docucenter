"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/features/auth/store";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatDate } from "@/lib/formatters";
import { Search, GraduationCap, Plus, UserMinus } from "lucide-react";
import { toast } from "sonner";

interface AmbassadorRow {
  user_id: string;
  full_name: string | null;
  email: string | null;
  college_id: string | null;
  created_at: string;
  colleges: { id: string; name: string } | null;
}

interface CollegeOption {
  id: string;
  name: string;
}

interface UserSearchResult {
  user_id: string;
  full_name: string | null;
  email: string | null;
  role: string;
}

export default function AdminAmbassadorsPage() {
  const [ambassadors, setAmbassadors] = useState<AmbassadorRow[]>([]);
  const [colleges, setColleges] = useState<CollegeOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [userSearch, setUserSearch] = useState("");
  const [userResults, setUserResults] = useState<UserSearchResult[]>([]);
  const [searchingUsers, setSearchingUsers] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [selectedCollegeId, setSelectedCollegeId] = useState<string>("");
  const [assigning, setAssigning] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const currentUser = useAuthStore((s) => s.user);

  const fetchAmbassadors = useCallback(async () => {
    const supabase = createClient();
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("user_id, full_name, email, college_id, created_at, colleges(id, name)")
        .eq("role", "ambassador")
        .order("created_at", { ascending: false });
      if (error) throw error;
      setAmbassadors((data as unknown as AmbassadorRow[]) ?? []);
    } catch {
      toast.error("Failed to load ambassadors");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchColleges = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from("colleges")
      .select("id, name")
      .order("name");
    setColleges(data ?? []);
  }, []);

  useEffect(() => {
    fetchAmbassadors();
    fetchColleges();
  }, [fetchAmbassadors, fetchColleges]);

  async function searchUsers() {
    if (!userSearch.trim()) return;
    setSearchingUsers(true);
    const supabase = createClient();
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("user_id, full_name, email, role")
        .or(`full_name.ilike.%${userSearch.trim()}%,email.ilike.%${userSearch.trim()}%`)
        .neq("role", "ambassador")
        .limit(10);
      if (error) throw error;
      setUserResults(data ?? []);
    } catch {
      toast.error("Failed to search users");
    } finally {
      setSearchingUsers(false);
    }
  }

  async function handleAssignAmbassador() {
    if (!selectedUserId || !selectedCollegeId) {
      toast.error("Please select a user and a college");
      return;
    }
    if (currentUser?.role !== "super_admin") {
      toast.error("Only super admins can assign ambassadors");
      return;
    }

    setAssigning(true);
    const supabase = createClient();
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ role: "ambassador", college_id: selectedCollegeId })
        .eq("user_id", selectedUserId);
      if (error) throw error;

      toast.success("Ambassador assigned successfully");
      setDialogOpen(false);
      setSelectedUserId("");
      setSelectedCollegeId("");
      setUserSearch("");
      setUserResults([]);
      fetchAmbassadors();
    } catch {
      toast.error("Failed to assign ambassador");
    } finally {
      setAssigning(false);
    }
  }

  async function handleRemoveAmbassador(userId: string) {
    if (currentUser?.role !== "super_admin") {
      toast.error("Only super admins can remove ambassadors");
      return;
    }

    setRemovingId(userId);
    const supabase = createClient();
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ role: "user" })
        .eq("user_id", userId);
      if (error) throw error;

      setAmbassadors((prev) => prev.filter((a) => a.user_id !== userId));
      toast.success("Ambassador role removed");
    } catch {
      toast.error("Failed to remove ambassador");
    } finally {
      setRemovingId(null);
    }
  }

  const isSuperAdmin = currentUser?.role === "super_admin";

  return (
    <div>
      <PageHeader
        title="Ambassador Management"
        description="Manage college ambassadors"
      >
        {isSuperAdmin && (
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Assign Ambassador
          </Button>
        )}
      </PageHeader>

      {/* Ambassador List */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="divide-y divide-border">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 p-4">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-48" />
                  </div>
                  <Skeleton className="h-6 w-24" />
                  <Skeleton className="h-8 w-24" />
                </div>
              ))}
            </div>
          ) : ambassadors.length === 0 ? (
            <EmptyState
              icon={<GraduationCap />}
              title="No ambassadors yet"
              description="Assign users as college ambassadors to help manage campus placements"
            />
          ) : (
            <div className="divide-y divide-border">
              <div className="hidden md:grid md:grid-cols-[1fr_1fr_1fr_auto_auto] gap-4 p-4 bg-muted/50 text-sm font-medium text-muted-foreground">
                <span>Name</span>
                <span>Email</span>
                <span>College</span>
                <span>Since</span>
                <span>Actions</span>
              </div>
              {ambassadors.map((amb) => (
                <div
                  key={amb.user_id}
                  className="flex flex-col md:grid md:grid-cols-[1fr_1fr_1fr_auto_auto] gap-2 md:gap-4 p-4 md:items-center"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-sm font-medium">
                      {(amb.full_name || amb.email || "?")
                        .charAt(0)
                        .toUpperCase()}
                    </div>
                    <span className="font-medium text-sm truncate">
                      {amb.full_name || "Unnamed"}
                    </span>
                  </div>
                  <span className="text-sm text-muted-foreground truncate">
                    {amb.email || "N/A"}
                  </span>
                  <div>
                    {amb.colleges?.name ? (
                      <Badge variant="secondary">{amb.colleges.name}</Badge>
                    ) : (
                      <span className="text-sm text-muted-foreground">
                        Not assigned
                      </span>
                    )}
                  </div>
                  <span className="text-sm text-muted-foreground whitespace-nowrap">
                    {formatDate(amb.created_at)}
                  </span>
                  <div>
                    {isSuperAdmin && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveAmbassador(amb.user_id)}
                        disabled={removingId === amb.user_id}
                        className="text-destructive hover:text-destructive"
                      >
                        <UserMinus className="h-4 w-4 mr-1" />
                        Remove
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Assign Ambassador Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Ambassador</DialogTitle>
            <DialogDescription>
              Search for a user by email and assign them as an ambassador for a
              college.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* User Search */}
            <div className="space-y-2">
              <Label>Search User</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Search by name or email..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && searchUsers()}
                />
                <Button
                  variant="outline"
                  onClick={searchUsers}
                  disabled={searchingUsers}
                >
                  <Search className="h-4 w-4" />
                </Button>
              </div>
              {userResults.length > 0 && (
                <div className="border rounded-md divide-y max-h-40 overflow-auto">
                  {userResults.map((u) => (
                    <button
                      key={u.user_id}
                      type="button"
                      onClick={() => setSelectedUserId(u.user_id)}
                      className={`w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors ${
                        selectedUserId === u.user_id ? "bg-muted" : ""
                      }`}
                    >
                      <span className="font-medium">
                        {u.full_name || "Unnamed"}
                      </span>
                      <span className="text-muted-foreground ml-2">
                        {u.email}
                      </span>
                      <Badge variant="outline" className="ml-2 text-xs">
                        {u.role}
                      </Badge>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* College Selection */}
            <div className="space-y-2">
              <Label>Assign to College</Label>
              <Select
                value={selectedCollegeId}
                onValueChange={setSelectedCollegeId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a college" />
                </SelectTrigger>
                <SelectContent>
                  {colleges.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleAssignAmbassador}
              disabled={assigning || !selectedUserId || !selectedCollegeId}
            >
              {assigning ? "Assigning..." : "Assign"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
