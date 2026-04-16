// ─── Zustand App Store Tests ────────────────────────────────────────
// Covers: Shared state store used by all tasks

import { describe, it, expect, beforeEach } from "vitest";
import { useAppStore } from "@/store/app";

describe("useAppStore", () => {
  beforeEach(() => {
    // Reset to default state before each test
    useAppStore.setState({
      currentView: "dashboard",
      currentUserId: "",
      sidePanelOpen: false,
      employees: [],
      departments: [],
      geofences: [],
      attendance: [],
      payrollPeriods: [],
      ptoRequests: [],
      ptoBalances: [],
      notifications: [],
      chatMessages: [],
      isClockedIn: false,
      activeAttendanceId: null,
      isLoading: false,
    });
  });

  describe("initial state", () => {
    it("should have dashboard as default view", () => {
      expect(useAppStore.getState().currentView).toBe("dashboard");
    });

    it("should have empty currentUserId", () => {
      expect(useAppStore.getState().currentUserId).toBe("");
    });

    it("should have side panel closed", () => {
      expect(useAppStore.getState().sidePanelOpen).toBe(false);
    });

    it("should have empty arrays for all data", () => {
      const state = useAppStore.getState();
      expect(state.employees).toEqual([]);
      expect(state.departments).toEqual([]);
      expect(state.geofences).toEqual([]);
      expect(state.attendance).toEqual([]);
      expect(state.payrollPeriods).toEqual([]);
      expect(state.ptoRequests).toEqual([]);
      expect(state.ptoBalances).toEqual([]);
      expect(state.notifications).toEqual([]);
      expect(state.chatMessages).toEqual([]);
    });

    it("should not be clocked in", () => {
      expect(useAppStore.getState().isClockedIn).toBe(false);
      expect(useAppStore.getState().activeAttendanceId).toBeNull();
    });

    it("should not be loading", () => {
      expect(useAppStore.getState().isLoading).toBe(false);
    });
  });

  describe("navigation", () => {
    it("setCurrentView should update the current view", () => {
      useAppStore.getState().setCurrentView("payroll");
      expect(useAppStore.getState().currentView).toBe("payroll");
    });

    it("should switch between multiple views", () => {
      const { setCurrentView } = useAppStore.getState();
      setCurrentView("shifts");
      expect(useAppStore.getState().currentView).toBe("shifts");
      setCurrentView("benefits");
      expect(useAppStore.getState().currentView).toBe("benefits");
      setCurrentView("dashboard");
      expect(useAppStore.getState().currentView).toBe("dashboard");
    });
  });

  describe("user management", () => {
    it("setCurrentUserId should update the current user", () => {
      useAppStore.getState().setCurrentUserId("user-123");
      expect(useAppStore.getState().currentUserId).toBe("user-123");
    });
  });

  describe("side panel", () => {
    it("setSidePanelOpen should toggle the panel", () => {
      useAppStore.getState().setSidePanelOpen(true);
      expect(useAppStore.getState().sidePanelOpen).toBe(true);
      useAppStore.getState().setSidePanelOpen(false);
      expect(useAppStore.getState().sidePanelOpen).toBe(false);
    });
  });

  describe("data setters", () => {
    it("setEmployees should set the employees array", () => {
      const employees = [
        { id: "1", employeeId: "EMP001", firstName: "John", lastName: "Doe", email: "j@test.com", role: "admin", status: "active", hireDate: "2024-01-01", departmentId: "d1", payType: "salary", payRate: 50000, overtimeRate: 1.5 },
      ];
      useAppStore.getState().setEmployees(employees as any);
      expect(useAppStore.getState().employees).toHaveLength(1);
      expect(useAppStore.getState().employees[0].firstName).toBe("John");
    });

    it("setDepartments should set the departments array", () => {
      const depts = [{ id: "d1", name: "Engineering", code: "ENG" }];
      useAppStore.getState().setDepartments(depts);
      expect(useAppStore.getState().departments).toHaveLength(1);
    });

    it("setAttendance should set attendance records", () => {
      const records = [
        { id: "a1", employeeId: "e1", geofenceId: "g1", clockIn: "2026-01-01T09:00:00Z", clockInLat: 18.0, clockInLng: -76.8, status: "active" },
      ];
      useAppStore.getState().setAttendance(records as any);
      expect(useAppStore.getState().attendance).toHaveLength(1);
    });

    it("setPtoRequests should set PTO requests", () => {
      const requests = [
        { id: "p1", employeeId: "e1", type: "vacation", startDate: "2026-07-01", endDate: "2026-07-05", daysCount: 5, status: "pending" },
      ];
      useAppStore.getState().setPtoRequests(requests as any);
      expect(useAppStore.getState().ptoRequests).toHaveLength(1);
    });

    it("setPayrollPeriods should set payroll periods", () => {
      const periods = [
        { id: "pp1", name: "Jan 2026", startDate: "2026-01-01", endDate: "2026-01-15", status: "completed", companyId: "c1" },
      ];
      useAppStore.getState().setPayrollPeriods(periods);
      expect(useAppStore.getState().payrollPeriods).toHaveLength(1);
    });

    it("setNotifications should set notifications", () => {
      const notifs = [
        { id: "n1", userId: "u1", title: "Welcome", message: "Hello!", type: "info", isRead: false, createdAt: "2026-01-01" },
      ];
      useAppStore.getState().setNotifications(notifs);
      expect(useAppStore.getState().notifications).toHaveLength(1);
    });
  });

  describe("chat messages", () => {
    it("setChatMessages should replace all messages", () => {
      const msgs = [
        { id: "m1", sessionId: "s1", userId: "u1", role: "user", content: "Hello", createdAt: "2026-01-01" },
      ];
      useAppStore.getState().setChatMessages(msgs);
      expect(useAppStore.getState().chatMessages).toHaveLength(1);
    });

    it("addChatMessage should append to existing messages", () => {
      const msg1 = { id: "m1", sessionId: "s1", userId: "u1", role: "user", content: "Hi", createdAt: "2026-01-01" };
      const msg2 = { id: "m2", sessionId: "s1", userId: "u1", role: "assistant", content: "Hello!", createdAt: "2026-01-01" };
      useAppStore.getState().addChatMessage(msg1);
      useAppStore.getState().addChatMessage(msg2);
      expect(useAppStore.getState().chatMessages).toHaveLength(2);
      expect(useAppStore.getState().chatMessages[0].content).toBe("Hi");
      expect(useAppStore.getState().chatMessages[1].content).toBe("Hello!");
    });
  });

  describe("clock status", () => {
    it("setIsClockedIn should update clock status with attendance ID", () => {
      useAppStore.getState().setIsClockedIn(true, "att-123");
      expect(useAppStore.getState().isClockedIn).toBe(true);
      expect(useAppStore.getState().activeAttendanceId).toBe("att-123");
    });

    it("setIsClockedIn should clear attendance ID when clocking out", () => {
      useAppStore.getState().setIsClockedIn(true, "att-123");
      useAppStore.getState().setIsClockedIn(false);
      expect(useAppStore.getState().isClockedIn).toBe(false);
      expect(useAppStore.getState().activeAttendanceId).toBeNull();
    });
  });

  describe("loading state", () => {
    it("setIsLoading should toggle loading", () => {
      useAppStore.getState().setIsLoading(true);
      expect(useAppStore.getState().isLoading).toBe(true);
      useAppStore.getState().setIsLoading(false);
      expect(useAppStore.getState().isLoading).toBe(false);
    });
  });
});
