import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/announcements - List published announcements
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");

    const where: Record<string, unknown> = { isPublished: true };

    if (category && category !== "all") {
      where.category = category;
    }

    // Filter out expired announcements
    where.expiresAt = { gt: new Date() } as { gt: Date } | null;
    // But also include announcements without expiry
    const announcements = await db.announcement.findMany({
      where: {
        isPublished: true,
        ...(category && category !== "all" ? { category } : {}),
        ...(category && category !== "all" ? {} : {}),
      },
      orderBy: [
        { isPinned: "desc" },
        { createdAt: "desc" },
      ],
    });

    // Post-filter expired announcements
    const filtered = announcements.filter((a) => {
      if (a.expiresAt && new Date(a.expiresAt) < new Date()) return false;
      return true;
    });

    return NextResponse.json({ announcements: filtered });
  } catch (error) {
    console.error("Error fetching announcements:", error);
    return NextResponse.json(
      { error: "Failed to fetch announcements" },
      { status: 500 }
    );
  }
}

// POST /api/announcements - Create a new announcement
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, content, category, priority, authorId, isPinned, isPublished, expiresAt, companyId } = body;

    if (!title || !content || !authorId || !companyId) {
      return NextResponse.json(
        { error: "Missing required fields: title, content, authorId, companyId" },
        { status: 400 }
      );
    }

    const announcement = await db.announcement.create({
      data: {
        title,
        content,
        category: category || "general",
        priority: priority || "normal",
        authorId,
        isPinned: isPinned || false,
        isPublished: isPublished !== undefined ? isPublished : true,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        companyId,
      },
    });

    return NextResponse.json({ announcement }, { status: 201 });
  } catch (error) {
    console.error("Error creating announcement:", error);
    return NextResponse.json(
      { error: "Failed to create announcement" },
      { status: 500 }
    );
  }
}

// PUT /api/announcements - Update an announcement
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, title, content, category, priority, isPinned, isPublished, expiresAt } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Announcement id is required" },
        { status: 400 }
      );
    }

    const announcement = await db.announcement.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(content !== undefined && { content }),
        ...(category !== undefined && { category }),
        ...(priority !== undefined && { priority }),
        ...(isPinned !== undefined && { isPinned }),
        ...(isPublished !== undefined && { isPublished }),
        ...(expiresAt !== undefined && { expiresAt: expiresAt ? new Date(expiresAt) : null }),
      },
    });

    return NextResponse.json({ announcement });
  } catch (error) {
    console.error("Error updating announcement:", error);
    return NextResponse.json(
      { error: "Failed to update announcement" },
      { status: 500 }
    );
  }
}

// DELETE /api/announcements - Delete an announcement
export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Announcement id is required" },
        { status: 400 }
      );
    }

    await db.announcement.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting announcement:", error);
    return NextResponse.json(
      { error: "Failed to delete announcement" },
      { status: 500 }
    );
  }
}
