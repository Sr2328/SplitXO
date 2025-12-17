// // export type Json =
// //   | string
// //   | number
// //   | boolean
// //   | null
// //   | { [key: string]: Json | undefined }
// //   | Json[]

// // export type Database = {
// //   // Allows to automatically instantiate createClient with right options
// //   // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
// //   __InternalSupabase: {
// //     PostgrestVersion: "13.0.5"
// //   }
// //   public: {
// //     Tables: {
// //       expense_splits: {
// //         Row: {
// //           amount: number
// //           created_at: string
// //           expense_id: string
// //           id: string
// //           is_settled: boolean
// //           user_id: string
// //         }
// //         Insert: {
// //           amount: number
// //           created_at?: string
// //           expense_id: string
// //           id?: string
// //           is_settled?: boolean
// //           user_id: string
// //         }
// //         Update: {
// //           amount?: number
// //           created_at?: string
// //           expense_id?: string
// //           id?: string
// //           is_settled?: boolean
// //           user_id?: string
// //         }
// //         Relationships: [
// //           {
// //             foreignKeyName: "expense_splits_expense_id_fkey"
// //             columns: ["expense_id"]
// //             isOneToOne: false
// //             referencedRelation: "expenses"
// //             referencedColumns: ["id"]
// //           },
// //           {
// //             foreignKeyName: "expense_splits_user_id_fkey"
// //             columns: ["user_id"]
// //             isOneToOne: false
// //             referencedRelation: "profiles"
// //             referencedColumns: ["user_id"]
// //           },
// //         ]
// //       }
// //       expenses: {
// //         Row: {
// //           amount: number
// //           category: Database["public"]["Enums"]["expense_category"]
// //           created_at: string
// //           created_by: string | null
// //           currency: string
// //           expense_date: string
// //           group_id: string
// //           id: string
// //           notes: string | null
// //           paid_by: string
// //           receipt_url: string | null
// //           title: string
// //           updated_at: string
// //         }
// //         Insert: {
// //           amount: number
// //           category?: Database["public"]["Enums"]["expense_category"]
// //           created_at?: string
// //           created_by?: string | null
// //           currency?: string
// //           expense_date?: string
// //           group_id: string
// //           id?: string
// //           notes?: string | null
// //           paid_by: string
// //           receipt_url?: string | null
// //           title: string
// //           updated_at?: string
// //         }
// //         Update: {
// //           amount?: number
// //           category?: Database["public"]["Enums"]["expense_category"]
// //           created_at?: string
// //           created_by?: string | null
// //           currency?: string
// //           expense_date?: string
// //           group_id?: string
// //           id?: string
// //           notes?: string | null
// //           paid_by?: string
// //           receipt_url?: string | null
// //           title?: string
// //           updated_at?: string
// //         }
// //         Relationships: [
// //           {
// //             foreignKeyName: "expenses_created_by_fkey"
// //             columns: ["created_by"]
// //             isOneToOne: false
// //             referencedRelation: "profiles"
// //             referencedColumns: ["user_id"]
// //           },
// //           {
// //             foreignKeyName: "expenses_group_id_fkey"
// //             columns: ["group_id"]
// //             isOneToOne: false
// //             referencedRelation: "groups"
// //             referencedColumns: ["id"]
// //           },
// //           {
// //             foreignKeyName: "expenses_paid_by_fkey"
// //             columns: ["paid_by"]
// //             isOneToOne: false
// //             referencedRelation: "profiles"
// //             referencedColumns: ["user_id"]
// //           },
// //         ]
// //       }
// //       group_members: {
// //         Row: {
// //           group_id: string
// //           id: string
// //           joined_at: string
// //           role: string
// //           user_id: string
// //         }
// //         Insert: {
// //           group_id: string
// //           id?: string
// //           joined_at?: string
// //           role?: string
// //           user_id: string
// //         }
// //         Update: {
// //           group_id?: string
// //           id?: string
// //           joined_at?: string
// //           role?: string
// //           user_id?: string
// //         }
// //         Relationships: [
// //           {
// //             foreignKeyName: "group_members_group_id_fkey"
// //             columns: ["group_id"]
// //             isOneToOne: false
// //             referencedRelation: "groups"
// //             referencedColumns: ["id"]
// //           },
// //           {
// //             foreignKeyName: "group_members_user_id_fkey"
// //             columns: ["user_id"]
// //             isOneToOne: false
// //             referencedRelation: "profiles"
// //             referencedColumns: ["user_id"]
// //           },
// //         ]
// //       }
// //       groups: {
// //         Row: {
// //           created_at: string
// //           created_by: string | null
// //           description: string | null
// //           id: string
// //           image_url: string | null
// //           name: string
// //           updated_at: string
// //         }
// //         Insert: {
// //           created_at?: string
// //           created_by?: string | null
// //           description?: string | null
// //           id?: string
// //           image_url?: string | null
// //           name: string
// //           updated_at?: string
// //         }
// //         Update: {
// //           created_at?: string
// //           created_by?: string | null
// //           description?: string | null
// //           id?: string
// //           image_url?: string | null
// //           name?: string
// //           updated_at?: string
// //         }
// //         Relationships: []
// //       }
// //       notifications: {
// //         Row: {
// //           created_at: string
// //           data: Json | null
// //           id: string
// //           is_read: boolean
// //           message: string
// //           title: string
// //           type: string
// //           user_id: string
// //         }
// //         Insert: {
// //           created_at?: string
// //           data?: Json | null
// //           id?: string
// //           is_read?: boolean
// //           message: string
// //           title: string
// //           type: string
// //           user_id: string
// //         }
// //         Update: {
// //           created_at?: string
// //           data?: Json | null
// //           id?: string
// //           is_read?: boolean
// //           message?: string
// //           title?: string
// //           type?: string
// //           user_id?: string
// //         }
// //         Relationships: [
// //           {
// //             foreignKeyName: "notifications_user_id_fkey"
// //             columns: ["user_id"]
// //             isOneToOne: false
// //             referencedRelation: "profiles"
// //             referencedColumns: ["user_id"]
// //           },
// //         ]
// //       }
// //       personal_expenses: {
// //         Row: {
// //           amount: number
// //           category: string
// //           created_at: string
// //           expense_date: string
// //           id: string
// //           notes: string | null
// //           title: string
// //           updated_at: string
// //           user_id: string
// //         }
// //         Insert: {
// //           amount: number
// //           category?: string
// //           created_at?: string
// //           expense_date?: string
// //           id?: string
// //           notes?: string | null
// //           title: string
// //           updated_at?: string
// //           user_id: string
// //         }
// //         Update: {
// //           amount?: number
// //           category?: string
// //           created_at?: string
// //           expense_date?: string
// //           id?: string
// //           notes?: string | null
// //           title?: string
// //           updated_at?: string
// //           user_id?: string
// //         }
// //         Relationships: []
// //       }
// //       profiles: {
// //         Row: {
// //           avatar_url: string | null
// //           created_at: string
// //           email: string | null
// //           full_name: string | null
// //           id: string
// //           updated_at: string
// //           user_id: string
// //         }
// //         Insert: {
// //           avatar_url?: string | null
// //           created_at?: string
// //           email?: string | null
// //           full_name?: string | null
// //           id?: string
// //           updated_at?: string
// //           user_id: string
// //         }
// //         Update: {
// //           avatar_url?: string | null
// //           created_at?: string
// //           email?: string | null
// //           full_name?: string | null
// //           id?: string
// //           updated_at?: string
// //           user_id?: string
// //         }
// //         Relationships: []
// //       }
// //       settlements: {
// //         Row: {
// //           amount: number
// //           created_at: string
// //           group_id: string
// //           id: string
// //           notes: string | null
// //           paid_by: string
// //           paid_to: string
// //           receipt_url: string | null
// //           settled_at: string
// //         }
// //         Insert: {
// //           amount: number
// //           created_at?: string
// //           group_id: string
// //           id?: string
// //           notes?: string | null
// //           paid_by: string
// //           paid_to: string
// //           receipt_url?: string | null
// //           settled_at?: string
// //         }
// //         Update: {
// //           amount?: number
// //           created_at?: string
// //           group_id?: string
// //           id?: string
// //           notes?: string | null
// //           paid_by?: string
// //           paid_to?: string
// //           receipt_url?: string | null
// //           settled_at?: string
// //         }
// //         Relationships: [
// //           {
// //             foreignKeyName: "settlements_group_id_fkey"
// //             columns: ["group_id"]
// //             isOneToOne: false
// //             referencedRelation: "groups"
// //             referencedColumns: ["id"]
// //           },
// //           {
// //             foreignKeyName: "settlements_paid_by_fkey"
// //             columns: ["paid_by"]
// //             isOneToOne: false
// //             referencedRelation: "profiles"
// //             referencedColumns: ["user_id"]
// //           },
// //           {
// //             foreignKeyName: "settlements_paid_to_fkey"
// //             columns: ["paid_to"]
// //             isOneToOne: false
// //             referencedRelation: "profiles"
// //             referencedColumns: ["user_id"]
// //           },
// //         ]
// //       }
// //     }
// //     Views: {
// //       [_ in never]: never
// //     }
// //     Functions: {
// //       is_group_admin: {
// //         Args: { _group_id: string; _user_id: string }
// //         Returns: boolean
// //       }
// //       is_group_member: {
// //         Args: { _group_id: string; _user_id: string }
// //         Returns: boolean
// //       }
// //       shares_group_with: {
// //         Args: { _other_user_id: string; _user_id: string }
// //         Returns: boolean
// //       }
// //     }
// //     Enums: {
// //       expense_category:
// //         | "food"
// //         | "transport"
// //         | "entertainment"
// //         | "shopping"
// //         | "utilities"
// //         | "rent"
// //         | "travel"
// //         | "healthcare"
// //         | "other"
// //     }
// //     CompositeTypes: {
// //       [_ in never]: never
// //     }
// //   }
// // }


