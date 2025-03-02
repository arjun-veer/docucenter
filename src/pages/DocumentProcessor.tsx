
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { DocumentProcessor as DocumentProcessorComponent } from "@/components/document/DocumentProcessor";

const DocumentProcessor = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <DocumentProcessorComponent />
      </main>
      
      <Footer />
    </div>
  );
};

export default DocumentProcessor;
