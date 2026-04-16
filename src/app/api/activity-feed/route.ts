import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    // Fetch recent activity from multiple sources in parallel
    const [attendanceRes, ptoRes, announcementsRes, auditRes, outTodayRes] =
      await Promise.all([
        supabase
          .from("attendance")
          .select("*, employee:employees(id, first_name, last_name, department:departments(name))")
          .order("clock_in", { ascending: false })
          .limit(5),
        supabase
          .from("pto_requests")
          .select("*, employee:employees(id, first_name, last_name)")
          .order("created_at", { ascending: false })
          .limit(5),
        supabase
          .from("announcements")
          .select("*")
          .eq("is_published", true)
          .order("created_at", { ascending: false })
          .limit(3),
        supabase
          .from("audit_logs")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(5),
        supabase
          .from("pto_requests")
          .select("*, employee:employees(id, first_name, last_name, department:departments(name))")
          .eq("status", "approved")
          .lte("start_date", todayEnd.toISOString())
          .gte("end_date", todayStart.toISOString())
          .order("start_date"),
      ]);

    // Build unified activity feed
    const activities = [
      ...(attendanceRes.data || []).map((r: any) => ({
        id: `att-${r.id}`,
        type: "attendance" as const,
        title: `${r.employee?.first_name || ""} ${r.employee?.last_name || ""}`,
        description: `Clocked ${r.clock_out ? "out" : "in"} at ${r.clock_in ? new Date(r.clock_in).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }) : "N/A"}`,
        timestamp: r.clock_in || r.created_at,
        department: r.employee?.department?.name || "",
        icon: "clock" as const,
      })),
      ...(ptoRes.data || []).map((r: any) => ({
        id: `pto-${r.id}`,
        type: "pto" as const,
        title: `${r.employee?.first_name || ""} ${r.employee?.last_name || ""}`,
        description: `PTO request: ${r.type} — ${r.status}`,
        timestamp: r.created_at,
        department: "",
        icon: "calendar" as const,
      })),
      ...(announcementsRes.data || []).map((a: any) => ({
        id: `ann-${a.id}`,
        type: "announcement" as const,
        title: "Company",
        description: `New announcement: ${a.title.substring(0, 50)}${a.title.length > 50 ? "..." : ""}`,
        timestamp: a.created_at,
        department: "",
        icon: "megaphone" as const,
      })),
      ...(auditRes.data || []).map((l: any) => ({
        id: `log-${l.id}`,
        type: "system" as const,
        title: l.action,
        description: l.before_data ? "Data change recorded" : "System event",
        timestamp: l.created_at,
        department: "",
        icon: "shield" as const,
      })),
    ];

    // Sort by timestamp descending
    activities.sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    // Build who's out today list
    const whosOut = (outTodayRes.data || []).map((r: any) => ({
      id: r.id,
      firstName: r.employee?.first_name,
      lastName: r.employee?.last_name,
      type: r.type,
      department: r.employee?.department?.name || "",
    }));

    return NextResponse.json({
      activities: activities.slice(0, 20),
      whosOut,
    });
  } catch (error) {
    console.error("Activity feed error:", error);
    return NextResponse.json({ activities: [], whosOut: [] });
  }
}