// // type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

// // type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

// // export type Tables<
// //   DefaultSchemaTableNameOrOptions extends
// //     | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
// //     | { schema: keyof DatabaseWithoutInternals },
// //   TableName extends DefaultSchemaTableNameOrOptions extends {
// //     schema: keyof DatabaseWithoutInternals
// //   }
// //     ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
// //         DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
// //     : never = never,
// // > = DefaultSchemaTableNameOrOptions extends {
// //   schema: keyof DatabaseWithoutInternals
// // }
// //   ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
// //       DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
// //       Row: infer R
// //     }
// //     ? R
// //     : never
// //   : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
// //         DefaultSchema["Views"])
// //     ? (DefaultSchema["Tables"] &
// //         DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
// //         Row: infer R
// //       }
// //       ? R
// //       : never
// //     : never

// // export type TablesInsert<
// //   DefaultSchemaTableNameOrOptions extends
// //     | keyof DefaultSchema["Tables"]
// //     | { schema: keyof DatabaseWithoutInternals },
// //   TableName extends DefaultSchemaTableNameOrOptions extends {
// //     schema: keyof DatabaseWithoutInternals
// //   }
// //     ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
// //     : never = never,
// // > = DefaultSchemaTableNameOrOptions extends {
// //   schema: keyof DatabaseWithoutInternals
// // }
// //   ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
// //       Insert: infer I
// //     }
// //     ? I
// //     : never
// //   : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
// //     ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
// //         Insert: infer I
// //       }
// //       ? I
// //       : never
// //     : never

