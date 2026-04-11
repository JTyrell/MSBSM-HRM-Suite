import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/shifts - List all shifts with optional department filter
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const departmentId = searchParams.get("departmentId");

    const shifts = await db.shift.findMany({
      where: departmentId && departmentId !== "all"
        ? { departmentId }
        : undefined,
      include: {
        department: {
          select: { id: true, name: true, code: true },
        },
      },
      orderBy: { startTime: "asc" },
    });

    return NextResponse.json({ shifts });
  } catch (error) {
    console.error("Error fetching shifts:", error);
    return NextResponse.json(
      { error: "Failed to fetch shifts" },
      { status: 500 }
    );
  }
}

// POST /api/shifts - Create a new shift
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, startTime, endTime, breakMinutes, color, isActive, departmentId, companyId } = body;

    if (!name || !startTime || !endTime || !companyId) {
      return NextResponse.json(
        { error: "Missing required fields: name, startTime, endTime, companyId" },
        { status: 400 }
      );
    }

    const shift = await db.shift.create({
      data: {
        name,
        startTime,
        endTime,
        breakMinutes: breakMinutes || 30,
        color: color || "#10b981",
        isActive: isActive !== undefined ? isActive : true,
        departmentId: departmentId || null,
        companyId,
      },
      include: {
        department: {
          select: { id: true, name: true, code: true },
        },
      },
    });

    return NextResponse.json({ shift }, { status: 201 });
  } catch (error) {
    console.error("Error creating shift:", error);
    return NextResponse.json(
      { error: "Failed to create shift" },
      { status: 500 }
    );
  }
}

// PUT /api/shifts - Update a shift
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, name, startTime, endTime, breakMinutes, color, isActive, departmentId } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Shift id is required" },
        { status: 400 }
      );
    }

    const shift = await db.shift.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(startTime !== undefined && { startTime }),
        ...(endTime !== undefined && { endTime }),
        ...(breakMinutes !== undefined && { breakMinutes }),
        ...(color !== undefined && { color }),
        ...(isActive !== undefined && { isActive }),
        ...(departmentId !== undefined && { departmentId }),
      },
      include: {
        department: {
          select: { id: true, name: true, code: true },
        },
      },
    });

    return NextResponse.json({ shift });
  } catch (error) {
    console.error("Error updating shift:", error);
    return NextResponse.json(
      { error: "Failed to update shift" },
      { status: 500 }
    );
  }
}

// DELETE /api/shifts - Delete a shift
export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Shift id is required" },
        { status: 400 }
      );
    }

    await db.shift.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting shift:", error);
    return NextResponse.json(
      { error: "Failed to delete shift" },
      { status: 500 }
    );
  }
}
