import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// POST /api/ai-chat - Send a message to AI chat
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, message, agentType, sessionId } = body;

    if (!userId || !message) {
      return NextResponse.json({ error: "userId and message are required" }, { status: 400 });
    }

    const supabase = await createClient();

    // Save user message
    const { data: userMessage, error: msgError } = await supabase
      .from("chat_messages")
      .insert({
        session_id: sessionId || crypto.randomUUID(),
        user_id: userId,
        role: "user",
        content: message,
        agent_type: agentType || "hr_assistant",
      })
      .select()
      .single();

    if (msgError) throw msgError;

    // Generate AI response
    const aiResponse = await generateAIResponse(supabase, userId, message, agentType);

    const { data: assistantMessage, error: aiMsgError } = await supabase
      .from("chat_messages")
      .insert({
        session_id: userMessage.session_id,
        user_id: userId,
        role: "assistant",
        content: aiResponse.content,
        agent_type: aiResponse.agentType || agentType || "hr_assistant",
      })
      .select()
      .single();

    if (aiMsgError) throw aiMsgError;

    return NextResponse.json({
      userMessage,
      assistantMessage,
    });
  } catch (error) {
    console.error("Error in AI chat:", error);
    return NextResponse.json({ error: "Failed to process chat message" }, { status: 500 });
  }
}

// GET /api/ai-chat?sessionId=xxx&userId=xxx
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("sessionId");
    const userId = searchParams.get("userId");

    if (!sessionId) {
      return NextResponse.json({ error: "sessionId is required" }, { status: 400 });
    }

    const supabase = await createClient();

    let query = supabase
      .from("chat_messages")
      .select("*")
      .eq("session_id", sessionId)
      .order("created_at");

    if (userId) query = query.eq("user_id", userId);

    const { data: messages, error } = await query;
    if (error) throw error;
    return NextResponse.json({ messages: messages || [] });
  } catch (error) {
    console.error("Error fetching chat messages:", error);
    return NextResponse.json({ error: "Failed to fetch chat messages" }, { status: 500 });
  }
}

async function generateAIResponse(
  supabase: any,
  userId: string,
  message: string,
  agentType?: string
): Promise<{ content: string; agentType: string }> {
  // Get employee context
  const { data: employee } = await supabase
    .from("employees")
    .select("*, department:departments(name), work_location:geofences(name)")
    .eq("id", userId)
    .single();

  const name = employee ? `${employee.first_name} ${employee.last_name}` : "there";
  const dept = employee?.department?.name || "N/A";
  const role = employee?.role || "employee";
  const hireDate = employee?.hire_date
    ? new Date(employee.hire_date).toLocaleDateString()
    : "N/A";
  const payType = employee?.pay_type || "N/A";
  const payRate = employee?.pay_rate || 0;

  const lowerMessage = message.toLowerCase();

  // Route to appropriate agent based on message content
  if (lowerMessage.includes("pto") || lowerMessage.includes("time off") || lowerMessage.includes("vacation") || lowerMessage.includes("leave")) {
    const year = new Date().getFullYear();
    const { data: balance } = await supabase
      .from("pto_balances")
      .select("*")
      .eq("employee_id", userId)
      .eq("year", year)
      .single();

    const available = balance
      ? balance.total_allocated - balance.used_sick - balance.used_vacation - balance.used_personal - balance.used_other
      : 20;

    return {
      content: `**PTO Fairy Agent** 🧚\n\nHi ${name}! Here's your PTO balance for ${year}:\n\n` +
        `- **Total Allocated:** ${balance?.total_allocated || 20} days\n` +
        `- **Sick Leave Used:** ${balance?.used_sick || 0} days\n` +
        `- **Vacation Used:** ${balance?.used_vacation || 0} days\n` +
        `- **Personal Days Used:** ${balance?.used_personal || 0} days\n` +
        `- **Available Balance:** ${available} days\n\n` +
        `Would you like to submit a PTO request? Just tell me the type, start date, and end date!`,
      agentType: "pto_fairy",
    };
  }

  if (lowerMessage.includes("payroll") || lowerMessage.includes("pay") || lowerMessage.includes("salary") || lowerMessage.includes("wage")) {
    return {
      content: `**Payroll Detective Agent** 🕵️\n\nHi ${name}! Here's your payroll information:\n\n` +
        `- **Pay Type:** ${payType}\n` +
        `- **Pay Rate:** $${payRate}/hr\n` +
        `- **Department:** ${dept}\n` +
        `- **Hire Date:** ${hireDate}\n\n` +
        `Pay stubs are available in the Payroll section of your dashboard. If you notice any discrepancies in your pay, I can help investigate.`,
      agentType: "payroll_detective",
    };
  }

  if (lowerMessage.includes("compliance") || lowerMessage.includes("policy") || lowerMessage.includes("regulation") || lowerMessage.includes("labor")) {
    return {
      content: `**Compliance Agent (Border Buddy)** 🌍\n\nHi ${name}! I monitor labor law and compliance changes.\n\n` +
        `**JA Statutory Deductions:**\n` +
        `1. 📋 NIS: Employee 3% / Employer 3.75% (ceiling: J$32,400/wk)\n` +
        `2. 📋 NHT: Employee 2% / Employer 3% (ceiling: J$1.5M/mo)\n` +
        `3. 📋 Education Tax: 2.5% of gross (no ceiling)\n` +
        `4. 📋 PAYE: 25% above threshold (varies by code)\n\n` +
        `For specific compliance questions, feel free to ask!`,
      agentType: "compliance_agent",
    };
  }

  if (lowerMessage.includes("clock") || lowerMessage.includes("attendance") || lowerMessage.includes("hours")) {
    const { data: recentAttendance } = await supabase
      .from("attendance")
      .select("*")
      .eq("employee_id", userId)
      .order("clock_in", { ascending: false })
      .limit(5);

    let attendanceSummary = "";
    if (recentAttendance && recentAttendance.length > 0) {
      attendanceSummary = recentAttendance
        .map((a: any) => {
          const date = new Date(a.clock_in).toLocaleDateString();
          const hours = a.total_hours || "In progress";
          return `- ${date}: ${hours} hours (${a.status})`;
        })
        .join("\n");
    } else {
      attendanceSummary = "No recent attendance records found.";
    }

    return {
      content: `**HR Assistant** 💼\n\nHi ${name}! Here's your recent attendance:\n\n${attendanceSummary}\n\n` +
        `Clock-in requires GPS verification within your designated work zone.`,
      agentType: "hr_assistant",
    };
  }

  // Default HR Assistant response
  return {
    content: `**HR Assistant** 💼\n\nHi ${name}! How can I help you today?\n\nI can assist with:\n` +
      `- 🕐 **Attendance** - Clock-in/out history\n` +
      `- 💰 **Payroll** - Pay information and stubs\n` +
      `- 🏖️ **PTO** - Balances and requests\n` +
      `- 📋 **Compliance** - JA regulatory info\n` +
      `- ❓ **General** - Any HR-related questions\n\n` +
      `Just ask away!`,
    agentType: "hr_assistant",
  };
}
