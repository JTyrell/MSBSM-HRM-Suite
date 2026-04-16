import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET /api/announcements
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const supabase = await createClient();

    let query = supabase
      .from("announcements")
      .select("*, author:employees(id, first_name, last_name)")
      .eq("is_published", true)
      .order("is_pinned", { ascending: false })
      .order("created_at", { ascending: false });

    if (category && category !== "all") query = query.eq("category", category);

    const { data: announcements, error } = await query;
    if (error) throw error;

    // Post-filter expired
    const filtered = (announcements || []).filter((a: any) => {
      if (a.expires_at && new Date(a.expires_at) < new Date()) return false;
      return true;
    });

    return NextResponse.json({ announcements: filtered });
  } catch (error) {
    console.error("Error fetching announcements:", error);
    return NextResponse.json({ error: "Failed to fetch announcements" }, { status: 500 });
  }
}

// POST /api/announcements
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const supabase = await createClient();

    const { data: announcement, error } = await supabase
      .from("announcements")
      .insert({
        title: body.title,
        content: body.content,
        category: body.category || "general",
        priority: body.priority || "normal",
        author_id: body.authorId || body.author_id,
        is_pinned: body.isPinned || body.is_pinned || false,
        is_published: body.isPublished !== undefined ? body.isPublished : (body.is_published !== undefined ? body.is_published : true),
        expires_at: body.expiresAt || body.expires_at || null,
        company_id: body.companyId || body.company_id || "00000000-0000-0000-0000-000000000001",
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ announcement }, { status: 201 });
  } catch (error) {
    console.error("Error creating announcement:", error);
    return NextResponse.json({ error: "Failed to create announcement" }, { status: 500 });
  }
}

// PUT /api/announcements
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, ...data } = body;
    if (!id) return NextResponse.json({ error: "Announcement id is required" }, { status: 400 });

    const supabase = await createClient();
    const updateData: Record<string, unknown> = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.content !== undefined) updateData.content = data.content;
    if (data.category !== undefined) updateData.category = data.category;
    if (data.priority !== undefined) updateData.priority = data.priority;
    if (data.isPinned !== undefined || data.is_pinned !== undefined) updateData.is_pinned = data.isPinned ?? data.is_pinned;
    if (data.isPublished !== undefined || data.is_published !== undefined) updateData.is_published = data.isPublished ?? data.is_published;
    if (data.expiresAt !== undefined || data.expires_at !== undefined) updateData.expires_at = data.expiresAt ?? data.expires_at;

    const { data: announcement, error } = await supabase
      .from("announcements")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ announcement });
  } catch (error) {
    console.error("Error updating announcement:", error);
    return NextResponse.json({ error: "Failed to update announcement" }, { status: 500 });
  }
}

// DELETE /api/announcements
export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const { id } = body;
    if (!id) return NextResponse.json({ error: "Announcement id is required" }, { status: 400 });

    const supabase = await createClient();
    const { error } = await supabase.from("announcements").delete().eq("id", id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting announcement:", error);
    return NextResponse.json({ error: "Failed to delete announcement" }, { status: 500 });
  }
}
