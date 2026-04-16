// ─── CSV Export Utility Tests ───────────────────────────────────────
// Covers: r4-new-features (CSV Export Utility)

import { describe, it, expect, vi, beforeEach } from "vitest";
import { exportToCSV, exportPayrollToCSV, exportAttendanceToCSV } from "@/lib/export";

// Mock DOM APIs for download
beforeEach(() => {
  vi.restoreAllMocks();

  // Mock URL.createObjectURL and revokeObjectURL
  global.URL.createObjectURL = vi.fn(() => "blob:mock-url");
  global.URL.revokeObjectURL = vi.fn();

  // Mock document.createElement and body operations
  const mockLink = {
    setAttribute: vi.fn(),
    click: vi.fn(),
    style: { display: "" },
  };
  vi.spyOn(document, "createElement").mockReturnValue(mockLink as unknown as HTMLElement);
  vi.spyOn(document.body, "appendChild").mockImplementation(vi.fn());
  vi.spyOn(document.body, "removeChild").mockImplementation(vi.fn());
});

describe("exportToCSV", () => {
  it("should not trigger download for empty data", () => {
    exportToCSV([], "test");
    expect(document.createElement).not.toHaveBeenCalled();
  });

  it("should create a CSV with headers and rows", () => {
    const data = [
      { Name: "Alice", Age: "30", City: "NYC" },
      { Name: "Bob", Age: "25", City: "LA" },
    ];
    exportToCSV(data, "people-export");

    expect(document.createElement).toHaveBeenCalledWith("a");
    expect(URL.createObjectURL).toHaveBeenCalled();

    // Verify Blob content via the createObjectURL call
    const blobArg = (URL.createObjectURL as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(blobArg).toBeInstanceOf(Blob);
    expect(blobArg.type).toBe("text/csv;charset=utf-8;");
  });

  it("should handle data with special characters (commas, quotes)", () => {
    const data = [
      { Name: 'O"Brien', Notes: "Has, commas" },
    ];
    exportToCSV(data, "special-chars");
    expect(URL.createObjectURL).toHaveBeenCalled();
  });

  it("should set the correct filename attribute", () => {
    const data = [{ col1: "val1" }];
    exportToCSV(data, "my-export-file");

    const mockLink = (document.createElement as ReturnType<typeof vi.fn>).mock.results[0].value;
    expect(mockLink.setAttribute).toHaveBeenCalledWith("download", "my-export-file.csv");
  });
});

describe("exportPayrollToCSV", () => {
  it("should not trigger download for empty periods", () => {
    exportPayrollToCSV([]);
    expect(document.createElement).not.toHaveBeenCalled();
  });

  it("should not trigger download when periods have no records", () => {
    exportPayrollToCSV([{ name: "Q1", records: [] }]);
    expect(document.createElement).not.toHaveBeenCalled();
  });

  it("should flatten payroll period records into CSV rows", () => {
    const periods = [
      {
        name: "Jan 2026",
        startDate: "2026-01-01",
        endDate: "2026-01-15",
        status: "completed",
        records: [
          {
            employeeId: "emp-1",
            employee: { firstName: "Jane", lastName: "Doe" },
            regularHours: 80,
            overtimeHours: 5,
            totalHours: 85,
            grossPay: 4250,
            federalTax: 500,
            stateTax: 200,
            socialSecurity: 263.5,
            medicare: 61.63,
            healthInsurance: 150,
            retirement401k: 212.5,
            totalDeductions: 1387.63,
            netPay: 2862.37,
            status: "completed",
          },
        ],
      },
    ];

    exportPayrollToCSV(periods);
    expect(URL.createObjectURL).toHaveBeenCalled();
  });

  it("should use custom filename when provided", () => {
    const periods = [
      {
        name: "Q1",
        records: [
          {
            employee: { firstName: "A", lastName: "B" },
            regularHours: 40,
            overtimeHours: 0,
            totalHours: 40,
            grossPay: 2000,
            federalTax: 200,
            stateTax: 100,
            socialSecurity: 124,
            medicare: 29,
            healthInsurance: 75,
            retirement401k: 100,
            totalDeductions: 628,
            netPay: 1372,
            status: "completed",
          },
        ],
      },
    ];

    exportPayrollToCSV(periods, "custom-payroll");
    const mockLink = (document.createElement as ReturnType<typeof vi.fn>).mock.results[0].value;
    expect(mockLink.setAttribute).toHaveBeenCalledWith("download", "custom-payroll.csv");
  });

  it("should handle null numeric values with defaults", () => {
    const periods = [
      {
        name: "Q1",
        records: [
          {
            employee: null,
            employeeId: "emp-fallback",
            regularHours: null,
            overtimeHours: null,
            totalHours: null,
            grossPay: null,
            federalTax: null,
            stateTax: null,
            socialSecurity: null,
            medicare: null,
            healthInsurance: null,
            retirement401k: null,
            totalDeductions: null,
            netPay: null,
            status: "pending",
          },
        ],
      },
    ];

    // Should not throw
    expect(() => exportPayrollToCSV(periods)).not.toThrow();
  });
});

describe("exportAttendanceToCSV", () => {
  it("should not trigger download for empty records", () => {
    exportAttendanceToCSV([]);
    expect(document.createElement).not.toHaveBeenCalled();
  });

  it("should export attendance records with employee and location data", () => {
    const records = [
      {
        employeeId: "emp-1",
        employee: {
          firstName: "Jane",
          lastName: "Doe",
          department: { name: "Engineering" },
        },
        clockIn: "2026-01-15T09:00:00Z",
        clockOut: "2026-01-15T17:00:00Z",
        totalHours: 8.0,
        status: "completed",
        geofence: { name: "HQ Office" },
        clockInLat: 18.0,
        clockInLng: -76.8,
        clockOutLat: 18.0,
        clockOutLng: -76.8,
      },
    ];

    exportAttendanceToCSV(records);
    expect(URL.createObjectURL).toHaveBeenCalled();
  });

  it("should use default auto-generated filename", () => {
    const records = [
      {
        employee: { firstName: "X", lastName: "Y" },
        clockIn: "2026-01-01",
        totalHours: 8,
        status: "completed",
      },
    ];

    exportAttendanceToCSV(records);
    const mockLink = (document.createElement as ReturnType<typeof vi.fn>).mock.results[0].value;
    const downloadArg = mockLink.setAttribute.mock.calls.find(
      (c: string[]) => c[0] === "download"
    );
    expect(downloadArg[1]).toMatch(/^attendance-export-\d{4}-\d{2}-\d{2}\.csv$/);
  });

  it("should handle records without employee or geofence gracefully", () => {
    const records = [
      {
        employeeId: "emp-orphan",
        clockIn: "2026-01-01",
        totalHours: 4,
        status: "partial",
      },
    ];

    expect(() => exportAttendanceToCSV(records)).not.toThrow();
  });
});
