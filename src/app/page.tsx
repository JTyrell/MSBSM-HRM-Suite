"use client";

import React, { useEffect, useState } from "react";
import {
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
  LogOut,
  Shield,
  Building2,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
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

const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "attendance", label: "Attendance", icon: Clock, badge: "GPS" },
  { id: "employees", label: "Employees", icon: Users },
  { id: "payroll", label: "Payroll", icon: DollarSign },
  { id: "pto", label: "Time Off", icon: CalendarDays },
  { id: "geofences", label: "Geofences", icon: MapPin },
  { id: "ai-assistant", label: "AI Assistant", icon: Bot },
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

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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
      <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 border-r border-border bg-card z-40">
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
      <main className="flex-1 lg:pl-64 flex flex-col min-h-screen">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-card/80 backdrop-blur-xl border-b border-border px-4 lg:px-6 py-3">
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

              {/* Notifications */}
              <Button
                variant="ghost"
                size="icon"
                className="relative"
                onClick={() => setSidePanelOpen(!sidePanelOpen)}
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
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
        <div className="flex-1 p-4 lg:p-6">
          {currentView === "dashboard" && <DashboardView />}
          {currentView === "attendance" && <AttendanceView />}
          {currentView === "employees" && <EmployeesView />}
          {currentView === "payroll" && <PayrollView />}
          {currentView === "pto" && <PTOView />}
          {currentView === "geofences" && <GeofenceView />}
          {currentView === "ai-assistant" && <AIChatView />}
        </div>

        {/* Footer */}
        <footer className="border-t border-border bg-card px-4 lg:px-6 py-3 mt-auto">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Shield className="w-3 h-3" />
              MSBM-HR Suite v1.0
            </span>
            <span>AI-Powered Human Resource Management</span>
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
      {/* Logo */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight">MSBM-HR</h1>
            <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest">
              AI Suite
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
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
                    ? "bg-gradient-to-r from-emerald-500/10 to-teal-500/10 text-emerald-700 dark:text-emerald-400 shadow-sm"
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
