import { NextRequest, NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";

// POST /api/auth/login — Sign in with employee ID + password
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { employee_id, password } = body;

    if (!employee_id || !password) {
      return NextResponse.json(
        { error: "Employee ID and password are required" },
        { status: 400 }
      );
    }

    // Use admin client for employee lookup — the user has no session yet,
    // so the cookie-based client would be blocked by RLS.
    const adminSupabase = createAdminClient();

    // Look up the employee's email by their employee_id
    const { data: employee, error: lookupError } = await adminSupabase
      .from("employees")
      .select("email, first_name, last_name, role, status")
      .eq("employee_id", employee_id.toUpperCase())
      .single();

    if (lookupError || !employee) {
      return NextResponse.json(
        { error: "Invalid Employee ID or password" },
        { status: 401 }
      );
    }

    if (employee.status === "terminated" || employee.status === "inactive") {
      return NextResponse.json(
        { error: "This account has been deactivated. Contact HR." },
        { status: 403 }
      );
    }

    // Use cookie-based client for sign-in so the session gets persisted in cookies
    const supabase = await createClient();

    // Sign in with Supabase Auth using the employee's email
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: employee.email,
      password,
    });

    if (authError) {
      return NextResponse.json(
        { error: "Invalid Employee ID or password" },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: authData.user.id,
        email: authData.user.email,
        employee_id,
        name: `${employee.first_name} ${employee.last_name}`,
        role: employee.role,
      },
      session: authData.session,
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
