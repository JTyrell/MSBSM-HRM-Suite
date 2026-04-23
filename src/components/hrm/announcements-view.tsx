"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { toast } from "sonner";
import { formatDistanceToNow, isThisMonth, format, differenceInDays, startOfMonth, endOfMonth, getDay, getDate, getDaysInMonth, addMonths, subMonths, isSameDay, isSameMonth, isBefore, startOfDay, isAfter } from "date-fns";
import { useAppStore } from "@/store/app";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Megaphone,
  Pin,
  AlertTriangle,
  Calendar,
  CalendarDays,
  PartyPopper,
  BookOpen,
  Plus,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Gift,
  Edit,
  Trash2,
  Eye,
  Clock,
  User,
  ChevronDown,
  ChevronUp,
  TrendingUp,
  PinIcon,
  Zap,
  SmilePlus,
} from "lucide-react";

// ============ TYPES ============

interface Announcement {
  id: string;
  title: string;
  content: string;
  category: string;
  priority: string;
  authorId: string;
  isPinned: boolean;
  isPublished: boolean;
  expiresAt: string | null;
  companyId: string;
  createdAt: string;
  updatedAt: string;
}

interface AnnouncementForm {
  title: string;
  content: string;
  category: string;
  priority: string;
  isPinned: boolean;
  isPublished: boolean;
  expiresAt: string;
}

// ============ CONSTANTS ============

const CATEGORY_CONFIG: Record<string, { label: string; color: string; bgColor: string; darkBgColor: string; icon: React.ElementType }> = {
  general: {
    label: "General",
    color: "text-msbm-red dark:text-msbm-red-bright",
    bgColor: "bg-msbm-red/10 dark:bg-msbm-red/20",
    darkBgColor: "bg-msbm-red/20",
    icon: BookOpen,
  },
  event: {
    label: "Events",
    color: "text-amber-700 dark:text-amber-400",
    bgColor: "bg-amber-100 dark:bg-amber-900/30",
    darkBgColor: "bg-amber-900/30",
    icon: Calendar,
  },
  policy: {
    label: "Policy",
    color: "text-slate-700 dark:text-slate-400",
    bgColor: "bg-slate-100 dark:bg-slate-900/30",
    darkBgColor: "bg-slate-900/30",
    icon: BookOpen,
  },
  urgent: {
    label: "Urgent",
    color: "text-red-700 dark:text-red-400",
    bgColor: "bg-red-100 dark:bg-red-900/30",
    darkBgColor: "bg-red-900/30",
    icon: AlertTriangle,
  },
  celebration: {
    label: "Celebrations",
    color: "text-pink-700 dark:text-pink-400",
    bgColor: "bg-pink-100 dark:bg-pink-900/30",
    darkBgColor: "bg-pink-900/30",
    icon: PartyPopper,
  },
};

const PRIORITY_CONFIG: Record<string, { label: string; color: string; dotColor: string; badgeClass?: string }> = {
  low: { label: "Low", color: "text-gray-500 dark:text-gray-400", dotColor: "bg-gray-400" },
  normal: { label: "Normal", color: "text-msbm-red dark:text-msbm-red-bright", dotColor: "bg-msbm-red/50", badgeClass: "badge-gradient-emerald" },
  high: { label: "High", color: "text-amber-600 dark:text-amber-400", dotColor: "bg-amber-500", badgeClass: "badge-gradient-amber" },
  urgent: { label: "Urgent", color: "text-red-600 dark:text-red-400", dotColor: "bg-red-500", badgeClass: "badge-gradient-rose" },
};

const CATEGORY_TABS = [
  { value: "all", label: "All" },
  { value: "general", label: "General" },
  { value: "event", label: "Events" },
  { value: "policy", label: "Policy" },
  { value: "urgent", label: "Urgent" },
  { value: "celebration", label: "Celebrations" },
  { value: "holidays", label: "Holidays" },
];

// ============ COMPANY HOLIDAYS ============

