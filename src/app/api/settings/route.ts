import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET /api/settings
export async function GET() {
  try {
    const supabase = await createClient();

    const { data: settings, error } = await supabase
      .from("company_settings")
      .select("*")
      .eq("company_id", "00000000-0000-0000-0000-000000000001")
      .single();

    if (error && error.code === "PGRST116") {
      // No settings found - create defaults
      const { data: newSettings, error: createError } = await supabase
        .from("company_settings")
        .insert({
          company_id: "00000000-0000-0000-0000-000000000001",
          company_name: "MSBM Group",
          company_address: "Mona School of Business and Management, UWI, Kingston 7, Jamaica",
        })
        .select()
        .single();

      if (createError) throw createError;
      return NextResponse.json({ settings: newSettings });
    }

    if (error) throw error;
    return NextResponse.json({ settings });
  } catch (error) {
    console.error("Error fetching settings:", error);
    return NextResponse.json({ error: "Failed to fetch settings", details: String(error) }, { status: 500 });
  }
}

// PUT /api/settings
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const supabase = await createClient();

    // Convert camelCase to snake_case
    const updateData: Record<string, unknown> = {};
    const fieldMap: Record<string, string> = {
      companyName: "company_name", companyAddress: "company_address",
      companyPhone: "company_phone", companyEmail: "company_email",
      companyWebsite: "company_website", attendanceGracePeriod: "attendance_grace_period",
      autoClockOutHours: "auto_clock_out_hours", requireGeofence: "require_geofence",
      overtimeThreshold: "overtime_threshold", payrollFrequency: "payroll_frequency",
      payPeriodStartDay: "pay_period_start_day", taxFilingDefault: "tax_filing_default",
      overtimeMultiplier: "overtime_multiplier", emailNotifications: "email_notifications",
      pushNotifications: "push_notifications", payrollAlerts: "payroll_alerts",
      ptoAlerts: "pto_alerts", complianceAlerts: "compliance_alerts",
      twoFactorAuth: "two_factor_auth", sessionTimeout: "session_timeout",
      passwordMinLength: "password_min_length", jaComplianceEnabled: "ja_compliance_enabled",
      defaultPayeCode: "default_paye_code",
    };

    for (const [key, value] of Object.entries(body)) {
      updateData[fieldMap[key] || key] = value;
    }

    const { data: settings, error } = await supabase
      .from("company_settings")
      .update(updateData)
      .eq("company_id", "00000000-0000-0000-0000-000000000001")
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ settings });
  } catch (error) {
    console.error("Error updating settings:", error);
    return NextResponse.json({ error: "Failed to update settings", details: String(error) }, { status: 500 });
  }
}
