
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth, useSettings } from "@/lib/store";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { searchExamsWithSerpApi, checkForDuplicateExams } from "@/lib/serpApiClient";
import { supabase } from "@/lib/supabase";
import { Exam } from "@/lib/types";
import { format } from "date-fns";
import { SearchIcon, PlusIcon, CheckIcon, XIcon, AlertTriangleIcon, SettingsIcon } from "lucide-react";

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

const AdminDashboard = () => {
  const { isAuthenticated, currentUser } = useAuth();
  const { serpApiKey, setSerpApiKey } = useSettings();
  const navigate = useNavigate();
  const { toast: uiToast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<Partial<Exam>[]>([]);
  const [pendingExams, setPendingExams] = useState<PendingExam[]>([]);
  const [activeTab, setActiveTab] = useState("search");

  // Redirect if not authenticated or not admin
  if (!isAuthenticated) {
    navigate("/auth");
    return null;
  }

  if (currentUser?.role !== "admin" && currentUser?.role !== "admin") {
    navigate("/dashboard");
    return null;
  }

  const fetchPendingExams = async () => {
    try {
      const { data, error } = await supabase
        .from('pending_exams')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setPendingExams(data || []);
    } catch (error) {
      console.error('Error fetching pending exams:', error);
      toast.error('Failed to load pending exams');
    }
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    if (value === "pending") {
      fetchPendingExams();
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast.error('Please enter a search query');
      return;
    }

    if (!serpApiKey) {
      toast.error('SerpAPI key is not configured. Please add it in Settings.');
      return;
    }

    setIsSearching(true);
    try {
      const results = await searchExamsWithSerpApi(searchQuery, serpApiKey);
      setSearchResults(results);
      if (results.length === 0) {
        toast.info('No results found for your query');
      }
    } catch (error: any) {
      console.error('Search error:', error);
      toast.error(`Search failed: ${error.message}`);
    } finally {
      setIsSearching(false);
    }
  };

  const addToPendingExams = async (exam: Partial<Exam>) => {
    try {
      // First check if this exam might already exist
      const { existingExams, pendingExams } = await checkForDuplicateExams(exam.name || '');
      
      if (existingExams.length > 0) {
        toast.error(`An exam with a similar name already exists in the database.`);
        return;
      }
      
      if (pendingExams.length > 0) {
        toast.error(`An exam with a similar name is already pending review.`);
        return;
      }
      
      // Format dates for Supabase
      const formatDateForDb = (date: Date | undefined) => date ? date.toISOString() : null;
      
      const { error } = await supabase.from('pending_exams').insert({
        name: exam.name || '',
        category: exam.category || 'General',
        description: exam.description || '',
        registration_start_date: formatDateForDb(exam.registrationStartDate),
        registration_end_date: formatDateForDb(exam.registrationEndDate),
        exam_date: formatDateForDb(exam.examDate),
        result_date: formatDateForDb(exam.resultDate),
        answer_key_date: formatDateForDb(exam.resultDate), // Set answer key date to result date as fallback
        website_url: exam.websiteUrl || '',
        eligibility: exam.eligibility || null,
        application_fee: exam.applicationFee || null,
        status: 'pending'
      });
      
      if (error) throw error;
      
      toast.success('Exam added to pending review queue');
      // Remove the exam from search results to prevent duplicates
      setSearchResults(current => current.filter(e => e.name !== exam.name));
    } catch (error: any) {
      console.error('Error adding to pending exams:', error);
      toast.error(`Failed to add exam: ${error.message}`);
    }
  };

  const approveExam = async (pendingExam: PendingExam) => {
    try {
      // First update the pending exam status
      const { error: updateError } = await supabase
        .from('pending_exams')
        .update({ status: 'approved' })
        .eq('id', pendingExam.id);
      
      if (updateError) throw updateError;
      
      // Then add it to the main exams table
      const { error: insertError } = await supabase.from('exams').insert({
        name: pendingExam.name,
        category: pendingExam.category,
        description: pendingExam.description,
        registration_start_date: pendingExam.registration_start_date,
        registration_end_date: pendingExam.registration_end_date,
        exam_date: pendingExam.exam_date,
        result_date: pendingExam.result_date,
        answer_key_date: pendingExam.answer_key_date,
        website_url: pendingExam.website_url,
        eligibility: pendingExam.eligibility,
        application_fee: pendingExam.application_fee,
        is_verified: true
      });
      
      if (insertError) throw insertError;
      
      toast.success('Exam approved and added to the database');
      fetchPendingExams();
    } catch (error: any) {
      console.error('Error approving exam:', error);
      toast.error(`Failed to approve exam: ${error.message}`);
    }
  };

  const rejectExam = async (pendingExamId: string) => {
    try {
      const { error } = await supabase
        .from('pending_exams')
        .update({ status: 'rejected' })
        .eq('id', pendingExamId);
      
      if (error) throw error;
      
      toast.success('Exam rejected');
      fetchPendingExams();
    } catch (error: any) {
      console.error('Error rejecting exam:', error);
      toast.error(`Failed to reject exam: ${error.message}`);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not specified';
    return format(new Date(dateString), 'PPP');
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Manage exams and application content
            </p>
          </div>
          
          <Tabs defaultValue="search" onValueChange={handleTabChange}>
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="search">Search New Exams</TabsTrigger>
              <TabsTrigger value="pending">Pending Exams</TabsTrigger>
            </TabsList>
            
            <TabsContent value="search" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Search for Exams</CardTitle>
                  <CardDescription>
                    Use SerpAPI to find and add new exams to the database
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <Input
                        placeholder="Search for exams (e.g., 'engineering entrance exams in India')"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                      />
                    </div>
                    <Button onClick={handleSearch} disabled={isSearching}>
                      {isSearching ? (
                        <span className="flex items-center gap-1">Searching...</span>
                      ) : (
                        <span className="flex items-center gap-1">
                          <SearchIcon className="h-4 w-4" />
                          Search
                        </span>
                      )}
                    </Button>
                  </div>
                  
                  {!serpApiKey && (
                    <div className="mt-4 p-4 bg-yellow-50 text-yellow-800 rounded-md flex items-center gap-2">
                      <AlertTriangleIcon className="h-5 w-5" />
                      <span>
                        SerpAPI key is not configured. Please add it in the{" "}
                        <Button 
                          variant="link" 
                          className="p-0 h-auto text-yellow-800 underline"
                          onClick={() => navigate("/settings")}
                        >
                          Settings
                        </Button>
                        {" "}page.
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              {searchResults.length > 0 && (
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold">Search Results</h2>
                  
                  {searchResults.map((exam, index) => (
                    <Card key={index} className="overflow-hidden">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start gap-2">
                          <div>
                            <CardTitle className="text-lg">{exam.name}</CardTitle>
                            <CardDescription>{exam.category}</CardDescription>
                          </div>
                          <Button onClick={() => addToPendingExams(exam)} size="sm">
                            <PlusIcon className="h-4 w-4 mr-1" />
                            Add to Review
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="pb-3">
                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <div>
                              <span className="text-sm font-medium text-muted-foreground">Registration:</span>
                              <div className="mt-1">
                                {exam.registrationStartDate && exam.registrationEndDate ? (
                                  <span>
                                    {format(exam.registrationStartDate, 'PP')} - {format(exam.registrationEndDate, 'PP')}
                                  </span>
                                ) : (
                                  <span className="text-muted-foreground">Dates not available</span>
                                )}
                              </div>
                            </div>
                            
                            <div>
                              <span className="text-sm font-medium text-muted-foreground">Exam Date:</span>
                              <div className="mt-1">
                                {exam.examDate ? (
                                  <span>{format(exam.examDate, 'PP')}</span>
                                ) : (
                                  <span className="text-muted-foreground">Not specified</span>
                                )}
                              </div>
                            </div>
                            
                            <div>
                              <span className="text-sm font-medium text-muted-foreground">Result Date:</span>
                              <div className="mt-1">
                                {exam.resultDate ? (
                                  <span>{format(exam.resultDate, 'PP')}</span>
                                ) : (
                                  <span className="text-muted-foreground">Not specified</span>
                                )}
                              </div>
                            </div>
                            
                            {exam.applicationFee && (
                              <div>
                                <span className="text-sm font-medium text-muted-foreground">Application Fee:</span>
                                <div className="mt-1">{exam.applicationFee}</div>
                              </div>
                            )}
                            
                            {exam.websiteUrl && (
                              <div>
                                <span className="text-sm font-medium text-muted-foreground">Website:</span>
                                <div className="mt-1">
                                  <a 
                                    href={exam.websiteUrl} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-primary hover:underline"
                                  >
                                    {exam.websiteUrl}
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
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="pending" className="space-y-6">
              {pendingExams.length === 0 ? (
                <Card>
                  <CardContent className="py-10">
                    <div className="text-center text-muted-foreground">
                      No pending exams to review
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold">Pending Exams for Review</h2>
                  
                  {pendingExams.map((exam) => (
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
                                onClick={() => rejectExam(exam.id)} 
                                variant="outline" 
                                size="sm"
                                className="text-destructive border-destructive hover:bg-destructive/10"
                              >
                                <XIcon className="h-4 w-4 mr-1" />
                                Reject
                              </Button>
                              <Button 
                                onClick={() => approveExam(exam)} 
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
                  ))}
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
