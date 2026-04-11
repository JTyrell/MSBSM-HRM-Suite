"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Calendar } from "@/components/ui/calendar";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAppStore } from "@/store/app";
import { toast } from "sonner";
import {
  CalendarDays,
  Plus,
  Check,
  X,
  Clock,
  BriefcaseMedical,
  Palmtree,
  User,
  MoreHorizontal,
  CalendarRange,
  TrendingUp,
} from "lucide-react";
import {
  format,
  parseISO,
  differenceInBusinessDays,
  addDays,
  isWeekend,
  startOfDay,
  isWithinInterval,
  isSameDay,
  eachDayOfInterval,
} from "date-fns";
import type { DateRange } from "react-day-picker";

// ─── Types ───────────────────────────────────────────────────────────────────

interface PTOResponse {
  requests: Record<string, unknown>[];
}

interface BalanceResponse {
  balance: {
    id: string;
    employeeId: string;
    year: number;
    totalAllocated: number;
    usedSick: number;
    usedVacation: number;
    usedPersonal: number;
    usedOther: number;
  } | null;
}

type PTOType = "sick" | "vacation" | "personal" | "other";

const PTO_TYPE_CONFIG: Record<
  PTOType,
  { label: string; icon: React.ElementType; color: string; bg: string; calendarColor: string }
> = {
  sick: {
    label: "Sick Leave",
    icon: BriefcaseMedical,
    color: "text-rose-600 dark:text-rose-400",
    bg: "bg-rose-50 dark:bg-rose-950/40",
    calendarColor: "bg-rose-400",
  },
  vacation: {
    label: "Vacation",
    icon: Palmtree,
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-50 dark:bg-emerald-950/40",
    calendarColor: "bg-emerald-400",
  },
  personal: {
    label: "Personal",
    icon: User,
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-50 dark:bg-amber-950/40",
    calendarColor: "bg-amber-400",
  },
  other: {
    label: "Other",
    icon: MoreHorizontal,
    color: "text-sky-600 dark:text-sky-400",
    bg: "bg-sky-50 dark:bg-sky-950/40",
    calendarColor: "bg-sky-400",
  },
};

const STATUS_CONFIG: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; className: string }> = {
  pending: { label: "Pending", variant: "outline", className: "border-amber-300 text-amber-700 bg-amber-50 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-700" },
  approved: { label: "Approved", variant: "default", className: "bg-emerald-600 text-white hover:bg-emerald-700" },
  rejected: { label: "Rejected", variant: "destructive", className: "" },
  cancelled: { label: "Cancelled", variant: "secondary", className: "bg-muted text-muted-foreground" },
};

// ─── Helper ──────────────────────────────────────────────────────────────────

function calcBusinessDays(start: Date, end: Date): number {
  const days = eachDayOfInterval({ start, end });
  let count = 0;
  for (const d of days) {
    if (!isWeekend(d)) count++;
  }
  return count;
}

// ─── Component ───────────────────────────────────────────────────────────────

