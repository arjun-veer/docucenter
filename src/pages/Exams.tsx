
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
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
              
              {currentUser?.role === 'admin' && (
                <Button onClick={() => navigate('/admin')} className="flex items-center gap-1">
                  <PlusIcon className="h-4 w-4" />
                  Add New Exams
                </Button>
              )}
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
              <div key={exam.id} className="bg-card rounded-lg border shadow-sm overflow-hidden">
                <div className="p-6">
                  <h3 className="text-lg font-semibold">{exam.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{exam.category}</p>
                  
                  <div className="mt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Registration:</span>
                      <span className="font-medium">
                        {new Date(exam.registrationStartDate).toLocaleDateString()} - 
                        {new Date(exam.registrationEndDate).toLocaleDateString()}
                      </span>
                    </div>
                    
                    {exam.examDate && (
                      <div className="flex justify-between text-sm">
                        <span>Exam Date:</span>
                        <span className="font-medium">{new Date(exam.examDate).toLocaleDateString()}</span>
                      </div>
                    )}
                    
                    {exam.resultDate && (
                      <div className="flex justify-between text-sm">
                        <span>Results:</span>
                        <span className="font-medium">{new Date(exam.resultDate).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-6 flex justify-between items-center">
                    <Button variant="outline" size="sm" onClick={() => navigate(`/exams/${exam.id}`)}>
                      View Details
                    </Button>
                    
                    {exam.isSubscribed ? (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => unsubscribe(exam.id)}
                      >
                        Unsubscribe
                      </Button>
                    ) : (
                      <Button 
                        variant="default" 
                        size="sm"
                        onClick={() => subscribe(exam.id)}
                      >
                        Subscribe
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Exams;
