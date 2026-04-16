"use client";

import { Navbar } from "@/components/layout/navbar";
import { Sidebar } from "@/components/layout/sidebar";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  Building2,
  BookOpen,
  Briefcase,
  Bot,
  FileText,
} from "lucide-react";

const adminLinks = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/ambassadors", label: "Ambassadors", icon: GraduationCap },
  { href: "/admin/colleges", label: "Colleges", icon: Building2 },
  { href: "/admin/exams", label: "Exams", icon: BookOpen },
  { href: "/admin/jobs", label: "Jobs", icon: Briefcase },
  { href: "/admin/agents", label: "Agents", icon: Bot },
  { href: "/admin/content", label: "Content", icon: FileText },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      <div className="flex flex-1">
        <Sidebar links={adminLinks} title="Admin Panel" />
        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </>
  );
}
