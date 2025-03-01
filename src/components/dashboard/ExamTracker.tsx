
import { Link } from 'react-router-dom';
import { useExams } from '@/lib/store';
import { getUpcomingExams, getSubscribedExams } from '@/lib/mockData';
import { CalendarIcon, BellIcon, CheckCircleIcon, AlertCircleIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { ExamCard } from '@/components/ui/ExamCard';

export const ExamTracker = () => {
  const { exams, subscribedExams } = useExams();
  const upcomingExams = getUpcomingExams();
  const userSubscribedExams = getSubscribedExams();
  
  // Calculate upcoming deadlines
  const getUpcomingDeadlines = () => {
    const now = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(now.getDate() + 30);
    
    const deadlines = [];
    
    // Check registration deadlines
    for (const exam of subscribedExams) {
      if (exam.registrationEndDate > now && exam.registrationEndDate < thirtyDaysFromNow) {
        deadlines.push({
          examId: exam.id,
          examName: exam.name,
          type: 'Registration',
          date: exam.registrationEndDate,
          urgent: exam.registrationEndDate.getTime() - now.getTime() < 7 * 24 * 60 * 60 * 1000 // Less than 7 days
        });
      }
      
      if (exam.examDate && exam.examDate > now && exam.examDate < thirtyDaysFromNow) {
        deadlines.push({
          examId: exam.id,
          examName: exam.name,
          type: 'Exam Date',
          date: exam.examDate,
          urgent: exam.examDate.getTime() - now.getTime() < 7 * 24 * 60 * 60 * 1000 // Less than 7 days
        });
      }
    }
    
    return deadlines.sort((a, b) => a.date.getTime() - b.date.getTime());
  };
  
  const upcomingDeadlines = getUpcomingDeadlines();
  
  // Calculate progress
  const totalExams = exams.length;
  const subscribedPercentage = totalExams > 0 
    ? Math.round((subscribedExams.length / totalExams) * 100) 
    : 0;
  
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };
  
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Exam Tracker</h2>
        <p className="text-muted-foreground mt-1">
          Monitor and track your competitive exam journey
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="border rounded-lg p-5 bg-white">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-medium">Tracked Exams</h3>
              <p className="text-sm text-muted-foreground mb-4">
                You're tracking {subscribedExams.length} out of {totalExams} exams
              </p>
            </div>
            <BellIcon className="h-5 w-5 text-primary" />
          </div>
          
          <Progress value={subscribedPercentage} className="h-2 mb-3" />
          
          <div className="flex items-center justify-between mt-4">
            <span className="text-sm text-muted-foreground">
              {subscribedPercentage}% complete
            </span>
            <Button asChild variant="ghost" size="sm" className="text-xs">
              <Link to="/exams">View All Exams</Link>
            </Button>
          </div>
        </div>
        
        <div className="border rounded-lg p-5 bg-white">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-medium">Upcoming Deadlines</h3>
              <p className="text-sm text-muted-foreground mb-2">
                {upcomingDeadlines.length} deadline{upcomingDeadlines.length !== 1 ? 's' : ''} in the next 30 days
              </p>
            </div>
            <CalendarIcon className="h-5 w-5 text-primary" />
          </div>
          
          <div className="mt-4 space-y-3">
            {upcomingDeadlines.length > 0 ? (
              upcomingDeadlines.map((deadline, index) => (
                <div 
                  key={`${deadline.examId}-${deadline.type}`}
                  className="flex items-center justify-between border-b last:border-0 pb-2 last:pb-0"
                >
                  <div className="flex items-start gap-3">
                    {deadline.urgent ? (
                      <AlertCircleIcon className="h-5 w-5 mt-0.5 text-destructive shrink-0" />
                    ) : (
                      <CheckCircleIcon className="h-5 w-5 mt-0.5 text-muted-foreground shrink-0" />
                    )}
                    <div>
                      <Link 
                        to={`/exams/${deadline.examId}`} 
                        className="text-sm font-medium hover:underline transition-colors"
                      >
                        {deadline.examName}
                      </Link>
                      <p className="text-xs text-muted-foreground">
                        {deadline.type} deadline
                      </p>
                    </div>
                  </div>
                  <span className={`text-xs ${deadline.urgent ? 'text-destructive font-medium' : 'text-muted-foreground'}`}>
                    {formatDate(deadline.date)}
                  </span>
                </div>
              ))
            ) : (
              <div className="flex items-center justify-center py-4 text-sm text-muted-foreground">
                No upcoming deadlines in the next 30 days
              </div>
            )}
          </div>
        </div>
      </div>
      
      <Tabs defaultValue="upcoming" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="upcoming">Upcoming Exams</TabsTrigger>
          <TabsTrigger value="subscribed">Subscribed Exams</TabsTrigger>
        </TabsList>
        
        <TabsContent value="upcoming">
          {upcomingExams.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcomingExams.map((exam) => (
                <ExamCard key={exam.id} exam={exam} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 border rounded-lg bg-muted/30">
              <h3 className="text-lg font-medium mb-1">No upcoming exams</h3>
              <p className="text-muted-foreground text-sm mb-4 text-center max-w-sm">
                There are no upcoming exams in the system.
              </p>
              <Button asChild variant="outline" size="sm">
                <Link to="/exams">Browse All Exams</Link>
              </Button>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="subscribed">
          {userSubscribedExams.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userSubscribedExams.map((exam) => (
                <ExamCard key={exam.id} exam={exam} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 border rounded-lg bg-muted/30">
              <h3 className="text-lg font-medium mb-1">No subscribed exams</h3>
              <p className="text-muted-foreground text-sm mb-4 text-center max-w-sm">
                You haven't subscribed to any exams yet.
              </p>
              <Button asChild variant="outline" size="sm">
                <Link to="/exams">Find Exams to Track</Link>
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