// // export type TablesUpdate<
// //   DefaultSchemaTableNameOrOptions extends
// //     | keyof DefaultSchema["Tables"]
// //     | { schema: keyof DatabaseWithoutInternals },
// //   TableName extends DefaultSchemaTableNameOrOptions extends {
// //     schema: keyof DatabaseWithoutInternals
// //   }
// //     ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
// //     : never = never,
// // > = DefaultSchemaTableNameOrOptions extends {
// //   schema: keyof DatabaseWithoutInternals
// // }
// //   ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
// //       Update: infer U
// //     }
// //     ? U
// //     : never
// //   : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
// //     ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
// //         Update: infer U
// //       }
// //       ? U
// //       : never
// //     : never

// // export type Enums<
// //   DefaultSchemaEnumNameOrOptions extends
// //     | keyof DefaultSchema["Enums"]
// //     | { schema: keyof DatabaseWithoutInternals },
// //   EnumName extends DefaultSchemaEnumNameOrOptions extends {
// //     schema: keyof DatabaseWithoutInternals
// //   }
// //     ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
// //     : never = never,
// // > = DefaultSchemaEnumNameOrOptions extends {
// //   schema: keyof DatabaseWithoutInternals
// // }
// //   ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
// //   : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
// //     ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
// //     : never

// // export type CompositeTypes<
// //   PublicCompositeTypeNameOrOptions extends
// //     | keyof DefaultSchema["CompositeTypes"]
// //     | { schema: keyof DatabaseWithoutInternals },
// //   CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
// //     schema: keyof DatabaseWithoutInternals
// //   }
// //     ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
// //     : never = never,
// // > = PublicCompositeTypeNameOrOptions extends {
// //   schema: keyof DatabaseWithoutInternals
// // }
// //   ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
// //   : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
// //     ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
// //     : never

// // export const Constants = {
// //   public: {
// //     Enums: {
// //       expense_category: [
// //         "food",
// //         "transport",
// //         "entertainment",
// //         "shopping",
// //         "utilities",
// //         "rent",
// //         "travel",
// //         "healthcare",
// //         "other",
// //       ],
// //     },
// //   },
// // } as const








// //  ===============================
// // ++++++++++++++++++++++++++++++=


// export type Json =
//   | string
//   | number
//   | boolean
//   | null
//   | { [key: string]: Json | undefined }
//   | Json[]

