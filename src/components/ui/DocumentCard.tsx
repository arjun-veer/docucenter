
import { useState } from 'react';
import { FileIcon, Trash2Icon, DownloadIcon, ImageIcon, FileTextIcon } from 'lucide-react';
import { UserDocument } from '@/lib/types';
import { useDocuments } from '@/lib/store';
import {
  Card,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';

interface DocumentCardProps {
  document: UserDocument;
}

export const DocumentCard = ({ document }: DocumentCardProps) => {
  const { deleteDocument } = useDocuments();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  
  const formatFileSize = (sizeInKB: number): string => {
    if (sizeInKB < 1024) {
      return `${sizeInKB} KB`;
    } else {
      return `${(sizeInKB / 1024).toFixed(2)} MB`;
    }
  };
  
  const getFileIcon = () => {
    switch (document.fileType) {
      case 'pdf':
        return <FileIcon className="h-10 w-10 text-red-500" />;
      case 'docx':
        return <FileTextIcon className="h-10 w-10 text-blue-500" />;
      case 'jpg':
      case 'jpeg':
      case 'png':
        return <ImageIcon className="h-10 w-10 text-green-500" />;
      default:
        return <FileIcon className="h-10 w-10 text-gray-500" />;
    }
  };
  
  const handleDownload = () => {
    // In a real implementation, this would download the actual file
    toast.success(`Downloading ${document.fileName}`);
  };
  
  const handleDelete = () => {
    deleteDocument(document.id);
    toast.success('Document deleted successfully');
    setIsDeleteDialogOpen(false);
  };
  
  return (
    <>
      <Card 
        className={cn(
          "transition-all duration-300 border border-border",
          isHovered && "shadow-md"
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            {getFileIcon()}
            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-medium truncate" title={document.fileName}>
                {document.fileName}
              </h3>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-xs text-muted-foreground">
                  {formatFileSize(document.fileSize)}
                </span>
                <span className="text-xs text-muted-foreground">
                  {document.fileType.toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="p-2 pt-0 flex justify-between">
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-xs"
            onClick={handleDownload}
          >
            <DownloadIcon className="h-3.5 w-3.5 mr-1.5" />
            Download
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <svg 
                  width="15" 
                  height="15" 
                  viewBox="0 0 15 15" 
                  fill="none" 
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                >
                  <path 
                    d="M3.625 7.5C3.625 8.12132 3.12132 8.625 2.5 8.625C1.87868 8.625 1.375 8.12132 1.375 7.5C1.375 6.87868 1.87868 6.375 2.5 6.375C3.12132 6.375 3.625 6.87868 3.625 7.5ZM8.625 7.5C8.625 8.12132 8.12132 8.625 7.5 8.625C6.87868 8.625 6.375 8.12132 6.375 7.5C6.375 6.87868 6.87868 6.375 7.5 6.375C8.12132 6.375 8.625 6.87868 8.625 7.5ZM13.625 7.5C13.625 8.12132 13.1213 8.625 12.5 8.625C11.8787 8.625 11.375 8.12132 11.375 7.5C11.375 6.87868 11.8787 6.375 12.5 6.375C13.1213 6.375 13.625 6.87868 13.625 7.5Z" 
                    fill="currentColor" 
                    fillRule="evenodd" 
                    clipRule="evenodd"
                  />
                </svg>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleDownload}>
                <DownloadIcon className="h-4 w-4 mr-2" />
                Download
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => setIsDeleteDialogOpen(true)}
                className="text-destructive"
              >
                <Trash2Icon className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardFooter>
      </Card>
      
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete <span className="font-medium">{document.fileName}</span>. 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
