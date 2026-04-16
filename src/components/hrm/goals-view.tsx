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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";
import {
  Target,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  Plus,
  Pencil,
  Users,
  CalendarDays,
  ChevronRight,
  TrendingUp,
  Circle,
  BarChart3,
  ArrowUpRight,
  MessageSquare,
  Timer,
  CalendarClock,
} from "lucide-react";

// ─── Types ──────────────────────────────────────────────────────────

type Priority = "High" | "Medium" | "Low";
type OKRStatus = "On Track" | "At Risk" | "Behind";
type CheckInRating = "On Track" | "At Risk" | "Behind";

interface KeyResult {
  id: string;
  title: string;
  completed: boolean;
}

interface Objective {
  id: string;
  title: string;
  description: string;
  progress: number;
  priority: Priority;
  deadline: string;
  status: OKRStatus;
  keyResults: KeyResult[];
}

interface TeamGoal {
  id: string;
  title: string;
  department: string;
  progress: number;
  deadline: string;
  assignees: { name: string; initials: string }[];
}

interface CheckIn {
  id: string;
  date: string;
  type: string;
  notes: string;
  rating: CheckInRating;
  actionItems: string[];
}

// ─── Constants ──────────────────────────────────────────────────────

const PRIORITY_STYLES: Record<Priority, string> = {
  High: "bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-300",
  Medium: "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300",
  Low: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300",
};

