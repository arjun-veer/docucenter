"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/features/auth/store";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { USER_ROLES } from "@/lib/constants";
import { formatDate } from "@/lib/formatters";
import { Search, Users } from "lucide-react";
import { toast } from "sonner";
import type { UserRole } from "@/lib/supabase/types";

interface ProfileRow {
  user_id: string;
  full_name: string | null;
  email: string | null;
  role: string;
  college_id: string | null;
  created_at: string;
  colleges: { name: string } | null;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<ProfileRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const currentUser = useAuthStore((s) => s.user);

  const fetchUsers = useCallback(async () => {
    const supabase = createClient();
    setLoading(true);
    try {
      let query = supabase
        .from("profiles")
        .select("user_id, full_name, email, role, college_id, created_at, colleges(name)")
        .order("created_at", { ascending: false });

      if (search.trim()) {
        query = query.or(
          `full_name.ilike.%${search.trim()}%,email.ilike.%${search.trim()}%`
        );
      }

      const { data, error } = await query.limit(100);
      if (error) throw error;
      setUsers((data as unknown as ProfileRow[]) ?? []);
    } catch {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    const timeout = setTimeout(fetchUsers, 300);
    return () => clearTimeout(timeout);
  }, [fetchUsers]);

  async function handleRoleChange(userId: string, newRole: string) {
    if (currentUser?.role !== "super_admin") {
      toast.error("Only super admins can change user roles");
      return;
    }
    if (userId === currentUser.id) {
      toast.error("You cannot change your own role");
      return;
    }

    setUpdatingId(userId);
    const supabase = createClient();
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ role: newRole as UserRole })
        .eq("user_id", userId);
      if (error) throw error;

      setUsers((prev) =>
        prev.map((u) =>
          u.user_id === userId ? { ...u, role: newRole } : u
        )
      );
      toast.success("User role updated");
    } catch {
      toast.error("Failed to update user role");
    } finally {
      setUpdatingId(null);
    }
  }

  const roleBadgeVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    super_admin: "destructive",
    admin: "default",
    ambassador: "secondary",
    user: "outline",
  };

  return (
    <div>
      <PageHeader
        title="User Management"
        description="View and manage all registered users"
      />

      {/* Search */}
      <div className="relative mb-6 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* User List */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="divide-y divide-border">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 p-4">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-48" />
                  </div>
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-9 w-32" />
                </div>
              ))}
            </div>
          ) : users.length === 0 ? (
            <EmptyState
              icon={<Users />}
              title="No users found"
              description={
                search
                  ? "Try adjusting your search query"
                  : "No users have registered yet"
              }
            />
          ) : (
            <div className="divide-y divide-border">
              {/* Table Header */}
              <div className="hidden md:grid md:grid-cols-[1fr_1fr_auto_auto_auto] gap-4 p-4 bg-muted/50 text-sm font-medium text-muted-foreground">
                <span>Name</span>
                <span>Email</span>
                <span>College</span>
                <span>Joined</span>
                <span>Role</span>
              </div>
              {users.map((user) => (
                <div
                  key={user.user_id}
                  className="flex flex-col md:grid md:grid-cols-[1fr_1fr_auto_auto_auto] gap-2 md:gap-4 p-4 md:items-center"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-sm font-medium">
                      {(user.full_name || user.email || "?")
                        .charAt(0)
                        .toUpperCase()}
                    </div>
                    <span className="font-medium text-sm truncate">
                      {user.full_name || "Unnamed"}
                    </span>
                  </div>
                  <span className="text-sm text-muted-foreground truncate">
                    {user.email || "N/A"}
                  </span>
                  <span className="text-sm text-muted-foreground truncate max-w-[150px]">
                    {user.colleges?.name || "---"}
                  </span>
                  <span className="text-sm text-muted-foreground whitespace-nowrap">
                    {formatDate(user.created_at)}
                  </span>
                  <div className="flex items-center gap-2">
                    {currentUser?.role === "super_admin" &&
                    user.user_id !== currentUser.id ? (
                      <Select
                        value={user.role}
                        onValueChange={(val) =>
                          handleRoleChange(user.user_id, val)
                        }
                        disabled={updatingId === user.user_id}
                      >
                        <SelectTrigger className="w-[140px] h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {USER_ROLES.map((r) => (
                            <SelectItem key={r.value} value={r.value}>
                              {r.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Badge variant={roleBadgeVariant[user.role] ?? "outline"}>
                        {USER_ROLES.find((r) => r.value === user.role)?.label ??
                          user.role}
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
