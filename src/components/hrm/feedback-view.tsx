"use client";

import React, { useState, useMemo } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import {
  MessageSquareQuote,
  ClipboardList,
  Send,
  Star,
  Eye,
  Plus,
  CalendarDays,
  Users,
  TrendingUp,
  BarChart3,
  Award,
  AlertCircle,
  MessageCircle,
  Lightbulb,
  ShieldCheck,
  CheckCircle2,
  Clock,
  FileText,
  ThumbsUp,
  Minus,
  XCircle,
} from "lucide-react";

// ─── Types ──────────────────────────────────────────────────────────

type SurveyStatus = "Active" | "Closed" | "Draft";
type FeedbackType = "Appreciation" | "Suggestion" | "Concern";
type SurveyType = "Satisfaction" | "Audit" | "Assessment" | "Review" | "Engagement";

interface Survey {
  id: string;
  title: string;
  description: string;
  status: SurveyStatus;
  responses: number;
  totalTarget: number;
  createdAt: string;
  deadline: string;
  type: SurveyType;
}

interface FeedbackEntry {
  id: string;
  from: string;
  to: string;
  type: FeedbackType;
  rating: number;
  date: string;
  comment: string;
  anonymous: boolean;
}

interface MyFeedbackItem {
  id: string;
  from: string;
  type: FeedbackType;
  rating: number;
  date: string;
  comment: string;
  anonymous: boolean;
}

// ─── Constants ──────────────────────────────────────────────────────