const OKR_STATUS_STYLES: Record<OKRStatus, { className: string; icon: React.ElementType }> = {
  "On Track": { className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300", icon: CheckCircle2 },
  "At Risk": { className: "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300", icon: AlertTriangle },
  "Behind": { className: "bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-300", icon: XCircle },
};

function getProgressColor(progress: number): string {
  if (progress > 70) return "bg-emerald-500";
  if (progress >= 30) return "bg-amber-500";
  return "bg-rose-500";
}

function getProgressTextColor(progress: number): string {
  if (progress > 70) return "text-emerald-600 dark:text-emerald-400";
  if (progress >= 30) return "text-amber-600 dark:text-amber-400";
  return "text-rose-600 dark:text-rose-400";
}

// ─── Avatar Colors ──────────────────────────────────────────────────

const AVATAR_GRADIENTS = [
  "from-emerald-400 to-teal-500",
  "from-amber-400 to-orange-500",
  "from-violet-400 to-purple-500",
  "from-rose-400 to-pink-500",
  "from-cyan-400 to-teal-500",
];

function getAvatarGradient(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_GRADIENTS[Math.abs(hash) % AVATAR_GRADIENTS.length];
}

function formatDate(dateStr: string): string {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

// ─── CheckIn Timeline Dot ───────────────────────────────────────────

function CheckInDot({ rating }: { rating: CheckInRating }) {
  const colors: Record<CheckInRating, string> = {
    "On Track": "bg-emerald-500",
    "At Risk": "bg-amber-500",
    "Behind": "bg-rose-500",
  };
  return (
    <div className={`w-3 h-3 rounded-full border-2 border-background ${colors[rating]} shrink-0`} />
  );
}

// ─── Main Component ─────────────────────────────────────────────────

export function GoalsView() {
  const [activeTab, setActiveTab] = useState("my-okrs");
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedObjective, setSelectedObjective] = useState<Objective | null>(null);
  const [editForm, setEditForm] = useState({ title: "", description: "", progress: 50, deadline: "", priority: "Medium" as Priority });
  const [objectives, setObjectives] = useState<Objective[]>([]);
  const [teamGoals, setTeamGoals] = useState<TeamGoal[]>([]);
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);

  // ─── Computed Stats ────────────────────────────────────────────
  const stats = useMemo(() => {
    const active = objectives.length;
    const onTrack = objectives.filter((o) => o.status === "On Track").length;
    const atRisk = objectives.filter((o) => o.status === "At Risk").length;
    const avgProgress = active > 0 ? Math.round(objectives.reduce((sum, o) => sum + o.progress, 0) / active * 10) / 10 : 0;
    return [
      { label: "Active OKRs", value: active, icon: Target, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-950/40" },
      { label: "On Track", value: onTrack, icon: CheckCircle2, color: "text-teal-600 dark:text-teal-400", bg: "bg-teal-50 dark:bg-teal-950/40" },
      { label: "At Risk", value: atRisk, icon: AlertTriangle, color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-950/40" },
      { label: "Avg. Progress", value: `${avgProgress}%`, icon: BarChart3, color: "text-rose-600 dark:text-rose-400", bg: "bg-rose-50 dark:bg-rose-950/40" },
    ];
  }, [objectives]);

  // ─── Edit Handler ──────────────────────────────────────────────
  const openEditDialog = (obj: Objective) => {
    setSelectedObjective(obj);
    setEditForm({ title: obj.title, description: obj.description, progress: obj.progress, deadline: obj.deadline, priority: obj.priority });
    setEditDialogOpen(true);
  };

  const handleSaveEdit = () => {
    if (!editForm.title) {
      toast.error("Please enter an objective title");
      return;
    }
    toast.success("Objective updated!", { description: `"${editForm.title}" has been saved.` });
    setEditDialogOpen(false);
    setSelectedObjective(null);
  };

  // ─── Render ────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Goals & OKRs</h1>
          <p className="text-sm text-muted-foreground">Track your objectives, key results, and progress</p>
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
          <TabsTrigger value="my-okrs"><Target className="h-4 w-4 mr-1.5" />My OKRs</TabsTrigger>
          <TabsTrigger value="team-goals"><Users className="h-4 w-4 mr-1.5" />Team Goals</TabsTrigger>
          <TabsTrigger value="checkins"><MessageSquare className="h-4 w-4 mr-1.5" />Check-ins</TabsTrigger>
        </TabsList>

        {/* ─── My OKRs Tab ──────────────────────────────────────── */}
        <TabsContent value="my-okrs" className="mt-4 space-y-4">
          <div className="space-y-4">
            {objectives.length === 0 && <div className="text-center py-12 text-muted-foreground"><Target className="h-10 w-10 mx-auto mb-2 opacity-40" /><p>No objectives set yet. Create your first OKR to get started.</p></div>}
            {objectives.map((obj) => {
              const statusCfg = OKR_STATUS_STYLES[obj.status];
              const StatusIcon = statusCfg.icon;
              const completedKRs = obj.keyResults.filter((kr) => kr.completed).length;

              return (
                <Card key={obj.id} className="card-lift transition-all duration-300 hover:border-emerald-200/60 dark:hover:border-emerald-800/40">
                  <CardContent className="pt-4">
                    {/* Objective Header */}
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-3">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="flex items-center justify-center h-9 w-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 shrink-0 mt-0.5">
                          <Target className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-sm font-semibold">{obj.title}</h3>
                            <Badge variant="outline" className={`text-[10px] px-1.5 py-0 gap-0.5 ${statusCfg.className}`}>
                              <StatusIcon className="h-3 w-3" />
                              {obj.status}
                            </Badge>
                            <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${PRIORITY_STYLES[obj.priority]}`}>
                              {obj.priority}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{obj.description}</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" className="text-xs h-7 gap-1 shrink-0" onClick={() => openEditDialog(obj)}>
                        <Pencil className="h-3 w-3" />Edit
                      </Button>
                    </div>

                    {/* Progress Bar */}
                    <div className="flex items-center gap-3 mb-3">
                      <Progress value={obj.progress} className="h-2 flex-1" />
                      <span className={`text-sm font-bold ${getProgressTextColor(obj.progress)}`}>{obj.progress}%</span>
                    </div>

                    {/* Key Results */}
                    <div className="space-y-1.5">
                      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                        Key Results ({completedKRs}/{obj.keyResults.length})
                      </p>
                      {obj.keyResults.map((kr) => (
                        <div key={kr.id} className="flex items-center gap-2.5 py-1">
                          {kr.completed ? (
                            <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                          ) : (
                            <Circle className="h-4 w-4 text-muted-foreground/50 shrink-0" />
                          )}
                          <span className={`text-xs ${kr.completed ? "line-through text-muted-foreground" : "font-medium"}`}>
                            {kr.title}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between mt-3 pt-2 border-t border-border/50">
                      <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                        <CalendarDays className="h-3 w-3" />
                        Deadline: {formatDate(obj.deadline)}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* ─── Team Goals Tab ───────────────────────────────────── */}
        <TabsContent value="team-goals" className="mt-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {teamGoals.length === 0 && <div className="text-center py-12 text-muted-foreground col-span-full"><Users className="h-10 w-10 mx-auto mb-2 opacity-40" /><p>No team goals configured yet.</p></div>}
            {teamGoals.map((goal) => (
              <Card key={goal.id} className="card-lift transition-all duration-300 hover:border-emerald-200/60 dark:hover:border-emerald-800/40">
                <CardContent className="pt-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-violet-100 text-violet-700 dark:bg-violet-900/50 dark:text-violet-300">
                      {goal.department}
                    </Badge>
                  </div>
                  <h3 className="text-sm font-semibold mb-3">{goal.title}</h3>

                  {/* Progress */}
                  <div className="flex items-center gap-3 mb-3">
                    <Progress value={goal.progress} className="h-2 flex-1" />
                    <span className={`text-sm font-bold ${getProgressTextColor(goal.progress)}`}>{goal.progress}%</span>
                  </div>

                  {/* Assignees */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center -space-x-2">
                      {goal.assignees.slice(0, 4).map((a) => (
                        <Avatar key={a.initials} className="h-7 w-7 border-2 border-background">
                          <AvatarFallback className={`bg-gradient-to-br ${getAvatarGradient(a.name)} text-white text-[10px] font-semibold`}>
                            {a.initials}
                          </AvatarFallback>
                        </Avatar>
                      ))}
                      {goal.assignees.length > 4 && (
                        <div className="h-7 w-7 rounded-full bg-muted border-2 border-background flex items-center justify-center text-[10px] font-medium text-muted-foreground">
                          +{goal.assignees.length - 4}
                        </div>
                      )}
                    </div>
                    <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                      <CalendarDays className="h-3 w-3" />
                      {formatDate(goal.deadline)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* ─── Check-ins Tab ────────────────────────────────────── */}
        <TabsContent value="checkins" className="mt-4 space-y-4">
          <ScrollArea className="max-h-[700px]">
            <div className="space-y-0 pr-2">
              {checkIns.length === 0 && <div className="text-center py-12 text-muted-foreground"><MessageSquare className="h-10 w-10 mx-auto mb-2 opacity-40" /><p>No check-ins recorded yet.</p></div>}
              {checkIns.map((ci, idx) => {
                const ratingCfg = OKR_STATUS_STYLES[ci.rating];
                const RatingIcon = ratingCfg.icon;
                const isLast = idx === checkIns.length - 1;

                return (
                  <div key={ci.id} className="relative pl-8 pb-6">
                    {/* Timeline Line */}
                    {!isLast && (
                      <div className="absolute left-[5px] top-4 bottom-0 w-0.5 bg-border" />
                    )}
                    {/* Timeline Dot */}
                    <div className="absolute left-0 top-1">
                      <CheckInDot rating={ci.rating} />
                    </div>

                    {/* Content */}
                    <Card className="card-lift transition-all duration-300">
                      <CardContent className="pt-3 pb-3">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-semibold">{formatDate(ci.date)}</span>
                            <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                              {ci.type}
                            </Badge>
                          </div>
                          <Badge variant="outline" className={`text-[10px] px-1.5 py-0 gap-0.5 shrink-0 ${ratingCfg.className}`}>
                            <RatingIcon className="h-3 w-3" />
                            {ci.rating}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mb-2">{ci.notes}</p>
                        {ci.actionItems.length > 0 && (
                          <div className="space-y-1">
                            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Action Items</p>
                            {ci.actionItems.map((item, i) => (
                              <div key={i} className="flex items-center gap-1.5 text-xs">
                                <ChevronRight className="h-3 w-3 text-emerald-500 shrink-0" />
                                <span>{item}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>

      {/* ─── Edit OKR Dialog ────────────────────────────────────── */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Pencil className="h-5 w-5 text-emerald-500" />
              Edit Objective
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input value={editForm.title} onChange={(e) => setEditForm((p) => ({ ...p, title: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Input value={editForm.description} onChange={(e) => setEditForm((p) => ({ ...p, description: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Progress ({editForm.progress}%)</Label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={editForm.progress}
                  onChange={(e) => setEditForm((p) => ({ ...p, progress: Number(e.target.value) }))}
                  className="flex-1 h-2 rounded-full appearance-none bg-muted cursor-pointer accent-emerald-500"
                />
                <span className={`text-sm font-bold w-12 text-right ${getProgressTextColor(editForm.progress)}`}>
                  {editForm.progress}%
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Deadline</Label>
              <Input type="date" value={editForm.deadline} onChange={(e) => setEditForm((p) => ({ ...p, deadline: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Priority</Label>
              <Select value={editForm.priority} onValueChange={(v) => setEditForm((p) => ({ ...p, priority: v as Priority }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveEdit} className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:from-emerald-600 hover:to-teal-700">
              <CheckCircle2 className="h-4 w-4 mr-1.5" />Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
