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
      ab_test_results: {
        Row: {
          conversation_id: string
          converted: boolean
          created_at: string
          id: string
          response_time: unknown
          test_id: string
          variant: string
        }
        Insert: {
          conversation_id: string
          converted?: boolean
          created_at?: string
          id?: string
          response_time?: unknown
          test_id: string
          variant: string
        }
        Update: {
          conversation_id?: string
          converted?: boolean
          created_at?: string
          id?: string
          response_time?: unknown
          test_id?: string
          variant?: string
        }
        Relationships: [
          {
            foreignKeyName: "ab_test_results_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ab_test_results_test_id_fkey"
            columns: ["test_id"]
            isOneToOne: false
            referencedRelation: "ab_tests"
            referencedColumns: ["id"]
          },
        ]
      }
      ab_tests: {
        Row: {
          assistant_id: string
          created_at: string
          description: string | null
          end_date: string | null
          id: string
          name: string
          start_date: string | null
          status: string
          updated_at: string
          variant_a: string
          variant_b: string
          winner: string | null
        }
        Insert: {
          assistant_id: string
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          name: string
          start_date?: string | null
          status?: string
          updated_at?: string
          variant_a: string
          variant_b: string
          winner?: string | null
        }
        Update: {
          assistant_id?: string
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          name?: string
          start_date?: string | null
          status?: string
          updated_at?: string
          variant_a?: string
          variant_b?: string
          winner?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ab_tests_assistant_id_fkey"
            columns: ["assistant_id"]
            isOneToOne: false
            referencedRelation: "assistants"
            referencedColumns: ["id"]
          },
        ]
      }
      activity_logs: {
        Row: {
          action: string
          created_at: string
          details: Json | null
          entity_id: string | null
          entity_type: string
          id: string
          ip_address: string | null
          user_agent: string | null
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string
          details?: Json | null
          entity_id?: string | null
          entity_type: string
          id?: string
          ip_address?: string | null
          user_agent?: string | null
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json | null
          entity_id?: string | null
          entity_type?: string
          id?: string
          ip_address?: string | null
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      assistant_config: {
        Row: {
          assistant_id: string
          config_key: string
          config_value: Json
          created_at: string | null
          description: string | null
          id: string
          updated_at: string | null
        }
        Insert: {
          assistant_id: string
          config_key: string
          config_value: Json
          created_at?: string | null
          description?: string | null
          id?: string
          updated_at?: string | null
        }
        Update: {
          assistant_id?: string
          config_key?: string
          config_value?: Json
          created_at?: string | null
          description?: string | null
          id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "assistant_config_assistant_id_fkey"
            columns: ["assistant_id"]
            isOneToOne: false
            referencedRelation: "assistants"
            referencedColumns: ["id"]
          },
        ]
      }
      assistants: {
        Row: {
          business_description: string
          created_at: string | null
          id: string
          industry: string | null
          is_active: boolean | null
          name: string
          phone_number: string | null
          updated_at: string | null
          user_id: string
          whatsapp_session_data: Json | null
        }
        Insert: {
          business_description: string
          created_at?: string | null
          id?: string
          industry?: string | null
          is_active?: boolean | null
          name: string
          phone_number?: string | null
          updated_at?: string | null
          user_id: string
          whatsapp_session_data?: Json | null
        }
        Update: {
          business_description?: string
          created_at?: string | null
          id?: string
          industry?: string | null
          is_active?: boolean | null
          name?: string
          phone_number?: string | null
          updated_at?: string | null
          user_id?: string
          whatsapp_session_data?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "assistants_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      auto_responses: {
        Row: {
          assistant_id: string
          created_at: string
          id: string
          is_active: boolean
          message: string
          type: string
          updated_at: string
        }
        Insert: {
          assistant_id: string
          created_at?: string
          id?: string
          is_active?: boolean
          message: string
          type: string
          updated_at?: string
        }
        Update: {
          assistant_id?: string
          created_at?: string
          id?: string
          is_active?: boolean
          message?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "auto_responses_assistant_id_fkey"
            columns: ["assistant_id"]
            isOneToOne: false
            referencedRelation: "assistants"
            referencedColumns: ["id"]
          },
        ]
      }
      bookings: {
        Row: {
          assistant_id: string
          calendar_integration_id: string | null
          created_at: string
          customer_name: string | null
          customer_phone: string
          end_time: string
          external_id: string | null
          id: string
          metadata: Json | null
          notes: string | null
          price: number | null
          service_type: string
          start_time: string
          status: string
          updated_at: string
        }
        Insert: {
          assistant_id: string
          calendar_integration_id?: string | null
          created_at?: string
          customer_name?: string | null
          customer_phone: string
          end_time: string
          external_id?: string | null
          id?: string
          metadata?: Json | null
          notes?: string | null
          price?: number | null
          service_type: string
          start_time: string
          status?: string
          updated_at?: string
        }
        Update: {
          assistant_id?: string
          calendar_integration_id?: string | null
          created_at?: string
          customer_name?: string | null
          customer_phone?: string
          end_time?: string
          external_id?: string | null
          id?: string
          metadata?: Json | null
          notes?: string | null
          price?: number | null
          service_type?: string
          start_time?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_assistant_id_fkey"
            columns: ["assistant_id"]
            isOneToOne: false
            referencedRelation: "assistants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_calendar_integration_id_fkey"
            columns: ["calendar_integration_id"]
            isOneToOne: false
            referencedRelation: "calendar_integrations"
            referencedColumns: ["id"]
          },
        ]
      }
      bot_settings: {
        Row: {
          allowed_numbers: string[] | null
          assistant_id: string
          blocked_numbers: string[] | null
          created_at: string
          custom_instructions: string | null
          frustration_threshold: number
          id: string
          language: string
          operator_email: string | null
          operator_whatsapp: string | null
          require_consent: boolean
          response_mode: string | null
          tone: string
          updated_at: string
        }
        Insert: {
          allowed_numbers?: string[] | null
          assistant_id: string
          blocked_numbers?: string[] | null
          created_at?: string
          custom_instructions?: string | null
          frustration_threshold?: number
          id?: string
          language?: string
          operator_email?: string | null
          operator_whatsapp?: string | null
          require_consent?: boolean
          response_mode?: string | null
          tone?: string
          updated_at?: string
        }
        Update: {
          allowed_numbers?: string[] | null
          assistant_id?: string
          blocked_numbers?: string[] | null
          created_at?: string
          custom_instructions?: string | null
          frustration_threshold?: number
          id?: string
          language?: string
          operator_email?: string | null
          operator_whatsapp?: string | null
          require_consent?: boolean
          response_mode?: string | null
          tone?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bot_settings_assistant_id_fkey"
            columns: ["assistant_id"]
            isOneToOne: true
            referencedRelation: "assistants"
            referencedColumns: ["id"]
          },
        ]
      }
      business_hours: {
        Row: {
          assistant_id: string
          close_time: string
          created_at: string
          day_of_week: number
          id: string
          is_active: boolean
          open_time: string
          updated_at: string
        }
        Insert: {
          assistant_id: string
          close_time: string
          created_at?: string
          day_of_week: number
          id?: string
          is_active?: boolean
          open_time: string
          updated_at?: string
        }
        Update: {
          assistant_id?: string
          close_time?: string
          created_at?: string
          day_of_week?: number
          id?: string
          is_active?: boolean
          open_time?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "business_hours_assistant_id_fkey"
            columns: ["assistant_id"]
            isOneToOne: false
            referencedRelation: "assistants"
            referencedColumns: ["id"]
          },
        ]
      }
      calendar_integrations: {
        Row: {
          assistant_id: string
          config: Json
          created_at: string
          credentials: Json
          id: string
          is_active: boolean
          last_sync: string | null
          name: string
          provider: string
          sync_enabled: boolean
          updated_at: string
        }
        Insert: {
          assistant_id: string
          config?: Json
          created_at?: string
          credentials?: Json
          id?: string
          is_active?: boolean
          last_sync?: string | null
          name: string
          provider: string
          sync_enabled?: boolean
          updated_at?: string
        }
        Update: {
          assistant_id?: string
          config?: Json
          created_at?: string
          credentials?: Json
          id?: string
          is_active?: boolean
          last_sync?: string | null
          name?: string
          provider?: string
          sync_enabled?: boolean
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "calendar_integrations_assistant_id_fkey"
            columns: ["assistant_id"]
            isOneToOne: false
            referencedRelation: "assistants"
            referencedColumns: ["id"]
          },
        ]
      }
      campaign_logs: {
        Row: {
          campaign_id: string
          created_at: string
          error_message: string | null
          id: string
          phone_number: string
          sent_at: string | null
          status: string
        }
        Insert: {
          campaign_id: string
          created_at?: string
          error_message?: string | null
          id?: string
          phone_number: string
          sent_at?: string | null
          status: string
        }
        Update: {
          campaign_id?: string
          created_at?: string
          error_message?: string | null
          id?: string
          phone_number?: string
          sent_at?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaign_logs_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      campaigns: {
        Row: {
          assistant_id: string
          completed_at: string | null
          created_at: string
          failed_count: number | null
          id: string
          message: string
          name: string
          scheduled_for: string | null
          segment_id: string | null
          sent_count: number | null
          started_at: string | null
          status: string
          total_recipients: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          assistant_id: string
          completed_at?: string | null
          created_at?: string
          failed_count?: number | null
          id?: string
          message: string
          name: string
          scheduled_for?: string | null
          segment_id?: string | null
          sent_count?: number | null
          started_at?: string | null
          status?: string
          total_recipients?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          assistant_id?: string
          completed_at?: string | null
          created_at?: string
          failed_count?: number | null
          id?: string
          message?: string
          name?: string
          scheduled_for?: string | null
          segment_id?: string | null
          sent_count?: number | null
          started_at?: string | null
          status?: string
          total_recipients?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaigns_assistant_id_fkey"
            columns: ["assistant_id"]
            isOneToOne: false
            referencedRelation: "assistants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaigns_segment_id_fkey"
            columns: ["segment_id"]
            isOneToOne: false
            referencedRelation: "customer_segments"
            referencedColumns: ["id"]
          },
        ]
      }
      conversation_notes: {
        Row: {
          conversation_id: string
          created_at: string
          id: string
          note: string
          operator_id: string
          updated_at: string
        }
        Insert: {
          conversation_id: string
          created_at?: string
          id?: string
          note: string
          operator_id: string
          updated_at?: string
        }
        Update: {
          conversation_id?: string
          created_at?: string
          id?: string
          note?: string
          operator_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversation_notes_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      conversation_ratings: {
        Row: {
          conversation_id: string
          created_at: string
          feedback: string | null
          id: string
          rating: number
        }
        Insert: {
          conversation_id: string
          created_at?: string
          feedback?: string | null
          id?: string
          rating: number
        }
        Update: {
          conversation_id?: string
          created_at?: string
          feedback?: string | null
          id?: string
          rating?: number
        }
        Relationships: [
          {
            foreignKeyName: "conversation_ratings_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: true
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      conversation_tags: {
        Row: {
          conversation_id: string
          created_at: string
          id: string
          tag_id: string
        }
        Insert: {
          conversation_id: string
          created_at?: string
          id?: string
          tag_id: string
        }
        Update: {
          conversation_id?: string
          created_at?: string
          id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversation_tags_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversation_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
        ]
      }
      conversation_templates: {
        Row: {
          assistant_id: string
          category: string | null
          created_at: string
          description: string | null
          flow: Json
          id: string
          is_active: boolean
          name: string
          updated_at: string
          usage_count: number | null
        }
        Insert: {
          assistant_id: string
          category?: string | null
          created_at?: string
          description?: string | null
          flow?: Json
          id?: string
          is_active?: boolean
          name: string
          updated_at?: string
          usage_count?: number | null
        }
        Update: {
          assistant_id?: string
          category?: string | null
          created_at?: string
          description?: string | null
          flow?: Json
          id?: string
          is_active?: boolean
          name?: string
          updated_at?: string
          usage_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "conversation_templates_assistant_id_fkey"
            columns: ["assistant_id"]
            isOneToOne: false
            referencedRelation: "assistants"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          assigned_operator: string | null
          assistant_id: string
          avg_response_time: unknown
          created_at: string
          ended_at: string | null
          id: string
          phone_number: string
          sentiment_score: number | null
          started_at: string
          status: string
          total_messages: number | null
          updated_at: string
        }
        Insert: {
          assigned_operator?: string | null
          assistant_id: string
          avg_response_time?: unknown
          created_at?: string
          ended_at?: string | null
          id?: string
          phone_number: string
          sentiment_score?: number | null
          started_at?: string
          status?: string
          total_messages?: number | null
          updated_at?: string
        }
        Update: {
          assigned_operator?: string | null
          assistant_id?: string
          avg_response_time?: unknown
          created_at?: string
          ended_at?: string | null
          id?: string
          phone_number?: string
          sentiment_score?: number | null
          started_at?: string
          status?: string
          total_messages?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversations_assistant_id_fkey"
            columns: ["assistant_id"]
            isOneToOne: false
            referencedRelation: "assistants"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_integrations: {
        Row: {
          api_key_encrypted: string | null
          config: Json
          created_at: string
          crm_type: string
          id: string
          is_active: boolean
          last_sync: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          api_key_encrypted?: string | null
          config?: Json
          created_at?: string
          crm_type: string
          id?: string
          is_active?: boolean
          last_sync?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          api_key_encrypted?: string | null
          config?: Json
          created_at?: string
          crm_type?: string
          id?: string
          is_active?: boolean
          last_sync?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      customer_segments: {
        Row: {
          created_at: string
          customer_count: number
          description: string | null
          filters: Json
          id: string
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          customer_count?: number
          description?: string | null
          filters: Json
          id?: string
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          customer_count?: number
          description?: string | null
          filters?: Json
          id?: string
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      export_jobs: {
        Row: {
          completed_at: string | null
          created_at: string
          error_message: string | null
          export_type: string
          file_url: string | null
          filters: Json | null
          format: string
          id: string
          status: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          export_type: string
          file_url?: string | null
          filters?: Json | null
          format: string
          id?: string
          status?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          export_type?: string
          file_url?: string | null
          filters?: Json | null
          format?: string
          id?: string
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      faqs: {
        Row: {
          answer: string
          assistant_id: string
          created_at: string | null
          id: string
          is_active: boolean | null
          order_index: number | null
          question: string
          updated_at: string | null
        }
        Insert: {
          answer: string
          assistant_id: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          order_index?: number | null
          question: string
          updated_at?: string | null
        }
        Update: {
          answer?: string
          assistant_id?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          order_index?: number | null
          question?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "faqs_assistant_id_fkey"
            columns: ["assistant_id"]
            isOneToOne: false
            referencedRelation: "assistants"
            referencedColumns: ["id"]
          },
        ]
      }
      incoming_webhook_logs: {
        Row: {
          created_at: string
          error_message: string | null
          headers: Json | null
          id: string
          ip_address: string | null
          payload: Json
          processing_time_ms: number | null
          status: string
          webhook_id: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          headers?: Json | null
          id?: string
          ip_address?: string | null
          payload: Json
          processing_time_ms?: number | null
          status: string
          webhook_id: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          headers?: Json | null
          id?: string
          ip_address?: string | null
          payload?: Json
          processing_time_ms?: number | null
          status?: string
          webhook_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "incoming_webhook_logs_webhook_id_fkey"
            columns: ["webhook_id"]
            isOneToOne: false
            referencedRelation: "incoming_webhooks"
            referencedColumns: ["id"]
          },
        ]
      }
      incoming_webhooks: {
        Row: {
          allowed_ips: Json | null
          assistant_id: string
          created_at: string
          event_types: Json
          failed_calls: number | null
          id: string
          is_active: boolean
          last_trigger: string | null
          name: string
          secret_key: string
          total_calls: number | null
          updated_at: string
          webhook_url: string
        }
        Insert: {
          allowed_ips?: Json | null
          assistant_id: string
          created_at?: string
          event_types?: Json
          failed_calls?: number | null
          id?: string
          is_active?: boolean
          last_trigger?: string | null
          name: string
          secret_key: string
          total_calls?: number | null
          updated_at?: string
          webhook_url: string
        }
        Update: {
          allowed_ips?: Json | null
          assistant_id?: string
          created_at?: string
          event_types?: Json
          failed_calls?: number | null
          id?: string
          is_active?: boolean
          last_trigger?: string | null
          name?: string
          secret_key?: string
          total_calls?: number | null
          updated_at?: string
          webhook_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "incoming_webhooks_assistant_id_fkey"
            columns: ["assistant_id"]
            isOneToOne: false
            referencedRelation: "assistants"
            referencedColumns: ["id"]
          },
        ]
      }
      intents: {
        Row: {
          assistant_id: string
          confidence_threshold: number | null
          created_at: string
          description: string | null
          entities: Json | null
          examples: string[]
          id: string
          is_active: boolean
          name: string
          response: string
          updated_at: string
        }
        Insert: {
          assistant_id: string
          confidence_threshold?: number | null
          created_at?: string
          description?: string | null
          entities?: Json | null
          examples?: string[]
          id?: string
          is_active?: boolean
          name: string
          response: string
          updated_at?: string
        }
        Update: {
          assistant_id?: string
          confidence_threshold?: number | null
          created_at?: string
          description?: string | null
          entities?: Json | null
          examples?: string[]
          id?: string
          is_active?: boolean
          name?: string
          response?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "intents_assistant_id_fkey"
            columns: ["assistant_id"]
            isOneToOne: false
            referencedRelation: "assistants"
            referencedColumns: ["id"]
          },
        ]
      }
      knowledge_base: {
        Row: {
          assistant_id: string
          content: string
          created_at: string
          id: string
          is_active: boolean
          source_type: string
          source_url: string | null
          tags: string[] | null
          title: string
          updated_at: string
        }
        Insert: {
          assistant_id: string
          content: string
          created_at?: string
          id?: string
          is_active?: boolean
          source_type: string
          source_url?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string
        }
        Update: {
          assistant_id?: string
          content?: string
          created_at?: string
          id?: string
          is_active?: boolean
          source_type?: string
          source_url?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "knowledge_base_assistant_id_fkey"
            columns: ["assistant_id"]
            isOneToOne: false
            referencedRelation: "assistants"
            referencedColumns: ["id"]
          },
        ]
      }
      live_chat_sessions: {
        Row: {
          conversation_id: string
          created_at: string
          ended_at: string | null
          id: string
          operator_id: string
          started_at: string
          status: string
        }
        Insert: {
          conversation_id: string
          created_at?: string
          ended_at?: string | null
          id?: string
          operator_id: string
          started_at?: string
          status?: string
        }
        Update: {
          conversation_id?: string
          created_at?: string
          ended_at?: string | null
          id?: string
          operator_id?: string
          started_at?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "live_chat_sessions_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      message_templates: {
        Row: {
          category: string | null
          content: string
          created_at: string
          id: string
          is_active: boolean
          name: string
          updated_at: string
          usage_count: number
          user_id: string
          variables: Json | null
        }
        Insert: {
          category?: string | null
          content: string
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          updated_at?: string
          usage_count?: number
          user_id: string
          variables?: Json | null
        }
        Update: {
          category?: string | null
          content?: string
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          updated_at?: string
          usage_count?: number
          user_id?: string
          variables?: Json | null
        }
        Relationships: []
      }
      messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          is_from_operator: boolean | null
          is_suggested: boolean | null
          metadata: Json | null
          role: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          is_from_operator?: boolean | null
          is_suggested?: boolean | null
          metadata?: Json | null
          role: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          is_from_operator?: boolean | null
          is_suggested?: boolean | null
          metadata?: Json | null
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_triggers: {
        Row: {
          assistant_id: string
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          message_template: string
          name: string
          trigger_config: Json
          trigger_type: string
          updated_at: string
        }
        Insert: {
          assistant_id: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          message_template: string
          name: string
          trigger_config?: Json
          trigger_type: string
          updated_at?: string
        }
        Update: {
          assistant_id?: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          message_template?: string
          name?: string
          trigger_config?: Json
          trigger_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_triggers_assistant_id_fkey"
            columns: ["assistant_id"]
            isOneToOne: false
            referencedRelation: "assistants"
            referencedColumns: ["id"]
          },
        ]
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
        Relationships: []
      }
      profiles: {
        Row: {
          company_name: string
          created_at: string | null
          id: string
          industry: string | null
          updated_at: string | null
        }
        Insert: {
          company_name: string
          created_at?: string | null
          id: string
          industry?: string | null
          updated_at?: string | null
        }
        Update: {
          company_name?: string
          created_at?: string | null
          id?: string
          industry?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      quick_responses: {
        Row: {
          assistant_id: string
          category: string | null
          content: string
          created_at: string
          id: string
          is_active: boolean
          shortcut: string | null
          title: string
          updated_at: string
        }
        Insert: {
          assistant_id: string
          category?: string | null
          content: string
          created_at?: string
          id?: string
          is_active?: boolean
          shortcut?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          assistant_id?: string
          category?: string | null
          content?: string
          created_at?: string
          id?: string
          is_active?: boolean
          shortcut?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "quick_responses_assistant_id_fkey"
            columns: ["assistant_id"]
            isOneToOne: false
            referencedRelation: "assistants"
            referencedColumns: ["id"]
          },
        ]
      }
      role_permissions: {
        Row: {
          actions: Json
          created_at: string
          id: string
          resource: string
          role: string
        }
        Insert: {
          actions?: Json
          created_at?: string
          id?: string
          resource: string
          role: string
        }
        Update: {
          actions?: Json
          created_at?: string
          id?: string
          resource?: string
          role?: string
        }
        Relationships: []
      }
      scheduled_campaigns: {
        Row: {
          assistant_id: string
          created_at: string
          id: string
          message: string
          name: string
          recipient_filter: Json
          repeat_type: string | null
          send_date: string
          status: string
        }
        Insert: {
          assistant_id: string
          created_at?: string
          id?: string
          message: string
          name: string
          recipient_filter?: Json
          repeat_type?: string | null
          send_date: string
          status?: string
        }
        Update: {
          assistant_id?: string
          created_at?: string
          id?: string
          message?: string
          name?: string
          recipient_filter?: Json
          repeat_type?: string | null
          send_date?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "scheduled_campaigns_assistant_id_fkey"
            columns: ["assistant_id"]
            isOneToOne: false
            referencedRelation: "assistants"
            referencedColumns: ["id"]
          },
        ]
      }
      scheduled_messages: {
        Row: {
          conversation_id: string
          created_at: string
          id: string
          message: string
          scheduled_for: string
          sent_at: string | null
          status: string
        }
        Insert: {
          conversation_id: string
          created_at?: string
          id?: string
          message: string
          scheduled_for: string
          sent_at?: string | null
          status?: string
        }
        Update: {
          conversation_id?: string
          created_at?: string
          id?: string
          message?: string
          scheduled_for?: string
          sent_at?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "scheduled_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      subscription_plans: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          is_trial: boolean | null
          max_monthly_messages: number
          max_whatsapp_numbers: number
          name: string
          price_monthly: number
          stripe_price_id: string | null
          stripe_product_id: string | null
          trial_days: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          is_trial?: boolean | null
          max_monthly_messages: number
          max_whatsapp_numbers: number
          name: string
          price_monthly: number
          stripe_price_id?: string | null
          stripe_product_id?: string | null
          trial_days?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          is_trial?: boolean | null
          max_monthly_messages?: number
          max_whatsapp_numbers?: number
          name?: string
          price_monthly?: number
          stripe_price_id?: string | null
          stripe_product_id?: string | null
          trial_days?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      tags: {
        Row: {
          assistant_id: string
          color: string
          created_at: string
          id: string
          name: string
        }
        Insert: {
          assistant_id: string
          color?: string
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          assistant_id?: string
          color?: string
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "tags_assistant_id_fkey"
            columns: ["assistant_id"]
            isOneToOne: false
            referencedRelation: "assistants"
            referencedColumns: ["id"]
          },
        ]
      }
      team_invitations: {
        Row: {
          accepted_at: string | null
          assistant_id: string
          created_at: string
          email: string
          expires_at: string
          id: string
          invited_by: string
          role: string
          token: string
        }
        Insert: {
          accepted_at?: string | null
          assistant_id: string
          created_at?: string
          email: string
          expires_at: string
          id?: string
          invited_by: string
          role: string
          token: string
        }
        Update: {
          accepted_at?: string | null
          assistant_id?: string
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          invited_by?: string
          role?: string
          token?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_invitations_assistant_id_fkey"
            columns: ["assistant_id"]
            isOneToOne: false
            referencedRelation: "assistants"
            referencedColumns: ["id"]
          },
        ]
      }
      team_members: {
        Row: {
          assistant_id: string
          created_at: string
          id: string
          is_active: boolean
          permissions: Json
          role: string
          user_id: string
        }
        Insert: {
          assistant_id: string
          created_at?: string
          id?: string
          is_active?: boolean
          permissions?: Json
          role: string
          user_id: string
        }
        Update: {
          assistant_id?: string
          created_at?: string
          id?: string
          is_active?: boolean
          permissions?: Json
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_members_assistant_id_fkey"
            columns: ["assistant_id"]
            isOneToOne: false
            referencedRelation: "assistants"
            referencedColumns: ["id"]
          },
        ]
      }
      usage_tracking: {
        Row: {
          created_at: string
          id: string
          messages_sent: number
          month_year: string
          updated_at: string
          user_id: string
          whatsapp_numbers_count: number
        }
        Insert: {
          created_at?: string
          id?: string
          messages_sent?: number
          month_year: string
          updated_at?: string
          user_id: string
          whatsapp_numbers_count?: number
        }
        Update: {
          created_at?: string
          id?: string
          messages_sent?: number
          month_year?: string
          updated_at?: string
          user_id?: string
          whatsapp_numbers_count?: number
        }
        Relationships: []
      }
      user_preferences: {
        Row: {
          created_at: string
          email_notifications: boolean | null
          id: string
          language: string | null
          notifications_enabled: boolean | null
          theme: string | null
          timezone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email_notifications?: boolean | null
          id?: string
          language?: string | null
          notifications_enabled?: boolean | null
          theme?: string | null
          timezone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email_notifications?: boolean | null
          id?: string
          language?: string | null
          notifications_enabled?: boolean | null
          theme?: string | null
          timezone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_subscriptions: {
        Row: {
          created_at: string
          current_period_end: string | null
          id: string
          plan_id: string
          status: string
          stripe_customer_id: string
          stripe_subscription_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_period_end?: string | null
          id?: string
          plan_id: string
          status?: string
          stripe_customer_id: string
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_period_end?: string | null
          id?: string
          plan_id?: string
          status?: string
          stripe_customer_id?: string
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      webhooks: {
        Row: {
          assistant_id: string
          created_at: string
          events: string[]
          id: string
          is_active: boolean
          name: string
          secret: string | null
          updated_at: string
          url: string
        }
        Insert: {
          assistant_id: string
          created_at?: string
          events: string[]
          id?: string
          is_active?: boolean
          name: string
          secret?: string | null
          updated_at?: string
          url: string
        }
        Update: {
          assistant_id?: string
          created_at?: string
          events?: string[]
          id?: string
          is_active?: boolean
          name?: string
          secret?: string | null
          updated_at?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "webhooks_assistant_id_fkey"
            columns: ["assistant_id"]
            isOneToOne: false
            referencedRelation: "assistants"
            referencedColumns: ["id"]
          },
        ]
      }
      workflows: {
        Row: {
          actions: Json
          assistant_id: string
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          trigger_type: string
          trigger_value: Json
          updated_at: string
        }
        Insert: {
          actions?: Json
          assistant_id: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          trigger_type: string
          trigger_value?: Json
          updated_at?: string
        }
        Update: {
          actions?: Json
          assistant_id?: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          trigger_type?: string
          trigger_value?: Json
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "workflows_assistant_id_fkey"
            columns: ["assistant_id"]
            isOneToOne: false
            referencedRelation: "assistants"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_ai_assistant: {
        Args: {
          p_description: string
          p_industry: string
          p_name: string
          p_phone_number: string
          p_user_id: string
        }
        Returns: Json
      }
      get_team_member_email: {
        Args: { member_user_id: string }
        Returns: string
      }
      log_activity: {
        Args: {
          p_action: string
          p_details?: Json
          p_entity_id?: string
          p_entity_type: string
        }
        Returns: undefined
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
