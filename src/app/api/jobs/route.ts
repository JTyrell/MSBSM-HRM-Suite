import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/jobs - Get all job listings with optional filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const department = searchParams.get("department");

    const where: Record<string, unknown> = {};
    if (status && status !== "all") {
      where.status = status;
    }
    if (department && department !== "all") {
      where.department = department;
    }

    const jobs = await db.jobListing.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ jobs });
  } catch (error) {
    console.error("Error fetching job listings:", error);
    return NextResponse.json({ error: "Failed to fetch job listings" }, { status: 500 });
  }
}

// POST /api/jobs - Create a new job listing
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, department, location, type, status, description, requirements, salaryMin, salaryMax, companyId } = body;

    if (!title || !department || !location || !companyId) {
      return NextResponse.json({ error: "Missing required fields: title, department, location, companyId" }, { status: 400 });
    }

    const job = await db.jobListing.create({
      data: {
        title,
        department,
        location,
        type: type || "full-time",
        status: status || "open",
        description: description || "",
        requirements: requirements || "",
        salaryMin: salaryMin ?? null,
        salaryMax: salaryMax ?? null,
        companyId,
      },
    });

    return NextResponse.json({ job }, { status: 201 });
  } catch (error) {
    console.error("Error creating job listing:", error);
    return NextResponse.json({ error: "Failed to create job listing" }, { status: 500 });
  }
}

// PUT /api/jobs?id=xxx - Update a job listing
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Job listing ID is required" }, { status: 400 });
    }

    const body = await request.json();
    const { title, department, location, type, status, description, requirements, salaryMin, salaryMax, applicantCount } = body;

    const job = await db.jobListing.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(department !== undefined && { department }),
        ...(location !== undefined && { location }),
        ...(type !== undefined && { type }),
        ...(status !== undefined && { status }),
        ...(description !== undefined && { description }),
        ...(requirements !== undefined && { requirements }),
        ...(salaryMin !== undefined && { salaryMin: salaryMin ?? null }),
        ...(salaryMax !== undefined && { salaryMax: salaryMax ?? null }),
        ...(applicantCount !== undefined && { applicantCount }),
      },
    });

    return NextResponse.json({ job });
  } catch (error) {
    console.error("Error updating job listing:", error);
    return NextResponse.json({ error: "Failed to update job listing" }, { status: 500 });
  }
}

// DELETE /api/jobs?id=xxx - Delete a job listing
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Job listing ID is required" }, { status: 400 });
    }

    await db.jobListing.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting job listing:", error);
    return NextResponse.json({ error: "Failed to delete job listing" }, { status: 500 });
  }
}
