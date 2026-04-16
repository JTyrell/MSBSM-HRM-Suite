// ─── AI Chat View Tests ─────────────────────────────────────────────
// Covers: 8-llm-chat (LLM-Powered AI Chat)

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AIChatView } from "@/components/hrm/ai-chat-view";
import { useAppStore } from "@/store/app";

const mockFetch = vi.fn();
global.fetch = mockFetch;

beforeEach(() => {
  vi.clearAllMocks();
  useAppStore.setState({
    currentUserId: "user-1",
    employees: [
      { id: "user-1", employeeId: "EMP001", firstName: "Jane", lastName: "Doe", email: "jane@test.com", role: "admin", status: "active", hireDate: "2024-01-15", departmentId: "d1", payType: "salary", payRate: 50000, overtimeRate: 1.5 },
    ],
    chatMessages: [],
  });

  mockFetch.mockResolvedValue({
    ok: true,
    json: () => Promise.resolve({
      response: "Hello! How can I help you today?",
      agentType: "hr_assistant",
      timestamp: new Date().toISOString(),
    }),
  });
});

describe("AIChatView", () => {
  it("should render the AI Chat heading", () => {
    render(<AIChatView />);
    expect(screen.getByText("AI Chat")).toBeInTheDocument();
  });

  it("should render the description text", () => {
    render(<AIChatView />);
    expect(screen.getByText(/Chat with specialized AI agents/)).toBeInTheDocument();
  });

  // ─── Agent Selector ─────────────────────────────────────────────
  it("should render all 4 AI agents", () => {
    render(<AIChatView />);
    // Use getAllByText since agent names appear in multiple places (sidebar + header)
    expect(screen.getAllByText(/HR Assistant/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Payroll Detective/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/PTO Fairy/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Compliance Agent/i).length).toBeGreaterThan(0);
  });

  it("should show agent descriptions", () => {
    render(<AIChatView />);
    const descriptions = screen.getAllByText(/General questions, policy help/);
    expect(descriptions.length).toBeGreaterThan(0);
  });

  it("should show agent tag lines", () => {
    render(<AIChatView />);
    const tagLines = screen.getAllByText(/Ask HR/);
    expect(tagLines.length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Pay & Deductions/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Time Off Magic/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Border Buddy/).length).toBeGreaterThan(0);
  });

  // ─── AI Power Toggle (Task 8-llm-chat) ─────────────────────────
  it("should render the AI Power Toggle", () => {
    render(<AIChatView />);
    expect(screen.getByText("Rule-Based")).toBeInTheDocument();
    expect(screen.getByText("AI Powered")).toBeInTheDocument();
  });

  it("should show LLM badge when AI Powered is on", () => {
    render(<AIChatView />);
    expect(screen.getByText("LLM")).toBeInTheDocument();
  });

  it("should show 'AI Powered Mode Active' badge in empty state", () => {
    render(<AIChatView />);
    expect(screen.getByText("AI Powered Mode Active")).toBeInTheDocument();
  });

  // ─── Chat Header ───────────────────────────────────────────────
  it("should show Online badge in chat header", () => {
    render(<AIChatView />);
    expect(screen.getByText("Online")).toBeInTheDocument();
  });

  it("should have a New Chat button", () => {
    render(<AIChatView />);
    expect(screen.getByText("New Chat")).toBeInTheDocument();
  });

  // ─── Quick Suggestions ─────────────────────────────────────────
  it("should show quick suggestion buttons for active agent", () => {
    render(<AIChatView />);
    // HR Assistant suggestions - use getAllByText since they may appear in both mobile and desktop
    const suggestions = screen.getAllByText(/Show my recent attendance/i);
    expect(suggestions.length).toBeGreaterThan(0);
  });

  // ─── Message Input ─────────────────────────────────────────────
  it("should render message input", () => {
    render(<AIChatView />);
    const inputs = document.querySelectorAll("input[type='text'], input:not([type])");
    expect(inputs.length).toBeGreaterThan(0);
  });

  // ─── Message Sending ───────────────────────────────────────────
  it("should send message to LLM endpoint when AI mode is on", async () => {
    const user = userEvent.setup();
    render(<AIChatView />);

    const inputs = document.querySelectorAll("input[type='text'], input:not([type])");
    const input = inputs[inputs.length - 1] as HTMLInputElement; // Get the last (chat) input
    await user.type(input, "What is my PTO balance?");
    await user.keyboard("{Enter}");

    await waitFor(() => {
      const llmCalls = mockFetch.mock.calls.filter(
        (c: any[]) => typeof c[0] === "string" && c[0].includes("/api/ai-chat/llm")
      );
      expect(llmCalls.length).toBeGreaterThan(0);
    });
  });

  // ─── New Chat ───────────────────────────────────────────────────
  it("should clear messages when New Chat is clicked", async () => {
    const user = userEvent.setup();
    useAppStore.setState({
      chatMessages: [
        { id: "m1", sessionId: "s1", userId: "user-1", role: "user", content: "Hello", createdAt: new Date().toISOString() },
      ],
    });

    render(<AIChatView />);
    const newChatBtn = screen.getByText("New Chat");
    await user.click(newChatBtn);

    expect(useAppStore.getState().chatMessages).toHaveLength(0);
  });

  // ─── Responsive: Mobile Dropdown ────────────────────────────────
  it("should have a mobile agent selector (hidden on lg screens)", () => {
    render(<AIChatView />);
    const mobileSelector = document.querySelector(".lg\\:hidden");
    expect(mobileSelector).toBeTruthy();
  });

  it("should have a desktop sidebar (hidden on small screens)", () => {
    render(<AIChatView />);
    const desktopSidebar = document.querySelector(".hidden.lg\\:flex");
    expect(desktopSidebar).toBeTruthy();
  });
});
