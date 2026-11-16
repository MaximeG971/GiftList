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
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      categories: {
        Row: {
          created_at: string
          family_id: string | null
          id: string
          is_default: boolean
          name: string
          position: number
          slug: string
        }
        Insert: {
          created_at?: string
          family_id?: string | null
          id?: string
          is_default?: boolean
          name: string
          position?: number
          slug: string
        }
        Update: {
          created_at?: string
          family_id?: string | null
          id?: string
          is_default?: boolean
          name?: string
          position?: number
          slug?: string
        }
        Relationships: [
          {
            foreignKeyName: "categories_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
        ]
      }
      families: {
        Row: {
          accent_color: string | null
          avatar_path: string | null
          avatar_type: string
          created_at: string
          created_by: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          accent_color?: string | null
          avatar_path?: string | null
          avatar_type?: string
          created_at?: string
          created_by?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          accent_color?: string | null
          avatar_path?: string | null
          avatar_type?: string
          created_at?: string
          created_by?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      family_members: {
        Row: {
          family_id: string
          id: string
          joined_at: string
          left_at: string | null
          role: Database["public"]["Enums"]["family_role"]
          status: Database["public"]["Enums"]["member_status"]
          user_id: string
        }
        Insert: {
          family_id: string
          id?: string
          joined_at?: string
          left_at?: string | null
          role?: Database["public"]["Enums"]["family_role"]
          status?: Database["public"]["Enums"]["member_status"]
          user_id: string
        }
        Update: {
          family_id?: string
          id?: string
          joined_at?: string
          left_at?: string | null
          role?: Database["public"]["Enums"]["family_role"]
          status?: Database["public"]["Enums"]["member_status"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "family_members_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
        ]
      }
      gifts: {
        Row: {
          category_id: string
          color: string | null
          comment: string | null
          created_at: string
          family_id: string
          id: string
          image_path: string | null
          image_url: string | null
          merchant: string | null
          price: number | null
          quantity: number
          received_status: Database["public"]["Enums"]["gift_received_status"]
          size: string | null
          title: string
          updated_at: string
          url: string | null
          visibility_status: Database["public"]["Enums"]["gift_visibility"]
          wishlist_id: string
        }
        Insert: {
          category_id: string
          color?: string | null
          comment?: string | null
          created_at?: string
          family_id: string
          id?: string
          image_path?: string | null
          image_url?: string | null
          merchant?: string | null
          price?: number | null
          quantity?: number
          received_status?: Database["public"]["Enums"]["gift_received_status"]
          size?: string | null
          title: string
          updated_at?: string
          url?: string | null
          visibility_status?: Database["public"]["Enums"]["gift_visibility"]
          wishlist_id: string
        }
        Update: {
          category_id?: string
          color?: string | null
          comment?: string | null
          created_at?: string
          family_id?: string
          id?: string
          image_path?: string | null
          image_url?: string | null
          merchant?: string | null
          price?: number | null
          quantity?: number
          received_status?: Database["public"]["Enums"]["gift_received_status"]
          size?: string | null
          title?: string
          updated_at?: string
          url?: string | null
          visibility_status?: Database["public"]["Enums"]["gift_visibility"]
          wishlist_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "gifts_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gifts_wishlist_id_family_id_fkey"
            columns: ["wishlist_id", "family_id"]
            isOneToOne: false
            referencedRelation: "wishlists"
            referencedColumns: ["id", "family_id"]
          },
        ]
      }
      invitations: {
        Row: {
          created_at: string
          created_by: string | null
          expires_at: string
          family_id: string
          id: string
          revoked_at: string | null
          status: Database["public"]["Enums"]["invitation_status"]
          token_hash: string
          used_at: string | null
          used_by: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          expires_at?: string
          family_id: string
          id?: string
          revoked_at?: string | null
          status?: Database["public"]["Enums"]["invitation_status"]
          token_hash: string
          used_at?: string | null
          used_by?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          expires_at?: string
          family_id?: string
          id?: string
          revoked_at?: string | null
          status?: Database["public"]["Enums"]["invitation_status"]
          token_hash?: string
          used_at?: string | null
          used_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invitations_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          expires_at: string
          family_id: string
          id: string
          payload: Json
          read_at: string | null
          recipient_user_id: string
          type: string
        }
        Insert: {
          created_at?: string
          expires_at?: string
          family_id: string
          id?: string
          payload?: Json
          read_at?: string | null
          recipient_user_id: string
          type: string
        }
        Update: {
          created_at?: string
          expires_at?: string
          family_id?: string
          id?: string
          payload?: Json
          read_at?: string | null
          recipient_user_id?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
        ]
      }
      profile_managers: {
        Row: {
          created_at: string
          family_id: string
          family_member_id: string
          profile_id: string
        }
        Insert: {
          created_at?: string
          family_id: string
          family_member_id: string
          profile_id: string
        }
        Update: {
          created_at?: string
          family_id?: string
          family_member_id?: string
          profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profile_managers_family_member_id_family_id_fkey"
            columns: ["family_member_id", "family_id"]
            isOneToOne: false
            referencedRelation: "family_members"
            referencedColumns: ["id", "family_id"]
          },
          {
            foreignKeyName: "profile_managers_profile_id_family_id_fkey"
            columns: ["profile_id", "family_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id", "family_id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_path: string | null
          created_at: string
          family_id: string
          first_name: string
          id: string
          status: Database["public"]["Enums"]["profile_status"]
          type: Database["public"]["Enums"]["profile_type"]
          updated_at: string
          user_id: string | null
        }
        Insert: {
          avatar_path?: string | null
          created_at?: string
          family_id: string
          first_name: string
          id?: string
          status?: Database["public"]["Enums"]["profile_status"]
          type: Database["public"]["Enums"]["profile_type"]
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          avatar_path?: string | null
          created_at?: string
          family_id?: string
          first_name?: string
          id?: string
          status?: Database["public"]["Enums"]["profile_status"]
          type?: Database["public"]["Enums"]["profile_type"]
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
        ]
      }
      user_preferences: {
        Row: {
          updated_at: string
          user_id: string
          wishlist_display_mode: string
        }
        Insert: {
          updated_at?: string
          user_id: string
          wishlist_display_mode?: string
        }
        Update: {
          updated_at?: string
          user_id?: string
          wishlist_display_mode?: string
        }
        Relationships: []
      }
      wishlists: {
        Row: {
          created_at: string
          family_id: string
          id: string
          profile_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          family_id: string
          id?: string
          profile_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          family_id?: string
          id?: string
          profile_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "wishlists_profile_id_family_id_fkey"
            columns: ["profile_id", "family_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id", "family_id"]
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
      family_role: "admin" | "member"
      gift_received_status: "wished" | "received"
      gift_visibility: "active" | "hidden"
      invitation_status: "pending" | "used" | "revoked"
      member_status: "active" | "removed"
      profile_status: "active" | "inactive" | "archived"
      profile_type: "adult" | "child"
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      family_role: ["admin", "member"],
      gift_received_status: ["wished", "received"],
      gift_visibility: ["active", "hidden"],
      invitation_status: ["pending", "used", "revoked"],
      member_status: ["active", "removed"],
      profile_status: ["active", "inactive", "archived"],
      profile_type: ["adult", "child"],
    },
  },
} as const
