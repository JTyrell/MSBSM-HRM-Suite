"use client";

import React, { useState } from "react";
import { toast } from "sonner";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
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
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";

import {
  Heart,
  Shield,
  Stethoscope,
  GraduationCap,
  Home,
  Umbrella,
  Baby,
  Dumbbell,
  Plane,
  Coffee,
  Gift,
  DollarSign,
  CheckCircle2,
  ChevronRight,
  Eye,
  Calendar,
  Users,
  TrendingUp,
  Download,
  FileText,
  MessageSquare,
  Clock,
  Plus,
  Sparkles,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

// ============ TYPES ============

interface BenefitItem {
  id: string;
  category: string;
  name: string;
  icon: LucideIcon;
  status: "enrolled" | "available" | "waived";
  provider?: string;
  details: string;
  value: string;
  subDetails?: string[];
}

interface EnrollmentEvent {
  date: string;
  label: string;
  description: string;
  isCurrent?: boolean;
}

interface HealthScore {
  label: string;
  score: number;
  color: string;
}

interface PTOEntry {
  type: string;
  total: number;
  used: number;
  color: string;
}

// ============ DEMO DATA ============

const BENEFITS_DATA: BenefitItem[] = [
  // Health & Medical
  {
    id: "medical",
    category: "health",
    name: "Medical Insurance",
    icon: Heart,
    status: "enrolled",
    provider: "PPO Plan",
    details: "$500 deductible, 80/20 coinsurance",
    value: "$1,200/mo employer contribution",
    subDetails: ["In-network: $25 copay", "Out-of-network: 80/20 after deductible", "Prescription: $10/$30/$60 tiered"],
  },
  {
    id: "dental",
    category: "health",
    name: "Dental Insurance",
    icon: Stethoscope,
    status: "enrolled",
    provider: "Delta Dental",
    details: "$2,000 annual maximum",
    value: "100% preventive, 80% basic",
    subDetails: ["Preventive: 100% covered", "Basic: 80% covered", "Major: 50% covered", "$50 deductible"],
  },
  {
    id: "vision",
    category: "health",
    name: "Vision Insurance",
    icon: Eye,
    status: "enrolled",
    provider: "VSP Choice",
    details: "$200 frames allowance",
    value: "Annual eye exam included",
    subDetails: ["Exam: $10 copay", "Frames: $200 allowance", "Contacts: $150 allowance", "Lenses: $80 allowance"],
  },
  {
    id: "life",
    category: "health",
    name: "Life Insurance",
    icon: Shield,
    status: "enrolled",
    provider: "MetLife",
    details: "$50,000 coverage",
    value: "Employer-paid",
    subDetails: ["1x salary base coverage", "Supplemental available", "AD&D included"],
  },
  // Financial & Retirement
  {
    id: "401k",
    category: "financial",
    name: "401(k) Plan",
    icon: TrendingUp,
    status: "enrolled",
    provider: "Fidelity",
    details: "6% employer match",
    value: "$45,230 current balance",
    subDetails: ["Vested: 80%", "Employer match: up to 6%", "Auto-escalation: 1%/yr", "Roth option available"],
  },
  {
    id: "hsa",
    category: "financial",
    name: "Health Savings Account",
    icon: DollarSign,
    status: "enrolled",
    provider: "HSA Bank",
    details: "$3,850/yr contribution limit",
    value: "$2,100 current balance",
    subDetails: ["Triple tax advantage", "Employer seed: $500/yr", "Investment option available"],
  },
  {
    id: "fsa",
    category: "financial",
    name: "Flexible Spending",
    icon: DollarSign,
    status: "enrolled",
    provider: "WageWorks",
    details: "$2,750/yr contribution limit",
    value: "$1,200 used this year",
    subDetails: ["Use-it-or-lose-it", "Eligible: medical, dental, vision", "Dependent care FSA available"],
  },
  {
    id: "stock",
    category: "financial",
    name: "Stock Options (RSU)",
    icon: TrendingUp,
    status: "enrolled",
    provider: "E*TRADE",
    details: "RSU vesting schedule",
    value: "25 shares next vest Dec 2026",
    subDetails: ["4-year vesting schedule", "25% cliff at year 1", "Quarterly vesting after cliff"],
  },
  // Work-Life Balance
  {
    id: "remote",
    category: "worklife",
    name: "Remote Work Policy",
    icon: Home,
    status: "enrolled",
    provider: "Hybrid Model",
    details: "3 days/week remote",
    value: "Tue/Wed/Thu remote days",
    subDetails: ["Office: Mon/Fri", "Home office stipend: $500", "Equipment provided", "Flexible hours: 7am-7pm"],
  },
  {
    id: "parental",
    category: "worklife",
    name: "Parental Leave",
    icon: Baby,
    status: "available",
    provider: "Company Policy",
    details: "12 weeks paid + 4 weeks unpaid",
    value: "100% salary during paid leave",
    subDetails: ["Birth parent: 16 weeks total", "Non-birth parent: 12 weeks", "Returnship program available"],
  },
  {
    id: "eap",
    category: "worklife",
    name: "Employee Assistance Program",
    icon: Umbrella,
    status: "enrolled",
    provider: "ComPsych",
    details: "24/7 confidential counseling",
    value: "8 free sessions per issue",
    subDetails: ["Mental health support", "Financial counseling", "Legal consultation", "Family therapy"],
  },
  // Perks & Extras
  {
    id: "gym",
    category: "perks",
    name: "Gym Membership",
    icon: Dumbbell,
    status: "enrolled",
    provider: "Fitness Stipend",
    details: "$75/month stipend",
    value: "$900/yr benefit",
    subDetails: ["Any gym or fitness app", "ClassPass eligible", "Wellness challenges"],
  },
  {
    id: "education",
    category: "perks",
    name: "Education Reimbursement",
    icon: GraduationCap,
    status: "enrolled",
    provider: "Tuition Assistance",
    details: "$5,250/yr maximum",
    value: "6 courses completed",
    subDetails: ["Degree programs eligible", "Certifications covered", "Grade requirement: B or above"],
  },
  {
    id: "commuter",
    category: "perks",
    name: "Commuter Benefits",
    icon: Plane,
    status: "enrolled",
    provider: "WageWorks Transit",
    details: "$300/month pre-tax transit",
    value: "$3,600/yr tax savings",
    subDetails: ["Pre-tax deduction", "Transit pass included", "Parking available"],
  },
  {
    id: "coffee",
    category: "perks",
    name: "Coffee & Snacks",
    icon: Coffee,
    status: "enrolled",
    provider: "Office Perks",
    details: "Unlimited coffee and snacks",
    value: "Premium break room",
    subDetails: ["Specialty coffee machine", "Healthy snacks daily", "Friday bagels"],
  },
  {
    id: "events",
    category: "perks",
    name: "Team Events",
    icon: Gift,
    status: "enrolled",
    provider: "Team Culture",
    details: "Quarterly events",
    value: "$500 budget per event",
    subDetails: ["Team outings", "Holiday parties", "Volunteer days"],
  },
  {
    id: "referral",
    category: "perks",
    name: "Referral Bonus",
    icon: Gift,
    status: "available",
    provider: "Referral Program",
    details: "$3,000 per successful hire",
    value: "No limit on referrals",
    subDetails: ["Paid after 90 days", "All positions eligible", "Stacks with other bonuses"],
  },
];

const ENROLLMENT_TIMELINE: EnrollmentEvent[] = [
  { date: "Jan 15-31", label: "Open Enrollment", description: "Make benefit changes for the new year", isCurrent: false },
  { date: "Feb 1", label: "Coverage Starts", description: "New benefit elections take effect", isCurrent: false },
  { date: "Jun 15", label: "Mid-Year Change Window", description: "Qualifying life event changes", isCurrent: true },
  { date: "Oct 1", label: "Benefits Review Period", description: "Review current coverage options", isCurrent: false },
  { date: "Dec 15", label: "Annual Enrollment Opens", description: "Preview plans for next year", isCurrent: false },
];

const HEALTH_SCORES: HealthScore[] = [
  { label: "Health", score: 95, color: "#10b981" },
  { label: "Financial", score: 88, color: "#14b8a6" },
  { label: "Work-Life", score: 94, color: "#06b6d4" },
  { label: "Perks", score: 90, color: "#f59e0b" },
];

const PTO_DATA: PTOEntry[] = [
  { type: "Vacation", total: 20, used: 8, color: "#10b981" },
  { type: "Sick", total: 10, used: 3, color: "#f59e0b" },
  { type: "Personal", total: 3, used: 1, color: "#14b8a6" },
  { type: "Floating Holidays", total: 2, used: 0, color: "#06b6d4" },
];

const AVAILABLE_PLANS = [
  { id: "ppo-basic", name: "PPO Basic", cost: "$150/mo employee", deductible: "$1,000", coinsurance: "70/30" },
  { id: "ppo-premium", name: "PPO Premium", cost: "$250/mo employee", deductible: "$500", coinsurance: "80/20" },
  { id: "hmo-standard", name: "HMO Standard", cost: "$100/mo employee", deductible: "$750", coinsurance: "80/20" },
  { id: "hdhp", name: "HDHP + HSA", cost: "$75/mo employee", deductible: "$2,800", coinsurance: "60/40" },
];

// ============ HELPERS ============

function getCategoryIcon(category: string): LucideIcon {
  switch (category) {
    case "health": return Heart;
    case "financial": return DollarSign;
    case "worklife": return Home;
    case "perks": return Gift;
    default: return CheckCircle2;
  }
}

function getCategoryColor(category: string): string {
  switch (category) {
    case "health": return "emerald";
    case "financial": return "teal";
    case "worklife": return "cyan";
    case "perks": return "amber";
    default: return "emerald";
  }
}

// ============ MAIN COMPONENT ============

export function BenefitsView() {
  const [activeTab, setActiveTab] = useState("health");
  const [showEnrollDialog, setShowEnrollDialog] = useState(false);
  const [showClaimDialog, setShowClaimDialog] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState("");
  const [detailView, setDetailView] = useState<BenefitItem | null>(null);

  // Filter benefits by category
  const healthBenefits = BENEFITS_DATA.filter((b) => b.category === "health");
  const financialBenefits = BENEFITS_DATA.filter((b) => b.category === "financial");
  const worklifeBenefits = BENEFITS_DATA.filter((b) => b.category === "worklife");
  const perksBenefits = BENEFITS_DATA.filter((b) => b.category === "perks");

  const enrolledCount = BENEFITS_DATA.filter((b) => b.status === "enrolled").length;

  // SVG Score Ring
  const overallScore = 92;
  const circumference = 2 * Math.PI * 45;
  const offset = circumference - (overallScore / 100) * circumference;

  const handleEnrollSubmit = () => {
    toast.success("Enrollment submitted! Your benefit changes will be processed.");
    setShowEnrollDialog(false);
    setSelectedPlan("");
  };

  const handleClaimSubmit = () => {
    toast.success("Claim filed successfully! You'll receive updates via email.");
    setShowClaimDialog(false);
  };

  const handleDownloadSummary = () => {
    toast.success("Benefits summary CSV downloaded!", {
      description: "Check your downloads folder for benefits-summary.csv",
    });
  };

  const handleContactHR = () => {
    toast.info("Opening HR support channel...", {
      description: "HR team typically responds within 24 hours.",
    });
  };

  // ============ RENDER ============

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            Benefits Hub
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your benefits, enrollments, and coverage all in one place.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 gap-1">
            <CheckCircle2 className="h-3 w-3" />
            {enrolledCount} Active Enrollments
          </Badge>
        </div>
      </div>

      {/* ============ STATS CARDS ============ */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* Total Value */}
        <Card className="border-emerald-100 dark:border-emerald-900/30 overflow-hidden">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-medium">Total Benefits Value</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">$24,500</p>
                <p className="text-[10px] text-muted-foreground">per year</p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <DollarSign className="h-5 w-5 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Active Enrollments */}
        <Card className="border-teal-100 dark:border-teal-900/30 overflow-hidden">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-medium">Active Enrollments</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">{enrolledCount}</p>
                <p className="text-[10px] text-muted-foreground">of 17 available</p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center shadow-lg shadow-teal-500/20">
                <CheckCircle2 className="h-5 w-5 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Monthly Cost */}
        <Card className="border-cyan-100 dark:border-cyan-900/30 overflow-hidden">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-medium">Monthly Cost</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">$1,234</p>
                <p className="text-[10px] text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                  <TrendingUp className="h-3 w-3" /> $342 employer paid
                </p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
                <DollarSign className="h-5 w-5 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Next Enrollment */}
        <Card className="border-amber-100 dark:border-amber-900/30 overflow-hidden">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-medium">Next Enrollment</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">Jan 15</p>
                <p className="text-[10px] text-muted-foreground">2027 Open Enrollment</p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
                <Calendar className="h-5 w-5 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Coverage Score */}
        <Card className="border-emerald-100 dark:border-emerald-900/30 overflow-hidden">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="relative w-12 h-12 shrink-0">
                <svg className="w-12 h-12 -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="8" className="text-emerald-100 dark:text-emerald-900/30" />
                  <circle
                    cx="50" cy="50" r="40" fill="none" stroke="#10b981" strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={2 * Math.PI * 40}
                    strokeDashoffset={2 * Math.PI * 40 * (1 - 92 / 100)}
                    className="transition-all duration-1000"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">92%</span>
                </div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium">Coverage Score</p>
                <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">Excellent</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pending Claims */}
        <Card className="border-rose-100 dark:border-rose-900/30 overflow-hidden">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-medium">Pending Claims</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">2</p>
                <p className="text-[10px] text-amber-600 dark:text-amber-400 flex items-center gap-0.5">
                  <Clock className="h-3 w-3" /> Under review
                </p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-rose-400 to-rose-600 flex items-center justify-center shadow-lg shadow-rose-500/20">
                <FileText className="h-5 w-5 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ============ MAIN CONTENT: TABS + HEALTH SCORE ============ */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Tabs Section */}
        <div className="xl:col-span-3">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid grid-cols-2 sm:grid-cols-4 w-full">
              <TabsTrigger value="health" className="gap-1.5 text-xs sm:text-sm">
                <Heart className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Health</span>
              </TabsTrigger>
              <TabsTrigger value="financial" className="gap-1.5 text-xs sm:text-sm">
                <DollarSign className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Financial</span>
              </TabsTrigger>
              <TabsTrigger value="worklife" className="gap-1.5 text-xs sm:text-sm">
                <Home className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Work-Life</span>
              </TabsTrigger>
              <TabsTrigger value="perks" className="gap-1.5 text-xs sm:text-sm">
                <Gift className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Perks</span>
              </TabsTrigger>
            </TabsList>

            {/* ===== HEALTH TAB ===== */}
            <TabsContent value="health">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {healthBenefits.map((benefit) => {
                  const Icon = benefit.icon;
                  return (
                    <Card
                      key={benefit.id}
                      className="border-emerald-100 dark:border-emerald-900/30 card-hover-lift hover:shadow-md transition-all duration-200 cursor-pointer group card-glow card-elevated card-spotlight glass-card-enhanced"
                      onClick={() => setDetailView(benefit)}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-110 transition-transform">
                              <Icon className="h-5 w-5 text-white" />
                            </div>
                            <div>
                              <CardTitle className="text-sm font-semibold">{benefit.name}</CardTitle>
                              {benefit.provider && (
                                <p className="text-xs text-muted-foreground mt-0.5">{benefit.provider}</p>
                              )}
                            </div>
                          </div>
                          <Badge
                            className={
                              benefit.status === "enrolled"
                                ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 text-[10px] badge-glow-emerald"
                                : "bg-gray-50 text-gray-500 dark:bg-gray-800/30 dark:text-gray-400 border-gray-200 dark:border-gray-700 text-[10px]"
                            }
                            variant="outline"
                          >
                            {benefit.status === "enrolled" ? "Enrolled" : benefit.status === "available" ? "Available" : "Waived"}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <p className="text-sm text-gray-700 dark:text-gray-300">{benefit.details}</p>
                        <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400 mt-2">{benefit.value}</p>
                        <div className="mt-3 flex items-center gap-1 text-xs text-muted-foreground group-hover:text-emerald-600 transition-colors">
                          <Eye className="h-3 w-3" />
                          <span>View details</span>
                          <ChevronRight className="h-3 w-3" />
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>

            {/* ===== FINANCIAL TAB ===== */}
            <TabsContent value="financial">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {financialBenefits.map((benefit) => {
                  const Icon = benefit.icon;
                  return (
                    <Card
                      key={benefit.id}
                      className="border-teal-100 dark:border-teal-900/30 hover:shadow-md transition-all duration-200 cursor-pointer group card-glow card-elevated card-spotlight glass-card-enhanced"
                      onClick={() => setDetailView(benefit)}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center shadow-lg shadow-teal-500/20 group-hover:scale-110 transition-transform">
                              <Icon className="h-5 w-5 text-white" />
                            </div>
                            <div>
                              <CardTitle className="text-sm font-semibold">{benefit.name}</CardTitle>
                              {benefit.provider && (
                                <p className="text-xs text-muted-foreground mt-0.5">{benefit.provider}</p>
                              )}
                            </div>
                          </div>
                          <Badge
                            className={
                              benefit.status === "enrolled"
                                ? "bg-teal-50 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400 border-teal-200 dark:border-teal-800 text-[10px]"
                                : "bg-gray-50 text-gray-500 dark:bg-gray-800/30 dark:text-gray-400 border-gray-200 dark:border-gray-700 text-[10px]"
                            }
                            variant="outline"
                          >
                            {benefit.status === "enrolled" ? "Enrolled" : benefit.status === "available" ? "Available" : "Waived"}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <p className="text-sm text-gray-700 dark:text-gray-300">{benefit.details}</p>
                        <p className="text-xs font-medium text-teal-600 dark:text-teal-400 mt-2">{benefit.value}</p>
                        <div className="mt-3 flex items-center gap-1 text-xs text-muted-foreground group-hover:text-teal-600 transition-colors">
                          <Eye className="h-3 w-3" />
                          <span>View details</span>
                          <ChevronRight className="h-3 w-3" />
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>

            {/* ===== WORK-LIFE TAB ===== */}
            <TabsContent value="worklife">
              <div className="space-y-4">
                {/* PTO Summary */}
                <Card className="border-cyan-100 dark:border-cyan-900/30">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-cyan-600" />
                      PTO Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {PTO_DATA.map((pto) => (
                      <div key={pto.type} className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-900 dark:text-white">{pto.type}</span>
                          <span className="text-xs text-muted-foreground">{pto.used}/{pto.total} days used</span>
                        </div>
                        <div className="relative">
                          <Progress
                            value={(pto.used / pto.total) * 100}
                            className="h-2"
                          />
                          <div
                            className="absolute top-0 left-0 h-2 rounded-full transition-all duration-500"
                            style={{
                              width: `${(pto.used / pto.total) * 100}%`,
                              backgroundColor: pto.color,
                            }}
                          />
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                          <span>{pto.total - pto.used} days remaining</span>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Other Work-Life Benefits */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {worklifeBenefits.map((benefit) => {
                    const Icon = benefit.icon;
                    return (
                      <Card
                        key={benefit.id}
                        className="border-cyan-100 dark:border-cyan-900/30 hover:shadow-md transition-all duration-200 cursor-pointer group card-glow card-elevated card-spotlight glass-card-enhanced"
                        onClick={() => setDetailView(benefit)}
                      >
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 group-hover:scale-110 transition-transform">
                                <Icon className="h-5 w-5 text-white" />
                              </div>
                              <div>
                                <CardTitle className="text-sm font-semibold">{benefit.name}</CardTitle>
                                {benefit.provider && (
                                  <p className="text-xs text-muted-foreground mt-0.5">{benefit.provider}</p>
                                )}
                              </div>
                            </div>
                            <Badge
                              className={
                                benefit.status === "enrolled"
                                  ? "bg-cyan-50 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400 border-cyan-200 dark:border-cyan-800 text-[10px]"
                                  : benefit.status === "available"
                                    ? "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800 text-[10px]"
                                    : "bg-gray-50 text-gray-500 dark:bg-gray-800/30 dark:text-gray-400 border-gray-200 dark:border-gray-700 text-[10px]"
                              }
                              variant="outline"
                            >
                              {benefit.status === "enrolled" ? "Enrolled" : benefit.status === "available" ? "Available" : "Waived"}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <p className="text-sm text-gray-700 dark:text-gray-300">{benefit.details}</p>
                          <p className="text-xs font-medium text-cyan-600 dark:text-cyan-400 mt-2">{benefit.value}</p>
                          <div className="mt-3 flex items-center gap-1 text-xs text-muted-foreground group-hover:text-cyan-600 transition-colors">
                            <Eye className="h-3 w-3" />
                            <span>View details</span>
                            <ChevronRight className="h-3 w-3" />
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            </TabsContent>

            {/* ===== PERKS TAB ===== */}
            <TabsContent value="perks">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {perksBenefits.map((benefit) => {
                  const Icon = benefit.icon;
                  return (
                    <Card
                      key={benefit.id}
                      className="border-amber-100 dark:border-amber-900/30 hover:shadow-md transition-all duration-200 cursor-pointer group card-glow card-elevated card-spotlight glass-card-enhanced"
                      onClick={() => setDetailView(benefit)}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20 group-hover:scale-110 transition-transform">
                              <Icon className="h-5 w-5 text-white" />
                            </div>
                            <div>
                              <CardTitle className="text-sm font-semibold">{benefit.name}</CardTitle>
                              {benefit.provider && (
                                <p className="text-xs text-muted-foreground mt-0.5">{benefit.provider}</p>
                              )}
                            </div>
                          </div>
                          <Badge
                            className={
                              benefit.status === "enrolled"
                                ? "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800 text-[10px]"
                                : benefit.status === "available"
                                  ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 text-[10px]"
                                  : "bg-gray-50 text-gray-500 dark:bg-gray-800/30 dark:text-gray-400 border-gray-200 dark:border-gray-700 text-[10px]"
                            }
                            variant="outline"
                          >
                            {benefit.status === "enrolled" ? "Enrolled" : benefit.status === "available" ? "Available" : "Waived"}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <p className="text-sm text-gray-700 dark:text-gray-300">{benefit.details}</p>
                        <p className="text-xs font-medium text-amber-600 dark:text-amber-400 mt-2">{benefit.value}</p>
                        <div className="mt-3 flex items-center gap-1 text-xs text-muted-foreground group-hover:text-amber-600 transition-colors">
                          <Eye className="h-3 w-3" />
                          <span>View details</span>
                          <ChevronRight className="h-3 w-3" />
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* ===== HEALTH SCORE SIDEBAR ===== */}
        <div className="xl:col-span-1 space-y-4">
          <Card className="border-emerald-100 dark:border-emerald-900/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-emerald-600" />
                Benefits Health Score
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              {/* SVG Score Ring */}
              <div className="relative w-36 h-36 mb-4">
                <svg className="w-36 h-36 -rotate-90" viewBox="0 0 100 100">
                  {/* Background circle */}
                  <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="6" className="text-muted/30" />
                  {/* Score arc */}
                  <circle
                    cx="50" cy="50" r="45" fill="none"
                    stroke="url(#scoreGradient)"
                    strokeWidth="6"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    className="transition-all duration-1000"
                  />
                  <defs>
                    <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#10b981" />
                      <stop offset="50%" stopColor="#14b8a6" />
                      <stop offset="100%" stopColor="#06b6d4" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold text-gray-900 dark:text-white">{overallScore}</span>
                  <span className="text-[10px] text-muted-foreground">out of 100</span>
                </div>
              </div>
              <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400 mb-4">Excellent Coverage</p>
              <Separator className="mb-4" />
              {/* Breakdown */}
              <div className="w-full space-y-3">
                {HEALTH_SCORES.map((item) => {
                  const itemOffset = 2 * Math.PI * 35 - (item.score / 100) * 2 * Math.PI * 35;
                  return (
                    <div key={item.label} className="flex items-center gap-3">
                      <div className="relative w-10 h-10 shrink-0">
                        <svg className="w-10 h-10 -rotate-90" viewBox="0 0 80 80">
                          <circle cx="40" cy="40" r="35" fill="none" stroke="currentColor" strokeWidth="4" className="text-muted/20" />
                          <circle
                            cx="40" cy="40" r="35" fill="none"
                            stroke={item.color}
                            strokeWidth="4"
                            strokeLinecap="round"
                            strokeDasharray={2 * Math.PI * 35}
                            strokeDashoffset={itemOffset}
                            className="transition-all duration-700"
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-[9px] font-bold" style={{ color: item.color }}>{item.score}</span>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium text-gray-900 dark:text-white">{item.label}</span>
                        </div>
                        <div className="h-1.5 bg-muted/50 rounded-full mt-1 overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-700"
                            style={{ width: `${item.score}%`, backgroundColor: item.color }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ============ ENROLLMENT TIMELINE ============ */}
      <Card className="border-emerald-100 dark:border-emerald-900/30">
        <CardHeader className="pb-4">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Calendar className="h-4 w-4 text-emerald-600" />
            Enrollment Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            {/* Horizontal line */}
            <div className="absolute top-4 left-0 right-0 h-0.5 bg-muted hidden sm:block" />
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 sm:gap-2">
              {ENROLLMENT_TIMELINE.map((event, idx) => (
                <div key={idx} className="flex sm:flex-col items-start sm:items-center gap-3 sm:gap-2 sm:flex-1 relative">
                  {/* Dot */}
                  <div className="relative z-10 shrink-0">
                    <div
                      className={`h-8 w-8 rounded-full flex items-center justify-center border-2 ${
                        event.isCurrent
                          ? "bg-emerald-500 border-emerald-500 shadow-lg shadow-emerald-500/30"
                          : "bg-background border-emerald-300 dark:border-emerald-700"
                      }`}
                    >
                      {event.isCurrent ? (
                        <CheckCircle2 className="h-4 w-4 text-white" />
                      ) : idx < ENROLLMENT_TIMELINE.findIndex((e) => e.isCurrent) ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                      ) : (
                        <div className="h-2 w-2 rounded-full bg-muted-foreground/40" />
                      )}
                    </div>
                  </div>
                  {/* Content */}
                  <div className="sm:mt-2 sm:text-center min-w-0">
                    <p className={`text-xs font-semibold ${event.isCurrent ? "text-emerald-700 dark:text-emerald-400" : "text-gray-900 dark:text-white"}`}>
                      {event.label}
                    </p>
                    <p className="text-[10px] text-muted-foreground">{event.date}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5 hidden sm:block">{event.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ============ QUICK ACTIONS BAR ============ */}
      <Card className="border-emerald-100 dark:border-emerald-900/30">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white shrink-0">Quick Actions</h3>
            <div className="flex-1" />
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs gap-1.5"
                onClick={() => setShowEnrollDialog(true)}
              >
                <Plus className="h-3.5 w-3.5" />
                Enroll in Benefit
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="text-xs gap-1.5 border-teal-200 dark:border-teal-800 text-teal-700 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-950/20"
                onClick={() => setShowClaimDialog(true)}
              >
                <FileText className="h-3.5 w-3.5" />
                File a Claim
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="text-xs gap-1.5"
                onClick={handleDownloadSummary}
              >
                <Download className="h-3.5 w-3.5" />
                Download Summary
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="text-xs gap-1.5 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/20"
                onClick={handleContactHR}
              >
                <MessageSquare className="h-3.5 w-3.5" />
                Contact HR
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ============ ENROLL IN BENEFIT DIALOG ============ */}
      <Dialog open={showEnrollDialog} onOpenChange={setShowEnrollDialog}>
        <DialogContent className="sm:max-w-[520px] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-emerald-600" />
              Enroll in a Benefit
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">
              Choose a plan to enroll in. Changes will take effect at the next enrollment period.
            </p>

            {/* Available Plans */}
            <div className="space-y-3">
              <label className="text-sm font-medium">Select a Plan</label>
              <Select value={selectedPlan} onValueChange={setSelectedPlan}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a benefit plan..." />
                </SelectTrigger>
                <SelectContent>
                  {AVAILABLE_PLANS.map((plan) => (
                    <SelectItem key={plan.id} value={plan.id}>
                      <div className="flex items-center justify-between w-full gap-4">
                        <span className="font-medium">{plan.name}</span>
                        <span className="text-xs text-muted-foreground">{plan.cost}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Selected Plan Details */}
            {selectedPlan && (() => {
              const plan = AVAILABLE_PLANS.find((p) => p.id === selectedPlan);
              if (!plan) return null;
              return (
                <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white">{plan.name}</h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-xs text-muted-foreground">Monthly Cost</p>
                      <p className="font-medium text-gray-900 dark:text-white">{plan.cost}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Deductible</p>
                      <p className="font-medium text-gray-900 dark:text-white">{plan.deductible}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Coinsurance</p>
                      <p className="font-medium text-gray-900 dark:text-white">{plan.coinsurance}</p>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Enrollment toggle */}
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div>
                <label className="text-sm font-medium">Auto-renew enrollment</label>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Automatically renew this benefit at the end of the plan year
                </p>
              </div>
              <Switch defaultChecked />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setShowEnrollDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleEnrollSubmit}
              disabled={!selectedPlan}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              Submit Enrollment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ============ FILE A CLAIM DIALOG ============ */}
      <Dialog open={showClaimDialog} onOpenChange={setShowClaimDialog}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-teal-600" />
              File a Claim
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">
              Submit a benefits claim for reimbursement. You&apos;ll receive updates via email.
            </p>

            <div className="space-y-3">
              <div className="space-y-2">
                <label className="text-sm font-medium">Claim Type</label>
                <Select defaultValue="medical">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="medical">Medical Reimbursement</SelectItem>
                    <SelectItem value="dental">Dental Reimbursement</SelectItem>
                    <SelectItem value="vision">Vision Reimbursement</SelectItem>
                    <SelectItem value="hsa">HSA Withdrawal</SelectItem>
                    <SelectItem value="fsa">FSA Reimbursement</SelectItem>
                    <SelectItem value="education">Education Reimbursement</SelectItem>
                    <SelectItem value="commuter">Commuter Reimbursement</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Estimated Amount</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="number"
                    placeholder="0.00"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 pl-9 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Additional Notes</label>
                <textarea
                  placeholder="Describe your claim..."
                  rows={3}
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 resize-none"
                />
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setShowClaimDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleClaimSubmit}
              className="bg-teal-600 hover:bg-teal-700 text-white"
            >
              Submit Claim
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ============ BENEFIT DETAIL DIALOG ============ */}
      <Dialog open={!!detailView} onOpenChange={() => setDetailView(null)}>
        <DialogContent className="sm:max-w-[500px] max-h-[85vh] overflow-y-auto">
          {detailView && (() => {
            const Icon = detailView.icon;
            const color = getCategoryColor(detailView.category);
            const gradientFrom = color === "emerald" ? "from-emerald-400" : color === "teal" ? "from-teal-400" : color === "cyan" ? "from-cyan-400" : "from-amber-400";
            const gradientTo = color === "emerald" ? "to-emerald-600" : color === "teal" ? "to-teal-600" : color === "cyan" ? "to-cyan-600" : "to-amber-600";

            return (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-3">
                    <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${gradientFrom} ${gradientTo} flex items-center justify-center shadow-lg`}>
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    {detailView.name}
                  </DialogTitle>
                </DialogHeader>

                <div className="space-y-4 py-2">
                  {/* Status & Provider */}
                  <div className="flex items-center gap-2">
                    <Badge
                      className={
                        detailView.status === "enrolled"
                          ? `bg-${color}-50 text-${color}-700 dark:bg-${color}-900/30 dark:text-${color}-400 border-${color}-200 dark:border-${color}-800`
                          : "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800"
                      }
                      variant="outline"
                    >
                      {detailView.status === "enrolled" ? "Enrolled" : detailView.status === "available" ? "Available" : "Waived"}
                    </Badge>
                    {detailView.provider && (
                      <span className="text-xs text-muted-foreground">{detailView.provider}</span>
                    )}
                  </div>

                  <Separator />

                  {/* Value */}
                  <div className="bg-muted/50 rounded-lg p-3">
                    <p className="text-xs text-muted-foreground mb-1">Benefit Value</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">{detailView.value}</p>
                  </div>

                  {/* Description */}
                  <div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">{detailView.details}</p>
                  </div>

                  {/* Sub Details */}
                  {detailView.subDetails && detailView.subDetails.length > 0 && (
                    <>
                      <Separator />
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Coverage Details</p>
                        <div className="space-y-1.5">
                          {detailView.subDetails.map((detail, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-sm">
                              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                              <span className="text-gray-700 dark:text-gray-300">{detail}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>

                <DialogFooter>
                  {detailView.status === "available" ? (
                    <Button
                      className={`bg-${color}-600 hover:bg-${color}-700 text-white`}
                      onClick={() => {
                        toast.success(`Enrolled in ${detailView.name}!`);
                        setDetailView(null);
                      }}
                    >
                      <Plus className="h-4 w-4 mr-1.5" />
                      Enroll Now
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      onClick={() => {
                        toast.info(`Viewing full details for ${detailView.name}`);
                      }}
                    >
                      <Eye className="h-4 w-4 mr-1.5" />
                      View Full Details
                    </Button>
                  )}
                </DialogFooter>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
}
