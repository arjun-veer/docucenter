
import { Link } from 'react-router-dom';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { ArrowRight, CalendarIcon, FileTextIcon, BellIcon, LineChart } from 'lucide-react';
import { ExamCard } from '@/components/ui/ExamCard';
import { getUpcomingExams } from '@/lib/mockData';

const Index = () => {
  const upcomingExams = getUpcomingExams();
  
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 md:px-8">
        <div className="container mx-auto">
          <div className="flex flex-col lg:flex-row gap-12 lg:gap-20 items-center">
            <div className="flex-1 space-y-6 max-w-2xl">
              <div className="space-y-2">
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight animate-fade-in">
                  Simplify Your <span className="text-primary">Exam Preparation</span> Journey
                </h1>
                <p className="text-lg md:text-xl text-muted-foreground mt-4 animate-slide-up">
                  A comprehensive platform for students preparing for competitive exams in India. 
                  Track exam dates, manage documents, and stay organized.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 pt-4 animate-slide-up">
                <Button asChild size="lg" className="gap-2">
                  <Link to="/dashboard">
                    <span>Get Started</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link to="/exams">
                    Explore Exams
                  </Link>
                </Button>
              </div>
            </div>
            
            <div className="flex-1 md:flex items-center justify-center">
              <div className="relative w-full max-w-md mx-auto">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-primary/10 rounded-2xl transform rotate-3"></div>
                <div className="relative bg-white border rounded-2xl shadow-lg p-6 z-10 animate-scale-in">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Your Exam Tracker</h3>
                    <LineChart className="h-5 w-5 text-primary" />
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 p-3 border rounded-lg bg-secondary/50">
                      <CalendarIcon className="h-10 w-10 p-2 bg-primary/10 rounded-full text-primary" />
                      <div>
                        <h4 className="font-medium">JEE Main 2024</h4>
                        <p className="text-sm text-muted-foreground">24 Jan, 2024</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 p-3 border rounded-lg">
                      <BellIcon className="h-10 w-10 p-2 bg-primary/10 rounded-full text-primary" />
                      <div>
                        <h4 className="font-medium">UPSC CSE 2024</h4>
                        <p className="text-sm text-muted-foreground">Registration closing soon</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 p-3 border rounded-lg">
                      <FileTextIcon className="h-10 w-10 p-2 bg-primary/10 rounded-full text-primary" />
                      <div>
                        <h4 className="font-medium">5 Documents</h4>
                        <p className="text-sm text-muted-foreground">Securely stored</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="py-20 px-6 md:px-8 bg-secondary/50">
        <div className="container mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold mb-4">Everything You Need in One Place</h2>
            <p className="text-muted-foreground">
              Competitive Exam Hub provides all the essential tools to streamline your exam preparation process.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white border rounded-xl p-6 transition-all duration-300 hover:shadow-md">
              <div className="rounded-full bg-primary/10 w-12 h-12 flex items-center justify-center mb-4">
                <CalendarIcon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Exam Tracking</h3>
              <p className="text-muted-foreground">
                Stay updated with all upcoming exam dates, registration deadlines, and result announcements.
              </p>
            </div>
            
            <div className="bg-white border rounded-xl p-6 transition-all duration-300 hover:shadow-md">
              <div className="rounded-full bg-primary/10 w-12 h-12 flex items-center justify-center mb-4">
                <FileTextIcon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Document Wallet</h3>
              <p className="text-muted-foreground">
                Securely store and organize all your important documents in one place with easy access anytime.
              </p>
            </div>
            
            <div className="bg-white border rounded-xl p-6 transition-all duration-300 hover:shadow-md">
              <div className="rounded-full bg-primary/10 w-12 h-12 flex items-center justify-center mb-4">
                <BellIcon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Notifications</h3>
              <p className="text-muted-foreground">
                Get timely updates and reminders about important exam-related events and deadlines.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Upcoming Exams Section */}
      <section className="py-20 px-6 md:px-8">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
            <div>
              <h2 className="text-3xl font-bold mb-2">Upcoming Exams</h2>
              <p className="text-muted-foreground max-w-2xl">
                Stay updated with the latest competitive exams across various categories.
              </p>
            </div>
            <Button asChild variant="outline">
              <Link to="/exams">View All Exams</Link>
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingExams.map((exam) => (
              <ExamCard key={exam.id} exam={exam} />
            ))}
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-20 px-6 md:px-8 bg-primary text-primary-foreground">
        <div className="container mx-auto text-center max-w-2xl">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="mb-8 text-primary-foreground/90">
            Join thousands of students who are already using Competitive Exam Hub to simplify their exam preparation journey.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" variant="secondary" className="gap-2">
              <Link to="/dashboard">
                <span>Create Account</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-primary-foreground/20 hover:bg-primary-foreground/10">
              <Link to="/exams">
                Explore Exams
              </Link>
            </Button>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default Index;
