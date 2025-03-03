
import { format } from "date-fns";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckIcon, XIcon } from "lucide-react";

interface PendingExam {
  id: string;
  name: string;
  category: string;
  description: string;
  registration_start_date: string;
  registration_end_date: string;
  exam_date: string | null;
  result_date: string | null;
  answer_key_date: string | null;
  website_url: string;
  eligibility: string | null;
  application_fee: string | null;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
}

interface ExamCardProps {
  exam: PendingExam;
  onApprove: (exam: PendingExam) => Promise<void>;
  onReject: (examId: string) => Promise<void>;
}

const ExamCard = ({ exam, onApprove, onReject }: ExamCardProps) => {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not specified';
    return format(new Date(dateString), 'PPP');
  };

  return (
    <Card key={exam.id} className="overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start gap-2">
          <div>
            <CardTitle className="text-lg">{exam.name}</CardTitle>
            <div className="flex gap-2 items-center mt-1">
              <CardDescription>{exam.category}</CardDescription>
              <Badge variant={exam.status === 'pending' ? 'outline' : (exam.status === 'approved' ? 'secondary' : 'destructive')}>
                {exam.status}
              </Badge>
            </div>
          </div>
          
          {exam.status === 'pending' && (
            <div className="flex gap-2">
              <Button 
                onClick={() => onReject(exam.id)} 
                variant="outline" 
                size="sm"
                className="text-destructive border-destructive hover:bg-destructive/10"
              >
                <XIcon className="h-4 w-4 mr-1" />
                Reject
              </Button>
              <Button 
                onClick={() => onApprove(exam)} 
                variant="default" 
                size="sm"
              >
                <CheckIcon className="h-4 w-4 mr-1" />
                Approve
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="pb-3">
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div>
              <span className="text-sm font-medium text-muted-foreground">Registration:</span>
              <div className="mt-1">
                {formatDate(exam.registration_start_date)} - {formatDate(exam.registration_end_date)}
              </div>
            </div>
            
            <div>
              <span className="text-sm font-medium text-muted-foreground">Exam Date:</span>
              <div className="mt-1">{formatDate(exam.exam_date)}</div>
            </div>
            
            <div>
              <span className="text-sm font-medium text-muted-foreground">Result Date:</span>
              <div className="mt-1">{formatDate(exam.result_date)}</div>
            </div>
            
            {exam.answer_key_date && (
              <div>
                <span className="text-sm font-medium text-muted-foreground">Answer Key Date:</span>
                <div className="mt-1">{formatDate(exam.answer_key_date)}</div>
              </div>
            )}
            
            {exam.application_fee && (
              <div>
                <span className="text-sm font-medium text-muted-foreground">Application Fee:</span>
                <div className="mt-1">{exam.application_fee}</div>
              </div>
            )}
            
            {exam.website_url && (
              <div>
                <span className="text-sm font-medium text-muted-foreground">Website:</span>
                <div className="mt-1">
                  <a 
                    href={exam.website_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    {exam.website_url}
                  </a>
                </div>
              </div>
            )}
          </div>
          
          <div className="space-y-2">
            {exam.description && (
              <div>
                <span className="text-sm font-medium text-muted-foreground">Description:</span>
                <p className="mt-1 line-clamp-3">{exam.description}</p>
              </div>
            )}
            
            {exam.eligibility && (
              <div>
                <span className="text-sm font-medium text-muted-foreground">Eligibility:</span>
                <p className="mt-1 line-clamp-3">{exam.eligibility}</p>
              </div>
            )}
            
            <div>
              <span className="text-sm font-medium text-muted-foreground">Added on:</span>
              <div className="mt-1">{formatDate(exam.created_at)}</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ExamCard;
