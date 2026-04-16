import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// POST /api/seed — Admin-only: check if setup is complete
// In production this is replaced by the /api/auth/setup flow.
// Kept for backward compatibility during transition.
export async function POST() {
  try {
    const supabase = await createClient();

    // Check if employees exist
    const { data: employees, error } = await supabase
      .from("employees")
      .select("*, department:departments(id, name, code), work_location:geofences(id, name)")
      .order("created_at");

    if (error) throw error;

    if (!employees || employees.length === 0) {
      return NextResponse.json({
        message: "No employees found. Use /api/auth/setup to create the initial admin, or /login for the setup wizard.",
        employees: [],
        setup_required: true,
      });
    }

    return NextResponse.json({
      message: "System already initialized",
      employees,
      setup_required: false,
    });
  } catch (error) {
    console.error("Seed check error:", error);
    return NextResponse.json({
      message: "Database connection failed. Ensure Supabase is configured.",
      employees: [],
      setup_required: true,
    });
  }
}
