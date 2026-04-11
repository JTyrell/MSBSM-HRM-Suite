"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  Star,
  Plus,
  TrendingUp,
  Award,
  AlertTriangle,
  Clock,
  CheckCircle2,
  MessageSquare,
  Target,
  ArrowUpRight,
  ChevronDown,
  ChevronRight,
  Eye,
  Edit3,
  PlayCircle,
  Users,
  Calendar,
  BarChart3,
  PieChart as PieChartIcon,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useAppStore } from "@/store/app";

// ============ TYPES ============

interface ReviewWithNames {
  id: string;
  employeeId: string;
  reviewerId: string;
  cycleName: string;
  status: string;
  rating: number | null;
  strengths: string | null;
  improvements: string | null;
  goals: string | null;
  overallComment: string | null;
  reviewedAt: string | null;
  createdAt: string;
  updatedAt: string;
  employee: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    departmentId: string;
    department: { name: string; code: string } | null;
  };
  reviewer: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
  };
}

interface ReviewCycle {
  name: string;
  period: string;
  totalEmployees: number;
  completedCount: number;
  inProgressCount: number;
  pendingCount: number;
  startDate: string;
  endDate: string;
  status: string;
}

// ============ HELPERS ============

function getInitials(firstName: string, lastName: string) {
  return `${firstName[0]}${lastName[0]}`.toUpperCase();
}

function StarRating({
  rating,
  interactive = false,
  onRate,
  size = "md",
}: {
  rating: number | null;
  interactive?: boolean;
  onRate?: (r: number) => void;
  size?: "sm" | "md" | "lg";
}) {
  const [hovered, setHovered] = useState(0);
  const sizeClass = size === "sm" ? "w-3.5 h-3.5" : size === "lg" ? "w-6 h-6" : "w-4.5 h-4.5";

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = star <= (hovered || rating || 0);
        return (
          <button
            key={star}
            type="button"
            disabled={!interactive}
            onClick={() => interactive && onRate?.(star)}
            onMouseEnter={() => interactive && setHovered(star)}
            onMouseLeave={() => interactive && setHovered(0)}
            className={`transition-all duration-150 ${interactive ? "cursor-pointer hover:scale-125" : "cursor-default"}`}
          >
            <Star
              className={`${sizeClass} ${filled ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"}`}
            />
          </button>
        );
      })}
      {rating !== null && rating > 0 && (
        <span className="text-sm font-semibold text-muted-foreground ml-1">{rating.toFixed(1)}</span>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; className: string }> = {
    completed: {
      label: "Completed",
      className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    },
    in_progress: {
      label: "In Progress",
      className: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    },
    pending: {
      label: "Pending",
      className: "bg-slate-100 text-slate-600 dark:bg-slate-800/50 dark:text-slate-400",
    },
  };
  const c = config[status] || config.pending;
  return (
    <Badge variant="secondary" className={`${c.className} text-xs font-medium`}>
      {status === "in_progress" ? <Clock className="w-3 h-3 mr-1" /> : null}
      {status === "completed" ? <CheckCircle2 className="w-3 h-3 mr-1" /> : null}
      {status === "pending" ? <AlertTriangle className="w-3 h-3 mr-1" /> : null}
      {c.label}
    </Badge>
  );
}

function getAvatarColor(index: number) {
  const colors = [
    "bg-emerald-500",
    "bg-teal-500",
    "bg-cyan-500",
    "bg-amber-500",
    "bg-rose-500",
    "bg-violet-500",
  ];
  return colors[index % colors.length];
}

// ============ MAIN COMPONENT ============