// export type Database = {
//   __InternalSupabase: {
//     PostgrestVersion: "13.0.5"
//   }
//   public: {
//     Tables: {
//       expense_splits: {
//         Row: {
//           amount: number
//           created_at: string
//           expense_id: string
//           id: string
//           is_settled: boolean
//           user_id: string
//         }
//         Insert: {
//           amount: number
//           created_at?: string
//           expense_id: string
//           id?: string
//           is_settled?: boolean
//           user_id: string
//         }
//         Update: {
//           amount?: number
//           created_at?: string
//           expense_id?: string
//           id?: string
//           is_settled?: boolean
//           user_id?: string
//         }
//         Relationships: [
//           {
//             foreignKeyName: "expense_splits_expense_id_fkey"
//             columns: ["expense_id"]
//             isOneToOne: false
//             referencedRelation: "expenses"
//             referencedColumns: ["id"]
//           },
//           {
//             foreignKeyName: "expense_splits_user_id_fkey"
//             columns: ["user_id"]
//             isOneToOne: false
//             referencedRelation: "profiles"
//             referencedColumns: ["user_id"]
//           },
//         ]
//       }
//       expenses: {
//         Row: {
//           amount: number
//           category: Database["public"]["Enums"]["expense_category"]
//           created_at: string
//           created_by: string | null
//           currency: string
//           expense_date: string
//           group_id: string
//           id: string
//           notes: string | null
//           paid_by: string
//           receipt_url: string | null
//           title: string
//           updated_at: string
//         }
//         Insert: {
//           amount: number
//           category?: Database["public"]["Enums"]["expense_category"]
//           created_at?: string
//           created_by?: string | null
//           currency?: string
//           expense_date?: string
//           group_id: string
//           id?: string
//           notes?: string | null
//           paid_by: string
//           receipt_url?: string | null
//           title: string
//           updated_at?: string
//         }
//         Update: {
//           amount?: number
//           category?: Database["public"]["Enums"]["expense_category"]
//           created_at?: string
//           created_by?: string | null
//           currency?: string
//           expense_date?: string
//           group_id?: string
//           id?: string
//           notes?: string | null
//           paid_by?: string
//           receipt_url?: string | null
//           title?: string
//           updated_at?: string
//         }
//         Relationships: [
//           {
//             foreignKeyName: "expenses_created_by_fkey"
//             columns: ["created_by"]
//             isOneToOne: false
//             referencedRelation: "profiles"
//             referencedColumns: ["user_id"]
//           },
//           {
//             foreignKeyName: "expenses_group_id_fkey"
//             columns: ["group_id"]
//             isOneToOne: false
//             referencedRelation: "groups"
//             referencedColumns: ["id"]
//           },
//           {
//             foreignKeyName: "expenses_paid_by_fkey"
//             columns: ["paid_by"]
//             isOneToOne: false
//             referencedRelation: "profiles"
//             referencedColumns: ["user_id"]
//           },
//         ]
//       }
//       group_members: {
//         Row: {
//           group_id: string
//           id: string
//           joined_at: string
//           role: string
//           user_id: string
//         }
//         Insert: {
//           group_id: string
//           id?: string
//           joined_at?: string
//           role?: string
//           user_id: string
//         }
//         Update: {
//           group_id?: string
//           id?: string
//           joined_at?: string
//           role?: string
//           user_id?: string
//         }
//         Relationships: [
//           {
//             foreignKeyName: "group_members_group_id_fkey"
//             columns: ["group_id"]
//             isOneToOne: false
//             referencedRelation: "groups"
//             referencedColumns: ["id"]
//           },
//           {
//             foreignKeyName: "group_members_user_id_fkey"
//             columns: ["user_id"]
//             isOneToOne: false
//             referencedRelation: "profiles"
//             referencedColumns: ["user_id"]
//           },
//         ]
//       }
//       groups: {
//         Row: {
//           created_at: string
//           created_by: string | null
//           description: string | null
//           id: string
//           image_url: string | null
//           name: string
//           updated_at: string
//         }
//         Insert: {
//           created_at?: string
//           created_by?: string | null
//           description?: string | null
//           id?: string
//           image_url?: string | null
//           name: string
//           updated_at?: string
//         }
//         Update: {
//           created_at?: string
//           created_by?: string | null
//           description?: string | null
//           id?: string
//           image_url?: string | null
//           name?: string
//           updated_at?: string
//         }
//         Relationships: []
//       }
//       notifications: {
//         Row: {
//           created_at: string
//           data: Json | null
//           id: string
//           is_read: boolean
//           message: string
//           title: string
//           type: string
//           user_id: string
//         }
//         Insert: {
//           created_at?: string
//           data?: Json | null
//           id?: string
//           is_read?: boolean
//           message: string
//           title: string
//           type: string
//           user_id: string
//         }
//         Update: {
//           created_at?: string
//           data?: Json | null
//           id?: string
//           is_read?: boolean
//           message?: string
//           title?: string
//           type?: string
//           user_id?: string
//         }
//         Relationships: [
//           {
//             foreignKeyName: "notifications_user_id_fkey"
//             columns: ["user_id"]
//             isOneToOne: false
//             referencedRelation: "profiles"
//             referencedColumns: ["user_id"]
//           },
//         ]
//       }
//       personal_expenses: {
//         Row: {
//           amount: number
//           category: string
//           created_at: string
//           expense_date: string
//           id: string
//           notes: string | null
//           title: string
//           updated_at: string
//           user_id: string
//         }
//         Insert: {
//           amount: number
//           category?: string
//           created_at?: string
//           expense_date?: string
//           id?: string
//           notes?: string | null
//           title: string
//           updated_at?: string
//           user_id: string
//         }
//         Update: {
//           amount?: number
//           category?: string
//           created_at?: string
//           expense_date?: string
//           id?: string
//           notes?: string | null
//           title?: string
//           updated_at?: string
//           user_id?: string
//         }
//         Relationships: []
//       }
//       profiles: {
//         Row: {
//           avatar_url: string | null
//           created_at: string
//           email: string | null
//           full_name: string | null
//           id: string
//           updated_at: string
//           user_id: string
//         }
//         Insert: {
//           avatar_url?: string | null
//           created_at?: string
//           email?: string | null
//           full_name?: string | null
//           id?: string
//           updated_at?: string
//           user_id: string
//         }
//         Update: {
//           avatar_url?: string | null
//           created_at?: string
//           email?: string | null
//           full_name?: string | null
//           id?: string
//           updated_at?: string
//           user_id?: string
//         }
//         Relationships: []
//       }
//       settlements: {
//         Row: {
//           amount: number
//           created_at: string
//           group_id: string
//           id: string
//           notes: string | null
//           paid_by: string
//           paid_to: string
//           receipt_url: string | null
//           settled_at: string
//         }
//         Insert: {
//           amount: number
//           created_at?: string
//           group_id: string
//           id?: string
//           notes?: string | null
//           paid_by: string
//           paid_to: string
//           receipt_url?: string | null
//           settled_at?: string
//         }
//         Update: {
//           amount?: number
//           created_at?: string
//           group_id?: string
//           id?: string
//           notes?: string | null
//           paid_by?: string
//           paid_to?: string
//           receipt_url?: string | null
//           settled_at?: string
//         }
//         Relationships: [
//           {
//             foreignKeyName: "settlements_group_id_fkey"
//             columns: ["group_id"]
//             isOneToOne: false
//             referencedRelation: "groups"
//             referencedColumns: ["id"]
//           },
//           {
//             foreignKeyName: "settlements_paid_by_fkey"
//             columns: ["paid_by"]
//             isOneToOne: false
//             referencedRelation: "profiles"
//             referencedColumns: ["user_id"]
//           },
//           {
//             foreignKeyName: "settlements_paid_to_fkey"
//             columns: ["paid_to"]
//             isOneToOne: false
//             referencedRelation: "profiles"
//             referencedColumns: ["user_id"]
//           },
//         ]
//       }
//       settings: {
//         Row: {
//           id: string
//           user_id: string
//           notification_expense_updates: boolean
//           notification_settlement_reminders: boolean
//           notification_group_invites: boolean
//           notification_weekly_report: boolean
//           privacy_show_profile: boolean
//           privacy_show_activity: boolean
//           privacy_two_factor_auth: boolean
//           preference_currency: string
//           preference_default_category: Database["public"]["Enums"]["expense_category"]
//           preference_auto_settle: boolean
//           preference_theme: string
//           created_at: string
//           updated_at: string
//         }
//         Insert: {
//           id?: string
//           user_id: string
//           notification_expense_updates?: boolean
//           notification_settlement_reminders?: boolean
//           notification_group_invites?: boolean
//           notification_weekly_report?: boolean
//           privacy_show_profile?: boolean
//           privacy_show_activity?: boolean
//           privacy_two_factor_auth?: boolean
//           preference_currency?: string
//           preference_default_category?: Database["public"]["Enums"]["expense_category"]
//           preference_auto_settle?: boolean
//           preference_theme?: string
//           created_at?: string
//           updated_at?: string
//         }
//         Update: {
//           id?: string
//           user_id?: string
//           notification_expense_updates?: boolean
//           notification_settlement_reminders?: boolean
//           notification_group_invites?: boolean
//           notification_weekly_report?: boolean
//           privacy_show_profile?: boolean
//           privacy_show_activity?: boolean
//           privacy_two_factor_auth?: boolean
//           preference_currency?: string
//           preference_default_category?: Database["public"]["Enums"]["expense_category"]
//           preference_auto_settle?: boolean
//           preference_theme?: string
//           created_at?: string
//           updated_at?: string
//         }
//         Relationships: [
//           {
//             foreignKeyName: "settings_user_id_fkey"
//             columns: ["user_id"]
//             isOneToOne: true
//             referencedRelation: "profiles"
//             referencedColumns: ["user_id"]
//           },
//         ]
//       }
//     }
//     Views: {
//       [_ in never]: never
//     }
//     Functions: {
//       is_group_admin: {
//         Args: { _group_id: string; _user_id: string }
//         Returns: boolean
//       }
//       is_group_member: {
//         Args: { _group_id: string; _user_id: string }
//         Returns: boolean
//       }
//       shares_group_with: {
//         Args: { _other_user_id: string; _user_id: string }
//         Returns: boolean
//       }
//     }
//     Enums: {
//       expense_category:
//         | "food"
//         | "transport"
//         | "entertainment"
//         | "shopping"
//         | "utilities"
//         | "rent"
//         | "travel"
//         | "healthcare"
//         | "other"
//     }
//     CompositeTypes: {
//       [_ in never]: never
//     }
//   }
// }

