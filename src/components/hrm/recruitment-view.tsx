"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Briefcase,
  Plus,
  Users,
  Clock,
  GitBranch,
  MapPin,
  DollarSign,
  MoreVertical,
  Pencil,
  Trash2,
  Search,
  Filter,
  TrendingUp,
  Eye,
  ChevronDown,
  ChevronRight,
  GripVertical,
  Star,
  Mail,
  Phone,
  Building2,
  GraduationCap,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

// ==================== TYPES ====================

interface JobListing {
  id: string;
  title: string;
  department: string;
  location: string;
  type: string;
  status: string;
  description: string;
  requirements: string;
  salaryMin: number | null;
  salaryMax: number | null;
  applicantCount: number;
  companyId: string;
  createdAt: string;
  updatedAt: string;
}

interface PipelineCandidate {
  id: string;
  name: string;
  role: string;
  avatar: string;
  appliedDate: string;
  rating: number;
  stage: "applied" | "screening" | "interview" | "offer";
}

// ==================== CONSTANTS ====================

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  draft: { label: "Draft", color: "text-slate-600 dark:text-slate-400", bg: "bg-slate-100 dark:bg-slate-800" },
  open: { label: "Open", color: "text-msbm-red dark:text-msbm-red-bright", bg: "bg-msbm-red/10 dark:bg-msbm-red/20" },
  closed: { label: "Closed", color: "text-red-600 dark:text-red-400", bg: "bg-red-100 dark:bg-red-900/30" },
  filled: { label: "Filled", color: "text-inner-blue dark:text-light-blue", bg: "bg-inner-blue/10 dark:bg-inner-blue/20" },
  archived: { label: "Archived", color: "text-zinc-500 dark:text-zinc-400", bg: "bg-zinc-100 dark:bg-zinc-800" },
};

const TYPE_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  "full-time": { label: "Full-Time", color: "text-inner-blue dark:text-light-blue", bg: "bg-inner-blue/10 dark:bg-inner-blue/20" },
  "part-time": { label: "Part-Time", color: "text-amber-700 dark:text-amber-400", bg: "bg-amber-100 dark:bg-amber-900/30" },
  contract: { label: "Contract", color: "text-orange-700 dark:text-orange-400", bg: "bg-orange-100 dark:bg-orange-900/30" },
  remote: { label: "Remote", color: "text-cyan-700 dark:text-cyan-400", bg: "bg-cyan-100 dark:bg-cyan-900/30" },
};



const PIPELINE_STAGES = [
  { id: "applied", label: "Applied", color: "from-slate-400 to-slate-500", dotColor: "bg-slate-400" },
  { id: "screening", label: "Screening", color: "from-amber-400 to-amber-500", dotColor: "bg-amber-400" },
  { id: "interview", label: "Interview", color: "from-teal-400 to-teal-500", dotColor: "bg-teal-400" },
  { id: "offer", label: "Offer", color: "from-msbm-red to-msbm-red-bright", dotColor: "bg-msbm-red" },
] as const;

const AVATAR_COLORS = [
  "bg-msbm-red",
  "bg-teal-500",
  "bg-amber-500",
  "bg-rose-500",
  "bg-cyan-500",
  "bg-orange-500",
  "bg-violet-500",
  "bg-pink-500",
];

const CHART_COLORS = ["#10b981", "#14b8a6", "#f59e0b", "#f97316", "#06b6d4", "#8b5cf6", "#ec4899", "#84cc16"];

// ==================== HELPER COMPONENTS ====================

function StatusBadge({ status }: { status: string }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.draft;
  return (
    <Badge variant="secondary" className={`${config.bg} ${config.color} text-xs font-medium border-0`}>
      {config.label}
    </Badge>
  );
}

function TypeBadge({ type }: { type: string }) {
  const config = TYPE_CONFIG[type] || TYPE_CONFIG["full-time"];
  return (
    <Badge variant="secondary" className={`${config.bg} ${config.color} text-[11px] font-medium border-0`}>
      {config.label}
    </Badge>
  );
}

