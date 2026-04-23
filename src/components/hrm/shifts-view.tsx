"use client";

import React, { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { useAppStore, type Department } from "@/store/app";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Clock,
  Plus,
  CalendarClock,
  Timer,
  Building2,
  Palette,
  Edit,
  Trash2,
  Layers,
  TrendingUp,
  Zap,
  ArrowRight,
  Coffee,
  CalendarDays,
} from "lucide-react";

// ============ TYPES ============

interface Shift {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  breakMinutes: number;
  color: string;
  isActive: boolean;
  departmentId: string | null;
  companyId: string;
  createdAt: string;
  updatedAt: string;
  department?: { id: string; name: string; code: string } | null;
}

interface ShiftForm {
  name: string;
  startTime: string;
  endTime: string;
  breakMinutes: number;
  color: string;
  isActive: boolean;
  departmentId: string;
}

interface ShiftStats {
  totalShifts: number;
  activeShifts: number;
  avgDuration: number;
  totalCoverageHours: number;
  departmentsCovered: number;
}

// ============ HELPERS ============

function calculateDuration(start: string, end: string): number {
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  let startMin = sh * 60 + sm;
  let endMin = eh * 60 + em;
  if (endMin <= startMin) {
    endMin += 24 * 60; // overnight shift
  }
  return Math.max(0, (endMin - startMin) / 60);
}

