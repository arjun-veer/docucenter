"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/features/auth/store";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { NotificationItem } from "@/features/notifications/components/notification-item";
import { Bell, CheckCheck, Loader2 } from "lucide-react";
import type { Notification } from "@/lib/types";

export default function NotificationsPage() {
  const { user } = useAuthStore();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [markingAll, setMarkingAll] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const supabase = createClient();

  useEffect(() => {
    if (!user) return;

    async function fetchNotifications() {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });

      if (!error && data) {
        setNotifications(
          data.map((n) => ({
            id: n.id,
            userId: n.user_id,
            type: n.type,
            title: n.title,
            message: n.message,
            link: n.link,
            referenceId: n.reference_id,
            isRead: n.is_read,
            createdAt: n.created_at,
          }))
        );
      }

      setLoading(false);
    }

    fetchNotifications();
  }, [user]);

  function handleRead(id: string) {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  }

  async function handleMarkAllRead() {
    if (!user) return;
    setMarkingAll(true);

    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("user_id", user.id)
      .eq("is_read", false);

    if (!error) {
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    }

    setMarkingAll(false);
  }

  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const displayedNotifications =
    activeTab === "unread"
      ? notifications.filter((n) => !n.isRead)
      : notifications;

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Notifications"
        description="Stay updated with the latest activity."
      >
        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleMarkAllRead}
            disabled={markingAll}
          >
            {markingAll ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <CheckCheck className="h-4 w-4" />
            )}
            Mark all as read
          </Button>
        )}
      </PageHeader>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="all">
            All
            <span className="ml-1 text-muted-foreground">
              ({notifications.length})
            </span>
          </TabsTrigger>
          <TabsTrigger value="unread">
            Unread
            {unreadCount > 0 && (
              <span className="ml-1 text-muted-foreground">
                ({unreadCount})
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <NotificationList
            notifications={displayedNotifications}
            loading={loading}
            onRead={handleRead}
            emptyTitle="No notifications"
            emptyDescription="You're all caught up. Notifications about exams, jobs, and placements will appear here."
          />
        </TabsContent>

        <TabsContent value="unread">
          <NotificationList
            notifications={displayedNotifications}
            loading={loading}
            onRead={handleRead}
            emptyTitle="No unread notifications"
            emptyDescription="You've read all your notifications. Nice work!"
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function NotificationList({
  notifications,
  loading,
  onRead,
  emptyTitle,
  emptyDescription,
}: {
  notifications: Notification[];
  loading: boolean;
  onRead: (id: string) => void;
  emptyTitle: string;
  emptyDescription: string;
}) {
  if (loading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-20 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <EmptyState
        icon={<Bell />}
        title={emptyTitle}
        description={emptyDescription}
      />
    );
  }

  return (
    <div className="rounded-lg border divide-y">
      {notifications.map((notification) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onRead={onRead}
        />
      ))}
    </div>
  );
}
