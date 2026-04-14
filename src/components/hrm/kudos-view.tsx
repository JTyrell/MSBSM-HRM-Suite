"use client";

import React, { useState, useMemo } from "react";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Star,
  Heart,
  Trophy,
  TrendingUp,
  TrendingDown,
  Minus,
  Send,
  Flame,
  Sparkles,
  Award,
  Crown,
  Medal,
  ThumbsUp,
  Target,
  Handshake,
  Palette,
  Zap,
  Users,
  Calendar,
  ChevronUp,
  MessageSquareHeart,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────
interface KudosEntry {
  id: string;
  sender: { name: string; initials: string };
  recipient: { name: string; initials: string };
  type: KudosType;
  title: string;
  message: string;
  timestamp: string;
  likes: number;
  companyValue?: string;
  liked?: boolean;
}

type KudosType = {
  emoji: string;
  label: string;
  color: string;
  bgColor: string;
  icon: React.ElementType;
};

interface LeaderboardEntry {
  rank: number;
  name: string;
  initials: string;
  count: number;
  department: string;
  trend: "up" | "down" | "same";
}

// ─── Kudos Types Config ───────────────────────────────────────────
const KUDOS_TYPES: Record<string, KudosType> = {
  star: { emoji: "🌟", label: "Star Performer", color: "text-amber-600 dark:text-amber-400", bgColor: "bg-amber-50 dark:bg-amber-950/30", icon: Star },
  team: { emoji: "💪", label: "Team Player", color: "text-emerald-600 dark:text-emerald-400", bgColor: "bg-emerald-50 dark:bg-emerald-950/30", icon: Heart },
  goal: { emoji: "🎯", label: "Goal Crusher", color: "text-rose-600 dark:text-rose-400", bgColor: "bg-rose-50 dark:bg-rose-950/30", icon: Target },
  helpful: { emoji: "🤝", label: "Helpful Hero", color: "text-teal-600 dark:text-teal-400", bgColor: "bg-teal-50 dark:bg-teal-950/30", icon: Handshake },
  creative: { emoji: "🎨", label: "Creative Spark", color: "text-violet-600 dark:text-violet-400", bgColor: "bg-violet-50 dark:bg-violet-950/30", icon: Palette },
  above: { emoji: "🔥", label: "Going Above & Beyond", color: "text-orange-600 dark:text-orange-400", bgColor: "bg-orange-50 dark:bg-orange-950/30", icon: Flame },
};

const COMPANY_VALUES = ["Innovation", "Excellence", "Collaboration", "Integrity", "Service"];

const EMPLOYEE_NAMES = [
  "Dr. Sarah Chen", "Mark Williams", "Lisa Park", "James Rodriguez",
  "Aisha Johnson", "Tom Baker", "Nina Patel", "David Kim",
  "Rachel Foster", "Carlos Mendez", "Emily Watson", "Omar Hassan",
];

const DEPARTMENTS = ["Engineering", "HR", "Marketing", "Finance", "Operations", "Sales"];

