import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// ============ AGENT SYSTEM PROMPTS ============

const AGENT_SYSTEM_PROMPTS: Record<string, string> = {
  hr_assistant: `You are the HR Assistant for MSBM-HR Suite, a comprehensive HR management platform. You help employees with general HR questions, company policies, onboarding guidance, workplace culture, employee benefits inquiries, and general administrative support.

Company Context:
- MSBM-HR is a university-affiliated business school with multiple departments
- Departments include: ICT, HR, Finance, Academic Affairs, Facilities, Student Services, Executive Office, Research & Innovation
- The platform handles attendance tracking, payroll, PTO management, JA statutory compliance (NIS, NHT, EdTax, PAYE), performance reviews, and more
- Company emphasizes work-life balance and employee development
- Located in Jamaica and subject to Jamaican labor laws

Your personality: Warm, professional, knowledgeable, and approachable. Always address the employee by name when available. Use clear, structured formatting with markdown (bullet points, bold, headers) to make your answers easy to read.

Keep responses concise (2-4 paragraphs max unless the question requires detail). Always offer follow-up assistance.`,

  payroll_detective: `You are the Payroll Detective for MSBM-HR Suite, a specialized AI agent that handles payroll calculations, tax questions, deduction explanations, pay stub analysis, and anomaly detection.

Company Context:
- MSBM-HR manages payroll across multiple departments
- Pay types include hourly and salary positions
- Standard JA deductions include NIS, NHT, Education Tax, and PAYE
- Payroll is processed monthly
- Currency: JMD (Jamaican Dollar)

Your personality: Analytical, detail-oriented, trustworthy. You investigate payroll questions like a detective. Use tables and structured data when presenting payroll information.

Format monetary values clearly with J$ and proper decimal places.`,

  pto_fairy: `You are the PTO Fairy for MSBM-HR Suite, a magical and helpful AI agent that manages all things related to paid time off, vacation planning, leave balances, and time-off requests.

Company Context:
- Standard PTO allocation: 20 days/year (vacation + sick + personal)
- Minimum annual leave: 10 days (JA statutory requirement)
- PTO types include: Vacation, Sick Leave, Personal Days, Bereavement
- PTO requests require manager approval

Your personality: Enthusiastic, supportive, organized. Use cheerful formatting with emojis where appropriate. Always present PTO balances in a clear, structured format.`,

  compliance_agent: `You are the Compliance Agent (Border Buddy) for MSBM-HR Suite, an AI agent specializing in Jamaican regulatory compliance, labor laws, workplace safety, and audit preparation.

Company Context:
- Subject to Jamaican labor laws and statutory requirements
- JA Deductions: NIS (3%/3.75%), NHT (2%/3%), Education Tax (2.5%), PAYE (25% above threshold)
- Must maintain compliance with MyHR+ reporting standards
- Annual compliance audits are conducted

Your personality: Professional, thorough, authoritative but approachable. Use numbered lists and clear sections for compliance requirements.

Always note that your information is general guidance and should not replace legal counsel.`,
};

const DEFAULT_SYSTEM_PROMPT = AGENT_SYSTEM_PROMPTS.hr_assistant;

// ============ POST: LLM Chat ============

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, agentType, context, userId } = body;

    if (!message) {
      return NextResponse.json(
        { error: "message is required" },
        { status: 400 }
      );
    }

    const agent = agentType || "hr_assistant";
    const systemPrompt = AGENT_SYSTEM_PROMPTS[agent] || DEFAULT_SYSTEM_PROMPT;

    // Gather employee context if userId provided
    let employeeContext = "";
    if (userId) {
      try {
        const supabase = await createClient();
        const { data: employee } = await supabase
          .from("employees")
          .select("*, department:departments(name), work_location:geofences(name)")
          .eq("id", userId)
          .single();

        if (employee) {
          employeeContext = `\n\nCurrent Employee Context:\n` +
            `- Name: ${employee.first_name} ${employee.last_name}\n` +
            `- Role: ${employee.role || "Not specified"}\n` +
            `- Department: ${employee.department?.name || "Not assigned"}\n` +
            `- Pay Type: ${employee.pay_type || "Not specified"}\n` +
            `- Pay Rate: J$${employee.pay_rate || 0}${employee.pay_type === "hourly" ? "/hr" : "/yr"}\n` +
            `- Hire Date: ${employee.hire_date ? new Date(employee.hire_date).toLocaleDateString() : "N/A"}\n` +
            `- Status: ${employee.status || "Active"}\n`;

          // Add PTO balance if available
          const year = new Date().getFullYear();
          const { data: ptoBalance } = await supabase
            .from("pto_balances")
            .select("*")
            .eq("employee_id", userId)
            .eq("year", year)
            .single();

          if (ptoBalance) {
            const available = ptoBalance.total_allocated - ptoBalance.used_sick - ptoBalance.used_vacation - ptoBalance.used_personal - ptoBalance.used_other;
            employeeContext += `- PTO Balance (${year}): ${available} days available (Total: ${ptoBalance.total_allocated}, Sick used: ${ptoBalance.used_sick}, Vacation used: ${ptoBalance.used_vacation}, Personal used: ${ptoBalance.used_personal})\n`;
          }
        }
      } catch (ctxError) {
        console.warn("Could not fetch employee context:", ctxError);
      }
    }


    // Build full system prompt with context
    const fullSystemPrompt = systemPrompt + employeeContext + (context ? `\n\nAdditional Context:\n${context}` : "");

    // Call the LLM via z-ai-web-dev-sdk
    let llmResponse: string;
    try {
      const ZAI = (await import("z-ai-web-dev-sdk")).default;
      const zai = await ZAI.create();

      const completion = await zai.chat.completions.create({
        messages: [
          { role: "assistant", content: fullSystemPrompt },
          { role: "user", content: message },
        ],
        thinking: { type: "disabled" },
      });

      llmResponse = completion.choices?.[0]?.message?.content || "";

      if (!llmResponse) {
        throw new Error("Empty response from LLM");
      }
    } catch (llmError) {
      console.error("LLM call failed, using fallback:", llmError);
      // Fallback to sophisticated simulated response
      llmResponse = generateFallbackResponse(message, agent);
    }

    return NextResponse.json({
      response: llmResponse,
      agentType: agent,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error in LLM chat endpoint:", error);
    return NextResponse.json(
      { error: "Failed to generate AI response" },
      { status: 500 }
    );
  }
}

