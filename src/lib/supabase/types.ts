export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type UserRole = "user" | "admin" | "super_admin" | "ambassador";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          user_id: string;
          role: UserRole;
          full_name: string | null;
          avatar_url: string | null;
          phone: string | null;
          email: string | null;
          college_id: string | null;
          graduation_year: number | null;
          degree: string | null;
          branch: string | null;
          bio: string | null;
          resume_url: string | null;
          skills: string[] | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["profiles"]["Row"], "id" | "created_at" | "updated_at"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
        Relationships: [];
      };
      colleges: {
        Row: {
          id: string;
          name: string;
          code: string;
          city: string | null;
          state: string | null;
          university: string | null;
          website_url: string | null;
          logo_url: string | null;
          student_count: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["colleges"]["Row"], "id" | "created_at" | "updated_at"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["colleges"]["Insert"]>;
        Relationships: [];
      };
      exams: {
        Row: {
          id: string;
          name: string;
          slug: string;
          category: string;
          description: string;
          registration_start: string;
          registration_end: string;
          exam_date: string | null;
          result_date: string | null;
          answer_key_date: string | null;
          website_url: string;
          eligibility: string | null;
          application_fee: string | null;
          syllabus_url: string | null;
          is_verified: boolean;
          status: string;
          source: string;
          agent_id: string | null;
          created_by: string | null;
          tags: string[] | null;
          meta: Json | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["exams"]["Row"], "id" | "created_at" | "updated_at" | "is_verified" | "status" | "source"> & {
          id?: string;
          is_verified?: boolean;
          status?: string;
          source?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["exams"]["Insert"]>;
        Relationships: [];
      };
      exam_subscriptions: {
        Row: {
          id: string;
          user_id: string;
          exam_id: string;
          notify_updates: boolean;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["exam_subscriptions"]["Row"], "id" | "created_at" | "notify_updates"> & {
          id?: string;
          notify_updates?: boolean;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["exam_subscriptions"]["Insert"]>;
        Relationships: [];
      };
      jobs: {
        Row: {
          id: string;
          title: string;
          slug: string;
          company_name: string;
          company_logo_url: string | null;
          description: string;
          requirements: string | null;
          location: string | null;
          remote_allowed: boolean;
          job_type: string;
          salary_min: number | null;
          salary_max: number | null;
          salary_currency: string;
          experience_min: number | null;
          experience_max: number | null;
          skills_required: string[] | null;
          eligibility: string | null;
          application_url: string | null;
          application_deadline: string | null;
          status: string;
          posted_by: string;
          college_id: string | null;
          is_featured: boolean;
          views_count: number;
          applications_count: number;
          tags: string[] | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["jobs"]["Row"], "id" | "created_at" | "updated_at" | "views_count" | "applications_count" | "is_featured" | "remote_allowed" | "salary_currency" | "status"> & {
          id?: string;
          views_count?: number;
          applications_count?: number;
          is_featured?: boolean;
          remote_allowed?: boolean;
          salary_currency?: string;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["jobs"]["Insert"]>;
        Relationships: [];
      };
      job_applications: {
        Row: {
          id: string;
          job_id: string;
          user_id: string;
          resume_url: string | null;
          cover_letter: string | null;
          status: string;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["job_applications"]["Row"], "id" | "created_at" | "updated_at" | "status"> & {
          id?: string;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["job_applications"]["Insert"]>;
        Relationships: [];
      };
      placement_drives: {
        Row: {
          id: string;
          title: string;
          slug: string;
          company_name: string;
          company_logo_url: string | null;
          description: string;
          college_id: string;
          drive_date: string | null;
          registration_deadline: string | null;
          eligibility: string | null;
          min_cgpa: number | null;
          package_offered: string | null;
          roles_offered: string[] | null;
          process_rounds: string[] | null;
          status: string;
          created_by: string;
          views_count: number;
          applications_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["placement_drives"]["Row"], "id" | "created_at" | "updated_at" | "views_count" | "applications_count" | "status"> & {
          id?: string;
          views_count?: number;
          applications_count?: number;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["placement_drives"]["Insert"]>;
        Relationships: [];
      };
      placement_applications: {
        Row: {
          id: string;
          drive_id: string;
          user_id: string;
          resume_url: string | null;
          status: string;
          current_round: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["placement_applications"]["Row"], "id" | "created_at" | "updated_at" | "status"> & {
          id?: string;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["placement_applications"]["Insert"]>;
        Relationships: [];
      };
      blogs: {
        Row: {
          id: string;
          title: string;
          slug: string;
          content: string;
          excerpt: string | null;
          cover_image_url: string | null;
          author_id: string;
          status: string;
          exam_tags: string[] | null;
          tags: string[] | null;
          is_featured: boolean;
          likes_count: number;
          comments_count: number;
          views_count: number;
          published_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["blogs"]["Row"], "id" | "created_at" | "updated_at" | "likes_count" | "comments_count" | "views_count" | "is_featured" | "status"> & {
          id?: string;
          likes_count?: number;
          comments_count?: number;
          views_count?: number;
          is_featured?: boolean;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["blogs"]["Insert"]>;
        Relationships: [];
      };
      blog_likes: {
        Row: {
          id: string;
          blog_id: string;
          user_id: string;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["blog_likes"]["Row"], "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["blog_likes"]["Insert"]>;
        Relationships: [];
      };
      blog_comments: {
        Row: {
          id: string;
          blog_id: string;
          user_id: string;
          parent_id: string | null;
          content: string;
          is_edited: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["blog_comments"]["Row"], "id" | "created_at" | "updated_at" | "is_edited"> & {
          id?: string;
          is_edited?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["blog_comments"]["Insert"]>;
        Relationships: [];
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          type: string;
          title: string;
          message: string;
          link: string | null;
          reference_id: string | null;
          is_read: boolean;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["notifications"]["Row"], "id" | "created_at" | "is_read"> & {
          id?: string;
          is_read?: boolean;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["notifications"]["Insert"]>;
        Relationships: [];
      };
      user_documents: {
        Row: {
          id: string;
          user_id: string;
          file_name: string;
          file_type: string;
          file_size: number;
          storage_path: string;
          category: string;
          description: string | null;
          is_verified: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["user_documents"]["Row"], "id" | "created_at" | "updated_at" | "is_verified" | "category"> & {
          id?: string;
          is_verified?: boolean;
          category?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["user_documents"]["Insert"]>;
        Relationships: [];
      };
      agents: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          source_type: string;
          source_config: Json;
          schedule: string | null;
          status: string;
          last_run_at: string | null;
          last_run_result: string | null;
          exams_found: number;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["agents"]["Row"], "id" | "created_at" | "updated_at" | "exams_found" | "status"> & {
          id?: string;
          exams_found?: number;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["agents"]["Insert"]>;
        Relationships: [];
      };
      agent_logs: {
        Row: {
          id: string;
          agent_id: string;
          status: string;
          exams_found: number;
          exams_added: number;
          error_message: string | null;
          details: Json | null;
          duration_ms: number | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["agent_logs"]["Row"], "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["agent_logs"]["Insert"]>;
        Relationships: [];
      };
      bookmarks: {
        Row: {
          id: string;
          user_id: string;
          entity_type: string;
          entity_id: string;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["bookmarks"]["Row"], "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["bookmarks"]["Insert"]>;
        Relationships: [];
      };
    };
    Views: {};
    Functions: {
      get_user_role: {
        Args: Record<string, never>;
        Returns: string;
      };
    };
    Enums: {
      user_role: UserRole;
      job_type: "full_time" | "part_time" | "internship" | "contract" | "freelance";
      job_status: "draft" | "active" | "closed" | "expired";
      application_status: "pending" | "shortlisted" | "rejected" | "accepted" | "withdrawn";
      drive_status: "upcoming" | "ongoing" | "completed" | "cancelled";
      exam_status: "pending" | "approved" | "rejected";
      notification_type: "exam" | "job" | "placement" | "blog" | "document" | "system";
      agent_status: "active" | "paused" | "error" | "disabled";
      blog_status: "draft" | "published" | "archived";
    };
    CompositeTypes: {};
  };
}
