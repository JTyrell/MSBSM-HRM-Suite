"use client";

import React, { useState, useMemo } from "react";
import {
  GraduationCap,
  BookOpen,
  Clock,
  Users,
  Trophy,
  Flame,
  Star,
  CheckCircle2,
  PlayCircle,
  Lock,
  Award,
  ChevronRight,
  Target,
  Filter,
  Search,
  TrendingUp,
  BarChart3,
  Sparkles,
  Medal,
  Crown,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAppStore, type Employee } from "@/store/app";

// ============ TYPES ============

type Difficulty = "Beginner" | "Intermediate" | "Advanced";
type Category = "Compliance" | "Leadership" | "Soft Skills" | "Technical" | "Wellness";
type CourseStatus = "Not Started" | "In Progress" | "Completed";

interface Module {
  id: string;
  title: string;
  duration: string;
  isCompleted: boolean;
}

interface TrainingCourse {
  id: string;
  title: string;
  category: Category;
  difficulty: Difficulty;
  duration: string;
  enrolledCount: number;
  rating: number;
  description: string;
  objectives: string[];
  prerequisites: string[];
  modules: Module[];
  instructor: string;
}

interface Enrollment {
  courseId: string;
  progress: number;
  status: CourseStatus;
  enrolledAt: string;
  completedAt?: string;
  learningHours: number;
}

interface LeaderboardEntry {
  employeeId: string;
  name: string;
  department: string;
  coursesCompleted: number;
  totalHours: number;
  avatar: string;
}

// ============ MOCK DATA ============

