import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/department-roles — List roles (optionally filtered by departmentId)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const departmentId = searchParams.get("departmentId");

    const roles = await db.departmentRole.findMany({
      where: departmentId ? { departmentId } : undefined,
      include: {
        department: true,
      },
      orderBy: { sortOrder: "asc" },
    });

    return NextResponse.json({ roles });
  } catch (error) {
    console.error("Error fetching department roles:", error);
    return NextResponse.json({ error: "Failed to fetch department roles" }, { status: 500 });
  }
}

// POST /api/department-roles — Create a new role
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      title,
      code,
      description,
      gradeLevel,
      reportsTo,
      isManagement,
      canApprovePayroll,
      canAssignRoles,
      canViewAllEmployees,
      canEditEmployees,
      canManageIT,
      canViewPayroll,
      canEditPayroll,
      canManageSchedule,
      departmentId,
      sortOrder,
    } = body;

    if (!title || !code) {
      return NextResponse.json({ error: "title and code are required" }, { status: 400 });
    }

    // Check for duplicate code
    const existing = await db.departmentRole.findUnique({ where: { code } });
    if (existing) {
      return NextResponse.json({ error: "A role with this code already exists" }, { status: 409 });
    }

    const role = await db.departmentRole.create({
      data: {
        title,
        code,
        description: description || null,
        gradeLevel: gradeLevel ?? 1,
        reportsTo: reportsTo || null,
        isManagement: isManagement ?? false,
        canApprovePayroll: canApprovePayroll ?? false,
        canAssignRoles: canAssignRoles ?? false,
        canViewAllEmployees: canViewAllEmployees ?? false,
        canEditEmployees: canEditEmployees ?? false,
        canManageIT: canManageIT ?? false,
        canViewPayroll: canViewPayroll ?? false,
        canEditPayroll: canEditPayroll ?? false,
        canManageSchedule: canManageSchedule ?? false,
        departmentId: departmentId || null,
        sortOrder: sortOrder ?? 0,
      },
      include: {
        department: true,
      },
    });

    return NextResponse.json({ role }, { status: 201 });
  } catch (error) {
    console.error("Error creating department role:", error);
    return NextResponse.json({ error: "Failed to create department role" }, { status: 500 });
  }
}

// PUT /api/department-roles — Update a role by id (partial update)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...data } = body;

    if (!id) {
      return NextResponse.json({ error: "Role ID is required" }, { status: 400 });
    }

    const role = await db.departmentRole.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
      include: {
        department: true,
      },
    });

    return NextResponse.json({ role });
  } catch (error) {
    console.error("Error updating department role:", error);
    return NextResponse.json({ error: "Failed to update department role" }, { status: 500 });
  }
}

// DELETE /api/department-roles?id=xxx — Delete a role by id
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Role ID is required" }, { status: 400 });
    }

    await db.departmentRole.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting department role:", error);
    return NextResponse.json({ error: "Failed to delete department role" }, { status: 500 });
  }
}
