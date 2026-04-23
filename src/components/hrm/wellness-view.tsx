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
  HeartPulse,
  SmilePlus,
  Dumbbell,
  BookOpen,
  Brain,
  Heart,
  Droplets,
  TrendingUp,
  Plus,
  ExternalLink,
  Flame,
  CalendarDays,
  Clock,
  Zap,
  Activity,
  Apple,
  Stethoscope,
  Moon,
  MonitorOff,
  Users,
  Phone,
  Utensils,
  BedDouble,
  Headphones,
  Monitor,
  CalendarRange,
} from "lucide-react";

// ─── Types ──────────────────────────────────────────────────────────

type MoodType = "Great" | "Good" | "Okay" | "Low" | "Stressed" | "Tired" | "Unwell";
type ActivityCategory = "Exercise" | "Mindfulness" | "Nutrition" | "Medical" | "Rest";

interface MoodEntry {
  id: string;
  date: string;
  mood: MoodType;
}

interface WellnessActivity {
  id: string;
  name: string;
  date: string;
  duration: number;
  category: ActivityCategory;
}

interface WellnessResource {
  id: string;
  title: string;
  type: "Hotline" | "Guide" | "Schedule" | "Article";
  description: string;
  category: "Mental Health" | "Physical Health" | "Nutrition" | "Workplace";
  icon: React.ElementType;
}

// ─── Constants ──────────────────────────────────────────────────────

const MOOD_EMOJIS: Record<MoodType, { emoji: string; color: string }> = {
  Great: { emoji: "😊", color: "bg-msbm-red/10 text-msbm-red dark:bg-msbm-red/20 dark:text-msbm-red-bright" },
  Good: { emoji: "🙂", color: "bg-inner-blue/10 text-inner-blue dark:bg-inner-blue/20 dark:text-light-blue" },
  Okay: { emoji: "😐", color: "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300" },
  Low: { emoji: "😔", color: "bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300" },
  Stressed: { emoji: "😢", color: "bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-300" },
  Tired: { emoji: "😴", color: "bg-slate-100 text-slate-700 dark:bg-slate-900/50 dark:text-slate-300" },
  Unwell: { emoji: "🤒", color: "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300" },
};

const CATEGORY_ICONS: Record<ActivityCategory, React.ElementType> = {
  Exercise: Dumbbell,
  Mindfulness: Brain,
  Nutrition: Apple,
  Medical: Stethoscope,
  Rest: Moon,
};

const CATEGORY_COLORS: Record<ActivityCategory, string> = {
  Exercise: "bg-msbm-red/10 text-msbm-red dark:bg-msbm-red/20 dark:text-msbm-red-bright",
  Mindfulness: "bg-violet-100 text-violet-700 dark:bg-violet-900/50 dark:text-violet-300",
  Nutrition: "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300",
  Medical: "bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-300",
  Rest: "bg-slate-100 text-slate-700 dark:bg-slate-900/50 dark:text-slate-300",
};

const RESOURCE_TYPE_COLORS: Record<string, string> = {
  Hotline: "bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-300",
  Guide: "bg-msbm-red/10 text-msbm-red dark:bg-msbm-red/20 dark:text-msbm-red-bright",
  Schedule: "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300",
  Article: "bg-violet-100 text-violet-700 dark:bg-violet-900/50 dark:text-violet-300",
};

const RESOURCE_CATEGORY_COLORS: Record<string, string> = {
  "Mental Health": "bg-rose-50 text-rose-600 dark:bg-rose-950/30 dark:text-rose-400",
  "Physical Health": "bg-msbm-red/5 text-msbm-red dark:bg-[#4a0a10]/30 dark:text-msbm-red-bright",
  Nutrition: "bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400",
  Workplace: "bg-violet-50 text-violet-600 dark:bg-violet-950/30 dark:text-violet-400",
};


const WELLNESS_TIPS = [
  { icon: Droplets, text: "Stay hydrated — aim for 8 glasses of water daily to boost energy and focus.", color: "text-cyan-500" },
  { icon: Brain, text: "Take a 5-minute mindfulness break every 2 hours to reduce stress levels.", color: "text-violet-500" },
  { icon: Heart, text: "A 20-minute walk can improve your mood for up to 12 hours.", color: "text-rose-500" },
  { icon: Apple, text: "Eating a balanced breakfast improves cognitive performance by 20%.", color: "text-amber-500" },
  { icon: Moon, text: "Consistent sleep schedules are more important than total sleep hours.", color: "text-slate-500" },
  { icon: Dumbbell, text: "Even light stretching during breaks helps prevent muscle tension.", color: "text-msbm-red" },
];

