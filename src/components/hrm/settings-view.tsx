"use client";

import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Building2,
  Clock,
  DollarSign,
  Bell,
  Shield,
  Save,
  MapPin,
  Globe,
  Image as ImageIcon,
  Timer,
  AlertTriangle,
  CheckCircle2,
  Lock,
  MonitorSmartphone,
  Eye,
  FileText,
  CalendarDays,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";

// ─── Simulated Audit Log Data ─────────────────────────────────────
const AUDIT_LOG = [
  { id: 1, timestamp: "2025-01-15 14:32:08", user: "admin@msbm.com", action: "Employee Created", details: "Created employee profile for Grace Park", severity: "info" },
  { id: 2, timestamp: "2025-01-15 13:15:44", user: "john.doe@msbm.com", action: "Payroll Processed", details: "Processed payroll for period Jan 1-15, 2025", severity: "success" },
  { id: 3, timestamp: "2025-01-15 11:22:17", user: "admin@msbm.com", action: "Settings Updated", details: "Updated overtime threshold to 40 hours/week", severity: "info" },
  { id: 4, timestamp: "2025-01-14 16:48:31", user: "sarah.jones@msbm.com", action: "PTO Approved", details: "Approved 3-day vacation for Alice Chen", severity: "success" },
  { id: 5, timestamp: "2025-01-14 10:05:22", user: "mike.wilson@msbm.com", action: "Geofence Modified", details: "Updated HQ Office geofence radius to 300m", severity: "warning" },
  { id: 6, timestamp: "2025-01-14 09:12:55", user: "admin@msbm.com", action: "User Login", details: "Successful login from IP 192.168.1.105", severity: "info" },
  { id: 7, timestamp: "2025-01-13 15:33:19", user: "unknown@external.com", action: "Failed Login", details: "Failed login attempt (invalid credentials)", severity: "error" },
  { id: 8, timestamp: "2025-01-13 14:20:41", user: "hr.manager@msbm.com", action: "Employee Updated", details: "Updated department for Bob Martinez to Sales", severity: "info" },
  { id: 9, timestamp: "2025-01-13 09:45:07", user: "admin@msbm.com", action: "Security Settings", details: "Enabled two-factor authentication requirement", severity: "success" },
  { id: 10, timestamp: "2025-01-12 17:08:53", user: "john.doe@msbm.com", action: "Report Exported", details: "Exported attendance report for Q4 2024", severity: "info" },
  { id: 11, timestamp: "2025-01-12 11:30:15", user: "admin@msbm.com", action: "Role Changed", details: "Promoted Eva Thompson to Senior Software Engineer", severity: "warning" },
  { id: 12, timestamp: "2025-01-11 16:22:38", user: "sarah.jones@msbm.com", action: "PTO Denied", details: "Denied PTO request from Frank Lopez (insufficient balance)", severity: "error" },
];

// ─── Severity Badge Helper ────────────────────────────────────────
function SeverityBadge({ severity }: { severity: string }) {
  const config: Record<string, { className: string; icon: React.ElementType }> = {
    info: {
      className: "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300 border-blue-200 dark:border-blue-800",
      icon: FileText,
    },
    success: {
      className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
      icon: CheckCircle2,
    },
    warning: {
      className: "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300 border-amber-200 dark:border-amber-800",
      icon: AlertTriangle,
    },
    error: {
      className: "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300 border-red-200 dark:border-red-800",
      icon: AlertTriangle,
    },
  };
  const c = config[severity] || config.info;
  const Icon = c.icon;
  return (
    <Badge variant="outline" className={`text-[10px] gap-1 ${c.className}`}>
      <Icon className="h-3 w-3" />
      {severity}
    </Badge>
  );
}

// ─── Settings Section Wrapper ─────────────────────────────────────
function SettingsSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        {description && (
          <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
        )}
      </div>
      <div className="space-y-4 pl-0.5">{children}</div>
      <Separator />
    </div>
  );
}