// type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

// type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

// export type Tables<
//   DefaultSchemaTableNameOrOptions extends
//     | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
//     | { schema: keyof DatabaseWithoutInternals },
//   TableName extends DefaultSchemaTableNameOrOptions extends {
//     schema: keyof DatabaseWithoutInternals
//   }
//     ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
//         DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
//     : never = never,
// > = DefaultSchemaTableNameOrOptions extends {
//   schema: keyof DatabaseWithoutInternals
// }
//   ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
//       DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
//       Row: infer R
//     }
//     ? R
//     : never
//   : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
//         DefaultSchema["Views"])
//     ? (DefaultSchema["Tables"] &
//         DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
//         Row: infer R
//       }
//       ? R
//       : never
//     : never

// export type TablesInsert<
//   DefaultSchemaTableNameOrOptions extends
//     | keyof DefaultSchema["Tables"]
//     | { schema: keyof DatabaseWithoutInternals },
//   TableName extends DefaultSchemaTableNameOrOptions extends {
//     schema: keyof DatabaseWithoutInternals
//   }
//     ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
//     : never = never,
// > = DefaultSchemaTableNameOrOptions extends {
//   schema: keyof DatabaseWithoutInternals
// }
//   ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
//       Insert: infer I
//     }
//     ? I
//     : never
//   : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
//     ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
//         Insert: infer I
//       }
//       ? I
//       : never
//     : never

