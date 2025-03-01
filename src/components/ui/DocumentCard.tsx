
import { UserDocument } from "@/lib/types";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, File, FileText, Image, Trash2 } from "lucide-react";
import { useDocuments } from "@/lib/store";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface DocumentCardProps {
  document: UserDocument;
}

export const DocumentCard = ({ document }: DocumentCardProps) => {
  const { deleteDocument } = useDocuments();
  
  const handleDelete = () => {
    deleteDocument(document.id);
    toast.success("Document deleted successfully");
  };
  
  const handleDownload = () => {
    // In a real app, this would trigger a download
    toast.success("Download started");
  };
  
  // Determine icon based on file type
  const getFileIcon = () => {
    switch (document.fileType) {
      case 'pdf':
        return <File className="h-12 w-12 text-red-500" />;
      case 'docx':
        return <FileText className="h-12 w-12 text-blue-500" />;
      case 'jpg':
      case 'jpeg':
      case 'png':
        return <Image className="h-12 w-12 text-green-500" />;
      default:
        return <File className="h-12 w-12 text-gray-500" />;
    }
  };
  
  return (
    <Card className="overflow-hidden transition-all hover:shadow-md">
      <CardHeader className="p-4 bg-muted/30">
        <div className="flex justify-center">{getFileIcon()}</div>
      </CardHeader>
      <CardContent className="p-4">
        <CardTitle className="text-base font-medium truncate mb-1" title={document.fileName}>
          {document.fileName}
        </CardTitle>
        <div className="flex justify-between items-center text-sm text-muted-foreground">
          <span className={cn("uppercase", {
            "text-red-500": document.fileType === 'pdf',
            "text-blue-500": document.fileType === 'docx',
            "text-green-500": ['jpg', 'jpeg', 'png'].includes(document.fileType),
          })}>
            {document.fileType}
          </span>
          <span>{document.fileSize} KB</span>
        </div>
      </CardContent>
      <CardFooter className="p-2 pt-0 flex justify-between">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleDownload} 
          className="flex items-center gap-1"
        >
          <Download className="h-4 w-4" />
          <span className="sr-only">Download</span>
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleDelete} 
          className="text-destructive hover:text-destructive/90"
        >
          <Trash2 className="h-4 w-4" />
          <span className="sr-only">Delete</span>
        </Button>
      </CardFooter>
    </Card>
  );
};
