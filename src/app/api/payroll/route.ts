import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { calculatePayroll } from "@/lib/payroll";

// GET /api/payroll/periods
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const periodId = searchParams.get("periodId");
    const status = searchParams.get("status");

    if (periodId) {
      const period = await db.payrollPeriod.findUnique({
        where: { id: periodId },
        include: {
          records: {
            include: {
              employee: {
                select: {
                  id: true, firstName: true, lastName: true, employeeId: true,
                  department: { select: { name: true } },
                },
              },
            },
          },
        },
      });
      return NextResponse.json({ period });
    }

    const where: Record<string, unknown> = {};
    if (status) where.status = status;

    const periods = await db.payrollPeriod.findMany({
      where,
      include: {
        _count: { select: { records: true } },
        records: {
          select: { grossPay: true, netPay: true, status: true },
        },
      },
      orderBy: { startDate: "desc" },
    });

    return NextResponse.json({ periods });
  } catch (error) {
    console.error("Error fetching payroll:", error);
    return NextResponse.json({ error: "Failed to fetch payroll" }, { status: 500 });
  }
}

// POST /api/payroll/run - Process a payroll run
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, startDate, endDate } = body;

    if (!startDate || !endDate) {
      return NextResponse.json({ error: "Start and end dates are required" }, { status: 400 });
    }

    const company = await db.company.findFirst();
    if (!company) {
      return NextResponse.json({ error: "No company found" }, { status: 400 });
    }

    // Create payroll period
    const period = await db.payrollPeriod.create({
      data: {
        name: name || `Pay Period: ${new Date(startDate).toLocaleDateString()} - ${new Date(endDate).toLocaleDateString()}`,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        status: "processing",
        companyId: company.id,
      },
    });

    // Get all active employees
    const employees = await db.employee.findMany({
      where: { status: "active", companyId: company.id },
    });

    // Get attendance records for this period
    const attendanceRecords = await db.attendance.findMany({
      where: {
        clockIn: { gte: new Date(startDate), lte: new Date(endDate) },
        status: { in: ["completed", "active"] },
        employeeId: { in: employees.map((e) => e.id) },
      },
    });

    // Group attendance by employee
    const attendanceByEmployee = new Map<string, typeof attendanceRecords>();
    for (const record of attendanceRecords) {
      const existing = attendanceByEmployee.get(record.employeeId) || [];
      existing.push(record);
      attendanceByEmployee.set(record.employeeId, new Date(record.employeeId) ? existing : existing);
    }

    // Calculate payroll for each employee
    const records: any[] = [];
    for (const employee of employees) {
      const empAttendance = attendanceByEmployee.get(employee.id) || [];

      let regularHours = 0;
      let overtimeHours = 0;

      for (const att of empAttendance) {
        const hours = att.totalHours || 0;
        const ot = att.overtimeHours || 0;
        regularHours += hours - ot;
        overtimeHours += ot;
      }

      const result = calculatePayroll({
        regularHours,
        overtimeHours,
        payRate: employee.payRate,
        overtimeRate: employee.overtimeRate,
        taxFilingStatus: employee.taxFilingStatus || "single",
        taxAllowances: employee.taxAllowances || 1,
        healthInsurance: 150, // Fixed benefit cost
        retirement401k: 0, // Optional
        otherDeductions: 0,
      });

      // Check for anomalies (AI Payroll Detective)
      let isFlagged = false;
      let flagNotes: string[] = [];

      if (result.totalHours > 80) {
        isFlagged = true;
        flagNotes.push("Excessive hours (>80) - requires review");
      }
      if (result.totalHours < 20 && employee.payType === "fulltime") {
        isFlagged = true;
        flagNotes.push("Insufficient hours for full-time employee");
      }

      // Check for missed clock-outs
      const missedClockOuts = empAttendance.filter((a) => a.status === "active").length;
      if (missedClockOuts > 0) {
        isFlagged = true;
        flagNotes.push(`${missedClockOuts} unclosed clock-in session(s)`);
      }

      const record = await db.payrollRecord.create({
        data: {
          payrollPeriodId: period.id,
          employeeId: employee.id,
          ...result,
          status: isFlagged ? "flagged" : "pending",
          notes: flagNotes.length > 0 ? flagNotes.join("; ") : null,
        },
      });

      records.push(record);
    }

    // Update period status
    await db.payrollPeriod.update({
      where: { id: period.id },
      data: { status: "completed" },
    });

    return NextResponse.json({
      period,
      records,
      totalGross: records.reduce((sum: number, r: any) => sum + (r.grossPay || 0), 0),
      totalNet: records.reduce((sum: number, r: any) => sum + (r.netPay || 0), 0),
      flaggedCount: records.filter((r) => r.status === "flagged").length,
    });
  } catch (error) {
    console.error("Error processing payroll:", error);
    return NextResponse.json({ error: "Failed to process payroll" }, { status: 500 });
  }
}

// PUT /api/payroll/approve - Approve a payroll record
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { recordId, status } = body;

    if (!recordId || !status) {
      return NextResponse.json({ error: "recordId and status required" }, { status: 400 });
    }

    const record = await db.payrollRecord.update({
      where: { id: recordId },
      data: { status, updatedAt: new Date() },
    });

    return NextResponse.json({ record });
  } catch (error) {
    console.error("Error updating payroll record:", error);
    return NextResponse.json({ error: "Failed to update payroll" }, { status: 500 });
  }
}