function formatDuration(hours: number): string {
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

function formatTime12h(time24: string): string {
  const [h, m] = time24.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 || 12;
  return `${h12}:${String(m).padStart(2, "0")} ${ampm}`;
}

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const PRESET_COLORS = [
  "#10b981", "#14b8a6", "#06b6d4", "#f59e0b",
  "#f97316", "#ef4444", "#ec4899", "#8b5cf6",
  "#6366f1", "#84cc16", "#22c55e", "#e11d48",
];

const SHIFT_THEMES: Record<string, { bg: string; bgLight: string; bgLighter: string; bgLightest: string; text: string; border: string; borderLight: string; }> = {
  "#10b981": { bg: "bg-emerald-500", bgLight: "bg-emerald-500/20", bgLighter: "bg-emerald-500/10", bgLightest: "bg-emerald-500/5", text: "text-emerald-500", border: "border-emerald-500", borderLight: "border-emerald-500/40" },
  "#14b8a6": { bg: "bg-teal-500", bgLight: "bg-teal-500/20", bgLighter: "bg-teal-500/10", bgLightest: "bg-teal-500/5", text: "text-teal-500", border: "border-teal-500", borderLight: "border-teal-500/40" },
  "#06b6d4": { bg: "bg-cyan-500", bgLight: "bg-cyan-500/20", bgLighter: "bg-cyan-500/10", bgLightest: "bg-cyan-500/5", text: "text-cyan-500", border: "border-cyan-500", borderLight: "border-cyan-500/40" },
  "#f59e0b": { bg: "bg-amber-500", bgLight: "bg-amber-500/20", bgLighter: "bg-amber-500/10", bgLightest: "bg-amber-500/5", text: "text-amber-500", border: "border-amber-500", borderLight: "border-amber-500/40" },
  "#f97316": { bg: "bg-orange-500", bgLight: "bg-orange-500/20", bgLighter: "bg-orange-500/10", bgLightest: "bg-orange-500/5", text: "text-orange-500", border: "border-orange-500", borderLight: "border-orange-500/40" },
  "#ef4444": { bg: "bg-red-500", bgLight: "bg-red-500/20", bgLighter: "bg-red-500/10", bgLightest: "bg-red-500/5", text: "text-red-500", border: "border-red-500", borderLight: "border-red-500/40" },
  "#ec4899": { bg: "bg-pink-500", bgLight: "bg-pink-500/20", bgLighter: "bg-pink-500/10", bgLightest: "bg-pink-500/5", text: "text-pink-500", border: "border-pink-500", borderLight: "border-pink-500/40" },
  "#8b5cf6": { bg: "bg-violet-500", bgLight: "bg-violet-500/20", bgLighter: "bg-violet-500/10", bgLightest: "bg-violet-500/5", text: "text-violet-500", border: "border-violet-500", borderLight: "border-violet-500/40" },
  "#6366f1": { bg: "bg-indigo-500", bgLight: "bg-indigo-500/20", bgLighter: "bg-indigo-500/10", bgLightest: "bg-indigo-500/5", text: "text-indigo-500", border: "border-indigo-500", borderLight: "border-indigo-500/40" },
  "#84cc16": { bg: "bg-lime-500", bgLight: "bg-lime-500/20", bgLighter: "bg-lime-500/10", bgLightest: "bg-lime-500/5", text: "text-lime-500", border: "border-lime-500", borderLight: "border-lime-500/40" },
  "#22c55e": { bg: "bg-green-500", bgLight: "bg-green-500/20", bgLighter: "bg-green-500/10", bgLightest: "bg-green-500/5", text: "text-green-500", border: "border-green-500", borderLight: "border-green-500/40" },
  "#e11d48": { bg: "bg-rose-500", bgLight: "bg-rose-500/20", bgLighter: "bg-rose-500/10", bgLightest: "bg-rose-500/5", text: "text-rose-500", border: "border-rose-500", borderLight: "border-rose-500/40" },
  "default": { bg: "bg-msbm-red", bgLight: "bg-msbm-red/20", bgLighter: "bg-msbm-red/10", bgLightest: "bg-msbm-red/5", text: "text-msbm-red", border: "border-msbm-red", borderLight: "border-msbm-red/40" }
};

function getTheme(color: string) {
  return SHIFT_THEMES[color] || SHIFT_THEMES.default;
}

const PRESET_TEMPLATES = [
  { name: "Standard 9-5", startTime: "09:00", endTime: "17:00", breakMinutes: 60, color: "#14b8a6" },
  { name: "Early Bird", startTime: "06:00", endTime: "14:00", breakMinutes: 30, color: "#10b981" },
  { name: "Night Owl", startTime: "18:00", endTime: "02:00", breakMinutes: 45, color: "#8b5cf6" },
  { name: "Part Time", startTime: "09:00", endTime: "13:00", breakMinutes: 15, color: "#f59e0b" },
];

const defaultForm: ShiftForm = {
  name: "",
  startTime: "09:00",
  endTime: "17:00",
  breakMinutes: 30,
  color: "#10b981",
  isActive: true,
  departmentId: "none",
};

// ============ MAIN COMPONENT ============

export function ShiftsView() {
  const { departments, setDepartments } = useAppStore();

  const [shifts, setShifts] = useState<Shift[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterDepartment, setFilterDepartment] = useState<string>("all");

  // Dialogs
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingShift, setEditingShift] = useState<Shift | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<Shift | null>(null);
  const [formData, setFormData] = useState<ShiftForm>(defaultForm);
  const [submitting, setSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof ShiftForm, string>>>({});

  // ============ DATA FETCHING ============

  const fetchShifts = useCallback(async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (filterDepartment !== "all") {
        params.set("departmentId", filterDepartment);
      }
      const res = await fetch(`/api/shifts?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch shifts");
      const data = await res.json();
      setShifts(data.shifts || []);
    } catch {
      toast.error("Failed to load shifts");
    } finally {
      setIsLoading(false);
    }
  }, [filterDepartment]);

  const fetchDepartments = useCallback(async () => {
    try {
      const res = await fetch("/api/departments");
      if (!res.ok) return;
      const data = await res.json();
      setDepartments(data.departments || []);
    } catch {
      // silent
    }
  }, [setDepartments]);

  useEffect(() => {
    fetchShifts();
  }, [fetchShifts]);

  useEffect(() => {
    if (departments.length === 0) fetchDepartments();
  }, [fetchDepartments, departments.length]);

  // ============ COMPUTED VALUES ============

  const stats: ShiftStats = (() => {
    const active = shifts.filter((s) => s.isActive);
    const durations = active.map((s) => calculateDuration(s.startTime, s.endTime));
    const avgDuration = durations.length > 0 ? durations.reduce((a, b) => a + b, 0) / durations.length : 0;
    const uniqueDepts = new Set(active.map((s) => s.departmentId).filter(Boolean));
    return {
      totalShifts: shifts.length,
      activeShifts: active.length,
      avgDuration,
      totalCoverageHours: Math.round(durations.reduce((a, b) => a + b, 0) * 10) / 10,
      departmentsCovered: uniqueDepts.size,
    };
  })();

  // ============ FORM HANDLERS ============

  const openCreate = (template?: typeof PRESET_TEMPLATES[0]) => {
    setFormData({
      ...defaultForm,
      ...(template || {}),
      departmentId: "none",
    });
    setFormErrors({});
    setShowCreateDialog(true);
  };

  const openEdit = (shift: Shift) => {
    setFormData({
      name: shift.name,
      startTime: shift.startTime,
      endTime: shift.endTime,
      breakMinutes: shift.breakMinutes,
      color: shift.color,
      isActive: shift.isActive,
      departmentId: shift.departmentId || "none",
    });
    setFormErrors({});
    setEditingShift(shift);
  };

  const validateForm = (): boolean => {
    const errors: Partial<Record<keyof ShiftForm, string>> = {};
    if (!formData.name.trim()) errors.name = "Shift name is required";
    if (!formData.startTime) errors.startTime = "Start time is required";
    if (!formData.endTime) errors.endTime = "End time is required";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (isEdit: boolean) => {
    if (!validateForm()) return;

    try {
      setSubmitting(true);
      const companyId = shifts.length > 0 ? shifts[0].companyId : (await fetch("/api/shifts").then((r) => r.json()).then((d) => d.shifts?.[0]?.companyId || ""));

      if (!companyId && !isEdit) {
        toast.error("No company found. Please seed data first.");
        return;
      }

      const body = {
        ...(isEdit ? { id: editingShift!.id } : {}),
        name: formData.name,
        startTime: formData.startTime,
        endTime: formData.endTime,
        breakMinutes: formData.breakMinutes,
        color: formData.color,
        isActive: formData.isActive,
        departmentId: formData.departmentId === "none" ? null : formData.departmentId,
        ...(isEdit ? {} : { companyId }),
      };

      const res = await fetch("/api/shifts", {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save shift");
      }

      toast.success(isEdit ? "Shift updated successfully" : "Shift created successfully");
      setShowCreateDialog(false);
      setEditingShift(null);
      fetchShifts();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save shift");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!showDeleteConfirm) return;
    try {
      const res = await fetch("/api/shifts", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: showDeleteConfirm.id }),
      });
      if (!res.ok) throw new Error("Failed to delete shift");
      toast.success("Shift deleted successfully");
      setShowDeleteConfirm(null);
      fetchShifts();
    } catch {
      toast.error("Failed to delete shift");
    }
  };

  // ============ CALENDAR HELPERS ============

  const getShiftTimeRange = (shift: Shift) => {
    const startMin = parseInt(shift.startTime.split(":")[0]) * 60 + parseInt(shift.startTime.split(":")[1]);
    const endMin = parseInt(shift.endTime.split(":")[0]) * 60 + parseInt(shift.endTime.split(":")[1]);
    return { startMin, endMin: endMin <= startMin ? endMin + 24 * 60 : endMin };
  };

  // ============ RENDER ============

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            Shift Scheduling
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage shift templates, schedules, and coverage across departments.
          </p>
        </div>
        <Button
          onClick={() => openCreate()}
          className="bg-msbm-red hover:bg-msbm-red/80 text-white shadow-sm"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Shift
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-msbm-red/20 dark:border-msbm-red/20 overflow-hidden relative">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-medium">Total Shifts</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stats.totalShifts}</p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-msbm-red to-msbm-red flex items-center justify-center shadow-lg shadow-msbm-red/20">
                <CalendarClock className="h-5 w-5 text-white" />
              </div>
            </div>
            <div className="mt-2 flex items-center gap-1">
              <Badge variant="outline" className="text-[10px] border-msbm-red/20 dark:border-msbm-red/20 text-msbm-red dark:text-msbm-red-bright">
                {stats.activeShifts} active
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="border-inner-blue/20 dark:border-inner-blue/20 overflow-hidden">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-medium">Avg Duration</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{formatDuration(stats.avgDuration)}</p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-inner-blue to-inner-blue flex items-center justify-center shadow-lg shadow-inner-blue/20">
                <Timer className="h-5 w-5 text-white" />
              </div>
            </div>
            <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 text-inner-blue" />
              <span>Per active shift</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-amber-100 dark:border-amber-900/30 overflow-hidden">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-medium">Daily Coverage</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stats.totalCoverageHours}h</p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
                <Layers className="h-5 w-5 text-white" />
              </div>
            </div>
            <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3 text-amber-500" />
              <span>Combined hours/day</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-pink-100 dark:border-pink-900/30 overflow-hidden">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-medium">Departments</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stats.departmentsCovered}</p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-pink-400 to-pink-600 flex items-center justify-center shadow-lg shadow-pink-500/20">
                <Building2 className="h-5 w-5 text-white" />
              </div>
            </div>
            <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
              <Zap className="h-3 w-3 text-pink-500" />
              <span>With active shifts</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Preset Templates */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
          <Zap className="h-4 w-4 text-msbm-red" />
          Quick Templates
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {PRESET_TEMPLATES.map((template) => (
            <Card
              key={template.name}
              className="cursor-pointer transition-all duration-200 hover:shadow-md hover:border-msbm-red/30 dark:hover:border-emerald-700 group"
              onClick={() => openCreate(template)}
            >
              <CardContent className="p-3">
                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-3 h-3 rounded-full shrink-0 ${getTheme(template.color).bg}`} />
                  <span className="text-sm font-medium text-gray-900 dark:text-white truncate">{template.name}</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span>{formatTime12h(template.startTime)} - {formatTime12h(template.endTime)}</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                  <Coffee className="h-3 w-3" />
                  <span>{template.breakMinutes}m break</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="list" className="space-y-4">
        <TabsList>
          <TabsTrigger value="list" className="gap-1.5">
            <Layers className="h-3.5 w-3.5" />
            List View
          </TabsTrigger>
          <TabsTrigger value="calendar" className="gap-1.5">
            <CalendarDays className="h-3.5 w-3.5" />
            Calendar View
          </TabsTrigger>
        </TabsList>

        {/* List View */}
        <TabsContent value="list">
          <Card>
            <CardHeader className="pb-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Clock className="h-5 w-5 text-msbm-red" />
                  Shift Templates
                </CardTitle>
                <Select value={filterDepartment} onValueChange={setFilterDepartment}>
                  <SelectTrigger className="w-full sm:w-[200px]">
                    <SelectValue placeholder="All Departments" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Departments</SelectItem>
                    {departments.map((dept) => (
                      <SelectItem key={dept.id} value={dept.id}>
                        {dept.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-msbm-red" />
                </div>
              ) : shifts.length === 0 ? (
                <div className="text-center py-12">
                  <CalendarClock className="mx-auto h-12 w-12 text-muted-foreground/40" />
                  <p className="mt-3 text-sm text-muted-foreground">No shifts found</p>
                  <p className="text-xs text-muted-foreground mt-1">Create your first shift template or use a quick template above</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-border/50 hover:bg-transparent">
                        <TableHead className="min-w-[180px]">Shift</TableHead>
                        <TableHead className="min-w-[150px]">Time Range</TableHead>
                        <TableHead className="min-w-[100px] hidden sm:table-cell">Duration</TableHead>
                        <TableHead className="min-w-[80px] hidden md:table-cell">Break</TableHead>
                        <TableHead className="min-w-[130px] hidden lg:table-cell">Department</TableHead>
                        <TableHead className="min-w-[90px]">Status</TableHead>
                        <TableHead className="w-[100px] text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {shifts.map((shift) => {
                        const duration = calculateDuration(shift.startTime, shift.endTime);
                        const netDuration = duration - shift.breakMinutes / 60;
                        return (
                          <TableRow
                            key={shift.id}
                            className="cursor-pointer transition-colors hover:bg-msbm-red/5/50 dark:hover:bg-msbm-red/10 border-border/30"
                          >
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <div
                                  className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${getTheme(shift.color).bgLight}`}
                                >
                                  <Clock className={`h-5 w-5 ${getTheme(shift.color).text}`} />
                                </div>
                                <div className="min-w-0">
                                  <div className="font-medium text-sm text-gray-900 dark:text-white truncate">
                                    {shift.name}
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    Net: {formatDuration(netDuration)}
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2 text-sm">
                                <span className="font-medium text-gray-900 dark:text-white">
                                  {formatTime12h(shift.startTime)}
                                </span>
                                <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                                <span className="font-medium text-gray-900 dark:text-white">
                                  {formatTime12h(shift.endTime)}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="hidden sm:table-cell">
                              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                <Timer className="h-3.5 w-3.5" />
                                <span>{formatDuration(duration)}</span>
                              </div>
                            </TableCell>
                            <TableCell className="hidden md:table-cell">
                              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                <Coffee className="h-3.5 w-3.5" />
                                <span>{shift.breakMinutes}m</span>
                              </div>
                            </TableCell>
                            <TableCell className="hidden lg:table-cell">
                              {shift.department ? (
                                <Badge variant="outline" className="text-xs border-gray-200 dark:border-gray-700">
                                  <Building2 className="h-3 w-3 mr-1" />
                                  {shift.department.name}
                                </Badge>
                              ) : (
                                <span className="text-xs text-muted-foreground">All Departments</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant="outline"
                                className={`text-[11px] ${
                                  shift.isActive
                                    ? "bg-msbm-red/5 text-msbm-red dark:bg-msbm-red/20 dark:text-msbm-red-bright border-msbm-red/20 dark:border-msbm-red/20"
                                    : "bg-gray-50 text-gray-500 dark:bg-gray-800/30 dark:text-gray-400 border-gray-200 dark:border-gray-700"
                                }`}
                              >
                                <span className={`inline-block h-1.5 w-1.5 rounded-full mr-1 ${shift.isActive ? "bg-msbm-red/50" : "bg-gray-400"}`} />
                                {shift.isActive ? "Active" : "Inactive"}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-muted-foreground hover:text-msbm-red"
                                  onClick={(e) => { e.stopPropagation(); openEdit(shift); }}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-muted-foreground hover:text-red-600"
                                  onClick={(e) => { e.stopPropagation(); setShowDeleteConfirm(shift); }}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Calendar View */}
        <TabsContent value="calendar">
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <CalendarDays className="h-5 w-5 text-msbm-red" />
                Weekly Shift Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-msbm-red" />
                </div>
              ) : shifts.length === 0 ? (
                <div className="text-center py-12">
                  <CalendarDays className="mx-auto h-12 w-12 text-muted-foreground/40" />
                  <p className="mt-3 text-sm text-muted-foreground">No shifts to display</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  {/* Calendar Header */}
                  <div className="grid grid-cols-8 gap-1 min-w-[700px]">
                    <div className="p-2 text-xs font-semibold text-muted-foreground text-center" />
                    {DAYS.map((day) => (
                      <div
                        key={day}
                        className="p-2 text-xs font-semibold text-center text-muted-foreground uppercase tracking-wider bg-muted/50 rounded-t-lg"
                      >
                        {day}
                      </div>
                    ))}
                  </div>
                  {/* Calendar Rows */}
                  <div className="space-y-1 mt-1">
                    {shifts.map((shift) => {
                      const duration = calculateDuration(shift.startTime, shift.endTime);
                      const isOvernight = parseInt(shift.endTime) < parseInt(shift.startTime);
                      return (
                        <div key={shift.id} className="grid grid-cols-8 gap-1 min-w-[700px]">
                          {/* Shift Label */}
                          <div className="p-2 flex items-start">
                            <div className="flex items-center gap-2 min-w-0">
                              <div
                                className={`w-2 h-full min-h-[48px] rounded-full shrink-0 ${getTheme(shift.color).bg}`}
                              />
                              <div className="min-w-0">
                                <p className="text-xs font-semibold text-gray-900 dark:text-white truncate">
                                  {shift.name}
                                </p>
                                <p className="text-[10px] text-muted-foreground">
                                  {formatTime12h(shift.startTime)} - {formatTime12h(shift.endTime)}
                                  {isOvernight && <span className="text-amber-600 ml-1">+1</span>}
                                </p>
                              </div>
                            </div>
                          </div>
                          {/* Day columns */}
                          {DAYS.map((day) => (
                            <div
                              key={day}
                              className={`p-1 rounded-lg min-h-[56px] flex items-center justify-center ${shift.isActive ? getTheme(shift.color).bgLightest : ""}`}
                            >
                              <div
                                className={`w-full rounded-md px-2 py-1.5 text-center transition-transform hover:scale-[1.02] border-l-[3px] ${shift.isActive ? getTheme(shift.color).bgLighter : getTheme(shift.color).bgLightest} ${shift.isActive ? getTheme(shift.color).border : getTheme(shift.color).borderLight} ${shift.isActive ? "opacity-100" : "opacity-50"}`}
                              >
                                <p className="text-[10px] font-semibold text-gray-800 dark:text-gray-200 truncate">
                                  {shift.name}
                                </p>
                                <p className="text-[9px] text-muted-foreground">
                                  {formatDuration(duration)}
                                </p>
                                {shift.department && (
                                  <p className="text-[8px] text-muted-foreground truncate">
                                    {shift.department.code}
                                  </p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      );
                    })}
                  </div>
                  {/* Legend */}
                  <div className="flex flex-wrap items-center gap-3 mt-4 pt-4 border-t border-border/50">
                    <span className="text-xs font-medium text-muted-foreground">Legend:</span>
                    {shifts.map((shift) => (
                      <div key={shift.id} className="flex items-center gap-1.5">
                        <div className={`w-3 h-3 rounded-sm ${getTheme(shift.color).bg}`} />
                        <span className="text-xs text-gray-700 dark:text-gray-300">{shift.name}</span>
                        {!shift.isActive && (
                          <span className="text-[9px] text-muted-foreground">(inactive)</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ============ CREATE / EDIT DIALOG ============ */}
      <Dialog
        open={showCreateDialog || !!editingShift}
        onOpenChange={(open) => {
          if (!open) {
            setShowCreateDialog(false);
            setEditingShift(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-[520px] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CalendarClock className="h-5 w-5 text-msbm-red" />
              {editingShift ? "Edit Shift" : "Create New Shift"}
            </DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="shift-name">
                Shift Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="shift-name"
                placeholder="e.g., Morning Shift"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={formErrors.name ? "border-red-500" : ""}
              />
              {formErrors.name && (
                <p className="text-xs text-red-500">{formErrors.name}</p>
              )}
            </div>

            {/* Time Range */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start-time">
                  Start Time <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="start-time"
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  className={formErrors.startTime ? "border-red-500" : ""}
                />
                {formErrors.startTime && (
                  <p className="text-xs text-red-500">{formErrors.startTime}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="end-time">
                  End Time <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="end-time"
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  className={formErrors.endTime ? "border-red-500" : ""}
                />
                {formErrors.endTime && (
                  <p className="text-xs text-red-500">{formErrors.endTime}</p>
                )}
              </div>
            </div>

            {/* Duration Preview */}
            <div className="bg-muted/50 rounded-lg p-3">
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1.5">
                  <Timer className="h-4 w-4 text-msbm-red" />
                  <span className="font-medium">Duration:</span>
                  <span className="text-gray-700 dark:text-gray-300">{formatDuration(calculateDuration(formData.startTime, formData.endTime))}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Coffee className="h-4 w-4 text-amber-600" />
                  <span className="font-medium">Break:</span>
                  <span className="text-gray-700 dark:text-gray-300">{formData.breakMinutes}m</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4 text-inner-blue" />
                  <span className="font-medium">Net:</span>
                  <span className="text-gray-700 dark:text-gray-300">{formatDuration(calculateDuration(formData.startTime, formData.endTime) - formData.breakMinutes / 60)}</span>
                </div>
              </div>
            </div>

            {/* Break Minutes */}
            <div className="space-y-2">
              <Label htmlFor="break-minutes">Break Duration (minutes)</Label>
              <Input
                id="break-minutes"
                type="number"
                min="0"
                max="240"
                value={formData.breakMinutes}
                onChange={(e) => setFormData({ ...formData, breakMinutes: parseInt(e.target.value) || 0 })}
              />
            </div>

            {/* Color Picker */}
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5">
                <Palette className="h-4 w-4 text-muted-foreground" />
                Color
              </Label>
              <div className="flex flex-wrap gap-2">
                {PRESET_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    title={`Select color ${c}`}
                    aria-label={`Select color ${c}`}
                    className={`w-8 h-8 rounded-lg transition-all duration-150 hover:scale-110 ${getTheme(c).bg} ${
                      formData.color === c
                        ? "ring-2 ring-offset-2 ring-gray-400 dark:ring-offset-gray-800 scale-110"
                        : ""
                    }`}
                    onClick={() => setFormData({ ...formData, color: c })}
                  />
                ))}
              </div>
            </div>

            {/* Department Select */}
            <div className="space-y-2">
              <Label>Department</Label>
              <Select
                value={formData.departmentId}
                onValueChange={(val) => setFormData({ ...formData, departmentId: val })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Departments" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">All Departments</SelectItem>
                  {departments.map((dept) => (
                    <SelectItem key={dept.id} value={dept.id}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Active Toggle */}
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div>
                <Label className="text-sm font-medium">Active Shift</Label>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Inactive shifts won&apos;t appear in scheduling
                </p>
              </div>
              <Switch
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => {
                setShowCreateDialog(false);
                setEditingShift(null);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={() => handleSubmit(!!editingShift)}
              disabled={submitting}
              className="bg-msbm-red hover:bg-msbm-red/80 text-white"
            >
              {submitting ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  Saving...
                </div>
              ) : editingShift ? (
                "Update Shift"
              ) : (
                "Create Shift"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ============ DELETE CONFIRM DIALOG ============ */}
      <Dialog open={!!showDeleteConfirm} onOpenChange={() => setShowDeleteConfirm(null)}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <Trash2 className="h-5 w-5" />
              Delete Shift
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground py-2">
            Are you sure you want to delete <strong>{showDeleteConfirm?.name}</strong>?
            This action cannot be undone.
          </p>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setShowDeleteConfirm(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete Shift
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
