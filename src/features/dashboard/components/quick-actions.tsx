import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Eye, Send } from "lucide-react";
import Link from "next/link";

export function QuickActions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-2">
        <Button variant="outline" className="justify-start w-full" asChild>
          <Link href="/documents"><Plus className="mr-2 h-4 w-4" /> Upload Document</Link>
        </Button>
        <Button variant="outline" className="justify-start w-full" asChild>
          <Link href="/exams"><Eye className="mr-2 h-4 w-4" /> Browse Exams</Link>
        </Button>
        <Button variant="outline" className="justify-start w-full" asChild>
          <Link href="/jobs"><Send className="mr-2 h-4 w-4" /> Apply for Jobs</Link>
        </Button>
      </CardContent>
    </Card>
  );
}