// ─── Mock Kudos Feed ──────────────────────────────────────────────
const MOCK_KUDOS: KudosEntry[] = [
  { id: "k1", sender: { name: "Mark Williams", initials: "MW" }, recipient: { name: "Dr. Sarah Chen", initials: "SC" }, type: KUDOS_TYPES.star, title: "Outstanding Research Presentation", message: "Your Q2 presentation was phenomenal! The data visualization and analysis were top-notch. Really raised the bar for the team.", timestamp: "2h ago", likes: 18, companyValue: "Excellence" },
  { id: "k2", sender: { name: "Lisa Park", initials: "LP" }, recipient: { name: "James Rodriguez", initials: "JR" }, type: KUDOS_TYPES.team, title: "Amazing Collaboration on Project Alpha", message: "You went above and beyond to help the team meet the deadline. Your willingness to stay late and support others is truly appreciated!", timestamp: "3h ago", likes: 24, companyValue: "Collaboration" },
  { id: "k3", sender: { name: "Aisha Johnson", initials: "AJ" }, recipient: { name: "Nina Patel", initials: "NP" }, type: KUDOS_TYPES.goal, title: "Crushed the Revenue Target!", message: "You exceeded the monthly revenue target by 35%! Your strategic approach to client acquisition is a game-changer.", timestamp: "5h ago", likes: 32, companyValue: "Excellence" },
  { id: "k4", sender: { name: "Tom Baker", initials: "TB" }, recipient: { name: "Rachel Foster", initials: "RF" }, type: KUDOS_TYPES.helpful, title: "Mentorship Excellence", message: "Thank you for the incredible guidance during my onboarding. Your patience and willingness to share knowledge made all the difference!", timestamp: "8h ago", likes: 15, companyValue: "Service" },
  { id: "k5", sender: { name: "David Kim", initials: "DK" }, recipient: { name: "Carlos Mendez", initials: "CM" }, type: KUDOS_TYPES.creative, title: "Brilliant Design Solution", message: "Your creative approach to the UX redesign solved a problem we've been stuck on for months. Pure genius!", timestamp: "1d ago", likes: 27, companyValue: "Innovation" },
  { id: "k6", sender: { name: "Emily Watson", initials: "EW" }, recipient: { name: "Omar Hassan", initials: "OH" }, type: KUDOS_TYPES.above, title: "Weekend War Hero", message: "You came in on Saturday to fix the critical production issue and saved the client demo on Monday. True dedication!", timestamp: "1d ago", likes: 41, companyValue: "Integrity" },
  { id: "k7", sender: { name: "Dr. Sarah Chen", initials: "SC" }, recipient: { name: "Mark Williams", initials: "MW" }, type: KUDOS_TYPES.star, title: "Technical Leadership", message: "Your architecture proposal for the new microservices migration was brilliant. Clear, thorough, and forward-thinking.", timestamp: "2d ago", likes: 19, companyValue: "Innovation" },
  { id: "k8", sender: { name: "James Rodriguez", initials: "JR" }, recipient: { name: "Lisa Park", initials: "LP" }, type: KUDOS_TYPES.team, title: "Cross-Team Champion", message: "You seamlessly coordinated between 4 departments for the product launch. Your organizational skills are unmatched!", timestamp: "2d ago", likes: 22, companyValue: "Collaboration" },
  { id: "k9", sender: { name: "Nina Patel", initials: "NP" }, recipient: { name: "Aisha Johnson", initials: "AJ" }, type: KUDOS_TYPES.goal, title: "Sprint Velocity Record", message: "You completed 48 story points this sprint, breaking the team record! Your focus and efficiency are inspiring.", timestamp: "3d ago", likes: 29, companyValue: "Excellence" },
  { id: "k10", sender: { name: "Carlos Mendez", initials: "CM" }, recipient: { name: "Emily Watson", initials: "EW" }, type: KUDOS_TYPES.helpful, title: "Knowledge Sharing Star", message: "Your Lunch & Learn session on React patterns was incredibly valuable. The whole team benefited from your expertise!", timestamp: "3d ago", likes: 16, companyValue: "Service" },
  { id: "k11", sender: { name: "Rachel Foster", initials: "RF" }, recipient: { name: "David Kim", initials: "DK" }, type: KUDOS_TYPES.creative, title: "Innovative Solution Award", message: "Your hackathon project solving the data pipeline issue was incredibly creative. Already being implemented in production!", timestamp: "4d ago", likes: 35, companyValue: "Innovation" },
  { id: "k12", sender: { name: "Omar Hassan", initials: "OH" }, recipient: { name: "Tom Baker", initials: "TB" }, type: KUDOS_TYPES.above, title: "Client Relations Master", message: "The client specifically requested to work with you again after your exceptional presentation. You represent our values perfectly!", timestamp: "4d ago", likes: 26, companyValue: "Excellence" },
];

