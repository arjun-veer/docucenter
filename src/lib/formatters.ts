import { formatDistanceToNow, format, isValid, parseISO } from "date-fns";

export function formatDate(date: string | null | undefined): string {
  if (!date) return "N/A";
  const parsed = parseISO(date);
  if (!isValid(parsed)) return "N/A";
  return format(parsed, "MMM d, yyyy");
}

export function formatDateTime(date: string | null | undefined): string {
  if (!date) return "N/A";
  const parsed = parseISO(date);
  if (!isValid(parsed)) return "N/A";
  return format(parsed, "MMM d, yyyy h:mm a");
}

export function formatRelativeTime(date: string | null | undefined): string {
  if (!date) return "N/A";
  const parsed = parseISO(date);
  if (!isValid(parsed)) return "N/A";
  return formatDistanceToNow(parsed, { addSuffix: true });
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

export function formatSalary(
  min: number | null,
  max: number | null,
  currency: string = "INR"
): string {
  if (!min && !max) return "Not disclosed";
  const fmt = (n: number) => {
    if (n >= 100000) return `${(n / 100000).toFixed(1)}L`;
    if (n >= 1000) return `${(n / 1000).toFixed(0)}K`;
    return n.toString();
  };
  if (min && max) return `${currency} ${fmt(min)} - ${fmt(max)}`;
  if (min) return `${currency} ${fmt(min)}+`;
  return `Up to ${currency} ${fmt(max!)}`;
}

export function formatCount(count: number): string {
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
  if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
  return count.toString();
}
