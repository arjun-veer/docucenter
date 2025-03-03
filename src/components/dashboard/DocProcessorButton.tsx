
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { FileEdit } from "lucide-react";

export const DocProcessorButton = () => {
  return (
    <div className="flex justify-center mb-6">
      <Button asChild className="flex items-center gap-2">
        <Link to="/document-processor">
          <FileEdit className="h-4 w-4 mr-1" />
          Document Processor Tool
        </Link>
      </Button>
    </div>
  );
};
