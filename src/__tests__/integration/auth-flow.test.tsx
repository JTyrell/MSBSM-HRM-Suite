// ─── Auth Flow Integration Tests ────────────────────────────────────
// Verifies frontend state transitions during login and initialization.

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import HomePage from "@/app/page";
import { useAppStore } from "@/store/app";

const mockFetch = vi.fn();
global.fetch = mockFetch;

beforeEach(() => {
  vi.clearAllMocks();

  // Start with uninitialized state
  useAppStore.setState({
    currentUserId: "",
    currentView: "dashboard",
    employees: [],
  });
});

describe("Auth Flow Integration", () => {
  it("should show initializing screen when currentUserId is not set", () => {
    // Return empty for all fetches to keep it initializing
    mockFetch.mockResolvedValue({ ok: true, json: () => Promise.resolve({}) });
    
    render(<HomePage />);
    
    // Should show initializing MSBM-HR Suite
    expect(screen.getByText("MSBM-HR Suite")).toBeInTheDocument();
    expect(screen.getByText("Initializing system...")).toBeInTheDocument();
  });

  it("should initialize state and render dashboard when auth/me succeeds", async () => {
    const mockUser = {
      id: "user-auth-1",
      employeeId: "620123456",
      firstName: "John",
      lastName: "Doe",
      email: "john@uwi.edu",
      role: "hr",
      status: "active",
      hireDate: "2024-01-01",
    };

    mockFetch.mockImplementation((url: string) => {
      if (url.includes("/api/auth/me")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            user: { auth_id: "auth-1", email: "john@uwi.edu" },
            employee: mockUser,
          })
        });
      }
      if (url.includes("/api/employees") || url.includes("/api/seed")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            employees: [mockUser],
          })
        });
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
    });

    render(<HomePage />);

    await waitFor(() => {
      // The user's name should be displayed in the dropdown menu trigger
      expect(screen.getAllByText(/John Doe/i).length).toBeGreaterThan(0);
    }, { timeout: 5000 });

    // Verify state was updated
    expect(useAppStore.getState().currentUserId).toBe("user-auth-1");
  });
});