function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  trendValue,
  delay,
  color,
}: {
  title: string;
  value: string | number;
  icon: React.ElementType;
  trend?: "up" | "down";
  trendValue?: string;
  delay: number;
  color: string;
}) {
  return (
    <Card className={`card-glow hover-scale transition-all duration-300 stagger-${delay} ${color}`}>
      <CardContent className="p-4 lg:p-6">
        <div className="flex items-center justify-between mb-3">
          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color === "emerald" ? "from-emerald-500 to-teal-600" : color === "teal" ? "from-teal-500 to-cyan-600" : color === "amber" ? "from-amber-500 to-orange-500" : "from-rose-500 to-pink-600"} flex items-center justify-center shadow-lg`}>
            <Icon className="w-5 h-5 text-white" />
          </div>
          {trend && (
            <div className={`flex items-center gap-1 text-xs font-medium ${trend === "up" ? "text-msbm-red dark:text-msbm-red-bright" : "text-red-500"}`}>
              {trend === "up" ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
              {trendValue}
            </div>
          )}
        </div>
        <p className="metric-large text-2xl lg:text-3xl font-bold">{value}</p>
        <p className="text-xs text-muted-foreground mt-1 font-medium">{title}</p>
      </CardContent>
    </Card>
  );
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`w-3.5 h-3.5 ${star <= Math.round(rating) ? "text-amber-400 fill-amber-400" : "text-zinc-300 dark:text-zinc-600"}`}
        />
      ))}
    </div>
  );
}

function PipelineCandidateCard({ candidate }: { candidate: PipelineCandidate }) {
  const colorIdx = candidate.name.charCodeAt(0) % AVATAR_COLORS.length;
  return (
    <Card className="mb-2.5 hover-scale transition-all duration-200 cursor-pointer group border-border/60">
      <CardContent className="p-3">
        <div className="flex items-start gap-2.5">
          <GripVertical className="w-4 h-4 text-muted-foreground/40 mt-2 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className={`w-9 h-9 rounded-lg ${AVATAR_COLORS[colorIdx]} flex items-center justify-center text-white text-xs font-bold shrink-0`}>
            {candidate.avatar}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate">{candidate.name}</p>
            <p className="text-xs text-muted-foreground truncate mt-0.5">{candidate.role}</p>
            <div className="flex items-center gap-2 mt-1.5">
              <StarRating rating={candidate.rating} />
              <span className="text-[10px] text-muted-foreground">Applied {new Date(candidate.appliedDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ==================== MAIN COMPONENT ====================

export function RecruitmentView() {
  const [jobs, setJobs] = useState<JobListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("job-board");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [pipelineCandidates, setPipelineCandidates] = useState<PipelineCandidate[]>([]);

  // Dialog states
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<JobListing | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    department: "",
    location: "",
    type: "full-time",
    status: "open",
    description: "",
    requirements: "",
    salaryMin: "",
    salaryMax: "",
  });

  const [saving, setSaving] = useState(false);

  // Fetch jobs
  const fetchJobs = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (departmentFilter !== "all") params.set("department", departmentFilter);
      const res = await fetch(`/api/jobs?${params.toString()}`);
      const data = await res.json();
      setJobs(data.jobs || []);
    } catch (err) {
      console.error("Error fetching jobs:", err);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, departmentFilter]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  // Computed values
  const openPositions = jobs.filter((j) => j.status === "open").length;
  const totalApplicants = jobs.reduce((sum, j) => sum + j.applicantCount, 0);
  const departments = [...new Set(jobs.map((j) => j.department))];

  // Filter jobs by search
  const filteredJobs = jobs.filter((job) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      job.title.toLowerCase().includes(q) ||
      job.department.toLowerCase().includes(q) ||
      job.location.toLowerCase().includes(q)
    );
  });

  // Analytics data
  const applicantByDept = departments.map((dept) => ({
    department: dept.length > 12 ? dept.slice(0, 12) + "..." : dept,
    fullName: dept,
    applicants: jobs.filter((j) => j.department === dept).reduce((sum, j) => sum + j.applicantCount, 0),
  }));


  // Form handlers
  const resetForm = () => {
    setFormData({
      title: "",
      department: "",
      location: "",
      type: "full-time",
      status: "open",
      description: "",
      requirements: "",
      salaryMin: "",
      salaryMax: "",
    });
  };

  const handleCreateJob = async () => {
    if (!formData.title || !formData.department || !formData.location) return;
    setSaving(true);
    try {
      await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          salaryMin: formData.salaryMin ? parseFloat(formData.salaryMin) : null,
          salaryMax: formData.salaryMax ? parseFloat(formData.salaryMax) : null,
          companyId: "seed-company-id",
        }),
      });
      await fetchJobs();
      setCreateDialogOpen(false);
      resetForm();
    } catch (err) {
      console.error("Error creating job:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleEditJob = async () => {
    if (!selectedJob) return;
    setSaving(true);
    try {
      await fetch(`/api/jobs?id=${selectedJob.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          salaryMin: formData.salaryMin ? parseFloat(formData.salaryMin) : null,
          salaryMax: formData.salaryMax ? parseFloat(formData.salaryMax) : null,
        }),
      });
      await fetchJobs();
      setEditDialogOpen(false);
      resetForm();
      setSelectedJob(null);
    } catch (err) {
      console.error("Error updating job:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteJob = async () => {
    if (!selectedJob) return;
    setSaving(true);
    try {
      await fetch(`/api/jobs?id=${selectedJob.id}`, { method: "DELETE" });
      await fetchJobs();
      setDeleteDialogOpen(false);
      setSelectedJob(null);
    } catch (err) {
      console.error("Error deleting job:", err);
    } finally {
      setSaving(false);
    }
  };

  const openEditDialog = (job: JobListing) => {
    setSelectedJob(job);
    setFormData({
      title: job.title,
      department: job.department,
      location: job.location,
      type: job.type,
      status: job.status,
      description: job.description,
      requirements: job.requirements,
      salaryMin: job.salaryMin?.toString() || "",
      salaryMax: job.salaryMax?.toString() || "",
    });
    setEditDialogOpen(true);
  };

  const openDeleteDialog = (job: JobListing) => {
    setSelectedJob(job);
    setDeleteDialogOpen(true);
  };

  const openDetailDialog = (job: JobListing) => {
    setSelectedJob(job);
    setDetailDialogOpen(true);
  };

  const formatSalary = (val: number | null) => {
    if (!val) return "";
    return val >= 1000 ? `$${(val / 1000).toFixed(0)}k` : `$${val}`;
  };

  // ==================== JOB BOARD TAB ====================

  const renderJobBoard = () => (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search jobs by title, department, or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px]">
              <Filter className="w-4 h-4 mr-1.5 text-muted-foreground" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="filled">Filled</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
          <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
            <SelectTrigger className="w-[170px]">
              <Building2 className="w-4 h-4 mr-1.5 text-muted-foreground" />
              <SelectValue placeholder="Department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              {departments.map((dept) => (
                <SelectItem key={dept} value={dept}>{dept}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Results count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing <span className="font-semibold text-foreground">{filteredJobs.length}</span> of{" "}
          <span className="font-semibold text-foreground">{jobs.length}</span> positions
        </p>
      </div>

      {/* Job Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-5">
                <div className="h-5 bg-muted rounded w-3/4 mb-3" />
                <div className="h-4 bg-muted rounded w-1/2 mb-4" />
                <div className="flex gap-2 mb-4">
                  <div className="h-5 bg-muted rounded-full w-16" />
                  <div className="h-5 bg-muted rounded-full w-20" />
                </div>
                <div className="h-4 bg-muted rounded w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredJobs.length === 0 ? (
        <Card className="py-16">
          <CardContent className="flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
              <Briefcase className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-1">No positions found</h3>
            <p className="text-sm text-muted-foreground mb-4">Try adjusting your search or filters</p>
            <Button onClick={() => { setSearchQuery(""); setStatusFilter("all"); setDepartmentFilter("all"); }} variant="outline" size="sm">
              Clear Filters
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredJobs.map((job) => (
            <Card
              key={job.id}
              className="hover-scale transition-all duration-300 group cursor-pointer border-border/60"
              onClick={() => openDetailDialog(job)}
            >
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm truncate group-hover:text-msbm-red dark:group-hover:text-msbm-red-bright transition-colors">
                      {job.title}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5">
                      <Building2 className="w-3 h-3" />
                      {job.department}
                    </p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-36">
                      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); openDetailDialog(job); }}>
                        <Eye className="w-4 h-4 mr-2" />
                        View
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); openEditDialog(job); }}>
                        <Pencil className="w-4 h-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={(e) => { e.stopPropagation(); openDeleteDialog(job); }}
                        className="text-red-600 focus:text-red-600"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-3">
                  <MapPin className="w-3 h-3" />
                  {job.location}
                </div>

                <div className="flex items-center gap-2 flex-wrap mb-3">
                  <TypeBadge type={job.type} />
                  <StatusBadge status={job.status} />
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-border/60">
                  {job.salaryMin && job.salaryMax ? (
                    <div className="flex items-center gap-1.5 text-xs font-medium">
                      <DollarSign className="w-3.5 h-3.5 text-msbm-red dark:text-msbm-red-bright" />
                      <span className="text-msbm-red dark:text-msbm-red-bright">
                        {formatSalary(job.salaryMin)} - {formatSalary(job.salaryMax)}
                      </span>
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground">Salary not specified</span>
                  )}
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Users className="w-3 h-3" />
                    <span className="font-medium">{job.applicantCount}</span> applicants
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  // ==================== PIPELINE TAB ====================

  const renderPipeline = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">{pipelineCandidates.length}</span> candidates across all stages
        </p>
        <div className="flex items-center gap-2">
          {PIPELINE_STAGES.map((stage) => {
            const count = pipelineCandidates.filter((c) => c.stage === stage.id).length;
            return (
              <Badge key={stage.id} variant="secondary" className="text-xs">
                <span className={`w-2 h-2 rounded-full ${stage.dotColor} mr-1.5`} />
                {stage.label}: {count}
              </Badge>
            );
          })}
        </div>
      </div>

      {/* Pipeline columns */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {PIPELINE_STAGES.map((stage) => {
          const stageCandidates = pipelineCandidates.filter((c) => c.stage === stage.id);
          return (
            <div key={stage.id} className="space-y-3">
              {/* Column Header */}
              <div className="flex items-center gap-2 px-1">
                <div className={`w-2.5 h-2.5 rounded-full ${stage.dotColor}`} />
                <h3 className="text-sm font-semibold">{stage.label}</h3>
                <Badge variant="secondary" className="text-[10px] ml-auto px-1.5 py-0">
                  {stageCandidates.length}
                </Badge>
              </div>

              {/* Column Content */}
              <div className="min-h-[200px] max-h-[500px] overflow-y-auto rounded-xl bg-muted/40 p-2 space-y-1 custom-scrollbar">
                {stageCandidates.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center mb-2">
                      <Users className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <p className="text-xs text-muted-foreground">No candidates</p>
                  </div>
                ) : (
                  stageCandidates.map((candidate) => (
                    <PipelineCandidateCard key={candidate.id} candidate={candidate} />
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Pipeline summary */}
      <Card className="mt-6">
        <CardContent className="p-4 lg:p-5">
          <h3 className="text-sm font-semibold mb-3">Pipeline Summary</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {PIPELINE_STAGES.map((stage) => {
              const count = pipelineCandidates.filter((c) => c.stage === stage.id).length;
              const pct = pipelineCandidates.length > 0 ? Math.round((count / pipelineCandidates.length) * 100) : 0;
              return (
                <div key={stage.id} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">{stage.label}</span>
                    <span className="text-xs font-semibold">{pct}%</span>
                  </div>
                  <div className="h-2">
                    <Progress value={pct} className="h-2" />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // ==================== ANALYTICS TAB ====================

  const renderAnalytics = () => (
    <div className="space-y-6">
      {/* Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-msbm-red/10 dark:bg-msbm-red/20 flex items-center justify-center">
                <Briefcase className="w-4 h-4 text-msbm-red dark:text-msbm-red-bright" />
              </div>
            </div>
            <p className="text-2xl font-bold">{jobs.length}</p>
            <p className="text-xs text-muted-foreground">Total Listings</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-inner-blue/10 dark:bg-inner-blue/20 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-inner-blue dark:text-light-blue" />
              </div>
            </div>
            <p className="text-2xl font-bold">{totalApplicants}</p>
            <p className="text-xs text-muted-foreground">Total Applicants</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                <Calendar className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              </div>
            </div>
            <p className="text-2xl font-bold">28</p>
            <p className="text-xs text-muted-foreground">Avg Days to Hire</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center">
                <Target className="w-4 h-4 text-rose-600 dark:text-rose-400" />
              </div>
            </div>
            <p className="text-2xl font-bold">67%</p>
            <p className="text-xs text-muted-foreground">Offer Accept Rate</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Applicants by Department */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Users className="w-4 h-4 text-msbm-red dark:text-msbm-red-bright" />
              Applicants by Department
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={applicantByDept} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis
                    dataKey="department"
                    tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                    axisLine={{ stroke: "hsl(var(--border))" }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                    axisLine={{ stroke: "hsl(var(--border))" }}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                    labelFormatter={(label: string) => {
                      const item = applicantByDept.find((d) => d.department === label);
                      return item?.fullName || label;
                    }}
                    formatter={(value: number) => [`${value} applicants`, "Count"]}
                  />
                  <Bar dataKey="applicants" radius={[6, 6, 0, 0]} maxBarSize={50}>
                    {applicantByDept.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Status Breakdown */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <GitBranch className="w-4 h-4 text-inner-blue dark:text-light-blue" />
              Status Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-4">
              {Object.entries(STATUS_CONFIG).map(([status, config]) => {
                const count = jobs.filter((j) => j.status === status).length;
                const pct = jobs.length > 0 ? Math.round((count / jobs.length) * 100) : 0;
                return (
                  <div key={status} className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`w-2.5 h-2.5 rounded-full ${
                          status === "open" ? "bg-msbm-red" :
                          status === "closed" ? "bg-red-500" :
                          status === "draft" ? "bg-slate-400" :
                          status === "filled" ? "bg-teal-500" :
                          "bg-zinc-400"
                        }`} />
                        <span className="text-sm font-medium">{config.label}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">{count} ({pct}%)</span>
                    </div>
                    <div className="h-2">
                      <Progress value={pct} className="h-2" />
                    </div>
                  </div>
                );
              })}
            </div>

            <Separator className="my-4" />

            {/* Top hiring departments */}
            <div>
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Top Hiring Departments</h4>
              <div className="space-y-2.5">
                {departments
                  .sort((a, b) => {
                    const aCount = jobs.filter((j) => j.department === a && j.status === "open").length;
                    const bCount = jobs.filter((j) => j.department === b && j.status === "open").length;
                    return bCount - aCount;
                  })
                  .slice(0, 4)
                  .map((dept, idx) => {
                    const count = jobs.filter((j) => j.department === dept && j.status === "open").length;
                    const total = jobs.filter((j) => j.department === dept).reduce((s, j) => s + j.applicantCount, 0);
                    return (
                      <div key={dept} className="flex items-center gap-3">
                        <span className="text-xs font-bold text-muted-foreground w-4">#{idx + 1}</span>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{dept}</p>
                          <p className="text-[10px] text-muted-foreground">{count} open &middot; {total} applicants</p>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
                      </div>
                    );
                  })}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Openings Table */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            Most Recent Openings
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-xs text-muted-foreground">
                  <th className="text-left py-2 px-3 font-medium">Position</th>
                  <th className="text-left py-2 px-3 font-medium hidden sm:table-cell">Department</th>
                  <th className="text-left py-2 px-3 font-medium hidden md:table-cell">Location</th>
                  <th className="text-left py-2 px-3 font-medium">Status</th>
                  <th className="text-right py-2 px-3 font-medium">Applicants</th>
                </tr>
              </thead>
              <tbody>
                {jobs.slice(0, 5).map((job) => (
                  <tr key={job.id} className="border-b border-border/50 hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => openDetailDialog(job)}>
                    <td className="py-2.5 px-3 font-medium">{job.title}</td>
                    <td className="py-2.5 px-3 text-muted-foreground hidden sm:table-cell">{job.department}</td>
                    <td className="py-2.5 px-3 text-muted-foreground hidden md:table-cell">{job.location}</td>
                    <td className="py-2.5 px-3"><StatusBadge status={job.status} /></td>
                    <td className="py-2.5 px-3 text-right font-medium">{job.applicantCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // ==================== FORM DIALOG ====================

  const renderFormDialog = (
    open: boolean,
    onOpenChange: (open: boolean) => void,
    title: string,
    description: string,
    onSubmit: () => void,
  ) => (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="title">Job Title *</Label>
            <Input
              id="title"
              placeholder="e.g., Senior Software Engineer"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="department">Department *</Label>
              <Select value={formData.department} onValueChange={(val) => setFormData({ ...formData, department: val })}>
                <SelectTrigger id="department">
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Engineering">Engineering</SelectItem>
                  <SelectItem value="Human Resources">Human Resources</SelectItem>
                  <SelectItem value="Product">Product</SelectItem>
                  <SelectItem value="Analytics">Analytics</SelectItem>
                  <SelectItem value="Design">Design</SelectItem>
                  <SelectItem value="Marketing">Marketing</SelectItem>
                  <SelectItem value="Finance">Finance</SelectItem>
                  <SelectItem value="Operations">Operations</SelectItem>
                  <SelectItem value="Sales">Sales</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="location">Location *</Label>
              <Input
                id="location"
                placeholder="e.g., New York, NY"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Employment Type</Label>
              <Select value={formData.type} onValueChange={(val) => setFormData({ ...formData, type: val })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="full-time">Full-Time</SelectItem>
                  <SelectItem value="part-time">Part-Time</SelectItem>
                  <SelectItem value="contract">Contract</SelectItem>
                  <SelectItem value="remote">Remote</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Status</Label>
              <Select value={formData.status} onValueChange={(val) => setFormData({ ...formData, status: val })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                  <SelectItem value="filled">Filled</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="salaryMin">Salary Min ($)</Label>
              <Input
                id="salaryMin"
                type="number"
                placeholder="e.g., 80000"
                value={formData.salaryMin}
                onChange={(e) => setFormData({ ...formData, salaryMin: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="salaryMax">Salary Max ($)</Label>
              <Input
                id="salaryMax"
                type="number"
                placeholder="e.g., 120000"
                value={formData.salaryMax}
                onChange={(e) => setFormData({ ...formData, salaryMax: e.target.value })}
              />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe the role and responsibilities..."
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="requirements">Requirements</Label>
            <Textarea
              id="requirements"
              placeholder="List the required qualifications..."
              rows={3}
              value={formData.requirements}
              onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onSubmit} disabled={saving || !formData.title || !formData.department || !formData.location} className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white">
            {saving ? "Saving..." : title.includes("Create") ? "Create Position" : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  // ==================== DETAIL DIALOG ====================

  const renderDetailDialog = () => (
    <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        {selectedJob && (
          <>
            <DialogHeader>
              <div className="flex items-start justify-between">
                <div>
                  <DialogTitle className="text-xl">{selectedJob.title}</DialogTitle>
                  <DialogDescription className="mt-1 flex items-center gap-2 flex-wrap">
                    <span className="flex items-center gap-1"><Building2 className="w-3 h-3" /> {selectedJob.department}</span>
                    <span>&middot;</span>
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {selectedJob.location}</span>
                  </DialogDescription>
                </div>
                <StatusBadge status={selectedJob.status} />
              </div>
            </DialogHeader>

            <div className="space-y-4 py-2">
              <div className="flex items-center gap-2 flex-wrap">
                <TypeBadge type={selectedJob.type} />
                {selectedJob.salaryMin && selectedJob.salaryMax && (
                  <Badge variant="secondary" className="bg-msbm-red/10 dark:bg-msbm-red/20 text-msbm-red dark:text-msbm-red-bright border-0">
                    <DollarSign className="w-3 h-3 mr-1" />
                    {formatSalary(selectedJob.salaryMin)} - {formatSalary(selectedJob.salaryMax)}
                  </Badge>
                )}
                <Badge variant="secondary" className="bg-inner-blue/10 dark:bg-inner-blue/20 text-inner-blue dark:text-light-blue border-0">
                  <Users className="w-3 h-3 mr-1" />
                  {selectedJob.applicantCount} applicants
                </Badge>
              </div>

              <Separator />

              <div>
                <h4 className="text-sm font-semibold mb-2">Description</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">{selectedJob.description}</p>
              </div>

              <div>
                <h4 className="text-sm font-semibold mb-2">Requirements</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">{selectedJob.requirements}</p>
              </div>

              <Separator />

              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Created {new Date(selectedJob.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                <span>Updated {new Date(selectedJob.updatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => { setDetailDialogOpen(false); openEditDialog(selectedJob); }}>
                <Pencil className="w-4 h-4 mr-2" />
                Edit
              </Button>
              <Button className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white">
                <Briefcase className="w-4 h-4 mr-2" />
                View Applicants
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );

  // ==================== DELETE DIALOG ====================

  const renderDeleteDialog = () => (
    <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle>Delete Position</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete <span className="font-semibold text-foreground">{selectedJob?.title}</span>? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button variant="destructive" onClick={handleDeleteJob} disabled={saving}>
            {saving ? "Deleting..." : "Delete Position"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  // ==================== RENDER ====================

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Briefcase className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            Recruitment
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage job postings, track candidates, and optimize your hiring pipeline
          </p>
        </div>
        <Button
          onClick={() => { resetForm(); setCreateDialogOpen(true); }}
          className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg"
        >
          <Plus className="w-4 h-4 mr-2" />
          Post Job
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger-grid">
        <StatCard
          title="Open Positions"
          value={loading ? "..." : openPositions}
          icon={Briefcase}
          trend="up"
          trendValue="+2 this week"
          delay={1}
          color="emerald"
        />
        <StatCard
          title="Total Applicants"
          value={loading ? "..." : totalApplicants}
          icon={Users}
          trend="up"
          trendValue="+18 this week"
          delay={2}
          color="teal"
        />
        <StatCard
          title="Avg Time-to-Hire"
          value="28 days"
          icon={Clock}
          trend="down"
          trendValue="-3 days"
          delay={3}
          color="amber"
        />
        <StatCard
          title="Active Pipelines"
          value={3}
          icon={GitBranch}
          trend="up"
          trendValue="+1 new"
          delay={4}
          color="rose"
        />
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="bg-muted/60">
          <TabsTrigger value="job-board" className="text-sm">
            <Briefcase className="w-4 h-4 mr-1.5" />
            Job Board
          </TabsTrigger>
          <TabsTrigger value="pipeline" className="text-sm">
            <GitBranch className="w-4 h-4 mr-1.5" />
            Pipeline
          </TabsTrigger>
          <TabsTrigger value="analytics" className="text-sm">
            <TrendingUp className="w-4 h-4 mr-1.5" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="job-board" className="mt-4">
          {renderJobBoard()}
        </TabsContent>

        <TabsContent value="pipeline" className="mt-4">
          {renderPipeline()}
        </TabsContent>

        <TabsContent value="analytics" className="mt-4">
          {renderAnalytics()}
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      {renderFormDialog(
        createDialogOpen,
        setCreateDialogOpen,
        "Create New Position",
        "Add a new job listing to your recruitment board.",
        handleCreateJob,
      )}
      {renderFormDialog(
        editDialogOpen,
        setEditDialogOpen,
        "Edit Position",
        "Update the details of this job listing.",
        handleEditJob,
      )}
      {renderDetailDialog()}
      {renderDeleteDialog()}
    </div>
  );
}

// Target icon for analytics
function Target({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  );
}
