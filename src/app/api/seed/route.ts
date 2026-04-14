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
    await db.performanceReview.deleteMany();
    await db.jobListing.deleteMany();
    await db.employee.deleteMany();
    await db.shift.deleteMany();
    await db.announcement.deleteMany();
    await db.geofence.deleteMany();
    await db.department.deleteMany();
    await db.companySettings.deleteMany();
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

    // Create default company settings
    await db.companySettings.create({
      data: {
        companyId: company.id,
        companyName: "MSBM Technologies Inc.",
        companyAddress: "1234 Innovation Drive, Suite 500, San Francisco, CA 94102",
        companyPhone: "(555) 100-1000",
        companyEmail: "info@msbm.com",
        companyWebsite: "https://msbm.com",
        attendanceGracePeriod: 5,
        autoClockOutHours: 12,
        requireGeofence: true,
        overtimeThreshold: 40,
        payrollFrequency: "biweekly",
        payPeriodStartDay: 15,
        taxFilingDefault: "single",
        overtimeMultiplier: 1.5,
        emailNotifications: true,
        pushNotifications: true,
        payrollAlerts: true,
        ptoAlerts: true,
        complianceAlerts: false,
        twoFactorAuth: false,
        sessionTimeout: 30,
        passwordMinLength: 8,
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

    // Create default shifts
    const defaultShifts = [
      { name: "Morning Shift", startTime: "06:00", endTime: "14:00", breakMinutes: 30, color: "#10b981", isActive: true, departmentId: departments[0].id },
      { name: "Day Shift", startTime: "09:00", endTime: "17:00", breakMinutes: 60, color: "#14b8a6", isActive: true, departmentId: null },
      { name: "Evening Shift", startTime: "14:00", endTime: "22:00", breakMinutes: 30, color: "#f59e0b", isActive: true, departmentId: departments[5].id },
      { name: "Night Shift", startTime: "22:00", endTime: "06:00", breakMinutes: 45, color: "#8b5cf6", isActive: true, departmentId: departments[5].id },
      { name: "Flex Shift", startTime: "10:00", endTime: "16:00", breakMinutes: 30, color: "#ec4899", isActive: true, departmentId: departments[3].id },
    ];

    const shifts: any[] = [];
    for (const shiftData of defaultShifts) {
      const shift = await db.shift.create({
        data: {
          ...shiftData,
          companyId: company.id,
        },
      });
      shifts.push(shift);
    }

    // Create employees
    const now = new Date();
    const employees: any[] = [];

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
    const attendanceRecords: any[] = [];
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

    // Create a recent payroll period with records
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

    // Create payroll records for each employee
    let totalGrossPay = 0;
    let totalNetPay = 0;
    for (const emp of employees) {
      // Calculate hours from attendance in this period
      const empAttendance = attendanceRecords.filter(
        (r) => r.employeeId === emp.id
      );
      let regularHours = 0;
      let overtimeHours = 0;
      for (const att of empAttendance) {
        const hours = att.totalHours || 0;
        const ot = att.overtimeHours || 0;
        regularHours += hours - ot;
        overtimeHours += ot;
      }

      // For salary employees, estimate bi-weekly hours
      if (emp.payType === "salary" && regularHours < 40) {
        regularHours = 80; // bi-weekly
      }

      const grossPay = (regularHours + overtimeHours * 1.5) * emp.payRate;
      const federalTax = grossPay * 0.15;
      const stateTax = grossPay * 0.05;
      const socialSecurity = Math.min(grossPay, 168600) * 0.062;
      const medicare = grossPay * 0.0145;
      const healthInsurance = 150;
      const totalDeductions = federalTax + stateTax + socialSecurity + medicare + healthInsurance;
      const netPay = grossPay - totalDeductions;

      totalGrossPay += grossPay;
      totalNetPay += netPay;

      await db.payrollRecord.create({
        data: {
          payrollPeriodId: payrollPeriod.id,
          employeeId: emp.id,
          regularHours: Math.round(regularHours * 100) / 100,
          overtimeHours: Math.round(overtimeHours * 100) / 100,
          totalHours: Math.round((regularHours + overtimeHours) * 100) / 100,
          grossPay: Math.round(grossPay * 100) / 100,
          federalTax: Math.round(federalTax * 100) / 100,
          stateTax: Math.round(stateTax * 100) / 100,
          socialSecurity: Math.round(socialSecurity * 100) / 100,
          medicare: Math.round(medicare * 100) / 100,
          healthInsurance,
          retirement401k: 0,
          otherDeductions: 0,
          totalDeductions: Math.round(totalDeductions * 100) / 100,
          netPay: Math.round(netPay * 100) / 100,
          status: "paid",
        },
      });
    }

    // Create announcements
    const announcementData = [
      {
        title: "Welcome to MSBM-HR Suite v3.0",
        content: "We're excited to announce the launch of MSBM-HR Suite v3.0! This major update includes a completely redesigned interface, real-time attendance tracking with GPS geofencing, automated payroll processing, and our new AI-powered assistant. Please take some time to explore all the new features and let us know your feedback.",
        category: "general",
        priority: "high",
        isPinned: true,
      },
      {
        title: "Q2 All-Hands Meeting",
        content: "Our quarterly all-hands meeting is scheduled for Friday at 2:00 PM in the main auditorium. CEO Alex Rivera will share Q1 results and outline our Q2 strategic priorities. There will be an open Q&A session followed by a networking reception. Please RSVP by Wednesday.",
        category: "event",
        priority: "normal",
        isPinned: false,
      },
      {
        title: "Updated Remote Work Policy",
        content: "Effective immediately, our remote work policy has been updated. Employees may now work remotely up to 3 days per week with manager approval. All remote workers must maintain available hours between 10 AM and 4 PM in their local timezone and must use the geofenced attendance app when visiting any company location.",
        category: "policy",
        priority: "high",
        isPinned: false,
      },
      {
        title: "New Office Snack Bar Now Open",
        content: "Great news! The new snack bar on the 3rd floor is now officially open. We've partnered with local vendors to offer fresh fruit, healthy snacks, coffee, and beverages throughout the day. A big thank you to the Operations team for making this happen. Enjoy!",
        category: "celebration",
        priority: "low",
        isPinned: false,
      },
      {
        title: "Holiday Schedule: Memorial Day",
        content: "Please note that the office will be closed on Monday, May 26th in observance of Memorial Day. Normal business hours will resume on Tuesday, May 27th. All employees will receive this day as a paid holiday. Please plan your projects and deadlines accordingly.",
        category: "general",
        priority: "normal",
        isPinned: false,
      },
      {
        title: "Open Enrollment Period Starts Monday",
        content: "The annual open enrollment period for benefits begins Monday and runs through the end of the month. This is your opportunity to review and update your health insurance, dental, vision, and 401(k) contributions. HR will host information sessions on Tuesday and Thursday at noon in Conference Room A.",
        category: "urgent",
        priority: "urgent",
        isPinned: false,
      },
      {
        title: "Employee of the Month: Sarah Chen",
        content: "Congratulations to Sarah Chen from Human Resources for being named Employee of the Month! Sarah has been instrumental in streamlining our onboarding process, reducing new hire time-to-productivity by 40%. She consistently demonstrates exceptional dedication and innovation. Join us in celebrating her achievement!",
        category: "celebration",
        priority: "normal",
        isPinned: true,
      },
      {
        title: "IT Maintenance Window This Weekend",
        content: "The IT department will be performing scheduled system maintenance this Saturday from 10 PM to 4 AM Sunday. During this window, email, VPN, and internal tools may be intermittently unavailable. Please save any work in progress before the maintenance window. Contact IT support if you experience issues after Sunday morning.",
        category: "urgent",
        priority: "high",
        isPinned: false,
      },
    ];

    for (const ann of announcementData) {
      await db.announcement.create({
        data: {
          title: ann.title,
          content: ann.content,
          category: ann.category,
          priority: ann.priority,
          authorId: employees[0].id,
          isPinned: ann.isPinned,
          isPublished: true,
          companyId: company.id,
        },
      });
    }

    // Create job listings
    const jobListings = [
      {
        title: "Senior Software Engineer",
        department: "Engineering",
        location: "San Francisco, CA",
        type: "full-time",
        status: "open",
        description: "We are looking for a Senior Software Engineer to join our core platform team. You will be responsible for designing and implementing scalable backend services, mentoring junior developers, and driving technical decisions that impact our entire product ecosystem.",
        requirements: "7+ years of software development experience, proficiency in TypeScript/Node.js and Python, experience with cloud platforms (AWS/GCP), strong understanding of distributed systems and microservices architecture, excellent problem-solving and communication skills.",
        salaryMin: 120000,
        salaryMax: 160000,
        applicantCount: 24,
      },
      {
        title: "HR Business Partner",
        department: "Human Resources",
        location: "New York, NY",
        type: "full-time",
        status: "open",
        description: "We are seeking an experienced HR Business Partner to serve as a strategic advisor to our leadership team. You will drive talent management initiatives, support organizational development, and ensure HR programs align with business objectives.",
        requirements: "5+ years of HRBP experience, SHRM-CP/SCP or PHR certification preferred, experience with HRIS platforms, strong consulting and stakeholder management skills, knowledge of employment law and compliance.",
        salaryMin: 85000,
        salaryMax: 110000,
        applicantCount: 18,
      },
      {
        title: "Product Manager",
        department: "Product",
        location: "Remote",
        type: "full-time",
        status: "open",
        description: "Join our Product team to define and deliver best-in-class features for our HR platform. You will work closely with engineering, design, and customer success teams to translate user needs into compelling product experiences.",
        requirements: "4+ years of product management experience in B2B SaaS, experience with agile methodologies, strong analytical and data-driven mindset, excellent written and verbal communication, ability to prioritize competing demands.",
        salaryMin: 110000,
        salaryMax: 140000,
        applicantCount: 32,
      },
      {
        title: "Data Analyst",
        department: "Analytics",
        location: "Austin, TX",
        type: "full-time",
        status: "open",
        description: "We are looking for a Data Analyst to help us unlock insights from our growing data assets. You will build dashboards, perform ad-hoc analyses, and collaborate with cross-functional teams to support data-driven decision making across the organization.",
        requirements: "3+ years of experience in data analysis, proficiency in SQL and Python/R, experience with BI tools (Tableau, Looker, or Power BI), strong statistical analysis skills, experience with ETL processes.",
        salaryMin: 75000,
        salaryMax: 100000,
        applicantCount: 15,
      },
      {
        title: "UX Designer",
        department: "Design",
        location: "Remote",
        type: "full-time",
        status: "closed",
        description: "We are seeking a talented UX Designer to create intuitive and delightful user experiences for our suite of HR tools. You will conduct user research, create wireframes and prototypes, and collaborate closely with engineering to bring designs to life.",
        requirements: "4+ years of UX design experience, proficiency in Figma and design systems, experience conducting user research and usability testing, strong portfolio demonstrating end-to-end design process, experience with accessibility standards.",
        salaryMin: 90000,
        salaryMax: 120000,
        applicantCount: 41,
      },
      {
        title: "DevOps Engineer",
        department: "Engineering",
        location: "San Francisco, CA",
        type: "full-time",
        status: "open",
        description: "We are looking for a DevOps Engineer to help us build and maintain our cloud infrastructure. You will design CI/CD pipelines, manage Kubernetes clusters, and implement monitoring and alerting systems to ensure high availability.",
        requirements: "5+ years of DevOps/SRE experience, strong knowledge of AWS or GCP, experience with Kubernetes and container orchestration, proficiency in Terraform or Pulumi, experience with monitoring tools (Datadog, Prometheus, Grafana).",
        salaryMin: 105000,
        salaryMax: 135000,
        applicantCount: 12,
      },
      {
        title: "Marketing Coordinator",
        department: "Marketing",
        location: "New York, NY",
        type: "full-time",
        status: "open",
        description: "We are hiring a Marketing Coordinator to support our growing marketing team. You will assist with campaign execution, content creation, event coordination, and help maintain our brand presence across multiple channels.",
        requirements: "2+ years of marketing or communications experience, experience with social media management tools, strong writing and editing skills, basic graphic design skills, detail-oriented and highly organized.",
        salaryMin: 55000,
        salaryMax: 70000,
        applicantCount: 28,
      },
      {
        title: "Financial Analyst",
        department: "Finance",
        location: "New York, NY",
        type: "full-time",
        status: "draft",
        description: "We are seeking a Financial Analyst to join our Finance team. You will be responsible for financial modeling, budgeting, forecasting, and providing actionable insights to support strategic business decisions.",
        requirements: "3+ years of financial analysis experience, advanced proficiency in Excel and financial modeling, experience with ERP systems, strong understanding of GAAP, CFA Level 1 or higher preferred.",
        salaryMin: 70000,
        salaryMax: 95000,
        applicantCount: 0,
      },
    ];

    for (const job of jobListings) {
      await db.jobListing.create({
        data: {
          ...job,
          companyId: company.id,
        },
      });
    }

    // Create audit log entries
    const auditActions = [
      { userId: employees[0].id, action: "Payroll processed", module: "payroll", details: JSON.stringify({ periodId: payrollPeriod.id, totalEmployees: employees.length, totalGross: totalGrossPay }) },
      { userId: employees[1].id, action: "PTO request approved", module: "pto", details: JSON.stringify({ requestType: "vacation", employeeId: employees[3].id }) },
      { userId: employees[2].id, action: "Employee profile updated", module: "employee", details: JSON.stringify({ employeeId: employees[4].id }) },
    ];
    for (const audit of auditActions) {
      await db.auditLog.create({ data: audit });
    }

    // Create notifications for employees
    for (const emp of employees) {
      await db.notification.create({
        data: {
          userId: emp.id,
          title: "Payroll Processed",
          message: `Your payroll for ${periodStart.toLocaleDateString("en-US", { month: "short" })} has been processed and paid.`,
          type: "success",
          link: "/payroll",
        },
      });
    }

    // Create performance reviews
    const performanceReviews = [
      // Completed reviews
      {
        employeeId: employees[3].id,  // Priya Patel
        reviewerId: employees[2].id,  // Marcus Williams (manager)
        cycleName: "Q4 2025 Review",
        status: "completed",
        rating: 4.5,
        strengths: "Exceptional problem-solving skills and ability to lead complex technical initiatives. Priya consistently delivers high-quality code ahead of deadlines and has been instrumental in optimizing our database queries, reducing response times by 40%. She actively mentors junior developers and contributes valuable ideas in sprint planning.",
        improvements: "Could benefit from more experience in stakeholder communication and presenting technical concepts to non-technical audiences. Sometimes takes on too much work individually instead of delegating to team members.",
        goals: "Lead the upcoming API migration project, complete AWS Solutions Architect certification, and present at least one technical talk at a company all-hands meeting.",
        overallComment: "Priya is one of our top performers in the Engineering department. Her technical depth and dedication to code quality make her an invaluable asset. She is well on track for a senior promotion in the next cycle.",
        reviewedAt: new Date("2025-12-15"),
      },
      {
        employeeId: employees[4].id,  // James O'Brien
        reviewerId: employees[2].id,  // Marcus Williams
        cycleName: "Q4 2025 Review",
        status: "completed",
        rating: 4.0,
        strengths: "Strong frontend development skills with an eye for UI/UX design. James rebuilt the customer dashboard component, resulting in a 25% increase in user engagement. He is collaborative, always willing to help teammates debug issues, and maintains excellent documentation.",
        improvements: "Needs to improve test coverage — current project tests are at 60% versus the team target of 80%. Also should work on reducing context-switching by better estimating task complexity upfront.",
        goals: "Achieve 80% test coverage on the customer dashboard project, learn TypeScript advanced patterns, and contribute to the design system component library.",
        overallComment: "James is a solid contributor who brings both technical skill and creative vision to the team. With improved testing practices, he has the potential to take on more architectural responsibilities.",
        reviewedAt: new Date("2025-12-18"),
      },
      {
        employeeId: employees[7].id,  // Emma Thompson
        reviewerId: employees[6].id,  // David Kim (manager)
        cycleName: "Q4 2025 Review",
        status: "completed",
        rating: 4.8,
        strengths: "Outstanding creativity and marketing instincts. Emma's social media campaign for the Q4 product launch generated 3x more engagement than any previous campaign. She is data-driven, continuously A/B testing creative approaches, and has built strong relationships with our design and content teams.",
        improvements: "While her creative work is top-notch, Emma could improve her project management skills for multi-campaign timelines. Learning to use project management tools more effectively would help her coordinate better across teams.",
        goals: "Lead the brand refresh initiative for 2026, complete Google Analytics certification, and develop a comprehensive content calendar system for the marketing team.",
        overallComment: "Emma is an exceptional marketer who consistently exceeds expectations. Her ability to blend creativity with analytics is rare and highly valuable. She is a strong candidate for promotion to Senior Marketing Specialist.",
        reviewedAt: new Date("2025-12-20"),
      },
      {
        employeeId: employees[5].id,  // Maria Garcia
        reviewerId: employees[0].id,  // Alex Rivera (admin)
        cycleName: "Q4 2025 Review",
        status: "completed",
        rating: 3.5,
        strengths: "Reliable and detail-oriented in all financial reporting tasks. Maria has maintained 100% accuracy in monthly close reports for the past 6 months. She is proactive in identifying discrepancies and works well under tight deadlines during audit periods.",
        improvements: "Needs to develop stronger skills in financial forecasting and budget planning. Currently relies heavily on templates and would benefit from learning advanced Excel modeling and financial analysis techniques.",
        goals: "Complete the CFA Level 1 exam, take lead on the annual budget preparation process, and shadow the Senior Financial Analyst for strategic planning sessions.",
        overallComment: "Maria is a dependable team member who takes pride in accuracy and compliance. To advance, she needs to broaden her skill set beyond operational reporting into strategic financial analysis.",
        reviewedAt: new Date("2025-12-22"),
      },
      {
        employeeId: employees[12].id, // Noah Martinez
        reviewerId: employees[2].id,  // Marcus Williams
        cycleName: "Q4 2025 Review",
        status: "completed",
        rating: 3.8,
        strengths: "Noah has grown significantly as a backend developer this quarter. He successfully implemented the new caching layer that reduced API response times by 35%. His code reviews are thorough and constructive, and he has become a go-to person for debugging complex issues.",
        improvements: "Should work on being more proactive in architectural discussions. Sometimes waits for direction rather than proposing solutions independently. Public speaking and presentation skills could also use development.",
        goals: "Design and implement the microservices communication layer, present a tech talk at the engineering team meeting, and mentor one junior developer.",
        overallComment: "Noah has shown impressive growth this quarter and is becoming a key technical contributor. With more confidence in proposing architectural solutions, he will be ready for senior-level responsibilities.",
        reviewedAt: new Date("2025-12-28"),
      },
      // In-progress reviews
      {
        employeeId: employees[9].id,  // Aisha Johnson
        reviewerId: employees[6].id,  // David Kim
        cycleName: "Q1 2026 Review",
        status: "in_progress",
        rating: null,
        strengths: null,
        improvements: null,
        goals: null,
        overallComment: null,
        reviewedAt: null,
      },
      {
        employeeId: employees[8].id,  // Carlos Rodriguez
        reviewerId: employees[6].id,  // David Kim
        cycleName: "Q1 2026 Review",
        status: "in_progress",
        rating: 4.2,
        strengths: "Carlos has exceeded his sales quota by 15% this quarter. His relationship-building skills with key accounts have been exceptional, securing two major enterprise deals worth over $500K combined.",
        improvements: null,
        goals: null,
        overallComment: null,
        reviewedAt: null,
      },
      {
        employeeId: employees[10].id, // Liam Turner
        reviewerId: employees[0].id,  // Alex Rivera
        cycleName: "Q1 2026 Review",
        status: "in_progress",
        rating: null,
        strengths: null,
        improvements: null,
        goals: null,
        overallComment: null,
        reviewedAt: null,
      },
      // Pending reviews
      {
        employeeId: employees[11].id, // Sophia Lee
        reviewerId: employees[0].id,  // Alex Rivera
        cycleName: "Q1 2026 Review",
        status: "pending",
        rating: null,
        strengths: null,
        improvements: null,
        goals: null,
        overallComment: null,
        reviewedAt: null,
      },
      {
        employeeId: employees[13].id, // Olivia Brown (HR manager)
        reviewerId: employees[0].id,  // Alex Rivera
        cycleName: "Q1 2026 Review",
        status: "pending",
        rating: null,
        strengths: null,
        improvements: null,
        goals: null,
        overallComment: null,
        reviewedAt: null,
      },
    ];

    for (const review of performanceReviews) {
      await db.performanceReview.create({ data: review });
    }

    return NextResponse.json({
      success: true,
      message: "Database seeded successfully",
      stats: {
        company: company.name,
        departments: departments.length,
        employees: employees.length,
        geofences: 3,
        attendanceRecords: attendanceRecords.length,
        shifts: shifts.length,
        announcements: announcementData.length,
        ptoRequests: ptoData.length,
        payrollRecords: employees.length,
        performanceReviews: performanceReviews.length,
        jobListings: jobListings.length,
        totalGrossPay: Math.round(totalGrossPay * 100) / 100,
        totalNetPay: Math.round(totalNetPay * 100) / 100,
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
