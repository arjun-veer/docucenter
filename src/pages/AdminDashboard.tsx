
import { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertCircle, Search, CheckCircle, XCircle, RefreshCw, ExternalLink, Sparkles } from "lucide-react";
import { useSettings } from "@/lib/store";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { fetchExamDataFromPerplexity } from "@/lib/perplexity";
import { useNavigate } from "react-router-dom";
import { ExamDataResponse } from "@/lib/perplexity";

type PendingExam = ExamDataResponse & {
  id?: string;
  status: 'pending' | 'approved' | 'rejected';
}

const AdminDashboard = () => {
  const { perplexityApiKey } = useSettings();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState("pending");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [pendingExams, setPendingExams] = useState<PendingExam[]>([]);
  const [approvedExams, setApprovedExams] = useState<PendingExam[]>([]);
  const [rejectedExams, setRejectedExams] = useState<PendingExam[]>([]);
  
  // Fetch pending exams on mount
  useEffect(() => {
    const fetchPendingExams = async () => {
      try {
        const { data, error } = await supabase
          .from('pending_exams')
          .select('*');
        
        if (error) {
          console.error('Error fetching pending exams:', error);
          toast.error('Failed to load pending exams');
          return;
        }
        
        if (data) {
          // Map DB format to app format
          const formattedPending = data
            .filter(exam => exam.status === 'pending')
            .map(exam => ({
              id: exam.id,
              name: exam.name,
              category: exam.category,
              description: exam.description,
              registrationStartDate: exam.registration_start_date,
              registrationEndDate: exam.registration_end_date,
              examDate: exam.exam_date || undefined,
              resultDate: exam.result_date || undefined,
              answerKeyDate: exam.answer_key_date || undefined,
              websiteUrl: exam.website_url,
              eligibility: exam.eligibility || undefined,
              applicationFee: exam.application_fee || undefined,
              status: exam.status as 'pending'
            }));
          
          const formattedApproved = data
            .filter(exam => exam.status === 'approved')
            .map(exam => ({
              id: exam.id,
              name: exam.name,
              category: exam.category,
              description: exam.description,
              registrationStartDate: exam.registration_start_date,
              registrationEndDate: exam.registration_end_date,
              examDate: exam.exam_date || undefined,
              resultDate: exam.result_date || undefined,
              answerKeyDate: exam.answer_key_date || undefined,
              websiteUrl: exam.website_url,
              eligibility: exam.eligibility || undefined,
              applicationFee: exam.application_fee || undefined,
              status: exam.status as 'approved'
            }));
          
          const formattedRejected = data
            .filter(exam => exam.status === 'rejected')
            .map(exam => ({
              id: exam.id,
              name: exam.name,
              category: exam.category,
              description: exam.description,
              registrationStartDate: exam.registration_start_date,
              registrationEndDate: exam.registration_end_date,
              examDate: exam.exam_date || undefined,
              resultDate: exam.result_date || undefined,
              answerKeyDate: exam.answer_key_date || undefined,
              websiteUrl: exam.website_url,
              eligibility: exam.eligibility || undefined,
              applicationFee: exam.application_fee || undefined,
              status: exam.status as 'rejected'
            }));
          
          setPendingExams(formattedPending);
          setApprovedExams(formattedApproved);
          setRejectedExams(formattedRejected);
        }
      } catch (error) {
        console.error('Error in fetchPendingExams:', error);
        toast.error('Failed to load exams');
      }
    };
    
    fetchPendingExams();
  }, []);
  
  const handleSearch = async () => {
    if (!perplexityApiKey) {
      toast.error('Perplexity API key not configured. Please add it in Settings.');
      return;
    }
    
    if (!searchQuery.trim()) {
      toast.error('Please enter an exam name to search');
      return;
    }
    
    setIsSearching(true);
    
    try {
      // First check if the exam already exists in the database
      const { data: existingExams } = await supabase
        .from('exams')
        .select('name')
        .ilike('name', `%${searchQuery}%`);
      
      const { data: existingPendingExams } = await supabase
        .from('pending_exams')
        .select('name')
        .ilike('name', `%${searchQuery}%`);
      
      // If exam exists in either table, notify user
      const allExams = [...(existingExams || []), ...(existingPendingExams || [])];
      if (allExams.length > 0) {
        const exactMatch = allExams.some(exam => 
          exam.name.toLowerCase() === searchQuery.toLowerCase()
        );
        
        if (exactMatch) {
          toast.error('This exam already exists in the database!');
          setIsSearching(false);
          return;
        }
        
        toast.warning('Similar exams may already exist in the database. Please check before adding.');
      }
      
      // If no exact match, fetch data from Perplexity
      const examData = await fetchExamDataFromPerplexity(searchQuery);
      
      if (!examData) {
        toast.error('Failed to fetch exam data from Perplexity AI');
        setIsSearching(false);
        return;
      }
      
      // Save to pending_exams table
      const { data, error } = await supabase
        .from('pending_exams')
        .insert({
          name: examData.name,
          category: examData.category,
          description: examData.description,
          registration_start_date: examData.registrationStartDate,
          registration_end_date: examData.registrationEndDate,
          exam_date: examData.examDate || null,
          result_date: examData.resultDate || null,
          answer_key_date: examData.answerKeyDate || null,
          website_url: examData.websiteUrl,
          eligibility: examData.eligibility || null,
          application_fee: examData.applicationFee || null,
          status: 'pending',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (error) {
        console.error('Error saving exam to database:', error);
        toast.error('Failed to save exam data');
      } else if (data) {
        // Format and add to pendingExams state
        const newPendingExam: PendingExam = {
          id: data.id,
          name: data.name,
          category: data.category,
          description: data.description,
          registrationStartDate: data.registration_start_date,
          registrationEndDate: data.registration_end_date,
          examDate: data.exam_date || undefined,
          resultDate: data.result_date || undefined,
          answerKeyDate: data.answer_key_date || undefined,
          websiteUrl: data.website_url,
          eligibility: data.eligibility || undefined,
          applicationFee: data.application_fee || undefined,
          status: 'pending'
        };
        
        setPendingExams(prev => [newPendingExam, ...prev]);
        setActiveTab("pending");
        toast.success('Exam data fetched and added to review queue');
      }
      
      // Clear search
      setSearchQuery("");
    } catch (error) {
      console.error('Error in handleSearch:', error);
      toast.error('Failed to process exam search');
    } finally {
      setIsSearching(false);
    }
  };
  
  const handleApprove = async (examId: string) => {
    try {
      // Find the pending exam
      const examToApprove = pendingExams.find(exam => exam.id === examId);
      if (!examToApprove) {
        toast.error('Exam not found');
        return;
      }
      
      // First, insert into exams table
      const { data: examData, error: examError } = await supabase
        .from('exams')
        .insert({
          name: examToApprove.name,
          category: examToApprove.category,
          description: examToApprove.description,
          registration_start_date: examToApprove.registrationStartDate,
          registration_end_date: examToApprove.registrationEndDate,
          exam_date: examToApprove.examDate || null,
          result_date: examToApprove.resultDate || null,
          answer_key_date: examToApprove.answerKeyDate || null,
          website_url: examToApprove.websiteUrl,
          eligibility: examToApprove.eligibility || null,
          application_fee: examToApprove.applicationFee || null,
          is_verified: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (examError) {
        console.error('Error inserting into exams table:', examError);
        toast.error('Failed to add exam to database');
        return;
      }
      
      // Then update status in pending_exams table
      const { error: updateError } = await supabase
        .from('pending_exams')
        .update({ status: 'approved' })
        .eq('id', examId);
      
      if (updateError) {
        console.error('Error updating pending exam status:', updateError);
        toast.error('Failed to update exam status');
        return;
      }
      
      // Update local state
      setPendingExams(prev => prev.filter(exam => exam.id !== examId));
      setApprovedExams(prev => [{...examToApprove, status: 'approved'}, ...prev]);
      
      toast.success('Exam approved and added to database');
    } catch (error) {
      console.error('Error in handleApprove:', error);
      toast.error('Failed to approve exam');
    }
  };
  
  const handleReject = async (examId: string) => {
    try {
      // Update status in pending_exams table
      const { error } = await supabase
        .from('pending_exams')
        .update({ status: 'rejected' })
        .eq('id', examId);
      
      if (error) {
        console.error('Error updating pending exam status:', error);
        toast.error('Failed to reject exam');
        return;
      }
      
      // Update local state
      const examToReject = pendingExams.find(exam => exam.id === examId);
      if (examToReject) {
        setPendingExams(prev => prev.filter(exam => exam.id !== examId));
        setRejectedExams(prev => [{...examToReject, status: 'rejected'}, ...prev]);
        toast.success('Exam rejected');
      }
    } catch (error) {
      console.error('Error in handleReject:', error);
      toast.error('Failed to reject exam');
    }
  };
  
  const renderExamCard = (exam: PendingExam) => {
    const formatDate = (dateStr?: string) => {
      if (!dateStr) return 'Not available';
      return new Date(dateStr).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    };
    
    return (
      <Card key={exam.id} className="mb-4">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-xl">{exam.name}</CardTitle>
              <CardDescription>{exam.category}</CardDescription>
            </div>
            <a 
              href={exam.websiteUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sm flex items-center text-blue-500 hover:underline"
            >
              <ExternalLink className="h-3.5 w-3.5 mr-1" />
              Official Website
            </a>
          </div>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="text-sm">{exam.description}</div>
          
          <Separator />
          
          <div className="grid grid-cols-2 gap-y-2 text-sm">
            <div className="font-medium">Registration Start:</div>
            <div>{formatDate(exam.registrationStartDate)}</div>
            
            <div className="font-medium">Registration End:</div>
            <div>{formatDate(exam.registrationEndDate)}</div>
            
            {exam.examDate && (
              <>
                <div className="font-medium">Exam Date:</div>
                <div>{formatDate(exam.examDate)}</div>
              </>
            )}
            
            {exam.resultDate && (
              <>
                <div className="font-medium">Result Date:</div>
                <div>{formatDate(exam.resultDate)}</div>
              </>
            )}
            
            {exam.answerKeyDate && (
              <>
                <div className="font-medium">Answer Key Date:</div>
                <div>{formatDate(exam.answerKeyDate)}</div>
              </>
            )}
            
            {exam.eligibility && (
              <>
                <div className="font-medium">Eligibility:</div>
                <div>{exam.eligibility}</div>
              </>
            )}
            
            {exam.applicationFee && (
              <>
                <div className="font-medium">Application Fee:</div>
                <div>{exam.applicationFee}</div>
              </>
            )}
          </div>
        </CardContent>
        {exam.status === 'pending' && (
          <CardFooter className="flex justify-end gap-2">
            <Button 
              variant="destructive" 
              onClick={() => handleReject(exam.id!)}
            >
              <XCircle className="h-4 w-4 mr-2" />
              Reject
            </Button>
            <Button 
              variant="default" 
              onClick={() => handleApprove(exam.id!)}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Approve
            </Button>
          </CardFooter>
        )}
      </Card>
    );
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-20">
        <div className="max-w-5xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Manage exam data and approve information from Perplexity AI
            </p>
          </div>
          
          <div className="bg-muted/40 border rounded-lg p-4 mb-8">
            <div className="flex flex-col md:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search for an exam using Perplexity AI..."
                  className="pl-10"
                  onKeyDown={e => e.key === 'Enter' && handleSearch()}
                  disabled={isSearching}
                />
              </div>
              <Button 
                onClick={handleSearch}
                disabled={isSearching || !perplexityApiKey || !searchQuery.trim()}
              >
                {isSearching ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Searching...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Search with AI
                  </>
                )}
              </Button>
            </div>
            
            {!perplexityApiKey && (
              <div className="flex items-center mt-3 text-sm text-amber-600 bg-amber-50 p-3 rounded-md">
                <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
                <p>
                  Perplexity API key not configured. 
                  <Button 
                    variant="link" 
                    className="h-auto p-0 text-amber-600 underline"
                    onClick={() => navigate('/settings')}
                  >
                    Add it in Settings
                  </Button>
                </p>
              </div>
            )}
          </div>
          
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="pending" className="relative">
                Pending Review
                {pendingExams.length > 0 && (
                  <span className="absolute top-1 right-1 bg-primary text-xs text-primary-foreground rounded-full h-5 w-5 flex items-center justify-center">
                    {pendingExams.length}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="approved">
                Approved
                {approvedExams.length > 0 && (
                  <span className="ml-2 bg-green-100 text-green-800 text-xs rounded-full px-2 py-0.5">
                    {approvedExams.length}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="rejected">
                Rejected
                {rejectedExams.length > 0 && (
                  <span className="ml-2 bg-red-100 text-red-800 text-xs rounded-full px-2 py-0.5">
                    {rejectedExams.length}
                  </span>
                )}
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="pending">
              {pendingExams.length === 0 ? (
                <div className="text-center py-12 border rounded-lg bg-muted/20">
                  <p className="text-muted-foreground">No exams pending review</p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Use the search field above to fetch exam data from Perplexity AI
                  </p>
                </div>
              ) : (
                <div>
                  {pendingExams.map(renderExamCard)}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="approved">
              {approvedExams.length === 0 ? (
                <div className="text-center py-12 border rounded-lg bg-muted/20">
                  <p className="text-muted-foreground">No approved exams</p>
                </div>
              ) : (
                <div>
                  {approvedExams.map(renderExamCard)}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="rejected">
              {rejectedExams.length === 0 ? (
                <div className="text-center py-12 border rounded-lg bg-muted/20">
                  <p className="text-muted-foreground">No rejected exams</p>
                </div>
              ) : (
                <div>
                  {rejectedExams.map(renderExamCard)}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default AdminDashboard;
