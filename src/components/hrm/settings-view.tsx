"use client";

import React, { useState, useEffect, useCallback } from "react";
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
  Loader2,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";

// ─── Types ────────────────────────────────────────────────────
interface CompanySettings {
  id: string;
  companyId: string;
  companyName: string;
  companyAddress: string;
  companyPhone: string;
  companyEmail: string;
  companyWebsite: string;
  attendanceGracePeriod: number;
  autoClockOutHours: number;
  requireGeofence: boolean;
  overtimeThreshold: number;
  payrollFrequency: string;
  payPeriodStartDay: number;
  taxFilingDefault: string;
  overtimeMultiplier: number;
  emailNotifications: boolean;
  pushNotifications: boolean;
  payrollAlerts: boolean;
  ptoAlerts: boolean;
  complianceAlerts: boolean;
  twoFactorAuth: boolean;
  sessionTimeout: number;
  passwordMinLength: number;
  createdAt: string;
  updatedAt: string;
}

// ─── Simulated Audit Log Data ─────────────────────────────────────
const AUDIT_LOG = [
  { id: 1, timestamp: "2025-01-15 14:32:08", user: "admin@uwi.edu", action: "Employee Created", details: "Created employee profile for Grace Park", severity: "info" },
  { id: 2, timestamp: "2025-01-15 13:15:44", user: "john.doe@uwi.edu", action: "Payroll Processed", details: "Processed payroll for period Jan 1-15, 2025", severity: "success" },
  { id: 3, timestamp: "2025-01-15 11:22:17", user: "admin@uwi.edu", action: "Settings Updated", details: "Updated overtime threshold to 40 hours/week", severity: "info" },
  { id: 4, timestamp: "2025-01-14 16:48:31", user: "sarah.jones@uwi.edu", action: "PTO Approved", details: "Approved 3-day vacation for Alice Chen", severity: "success" },
  { id: 5, timestamp: "2025-01-14 10:05:22", user: "mike.wilson@uwi.edu", action: "Geofence Modified", details: "Updated HQ Office geofence radius to 300m", severity: "warning" },
  { id: 6, timestamp: "2025-01-14 09:12:55", user: "admin@uwi.edu", action: "User Login", details: "Successful login from IP 192.168.1.105", severity: "info" },
  { id: 7, timestamp: "2025-01-13 15:33:19", user: "unknown@external.com", action: "Failed Login", details: "Failed login attempt (invalid credentials)", severity: "error" },
  { id: 8, timestamp: "2025-01-13 14:20:41", user: "hr.manager@uwi.edu", action: "Employee Updated", details: "Updated department for Bob Martinez to Sales", severity: "info" },
  { id: 9, timestamp: "2025-01-13 09:45:07", user: "admin@uwi.edu", action: "Security Settings", details: "Enabled two-factor authentication requirement", severity: "success" },
  { id: 10, timestamp: "2025-01-12 17:08:53", user: "john.doe@uwi.edu", action: "Report Exported", details: "Exported attendance report for Q4 2024", severity: "info" },
  { id: 11, timestamp: "2025-01-12 11:30:15", user: "admin@uwi.edu", action: "Role Changed", details: "Promoted Eva Thompson to Senior Software Engineer", severity: "warning" },
  { id: 12, timestamp: "2025-01-11 16:22:38", user: "sarah.jones@uwi.edu", action: "PTO Denied", details: "Denied PTO request from Frank Lopez (insufficient balance)", severity: "error" },
];

// ─── Severity Badge Helper ────────────────────────────────────────
function SeverityBadge({ severity }: { severity: string }) {
  const config: Record<string, { className: string; icon: React.ElementType }> = {
    info: {
      className: "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300 border-blue-200 dark:border-blue-800",
      icon: FileText,
    },
    success: {
      className: "bg-msbm-red/10 text-msbm-red dark:bg-msbm-red/20 dark:text-msbm-red-bright border-msbm-red/20 dark:border-msbm-red/20",
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

// ─── Loading Skeleton ─────────────────────────────────────────────
function SettingsSkeleton() {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <div className="skeleton-shimmer h-8 w-48 rounded-md" />
          <div className="skeleton-shimmer h-4 w-80 rounded-md mt-2" />
        </div>
      </div>
      <Card>
        <CardHeader>
          <div className="skeleton-shimmer h-6 w-48 rounded-md" />
          <div className="skeleton-shimmer h-4 w-72 rounded-md mt-1" />
        </CardHeader>
        <CardContent className="space-y-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="skeleton-text w-32" />
              <div className="skeleton-shimmer h-10 w-64 rounded-md" />
            </div>
          ))}
        </CardContent>
      </Card>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="skeleton-card">
            <div className="skeleton-circle h-8 w-8 mb-3" />
            <div className="skeleton-text w-24 mb-2" />
            <div className="skeleton-text-sm w-16" />
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Save Button ──────────────────────────────────────────────────
function SaveButton({ isSaving, onClick, label }: { isSaving: boolean; onClick: () => void; label?: string }) {
  return (
    <Button
      onClick={onClick}
      disabled={isSaving}
      className="gap-2 bg-msbm-red hover:bg-msbm-red/80 text-white disabled:opacity-60"
    >
      {isSaving ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Save className="h-4 w-4" />
      )}
      {label ?? "Save Changes"}
    </Button>
  );
}

