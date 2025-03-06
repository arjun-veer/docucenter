
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import ExamCard from "./ExamCard";
import { useAuth } from "@/lib/stores/auth-store";

interface PendingExam {
  id: string;
  name: string;
  category: string;
  description: string;
  registration_start_date: string;
  registration_end_date: string;
  exam_date: string | null;
  result_date: string | null;
  answer_key_date: string | null;
  website_url: string;
  eligibility: string | null;
  application_fee: string | null;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
}

const PendingExamsList = () => {
  const [pendingExams, setPendingExams] = useState<PendingExam[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { currentUser } = useAuth();

  const fetchPendingExams = async () => {
    setIsLoading(true);
    try {
      // Verify user is admin before fetching
      if (currentUser?.role !== 'admin') {
        toast.error("Only admin users can access pending exams");
        setIsLoading(false);
        setPendingExams([]);
        return;
      }

      const { data, error } = await supabase
        .from('pending_exams')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setPendingExams(data || []);
      console.log("Fetched pending exams:", data);
    } catch (error: any) {
      console.error('Error fetching pending exams:', error);
      toast.error('Failed to load pending exams: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser?.role === 'admin') {
      fetchPendingExams();
    } else {
      setIsLoading(false);
      setPendingExams([]);
    }
  }, [currentUser]);

  const approveExam = async (pendingExam: PendingExam) => {
    try {
      // Verify user is admin before approving
      if (currentUser?.role !== 'admin') {
        toast.error("Only admin users can approve exams");
        return;
      }
      
      // First update the pending exam status
      const { error: updateError } = await supabase
        .from('pending_exams')
        .update({ status: 'approved' })
        .eq('id', pendingExam.id);
      
      if (updateError) throw updateError;
      
      // Then add it to the main exams table
      const { error: insertError } = await supabase.from('exams').insert({
        name: pendingExam.name,
        category: pendingExam.category,
        description: pendingExam.description,
        registration_start_date: pendingExam.registration_start_date,
        registration_end_date: pendingExam.registration_end_date,
        exam_date: pendingExam.exam_date,
        result_date: pendingExam.result_date,
        answer_key_date: pendingExam.answer_key_date,
        website_url: pendingExam.website_url,
        eligibility: pendingExam.eligibility,
        application_fee: pendingExam.application_fee,
        is_verified: true
      });
      
      if (insertError) throw insertError;
      
      toast.success('Exam approved and added to the database');
      fetchPendingExams();
    } catch (error: any) {
      console.error('Error approving exam:', error);
      toast.error(`Failed to approve exam: ${error.message}`);
    }
  };

  const rejectExam = async (pendingExamId: string) => {
    try {
      // Verify user is admin before rejecting
      if (currentUser?.role !== 'admin') {
        toast.error("Only admin users can reject exams");
        return;
      }
      
      const { error } = await supabase
        .from('pending_exams')
        .update({ status: 'rejected' })
        .eq('id', pendingExamId);
      
      if (error) throw error;
      
      toast.success('Exam rejected');
      fetchPendingExams();
    } catch (error: any) {
      console.error('Error rejecting exam:', error);
      toast.error(`Failed to reject exam: ${error.message}`);
    }
  };

  // If user is not admin, show access denied
  if (currentUser?.role !== 'admin') {
    return (
      <Card>
        <CardContent className="py-10">
          <div className="text-center text-muted-foreground">
            You don't have permission to view pending exams.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {isLoading ? (
        <Card>
          <CardContent className="py-10">
            <div className="text-center text-muted-foreground">
              Loading pending exams...
            </div>
          </CardContent>
        </Card>
      ) : pendingExams.length === 0 ? (
        <Card>
          <CardContent className="py-10">
            <div className="text-center text-muted-foreground">
              No pending exams to review
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Pending Exams for Review ({pendingExams.length})</h2>
          
          {pendingExams.map((exam) => (
            <ExamCard 
              key={exam.id} 
              exam={exam} 
              onApprove={approveExam} 
              onReject={rejectExam}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default PendingExamsList;
