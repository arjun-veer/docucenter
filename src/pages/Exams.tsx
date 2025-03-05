
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useExams, useAuth } from "@/lib/stores";
import { PlusIcon, RefreshCwIcon } from "lucide-react";
import { ExamCard } from "@/components/ui/ExamCard";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

const Exams = () => {
  const { exams, fetchExams, isLoading, error } = useExams();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filteredExams, setFilteredExams] = useState(exams);

  // Fetch exams only once on component mount
  useEffect(() => {
    const loadExams = async () => {
      try {
        await fetchExams();
      } catch (error: any) {
        console.error('Failed to load exams:', error);
        toast.error('Failed to load exams. Please try again.');
      }
    };
    
    loadExams();
  }, [fetchExams]);

  // Update filtered exams whenever exams, categoryFilter, or searchTerm changes
  useEffect(() => {
    let filtered = exams;

    if (categoryFilter !== 'All') {
      filtered = filtered.filter(exam => exam.category === categoryFilter);
    }

    if (searchTerm) {
      filtered = filtered.filter(exam =>
        exam.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredExams(filtered);
  }, [exams, categoryFilter, searchTerm]);

  const handleCategoryChange = (category: string) => {
    setCategoryFilter(category);
  };

  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
  };
  
  const handleRefresh = async () => {
    try {
      await fetchExams();
      toast.info("Exam data refreshed.");
    } catch (error: any) {
      console.error('Failed to refresh exams:', error);
      toast.error('Failed to refresh exams. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="space-y-8">
          <div>
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
              <div>
                <h1 className="text-3xl font-bold">Upcoming Exams</h1>
                <p className="text-muted-foreground mt-1">
                  Browse and track important exam dates
                </p>
              </div>
              
              <div className="flex items-center gap-3">
                {currentUser?.role === 'admin' && (
                  <Button onClick={() => navigate('/admin')} className="flex items-center gap-1">
                    <PlusIcon className="h-4 w-4" />
                    Add New Exams
                  </Button>
                )}
                <Button onClick={handleRefresh} size="sm" variant="outline" className="flex items-center gap-1">
                  <RefreshCwIcon className="h-4 w-4" />
                  Refresh
                </Button>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
            <Input
              type="text"
              placeholder="Search exams..."
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full sm:w-auto sm:flex-1"
            />
            <Select onValueChange={handleCategoryChange} defaultValue={categoryFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Categories</SelectItem>
                <SelectItem value="Engineering">Engineering</SelectItem>
                <SelectItem value="Medical">Medical</SelectItem>
                <SelectItem value="Law">Law</SelectItem>
                <SelectItem value="Management">Management</SelectItem>
                <SelectItem value="Civil Services">Civil Services</SelectItem>
                <SelectItem value="Banking">Banking</SelectItem>
                <SelectItem value="Teaching">Teaching</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-[350px] w-full rounded-lg" />
              ))}
            </div>
          ) : error ? (
            <div className="py-12 text-center space-y-4">
              <p className="text-muted-foreground">Could not load exam data: {error}</p>
              <Button onClick={handleRefresh} variant="outline">
                Try Again
              </Button>
            </div>
          ) : filteredExams.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-muted-foreground">No exams found. Try changing your filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredExams.map((exam) => (
                <ExamCard key={exam.id} exam={exam} />
              ))}
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Exams;
