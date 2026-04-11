import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

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

    const where: Record<string, unknown> = {};

    if (userId) where.employeeId = userId;
    if (status) where.status = status;
    if (activeOnly) {
      where.status = "active";
    }
    if (from || to) {
      where.clockIn = {};
      if (from) (where.clockIn as Record<string, unknown>).gte = new Date(from);
      if (to) (where.clockIn as Record<string, unknown>).lte = new Date(to);
    }

    const [records, total] = await Promise.all([
      db.attendance.findMany({
        where,
        include: {
          employee: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              employeeId: true,
              avatar: true,
            },
          },
          geofence: {
            select: { id: true, name: true, address: true },
          },
        },
        orderBy: { clockIn: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.attendance.count({ where }),
    ]);

    return NextResponse.json({
      records,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Error fetching attendance records:", error);
    return NextResponse.json(
      { error: "Failed to fetch attendance records" },
      { status: 500 }
    );
  }
}
