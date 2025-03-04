import { CalendarIcon, ClockIcon, ExternalLinkIcon, BellIcon, BellOffIcon } from 'lucide-react';
import { formatDistance } from 'date-fns';
import { Exam } from '@/lib/types';
import { useExams } from '@/lib/store';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

interface ExamCardProps {
  exam: Exam;
}

const formatDate = (date: Date) => {
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
};

export const ExamCard = ({ exam }: ExamCardProps) => {
  const { subscribeToExam, unsubscribeFromExam } = useExams();
  
  const getDaysRemaining = (date: Date | undefined) => {
    if (!date) return null;
    const now = new Date();
    if (date < now) return null;
    return formatDistance(date, now, { addSuffix: true });
  };
  
  const getNextImportantDate = () => {
    const now = new Date();
    
    if (new Date(exam.registrationStartDate) > now) {
      return {
        label: 'Registration Opens',
        date: new Date(exam.registrationStartDate),
        remaining: getDaysRemaining(new Date(exam.registrationStartDate))
      };
    }
    
    if (new Date(exam.registrationEndDate) > now) {
      return {
        label: 'Registration Closes',
        date: new Date(exam.registrationEndDate),
        remaining: getDaysRemaining(new Date(exam.registrationEndDate))
      };
    }
    
    if (exam.examDate && new Date(exam.examDate) > now) {
      return {
        label: 'Exam Date',
        date: new Date(exam.examDate),
        remaining: getDaysRemaining(new Date(exam.examDate))
      };
    }
    
    if (exam.resultDate && new Date(exam.resultDate) > now) {
      return {
        label: 'Result Date',
        date: new Date(exam.resultDate),
        remaining: getDaysRemaining(new Date(exam.resultDate))
      };
    }
    
    return null;
  };
  
  const importantDate = getNextImportantDate();
  
  const handleSubscription = () => {
    if (exam.isSubscribed) {
      unsubscribeFromExam(exam.id);
      toast.success('Unsubscribed from exam notifications');
    } else {
      subscribeToExam(exam.id);
      toast.success('Subscribed to exam notifications');
    }
  };
  
  return (
    <Card className="h-full transition-all duration-300 ease-in-out hover:shadow-md animate-fade-in">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start gap-2">
          <div>
            <Badge variant="outline" className="mb-2">{exam.category}</Badge>
            <CardTitle className="text-xl leading-tight">
              <Link to={`/exams/${exam.id}`} className="hover:underline transition-all">
                {exam.name}
              </Link>
            </CardTitle>
          </div>
          <Button
            size="icon"
            variant="ghost"
            onClick={handleSubscription}
            className="transition-colors"
          >
            {exam.isSubscribed ? (
              <BellIcon className="h-5 w-5 text-primary" />
            ) : (
              <BellOffIcon className="h-5 w-5 text-muted-foreground" />
            )}
            <span className="sr-only">
              {exam.isSubscribed ? 'Unsubscribe from notifications' : 'Subscribe to notifications'}
            </span>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-4 w-4 text-muted-foreground" />
              <span>Registration:</span>
            </div>
            <span>{formatDate(new Date(exam.registrationStartDate))}</span>
            
            {exam.examDate && (
              <>
                <div className="flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                  <span>Exam Date:</span>
                </div>
                <span>{formatDate(new Date(exam.examDate))}</span>
              </>
            )}
            
            {exam.resultDate && (
              <>
                <div className="flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                  <span>Result:</span>
                </div>
                <span>{formatDate(new Date(exam.resultDate))}</span>
              </>
            )}
          </div>
          
          {importantDate && (
            <div className="border rounded-md p-3 bg-secondary/50">
              <div className="text-sm font-medium">{importantDate.label}</div>
              <div className="flex items-center justify-between mt-1">
                <span className="text-sm">{formatDate(importantDate.date)}</span>
                <div className="flex items-center gap-1.5 text-sm">
                  <ClockIcon className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-muted-foreground">{importantDate.remaining}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="pt-3 flex justify-between">
        <Button asChild variant="outline" size="sm">
          <a href={exam.websiteUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5">
            <span>Official Website</span>
            <ExternalLinkIcon className="h-3.5 w-3.5" />
          </a>
        </Button>
        <Button asChild size="sm">
          <Link to={`/exams/${exam.id}`}>
            Details
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
};
