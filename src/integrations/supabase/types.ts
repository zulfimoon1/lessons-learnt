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
      class_schedules: {
        Row: {
          class_date: string
          class_time: string
          created_at: string
          description: string | null
          duration_minutes: number
          grade: string
          id: string
          lesson_topic: string
          school: string
          subject: string
          teacher_id: string
        }
        Insert: {
          class_date: string
          class_time: string
          created_at?: string
          description?: string | null
          duration_minutes?: number
          grade: string
          id?: string
          lesson_topic: string
          school: string
          subject: string
          teacher_id: string
        }
        Update: {
          class_date?: string
          class_time?: string
          created_at?: string
          description?: string | null
          duration_minutes?: number
          grade?: string
          id?: string
          lesson_topic?: string
          school?: string
          subject?: string
          teacher_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "class_schedules_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teachers"
            referencedColumns: ["id"]
          },
        ]
      }
      feedback: {
        Row: {
          additional_comments: string | null
          class_schedule_id: string
          educational_growth: number
          emotional_state: string
          id: string
          interest: number
          is_anonymous: boolean
          student_id: string | null
          student_name: string | null
          submitted_at: string
          suggestions: string | null
          understanding: number
          what_went_well: string | null
        }
        Insert: {
          additional_comments?: string | null
          class_schedule_id: string
          educational_growth: number
          emotional_state: string
          id?: string
          interest: number
          is_anonymous?: boolean
          student_id?: string | null
          student_name?: string | null
          submitted_at?: string
          suggestions?: string | null
          understanding: number
          what_went_well?: string | null
        }
        Update: {
          additional_comments?: string | null
          class_schedule_id?: string
          educational_growth?: number
          emotional_state?: string
          id?: string
          interest?: number
          is_anonymous?: boolean
          student_id?: string | null
          student_name?: string | null
          submitted_at?: string
          suggestions?: string | null
          understanding?: number
          what_went_well?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "feedback_class_schedule_id_fkey"
            columns: ["class_schedule_id"]
            isOneToOne: false
            referencedRelation: "class_schedules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "feedback_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      mental_health_alerts: {
        Row: {
          alert_type: string
          content: string
          created_at: string
          grade: string
          id: string
          is_reviewed: boolean
          reviewed_at: string | null
          reviewed_by: string | null
          school: string
          severity_level: number
          source_id: string
          source_table: string
          student_id: string | null
          student_name: string
        }
        Insert: {
          alert_type?: string
          content: string
          created_at?: string
          grade: string
          id?: string
          is_reviewed?: boolean
          reviewed_at?: string | null
          reviewed_by?: string | null
          school: string
          severity_level?: number
          source_id: string
          source_table: string
          student_id?: string | null
          student_name: string
        }
        Update: {
          alert_type?: string
          content?: string
          created_at?: string
          grade?: string
          id?: string
          is_reviewed?: boolean
          reviewed_at?: string | null
          reviewed_by?: string | null
          school?: string
          severity_level?: number
          source_id?: string
          source_table?: string
          student_id?: string | null
          student_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "mental_health_alerts_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_admins: {
        Row: {
          created_at: string
          email: string
          id: string
          name: string
          password_hash: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          name: string
          password_hash: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          name?: string
          password_hash?: string
        }
        Relationships: []
      }
      school_psychologists: {
        Row: {
          availability_hours: string | null
          created_at: string
          email: string
          id: string
          name: string
          office_location: string | null
          phone: string | null
          school: string
          updated_at: string
        }
        Insert: {
          availability_hours?: string | null
          created_at?: string
          email: string
          id?: string
          name: string
          office_location?: string | null
          phone?: string | null
          school: string
          updated_at?: string
        }
        Update: {
          availability_hours?: string | null
          created_at?: string
          email?: string
          id?: string
          name?: string
          office_location?: string | null
          phone?: string | null
          school?: string
          updated_at?: string
        }
        Relationships: []
      }
      students: {
        Row: {
          created_at: string
          full_name: string
          grade: string
          id: string
          password_hash: string
          school: string
        }
        Insert: {
          created_at?: string
          full_name: string
          grade: string
          id?: string
          password_hash: string
          school: string
        }
        Update: {
          created_at?: string
          full_name?: string
          grade?: string
          id?: string
          password_hash?: string
          school?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          amount: number
          created_at: string
          currency: string
          current_period_end: string | null
          current_period_start: string | null
          id: string
          plan_type: string
          school_name: string
          status: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan_type?: string
          school_name: string
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan_type?: string
          school_name?: string
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      teachers: {
        Row: {
          created_at: string
          email: string
          id: string
          name: string
          password_hash: string
          role: string | null
          school: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          name: string
          password_hash: string
          role?: string | null
          school: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          name?: string
          password_hash?: string
          role?: string | null
          school?: string
        }
        Relationships: []
      }
      weekly_summaries: {
        Row: {
          academic_concerns: string | null
          emotional_concerns: string | null
          grade: string
          id: string
          school: string
          student_id: string | null
          student_name: string
          submitted_at: string
          week_start_date: string
        }
        Insert: {
          academic_concerns?: string | null
          emotional_concerns?: string | null
          grade: string
          id?: string
          school: string
          student_id?: string | null
          student_name: string
          submitted_at?: string
          week_start_date: string
        }
        Update: {
          academic_concerns?: string | null
          emotional_concerns?: string | null
          grade?: string
          id?: string
          school?: string
          student_id?: string | null
          student_name?: string
          submitted_at?: string
          week_start_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "weekly_summaries_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      feedback_analytics: {
        Row: {
          anonymous_responses: number | null
          avg_growth: number | null
          avg_interest: number | null
          avg_understanding: number | null
          class_date: string | null
          grade: string | null
          lesson_topic: string | null
          named_responses: number | null
          school: string | null
          subject: string | null
          total_responses: number | null
        }
        Relationships: []
      }
      school_statistics: {
        Row: {
          school: string | null
          total_classes: number | null
          total_grades: number | null
          total_subjects: number | null
          total_teachers: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      detect_self_harm_language: {
        Args: { text_content: string }
        Returns: number
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