export function PerformanceReviewsView() {
  const { employees, currentUserId } = useAppStore();
  const [reviews, setReviews] = useState<ReviewWithNames[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  // Filters
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  // Dialogs
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState<ReviewWithNames | null>(null);
  const [editMode, setEditMode] = useState(false);

  // Create form
  const [formData, setFormData] = useState({
    employeeId: "",
    cycleName: "",
    rating: 0,
    strengths: "",
    improvements: "",
    goals: "",
    overallComment: "",
    status: "pending",
  });

  const fetchReviews = useCallback(async () => {
    try {
      const res = await fetch("/api/performance-reviews");
      const data = await res.json();
      setReviews(data.reviews || []);
    } catch (err) {
      console.error("Error fetching reviews:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  // Stats
  const totalReviews = reviews.length;
  const completedReviews = reviews.filter((r) => r.status === "completed");
  const pendingReviews = reviews.filter((r) => r.status === "pending" || r.status === "in_progress");
  const avgRating =
    reviews.filter((r) => r.rating !== null).length > 0
      ? reviews
          .filter((r) => r.rating !== null)
          .reduce((sum, r) => sum + (r.rating || 0), 0) /
        reviews.filter((r) => r.rating !== null).length
      : 0;

  const completedPercent = totalReviews > 0 ? Math.round((completedReviews.length / totalReviews) * 100) : 0;

  // Filter & sort
  const filteredReviews = reviews
    .filter((r) => statusFilter === "all" || r.status === statusFilter)
    .sort((a, b) => {
      if (sortBy === "newest") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sortBy === "oldest") return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      if (sortBy === "rating_high") return (b.rating || 0) - (a.rating || 0);
      if (sortBy === "rating_low") return (a.rating || 0) - (b.rating || 0);
      return 0;
    });

  // My reviews (reviews where current user is reviewer)
  const myReviews = reviews.filter((r) => r.reviewerId === currentUserId);

  // Department avg ratings
  const deptRatings: Record<string, { name: string; total: number; count: number }> = {};
  for (const r of reviews) {
    if (r.rating && r.employee?.department?.name) {
      const dept = r.employee.department.name;
      if (!deptRatings[dept]) deptRatings[dept] = { name: dept, total: 0, count: 0 };
      deptRatings[dept].total += r.rating;
      deptRatings[dept].count += 1;
    }
  }
  const deptChartData = Object.values(deptRatings).map((d) => ({
    name: d.name,
    avg: Math.round((d.total / d.count) * 10) / 10,
    count: d.count,
  }));

  // Rating distribution
  const ratingDist = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating && Math.round(r.rating) === star).length,
  }));

  // Review cycles (mock)
  const reviewCycles: ReviewCycle[] = [
    {
      name: "Q1 2026 Review",
      period: "Jan - Mar 2026",
      totalEmployees: 10,
      completedCount: 0,
      inProgressCount: 3,
      pendingCount: 2,
      startDate: "2026-01-15",
      endDate: "2026-03-31",
      status: "active",
    },
    {
      name: "Q4 2025 Review",
      period: "Oct - Dec 2025",
      totalEmployees: 8,
      completedCount: 5,
      inProgressCount: 0,
      pendingCount: 0,
      startDate: "2025-10-01",
      endDate: "2025-12-31",
      status: "completed",
    },
    {
      name: "Annual 2025 Review",
      period: "Jan - Dec 2025",
      totalEmployees: 15,
      completedCount: 12,
      inProgressCount: 0,
      pendingCount: 0,
      startDate: "2025-01-01",
      endDate: "2025-12-31",
      status: "completed",
    },
  ];

  // Create review handler
  const handleCreateReview = async () => {
    if (!formData.employeeId || !formData.cycleName) return;
    try {
      const res = await fetch("/api/performance-reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          reviewerId: currentUserId,
          rating: formData.rating > 0 ? formData.rating : null,
          strengths: formData.strengths || null,
          improvements: formData.improvements || null,
          goals: formData.goals || null,
          overallComment: formData.overallComment || null,
        }),
      });
      if (res.ok) {
        setCreateDialogOpen(false);
        setFormData({
          employeeId: "",
          cycleName: "",
          rating: 0,
          strengths: "",
          improvements: "",
          goals: "",
          overallComment: "",
          status: "pending",
        });
        fetchReviews();
      }
    } catch (err) {
      console.error("Error creating review:", err);
    }
  };

  // Update review handler
  const handleUpdateReview = async (reviewId: string, updates: Partial<ReviewWithNames>) => {
    try {
      const res = await fetch("/api/performance-reviews", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: reviewId, ...updates }),
      });
      if (res.ok) {
        setDetailDialogOpen(false);
        setEditMode(false);
        setSelectedReview(null);
        fetchReviews();
      }
    } catch (err) {
      console.error("Error updating review:", err);
    }
  };

  const handleStartReview = (review: ReviewWithNames) => {
    handleUpdateReview(review.id, { status: "in_progress" });
  };

  const handleCompleteReview = (review: ReviewWithNames) => {
    handleUpdateReview(review.id, { status: "completed" });
  };

  // Open detail dialog
  const openDetail = (review: ReviewWithNames) => {
    setSelectedReview(review);
    setEditMode(false);
    setDetailDialogOpen(true);
  };

  // Max rating bar
  const maxDistCount = Math.max(...ratingDist.map((d) => d.count), 1);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
          <p className="text-sm text-muted-foreground">Loading reviews...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Performance Reviews</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage employee evaluations, track review cycles, and monitor performance ratings.
          </p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)} className="btn-gradient gap-2 self-start">
          <Plus className="w-4 h-4" />
          Create Review
        </Button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 stagger-grid">
        <Card className="card-glow animate-fade-in-up card-stat">
          <CardContent className="p-4 pt-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="stat-label">Total Reviews</p>
                <p className="stat-value text-2xl">{totalReviews}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">Across all review cycles</p>
          </CardContent>
        </Card>

        <Card className="card-glow animate-fade-in-up card-stat">
          <CardContent className="p-4 pt-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="stat-label">Average Rating</p>
                <p className="stat-value text-2xl">{avgRating > 0 ? avgRating.toFixed(1) : "—"}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                <Star className="w-5 h-5 text-amber-600 dark:text-amber-400 fill-amber-400" />
              </div>
            </div>
            {avgRating > 0 && (
              <div className="flex items-center gap-1 mt-2">
                <StarRating rating={Math.round(avgRating)} size="sm" />
                <span className="text-xs text-muted-foreground ml-1">out of 5.0</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="card-glow animate-fade-in-up card-stat">
          <CardContent className="p-4 pt-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="stat-label">Completed</p>
                <p className="stat-value text-2xl">{completedReviews.length}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-teal-600 dark:text-teal-400" />
              </div>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <Progress value={completedPercent} className="h-1.5 flex-1" />
              <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">{completedPercent}%</span>
            </div>
          </CardContent>
        </Card>

        <Card className="card-glow animate-fade-in-up card-stat">
          <CardContent className="p-4 pt-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="stat-label">Pending Reviews</p>
                <p className="stat-value text-2xl">{pendingReviews.length}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {reviews.filter((r) => r.status === "in_progress").length} in progress
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="gap-1.5 text-xs sm:text-sm">
            <TrendingUp className="w-3.5 h-3.5 hidden sm:inline" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="reviews" className="gap-1.5 text-xs sm:text-sm">
            <Award className="w-3.5 h-3.5 hidden sm:inline" />
            Reviews
          </TabsTrigger>
          <TabsTrigger value="my-reviews" className="gap-1.5 text-xs sm:text-sm">
            <Users className="w-3.5 h-3.5 hidden sm:inline" />
            My Reviews
          </TabsTrigger>
          <TabsTrigger value="cycles" className="gap-1.5 text-xs sm:text-sm">
            <Calendar className="w-3.5 h-3.5 hidden sm:inline" />
            Cycles
          </TabsTrigger>
        </TabsList>

        {/* ========== OVERVIEW TAB ========== */}
        <TabsContent value="overview" className="space-y-6 mt-4">
          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Avg Rating by Department (Bar Chart) */}
            <Card className="lg:col-span-2 animate-fade-in-up">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-emerald-500" />
                  Average Rating by Department
                </CardTitle>
                <CardDescription>Performance scores grouped by department</CardDescription>
              </CardHeader>
              <CardContent>
                {deptChartData.length > 0 ? (
                  <div className="space-y-3">
                    {deptChartData.map((d) => (
                      <div key={d.name} className="flex items-center gap-3">
                        <span className="text-xs font-medium text-muted-foreground w-28 truncate">
                          {d.name}
                        </span>
                        <div className="flex-1 h-8 bg-muted/50 rounded-lg overflow-hidden">
                          <div
                            className="h-full rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-end pr-2 transition-all duration-500"
                            style={{ width: `${(d.avg / 5) * 100}%` }}
                          >
                            <span className="text-xs font-bold text-white">{d.avg}</span>
                          </div>
                        </div>
                        <span className="text-xs text-muted-foreground w-16 text-right">
                          {d.count} review{d.count !== 1 ? "s" : ""}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-40 text-muted-foreground text-sm">
                    No completed reviews with ratings yet
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Rating Distribution (Pie-like) */}
            <Card className="animate-fade-in-up stagger-1">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <PieChartIcon className="w-4 h-4 text-amber-500" />
                  Rating Distribution
                </CardTitle>
                <CardDescription>Breakdown of review scores</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {ratingDist.map((d) => (
                    <div key={d.star} className="flex items-center gap-2">
                      <div className="flex items-center gap-1 w-14">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        <span className="text-xs font-medium">{d.star}.0</span>
                      </div>
                      <div className="flex-1 h-5 bg-muted/50 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-amber-400 to-amber-500 transition-all duration-500"
                          style={{ width: `${(d.count / maxDistCount) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium text-muted-foreground w-6 text-right">
                        {d.count}
                      </span>
                    </div>
                  ))}
                </div>
                {ratingDist.every((d) => d.count === 0) && (
                  <p className="text-xs text-muted-foreground text-center mt-2">No ratings recorded yet</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Recent Reviews */}
          <Card className="animate-fade-in-up">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="w-4 h-4 text-teal-500" />
                Recent Reviews
              </CardTitle>
              <CardDescription>Latest performance evaluations</CardDescription>
            </CardHeader>
            <CardContent>
              {reviews.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No reviews yet</p>
              ) : (
                <div className="space-y-2">
                  {reviews.slice(0, 6).map((review, i) => (
                    <button
                      key={review.id}
                      onClick={() => openDetail(review)}
                      className="w-full flex items-center gap-3 p-3 rounded-lg border border-border/50 hover:border-emerald-200 dark:hover:border-emerald-800 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20 transition-all duration-200 text-left"
                    >
                      <Avatar className="h-9 w-9">
                        <AvatarFallback className={`text-xs font-semibold text-white ${getAvatarColor(i)}`}>
                          {getInitials(review.employee.firstName, review.employee.lastName)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium truncate">
                            {review.employee.firstName} {review.employee.lastName}
                          </p>
                          <StatusBadge status={review.status} />
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-muted-foreground">{review.cycleName}</span>
                          <span className="text-xs text-muted-foreground">•</span>
                          <span className="text-xs text-muted-foreground">
                            {review.employee.department?.name || "No dept"}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        {review.rating && <StarRating rating={review.rating} size="sm" />}
                        <span className="text-[10px] text-muted-foreground">
                          {formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ========== REVIEWS TAB ========== */}
        <TabsContent value="reviews" className="space-y-4 mt-4">
          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-44">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full sm:w-44">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="rating_high">Highest Rating</SelectItem>
                <SelectItem value="rating_low">Lowest Rating</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex-1" />
            <p className="text-xs text-muted-foreground self-center">
              Showing {filteredReviews.length} of {reviews.length}
            </p>
          </div>

          {/* Review Cards */}
          {filteredReviews.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mb-3">
                  <Award className="w-7 h-7 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium text-muted-foreground">No reviews found</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Try changing filters or create a new review
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredReviews.map((review, i) => (
                <Card
                  key={review.id}
                  className="card-glow animate-fade-in-up cursor-pointer hover:border-emerald-200 dark:hover:border-emerald-800 transition-all duration-200"
                  onClick={() => openDetail(review)}
                >
                  <CardContent className="p-4">
                    {/* Header */}
                    <div className="flex items-start gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className={`text-sm font-semibold text-white ${getAvatarColor(i)}`}>
                          {getInitials(review.employee.firstName, review.employee.lastName)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-semibold truncate">
                            {review.employee.firstName} {review.employee.lastName}
                          </p>
                          <StatusBadge status={review.status} />
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Reviewed by {review.reviewer.firstName} {review.reviewer.lastName}
                        </p>
                        <p className="text-xs text-muted-foreground">{review.cycleName}</p>
                      </div>
                    </div>

                    {/* Rating */}
                    {review.rating && (
                      <div className="mt-3 flex items-center gap-2">
                        <StarRating rating={review.rating} />
                      </div>
                    )}

                    {/* Details (truncated) */}
                    <div className="mt-3 space-y-2">
                      {review.strengths && (
                        <TruncatableText
                          label="Strengths"
                          icon={<TrendingUp className="w-3 h-3 text-emerald-500" />}
                          text={review.strengths}
                        />
                      )}
                      {review.improvements && (
                        <TruncatableText
                          label="Improvements"
                          icon={<Target className="w-3 h-3 text-amber-500" />}
                          text={review.improvements}
                        />
                      )}
                      {review.goals && (
                        <TruncatableText
                          label="Goals"
                          icon={<ArrowUpRight className="w-3 h-3 text-teal-500" />}
                          text={review.goals}
                        />
                      )}
                    </div>

                    {/* Footer */}
                    <Separator className="my-3" />
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-muted-foreground">
                          {review.employee.department?.name || "No dept"}
                        </span>
                      </div>
                      <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* ========== MY REVIEWS TAB ========== */}
        <TabsContent value="my-reviews" className="space-y-4 mt-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                Reviews assigned to you as a reviewer
              </p>
            </div>
            <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
              {myReviews.length} assigned
            </Badge>
          </div>

          {myReviews.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mb-3">
                  <MessageSquare className="w-7 h-7 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium text-muted-foreground">No reviews assigned to you</p>
                <p className="text-xs text-muted-foreground mt-1">
                  You&apos;ll see reviews where you&apos;re the reviewer here
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {myReviews.map((review, i) => (
                <Card
                  key={review.id}
                  className="card-glow animate-fade-in-up hover:border-emerald-200 dark:hover:border-emerald-800 transition-all duration-200"
                >
                  <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className={`text-sm font-semibold text-white ${getAvatarColor(i)}`}>
                          {getInitials(review.employee.firstName, review.employee.lastName)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold">
                          {review.employee.firstName} {review.employee.lastName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {review.cycleName} • {review.employee.department?.name || "No dept"}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <StatusBadge status={review.status} />
                        {review.rating && <StarRating rating={review.rating} size="sm" />}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border/50">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs gap-1"
                        onClick={() => openDetail(review)}
                      >
                        <Eye className="w-3 h-3" />
                        View
                      </Button>
                      {review.status === "pending" && (
                        <Button
                          size="sm"
                          className="text-xs gap-1 btn-gradient"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStartReview(review);
                          }}
                        >
                          <PlayCircle className="w-3 h-3" />
                          Start Review
                        </Button>
                      )}
                      {review.status === "in_progress" && (
                        <Button
                          size="sm"
                          className="text-xs gap-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCompleteReview(review);
                          }}
                        >
                          <CheckCircle2 className="w-3 h-3" />
                          Complete Review
                        </Button>
                      )}
                      {review.status === "in_progress" && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs gap-1"
                          onClick={(e) => {
                            e.stopPropagation();
                            openDetail(review);
                            setEditMode(true);
                          }}
                        >
                          <Edit3 className="w-3 h-3" />
                          Edit
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* ========== CYCLES TAB ========== */}
        <TabsContent value="cycles" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 stagger-grid">
            {reviewCycles.map((cycle) => {
              const pct = cycle.totalEmployees > 0
                ? Math.round(((cycle.completedCount + cycle.inProgressCount) / cycle.totalEmployees) * 100)
                : 0;
              return (
                <Card key={cycle.name} className="card-glow animate-fade-in-up">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-semibold">{cycle.name}</h3>
                      <Badge
                        variant="secondary"
                        className={
                          cycle.status === "active"
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                            : "bg-slate-100 text-slate-600 dark:bg-slate-800/50 dark:text-slate-400"
                        }
                      >
                        {cycle.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mb-3">{cycle.period}</p>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Completion</span>
                        <span className="font-semibold">{pct}%</span>
                      </div>
                      <Progress value={pct} className="h-2" />

                      <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-border/50">
                        <div className="text-center">
                          <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                            {cycle.completedCount}
                          </p>
                          <p className="text-[10px] text-muted-foreground">Done</p>
                        </div>
                        <div className="text-center">
                          <p className="text-lg font-bold text-amber-600 dark:text-amber-400">
                            {cycle.inProgressCount}
                          </p>
                          <p className="text-[10px] text-muted-foreground">Active</p>
                        </div>
                        <div className="text-center">
                          <p className="text-lg font-bold text-slate-500 dark:text-slate-400">
                            {cycle.pendingCount}
                          </p>
                          <p className="text-[10px] text-muted-foreground">Pending</p>
                        </div>
                      </div>
                    </div>

                    {/* Timeline */}
                    <div className="mt-3 pt-3 border-t border-border/50">
                      <p className="text-[10px] text-muted-foreground mb-2">Timeline</p>
                      <div className="flex items-center gap-1">
                        <div className="flex-1 h-1 rounded-full bg-emerald-500" />
                        {cycle.status === "active" && (
                          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        )}
                        <div
                          className={`flex-1 h-1 rounded-full ${
                            cycle.status === "completed" ? "bg-emerald-500" : "bg-muted"
                          }`}
                        />
                        {cycle.status === "completed" && (
                          <div className="w-2 h-2 rounded-full bg-emerald-500" />
                        )}
                      </div>
                      <div className="flex justify-between mt-1">
                        <span className="text-[10px] text-muted-foreground">{cycle.startDate}</span>
                        <span className="text-[10px] text-muted-foreground">{cycle.endDate}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>

      {/* ========== CREATE REVIEW DIALOG ========== */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5 text-emerald-500" />
              Create Performance Review
            </DialogTitle>
            <DialogDescription>
              Start a new performance review for an employee. You can fill in details now or complete
              them later.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Employee *</Label>
              <Select
                value={formData.employeeId}
                onValueChange={(v) => setFormData((f) => ({ ...f, employeeId: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select an employee" />
                </SelectTrigger>
                <SelectContent>
                  {employees
                    .filter((e) => e.id !== currentUserId)
                    .map((emp) => (
                      <SelectItem key={emp.id} value={emp.id}>
                        {emp.firstName} {emp.lastName} ({emp.role})
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Review Cycle Name *</Label>
              <Input
                placeholder="e.g., Q1 2026 Review"
                value={formData.cycleName}
                onChange={(e) => setFormData((f) => ({ ...f, cycleName: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label>Rating</Label>
              <div className="flex items-center gap-2 p-3 rounded-lg border border-border/50 bg-muted/30">
                <StarRating rating={formData.rating} interactive onRate={(r) => setFormData((f) => ({ ...f, rating: r }))} size="lg" />
                <span className="text-sm text-muted-foreground">
                  {formData.rating > 0 ? `${formData.rating}.0 out of 5.0` : "Not rated"}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                Strengths
              </Label>
              <Textarea
                placeholder="Key strengths and accomplishments..."
                rows={3}
                value={formData.strengths}
                onChange={(e) => setFormData((f) => ({ ...f, strengths: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-amber-500" />
                Areas for Improvement
              </Label>
              <Textarea
                placeholder="Areas where the employee can improve..."
                rows={3}
                value={formData.improvements}
                onChange={(e) => setFormData((f) => ({ ...f, improvements: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-1.5">
                <ArrowUpRight className="w-3.5 h-3.5 text-teal-500" />
                Goals
              </Label>
              <Textarea
                placeholder="Goals for the next review period..."
                rows={3}
                value={formData.goals}
                onChange={(e) => setFormData((f) => ({ ...f, goals: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-slate-500" />
                Overall Comment
              </Label>
              <Textarea
                placeholder="General comments about this review..."
                rows={3}
                value={formData.overallComment}
                onChange={(e) => setFormData((f) => ({ ...f, overallComment: e.target.value }))}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              className="btn-gradient"
              onClick={handleCreateReview}
              disabled={!formData.employeeId || !formData.cycleName}
            >
              Create Review
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ========== REVIEW DETAIL DIALOG ========== */}
      <Dialog open={detailDialogOpen} onOpenChange={(open) => {
        setDetailDialogOpen(open);
        if (!open) { setEditMode(false); setSelectedReview(null); }
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedReview && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-emerald-500" />
                  Performance Review Detail
                </DialogTitle>
                <DialogDescription>
                  {selectedReview.cycleName}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                {/* Employee & Reviewer Info */}
                <div className="flex flex-col sm:flex-row gap-4 p-4 rounded-lg bg-muted/30 border border-border/50">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="text-sm font-semibold text-white bg-emerald-500">
                        {getInitials(selectedReview.employee.firstName, selectedReview.employee.lastName)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-semibold">
                        {selectedReview.employee.firstName} {selectedReview.employee.lastName}
                      </p>
                      <p className="text-xs text-muted-foreground">Employee</p>
                      <p className="text-xs text-muted-foreground">
                        {selectedReview.employee.department?.name || "No department"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 sm:ml-auto">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="text-sm font-semibold text-white bg-teal-500">
                        {getInitials(selectedReview.reviewer.firstName, selectedReview.reviewer.lastName)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-semibold">
                        {selectedReview.reviewer.firstName} {selectedReview.reviewer.lastName}
                      </p>
                      <p className="text-xs text-muted-foreground">Reviewer</p>
                    </div>
                  </div>
                </div>

                {/* Status & Rating */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground mb-1">Status</p>
                    <StatusBadge status={selectedReview.status} />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground mb-1">Rating</p>
                    <StarRating rating={selectedReview.rating} size="lg" />
                  </div>
                </div>

                {/* Strengths */}
                <DetailSection
                  key={`strengths-${editMode}`}
                  label="Strengths"
                  icon={<TrendingUp className="w-4 h-4 text-emerald-500" />}
                  text={selectedReview.strengths}
                  editMode={editMode}
                  field="strengths"
                  selectedReview={selectedReview}
                  onUpdate={handleUpdateReview}
                />

                {/* Improvements */}
                <DetailSection
                  key={`improvements-${editMode}`}
                  label="Areas for Improvement"
                  icon={<Target className="w-4 h-4 text-amber-500" />}
                  text={selectedReview.improvements}
                  editMode={editMode}
                  field="improvements"
                  selectedReview={selectedReview}
                  onUpdate={handleUpdateReview}
                />

                {/* Goals */}
                <DetailSection
                  key={`goals-${editMode}`}
                  label="Goals"
                  icon={<ArrowUpRight className="w-4 h-4 text-teal-500" />}
                  text={selectedReview.goals}
                  editMode={editMode}
                  field="goals"
                  selectedReview={selectedReview}
                  onUpdate={handleUpdateReview}
                />

                {/* Overall Comment */}
                <DetailSection
                  key={`overallComment-${editMode}`}
                  label="Overall Comment"
                  icon={<MessageSquare className="w-4 h-4 text-slate-500" />}
                  text={selectedReview.overallComment}
                  editMode={editMode}
                  field="overallComment"
                  selectedReview={selectedReview}
                  onUpdate={handleUpdateReview}
                />

                {/* Meta Info */}
                <div className="flex flex-wrap gap-4 text-xs text-muted-foreground pt-2 border-t border-border/50">
                  <span>Created: {new Date(selectedReview.createdAt).toLocaleDateString()}</span>
                  {selectedReview.reviewedAt && (
                    <span>Reviewed: {new Date(selectedReview.reviewedAt).toLocaleDateString()}</span>
                  )}
                  <span>Updated: {new Date(selectedReview.updatedAt).toLocaleDateString()}</span>
                </div>
              </div>

              <DialogFooter className="gap-2">
                {selectedReview.status === "in_progress" && !editMode && (
                  <Button
                    variant="outline"
                    className="gap-1"
                    onClick={() => setEditMode(true)}
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    Edit
                  </Button>
                )}
                {editMode && (
                  <Button
                    variant="outline"
                    onClick={() => setEditMode(false)}
                  >
                    Cancel Edit
                  </Button>
                )}
                {selectedReview.status === "in_progress" && (
                  <Button
                    className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1"
                    onClick={() => handleCompleteReview(selectedReview)}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Complete Review
                  </Button>
                )}
                <Button variant="outline" onClick={() => { setDetailDialogOpen(false); setEditMode(false); }}>
                  Close
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ============ SUB-COMPONENTS ============

function TruncatableText({
  label,
  icon,
  text,
}: {
  label: string;
  icon: React.ReactNode;
  text: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const truncated = text.length > 120;

  return (
    <div>
      <div className="flex items-center gap-1.5 mb-0.5">
        {icon}
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
      </div>
      <p className="text-xs leading-relaxed text-foreground/80">
        {expanded || !truncated ? text : `${text.slice(0, 120)}...`}
      </p>
      {truncated && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setExpanded(!expanded);
          }}
          className="text-[10px] text-emerald-600 dark:text-emerald-400 hover:underline mt-0.5 flex items-center gap-0.5"
        >
          {expanded ? (
            <>
              <ChevronDown className="w-3 h-3" /> Show less
            </>
          ) : (
            <>
              <ChevronRight className="w-3 h-3" /> Read more
            </>
          )}
        </button>
      )}
    </div>
  );
}

function DetailSection({
  label,
  icon,
  text,
  editMode,
  field,
  selectedReview,
  onUpdate,
}: {
  label: string;
  icon: React.ReactNode;
  text: string | null;
  editMode: boolean;
  field: string;
  selectedReview: ReviewWithNames;
  onUpdate: (id: string, updates: Partial<ReviewWithNames>) => void;
}) {
  const [editValue, setEditValue] = useState(text || "");

  if (editMode) {
    return (
      <div className="space-y-1.5">
        <Label className="flex items-center gap-1.5 text-sm">
          {icon}
          {label}
        </Label>
        <Textarea
          rows={3}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
        />
        <Button
          size="sm"
          className="text-xs"
          onClick={() => {
            onUpdate(selectedReview.id, { [field]: editValue || null });
          }}
        >
          Save
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1.5">
        {icon}
        <span className="text-sm font-medium">{label}</span>
      </div>
      {text ? (
        <p className="text-sm leading-relaxed text-muted-foreground bg-muted/30 rounded-lg p-3 border border-border/50">
          {text}
        </p>
      ) : (
        <p className="text-sm text-muted-foreground italic">Not provided</p>
      )}
    </div>
  );
}