// ─── Setting Row ──────────────────────────────────────────────────
function SettingRow({
  label,
  description,
  children,
}: {
  label: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 py-1">
      <div className="space-y-0.5">
        <Label className="text-sm font-medium">{label}</Label>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────
export function SettingsView() {
  // ─── Company Settings State ─────────────────────────────────────
  const [companyName, setCompanyName] = useState("MSBM Technologies Inc.");
  const [companyAddress, setCompanyAddress] = useState("1234 Innovation Drive, Suite 500, San Francisco, CA 94102");
  const [companyTimezone, setCompanyTimezone] = useState("America/Los_Angeles");

  // ─── Attendance Settings State ──────────────────────────────────
  const [geofenceRadius, setGeofenceRadius] = useState("300");
  const [allowClockInWithoutGeofence, setAllowClockInWithoutGeofence] = useState(false);
  const [autoClockOutHours, setAutoClockOutHours] = useState("12");
  const [attendanceRounding, setAttendanceRounding] = useState("15min");
  const [overtimeThreshold, setOvertimeThreshold] = useState("40");

  // ─── Payroll Settings State ────────────────────────────────────
  const [payPeriodType, setPayPeriodType] = useState("bi-weekly");
  const [payDateOfMonth, setPayDateOfMonth] = useState("15");
  const [overtimeMultiplier, setOvertimeMultiplier] = useState("1.5");
  const [taxFilingDefault, setTaxFilingDefault] = useState("single");
  const [healthInsurance, setHealthInsurance] = useState("350");
  const [retirement401k, setRetirement401k] = useState("5");

  // ─── Notification Settings State ────────────────────────────────
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [clockReminders, setClockReminders] = useState(true);
  const [ptoAlerts, setPtoAlerts] = useState(true);
  const [payrollAlerts, setPayrollAlerts] = useState(true);
  const [complianceAlerts, setComplianceAlerts] = useState(false);

  // ─── Security Settings State ───────────────────────────────────
  const [sessionTimeout, setSessionTimeout] = useState("30min");
  const [twoFactor, setTwoFactor] = useState(false);

  // ─── Handlers ──────────────────────────────────────────────────
  const handleSaveCompany = () => {
    toast.success("Company settings saved", {
      description: "Your company information has been updated successfully.",
    });
  };

  const handleSaveAttendance = () => {
    toast.success("Attendance settings saved", {
      description: "Attendance policies have been updated.",
    });
  };

  const handleSavePayroll = () => {
    toast.success("Payroll settings saved", {
      description: "Payroll configuration has been updated.",
    });
  };

  const handleSaveNotifications = () => {
    toast.success("Notification preferences saved", {
      description: "Your notification settings have been updated.",
    });
  };

  const handleSaveSecurity = () => {
    toast.success("Security settings saved", {
      description: "Security configuration has been updated.",
    });
  };

  // ─── Render ─────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
          <p className="text-sm text-muted-foreground">
            Manage your organization&apos;s configuration and preferences.
          </p>
        </div>
        <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300 w-fit">
          <ShieldCheck className="h-3.5 w-3.5 mr-1" />
          Admin Access
        </Badge>
      </div>

      {/* ─── Tabbed Content ─────────────────────────────────────── */}
      <Tabs defaultValue="company" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
          <TabsTrigger value="company" className="gap-1.5 text-xs sm:text-sm">
            <Building2 className="h-4 w-4 hidden sm:block" />
            Company
          </TabsTrigger>
          <TabsTrigger value="attendance" className="gap-1.5 text-xs sm:text-sm">
            <Clock className="h-4 w-4 hidden sm:block" />
            Attendance
          </TabsTrigger>
          <TabsTrigger value="payroll" className="gap-1.5 text-xs sm:text-sm">
            <DollarSign className="h-4 w-4 hidden sm:block" />
            Payroll
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-1.5 text-xs sm:text-sm">
            <Bell className="h-4 w-4 hidden sm:block" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-1.5 text-xs sm:text-sm">
            <Shield className="h-4 w-4 hidden sm:block" />
            Security
          </TabsTrigger>
        </TabsList>

        {/* ═══════════════════════════════════════════════════════ */}
        {/* TAB 1: COMPANY SETTINGS                                */}
        {/* ═══════════════════════════════════════════════════════ */}
        <TabsContent value="company" className="space-y-6">
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="text-base font-semibold">Company Information</CardTitle>
              <CardDescription>
                Manage your organization&apos;s basic details and branding.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Logo Placeholder */}
              <div className="flex items-center gap-6">
                <div className="flex items-center justify-center h-20 w-20 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border-2 border-dashed border-emerald-200 dark:border-emerald-800 transition-colors hover:border-emerald-400">
                  <ImageIcon className="h-8 w-8 text-emerald-400" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">Company Logo</p>
                  <p className="text-xs text-muted-foreground">
                    Recommended: 200x200px, PNG or SVG format
                  </p>
                  <Button variant="outline" size="sm" className="mt-1 text-xs gap-1.5">
                    <ImageIcon className="h-3.5 w-3.5" />
                    Upload Logo
                  </Button>
                </div>
              </div>

              <Separator />

              <SettingsSection title="General Information">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="company-name" className="text-sm font-medium">Company Name</Label>
                    <Input
                      id="company-name"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="Enter company name"
                      className="max-w-md"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="timezone" className="text-sm font-medium">Timezone</Label>
                    <Select value={companyTimezone} onValueChange={setCompanyTimezone}>
                      <SelectTrigger id="timezone" className="max-w-md">
                        <Globe className="h-4 w-4 text-muted-foreground mr-2" />
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="America/Los_Angeles">Pacific Time (PT)</SelectItem>
                        <SelectItem value="America/Denver">Mountain Time (MT)</SelectItem>
                        <SelectItem value="America/Chicago">Central Time (CT)</SelectItem>
                        <SelectItem value="America/New_York">Eastern Time (ET)</SelectItem>
                        <SelectItem value="Europe/London">GMT (London)</SelectItem>
                        <SelectItem value="Asia/Tokyo">Japan Standard Time</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company-address" className="text-sm font-medium">Address</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="company-address"
                      value={companyAddress}
                      onChange={(e) => setCompanyAddress(e.target.value)}
                      placeholder="Enter company address"
                      className="pl-10 max-w-lg"
                    />
                  </div>
                </div>
              </SettingsSection>

              <div className="flex justify-end">
                <Button onClick={handleSaveCompany} className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white">
                  <Save className="h-4 w-4" />
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ═══════════════════════════════════════════════════════ */}
        {/* TAB 2: ATTENDANCE SETTINGS                            */}
        {/* ═══════════════════════════════════════════════════════ */}
        <TabsContent value="attendance" className="space-y-6">
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="text-base font-semibold">Attendance Configuration</CardTitle>
              <CardDescription>
                Set up geofence rules, clock-in policies, and overtime thresholds.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <SettingsSection title="Geofence Settings" description="Configure location-based clock-in requirements.">
                <SettingRow
                  label="Default Geofence Radius"
                  description="Radius in meters around each geofence location"
                >
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      value={geofenceRadius}
                      onChange={(e) => setGeofenceRadius(e.target.value)}
                      className="w-28"
                      min="50"
                      max="2000"
                    />
                    <span className="text-sm text-muted-foreground">meters</span>
                  </div>
                </SettingRow>
                <SettingRow
                  label="Allow Clock-in Without Geofence"
                  description="Let employees clock in when outside geofence boundaries"
                >
                  <Switch
                    checked={allowClockInWithoutGeofence}
                    onCheckedChange={setAllowClockInWithoutGeofence}
                  />
                </SettingRow>
              </SettingsSection>

              <SettingsSection title="Clock-in / Clock-out Rules" description="Define automated clock-out and rounding policies.">
                <SettingRow
                  label="Auto Clock-out After"
                  description="Automatically clock out employees after this many hours"
                >
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      value={autoClockOutHours}
                      onChange={(e) => setAutoClockOutHours(e.target.value)}
                      className="w-28"
                      min="4"
                      max="24"
                    />
                    <span className="text-sm text-muted-foreground">hours</span>
                  </div>
                </SettingRow>
                <SettingRow
                  label="Attendance Rounding"
                  description="Round clock-in/out times to the nearest interval"
                >
                  <Select value={attendanceRounding} onValueChange={setAttendanceRounding}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No Rounding</SelectItem>
                      <SelectItem value="5min">5 Minutes</SelectItem>
                      <SelectItem value="15min">15 Minutes</SelectItem>
                      <SelectItem value="30min">30 Minutes</SelectItem>
                    </SelectContent>
                  </Select>
                </SettingRow>
              </SettingsSection>

              <SettingsSection title="Overtime Rules" description="Define when overtime pay kicks in.">
                <SettingRow
                  label="Overtime Threshold"
                  description="Number of hours per week before overtime applies"
                >
                  <div className="flex items-center gap-2">
                    <Timer className="h-4 w-4 text-muted-foreground" />
                    <Input
                      type="number"
                      value={overtimeThreshold}
                      onChange={(e) => setOvertimeThreshold(e.target.value)}
                      className="w-28"
                      min="0"
                      max="60"
                    />
                    <span className="text-sm text-muted-foreground">hrs/week</span>
                  </div>
                </SettingRow>
              </SettingsSection>

              <div className="flex justify-end">
                <Button onClick={handleSaveAttendance} className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white">
                  <Save className="h-4 w-4" />
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ═══════════════════════════════════════════════════════ */}
        {/* TAB 3: PAYROLL SETTINGS                                */}
        {/* ═══════════════════════════════════════════════════════ */}
        <TabsContent value="payroll" className="space-y-6">
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="text-base font-semibold">Payroll Configuration</CardTitle>
              <CardDescription>
                Configure pay periods, tax defaults, and benefit deductions.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <SettingsSection title="Pay Schedule" description="Define how often payroll is processed.">
                <SettingRow
                  label="Pay Period Type"
                  description="Frequency of payroll processing"
                >
                  <Select value={payPeriodType} onValueChange={setPayPeriodType}>
                    <SelectTrigger className="w-44">
                      <CalendarDays className="h-4 w-4 text-muted-foreground mr-2" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="bi-weekly">Bi-Weekly</SelectItem>
                      <SelectItem value="semi-monthly">Semi-Monthly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </SettingRow>
                <SettingRow
                  label="Pay Date of Month"
                  description="Day of the month employees receive pay (1-31)"
                >
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      value={payDateOfMonth}
                      onChange={(e) => setPayDateOfMonth(e.target.value)}
                      className="w-28"
                      min="1"
                      max="31"
                    />
                    <span className="text-sm text-muted-foreground">day</span>
                  </div>
                </SettingRow>
              </SettingsSection>

              <SettingsSection title="Overtime & Tax" description="Configure overtime rates and default tax filing status.">
                <SettingRow
                  label="Overtime Rate Multiplier"
                  description="Multiplier applied to regular hourly rate for overtime"
                >
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      value={overtimeMultiplier}
                      onChange={(e) => setOvertimeMultiplier(e.target.value)}
                      className="w-28"
                      min="1"
                      max="3"
                      step="0.1"
                    />
                    <span className="text-sm text-muted-foreground">x</span>
                  </div>
                </SettingRow>
                <SettingRow
                  label="Default Tax Filing Status"
                  description="Applied to new employees without a specified status"
                >
                  <Select value={taxFilingDefault} onValueChange={setTaxFilingDefault}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="single">Single</SelectItem>
                      <SelectItem value="married">Married</SelectItem>
                    </SelectContent>
                  </Select>
                </SettingRow>
              </SettingsSection>

              <SettingsSection title="Benefit Deductions" description="Default deduction amounts for employee benefits.">
                <SettingRow
                  label="Health Insurance"
                  description="Monthly employee health insurance contribution"
                >
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <Input
                      type="number"
                      value={healthInsurance}
                      onChange={(e) => setHealthInsurance(e.target.value)}
                      className="w-32"
                      min="0"
                    />
                    <span className="text-sm text-muted-foreground">/month</span>
                  </div>
                </SettingRow>
                <SettingRow
                  label="401(k) Match"
                  description="Employer 401(k) match percentage"
                >
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      value={retirement401k}
                      onChange={(e) => setRetirement401k(e.target.value)}
                      className="w-28"
                      min="0"
                      max="10"
                    />
                    <span className="text-sm text-muted-foreground">% match</span>
                  </div>
                </SettingRow>
              </SettingsSection>

              <div className="flex justify-end">
                <Button onClick={handleSavePayroll} className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white">
                  <Save className="h-4 w-4" />
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ═══════════════════════════════════════════════════════ */}
        {/* TAB 4: NOTIFICATION SETTINGS                          */}
        {/* ═══════════════════════════════════════════════════════ */}
        <TabsContent value="notifications" className="space-y-6">
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="text-base font-semibold">Notification Preferences</CardTitle>
              <CardDescription>
                Configure which notifications are sent to managers and employees.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <SettingsSection title="Communication Channels" description="Enable or disable notification delivery methods.">
                <SettingRow
                  label="Email Notifications"
                  description="Send notifications via email to users"
                >
                  <Switch
                    checked={emailNotifications}
                    onCheckedChange={setEmailNotifications}
                  />
                </SettingRow>
              </SettingsSection>

              <SettingsSection title="Alert Types" description="Choose which events trigger notifications.">
                <SettingRow
                  label="Clock-in/out Reminders"
                  description="Remind employees to clock in at shift start and clock out at end of day"
                >
                  <Switch
                    checked={clockReminders}
                    onCheckedChange={setClockReminders}
                  />
                </SettingRow>
                <SettingRow
                  label="PTO Request Alerts"
                  description="Notify managers when new PTO requests are submitted"
                >
                  <Switch
                    checked={ptoAlerts}
                    onCheckedChange={setPtoAlerts}
                  />
                </SettingRow>
                <SettingRow
                  label="Payroll Processing Alerts"
                  description="Notify admins when payroll is processed or encounters errors"
                >
                  <Switch
                    checked={payrollAlerts}
                    onCheckedChange={setPayrollAlerts}
                  />
                </SettingRow>
                <SettingRow
                  label="Compliance Alerts"
                  description="Alerts for overtime violations, missing breaks, and labor law issues"
                >
                  <Switch
                    checked={complianceAlerts}
                    onCheckedChange={setComplianceAlerts}
                  />
                </SettingRow>
              </SettingsSection>

              <div className="flex justify-end">
                <Button onClick={handleSaveNotifications} className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white">
                  <Save className="h-4 w-4" />
                  Save Preferences
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Notification Preview */}
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="text-base font-semibold">Notification Summary</CardTitle>
              <CardDescription>Current active notification configuration</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className={`p-4 rounded-xl border transition-colors ${emailNotifications ? "border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20" : "border-border bg-muted/30"}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <MonitorSmartphone className={`h-4 w-4 ${emailNotifications ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"}`} />
                    <span className="text-sm font-medium">Email</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{emailNotifications ? "Active" : "Disabled"}</p>
                </div>
                <div className={`p-4 rounded-xl border transition-colors ${clockReminders ? "border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20" : "border-border bg-muted/30"}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <Clock className={`h-4 w-4 ${clockReminders ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"}`} />
                    <span className="text-sm font-medium">Clock Reminders</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{clockReminders ? "Active" : "Disabled"}</p>
                </div>
                <div className={`p-4 rounded-xl border transition-colors ${ptoAlerts ? "border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20" : "border-border bg-muted/30"}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <CalendarDays className={`h-4 w-4 ${ptoAlerts ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"}`} />
                    <span className="text-sm font-medium">PTO Alerts</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{ptoAlerts ? "Active" : "Disabled"}</p>
                </div>
                <div className={`p-4 rounded-xl border transition-colors ${payrollAlerts ? "border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20" : "border-border bg-muted/30"}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <DollarSign className={`h-4 w-4 ${payrollAlerts ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"}`} />
                    <span className="text-sm font-medium">Payroll Alerts</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{payrollAlerts ? "Active" : "Disabled"}</p>
                </div>
                <div className={`p-4 rounded-xl border transition-colors ${complianceAlerts ? "border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20" : "border-border bg-muted/30"}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <ShieldCheck className={`h-4 w-4 ${complianceAlerts ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"}`} />
                    <span className="text-sm font-medium">Compliance</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{complianceAlerts ? "Active" : "Disabled"}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ═══════════════════════════════════════════════════════ */}
        {/* TAB 5: SECURITY & AUDIT                               */}
        {/* ═══════════════════════════════════════════════════════ */}
        <TabsContent value="security" className="space-y-6">
          {/* Security Settings */}
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="text-base font-semibold">Security Configuration</CardTitle>
              <CardDescription>
                Manage session policies and authentication settings.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <SettingsSection title="Session Management" description="Control how user sessions are handled.">
                <SettingRow
                  label="Session Timeout"
                  description="Automatically log out inactive users after this duration"
                >
                  <Select value={sessionTimeout} onValueChange={setSessionTimeout}>
                    <SelectTrigger className="w-36">
                      <Timer className="h-4 w-4 text-muted-foreground mr-2" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15min">15 minutes</SelectItem>
                      <SelectItem value="30min">30 minutes</SelectItem>
                      <SelectItem value="1hr">1 hour</SelectItem>
                      <SelectItem value="4hr">4 hours</SelectItem>
                    </SelectContent>
                  </Select>
                </SettingRow>
              </SettingsSection>

              <SettingsSection title="Authentication" description="Configure multi-factor and access controls.">
                <SettingRow
                  label="Two-Factor Authentication"
                  description="Require 2FA for all users (contact IT admin to enable)"
                >
                  <Switch
                    checked={twoFactor}
                    onCheckedChange={setTwoFactor}
                    disabled
                  />
                </SettingRow>
              </SettingsSection>

              {/* Last Login Info */}
              <div className="rounded-xl border border-border p-4 bg-muted/30">
                <div className="flex items-center gap-2 mb-3">
                  <Eye className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-sm font-semibold">Last Login Information</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-xs text-muted-foreground">User</p>
                    <p className="font-medium">admin@msbm.com</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Time</p>
                    <p className="font-medium">Jan 15, 2025 at 2:32 PM</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">IP Address</p>
                    <p className="font-medium font-mono">192.168.1.105</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleSaveSecurity} className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white">
                  <Save className="h-4 w-4" />
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Audit Log */}
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-semibold">Audit Log</CardTitle>
                  <CardDescription>Recent system activity and changes</CardDescription>
                </div>
                <Badge variant="secondary" className="bg-teal-100 text-teal-700 dark:bg-teal-900/50 dark:text-teal-300">
                  {AUDIT_LOG.length} entries
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="max-h-96 overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[40px]" />
                      <TableHead>Timestamp</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead className="hidden md:table-cell">Details</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {AUDIT_LOG.map((entry) => (
                      <TableRow key={entry.id}>
                        <TableCell>
                          <SeverityBadge severity={entry.severity} />
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                          {entry.timestamp}
                        </TableCell>
                        <TableCell className="font-mono text-xs">{entry.user}</TableCell>
                        <TableCell>
                          <span className="text-sm font-medium">{entry.action}</span>
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-xs text-muted-foreground max-w-xs truncate">
                          {entry.details}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
