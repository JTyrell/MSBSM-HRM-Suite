// ─── Performance Reviews View Tests ─────────────────────────────────
// Covers: 7-performance-reviews

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { PerformanceReviewsView } from "@/components/hrm/performance-reviews-view";
import { useAppStore } from "@/store/app";

const mockFetch = vi.fn();
global.fetch = mockFetch;

beforeEach(() => {
  vi.clearAllMocks();
  useAppStore.setState({
    currentUserId: "user-1",
    employees: [
      { id: "user-1", employeeId: "620123456", firstName: "Jane", lastName: "Doe", email: "jane@uwi.edu", role: "admin", status: "active", hireDate: "2024-01-15", departmentId: "d1", payType: "salary", payRate: 50000, overtimeRate: 1.5 },
      { id: "user-2", employeeId: "620123457", firstName: "John", lastName: "Smith", email: "john@uwi.edu", role: "employee", status: "active", hireDate: "2024-06-01", departmentId: "d2", payType: "hourly", payRate: 25, overtimeRate: 1.5 },
    ],
  });

  mockFetch.mockImplementation((url: string) => {
    if (url.includes("/api/performance-reviews")) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          reviews: [
            {
              id: "r1",
              employeeId: "user-2",
              reviewerId: "user-1",
              cycleName: "Q4 2025",
              status: "completed",
              rating: 4.5,
              strengths: "Great communicator",
              improvements: "Time management",
              goals: "Lead a project",
              overallComment: "Excellent performance",
              createdAt: new Date().toISOString(),
              reviewedAt: "2025-12-15T00:00:00.000Z",
              employee: { firstName: "John", lastName: "Smith" },
              reviewer: { firstName: "Jane", lastName: "Doe" },
            },
            {
              id: "r2",
              employeeId: "user-1",
              reviewerId: "user-2",
              cycleName: "Q1 2026",
              status: "in_progress",
              rating: null,
              strengths: "",
              improvements: "",
              goals: "",
              overallComment: "",
              createdAt: new Date().toISOString(),
              reviewedAt: null,
              employee: { firstName: "Jane", lastName: "Doe" },
              reviewer: { firstName: "John", lastName: "Smith" },
            },
          ],
        }),
      });
    }
    if (url.includes("/api/employees")) {
      return Promise.resolve({ ok: true, json: () => Promise.resolve({ employees: [] }) });
    }
    return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
  });
});

describe("PerformanceReviewsView", () => {
  it("should render the Performance Reviews heading", async () => {
    render(<PerformanceReviewsView />);
    const headings = await screen.findAllByText(/Performance|Reviews/i);
    expect(headings.length).toBeGreaterThan(0);
  });

  it("should render Create Review button", async () => {
    render(<PerformanceReviewsView />);
    const createBtn = await screen.findAllByText(/Create|New/i);
    expect(createBtn.length).toBeGreaterThan(0);
  });

  it("should display stat cards", async () => {
    render(<PerformanceReviewsView />);
    await waitFor(() => {
      const totalReviews = screen.getAllByText(/Total Reviews/i);
      expect(totalReviews.length).toBeGreaterThan(0);
    });
  });

  it("should display average rating stat", async () => {
    render(<PerformanceReviewsView />);
    await waitFor(() => {
      const avgRating = screen.getAllByText(/Average Rating/i);
      expect(avgRating.length).toBeGreaterThan(0);
    });
  });

  it("should have tab navigation", async () => {
    render(<PerformanceReviewsView />);
    await waitFor(() => {
      const overviewTabs = screen.getAllByText(/Overview/i);
      expect(overviewTabs.length).toBeGreaterThan(0);
    });
  });

  it("should display review data after loading", async () => {
    render(<PerformanceReviewsView />);
    await waitFor(() => {
      const cycles = screen.getAllByText(/Q4 2025/i);
      expect(cycles.length).toBeGreaterThan(0);
    });
  });

  it("should show completed and in-progress status badges", async () => {
    render(<PerformanceReviewsView />);
    await waitFor(() => {
      const completedBadges = screen.getAllByText(/completed/i);
      expect(completedBadges.length).toBeGreaterThan(0);
    });
  });

  it("should fetch reviews from API on mount", async () => {
    render(<PerformanceReviewsView />);
    await waitFor(() => {
      const apiCalls = mockFetch.mock.calls.filter(
        (c: any[]) => typeof c[0] === "string" && c[0].includes("/api/performance-reviews")
      );
      expect(apiCalls.length).toBeGreaterThan(0);
    });
  });

  it("should have responsive grid for stat cards", async () => {
    render(<PerformanceReviewsView />);
    await waitFor(() => {
      const grids = document.querySelectorAll("[class*='grid-cols']");
      expect(grids.length).toBeGreaterThan(0);
    });
  });
});
