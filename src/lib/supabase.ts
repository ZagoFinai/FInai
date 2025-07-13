import { createClient } from '@supabase/supabase-js';

// Verificar se as variáveis de ambiente estão definidas
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Criar cliente Supabase apenas se as variáveis estiverem configuradas
export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export type Database = {
  public: {
    Tables: {
      clients: {
        Row: {
          id: string;
          name: string;
          phone: string;
          email: string;
          status: 'Teste Grátis' | 'Pagante' | 'Expirado';
          registration_date: string;
          last_activity: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          phone: string;
          email: string;
          status?: 'Teste Grátis' | 'Pagante' | 'Expirado';
          registration_date?: string;
          last_activity?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          phone?: string;
          email?: string;
          status?: 'Teste Grátis' | 'Pagante' | 'Expirado';
          registration_date?: string;
          last_activity?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
};