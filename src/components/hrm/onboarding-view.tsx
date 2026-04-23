"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { format, differenceInDays, subDays, isWithinInterval, startOfMonth, endOfMonth } from "date-fns";
import { toast } from "sonner";
import { useAppStore, type Employee, type Department } from "@/store/app";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  UserPlus,
  Users,
  CheckCircle2,
  Clock,
  TrendingUp,
  ArrowUpRight,
  ClipboardCheck,
  Sparkles,
  LayoutTemplate,
  ChevronDown,
  ChevronUp,
  FileText,
  Home,
  Briefcase,
  GraduationCap,
  CalendarCheck,
  Loader2,
  Mail,
  Building2,
  MapPin,
} from "lucide-react";

// ============ TYPES ============

interface ChecklistItem {
  id: string;
  label: string;
  completed: boolean;
}

interface ChecklistSection {
  id: string;
  title: string;
  icon: React.ElementType;
  items: ChecklistItem[];
}

interface OnboardingChecklist {
  sections: ChecklistSection[];
}

interface NewHireForm {
  firstName: string;
  lastName: string;
  email: string;
  departmentId: string;
  role: string;
  startDate: string;
  managerId: string;
}

interface OnboardingTemplate {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  colorClass: string;
  bgColorClass: string;
  borderColorClass: string;
  badgeText: string;
  badgeClass: string;
  sections: ChecklistSection[];
}

// ============ AVATAR COLORS ============

const AVATAR_COLORS = [
  "bg-msbm-red/50",
  "bg-teal-500",
  "bg-cyan-500",
  "bg-green-600",
  "bg-msbm-red",
  "bg-teal-600",
  "bg-cyan-600",
];

