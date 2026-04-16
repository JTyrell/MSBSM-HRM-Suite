import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET /api/time-entries
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get("employeeId");
    const status = searchParams.get("status");
    const from = searchParams.get("from");
    const to = searchParams.get("to");
    const supabase = await createClient();

    let query = supabase
      .from("time_entries")
      .select("*, employee:employees(id, first_name, last_name, employee_id)")
      .order("date", { ascending: false });

    if (employeeId) query = query.eq("employee_id", employeeId);
    if (status) query = query.eq("status", status);
    if (from) query = query.gte("date", from);
    if (to) query = query.lte("date", to);

    const { data, error } = await query;
    if (error) throw error;
    return NextResponse.json({ entries: data || [] });
  } catch (error) {
    console.error("Error fetching time entries:", error);
    return NextResponse.json({ error: "Failed to fetch time entries" }, { status: 500 });
  }
}

// POST /api/time-entries
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const supabase = await createClient();

    // Calculate total hours if start_time and end_time provided
    let totalHours = body.total_hours;
    if (!totalHours && body.start_time && body.end_time) {
      const start = new Date(body.start_time);
      const end = new Date(body.end_time);
      totalHours = Math.round(((end.getTime() - start.getTime()) / (1000 * 60 * 60) - (body.break_minutes || 0) / 60) * 100) / 100;
    }

    const { data, error } = await supabase
      .from("time_entries")
      .insert({
        employee_id: body.employee_id,
        date: body.date,
        start_time: body.start_time,
        end_time: body.end_time || null,
        break_minutes: body.break_minutes || 0,
        total_hours: totalHours || null,
        description: body.description || null,
        project: body.project || null,
        status: body.status || "draft",
        gps_lat: body.gps_lat || null,
        gps_lng: body.gps_lng || null,
      })
      .select("*, employee:employees(id, first_name, last_name)")
      .single();

    if (error) throw error;
    return NextResponse.json({ entry: data }, { status: 201 });
  } catch (error) {
    console.error("Error creating time entry:", error);
    return NextResponse.json({ error: "Failed to create time entry" }, { status: 500 });
  }
}

// PUT /api/time-entries
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...data } = body;
    if (!id) return NextResponse.json({ error: "ID is required" }, { status: 400 });

    const supabase = await createClient();
    const updateData: Record<string, unknown> = {};

    if (data.status !== undefined) updateData.status = data.status;
    if (data.end_time !== undefined) updateData.end_time = data.end_time;
    if (data.break_minutes !== undefined) updateData.break_minutes = data.break_minutes;
    if (data.total_hours !== undefined) updateData.total_hours = data.total_hours;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.project !== undefined) updateData.project = data.project;
    if (data.approved_by !== undefined) updateData.approved_by = data.approved_by;
    if (data.status === "approved") updateData.approved_at = new Date().toISOString();

    const { data: entry, error } = await supabase
      .from("time_entries")
      .update(updateData)
      .eq("id", id)
      .select("*, employee:employees(id, first_name, last_name)")
      .single();

    if (error) throw error;
    return NextResponse.json({ entry });
  } catch (error) {
    console.error("Error updating time entry:", error);
    return NextResponse.json({ error: "Failed to update time entry" }, { status: 500 });
  }
}

// DELETE /api/time-entries?id=xxx
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID is required" }, { status: 400 });

    const supabase = await createClient();
    const { error } = await supabase.from("time_entries").delete().eq("id", id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting time entry:", error);
    return NextResponse.json({ error: "Failed to delete time entry" }, { status: 500 });
  }
}