// ─── Mock Leaderboard ─────────────────────────────────────────────
const TOP_SENDERS: LeaderboardEntry[] = [
  { rank: 1, name: "Lisa Park", initials: "LP", count: 42, department: "Marketing", trend: "up" },
  { rank: 2, name: "Mark Williams", initials: "MW", count: 38, department: "Engineering", trend: "up" },
  { rank: 3, name: "Dr. Sarah Chen", initials: "SC", count: 35, department: "Engineering", trend: "same" },
  { rank: 4, name: "Tom Baker", initials: "TB", count: 29, department: "HR", trend: "down" },
  { rank: 5, name: "Emily Watson", initials: "EW", count: 27, department: "Sales", trend: "up" },
  { rank: 6, name: "Aisha Johnson", initials: "AJ", count: 24, department: "Finance", trend: "up" },
  { rank: 7, name: "David Kim", initials: "DK", count: 21, department: "Engineering", trend: "same" },
  { rank: 8, name: "James Rodriguez", initials: "JR", count: 18, department: "Operations", trend: "down" },
  { rank: 9, name: "Rachel Foster", initials: "RF", count: 15, department: "Marketing", trend: "up" },
  { rank: 10, name: "Nina Patel", initials: "NP", count: 12, department: "HR", trend: "same" },
];

const TOP_RECIPIENTS: LeaderboardEntry[] = [
  { rank: 1, name: "Omar Hassan", initials: "OH", count: 47, department: "Engineering", trend: "up" },
  { rank: 2, name: "Dr. Sarah Chen", initials: "SC", count: 41, department: "Engineering", trend: "up" },
  { rank: 3, name: "Mark Williams", initials: "MW", count: 36, department: "Engineering", trend: "same" },
  { rank: 4, name: "Emily Watson", initials: "EW", count: 32, department: "Sales", trend: "up" },
  { rank: 5, name: "Lisa Park", initials: "LP", count: 28, department: "Marketing", trend: "down" },
  { rank: 6, name: "Carlos Mendez", initials: "CM", count: 25, department: "Operations", trend: "up" },
  { rank: 7, name: "Aisha Johnson", initials: "AJ", count: 23, department: "Finance", trend: "same" },
  { rank: 8, name: "David Kim", initials: "DK", count: 20, department: "Engineering", trend: "down" },
  { rank: 9, name: "James Rodriguez", initials: "JR", count: 17, department: "Operations", trend: "up" },
  { rank: 10, name: "Rachel Foster", initials: "RF", count: 14, department: "Marketing", trend: "same" },
];