function getAvatarColor(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function getInitials(firstName: string, lastName: string): string {
  return `${(firstName?.[0] || "").toUpperCase()}${(lastName?.[0] || "").toUpperCase()}`;
}

// ============ DEFAULT CHECKLIST ============

function createDefaultChecklist(): OnboardingChecklist {
  return {
    sections: [
      {
        id: "pre-first-day",
        title: "Pre-First Day",
        icon: FileText,
        items: [
          { id: "offer-letter", label: "Offer letter signed and returned", completed: false },
          { id: "background-check", label: "Background check initiated", completed: false },
          { id: "it-equipment", label: "IT equipment ordered", completed: false },
          { id: "desk-workspace", label: "Desk/workspace assigned", completed: false },
          { id: "system-accounts", label: "System accounts created (email, Slack, etc.)", completed: false },
        ],
      },
      {
        id: "first-day",
        title: "First Day",
        icon: Home,
        items: [
          { id: "welcome-meeting", label: "Welcome meeting with manager", completed: false },
          { id: "hr-orientation", label: "HR orientation completed", completed: false },
          { id: "benefits-enrollment", label: "Benefits enrollment", completed: false },
          { id: "it-setup", label: "IT setup (laptop, email, tools)", completed: false },
          { id: "office-tour", label: "Office tour completed", completed: false },
          { id: "security-badge", label: "Security badge issued", completed: false },
        ],
      },
      {
        id: "first-week",
        title: "First Week",
        icon: Briefcase,
        items: [
          { id: "team-intros", label: "Team introductions completed", completed: false },
          { id: "dept-overview", label: "Department overview meeting", completed: false },
          { id: "culture-session", label: "Company culture session", completed: false },
          { id: "tools-training", label: "Tools and systems training", completed: false },
          { id: "one-on-one", label: "1:1 with direct manager", completed: false },
          { id: "goals-set", label: "Goals and expectations set", completed: false },
        ],
      },
      {
        id: "first-month",
        title: "First Month",
        icon: GraduationCap,
        items: [
          { id: "30-day-checkin", label: "30-day check-in completed", completed: false },
          { id: "training-plan", label: "Training plan finalized", completed: false },
          { id: "perf-goals", label: "Performance goals documented", completed: false },
          { id: "mentor-assigned", label: "Mentor assigned", completed: false },
        ],
      },
    ],
  };
}

// ============ ONBOARDING TEMPLATES ============

function getOnboardingTemplates(): OnboardingTemplate[] {
  const standard = createDefaultChecklist();
  return [
    {
      id: "standard",
      name: "Standard Onboarding",
      description:
        "Full comprehensive onboarding checklist covering all phases from pre-first day through the first month. Ideal for full-time office employees.",
      icon: ClipboardCheck,
      colorClass: "text-msbm-red dark:text-msbm-red-bright",
      bgColorClass: "bg-msbm-red/5 dark:bg-msbm-red/10",
      borderColorClass: "border-msbm-red/20/60 dark:border-msbm-red/20/40",
      badgeText: "Full Checklist",
      badgeClass: "bg-msbm-red/10 text-msbm-red dark:bg-emerald-900/50 dark:text-msbm-red-bright",
      sections: standard.sections,
    },
    {
      id: "remote",
      name: "Remote Employee",
      description:
        "Modified checklist with emphasis on virtual setup, remote tool access, and digital culture integration. No office tour or physical badge required.",
      icon: Home,
      colorClass: "text-teal-600 dark:text-teal-400",
      bgColorClass: "bg-teal-50 dark:bg-teal-950/40",
      borderColorClass: "border-teal-200/60 dark:border-teal-800/40",
      badgeText: "Remote Ready",
      badgeClass: "bg-teal-100 text-teal-700 dark:bg-teal-900/50 dark:text-teal-300",
      sections: [
        {
          id: "pre-first-day",
          title: "Pre-First Day",
          icon: FileText,
          items: [
            { id: "offer-letter", label: "Offer letter signed and returned", completed: false },
            { id: "background-check", label: "Background check initiated", completed: false },
            { id: "it-equipment", label: "Laptop shipped to home address", completed: false },
            { id: "desk-workspace", label: "Remote workspace stipend approved", completed: false },
            { id: "system-accounts", label: "System accounts created (email, Slack, Zoom, etc.)", completed: false },
            { id: "vpn-access", label: "VPN and remote access configured", completed: false },
          ],
        },
        {
          id: "first-day",
          title: "First Day",
          icon: Home,
          items: [
            { id: "welcome-meeting", label: "Virtual welcome meeting with manager", completed: false },
            { id: "hr-orientation", label: "HR orientation completed (video call)", completed: false },
            { id: "benefits-enrollment", label: "Benefits enrollment", completed: false },
            { id: "it-setup", label: "Remote IT setup completed and verified", completed: false },
            { id: "virtual-tour", label: "Virtual office tour / intro video", completed: false },
          ],
        },
        {
          id: "first-week",
          title: "First Week",
          icon: Briefcase,
          items: [
            { id: "team-intros", label: "Virtual team introductions completed", completed: false },
            { id: "dept-overview", label: "Department overview meeting (video call)", completed: false },
            { id: "culture-session", label: "Remote culture & communication norms session", completed: false },
            { id: "tools-training", label: "Remote collaboration tools training", completed: false },
            { id: "one-on-one", label: "1:1 with direct manager", completed: false },
          ],
        },
        {
          id: "first-month",
          title: "First Month",
          icon: GraduationCap,
          items: [
            { id: "30-day-checkin", label: "30-day check-in completed", completed: false },
            { id: "training-plan", label: "Training plan finalized", completed: false },
            { id: "perf-goals", label: "Performance goals documented", completed: false },
            { id: "mentor-assigned", label: "Remote mentor/buddy assigned", completed: false },
          ],
        },
      ],
    },
    {
      id: "executive",
      name: "Executive Onboarding",
      description:
        "Streamlined checklist focused on leadership integration, strategic alignment, and stakeholder meetings. Prioritizes relationship-building over process tasks.",
      icon: Sparkles,
      colorClass: "text-amber-600 dark:text-amber-400",
      bgColorClass: "bg-amber-50 dark:bg-amber-950/40",
      borderColorClass: "border-amber-200/60 dark:border-amber-800/40",
      badgeText: "Leadership",
      badgeClass: "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300",
      sections: [
        {
          id: "pre-first-day",
          title: "Pre-First Day",
          icon: FileText,
          items: [
            { id: "offer-letter", label: "Offer letter and executive package signed", completed: false },
            { id: "background-check", label: "Executive background check completed", completed: false },
            { id: "system-accounts", label: "Executive system accounts and access created", completed: false },
            { id: "it-equipment", label: "Premium IT equipment configured", completed: false },
          ],
        },
        {
          id: "first-day",
          title: "First Day",
          icon: Home,
          items: [
            { id: "ceo-welcome", label: "Welcome meeting with CEO / Board", completed: false },
            { id: "hr-orientation", label: "Executive benefits and compensation review", completed: false },
            { id: "it-setup", label: "IT setup and security briefing", completed: false },
          ],
        },
        {
          id: "first-week",
          title: "First Week",
          icon: Briefcase,
          items: [
            { id: "leadership-intros", label: "Individual meetings with leadership team", completed: false },
            { id: "dept-overview", label: "Department deep-dive sessions", completed: false },
            { id: "strategy-review", label: "Company strategy and roadmap review", completed: false },
            { id: "stakeholder-meetings", label: "Key stakeholder introductions", completed: false },
          ],
        },
        {
          id: "first-month",
          title: "First Month",
          icon: GraduationCap,
          items: [
            { id: "30-day-checkin", label: "Executive 30-day check-in with CEO", completed: false },
            { id: "perf-goals", label: "Strategic goals and KPIs agreed", completed: false },
            { id: "mentor-assigned", label: "Board mentor / advisor assigned", completed: false },
          ],
        },
      ],
    },
    {
      id: "contractor",
      name: "Contractor Onboarding",
      description:
        "Minimal checklist covering essential access, compliance, and project assignment. Designed for short-term contractors and freelancers.",
      icon: CalendarCheck,
      colorClass: "text-cyan-600 dark:text-cyan-400",
      bgColorClass: "bg-cyan-50 dark:bg-cyan-950/40",
      borderColorClass: "border-cyan-200/60 dark:border-cyan-800/40",
      badgeText: "Minimal",
      badgeClass: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/50 dark:text-cyan-300",
      sections: [
        {
          id: "pre-start",
          title: "Pre-Start",
          icon: FileText,
          items: [
            { id: "contract-signed", label: "Contract / SOW signed", completed: false },
            { id: "nda-signed", label: "NDA and compliance agreements signed", completed: false },
            { id: "system-accounts", label: "Limited system access created", completed: false },
          ],
        },
        {
          id: "first-day",
          title: "First Day",
          icon: Home,
          items: [
            { id: "project-briefing", label: "Project briefing and scope review", completed: false },
            { id: "team-meet", label: "Meet with project team", completed: false },
            { id: "tools-setup", label: "Required tools and environments set up", completed: false },
          ],
        },
        {
          id: "first-week",
          title: "First Week",
          icon: Briefcase,
          items: [
            { id: "deliverables", label: "Initial deliverables agreed and documented", completed: false },
            { id: "check-in", label: "First weekly check-in with manager", completed: false },
          ],
        },
      ],
    },
  ];
}

// ============ HELPER: Checklist completion calculation ============

function calculateChecklistCompletion(sections: ChecklistSection[]): {
  completed: number;
  total: number;
  percentage: number;
} {
  let completed = 0;
  let total = 0;
  for (const section of sections) {
    for (const item of section.items) {
      total++;
      if (item.completed) completed++;
    }
  }
  return {
    completed,
    total,
    percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
  };
}

// ============ MAIN COMPONENT ============

export function OnboardingView() {
  const { employees, setEmployees, departments, setDepartments } = useAppStore();

  // Data state
  const [isLoading, setIsLoading] = useState(true);
  const [recentHires, setRecentHires] = useState<Employee[]>([]);

  // Checklist state
  const [checklist, setChecklist] = useState<OnboardingChecklist>(createDefaultChecklist());
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(["pre-first-day", "first-day", "first-week", "first-month"])
  );

  // New hire form dialog
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<NewHireForm>({
    firstName: "",
    lastName: "",
    email: "",
    departmentId: "",
    role: "employee",
    startDate: format(new Date(), "yyyy-MM-dd"),
    managerId: "",
  });
  const [formErrors, setFormErrors] = useState<Partial<NewHireForm>>({});

  // New hire detail dialog
  const [selectedHire, setSelectedHire] = useState<Employee | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  // Template dialog
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<OnboardingTemplate | null>(null);

  // ============ DATA FETCHING ============

  const fetchEmployees = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/employees");
      if (!res.ok) throw new Error("Failed to fetch employees");
      const data = await res.json();
      const emps: Employee[] = data.employees || [];
      setEmployees(emps);

      // Filter to recent hires (within last 90 days)
      const now = new Date();
      const cutoff = subDays(now, 90);
      const hires = emps.filter((e) => {
        if (!e.hireDate) return false;
        const hireDate = new Date(e.hireDate);
        return isWithinInterval(hireDate, { start: cutoff, end: now }) || hireDate > now;
      });
      setRecentHires(hires);
    } catch {
      toast.error("Failed to load employees");
    } finally {
      setIsLoading(false);
    }
  }, [setEmployees]);

  const fetchDepartments = useCallback(async () => {
    try {
      const res = await fetch("/api/departments");
      if (!res.ok) throw new Error("Failed to fetch departments");
      const data = await res.json();
      setDepartments(data.departments || []);
    } catch {
      toast.error("Failed to load departments");
    }
  }, [setDepartments]);

  useEffect(() => {
    fetchEmployees();
    fetchDepartments();
  }, [fetchEmployees, fetchDepartments]);

  // ============ PIPELINE STATS ============

  const pipelineStats = useMemo(() => {
    const now = new Date();
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);

    const newHiresThisMonth = recentHires.filter((e) => {
      if (!e.hireDate) return false;
      return isWithinInterval(new Date(e.hireDate), { start: monthStart, end: monthEnd });
    });

    const completedCount = newHiresThisMonth.length;
    const pendingCount = recentHires.filter((e) => {
      const daysSinceHire = e.hireDate ? differenceInDays(now, new Date(e.hireDate)) : 0;
      return daysSinceHire < 0;
    }).length;
    const inProgressCount = recentHires.length - completedCount - pendingCount;

    return {
      newHiresThisMonth: newHiresThisMonth.length,
      pendingOnboarding: pendingCount,
      completedOnboarding: completedCount,
      inProgress: inProgressCount,
    };
  }, [recentHires]);

  // ============ CHECKLIST INTERACTIONS ============

  const toggleSection = useCallback((sectionId: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(sectionId)) {
        next.delete(sectionId);
      } else {
        next.add(sectionId);
      }
      return next;
    });
  }, []);

  const toggleChecklistItem = useCallback((sectionId: string, itemId: string) => {
    setChecklist((prev) => ({
      sections: prev.sections.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              items: section.items.map((item) =>
                item.id === itemId ? { ...item, completed: !item.completed } : item
              ),
            }
          : section
      ),
    }));
  }, []);

  const checklistCompletion = useMemo(
    () => calculateChecklistCompletion(checklist.sections),
    [checklist]
  );

  // ============ ADD NEW HIRE ============

  const validateForm = useCallback((): boolean => {
    const errors: Partial<NewHireForm> = {};
    if (!formData.firstName.trim()) errors.firstName = "First name is required";
    if (!formData.lastName.trim()) errors.lastName = "Last name is required";
    if (!formData.email.trim()) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Invalid email format";
    }
    if (!formData.departmentId) errors.departmentId = "Department is required";
    if (!formData.startDate) errors.startDate = "Start date is required";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData]);

  const handleSubmitNewHire = useCallback(async () => {
    if (!validateForm()) return;
    try {
      setSubmitting(true);
      const res = await fetch("/api/employees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          payType: "hourly",
          payRate: 0,
          hireDate: formData.startDate,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create employee");
      }
      toast.success("New hire added successfully! Onboarding checklist is ready.");
      setAddDialogOpen(false);
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        departmentId: "",
        role: "employee",
        startDate: format(new Date(), "yyyy-MM-dd"),
        managerId: "",
      });
      setFormErrors({});
      fetchEmployees();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to add new hire");
    } finally {
      setSubmitting(false);
    }
  }, [formData, validateForm, fetchEmployees]);

  // ============ TEMPLATE APPLICATION ============

  const applyTemplate = useCallback((template: OnboardingTemplate) => {
    setSelectedTemplate(template);
    setTemplateDialogOpen(true);
  }, []);

  const confirmApplyTemplate = useCallback(() => {
    if (selectedTemplate) {
      setChecklist({ sections: selectedTemplate.sections });
      toast.success(`"${selectedTemplate.name}" template applied to checklist!`);
      setTemplateDialogOpen(false);
      setSelectedTemplate(null);
      // Expand all new sections
      setExpandedSections(new Set(selectedTemplate.sections.map((s) => s.id)));
    }
  }, [selectedTemplate]);

  // ============ NEW HIRE PROGRESS (simulated) ============

  const getNewHireProgress = useCallback(
    (emp: Employee): number => {
      if (!emp.hireDate) return 0;
      const daysSinceHire = differenceInDays(new Date(), new Date(emp.hireDate));
      if (daysSinceHire < 0) return 0;
      if (daysSinceHire >= 30) return 100;
      if (daysSinceHire >= 7) return Math.min(75, 50 + (daysSinceHire - 7) * 2);
      if (daysSinceHire >= 1) return Math.min(50, 10 + (daysSinceHire - 1) * 10);
      return Math.min(10, daysSinceHire * 10);
    },
    []
  );

  const getNewHireStatus = useCallback(
    (emp: Employee): { label: string; class: string } => {
      if (!emp.hireDate) return { label: "Pending", class: "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300" };
      const daysSinceHire = differenceInDays(new Date(), new Date(emp.hireDate));
      if (daysSinceHire < 0) return { label: "Pre-Start", class: "bg-slate-100 text-slate-600 dark:bg-slate-800/50 dark:text-slate-400" };
      if (daysSinceHire >= 30) return { label: "Completed", class: "bg-msbm-red/10 text-msbm-red dark:bg-emerald-900/50 dark:text-msbm-red-bright" };
      return { label: "In Progress", class: "bg-teal-100 text-teal-700 dark:bg-teal-900/50 dark:text-teal-300" };
    },
    []
  );

  const templates = useMemo(() => getOnboardingTemplates(), []);

  // ============ LOADING STATE ============

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Stat cards skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="pt-0">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-muted" />
                  <div className="space-y-2 flex-1">
                    <div className="h-4 w-28 rounded bg-muted" />
                    <div className="h-7 w-12 rounded bg-muted" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        {/* Checklist skeleton */}
        <Card className="animate-pulse">
          <CardHeader>
            <div className="h-5 w-48 rounded bg-muted" />
            <div className="h-4 w-64 rounded bg-muted" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-16 rounded-lg bg-muted" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ============ RENDER ============

  return (
    <div className="space-y-6">
      {/* ─── Page Header ─────────────────────────────────────────── */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Onboarding</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage new hire onboarding, configure checklists, and track progress.
          </p>
        </div>
        <Button
          onClick={() => setAddDialogOpen(true)}
          className="bg-msbm-red hover:bg-msbm-red/80 text-white shadow-sm"
        >
          <UserPlus className="mr-2 h-4 w-4" />
          Add New Hire
        </Button>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          SECTION 1: ONBOARDING PIPELINE STATS
          ═══════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* New Hires This Month */}
        <Card className="group transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 border-msbm-red/20/60 dark:border-msbm-red/20/40">
          <CardContent className="pt-0">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-msbm-red/5 dark:bg-msbm-red/10 transition-transform duration-300 group-hover:scale-110">
                <Users className="h-6 w-6 text-msbm-red dark:text-msbm-red-bright" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-muted-foreground truncate">
                  New Hires This Month
                </p>
                <p className="text-2xl font-bold tracking-tight">
                  {pipelineStats.newHiresThisMonth}
                </p>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-1.5 text-xs">
              <ArrowUpRight className="h-3.5 w-3.5 text-emerald-500" />
              <span className="font-medium text-msbm-red dark:text-msbm-red-bright">
                +{Math.max(1, pipelineStats.newHiresThisMonth)}
              </span>
              <span className="text-muted-foreground">vs last month</span>
            </div>
          </CardContent>
        </Card>

        {/* Pending Onboarding */}
        <Card className="group transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 border-amber-200/60 dark:border-amber-800/40">
          <CardContent className="pt-0">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-amber-50 dark:bg-amber-950/40 transition-transform duration-300 group-hover:scale-110">
                <Clock className="h-6 w-6 text-amber-600 dark:text-amber-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-muted-foreground truncate">
                  Pending Onboarding
                </p>
                <p className="text-2xl font-bold tracking-tight">
                  {pipelineStats.pendingOnboarding}
                </p>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-1.5 text-xs">
              <span className="text-muted-foreground">Awaiting start date</span>
            </div>
          </CardContent>
        </Card>

        {/* Completed Onboarding */}
        <Card className="group transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 border-teal-200/60 dark:border-teal-800/40">
          <CardContent className="pt-0">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-teal-50 dark:bg-teal-950/40 transition-transform duration-300 group-hover:scale-110">
                <CheckCircle2 className="h-6 w-6 text-teal-600 dark:text-teal-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-muted-foreground truncate">
                  Completed Onboarding
                </p>
                <p className="text-2xl font-bold tracking-tight">
                  {pipelineStats.completedOnboarding}
                </p>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-1.5 text-xs">
              <TrendingUp className="h-3.5 w-3.5 text-teal-500" />
              <span className="font-medium text-teal-600 dark:text-teal-400">
                {pipelineStats.completedOnboarding > 0 ? "On track" : "No data yet"}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* In Progress */}
        <Card className="group transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 border-cyan-200/60 dark:border-cyan-800/40">
          <CardContent className="pt-0">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-cyan-50 dark:bg-cyan-950/40 transition-transform duration-300 group-hover:scale-110">
                <Sparkles className="h-6 w-6 text-cyan-600 dark:text-cyan-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-muted-foreground truncate">
                  In Progress
                </p>
                <p className="text-2xl font-bold tracking-tight">
                  {pipelineStats.inProgress}
                </p>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-1.5 text-xs">
              <span className="text-muted-foreground">Currently onboarding</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          SECTION 2: ONBOARDING CHECKLIST BUILDER
          ═══════════════════════════════════════════════════════════ */}
      <Card className="transition-all duration-300 hover:shadow-md">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <ClipboardCheck className="h-5 w-5 text-msbm-red" />
                Onboarding Checklist Builder
              </CardTitle>
              <CardDescription className="mt-1">
                Configure the onboarding tasks for new hires. Toggle items as they are completed.
              </CardDescription>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-semibold text-msbm-red dark:text-msbm-red-bright">
                  {checklistCompletion.percentage}%
                </p>
                <p className="text-xs text-muted-foreground">
                  {checklistCompletion.completed} / {checklistCompletion.total} tasks
                </p>
              </div>
              <div className="w-24">
                <Progress
                  value={checklistCompletion.percentage}
                  className="h-2.5 [&>div]:bg-msbm-red/50"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {checklist.sections.map((section) => {
            const SectionIcon = section.icon;
            const isExpanded = expandedSections.has(section.id);
            const sectionCompleted = section.items.filter((i) => i.completed).length;
            const sectionTotal = section.items.length;
            const sectionPercent = sectionTotal > 0 ? Math.round((sectionCompleted / sectionTotal) * 100) : 0;

            return (
              <div
                key={section.id}
                className="rounded-xl border border-border/60 overflow-hidden transition-all duration-200"
              >
                {/* Section Header */}
                <button
                  onClick={() => toggleSection(section.id)}
                  className="w-full flex items-center justify-between p-4 bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex items-center justify-center h-9 w-9 rounded-lg transition-colors duration-300 ${
                        sectionPercent === 100
                          ? "bg-msbm-red/10 dark:bg-emerald-900/40"
                          : "bg-muted"
                      }`}
                    >
                      <SectionIcon
                        className={`h-4.5 w-4.5 transition-colors duration-300 ${
                          sectionPercent === 100
                            ? "text-msbm-red dark:text-msbm-red-bright"
                            : "text-muted-foreground"
                        }`}
                      />
                    </div>
                    <div className="text-left">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold">{section.title}</span>
                        {sectionPercent === 100 && (
                          <Badge className="bg-msbm-red/10 text-msbm-red dark:bg-emerald-900/50 dark:text-msbm-red-bright text-[10px] px-1.5 py-0">
                            Complete
                          </Badge>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {sectionCompleted} of {sectionTotal} tasks
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="hidden sm:flex items-center gap-2 w-20">
                      <Progress
                        value={sectionPercent}
                        className="h-1.5 flex-1 [&>div]:bg-msbm-red/50"
                      />
                      <span className="text-xs font-medium text-muted-foreground w-8 text-right">
                        {sectionPercent}%
                      </span>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                </button>

                {/* Section Items */}
                {isExpanded && (
                  <div className="border-t border-border/40 p-3 space-y-1 bg-background">
                    {section.items.map((item) => (
                      <label
                        key={item.id}
                        className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all duration-200 group ${
                          item.completed
                            ? "bg-msbm-red/5/60 dark:bg-emerald-950/20 hover:bg-msbm-red/5 dark:hover:bg-emerald-950/30"
                            : "hover:bg-muted/50"
                        }`}
                      >
                        <Checkbox
                          checked={item.completed}
                          onCheckedChange={() =>
                            toggleChecklistItem(section.id, item.id)
                          }
                          className={`transition-all duration-200 ${
                            item.completed
                              ? "data-[state=checked]:bg-msbm-red data-[state=checked]:border-msbm-red/20"
                              : ""
                          }`}
                        />
                        <span
                          className={`text-sm flex-1 transition-all duration-200 ${
                            item.completed
                              ? "text-msbm-red dark:text-msbm-red-bright line-through decoration-msbm-red/60"
                              : "text-foreground"
                          }`}
                        >
                          {item.label}
                        </span>
                        {item.completed && (
                          <CheckCircle2 className="h-4 w-4 text-msbm-red opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                        )}
                      </label>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* ═══════════════════════════════════════════════════════════
          SECTION 3: NEW HIRE PROFILES
          ═══════════════════════════════════════════════════════════ */}
      <Card className="transition-all duration-300 hover:shadow-md">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="h-5 w-5 text-msbm-red" />
                New Hire Profiles
              </CardTitle>
              <CardDescription className="mt-1">
                Employees hired in the last 90 days and their onboarding progress.
              </CardDescription>
            </div>
            {recentHires.length > 0 && (
              <Badge variant="outline" className="w-fit text-xs">
                {recentHires.length} recent hire{recentHires.length !== 1 ? "s" : ""}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {recentHires.length === 0 ? (
            <div className="text-center py-12">
              <Users className="mx-auto h-12 w-12 text-muted-foreground/40" />
              <p className="mt-3 text-sm text-muted-foreground">
                No recent hires in the last 90 days
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Add a new hire to get started with onboarding
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-4 border-msbm-red/30 text-msbm-red hover:bg-msbm-red/5 dark:border-msbm-red/30 dark:text-msbm-red-bright"
                onClick={() => setAddDialogOpen(true)}
              >
                <UserPlus className="mr-2 h-3.5 w-3.5" />
                Add New Hire
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {recentHires.map((emp) => {
                const progress = getNewHireProgress(emp);
                const status = getNewHireStatus(emp);

                return (
                  <div
                    key={emp.id}
                    className="rounded-xl border border-border/60 p-4 transition-all duration-200 hover:shadow-md hover:border-msbm-red/20 dark:hover:border-msbm-red/40 cursor-pointer group"
                    onClick={() => {
                      setSelectedHire(emp);
                      setDetailOpen(true);
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <Avatar className="h-11 w-11">
                        <AvatarFallback
                          className={`${getAvatarColor(emp.id)} text-white text-sm font-semibold`}
                        >
                          {getInitials(emp.firstName, emp.lastName)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-semibold truncate">
                            {emp.firstName} {emp.lastName}
                          </p>
                          <Badge
                            className={`text-[10px] px-1.5 py-0 ${status.class}`}
                          >
                            {status.label}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {emp.department?.name || "No Department"} &middot; {emp.role}
                        </p>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
                          <CalendarCheck className="h-3 w-3" />
                          <span>
                            Start: {emp.hireDate ? format(new Date(emp.hireDate), "MMM d, yyyy") : "TBD"}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="mt-3">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-medium text-muted-foreground">
                          Onboarding Progress
                        </span>
                        <span className="text-xs font-semibold text-msbm-red dark:text-msbm-red-bright">
                          {progress}%
                        </span>
                      </div>
                      <Progress
                        value={progress}
                        className="h-2 [&>div]:bg-msbm-red/50 transition-all duration-500"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ═══════════════════════════════════════════════════════════
          SECTION 5: ONBOARDING TEMPLATES
          ═══════════════════════════════════════════════════════════ */}
      <Card className="transition-all duration-300 hover:shadow-md">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <LayoutTemplate className="h-5 w-5 text-cyan-600" />
                Onboarding Templates
              </CardTitle>
              <CardDescription className="mt-1">
                Pre-built onboarding templates. Select one to apply to the checklist builder.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {templates.map((template) => {
              const TemplateIcon = template.icon;
              const totalItems = template.sections.reduce(
                (sum, s) => sum + s.items.length,
                0
              );

              return (
                <div
                  key={template.id}
                  className={`rounded-xl border ${template.borderColorClass} p-5 transition-all duration-200 hover:shadow-md group cursor-pointer`}
                  onClick={() => applyTemplate(template)}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`flex items-center justify-center h-11 w-11 rounded-xl ${template.bgColorClass} transition-transform duration-300 group-hover:scale-110 shrink-0`}
                    >
                      <TemplateIcon className={`h-5.5 w-5.5 ${template.colorClass}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm font-semibold">{template.name}</h3>
                        <Badge className={`text-[10px] px-1.5 py-0 ${template.badgeClass}`}>
                          {template.badgeText}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2 leading-relaxed">
                        {template.description}
                      </p>
                      <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <ClipboardCheck className="h-3 w-3" />
                          {totalItems} tasks
                        </span>
                        <span className="flex items-center gap-1">
                          <FileText className="h-3 w-3" />
                          {template.sections.length} phases
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`w-full mt-4 text-xs ${template.colorClass} hover:${template.bgColorClass}`}
                  >
                    Use This Template
                  </Button>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* ═══════════════════════════════════════════════════════════
          DIALOG: ADD NEW HIRE
          ═══════════════════════════════════════════════════════════ */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="sm:max-w-[540px] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-msbm-red" />
              Add New Hire
            </DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* Name Row */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="onb-firstName">
                  First Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="onb-firstName"
                  placeholder="John"
                  value={formData.firstName}
                  onChange={(e) =>
                    setFormData({ ...formData, firstName: e.target.value })
                  }
                  className={formErrors.firstName ? "border-red-500" : ""}
                />
                {formErrors.firstName && (
                  <p className="text-xs text-red-500">{formErrors.firstName}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="onb-lastName">
                  Last Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="onb-lastName"
                  placeholder="Doe"
                  value={formData.lastName}
                  onChange={(e) =>
                    setFormData({ ...formData, lastName: e.target.value })
                  }
                  className={formErrors.lastName ? "border-red-500" : ""}
                />
                {formErrors.lastName && (
                  <p className="text-xs text-red-500">{formErrors.lastName}</p>
                )}
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="onb-email">
                Email <span className="text-red-500">*</span>
              </Label>
              <Input
                id="onb-email"
                type="email"
                placeholder="john.doe@company.com"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className={formErrors.email ? "border-red-500" : ""}
              />
              {formErrors.email && (
                <p className="text-xs text-red-500">{formErrors.email}</p>
              )}
            </div>

            {/* Department & Role */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="onb-department">
                  Department <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.departmentId}
                  onValueChange={(v) =>
                    setFormData({ ...formData, departmentId: v })
                  }
                >
                  <SelectTrigger
                    id="onb-department"
                    className={formErrors.departmentId ? "border-red-500" : ""}
                  >
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((dept) => (
                      <SelectItem key={dept.id} value={dept.id}>
                        {dept.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formErrors.departmentId && (
                  <p className="text-xs text-red-500">
                    {formErrors.departmentId}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="onb-role">Role</Label>
                <Select
                  value={formData.role}
                  onValueChange={(v) =>
                    setFormData({ ...formData, role: v })
                  }
                >
                  <SelectTrigger id="onb-role">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="employee">Employee</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="hr">HR</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Start Date */}
            <div className="space-y-2">
              <Label htmlFor="onb-startDate">
                Start Date <span className="text-red-500">*</span>
              </Label>
              <Input
                id="onb-startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) =>
                  setFormData({ ...formData, startDate: e.target.value })
                }
                className={formErrors.startDate ? "border-red-500" : ""}
              />
              {formErrors.startDate && (
                <p className="text-xs text-red-500">{formErrors.startDate}</p>
              )}
            </div>

            {/* Manager Assignment */}
            <div className="space-y-2">
              <Label htmlFor="onb-manager">Manager Assignment</Label>
              <Select
                value={formData.managerId}
                onValueChange={(v) =>
                  setFormData({ ...formData, managerId: v })
                }
              >
                <SelectTrigger id="onb-manager">
                  <SelectValue placeholder="Assign a manager (optional)" />
                </SelectTrigger>
                <SelectContent>
                  {employees
                    .filter(
                      (e) =>
                        e.role === "manager" ||
                        e.role === "admin" ||
                        e.role === "hr"
                    )
                    .map((emp) => (
                      <SelectItem key={emp.id} value={emp.id}>
                        {emp.firstName} {emp.lastName}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator />

          <DialogFooter className="mt-2">
            <Button
              variant="outline"
              onClick={() => setAddDialogOpen(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmitNewHire}
              disabled={submitting}
              className="bg-msbm-red hover:bg-msbm-red/80 text-white"
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Add New Hire
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ═══════════════════════════════════════════════════════════
          DIALOG: NEW HIRE DETAIL
          ═══════════════════════════════════════════════════════════ */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
          {selectedHire && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-4">
                  <Avatar className="h-14 w-14">
                    <AvatarFallback
                      className={`${getAvatarColor(selectedHire.id)} text-white text-lg font-bold`}
                    >
                      {getInitials(
                        selectedHire.firstName,
                        selectedHire.lastName
                      )}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <DialogTitle className="text-xl">
                      {selectedHire.firstName} {selectedHire.lastName}
                    </DialogTitle>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <Badge
                        className={`text-[10px] px-1.5 py-0 ${
                          getNewHireStatus(selectedHire).class
                        }`}
                      >
                        {getNewHireStatus(selectedHire).label}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {selectedHire.department?.name || "No Department"}
                      </span>
                      <span className="text-xs text-muted-foreground">&middot;</span>
                      <span className="text-xs text-muted-foreground capitalize">
                        {selectedHire.role}
                      </span>
                    </div>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-4 mt-2">
                {/* Info Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
                    <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span className="text-sm truncate">{selectedHire.email}</span>
                  </div>
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
                    <CalendarCheck className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span className="text-sm">
                      {selectedHire.hireDate
                        ? format(new Date(selectedHire.hireDate), "MMM d, yyyy")
                        : "TBD"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
                    <Building2 className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span className="text-sm truncate">
                      {selectedHire.department?.name || "Not assigned"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
                    <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span className="text-sm truncate">
                      {selectedHire.workLocation?.name || "Not assigned"}
                    </span>
                  </div>
                </div>

                <Separator />

                {/* Onboarding Progress */}
                <div>
                  <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                    <ClipboardCheck className="h-4 w-4 text-msbm-red" />
                    Onboarding Progress
                  </h3>
                  <div className="flex items-center gap-3 mb-4">
                    <Progress
                      value={getNewHireProgress(selectedHire)}
                      className="flex-1 h-3 [&>div]:bg-msbm-red/50"
                    />
                    <span className="text-sm font-bold text-msbm-red dark:text-msbm-red-bright">
                      {getNewHireProgress(selectedHire)}%
                    </span>
                  </div>
                </div>

                <Separator />

                {/* Onboarding Timeline / Checklist Preview */}
                <div>
                  <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                    <FileText className="h-4 w-4 text-teal-600" />
                    Onboarding Checklist
                  </h3>
                  <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                    {checklist.sections.map((section) => {
                      const SectionIcon = section.icon;
                      const sectionCompleted = section.items.filter((i) => i.completed).length;
                      const sectionTotal = section.items.length;

                      return (
                        <div
                          key={section.id}
                          className="rounded-lg border border-border/40 p-3"
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <SectionIcon className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="text-xs font-semibold">{section.title}</span>
                            <span className="text-[10px] text-muted-foreground ml-auto">
                              {sectionCompleted}/{sectionTotal}
                            </span>
                          </div>
                          <div className="space-y-1.5">
                            {section.items.map((item) => (
                              <div
                                key={item.id}
                                className="flex items-center gap-2"
                              >
                                <div
                                  className={`h-4 w-4 rounded-[4px] border flex items-center justify-center shrink-0 transition-colors duration-200 ${
                                    item.completed
                                      ? "bg-msbm-red/50 border-emerald-500"
                                      : "border-border bg-background"
                                  }`}
                                >
                                  {item.completed && (
                                    <CheckCircle2 className="h-3 w-3 text-white" />
                                  )}
                                </div>
                                <span
                                  className={`text-xs transition-colors duration-200 ${
                                    item.completed
                                      ? "text-msbm-red dark:text-msbm-red-bright line-through"
                                      : "text-muted-foreground"
                                  }`}
                                >
                                  {item.label}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* ═══════════════════════════════════════════════════════════
          DIALOG: APPLY TEMPLATE CONFIRMATION
          ═══════════════════════════════════════════════════════════ */}
      <Dialog open={templateDialogOpen} onOpenChange={setTemplateDialogOpen}>
        <DialogContent className="sm:max-w-[440px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <LayoutTemplate className="h-5 w-5 text-msbm-red" />
              Apply Onboarding Template
            </DialogTitle>
          </DialogHeader>
          {selectedTemplate && (
            <div className="space-y-4 py-2">
              <div className="p-4 rounded-lg border border-border/60 bg-muted/30">
                <h3 className="text-sm font-semibold flex items-center gap-2">
                  {(() => {
                    const Icon = selectedTemplate.icon;
                    return <Icon className={`h-4 w-4 ${selectedTemplate.colorClass}`} />;
                  })()}
                  {selectedTemplate.name}
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  {selectedTemplate.description}
                </p>
                <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
                  <span>{selectedTemplate.sections.length} phases</span>
                  <span>&middot;</span>
                  <span>
                    {selectedTemplate.sections.reduce(
                      (sum, s) => sum + s.items.length,
                      0
                    )}{" "}
                    tasks total
                  </span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                This will replace your current checklist with the template&apos;s
                checklist. All current progress will be reset.
              </p>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setTemplateDialogOpen(false);
                setSelectedTemplate(null);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={confirmApplyTemplate}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              Apply Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
