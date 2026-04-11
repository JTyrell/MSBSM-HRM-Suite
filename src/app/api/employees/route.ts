import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/employees - List all employees
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const departmentId = searchParams.get("departmentId");
    const status = searchParams.get("status");
    const role = searchParams.get("role");
    const search = searchParams.get("search");

    const where: Record<string, unknown> = {};

    if (departmentId) where.departmentId = departmentId;
    if (status) where.status = status;
    if (role) where.role = role;
    if (search) {
      where.OR = [
        { firstName: { contains: search } },
        { lastName: { contains: search } },
        { email: { contains: search } },
        { employeeId: { contains: search } },
      ];
    }

    const employees = await db.employee.findMany({
      where,
      include: {
        department: { select: { id: true, name: true, code: true } },
        workLocation: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ employees });
  } catch (error) {
    console.error("Error fetching employees:", error);
    return NextResponse.json({ error: "Failed to fetch employees" }, { status: 500 });
  }
}

// POST /api/employees - Create a new employee
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      firstName, lastName, email, phone, role, departmentId,
      payType, payRate, overtimeRate, hireDate, workLocationId,
      address, emergencyContact, emergencyPhone, taxFilingStatus, taxAllowances
    } = body;

    // Check for duplicate email
    const existing = await db.employee.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "Employee with this email already exists" }, { status: 409 });
    }

    // Generate employee ID
    const count = await db.employee.count();
    const employeeId = `EMP-${String(count + 1).padStart(4, "0")}`;

    // Get company
    const company = await db.company.findFirst();
    if (!company) {
      return NextResponse.json({ error: "No company found. Please seed the database first." }, { status: 400 });
    }

    const employee = await db.employee.create({
      data: {
        employeeId,
        firstName,
        lastName,
        email,
        phone,
        role: role || "employee",
        status: "active",
        hireDate: hireDate ? new Date(hireDate) : new Date(),
        departmentId,
        companyId: company.id,
        payType: payType || "hourly",
        payRate: payRate || 0,
        overtimeRate: overtimeRate || 1.5,
        workLocationId: workLocationId || null,
        address,
        emergencyContact,
        emergencyPhone,
        taxFilingStatus: taxFilingStatus || "single",
        taxAllowances: taxAllowances || 1,
      },
      include: {
        department: { select: { id: true, name: true, code: true } },
        workLocation: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json({ employee }, { status: 201 });
  } catch (error) {
    console.error("Error creating employee:", error);
    return NextResponse.json({ error: "Failed to create employee" }, { status: 500 });
  }
}

// PUT /api/employees - Update an employee
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...data } = body;

    if (!id) {
      return NextResponse.json({ error: "Employee ID is required" }, { status: 400 });
    }

    const employee = await db.employee.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
      include: {
        department: { select: { id: true, name: true, code: true } },
        workLocation: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json({ employee });
  } catch (error) {
    console.error("Error updating employee:", error);
    return NextResponse.json({ error: "Failed to update employee" }, { status: 500 });
  }
}

// DELETE /api/employees?id=xxx - Delete an employee
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Employee ID is required" }, { status: 400 });
    }

    await db.employee.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting employee:", error);
    return NextResponse.json({ error: "Failed to delete employee" }, { status: 500 });
  }
}
