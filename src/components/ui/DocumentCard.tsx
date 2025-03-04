
import { UserDocument } from "@/lib/types";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, File, FileText, Image, Trash2 } from "lucide-react";
import { useDocuments } from "@/lib/stores";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface DocumentCardProps {
  document: UserDocument;
}

export const DocumentCard = ({ document }: DocumentCardProps) => {
  const { deleteDocument } = useDocuments();
  
  const handleDelete = async () => {
    try {
      await deleteDocument(document.id);
      toast.success("Document deleted successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to delete document");
    }
  };
  
  const handleDownload = () => {
    if (document.url) {
      // Create an anchor element and trigger download
      const link = document.createElement('a');
      link.href = document.url;
      link.download = document.fileName;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("Download started");
    } else {
      toast.error("Document URL not available");
    }
  };
  
  // Determine icon based on file type
  const getFileIcon = () => {
    switch (document.fileType) {
      case 'pdf':
        return <File className="h-12 w-12 text-red-500" />;
      case 'docx':
      case 'doc':
        return <FileText className="h-12 w-12 text-blue-500" />;
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'webp':
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
            "text-blue-500": document.fileType === 'docx' || document.fileType === 'doc',
            "text-green-500": ['jpg', 'jpeg', 'png', 'webp'].includes(document.fileType),
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
