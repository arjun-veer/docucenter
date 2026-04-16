import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

export function RecentActivity() {
  const activities = [
    { id: 1, text: "Applied for Google Software Engineer", time: "2 hours ago" },
    { id: 2, text: "Uploaded resume.pdf", time: "5 hours ago" },
    { id: 3, text: "Subscribed to UPSC Exam updates", time: "1 day ago" }
  ];

  return (
    <Card className="col-span-3">
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px]">
          <div className="space-y-4">
            {activities.map((a) => (
              <div key={a.id} className="flex flex-col space-y-1">
                <span className="text-sm font-medium">{a.text}</span>
                <span className="text-xs text-muted-foreground">{a.time}</span>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}