export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      emotion_logs: {
        Row: {
          confidence: number
          created_at: string
          emotion: string
          focus_level: number | null
          id: string
          mood: string | null
          notes: string | null
          session_id: string | null
          source: string | null
          stress_level: number | null
          user_id: string
        }
        Insert: {
          confidence?: number
          created_at?: string
          emotion: string
          focus_level?: number | null
          id?: string
          mood?: string | null
          notes?: string | null
          session_id?: string | null
          source?: string | null
          stress_level?: number | null
          user_id: string
        }
        Update: {
          confidence?: number
          created_at?: string
          emotion?: string
          focus_level?: number | null
          id?: string
          mood?: string | null
          notes?: string | null
          session_id?: string | null
          source?: string | null
          stress_level?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "emotion_logs_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "study_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "emotion_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      schedule_session_completions: {
        Row: {
          completed_at: string
          completion_percentage: number | null
          created_at: string
          day: string
          duration_seconds: number
          id: string
          schedule_id: string
          session_index: number
          status: string | null
          subject: string
          target_duration_seconds: number | null
          user_id: string
        }
        Insert: {
          completed_at?: string
          completion_percentage?: number | null
          created_at?: string
          day: string
          duration_seconds: number
          id?: string
          schedule_id: string
          session_index: number
          status?: string | null
          subject: string
          target_duration_seconds?: number | null
          user_id: string
        }
        Update: {
          completed_at?: string
          completion_percentage?: number | null
          created_at?: string
          day?: string
          duration_seconds?: number
          id?: string
          schedule_id?: string
          session_index?: number
          status?: string | null
          subject?: string
          target_duration_seconds?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "schedule_session_completions_schedule_id_fkey"
            columns: ["schedule_id"]
            isOneToOne: false
            referencedRelation: "study_schedules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "schedule_session_completions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      study_reminders: {
        Row: {
          created_at: string
          days_of_week: string[]
          id: string
          is_active: boolean
          time: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          days_of_week?: string[]
          id?: string
          is_active?: boolean
          time: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          days_of_week?: string[]
          id?: string
          is_active?: boolean
          time?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "study_reminders_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      study_schedules: {
        Row: {
          created_at: string
          end_date: string
          id: string
          priorities: string[] | null
          start_date: string
          status: string
          subjects: Json
          tips: string[] | null
          total_hours: number
          updated_at: string
          user_id: string
          weekly_plan: Json
        }
        Insert: {
          created_at?: string
          end_date: string
          id?: string
          priorities?: string[] | null
          start_date: string
          status?: string
          subjects: Json
          tips?: string[] | null
          total_hours: number
          updated_at?: string
          user_id: string
          weekly_plan: Json
        }
        Update: {
          created_at?: string
          end_date?: string
          id?: string
          priorities?: string[] | null
          start_date?: string
          status?: string
          subjects?: Json
          tips?: string[] | null
          total_hours?: number
          updated_at?: string
          user_id?: string
          weekly_plan?: Json
        }
        Relationships: [
          {
            foreignKeyName: "study_schedules_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      study_sessions: {
        Row: {
          created_at: string
          duration_seconds: number | null
          emotion_detected: string | null
          id: string
          login_timestamp: string
          logout_timestamp: string | null
          notes: string | null
          subjects_studied: string[] | null
          user_id: string
        }
        Insert: {
          created_at?: string
          duration_seconds?: number | null
          emotion_detected?: string | null
          id?: string
          login_timestamp: string
          logout_timestamp?: string | null
          notes?: string | null
          subjects_studied?: string[] | null
          user_id: string
        }
        Update: {
          created_at?: string
          duration_seconds?: number | null
          emotion_detected?: string | null
          id?: string
          login_timestamp?: string
          logout_timestamp?: string | null
          notes?: string | null
          subjects_studied?: string[] | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "study_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
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
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