// ─── Format Date Helper ───────────────────────────────────────────
function formatLastUpdated(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return "Unknown";
  }
}

// ─── Main Component ────────────────────────────────────────────────
export function SettingsView() {
  // ─── Data State ─────────────────────────────────────────────
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  // ─── Company Settings State ─────────────────────────────────
  const [companyName, setCompanyName] = useState("MSBM Technologies Inc.");
  const [companyAddress, setCompanyAddress] = useState("1234 Innovation Drive, Suite 500, San Francisco, CA 94102");
  const [companyPhone, setCompanyPhone] = useState("(555) 100-1000");
  const [companyEmail, setCompanyEmail] = useState("info@uwi.edu");
  const [companyWebsite, setCompanyWebsite] = useState("https://msbm-uwi.org/");

  // ─── Attendance Settings State ──────────────────────────────
  const [attendanceGracePeriod, setAttendanceGracePeriod] = useState("5");
  const [autoClockOutHours, setAutoClockOutHours] = useState("12");
  const [requireGeofence, setRequireGeofence] = useState(true);
  const [overtimeThreshold, setOvertimeThreshold] = useState("40");

  // ─── Payroll Settings State ────────────────────────────────
  const [payPeriodType, setPayPeriodType] = useState("biweekly");
  const [payPeriodStartDay, setPayPeriodStartDay] = useState("15");
  const [overtimeMultiplier, setOvertimeMultiplier] = useState("1.5");
  const [taxFilingDefault, setTaxFilingDefault] = useState("single");

  // ─── Notification Settings State ────────────────────────────
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [ptoAlerts, setPtoAlerts] = useState(true);
  const [payrollAlerts, setPayrollAlerts] = useState(true);
  const [complianceAlerts, setComplianceAlerts] = useState(false);

  // ─── Security Settings State ───────────────────────────────
  const [sessionTimeout, setSessionTimeout] = useState("30min");
  const [twoFactor, setTwoFactor] = useState(false);
  const [passwordMinLength, setPasswordMinLength] = useState("8");

  // ─── Fetch Settings ──────────────────────────────────────────
  const fetchSettings = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/settings");
      if (!res.ok) throw new Error("Failed to fetch settings");
      const { settings } = await res.json();
      const s = settings as CompanySettings;

      // Populate company state
      setCompanyName(s.companyName);
      setCompanyAddress(s.companyAddress);
      setCompanyPhone(s.companyPhone);
      setCompanyEmail(s.companyEmail);
      setCompanyWebsite(s.companyWebsite);

      // Populate attendance state
      setAttendanceGracePeriod(String(s.attendanceGracePeriod));
      setAutoClockOutHours(String(s.autoClockOutHours));
      setRequireGeofence(s.requireGeofence);
      setOvertimeThreshold(String(s.overtimeThreshold));

      // Populate payroll state
      setPayPeriodType(s.payrollFrequency);
      setPayPeriodStartDay(String(s.payPeriodStartDay));
      setOvertimeMultiplier(String(s.overtimeMultiplier));
      setTaxFilingDefault(s.taxFilingDefault);

      // Populate notification state
      setEmailNotifications(s.emailNotifications);
      setPushNotifications(s.pushNotifications);
      setPtoAlerts(s.ptoAlerts);
      setPayrollAlerts(s.payrollAlerts);
      setComplianceAlerts(s.complianceAlerts);

      // Populate security state
      setSessionTimeout(s.sessionTimeout + "min");
      setTwoFactor(s.twoFactorAuth);
      setPasswordMinLength(String(s.passwordMinLength));

      setLastUpdated(s.updatedAt);
    } catch (error) {
      console.error("Error loading settings:", error);
      toast.error("Failed to load settings", {
        description: "Could not fetch settings from the server. Using defaults.",
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  // ─── Save Handler ────────────────────────────────────────────
  const saveSettings = async (data: Record<string, unknown>, successMessage: string) => {
    setIsSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to save settings");
      const { settings } = await res.json();
      setLastUpdated((settings as CompanySettings).updatedAt);
      toast.success(successMessage, {
        description: "Your settings have been updated and saved.",
      });
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error("Failed to save settings", {
        description: "There was an error saving your changes. Please try again.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // ─── Individual Save Handlers ────────────────────────────────
  const handleSaveCompany = () => {
    saveSettings(
      {
        companyName,
        companyAddress,
        companyPhone,
        companyEmail,
        companyWebsite,
      },
      "Company settings saved"
    );
  };

  const handleSaveAttendance = () => {
    saveSettings(
      {
        attendanceGracePeriod: parseInt(attendanceGracePeriod) || 5,
        autoClockOutHours: parseInt(autoClockOutHours) || 10,
        requireGeofence,
        overtimeThreshold: parseInt(overtimeThreshold) || 8,
      },
      "Attendance settings saved"
    );
  };

  const handleSavePayroll = () => {
    saveSettings(
      {
        payrollFrequency: payPeriodType,
        payPeriodStartDay: parseInt(payPeriodStartDay) || 1,
        overtimeMultiplier: parseFloat(overtimeMultiplier) || 1.5,
        taxFilingDefault,
      },
      "Payroll settings saved"
    );
  };

  const handleSaveNotifications = () => {
    saveSettings(
      {
        emailNotifications,
        pushNotifications,
        ptoAlerts,
        payrollAlerts,
        complianceAlerts,
      },
      "Notification preferences saved"
    );
  };

  const handleSaveSecurity = () => {
    const timeoutMinutes = parseInt(sessionTimeout) || 30;
    saveSettings(
      {
        twoFactorAuth: twoFactor,
        sessionTimeout: timeoutMinutes,
        passwordMinLength: parseInt(passwordMinLength) || 8,
      },
      "Security settings saved"
    );
  };

  // ─── Loading State ──────────────────────────────────────────
  if (isLoading) {
    return <SettingsSkeleton />;
  }

  // ─── Render ─────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
          <p className="text-sm text-muted-foreground">
            Manage your organization&apos;s configuration and preferences.
          </p>
          {lastUpdated && (
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <RefreshCw className="h-3 w-3" />
              Last updated: {formatLastUpdated(lastUpdated)}
            </p>
          )}
        </div>
        <Badge variant="secondary" className="bg-msbm-red/10 text-msbm-red dark:bg-msbm-red/20 dark:text-msbm-red-bright w-fit">
          <ShieldCheck className="h-3.5 w-3.5 mr-1" />
          Admin Access
        </Badge>
      </div>

      {/* ─── Tabbed Content ─────────────────────────────────── */}
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
                <div className="flex items-center justify-center h-20 w-20 rounded-2xl bg-msbm-red/5 dark:bg-msbm-red/10 border-2 border-dashed border-msbm-red/20 dark:border-msbm-red/20 transition-colors hover:border-msbm-red-bright">
                  <ImageIcon className="h-8 w-8 text-msbm-red-bright" />
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
                    <Label htmlFor="company-email" className="text-sm font-medium">Contact Email</Label>
                    <Input
                      id="company-email"
                      type="email"
                      value={companyEmail}
                      onChange={(e) => setCompanyEmail(e.target.value)}
                      placeholder="contact@company.com"
                      className="max-w-md"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="company-phone" className="text-sm font-medium">Phone Number</Label>
                    <Input
                      id="company-phone"
                      value={companyPhone}
                      onChange={(e) => setCompanyPhone(e.target.value)}
                      placeholder="(555) 000-0000"
                      className="max-w-md"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company-website" className="text-sm font-medium">Website</Label>
                    <Input
                      id="company-website"
                      value={companyWebsite}
                      onChange={(e) => setCompanyWebsite(e.target.value)}
                      placeholder="https://company.com"
                      className="max-w-md"
                    />
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
                <SaveButton isSaving={isSaving} onClick={handleSaveCompany} />
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
                  label="Attendance Grace Period"
                  description="Minutes after shift start before marking employee as late"
                >
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      value={attendanceGracePeriod}
                      onChange={(e) => setAttendanceGracePeriod(e.target.value)}
                      className="w-28"
                      min="0"
                      max="60"
                    />
                    <span className="text-sm text-muted-foreground">minutes</span>
                  </div>
                </SettingRow>
                <SettingRow
                  label="Require Geofence for Clock-in"
                  description="Employees must be within geofence boundaries to clock in"
                >
                  <Switch
                    checked={requireGeofence}
                    onCheckedChange={setRequireGeofence}
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
                <SaveButton isSaving={isSaving} onClick={handleSaveAttendance} />
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
                      <SelectItem value="biweekly">Bi-Weekly</SelectItem>
                      <SelectItem value="semimonthly">Semi-Monthly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </SettingRow>
                <SettingRow
                  label="Pay Period Start Day"
                  description="Day of the month the pay period starts (1-31)"
                >
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      value={payPeriodStartDay}
                      onChange={(e) => setPayPeriodStartDay(e.target.value)}
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

              <div className="flex justify-end">
                <SaveButton isSaving={isSaving} onClick={handleSavePayroll} />
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
                <SettingRow
                  label="Push Notifications"
                  description="Send push notifications to mobile devices"
                >
                  <Switch
                    checked={pushNotifications}
                    onCheckedChange={setPushNotifications}
                  />
                </SettingRow>
              </SettingsSection>

              <SettingsSection title="Alert Types" description="Choose which events trigger notifications.">
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
                <SaveButton isSaving={isSaving} onClick={handleSaveNotifications} label="Save Preferences" />
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
                <div className={`p-4 rounded-xl border transition-colors ${emailNotifications ? "border-msbm-red/20 dark:border-msbm-red/20 bg-msbm-red/5/50 dark:bg-msbm-red/10" : "border-border bg-muted/30"}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <MonitorSmartphone className={`h-4 w-4 ${emailNotifications ? "text-msbm-red dark:text-msbm-red-bright" : "text-muted-foreground"}`} />
                    <span className="text-sm font-medium">Email</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{emailNotifications ? "Active" : "Disabled"}</p>
                </div>
                <div className={`p-4 rounded-xl border transition-colors ${pushNotifications ? "border-msbm-red/20 dark:border-msbm-red/20 bg-msbm-red/5/50 dark:bg-msbm-red/10" : "border-border bg-muted/30"}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <Bell className={`h-4 w-4 ${pushNotifications ? "text-msbm-red dark:text-msbm-red-bright" : "text-muted-foreground"}`} />
                    <span className="text-sm font-medium">Push</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{pushNotifications ? "Active" : "Disabled"}</p>
                </div>
                <div className={`p-4 rounded-xl border transition-colors ${ptoAlerts ? "border-msbm-red/20 dark:border-msbm-red/20 bg-msbm-red/5/50 dark:bg-msbm-red/10" : "border-border bg-muted/30"}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <CalendarDays className={`h-4 w-4 ${ptoAlerts ? "text-msbm-red dark:text-msbm-red-bright" : "text-muted-foreground"}`} />
                    <span className="text-sm font-medium">PTO Alerts</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{ptoAlerts ? "Active" : "Disabled"}</p>
                </div>
                <div className={`p-4 rounded-xl border transition-colors ${payrollAlerts ? "border-msbm-red/20 dark:border-msbm-red/20 bg-msbm-red/5/50 dark:bg-msbm-red/10" : "border-border bg-muted/30"}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <DollarSign className={`h-4 w-4 ${payrollAlerts ? "text-msbm-red dark:text-msbm-red-bright" : "text-muted-foreground"}`} />
                    <span className="text-sm font-medium">Payroll Alerts</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{payrollAlerts ? "Active" : "Disabled"}</p>
                </div>
                <div className={`p-4 rounded-xl border transition-colors ${complianceAlerts ? "border-msbm-red/20 dark:border-msbm-red/20 bg-msbm-red/5/50 dark:bg-msbm-red/10" : "border-border bg-muted/30"}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <ShieldCheck className={`h-4 w-4 ${complianceAlerts ? "text-msbm-red dark:text-msbm-red-bright" : "text-muted-foreground"}`} />
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
                      <SelectItem value="15">15 minutes</SelectItem>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="60">1 hour</SelectItem>
                      <SelectItem value="240">4 hours</SelectItem>
                    </SelectContent>
                  </Select>
                </SettingRow>
                <SettingRow
                  label="Minimum Password Length"
                  description="Minimum number of characters required for passwords"
                >
                  <div className="flex items-center gap-2">
                    <Lock className="h-4 w-4 text-muted-foreground" />
                    <Input
                      type="number"
                      value={passwordMinLength}
                      onChange={(e) => setPasswordMinLength(e.target.value)}
                      className="w-28"
                      min="6"
                      max="32"
                    />
                    <span className="text-sm text-muted-foreground">characters</span>
                  </div>
                </SettingRow>
              </SettingsSection>

              <SettingsSection title="Authentication" description="Configure multi-factor and access controls.">
                <SettingRow
                  label="Two-Factor Authentication"
                  description="Require 2FA for all users"
                >
                  <Switch
                    checked={twoFactor}
                    onCheckedChange={setTwoFactor}
                  />
                </SettingRow>
              </SettingsSection>

              {/* Last Login Info */}
              <div className="rounded-xl border border-border p-4 bg-muted/30">
                <div className="flex items-center gap-2 mb-3">
                  <Eye className="h-4 w-4 text-msbm-red dark:text-msbm-red-bright" />
                  <span className="text-sm font-semibold">Last Login Information</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-xs text-muted-foreground">User</p>
                    <p className="font-medium">admin@uwi.edu</p>
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
                <SaveButton isSaving={isSaving} onClick={handleSaveSecurity} />
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
                <Badge variant="secondary" className="bg-inner-blue/10 text-inner-blue dark:bg-inner-blue/20 dark:text-light-blue">
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
