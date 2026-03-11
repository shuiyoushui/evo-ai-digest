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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      ai_config: {
        Row: {
          ai_api_key_name: string
          ai_endpoint: string
          config_key: string
          enabled: boolean
          id: string
          model: string
          scraper_api_key_name: string
          scraper_endpoint: string
          system_prompt: string
          updated_at: string
        }
        Insert: {
          ai_api_key_name?: string
          ai_endpoint?: string
          config_key: string
          enabled?: boolean
          id?: string
          model?: string
          scraper_api_key_name?: string
          scraper_endpoint?: string
          system_prompt?: string
          updated_at?: string
        }
        Update: {
          ai_api_key_name?: string
          ai_endpoint?: string
          config_key?: string
          enabled?: boolean
          id?: string
          model?: string
          scraper_api_key_name?: string
          scraper_endpoint?: string
          system_prompt?: string
          updated_at?: string
        }
        Relationships: []
      }
      banner_slides: {
        Row: {
          active: boolean
          cta: string
          gradient: string
          id: string
          link: string
          sort_order: number
          title: string
        }
        Insert: {
          active?: boolean
          cta?: string
          gradient: string
          id: string
          link?: string
          sort_order?: number
          title: string
        }
        Update: {
          active?: boolean
          cta?: string
          gradient?: string
          id?: string
          link?: string
          sort_order?: number
          title?: string
        }
        Relationships: []
      }
      categories: {
        Row: {
          icon: string
          id: string
          label: string
          sort_order: number | null
        }
        Insert: {
          icon?: string
          id: string
          label: string
          sort_order?: number | null
        }
        Update: {
          icon?: string
          id?: string
          label?: string
          sort_order?: number | null
        }
        Relationships: []
      }
      display_modules: {
        Row: {
          description: string
          enabled: boolean
          id: string
          label: string
          sort_order: number
        }
        Insert: {
          description?: string
          enabled?: boolean
          id: string
          label: string
          sort_order?: number
        }
        Update: {
          description?: string
          enabled?: boolean
          id?: string
          label?: string
          sort_order?: number
        }
        Relationships: []
      }
      llm_recommendations: {
        Row: {
          created_at: string | null
          enabled: boolean | null
          id: string
          name: string
          sort_order: number | null
          tag: string | null
        }
        Insert: {
          created_at?: string | null
          enabled?: boolean | null
          id?: string
          name: string
          sort_order?: number | null
          tag?: string | null
        }
        Update: {
          created_at?: string | null
          enabled?: boolean | null
          id?: string
          name?: string
          sort_order?: number | null
          tag?: string | null
        }
        Relationships: []
      }
      products: {
        Row: {
          benefits: string[] | null
          category_id: string | null
          company_founded: string | null
          company_funding: string | null
          company_location: string | null
          company_name: string | null
          created_at: string | null
          description: string | null
          featured: boolean | null
          id: string
          launch_date: string | null
          logo_url: string | null
          maker_avatar: string | null
          maker_name: string | null
          maker_title: string | null
          name: string
          prompts: Json | null
          skills: Json | null
          slogan: string | null
          status: string | null
          tags: string[] | null
          updated_at: string | null
          user_id: string | null
          verified: boolean | null
          video_url: string | null
          views: number | null
          website: string | null
        }
        Insert: {
          benefits?: string[] | null
          category_id?: string | null
          company_founded?: string | null
          company_funding?: string | null
          company_location?: string | null
          company_name?: string | null
          created_at?: string | null
          description?: string | null
          featured?: boolean | null
          id?: string
          launch_date?: string | null
          logo_url?: string | null
          maker_avatar?: string | null
          maker_name?: string | null
          maker_title?: string | null
          name: string
          prompts?: Json | null
          skills?: Json | null
          slogan?: string | null
          status?: string | null
          tags?: string[] | null
          updated_at?: string | null
          user_id?: string | null
          verified?: boolean | null
          video_url?: string | null
          views?: number | null
          website?: string | null
        }
        Update: {
          benefits?: string[] | null
          category_id?: string | null
          company_founded?: string | null
          company_funding?: string | null
          company_location?: string | null
          company_name?: string | null
          created_at?: string | null
          description?: string | null
          featured?: boolean | null
          id?: string
          launch_date?: string | null
          logo_url?: string | null
          maker_avatar?: string | null
          maker_name?: string | null
          maker_title?: string | null
          name?: string
          prompts?: Json | null
          skills?: Json | null
          slogan?: string | null
          status?: string | null
          tags?: string[] | null
          updated_at?: string | null
          user_id?: string | null
          verified?: boolean | null
          video_url?: string | null
          views?: number | null
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          csdn_bound: boolean | null
          csdn_username: string | null
          email: string | null
          id: string
          nickname: string
          phone: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          csdn_bound?: boolean | null
          csdn_username?: string | null
          email?: string | null
          id: string
          nickname?: string
          phone?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          csdn_bound?: boolean | null
          csdn_username?: string | null
          email?: string | null
          id?: string
          nickname?: string
          phone?: string | null
        }
        Relationships: []
      }
      ranking_weights: {
        Row: {
          comments: number
          decay: number
          id: string
          updated_at: string | null
          upvotes: number
          views: number
        }
        Insert: {
          comments?: number
          decay?: number
          id?: string
          updated_at?: string | null
          upvotes?: number
          views?: number
        }
        Update: {
          comments?: number
          decay?: number
          id?: string
          updated_at?: string | null
          upvotes?: number
          views?: number
        }
        Relationships: []
      }
      service_categories: {
        Row: {
          created_at: string | null
          description: string
          enabled: boolean
          icon: string
          id: string
          label: string
          parent_id: string | null
          sort_order: number
        }
        Insert: {
          created_at?: string | null
          description?: string
          enabled?: boolean
          icon?: string
          id?: string
          label: string
          parent_id?: string | null
          sort_order?: number
        }
        Update: {
          created_at?: string | null
          description?: string
          enabled?: boolean
          icon?: string
          id?: string
          label?: string
          parent_id?: string | null
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "service_categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "service_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      upvotes: {
        Row: {
          created_at: string | null
          id: string
          product_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          product_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          product_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "upvotes_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_products_with_upvotes: {
        Args: { filter_category?: string; filter_status?: string }
        Returns: {
          benefits: string[]
          category_id: string
          company_founded: string
          company_funding: string
          company_location: string
          company_name: string
          created_at: string
          description: string
          featured: boolean
          id: string
          launch_date: string
          logo_url: string
          maker_avatar: string
          maker_name: string
          maker_title: string
          name: string
          prompts: Json
          skills: Json
          slogan: string
          status: string
          tags: string[]
          updated_at: string
          upvote_count: number
          user_id: string
          verified: boolean
          video_url: string
          views: number
          website: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
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
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
