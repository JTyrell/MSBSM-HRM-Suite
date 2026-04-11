import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/performance-reviews - Return all reviews with employee and reviewer names
export async function GET() {
  try {
    const reviews = await db.performanceReview.findMany({
      include: {
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
            departmentId: true,
            department: {
              select: { name: true, code: true },
            },
          },
        },
        reviewer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ reviews });
  } catch (error) {
    console.error("Error fetching performance reviews:", error);
    return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 });
  }
}

// POST /api/performance-reviews - Create a new review
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      employeeId,
      reviewerId,
      cycleName,
      status = "pending",
      rating,
      strengths,
      improvements,
      goals,
      overallComment,
    } = body;

    if (!employeeId || !reviewerId || !cycleName) {
      return NextResponse.json(
        { error: "employeeId, reviewerId, and cycleName are required" },
        { status: 400 }
      );
    }

    // Validate rating range
    if (rating !== undefined && rating !== null && (rating < 1 || rating > 5)) {
      return NextResponse.json(
        { error: "Rating must be between 1.0 and 5.0" },
        { status: 400 }
      );
    }

    const review = await db.performanceReview.create({
      data: {
        employeeId,
        reviewerId,
        cycleName,
        status,
        rating: rating ?? null,
        strengths: strengths ?? null,
        improvements: improvements ?? null,
        goals: goals ?? null,
        overallComment: overallComment ?? null,
        reviewedAt: status === "completed" ? new Date() : null,
      },
      include: {
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
            departmentId: true,
            department: {
              select: { name: true, code: true },
            },
          },
        },
        reviewer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
          },
        },
      },
    });

    return NextResponse.json({ review }, { status: 201 });
  } catch (error) {
    console.error("Error creating performance review:", error);
    return NextResponse.json({ error: "Failed to create review" }, { status: 500 });
  }
}

// PUT /api/performance-reviews - Update a review
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, ...data } = body;

    if (!id) {
      return NextResponse.json({ error: "Review id is required" }, { status: 400 });
    }

    // Validate rating range if provided
    if (data.rating !== undefined && data.rating !== null && (data.rating < 1 || data.rating > 5)) {
      return NextResponse.json(
        { error: "Rating must be between 1.0 and 5.0" },
        { status: 400 }
      );
    }

    const review = await db.performanceReview.update({
      where: { id },
      data: {
        ...data,
        reviewedAt: data.status === "completed" ? new Date() : data.reviewedAt ?? undefined,
      },
      include: {
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
            departmentId: true,
            department: {
              select: { name: true, code: true },
            },
          },
        },
        reviewer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
          },
        },
      },
    });

    return NextResponse.json({ review });
  } catch (error) {
    console.error("Error updating performance review:", error);
    return NextResponse.json({ error: "Failed to update review" }, { status: 500 });
  }
}

// DELETE /api/performance-reviews - Delete a review
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Review id is required" }, { status: 400 });
    }

    await db.performanceReview.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting performance review:", error);
    return NextResponse.json({ error: "Failed to delete review" }, { status: 500 });
  }
}
