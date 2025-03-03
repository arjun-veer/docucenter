
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { ExamCategory } from "@/lib/types";

export default function ManualExamForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    category: "Engineering" as ExamCategory,
    description: "",
    registrationStartDate: "",
    registrationEndDate: "",
    examDate: "",
    resultDate: "",
    websiteUrl: "",
    eligibility: "",
    applicationFee: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.name || !formData.description || !formData.registrationStartDate || 
        !formData.registrationEndDate || !formData.websiteUrl) {
      toast.error("Please fill all required fields");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const { error } = await supabase
        .from('exams')
        .insert({
          name: formData.name,
          category: formData.category,
          description: formData.description,
          registration_start_date: new Date(formData.registrationStartDate).toISOString(),
          registration_end_date: new Date(formData.registrationEndDate).toISOString(),
          exam_date: formData.examDate ? new Date(formData.examDate).toISOString() : null,
          result_date: formData.resultDate ? new Date(formData.resultDate).toISOString() : null,
          website_url: formData.websiteUrl,
          eligibility: formData.eligibility || null,
          application_fee: formData.applicationFee || null,
          is_verified: true
        });
      
      if (error) throw error;
      
      toast.success("Exam added successfully");
      
      // Reset form
      setFormData({
        name: "",
        category: "Engineering" as ExamCategory,
        description: "",
        registrationStartDate: "",
        registrationEndDate: "",
        examDate: "",
        resultDate: "",
        websiteUrl: "",
        eligibility: "",
        applicationFee: ""
      });
      
    } catch (error: any) {
      console.error("Error adding exam:", error);
      toast.error(`Failed to add exam: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add Exam Manually</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Exam Name *</label>
            <Input 
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Category *</label>
            <Select 
              value={formData.category} 
              onValueChange={(value) => handleSelectChange("category", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Engineering">Engineering</SelectItem>
                <SelectItem value="Medical">Medical</SelectItem>
                <SelectItem value="Civil Services">Civil Services</SelectItem>
                <SelectItem value="Banking">Banking</SelectItem>
                <SelectItem value="Railways">Railways</SelectItem>
                <SelectItem value="Defence">Defence</SelectItem>
                <SelectItem value="Teaching">Teaching</SelectItem>
                <SelectItem value="State Services">State Services</SelectItem>
                <SelectItem value="School Board">School Board</SelectItem>
                <SelectItem value="Law">Law</SelectItem>
                <SelectItem value="Management">Management</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Description *</label>
            <Textarea 
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              required
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Registration Start Date *</label>
              <Input 
                type="date"
                name="registrationStartDate"
                value={formData.registrationStartDate}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Registration End Date *</label>
              <Input 
                type="date"
                name="registrationEndDate"
                value={formData.registrationEndDate}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Exam Date</label>
              <Input 
                type="date"
                name="examDate"
                value={formData.examDate}
                onChange={handleChange}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Result Date</label>
              <Input 
                type="date"
                name="resultDate"
                value={formData.resultDate}
                onChange={handleChange}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Website URL *</label>
            <Input 
              type="url"
              name="websiteUrl"
              value={formData.websiteUrl}
              onChange={handleChange}
              placeholder="https://example.com"
              required
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Eligibility</label>
            <Textarea 
              name="eligibility"
              value={formData.eligibility}
              onChange={handleChange}
              rows={2}
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Application Fee</label>
            <Input 
              name="applicationFee"
              value={formData.applicationFee}
              onChange={handleChange}
              placeholder="e.g., ₹500 for General, ₹250 for SC/ST"
            />
          </div>
        </CardContent>
        
        <CardFooter>
          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? "Adding..." : "Add Exam"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
