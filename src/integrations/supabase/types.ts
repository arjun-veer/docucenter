export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      exams: {
        Row: {
          answer_key_date: string | null
          application_fee: string | null
          category: string
          created_at: string | null
          description: string
          eligibility: string | null
          exam_date: string | null
          id: string
          is_verified: boolean | null
          name: string
          registration_end_date: string
          registration_start_date: string
          result_date: string | null
          updated_at: string | null
          website_url: string
        }
        Insert: {
          answer_key_date?: string | null
          application_fee?: string | null
          category: string
          created_at?: string | null
          description: string
          eligibility?: string | null
          exam_date?: string | null
          id?: string
          is_verified?: boolean | null
          name: string
          registration_end_date: string
          registration_start_date: string
          result_date?: string | null
          updated_at?: string | null
          website_url: string
        }
        Update: {
          answer_key_date?: string | null
          application_fee?: string | null
          category?: string
          created_at?: string | null
          description?: string
          eligibility?: string | null
          exam_date?: string | null
          id?: string
          is_verified?: boolean | null
          name?: string
          registration_end_date?: string
          registration_start_date?: string
          result_date?: string | null
          updated_at?: string | null
          website_url?: string
        }
        Relationships: []
      }
      pending_exams: {
        Row: {
          answer_key_date: string | null
          application_fee: string | null
          category: string
          created_at: string
          description: string
          eligibility: string | null
          exam_date: string | null
          id: string
          name: string
          registration_end_date: string
          registration_start_date: string
          result_date: string | null
          status: string
          updated_at: string
          website_url: string
        }
        Insert: {
          answer_key_date?: string | null
          application_fee?: string | null
          category: string
          created_at?: string
          description: string
          eligibility?: string | null
          exam_date?: string | null
          id?: string
          name: string
          registration_end_date: string
          registration_start_date: string
          result_date?: string | null
          status?: string
          updated_at?: string
          website_url: string
        }
        Update: {
          answer_key_date?: string | null
          application_fee?: string | null
          category?: string
          created_at?: string
          description?: string
          eligibility?: string | null
          exam_date?: string | null
          id?: string
          name?: string
          registration_end_date?: string
          registration_start_date?: string
          result_date?: string | null
          status?: string
          updated_at?: string
          website_url?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          id: number
          role: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: never
          role?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: never
          role?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_documents: {
        Row: {
          category: string | null
          created_at: string | null
          file_name: string
          file_size: number
          file_type: string
          id: string
          storage_path: string
          user_id: string
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          file_name: string
          file_size: number
          file_type: string
          id?: string
          storage_path: string
          user_id: string
        }
        Update: {
          category?: string | null
          created_at?: string | null
          file_name?: string
          file_size?: number
          file_type?: string
          id?: string
          storage_path?: string
          user_id?: string
        }
        Relationships: []
      }
      user_exam_subscriptions: {
        Row: {
          created_at: string | null
          exam_id: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          exam_id: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          exam_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_exam_subscriptions_exam_id_fkey"
            columns: ["exam_id"]
            isOneToOne: false
            referencedRelation: "exams"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      exam_category:
        | "Engineering"
        | "Medical"
        | "Civil Services"
        | "Banking"
        | "Railways"
        | "Defence"
        | "Teaching"
        | "State Services"
        | "School Board"
        | "Law"
        | "Management"
        | "Other"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