const SURVEY_STATUS_STYLES: Record<SurveyStatus, { className: string; icon: React.ElementType }> = {
  Active: { className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300", icon: CheckCircle2 },
  Closed: { className: "bg-slate-100 text-slate-700 dark:bg-slate-900/50 dark:text-slate-300", icon: Clock },
  Draft: { className: "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300", icon: FileText },
};

const FEEDBACK_TYPE_STYLES: Record<FeedbackType, { className: string; icon: React.ElementType }> = {
  Appreciation: { className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300", icon: ThumbsUp },
  Suggestion: { className: "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300", icon: Lightbulb },
  Concern: { className: "bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-300", icon: AlertCircle },
};

// ─── Mock Data ──────────────────────────────────────────────────────

const MOCK_EMPLOYEES = [
  "Dr. Sarah Chen",
  "Mark Williams",
  "Lisa Park",
  "James Rodriguez",
  "Aisha Johnson",
  "David Kim",
  "Tom Baker",
  "Nina Patel",
  "Rachel Foster",
  "Michael Brown",
  "Angela Davis",
  "Chris Thompson",
];

const MOCK_SURVEYS: Survey[] = [
  { id: "s1", title: "Employee Satisfaction Q2", description: "Quarterly survey measuring overall employee satisfaction, workplace environment, and team dynamics.", status: "Active", responses: 23, totalTarget: 45, createdAt: "2025-05-15", deadline: "2025-06-30", type: "Satisfaction" },
  { id: "s2", title: "Workplace Safety Audit", description: "Comprehensive safety audit covering office hazards, emergency protocols, and equipment maintenance.", status: "Active", responses: 38, totalTarget: 40, createdAt: "2025-05-01", deadline: "2025-06-15", type: "Audit" },
  { id: "s3", title: "Remote Work Experience", description: "Feedback on remote working arrangements, technology tools, and work-life balance.", status: "Closed", responses: 52, totalTarget: 52, createdAt: "2025-03-01", deadline: "2025-04-15", type: "Assessment" },
  { id: "s4", title: "Training Needs Assessment", description: "Identify skill gaps and training preferences to plan next quarter's professional development programme.", status: "Closed", responses: 41, totalTarget: 50, createdAt: "2025-02-10", deadline: "2025-03-20", type: "Assessment" },
  { id: "s5", title: "Benefits Review", description: "Annual review of employee benefits package including health insurance, pension, and wellness perks.", status: "Closed", responses: 48, totalTarget: 48, createdAt: "2025-01-05", deadline: "2025-02-28", type: "Review" },
  { id: "s6", title: "Culture & Engagement", description: "Assess organisational culture, team cohesion, and employee engagement levels across departments.", status: "Draft", responses: 0, totalTarget: 60, createdAt: "2025-06-10", deadline: "2025-08-31", type: "Engagement" },
];

const MOCK_FEEDBACK: FeedbackEntry[] = [
  { id: "f1", from: "Dr. Sarah Chen", to: "Mark Williams", type: "Appreciation", rating: 5, date: "2025-06-11", comment: "Outstanding leadership during the Q2 planning session. Your strategic thinking helped the team align on key priorities.", anonymous: false },
  { id: "f2", from: "Anonymous", to: "Lisa Park", type: "Suggestion", rating: 4, date: "2025-06-10", comment: "Consider using shared project boards to improve visibility across team workstreams and reduce duplicate effort.", anonymous: true },
  { id: "f3", from: "James Rodriguez", to: "David Kim", type: "Appreciation", rating: 5, date: "2025-06-09", comment: "Thank you for mentoring the new hires. Your patience and guidance made their onboarding experience seamless.", anonymous: false },
  { id: "f4", from: "Aisha Johnson", to: "Tom Baker", type: "Concern", rating: 3, date: "2025-06-08", comment: "The new deadline for the compliance report seems unrealistic given the current resource constraints. Suggest revisiting the timeline.", anonymous: false },
  { id: "f5", from: "Anonymous", to: "Nina Patel", type: "Appreciation", rating: 5, date: "2025-06-07", comment: "Your presentation at the all-hands was incredibly insightful. The data visualisation made complex metrics easy to understand.", anonymous: true },
  { id: "f6", from: "Rachel Foster", to: "Michael Brown", type: "Suggestion", rating: 4, date: "2025-06-06", comment: "Implementing a weekly knowledge-sharing session could help distribute expertise across the department more effectively.", anonymous: false },
  { id: "f7", from: "Chris Thompson", to: "Angela Davis", type: "Appreciation", rating: 4, date: "2025-06-05", comment: "Great coordination on the cross-departmental project. Your communication kept everyone aligned and on schedule.", anonymous: false },
  { id: "f8", from: "David Kim", to: "Dr. Sarah Chen", type: "Concern", rating: 3, date: "2025-06-04", comment: "The increased meeting frequency is impacting deep work time. Could we consolidate some of the recurring meetings?", anonymous: false },
];

const MOCK_MY_FEEDBACK: MyFeedbackItem[] = [
  { id: "mf1", from: "Mark Williams", type: "Appreciation", rating: 5, date: "2025-06-12", comment: "Your guidance on the database migration was invaluable. The project was completed ahead of schedule thanks to your expertise and clear communication.", anonymous: false },
  { id: "mf2", from: "Anonymous", type: "Appreciation", rating: 4, date: "2025-06-10", comment: "Consistently delivering high-quality work. Your attention to detail on the financial reports has been noticed and appreciated by leadership.", anonymous: true },
  { id: "mf3", from: "Lisa Park", type: "Suggestion", rating: 4, date: "2025-06-08", comment: "Consider sharing your documentation templates with the wider team — they could benefit from your structured approach to technical writing.", anonymous: false },
  { id: "mf4", from: "James Rodriguez", type: "Appreciation", rating: 5, date: "2025-06-05", comment: "Excellent problem-solving during the system outage. Your calm approach and quick resolution minimised downtime for the entire campus.", anonymous: false },
  { id: "mf5", from: "Anonymous", type: "Suggestion", rating: 3, date: "2025-06-03", comment: "Response times to support tickets could be improved. Setting up automated triage might help prioritise urgent requests more efficiently.", anonymous: true },
  { id: "mf6", from: "Aisha Johnson", type: "Concern", rating: 3, date: "2025-06-01", comment: "Some stakeholders have raised concerns about the timeline for the new feature rollout. Recommend a review meeting to realign expectations.", anonymous: false },
];

// ─── Helper Functions ──────────────────────────────────────────────

function formatDate(dateStr: string): string {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-3.5 w-3.5 ${star <= rating ? "text-amber-400 fill-amber-400" : "text-muted-foreground/30"}`}
        />
      ))}
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────

export function FeedbackView() {
  const [activeTab, setActiveTab] = useState("surveys");
  const [surveyDialogOpen, setSurveyDialogOpen] = useState(false);
  const [feedbackFilter, setFeedbackFilter] = useState("All");
  const [newSurvey, setNewSurvey] = useState({ title: "", description: "", deadline: "", type: "Satisfaction" as SurveyType });
  const [feedbackForm, setFeedbackForm] = useState({
    employee: "",
    type: "Appreciation" as FeedbackType,
    rating: 5,
    comment: "",
    anonymous: false,
  });

  // ─── Computed Stats ────────────────────────────────────────────
  const stats = useMemo(() => {
    const active = MOCK_SURVEYS.filter((s) => s.status === "Active").length;
    const closed = MOCK_SURVEYS.filter((s) => s.status === "Closed").length;
    const avgRating = 4.2;
    const totalFeedback = MOCK_FEEDBACK.length + MOCK_MY_FEEDBACK.length;
    return [
      { label: "Total Feedback", value: totalFeedback, icon: MessageCircle, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-950/40" },
      { label: "Average Rating", value: `${avgRating}/5`, icon: Star, color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-950/40" },
      { label: "Response Rate", value: "67%", icon: TrendingUp, color: "text-violet-600 dark:text-violet-400", bg: "bg-violet-50 dark:bg-violet-950/40" },
      { label: "Active Surveys", value: active, icon: ClipboardList, color: "text-rose-600 dark:text-rose-400", bg: "bg-rose-50 dark:bg-rose-950/40" },
    ];
  }, []);

  // ─── Survey Stats ─────────────────────────────────────────────
  const surveyStats = useMemo(() => {
    const active = MOCK_SURVEYS.filter((s) => s.status === "Active").length;
    const closed = MOCK_SURVEYS.filter((s) => s.status === "Closed").length;
    const draft = MOCK_SURVEYS.filter((s) => s.status === "Draft").length;
    const avgRate = Math.round(
      MOCK_SURVEYS.filter((s) => s.status !== "Draft").reduce((sum, s) => sum + (s.totalTarget > 0 ? (s.responses / s.totalTarget) * 100 : 0), 0) /
      MOCK_SURVEYS.filter((s) => s.status !== "Draft").length
    );
    return [
      { label: "Active", value: active, color: "text-emerald-600 dark:text-emerald-400" },
      { label: "Closed", value: closed, color: "text-slate-600 dark:text-slate-400" },
      { label: "Draft", value: draft, color: "text-amber-600 dark:text-amber-400" },
      { label: "Avg Response Rate", value: `${avgRate}%`, color: "text-violet-600 dark:text-violet-400" },
    ];
  }, []);

  // ─── Filtered Feedback ────────────────────────────────────────
  const filteredFeedback = useMemo(() => {
    if (feedbackFilter === "All") return MOCK_FEEDBACK;
    return MOCK_FEEDBACK.filter((f) => f.type === feedbackFilter);
  }, [feedbackFilter]);

  // ─── My Feedback Stats ────────────────────────────────────────
  const myFeedbackStats = useMemo(() => {
    const avgRating = Math.round(
      MOCK_MY_FEEDBACK.reduce((sum, f) => sum + f.rating, 0) / MOCK_MY_FEEDBACK.length * 10
    ) / 10;
    const positive = MOCK_MY_FEEDBACK.filter((f) => f.type === "Appreciation").length;
    const neutral = MOCK_MY_FEEDBACK.filter((f) => f.type === "Suggestion").length;
    const needsAttention = MOCK_MY_FEEDBACK.filter((f) => f.type === "Concern").length;
    return { avgRating, positive, neutral, needsAttention };
  }, []);

  // ─── Handlers ─────────────────────────────────────────────────
  const handleCreateSurvey = () => {
    if (!newSurvey.title) {
      toast.error("Please enter a survey title");
      return;
    }
    toast.success("Survey created!", { description: `"${newSurvey.title}" has been saved as a draft.` });
    setSurveyDialogOpen(false);
    setNewSurvey({ title: "", description: "", deadline: "", type: "Satisfaction" });
  };

  const handleSubmitFeedback = () => {
    if (!feedbackForm.employee) {
      toast.error("Please select an employee");
      return;
    }
    if (!feedbackForm.comment) {
      toast.error("Please add a comment");
      return;
    }
    toast.success("Feedback submitted!", {
      description: `${feedbackForm.anonymous ? "Anonymous" : ""} ${feedbackForm.type} feedback sent to ${feedbackForm.employee}.`,
    });
    setFeedbackForm({ employee: "", type: "Appreciation", rating: 5, comment: "", anonymous: false });
  };

  // ─── Render ────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Team Feedback & Surveys</h1>
          <p className="text-sm text-muted-foreground">Share feedback, take surveys, and track team sentiment</p>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="card-lift transition-all duration-300">
              <CardContent className="pt-0">
                <div className="flex items-center gap-3">
                  <div className={`flex items-center justify-center h-10 w-10 rounded-xl ${stat.bg}`}>
                    <Icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-xl font-bold">{stat.value}</p>
                    <p className="text-[11px] text-muted-foreground">{stat.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="surveys"><ClipboardList className="h-4 w-4 mr-1.5" />Surveys</TabsTrigger>
          <TabsTrigger value="give-feedback"><Send className="h-4 w-4 mr-1.5" />Give Feedback</TabsTrigger>
          <TabsTrigger value="my-feedback"><MessageSquareQuote className="h-4 w-4 mr-1.5" />My Feedback</TabsTrigger>
        </TabsList>

        {/* ─── Surveys Tab ─────────────────────────────────────── */}
        <TabsContent value="surveys" className="mt-4 space-y-4">
          {/* Survey Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {surveyStats.map((stat) => (
              <Card key={stat.label} className="stat-card-emerald">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">{stat.label}</p>
                <p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p>
              </Card>
            ))}
          </div>

          {/* Create Survey Button */}
          <div className="flex justify-end">
            <Button
              size="sm"
              className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:from-emerald-600 hover:to-teal-700"
              onClick={() => setSurveyDialogOpen(true)}
            >
              <Plus className="h-4 w-4 mr-1.5" />Create Survey
            </Button>
          </div>

          {/* Survey Cards */}
          <div className="space-y-3">
            {MOCK_SURVEYS.map((survey) => {
              const statusCfg = SURVEY_STATUS_STYLES[survey.status];
              const StatusIcon = statusCfg.icon;
              const progress = survey.totalTarget > 0 ? Math.round((survey.responses / survey.totalTarget) * 100) : 0;

              return (
                <Card key={survey.id} className="card-lift transition-all duration-300 hover:border-emerald-200/60 dark:hover:border-emerald-800/40">
                  <CardContent className="pt-4">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1.5">
                          <h3 className="text-sm font-semibold">{survey.title}</h3>
                          <Badge variant="outline" className={`text-[10px] px-1.5 py-0 gap-0.5 ${statusCfg.className}`}>
                            <StatusIcon className="h-3 w-3" />
                            {survey.status}
                          </Badge>
                          <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                            {survey.type}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mb-2 line-clamp-1">{survey.description}</p>
                        <div className="flex items-center gap-4 flex-wrap">
                          <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                            <Users className="h-3 w-3" />{survey.responses} of {survey.totalTarget} responses
                          </span>
                          <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                            <CalendarDays className="h-3 w-3" />Deadline: {formatDate(survey.deadline)}
                          </span>
                        </div>
                      </div>

                      {survey.status === "Active" && (
                        <div className="flex flex-col items-end gap-2 shrink-0 sm:w-48">
                          <div className="w-full">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-[10px] text-muted-foreground">Progress</span>
                              <span className="text-[10px] font-medium">{progress}%</span>
                            </div>
                            <Progress value={progress} className="h-1.5" />
                          </div>
                          <Button
                            size="sm"
                            className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:from-emerald-600 hover:to-teal-700 text-xs"
                            onClick={() => toast.info("Survey response form coming soon!")}
                          >
                            Take Survey
                          </Button>
                        </div>
                      )}

                      {survey.status === "Closed" && (
                        <div className="flex flex-col items-end gap-2 shrink-0">
                          <div className="flex items-center gap-1">
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                            <span className="text-xs text-muted-foreground">{survey.responses} responses</span>
                          </div>
                          <Button variant="outline" size="sm" className="text-xs" onClick={() => toast.info("Survey results coming soon!")}>
                            <Eye className="h-3.5 w-3.5 mr-1" />View Results
                          </Button>
                        </div>
                      )}

                      {survey.status === "Draft" && (
                        <div className="shrink-0">
                          <Button variant="outline" size="sm" className="text-xs" onClick={() => toast.info("Publish feature coming soon!")}>
                            <FileText className="h-3.5 w-3.5 mr-1" />Edit Draft
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* ─── Give Feedback Tab ───────────────────────────────── */}
        <TabsContent value="give-feedback" className="mt-4 space-y-4">
          {/* Feedback Form */}
          <Card className="card-gradient-emerald">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Submit Feedback</CardTitle>
              <CardDescription>Share your thoughts with a colleague</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Select Employee</Label>
                    <Select value={feedbackForm.employee} onValueChange={(v) => setFeedbackForm((p) => ({ ...p, employee: v }))}>
                      <SelectTrigger><SelectValue placeholder="Choose an employee" /></SelectTrigger>
                      <SelectContent>
                        {MOCK_EMPLOYEES.map((emp) => (
                          <SelectItem key={emp} value={emp}>{emp}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Feedback Type</Label>
                    <Select value={feedbackForm.type} onValueChange={(v) => setFeedbackForm((p) => ({ ...p, type: v as FeedbackType }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Appreciation">Appreciation</SelectItem>
                        <SelectItem value="Suggestion">Suggestion</SelectItem>
                        <SelectItem value="Concern">Concern</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Rating</Label>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => setFeedbackForm((p) => ({ ...p, rating: star }))}
                        className="p-0.5 transition-transform hover:scale-110"
                      >
                        <Star
                          className={`h-6 w-6 transition-colors ${
                            star <= feedbackForm.rating ? "text-amber-400 fill-amber-400" : "text-muted-foreground/30"
                          }`}
                        />
                      </button>
                    ))}
                    <span className="text-xs text-muted-foreground ml-2">{feedbackForm.rating}/5</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Comments</Label>
                  <Textarea
                    placeholder="Share your feedback... (max 500 characters)"
                    value={feedbackForm.comment}
                    onChange={(e) => setFeedbackForm((p) => ({ ...p, comment: e.target.value.slice(0, 500) }))}
                    className="resize-none"
                    rows={3}
                  />
                  <p className="text-[10px] text-muted-foreground text-right">{feedbackForm.comment.length}/500</p>
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={feedbackForm.anonymous}
                      onChange={(e) => setFeedbackForm((p) => ({ ...p, anonymous: e.target.checked }))}
                      className="h-4 w-4 rounded border-border text-emerald-500 focus:ring-emerald-500"
                    />
                    <span className="text-xs text-muted-foreground">Submit anonymously</span>
                  </label>
                  <Button
                    onClick={handleSubmitFeedback}
                    className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:from-emerald-600 hover:to-teal-700"
                  >
                    <Send className="h-4 w-4 mr-1.5" />Submit Feedback
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Filter */}
          <div className="flex flex-wrap gap-1.5">
            {["All", "Appreciation", "Suggestion", "Concern"].map((type) => (
              <Button
                key={type}
                variant={feedbackFilter === type ? "default" : "outline"}
                size="sm"
                className={`text-xs h-7 ${feedbackFilter === type ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white" : ""}`}
                onClick={() => setFeedbackFilter(type)}
              >
                {type}
              </Button>
            ))}
          </div>

          {/* Recent Feedback */}
          <ScrollArea className="max-h-[500px]">
            <div className="space-y-2 pr-2">
              {filteredFeedback.map((entry) => {
                const typeCfg = FEEDBACK_TYPE_STYLES[entry.type];
                const TypeIcon = typeCfg.icon;

                return (
                  <Card key={entry.id} className="card-lift transition-all duration-300 hover:border-emerald-200/60 dark:hover:border-emerald-800/40">
                    <CardContent className="py-3">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-medium">{entry.from}</span>
                          <span className="text-[10px] text-muted-foreground">→</span>
                          <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">{entry.to}</span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <Badge variant="outline" className={`text-[10px] px-1.5 py-0 gap-0.5 ${typeCfg.className}`}>
                            <TypeIcon className="h-3 w-3" />
                            {entry.type}
                          </Badge>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{entry.comment}</p>
                      <div className="flex items-center justify-between">
                        <StarRating rating={entry.rating} />
                        <span className="text-[10px] text-muted-foreground">{formatDate(entry.date)}</span>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </ScrollArea>
        </TabsContent>

        {/* ─── My Feedback Tab ─────────────────────────────────── */}
        <TabsContent value="my-feedback" className="mt-4 space-y-4">
          {/* Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="stat-card-emerald">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Average Rating</p>
              <div className="flex items-center gap-2">
                <p className="text-xl font-bold">{myFeedbackStats.avgRating}</p>
                <span className="text-xs text-muted-foreground">/5</span>
                <StarRating rating={Math.round(myFeedbackStats.avgRating)} />
              </div>
            </Card>
            <Card className="stat-card-emerald">
              <div className="flex items-center gap-2">
                <ThumbsUp className="h-5 w-5 text-emerald-500" />
                <div>
                  <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{myFeedbackStats.positive}</p>
                  <p className="text-[10px] text-muted-foreground">Positive</p>
                </div>
              </div>
            </Card>
            <Card className="stat-card-amber">
              <div className="flex items-center gap-2">
                <Minus className="h-5 w-5 text-amber-500" />
                <div>
                  <p className="text-xl font-bold text-amber-600 dark:text-amber-400">{myFeedbackStats.neutral}</p>
                  <p className="text-[10px] text-muted-foreground">Neutral</p>
                </div>
              </div>
            </Card>
            <Card className="stat-card-rose">
              <div className="flex items-center gap-2">
                <XCircle className="h-5 w-5 text-rose-500" />
                <div>
                  <p className="text-xl font-bold text-rose-600 dark:text-rose-400">{myFeedbackStats.needsAttention}</p>
                  <p className="text-[10px] text-muted-foreground">Needs Attention</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Feedback List */}
          <div className="space-y-3">
            {MOCK_MY_FEEDBACK.map((item) => {
              const typeCfg = FEEDBACK_TYPE_STYLES[item.type];
              const TypeIcon = typeCfg.icon;

              return (
                <Card key={item.id} className="card-lift transition-all duration-300 hover:border-emerald-200/60 dark:hover:border-emerald-800/40">
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <div className={`flex items-center justify-center h-8 w-8 rounded-full ${typeCfg.className}`}>
                          <TypeIcon className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold">{item.from}</p>
                          <p className="text-[10px] text-muted-foreground">{formatDate(item.date)}</p>
                        </div>
                      </div>
                      <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${typeCfg.className}`}>
                        {item.type}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <StarRating rating={item.rating} />
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">{item.comment}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>

      {/* ─── Create Survey Dialog ──────────────────────────────── */}
      <Dialog open={surveyDialogOpen} onOpenChange={setSurveyDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-emerald-500" />
              Create Survey
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="form-group">
              <Label className="form-label required">Title</Label>
              <Input className="form-input-enhanced" placeholder="e.g. Q3 Employee Engagement" value={newSurvey.title} onChange={(e) => setNewSurvey((p) => ({ ...p, title: e.target.value }))} />
            </div>
            <div className="form-group">
              <Label className="form-label">Description</Label>
              <Textarea placeholder="Describe the survey purpose..." value={newSurvey.description} onChange={(e) => setNewSurvey((p) => ({ ...p, description: e.target.value }))} className="resize-none" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="form-group">
                <Label className="form-label">Deadline</Label>
                <Input className="form-input-enhanced" type="date" value={newSurvey.deadline} onChange={(e) => setNewSurvey((p) => ({ ...p, deadline: e.target.value }))} />
              </div>
              <div className="form-group">
                <Label className="form-label">Type</Label>
                <Select value={newSurvey.type} onValueChange={(v) => setNewSurvey((p) => ({ ...p, type: v as SurveyType }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Satisfaction">Satisfaction</SelectItem>
                    <SelectItem value="Audit">Audit</SelectItem>
                    <SelectItem value="Assessment">Assessment</SelectItem>
                    <SelectItem value="Review">Review</SelectItem>
                    <SelectItem value="Engagement">Engagement</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setSurveyDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateSurvey} className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:from-emerald-600 hover:to-teal-700">
              <Plus className="h-4 w-4 mr-1.5" />Create Survey
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
