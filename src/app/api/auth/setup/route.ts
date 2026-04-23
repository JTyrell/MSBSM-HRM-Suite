import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

// POST /api/auth/setup — Initial admin setup (one-time)
// Creates the first admin user in Supabase Auth + employees table.
// This route is only accessible when no employees exist in the system.
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      first_name,
      last_name,
      email,
      password,
      phone,
    } = body;

    if (!first_name || !last_name || !email || !password) {
      return NextResponse.json(
        { error: "first_name, last_name, email, and password are required" },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // Check if any employees already exist (setup already done)
    const { count } = await supabase
      .from("employees")
      .select("id", { count: "exact", head: true });

    if (count && count > 0) {
      return NextResponse.json(
        { error: "Initial setup has already been completed. Use the admin panel to add users." },
        { status: 409 }
      );
    }

    // Create Supabase Auth user
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm the admin user
      user_metadata: {
        first_name,
        last_name,
        role: "admin",
      },
    });

    if (authError) {
      console.error("Auth user creation error:", authError);
      return NextResponse.json(
        { error: `Failed to create auth user: ${authError.message}` },
        { status: 500 }
      );
    }

    // Create employee record linked to the auth user
    const { data: employee, error: empError } = await supabase
      .from("employees")
      .insert({
        employee_id: "EMP-0001",
        first_name,
        last_name,
        email,
        phone: phone || null,
        role: "admin",
        role_tier: "executive",
        status: "active",
        hire_date: new Date().toISOString().split("T")[0],
        department_id: "00000000-0000-0000-0000-000000000017", // Office of the Executive Director
        company_id: "00000000-0000-0000-0000-000000000001",
        pay_type: "salary",
        pay_rate: 0,
        contract_type: "permanent",
        paye_tax_code: "A",
        auth_user_id: authUser.user.id,
      })
      .select()
      .single();

    if (empError) {
      console.error("Employee creation error:", empError);
      // Rollback: delete the auth user
      await supabase.auth.admin.deleteUser(authUser.user.id);
      return NextResponse.json(
        { error: `Failed to create employee record: ${empError.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Admin account created successfully. You can now log in.",
      employee: {
        id: employee.id,
        employee_id: employee.employee_id,
        name: `${first_name} ${last_name}`,
        email,
        role: "admin",
      },
    }, { status: 201 });
  } catch (error) {
    console.error("Setup error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred during setup" },
      { status: 500 }
    );
  }
}

// GET /api/auth/setup — Check if initial setup is needed
export async function GET() {
  try {
    const supabase = createAdminClient();

    const { count } = await supabase
      .from("employees")
      .select("id", { count: "exact", head: true });

    return NextResponse.json({
      setup_required: !count || count === 0,
      employee_count: count || 0,
    });
  } catch {
    return NextResponse.json({
      setup_required: true,
      employee_count: 0,
    });
  }
}
