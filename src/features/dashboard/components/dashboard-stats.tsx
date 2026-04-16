import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Briefcase, Calendar, FileText } from "lucide-react";

export function DashboardStats() {
  const stats = [
    { name: "My Exams", value: "3", icon: BookOpen },
    { name: "Applications", value: "12", icon: Briefcase },
    { name: "Drives", value: "2", icon: Calendar },
    { name: "Documents", value: "5", icon: FileText },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.name}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.name}</CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}