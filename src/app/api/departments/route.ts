import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET /api/departments
export async function GET() {
  try {
    const supabase = await createClient();

    const { data: departments, error } = await supabase
      .from("departments")
      .select("*, employees(id), geofences(id)")
      .order("name");

    if (error) throw error;

    // Transform to include counts (matching Prisma _count format)
    const transformed = (departments || []).map((d: any) => ({
      ...d,
      _count: {
        employees: d.employees?.length || 0,
        geofences: d.geofences?.length || 0,
      },
      employees: undefined,
      geofences: undefined,
    }));

    return NextResponse.json({ departments: transformed });
  } catch (error) {
    console.error("Error fetching departments:", error);
    return NextResponse.json({ error: "Failed to fetch departments" }, { status: 500 });
  }
}

// POST /api/departments
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, code, description } = body;
    const supabase = await createClient();

    const { data: department, error } = await supabase
      .from("departments")
      .insert({
        name,
        code,
        description: description || null,
        company_id: "00000000-0000-0000-0000-000000000001",
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ department }, { status: 201 });
  } catch (error) {
    console.error("Error creating department:", error);
    return NextResponse.json({ error: "Failed to create department" }, { status: 500 });
  }
}

// DELETE /api/departments?id=xxx
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

    const supabase = await createClient();
    const { error } = await supabase.from("departments").delete().eq("id", id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting department:", error);
    return NextResponse.json({ error: "Failed to delete department" }, { status: 500 });
  }
}
