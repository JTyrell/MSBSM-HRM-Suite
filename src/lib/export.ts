// ─── CSV Export Utility ───────────────────────────────────────────────
// Handles conversion of data arrays to CSV format with proper escaping
// and triggers browser download.

/**
 * Convert a value to a safe CSV string, handling commas, quotes, newlines, etc.
 */
function escapeCSVValue(value: unknown): string {
  if (value === null || value === undefined) return "";
  const str = String(value);
  // If the value contains a comma, quote, newline, or carriage return, wrap in quotes
  if (str.includes(",") || str.includes('"') || str.includes("\n") || str.includes("\r")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Convert an array of objects to a CSV string.
 */
function objectsToCSV(data: Record<string, unknown>[]): string {
  if (data.length === 0) return "";

  const headers = Object.keys(data[0]);
  const headerRow = headers.map(escapeCSVValue).join(",");

  const rows = data.map((item) =>
    headers.map((header) => escapeCSVValue(item[header])).join(",")
  );

  return [headerRow, ...rows].join("\n");
}

/**
 * Generic CSV export function.
 * @param data - Array of objects to export
 * @param filename - Name of the file (without .csv extension)
 */
export function exportToCSV(
  data: Record<string, unknown>[],
  filename: string
): void {
  if (data.length === 0) return;

  const csvString = objectsToCSV(data);
  triggerDownload(csvString, filename);
}

/**
 * Specialized payroll CSV export with formatted headers.
 * @param periods - Array of payroll periods (with records)
 * @param filename - Optional custom filename
 */
export function exportPayrollToCSV(periods: Record<string, unknown>[], filename?: string): void {
  // Flatten all records from all periods
  const rows: Record<string, unknown>[] = [];

  for (const period of periods) {
    for (const record of period.records || []) {
      rows.push({
        Period: period.name || "",
        "Period Start": period.startDate || "",
        "Period End": period.endDate || "",
        "Period Status": period.status || "",
        Employee: record.employee
          ? `${record.employee.firstName} ${record.employee.lastName}`
          : record.employeeId || "",
        "Regular Hours": record.regularHours?.toFixed(1) || "0",
        "Overtime Hours": record.overtimeHours?.toFixed(1) || "0",
        "Total Hours": record.totalHours?.toFixed(1) || "0",
        "Gross Pay": (record.grossPay || 0).toFixed(2),
        "Federal Tax": (record.federalTax || 0).toFixed(2),
        "State Tax": (record.stateTax || 0).toFixed(2),
        "Social Security": (record.socialSecurity || 0).toFixed(2),
        Medicare: (record.medicare || 0).toFixed(2),
        "Health Insurance": (record.healthInsurance || 0).toFixed(2),
        "401(k)": (record.retirement401k || 0).toFixed(2),
        "Total Deductions": (record.totalDeductions || 0).toFixed(2),
        "Net Pay": (record.netPay || 0).toFixed(2),
        Status: record.status || "",
      });
    }
  }

  if (rows.length === 0) return;

  const csvString = objectsToCSV(rows);
  const defaultName = `payroll-export-${new Date().toISOString().slice(0, 10)}`;
  triggerDownload(csvString, filename || defaultName);
}

/**
 * Specialized attendance CSV export with formatted headers.
 * @param records - Array of attendance records
 * @param filename - Optional custom filename
 */
export function exportAttendanceToCSV(records: Record<string, unknown>[], filename?: string): void {
  const rows: Record<string, unknown>[] = records.map((r) => ({
    Employee: r.employee
      ? `${r.employee.firstName} ${r.employee.lastName}`
      : r.employeeId || "",
    Department: r.employee?.department?.name || "",
    "Clock In": r.clockIn || "",
    "Clock Out": r.clockOut || "",
    "Total Hours": r.totalHours?.toFixed(1) || "0",
    Status: r.status || "",
    "Geofence": r.geofence?.name || "",
    "Clock In Lat": r.clockInLat ?? "",
    "Clock In Lng": r.clockInLng ?? "",
    "Clock Out Lat": r.clockOutLat ?? "",
    "Clock Out Lng": r.clockOutLng ?? "",
  }));

  if (rows.length === 0) return;

  const csvString = objectsToCSV(rows);
  const defaultName = `attendance-export-${new Date().toISOString().slice(0, 10)}`;
  triggerDownload(csvString, filename || defaultName);
}

/**
 * Create a Blob from CSV string and trigger a browser download.
 */
function triggerDownload(csvString: string, filename: string): void {
  // Add BOM for Excel compatibility
  const BOM = "\uFEFF";
  const blob = new Blob([BOM + csvString], {
    type: "text/csv;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}.csv`);
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
