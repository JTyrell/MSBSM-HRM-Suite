import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET /api/attendance/records?userId=xxx&from=xxx&to=xxx
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const status = searchParams.get("status");
    const from = searchParams.get("from");
    const to = searchParams.get("to");
    const limit = parseInt(searchParams.get("limit") || "50");
    const page = parseInt(searchParams.get("page") || "1");
    const activeOnly = searchParams.get("activeOnly") === "true";

    const supabase = await createClient();

    let query = supabase
      .from("attendance")
      .select(
        "*, employee:employees(id, first_name, last_name, employee_id, avatar), geofence:geofences(id, name, address)",
        { count: "exact" }
      )
      .order("clock_in", { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (userId) query = query.eq("employee_id", userId);
    if (status) query = query.eq("status", status);
    if (activeOnly) query = query.eq("status", "active");
    if (from) query = query.gte("clock_in", from);
    if (to) query = query.lte("clock_in", to);

    const { data: records, count, error } = await query;

    if (error) throw error;

    return NextResponse.json({
      records: records || [],
      total: count || 0,
      page,
      totalPages: Math.ceil((count || 0) / limit),
    });
  } catch (error) {
    console.error("Error fetching attendance records:", error);
    return NextResponse.json(
      { error: "Failed to fetch attendance records" },
      { status: 500 }
    );
  }
}
