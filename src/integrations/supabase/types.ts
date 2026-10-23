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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      admin_setup: {
        Row: {
          code_sha256: string
          expires_at: string
          id: number
        }
        Insert: {
          code_sha256: string
          expires_at: string
          id?: number
        }
        Update: {
          code_sha256?: string
          expires_at?: string
          id?: number
        }
        Relationships: []
      }
      admin_users: {
        Row: {
          created_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          user_id?: string
        }
        Relationships: []
      }
      bookings: {
        Row: {
          admin_notes: string | null
          car_label: string | null
          car_slug: string | null
          created_at: string
          customer_name: string
          customer_phone: string
          end_date: string | null
          id: string
          language: string | null
          location: string | null
          notes: string | null
          price_per_day_aed: number | null
          source: string
          start_date: string | null
          status: string
          total_aed: number | null
          updated_at: string
        }
        Insert: {
          admin_notes?: string | null
          car_label?: string | null
          car_slug?: string | null
          created_at?: string
          customer_name: string
          customer_phone: string
          end_date?: string | null
          id?: string
          language?: string | null
          location?: string | null
          notes?: string | null
          price_per_day_aed?: number | null
          source?: string
          start_date?: string | null
          status?: string
          total_aed?: number | null
          updated_at?: string
        }
        Update: {
          admin_notes?: string | null
          car_label?: string | null
          car_slug?: string | null
          created_at?: string
          customer_name?: string
          customer_phone?: string
          end_date?: string | null
          id?: string
          language?: string | null
          location?: string | null
          notes?: string | null
          price_per_day_aed?: number | null
          source?: string
          start_date?: string | null
          status?: string
          total_aed?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      car_overrides: {
        Row: {
          available: boolean
          category: string | null
          description_de: string | null
          description_en: string | null
          featured: boolean | null
          hidden: boolean
          mileage_limit_km: number | null
          name: string | null
          price_aed: number | null
          slug: string
          updated_at: string
        }
        Insert: {
          available?: boolean
          category?: string | null
          description_de?: string | null
          description_en?: string | null
          featured?: boolean | null
          hidden?: boolean
          mileage_limit_km?: number | null
          name?: string | null
          price_aed?: number | null
          slug: string
          updated_at?: string
        }
        Update: {
          available?: boolean
          category?: string | null
          description_de?: string | null
          description_en?: string | null
          featured?: boolean | null
          hidden?: boolean
          mileage_limit_km?: number | null
          name?: string | null
          price_aed?: number | null
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          aed_per_eur: number
          email: string
          id: number
          markup_tiers: Json
          phone_number: string
          tiktok_url: string
          updated_at: string
          whatsapp_number: string
        }
        Insert: {
          aed_per_eur?: number
          email?: string
          id?: number
          markup_tiers?: Json
          phone_number?: string
          tiktok_url?: string
          updated_at?: string
          whatsapp_number?: string
        }
        Update: {
          aed_per_eur?: number
          email?: string
          id?: number
          markup_tiers?: Json
          phone_number?: string
          tiktok_url?: string
          updated_at?: string
          whatsapp_number?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      admin_setup_open: { Args: never; Returns: boolean }
      claim_admin: { Args: { setup_code: string }; Returns: boolean }
      is_admin: { Args: never; Returns: boolean }
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
