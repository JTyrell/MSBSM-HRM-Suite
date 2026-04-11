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
  const rows: Record<string, string>[] = [];

  for (const period of periods) {
    const records = period.records || [];
    for (const record of records) {
      const emp = record.employee;
      rows.push({
        Period: period.name || "",
        "Period Start": period.startDate || "",
        "Period End": period.endDate || "",
        "Period Status": period.status || "",
        Employee: emp
          ? `${emp.firstName} ${emp.lastName}`
          : record.employeeId || "",
        "Regular Hours": record.regularHours != null ? String(record.regularHours.toFixed(1)) : "0",
        "Overtime Hours": record.overtimeHours != null ? String(record.overtimeHours.toFixed(1)) : "0",
        "Total Hours": record.totalHours != null ? String(record.totalHours.toFixed(1)) : "0",
        "Gross Pay": record.grossPay != null ? String(record.grossPay.toFixed(2)) : "0",
        "Federal Tax": record.federalTax != null ? String(record.federalTax.toFixed(2)) : "0",
        "State Tax": record.stateTax != null ? String(record.stateTax.toFixed(2)) : "0",
        "Social Security": record.socialSecurity != null ? String(record.socialSecurity.toFixed(2)) : "0",
        Medicare: record.medicare != null ? String(record.medicare.toFixed(2)) : "0",
        "Health Insurance": record.healthInsurance != null ? String(record.healthInsurance.toFixed(2)) : "0",
        "401(k)": record.retirement401k != null ? String(record.retirement401k.toFixed(2)) : "0",
        "Total Deductions": record.totalDeductions != null ? String(record.totalDeductions.toFixed(2)) : "0",
        "Net Pay": record.netPay != null ? String(record.netPay.toFixed(2)) : "0",
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
  const rows: Record<string, string>[] = records.map((r) => {
    const emp = r.employee;
    return {
      Employee: emp
        ? `${emp.firstName} ${emp.lastName}`
        : r.employeeId || "",
      Department: emp?.department?.name || "",
      "Clock In": r.clockIn || "",
      "Clock Out": r.clockOut || "",
      "Total Hours": r.totalHours != null ? String(r.totalHours.toFixed(1)) : "0",
      Status: r.status || "",
      "Geofence": r.geofence?.name || "",
      "Clock In Lat": String(r.clockInLat ?? ""),
      "Clock In Lng": String(r.clockInLng ?? ""),
      "Clock Out Lat": String(r.clockOutLat ?? ""),
      "Clock Out Lng": String(r.clockOutLng ?? ""),
    };
  });

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
