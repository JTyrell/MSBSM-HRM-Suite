import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
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

    const employee = await db.employee.findUnique({
      where: { id: userId },
      include: { workLocation: true, company: true },
    });

    if (!employee) {
      return NextResponse.json({ error: "Employee not found" }, { status: 404 });
    }

    if (employee.status !== "active") {
      return NextResponse.json(
        { error: "Employee is not active" },
        { status: 403 }
      );
    }

    // Check if already clocked in
    const activeAttendance = await db.attendance.findFirst({
      where: {
        employeeId: userId,
        status: "active",
      },
    });

    if (activeAttendance) {
      return NextResponse.json(
        { error: "Already clocked in", attendanceId: activeAttendance.id },
        { status: 409 }
      );
    }

    // Determine which geofence to check
    let targetGeofence = employee.workLocation;

    // If no specific work location, check all active geofences
    if (!targetGeofence) {
      const geofences = await db.geofence.findMany({
        where: {
          isActive: true,
          companyId: employee.companyId,
          ...(employee.departmentId && {
            OR: [
              { departmentId: employee.departmentId },
              { departmentId: null },
            ],
          }),
        },
      });

      // Check each geofence
      for (const fence of geofences) {
        if (isPointInGeofence(latitude, longitude, fence)) {
          targetGeofence = fence;
          break;
        }
      }
    } else {
      // Validate against assigned work location
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
    const attendance = await db.attendance.create({
      data: {
        employeeId: userId,
        geofenceId: targetGeofence.id,
        clockIn: timestamp ? new Date(timestamp) : new Date(),
        clockInLat: latitude,
        clockInLng: longitude,
        status: "active",
        notes,
      },
      include: {
        geofence: { select: { id: true, name: true, address: true } },
      },
    });

    // Create notification
    await db.notification.create({
      data: {
        userId,
        title: "Clock In Successful",
        message: `You have clocked in at ${targetGeofence.name}`,
        type: "success",
        link: "/attendance",
      },
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

    // Find active attendance record
    const activeRecord = await db.attendance.findFirst({
      where: attendanceId
        ? { id: attendanceId, employeeId: userId, status: "active" }
        : { employeeId: userId, status: "active" },
      include: { geofence: true },
    });

    if (!activeRecord) {
      return NextResponse.json(
        { error: "No active clock-in found" },
        { status: 404 }
      );
    }

    const clockOut = new Date();
    const clockInDate = new Date(activeRecord.clockIn);
    const totalMs = clockOut.getTime() - clockInDate.getTime();
    const totalHours = totalMs / (1000 * 60 * 60);

    // Calculate overtime (hours over 8 per day)
    const regularHours = Math.min(totalHours, 8);
    const overtimeHours = Math.max(0, totalHours - 8);

    const attendance = await db.attendance.update({
      where: { id: activeRecord.id },
      data: {
        clockOut,
        clockOutLat: latitude,
        clockOutLng: longitude,
        totalHours: Math.round(totalHours * 100) / 100,
        overtimeHours: Math.round(overtimeHours * 100) / 100,
        status: "completed",
        notes: notes || activeRecord.notes,
      },
      include: {
        geofence: { select: { id: true, name: true } },
        employee: { select: { firstName: true, lastName: true } },
      },
    });

    return NextResponse.json({
      success: true,
      message: `Clock-out successful. Total hours: ${attendance.totalHours}`,
      attendance,
      totalHours: attendance.totalHours,
      overtimeHours: attendance.overtimeHours,
    });
  } catch (error) {
    console.error("Error clocking out:", error);
    return NextResponse.json({ error: "Failed to clock out" }, { status: 500 });
  }
}
