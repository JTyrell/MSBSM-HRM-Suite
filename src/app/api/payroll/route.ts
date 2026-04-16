import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { calculatePayroll } from "@/lib/payroll";

// GET /api/payroll
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const periodId = searchParams.get("periodId");
    const status = searchParams.get("status");
    const supabase = await createClient();

    if (periodId) {
      const { data: period, error } = await supabase
        .from("payroll_periods")
        .select(`
          *,
          records:payroll_records(
            *,
            employee:employees(id, first_name, last_name, employee_id, department:departments(name))
          )
        `)
        .eq("id", periodId)
        .single();

      if (error) throw error;
      return NextResponse.json({ period });
    }

    let query = supabase
      .from("payroll_periods")
      .select(`*, records:payroll_records(gross_pay, net_pay, status)`)
      .order("start_date", { ascending: false });

    if (status) query = query.eq("status", status);

    const { data: periods, error } = await query;

    if (error) throw error;

    // Transform to include counts
    const transformed = (periods || []).map((p: any) => ({
      ...p,
      _count: { records: p.records?.length || 0 },
    }));

    return NextResponse.json({ periods: transformed });
  } catch (error) {
    console.error("Error fetching payroll:", error);
    return NextResponse.json({ error: "Failed to fetch payroll" }, { status: 500 });
  }
}

// POST /api/payroll - Process a payroll run
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, startDate, endDate } = body;

    if (!startDate || !endDate) {
      return NextResponse.json({ error: "Start and end dates are required" }, { status: 400 });
    }

    const supabase = await createClient();

    // Create payroll period
    const { data: period, error: periodError } = await supabase
      .from("payroll_periods")
      .insert({
        name: name || `Pay Period: ${new Date(startDate).toLocaleDateString()} - ${new Date(endDate).toLocaleDateString()}`,
        start_date: startDate,
        end_date: endDate,
        status: "processing",
        company_id: "00000000-0000-0000-0000-000000000001",
      })
      .select()
      .single();

    if (periodError) throw periodError;

    // Get all active employees
    const { data: employees } = await supabase
      .from("employees")
      .select("*")
      .eq("status", "active");

    // Get attendance records for this period
    const { data: attendanceRecords } = await supabase
      .from("attendance")
      .select("*")
      .gte("clock_in", startDate)
      .lte("clock_in", endDate)
      .in("status", ["completed", "active"])
      .in("employee_id", (employees || []).map((e: any) => e.id));

    // Group attendance by employee
    const attendanceByEmployee = new Map<string, any[]>();
    for (const record of attendanceRecords || []) {
      const existing = attendanceByEmployee.get(record.employee_id) || [];
      existing.push(record);
      attendanceByEmployee.set(record.employee_id, existing);
    }

    // Calculate payroll for each employee
    const records: any[] = [];
    for (const employee of employees || []) {
      const empAttendance = attendanceByEmployee.get(employee.id) || [];

      let regularHours = 0;
      let overtimeHours = 0;

      for (const att of empAttendance) {
        const hours = att.total_hours || 0;
        const ot = att.overtime_hours || 0;
        regularHours += hours - ot;
        overtimeHours += ot;
      }

      const result = calculatePayroll({
        regularHours,
        overtimeHours,
        payRate: employee.pay_rate,
        overtimeRate: employee.overtime_rate,
        taxFilingStatus: employee.tax_filing_status || "single",
        taxAllowances: employee.tax_allowances || 1,
        healthInsurance: 150,
        retirement401k: 0,
        otherDeductions: 0,
      });

      // Check for anomalies
      let isFlagged = false;
      const flagNotes: string[] = [];

      if (result.totalHours > 80) {
        isFlagged = true;
        flagNotes.push("Excessive hours (>80) - requires review");
      }

      const missedClockOuts = empAttendance.filter((a: any) => a.status === "active").length;
      if (missedClockOuts > 0) {
        isFlagged = true;
        flagNotes.push(`${missedClockOuts} unclosed clock-in session(s)`);
      }

      const { data: record } = await supabase
        .from("payroll_records")
        .insert({
          payroll_period_id: period.id,
          employee_id: employee.id,
          regular_hours: result.regularHours,
          overtime_hours: result.overtimeHours,
          total_hours: result.totalHours,
          gross_pay: result.grossPay,
          federal_tax: result.federalTax,
          state_tax: result.stateTax,
          social_security: result.socialSecurity,
          medicare: result.medicare,
          health_insurance: result.healthInsurance,
          retirement_401k: result.retirement401k,
          other_deductions: result.otherDeductions,
          total_deductions: result.totalDeductions,
          net_pay: result.netPay,
          status: isFlagged ? "flagged" : "pending",
          notes: flagNotes.length > 0 ? flagNotes.join("; ") : null,
        })
        .select()
        .single();

      if (record) records.push(record);
    }

    // Update period status
    await supabase
      .from("payroll_periods")
      .update({ status: "completed" })
      .eq("id", period.id);

    return NextResponse.json({
      period,
      records,
      totalGross: records.reduce((sum, r) => sum + (r.gross_pay || 0), 0),
      totalNet: records.reduce((sum, r) => sum + (r.net_pay || 0), 0),
      flaggedCount: records.filter((r) => r.status === "flagged").length,
    });
  } catch (error) {
    console.error("Error processing payroll:", error);
    return NextResponse.json({ error: "Failed to process payroll" }, { status: 500 });
  }
}

// PUT /api/payroll - Approve/update a payroll record
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { recordId, status } = body;

    if (!recordId || !status) {
      return NextResponse.json({ error: "recordId and status required" }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: record, error } = await supabase
      .from("payroll_records")
      .update({ status })
      .eq("id", recordId)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ record });
  } catch (error) {
    console.error("Error updating payroll record:", error);
    return NextResponse.json({ error: "Failed to update payroll" }, { status: 500 });
  }
}
