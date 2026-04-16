import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET /api/jobs
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const department = searchParams.get("department");
    const supabase = await createClient();

    let query = supabase
      .from("job_listings")
      .select("*")
      .order("created_at", { ascending: false });

    if (status && status !== "all") query = query.eq("status", status);
    if (department && department !== "all") query = query.eq("department", department);

    const { data: jobs, error } = await query;
    if (error) throw error;
    return NextResponse.json({ jobs: jobs || [] });
  } catch (error) {
    console.error("Error fetching job listings:", error);
    return NextResponse.json({ error: "Failed to fetch job listings" }, { status: 500 });
  }
}

// POST /api/jobs
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const supabase = await createClient();

    const { data: job, error } = await supabase
      .from("job_listings")
      .insert({
        title: body.title,
        department: body.department,
        location: body.location,
        type: body.type || "full-time",
        status: body.status || "open",
        description: body.description || "",
        requirements: body.requirements || "",
        salary_min: body.salaryMin ?? body.salary_min ?? null,
        salary_max: body.salaryMax ?? body.salary_max ?? null,
        company_id: body.companyId || body.company_id || "00000000-0000-0000-0000-000000000001",
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ job }, { status: 201 });
  } catch (error) {
    console.error("Error creating job listing:", error);
    return NextResponse.json({ error: "Failed to create job listing" }, { status: 500 });
  }
}

// PUT /api/jobs?id=xxx
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Job listing ID is required" }, { status: 400 });

    const body = await request.json();
    const supabase = await createClient();

    const updateData: Record<string, unknown> = {};
    if (body.title !== undefined) updateData.title = body.title;
    if (body.department !== undefined) updateData.department = body.department;
    if (body.location !== undefined) updateData.location = body.location;
    if (body.type !== undefined) updateData.type = body.type;
    if (body.status !== undefined) updateData.status = body.status;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.requirements !== undefined) updateData.requirements = body.requirements;
    if (body.salaryMin !== undefined || body.salary_min !== undefined) updateData.salary_min = body.salaryMin ?? body.salary_min;
    if (body.salaryMax !== undefined || body.salary_max !== undefined) updateData.salary_max = body.salaryMax ?? body.salary_max;
    if (body.applicantCount !== undefined || body.applicant_count !== undefined) updateData.applicant_count = body.applicantCount ?? body.applicant_count;

    const { data: job, error } = await supabase
      .from("job_listings")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ job });
  } catch (error) {
    console.error("Error updating job listing:", error);
    return NextResponse.json({ error: "Failed to update job listing" }, { status: 500 });
  }
}

// DELETE /api/jobs?id=xxx
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Job listing ID is required" }, { status: 400 });

    const supabase = await createClient();
    const { error } = await supabase.from("job_listings").delete().eq("id", id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting job listing:", error);
    return NextResponse.json({ error: "Failed to delete job listing" }, { status: 500 });
  }
}
