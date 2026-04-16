-- ═══════════════════════════════════════════════════════════════════════
-- MSBM-HR Suite — Audit Triggers
-- Migration 003: Immutable audit logging with before/after JSON diff
-- ═══════════════════════════════════════════════════════════════════════

-- ─── Generic audit trigger function ─────────────────────────────────
-- Captures INSERT/UPDATE/DELETE with full before/after snapshots.
-- Automatically extracts user_id from session variables set by the API.

CREATE OR REPLACE FUNCTION audit_trigger_func()
RETURNS TRIGGER AS $$
DECLARE
  audit_user_id UUID;
  audit_ip TEXT;
  audit_action TEXT;
  before_json JSONB;
  after_json JSONB;
BEGIN
  -- Try to get user context from session variables (set by API middleware)
  audit_user_id := COALESCE(
    current_setting('app.current_user_id', true)::UUID,
    NULL
  );
  audit_ip := current_setting('app.current_ip', true);

  IF TG_OP = 'DELETE' THEN
    audit_action := 'DELETE';
    before_json := to_jsonb(OLD);
    after_json := NULL;

    INSERT INTO audit_logs (user_id, action, module, table_name, record_id, before_data, after_data, ip_address)
    VALUES (audit_user_id, audit_action, TG_TABLE_NAME, TG_TABLE_NAME, OLD.id, before_json, after_json, audit_ip);

    RETURN OLD;

  ELSIF TG_OP = 'UPDATE' THEN
    audit_action := 'UPDATE';
    before_json := to_jsonb(OLD);
    after_json := to_jsonb(NEW);

    -- Only log if something actually changed (skip no-op updates)
    IF before_json IS DISTINCT FROM after_json THEN
      INSERT INTO audit_logs (user_id, action, module, table_name, record_id, before_data, after_data, ip_address)
      VALUES (audit_user_id, audit_action, TG_TABLE_NAME, TG_TABLE_NAME, NEW.id, before_json, after_json, audit_ip);
    END IF;

    RETURN NEW;

  ELSIF TG_OP = 'INSERT' THEN
    audit_action := 'INSERT';
    before_json := NULL;
    after_json := to_jsonb(NEW);

    INSERT INTO audit_logs (user_id, action, module, table_name, record_id, before_data, after_data, ip_address)
    VALUES (audit_user_id, audit_action, TG_TABLE_NAME, TG_TABLE_NAME, NEW.id, before_json, after_json, audit_ip);

    RETURN NEW;
  END IF;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ═══════════════════════════════════════════════════════════════════════
-- Apply audit triggers to sensitive tables
-- ═══════════════════════════════════════════════════════════════════════

-- Employees (all changes)
CREATE TRIGGER audit_employees
  AFTER INSERT OR UPDATE OR DELETE ON employees
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

-- Attendance (all changes)
CREATE TRIGGER audit_attendance
  AFTER INSERT OR UPDATE OR DELETE ON attendance
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

-- Payroll Records (all changes — financial compliance)
CREATE TRIGGER audit_payroll_records
  AFTER INSERT OR UPDATE OR DELETE ON payroll_records
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

-- Payroll Periods
CREATE TRIGGER audit_payroll_periods
  AFTER INSERT OR UPDATE OR DELETE ON payroll_periods
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

-- PTO Requests (all changes)
CREATE TRIGGER audit_pto_requests
  AFTER INSERT OR UPDATE OR DELETE ON pto_requests
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

-- Shift Assignments (scheduling changes)
CREATE TRIGGER audit_shift_assignments
  AFTER INSERT OR UPDATE OR DELETE ON shift_assignments
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

-- Time Entries (labor tracking)
CREATE TRIGGER audit_time_entries
  AFTER INSERT OR UPDATE OR DELETE ON time_entries
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

-- Expense Claims (financial)
CREATE TRIGGER audit_expense_claims
  AFTER INSERT OR UPDATE OR DELETE ON expense_claims
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

-- Swap Requests
CREATE TRIGGER audit_swap_requests
  AFTER INSERT OR UPDATE OR DELETE ON swap_requests
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

-- Performance Reviews
CREATE TRIGGER audit_performance_reviews
  AFTER INSERT OR UPDATE OR DELETE ON performance_reviews
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

-- Statutory Rates (compliance — rate changes must be tracked)
CREATE TRIGGER audit_statutory_rates
  AFTER INSERT OR UPDATE OR DELETE ON statutory_rates
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

-- Department Roles (permission changes)
CREATE TRIGGER audit_department_roles
  AFTER INSERT OR UPDATE OR DELETE ON department_roles
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

-- Company Settings
CREATE TRIGGER audit_company_settings
  AFTER INSERT OR UPDATE OR DELETE ON company_settings
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();
