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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      announcement_reactions: {
        Row: {
          announcement_id: string
          created_at: string
          emoji: string
          employee_id: string
          id: string
        }
        Insert: {
          announcement_id: string
          created_at?: string
          emoji: string
          employee_id: string
          id?: string
        }
        Update: {
          announcement_id?: string
          created_at?: string
          emoji?: string
          employee_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "announcement_reactions_announcement_id_fkey"
            columns: ["announcement_id"]
            isOneToOne: false
            referencedRelation: "announcements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "announcement_reactions_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      announcements: {
        Row: {
          author_id: string
          category: Database["public"]["Enums"]["announcement_category"]
          company_id: string
          content: string
          created_at: string
          expires_at: string | null
          id: string
          is_pinned: boolean
          is_published: boolean
          priority: Database["public"]["Enums"]["announcement_priority"]
          title: string
          updated_at: string
        }
        Insert: {
          author_id: string
          category?: Database["public"]["Enums"]["announcement_category"]
          company_id: string
          content: string
          created_at?: string
          expires_at?: string | null
          id?: string
          is_pinned?: boolean
          is_published?: boolean
          priority?: Database["public"]["Enums"]["announcement_priority"]
          title: string
          updated_at?: string
        }
        Update: {
          author_id?: string
          category?: Database["public"]["Enums"]["announcement_category"]
          company_id?: string
          content?: string
          created_at?: string
          expires_at?: string | null
          id?: string
          is_pinned?: boolean
          is_published?: boolean
          priority?: Database["public"]["Enums"]["announcement_priority"]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "announcements_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "announcements_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      attendance: {
        Row: {
          clock_in: string
          clock_in_lat: number
          clock_in_lng: number
          clock_out: string | null
          clock_out_lat: number | null
          clock_out_lng: number | null
          created_at: string
          employee_id: string
          geofence_id: string
          id: string
          notes: string | null
          overtime_hours: number | null
          status: Database["public"]["Enums"]["attendance_status"]
          total_hours: number | null
          updated_at: string
        }
        Insert: {
          clock_in: string
          clock_in_lat: number
          clock_in_lng: number
          clock_out?: string | null
          clock_out_lat?: number | null
          clock_out_lng?: number | null
          created_at?: string
          employee_id: string
          geofence_id: string
          id?: string
          notes?: string | null
          overtime_hours?: number | null
          status?: Database["public"]["Enums"]["attendance_status"]
          total_hours?: number | null
          updated_at?: string
        }
        Update: {
          clock_in?: string
          clock_in_lat?: number
          clock_in_lng?: number
          clock_out?: string | null
          clock_out_lat?: number | null
          clock_out_lng?: number | null
          created_at?: string
          employee_id?: string
          geofence_id?: string
          id?: string
          notes?: string | null
          overtime_hours?: number | null
          status?: Database["public"]["Enums"]["attendance_status"]
          total_hours?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "attendance_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_geofence_id_fkey"
            columns: ["geofence_id"]
            isOneToOne: false
            referencedRelation: "geofences"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          after_data: Json | null
          before_data: Json | null
          created_at: string
          id: string
          ip_address: string | null
          module: string
          record_id: string | null
          table_name: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          after_data?: Json | null
          before_data?: Json | null
          created_at?: string
          id?: string
          ip_address?: string | null
          module: string
          record_id?: string | null
          table_name?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          after_data?: Json | null
          before_data?: Json | null
          created_at?: string
          id?: string
          ip_address?: string | null
          module?: string
          record_id?: string | null
          table_name?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      availabilities: {
        Row: {
          created_at: string
          day_of_week: number
          effective_from: string
          effective_to: string | null
          employee_id: string
          end_time: string
          id: string
          is_available: boolean
          start_time: string
        }
        Insert: {
          created_at?: string
          day_of_week: number
          effective_from?: string
          effective_to?: string | null
          employee_id: string
          end_time: string
          id?: string
          is_available?: boolean
          start_time: string
        }
        Update: {
          created_at?: string
          day_of_week?: number
          effective_from?: string
          effective_to?: string | null
          employee_id?: string
          end_time?: string
          id?: string
          is_available?: boolean
          start_time?: string
        }
        Relationships: [
          {
            foreignKeyName: "availabilities_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      benefit_enrollments: {
        Row: {
          benefit_id: string
          coverage_type: string
          created_at: string
          effective_date: string
          employee_id: string
          end_date: string | null
          enrolled_at: string
          id: string
          status: string
        }
        Insert: {
          benefit_id: string
          coverage_type?: string
          created_at?: string
          effective_date?: string
          employee_id: string
          end_date?: string | null
          enrolled_at?: string
          id?: string
          status?: string
        }
        Update: {
          benefit_id?: string
          coverage_type?: string
          created_at?: string
          effective_date?: string
          employee_id?: string
          end_date?: string | null
          enrolled_at?: string
          id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "benefit_enrollments_benefit_id_fkey"
            columns: ["benefit_id"]
            isOneToOne: false
            referencedRelation: "benefits"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "benefit_enrollments_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      benefits: {
        Row: {
          category: string
          company_id: string
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          monthly_cost: number
          name: string
          provider: string | null
          updated_at: string
        }
        Insert: {
          category: string
          company_id: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          monthly_cost?: number
          name: string
          provider?: string | null
          updated_at?: string
        }
        Update: {
          category?: string
          company_id?: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          monthly_cost?: number
          name?: string
          provider?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "benefits_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      channel_members: {
        Row: {
          channel_id: string
          employee_id: string
          id: string
          joined_at: string
          role: string
        }
        Insert: {
          channel_id: string
          employee_id: string
          id?: string
          joined_at?: string
          role?: string
        }
        Update: {
          channel_id?: string
          employee_id?: string
          id?: string
          joined_at?: string
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "channel_members_channel_id_fkey"
            columns: ["channel_id"]
            isOneToOne: false
            referencedRelation: "channels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "channel_members_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      channels: {
        Row: {
          company_id: string
          created_at: string
          created_by: string
          department_id: string | null
          description: string | null
          id: string
          is_archived: boolean
          name: string
          type: string
        }
        Insert: {
          company_id: string
          created_at?: string
          created_by: string
          department_id?: string | null
          description?: string | null
          id?: string
          is_archived?: boolean
          name: string
          type?: string
        }
        Update: {
          company_id?: string
          created_at?: string
          created_by?: string
          department_id?: string | null
          description?: string | null
          id?: string
          is_archived?: boolean
          name?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "channels_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "channels_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "channels_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_messages: {
        Row: {
          agent_type: string | null
          content: string
          created_at: string
          id: string
          role: string
          session_id: string
          user_id: string
        }
        Insert: {
          agent_type?: string | null
          content: string
          created_at?: string
          id?: string
          role: string
          session_id: string
          user_id: string
        }
        Update: {
          agent_type?: string | null
          content?: string
          created_at?: string
          id?: string
          role?: string
          session_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      companies: {
        Row: {
          address: string | null
          created_at: string
          id: string
          logo: string | null
          name: string
          timezone: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          id?: string
          logo?: string | null
          name: string
          timezone?: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          created_at?: string
          id?: string
          logo?: string | null
          name?: string
          timezone?: string
          updated_at?: string
        }
        Relationships: []
      }
      company_settings: {
        Row: {
          attendance_grace_period: number
          auto_clock_out_hours: number
          company_address: string
          company_email: string
          company_id: string
          company_name: string
          company_phone: string
          company_website: string
          compliance_alerts: boolean
          created_at: string
          currency: string
          default_paye_code: Database["public"]["Enums"]["paye_code"]
          email_notifications: boolean
          id: string
          ja_compliance_enabled: boolean
          overtime_multiplier: number
          overtime_threshold: number
          password_min_length: number
          pay_period_start_day: number
          payroll_alerts: boolean
          payroll_frequency: string
          pto_alerts: boolean
          push_notifications: boolean
          require_geofence: boolean
          session_timeout: number
          tax_filing_default: string
          two_factor_auth: boolean
          updated_at: string
        }
        Insert: {
          attendance_grace_period?: number
          auto_clock_out_hours?: number
          company_address?: string
          company_email?: string
          company_id: string
          company_name?: string
          company_phone?: string
          company_website?: string
          compliance_alerts?: boolean
          created_at?: string
          currency?: string
          default_paye_code?: Database["public"]["Enums"]["paye_code"]
          email_notifications?: boolean
          id?: string
          ja_compliance_enabled?: boolean
          overtime_multiplier?: number
          overtime_threshold?: number
          password_min_length?: number
          pay_period_start_day?: number
          payroll_alerts?: boolean
          payroll_frequency?: string
          pto_alerts?: boolean
          push_notifications?: boolean
          require_geofence?: boolean
          session_timeout?: number
          tax_filing_default?: string
          two_factor_auth?: boolean
          updated_at?: string
        }
        Update: {
          attendance_grace_period?: number
          auto_clock_out_hours?: number
          company_address?: string
          company_email?: string
          company_id?: string
          company_name?: string
          company_phone?: string
          company_website?: string
          compliance_alerts?: boolean
          created_at?: string
          currency?: string
          default_paye_code?: Database["public"]["Enums"]["paye_code"]
          email_notifications?: boolean
          id?: string
          ja_compliance_enabled?: boolean
          overtime_multiplier?: number
          overtime_threshold?: number
          password_min_length?: number
          pay_period_start_day?: number
          payroll_alerts?: boolean
          payroll_frequency?: string
          pto_alerts?: boolean
          push_notifications?: boolean
          require_geofence?: boolean
          session_timeout?: number
          tax_filing_default?: string
          two_factor_auth?: boolean
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "company_settings_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: true
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      course_enrollments: {
        Row: {
          completed_at: string | null
          course_id: string
          employee_id: string
          enrolled_at: string
          id: string
          progress: number
          score: number | null
          status: Database["public"]["Enums"]["enrollment_status"]
        }
        Insert: {
          completed_at?: string | null
          course_id: string
          employee_id: string
          enrolled_at?: string
          id?: string
          progress?: number
          score?: number | null
          status?: Database["public"]["Enums"]["enrollment_status"]
        }
        Update: {
          completed_at?: string | null
          course_id?: string
          employee_id?: string
          enrolled_at?: string
          id?: string
          progress?: number
          score?: number | null
          status?: Database["public"]["Enums"]["enrollment_status"]
        }
        Relationships: [
          {
            foreignKeyName: "course_enrollments_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "course_enrollments_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      courses: {
        Row: {
          category: string
          company_id: string
          created_at: string
          description: string | null
          difficulty: string
          duration_hours: number
          id: string
          instructor: string | null
          max_capacity: number | null
          status: Database["public"]["Enums"]["course_status"]
          thumbnail_url: string | null
          title: string
          updated_at: string
        }
        Insert: {
          category: string
          company_id: string
          created_at?: string
          description?: string | null
          difficulty?: string
          duration_hours?: number
          id?: string
          instructor?: string | null
          max_capacity?: number | null
          status?: Database["public"]["Enums"]["course_status"]
          thumbnail_url?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          category?: string
          company_id?: string
          created_at?: string
          description?: string | null
          difficulty?: string
          duration_hours?: number
          id?: string
          instructor?: string | null
          max_capacity?: number | null
          status?: Database["public"]["Enums"]["course_status"]
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "courses_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      department_roles: {
        Row: {
          can_approve_payroll: boolean
          can_assign_roles: boolean
          can_edit_employees: boolean
          can_edit_payroll: boolean
          can_manage_it: boolean
          can_manage_schedule: boolean
          can_view_all_employees: boolean
          can_view_payroll: boolean
          code: string
          created_at: string
          department_id: string | null
          description: string | null
          grade_level: number
          id: string
          is_management: boolean
          reports_to: string | null
          sort_order: number
          title: string
          updated_at: string
        }
        Insert: {
          can_approve_payroll?: boolean
          can_assign_roles?: boolean
          can_edit_employees?: boolean
          can_edit_payroll?: boolean
          can_manage_it?: boolean
          can_manage_schedule?: boolean
          can_view_all_employees?: boolean
          can_view_payroll?: boolean
          code: string
          created_at?: string
          department_id?: string | null
          description?: string | null
          grade_level?: number
          id?: string
          is_management?: boolean
          reports_to?: string | null
          sort_order?: number
          title: string
          updated_at?: string
        }
        Update: {
          can_approve_payroll?: boolean
          can_assign_roles?: boolean
          can_edit_employees?: boolean
          can_edit_payroll?: boolean
          can_manage_it?: boolean
          can_manage_schedule?: boolean
          can_view_all_employees?: boolean
          can_view_payroll?: boolean
          code?: string
          created_at?: string
          department_id?: string | null
          description?: string | null
          grade_level?: number
          id?: string
          is_management?: boolean
          reports_to?: string | null
          sort_order?: number
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "department_roles_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "department_roles_reports_to_fkey"
            columns: ["reports_to"]
            isOneToOne: false
            referencedRelation: "department_roles"
            referencedColumns: ["id"]
          },
        ]
      }
      departments: {
        Row: {
          code: string
          company_id: string
          created_at: string
          description: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          code: string
          company_id: string
          created_at?: string
          description?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          code?: string
          company_id?: string
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "departments_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          category: string
          company_id: string
          created_at: string
          department_id: string | null
          description: string | null
          expires_at: string | null
          file_size: number | null
          file_type: string | null
          file_url: string | null
          id: string
          is_public: boolean
          owner_id: string
          status: Database["public"]["Enums"]["document_status"]
          title: string
          updated_at: string
          version: number
        }
        Insert: {
          category?: string
          company_id: string
          created_at?: string
          department_id?: string | null
          description?: string | null
          expires_at?: string | null
          file_size?: number | null
          file_type?: string | null
          file_url?: string | null
          id?: string
          is_public?: boolean
          owner_id: string
          status?: Database["public"]["Enums"]["document_status"]
          title: string
          updated_at?: string
          version?: number
        }
        Update: {
          category?: string
          company_id?: string
          created_at?: string
          department_id?: string | null
          description?: string | null
          expires_at?: string | null
          file_size?: number | null
          file_type?: string | null
          file_url?: string | null
          id?: string
          is_public?: boolean
          owner_id?: string
          status?: Database["public"]["Enums"]["document_status"]
          title?: string
          updated_at?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "documents_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      employees: {
        Row: {
          address: string | null
          auth_user_id: string | null
          avatar: string | null
          bank_account: string | null
          company_id: string
          contract_type: Database["public"]["Enums"]["contract_type"]
          created_at: string
          department_id: string
          email: string
          emergency_contact: string | null
          emergency_phone: string | null
          employee_id: string
          first_name: string
          grade_step: number
          hire_date: string
          id: string
          last_name: string
          nht_number: string | null
          nis_number: string | null
          overtime_rate: number
          pay_rate: number
          pay_type: Database["public"]["Enums"]["pay_type"]
          paye_tax_code: Database["public"]["Enums"]["paye_code"] | null
          phone: string | null
          reporting_to: string | null
          role: string
          role_tier: Database["public"]["Enums"]["role_tier"]
          status: Database["public"]["Enums"]["employee_status"]
          tax_allowances: number
          tax_filing_status: string | null
          trn: string | null
          updated_at: string
          work_location_id: string | null
        }
        Insert: {
          address?: string | null
          auth_user_id?: string | null
          avatar?: string | null
          bank_account?: string | null
          company_id: string
          contract_type?: Database["public"]["Enums"]["contract_type"]
          created_at?: string
          department_id: string
          email: string
          emergency_contact?: string | null
          emergency_phone?: string | null
          employee_id: string
          first_name: string
          grade_step?: number
          hire_date: string
          id?: string
          last_name: string
          nht_number?: string | null
          nis_number?: string | null
          overtime_rate?: number
          pay_rate?: number
          pay_type?: Database["public"]["Enums"]["pay_type"]
          paye_tax_code?: Database["public"]["Enums"]["paye_code"] | null
          phone?: string | null
          reporting_to?: string | null
          role?: string
          role_tier?: Database["public"]["Enums"]["role_tier"]
          status?: Database["public"]["Enums"]["employee_status"]
          tax_allowances?: number
          tax_filing_status?: string | null
          trn?: string | null
          updated_at?: string
          work_location_id?: string | null
        }
        Update: {
          address?: string | null
          auth_user_id?: string | null
          avatar?: string | null
          bank_account?: string | null
          company_id?: string
          contract_type?: Database["public"]["Enums"]["contract_type"]
          created_at?: string
          department_id?: string
          email?: string
          emergency_contact?: string | null
          emergency_phone?: string | null
          employee_id?: string
          first_name?: string
          grade_step?: number
          hire_date?: string
          id?: string
          last_name?: string
          nht_number?: string | null
          nis_number?: string | null
          overtime_rate?: number
          pay_rate?: number
          pay_type?: Database["public"]["Enums"]["pay_type"]
          paye_tax_code?: Database["public"]["Enums"]["paye_code"] | null
          phone?: string | null
          reporting_to?: string | null
          role?: string
          role_tier?: Database["public"]["Enums"]["role_tier"]
          status?: Database["public"]["Enums"]["employee_status"]
          tax_allowances?: number
          tax_filing_status?: string | null
          trn?: string | null
          updated_at?: string
          work_location_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "employees_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employees_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employees_reporting_to_fkey"
            columns: ["reporting_to"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_employees_work_location"
            columns: ["work_location_id"]
            isOneToOne: false
            referencedRelation: "geofences"
            referencedColumns: ["id"]
          },
        ]
      }
      expense_claims: {
        Row: {
          amount: number
          approved_at: string | null
          approved_by: string | null
          category: string
          created_at: string
          currency: string
          date_incurred: string
          description: string | null
          employee_id: string
          id: string
          notes: string | null
          paid_at: string | null
          receipt_url: string | null
          status: Database["public"]["Enums"]["expense_status"]
          title: string
          updated_at: string
        }
        Insert: {
          amount: number
          approved_at?: string | null
          approved_by?: string | null
          category: string
          created_at?: string
          currency?: string
          date_incurred: string
          description?: string | null
          employee_id: string
          id?: string
          notes?: string | null
          paid_at?: string | null
          receipt_url?: string | null
          status?: Database["public"]["Enums"]["expense_status"]
          title: string
          updated_at?: string
        }
        Update: {
          amount?: number
          approved_at?: string | null
          approved_by?: string | null
          category?: string
          created_at?: string
          currency?: string
          date_incurred?: string
          description?: string | null
          employee_id?: string
          id?: string
          notes?: string | null
          paid_at?: string | null
          receipt_url?: string | null
          status?: Database["public"]["Enums"]["expense_status"]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "expense_claims_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expense_claims_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      feature_flags: {
        Row: {
          description: string | null
          enabled: boolean
          key: string
          updated_at: string
        }
        Insert: {
          description?: string | null
          enabled?: boolean
          key: string
          updated_at?: string
        }
        Update: {
          description?: string | null
          enabled?: boolean
          key?: string
          updated_at?: string
        }
        Relationships: []
      }
      feedback_entries: {
        Row: {
          content: string | null
          created_at: string
          from_id: string
          id: string
          is_anonymous: boolean
          rating: number | null
          responses: Json | null
          survey_id: string | null
          to_id: string | null
          type: string
        }
        Insert: {
          content?: string | null
          created_at?: string
          from_id: string
          id?: string
          is_anonymous?: boolean
          rating?: number | null
          responses?: Json | null
          survey_id?: string | null
          to_id?: string | null
          type?: string
        }
        Update: {
          content?: string | null
          created_at?: string
          from_id?: string
          id?: string
          is_anonymous?: boolean
          rating?: number | null
          responses?: Json | null
          survey_id?: string | null
          to_id?: string | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "feedback_entries_from_id_fkey"
            columns: ["from_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "feedback_entries_survey_id_fkey"
            columns: ["survey_id"]
            isOneToOne: false
            referencedRelation: "surveys"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "feedback_entries_to_id_fkey"
            columns: ["to_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      geofences: {
        Row: {
          address: string | null
          center_lat: number
          center_lng: number
          company_id: string
          created_at: string
          department_id: string | null
          id: string
          is_active: boolean
          name: string
          polygon: Json
          radius: number
          type: Database["public"]["Enums"]["geofence_type"]
          updated_at: string
        }
        Insert: {
          address?: string | null
          center_lat: number
          center_lng: number
          company_id: string
          created_at?: string
          department_id?: string | null
          id?: string
          is_active?: boolean
          name: string
          polygon: Json
          radius?: number
          type?: Database["public"]["Enums"]["geofence_type"]
          updated_at?: string
        }
        Update: {
          address?: string | null
          center_lat?: number
          center_lng?: number
          company_id?: string
          created_at?: string
          department_id?: string | null
          id?: string
          is_active?: boolean
          name?: string
          polygon?: Json
          radius?: number
          type?: Database["public"]["Enums"]["geofence_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "geofences_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "geofences_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
        ]
      }
      goal_check_ins: {
        Row: {
          author_id: string
          created_at: string
          goal_id: string
          id: string
          note: string
          progress: number | null
        }
        Insert: {
          author_id: string
          created_at?: string
          goal_id: string
          id?: string
          note: string
          progress?: number | null
        }
        Update: {
          author_id?: string
          created_at?: string
          goal_id?: string
          id?: string
          note?: string
          progress?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "goal_check_ins_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "goal_check_ins_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "goals"
            referencedColumns: ["id"]
          },
        ]
      }
      goals: {
        Row: {
          created_at: string
          department_id: string | null
          description: string | null
          due_date: string | null
          id: string
          is_team_goal: boolean
          owner_id: string
          parent_goal: string | null
          progress: number
          status: Database["public"]["Enums"]["goal_status"]
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          department_id?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          is_team_goal?: boolean
          owner_id: string
          parent_goal?: string | null
          progress?: number
          status?: Database["public"]["Enums"]["goal_status"]
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          department_id?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          is_team_goal?: boolean
          owner_id?: string
          parent_goal?: string | null
          progress?: number
          status?: Database["public"]["Enums"]["goal_status"]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "goals_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "goals_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "goals_parent_goal_fkey"
            columns: ["parent_goal"]
            isOneToOne: false
            referencedRelation: "goals"
            referencedColumns: ["id"]
          },
        ]
      }
      job_applicants: {
        Row: {
          cover_letter: string | null
          created_at: string
          email: string
          id: string
          job_id: string
          name: string
          notes: string | null
          phone: string | null
          rating: number | null
          resume_url: string | null
          stage: string
          updated_at: string
        }
        Insert: {
          cover_letter?: string | null
          created_at?: string
          email: string
          id?: string
          job_id: string
          name: string
          notes?: string | null
          phone?: string | null
          rating?: number | null
          resume_url?: string | null
          stage?: string
          updated_at?: string
        }
        Update: {
          cover_letter?: string | null
          created_at?: string
          email?: string
          id?: string
          job_id?: string
          name?: string
          notes?: string | null
          phone?: string | null
          rating?: number | null
          resume_url?: string | null
          stage?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_applicants_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_listings"
            referencedColumns: ["id"]
          },
        ]
      }
      job_listings: {
        Row: {
          applicant_count: number
          company_id: string
          created_at: string
          department: string
          description: string
          id: string
          location: string
          requirements: string
          salary_max: number | null
          salary_min: number | null
          status: Database["public"]["Enums"]["job_listing_status"]
          title: string
          type: Database["public"]["Enums"]["job_listing_type"]
          updated_at: string
        }
        Insert: {
          applicant_count?: number
          company_id: string
          created_at?: string
          department: string
          description: string
          id?: string
          location: string
          requirements: string
          salary_max?: number | null
          salary_min?: number | null
          status?: Database["public"]["Enums"]["job_listing_status"]
          title: string
          type?: Database["public"]["Enums"]["job_listing_type"]
          updated_at?: string
        }
        Update: {
          applicant_count?: number
          company_id?: string
          created_at?: string
          department?: string
          description?: string
          id?: string
          location?: string
          requirements?: string
          salary_max?: number | null
          salary_min?: number | null
          status?: Database["public"]["Enums"]["job_listing_status"]
          title?: string
          type?: Database["public"]["Enums"]["job_listing_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_listings_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      key_results: {
        Row: {
          created_at: string
          current_value: number
          goal_id: string
          id: string
          target_value: number
          title: string
          unit: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          current_value?: number
          goal_id: string
          id?: string
          target_value?: number
          title: string
          unit?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          current_value?: number
          goal_id?: string
          id?: string
          target_value?: number
          title?: string
          unit?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "key_results_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "goals"
            referencedColumns: ["id"]
          },
        ]
      }
      kudos: {
        Row: {
          category: Database["public"]["Enums"]["kudos_category"]
          company_id: string
          created_at: string
          id: string
          is_public: boolean
          message: string
          receiver_id: string
          sender_id: string
        }
        Insert: {
          category?: Database["public"]["Enums"]["kudos_category"]
          company_id: string
          created_at?: string
          id?: string
          is_public?: boolean
          message: string
          receiver_id: string
          sender_id: string
        }
        Update: {
          category?: Database["public"]["Enums"]["kudos_category"]
          company_id?: string
          created_at?: string
          id?: string
          is_public?: boolean
          message?: string
          receiver_id?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "kudos_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kudos_receiver_id_fkey"
            columns: ["receiver_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kudos_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      meeting_rooms: {
        Row: {
          amenities: string[] | null
          capacity: number
          company_id: string
          created_at: string
          floor: string | null
          id: string
          is_active: boolean
          name: string
        }
        Insert: {
          amenities?: string[] | null
          capacity?: number
          company_id: string
          created_at?: string
          floor?: string | null
          id?: string
          is_active?: boolean
          name: string
        }
        Update: {
          amenities?: string[] | null
          capacity?: number
          company_id?: string
          created_at?: string
          floor?: string | null
          id?: string
          is_active?: boolean
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "meeting_rooms_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          channel_id: string
          content: string
          created_at: string
          id: string
          is_deleted: boolean
          is_edited: boolean
          reply_to: string | null
          sender_id: string
          type: Database["public"]["Enums"]["message_type"]
          updated_at: string
        }
        Insert: {
          channel_id: string
          content: string
          created_at?: string
          id?: string
          is_deleted?: boolean
          is_edited?: boolean
          reply_to?: string | null
          sender_id: string
          type?: Database["public"]["Enums"]["message_type"]
          updated_at?: string
        }
        Update: {
          channel_id?: string
          content?: string
          created_at?: string
          id?: string
          is_deleted?: boolean
          is_edited?: boolean
          reply_to?: string | null
          sender_id?: string
          type?: Database["public"]["Enums"]["message_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_channel_id_fkey"
            columns: ["channel_id"]
            isOneToOne: false
            referencedRelation: "channels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_reply_to_fkey"
            columns: ["reply_to"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          link: string | null
          message: string
          pto_request_id: string | null
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          link?: string | null
          message: string
          pto_request_id?: string | null
          title: string
          type?: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          link?: string | null
          message?: string
          pto_request_id?: string | null
          title?: string
          type?: Database["public"]["Enums"]["notification_type"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_pto_request_id_fkey"
            columns: ["pto_request_id"]
            isOneToOne: false
            referencedRelation: "pto_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      onboarding_tasks: {
        Row: {
          assigned_to: string | null
          completed_at: string | null
          created_at: string
          description: string | null
          due_date: string | null
          employee_id: string
          id: string
          is_completed: boolean
          sort_order: number
          template_id: string | null
          title: string
        }
        Insert: {
          assigned_to?: string | null
          completed_at?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          employee_id: string
          id?: string
          is_completed?: boolean
          sort_order?: number
          template_id?: string | null
          title: string
        }
        Update: {
          assigned_to?: string | null
          completed_at?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          employee_id?: string
          id?: string
          is_completed?: boolean
          sort_order?: number
          template_id?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "onboarding_tasks_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "onboarding_tasks_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "onboarding_tasks_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "onboarding_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      onboarding_templates: {
        Row: {
          company_id: string
          created_at: string
          department_id: string | null
          description: string | null
          id: string
          is_active: boolean
          role_tier: Database["public"]["Enums"]["role_tier"] | null
          title: string
        }
        Insert: {
          company_id: string
          created_at?: string
          department_id?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          role_tier?: Database["public"]["Enums"]["role_tier"] | null
          title: string
        }
        Update: {
          company_id?: string
          created_at?: string
          department_id?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          role_tier?: Database["public"]["Enums"]["role_tier"] | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "onboarding_templates_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "onboarding_templates_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
        ]
      }
      payroll_periods: {
        Row: {
          company_id: string
          created_at: string
          end_date: string
          id: string
          name: string
          start_date: string
          status: Database["public"]["Enums"]["payroll_period_status"]
          updated_at: string
        }
        Insert: {
          company_id: string
          created_at?: string
          end_date: string
          id?: string
          name: string
          start_date: string
          status?: Database["public"]["Enums"]["payroll_period_status"]
          updated_at?: string
        }
        Update: {
          company_id?: string
          created_at?: string
          end_date?: string
          id?: string
          name?: string
          start_date?: string
          status?: Database["public"]["Enums"]["payroll_period_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payroll_periods_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      payroll_records: {
        Row: {
          created_at: string
          education_tax: number
          employee_id: string
          federal_tax: number
          gross_pay: number
          health_insurance: number
          id: string
          medicare: number
          net_pay: number
          nht_employee: number
          nht_employer: number
          nis_employee: number
          nis_employer: number
          notes: string | null
          other_deductions: number
          overtime_hours: number
          paye: number
          payroll_period_id: string
          regular_hours: number
          retirement_401k: number
          social_security: number
          state_tax: number
          status: Database["public"]["Enums"]["payroll_record_status"]
          total_deductions: number
          total_hours: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          education_tax?: number
          employee_id: string
          federal_tax?: number
          gross_pay?: number
          health_insurance?: number
          id?: string
          medicare?: number
          net_pay?: number
          nht_employee?: number
          nht_employer?: number
          nis_employee?: number
          nis_employer?: number
          notes?: string | null
          other_deductions?: number
          overtime_hours?: number
          paye?: number
          payroll_period_id: string
          regular_hours?: number
          retirement_401k?: number
          social_security?: number
          state_tax?: number
          status?: Database["public"]["Enums"]["payroll_record_status"]
          total_deductions?: number
          total_hours?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          education_tax?: number
          employee_id?: string
          federal_tax?: number
          gross_pay?: number
          health_insurance?: number
          id?: string
          medicare?: number
          net_pay?: number
          nht_employee?: number
          nht_employer?: number
          nis_employee?: number
          nis_employer?: number
          notes?: string | null
          other_deductions?: number
          overtime_hours?: number
          paye?: number
          payroll_period_id?: string
          regular_hours?: number
          retirement_401k?: number
          social_security?: number
          state_tax?: number
          status?: Database["public"]["Enums"]["payroll_record_status"]
          total_deductions?: number
          total_hours?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payroll_records_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payroll_records_payroll_period_id_fkey"
            columns: ["payroll_period_id"]
            isOneToOne: false
            referencedRelation: "payroll_periods"
            referencedColumns: ["id"]
          },
        ]
      }
      performance_reviews: {
        Row: {
          created_at: string
          cycle_name: string
          employee_id: string
          goals: string | null
          id: string
          improvements: string | null
          overall_comment: string | null
          rating: number | null
          reviewed_at: string | null
          reviewer_id: string
          status: Database["public"]["Enums"]["review_status"]
          strengths: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          cycle_name: string
          employee_id: string
          goals?: string | null
          id?: string
          improvements?: string | null
          overall_comment?: string | null
          rating?: number | null
          reviewed_at?: string | null
          reviewer_id: string
          status?: Database["public"]["Enums"]["review_status"]
          strengths?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          cycle_name?: string
          employee_id?: string
          goals?: string | null
          id?: string
          improvements?: string | null
          overall_comment?: string | null
          rating?: number | null
          reviewed_at?: string | null
          reviewer_id?: string
          status?: Database["public"]["Enums"]["review_status"]
          strengths?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "performance_reviews_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "performance_reviews_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      pto_balances: {
        Row: {
          created_at: string
          employee_id: string
          id: string
          total_allocated: number
          updated_at: string
          used_other: number
          used_personal: number
          used_sick: number
          used_vacation: number
          year: number
        }
        Insert: {
          created_at?: string
          employee_id: string
          id?: string
          total_allocated?: number
          updated_at?: string
          used_other?: number
          used_personal?: number
          used_sick?: number
          used_vacation?: number
          year: number
        }
        Update: {
          created_at?: string
          employee_id?: string
          id?: string
          total_allocated?: number
          updated_at?: string
          used_other?: number
          used_personal?: number
          used_sick?: number
          used_vacation?: number
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "pto_balances_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      pto_requests: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          created_at: string
          days_count: number
          employee_id: string
          end_date: string
          id: string
          reason: string | null
          start_date: string
          status: Database["public"]["Enums"]["pto_status"]
          type: Database["public"]["Enums"]["pto_type"]
          updated_at: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          days_count: number
          employee_id: string
          end_date: string
          id?: string
          reason?: string | null
          start_date: string
          status?: Database["public"]["Enums"]["pto_status"]
          type: Database["public"]["Enums"]["pto_type"]
          updated_at?: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          days_count?: number
          employee_id?: string
          end_date?: string
          id?: string
          reason?: string | null
          start_date?: string
          status?: Database["public"]["Enums"]["pto_status"]
          type?: Database["public"]["Enums"]["pto_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "pto_requests_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pto_requests_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      room_bookings: {
        Row: {
          attendees: string[] | null
          booked_by: string
          created_at: string
          description: string | null
          end_time: string
          id: string
          room_id: string
          start_time: string
          status: Database["public"]["Enums"]["booking_status"]
          title: string
          updated_at: string
        }
        Insert: {
          attendees?: string[] | null
          booked_by: string
          created_at?: string
          description?: string | null
          end_time: string
          id?: string
          room_id: string
          start_time: string
          status?: Database["public"]["Enums"]["booking_status"]
          title: string
          updated_at?: string
        }
        Update: {
          attendees?: string[] | null
          booked_by?: string
          created_at?: string
          description?: string | null
          end_time?: string
          id?: string
          room_id?: string
          start_time?: string
          status?: Database["public"]["Enums"]["booking_status"]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "room_bookings_booked_by_fkey"
            columns: ["booked_by"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "room_bookings_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "meeting_rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      schedule_conflicts: {
        Row: {
          assignment_id: string | null
          conflict_type: string
          created_at: string
          description: string
          employee_id: string
          id: string
          resolved: boolean
          resolved_by: string | null
          severity: string
        }
        Insert: {
          assignment_id?: string | null
          conflict_type: string
          created_at?: string
          description: string
          employee_id: string
          id?: string
          resolved?: boolean
          resolved_by?: string | null
          severity?: string
        }
        Update: {
          assignment_id?: string | null
          conflict_type?: string
          created_at?: string
          description?: string
          employee_id?: string
          id?: string
          resolved?: boolean
          resolved_by?: string | null
          severity?: string
        }
        Relationships: [
          {
            foreignKeyName: "schedule_conflicts_assignment_id_fkey"
            columns: ["assignment_id"]
            isOneToOne: false
            referencedRelation: "shift_assignments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "schedule_conflicts_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "schedule_conflicts_resolved_by_fkey"
            columns: ["resolved_by"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      shift_assignments: {
        Row: {
          assigned_by: string | null
          created_at: string
          date: string
          employee_id: string
          id: string
          notes: string | null
          shift_id: string
          status: Database["public"]["Enums"]["shift_assignment_status"]
          updated_at: string
        }
        Insert: {
          assigned_by?: string | null
          created_at?: string
          date: string
          employee_id: string
          id?: string
          notes?: string | null
          shift_id: string
          status?: Database["public"]["Enums"]["shift_assignment_status"]
          updated_at?: string
        }
        Update: {
          assigned_by?: string | null
          created_at?: string
          date?: string
          employee_id?: string
          id?: string
          notes?: string | null
          shift_id?: string
          status?: Database["public"]["Enums"]["shift_assignment_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "shift_assignments_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shift_assignments_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shift_assignments_shift_id_fkey"
            columns: ["shift_id"]
            isOneToOne: false
            referencedRelation: "shifts"
            referencedColumns: ["id"]
          },
        ]
      }
      shifts: {
        Row: {
          break_minutes: number
          color: string
          company_id: string
          created_at: string
          department_id: string | null
          end_time: string
          id: string
          is_active: boolean
          name: string
          start_time: string
          updated_at: string
        }
        Insert: {
          break_minutes?: number
          color?: string
          company_id: string
          created_at?: string
          department_id?: string | null
          end_time: string
          id?: string
          is_active?: boolean
          name: string
          start_time: string
          updated_at?: string
        }
        Update: {
          break_minutes?: number
          color?: string
          company_id?: string
          created_at?: string
          department_id?: string | null
          end_time?: string
          id?: string
          is_active?: boolean
          name?: string
          start_time?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "shifts_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shifts_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
        ]
      }
      statutory_rates: {
        Row: {
          ceiling_period: string | null
          ceiling_value: number | null
          created_at: string
          description: string | null
          effective_from: string
          expires_on: string | null
          id: string
          rate_key: string
          rate_value: number
        }
        Insert: {
          ceiling_period?: string | null
          ceiling_value?: number | null
          created_at?: string
          description?: string | null
          effective_from: string
          expires_on?: string | null
          id?: string
          rate_key: string
          rate_value: number
        }
        Update: {
          ceiling_period?: string | null
          ceiling_value?: number | null
          created_at?: string
          description?: string | null
          effective_from?: string
          expires_on?: string | null
          id?: string
          rate_key?: string
          rate_value?: number
        }
        Relationships: []
      }
      surveys: {
        Row: {
          company_id: string
          created_at: string
          created_by: string
          description: string | null
          due_date: string | null
          id: string
          is_anonymous: boolean
          questions: Json
          status: Database["public"]["Enums"]["survey_status"]
          title: string
          updated_at: string
        }
        Insert: {
          company_id: string
          created_at?: string
          created_by: string
          description?: string | null
          due_date?: string | null
          id?: string
          is_anonymous?: boolean
          questions?: Json
          status?: Database["public"]["Enums"]["survey_status"]
          title: string
          updated_at?: string
        }
        Update: {
          company_id?: string
          created_at?: string
          created_by?: string
          description?: string | null
          due_date?: string | null
          id?: string
          is_anonymous?: boolean
          questions?: Json
          status?: Database["public"]["Enums"]["survey_status"]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "surveys_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "surveys_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      swap_requests: {
        Row: {
          approved_by: string | null
          assignment_id: string
          created_at: string
          id: string
          reason: string | null
          requester_id: string
          status: Database["public"]["Enums"]["swap_request_status"]
          target_assignment_id: string | null
          target_id: string
          updated_at: string
        }
        Insert: {
          approved_by?: string | null
          assignment_id: string
          created_at?: string
          id?: string
          reason?: string | null
          requester_id: string
          status?: Database["public"]["Enums"]["swap_request_status"]
          target_assignment_id?: string | null
          target_id: string
          updated_at?: string
        }
        Update: {
          approved_by?: string | null
          assignment_id?: string
          created_at?: string
          id?: string
          reason?: string | null
          requester_id?: string
          status?: Database["public"]["Enums"]["swap_request_status"]
          target_assignment_id?: string | null
          target_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "swap_requests_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "swap_requests_assignment_id_fkey"
            columns: ["assignment_id"]
            isOneToOne: false
            referencedRelation: "shift_assignments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "swap_requests_requester_id_fkey"
            columns: ["requester_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "swap_requests_target_assignment_id_fkey"
            columns: ["target_assignment_id"]
            isOneToOne: false
            referencedRelation: "shift_assignments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "swap_requests_target_id_fkey"
            columns: ["target_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      time_entries: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          break_minutes: number
          created_at: string
          date: string
          description: string | null
          employee_id: string
          end_time: string | null
          gps_lat: number | null
          gps_lng: number | null
          id: string
          project: string | null
          start_time: string
          status: Database["public"]["Enums"]["time_entry_status"]
          total_hours: number | null
          updated_at: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          break_minutes?: number
          created_at?: string
          date: string
          description?: string | null
          employee_id: string
          end_time?: string | null
          gps_lat?: number | null
          gps_lng?: number | null
          id?: string
          project?: string | null
          start_time: string
          status?: Database["public"]["Enums"]["time_entry_status"]
          total_hours?: number | null
          updated_at?: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          break_minutes?: number
          created_at?: string
          date?: string
          description?: string | null
          employee_id?: string
          end_time?: string | null
          gps_lat?: number | null
          gps_lng?: number | null
          id?: string
          project?: string | null
          start_time?: string
          status?: Database["public"]["Enums"]["time_entry_status"]
          total_hours?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "time_entries_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "time_entries_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      wellness_entries: {
        Row: {
          activity_type: string | null
          created_at: string
          date: string
          employee_id: string
          id: string
          mood_score: number | null
          note: string | null
          type: string
          value: number | null
        }
        Insert: {
          activity_type?: string | null
          created_at?: string
          date?: string
          employee_id: string
          id?: string
          mood_score?: number | null
          note?: string | null
          type: string
          value?: number | null
        }
        Update: {
          activity_type?: string | null
          created_at?: string
          date?: string
          employee_id?: string
          id?: string
          mood_score?: number | null
          note?: string | null
          type?: string
          value?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "wellness_entries_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_current_employee_department: { Args: never; Returns: string }
      get_current_employee_id: { Args: never; Returns: string }
      get_current_employee_role: { Args: never; Returns: string }
      is_admin_or_hr: { Args: never; Returns: boolean }
      is_manager_or_above: { Args: never; Returns: boolean }
    }
    Enums: {
      announcement_category:
        | "general"
        | "urgent"
        | "policy"
        | "event"
        | "celebration"
      announcement_priority: "low" | "normal" | "high" | "urgent"
      attendance_status: "active" | "completed" | "flagged" | "approved"
      booking_status: "confirmed" | "pending" | "cancelled"
      contract_type:
        | "permanent"
        | "contract"
        | "part_time"
        | "casual"
        | "temporary"
        | "intern"
      course_status: "draft" | "published" | "archived"
      document_status: "active" | "archived" | "expired"
      employee_status:
        | "active"
        | "inactive"
        | "on_leave"
        | "terminated"
        | "probation"
      enrollment_status: "enrolled" | "in_progress" | "completed" | "dropped"
      expense_status:
        | "draft"
        | "submitted"
        | "approved"
        | "rejected"
        | "processing"
        | "paid"
      geofence_type: "office" | "remote_site" | "field" | "campus"
      goal_status: "not_started" | "in_progress" | "completed" | "cancelled"
      job_listing_status: "draft" | "open" | "closed" | "filled" | "archived"
      job_listing_type: "full_time" | "part_time" | "contract" | "remote"
      kudos_category:
        | "teamwork"
        | "innovation"
        | "leadership"
        | "service"
        | "dedication"
        | "growth"
      message_type: "text" | "announcement" | "shift_update" | "system"
      notification_type: "info" | "warning" | "alert" | "success"
      pay_type: "hourly" | "salary"
      paye_code: "A" | "B" | "C" | "D" | "E"
      payroll_period_status: "draft" | "processing" | "completed" | "paid"
      payroll_record_status: "pending" | "approved" | "paid" | "flagged"
      pto_status: "pending" | "approved" | "rejected" | "cancelled"
      pto_type:
        | "sick"
        | "vacation"
        | "personal"
        | "other"
        | "bereavement"
        | "jury_duty"
        | "fmla"
      review_status: "pending" | "in_progress" | "completed"
      role_tier:
        | "ancillary"
        | "maintenance"
        | "admin"
        | "ict_tech"
        | "ict_sysadmin"
        | "ict_mgmt"
        | "faculty"
        | "executive"
        | "hr"
      shift_assignment_status:
        | "scheduled"
        | "confirmed"
        | "completed"
        | "no_show"
        | "swapped"
      survey_status: "draft" | "active" | "closed"
      swap_request_status: "pending" | "approved" | "rejected" | "cancelled"
      time_entry_status: "draft" | "submitted" | "approved" | "rejected"
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
      announcement_category: [
        "general",
        "urgent",
        "policy",
        "event",
        "celebration",
      ],
      announcement_priority: ["low", "normal", "high", "urgent"],
      attendance_status: ["active", "completed", "flagged", "approved"],
      booking_status: ["confirmed", "pending", "cancelled"],
      contract_type: [
        "permanent",
        "contract",
        "part_time",
        "casual",
        "temporary",
        "intern",
      ],
      course_status: ["draft", "published", "archived"],
      document_status: ["active", "archived", "expired"],
      employee_status: [
        "active",
        "inactive",
        "on_leave",
        "terminated",
        "probation",
      ],
      enrollment_status: ["enrolled", "in_progress", "completed", "dropped"],
      expense_status: [
        "draft",
        "submitted",
        "approved",
        "rejected",
        "processing",
        "paid",
      ],
      geofence_type: ["office", "remote_site", "field", "campus"],
      goal_status: ["not_started", "in_progress", "completed", "cancelled"],
      job_listing_status: ["draft", "open", "closed", "filled", "archived"],
      job_listing_type: ["full_time", "part_time", "contract", "remote"],
      kudos_category: [
        "teamwork",
        "innovation",
        "leadership",
        "service",
        "dedication",
        "growth",
      ],
      message_type: ["text", "announcement", "shift_update", "system"],
      notification_type: ["info", "warning", "alert", "success"],
      pay_type: ["hourly", "salary"],
      paye_code: ["A", "B", "C", "D", "E"],
      payroll_period_status: ["draft", "processing", "completed", "paid"],
      payroll_record_status: ["pending", "approved", "paid", "flagged"],
      pto_status: ["pending", "approved", "rejected", "cancelled"],
      pto_type: [
        "sick",
        "vacation",
        "personal",
        "other",
        "bereavement",
        "jury_duty",
        "fmla",
      ],
      review_status: ["pending", "in_progress", "completed"],
      role_tier: [
        "ancillary",
        "maintenance",
        "admin",
        "ict_tech",
        "ict_sysadmin",
        "ict_mgmt",
        "faculty",
        "executive",
        "hr",
      ],
      shift_assignment_status: [
        "scheduled",
        "confirmed",
        "completed",
        "no_show",
        "swapped",
      ],
      survey_status: ["draft", "active", "closed"],
      swap_request_status: ["pending", "approved", "rejected", "cancelled"],
      time_entry_status: ["draft", "submitted", "approved", "rejected"],
    },
  },
} as const
