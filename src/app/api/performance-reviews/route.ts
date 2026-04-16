import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET /api/performance-reviews
export async function GET() {
  try {
    const supabase = await createClient();
    const { data: reviews, error } = await supabase
      .from("performance_reviews")
      .select(`
        *,
        employee:employees!performance_reviews_employee_id_fkey(
          id, first_name, last_name, email, role, department_id,
          department:departments(name, code)
        ),
        reviewer:employees!performance_reviews_reviewer_id_fkey(
          id, first_name, last_name, email, role
        )
      `)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return NextResponse.json({ reviews: reviews || [] });
  } catch (error) {
    console.error("Error fetching performance reviews:", error);
    return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 });
  }
}

// POST /api/performance-reviews
export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.employeeId && !body.employee_id) {
      return NextResponse.json({ error: "employeeId is required" }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: review, error } = await supabase
      .from("performance_reviews")
      .insert({
        employee_id: body.employeeId || body.employee_id,
        reviewer_id: body.reviewerId || body.reviewer_id,
        cycle_name: body.cycleName || body.cycle_name,
        status: body.status || "pending",
        rating: body.rating ?? null,
        strengths: body.strengths ?? null,
        improvements: body.improvements ?? null,
        goals: body.goals ?? null,
        overall_comment: body.overallComment || body.overall_comment || null,
        reviewed_at: body.status === "completed" ? new Date().toISOString() : null,
      })
      .select(`
        *,
        employee:employees!performance_reviews_employee_id_fkey(id, first_name, last_name, email, role, department_id, department:departments(name, code)),
        reviewer:employees!performance_reviews_reviewer_id_fkey(id, first_name, last_name, email, role)
      `)
      .single();

    if (error) throw error;
    return NextResponse.json({ review }, { status: 201 });
  } catch (error) {
    console.error("Error creating performance review:", error);
    return NextResponse.json({ error: "Failed to create review" }, { status: 500 });
  }
}

// PUT /api/performance-reviews
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, ...data } = body;
    if (!id) return NextResponse.json({ error: "Review id is required" }, { status: 400 });

    if (data.rating !== undefined && data.rating !== null && (data.rating < 1 || data.rating > 5)) {
      return NextResponse.json({ error: "Rating must be between 1.0 and 5.0" }, { status: 400 });
    }

    const supabase = await createClient();
    const updateData: Record<string, unknown> = {};
    if (data.status !== undefined) updateData.status = data.status;
    if (data.rating !== undefined) updateData.rating = data.rating;
    if (data.strengths !== undefined) updateData.strengths = data.strengths;
    if (data.improvements !== undefined) updateData.improvements = data.improvements;
    if (data.goals !== undefined) updateData.goals = data.goals;
    if (data.overallComment !== undefined || data.overall_comment !== undefined) {
      updateData.overall_comment = data.overallComment ?? data.overall_comment;
    }
    if (data.status === "completed") updateData.reviewed_at = new Date().toISOString();

    const { data: review, error } = await supabase
      .from("performance_reviews")
      .update(updateData)
      .eq("id", id)
      .select(`
        *,
        employee:employees!performance_reviews_employee_id_fkey(id, first_name, last_name, email, role, department_id, department:departments(name, code)),
        reviewer:employees!performance_reviews_reviewer_id_fkey(id, first_name, last_name, email, role)
      `)
      .single();

    if (error) throw error;
    return NextResponse.json({ review });
  } catch (error) {
    console.error("Error updating performance review:", error);
    return NextResponse.json({ error: "Failed to update review" }, { status: 500 });
  }
}

// DELETE /api/performance-reviews
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Review id is required" }, { status: 400 });

    const supabase = await createClient();
    const { error } = await supabase.from("performance_reviews").delete().eq("id", id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting performance review:", error);
    return NextResponse.json({ error: "Failed to delete review" }, { status: 500 });
  }
}