function getHolidaysForYear(year: number) {
    return [
      { name: "New Year's Day", date: new Date(year, 0, 1), type: "Federal" as const },
      { name: "MLK Day", date: new Date(year, 0, 20), type: "Federal" as const },
      { name: "Presidents' Day", date: new Date(year, 1, 17), type: "Federal" as const },
      { name: "Memorial Day", date: new Date(year, 4, 26), type: "Federal" as const },
      { name: "Independence Day", date: new Date(year, 6, 4), type: "Federal" as const },
      { name: "Labor Day", date: new Date(year, 8, 1), type: "Federal" as const },
      { name: "Columbus Day", date: new Date(year, 9, 13), type: "Federal" as const },
      { name: "Veterans Day", date: new Date(year, 10, 11), type: "Federal" as const },
      { name: "Thanksgiving", date: new Date(year, 10, 27), type: "Federal" as const },
      { name: "Day After Thanksgiving", date: new Date(year, 10, 28), type: "Company" as const },
      { name: "Christmas Eve", date: new Date(year, 11, 24), type: "Company" as const },
      { name: "Christmas Day", date: new Date(year, 11, 25), type: "Federal" as const },
    ];
  }

// ============ HOLIDAYS CALENDAR COMPONENT ============

function HolidaysCalendar() {
  const [currentMonth, setCurrentMonth] = useState(() => new Date());
  const today = useMemo(() => startOfDay(new Date()), []);
  const year = currentMonth.getFullYear();

  const holidays = useMemo(() => getHolidaysForYear(year), [year]);
  const monthHolidays = useMemo(
    () => holidays.filter((h) => isSameMonth(h.date, currentMonth)),
    [holidays, currentMonth]
  );

  const nextHoliday = useMemo(() => {
    return holidays.find((h) => isAfter(h.date, today));
  }, [holidays, today]);

  const daysUntilNext = useMemo(() => {
    if (!nextHoliday) return null;
    return differenceInDays(nextHoliday.date, today);
  }, [nextHoliday, today]);

  const totalHolidays = holidays.length;
  const pastHolidays = holidays.filter((h) => isBefore(h.date, today));
  const upcomingHolidays = holidays.filter((h) => isAfter(h.date, today) || isSameDay(h.date, today));

  // Calendar grid data
  const calendarDays = useMemo(() => {
    const firstDay = getDay(startOfMonth(currentMonth));
    const daysInMonth = getDaysInMonth(currentMonth);
    const days: (number | null)[] = [];

    // Pad start of month
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }
    // Add days
    for (let d = 1; d <= daysInMonth; d++) {
      days.push(d);
    }
    return days;
  }, [currentMonth]);

  const holidayMap = useMemo(() => {
    const map = new Map<number, typeof monthHolidays[number][]>();
    for (const h of monthHolidays) {
      const day = getDate(h.date);
      if (!map.has(day)) map.set(day, []);
      map.get(day)!.push(h);
    }
    return map;
  }, [monthHolidays]);

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="space-y-6">
      {/* Countdown + Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Next Holiday Countdown */}
        {nextHoliday && (
          <Card className="border-2 border-emerald-300 dark:border-emerald-700 bg-gradient-to-br from-emerald-50 via-teal-50 to-emerald-100/50 dark:from-emerald-950/30 dark:via-teal-950/20 dark:to-emerald-900/10 sm:col-span-2 overflow-hidden">
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-400 to-inner-blue flex items-center justify-center shadow-lg shadow-emerald-500/20">
                      <Sparkles className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold text-msbm-red dark:text-msbm-red-bright uppercase tracking-wider">Next Holiday</p>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">{nextHoliday.name}</h3>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline" className="text-[10px] bg-white/80 dark:bg-gray-900/50 text-msbm-red dark:text-emerald-300 border-msbm-red/20 dark:border-msbm-red/20">
                      {nextHoliday.type}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {format(nextHoliday.date, "EEEE, MMMM d, yyyy")}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col items-center justify-center px-6 py-3 rounded-2xl bg-white/60 dark:bg-gray-900/40 border border-msbm-red/20 dark:border-msbm-red/20">
                  <p className="text-3xl font-bold text-msbm-red dark:text-msbm-red-bright">{daysUntilNext}</p>
                  <p className="text-[10px] text-msbm-red dark:text-msbm-red-bright font-medium uppercase tracking-wider">Days Left</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats */}
        <Card className="border-teal-100 dark:border-teal-900/30 overflow-hidden">
          <CardContent className="p-4 flex flex-col justify-between h-full">
            <div className="flex items-center gap-2 mb-3">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center">
                <Gift className="h-4 w-4 text-white" />
              </div>
              <p className="text-xs font-semibold text-gray-900 dark:text-white">Holiday Stats</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Total Holidays</span>
                <span className="text-sm font-bold text-gray-900 dark:text-white">{totalHolidays}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Past</span>
                <span className="text-sm font-medium text-muted-foreground">{pastHolidays.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Upcoming</span>
                <span className="text-sm font-bold text-msbm-red dark:text-msbm-red-bright">{upcomingHolidays.length}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Calendar Grid */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setCurrentMonth((m) => subMonths(m, 1))}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <CardTitle className="text-base font-semibold">
                {format(currentMonth, "MMMM yyyy")}
              </CardTitle>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setCurrentMonth((m) => addMonths(m, 1))}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <Button variant="ghost" size="sm" className="text-xs" onClick={() => setCurrentMonth(new Date())}>
              Today
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-3 sm:p-4">
          {/* Weekday Headers */}
          <div className="grid grid-cols-7 gap-1 mb-1">
            {weekDays.map((day) => (
              <div key={day} className="text-center text-[10px] font-semibold text-muted-foreground uppercase tracking-wider py-1">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day, idx) => {
              const isCurrentDay = day !== null && isSameDay(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day), today);
              const holidaysForDay = day !== null ? (holidayMap.get(day) || []) : [];
              const isPast = day !== null && isBefore(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day!), today);
              const isToday = day !== null && isSameDay(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day), today);

              return (
                <div
                  key={idx}
                  className={`min-h-[60px] sm:min-h-[72px] rounded-lg border p-1 transition-colors ${
                    isCurrentDay
                      ? "border-emerald-400 dark:border-emerald-600 bg-msbm-red/5/50 dark:bg-emerald-950/20"
                      : isToday
                        ? "border-msbm-red/20 dark:border-msbm-red/20 bg-msbm-red/5/30 dark:bg-emerald-950/10"
                        : "border-transparent bg-muted/20"
                  }`}
                >
                  {day !== null && (
                    <>
                      <p className={`text-[11px] font-medium text-right mb-0.5 ${
                        isCurrentDay
                          ? "text-msbm-red dark:text-emerald-300"
                          : isPast
                            ? "text-muted-foreground/50"
                            : "text-gray-700 dark:text-gray-300"
                      }`}>
                        {day}
                      </p>
                      <div className="space-y-0.5">
                        {holidaysForDay.map((holiday) => {
                          const isHolidayPast = isBefore(holiday.date, today);
                          const isHolidayToday = isSameDay(holiday.date, today);
                          return (
                            <div
                              key={holiday.name}
                              className={`text-[8px] sm:text-[9px] px-1 py-0.5 rounded truncate leading-tight ${
                                isHolidayToday
                                  ? "bg-msbm-red/50 text-white font-semibold"
                                  : isHolidayPast
                                    ? "bg-gray-100 text-gray-500 dark:bg-gray-800/50 dark:text-gray-400"
                                    : "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400"
                              }`}
                              title={`${holiday.name} (${holiday.type})`}
                            >
                              {holiday.name}
                            </div>
                          );
                        })}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Holidays List */}
      {upcomingHolidays.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-teal-600" />
            Upcoming Holidays ({year})
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {upcomingHolidays.map((holiday) => {
              const isToday = isSameDay(holiday.date, today);
              return (
                <Card
                  key={holiday.name}
                  className={`transition-all ${
                    isToday
                      ? "border-2 border-emerald-400 dark:border-emerald-600 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20"
                      : "hover:border-msbm-red/20 dark:hover:border-msbm-red/20"
                  }`}
                >
                  <CardContent className="p-3 flex items-center gap-3">
                    <div className={`h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      isToday
                        ? "bg-gradient-to-br from-emerald-400 to-inner-blue shadow-lg shadow-emerald-500/20"
                        : "bg-muted"
                    }`}>
                      {isToday ? (
                        <Sparkles className="h-5 w-5 text-white" />
                      ) : (
                        <Calendar className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium truncate ${isToday ? "text-msbm-red dark:text-emerald-300" : "text-gray-900 dark:text-white"}`}>
                        {holiday.name}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-muted-foreground">
                          {format(holiday.date, "MMM d, yyyy")}
                        </span>
                        <Badge
                          variant="outline"
                          className={`text-[9px] px-1.5 py-0 ${
                            holiday.type === "Federal"
                              ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800"
                              : "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400 border-teal-200 dark:border-teal-800"
                          }`}
                        >
                          {holiday.type}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Past Holidays (collapsible) */}
      {pastHolidays.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Past Holidays ({year})
          </h3>
          <div className="space-y-2">
            {pastHolidays.map((holiday) => (
              <div
                key={holiday.name}
                className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 opacity-60"
              >
                <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                  <Calendar className="h-4 w-4 text-muted-foreground/60" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-muted-foreground truncate">{holiday.name}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">{format(holiday.date, "MMM d, yyyy")}</span>
                    <Badge variant="outline" className="text-[9px] px-1.5 py-0 bg-gray-100 text-gray-500 dark:bg-gray-800/30 dark:text-gray-400 border-gray-200 dark:border-gray-700">
                      {holiday.type}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ============ REACTIONS ============

type Reaction = {
  emoji: string;
  count: number;
  hasReacted: boolean;
};

const REACTION_EMOJIS = ["👍", "❤️", "🎉", "👏", "🤔", "🔥"];



const defaultForm: AnnouncementForm = {
  title: "",
  content: "",
  category: "general",
  priority: "normal",
  isPinned: false,
  isPublished: true,
  expiresAt: "",
};

// ============ MAIN COMPONENT ============

export function AnnouncementsView() {
  const { currentUserId, employees } = useAppStore();

  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");

  // Dialogs
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<Announcement | null>(null);
  const [formData, setFormData] = useState<AnnouncementForm>(defaultForm);
  const [submitting, setSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof AnnouncementForm, string>>>({});
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [reactions, setReactions] = useState<Record<string, Reaction[]>>({});

  const currentUser = employees.find((e) => e.id === currentUserId);
  const isAdmin = currentUser?.role === "admin" || currentUser?.role === "hr";

  // ============ DATA FETCHING ============

  const fetchAnnouncements = useCallback(async () => {
    // Skip fetching when on holidays tab
    if (activeTab === "holidays") return;
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (activeTab !== "all" && activeTab !== "holidays") {
        params.set("category", activeTab);
      }
      const res = await fetch(`/api/announcements?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch announcements");
      const data = await res.json();
      setAnnouncements(data.announcements || []);
    } catch {
      toast.error("Failed to load announcements");
    } finally {
      setIsLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchAnnouncements();
  }, [fetchAnnouncements]);

  // ============ REACTIONS HANDLERS ============

  // Initialize empty reactions for announcements that don't have any yet
  useEffect(() => {
    setReactions({});
  }, [announcements]);

  const toggleReaction = (announcementId: string, emoji: string) => {
    setReactions((prev) => {
      const current = prev[announcementId] || [];
      const existing = current.find((r) => r.emoji === emoji);

      if (!existing) return prev;

      if (existing.hasReacted) {
        // Remove user's reaction
        const updated = current
          .map((r) =>
            r.emoji === emoji
              ? { ...r, count: Math.max(0, r.count - 1), hasReacted: false }
              : r
          )
          .filter((r) => r.count > 0);
        return { ...prev, [announcementId]: updated };
      } else {
        // Add user's reaction
        const updated = current.map((r) =>
          r.emoji === emoji
            ? { ...r, count: r.count + 1, hasReacted: true }
            : r
        );
        return { ...prev, [announcementId]: updated };
      }
    });
  };

  const addReaction = (announcementId: string, emoji: string) => {
    setReactions((prev) => {
      const current = prev[announcementId] || [];
      const existing = current.find((r) => r.emoji === emoji);

      if (existing) {
        // If already reacted by user, un-react; otherwise, add reaction
        if (existing.hasReacted) {
          const updated = current
            .map((r) =>
              r.emoji === emoji
                ? { ...r, count: Math.max(0, r.count - 1), hasReacted: false }
                : r
            )
            .filter((r) => r.count > 0);
          return { ...prev, [announcementId]: updated };
        } else {
          const updated = current.map((r) =>
            r.emoji === emoji
              ? { ...r, count: r.count + 1, hasReacted: true }
              : r
          );
          return { ...prev, [announcementId]: updated };
        }
      } else {
        // New reaction
        const newReaction: Reaction = { emoji, count: 1, hasReacted: true };
        return { ...prev, [announcementId]: [...current, newReaction] };
      }
    });
  };

  // ============ COMPUTED VALUES ============

  const pinnedAnnouncements = announcements.filter((a) => a.isPinned);
  const regularAnnouncements = announcements.filter((a) => !a.isPinned);

  const stats = (() => {
    const thisMonth = announcements.filter((a) => isThisMonth(new Date(a.createdAt)));
    return {
      total: announcements.length,
      pinned: pinnedAnnouncements.length,
      urgent: announcements.filter((a) => a.priority === "urgent").length,
      thisMonth: thisMonth.length,
    };
  })();

  // ============ FORM HANDLERS ============

  const openCreate = () => {
    setFormData(defaultForm);
    setFormErrors({});
    setShowCreateDialog(true);
  };

  const openEdit = (announcement: Announcement) => {
    setFormData({
      title: announcement.title,
      content: announcement.content,
      category: announcement.category,
      priority: announcement.priority,
      isPinned: announcement.isPinned,
      isPublished: announcement.isPublished,
      expiresAt: announcement.expiresAt ? announcement.expiresAt.split("T")[0] : "",
    });
    setFormErrors({});
    setEditingAnnouncement(announcement);
  };

  const validateForm = (): boolean => {
    const errors: Partial<Record<keyof AnnouncementForm, string>> = {};
    if (!formData.title.trim()) errors.title = "Title is required";
    if (!formData.content.trim()) errors.content = "Content is required";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (isEdit: boolean) => {
    if (!validateForm()) return;

    try {
      setSubmitting(true);
      const companyId = announcements.length > 0
        ? announcements[0].companyId
        : (await fetch("/api/announcements").then((r) => r.json()).then((d) => d.announcements?.[0]?.companyId || ""));

      if (!companyId && !isEdit) {
        toast.error("No company found. Please seed data first.");
        return;
      }

      const body = {
        ...(isEdit ? { id: editingAnnouncement!.id } : {}),
        title: formData.title,
        content: formData.content,
        category: formData.category,
        priority: formData.priority,
        isPinned: formData.isPinned,
        isPublished: formData.isPublished,
        expiresAt: formData.expiresAt || null,
        ...(isEdit ? {} : { authorId: currentUserId, companyId }),
      };

      const res = await fetch("/api/announcements", {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save announcement");
      }

      toast.success(isEdit ? "Announcement updated" : "Announcement created");
      setShowCreateDialog(false);
      setEditingAnnouncement(null);
      fetchAnnouncements();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save announcement");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!showDeleteConfirm) return;
    try {
      const res = await fetch("/api/announcements", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: showDeleteConfirm.id }),
      });
      if (!res.ok) throw new Error("Failed to delete announcement");
      toast.success("Announcement deleted");
      setShowDeleteConfirm(null);
      fetchAnnouncements();
    } catch {
      toast.error("Failed to delete announcement");
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const getAuthorName = (authorId: string) => {
    const emp = employees.find((e) => e.id === authorId);
    return emp ? `${emp.firstName} ${emp.lastName}` : "Unknown Author";
  };

  const getAuthorInitials = (authorId: string) => {
    const emp = employees.find((e) => e.id === authorId);
    if (!emp) return "??";
    return `${emp.firstName[0]}${emp.lastName[0]}`.toUpperCase();
  };

  // ============ RENDER ANNOUNCEMENT CARD ============

  const renderAnnouncementCard = (announcement: Announcement, isPinned: boolean) => {
    const catConfig = CATEGORY_CONFIG[announcement.category] || CATEGORY_CONFIG.general;
    const priConfig = PRIORITY_CONFIG[announcement.priority] || PRIORITY_CONFIG.normal;
    const CatIcon = catConfig.icon;
    const isExpanded = expandedIds.has(announcement.id);
    const isLong = announcement.content.length > 200;

    return (
      <Card
        key={announcement.id}
        className={`group card-hover-lift transition-all duration-200 card-neu-light ${
          isPinned
            ? "border-2 border-emerald-300 dark:border-emerald-700 bg-gradient-to-r from-emerald-50/50 to-teal-50/50 dark:from-emerald-950/20 dark:to-teal-950/20"
            : "hover:border-msbm-red/20 dark:hover:border-msbm-red/20"
        }`}
      >
        <CardContent className="p-4 sm:p-5">
          {/* Header */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3 min-w-0 flex-1">
              {/* Pin indicator */}
              {isPinned && (
                <div className="shrink-0 mt-0.5">
                  <Pin className="h-5 w-5 text-msbm-red dark:text-msbm-red-bright fill-emerald-600 dark:fill-emerald-400" />
                </div>
              )}

              <div className="min-w-0 flex-1">
                {/* Title row */}
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className={`font-semibold text-gray-900 dark:text-white ${isPinned ? "text-base" : "text-sm"}`}>
                    {announcement.title}
                  </h3>
                  <Badge
                    variant="outline"
                    className={`text-[10px] px-1.5 py-0 border-0 ${catConfig.bgColor} ${catConfig.color}`}
                  >
                    <CatIcon className="h-3 w-3 mr-0.5" />
                    {catConfig.label}
                  </Badge>
                  {announcement.priority !== "normal" && (
                    <span className={`flex items-center gap-1 text-[11px] font-medium ${priConfig.color}`}>
                      <span className={`inline-block h-1.5 w-1.5 rounded-full ${priConfig.dotColor}`} />
                      {priConfig.label}
                    </span>
                  )}
                </div>

                {/* Content */}
                <div className="mt-2">
                  <p className={`text-sm text-muted-foreground leading-relaxed ${
                    isLong && !isExpanded ? "line-clamp-2" : ""
                  }`}>
                    {announcement.content}
                  </p>
                  {isLong && (
                    <span
                      role="button"
                      tabIndex={0}
                      onClick={() => toggleExpand(announcement.id)}
                      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") toggleExpand(announcement.id); }}
                      className="flex items-center gap-1 text-xs text-msbm-red dark:text-msbm-red-bright hover:text-msbm-red dark:hover:text-emerald-300 font-medium mt-1.5 transition-colors cursor-pointer"
                    >
                      {isExpanded ? (
                        <>
                          <ChevronUp className="h-3 w-3" />
                          Show less
                        </>
                      ) : (
                        <>
                          <ChevronDown className="h-3 w-3" />
                          Read more
                        </>
                      )}
                    </span>
                  )}
                </div>

                {/* Footer */}
                <div className="flex items-center gap-3 mt-3 flex-wrap">
                  <div className="flex items-center gap-1.5">
                    <div className="h-5 w-5 rounded-full bg-gradient-to-br from-emerald-400 to-inner-blue flex items-center justify-center">
                      <span className="text-[8px] font-bold text-white">
                        {getAuthorInitials(announcement.authorId)}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground font-medium">
                      {getAuthorName(announcement.authorId)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>{formatDistanceToNow(new Date(announcement.createdAt), { addSuffix: true })}</span>
                  </div>
                  {announcement.expiresAt && (
                    <div className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400">
                      <AlertTriangle className="h-3 w-3" />
                      <span>Expires {formatDistanceToNow(new Date(announcement.expiresAt), { addSuffix: true })}</span>
                    </div>
                  )}
                </div>

                {/* Reaction Bar */}
                {(reactions[announcement.id]?.length ?? 0) > 0 && (
                  <div className="flex items-center gap-2 mt-3 flex-wrap">
                    {reactions[announcement.id].map((reaction) => (
                      <button
                        key={reaction.emoji}
                        onClick={() => toggleReaction(announcement.id, reaction.emoji)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-sm border transition-colors cursor-pointer ${
                          reaction.hasReacted
                            ? "bg-msbm-red/5 border-msbm-red/20 dark:bg-emerald-950/30 dark:border-msbm-red/20 hover:bg-msbm-red/10 dark:hover:bg-emerald-950/50"
                            : "hover:bg-accent/50"
                        }`}
                      >
                        <span>{reaction.emoji}</span>
                        <span className="text-xs text-muted-foreground font-medium">{reaction.count}</span>
                      </button>
                    ))}

                    {/* Emoji Picker Button */}
                    <Popover>
                      <PopoverTrigger asChild>
                        <button
                          className="w-7 h-7 rounded-full border flex items-center justify-center hover:bg-accent/50 text-muted-foreground transition-colors cursor-pointer"
                          aria-label="Add reaction"
                        >
                          <SmilePlus className="h-3.5 w-3.5" />
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-2" align="start">
                        <div className="flex items-center gap-1">
                          {REACTION_EMOJIS.map((emoji) => (
                            <button
                              key={emoji}
                              onClick={() => addReaction(announcement.id, emoji)}
                              className="text-xl hover:scale-125 transition-transform cursor-pointer p-1 rounded-md hover:bg-accent/50"
                              aria-label={`React with ${emoji}`}
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                )}

                {/* Show picker when no reactions yet */}
                {(reactions[announcement.id]?.length ?? 0) === 0 && (
                  <div className="flex items-center gap-2 mt-3">
                    <Popover>
                      <PopoverTrigger asChild>
                        <button
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs border text-muted-foreground hover:bg-accent/50 transition-colors cursor-pointer"
                          aria-label="Add reaction"
                        >
                          <SmilePlus className="h-3.5 w-3.5" />
                          <span>React</span>
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-2" align="start">
                        <div className="flex items-center gap-1">
                          {REACTION_EMOJIS.map((emoji) => (
                            <button
                              key={emoji}
                              onClick={() => addReaction(announcement.id, emoji)}
                              className="text-xl hover:scale-125 transition-transform cursor-pointer p-1 rounded-md hover:bg-accent/50"
                              aria-label={`React with ${emoji}`}
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            {isAdmin && (
              <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-msbm-red"
                  onClick={() => openEdit(announcement)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-red-600"
                  onClick={() => setShowDeleteConfirm(announcement)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  // ============ MAIN RENDER ============

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            Announcements
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Company bulletin board — stay updated with the latest news and events.
          </p>
        </div>
        {isAdmin && (
          <Button
            onClick={openCreate}
            className="bg-msbm-red hover:bg-msbm-red/80 text-white shadow-sm"
          >
            <Plus className="mr-2 h-4 w-4" />
            New Announcement
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-emerald-100 dark:border-emerald-900/30 overflow-hidden">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-medium">Total</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stats.total}</p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <Megaphone className="h-5 w-5 text-white" />
              </div>
            </div>
            <div className="mt-2 text-[11px] text-muted-foreground flex items-center gap-1">
              <Eye className="h-3 w-3" />
              <span>Published announcements</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-teal-100 dark:border-teal-900/30 overflow-hidden">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-medium">Pinned</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stats.pinned}</p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center shadow-lg shadow-teal-500/20">
                <PinIcon className="h-5 w-5 text-white" />
              </div>
            </div>
            <div className="mt-2 text-[11px] text-muted-foreground flex items-center gap-1">
              <Pin className="h-3 w-3 text-teal-500" />
              <span>Important &amp; sticky posts</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-red-100 dark:border-red-900/30 overflow-hidden">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-medium">Urgent</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stats.urgent}</p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center shadow-lg shadow-red-500/20">
                <AlertTriangle className="h-5 w-5 text-white" />
              </div>
            </div>
            <div className="mt-2 text-[11px] text-muted-foreground flex items-center gap-1">
              <Zap className="h-3 w-3 text-red-500" />
              <span>Requires attention</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-amber-100 dark:border-amber-900/30 overflow-hidden">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-medium">This Month</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stats.thisMonth}</p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
            </div>
            <div className="mt-2 text-[11px] text-muted-foreground flex items-center gap-1">
              <Calendar className="h-3 w-3 text-amber-500" />
              <span>New announcements</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pinned Section */}
      {pinnedAnnouncements.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Pin className="h-4 w-4 text-msbm-red dark:text-msbm-red-bright" />
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
              Pinned Announcements
            </h2>
            <Badge variant="outline" className="text-[10px] bg-msbm-red/5 text-msbm-red dark:bg-msbm-red/20 dark:text-msbm-red-bright border-msbm-red/20 dark:border-msbm-red/20">
              {pinnedAnnouncements.length}
            </Badge>
          </div>
          <div className="callout-info">
            <div className="timeline-container space-y-0">
              {pinnedAnnouncements.map((a) => renderAnnouncementCard(a, true))}
            </div>
          </div>
        </div>
      )}

      {/* Category Filter Tabs */}
      <div>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            {CATEGORY_TABS.map((tab) => {
              const catConfig = tab.value !== "all" ? CATEGORY_CONFIG[tab.value] : null;
              return (
                <TabsTrigger key={tab.value} value={tab.value} className="gap-1.5 text-xs">
                  {catConfig && <catConfig.icon className="h-3 w-3" />}
                  {tab.label}
                </TabsTrigger>
              );
            })}
          </TabsList>
        </Tabs>

        {/* Holidays View */}
        {activeTab === "holidays" ? (
          <HolidaysCalendar />
        ) : isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600" />
          </div>
        ) : regularAnnouncements.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
                <Megaphone className="h-8 w-8 text-muted-foreground/40" />
              </div>
              <p className="text-sm font-medium text-muted-foreground">No announcements found</p>
              <p className="text-xs text-muted-foreground mt-1">
                {activeTab !== "all"
                  ? "No announcements in this category yet."
                  : "Be the first to share an update with the team!"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="timeline-container space-y-0">
            {regularAnnouncements.map((a) => renderAnnouncementCard(a, false))}
          </div>
        )}
      </div>

      {/* ============ CREATE / EDIT DIALOG ============ */}
      <Dialog
        open={showCreateDialog || !!editingAnnouncement}
        onOpenChange={(open) => {
          if (!open) {
            setShowCreateDialog(false);
            setEditingAnnouncement(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-[560px] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Megaphone className="h-5 w-5 text-msbm-red" />
              {editingAnnouncement ? "Edit Announcement" : "New Announcement"}
            </DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="ann-title">
                Title <span className="text-red-500">*</span>
              </Label>
              <Input
                id="ann-title"
                placeholder="e.g., Office Closed for Holidays"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className={formErrors.title ? "border-red-500" : ""}
              />
              {formErrors.title && (
                <p className="text-xs text-red-500">{formErrors.title}</p>
              )}
            </div>

            {/* Content */}
            <div className="space-y-2">
              <Label htmlFor="ann-content">
                Content <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="ann-content"
                placeholder="Write your announcement here..."
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                rows={5}
                className={formErrors.content ? "border-red-500" : ""}
              />
              {formErrors.content && (
                <p className="text-xs text-red-500">{formErrors.content}</p>
              )}
            </div>

            {/* Category & Priority */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(val) => setFormData({ ...formData, category: val })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(CATEGORY_CONFIG).map(([key, config]) => (
                      <SelectItem key={key} value={key}>
                        <div className="flex items-center gap-2">
                          <config.icon className="h-3.5 w-3.5" />
                          {config.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Priority</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(val) => setFormData({ ...formData, priority: val })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(PRIORITY_CONFIG).map(([key, config]) => (
                      <SelectItem key={key} value={key}>
                        <div className="flex items-center gap-2">
                          <span className={`inline-block h-2 w-2 rounded-full ${config.dotColor}`} />
                          {config.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Expires At */}
            <div className="space-y-2">
              <Label htmlFor="ann-expires">Expires At (optional)</Label>
              <Input
                id="ann-expires"
                type="date"
                value={formData.expiresAt}
                onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">Leave empty for no expiration</p>
            </div>

            {/* Pin Toggle */}
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div>
                <Label className="text-sm font-medium flex items-center gap-1.5">
                  <Pin className="h-3.5 w-3.5" />
                  Pin to top
                </Label>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Pinned announcements appear at the top of the board
                </p>
              </div>
              <Switch
                checked={formData.isPinned}
                onCheckedChange={(checked) => setFormData({ ...formData, isPinned: checked })}
              />
            </div>

            {/* Published Toggle */}
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div>
                <Label className="text-sm font-medium flex items-center gap-1.5">
                  <Eye className="h-3.5 w-3.5" />
                  Publish immediately
                </Label>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Uncheck to save as a draft
                </p>
              </div>
              <Switch
                checked={formData.isPublished}
                onCheckedChange={(checked) => setFormData({ ...formData, isPublished: checked })}
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => {
                setShowCreateDialog(false);
                setEditingAnnouncement(null);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={() => handleSubmit(!!editingAnnouncement)}
              disabled={submitting}
              className="bg-msbm-red hover:bg-msbm-red/80 text-white"
            >
              {submitting ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  Saving...
                </div>
              ) : editingAnnouncement ? (
                "Update Announcement"
              ) : (
                "Create Announcement"
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
              Delete Announcement
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground py-2">
            Are you sure you want to delete{" "}
            <strong className="text-gray-900 dark:text-white">
              &ldquo;{showDeleteConfirm?.title}&rdquo;
            </strong>
            ? This action cannot be undone.
          </p>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setShowDeleteConfirm(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
