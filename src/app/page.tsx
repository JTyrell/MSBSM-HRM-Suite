"use client";

import React, { useEffect, useState } from "react";
import {
  DoorOpen,
  LayoutDashboard,
  Clock,
  Users,
  DollarSign,
  CalendarDays,
  Bot,
  MapPin,
  Bell,
  Settings,
  Menu,
  X,
  ChevronDown,
  Shield,
  Building2,
  ChevronRight,
  BarChart3,
  ClipboardCheck,
  FileText,
  Scale,
  Sun,
  Moon,
  CheckCircle2,
  AlertTriangle,
  Info,
  CalendarClock,
  UserPlus,
  Heart,
  Star,
  Briefcase,
  Megaphone,
  UsersRound,
  UserCog,
  GraduationCap,
  Receipt,
  ShieldCheck,
  Timer,
  MessageSquare,
  FileBarChart,
} from "lucide-react";
import { useTheme } from "next-themes";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAppStore, type Employee } from "@/store/app";

// Lazy load components
import { DashboardView } from "@/components/hrm/dashboard-view";
import { AttendanceView } from "@/components/hrm/attendance-view";
import { EmployeesView } from "@/components/hrm/employees-view";
import { PayrollView } from "@/components/hrm/payroll-view";
import { PTOView } from "@/components/hrm/pto-view";
import { AIChatView } from "@/components/hrm/ai-chat-view";
import { GeofenceView } from "@/components/hrm/geofence-view";
import { ReportsView } from "@/components/hrm/reports-view";
import { OnboardingView } from "@/components/hrm/onboarding-view";
import { SettingsView } from "@/components/hrm/settings-view";
import { DocumentsView } from "@/components/hrm/documents-view";
import { ComplianceView } from "@/components/hrm/compliance-view";
import { ShiftsView } from "@/components/hrm/shifts-view";
import { AnnouncementsView } from "@/components/hrm/announcements-view";
import { BenefitsView } from "@/components/hrm/benefits-view";
import { PerformanceReviewsView } from "@/components/hrm/performance-reviews-view";
import { TeamAnalyticsView } from "@/components/hrm/team-analytics-view";
import { RecruitmentView } from "@/components/hrm/recruitment-view";
import { EmployeeDirectoryView } from "@/components/hrm/employee-directory-view";
import { EmployeeProfileEditor } from "@/components/hrm/employee-profile-editor";
import { TrainingView } from "@/components/hrm/training-view";
import { ExpenseView } from "@/components/hrm/expense-view";
import { JAComplianceView } from "@/components/hrm/ja-compliance-view";
import { DepartmentRolesView } from "@/components/hrm/department-roles-view";
import { SmartSchedulingView } from "@/components/hrm/smart-scheduling-view";
import { TimeTrackingView } from "@/components/hrm/time-tracking-view";
import { TeamHubView } from "@/components/hrm/team-hub-view";
import { WorkforceReportsView } from "@/components/hrm/workforce-reports-view";
import { MeetingRoomsView } from "@/components/hrm/meeting-rooms-view";
import { KudosView } from "@/components/hrm/kudos-view";

const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "attendance", label: "Attendance", icon: Clock, badge: "GPS" },
  { id: "shifts", label: "Shifts", icon: CalendarClock },
  { id: "employees", label: "Employees", icon: Users },
  { id: "payroll", label: "Payroll", icon: DollarSign },
  { id: "pto", label: "Time Off", icon: CalendarDays },
  { id: "performance", label: "Reviews", icon: Star },
  { id: "benefits", label: "Benefits", icon: Heart },
  { id: "geofences", label: "Geofences", icon: MapPin },
  { id: "onboarding", label: "Onboarding", icon: ClipboardCheck },
  { id: "recruitment", label: "Recruitment", icon: Briefcase },
  { id: "announcements", label: "Announcements", icon: Megaphone },
  { id: "documents", label: "Documents", icon: FileText },
  { id: "reports", label: "Reports", icon: BarChart3 },
  { id: "team-analytics", label: "Team Analytics", icon: BarChart3 },
  { id: "employee-directory", label: "Employee Directory", icon: UsersRound },
  { id: "training", label: "Training", icon: GraduationCap },
  { id: "expenses", label: "Expenses", icon: Receipt },
  { id: "compliance", label: "Compliance", icon: Scale },
  { id: "ja-compliance", label: "JA Statutory", icon: ShieldCheck, badge: "JM" },
  { id: "department-roles", label: "Dept Roles", icon: UserCog },
  { id: "smart-schedule", label: "Smart Schedule", icon: CalendarClock, badge: "Sling" },
  { id: "time-tracking", label: "Time Tracking", icon: Timer, badge: "GPS" },
  { id: "team-hub", label: "Team Hub", icon: MessageSquare, badge: "Chat" },
  { id: "workforce-reports", label: "Workforce Reports", icon: FileBarChart },
  { id: "meeting-rooms", label: "Meeting Rooms", icon: DoorOpen },
  { id: "kudos", label: "Kudos", icon: Heart },
  { id: "ai-assistant", label: "AI Assistant", icon: Bot },
  { id: "settings", label: "Settings", icon: Settings },
];

