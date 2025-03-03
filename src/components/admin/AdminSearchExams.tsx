
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangleIcon, PlusIcon, SearchIcon } from "lucide-react";
import { searchExamsWithSerpApi, checkForDuplicateExams } from "@/lib/serpApiClient";
import { Exam } from "@/lib/types";
import { format } from "date-fns";
import { supabase } from "@/lib/supabase";

interface AdminSearchExamsProps {
  serpApiKey: string | null;
}

const AdminSearchExams = ({ serpApiKey }: AdminSearchExamsProps) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<Partial<Exam>[]>([]);

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

  return (
    <div className="space-y-6">
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
    </div>
  );
};

export default AdminSearchExams;
