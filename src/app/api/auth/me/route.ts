import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET /api/auth/me — Get current authenticated user + employee data
export async function GET() {
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    // Get linked employee record
    const { data: employee, error: empError } = await supabase
      .from("employees")
      .select(`
        *,
        department:departments(id, name, code),
        work_location:geofences(id, name, address, center_lat, center_lng)
      `)
      .eq("auth_user_id", user.id)
      .single();

    if (empError || !employee) {
      return NextResponse.json(
        { error: "Employee record not found for this user" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      user: {
        auth_id: user.id,
        email: user.email,
      },
      employee,
    });
  } catch (error) {
    console.error("Auth me error:", error);
    return NextResponse.json(
      { error: "Failed to get user info" },
      { status: 500 }
    );
  }
}
