import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          password_hash: string;
          api_key: string;
          plan: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          password_hash: string;
          api_key: string;
          plan?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          password_hash?: string;
          api_key?: string;
          plan?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      projects: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          domain: string | null;
          api_key: string;
          settings: any;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          domain?: string | null;
          api_key: string;
          settings?: any;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          domain?: string | null;
          api_key?: string;
          settings?: any;
          created_at?: string;
        };
      };
      bug_reports: {
        Row: {
          id: string;
          project_id: string;
          title: string;
          description: string;
          severity: string;
          status: string;
          screenshot: string | null;
          environment: any;
          user_email: string | null;
          user_agent: string | null;
          url: string | null;
          steps: any;
          tags: any;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          title: string;
          description: string;
          severity?: string;
          status?: string;
          screenshot?: string | null;
          environment?: any;
          user_email?: string | null;
          user_agent?: string | null;
          url?: string | null;
          steps?: any;
          tags?: any;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          title?: string;
          description?: string;
          severity?: string;
          status?: string;
          screenshot?: string | null;
          environment?: any;
          user_email?: string | null;
          user_agent?: string | null;
          url?: string | null;
          steps?: any;
          tags?: any;
          created_at?: string;
          updated_at?: string;
        };
      };
      analytics: {
        Row: {
          id: string;
          project_id: string;
          event_type: string;
          event_data: any;
          created_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          event_type: string;
          event_data?: any;
          created_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          event_type?: string;
          event_data?: any;
          created_at?: string;
        };
      };
    };
  };
}