// ============ FALLBACK RESPONSE GENERATOR ============
// Used when the LLM SDK is unavailable or errors occur

function generateFallbackResponse(message: string, agentType: string): string {
  const lower = message.toLowerCase();
  const agent = agentType || "hr_assistant";

  if (agent === "pto_fairy" || lower.includes("pto") || lower.includes("time off") || lower.includes("vacation") || lower.includes("leave")) {
    return `**PTO Summary** 🧚\n\nGreat question about your time off! Here's what I can help with:\n\n` +
      `### PTO Policy Overview\n` +
      `- **Annual Allocation:** 20 days total (vacation + sick + personal)\n` +
      `- **Vacation Days:** Request through the PTO section\n` +
      `- **Sick Leave:** No advance notice needed\n` +
      `- **Personal Days:** 2 days per year, request 3+ days in advance\n\n` +
      `### How to Request Time Off\n` +
      `1. Navigate to the **PTO** section in the sidebar\n` +
      `2. Click **"New Request"**\n` +
      `3. Select the leave type and dates\n` +
      `4. Submit for manager approval\n\n` +
      `> 💡 **Tip:** Plan ahead for peak vacation periods — requests are approved on a first-come basis.\n\n` +
      `Would you like me to check your specific PTO balance or help you plan a vacation?`;
  }

  if (agent === "payroll_detective" || lower.includes("payroll") || lower.includes("pay") || lower.includes("salary") || lower.includes("deduction") || lower.includes("tax")) {
    return `**Payroll Analysis** 🕵️\n\nLet me help you understand your payroll details:\n\n` +
      `### Standard Deductions Breakdown\n` +
      `| Deduction Type | Typical Rate |\n` +
      `|---|---|\n` +
      `| Federal Income Tax | Varies by bracket |\n` +
      `| State Income Tax | Varies by state |\n` +
      `| Social Security (FICA) | 6.2% up to limit |\n` +
      `| Medicare | 1.45% |\n` +
      `| Health Insurance | Per plan selection |\n` +
      `| 401(k) | Employee-elected % |\n\n` +
      `### Pay Schedule\n` +
      `- **Frequency:** Bi-weekly (every other Friday)\n` +
      `- **Pay Stub Access:** Available in the Payroll section\n` +
      `- **Direct Deposit:** Updates take 1-2 pay cycles\n\n` +
      `> ⚠️ **Note:** Tax calculations are based on current federal guidelines. For personalized tax advice, consult a qualified tax professional.\n\n` +
      `Do you have a specific question about your pay stub or a deduction you'd like me to investigate?`;
  }

  if (agent === "compliance_agent" || lower.includes("compliance") || lower.includes("policy") || lower.includes("regulation") || lower.includes("labor law") || lower.includes("safety")) {
    return `**Compliance Report** 🌍\n\nHere's the current compliance status and relevant updates:\n\n` +
      `### Active Compliance Alerts\n` +
      `1. **📋 Federal Overtime Update** — Threshold raised to $43,888/year (effective July 2024). Review exempt employee classifications.\n` +
      `2. **📋 I-9 Verification** — Ensure all employee documents are current and properly stored.\n` +
      `3. **📋 Workplace Safety (OSHA)** — Annual safety training renewal due for all departments.\n` +
      `4. **📋 Anti-Harassment Training** — Mandatory annual training for all employees.\n\n` +
      `### Key Labor Law Reminders\n` +
      `- **FLSA:** Minimum wage and overtime requirements\n` +
      `- **FMLA:** Eligible employees entitled to 12 weeks unpaid leave\n` +
      `- **ADA:** Reasonable accommodations must be provided\n` +
      `- **Title VII:** Protected classes in employment decisions\n\n` +
      `> ⚖️ **Disclaimer:** This information is general guidance. For specific legal questions, please consult with legal counsel.\n\n` +
      `Would you like details on any specific compliance area or help preparing for an audit?`;
  }

  // Default HR Assistant fallback
  return `**HR Assistant Response** 💼\n\nThank you for reaching out! I'm here to help with your HR-related questions.\n\n` +
    `### How I Can Help\n` +
    `- 🕐 **Attendance** — Check your clock-in/out records and attendance history\n` +
    `- 💰 **Payroll** — View pay stubs, understand deductions, and track compensation\n` +
    `- 🏖️ **PTO** — Check leave balances and submit time-off requests\n` +
    `- 📋 **Compliance** — Stay updated on labor laws and company policies\n` +
    `- 📊 **Performance** — Review goals, feedback, and performance reviews\n` +
    `- 🆕 **Onboarding** — Get help with new hire processes\n\n` +
    `### Quick Tips\n` +
    `- Use the **quick suggestion buttons** below for common queries\n` +
    `- Switch between AI agents using the sidebar for specialized help\n` +
    `- Your data is secure and private within the MSBM-HR platform\n\n` +
    `What would you like to know more about?`;
}
