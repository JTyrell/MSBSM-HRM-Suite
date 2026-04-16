// ─── Shifts View Tests ──────────────────────────────────────────────
// Covers: r4-shift-management

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { ShiftsView } from "@/components/hrm/shifts-view";
import { useAppStore } from "@/store/app";

const mockFetch = vi.fn();
global.fetch = mockFetch;

beforeEach(() => {
  vi.clearAllMocks();
  useAppStore.setState({
    departments: [
      { id: "d1", name: "Engineering", code: "ENG" },
      { id: "d2", name: "Operations", code: "OPS" },
    ],
  });

  mockFetch.mockImplementation((url: string) => {
    if (url.includes("/api/shifts")) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          shifts: [
            { id: "s1", name: "Morning Shift", startTime: "06:00", endTime: "14:00", breakMinutes: 30, color: "#10b981", isActive: true, departmentId: "d1", department: { name: "Engineering" } },
            { id: "s2", name: "Day Shift", startTime: "09:00", endTime: "17:00", breakMinutes: 60, color: "#14b8a6", isActive: true, departmentId: null, department: null },
            { id: "s3", name: "Night Shift", startTime: "22:00", endTime: "06:00", breakMinutes: 30, color: "#8b5cf6", isActive: true, departmentId: "d2", department: { name: "Operations" } },
          ],
        }),
      });
    }
    if (url.includes("/api/departments")) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ departments: [{ id: "d1", name: "Engineering" }, { id: "d2", name: "Operations" }] }),
      });
    }
    return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
  });
});

describe("ShiftsView", () => {
  it("should render the Shift heading", async () => {
    render(<ShiftsView />);
    const headings = await screen.findAllByText(/Shift/i);
    expect(headings.length).toBeGreaterThan(0);
  });

  it("should render Create Shift button", async () => {
    render(<ShiftsView />);
    const createBtn = await screen.findAllByText(/Create|New|Add/i);
    expect(createBtn.length).toBeGreaterThan(0);
  });

  it("should display shift data after loading", async () => {
    render(<ShiftsView />);
    await waitFor(() => {
      const morningShift = screen.getAllByText(/Morning Shift/i);
      expect(morningShift.length).toBeGreaterThan(0);
    });
  });

  it("should display multiple shifts", async () => {
    render(<ShiftsView />);
    await waitFor(() => {
      expect(screen.getAllByText(/Day Shift/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/Night Shift/i).length).toBeGreaterThan(0);
    });
  });

  it("should have List and Calendar view tabs", async () => {
    render(<ShiftsView />);
    await waitFor(() => {
      const listTab = screen.getAllByText(/List/i);
      const calendarTab = screen.getAllByText(/Calendar/i);
      expect(listTab.length).toBeGreaterThan(0);
      expect(calendarTab.length).toBeGreaterThan(0);
    });
  });

  it("should display quick templates", async () => {
    render(<ShiftsView />);
    await waitFor(() => {
      const templates = screen.queryAllByText(/Standard|Early Bird|Night Owl|Part Time/i);
      expect(templates.length).toBeGreaterThan(0);
    });
  });

  it("should fetch shifts from API on mount", async () => {
    render(<ShiftsView />);
    await waitFor(() => {
      const shiftCalls = mockFetch.mock.calls.filter(
        (c: any[]) => typeof c[0] === "string" && c[0].includes("/api/shifts")
      );
      expect(shiftCalls.length).toBeGreaterThan(0);
    });
  });

  it("should use responsive grid layout", async () => {
    render(<ShiftsView />);
    await screen.findAllByText(/Morning Shift/i);
    const grids = document.querySelectorAll("[class*='grid-cols']");
    expect(grids.length).toBeGreaterThan(0);
  });
});
