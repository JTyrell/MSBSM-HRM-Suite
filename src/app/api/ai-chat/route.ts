import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// POST /api/ai-chat - Send a message to AI chat
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, message, agentType, sessionId } = body;

    if (!userId || !message) {
      return NextResponse.json({ error: "userId and message are required" }, { status: 400 });
    }

    // Save user message
    const userMessage = await db.chatMessage.create({
      data: {
        sessionId: sessionId || crypto.randomUUID(),
        userId,
        role: "user",
        content: message,
        agentType: agentType || "hr_assistant",
      },
    });

    // Generate AI response (using z-ai-web-dev-sdk would happen here in production)
    // For now, generate a contextual response
    const aiResponse = await generateAIResponse(userId, message, agentType);

    const assistantMessage = await db.chatMessage.create({
      data: {
        sessionId: userMessage.sessionId,
        userId,
        role: "assistant",
        content: aiResponse.content,
        agentType: aiResponse.agentType || agentType || "hr_assistant",
      },
    });

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

    const messages = await db.chatMessage.findMany({
      where: { sessionId, ...(userId && { userId }) },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({ messages });
  } catch (error) {
    console.error("Error fetching chat messages:", error);
    return NextResponse.json({ error: "Failed to fetch chat messages" }, { status: 500 });
  }
}

async function generateAIResponse(
  userId: string,
  message: string,
  agentType?: string
): Promise<{ content: string; agentType: string }> {
  // Get employee context
  const employee = await db.employee.findUnique({
    where: { id: userId },
    include: {
      department: true,
      workLocation: true,
    },
  });

  const name = employee ? `${employee.firstName} ${employee.lastName}` : "there";
  const dept = employee?.department?.name || "N/A";
  const role = employee?.role || "employee";
  const hireDate = employee?.hireDate
    ? new Date(employee.hireDate).toLocaleDateString()
    : "N/A";
  const payType = employee?.payType || "N/A";
  const payRate = employee?.payRate || 0;

  const lowerMessage = message.toLowerCase();

  // Route to appropriate agent based on message content
  if (lowerMessage.includes("pto") || lowerMessage.includes("time off") || lowerMessage.includes("vacation") || lowerMessage.includes("leave")) {
    const year = new Date().getFullYear();
    const balance = await db.pTOBalance.findUnique({
      where: { employeeId_year: { employeeId: userId, year } },
    });

    const available = balance
      ? balance.totalAllocated - balance.usedSick - balance.usedVacation - balance.usedPersonal - balance.usedOther
      : 20;

    return {
      content: `**PTO Fairy Agent** 🧚\n\nHi ${name}! Here's your PTO balance for ${year}:\n\n` +
        `- **Total Allocated:** ${balance?.totalAllocated || 20} days\n` +
        `- **Sick Leave Used:** ${balance?.usedSick || 0} days\n` +
        `- **Vacation Used:** ${balance?.usedVacation || 0} days\n` +
        `- **Personal Days Used:** ${balance?.usedPersonal || 0} days\n` +
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
        `Pay stubs are available in the Payroll section of your dashboard. If you notice any discrepancies in your pay, I can help investigate. Just let me know!`,
      agentType: "payroll_detective",
    };
  }

  if (lowerMessage.includes("compliance") || lowerMessage.includes("policy") || lowerMessage.includes("regulation") || lowerMessage.includes("labor")) {
    return {
      content: `**Compliance Agent (Border Buddy)** 🌍\n\nHi ${name}! I monitor labor law and compliance changes that may affect your workplace.\n\n` +
        `**Recent Compliance Alerts:**\n` +
        `1. 📋 Federal overtime threshold updated to $43,888/year (effective July 2024)\n` +
        `2. 📋 New state leave requirements - check your local jurisdiction\n` +
        `3. 📋 I-9 verification reminder: Ensure all employees have verified documents\n\n` +
        `For specific compliance questions, feel free to ask!`,
      agentType: "compliance_agent",
    };
  }

  if (lowerMessage.includes("clock") || lowerMessage.includes("attendance") || lowerMessage.includes("hours")) {
    // Get recent attendance
    const recentAttendance = await db.attendance.findMany({
      where: { employeeId: userId },
      orderBy: { clockIn: "desc" },
      take: 5,
    });

    let attendanceSummary = "";
    if (recentAttendance.length > 0) {
      attendanceSummary = recentAttendance
        .map((a) => {
          const date = new Date(a.clockIn).toLocaleDateString();
          const hours = a.totalHours || "In progress";
          return `- ${date}: ${hours} hours (${a.status})`;
        })
        .join("\n");
    } else {
      attendanceSummary = "No recent attendance records found.";
    }

    return {
      content: `**HR Assistant** 💼\n\nHi ${name}! Here's your recent attendance:\n\n${attendanceSummary}\n\n` +
        `Remember, clock-in requires GPS verification within your designated work zone. If you have issues clocking in, please contact HR.`,
      agentType: "hr_assistant",
    };
  }

  // Default HR Assistant response
  return {
    content: `**HR Assistant** 💼\n\nHi ${name}! How can I help you today?\n\nI can assist you with:\n` +
      `- 🕐 **Attendance** - Check your clock-in/out history\n` +
      `- 💰 **Payroll** - View pay information and stubs\n` +
      `- 🏖️ **PTO** - Check balances and submit requests\n` +
      `- 📋 **Policies** - Company policies and compliance\n` +
      `- ❓ **General** - Any HR-related questions\n\n` +
      `Just ask away!`,
    agentType: "hr_assistant",
  };
}
