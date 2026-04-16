import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET /api/shifts
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const departmentId = searchParams.get("departmentId");
    const supabase = await createClient();

    let query = supabase
      .from("shifts")
      .select("*, department:departments(id, name, code)")
      .order("start_time");

    if (departmentId && departmentId !== "all") query = query.eq("department_id", departmentId);

    const { data: shifts, error } = await query;
    if (error) throw error;
    return NextResponse.json({ shifts: shifts || [] });
  } catch (error) {
    console.error("Error fetching shifts:", error);
    return NextResponse.json({ error: "Failed to fetch shifts" }, { status: 500 });
  }
}

// POST /api/shifts
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const supabase = await createClient();

    const { data: shift, error } = await supabase
      .from("shifts")
      .insert({
        name: body.name,
        start_time: body.startTime || body.start_time,
        end_time: body.endTime || body.end_time,
        break_minutes: body.breakMinutes || body.break_minutes || 30,
        color: body.color || "#10b981",
        is_active: body.isActive !== undefined ? body.isActive : (body.is_active !== undefined ? body.is_active : true),
        department_id: body.departmentId || body.department_id || null,
        company_id: body.companyId || body.company_id || "00000000-0000-0000-0000-000000000001",
      })
      .select("*, department:departments(id, name, code)")
      .single();

    if (error) throw error;
    return NextResponse.json({ shift }, { status: 201 });
  } catch (error) {
    console.error("Error creating shift:", error);
    return NextResponse.json({ error: "Failed to create shift" }, { status: 500 });
  }
}

// PUT /api/shifts
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, ...data } = body;
    if (!id) return NextResponse.json({ error: "Shift id is required" }, { status: 400 });

    const supabase = await createClient();
    const updateData: Record<string, unknown> = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.startTime || data.start_time) updateData.start_time = data.startTime || data.start_time;
    if (data.endTime || data.end_time) updateData.end_time = data.endTime || data.end_time;
    if (data.breakMinutes !== undefined || data.break_minutes !== undefined) updateData.break_minutes = data.breakMinutes ?? data.break_minutes;
    if (data.color !== undefined) updateData.color = data.color;
    if (data.isActive !== undefined || data.is_active !== undefined) updateData.is_active = data.isActive ?? data.is_active;
    if (data.departmentId !== undefined || data.department_id !== undefined) updateData.department_id = data.departmentId ?? data.department_id;

    const { data: shift, error } = await supabase
      .from("shifts")
      .update(updateData)
      .eq("id", id)
      .select("*, department:departments(id, name, code)")
      .single();

    if (error) throw error;
    return NextResponse.json({ shift });
  } catch (error) {
    console.error("Error updating shift:", error);
    return NextResponse.json({ error: "Failed to update shift" }, { status: 500 });
  }
}

// DELETE /api/shifts
export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const { id } = body;
    if (!id) return NextResponse.json({ error: "Shift id is required" }, { status: 400 });

    const supabase = await createClient();
    const { error } = await supabase.from("shifts").delete().eq("id", id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting shift:", error);
    return NextResponse.json({ error: "Failed to delete shift" }, { status: 500 });
  }
}