// ─── Component ────────────────────────────────────────────────────
export function KudosView() {
  const [activeTab, setActiveTab] = useState("give");
  const [kudosFeed, setKudosFeed] = useState<KudosEntry[]>(MOCK_KUDOS);
  const [selectedType, setSelectedType] = useState("star");
  const [recipient, setRecipient] = useState("");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [companyValue, setCompanyValue] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("current");
  const [departmentFilter, setDepartmentFilter] = useState("all");

  // ─── Computed ──────────────────────────────────────────────────
  const wallOfFame = useMemo(() => {
    let filtered = [...MOCK_KUDOS].sort((a, b) => b.likes - a.likes).slice(0, 12);
    return filtered;
  }, []);

  const rankBadge = (rank: number) => {
    if (rank === 1) return <span className="flex items-center justify-center h-7 w-7 rounded-full text-xs font-bold" style={{ backgroundColor: "#FFD700", color: "#7C5800" }}><Crown className="h-3.5 w-3.5" /></span>;
    if (rank === 2) return <span className="flex items-center justify-center h-7 w-7 rounded-full text-xs font-bold" style={{ backgroundColor: "#C0C0C0", color: "#4A4A4A" }}><Medal className="h-3.5 w-3.5" /></span>;
    if (rank === 3) return <span className="flex items-center justify-center h-7 w-7 rounded-full text-xs font-bold" style={{ backgroundColor: "#CD7F32", color: "#FFF" }}><Award className="h-3.5 w-3.5" /></span>;
    return <span className="flex items-center justify-center h-7 w-7 rounded-full text-xs font-medium bg-muted text-muted-foreground">#{rank}</span>;
  };

  const trendIcon = (trend: string) => {
    if (trend === "up") return <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />;
    if (trend === "down") return <TrendingDown className="h-3.5 w-3.5 text-red-500" />;
    return <Minus className="h-3.5 w-3.5 text-muted-foreground" />;
  };

  const avatarColors = ["from-emerald-400 to-teal-500", "from-amber-400 to-orange-500", "from-violet-400 to-purple-500", "from-rose-400 to-pink-500", "from-cyan-400 to-blue-500", "from-teal-400 to-emerald-500"];

  const getAvatarGradient = (name: string) => {
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return avatarColors[Math.abs(hash) % avatarColors.length];
  };

  const handleSendKudos = () => {
    if (!recipient || !title || !message) {
      toast.error("Please fill in recipient, title, and message");
      return;
    }
    const type = KUDOS_TYPES[selectedType];
    const recipientParts = recipient.split(" ");
    const newKudos: KudosEntry = {
      id: `k-${Date.now()}`,
      sender: { name: "You", initials: "YO" },
      recipient: { name: recipient, initials: `${recipientParts[0]?.[0] || ""}${recipientParts[1]?.[0] || ""}` },
      type,
      title,
      message,
      timestamp: "Just now",
      likes: 0,
      companyValue: companyValue || undefined,
      liked: false,
    };
    setKudosFeed((prev) => [newKudos, ...prev]);
    setRecipient("");
    setTitle("");
    setMessage("");
    setCompanyValue("");
    toast.success("Kudos sent! 🎉", { description: `${type.emoji} ${recipient} will be notified.` });
  };

  const likeKudos = (id: string) => {
    setKudosFeed((prev) => prev.map((k) =>
      k.id === id ? { ...k, likes: k.liked ? k.likes - 1 : k.likes + 1, liked: !k.liked } : k
    ));
  };

  // ─── Stats ──────────────────────────────────────────────────────
  const stats = [
    { label: "Total Kudos Given", value: 247, icon: Star, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-950/40" },
    { label: "This Month", value: 34, icon: TrendingUp, color: "text-teal-600 dark:text-teal-400", bg: "bg-teal-50 dark:bg-teal-950/40" },
    { label: "Unique Participants", value: 89, icon: Users, color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-950/40" },
    { label: "Streak", value: "12 days", icon: Flame, color: "text-rose-600 dark:text-rose-400", bg: "bg-rose-50 dark:bg-rose-950/40" },
  ];

  // ─── Render ─────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Employee Kudos</h1>
          <p className="text-sm text-muted-foreground">Recognize and celebrate your colleagues&apos; achievements</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MessageSquareHeart className="h-4 w-4 text-emerald-500" />
          <span>Building a culture of appreciation</span>
        </div>
      </div>

      {/* Stats */}
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
          <TabsTrigger value="give"><Send className="h-4 w-4 mr-1.5" />Give Kudos</TabsTrigger>
          <TabsTrigger value="fame"><Trophy className="h-4 w-4 mr-1.5" />Wall of Fame</TabsTrigger>
          <TabsTrigger value="leaderboard"><Award className="h-4 w-4 mr-1.5" />Leaderboard</TabsTrigger>
        </TabsList>

        {/* ─── Give Kudos Tab ──────────────────────────────────── */}
        <TabsContent value="give" className="mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Send Kudos Form */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-emerald-500" />
                  Send Kudos
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Kudos Type</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(KUDOS_TYPES).map(([key, type]) => {
                      const Icon = type.icon;
                      return (
                        <button
                          key={key}
                          onClick={() => setSelectedType(key)}
                          className={`flex items-center gap-2 p-2.5 rounded-lg border text-left text-xs font-medium transition-all cursor-pointer ${
                            selectedType === key
                              ? `border-emerald-300 dark:border-emerald-700 ${type.bgColor} ${type.color} shadow-sm`
                              : "border-border hover:border-emerald-200 dark:hover:border-emerald-800"
                          }`}
                        >
                          <span className="text-base">{type.emoji}</span>
                          <span className="truncate">{type.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Recipient *</Label>
                  <Select value={recipient} onValueChange={setRecipient}>
                    <SelectTrigger><SelectValue placeholder="Select a colleague" /></SelectTrigger>
                    <SelectContent>
                      {EMPLOYEE_NAMES.map((name) => <SelectItem key={name} value={name}>{name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Title *</Label>
                  <Input placeholder="e.g. Outstanding Presentation" value={title} onChange={(e) => setTitle(e.target.value)} />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Message *</Label>
                    <span className={`text-[10px] ${message.length > 280 ? "text-red-500" : "text-muted-foreground"}`}>{message.length}/280</span>
                  </div>
                  <Textarea placeholder="Tell them why they're amazing..." value={message} onChange={(e) => setMessage(e.target.value.slice(0, 280))} className="resize-none" rows={3} />
                </div>

                <div className="space-y-2">
                  <Label>Company Value (Optional)</Label>
                  <Select value={companyValue} onValueChange={setCompanyValue}>
                    <SelectTrigger><SelectValue placeholder="Align to a value" /></SelectTrigger>
                    <SelectContent>
                      {COMPANY_VALUES.map((v) => <SelectItem key={v} value={v}>{v}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                <Button onClick={handleSendKudos} className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:from-emerald-600 hover:to-teal-700">
                  <Send className="h-4 w-4 mr-2" />Send Kudos
                </Button>
              </CardContent>
            </Card>

            {/* Recent Feed */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Heart className="h-4 w-4 text-rose-500" />
                  Recent Kudos
                </CardTitle>
                <CardDescription>See what your colleagues are celebrating</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-h-[600px] overflow-y-auto">
                  {kudosFeed.map((kudos) => (
                    <div key={kudos.id} className="group p-4 rounded-xl border hover:bg-accent/30 transition-all">
                      <div className="flex items-start gap-3">
                        <Avatar className="h-9 w-9 shrink-0">
                          <AvatarFallback className={`bg-gradient-to-br ${getAvatarGradient(kudos.sender.name)} text-white text-xs font-semibold`}>
                            {kudos.sender.initials}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-medium">{kudos.sender.name}</span>
                            <span className="text-xs text-muted-foreground">→</span>
                            <span className="text-sm font-medium text-emerald-700 dark:text-emerald-400">{kudos.recipient.name}</span>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className={`text-[10px] px-1.5 py-0 border-0 ${kudos.type.bgColor} ${kudos.type.color}`}>
                              {kudos.type.emoji} {kudos.type.label}
                            </Badge>
                            {kudos.companyValue && (
                              <Badge variant="outline" className="text-[10px] px-1.5 py-0 text-muted-foreground">
                                {kudos.companyValue}
                              </Badge>
                            )}
                            <span className="text-[10px] text-muted-foreground ml-auto">{kudos.timestamp}</span>
                          </div>
                          <p className="text-sm font-medium mt-1.5">{kudos.title}</p>
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{kudos.message}</p>
                          <button
                            onClick={() => likeKudos(kudos.id)}
                            className={`flex items-center gap-1.5 mt-2 text-xs transition-colors cursor-pointer ${
                              kudos.liked ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground hover:text-emerald-600 dark:hover:text-emerald-400"
                            }`}
                          >
                            <ThumbsUp className={`h-3.5 w-3.5 ${kudos.liked ? "fill-emerald-500" : ""}`} />
                            <span>{kudos.likes + (kudos.liked ? 0 : 0)}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ─── Wall of Fame Tab ────────────────────────────────── */}
        <TabsContent value="fame" className="mt-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="w-full sm:w-48"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="current">This Month</SelectItem>
                <SelectItem value="last">Last Month</SelectItem>
                <SelectItem value="two-ago">2 Months Ago</SelectItem>
              </SelectContent>
            </Select>
            <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
              <SelectTrigger className="w-full sm:w-48"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {DEPARTMENTS.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {wallOfFame.map((kudos, idx) => {
              const gradients = [
                "from-emerald-500/20 to-teal-500/20",
                "from-amber-500/20 to-orange-500/20",
                "from-violet-500/20 to-purple-500/20",
                "from-rose-500/20 to-pink-500/20",
                "from-cyan-500/20 to-blue-500/20",
                "from-teal-500/20 to-emerald-500/20",
              ];
              return (
                <Card key={kudos.id} className={`glass-card-enhanced overflow-hidden group card-lift transition-all duration-300`}>
                  <div className={`h-1.5 bg-gradient-to-r ${gradients[idx % gradients.length]}`} />
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="flex items-center -space-x-2">
                        <Avatar className="h-9 w-9 border-2 border-background">
                          <AvatarFallback className={`bg-gradient-to-br ${getAvatarGradient(kudos.sender.name)} text-white text-xs font-semibold`}>
                            {kudos.sender.initials}
                          </AvatarFallback>
                        </Avatar>
                        <Avatar className="h-9 w-9 border-2 border-background">
                          <AvatarFallback className={`bg-gradient-to-br ${getAvatarGradient(kudos.recipient.name)} text-white text-xs font-semibold`}>
                            {kudos.recipient.initials}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-muted-foreground">
                          <span className="font-medium text-foreground">{kudos.sender.name}</span> → <span className="font-medium text-emerald-600 dark:text-emerald-400">{kudos.recipient.name}</span>
                        </p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-sm">{kudos.type.emoji}</span>
                          <Badge variant="outline" className={`text-[10px] px-1.5 py-0 border-0 ${kudos.type.bgColor} ${kudos.type.color}`}>{kudos.type.label}</Badge>
                        </div>
                      </div>
                    </div>
                    <h3 className="text-sm font-semibold mb-1">{kudos.title}</h3>
                    <p className="text-xs text-muted-foreground line-clamp-3">{kudos.message}</p>
                    <div className="flex items-center justify-between mt-3 pt-2 border-t border-border/50">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <ThumbsUp className="h-3 w-3" />
                        <span className="font-medium">{kudos.likes}</span>
                      </div>
                      <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3 w-3" />{kudos.timestamp}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* ─── Leaderboard Tab ─────────────────────────────────── */}
        <TabsContent value="leaderboard" className="mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Most Appreciative (Senders) */}
            <Card className="card-lift">
              <CardHeader>
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Send className="h-4 w-4 text-emerald-500" />
                  Most Appreciative
                </CardTitle>
                <CardDescription>Top kudos senders this month</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {TOP_SENDERS.map((entry) => (
                    <div key={entry.rank} className={`flex items-center gap-3 p-3 rounded-xl transition-colors hover:bg-accent/30 ${entry.rank <= 3 ? "bg-gradient-to-r from-amber-50/50 to-transparent dark:from-amber-950/10 dark:to-transparent" : ""}`}>
                      {rankBadge(entry.rank)}
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className={`bg-gradient-to-br ${getAvatarGradient(entry.name)} text-white text-xs font-semibold`}>
                          {entry.initials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{entry.name}</p>
                        <p className="text-[10px] text-muted-foreground">{entry.department}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold">{entry.count}</span>
                        {trendIcon(entry.trend)}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Most Recognized (Recipients) */}
            <Card className="card-lift">
              <CardHeader>
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-amber-500" />
                  Most Recognized
                </CardTitle>
                <CardDescription>Top kudos recipients this month</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {TOP_RECIPIENTS.map((entry) => (
                    <div key={entry.rank} className={`flex items-center gap-3 p-3 rounded-xl transition-colors hover:bg-accent/30 ${entry.rank <= 3 ? "bg-gradient-to-r from-amber-50/50 to-transparent dark:from-amber-950/10 dark:to-transparent" : ""}`}>
                      {rankBadge(entry.rank)}
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className={`bg-gradient-to-br ${getAvatarGradient(entry.name)} text-white text-xs font-semibold`}>
                          {entry.initials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{entry.name}</p>
                        <p className="text-[10px] text-muted-foreground">{entry.department}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold">{entry.count}</span>
                        {trendIcon(entry.trend)}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
