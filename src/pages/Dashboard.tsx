
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ExamTracker } from "@/components/dashboard/ExamTracker";
import { DocumentWallet } from "@/components/dashboard/DocumentWallet";
import { DocProcessorButton } from "@/components/dashboard/DocProcessorButton";

const Dashboard = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="space-y-6">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          
          <DocProcessorButton />
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ExamTracker />
            <DocumentWallet />
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Dashboard;