const COURSES: TrainingCourse[] = [
  {
    id: "c1",
    title: "Workplace Safety Fundamentals",
    category: "Compliance",
    difficulty: "Beginner",
    duration: "2 hours",
    enrolledCount: 142,
    rating: 4.7,
    description: "Master essential workplace safety protocols, hazard identification, and emergency response procedures. This course covers OSHA standards, ergonomic best practices, and creating a culture of safety in the workplace.",
    objectives: ["Identify common workplace hazards", "Understand OSHA compliance requirements", "Implement emergency response protocols", "Apply ergonomic best practices", "Report safety incidents effectively"],
    prerequisites: ["None"],
    modules: [
      { id: "c1m1", title: "Understanding Workplace Hazards", duration: "25 min", isCompleted: false },
      { id: "c1m2", title: "OSHA Standards & Compliance", duration: "30 min", isCompleted: false },
      { id: "c1m3", title: "Emergency Response Procedures", duration: "35 min", isCompleted: false },
      { id: "c1m4", title: "Ergonomics & Injury Prevention", duration: "20 min", isCompleted: false },
    ],
    instructor: "Dr. Sarah Mitchell",
  },
  {
    id: "c2",
    title: "Anti-Harassment Training",
    category: "Compliance",
    difficulty: "Beginner",
    duration: "1.5 hours",
    enrolledCount: 198,
    rating: 4.8,
    description: "Comprehensive training on recognizing, preventing, and reporting harassment in the workplace. Learn about legal frameworks, company policies, and creating a respectful work environment for everyone.",
    objectives: ["Define workplace harassment and its forms", "Recognize signs of harassment", "Understand reporting procedures", "Know your legal rights and protections", "Foster a respectful workplace culture"],
    prerequisites: ["None"],
    modules: [
      { id: "c2m1", title: "What Constitutes Harassment", duration: "20 min", isCompleted: false },
      { id: "c2m2", title: "Types of Workplace Harassment", duration: "25 min", isCompleted: false },
      { id: "c2m3", title: "Reporting & Escalation Procedures", duration: "20 min", isCompleted: false },
      { id: "c2m4", title: "Building a Respectful Culture", duration: "15 min", isCompleted: false },
    ],
    instructor: "Lisa Thompson, J.D.",
  },
  {
    id: "c3",
    title: "Data Privacy & GDPR",
    category: "Compliance",
    difficulty: "Intermediate",
    duration: "3 hours",
    enrolledCount: 89,
    rating: 4.5,
    description: "Deep dive into data privacy regulations including GDPR, CCPA, and industry-specific requirements. Learn how to handle personal data responsibly and maintain compliance in daily operations.",
    objectives: ["Understand GDPR core principles", "Implement data protection measures", "Handle data subject requests", "Maintain records of processing activities", "Conduct privacy impact assessments"],
    prerequisites: ["Basic IT literacy"],
    modules: [
      { id: "c3m1", title: "Introduction to Data Privacy", duration: "30 min", isCompleted: false },
      { id: "c3m2", title: "GDPR Core Principles", duration: "40 min", isCompleted: false },
      { id: "c3m3", title: "Data Subject Rights & Requests", duration: "35 min", isCompleted: false },
      { id: "c3m4", title: "Privacy Impact Assessments", duration: "35 min", isCompleted: false },
      { id: "c3m5", title: "Practical Compliance Strategies", duration: "40 min", isCompleted: false },
    ],
    instructor: "Mark Chen, CIPP/E",
  },
  {
    id: "c4",
    title: "Leadership Excellence",
    category: "Leadership",
    difficulty: "Advanced",
    duration: "5 hours",
    enrolledCount: 67,
    rating: 4.9,
    description: "An advanced leadership development program covering strategic thinking, emotional intelligence, team dynamics, and executive decision-making. Designed for aspiring and current managers.",
    objectives: ["Develop strategic thinking capabilities", "Enhance emotional intelligence", "Master team dynamics and motivation", "Improve executive decision-making", "Build personal leadership brand"],
    prerequisites: ["2+ years of professional experience", "Currently in or aspiring to a management role"],
    modules: [
      { id: "c4m1", title: "Foundations of Modern Leadership", duration: "45 min", isCompleted: false },
      { id: "c4m2", title: "Emotional Intelligence for Leaders", duration: "50 min", isCompleted: false },
      { id: "c4m3", title: "Strategic Thinking & Vision", duration: "55 min", isCompleted: false },
      { id: "c4m4", title: "Team Dynamics & Motivation", duration: "45 min", isCompleted: false },
      { id: "c4m5", title: "Executive Decision-Making", duration: "55 min", isCompleted: false },
    ],
    instructor: "Patricia Williams, MBA",
  },
  {
    id: "c5",
    title: "Project Management Basics",
    category: "Leadership",
    difficulty: "Beginner",
    duration: "3.5 hours",
    enrolledCount: 124,
    rating: 4.6,
    description: "Learn the fundamentals of project management including planning, execution, monitoring, and closing. Covers agile and waterfall methodologies with practical tools and templates.",
    objectives: ["Understand project lifecycle phases", "Create effective project plans", "Manage project scope and timelines", "Apply agile and waterfall methodologies", "Use project management tools effectively"],
    prerequisites: ["None"],
    modules: [
      { id: "c5m1", title: "Project Management Fundamentals", duration: "40 min", isCompleted: false },
      { id: "c5m2", title: "Planning & Scheduling", duration: "45 min", isCompleted: false },
      { id: "c5m3", title: "Agile vs Waterfall", duration: "35 min", isCompleted: false },
      { id: "c5m4", title: "Risk Management", duration: "30 min", isCompleted: false },
      { id: "c5m5", title: "Project Closure & Review", duration: "20 min", isCompleted: false },
    ],
    instructor: "David Park, PMP",
  },
  {
    id: "c6",
    title: "Diversity & Inclusion Workshop",
    category: "Soft Skills",
    difficulty: "Beginner",
    duration: "2 hours",
    enrolledCount: 156,
    rating: 4.8,
    description: "Explore the importance of diversity and inclusion in the modern workplace. Learn to recognize unconscious bias, foster inclusive behaviors, and build equitable team environments.",
    objectives: ["Understand the value of diversity", "Recognize unconscious bias", "Develop inclusive communication skills", "Create equitable team environments", "Implement D&I best practices"],
    prerequisites: ["None"],
    modules: [
      { id: "c6m1", title: "The Business Case for Diversity", duration: "25 min", isCompleted: false },
      { id: "c6m2", title: "Unconscious Bias Awareness", duration: "30 min", isCompleted: false },
      { id: "c6m3", title: "Inclusive Communication", duration: "25 min", isCompleted: false },
      { id: "c6m4", title: "Building Equitable Teams", duration: "25 min", isCompleted: false },
    ],
    instructor: "Dr. Amara Johnson",
  },
  {
    id: "c7",
    title: "Communication Skills",
    category: "Soft Skills",
    difficulty: "Intermediate",
    duration: "3 hours",
    enrolledCount: 203,
    rating: 4.7,
    description: "Master professional communication including active listening, assertiveness, conflict communication, and presentation skills. Ideal for all career levels seeking to improve workplace interactions.",
    objectives: ["Practice active listening techniques", "Develop assertive communication", "Improve presentation skills", "Navigate difficult conversations", "Write effective professional emails"],
    prerequisites: ["None"],
    modules: [
      { id: "c7m1", title: "Foundations of Effective Communication", duration: "30 min", isCompleted: false },
      { id: "c7m2", title: "Active Listening & Empathy", duration: "35 min", isCompleted: false },
      { id: "c7m3", title: "Assertiveness & Boundaries", duration: "30 min", isCompleted: false },
      { id: "c7m4", title: "Presentation Mastery", duration: "40 min", isCompleted: false },
      { id: "c7m5", title: "Written Communication", duration: "25 min", isCompleted: false },
    ],
    instructor: "Rachel Foster",
  },
  {
    id: "c8",
    title: "Time Management Mastery",
    category: "Soft Skills",
    difficulty: "Beginner",
    duration: "2 hours",
    enrolledCount: 178,
    rating: 4.5,
    description: "Learn proven time management techniques including the Eisenhower Matrix, Pomodoro Technique, and time-blocking. Boost productivity and reduce stress by taking control of your schedule.",
    objectives: ["Apply the Eisenhower Matrix", "Use the Pomodoro Technique", "Implement time-blocking strategies", "Prioritize tasks effectively", "Manage email and meeting overload"],
    prerequisites: ["None"],
    modules: [
      { id: "c8m1", title: "Time Management Principles", duration: "20 min", isCompleted: false },
      { id: "c8m2", title: "The Eisenhower Matrix", duration: "25 min", isCompleted: false },
      { id: "c8m3", title: "Pomodoro & Time-Blocking", duration: "30 min", isCompleted: false },
      { id: "c8m4", title: "Managing Digital Distractions", duration: "25 min", isCompleted: false },
    ],
    instructor: "James Wilson",
  },
  {
    id: "c9",
    title: "Financial Wellness",
    category: "Wellness",
    difficulty: "Beginner",
    duration: "2.5 hours",
    enrolledCount: 134,
    rating: 4.6,
    description: "Build a strong financial foundation with topics covering budgeting, saving strategies, retirement planning, investment basics, and debt management. Empower yourself with financial literacy.",
    objectives: ["Create a personal budget", "Build an emergency fund strategy", "Understand retirement planning options", "Learn investment basics", "Develop a debt management plan"],
    prerequisites: ["None"],
    modules: [
      { id: "c9m1", title: "Financial Literacy Foundations", duration: "30 min", isCompleted: false },
      { id: "c9m2", title: "Budgeting & Saving Strategies", duration: "35 min", isCompleted: false },
      { id: "c9m3", title: "Retirement Planning 101", duration: "30 min", isCompleted: false },
      { id: "c9m4", title: "Investment Fundamentals", duration: "35 min", isCompleted: false },
    ],
    instructor: "Michael Torres, CFP",
  },
  {
    id: "c10",
    title: "Cybersecurity Awareness",
    category: "Technical",
    difficulty: "Intermediate",
    duration: "2.5 hours",
    enrolledCount: 167,
    rating: 4.8,
    description: "Essential cybersecurity training covering phishing, social engineering, password security, and data protection. Learn to identify threats and protect yourself and the organization from cyber attacks.",
    objectives: ["Identify phishing and social engineering attacks", "Implement strong password practices", "Recognize malware and ransomware threats", "Secure remote work environments", "Report security incidents properly"],
    prerequisites: ["Basic computer literacy"],
    modules: [
      { id: "c10m1", title: "The Cyber Threat Landscape", duration: "25 min", isCompleted: false },
      { id: "c10m2", title: "Phishing & Social Engineering", duration: "35 min", isCompleted: false },
      { id: "c10m3", title: "Password Security & MFA", duration: "25 min", isCompleted: false },
      { id: "c10m4", title: "Secure Remote Work Practices", duration: "30 min", isCompleted: false },
      { id: "c10m5", title: "Incident Reporting", duration: "15 min", isCompleted: false },
    ],
    instructor: "Alex Rivera, CISSP",
  },
  {
    id: "c11",
    title: "Conflict Resolution",
    category: "Soft Skills",
    difficulty: "Intermediate",
    duration: "2 hours",
    enrolledCount: 91,
    rating: 4.6,
    description: "Develop skills to navigate and resolve workplace conflicts effectively. Learn mediation techniques, de-escalation strategies, and how to turn conflicts into opportunities for growth.",
    objectives: ["Understand conflict styles and triggers", "Apply mediation techniques", "Practice de-escalation strategies", "Facilitate productive discussions", "Build stronger workplace relationships"],
    prerequisites: ["Communication Skills recommended"],
    modules: [
      { id: "c11m1", title: "Understanding Workplace Conflict", duration: "25 min", isCompleted: false },
      { id: "c11m2", title: "Conflict Styles & Assessment", duration: "25 min", isCompleted: false },
      { id: "c11m3", title: "Mediation & Resolution Techniques", duration: "30 min", isCompleted: false },
      { id: "c11m4", title: "Building Resilient Relationships", duration: "20 min", isCompleted: false },
    ],
    instructor: "Dr. Karen Lee",
  },
  {
    id: "c12",
    title: "Customer Service Excellence",
    category: "Soft Skills",
    difficulty: "Beginner",
    duration: "2.5 hours",
    enrolledCount: 145,
    rating: 4.7,
    description: "Master the art of exceptional customer service. Learn to handle difficult customers, exceed expectations, and create memorable experiences that build lasting customer loyalty.",
    objectives: ["Deliver exceptional customer experiences", "Handle difficult customer situations", "Exceed customer expectations", "Build customer loyalty", "Use feedback for continuous improvement"],
    prerequisites: ["None"],
    modules: [
      { id: "c12m1", title: "Customer-Centric Mindset", duration: "25 min", isCompleted: false },
      { id: "c12m2", title: "Communication & Active Listening", duration: "30 min", isCompleted: false },
      { id: "c12m3", title: "Handling Difficult Situations", duration: "35 min", isCompleted: false },
      { id: "c12m4", title: "Going Above & Beyond", duration: "25 min", isCompleted: false },
      { id: "c12m5", title: "Feedback & Continuous Improvement", duration: "25 min", isCompleted: false },
    ],
    instructor: "Nicole Adams",
  },
];

