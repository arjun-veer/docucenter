import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ExamCard } from "@/components/cards/ExamCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useExams, useAuth } from "@/lib/store";
import { PlusIcon } from "lucide-react";

// Update the Exams component to include a button to go to the Admin Dashboard
const Exams = () => {
  const { exams, subscribedExams, subscribeToExam, unsubscribeFromExam } = useExams();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filteredExams, setFilteredExams] = useState(exams);

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

  const subscribe = (examId: string) => {
    subscribeToExam(examId);
  };

  const unsubscribe = (examId: string) => {
    unsubscribeFromExam(examId);
  };

  // Add this section to the JSX part where appropriate, typically above the exam listings
  // Inside the main content area, after the title and description
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="space-y-8">
          <div>
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold">Upcoming Exams</h1>
                <p className="text-muted-foreground mt-1">
                  Browse and track important exam dates
                </p>
              </div>
              
              {currentUser?.role === 'admin' || currentUser?.role === 'superadmin' ? (
                <Button onClick={() => navigate('/admin')} className="flex items-center gap-1">
                  <PlusIcon className="h-4 w-4" />
                  Add New Exams
                </Button>
              ) : null}
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <Input
              type="text"
              placeholder="Search exams..."
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
            />
            <Select onValueChange={handleCategoryChange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by Category" defaultValue={categoryFilter} />
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
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredExams.map((exam) => (
              <ExamCard
                key={exam.id}
                exam={exam}
                isSubscribed={exam.isSubscribed}
                onSubscribe={subscribe}
                onUnsubscribe={unsubscribe}
              />
            ))}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Exams;
