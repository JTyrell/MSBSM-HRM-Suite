import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET /api/messages — Get messages for a channel
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const channelId = searchParams.get("channelId");
    const type = searchParams.get("type") || "messages";
    const supabase = await createClient();

    if (type === "channels") {
      const { data, error } = await supabase
        .from("channels")
        .select("*, created_by_employee:employees!channels_created_by_fkey(id, first_name, last_name), department:departments(id, name)")
        .eq("is_archived", false)
        .order("created_at");

      if (error) throw error;
      return NextResponse.json({ channels: data || [] });
    }

    if (!channelId) {
      return NextResponse.json({ error: "channelId is required" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("messages")
      .select("*, sender:employees(id, first_name, last_name, avatar, role)")
      .eq("channel_id", channelId)
      .eq("is_deleted", false)
      .order("created_at")
      .limit(100);

    if (error) throw error;
    return NextResponse.json({ messages: data || [] });
  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 });
  }
}

// POST /api/messages — Send a message or create a channel
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type } = body;
    const supabase = await createClient();

    if (type === "channel") {
      const { data, error } = await supabase
        .from("channels")
        .insert({
          name: body.name,
          description: body.description || null,
          type: body.channel_type || "department",
          department_id: body.department_id || null,
          company_id: body.company_id || "00000000-0000-0000-0000-000000000001",
          created_by: body.created_by,
        })
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json({ channel: data }, { status: 201 });
    }

    // Default: send a message
    const { data, error } = await supabase
      .from("messages")
      .insert({
        channel_id: body.channel_id,
        sender_id: body.sender_id,
        content: body.content,
        type: body.message_type || "text",
        reply_to: body.reply_to || null,
      })
      .select("*, sender:employees(id, first_name, last_name, avatar, role)")
      .single();

    if (error) throw error;
    return NextResponse.json({ message: data }, { status: 201 });
  } catch (error) {
    console.error("Error sending message:", error);
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}

// PUT /api/messages — Edit or delete a message
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, content, is_deleted } = body;
    if (!id) return NextResponse.json({ error: "Message ID is required" }, { status: 400 });

    const supabase = await createClient();

    const updateData: Record<string, unknown> = {};
    if (content !== undefined) {
      updateData.content = content;
      updateData.is_edited = true;
    }
    if (is_deleted !== undefined) updateData.is_deleted = is_deleted;

    const { data, error } = await supabase
      .from("messages")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ message: data });
  } catch (error) {
    console.error("Error updating message:", error);
    return NextResponse.json({ error: "Failed to update message" }, { status: 500 });
  }
}
