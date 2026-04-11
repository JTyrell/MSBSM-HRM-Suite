import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    // Fetch recent activity from multiple sources
    const [attendanceRecords, ptoRequests, announcements, auditLogs, outToday] =
      await Promise.all([
        db.attendance.findMany({
          take: 5,
          orderBy: { clockIn: "desc" },
          include: {
            employee: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                department: { select: { name: true } },
              },
            },
          },
        }),
        db.pTORequest.findMany({
          take: 5,
          orderBy: { createdAt: "desc" },
          include: {
            employee: {
              select: { id: true, firstName: true, lastName: true },
            },
          },
        }),
        db.announcement.findMany({
          take: 3,
          orderBy: { createdAt: "desc" },
          where: { isPublished: true },
        }),
        db.auditLog.findMany({
          take: 5,
          orderBy: { createdAt: "desc" },
        }),
        db.pTORequest.findMany({
          where: {
            status: "approved",
            startDate: { lte: todayEnd },
            endDate: { gte: todayStart },
          },
          include: {
            employee: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                department: { select: { name: true } },
              },
            },
          },
          orderBy: { startDate: "asc" },
        }),
      ]);

    // Build unified activity feed
    const activities = [
      ...attendanceRecords.map((r) => ({
        id: `att-${r.id}`,
        type: "attendance" as const,
        title: `${r.employee.firstName} ${r.employee.lastName}`,
        description: `Clocked ${r.clockOut ? "out" : "in"} at ${r.clockIn ? new Date(r.clockIn).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }) : "N/A"}`,
        timestamp: (r.clockIn || r.createdAt).toISOString(),
        department: r.employee.department?.name || "",
        icon: "clock" as const,
      })),
      ...ptoRequests.map((r) => ({
        id: `pto-${r.id}`,
        type: "pto" as const,
        title: `${r.employee.firstName} ${r.employee.lastName}`,
        description: `PTO request: ${r.type} — ${r.status}`,
        timestamp: r.createdAt.toISOString(),
        department: "",
        icon: "calendar" as const,
      })),
      ...announcements.map((a) => ({
        id: `ann-${a.id}`,
        type: "announcement" as const,
        title: "Company",
        description: `New announcement: ${a.title.substring(0, 50)}${a.title.length > 50 ? "..." : ""}`,
        timestamp: a.createdAt.toISOString(),
        department: "",
        icon: "megaphone" as const,
      })),
      ...auditLogs.map((l) => ({
        id: `log-${l.id}`,
        type: "system" as const,
        title: l.action,
        description: l.details || "System event",
        timestamp: l.createdAt.toISOString(),
        department: "",
        icon: "shield" as const,
      })),
    ];

    // Sort by timestamp descending
    activities.sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    // Build who's out today list
    const whosOut = outToday.map((r) => ({
      id: r.id,
      firstName: r.employee.firstName,
      lastName: r.employee.lastName,
      type: r.type,
      department: r.employee.department?.name || "",
    }));

    return NextResponse.json({
      activities: activities.slice(0, 20),
      whosOut,
    });
  } catch (error) {
    console.error("Activity feed error:", error);
    return NextResponse.json({ activities: [], whosOut: [] });
  }
}
