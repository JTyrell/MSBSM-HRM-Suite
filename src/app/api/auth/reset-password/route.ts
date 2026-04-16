import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// POST /api/auth/reset-password — Request password reset magic link
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: "Email address is required" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Verify this email belongs to an active employee
    const { data: employee } = await supabase
      .from("employees")
      .select("id, employee_id, status")
      .eq("email", email.toLowerCase())
      .single();

    if (!employee) {
      // Don't reveal whether the email exists (security)
      return NextResponse.json({
        success: true,
        message: "If an account exists with this email, a password reset link has been sent.",
      });
    }

    if (employee.status === "terminated") {
      return NextResponse.json(
        { error: "This account has been deactivated. Contact HR." },
        { status: 403 }
      );
    }

    // Send password reset email via Supabase Auth
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${request.nextUrl.origin}/reset-password`,
    });

    if (error) {
      console.error("Password reset error:", error);
      return NextResponse.json(
        { error: "Failed to send reset email. Try again later." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "If an account exists with this email, a password reset link has been sent.",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
