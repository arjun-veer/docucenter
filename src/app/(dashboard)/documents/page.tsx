"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/features/auth/store";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { DocumentCard } from "@/features/documents/components/document-card";
import { DocumentUploader } from "@/features/documents/components/document-uploader";
import { DOCUMENT_CATEGORIES } from "@/lib/constants";
import { formatFileSize } from "@/lib/formatters";
import { FileText, HardDrive } from "lucide-react";
import type { UserDocument } from "@/lib/types";

export default function DocumentsPage() {
  const { user } = useAuthStore();
  const [documents, setDocuments] = useState<UserDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("All");
  const supabase = createClient();

  async function fetchDocuments() {
    if (!user) return;
    setLoading(true);

    const { data, error } = await supabase
      .from("user_documents")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setDocuments(
        data.map((d) => ({
          id: d.id,
          userId: d.user_id,
          fileName: d.file_name,
          fileType: d.file_type,
          fileSize: d.file_size,
          storagePath: d.storage_path,
          category: d.category,
          description: d.description,
          isVerified: d.is_verified,
          createdAt: d.created_at,
        }))
      );
    }

    setLoading(false);
  }

  useEffect(() => {
    fetchDocuments();
  }, [user]);

  function handleDeleted(id: string) {
    setDocuments((prev) => prev.filter((d) => d.id !== id));
  }

  const totalStorage = documents.reduce((sum, d) => sum + d.fileSize, 0);

  const filteredDocuments =
    activeTab === "All"
      ? documents
      : documents.filter((d) => d.category === activeTab);

  const categoryTabs = ["All", ...DOCUMENT_CATEGORIES];

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Documents"
        description="Upload and manage your important documents."
      />

      {/* Storage indicator */}
      <div className="flex items-center gap-2 mb-6 text-sm text-muted-foreground">
        <HardDrive className="h-4 w-4" />
        <span>
          {documents.length} document{documents.length !== 1 ? "s" : ""} &middot;{" "}
          {formatFileSize(totalStorage)} used
        </span>
      </div>

      {/* Upload section */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-lg">Upload Document</CardTitle>
        </CardHeader>
        <CardContent>
          <DocumentUploader onUploaded={fetchDocuments} />
        </CardContent>
      </Card>

      {/* Documents grid with category tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex-wrap h-auto gap-1 mb-6">
          {categoryTabs.map((tab) => {
            const count =
              tab === "All"
                ? documents.length
                : documents.filter((d) => d.category === tab).length;
            return (
              <TabsTrigger key={tab} value={tab} className="text-xs">
                {tab}
                {count > 0 && (
                  <span className="ml-1 text-muted-foreground">({count})</span>
                )}
              </TabsTrigger>
            );
          })}
        </TabsList>

        {categoryTabs.map((tab) => (
          <TabsContent key={tab} value={tab}>
            {loading ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-44 w-full rounded-xl" />
                ))}
              </div>
            ) : filteredDocuments.length === 0 ? (
              <EmptyState
                icon={<FileText />}
                title={
                  tab === "All"
                    ? "No documents yet"
                    : `No ${tab.toLowerCase()} documents`
                }
                description={
                  tab === "All"
                    ? "Upload your first document using the form above."
                    : `Upload a document with the "${tab}" category to see it here.`
                }
              />
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filteredDocuments.map((doc) => (
                  <DocumentCard
                    key={doc.id}
                    document={doc}
                    onDeleted={handleDeleted}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
