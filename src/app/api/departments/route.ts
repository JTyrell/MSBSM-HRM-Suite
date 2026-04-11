import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/departments
export async function GET() {
  try {
    const departments = await db.department.findMany({
      include: {
        _count: { select: { employees: true, geofences: true } },
      },
      orderBy: { name: "asc" },
    });
    return NextResponse.json({ departments });
  } catch (error) {
    console.error("Error fetching departments:", error);
    return NextResponse.json({ error: "Failed to fetch departments" }, { status: 500 });
  }
}

// POST /api/departments
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, code, description } = body;

    const company = await db.company.findFirst();
    if (!company) {
      return NextResponse.json({ error: "No company found" }, { status: 400 });
    }

    const department = await db.department.create({
      data: { name, code, description, companyId: company.id },
    });
    return NextResponse.json({ department }, { status: 201 });
  } catch (error) {
    console.error("Error creating department:", error);
    return NextResponse.json({ error: "Failed to create department" }, { status: 500 });
  }
}

// DELETE /api/departments?id=xxx
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

    await db.department.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting department:", error);
    return NextResponse.json({ error: "Failed to delete department" }, { status: 500 });
  }
}
