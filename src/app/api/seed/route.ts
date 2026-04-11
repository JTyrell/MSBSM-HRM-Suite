import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { createCirclePolygon } from "@/lib/geo";

// POST /api/seed - Seed database with demo data
export async function POST() {
  try {
    // Clear existing data
    await db.chatMessage.deleteMany();
    await db.notification.deleteMany();
    await db.payrollRecord.deleteMany();
    await db.payrollPeriod.deleteMany();
    await db.pTOBalance.deleteMany();
    await db.pTORequest.deleteMany();
    await db.attendance.deleteMany();
    await db.employee.deleteMany();
    await db.geofence.deleteMany();
    await db.department.deleteMany();
    await db.company.deleteMany();

    // Create company
    const company = await db.company.create({
      data: {
        name: "MSBM Group",
        logo: "/logo.svg",
        address: "123 Business Ave, New York, NY 10001",
        timezone: "America/New_York",
      },
    });

    // Create departments
    const departments = await Promise.all([
      db.department.create({ data: { name: "Engineering", code: "ENG", description: "Software development team", companyId: company.id } }),
      db.department.create({ data: { name: "Human Resources", code: "HR", description: "People operations and culture", companyId: company.id } }),
      db.department.create({ data: { name: "Finance", code: "FIN", description: "Financial planning and accounting", companyId: company.id } }),
      db.department.create({ data: { name: "Marketing", code: "MKT", description: "Brand, growth, and communications", companyId: company.id } }),
      db.department.create({ data: { name: "Sales", code: "SLS", description: "Revenue generation and partnerships", companyId: company.id } }),
      db.department.create({ data: { name: "Operations", code: "OPS", description: "Business operations and logistics", companyId: company.id } }),
    ]);

    // Create geofences
    const mainOffice = await db.geofence.create({
      data: {
        name: "MSBM Headquarters",
        address: "123 Business Ave, New York, NY 10001",
        type: "office",
        isActive: true,
        centerLat: 40.7580,
        centerLng: -73.9855,
        radius: 300,
        companyId: company.id,
        departmentId: null,
        polygon: JSON.stringify({
          type: "Polygon",
          coordinates: [createCirclePolygon(40.7580, -73.9855, 300, 32)],
        }),
      },
    });

    const westCampus = await db.geofence.create({
      data: {
        name: "West Campus",
        address: "456 Tech Blvd, San Francisco, CA 94102",
        type: "office",
        isActive: true,
        centerLat: 37.7749,
        centerLng: -122.4194,
        radius: 250,
        companyId: company.id,
        departmentId: departments[0].id,
        polygon: JSON.stringify({
          type: "Polygon",
          coordinates: [createCirclePolygon(37.7749, -122.4194, 250, 32)],
        }),
      },
    });

    const fieldSite = await db.geofence.create({
      data: {
        name: "Field Operations Site",
        address: "789 Construction Rd, Austin, TX 73301",
        type: "field",
        isActive: true,
        centerLat: 30.2672,
        centerLng: -97.7431,
        radius: 500,
        companyId: company.id,
        departmentId: departments[5].id,
        polygon: JSON.stringify({
          type: "Polygon",
          coordinates: [createCirclePolygon(30.2672, -97.7431, 500, 32)],
        }),
      },
    });

    // Create employees
    const now = new Date();
    const employees = [];

    const employeeData = [
      { firstName: "Alex", lastName: "Rivera", email: "alex.rivera@msbm.com", role: "admin", dept: 0, pay: 55, type: "salary", hire: "2021-03-15", location: mainOffice.id },
      { firstName: "Sarah", lastName: "Chen", email: "sarah.chen@msbm.com", role: "hr", dept: 1, pay: 48, type: "salary", hire: "2021-06-01", location: mainOffice.id },
      { firstName: "Marcus", lastName: "Williams", email: "marcus.williams@msbm.com", role: "manager", dept: 0, pay: 65, type: "salary", hire: "2020-01-10", location: westCampus.id },
      { firstName: "Priya", lastName: "Patel", email: "priya.patel@msbm.com", role: "employee", dept: 0, pay: 42, type: "hourly", hire: "2022-04-20", location: westCampus.id },
      { firstName: "James", lastName: "O'Brien", email: "james.obrien@msbm.com", role: "employee", dept: 0, pay: 45, type: "hourly", hire: "2022-07-15", location: westCampus.id },
      { firstName: "Maria", lastName: "Garcia", email: "maria.garcia@msbm.com", role: "employee", dept: 2, pay: 38, type: "hourly", hire: "2023-01-08", location: mainOffice.id },
      { firstName: "David", lastName: "Kim", email: "david.kim@msbm.com", role: "manager", dept: 3, pay: 58, type: "salary", hire: "2020-09-12", location: mainOffice.id },
      { firstName: "Emma", lastName: "Thompson", email: "emma.thompson@msbm.com", role: "employee", dept: 3, pay: 35, type: "hourly", hire: "2023-03-22", location: mainOffice.id },
      { firstName: "Carlos", lastName: "Rodriguez", email: "carlos.rodriguez@msbm.com", role: "employee", dept: 4, pay: 32, type: "hourly", hire: "2023-06-01", location: mainOffice.id },
      { firstName: "Aisha", lastName: "Johnson", email: "aisha.johnson@msbm.com", role: "employee", dept: 4, pay: 34, type: "hourly", hire: "2023-08-15", location: mainOffice.id },
      { firstName: "Liam", lastName: "Turner", email: "liam.turner@msbm.com", role: "employee", dept: 5, pay: 30, type: "hourly", hire: "2023-09-01", location: fieldSite.id },
      { firstName: "Sophia", lastName: "Lee", email: "sophia.lee@msbm.com", role: "employee", dept: 5, pay: 31, type: "hourly", hire: "2023-10-10", location: fieldSite.id },
      { firstName: "Noah", lastName: "Martinez", email: "noah.martinez@msbm.com", role: "employee", dept: 0, pay: 40, type: "hourly", hire: "2022-11-01", location: westCampus.id },
      { firstName: "Olivia", lastName: "Brown", email: "olivia.brown@msbm.com", role: "manager", dept: 1, pay: 52, type: "salary", hire: "2020-05-18", location: mainOffice.id },
      { firstName: "Ethan", lastName: "Davis", email: "ethan.davis@msbm.com", role: "employee", dept: 2, pay: 36, type: "hourly", hire: "2023-02-14", location: mainOffice.id },
    ];

    for (let i = 0; i < employeeData.length; i++) {
      const emp = employeeData[i];
      const employee = await db.employee.create({
        data: {
          employeeId: `EMP-${String(i + 1).padStart(4, "0")}`,
          firstName: emp.firstName,
          lastName: emp.lastName,
          email: emp.email,
          phone: `(555) ${100 + i}-${1000 + i * 100}`,
          role: emp.role,
          status: "active",
          hireDate: new Date(emp.hire),
          departmentId: departments[emp.dept].id,
          companyId: company.id,
          payType: emp.type,
          payRate: emp.pay,
          overtimeRate: 1.5,
          workLocationId: emp.location,
          address: `${100 + i} Main St, New York, NY`,
          taxFilingStatus: i % 3 === 0 ? "married" : "single",
          taxAllowances: 1 + (i % 3),
        },
      });
      employees.push(employee);
    }

    // Create attendance records for the last 30 days
    const attendanceRecords = [];
    for (let day = 30; day >= 0; day--) {
      if (Math.random() > 0.15) continue; // Skip some days randomly
      const date = new Date(now);
      date.setDate(date.getDate() - day);

      // Skip weekends
      if (date.getDay() === 0 || date.getDay() === 6) continue;

      for (const emp of employees.slice(1)) { // Skip admin for more realistic data
        if (Math.random() > 0.8) continue; // Random absence

        const clockIn = new Date(date);
        clockIn.setHours(8 + Math.floor(Math.random() * 2), Math.floor(Math.random() * 30), 0);

        const totalHours = 7.5 + Math.random() * 2.5;
        const clockOut = new Date(clockIn.getTime() + totalHours * 60 * 60 * 1000);

        const overtime = totalHours > 8 ? totalHours - 8 : 0;

        // Use employee's assigned geofence
        const geofenceId = emp.workLocationId || mainOffice.id;
        const geo = geofenceId === westCampus.id ? westCampus : geofenceId === fieldSite.id ? fieldSite : mainOffice;

        attendanceRecords.push({
          employeeId: emp.id,
          geofenceId: geo.id,
          clockIn,
          clockOut,
          clockInLat: geo.centerLat + (Math.random() - 0.5) * 0.001,
          clockInLng: geo.centerLng + (Math.random() - 0.5) * 0.001,
          clockOutLat: geo.centerLat + (Math.random() - 0.5) * 0.001,
          clockOutLng: geo.centerLng + (Math.random() - 0.5) * 0.001,
          totalHours: Math.round(totalHours * 100) / 100,
          overtimeHours: Math.round(overtime * 100) / 100,
          status: "completed",
        });
      }
    }

    // Batch create attendance
    for (const record of attendanceRecords) {
      await db.attendance.create({ data: record });
    }

    // Create PTO balances for current year
    const year = now.getFullYear();
    for (const emp of employees) {
      await db.pTOBalance.create({
        data: {
          employeeId: emp.id,
          year,
          totalAllocated: 20,
          usedSick: Math.floor(Math.random() * 3),
          usedVacation: Math.floor(Math.random() * 5),
          usedPersonal: Math.floor(Math.random() * 2),
          usedOther: 0,
        },
      });
    }

    // Create some PTO requests
    const ptoData = [
      { emp: employees[3], type: "vacation", days: 3, status: "approved", reason: "Family vacation" },
      { emp: employees[4], type: "sick", days: 2, status: "approved", reason: "Feeling unwell" },
      { emp: employees[5], type: "personal", days: 1, status: "pending", reason: "Personal errands" },
      { emp: employees[8], type: "vacation", days: 5, status: "pending", reason: "Summer trip" },
      { emp: employees[9], type: "sick", days: 1, status: "rejected", reason: "Already exceeded balance" },
      { emp: employees[10], type: "vacation", days: 2, status: "pending", reason: "Doctor appointment" },
    ];

    for (const pto of ptoData) {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() + 7 + Math.floor(Math.random() * 14));
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + pto.days - 1);

      await db.pTORequest.create({
        data: {
          employeeId: pto.emp.id,
          type: pto.type,
          startDate,
          endDate,
          daysCount: pto.days,
          reason: pto.reason,
          status: pto.status,
          approvedBy: pto.status !== "pending" ? employees[0].id : null,
          approvedAt: pto.status !== "pending" ? new Date() : null,
        },
      });
    }

    // Create a recent payroll period
    const periodStart = new Date(now);
    periodStart.setDate(periodStart.getDate() - 30);
    const periodEnd = new Date(now);
    periodEnd.setDate(periodEnd.getDate() - 1);

    const payrollPeriod = await db.payrollPeriod.create({
      data: {
        name: `Pay Period: ${periodStart.toLocaleDateString("en-US", { month: "short", day: "numeric" })} - ${periodEnd.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`,
        startDate: periodStart,
        endDate: periodEnd,
        status: "completed",
        companyId: company.id,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Database seeded successfully",
      stats: {
        company: company.name,
        departments: departments.length,
        employees: employees.length,
        geofences: 3,
        attendanceRecords: attendanceRecords.length,
        ptoRequests: ptoData.length,
      },
      employees: employees.map((e) => ({
        id: e.id,
        employeeId: e.employeeId,
        name: `${e.firstName} ${e.lastName}`,
        email: e.email,
        role: e.role,
      })),
    });
  } catch (error) {
    console.error("Error seeding database:", error);
    return NextResponse.json({ error: "Failed to seed database", details: String(error) }, { status: 500 });
  }
}