// export type TablesUpdate<
//   DefaultSchemaTableNameOrOptions extends
//     | keyof DefaultSchema["Tables"]
//     | { schema: keyof DatabaseWithoutInternals },
//   TableName extends DefaultSchemaTableNameOrOptions extends {
//     schema: keyof DatabaseWithoutInternals
//   }
//     ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
//     : never = never,
// > = DefaultSchemaTableNameOrOptions extends {
//   schema: keyof DatabaseWithoutInternals
// }
//   ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
//       Update: infer U
//     }
//     ? U
//     : never
//   : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
//     ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
//         Update: infer U
//       }
//       ? U
//       : never
//     : never

// export type Enums<
//   DefaultSchemaEnumNameOrOptions extends
//     | keyof DefaultSchema["Enums"]
//     | { schema: keyof DatabaseWithoutInternals },
//   EnumName extends DefaultSchemaEnumNameOrOptions extends {
//     schema: keyof DatabaseWithoutInternals
//   }
//     ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
//     : never = never,
// > = DefaultSchemaEnumNameOrOptions extends {
//   schema: keyof DatabaseWithoutInternals
// }
//   ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
//   : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
//     ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
//     : never

// export type CompositeTypes<
//   PublicCompositeTypeNameOrOptions extends
//     | keyof DefaultSchema["CompositeTypes"]
//     | { schema: keyof DatabaseWithoutInternals },
//   CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
//     schema: keyof DatabaseWithoutInternals
//   }
//     ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
//     : never = never,
// > = PublicCompositeTypeNameOrOptions extends {
//   schema: keyof DatabaseWithoutInternals
// }
//   ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
//   : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
//     ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
//     : never

// export const Constants = {
//   public: {
//     Enums: {
//       expense_category: [
//         "food",
//         "transport",
//         "entertainment",
//         "shopping",
//         "utilities",
//         "rent",
//         "travel",
//         "healthcare",
//         "other",
//       ],
//     },
//   },
// } as const





