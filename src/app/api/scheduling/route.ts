import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET /api/scheduling — Get shift assignments, availabilities, conflicts
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "assignments";
    const employeeId = searchParams.get("employeeId");
    const from = searchParams.get("from");
    const to = searchParams.get("to");
    const supabase = await createClient();

    if (type === "assignments") {
      let query = supabase
        .from("shift_assignments")
        .select("*, employee:employees(id, first_name, last_name, employee_id), shift:shifts(id, name, start_time, end_time, color)")
        .order("date");

      if (employeeId) query = query.eq("employee_id", employeeId);
      if (from) query = query.gte("date", from);
      if (to) query = query.lte("date", to);

      const { data, error } = await query;
      if (error) throw error;
      return NextResponse.json({ assignments: data || [] });
    }

    if (type === "availabilities") {
      let query = supabase
        .from("availabilities")
        .select("*, employee:employees(id, first_name, last_name)")
        .order("day_of_week");

      if (employeeId) query = query.eq("employee_id", employeeId);

      const { data, error } = await query;
      if (error) throw error;
      return NextResponse.json({ availabilities: data || [] });
    }

    if (type === "conflicts") {
      const { data, error } = await supabase
        .from("schedule_conflicts")
        .select("*, employee:employees(id, first_name, last_name)")
        .eq("resolved", false)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return NextResponse.json({ conflicts: data || [] });
    }

    if (type === "swaps") {
      const { data, error } = await supabase
        .from("swap_requests")
        .select(`
          *,
          requester:employees!swap_requests_requester_id_fkey(id, first_name, last_name),
          target:employees!swap_requests_target_id_fkey(id, first_name, last_name),
          assignment:shift_assignments(*, shift:shifts(name, start_time, end_time))
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return NextResponse.json({ swaps: data || [] });
    }

    return NextResponse.json({ error: "Invalid type parameter" }, { status: 400 });
  } catch (error) {
    console.error("Error fetching scheduling data:", error);
    return NextResponse.json({ error: "Failed to fetch scheduling data" }, { status: 500 });
  }
}

// POST /api/scheduling — Create a shift assignment
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type } = body;
    const supabase = await createClient();

    if (type === "assignment") {
      const { data, error } = await supabase
        .from("shift_assignments")
        .insert({
          employee_id: body.employee_id,
          shift_id: body.shift_id,
          date: body.date,
          status: body.status || "scheduled",
          notes: body.notes || null,
          assigned_by: body.assigned_by || null,
        })
        .select("*, employee:employees(id, first_name, last_name), shift:shifts(id, name, start_time, end_time, color)")
        .single();

      if (error) throw error;
      return NextResponse.json({ assignment: data }, { status: 201 });
    }

    if (type === "availability") {
      const { data, error } = await supabase
        .from("availabilities")
        .insert({
          employee_id: body.employee_id,
          day_of_week: body.day_of_week,
          start_time: body.start_time,
          end_time: body.end_time,
          is_available: body.is_available !== undefined ? body.is_available : true,
          effective_from: body.effective_from || new Date().toISOString().split("T")[0],
          effective_to: body.effective_to || null,
        })
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json({ availability: data }, { status: 201 });
    }

    if (type === "swap") {
      const { data, error } = await supabase
        .from("swap_requests")
        .insert({
          requester_id: body.requester_id,
          target_id: body.target_id,
          assignment_id: body.assignment_id,
          target_assignment_id: body.target_assignment_id || null,
          reason: body.reason || null,
        })
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json({ swap: data }, { status: 201 });
    }

    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  } catch (error) {
    console.error("Error creating scheduling record:", error);
    return NextResponse.json({ error: "Failed to create scheduling record" }, { status: 500 });
  }
}

// PUT /api/scheduling — Update assignment/swap status
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, type, ...data } = body;
    if (!id) return NextResponse.json({ error: "ID is required" }, { status: 400 });

    const supabase = await createClient();

    if (type === "assignment") {
      const { data: result, error } = await supabase
        .from("shift_assignments")
        .update({ status: data.status, notes: data.notes })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json({ assignment: result });
    }

    if (type === "swap") {
      const { data: result, error } = await supabase
        .from("swap_requests")
        .update({ status: data.status, approved_by: data.approved_by || null })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json({ swap: result });
    }

    if (type === "conflict") {
      const { data: result, error } = await supabase
        .from("schedule_conflicts")
        .update({ resolved: true, resolved_by: data.resolved_by })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json({ conflict: result });
    }

    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  } catch (error) {
    console.error("Error updating scheduling record:", error);
    return NextResponse.json({ error: "Failed to update scheduling record" }, { status: 500 });
  }
}
