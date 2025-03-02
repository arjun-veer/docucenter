
import { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ExamCard } from "@/components/ui/ExamCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Exam, ExamCategory } from "@/lib/types";
import { useExams, useSettings, useAuth } from "@/lib/store";
import { Search, Filter, Calendar, Database, User } from "lucide-react";
import { Link } from "react-router-dom";

const Exams = () => {
  const { exams, fetchExams } = useExams();
  const { currentUser } = useAuth();
  const [filteredExams, setFilteredExams] = useState<Exam[]>(exams);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [isUpcoming, setIsUpcoming] = useState(true);

  // All available categories from the exams
  const categories: ExamCategory[] = [
    'Engineering', 
    'Medical', 
    'Civil Services',
    'Banking',
    'Railways',
    'Defence',
    'Teaching',
    'State Services',
    'School Board',
    'Law',
    'Management',
    'Other'
  ];

  // Fetch exams on mount
  useEffect(() => {
    fetchExams();
  }, [fetchExams]);

  // Filter exams based on search query, category, and upcoming status
  useEffect(() => {
    let result = [...exams];
    
    // Filter by search query
    if (searchQuery) {
      result = result.filter(exam => 
        exam.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        exam.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Filter by category
    if (selectedCategory && selectedCategory !== "all") {
      result = result.filter(exam => exam.category === selectedCategory);
    }
    
    // Filter by upcoming status
    if (isUpcoming) {
      const now = new Date();
      result = result.filter(exam => 
        new Date(exam.registrationEndDate) > now || 
        (exam.examDate && new Date(exam.examDate) > now)
      );
    }
    
    setFilteredExams(result);
  }, [exams, searchQuery, selectedCategory, isUpcoming]);

  // We'll assume user with ID "admin-user" is admin for now
  // In a real app, you'd have proper roles
  const isAdmin = currentUser?.id === "admin-user";

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-20">
        <div className="max-w-5xl mx-auto">
          <div className="mb-8">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-2">
              <h1 className="text-3xl font-bold">Competitive Exams</h1>
              
              {isAdmin && (
                <Button asChild className="gap-2">
                  <Link to="/admin">
                    <User className="h-4 w-4" />
                    Admin Dashboard
                  </Link>
                </Button>
              )}
            </div>
            <p className="text-muted-foreground">
              Discover and track competitive exams across various categories in India
            </p>
          </div>
          
          {/* Filters Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search exams..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            {/* Category filter */}
            <Select
              value={selectedCategory}
              onValueChange={setSelectedCategory}
            >
              <SelectTrigger className="w-full">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  <SelectValue placeholder="Filter by category" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {/* Upcoming toggle */}
            <Button
              variant={isUpcoming ? "default" : "outline"}
              onClick={() => setIsUpcoming(!isUpcoming)}
              className="gap-2"
            >
              <Calendar className="h-4 w-4" />
              {isUpcoming ? "Upcoming Exams" : "All Exams"}
            </Button>
          </div>
          
          {/* Results count */}
          <div className="mb-6">
            <p className="text-sm text-muted-foreground">
              Showing {filteredExams.length} {filteredExams.length === 1 ? 'exam' : 'exams'}
            </p>
          </div>
          
          {/* Exams Grid */}
          {filteredExams.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredExams.map((exam) => (
                <ExamCard key={exam.id} exam={exam} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <Database className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-20" />
              <h3 className="text-xl font-medium mb-2">No exams found</h3>
              <p className="text-muted-foreground mb-6">
                Try adjusting your filters or search criteria
              </p>
              
              {isAdmin && (
                <Button asChild>
                  <Link to="/admin">
                    Go to Admin Dashboard to Add Exams
                  </Link>
                </Button>
              )}
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Exams;