export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      expense_splits: {
        Row: {
          amount: number
          created_at: string
          expense_id: string
          id: string
          is_settled: boolean
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          expense_id: string
          id?: string
          is_settled?: boolean
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          expense_id?: string
          id?: string
          is_settled?: boolean
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "expense_splits_expense_id_fkey"
            columns: ["expense_id"]
            isOneToOne: false
            referencedRelation: "expenses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expense_splits_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      expenses: {
        Row: {
          amount: number
          category: Database["public"]["Enums"]["expense_category"]
          created_at: string
          created_by: string | null
          currency: string
          expense_date: string
          group_id: string
          id: string
          notes: string | null
          paid_by: string
          receipt_url: string | null
          title: string
          updated_at: string
        }
        Insert: {
          amount: number
          category?: Database["public"]["Enums"]["expense_category"]
          created_at?: string
          created_by?: string | null
          currency?: string
          expense_date?: string
          group_id: string
          id?: string
          notes?: string | null
          paid_by: string
          receipt_url?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          amount?: number
          category?: Database["public"]["Enums"]["expense_category"]
          created_at?: string
          created_by?: string | null
          currency?: string
          expense_date?: string
          group_id?: string
          id?: string
          notes?: string | null
          paid_by?: string
          receipt_url?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "expenses_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "expenses_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expenses_paid_by_fkey"
            columns: ["paid_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      group_members: {
        Row: {
          group_id: string
          id: string
          joined_at: string
          role: string
          user_id: string
        }
        Insert: {
          group_id: string
          id?: string
          joined_at?: string
          role?: string
          user_id: string
        }
        Update: {
          group_id?: string
          id?: string
          joined_at?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_members_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "group_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      groups: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          image_url: string | null
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          data: Json | null
          id: string
          is_read: boolean
          message: string
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          data?: Json | null
          id?: string
          is_read?: boolean
          message: string
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          data?: Json | null
          id?: string
          is_read?: boolean
          message?: string
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      personal_expenses: {
        Row: {
          amount: number
          category: string
          created_at: string
          expense_date: string
          id: string
          notes: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          category?: string
          created_at?: string
          expense_date?: string
          id?: string
          notes?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string
          expense_date?: string
          id?: string
          notes?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      settlements: {
        Row: {
          amount: number
          created_at: string
          group_id: string
          id: string
          notes: string | null
          paid_by: string
          paid_to: string
          receipt_url: string | null
          settled_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          group_id: string
          id?: string
          notes?: string | null
          paid_by: string
          paid_to: string
          receipt_url?: string | null
          settled_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          group_id?: string
          id?: string
          notes?: string | null
          paid_by?: string
          paid_to?: string
          receipt_url?: string | null
          settled_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "settlements_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "settlements_paid_by_fkey"
            columns: ["paid_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "settlements_paid_to_fkey"
            columns: ["paid_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      settings: {
        Row: {
          id: string
          user_id: string
          notification_expense_updates: boolean
          notification_settlement_reminders: boolean
          notification_group_invites: boolean
          notification_weekly_report: boolean
          privacy_show_profile: boolean
          privacy_show_activity: boolean
          privacy_two_factor_auth: boolean
          preference_currency: string
          preference_default_category: Database["public"]["Enums"]["expense_category"]
          preference_auto_settle: boolean
          preference_theme: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          notification_expense_updates?: boolean
          notification_settlement_reminders?: boolean
          notification_group_invites?: boolean
          notification_weekly_report?: boolean
          privacy_show_profile?: boolean
          privacy_show_activity?: boolean
          privacy_two_factor_auth?: boolean
          preference_currency?: string
          preference_default_category?: Database["public"]["Enums"]["expense_category"]
          preference_auto_settle?: boolean
          preference_theme?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          notification_expense_updates?: boolean
          notification_settlement_reminders?: boolean
          notification_group_invites?: boolean
          notification_weekly_report?: boolean
          privacy_show_profile?: boolean
          privacy_show_activity?: boolean
          privacy_two_factor_auth?: boolean
          preference_currency?: string
          preference_default_category?: Database["public"]["Enums"]["expense_category"]
          preference_auto_settle?: boolean
          preference_theme?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "settings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      // =====================================================
      // EXPLORE FEATURE TABLES
      // =====================================================
      explore_categories: {
        Row: {
          id: string
          name: string
          slug: string
          icon: string
          color: string
          description: string | null
          is_active: boolean
          sort_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          icon: string
          color: string
          description?: string | null
          is_active?: boolean
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          icon?: string
          color?: string
          description?: string | null
          is_active?: boolean
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      explore_places: {
        Row: {
          id: string
          category_id: string
          name: string
          description: string | null
          slug: string
          address: string | null
          city: string | null
          state: string | null
          country: string
          postal_code: string | null
          latitude: number | null
          longitude: number | null
          phone: string | null
          email: string | null
          website: string | null
          rating: number
          review_count: number
          price_level: number
          average_cost: number | null
          currency: string
          image_url: string | null
          cover_image_url: string | null
          gallery: Json
          opening_hours: Json | null
          is_open_now: boolean
          tags: string[]
          features: Json
          cuisine_types: string[] | null
          google_place_id: string | null
          google_rating: number | null
          google_review_count: number | null
          is_verified: boolean
          is_featured: boolean
          is_active: boolean
          view_count: number
          bookmark_count: number
          share_count: number
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          category_id: string
          name: string
          description?: string | null
          slug: string
          address?: string | null
          city?: string | null
          state?: string | null
          country?: string
          postal_code?: string | null
          latitude?: number | null
          longitude?: number | null
          phone?: string | null
          email?: string | null
          website?: string | null
          rating?: number
          review_count?: number
          price_level?: number
          average_cost?: number | null
          currency?: string
          image_url?: string | null
          cover_image_url?: string | null
          gallery?: Json
          opening_hours?: Json | null
          is_open_now?: boolean
          tags?: string[]
          features?: Json
          cuisine_types?: string[] | null
          google_place_id?: string | null
          google_rating?: number | null
          google_review_count?: number | null
          is_verified?: boolean
          is_featured?: boolean
          is_active?: boolean
          view_count?: number
          bookmark_count?: number
          share_count?: number
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          category_id?: string
          name?: string
          description?: string | null
          slug?: string
          address?: string | null
          city?: string | null
          state?: string | null
          country?: string
          postal_code?: string | null
          latitude?: number | null
          longitude?: number | null
          phone?: string | null
          email?: string | null
          website?: string | null
          rating?: number
          review_count?: number
          price_level?: number
          average_cost?: number | null
          currency?: string
          image_url?: string | null
          cover_image_url?: string | null
          gallery?: Json
          opening_hours?: Json | null
          is_open_now?: boolean
          tags?: string[]
          features?: Json
          cuisine_types?: string[] | null
          google_place_id?: string | null
          google_rating?: number | null
          google_review_count?: number | null
          is_verified?: boolean
          is_featured?: boolean
          is_active?: boolean
          view_count?: number
          bookmark_count?: number
          share_count?: number
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "explore_places_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "explore_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      user_bookmarks: {
        Row: {
          id: string
          user_id: string
          place_id: string
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          place_id: string
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          place_id?: string
          notes?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_bookmarks_place_id_fkey"
            columns: ["place_id"]
            isOneToOne: false
            referencedRelation: "explore_places"
            referencedColumns: ["id"]
          },
        ]
      }
      user_reviews: {
        Row: {
          id: string
          user_id: string
          place_id: string
          rating: number
          review_text: string | null
          images: string[]
          helpful_count: number
          is_verified_visit: boolean
          visit_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          place_id: string
          rating: number
          review_text?: string | null
          images?: string[]
          helpful_count?: number
          is_verified_visit?: boolean
          visit_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          place_id?: string
          rating?: number
          review_text?: string | null
          images?: string[]
          helpful_count?: number
          is_verified_visit?: boolean
          visit_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_reviews_place_id_fkey"
            columns: ["place_id"]
            isOneToOne: false
            referencedRelation: "explore_places"
            referencedColumns: ["id"]
          },
        ]
      }
      place_visits: {
        Row: {
          id: string
          user_id: string
          place_id: string
          group_id: string | null
          expense_id: string | null
          visit_date: string
          amount_spent: number | null
          currency: string
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          place_id: string
          group_id?: string | null
          expense_id?: string | null
          visit_date?: string
          amount_spent?: number | null
          currency?: string
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          place_id?: string
          group_id?: string | null
          expense_id?: string | null
          visit_date?: string
          amount_spent?: number | null
          currency?: string
          notes?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "place_visits_place_id_fkey"
            columns: ["place_id"]
            isOneToOne: false
            referencedRelation: "explore_places"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "place_visits_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "place_visits_expense_id_fkey"
            columns: ["expense_id"]
            isOneToOne: false
            referencedRelation: "expenses"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_group_admin: {
        Args: { _group_id: string; _user_id: string }
        Returns: boolean
      }
      is_group_member: {
        Args: { _group_id: string; _user_id: string }
        Returns: boolean
      }
      shares_group_with: {
        Args: { _other_user_id: string; _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      expense_category:
        | "food"
        | "transport"
        | "entertainment"
        | "shopping"
        | "utilities"
        | "rent"
        | "travel"
        | "healthcare"
        | "other"
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
      expense_category: [
        "food",
        "transport",
        "entertainment",
        "shopping",
        "utilities",
        "rent",
        "travel",
        "healthcare",
        "other",
      ],
    },
  },
} as const

// =====================================================
// EXPLORE FEATURE - HELPER TYPES
// =====================================================

export type Category = Tables<"explore_categories">
export type Place = Tables<"explore_places">
export type UserBookmark = Tables<"user_bookmarks">
export type Review = Tables<"user_reviews">
export type PlaceVisit = Tables<"place_visits">