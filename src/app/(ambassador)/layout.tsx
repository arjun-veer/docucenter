"use client";

import { Navbar } from "@/components/layout/navbar";
import { Sidebar } from "@/components/layout/sidebar";
import { LayoutDashboard, Briefcase, Calendar } from "lucide-react";

const ambassadorLinks = [
  { href: "/ambassador", label: "Dashboard", icon: LayoutDashboard },
  { href: "/ambassador/placements", label: "Placements", icon: Calendar },
  { href: "/ambassador/jobs", label: "Jobs", icon: Briefcase },
];

export default function AmbassadorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      <div className="flex flex-1">
        <Sidebar links={ambassadorLinks} title="Ambassador Panel" />
        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </>
  );
}
