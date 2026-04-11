"use client";

import React, { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { formatDistanceToNow, isThisMonth } from "date-fns";
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
  Megaphone,
  Pin,
  AlertTriangle,
  Calendar,
  PartyPopper,
  BookOpen,
  Plus,
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
    color: "text-emerald-700 dark:text-emerald-400",
    bgColor: "bg-emerald-100 dark:bg-emerald-900/30",
    darkBgColor: "bg-emerald-900/30",
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

const PRIORITY_CONFIG: Record<string, { label: string; color: string; dotColor: string }> = {
  low: { label: "Low", color: "text-gray-500 dark:text-gray-400", dotColor: "bg-gray-400" },
  normal: { label: "Normal", color: "text-emerald-600 dark:text-emerald-400", dotColor: "bg-emerald-500" },
  high: { label: "High", color: "text-amber-600 dark:text-amber-400", dotColor: "bg-amber-500" },
  urgent: { label: "Urgent", color: "text-red-600 dark:text-red-400", dotColor: "bg-red-500" },
};

const CATEGORY_TABS = [
  { value: "all", label: "All" },
  { value: "general", label: "General" },
  { value: "event", label: "Events" },
  { value: "policy", label: "Policy" },
  { value: "urgent", label: "Urgent" },
  { value: "celebration", label: "Celebrations" },
];

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

  const currentUser = employees.find((e) => e.id === currentUserId);
  const isAdmin = currentUser?.role === "admin" || currentUser?.role === "hr";

  // ============ DATA FETCHING ============

  const fetchAnnouncements = useCallback(async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (activeTab !== "all") {
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
        className={`group card-hover-lift transition-all duration-200 ${
          isPinned
            ? "border-2 border-emerald-300 dark:border-emerald-700 bg-gradient-to-r from-emerald-50/50 to-teal-50/50 dark:from-emerald-950/20 dark:to-teal-950/20"
            : "hover:border-emerald-200 dark:hover:border-emerald-800"
        }`}
      >
        <CardContent className="p-4 sm:p-5">
          {/* Header */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3 min-w-0 flex-1">
              {/* Pin indicator */}
              {isPinned && (
                <div className="shrink-0 mt-0.5">
                  <Pin className="h-5 w-5 text-emerald-600 dark:text-emerald-400 fill-emerald-600 dark:fill-emerald-400" />
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
                      className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 font-medium mt-1.5 transition-colors cursor-pointer"
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
                    <div className="h-5 w-5 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center">
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
              </div>
            </div>

            {/* Actions */}
            {isAdmin && (
              <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-emerald-600"
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
            className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
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
            <Pin className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
              Pinned Announcements
            </h2>
            <Badge variant="outline" className="text-[10px] bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800">
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

        {/* Announcements Feed */}
        {isLoading ? (
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
              <Megaphone className="h-5 w-5 text-emerald-600" />
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
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
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
