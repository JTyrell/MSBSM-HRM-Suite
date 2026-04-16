import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isPointInGeofence } from "@/lib/geo";

// POST /api/attendance/clock-in
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, latitude, longitude, timestamp, notes } = body;

    if (!userId || latitude === undefined || longitude === undefined) {
      return NextResponse.json(
        { error: "userId, latitude, and longitude are required" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Get employee with work location
    const { data: employee, error: empError } = await supabase
      .from("employees")
      .select("*, work_location:geofences(*), company:companies(*)")
      .eq("id", userId)
      .single();

    if (empError || !employee) {
      return NextResponse.json({ error: "Employee not found" }, { status: 404 });
    }

    if (employee.status !== "active") {
      return NextResponse.json(
        { error: "Employee is not active" },
        { status: 403 }
      );
    }

    // Check if already clocked in
    const { data: activeAttendance } = await supabase
      .from("attendance")
      .select("id")
      .eq("employee_id", userId)
      .eq("status", "active")
      .single();

    if (activeAttendance) {
      return NextResponse.json(
        { error: "Already clocked in", attendanceId: activeAttendance.id },
        { status: 409 }
      );
    }

    // Determine which geofence to check
    let targetGeofence = employee.work_location;

    if (!targetGeofence) {
      // Check all active geofences for this company
      const { data: geofences } = await supabase
        .from("geofences")
        .select("*")
        .eq("is_active", true)
        .eq("company_id", employee.company_id);

      for (const fence of geofences || []) {
        if (isPointInGeofence(latitude, longitude, fence)) {
          targetGeofence = fence;
          break;
        }
      }
    } else {
      if (!isPointInGeofence(latitude, longitude, targetGeofence)) {
        return NextResponse.json(
          {
            error: "You are outside the designated work zone",
            geofenceName: targetGeofence.name,
            distance: "outside perimeter",
          },
          { status: 403 }
        );
      }
    }

    if (!targetGeofence) {
      return NextResponse.json(
        {
          error: "No valid geofence found for your location",
          suggestion: "Please contact your HR administrator to verify your work location assignment.",
        },
        { status: 403 }
      );
    }

    // Create attendance record
    const { data: attendance, error: attError } = await supabase
      .from("attendance")
      .insert({
        employee_id: userId,
        geofence_id: targetGeofence.id,
        clock_in: timestamp || new Date().toISOString(),
        clock_in_lat: latitude,
        clock_in_lng: longitude,
        status: "active",
        notes: notes || null,
      })
      .select("*, geofence:geofences(id, name, address)")
      .single();

    if (attError) throw attError;

    // Create notification
    await supabase.from("notifications").insert({
      user_id: userId,
      title: "Clock In Successful",
      message: `You have clocked in at ${targetGeofence.name}`,
      type: "success",
      link: "/attendance",
    });

    return NextResponse.json({
      success: true,
      message: `Clock-in successful at ${targetGeofence.name}`,
      attendance,
      geofenceName: targetGeofence.name,
    });
  } catch (error) {
    console.error("Error clocking in:", error);
    return NextResponse.json({ error: "Failed to clock in" }, { status: 500 });
  }
}

// PUT /api/attendance/clock-out
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, attendanceId, latitude, longitude, notes } = body;

    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

    const supabase = await createClient();

    // Find active attendance record
    let query = supabase
      .from("attendance")
      .select("*, geofence:geofences(*)")
      .eq("employee_id", userId)
      .eq("status", "active");

    if (attendanceId) query = query.eq("id", attendanceId);

    const { data: activeRecord, error: findError } = await query.single();

    if (findError || !activeRecord) {
      return NextResponse.json(
        { error: "No active clock-in found" },
        { status: 404 }
      );
    }

    const clockOut = new Date();
    const clockInDate = new Date(activeRecord.clock_in);
    const totalMs = clockOut.getTime() - clockInDate.getTime();
    const totalHours = totalMs / (1000 * 60 * 60);
    const overtimeHours = Math.max(0, totalHours - 8);

    const { data: attendance, error: updateError } = await supabase
      .from("attendance")
      .update({
        clock_out: clockOut.toISOString(),
        clock_out_lat: latitude,
        clock_out_lng: longitude,
        total_hours: Math.round(totalHours * 100) / 100,
        overtime_hours: Math.round(overtimeHours * 100) / 100,
        status: "completed",
        notes: notes || activeRecord.notes,
      })
      .eq("id", activeRecord.id)
      .select("*, geofence:geofences(id, name), employee:employees(first_name, last_name)")
      .single();

    if (updateError) throw updateError;

    return NextResponse.json({
      success: true,
      message: `Clock-out successful. Total hours: ${attendance.total_hours}`,
      attendance,
      totalHours: attendance.total_hours,
      overtimeHours: attendance.overtime_hours,
    });
  } catch (error) {
    console.error("Error clocking out:", error);
    return NextResponse.json({ error: "Failed to clock out" }, { status: 500 });
  }
}

// GET /api/attendance - Get attendance records
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get("employeeId");
    const status = searchParams.get("status");
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    const supabase = await createClient();

    let query = supabase
      .from("attendance")
      .select("*, employee:employees(id, first_name, last_name, employee_id, department:departments(name)), geofence:geofences(id, name, address)")
      .order("clock_in", { ascending: false })
      .limit(200);

    if (employeeId) query = query.eq("employee_id", employeeId);
    if (status) query = query.eq("status", status);
    if (from) query = query.gte("clock_in", from);
    if (to) query = query.lte("clock_in", to);

    const { data: records, error } = await query;

    if (error) throw error;
    return NextResponse.json({ records: records || [] });
  } catch (error) {
    console.error("Error fetching attendance:", error);
    return NextResponse.json({ error: "Failed to fetch attendance" }, { status: 500 });
  }
}
