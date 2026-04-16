import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET /api/pto-balances?userId=xxx&year=xxx
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const year = parseInt(searchParams.get("year") || String(new Date().getFullYear()));
    const supabase = await createClient();

    if (userId) {
      const { data: balance, error } = await supabase
        .from("pto_balances")
        .select("*")
        .eq("employee_id", userId)
        .eq("year", year)
        .single();

      if (error && error.code !== "PGRST116") throw error; // PGRST116 = no rows
      return NextResponse.json({ balance: balance || null });
    }

    const { data: balances, error } = await supabase
      .from("pto_balances")
      .select("*, employee:employees(id, first_name, last_name, employee_id)")
      .eq("year", year);

    if (error) throw error;
    return NextResponse.json({ balances: balances || [] });
  } catch (error) {
    console.error("Error fetching PTO balances:", error);
    return NextResponse.json({ error: "Failed to fetch PTO balances" }, { status: 500 });
  }
}
