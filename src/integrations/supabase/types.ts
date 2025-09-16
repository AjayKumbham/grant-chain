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
      analytics_governance_metrics: {
        Row: {
          avg_voting_participation_rate: number | null
          consensus_rate: number | null
          created_at: string | null
          date: string
          id: string
          total_votes: number | null
          unique_voters: number | null
          updated_at: string | null
        }
        Insert: {
          avg_voting_participation_rate?: number | null
          consensus_rate?: number | null
          created_at?: string | null
          date: string
          id?: string
          total_votes?: number | null
          unique_voters?: number | null
          updated_at?: string | null
        }
        Update: {
          avg_voting_participation_rate?: number | null
          consensus_rate?: number | null
          created_at?: string | null
          date?: string
          id?: string
          total_votes?: number | null
          unique_voters?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      analytics_grant_metrics: {
        Row: {
          active_grants: number | null
          avg_completion_time_days: number | null
          completed_grants: number | null
          created_at: string | null
          date: string
          id: string
          success_rate: number | null
          total_funding: number | null
          total_grants: number | null
          updated_at: string | null
        }
        Insert: {
          active_grants?: number | null
          avg_completion_time_days?: number | null
          completed_grants?: number | null
          created_at?: string | null
          date: string
          id?: string
          success_rate?: number | null
          total_funding?: number | null
          total_grants?: number | null
          updated_at?: string | null
        }
        Update: {
          active_grants?: number | null
          avg_completion_time_days?: number | null
          completed_grants?: number | null
          created_at?: string | null
          date?: string
          id?: string
          success_rate?: number | null
          total_funding?: number | null
          total_grants?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      analytics_milestone_metrics: {
        Row: {
          approved_milestones: number | null
          avg_approval_time_hours: number | null
          created_at: string | null
          date: string
          id: string
          rejected_milestones: number | null
          submitted_milestones: number | null
          total_milestones: number | null
          updated_at: string | null
        }
        Insert: {
          approved_milestones?: number | null
          avg_approval_time_hours?: number | null
          created_at?: string | null
          date: string
          id?: string
          rejected_milestones?: number | null
          submitted_milestones?: number | null
          total_milestones?: number | null
          updated_at?: string | null
        }
        Update: {
          approved_milestones?: number | null
          avg_approval_time_hours?: number | null
          created_at?: string | null
          date?: string
          id?: string
          rejected_milestones?: number | null
          submitted_milestones?: number | null
          total_milestones?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      analytics_user_metrics: {
        Row: {
          active_auditors: number | null
          active_funders: number | null
          active_grantees: number | null
          created_at: string | null
          date: string
          id: string
          new_registrations: number | null
          total_users: number | null
          updated_at: string | null
        }
        Insert: {
          active_auditors?: number | null
          active_funders?: number | null
          active_grantees?: number | null
          created_at?: string | null
          date: string
          id?: string
          new_registrations?: number | null
          total_users?: number | null
          updated_at?: string | null
        }
        Update: {
          active_auditors?: number | null
          active_funders?: number | null
          active_grantees?: number | null
          created_at?: string | null
          date?: string
          id?: string
          new_registrations?: number | null
          total_users?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      grant_applications: {
        Row: {
          applicant_wallet: string
          application_date: string | null
          attachments: Json | null
          created_at: string | null
          grant_id: string | null
          id: string
          ipfs_attachments: Json | null
          proposal_description: string
          proposal_title: string
          requested_amount: number | null
          review_notes: string | null
          reviewed_at: string | null
          reviewer_wallet: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          applicant_wallet: string
          application_date?: string | null
          attachments?: Json | null
          created_at?: string | null
          grant_id?: string | null
          id?: string
          ipfs_attachments?: Json | null
          proposal_description: string
          proposal_title: string
          requested_amount?: number | null
          review_notes?: string | null
          reviewed_at?: string | null
          reviewer_wallet?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          applicant_wallet?: string
          application_date?: string | null
          attachments?: Json | null
          created_at?: string | null
          grant_id?: string | null
          id?: string
          ipfs_attachments?: Json | null
          proposal_description?: string
          proposal_title?: string
          requested_amount?: number | null
          review_notes?: string | null
          reviewed_at?: string | null
          reviewer_wallet?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "grant_applications_grant_id_fkey"
            columns: ["grant_id"]
            isOneToOne: false
            referencedRelation: "grants"
            referencedColumns: ["id"]
          },
        ]
      }
      grants: {
        Row: {
          application_deadline: string | null
          blockchain_network: string | null
          category: string
          contract_address: string | null
          contract_deployed: boolean | null
          created_at: string | null
          description: string
          duration_days: number
          end_date: string | null
          funder_wallet: string
          grantee_wallet: string | null
          id: string
          start_date: string | null
          status: string | null
          title: string
          total_amount: number
          updated_at: string | null
        }
        Insert: {
          application_deadline?: string | null
          blockchain_network?: string | null
          category: string
          contract_address?: string | null
          contract_deployed?: boolean | null
          created_at?: string | null
          description: string
          duration_days: number
          end_date?: string | null
          funder_wallet: string
          grantee_wallet?: string | null
          id?: string
          start_date?: string | null
          status?: string | null
          title: string
          total_amount: number
          updated_at?: string | null
        }
        Update: {
          application_deadline?: string | null
          blockchain_network?: string | null
          category?: string
          contract_address?: string | null
          contract_deployed?: boolean | null
          created_at?: string | null
          description?: string
          duration_days?: number
          end_date?: string | null
          funder_wallet?: string
          grantee_wallet?: string | null
          id?: string
          start_date?: string | null
          status?: string | null
          title?: string
          total_amount?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      milestone_votes: {
        Row: {
          created_at: string | null
          id: string
          milestone_id: string | null
          reasoning: string | null
          reputation_weight: number | null
          stake_amount: number | null
          vote: string
          vote_type: string | null
          vote_weight: number | null
          voter_wallet: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          milestone_id?: string | null
          reasoning?: string | null
          reputation_weight?: number | null
          stake_amount?: number | null
          vote: string
          vote_type?: string | null
          vote_weight?: number | null
          voter_wallet: string
        }
        Update: {
          created_at?: string | null
          id?: string
          milestone_id?: string | null
          reasoning?: string | null
          reputation_weight?: number | null
          stake_amount?: number | null
          vote?: string
          vote_type?: string | null
          vote_weight?: number | null
          voter_wallet?: string
        }
        Relationships: [
          {
            foreignKeyName: "milestone_votes_milestone_id_fkey"
            columns: ["milestone_id"]
            isOneToOne: false
            referencedRelation: "milestones"
            referencedColumns: ["id"]
          },
        ]
      }
      milestones: {
        Row: {
          amount: number
          approved_at: string | null
          created_at: string | null
          deliverables: string
          description: string
          due_date: string | null
          grant_id: string | null
          id: string
          ipfs_hash: string | null
          order_index: number
          proof_description: string | null
          proof_url: string | null
          review_notes: string | null
          reviewer_wallet: string | null
          status: string | null
          submitted_at: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          amount: number
          approved_at?: string | null
          created_at?: string | null
          deliverables: string
          description: string
          due_date?: string | null
          grant_id?: string | null
          id?: string
          ipfs_hash?: string | null
          order_index: number
          proof_description?: string | null
          proof_url?: string | null
          review_notes?: string | null
          reviewer_wallet?: string | null
          status?: string | null
          submitted_at?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          amount?: number
          approved_at?: string | null
          created_at?: string | null
          deliverables?: string
          description?: string
          due_date?: string | null
          grant_id?: string | null
          id?: string
          ipfs_hash?: string | null
          order_index?: number
          proof_description?: string | null
          proof_url?: string | null
          review_notes?: string | null
          reviewer_wallet?: string | null
          status?: string | null
          submitted_at?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "milestones_grant_id_fkey"
            columns: ["grant_id"]
            isOneToOne: false
            referencedRelation: "grants"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string | null
          id: string
          message: string
          read: boolean | null
          related_grant_id: string | null
          related_milestone_id: string | null
          title: string
          type: string
          user_wallet: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          message: string
          read?: boolean | null
          related_grant_id?: string | null
          related_milestone_id?: string | null
          title: string
          type?: string
          user_wallet: string
        }
        Update: {
          created_at?: string | null
          id?: string
          message?: string
          read?: boolean | null
          related_grant_id?: string | null
          related_milestone_id?: string | null
          title?: string
          type?: string
          user_wallet?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_related_grant_id_fkey"
            columns: ["related_grant_id"]
            isOneToOne: false
            referencedRelation: "grants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_related_milestone_id_fkey"
            columns: ["related_milestone_id"]
            isOneToOne: false
            referencedRelation: "milestones"
            referencedColumns: ["id"]
          },
        ]
      }
      user_profiles: {
        Row: {
          bio: string | null
          created_at: string | null
          id: string
          last_activity: string | null
          name: string | null
          reputation_score: number | null
          role: string
          stake_amount: number | null
          updated_at: string | null
          voting_power: number | null
          wallet_address: string
        }
        Insert: {
          bio?: string | null
          created_at?: string | null
          id?: string
          last_activity?: string | null
          name?: string | null
          reputation_score?: number | null
          role: string
          stake_amount?: number | null
          updated_at?: string | null
          voting_power?: number | null
          wallet_address: string
        }
        Update: {
          bio?: string | null
          created_at?: string | null
          id?: string
          last_activity?: string | null
          name?: string | null
          reputation_score?: number | null
          role?: string
          stake_amount?: number | null
          updated_at?: string | null
          voting_power?: number | null
          wallet_address?: string
        }
        Relationships: []
      }
      voting_sessions: {
        Row: {
          approval_threshold: number | null
          created_at: string | null
          end_time: string
          final_result: string | null
          id: string
          milestone_id: string | null
          min_votes_required: number | null
          session_type: string
          start_time: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          approval_threshold?: number | null
          created_at?: string | null
          end_time: string
          final_result?: string | null
          id?: string
          milestone_id?: string | null
          min_votes_required?: number | null
          session_type?: string
          start_time?: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          approval_threshold?: number | null
          created_at?: string | null
          end_time?: string
          final_result?: string | null
          id?: string
          milestone_id?: string | null
          min_votes_required?: number | null
          session_type?: string
          start_time?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "voting_sessions_milestone_id_fkey"
            columns: ["milestone_id"]
            isOneToOne: false
            referencedRelation: "milestones"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_review_milestone: {
        Args: { milestone_id: string; user_wallet: string }
        Returns: boolean
      }
      get_user_role: {
        Args: { user_wallet: string }
        Returns: string
      }
      is_grant_participant: {
        Args: { grant_id: string; user_wallet: string }
        Returns: boolean
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
