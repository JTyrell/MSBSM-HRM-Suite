import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET /api/department-roles
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const departmentId = searchParams.get("departmentId");
    const supabase = await createClient();

    let query = supabase
      .from("department_roles")
      .select("*, department:departments(*)")
      .order("sort_order");

    if (departmentId) query = query.eq("department_id", departmentId);

    const { data: roles, error } = await query;
    if (error) throw error;
    return NextResponse.json({ roles: roles || [] });
  } catch (error) {
    console.error("Error fetching department roles:", error);
    return NextResponse.json({ error: "Failed to fetch department roles" }, { status: 500 });
  }
}

// POST /api/department-roles
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body.title || !body.code) return NextResponse.json({ error: "title and code are required" }, { status: 400 });

    const supabase = await createClient();

    // Check duplicate code
    const { data: existing } = await supabase
      .from("department_roles").select("id").eq("code", body.code).single();
    if (existing) return NextResponse.json({ error: "A role with this code already exists" }, { status: 409 });

    const { data: role, error } = await supabase
      .from("department_roles")
      .insert({
        title: body.title, code: body.code,
        description: body.description || null,
        grade_level: body.gradeLevel ?? body.grade_level ?? 1,
        reports_to: body.reportsTo || body.reports_to || null,
        is_management: body.isManagement ?? body.is_management ?? false,
        can_approve_payroll: body.canApprovePayroll ?? body.can_approve_payroll ?? false,
        can_assign_roles: body.canAssignRoles ?? body.can_assign_roles ?? false,
        can_view_all_employees: body.canViewAllEmployees ?? body.can_view_all_employees ?? false,
        can_edit_employees: body.canEditEmployees ?? body.can_edit_employees ?? false,
        can_manage_it: body.canManageIT ?? body.can_manage_it ?? false,
        can_view_payroll: body.canViewPayroll ?? body.can_view_payroll ?? false,
        can_edit_payroll: body.canEditPayroll ?? body.can_edit_payroll ?? false,
        can_manage_schedule: body.canManageSchedule ?? body.can_manage_schedule ?? false,
        department_id: body.departmentId || body.department_id || null,
        sort_order: body.sortOrder ?? body.sort_order ?? 0,
      })
      .select("*, department:departments(*)")
      .single();

    if (error) throw error;
    return NextResponse.json({ role }, { status: 201 });
  } catch (error) {
    console.error("Error creating department role:", error);
    return NextResponse.json({ error: "Failed to create department role" }, { status: 500 });
  }
}

// PUT /api/department-roles
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...data } = body;
    if (!id) return NextResponse.json({ error: "Role ID is required" }, { status: 400 });

    const supabase = await createClient();
    const updateData: Record<string, unknown> = {};
    const fieldMap: Record<string, string> = {
      gradeLevel: "grade_level", reportsTo: "reports_to", isManagement: "is_management",
      canApprovePayroll: "can_approve_payroll", canAssignRoles: "can_assign_roles",
      canViewAllEmployees: "can_view_all_employees", canEditEmployees: "can_edit_employees",
      canManageIT: "can_manage_it", canViewPayroll: "can_view_payroll",
      canEditPayroll: "can_edit_payroll", canManageSchedule: "can_manage_schedule",
      departmentId: "department_id", sortOrder: "sort_order",
    };

    for (const [key, value] of Object.entries(data)) {
      updateData[fieldMap[key] || key] = value;
    }

    const { data: role, error } = await supabase
      .from("department_roles")
      .update(updateData)
      .eq("id", id)
      .select("*, department:departments(*)")
      .single();

    if (error) throw error;
    return NextResponse.json({ role });
  } catch (error) {
    console.error("Error updating department role:", error);
    return NextResponse.json({ error: "Failed to update department role" }, { status: 500 });
  }
}

// DELETE /api/department-roles?id=xxx
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Role ID is required" }, { status: 400 });

    const supabase = await createClient();
    const { error } = await supabase.from("department_roles").delete().eq("id", id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting department role:", error);
    return NextResponse.json({ error: "Failed to delete department role" }, { status: 500 });
  }
}
