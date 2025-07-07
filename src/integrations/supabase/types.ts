export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      attendance: {
        Row: {
          check_in: string | null
          check_out: string | null
          created_at: string | null
          date: string
          employee_id: string
          id: string
          is_out_of_town_access: boolean | null
          location_address: string | null
          location_lat: number | null
          location_lng: number | null
          notes: string | null
          status: Database["public"]["Enums"]["attendance_status"] | null
          updated_at: string | null
        }
        Insert: {
          check_in?: string | null
          check_out?: string | null
          created_at?: string | null
          date: string
          employee_id: string
          id?: string
          is_out_of_town_access?: boolean | null
          location_address?: string | null
          location_lat?: number | null
          location_lng?: number | null
          notes?: string | null
          status?: Database["public"]["Enums"]["attendance_status"] | null
          updated_at?: string | null
        }
        Update: {
          check_in?: string | null
          check_out?: string | null
          created_at?: string | null
          date?: string
          employee_id?: string
          id?: string
          is_out_of_town_access?: boolean | null
          location_address?: string | null
          location_lat?: number | null
          location_lng?: number | null
          notes?: string | null
          status?: Database["public"]["Enums"]["attendance_status"] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "attendance_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["employee_id"]
          },
        ]
      }
      geofence_locations: {
        Row: {
          created_at: string | null
          created_by: string | null
          id: string
          is_active: boolean | null
          lat: number
          lng: number
          name: string
          radius: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          lat: number
          lng: number
          name: string
          radius?: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          lat?: number
          lng?: number
          name?: string
          radius?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      leave_requests: {
        Row: {
          applied_date: string | null
          approved_by: string | null
          approved_date: string | null
          created_at: string | null
          days: number
          employee_id: string
          employee_name: string
          end_date: string
          id: string
          reason: string
          rejection_reason: string | null
          start_date: string
          status: Database["public"]["Enums"]["request_status"] | null
          type: Database["public"]["Enums"]["leave_type"]
          updated_at: string | null
        }
        Insert: {
          applied_date?: string | null
          approved_by?: string | null
          approved_date?: string | null
          created_at?: string | null
          days: number
          employee_id: string
          employee_name: string
          end_date: string
          id?: string
          reason: string
          rejection_reason?: string | null
          start_date: string
          status?: Database["public"]["Enums"]["request_status"] | null
          type: Database["public"]["Enums"]["leave_type"]
          updated_at?: string | null
        }
        Update: {
          applied_date?: string | null
          approved_by?: string | null
          approved_date?: string | null
          created_at?: string | null
          days?: number
          employee_id?: string
          employee_name?: string
          end_date?: string
          id?: string
          reason?: string
          rejection_reason?: string | null
          start_date?: string
          status?: Database["public"]["Enums"]["request_status"] | null
          type?: Database["public"]["Enums"]["leave_type"]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "leave_requests_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["employee_id"]
          },
        ]
      }
      out_of_town_requests: {
        Row: {
          applied_date: string | null
          approved_by: string | null
          approved_date: string | null
          created_at: string | null
          destination: string
          duration_days: number
          employee_id: string
          employee_name: string
          end_date: string
          id: string
          purpose: string
          rejection_reason: string | null
          start_date: string
          status: Database["public"]["Enums"]["request_status"] | null
          updated_at: string | null
        }
        Insert: {
          applied_date?: string | null
          approved_by?: string | null
          approved_date?: string | null
          created_at?: string | null
          destination: string
          duration_days: number
          employee_id: string
          employee_name: string
          end_date: string
          id?: string
          purpose: string
          rejection_reason?: string | null
          start_date: string
          status?: Database["public"]["Enums"]["request_status"] | null
          updated_at?: string | null
        }
        Update: {
          applied_date?: string | null
          approved_by?: string | null
          approved_date?: string | null
          created_at?: string | null
          destination?: string
          duration_days?: number
          employee_id?: string
          employee_name?: string
          end_date?: string
          id?: string
          purpose?: string
          rejection_reason?: string | null
          start_date?: string
          status?: Database["public"]["Enums"]["request_status"] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "out_of_town_requests_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["employee_id"]
          },
        ]
      }
      payroll: {
        Row: {
          allowances: number | null
          attended_days: number | null
          basic_salary: number
          created_at: string | null
          employee_id: string
          employee_name: string
          gross_salary: number
          id: string
          month: number
          net_salary: number
          overtime: number | null
          social_security: number | null
          tax: number | null
          updated_at: string | null
          working_days: number | null
          year: number
        }
        Insert: {
          allowances?: number | null
          attended_days?: number | null
          basic_salary: number
          created_at?: string | null
          employee_id: string
          employee_name: string
          gross_salary: number
          id?: string
          month: number
          net_salary: number
          overtime?: number | null
          social_security?: number | null
          tax?: number | null
          updated_at?: string | null
          working_days?: number | null
          year: number
        }
        Update: {
          allowances?: number | null
          attended_days?: number | null
          basic_salary?: number
          created_at?: string | null
          employee_id?: string
          employee_name?: string
          gross_salary?: number
          id?: string
          month?: number
          net_salary?: number
          overtime?: number | null
          social_security?: number | null
          tax?: number | null
          updated_at?: string | null
          working_days?: number | null
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "payroll_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["employee_id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar: string | null
          created_at: string | null
          department: string
          email: string
          employee_id: string
          id: string
          is_out_of_town: boolean | null
          join_date: string
          name: string
          position: string
          role: Database["public"]["Enums"]["app_role"] | null
          salary: number
          updated_at: string | null
        }
        Insert: {
          avatar?: string | null
          created_at?: string | null
          department: string
          email: string
          employee_id: string
          id: string
          is_out_of_town?: boolean | null
          join_date?: string
          name: string
          position: string
          role?: Database["public"]["Enums"]["app_role"] | null
          salary?: number
          updated_at?: string | null
        }
        Update: {
          avatar?: string | null
          created_at?: string | null
          department?: string
          email?: string
          employee_id?: string
          id?: string
          is_out_of_town?: boolean | null
          join_date?: string
          name?: string
          position?: string
          role?: Database["public"]["Enums"]["app_role"] | null
          salary?: number
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_employee_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_user_role: {
        Args: Record<PropertyKey, never>
        Returns: Database["public"]["Enums"]["app_role"]
      }
    }
    Enums: {
      app_role: "admin" | "employee"
      attendance_status: "present" | "late" | "absent"
      leave_type: "annual" | "sick" | "personal" | "maternity"
      request_status: "pending" | "approved" | "rejected"
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
    Enums: {
      app_role: ["admin", "employee"],
      attendance_status: ["present", "late", "absent"],
      leave_type: ["annual", "sick", "personal", "maternity"],
      request_status: ["pending", "approved", "rejected"],
    },
  },
} as const
