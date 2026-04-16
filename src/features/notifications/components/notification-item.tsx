"use client";

import { useRouter } from "next/navigation";
import {
  Bell,
  Briefcase,
  GraduationCap,
  FileText,
  Building2,
  CheckCircle,
  AlertCircle,
  Info,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatRelativeTime } from "@/lib/formatters";
import { createClient } from "@/lib/supabase/client";
import type { Notification } from "@/lib/types";

interface NotificationItemProps {
  notification: Notification;
  onRead: (id: string) => void;
}

function getNotificationIcon(type: string) {
  switch (type) {
    case "job":
      return Briefcase;
    case "exam":
      return GraduationCap;
    case "document":
      return FileText;
    case "placement":
      return Building2;
    case "success":
      return CheckCircle;
    case "warning":
      return AlertCircle;
    case "info":
      return Info;
    default:
      return Bell;
  }
}

export function NotificationItem({ notification, onRead }: NotificationItemProps) {
  const router = useRouter();
  const supabase = createClient();
  const Icon = getNotificationIcon(notification.type);

  async function handleClick() {
    if (!notification.isRead) {
      await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("id", notification.id);

      onRead(notification.id);
    }

    if (notification.link) {
      router.push(notification.link);
    }
  }

  return (
    <button
      onClick={handleClick}
      className={cn(
        "w-full flex items-start gap-3 p-4 rounded-lg text-left transition-colors",
        "hover:bg-muted/50",
        !notification.isRead && "bg-primary/5"
      )}
    >
      <div
        className={cn(
          "h-9 w-9 rounded-full flex items-center justify-center shrink-0",
          notification.isRead ? "bg-muted" : "bg-primary/10"
        )}
      >
        <Icon
          className={cn(
            "h-4 w-4",
            notification.isRead
              ? "text-muted-foreground"
              : "text-primary"
          )}
        />
      </div>

      <div className="flex-1 min-w-0">
        <p
          className={cn(
            "text-sm leading-snug",
            !notification.isRead && "font-semibold"
          )}
        >
          {notification.title}
        </p>
        <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">
          {notification.message}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          {formatRelativeTime(notification.createdAt)}
        </p>
      </div>

      {!notification.isRead && (
        <div className="h-2 w-2 rounded-full bg-primary shrink-0 mt-2" />
      )}
    </button>
  );
}