const ROLE_LABELS: Record<string, string> = {
  admin: "Administrator",
  hr: "HR Manager",
  manager: "Manager",
  employee: "Employee",
};

const ROLE_COLORS: Record<string, string> = {
  admin: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  hr: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  manager: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  employee: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
};

export default function HomePage() {
  const {
    currentView,
    setCurrentView,
    currentUserId,
    setCurrentUserId,
    employees,
    setEmployees,
    notifications,
    setNotifications,
    sidePanelOpen,
    setSidePanelOpen,
  } = useAppStore();

  const { theme, setTheme, resolvedTheme } = useTheme();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileEditorOpen, setProfileEditorOpen] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  const currentUser = employees.find((e) => e.id === currentUserId);

  // Load data on mount
  useEffect(() => {
    async function initialize() {
      try {
        // Seed if needed
        const seedRes = await fetch("/api/seed", { method: "POST" });
        const seedData = await seedRes.json();

        if (seedData.employees) {
          setEmployees(seedData.employees);
          // Default to first employee (admin)
          setCurrentUserId(seedData.employees[0].id);
        }
        setIsInitialized(true);
      } catch (err) {
        console.error("Initialization error:", err);
        setIsInitialized(true);
      }
    }
    initialize();
  }, []);

  // Load notifications
  useEffect(() => {
    if (currentUserId) {
      fetch(`/api/notifications?userId=${currentUserId}`)
        .then((r) => r.json())
        .then((d) => setNotifications(d.notifications || []))
        .catch(() => {});
    }
  }, [currentUserId]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const unreadCount2 = (notifications || []).filter((n: { isRead: boolean }) => !n.isRead).length;

  const handleReseed = async () => {
    setIsSeeding(true);
    try {
      const res = await fetch("/api/seed", { method: "POST" });
      const data = await res.json();
      if (data.employees) {
        setEmployees(data.employees);
        setCurrentUserId(data.employees[0].id);
      }
    } catch (err) {
      console.error(err);
    }
    setIsSeeding(false);
  };

  const switchUser = (emp: Employee) => {
    setCurrentUserId(emp.id);
    setMobileMenuOpen(false);
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
              <Building2 className="w-8 h-8 text-white" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-amber-400 rounded-full border-2 border-background animate-pulse" />
          </div>
          <div className="text-center">
            <h2 className="text-xl font-semibold">MSBM-HR Suite</h2>
            <p className="text-sm text-muted-foreground mt-1">Initializing system...</p>
          </div>
          <div className="w-48 h-1.5 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full animate-[pulse_1.5s_ease-in-out_infinite]" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-muted/30">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 border-r border-border bg-card z-40 glass-sidebar">
        <SidebarContent
          currentUser={currentUser}
          getInitials={getInitials}
          currentView={currentView}
          setCurrentView={(v) => { setCurrentView(v); setMobileMenuOpen(false); }}
          mobileMenuOpen={false}
          setMobileMenuOpen={() => {}}
          switchUser={switchUser}
          employees={employees}
          unreadCount={unreadCount2}
          ROLE_COLORS={ROLE_COLORS}
          ROLE_LABELS={ROLE_LABELS}
        />
      </aside>

      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-card border-r border-border transform transition-transform duration-300 ease-in-out lg:hidden ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <SidebarContent
          currentUser={currentUser}
          getInitials={getInitials}
          currentView={currentView}
          setCurrentView={(v) => { setCurrentView(v); setMobileMenuOpen(false); }}
          mobileMenuOpen={mobileMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen}
          switchUser={switchUser}
          employees={employees}
          unreadCount={unreadCount2}
          ROLE_COLORS={ROLE_COLORS}
          ROLE_LABELS={ROLE_LABELS}
        />
      </aside>

      {/* Main Content */}
      <main className="flex-1 lg:pl-64 flex flex-col min-h-screen bg-dot-pattern">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-card/80 backdrop-blur-xl border-b border-border px-4 lg:px-6 py-3 relative card-elevated">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-emerald-500 to-teal-500 rounded-r-full" />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setMobileMenuOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </Button>
              <div className="flex items-center gap-2">
                <div className="lg:hidden">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                    <Building2 className="w-4 h-4 text-white" />
                  </div>
                </div>
                <div className="hidden lg:block">
                  <h2 className="text-lg font-semibold">
                    {NAV_ITEMS.find((n) => n.id === currentView)?.label || "Dashboard"}
                  </h2>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Quick Actions */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleReseed}
                disabled={isSeeding}
                className="hidden sm:flex text-xs"
              >
                {isSeeding ? "Loading..." : "Reset Demo"}
              </Button>

              {/* Notifications Popover */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="icon" className={unreadCount > 0 ? "relative badge-notification-dot" : "relative"}>
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center badge-pulse">
                        {unreadCount > 9 ? "9+" : unreadCount}
                      </span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="end" className="w-80 p-0">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                    <h3 className="text-sm font-semibold">Notifications</h3>
                    {unreadCount > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs text-emerald-600 hover:text-emerald-700 dark:text-emerald-400"
                        onClick={() => {
                          setNotifications(
                            notifications.map((n) => ({ ...n, isRead: true }))
                          );
                        }}
                      >
                        Mark all read
                      </Button>
                    )}
                  </div>
                  {notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 px-4">
                      <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
                        <Bell className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <p className="text-sm font-medium text-muted-foreground">No notifications</p>
                      <p className="text-xs text-muted-foreground mt-1">You're all caught up!</p>
                    </div>
                  ) : (
                    <ScrollArea className="max-h-80">
                      <div className="divide-y divide-border">
                        {notifications.map((notif) => (
                          <button
                            key={notif.id}
                            className={`w-full text-left px-4 py-3 transition-colors hover:bg-accent/50 ${
                              !notif.isRead
                                ? "border-l-2 border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20"
                                : ""
                            }`}
                          >
                            <div className="flex gap-3">
                              <div className="mt-0.5">
                                <NotificationIcon type={notif.type} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className={`text-sm ${!notif.isRead ? "font-semibold" : "font-medium"}`}>
                                  {notif.title}
                                </p>
                                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                                  {notif.message}
                                </p>
                                <p className="text-[10px] text-muted-foreground mt-1">
                                  {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
                                </p>
                              </div>
                              {!notif.isRead && (
                                <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                              )}
                            </div>
                          </button>
                        ))}
                      </div>
                    </ScrollArea>
                  )}
                </PopoverContent>
              </Popover>

              {/* Dark Mode Toggle */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
              >
                {resolvedTheme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2 px-2">
                    {currentUser && (
                      <>
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white text-xs font-semibold">
                            {getInitials(`${currentUser.firstName} ${currentUser.lastName}`)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="hidden md:block text-left">
                          <p className="text-sm font-medium leading-tight">
                            {currentUser.firstName} {currentUser.lastName}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {ROLE_LABELS[currentUser.role] || currentUser.role}
                          </p>
                        </div>
                        <ChevronDown className="h-3 w-3 text-muted-foreground hidden md:block" />
                      </>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64">
                  <DropdownMenuLabel>
                    <div className="flex flex-col">
                      <span>
                        {currentUser?.firstName} {currentUser?.lastName}
                      </span>
                      <span className="text-xs text-muted-foreground font-normal">
                        {currentUser?.email}
                      </span>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setProfileEditorOpen(true)}>
                    <UserCog className="mr-2 h-4 w-4" />
                    Edit My Profile
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  {employees.slice(0, 5).map((emp) => (
                    <DropdownMenuItem
                      key={emp.id}
                      onClick={() => switchUser(emp)}
                      className={emp.id === currentUserId ? "bg-accent" : ""}
                    >
                      <Avatar className="h-6 w-6 mr-2">
                        <AvatarFallback className="text-[10px]">
                          {getInitials(`${emp.firstName} ${emp.lastName}`)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <span className="text-sm">
                          {emp.firstName} {emp.lastName}
                        </span>
                        <p className="text-xs text-muted-foreground">{ROLE_LABELS[emp.role]}</p>
                      </div>
                      {emp.id === currentUserId && (
                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                          Active
                        </Badge>
                      )}
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleReseed}>
                    <Settings className="mr-2 h-4 w-4" />
                    Reset Demo Data
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="page-transition animate-in-up flex-1 p-4 lg:p-6 bg-dot-pattern">
          {currentView === "dashboard" && <DashboardView />}
          {currentView === "attendance" && <AttendanceView />}
          {currentView === "employees" && <EmployeesView />}
          {currentView === "payroll" && <PayrollView />}
          {currentView === "pto" && <PTOView />}
          {currentView === "geofences" && <GeofenceView />}
          {currentView === "onboarding" && <OnboardingView />}
          {currentView === "announcements" && <AnnouncementsView />}
          {currentView === "reports" && <ReportsView />}
          {currentView === "ai-assistant" && <AIChatView />}
          {currentView === "documents" && <DocumentsView />}
          {currentView === "compliance" && <ComplianceView />}
          {currentView === "settings" && <SettingsView />}
          {currentView === "shifts" && <ShiftsView />}
          {currentView === "benefits" && <BenefitsView />}
          {currentView === "team-analytics" && <TeamAnalyticsView />}
          {currentView === "performance" && <PerformanceReviewsView />}
          {currentView === "recruitment" && <RecruitmentView />}
          {currentView === "employee-directory" && <EmployeeDirectoryView />}
          {currentView === "training" && <TrainingView />}
          {currentView === "expenses" && <ExpenseView />}
          {currentView === "ja-compliance" && <JAComplianceView />}
          {currentView === "department-roles" && <DepartmentRolesView />}
          {currentView === "smart-schedule" && <SmartSchedulingView />}
          {currentView === "time-tracking" && <TimeTrackingView />}
          {currentView === "team-hub" && <TeamHubView />}
          {currentView === "workforce-reports" && <WorkforceReportsView />}
          {currentView === "meeting-rooms" && <MeetingRoomsView />}
          {currentView === "kudos" && <KudosView />}

          {/* Employee Profile Editor Dialog */}
          <EmployeeProfileEditor
            open={profileEditorOpen}
            onOpenChange={setProfileEditorOpen}
            employee={currentUser}
          />
        </div>

        {/* Footer */}
        <footer className="border-t border-border bg-gradient-to-r from-card via-card to-emerald-50/30 dark:from-card dark:via-card dark:to-emerald-950/10 px-4 lg:px-6 py-4 mt-auto section-divider">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-md bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                <Shield className="w-3 h-3 text-white" />
              </div>
              <span className="font-medium">MSBM-HR Suite v12.0</span>
            </div>
            <div className="flex items-center gap-3">
              <span>AI-Powered Human Resource Management</span>
              <span className="hidden sm:inline">•</span>
              <span className="hidden sm:inline">© 2026 MSBM Group</span>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}

// Sidebar content extracted as a component
function SidebarContent({
  currentUser,
  getInitials,
  currentView,
  setCurrentView,
  mobileMenuOpen,
  setMobileMenuOpen,
  switchUser,
  employees,
  unreadCount,
  ROLE_COLORS,
  ROLE_LABELS,
}: {
  currentUser: Employee | undefined;
  getInitials: (name: string) => string;
  currentView: string;
  setCurrentView: (v: string) => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (v: boolean) => void;
  switchUser: (emp: Employee) => void;
  employees: Employee[];
  unreadCount: number;
  ROLE_COLORS: Record<string, string>;
  ROLE_LABELS: Record<string, string>;
}) {
  return (
    <div className="flex flex-col h-full">
      {/* Decorative gradient banner */}
      <div className="h-24 -mx-4 -mt-4 mb-4 bg-gradient-to-br from-emerald-600 via-teal-600 to-emerald-700 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.1),transparent_60%)]" />
        <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-card to-transparent" />
        <div className="relative z-10 flex flex-col items-center justify-center h-full gap-2 pt-6">
          <div className="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center shadow-lg border border-white/20">
            <Building2 className="w-7 h-7 text-white" />
          </div>
          <div className="text-center">
            <h1 className="text-base font-bold text-white tracking-tight">MSBM-HR</h1>
            <p className="text-[10px] text-emerald-100 font-medium uppercase tracking-[0.2em]">AI Suite v10.0</p>
          </div>
        </div>
        {/* Mobile close button overlay */}
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden absolute top-2 right-2 text-white hover:bg-white/20 hover:text-white z-20"
          onClick={() => setMobileMenuOpen(false)}
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-3">
        <div className="space-y-1">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-2">
            Main Menu
          </p>
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentView(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "sidebar-nav-indicator bg-gradient-to-r from-emerald-500/10 to-teal-500/10 text-emerald-700 dark:text-emerald-400 shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                }`}
              >
                <Icon className={`h-4.5 w-4.5 ${isActive ? "text-emerald-600 dark:text-emerald-400" : ""}`} />
                <span className="flex-1 text-left">{item.label}</span>
                {item.badge && (
                  <Badge
                    variant="secondary"
                    className={`text-[10px] px-1.5 py-0 ${
                      isActive
                        ? "bg-emerald-500/20 text-emerald-700 dark:text-emerald-400"
                        : ""
                    }`}
                  >
                    {item.badge}
                  </Badge>
                )}
                {isActive && <ChevronRight className="h-3.5 w-3.5 opacity-50" />}
              </button>
            );
          })}
        </div>
      </ScrollArea>

      {/* Active view indicator */}
      <div className="mx-3 mt-4 mb-2 px-3 py-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/50 border-gradient-emerald">
        <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold uppercase tracking-wider">Active</p>
        <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300 truncate">
          {NAV_ITEMS.find((n) => n.id === currentView)?.label || "Dashboard"}
        </p>
      </div>

      {/* User Switcher */}
      <div className="border-t border-border p-3">
        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-1 mb-2">
          Switch User
        </p>
        <ScrollArea className="max-h-40">
          <div className="space-y-1">
            {employees.slice(0, 6).map((emp) => (
              <button
                key={emp.id}
                onClick={() => switchUser(emp)}
                className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm transition-all ${
                  emp.id === (currentUser?.id || "")
                    ? "bg-accent"
                    : "hover:bg-accent/50"
                }`}
              >
                <Avatar className="h-7 w-7">
                  <AvatarFallback
                    className={`text-[10px] font-semibold ${
                      ROLE_COLORS[emp.role] || ""
                    }`}
                  >
                    {getInitials(`${emp.firstName} ${emp.lastName}`)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-xs font-medium truncate">
                    {emp.firstName} {emp.lastName}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {ROLE_LABELS[emp.role]}
                  </p>
                </div>
                {emp.id === (currentUser?.id || "") && (
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                )}
              </button>
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}

// Notification icon helper component
function NotificationIcon({ type }: { type: string }) {
  const t = type?.toLowerCase() || "";

  if (t.includes("success") || t.includes("approved") || t.includes("complete")) {
    return (
      <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
        <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
      </div>
    );
  }
  if (t.includes("warning") || t.includes("alert") || t.includes("overdue")) {
    return (
      <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
        <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
      </div>
    );
  }
  if (t.includes("payroll") || t.includes("salary") || t.includes("payment")) {
    return (
      <div className="w-8 h-8 rounded-full bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center">
        <DollarSign className="h-4 w-4 text-teal-600 dark:text-teal-400" />
      </div>
    );
  }
  if (t.includes("pto") || t.includes("leave") || t.includes("time_off") || t.includes("vacation")) {
    return (
      <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
        <CalendarClock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
      </div>
    );
  }
  if (t.includes("onboarding") || t.includes("new_hire") || t.includes("welcome")) {
    return (
      <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
        <UserPlus className="h-4 w-4 text-purple-600 dark:text-purple-400" />
      </div>
    );
  }
  // Default info icon
  return (
    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
      <Info className="h-4 w-4 text-muted-foreground" />
    </div>
  );
}