const WEEKLY_TREND = [65, 72, 68, 78, 74, 80, 78];
const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

// ─── Helper Functions ──────────────────────────────────────────────

function formatDate(dateStr: string): string {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatDateShort(dateStr: string): string {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

// ─── SVG Progress Ring ─────────────────────────────────────────────

function ProgressRing({ score, size = 120, strokeWidth = 10, strokeClass = "stroke-msbm-red" }: { score: number; size?: number; strokeWidth?: number; strokeClass?: string }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <circle cx={size / 2} cy={size / 2} r={radius} stroke="currentColor" strokeWidth={strokeWidth} fill="none" className="text-muted/30" />
      <circle cx={size / 2} cy={size / 2} r={radius} strokeWidth={strokeWidth} fill="none" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset} className={`transition-all duration-700 ${strokeClass}`} />
    </svg>
  );
}

function MiniProgressRing({ score, label, colorClass, textClass }: { score: number; label: string; colorClass: string; textClass: string }) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="relative">
        <ProgressRing score={score} size={56} strokeWidth={6} strokeClass={colorClass} />
        <span className={`absolute inset-0 flex items-center justify-center text-xs font-bold ${textClass}`}>{score}</span>
      </div>
      <span className="text-[10px] font-medium text-muted-foreground">{label}</span>
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────

