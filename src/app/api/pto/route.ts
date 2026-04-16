import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET /api/pto
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const status = searchParams.get("status");
    const supabase = await createClient();

    let query = supabase
      .from("pto_requests")
      .select("*, employee:employees(id, first_name, last_name, avatar, employee_id)")
      .order("created_at", { ascending: false });

    if (userId) query = query.eq("employee_id", userId);
    if (status) query = query.eq("status", status);

    const { data: requests, error } = await query;
    if (error) throw error;
    return NextResponse.json({ requests: requests || [] });
  } catch (error) {
    console.error("Error fetching PTO requests:", error);
    return NextResponse.json({ error: "Failed to fetch PTO requests" }, { status: 500 });
  }
}

// POST /api/pto
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { employeeId, type, startDate, endDate, reason } = body;
    if (!employeeId || !type || !startDate || !endDate) {
      return NextResponse.json({ error: "employeeId, type, startDate, and endDate are required" }, { status: 400 });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    const daysCount = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    if (daysCount <= 0) return NextResponse.json({ error: "End date must be after start date" }, { status: 400 });

    const supabase = await createClient();

    // Check PTO balance
    const year = start.getFullYear();
    const { data: balance } = await supabase
      .from("pto_balances")
      .select("*")
      .eq("employee_id", employeeId)
      .eq("year", year)
      .single();

    if (balance) {
      const usedMap: Record<string, number> = {
        sick: balance.used_sick, vacation: balance.used_vacation,
        personal: balance.used_personal, other: balance.used_other,
      };
      const available = balance.total_allocated - (usedMap[type] || 0);
      if (available < daysCount) {
        return NextResponse.json({ error: `Insufficient ${type} balance. Available: ${available} days` }, { status: 400 });
      }
    }

    const { data: ptoRequest, error } = await supabase
      .from("pto_requests")
      .insert({
        employee_id: employeeId,
        type, start_date: startDate, end_date: endDate,
        days_count: daysCount, reason: reason || null, status: "pending",
      })
      .select("*, employee:employees(id, first_name, last_name)")
      .single();

    if (error) throw error;

    await supabase.from("notifications").insert({
      user_id: employeeId,
      title: "PTO Request Submitted",
      message: `Your ${type} request for ${daysCount} day(s) has been submitted for approval.`,
      type: "info",
    });

    return NextResponse.json({ request: ptoRequest }, { status: 201 });
  } catch (error) {
    console.error("Error creating PTO request:", error);
    return NextResponse.json({ error: "Failed to create PTO request" }, { status: 500 });
  }
}

// PUT /api/pto - Approve/reject
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status, approvedBy } = body;
    if (!id || !status) return NextResponse.json({ error: "id and status required" }, { status: 400 });

    const supabase = await createClient();

    const { data: ptoRequest, error } = await supabase
      .from("pto_requests")
      .update({
        status,
        approved_by: approvedBy || null,
        approved_at: (status === "approved" || status === "rejected") ? new Date().toISOString() : null,
      })
      .eq("id", id)
      .select("*, employee:employees(id, first_name, last_name)")
      .single();

    if (error) throw error;

    // Update PTO balance if approved
    if (status === "approved" && ptoRequest) {
      const year = new Date(ptoRequest.start_date).getFullYear();
      const typeField = ptoRequest.type === "sick" ? "used_sick"
        : ptoRequest.type === "vacation" ? "used_vacation"
        : ptoRequest.type === "personal" ? "used_personal" : "used_other";

      const { data: existingBalance } = await supabase
        .from("pto_balances")
        .select("*")
        .eq("employee_id", ptoRequest.employee_id)
        .eq("year", year)
        .single();

      if (existingBalance) {
        await supabase.from("pto_balances")
          .update({ [typeField]: (existingBalance as any)[typeField] + ptoRequest.days_count })
          .eq("id", existingBalance.id);
      } else {
        await supabase.from("pto_balances").insert({
          employee_id: ptoRequest.employee_id, year, total_allocated: 20,
          used_sick: typeField === "used_sick" ? ptoRequest.days_count : 0,
          used_vacation: typeField === "used_vacation" ? ptoRequest.days_count : 0,
          used_personal: typeField === "used_personal" ? ptoRequest.days_count : 0,
          used_other: typeField === "used_other" ? ptoRequest.days_count : 0,
        });
      }

      await supabase.from("notifications").insert({
        user_id: ptoRequest.employee_id,
        title: "PTO Request Approved",
        message: `Your ${ptoRequest.type} request for ${ptoRequest.days_count} day(s) has been approved.`,
        type: "success",
      });
    } else if (status === "rejected" && ptoRequest) {
      await supabase.from("notifications").insert({
        user_id: ptoRequest.employee_id,
        title: "PTO Request Rejected",
        message: `Your ${ptoRequest.type} request has been rejected.`,
        type: "warning",
      });
    }

    return NextResponse.json({ request: ptoRequest });
  } catch (error) {
    console.error("Error updating PTO request:", error);
    return NextResponse.json({ error: "Failed to update PTO request" }, { status: 500 });
  }
}
