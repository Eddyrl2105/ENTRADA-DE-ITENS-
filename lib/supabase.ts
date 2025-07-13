import { createClient } from "@supabase/supabase-js"

const supabaseUrl = "https://gnejvfwolpdpldhrfcvd.supabase.co"
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImduZWp2ZndvbHBkcGxkaHJmY3ZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI0MTY4OTYsImV4cCI6MjA2Nzk5Mjg5Nn0.cElcpD_cCEeMG3956yo91XMQ9DwBqt9EtFu-XybQvs4"

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          username: string
          password_hash: string
          created_at: string
        }
        Insert: {
          id?: string
          username: string
          password_hash: string
          created_at?: string
        }
        Update: {
          id?: string
          username?: string
          password_hash?: string
          created_at?: string
        }
      }
      products: {
        Row: {
          id: string
          codigo_pa: string
          descricao: string
          quantidade: number
          lote: string
          validade: string
          codigo_barras: string | null
          user_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          codigo_pa: string
          descricao: string
          quantidade: number
          lote: string
          validade: string
          codigo_barras?: string | null
          user_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          codigo_pa?: string
          descricao?: string
          quantidade?: number
          lote?: string
          validade?: string
          codigo_barras?: string | null
          user_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      barcodes: {
        Row: {
          id: string
          codigo_barras: string
          codigo_pa: string | null
          descricao: string | null
          created_at: string
        }
        Insert: {
          id?: string
          codigo_barras: string
          codigo_pa?: string | null
          descricao?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          codigo_barras?: string
          codigo_pa?: string | null
          descricao?: string | null
          created_at?: string
        }
      }
    }
  }
}