const DIFFICULTY_STYLES: Record<Difficulty, string> = {
  Beginner: "bg-msbm-red/10 text-msbm-red dark:bg-msbm-red/20 dark:text-msbm-red-bright",
  Intermediate: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  Advanced: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400",
};

const CATEGORY_COLORS: Record<Category, string> = {
  Compliance: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  Leadership: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  "Soft Skills": "bg-msbm-red/10 text-msbm-red dark:bg-msbm-red/20 dark:text-msbm-red-bright",
  Technical: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400",
  Wellness: "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400",
};

const CATEGORY_ICONS: Record<Category, string> = {
  Compliance: "shield",
  Leadership: "crown",
  "Soft Skills": "heart",
  Technical: "cpu",
  Wellness: "sun",
};

// ============ COMPONENT ============

export function TrainingView() {
  const { employees } = useAppStore();

  const [activeTab, setActiveTab] = useState("courses");
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [difficultyFilter, setDifficultyFilter] = useState<string>("all");
  const [selectedCourse, setSelectedCourse] = useState<TrainingCourse | null>(null);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([
    { courseId: "c1", progress: 75, status: "In Progress", enrolledAt: "2025-11-15", learningHours: 1.5 },
    { courseId: "c2", progress: 100, status: "Completed", enrolledAt: "2025-10-20", completedAt: "2025-10-28", learningHours: 1.5 },
    { courseId: "c6", progress: 45, status: "In Progress", enrolledAt: "2025-12-01", learningHours: 0.9 },
    { courseId: "c10", progress: 20, status: "In Progress", enrolledAt: "2025-12-10", learningHours: 0.5 },
    { courseId: "c8", progress: 100, status: "Completed", enrolledAt: "2025-09-10", completedAt: "2025-09-15", learningHours: 2.0 },
  ]);

  // Generate leaderboard data from employees using useMemo
  const leaderboardData = useMemo<LeaderboardEntry[]>(() => {
    if (employees.length === 0) return [];
    return employees
      .slice(0, 10)
      .map((emp, idx) => ({
        employeeId: emp.id,
        name: `${emp.firstName} ${emp.lastName}`,
        department: emp.department?.name || "Engineering",
        coursesCompleted: Math.max(0, 12 - idx + Math.floor(Math.random() * 3)),
        totalHours: Math.max(5, 48 - idx * 4 + Math.floor(Math.random() * 8)),
        avatar: `${emp.firstName[0]}${emp.lastName[0]}`,
      }))
      .sort((a, b) => b.coursesCompleted - a.coursesCompleted || b.totalHours - a.totalHours);
  }, [employees]);

  // Filtered courses
  const filteredCourses = useMemo(() => {
    return COURSES.filter((c) => {
      const matchesSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = categoryFilter === "all" || c.category === categoryFilter;
      const matchesDifficulty = difficultyFilter === "all" || c.difficulty === difficultyFilter;
      return matchesSearch && matchesCategory && matchesDifficulty;
    });
  }, [searchQuery, categoryFilter, difficultyFilter]);

  // Stats
  const totalCourses = COURSES.length;
  const completedCourses = enrollments.filter((e) => e.status === "Completed").length;
  const inProgressCourses = enrollments.filter((e) => e.status === "In Progress").length;
  const totalLearningHours = enrollments.reduce((sum, e) => sum + e.learningHours, 0);
  const learningStreak = 7; // Mock streak

  const getEnrollment = (courseId: string) => enrollments.find((e) => e.courseId === courseId);

  const handleEnroll = (courseId: string) => {
    const existing = getEnrollment(courseId);
    if (existing) return;
    setEnrollments((prev) => [
      ...prev,
      { courseId, progress: 0, status: "In Progress", enrolledAt: new Date().toISOString().split("T")[0], learningHours: 0 },
    ]);
  };

  const handleContinueLearning = (courseId: string) => {
    setEnrollments((prev) =>
      prev.map((e) => {
        if (e.courseId !== courseId || e.status === "Completed") return e;
        const newProgress = Math.min(100, e.progress + 15 + Math.floor(Math.random() * 10));
        const isComplete = newProgress >= 100;
        return {
          ...e,
          progress: newProgress,
          status: isComplete ? "Completed" : "In Progress",
          completedAt: isComplete ? new Date().toISOString().split("T")[0] : undefined,
          learningHours: e.learningHours + 0.5,
        };
      })
    );
  };

  const statCards = [
    { label: "Total Courses", value: totalCourses, icon: BookOpen, color: "text-msbm-red dark:text-msbm-red-bright", bg: "bg-msbm-red/10 dark:bg-msbm-red/20" },
    { label: "Completed", value: completedCourses, icon: CheckCircle2, color: "text-msbm-red dark:text-msbm-red-bright", bg: "bg-msbm-red/10 dark:bg-msbm-red/20" },
    { label: "In Progress", value: inProgressCourses, icon: PlayCircle, color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-100 dark:bg-amber-900/30" },
    { label: "Learning Hours", value: totalLearningHours.toFixed(1), icon: Clock, color: "text-purple-600 dark:text-purple-400", bg: "bg-purple-100 dark:bg-purple-900/30" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-msbm-red to-msbm-red flex items-center justify-center">
              <GraduationCap className="w-4.5 h-4.5 text-white" />
            </div>
            Training & Learning
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Develop skills and advance your career</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400">
            <Flame className="w-4 h-4" />
            <span className="text-sm font-semibold">{learningStreak} day streak</span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <Card key={stat.label} className="card-elevated card-lift">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center`}>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="courses" className="gap-1.5">
            <BookOpen className="w-4 h-4" />
            <span className="hidden sm:inline">Courses</span>
          </TabsTrigger>
          <TabsTrigger value="my-learning" className="gap-1.5">
            <TrendingUp className="w-4 h-4" />
            <span className="hidden sm:inline">My Learning</span>
          </TabsTrigger>
          <TabsTrigger value="leaderboard" className="gap-1.5">
            <Trophy className="w-4 h-4" />
            <span className="hidden sm:inline">Leaderboard</span>
          </TabsTrigger>
        </TabsList>

        {/* COURSES TAB */}
        <TabsContent value="courses" className="mt-6 space-y-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search courses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-44">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="Compliance">Compliance</SelectItem>
                <SelectItem value="Leadership">Leadership</SelectItem>
                <SelectItem value="Soft Skills">Soft Skills</SelectItem>
                <SelectItem value="Technical">Technical</SelectItem>
                <SelectItem value="Wellness">Wellness</SelectItem>
              </SelectContent>
            </Select>
            <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
              <SelectTrigger className="w-full sm:w-44">
                <BarChart3 className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="Beginner">Beginner</SelectItem>
                <SelectItem value="Intermediate">Intermediate</SelectItem>
                <SelectItem value="Advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Course Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredCourses.map((course) => {
              const enrollment = getEnrollment(course.id);
              return (
                <Card
                  key={course.id}
                  className="card-elevated card-lift cursor-pointer group overflow-hidden"
                  onClick={() => setSelectedCourse(course)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="secondary" className={CATEGORY_COLORS[course.category]}>
                            {course.category}
                          </Badge>
                          <Badge variant="secondary" className={DIFFICULTY_STYLES[course.difficulty]}>
                            {course.difficulty}
                          </Badge>
                        </div>
                        <CardTitle className="text-base leading-snug group-hover:text-msbm-red dark:group-hover:text-msbm-red-bright transition-colors">
                          {course.title}
                        </CardTitle>
                      </div>
                    </div>
                    <CardDescription className="line-clamp-2 mt-1">
                      {course.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0 space-y-3">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {course.duration}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5" />
                        {course.enrolledCount} enrolled
                      </span>
                      <span className="flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                        {course.rating}
                      </span>
                    </div>
                    {enrollment && (
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">Progress</span>
                          <span className="font-medium">{enrollment.progress}%</span>
                        </div>
                        <Progress value={enrollment.progress} className="h-2" />
                        {enrollment.status === "Completed" && (
                          <div className="flex items-center gap-1 text-xs text-msbm-red dark:text-msbm-red-bright font-medium">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Completed
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {filteredCourses.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
                <BookOpen className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold">No courses found</h3>
              <p className="text-sm text-muted-foreground mt-1">Try adjusting your search or filters</p>
            </div>
          )}
        </TabsContent>

        {/* MY LEARNING TAB */}
        <TabsContent value="my-learning" className="mt-6 space-y-4">
          {/* Streak & Summary */}
          <Card className="card-elevated">
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                    <Flame className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{learningStreak} Day Learning Streak</p>
                    <p className="text-sm text-muted-foreground">Keep it going! You&apos;re on fire! 🔥</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <div className="text-center">
                    <p className="text-lg font-bold text-msbm-red dark:text-msbm-red-bright">{completedCourses}</p>
                    <p className="text-xs text-muted-foreground">Completed</p>
                  </div>
                  <Separator orientation="vertical" className="h-8" />
                  <div className="text-center">
                    <p className="text-lg font-bold text-amber-600 dark:text-amber-400">{inProgressCourses}</p>
                    <p className="text-xs text-muted-foreground">In Progress</p>
                  </div>
                  <Separator orientation="vertical" className="h-8" />
                  <div className="text-center">
                    <p className="text-lg font-bold text-purple-600 dark:text-purple-400">{totalLearningHours.toFixed(1)}h</p>
                    <p className="text-xs text-muted-foreground">Total Hours</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Enrolled Courses */}
          <div className="space-y-3">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-msbm-red dark:text-msbm-red-bright" />
              In Progress
            </h2>
            {enrollments
              .filter((e) => e.status === "In Progress")
              .map((enrollment) => {
                const course = COURSES.find((c) => c.id === enrollment.courseId);
                if (!course) return null;
                return (
                  <Card key={enrollment.courseId} className="card-elevated">
                    <CardContent className="p-4">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                        <div
                          className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 cursor-pointer"
                          onClick={() => setSelectedCourse(course)}
                        >
                          {course.category === "Compliance" && (
                            <div className="w-full h-full rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                              <Sparkles className="w-5 h-5 text-red-600 dark:text-red-400" />
                            </div>
                          )}
                          {course.category === "Leadership" && (
                            <div className="w-full h-full rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                              <Crown className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                            </div>
                          )}
                          {course.category === "Soft Skills" && (
                            <div className="w-full h-full rounded-xl bg-msbm-red/10 dark:bg-msbm-red/20 flex items-center justify-center">
                              <Target className="w-5 h-5 text-msbm-red dark:text-msbm-red-bright" />
                            </div>
                          )}
                          {course.category === "Technical" && (
                            <div className="w-full h-full rounded-xl bg-cyan-100 dark:bg-cyan-900/30 flex items-center justify-center">
                              <GraduationCap className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                            </div>
                          )}
                          {course.category === "Wellness" && (
                            <div className="w-full h-full rounded-xl bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center">
                              <Lock className="w-5 h-5 text-pink-600 dark:text-pink-400" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3
                              className="font-semibold text-sm cursor-pointer hover:text-msbm-red dark:hover:text-msbm-red-bright transition-colors"
                              onClick={() => setSelectedCourse(course)}
                            >
                              {course.title}
                            </h3>
                            <Badge variant="secondary" className={DIFFICULTY_STYLES[course.difficulty]}>
                              {course.difficulty}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mb-2">
                            {course.modules.length} modules • {course.duration} • {course.instructor}
                          </p>
                          <div className="flex items-center gap-3">
                            <Progress value={enrollment.progress} className="h-2 flex-1" />
                            <span className="text-sm font-semibold text-msbm-red dark:text-msbm-red-bright w-12 text-right">
                              {enrollment.progress}%
                            </span>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          className="bg-gradient-to-r from-msbm-red to-msbm-red hover:from-msbm-red-bright hover:to-msbm-red text-white shrink-0"
                          onClick={() => handleContinueLearning(course.id)}
                        >
                          <PlayCircle className="w-4 h-4 mr-1.5" />
                          Continue
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}

            {enrollments.filter((e) => e.status === "In Progress").length === 0 && (
              <Card className="card-elevated">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
                    <BookOpen className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground">No courses in progress</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-3"
                    onClick={() => setActiveTab("courses")}
                  >
                    Browse Courses
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Completed */}
          {enrollments.filter((e) => e.status === "Completed").length > 0 && (
            <div className="space-y-3">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-msbm-red dark:text-msbm-red-bright" />
                Completed
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {enrollments
                  .filter((e) => e.status === "Completed")
                  .map((enrollment) => {
                    const course = COURSES.find((c) => c.id === enrollment.courseId);
                    if (!course) return null;
                    return (
                      <Card key={enrollment.courseId} className="card-elevated">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-lg bg-msbm-red/10 dark:bg-msbm-red/20 flex items-center justify-center shrink-0">
                              <Award className="w-5 h-5 text-msbm-red dark:text-msbm-red-bright" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-sm">{course.title}</h3>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                Completed {enrollment.completedAt} • {enrollment.learningHours}h
                              </p>
                              <div className="flex items-center gap-2 mt-2">
                                <Badge variant="secondary" className="bg-msbm-red/10 text-msbm-red dark:bg-msbm-red/20 dark:text-msbm-red-bright text-xs">
                                  <CheckCircle2 className="w-3 h-3 mr-1" />
                                  Certified
                                </Badge>
                                <Badge variant="secondary" className="text-xs">
                                  {course.category}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
              </div>
            </div>
          )}
        </TabsContent>

        {/* LEADERBOARD TAB */}
        <TabsContent value="leaderboard" className="mt-6 space-y-4">
          <Card className="card-elevated">
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                  <Trophy className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="font-semibold">Top Learners</h2>
                  <p className="text-xs text-muted-foreground">Employees ranked by courses completed and learning hours</p>
                </div>
              </div>
              <ScrollArea className="max-h-[500px]">
                <div className="space-y-2">
                  {leaderboardData.map((entry, idx) => {
                    const rank = idx + 1;
                    const isTop3 = rank <= 3;
                    return (
                      <div
                        key={entry.employeeId}
                        className={`flex items-center gap-4 p-3 rounded-xl transition-all ${
                          isTop3
                            ? "bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border border-msbm-red/20 dark:border-msbm-red/20"
                            : "hover:bg-accent/50"
                        }`}
                      >
                        <div className="w-8 text-center shrink-0">
                          {rank === 1 && <Medal className="w-7 h-7 text-amber-500 mx-auto" />}
                          {rank === 2 && <Medal className="w-7 h-7 text-gray-400 mx-auto" />}
                          {rank === 3 && <Medal className="w-7 h-7 text-amber-700 mx-auto" />}
                          {!isTop3 && <span className="text-sm font-bold text-muted-foreground">#{rank}</span>}
                        </div>
                        <Avatar className="w-9 h-9 shrink-0">
                          <AvatarFallback
                            className={
                              rank === 1
                                ? "bg-gradient-to-br from-amber-400 to-orange-500 text-white font-bold text-xs"
                                : rank === 2
                                  ? "bg-gradient-to-br from-gray-300 to-gray-500 text-white font-bold text-xs"
                                  : rank === 3
                                    ? "bg-gradient-to-br from-amber-600 to-amber-800 text-white font-bold text-xs"
                                    : "bg-muted font-medium text-xs"
                            }
                          >
                            {entry.avatar}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold truncate">{entry.name}</p>
                          <p className="text-xs text-muted-foreground">{entry.department}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-sm font-bold">{entry.coursesCompleted}</p>
                          <p className="text-[10px] text-muted-foreground">courses</p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-sm font-bold">{entry.totalHours}h</p>
                          <p className="text-[10px] text-muted-foreground">hours</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* COURSE DETAIL DIALOG */}
      <Dialog open={!!selectedCourse} onOpenChange={(open) => !open && setSelectedCourse(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
          {selectedCourse && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="secondary" className={CATEGORY_COLORS[selectedCourse.category]}>
                    {selectedCourse.category}
                  </Badge>
                  <Badge variant="secondary" className={DIFFICULTY_STYLES[selectedCourse.difficulty]}>
                    {selectedCourse.difficulty}
                  </Badge>
                </div>
                <DialogTitle className="text-xl">{selectedCourse.title}</DialogTitle>
                <DialogDescription className="flex items-center gap-3 text-sm">
                  <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{selectedCourse.duration}</span>
                  <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />{selectedCourse.enrolledCount} enrolled</span>
                  <span className="flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />{selectedCourse.rating}
                  </span>
                </DialogDescription>
              </DialogHeader>

              <ScrollArea className="flex-1 -mx-6 px-6">
                <div className="space-y-6 pb-4">
                  {/* Description */}
                  <div>
                    <h3 className="text-sm font-semibold mb-2">About This Course</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{selectedCourse.description}</p>
                    <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" />
                      Instructor: {selectedCourse.instructor}
                    </p>
                  </div>

                  <Separator />

                  {/* Learning Objectives */}
                  <div>
                    <h3 className="text-sm font-semibold mb-3 flex items-center gap-1.5">
                      <Target className="w-4 h-4 text-msbm-red dark:text-msbm-red-bright" />
                      Learning Objectives
                    </h3>
                    <ul className="space-y-2">
                      {selectedCourse.objectives.map((obj, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <CheckCircle2 className="w-4 h-4 text-msbm-red mt-0.5 shrink-0" />
                          {obj}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Separator />

                  {/* Prerequisites */}
                  <div>
                    <h3 className="text-sm font-semibold mb-2 flex items-center gap-1.5">
                      <Lock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                      Prerequisites
                    </h3>
                    <ul className="space-y-1">
                      {selectedCourse.prerequisites.map((pre, idx) => (
                        <li key={idx} className="text-sm text-muted-foreground flex items-center gap-2">
                          <ChevronRight className="w-3.5 h-3.5" />
                          {pre}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Separator />

                  {/* Curriculum */}
                  <div>
                    <h3 className="text-sm font-semibold mb-3 flex items-center gap-1.5">
                      <BookOpen className="w-4 h-4 text-msbm-red dark:text-msbm-red-bright" />
                      Curriculum ({selectedCourse.modules.length} modules)
                    </h3>
                    <div className="space-y-2">
                      {selectedCourse.modules.map((mod, idx) => (
                        <div
                          key={mod.id}
                          className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                        >
                          <div className="w-7 h-7 rounded-full bg-msbm-red/10 dark:bg-msbm-red/20 text-msbm-red dark:text-msbm-red-bright flex items-center justify-center text-xs font-bold shrink-0">
                            {idx + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium">{mod.title}</p>
                            <p className="text-xs text-muted-foreground">{mod.duration}</p>
                          </div>
                          <PlayCircle className="w-4 h-4 text-muted-foreground shrink-0" />
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  {/* Quizzes placeholder */}
                  <div>
                    <h3 className="text-sm font-semibold mb-2 flex items-center gap-1.5">
                      <BarChart3 className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                      Assessments
                    </h3>
                    <div className="p-4 rounded-lg bg-muted/50 text-center">
                      <p className="text-sm text-muted-foreground">
                        Complete all modules to unlock the final assessment quiz.
                      </p>
                      <Badge variant="secondary" className="mt-2 bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
                        📝 Quiz Available After Completion
                      </Badge>
                    </div>
                  </div>
                </div>
              </ScrollArea>

              {/* Enroll Button */}
              <div className="border-t border-border pt-4">
                {(() => {
                  const enrollment = getEnrollment(selectedCourse.id);
                  if (enrollment?.status === "Completed") {
                    return (
                      <Button className="w-full" variant="outline" disabled>
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        Course Completed
                      </Button>
                    );
                  }
                  if (enrollment?.status === "In Progress") {
                    return (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Progress</span>
                          <span className="font-semibold">{enrollment.progress}%</span>
                        </div>
                        <Progress value={enrollment.progress} className="h-2" />
                        <Button
                          className="w-full bg-gradient-to-r from-msbm-red to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white"
                          onClick={() => handleContinueLearning(selectedCourse.id)}
                        >
                          <PlayCircle className="w-4 h-4 mr-2" />
                          Continue Learning
                        </Button>
                      </div>
                    );
                  }
                  return (
                    <Button
                      className="w-full bg-gradient-to-r from-msbm-red to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white"
                      onClick={() => handleEnroll(selectedCourse.id)}
                    >
                      <GraduationCap className="w-4 h-4 mr-2" />
                      Enroll in Course
                    </Button>
                  );
                })()}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
