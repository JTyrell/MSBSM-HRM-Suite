import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/pto - List PTO requests
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const status = searchParams.get("status");

    const where: Record<string, unknown> = {};
    if (userId) where.employeeId = userId;
    if (status) where.status = status;

    const requests = await db.pTORequest.findMany({
      where,
      include: {
        employee: {
          select: { id: true, firstName: true, lastName: true, avatar: true, employeeId: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ requests });
  } catch (error) {
    console.error("Error fetching PTO requests:", error);
    return NextResponse.json({ error: "Failed to fetch PTO requests" }, { status: 500 });
  }
}

// POST /api/pto - Create PTO request
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { employeeId, type, startDate, endDate, reason } = body;

    if (!employeeId || !type || !startDate || !endDate) {
      return NextResponse.json(
        { error: "employeeId, type, startDate, and endDate are required" },
        { status: 400 }
      );
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    const daysCount = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    if (daysCount <= 0) {
      return NextResponse.json({ error: "End date must be after start date" }, { status: 400 });
    }

    // Check PTO balance
    const year = start.getFullYear();
    const balance = await db.pTOBalance.findUnique({
      where: { employeeId_year: { employeeId, year } },
    });

    if (balance) {
      const usedMap: Record<string, number> = {
        sick: balance.usedSick,
        vacation: balance.usedVacation,
        personal: balance.usedPersonal,
        other: balance.usedOther,
      };
      const available = balance.totalAllocated - (usedMap[type] || 0);
      if (available < daysCount) {
        return NextResponse.json(
          { error: `Insufficient ${type} balance. Available: ${available} days` },
          { status: 400 }
        );
      }
    }

    const ptoRequest = await db.pTORequest.create({
      data: {
        employeeId,
        type,
        startDate: start,
        endDate: end,
        daysCount,
        reason,
        status: "pending",
      },
      include: {
        employee: { select: { id: true, firstName: true, lastName: true } },
      },
    });

    // Create notification
    await db.notification.create({
      data: {
        userId: employeeId,
        title: "PTO Request Submitted",
        message: `Your ${type} request for ${daysCount} day(s) has been submitted for approval.`,
        type: "info",
      },
    });

    return NextResponse.json({ request: ptoRequest }, { status: 201 });
  } catch (error) {
    console.error("Error creating PTO request:", error);
    return NextResponse.json({ error: "Failed to create PTO request" }, { status: 500 });
  }
}

// PUT /api/pto - Approve/reject PTO request
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status, approvedBy } = body;

    if (!id || !status) {
      return NextResponse.json({ error: "id and status required" }, { status: 400 });
    }

    const ptoRequest = await db.pTORequest.update({
      where: { id },
      data: {
        status,
        approvedBy: approvedBy || null,
        approvedAt: status === "approved" || status === "rejected" ? new Date() : null,
      },
      include: {
        employee: { select: { id: true, firstName: true, lastName: true } },
      },
    });

    // Update PTO balance if approved
    if (status === "approved") {
      const year = new Date(ptoRequest.startDate).getFullYear();
      const balance = await db.pTOBalance.upsert({
        where: { employeeId_year: { employeeId: ptoRequest.employeeId, year } },
        create: {
          employeeId: ptoRequest.employeeId,
          year,
          totalAllocated: 20,
          usedSick: ptoRequest.type === "sick" ? ptoRequest.daysCount : 0,
          usedVacation: ptoRequest.type === "vacation" ? ptoRequest.daysCount : 0,
          usedPersonal: ptoRequest.type === "personal" ? ptoRequest.daysCount : 0,
          usedOther: ptoRequest.type === "other" ? ptoRequest.daysCount : 0,
        },
        update: {
          [ptoRequest.type === "sick" ? "usedSick" : ptoRequest.type === "vacation" ? "usedVacation" : ptoRequest.type === "personal" ? "usedPersonal" : "usedOther"]:
            { increment: ptoRequest.daysCount },
        },
      });

      // Notify employee
      await db.notification.create({
        data: {
          userId: ptoRequest.employeeId,
          title: "PTO Request Approved",
          message: `Your ${ptoRequest.type} request for ${ptoRequest.daysCount} day(s) has been approved.`,
          type: "success",
        },
      });
    } else if (status === "rejected") {
      await db.notification.create({
        data: {
          userId: ptoRequest.employeeId,
          title: "PTO Request Rejected",
          message: `Your ${ptoRequest.type} request has been rejected.`,
          type: "warning",
        },
      });
    }

    return NextResponse.json({ request: ptoRequest });
  } catch (error) {
    console.error("Error updating PTO request:", error);
    return NextResponse.json({ error: "Failed to update PTO request" }, { status: 500 });
  }
}
