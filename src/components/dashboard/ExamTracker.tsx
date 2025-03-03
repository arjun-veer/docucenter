
import { useExams } from "@/lib/store";
import { ExamCard } from "@/components/ui/ExamCard";
import { Button } from "@/components/ui/button";
import { BookOpen, Calendar, Bell, BellOff } from "lucide-react";
import { Link } from "react-router-dom";
import { Exam } from "@/lib/types";

export const ExamTracker = () => {
  const { subscribedExams, exams, unsubscribeFromExam } = useExams();

  // Find the full exam objects for all subscribed exam IDs
  const subscribedExamObjects = subscribedExams
    .map(examId => exams.find(exam => exam.id === examId))
    .filter(exam => exam !== undefined) as Exam[];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Exam Tracker</h2>
        <p className="text-muted-foreground mt-1">
          Track and manage your subscribed exams
        </p>
      </div>

      {subscribedExamObjects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subscribedExamObjects.map((exam) => (
            <ExamCard key={exam.id} exam={exam} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 space-y-4 border rounded-lg bg-muted/30">
          <div className="flex justify-center">
            <div className="rounded-full bg-primary/10 p-3">
              <BookOpen className="h-8 w-8 text-primary" />
            </div>
          </div>
          <h3 className="text-xl font-medium">No exams tracked yet</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            You haven't subscribed to any exams yet. Browse our exam listings and subscribe to the ones you're interested in.
          </p>
          <Button asChild className="mt-4">
            <Link to="/exams">Browse Exams</Link>
          </Button>
        </div>
      )}

      {subscribedExamObjects.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-medium mb-4">Upcoming Deadlines</h3>
          <div className="space-y-4">
            {subscribedExamObjects
              .sort((a, b) => {
                // Sort by nearest registration end date first
                const aDate = new Date(a.registrationEndDate);
                const bDate = new Date(b.registrationEndDate);
                return aDate.getTime() - bDate.getTime();
              })
              .map((exam) => {
                const registrationEndDate = new Date(exam.registrationEndDate);
                const now = new Date();
                const daysLeft = Math.ceil(
                  (registrationEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
                );
                const isEnded = daysLeft < 0;

                return (
                  <div
                    key={exam.id}
                    className="flex items-center justify-between p-4 border rounded-lg bg-background"
                  >
                    <div className="flex items-center gap-3">
                      <div className="rounded-full bg-primary/10 p-2">
                        <Calendar className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-medium">{exam.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          Registration {isEnded ? "ended" : "ends"}{" "}
                          {isEnded
                            ? `${Math.abs(daysLeft)} days ago`
                            : daysLeft === 0
                            ? "today"
                            : `in ${daysLeft} days`}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => unsubscribeFromExam(exam.id)}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <BellOff className="h-4 w-4" />
                        <span className="sr-only">Unsubscribe</span>
                      </Button>
                      <Button variant="outline" size="sm" asChild>
                        <Link to={`/exams/${exam.id}`}>View Details</Link>
                      </Button>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
};
