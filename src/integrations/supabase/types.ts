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
      audit_log: {
        Row: {
          id: string
          new_data: Json | null
          old_data: Json | null
          operation: string
          table_name: string
          timestamp: string | null
          user_id: string | null
        }
        Insert: {
          id?: string
          new_data?: Json | null
          old_data?: Json | null
          operation: string
          table_name: string
          timestamp?: string | null
          user_id?: string | null
        }
        Update: {
          id?: string
          new_data?: Json | null
          old_data?: Json | null
          operation?: string
          table_name?: string
          timestamp?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          created_at: string
          id: string
          message: string
          sender_name: string
          sender_type: string
          sent_at: string
          session_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          sender_name: string
          sender_type: string
          sent_at?: string
          session_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          sender_name?: string
          sender_type?: string
          sent_at?: string
          session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "live_chat_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
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
        Relationships: []
      }
      discount_codes: {
        Row: {
          code: string
          created_at: string | null
          created_by: string | null
          current_uses: number | null
          description: string | null
          discount_percent: number
          duration_months: number | null
          expires_at: string | null
          id: string
          is_active: boolean | null
          max_uses: number | null
          school_name: string | null
          updated_at: string | null
        }
        Insert: {
          code: string
          created_at?: string | null
          created_by?: string | null
          current_uses?: number | null
          description?: string | null
          discount_percent: number
          duration_months?: number | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          max_uses?: number | null
          school_name?: string | null
          updated_at?: string | null
        }
        Update: {
          code?: string
          created_at?: string | null
          created_by?: string | null
          current_uses?: number | null
          description?: string | null
          discount_percent?: number
          duration_months?: number | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          max_uses?: number | null
          school_name?: string | null
          updated_at?: string | null
        }
        Relationships: []
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
        ]
      }
      invitations: {
        Row: {
          accepted_at: string | null
          created_at: string
          email: string
          expires_at: string
          id: string
          invite_token: string
          invited_by: string | null
          role: string
          school: string
          status: string
          subscription_id: string | null
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string
          email: string
          expires_at?: string
          id?: string
          invite_token?: string
          invited_by?: string | null
          role?: string
          school: string
          status?: string
          subscription_id?: string | null
        }
        Update: {
          accepted_at?: string | null
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          invite_token?: string
          invited_by?: string | null
          role?: string
          school?: string
          status?: string
          subscription_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invitations_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      live_chat_sessions: {
        Row: {
          created_at: string | null
          doctor_id: string | null
          ended_at: string | null
          grade: string | null
          id: string
          is_anonymous: boolean | null
          school: string
          started_at: string | null
          status: string | null
          student_id: string | null
          student_name: string | null
        }
        Insert: {
          created_at?: string | null
          doctor_id?: string | null
          ended_at?: string | null
          grade?: string | null
          id?: string
          is_anonymous?: boolean | null
          school: string
          started_at?: string | null
          status?: string | null
          student_id?: string | null
          student_name?: string | null
        }
        Update: {
          created_at?: string | null
          doctor_id?: string | null
          ended_at?: string | null
          grade?: string | null
          id?: string
          is_anonymous?: boolean | null
          school?: string
          started_at?: string | null
          status?: string | null
          student_id?: string | null
          student_name?: string | null
        }
        Relationships: []
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
        Relationships: []
      }
      mental_health_articles: {
        Row: {
          age_group: string
          content: string
          created_at: string
          created_by: string
          id: string
          school: string
          title: string
          updated_at: string
        }
        Insert: {
          age_group: string
          content: string
          created_at?: string
          created_by: string
          id?: string
          school: string
          title: string
          updated_at?: string
        }
        Update: {
          age_group?: string
          content?: string
          created_at?: string
          created_by?: string
          id?: string
          school?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      payment_notifications: {
        Row: {
          admin_email: string
          created_at: string
          id: string
          notification_type: string
          scheduled_for: string
          school_name: string
          sent_at: string | null
          subscription_id: string | null
        }
        Insert: {
          admin_email: string
          created_at?: string
          id?: string
          notification_type: string
          scheduled_for: string
          school_name: string
          sent_at?: string | null
          subscription_id?: string | null
        }
        Update: {
          admin_email?: string
          created_at?: string
          id?: string
          notification_type?: string
          scheduled_for?: string
          school_name?: string
          sent_at?: string | null
          subscription_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payment_notifications_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string | null
          full_name: string | null
          grade: string | null
          id: string
          role: string | null
          school: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          full_name?: string | null
          grade?: string | null
          id: string
          role?: string | null
          school?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          full_name?: string | null
          grade?: string | null
          id?: string
          role?: string | null
          school?: string | null
          updated_at?: string | null
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
          discount_code_id: string | null
          discount_expires_at: string | null
          id: string
          original_amount: number | null
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
          discount_code_id?: string | null
          discount_expires_at?: string | null
          id?: string
          original_amount?: number | null
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
          discount_code_id?: string | null
          discount_expires_at?: string | null
          id?: string
          original_amount?: number | null
          plan_type?: string
          school_name?: string
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_discount_code_id_fkey"
            columns: ["discount_code_id"]
            isOneToOne: false
            referencedRelation: "discount_codes"
            referencedColumns: ["id"]
          },
        ]
      }
      support_chat_messages: {
        Row: {
          created_at: string
          id: string
          message: string
          sender_name: string
          sender_type: string
          sent_at: string
          session_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          sender_name: string
          sender_type: string
          sent_at?: string
          session_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          sender_name?: string
          sender_type?: string
          sent_at?: string
          session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "support_chat_messages_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "support_chat_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      support_chat_sessions: {
        Row: {
          created_at: string
          ended_at: string | null
          id: string
          school_name: string
          status: string
          teacher_email: string
          teacher_name: string
          teacher_role: string
        }
        Insert: {
          created_at?: string
          ended_at?: string | null
          id?: string
          school_name: string
          status?: string
          teacher_email: string
          teacher_name: string
          teacher_role?: string
        }
        Update: {
          created_at?: string
          ended_at?: string | null
          id?: string
          school_name?: string
          status?: string
          teacher_email?: string
          teacher_name?: string
          teacher_role?: string
        }
        Relationships: []
      }
      teacher_profiles: {
        Row: {
          created_at: string | null
          email: string
          id: string
          is_available: boolean | null
          license_number: string | null
          name: string
          role: string | null
          school: string
          specialization: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id: string
          is_available?: boolean | null
          license_number?: string | null
          name: string
          role?: string | null
          school: string
          specialization?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          is_available?: boolean | null
          license_number?: string | null
          name?: string
          role?: string | null
          school?: string
          specialization?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      teachers: {
        Row: {
          created_at: string
          email: string
          id: string
          is_available: boolean | null
          license_number: string | null
          name: string
          password_hash: string
          role: string
          school: string
          specialization: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          is_available?: boolean | null
          license_number?: string | null
          name: string
          password_hash: string
          role?: string
          school: string
          specialization?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          is_available?: boolean | null
          license_number?: string | null
          name?: string
          password_hash?: string
          role?: string
          school?: string
          specialization?: string | null
        }
        Relationships: []
      }
      transactions: {
        Row: {
          amount: number
          created_at: string
          created_by: string | null
          currency: string
          description: string | null
          id: string
          school_name: string
          status: string
          transaction_type: string
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          created_by?: string | null
          currency?: string
          description?: string | null
          id?: string
          school_name: string
          status: string
          transaction_type: string
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          created_by?: string | null
          currency?: string
          description?: string | null
          id?: string
          school_name?: string
          status?: string
          transaction_type?: string
          updated_at?: string
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
        Relationships: []
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
      security_dashboard: {
        Row: {
          recent_alerts: number | null
          recent_security_events: number | null
          total_students: number | null
          total_teachers: number | null
          unreviewed_alerts: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      check_platform_admin_access: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      check_rate_limit: {
        Args: { operation_type: string; max_attempts?: number }
        Returns: boolean
      }
      decrypt_sensitive_data: {
        Args: { encrypted_content: string }
        Returns: string
      }
      detect_self_harm_language: {
        Args: { text_content: string }
        Returns: number
      }
      encrypt_sensitive_data: {
        Args: { content: string }
        Returns: string
      }
      enhanced_security_check: {
        Args: Record<PropertyKey, never>
        Returns: {
          security_score: number
          violations: string[]
          recommendations: string[]
        }[]
      }
      get_current_user_info: {
        Args: Record<PropertyKey, never>
        Returns: {
          user_role: string
          user_school: string
        }[]
      }
      get_platform_stats: {
        Args: { stat_type: string }
        Returns: {
          count: number
        }[]
      }
      get_security_dashboard_data: {
        Args: Record<PropertyKey, never>
        Returns: {
          total_events: number
          high_severity_events: number
          medium_severity_events: number
          low_severity_events: number
          recent_violations: number
        }[]
      }
      get_user_school: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      is_platform_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_platform_admin_context: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_platform_admin_user: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_teacher_in_school: {
        Args: { target_school: string }
        Returns: boolean
      }
      is_zulfimoon_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      log_critical_security_event: {
        Args: {
          event_type: string
          user_id: string
          details: string
          severity?: string
        }
        Returns: undefined
      }
      log_enhanced_security_event: {
        Args: {
          event_type: string
          user_id?: string
          details?: string
          severity?: string
          ip_address?: string
          user_agent?: string
        }
        Returns: undefined
      }
      log_security_event: {
        Args: {
          event_type: string
          user_id?: string
          details?: string
          severity?: string
        }
        Returns: undefined
      }
      log_security_event_enhanced: {
        Args: {
          event_type: string
          user_id?: string
          details?: string
          severity?: string
          metadata?: Json
        }
        Returns: undefined
      }
      log_security_event_safe: {
        Args: {
          event_type: string
          user_id?: string
          details?: string
          severity?: string
        }
        Returns: undefined
      }
      platform_admin_create_discount_code: {
        Args: {
          admin_email_param: string
          code_param: string
          discount_percent_param: number
          description_param?: string
          max_uses_param?: number
          expires_at_param?: string
          is_active_param?: boolean
          school_name_param?: string
          created_by_param?: string
        }
        Returns: {
          code: string
          created_at: string | null
          created_by: string | null
          current_uses: number | null
          description: string | null
          discount_percent: number
          duration_months: number | null
          expires_at: string | null
          id: string
          is_active: boolean | null
          max_uses: number | null
          school_name: string | null
          updated_at: string | null
        }
      }
      platform_admin_create_discount_code_with_duration: {
        Args: {
          admin_email_param: string
          code_param: string
          discount_percent_param: number
          description_param?: string
          max_uses_param?: number
          expires_at_param?: string
          is_active_param?: boolean
          school_name_param?: string
          created_by_param?: string
          duration_months_param?: number
        }
        Returns: {
          code: string
          created_at: string | null
          created_by: string | null
          current_uses: number | null
          description: string | null
          discount_percent: number
          duration_months: number | null
          expires_at: string | null
          id: string
          is_active: boolean | null
          max_uses: number | null
          school_name: string | null
          updated_at: string | null
        }
      }
      platform_admin_delete_discount_code: {
        Args: { admin_email_param: string; code_id_param: string }
        Returns: boolean
      }
      platform_admin_delete_school: {
        Args: { school_name_param: string; admin_email_param: string }
        Returns: Json
      }
      platform_admin_get_discount_codes: {
        Args: { admin_email_param: string }
        Returns: {
          code: string
          created_at: string | null
          created_by: string | null
          current_uses: number | null
          description: string | null
          discount_percent: number
          duration_months: number | null
          expires_at: string | null
          id: string
          is_active: boolean | null
          max_uses: number | null
          school_name: string | null
          updated_at: string | null
        }[]
      }
      platform_admin_update_discount_code: {
        Args: {
          admin_email_param: string
          code_id_param: string
          code_param?: string
          discount_percent_param?: number
          description_param?: string
          max_uses_param?: number
          expires_at_param?: string
          is_active_param?: boolean
          school_name_param?: string
        }
        Returns: {
          code: string
          created_at: string | null
          created_by: string | null
          current_uses: number | null
          description: string | null
          discount_percent: number
          duration_months: number | null
          expires_at: string | null
          id: string
          is_active: boolean | null
          max_uses: number | null
          school_name: string | null
          updated_at: string | null
        }
      }
      process_expired_discounts: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      safe_get_teacher_info: {
        Args: { user_uuid: string }
        Returns: {
          user_role: string
          user_school: string
        }[]
      }
      schedule_discount_notifications: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      set_platform_admin_context: {
        Args: { admin_email: string }
        Returns: undefined
      }
      validate_admin_operation: {
        Args: { operation_name: string }
        Returns: boolean
      }
      validate_mental_health_access: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
    }
    Enums: {
      app_role: "teacher" | "admin" | "doctor"
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
    Enums: {
      app_role: ["teacher", "admin", "doctor"],
    },
  },
} as const
