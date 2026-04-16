import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET /api/geofences
export async function GET() {
  try {
    const supabase = await createClient();
    const { data: geofences, error } = await supabase
      .from("geofences")
      .select("*, department:departments(id, name, code)")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return NextResponse.json({ geofences: geofences || [] });
  } catch (error) {
    console.error("Error fetching geofences:", error);
    return NextResponse.json({ error: "Failed to fetch geofences" }, { status: 500 });
  }
}

// POST /api/geofences
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const supabase = await createClient();

    const { data: geofence, error } = await supabase
      .from("geofences")
      .insert({
        name: body.name,
        address: body.address || null,
        type: body.type || "office",
        center_lat: parseFloat(body.centerLat || body.center_lat),
        center_lng: parseFloat(body.centerLng || body.center_lng),
        radius: parseFloat(body.radius) || 200,
        is_active: true,
        company_id: body.companyId || body.company_id || "00000000-0000-0000-0000-000000000001",
        department_id: body.departmentId || body.department_id || null,
        polygon: body.polygon || {},
      })
      .select("*, department:departments(id, name, code)")
      .single();

    if (error) throw error;
    return NextResponse.json({ geofence }, { status: 201 });
  } catch (error) {
    console.error("Error creating geofence:", error);
    return NextResponse.json({ error: "Failed to create geofence" }, { status: 500 });
  }
}

// PUT /api/geofences
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...data } = body;
    if (!id) return NextResponse.json({ error: "Geofence ID is required" }, { status: 400 });

    const supabase = await createClient();
    const updateData: Record<string, unknown> = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.address !== undefined) updateData.address = data.address;
    if (data.type !== undefined) updateData.type = data.type;
    if (data.centerLat || data.center_lat) updateData.center_lat = parseFloat(data.centerLat || data.center_lat);
    if (data.centerLng || data.center_lng) updateData.center_lng = parseFloat(data.centerLng || data.center_lng);
    if (data.radius) updateData.radius = parseFloat(data.radius);
    if (data.isActive !== undefined || data.is_active !== undefined) updateData.is_active = data.isActive ?? data.is_active;
    if (data.polygon !== undefined) updateData.polygon = data.polygon;
    if (data.departmentId || data.department_id) updateData.department_id = data.departmentId || data.department_id;

    const { data: geofence, error } = await supabase
      .from("geofences")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ geofence });
  } catch (error) {
    console.error("Error updating geofence:", error);
    return NextResponse.json({ error: "Failed to update geofence" }, { status: 500 });
  }
}

// DELETE /api/geofences?id=xxx
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Geofence ID is required" }, { status: 400 });

    const supabase = await createClient();
    const { error } = await supabase.from("geofences").delete().eq("id", id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting geofence:", error);
    return NextResponse.json({ error: "Failed to delete geofence" }, { status: 500 });
  }
}
