import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please set up Supabase connection.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      security_associations: {
        Row: {
          id: string;
          destination_address: string;
          spi: number;
          protocol: 'ESP' | 'AH';
          algorithm: string;
          key_hash: string;
          lifetime: number;
          status: 'active' | 'expired' | 'pending';
          blockchain_tx_hash: string | null;
          blockchain_verified: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          destination_address: string;
          spi: number;
          protocol: 'ESP' | 'AH';
          algorithm: string;
          key_hash: string;
          lifetime: number;
          status?: 'active' | 'expired' | 'pending';
          blockchain_tx_hash?: string | null;
          blockchain_verified?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          destination_address?: string;
          spi?: number;
          protocol?: 'ESP' | 'AH';
          algorithm?: string;
          key_hash?: string;
          lifetime?: number;
          status?: 'active' | 'expired' | 'pending';
          blockchain_tx_hash?: string | null;
          blockchain_verified?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      sa_audit_log: {
        Row: {
          id: string;
          sa_id: string;
          action: 'CREATE' | 'UPDATE' | 'DELETE';
          old_values: any | null;
          new_values: any | null;
          blockchain_tx_hash: string | null;
          created_at: string;
          user_id: string | null;
        };
        Insert: {
          id?: string;
          sa_id: string;
          action: 'CREATE' | 'UPDATE' | 'DELETE';
          old_values?: any | null;
          new_values?: any | null;
          blockchain_tx_hash?: string | null;
          created_at?: string;
          user_id?: string | null;
        };
        Update: {
          id?: string;
          sa_id?: string;
          action?: 'CREATE' | 'UPDATE' | 'DELETE';
          old_values?: any | null;
          new_values?: any | null;
          blockchain_tx_hash?: string | null;
          created_at?: string;
          user_id?: string | null;
        };
      };
    };
  };
};