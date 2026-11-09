// CIVIC LENZ – Supabase Database Types & Module Schema Definitions
// Prepares types for the seven unchanged CIVIC LENZ core modules.

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      // ── Core User Profiles & RBAC ───────────────────────────────────────────
      user_profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          phone_masked: string | null
          role: 'citizen' | 'officer' | 'auditor' | 'admin'
          department: string | null
          district: string | null
          constituency_ac: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          phone_masked?: string | null
          role?: 'citizen' | 'officer' | 'auditor' | 'admin'
          department?: string | null
          district?: string | null
          constituency_ac?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          phone_masked?: string | null
          role?: 'citizen' | 'officer' | 'auditor' | 'admin'
          department?: string | null
          district?: string | null
          constituency_ac?: number | null
          updated_at?: string
        }
      }

      // ── Module 1: Government Promise & Project Progress Tracking ────────────
      projects: {
        Row: {
          id: string
          title: string
          slug: string
          department_id: string
          district: string
          constituency_ac: number | null
          allocated_budget_inr: number
          spent_budget_inr: number
          status: 'Proposed' | 'Tendering' | 'In progress' | 'Completed' | 'On hold' | 'Delayed'
          progress_percent: number
          start_date: string | null
          target_completion_date: string | null
          actual_completion_date: string | null
          contractor_name: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['projects']['Row'], 'created_at' | 'updated_at'> & {
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database['public']['Tables']['projects']['Row']>
      }

      // ── Module 2: Citizen-Based Project Verification & Ground Reality ───────
      citizen_verifications: {
        Row: {
          id: string
          project_id: string
          citizen_id: string
          verification_status: 'Matches Ground Reality' | 'Minor Discrepancy' | 'Major Violation' | 'Ghost Project'
          progress_estimate_percent: number
          photo_urls: string[]
          geo_lat: number | null
          geo_lng: number | null
          citizen_notes: string
          auditor_verified: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['citizen_verifications']['Row'], 'created_at'> & {
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['citizen_verifications']['Row']>
      }

      // ── Module 3: Locality-Wise Government Development Tracking ─────────────
      constituencies_ac: {
        Row: {
          id: number
          name: string
          district: string
          mla_name: string | null
          mla_party: string | null
          total_projects: number
          total_fund_allocated_cr: number
          total_fund_spent_cr: number
        }
        Insert: Database['public']['Tables']['constituencies_ac']['Row']
        Update: Partial<Database['public']['Tables']['constituencies_ac']['Row']>
      }

      // ── Module 4: Project Historical Tracking Across Government Changes ─────
      project_history: {
        Row: {
          id: string
          project_id: string
          ruling_regime: string
          action_taken: string
          budget_reallocated_inr: number | null
          status_at_transition: string
          transition_year: number
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['project_history']['Row'], 'created_at'> & {
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['project_history']['Row']>
      }

      // ── Module 5: Citizen-Reported Project Quality & Maintenance Monitoring ─
      complaints: {
        Row: {
          id: string
          ticket_number: string
          citizen_id: string
          category: string
          title: string
          description: string
          district: string
          status: 'Submitted' | 'Acknowledged' | 'In progress' | 'Escalated' | 'Resolved' | 'Rejected'
          priority: 'Low' | 'Medium' | 'High' | 'Emergency'
          attachment_urls: string[]
          assigned_officer_id: string | null
          created_at: string
          resolved_at: string | null
        }
        Insert: Omit<Database['public']['Tables']['complaints']['Row'], 'created_at' | 'resolved_at'> & {
          created_at?: string
          resolved_at?: string | null
        }
        Update: Partial<Database['public']['Tables']['complaints']['Row']>
      }

      // ── Module 6: Scheme Application Assistance & Grievance Escalation ───────
      schemes: {
        Row: {
          id: string
          name: string
          department: string
          beneficiary_type: string
          financial_assistance: string | null
          eligibility_criteria: Json
          application_url: string | null
          active: boolean
        }
        Insert: Database['public']['Tables']['schemes']['Row']
        Update: Partial<Database['public']['Tables']['schemes']['Row']>
      }

      // ── Module 7: Department-Wise Fund Allocation & Expenditure Monitoring ──
      department_budgets: {
        Row: {
          id: string
          department_name: string
          financial_year: string
          allocated_cr: number
          utilized_cr: number
          unspent_cr: number
          schemes_count: number
          updated_at: string
        }
        Insert: Database['public']['Tables']['department_budgets']['Row']
        Update: Partial<Database['public']['Tables']['department_budgets']['Row']>
      }
    }
  }
}