export function PTOView() {
  const { currentUserId, employees, ptoRequests, setPtoRequests } = useAppStore();

  const currentUser = employees.find((e) => e.id === currentUserId);
  const isAdminOrHR = currentUser?.role === "admin" || currentUser?.role === "hr" || currentUser?.role === "manager";

  // Balance state
  const [balance, setBalance] = useState<BalanceResponse["balance"]>(null);
  const [balanceLoading, setBalanceLoading] = useState(true);

  // Requests state
  const [requestsLoading, setRequestsLoading] = useState(true);

  // Request form state
  const [requestDialogOpen, setRequestDialogOpen] = useState(false);
  const [formType, setFormType] = useState<PTOType>("vacation");
  const [formDateRange, setFormDateRange] = useState<DateRange | undefined>(undefined);
  const [formReason, setFormReason] = useState("");
  const [formSubmitting, setFormSubmitting] = useState(false);

  // Calendar state
  const [calendarMonth, setCalendarMonth] = useState<Date>(new Date());

  // ─── Fetch balance ───────────────────────────────────────────────────────
  const fetchBalance = useCallback(async () => {
    if (!currentUserId) return;
    setBalanceLoading(true);
    try {
      const res = await fetch(`/api/pto-balances?userId=${currentUserId}&year=${new Date().getFullYear()}`);
      const data: BalanceResponse = await res.json();
      setBalance(data.balance);
    } catch {
      toast.error("Failed to load PTO balance");
    } finally {
      setBalanceLoading(false);
    }
  }, [currentUserId]);

  // ─── Fetch requests ──────────────────────────────────────────────────────
  const fetchRequests = useCallback(async () => {
    try {
      setRequestsLoading(true);
      const res = await fetch("/api/pto");
      const data: PTOResponse = await res.json();
      setPtoRequests(data.requests);
    } catch {
      toast.error("Failed to load PTO requests");
    } finally {
      setRequestsLoading(false);
    }
  }, [setPtoRequests]);

  useEffect(() => {
    fetchBalance();
    fetchRequests();
  }, [fetchBalance, fetchRequests]);

  // ─── Computed balance values ─────────────────────────────────────────────
  const totalAllocated = balance?.totalAllocated ?? 0;
  const usedSick = balance?.usedSick ?? 0;
  const usedVacation = balance?.usedVacation ?? 0;
  const usedPersonal = balance?.usedPersonal ?? 0;
  const usedOther = balance?.usedOther ?? 0;
  const totalUsed = usedSick + usedVacation + usedPersonal + usedOther;

  const balanceCards = [
    { type: "sick" as PTOType, used: usedSick },
    { type: "vacation" as PTOType, used: usedVacation },
    { type: "personal" as PTOType, used: usedPersonal },
    { type: "other" as PTOType, used: usedOther },
  ];

  // ─── Submit request ──────────────────────────────────────────────────────
  const handleSubmitRequest = async () => {
    if (!currentUserId || !formDateRange?.from || !formDateRange?.to) {
      toast.error("Please select a valid date range");
      return;
    }

    const bizDays = calcBusinessDays(formDateRange.from, formDateRange.to);
    if (bizDays <= 0) {
      toast.error("Please select at least one business day");
      return;
    }

    setFormSubmitting(true);
    try {
      const res = await fetch("/api/pto", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employeeId: currentUserId,
          type: formType,
          startDate: format(formDateRange.from, "yyyy-MM-dd"),
          endDate: format(formDateRange.to, "yyyy-MM-dd"),
          reason: formReason || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Failed to submit request");
        return;
      }

      toast.success(`PTO request submitted for ${bizDays} day(s)`);
      setRequestDialogOpen(false);
      setFormDateRange(undefined);
      setFormReason("");
      setFormType("vacation");
      fetchRequests();
      fetchBalance();
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setFormSubmitting(false);
    }
  };

  // ─── Approve / Reject ───────────────────────────────────────────────────
  const handleStatusChange = async (id: string, status: "approved" | "rejected") => {
    try {
      const res = await fetch("/api/pto", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status, approvedBy: currentUserId }),
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || "Failed to update request");
        return;
      }

      toast.success(`Request ${status}`);
      fetchRequests();
      fetchBalance();
    } catch {
      toast.error("Network error. Please try again.");
    }
  };

  // ─── Calendar day modifiers ─────────────────────────────────────────────
  const ptoDayMap = new Map<string, { type: PTOType; label: string; name: string }[]>();

  for (const req of ptoRequests) {
    if (req.status !== "approved") continue;
    try {
      const start = startOfDay(parseISO(req.startDate));
      const end = startOfDay(parseISO(req.endDate));
      const days = eachDayOfInterval({ start, end });
      const type = req.type as PTOType;
      const name = req.employee ? `${req.employee.firstName} ${req.employee.lastName}` : "Unknown";
      const label = PTO_TYPE_CONFIG[type]?.label || type;

      for (const d of days) {
        const key = format(d, "yyyy-MM-dd");
        const existing = ptoDayMap.get(key) || [];
        existing.push({ type, label, name });
        ptoDayMap.set(key, existing);
      }
    } catch {
      // skip invalid dates
    }
  }

  // ─── Render ─────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Time Off Management</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Request, track, and manage paid time off
          </p>
        </div>
        <Button
          onClick={() => setRequestDialogOpen(true)}
          className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg shadow-emerald-500/25"
        >
          <Plus className="h-4 w-4 mr-2" />
          Request Time Off
        </Button>
      </div>

      {/* Balance Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total */}
        <Card className="bg-gradient-to-br from-emerald-500/5 to-teal-500/5 border-emerald-200/50 dark:border-emerald-800/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-emerald-600" />
              Total PTO
            </CardTitle>
          </CardHeader>
          <CardContent>
            {balanceLoading ? (
              <div className="h-8 bg-muted animate-pulse rounded w-20" />
            ) : (
              <>
                <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">
                  {totalAllocated - totalUsed}
                  <span className="text-sm font-normal text-muted-foreground ml-1">
                    / {totalAllocated} days
                  </span>
                </div>
                <Progress
                  value={totalAllocated > 0 ? (totalUsed / totalAllocated) * 100 : 0}
                  className="mt-2 h-2"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {totalUsed} used &middot; {totalAllocated - totalUsed} remaining
                </p>
              </>
            )}
          </CardContent>
        </Card>

        {/* Per-type cards */}
        {balanceCards.map(({ type, used }) => {
          const config = PTO_TYPE_CONFIG[type];
          const Icon = config.icon;
          const available = totalAllocated - used;
          return (
            <Card key={type} className={config.bg}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Icon className={`h-4 w-4 ${config.color}`} />
                  {config.label}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {balanceLoading ? (
                  <div className="h-8 bg-muted animate-pulse rounded w-16" />
                ) : (
                  <>
                    <div className="text-2xl font-bold">
                      {available}
                      <span className="text-sm font-normal text-muted-foreground ml-1">
                        left
                      </span>
                    </div>
                    <Progress
                      value={totalAllocated > 0 ? (used / totalAllocated) * 100 : 0}
                      className={`mt-2 h-2 [&>div]:${type === "sick" ? "bg-rose-500" : type === "vacation" ? "bg-emerald-500" : type === "personal" ? "bg-amber-500" : "bg-sky-500"}`}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      {used} used
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="requests" className="space-y-4">
        <TabsList className="bg-muted/50">
          <TabsTrigger value="requests" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white">
            <CalendarRange className="h-4 w-4 mr-2" />
            Requests
          </TabsTrigger>
          <TabsTrigger value="calendar" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white">
            <CalendarDays className="h-4 w-4 mr-2" />
            Company Calendar
          </TabsTrigger>
        </TabsList>

        {/* ─── Requests Tab ──────────────────────────────────────────────── */}
        <TabsContent value="requests">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">PTO Requests</CardTitle>
            </CardHeader>
            <CardContent>
              {requestsLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="h-12 bg-muted animate-pulse rounded" />
                  ))}
                </div>
              ) : ptoRequests.length === 0 ? (
                <div className="text-center py-12">
                  <CalendarDays className="h-12 w-12 mx-auto text-muted-foreground/40 mb-3" />
                  <p className="text-muted-foreground">No PTO requests found</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-3"
                    onClick={() => setRequestDialogOpen(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Submit a request
                  </Button>
                </div>
              ) : (
                <ScrollArea className="max-h-[500px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Employee</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Start Date</TableHead>
                        <TableHead>End Date</TableHead>
                        <TableHead>Days</TableHead>
                        <TableHead className="hidden md:table-cell">Reason</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {ptoRequests.map((req) => {
                        const typeConfig = PTO_TYPE_CONFIG[req.type as PTOType] || PTO_TYPE_CONFIG.other;
                        const statusConfig = STATUS_CONFIG[req.status] || STATUS_CONFIG.pending;
                        const TypeIcon = typeConfig.icon;

                        return (
                          <TableRow key={req.id}>
                            <TableCell className="font-medium">
                              {req.employee
                                ? `${req.employee.firstName} ${req.employee.lastName}`
                                : "Unknown"}
                            </TableCell>
                            <TableCell>
                              <span className={`inline-flex items-center gap-1.5 text-sm ${typeConfig.color}`}>
                                <TypeIcon className="h-3.5 w-3.5" />
                                {typeConfig.label}
                              </span>
                            </TableCell>
                            <TableCell>
                              {format(parseISO(req.startDate), "MMM d, yyyy")}
                            </TableCell>
                            <TableCell>
                              {format(parseISO(req.endDate), "MMM d, yyyy")}
                            </TableCell>
                            <TableCell>
                              <span className="font-semibold">{req.daysCount}</span>
                            </TableCell>
                            <TableCell className="hidden md:table-cell max-w-[200px] truncate text-muted-foreground">
                              {req.reason || "—"}
                            </TableCell>
                            <TableCell>
                              <Badge variant={statusConfig.variant} className={statusConfig.className}>
                                {statusConfig.label}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              {req.status === "pending" && isAdminOrHR && (
                                <div className="flex items-center justify-end gap-1">
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-8 w-8 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
                                    onClick={() => handleStatusChange(req.id, "approved")}
                                  >
                                    <Check className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-8 w-8 text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                                    onClick={() => handleStatusChange(req.id, "rejected")}
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                              )}
                              {req.status !== "pending" && (
                                <span className="text-xs text-muted-foreground">—</span>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── Calendar Tab ──────────────────────────────────────────────── */}
        <TabsContent value="calendar">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <CalendarDays className="h-5 w-5 text-emerald-600" />
                Company Calendar
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Legend */}
              <div className="flex flex-wrap gap-4 mb-6">
                {(Object.keys(PTO_TYPE_CONFIG) as PTOType[]).map((type) => (
                  <div key={type} className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${PTO_TYPE_CONFIG[type].calendarColor}`} />
                    <span className="text-sm text-muted-foreground">{PTO_TYPE_CONFIG[type].label}</span>
                  </div>
                ))}
              </div>

              <div className="flex justify-center">
                <Calendar
                  mode="single"
                  month={calendarMonth}
                  onMonthChange={setCalendarMonth}
                  modifiers={{
                    ptoSick: (date) => {
                      const key = format(date, "yyyy-MM-dd");
                      const items = ptoDayMap.get(key);
                      return !!items?.some((i) => i.type === "sick");
                    },
                    ptoVacation: (date) => {
                      const key = format(date, "yyyy-MM-dd");
                      const items = ptoDayMap.get(key);
                      return !!items?.some((i) => i.type === "vacation");
                    },
                    ptoPersonal: (date) => {
                      const key = format(date, "yyyy-MM-dd");
                      const items = ptoDayMap.get(key);
                      return !!items?.some((i) => i.type === "personal");
                    },
                    ptoOther: (date) => {
                      const key = format(date, "yyyy-MM-dd");
                      const items = ptoDayMap.get(key);
                      return !!items?.some((i) => i.type === "other");
                    },
                  }}
                  modifiersClassNames={{
                    ptoSick: "relative [&>button]:bg-rose-100 dark:[&>button]:bg-rose-950/60 [&>button]:text-rose-700 dark:[&>button]:text-rose-300 [&>button]:font-semibold [&>button]:after:content-[''] [&>button]:after:absolute [&>button]:after:bottom-0.5 [&>button]:after:left-1/2 [&>button]:after:-translate-x-1/2 [&>button]:after:w-1.5 [&>button]:after:h-1.5 [&>button]:after:rounded-full [&>button]:after:bg-rose-400",
                    ptoVacation: "relative [&>button]:bg-emerald-100 dark:[&>button]:bg-emerald-950/60 [&>button]:text-emerald-700 dark:[&>button]:text-emerald-300 [&>button]:font-semibold [&>button]:after:content-[''] [&>button]:after:absolute [&>button]:after:bottom-0.5 [&>button]:after:left-1/2 [&>button]:after:-translate-x-1/2 [&>button]:after:w-1.5 [&>button]:after:h-1.5 [&>button]:after:rounded-full [&>button]:after:bg-emerald-400",
                    ptoPersonal: "relative [&>button]:bg-amber-100 dark:[&>button]:bg-amber-950/60 [&>button]:text-amber-700 dark:[&>button]:text-amber-300 [&>button]:font-semibold [&>button]:after:content-[''] [&>button]:after:absolute [&>button]:after:bottom-0.5 [&>button]:after:left-1/2 [&>button]:after:-translate-x-1/2 [&>button]:after:w-1.5 [&>button]:after:h-1.5 [&>button]:after:rounded-full [&>button]:after:bg-amber-400",
                    ptoOther: "relative [&>button]:bg-sky-100 dark:[&>button]:bg-sky-950/60 [&>button]:text-sky-700 dark:[&>button]:text-sky-300 [&>button]:font-semibold [&>button]:after:content-[''] [&>button]:after:absolute [&>button]:after:bottom-0.5 [&>button]:after:left-1/2 [&>button]:after:-translate-x-1/2 [&>button]:after:w-1.5 [&>button]:after:h-1.5 [&>button]:after:rounded-full [&>button]:after:bg-sky-400",
                  }}
                  classNames={{
                    day: "relative [&>button]:relative",
                  }}
                  className="rounded-lg border p-4 mx-auto"
                />
              </div>

              {/* PTO Day Details */}
              {calendarMonth && (
                <div className="mt-6">
                  <h3 className="text-sm font-semibold mb-3">
                    PTO for {format(calendarMonth, "MMMM yyyy")}
                  </h3>
                  <ScrollArea className="max-h-48">
                    <div className="space-y-2">
                      {Array.from(ptoDayMap.entries())
                        .filter(([key]) => {
                          const d = parseISO(key);
                          return d.getMonth() === calendarMonth.getMonth() && d.getFullYear() === calendarMonth.getFullYear();
                        })
                        .sort(([a], [b]) => a.localeCompare(b))
                        .map(([key, items]) => (
                          <div
                            key={key}
                            className="flex items-center gap-3 p-2 rounded-lg bg-muted/50 text-sm"
                          >
                            <span className="font-medium w-20 shrink-0">
                              {format(parseISO(key), "EEE, MMM d")}
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              {items.map((item, idx) => (
                                <Badge
                                  key={idx}
                                  variant="outline"
                                  className={`${PTO_TYPE_CONFIG[item.type]?.calendarColor.replace("bg-", "border-").replace("400", "500")} text-xs`}
                                >
                                  {item.label} &mdash; {item.name}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        ))}
                      {Array.from(ptoDayMap.keys()).filter((key) => {
                        const d = parseISO(key);
                        return d.getMonth() === calendarMonth.getMonth() && d.getFullYear() === calendarMonth.getFullYear();
                      }).length === 0 && (
                        <p className="text-sm text-muted-foreground text-center py-4">
                          No approved time off for this month
                        </p>
                      )}
                    </div>
                  </ScrollArea>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ─── Request Dialog ───────────────────────────────────────────────── */}
      <Dialog open={requestDialogOpen} onOpenChange={setRequestDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-emerald-600" />
              Request Time Off
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Type */}
            <div className="space-y-2">
              <Label>Type of Leave</Label>
              <Select
                value={formType}
                onValueChange={(v) => setFormType(v as PTOType)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(PTO_TYPE_CONFIG) as PTOType[]).map((type) => {
                    const Icon = PTO_TYPE_CONFIG[type].icon;
                    return (
                      <SelectItem key={type} value={type}>
                        <span className="flex items-center gap-2">
                          <Icon className="h-4 w-4" />
                          {PTO_TYPE_CONFIG[type].label}
                        </span>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            {/* Date Range */}
            <div className="space-y-2">
              <Label>Date Range</Label>
              <div className="border rounded-lg p-2">
                <Calendar
                  mode="range"
                  selected={formDateRange}
                  onSelect={setFormDateRange}
                  numberOfMonths={1}
                  disabled={{ before: startOfDay(new Date()) }}
                  className="mx-auto rounded-md"
                />
              </div>
              {formDateRange?.from && formDateRange?.to && (
                <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">
                  {calcBusinessDays(formDateRange.from, formDateRange.to)} business day(s) selected
                </p>
              )}
            </div>

            {/* Reason */}
            <div className="space-y-2">
              <Label htmlFor="pto-reason">Reason (optional)</Label>
              <Textarea
                id="pto-reason"
                placeholder="Brief description of your time off..."
                value={formReason}
                onChange={(e) => setFormReason(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setRequestDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmitRequest}
              disabled={formSubmitting || !formDateRange?.from || !formDateRange?.to}
              className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white"
            >
              {formSubmitting ? (
                <>
                  <Clock className="h-4 w-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Request"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
