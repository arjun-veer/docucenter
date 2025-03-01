import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Exam } from "@/lib/types";
import { useExams } from "@/lib/store";
import { toast } from "sonner";
import { format } from "date-fns";
import { 
  CalendarIcon, 
  ArrowLeft, 
  ExternalLink, 
  Bell, 
  BellOff, 
  Calendar, 
  CalendarCheck, 
  CalendarClock, 
  FileText 
} from "lucide-react";

const ExamDetails = () => {
  const { examId } = useParams<{ examId: string }>();
  const navigate = useNavigate();
  const { exams, subscribeToExam, unsubscribeFromExam } = useExams();
  const [exam, setExam] = useState<Exam | null>(null);
  
  // Find the exam based on the ID
  useEffect(() => {
    if (!examId) {
      navigate("/exams");
      return;
    }
    
    const foundExam = exams.find(e => e.id === examId);
    if (foundExam) {
      setExam(foundExam);
    } else {
      toast.error("Exam not found");
      navigate("/exams");
    }
  }, [examId, exams, navigate]);
  
  // Format date helper
  const formatDate = (date: Date | undefined) => {
    if (!date) return "Not announced";
    return format(new Date(date), "dd MMM, yyyy");
  };
  
  // Return early if exam is not found
  if (!exam) {
    return null;
  }
  
  // Handle subscription toggle
  const handleSubscriptionToggle = () => {
    if (exam.isSubscribed) {
      unsubscribeFromExam(exam.id);
      toast.success(`Unsubscribed from ${exam.name}`);
    } else {
      subscribeToExam(exam.id);
      toast.success(`Subscribed to ${exam.name}`);
    }
  };
  
  // Check if registration is active
  const isRegistrationActive = () => {
    const now = new Date();
    return new Date(exam.registrationStartDate) <= now && new Date(exam.registrationEndDate) >= now;
  };
  
  // Days remaining for registration
  const getDaysRemaining = () => {
    const now = new Date();
    const endDate = new Date(exam.registrationEndDate);
    if (endDate < now) return 0;
    
    const diffTime = Math.abs(endDate.getTime() - now.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto">
          {/* Back button */}
          <Button
            variant="ghost"
            size="sm"
            className="mb-6"
            asChild
          >
            <Link to="/exams">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Exams
            </Link>
          </Button>
          
          {/* Exam header */}
          <div className="mb-8">
            <div className="flex flex-wrap justify-between items-start gap-4 mb-3">
              <h1 className="text-3xl font-bold">{exam.name}</h1>
              
              <Button
                onClick={handleSubscriptionToggle}
                variant={exam.isSubscribed ? "default" : "outline"}
                className="gap-2"
              >
                {exam.isSubscribed ? (
                  <>
                    <BellOff className="h-4 w-4" />
                    Unsubscribe
                  </>
                ) : (
                  <>
                    <Bell className="h-4 w-4" />
                    Subscribe
                  </>
                )}
              </Button>
            </div>
            
            <div className="flex flex-wrap gap-2 mb-4">
              <Badge>{exam.category}</Badge>
              
              {isRegistrationActive() ? (
                <Badge variant="default" className="bg-green-600">
                  Registration Open
                </Badge>
              ) : new Date(exam.registrationEndDate) < new Date() ? (
                <Badge variant="outline">Registration Closed</Badge>
              ) : (
                <Badge variant="outline">
                  Registration starts {formatDate(exam.registrationStartDate)}
                </Badge>
              )}
            </div>
            
            <p className="text-muted-foreground">{exam.description}</p>
          </div>
          
          {/* Important dates */}
          <Card className="mb-8">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">Important Dates</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-start gap-3">
                  <CalendarClock className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium">Registration Window</p>
                    <p className="text-muted-foreground">
                      {formatDate(exam.registrationStartDate)} - {formatDate(exam.registrationEndDate)}
                    </p>
                    
                    {isRegistrationActive() && (
                      <p className="text-sm mt-1 font-medium text-orange-600">
                        {getDaysRemaining()} days remaining
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium">Exam Date</p>
                    <p className="text-muted-foreground">
                      {formatDate(exam.examDate)}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <CalendarCheck className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium">Result Date</p>
                    <p className="text-muted-foreground">
                      {formatDate(exam.resultDate)}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <FileText className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium">Application Fee</p>
                    <p className="text-muted-foreground">
                      {exam.applicationFee || "Not specified"}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Other details */}
          <Card className="mb-8">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">Eligibility & Details</h2>
              
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium mb-1">Eligibility Criteria</h3>
                  <p className="text-muted-foreground">{exam.eligibility || "Please check the official website for detailed eligibility criteria."}</p>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="font-medium mb-2">Official Website</h3>
                  <Button variant="outline" className="gap-2" asChild>
                    <a href={exam.websiteUrl} target="_blank" rel="noopener noreferrer">
                      Visit Website
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Action buttons */}
          <div className="flex flex-wrap gap-4 justify-between">
            <Button
              variant="outline"
              size="lg"
              asChild
            >
              <Link to="/exams">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Exams
              </Link>
            </Button>
            
            <Button
              onClick={handleSubscriptionToggle}
              size="lg"
              variant={exam.isSubscribed ? "default" : "outline"}
              className="gap-2"
            >
              {exam.isSubscribed ? (
                <>
                  <BellOff className="h-4 w-4" />
                  Unsubscribe
                </>
              ) : (
                <>
                  <Bell className="h-4 w-4" />
                  Subscribe
                </>
              )}
            </Button>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default ExamDetails;
