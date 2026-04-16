import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET /api/employees - List all employees
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const departmentId = searchParams.get("departmentId");
    const status = searchParams.get("status");
    const role = searchParams.get("role");
    const search = searchParams.get("search");

    const supabase = await createClient();

    let query = supabase
      .from("employees")
      .select("*, department:departments(id, name, code), work_location:geofences(id, name)")
      .order("created_at", { ascending: false });

    if (departmentId) query = query.eq("department_id", departmentId);
    if (status) query = query.eq("status", status);
    if (role) query = query.eq("role", role);
    if (search) {
      query = query.or(
        `first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%,employee_id.ilike.%${search}%`
      );
    }

    const { data: employees, error } = await query;

    if (error) throw error;
    return NextResponse.json({ employees: employees || [] });
  } catch (error) {
    console.error("Error fetching employees:", error);
    return NextResponse.json({ error: "Failed to fetch employees" }, { status: 500 });
  }
}

// POST /api/employees - Create a new employee
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const supabase = await createClient();

    // Check for duplicate email
    const { data: existing } = await supabase
      .from("employees")
      .select("id")
      .eq("email", body.email)
      .single();

    if (existing) {
      return NextResponse.json({ error: "Employee with this email already exists" }, { status: 409 });
    }

    // Generate employee ID
    const { count } = await supabase
      .from("employees")
      .select("id", { count: "exact", head: true });

    const employeeId = `EMP-${String((count || 0) + 1).padStart(4, "0")}`;

    const { data: employee, error } = await supabase
      .from("employees")
      .insert({
        employee_id: employeeId,
        first_name: body.firstName || body.first_name,
        last_name: body.lastName || body.last_name,
        email: body.email,
        phone: body.phone || null,
        role: body.role || "employee",
        status: "active",
        hire_date: body.hireDate || body.hire_date || new Date().toISOString().split("T")[0],
        department_id: body.departmentId || body.department_id,
        company_id: body.companyId || body.company_id || "00000000-0000-0000-0000-000000000001",
        pay_type: body.payType || body.pay_type || "hourly",
        pay_rate: body.payRate || body.pay_rate || 0,
        overtime_rate: body.overtimeRate || body.overtime_rate || 1.5,
        work_location_id: body.workLocationId || body.work_location_id || null,
        address: body.address || null,
        emergency_contact: body.emergencyContact || body.emergency_contact || null,
        emergency_phone: body.emergencyPhone || body.emergency_phone || null,
        tax_filing_status: body.taxFilingStatus || body.tax_filing_status || "single",
        tax_allowances: body.taxAllowances || body.tax_allowances || 1,
        // JA compliance fields
        trn: body.trn || null,
        nis_number: body.nis_number || null,
        nht_number: body.nht_number || null,
        paye_tax_code: body.paye_tax_code || "A",
        contract_type: body.contract_type || "permanent",
        role_tier: body.role_tier || "admin",
        grade_step: body.grade_step || 1,
        reporting_to: body.reporting_to || null,
      })
      .select("*, department:departments(id, name, code), work_location:geofences(id, name)")
      .single();

    if (error) throw error;
    return NextResponse.json({ employee }, { status: 201 });
  } catch (error) {
    console.error("Error creating employee:", error);
    return NextResponse.json({ error: "Failed to create employee" }, { status: 500 });
  }
}

// PUT /api/employees - Update an employee
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...data } = body;

    if (!id) {
      return NextResponse.json({ error: "Employee ID is required" }, { status: 400 });
    }

    const supabase = await createClient();

    // Convert camelCase to snake_case for common fields
    const updateData: Record<string, unknown> = {};
    const fieldMap: Record<string, string> = {
      firstName: "first_name", lastName: "last_name", departmentId: "department_id",
      payType: "pay_type", payRate: "pay_rate", overtimeRate: "overtime_rate",
      hireDate: "hire_date", workLocationId: "work_location_id",
      emergencyContact: "emergency_contact", emergencyPhone: "emergency_phone",
      bankAccount: "bank_account", taxFilingStatus: "tax_filing_status",
      taxAllowances: "tax_allowances", employeeId: "employee_id", companyId: "company_id",
    };

    for (const [key, value] of Object.entries(data)) {
      const snakeKey = fieldMap[key] || key;
      updateData[snakeKey] = value;
    }

    const { data: employee, error } = await supabase
      .from("employees")
      .update(updateData)
      .eq("id", id)
      .select("*, department:departments(id, name, code), work_location:geofences(id, name)")
      .single();

    if (error) throw error;
    return NextResponse.json({ employee });
  } catch (error) {
    console.error("Error updating employee:", error);
    return NextResponse.json({ error: "Failed to update employee" }, { status: 500 });
  }
}

// DELETE /api/employees?id=xxx - Delete an employee
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Employee ID is required" }, { status: 400 });
    }

    const supabase = await createClient();
    const { error } = await supabase.from("employees").delete().eq("id", id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting employee:", error);
    return NextResponse.json({ error: "Failed to delete employee" }, { status: 500 });
  }
}