export function WellnessView() {
  const [activeTab, setActiveTab] = useState("health-score");
  const [activityDialogOpen, setActivityDialogOpen] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [newActivity, setNewActivity] = useState({ name: "", category: "Exercise" as ActivityCategory, duration: "", date: "", notes: "" });
  const [selectedMood, setSelectedMood] = useState<MoodType | null>(null);
  const [moods, setMoods] = useState<MoodEntry[]>([]);
  const [activities, setActivities] = useState<WellnessActivity[]>([]);
  const [resources, setResources] = useState<WellnessResource[]>([]);

  // ─── Computed Stats ────────────────────────────────────────────
  const stats = useMemo(() => [
    { label: "Health Score", value: "--/100", icon: HeartPulse, color: "text-msbm-red dark:text-msbm-red-bright", bg: "bg-msbm-red/5 dark:bg-[#4a0a10]/40" },
    { label: "Mood Streak", value: `${moods.length} days`, icon: Flame, color: "text-rose-600 dark:text-rose-400", bg: "bg-rose-50 dark:bg-rose-950/40" },
    { label: "Activities This Week", value: String(activities.length), icon: Activity, color: "text-violet-600 dark:text-violet-400", bg: "bg-violet-50 dark:bg-violet-950/40" },
    { label: "Resources", value: String(resources.length), icon: BookOpen, color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-950/40" },
  ], [moods, activities, resources]);

  // ─── Mood Distribution ────────────────────────────────────────
  const moodDistribution = useMemo(() => {
    const counts: Record<string, number> = {};
    moods.forEach((m) => {
      counts[m.mood] = (counts[m.mood] || 0) + 1;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, []);

  // ─── Filtered Activities ──────────────────────────────────────
  const filteredActivities = useMemo(() => {
    if (categoryFilter === "All") return activities;
    return activities.filter((a) => a.category === categoryFilter);
  }, [categoryFilter, activities]);

  // ─── Random Tips ──────────────────────────────────────────────
  const tips = useMemo(() => {
    const shuffled = [...WELLNESS_TIPS].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 3);
  }, []);

  // ─── Weekly Summary ───────────────────────────────────────────
  const weeklySummary = useMemo(() => ({
    totalActivities: activities.length,
    totalMinutes: activities.reduce((sum, a) => sum + a.duration, 0),
    mostActiveDay: "Wednesday",
  }), []);

  // ─── Handlers ─────────────────────────────────────────────────
  const handleLogMood = () => {
    if (!selectedMood) {
      toast.error("Please select a mood");
      return;
    }
    toast.success("Mood logged!", { description: `Today's mood: ${selectedMood} ${MOOD_EMOJIS[selectedMood].emoji}` });
    setSelectedMood(null);
  };

  const handleLogActivity = () => {
    if (!newActivity.name) {
      toast.error("Please enter an activity name");
      return;
    }
    toast.success("Activity logged!", { description: `"${newActivity.name}" has been recorded.` });
    setActivityDialogOpen(false);
    setNewActivity({ name: "", category: "Exercise", duration: "", date: "", notes: "" });
  };

  // ─── Render ────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Employee Wellness Hub</h1>
          <p className="text-sm text-muted-foreground">Track your health, mood, activities, and wellness resources</p>
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
          <TabsTrigger value="health-score"><HeartPulse className="h-4 w-4 mr-1.5" />Health Score</TabsTrigger>
          <TabsTrigger value="mood-tracker"><SmilePlus className="h-4 w-4 mr-1.5" />Mood Tracker</TabsTrigger>
          <TabsTrigger value="activities"><Dumbbell className="h-4 w-4 mr-1.5" />Activities</TabsTrigger>
          <TabsTrigger value="resources"><BookOpen className="h-4 w-4 mr-1.5" />Resources</TabsTrigger>
        </TabsList>

        {/* ─── Health Score Tab ────────────────────────────────── */}
        <TabsContent value="health-score" className="mt-4 space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Main Score Card */}
            <Card className="lg:col-span-1 card-lift transition-all duration-300">
              <CardContent className="pt-6 flex flex-col items-center text-center">
                <div className="relative">
                  <ProgressRing score={78} size={140} strokeWidth={12} strokeClass="stroke-msbm-red" />
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold text-msbm-red dark:text-msbm-red-bright">78</span>
                    <span className="text-[10px] text-muted-foreground">out of 100</span>
                  </div>
                </div>
                <h3 className="text-sm font-semibold mt-4">Overall Wellness Score</h3>
                <p className="text-xs text-muted-foreground mt-1">Last Assessment: 3 days ago</p>
                <Button
                  size="sm"
                  className="mt-4 bg-gradient-to-r from-msbm-red to-inner-blue text-white hover:from-msbm-red-bright hover:to-inner-blue"
                  onClick={() => toast.info("Assessment feature coming soon!")}
                >
                  <Zap className="h-4 w-4 mr-1.5" />Take Assessment
                </Button>
              </CardContent>
            </Card>

            {/* Category Scores + Weekly Trend */}
            <div className="lg:col-span-2 space-y-4">
              {/* Category Scores */}
              <Card className="card-lift transition-all duration-300">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Category Scores</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-around">
                    <MiniProgressRing score={82} label="Physical" colorClass="stroke-msbm-red" textClass="text-msbm-red" />
                    <MiniProgressRing score={71} label="Mental" colorClass="stroke-violet-500" textClass="text-violet-500" />
                    <MiniProgressRing score={85} label="Social" colorClass="stroke-amber-500" textClass="text-amber-500" />
                    <MiniProgressRing score={74} label="Financial" colorClass="stroke-cyan-500" textClass="text-cyan-500" />
                  </div>
                </CardContent>
              </Card>

              {/* Weekly Trend */}
              <Card className="card-lift transition-all duration-300">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-1.5">
                    <TrendingUp className="h-4 w-4 text-msbm-red" />
                    Weekly Trend
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-end justify-between gap-2 h-32">
                    {WEEKLY_TREND.map((val, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                        <span className="text-[10px] font-medium text-muted-foreground">{val}</span>
                        <div
                          className={`w-full rounded-t-md bg-gradient-to-t from-msbm-red to-inner-blue transition-all duration-500 min-h-[4px] h-[${Math.round((val / 100) * 100)}%]`}
                        />
                        <span className="text-[10px] text-muted-foreground">{DAY_LABELS[i]}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Tips Card */}
              <Card className="card-gradient-msbm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-1.5">
                    <Zap className="h-4 w-4 text-amber-500" />
                    Wellness Tips
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {tips.map((tip, i) => {
                      const TipIcon = tip.icon;
                      return (
                        <div key={i} className="flex items-start gap-2.5">
                          <TipIcon className={`h-4 w-4 mt-0.5 shrink-0 ${tip.color}`} />
                          <p className="text-xs text-muted-foreground leading-relaxed">{tip.text}</p>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* ─── Mood Tracker Tab ────────────────────────────────── */}
        <TabsContent value="mood-tracker" className="mt-4 space-y-4">
          {/* Streak + Log Mood */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="card-lift transition-all duration-300">
              <CardContent className="pt-6 text-center">
                <div className="text-4xl mb-2">🔥</div>
                <p className="text-2xl font-bold">12 day logging streak</p>
                <p className="text-xs text-muted-foreground mt-1">Keep it going! Your consistency is paying off.</p>
              </CardContent>
            </Card>

            <Card className="card-lift transition-all duration-300">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Log Today&apos;s Mood</CardTitle>
                <CardDescription>Select how you&apos;re feeling right now</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2 mb-4">
                  {(Object.entries(MOOD_EMOJIS) as [MoodType, { emoji: string; color: string }][]).map(([mood, cfg]) => (
                    <button
                      key={mood}
                      onClick={() => setSelectedMood(mood)}
                      className={`flex flex-col items-center gap-1 p-2.5 rounded-xl transition-all duration-200 border-2 ${
                        selectedMood === mood
                          ? "border-msbm-red bg-msbm-red/5 dark:bg-[#4a0a10]/30 scale-105"
                          : "border-transparent hover:border-muted-foreground/20 hover:bg-muted/50"
                      }`}
                    >
                      <span className="text-2xl">{cfg.emoji}</span>
                      <span className="text-[10px] font-medium">{mood}</span>
                    </button>
                  ))}
                </div>
                <Button
                  onClick={handleLogMood}
                  disabled={!selectedMood}
                  className="w-full bg-gradient-to-r from-msbm-red to-inner-blue text-white hover:from-msbm-red-bright hover:to-inner-blue"
                >
                  <SmilePlus className="h-4 w-4 mr-1.5" />Log Mood
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Mood History */}
          <Card className="card-lift transition-all duration-300">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Past 14 Days</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {moods.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No mood entries yet. Start logging today!</p>}
                {moods.map((entry) => {
                  const cfg = MOOD_EMOJIS[entry.mood];
                  return (
                    <div key={entry.id} className="flex flex-col items-center gap-1 min-w-[3.5rem]">
                      <span className="text-xl">{cfg.emoji}</span>
                      <span className="text-[9px] text-muted-foreground whitespace-nowrap">{formatDateShort(entry.date)}</span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Mood Distribution */}
          <Card className="card-lift transition-all duration-300">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Mood Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2.5">
                {moodDistribution.map(([mood, count]) => {
                  const cfg = MOOD_EMOJIS[mood as MoodType];
                  const pct = moods.length > 0 ? Math.round((count / moods.length) * 100) : 0;
                  return (
                    <div key={mood} className="flex items-center gap-3">
                      <span className="text-lg w-7 text-center">{cfg.emoji}</span>
                      <span className="text-xs font-medium w-16">{mood}</span>
                      <div className="flex-1 h-4 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full bg-gradient-to-r from-msbm-red to-inner-blue transition-all duration-500 w-[${pct}%]`}
                        />
                      </div>
                      <span className="text-[10px] text-muted-foreground w-10 text-right">{count} ({pct}%)</span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── Activities Tab ──────────────────────────────────── */}
        <TabsContent value="activities" className="mt-4 space-y-4">
          {/* Summary Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="stat-card-msbm">
              <div className="flex items-center gap-3">
                <Activity className="h-5 w-5 text-msbm-red dark:text-msbm-red-bright" />
                <div>
                  <p className="text-xl font-bold">{weeklySummary.totalActivities}</p>
                  <p className="text-[11px] text-muted-foreground">Total Activities</p>
                </div>
              </div>
            </Card>
            <Card className="stat-card-amber">
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                <div>
                  <p className="text-xl font-bold">{weeklySummary.totalMinutes} min</p>
                  <p className="text-[11px] text-muted-foreground">Total Minutes</p>
                </div>
              </div>
            </Card>
            <Card className="stat-card-violet">
              <div className="flex items-center gap-3">
                <CalendarDays className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                <div>
                  <p className="text-xl font-bold">{weeklySummary.mostActiveDay}</p>
                  <p className="text-[11px] text-muted-foreground">Most Active Day</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Category Filter + Log Button */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex flex-wrap gap-1.5">
              {["All", "Exercise", "Mindfulness", "Nutrition", "Medical", "Rest"].map((cat) => (
                <Button
                  key={cat}
                  variant={categoryFilter === cat ? "default" : "outline"}
                  size="sm"
                  className={`text-xs h-7 ${categoryFilter === cat ? "bg-gradient-to-r from-msbm-red to-inner-blue text-white" : ""}`}
                  onClick={() => setCategoryFilter(cat)}
                >
                  {cat}
                </Button>
              ))}
            </div>
            <Button
              size="sm"
              className="bg-gradient-to-r from-msbm-red to-inner-blue text-white hover:from-msbm-red-bright hover:to-inner-blue sm:ml-auto"
              onClick={() => setActivityDialogOpen(true)}
            >
              <Plus className="h-4 w-4 mr-1.5" />Log Activity
            </Button>
          </div>

          {/* Activities List */}
          <ScrollArea className="max-h-[500px]">
            <div className="space-y-2 pr-2">
              {filteredActivities.map((activity) => {
                const CatIcon = CATEGORY_ICONS[activity.category];
                return (
                  <Card key={activity.id} className="card-lift transition-all duration-300 hover:border-msbm-red/20 dark:hover:border-msbm-red/40">
                    <CardContent className="py-3">
                      <div className="flex items-center gap-3">
                        <div className={`flex items-center justify-center h-9 w-9 rounded-xl shrink-0 ${CATEGORY_COLORS[activity.category]}`}>
                          <CatIcon className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="text-sm font-semibold">{activity.name}</h4>
                            <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${CATEGORY_COLORS[activity.category]}`}>
                              {activity.category}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                              <CalendarDays className="h-3 w-3" />{formatDate(activity.date)}
                            </span>
                            {activity.duration > 0 && (
                              <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                                <Clock className="h-3 w-3" />{activity.duration} min
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </ScrollArea>
        </TabsContent>

        {/* ─── Resources Tab ───────────────────────────────────── */}
        <TabsContent value="resources" className="mt-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {resources.length === 0 && <p className="text-sm text-muted-foreground text-center py-8 col-span-full">No wellness resources available yet.</p>}
            {resources.map((resource) => {
              const ResIcon = resource.icon;
              return (
                <Card key={resource.id} className="card-lift transition-all duration-300 hover:border-msbm-red/20 dark:hover:border-msbm-red/40 group">
                  <CardContent className="pt-4">
                    <div className="flex items-start gap-3">
                      <div className={`flex items-center justify-center h-10 w-10 rounded-xl shrink-0 ${RESOURCE_TYPE_COLORS[resource.type]}`}>
                        <ResIcon className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <h4 className="text-sm font-semibold">{resource.title}</h4>
                          <ExternalLink className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <div className="flex items-center gap-1.5 mb-2">
                          <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${RESOURCE_TYPE_COLORS[resource.type]}`}>
                            {resource.type}
                          </Badge>
                          <span className={`text-[10px] px-1.5 py-0 rounded-full ${RESOURCE_CATEGORY_COLORS[resource.category]}`}>
                            {resource.category}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">{resource.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>

      {/* ─── Log Activity Dialog ───────────────────────────────── */}
      <Dialog open={activityDialogOpen} onOpenChange={setActivityDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-msbm-red" />
              Log Wellness Activity
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="form-group">
              <Label className="form-label">Activity Name</Label>
              <Input className="form-input-enhanced" placeholder="e.g. Morning Jog" value={newActivity.name} onChange={(e) => setNewActivity((p) => ({ ...p, name: e.target.value }))} />
            </div>
            <div className="form-group">
              <Label className="form-label">Category</Label>
              <Select value={newActivity.category} onValueChange={(v) => setNewActivity((p) => ({ ...p, category: v as ActivityCategory }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Exercise">Exercise</SelectItem>
                  <SelectItem value="Mindfulness">Mindfulness</SelectItem>
                  <SelectItem value="Nutrition">Nutrition</SelectItem>
                  <SelectItem value="Medical">Medical</SelectItem>
                  <SelectItem value="Rest">Rest</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="form-group">
                <Label className="form-label">Duration (min)</Label>
                <Input className="form-input-enhanced" type="number" placeholder="30" value={newActivity.duration} onChange={(e) => setNewActivity((p) => ({ ...p, duration: e.target.value }))} />
              </div>
              <div className="form-group">
                <Label className="form-label">Date</Label>
                <Input className="form-input-enhanced" type="date" value={newActivity.date} onChange={(e) => setNewActivity((p) => ({ ...p, date: e.target.value }))} />
              </div>
            </div>
            <div className="form-group">
              <Label className="form-label">Notes</Label>
              <Textarea placeholder="How did it go?" value={newActivity.notes} onChange={(e) => setNewActivity((p) => ({ ...p, notes: e.target.value }))} className="resize-none" />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setActivityDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleLogActivity} className="bg-gradient-to-r from-msbm-red to-inner-blue text-white hover:from-msbm-red-bright hover:to-inner-blue">
              <Plus className="h-4 w-4 mr-1.5" />Log Activity
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
