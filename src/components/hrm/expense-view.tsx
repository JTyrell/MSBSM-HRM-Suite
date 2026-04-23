"use client";

import React, { useState, useMemo } from "react";
import {
  Receipt,
  Plus,
  DollarSign,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  Upload,
  Filter,
  Search,
  ArrowUpDown,
  TrendingUp,
  AlertTriangle,
  ChevronDown,
  FileText,
  CreditCard,
  Plane,
  Utensils,
  Package,
  GraduationCap,
  MoreHorizontal,
  ArrowUpRight,
  ArrowDownRight,
  Ban,
  Eye,
  MessageSquare,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useAppStore } from "@/store/app";

// ============ TYPES ============

type ExpenseType = "Travel" | "Meals" | "Office Supplies" | "Software/Tools" | "Training" | "Miscellaneous";
type ExpenseStatus = "Pending" | "Approved" | "Rejected" | "Processing";

interface ExpenseRecord {
  id: string;
  type: ExpenseType;
  amount: number;
  date: string;
  description: string;
  status: ExpenseStatus;
  submittedBy: string;
  submittedByName: string;
  receiptName?: string;
  notes?: string;
  approvedBy?: string;
  approvedAt?: string;
  rejectedReason?: string;
}

// ============ MOCK DATA ============

const INITIAL_EXPENSES: ExpenseRecord[] = [
  {
    id: "exp-001", type: "Travel", amount: 1245.00, date: "2025-12-15",
    description: "Round-trip flight to NYC for client meeting + hotel (3 nights)", status: "Approved",
    submittedBy: "emp-001", submittedByName: "Marcus Chen",
    receiptName: "flight_hotel_receipt.pdf", approvedBy: "Sarah Johnson", approvedAt: "2025-12-17",
  },
  {
    id: "exp-002", type: "Meals", amount: 89.50, date: "2025-12-14",
    description: "Team lunch at Olive Garden - quarterly review meeting", status: "Approved",
    submittedBy: "emp-001", submittedByName: "Marcus Chen",
    receiptName: "olive_garden_receipt.jpg", approvedBy: "Sarah Johnson", approvedAt: "2025-12-15",
  },
  {
    id: "exp-003", type: "Software/Tools", amount: 599.00, date: "2025-12-12",
    description: "Annual Figma Pro license renewal for design team", status: "Pending",
    submittedBy: "emp-003", submittedByName: "Aisha Patel",
    receiptName: "figma_invoice.pdf",
  },
  {
    id: "exp-004", type: "Office Supplies", amount: 234.75, date: "2025-12-10",
    description: "Standing desk converter, ergonomic keyboard, and monitor riser", status: "Processing",
    submittedBy: "emp-005", submittedByName: "Emily Rodriguez",
    receiptName: "amazon_receipt.pdf",
  },
  {
    id: "exp-005", type: "Travel", amount: 456.30, date: "2025-12-08",
    description: "Uber rides and parking for off-site team building event", status: "Approved",
    submittedBy: "emp-002", submittedByName: "Sarah Johnson",
    approvedBy: "Marcus Chen", approvedAt: "2025-12-10",
  },
  {
    id: "exp-006", type: "Training", amount: 1200.00, date: "2025-12-05",
    description: "AWS Solutions Architect certification exam + prep course", status: "Pending",
    submittedBy: "emp-004", submittedByName: "James Wilson",
    receiptName: "aws_certification_invoice.pdf",
  },
  {
    id: "exp-007", type: "Meals", amount: 156.80, date: "2025-12-03",
    description: "Client dinner at The Capital Grille - project kickoff", status: "Rejected",
    submittedBy: "emp-006", submittedByName: "Michael Torres",
    rejectedReason: "Exceeds per-person meal allowance of $75. Please resubmit with corrected amount.",
  },
  {
    id: "exp-008", type: "Software/Tools", amount: 180.00, date: "2025-11-28",
    description: "Notion team workspace upgrade - 12-month subscription", status: "Approved",
    submittedBy: "emp-008", submittedByName: "Lisa Thompson",
    approvedBy: "Sarah Johnson", approvedAt: "2025-11-30",
  },
  {
    id: "exp-009", type: "Miscellaneous", amount: 75.00, date: "2025-11-25",
    description: "Holiday party decorations and supplies for team event", status: "Approved",
    submittedBy: "emp-010", submittedByName: "Rachel Foster",
    approvedBy: "Marcus Chen", approvedAt: "2025-11-27",
  },
  {
    id: "exp-010", type: "Travel", amount: 890.00, date: "2025-11-20",
    description: "Conference registration + accommodation - Tech Summit 2025", status: "Pending",
    submittedBy: "emp-003", submittedByName: "Aisha Patel",
    receiptName: "techsummit_reg.pdf",
  },
  {
    id: "exp-011", type: "Office Supplies", amount: 412.50, date: "2025-11-18",
    description: "Bulk order: notebooks, pens, sticky notes, and whiteboard markers", status: "Processing",
    submittedBy: "emp-012", submittedByName: "Karen Lee",
    receiptName: "staples_order.pdf",
  },
  {
    id: "exp-012", type: "Training", amount: 349.99, date: "2025-11-15",
    description: "LinkedIn Learning annual subscription - leadership track", status: "Approved",
    submittedBy: "emp-001", submittedByName: "Marcus Chen",
    approvedBy: "Sarah Johnson", approvedAt: "2025-11-17",
  },
  {
    id: "exp-013", type: "Meals", amount: 67.25, date: "2025-11-12",
    description: "Working lunch - vendor demonstration (4 team members)", status: "Pending",
    submittedBy: "emp-007", submittedByName: "David Park",
  },
  {
    id: "exp-014", type: "Miscellaneous", amount: 150.00, date: "2025-11-10",
    description: "Professional headshot photography session for team bios", status: "Rejected",
    submittedBy: "emp-009", submittedByName: "Nicole Adams",
    rejectedReason: "Not pre-approved. Please submit a request before incurring the expense.",
  },
];

const EXPENSE_TYPE_ICONS: Record<ExpenseType, React.ReactNode> = {
  Travel: <Plane className="w-4 h-4" />,
  Meals: <Utensils className="w-4 h-4" />,
  "Office Supplies": <Package className="w-4 h-4" />,
  "Software/Tools": <CreditCard className="w-4 h-4" />,
  Training: <GraduationCap className="w-4 h-4" />,
  Miscellaneous: <FileText className="w-4 h-4" />,
};

const EXPENSE_TYPE_COLORS: Record<ExpenseType, string> = {
  Travel: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  Meals: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  "Office Supplies": "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  "Software/Tools": "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  Training: "bg-msbm-red/10 text-msbm-red dark:bg-msbm-red/20 dark:text-msbm-red-bright",
  Miscellaneous: "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400",
};

const STATUS_STYLES: Record<ExpenseStatus, string> = {
  Pending: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  Approved: "bg-msbm-red/10 text-msbm-red dark:bg-msbm-red/20 dark:text-msbm-red-bright",
  Rejected: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400",
  Processing: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
};

const STATUS_ICONS: Record<ExpenseStatus, React.ReactNode> = {
  Pending: <Clock className="w-3.5 h-3.5" />,
  Approved: <CheckCircle2 className="w-3.5 h-3.5" />,
  Rejected: <XCircle className="w-3.5 h-3.5" />,
  Processing: <Loader2 className="w-3.5 h-3.5 animate-spin" />,
};

// ============ COMPONENT ============

export function ExpenseView() {
  const { currentUserId, employees } = useAppStore();
  const currentUser = employees.find((e) => e.id === currentUserId);

  const [expenses, setExpenses] = useState<ExpenseRecord[]>(INITIAL_EXPENSES);
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"date" | "amount">("date");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  // Submit dialog
  const [submitDialogOpen, setSubmitDialogOpen] = useState(false);
  const [newExpense, setNewExpense] = useState({
    type: "" as ExpenseType | "",
    amount: "",
    date: new Date().toISOString().split("T")[0],
    description: "",
    receiptName: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Detail dialog
  const [detailExpense, setDetailExpense] = useState<ExpenseRecord | null>(null);

  // Approval
  const [approveRejectId, setApproveRejectId] = useState<string | null>(null);
  const [approveRejectAction, setApproveRejectAction] = useState<"approve" | "reject" | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  const isAdminOrManager = currentUser?.role === "admin" || currentUser?.role === "manager" || currentUser?.role === "hr";

  // Filtered and sorted expenses
  const filteredExpenses = useMemo(() => {
    let result = [...expenses];

    // Filter by tab
    if (activeTab === "my") {
      result = result.filter((e) => e.submittedBy === currentUserId);
    } else if (activeTab === "approvals" && isAdminOrManager) {
      result = result.filter((e) => e.status === "Pending");
    }

    // Search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (e) =>
          e.description.toLowerCase().includes(q) ||
          e.type.toLowerCase().includes(q) ||
          e.submittedByName.toLowerCase().includes(q)
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      result = result.filter((e) => e.status === statusFilter);
    }

    // Type filter
    if (typeFilter !== "all") {
      result = result.filter((e) => e.type === typeFilter);
    }

    // Sort
    result.sort((a, b) => {
      const mult = sortDir === "desc" ? -1 : 1;
      if (sortBy === "date") return mult * (new Date(a.date).getTime() - new Date(b.date).getTime());
      return mult * (a.amount - b.amount);
    });

    return result;
  }, [expenses, activeTab, searchQuery, statusFilter, typeFilter, sortBy, sortDir, currentUserId, isAdminOrManager]);

  // Stats
  const totalSubmitted = expenses.reduce((sum, e) => sum + e.amount, 0);
  const totalPending = expenses.filter((e) => e.status === "Pending").reduce((sum, e) => sum + e.amount, 0);
  const totalApproved = expenses.filter((e) => e.status === "Approved").reduce((sum, e) => sum + e.amount, 0);
  const totalRejected = expenses.filter((e) => e.status === "Rejected").reduce((sum, e) => sum + e.amount, 0);
  const pendingCount = expenses.filter((e) => e.status === "Pending").length;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);
  };

  const toggleSort = (field: "date" | "amount") => {
    if (sortBy === field) {
      setSortDir((prev) => (prev === "desc" ? "asc" : "desc"));
    } else {
      setSortBy(field);
      setSortDir("desc");
    }
  };

  const handleSubmitExpense = async () => {
    if (!newExpense.type || !newExpense.amount || !newExpense.description) return;
    setIsSubmitting(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1200));
    const record: ExpenseRecord = {
      id: `exp-${Date.now()}`,
      type: newExpense.type as ExpenseType,
      amount: parseFloat(newExpense.amount),
      date: newExpense.date,
      description: newExpense.description,
      status: "Pending",
      submittedBy: currentUserId,
      submittedByName: currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : "Unknown User",
      receiptName: newExpense.receiptName || undefined,
    };
    setExpenses((prev) => [record, ...prev]);
    setNewExpense({ type: "", amount: "", date: new Date().toISOString().split("T")[0], description: "", receiptName: "" });
    setIsSubmitting(false);
    setSubmitDialogOpen(false);
  };

  const handleApproveReject = (expenseId: string, action: "approve" | "reject") => {
    setApproveRejectId(expenseId);
    setApproveRejectAction(action);
    setRejectionReason("");
  };

  const confirmApproveReject = () => {
    if (!approveRejectId || !approveRejectAction) return;
    setExpenses((prev) =>
      prev.map((e) => {
        if (e.id !== approveRejectId) return e;
        if (approveRejectAction === "approve") {
          return {
            ...e,
            status: "Approved" as ExpenseStatus,
            approvedBy: currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : "Admin",
            approvedAt: new Date().toISOString().split("T")[0],
          };
        }
        return {
          ...e,
          status: "Rejected" as ExpenseStatus,
          rejectedReason: rejectionReason || "No reason provided",
          approvedBy: currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : "Admin",
        };
      })
    );
    setApproveRejectId(null);
    setApproveRejectAction(null);
    setRejectionReason("");
  };

  const statCards = [
    {
      label: "Total Submitted",
      value: formatCurrency(totalSubmitted),
      icon: DollarSign,
      color: "text-msbm-red dark:text-msbm-red-bright",
      bg: "bg-msbm-red/10 dark:bg-msbm-red/20",
      trend: <ArrowUpRight className="w-3.5 h-3.5" />,
      trendText: "14 expenses",
    },
    {
      label: "Pending",
      value: formatCurrency(totalPending),
      icon: Clock,
      color: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-100 dark:bg-amber-900/30",
      trend: <AlertTriangle className="w-3.5 h-3.5" />,
      trendText: `${pendingCount} pending`,
    },
    {
      label: "Approved",
      value: formatCurrency(totalApproved),
      icon: CheckCircle2,
      color: "text-inner-blue dark:text-light-blue",
      bg: "bg-inner-blue/10 dark:bg-inner-blue/20",
      trend: <ArrowUpRight className="w-3.5 h-3.5" />,
      trendText: "Approved",
    },
    {
      label: "Rejected",
      value: formatCurrency(totalRejected),
      icon: XCircle,
      color: "text-rose-600 dark:text-rose-400",
      bg: "bg-rose-100 dark:bg-rose-900/30",
      trend: <ArrowDownRight className="w-3.5 h-3.5" />,
      trendText: "Rejected",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-msbm-red to-inner-blue flex items-center justify-center">
              <Receipt className="w-4.5 h-4.5 text-white" />
            </div>
            Expense Reimbursement
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Submit and track expense reimbursements</p>
        </div>
        <Button
          className="bg-gradient-to-r from-msbm-red to-inner-blue hover:from-msbm-red-bright hover:to-light-blue text-white"
          onClick={() => setSubmitDialogOpen(true)}
        >
          <Plus className="w-4 h-4 mr-2" />
          Submit Expense
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <Card key={stat.label} className="card-elevated card-lift">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className={`w-9 h-9 rounded-lg ${stat.bg} flex items-center justify-center`}>
                  <stat.icon className={`w-4.5 h-4.5 ${stat.color}`} />
                </div>
                <div className={`flex items-center gap-1 text-xs text-muted-foreground`}>
                  {stat.trend}
                  <span>{stat.trendText}</span>
                </div>
              </div>
              <p className="text-xl font-bold">{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all" className="gap-1.5">
            <Receipt className="w-4 h-4" />
            <span className="hidden sm:inline">All Expenses</span>
          </TabsTrigger>
          <TabsTrigger value="my" className="gap-1.5">
            <FileText className="w-4 h-4" />
            <span className="hidden sm:inline">My Expenses</span>
          </TabsTrigger>
          {isAdminOrManager && (
            <TabsTrigger value="approvals" className="gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              <span className="hidden sm:inline">Approvals</span>
              {pendingCount > 0 && (
                <Badge variant="secondary" className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 text-xs ml-1">
                  {pendingCount}
                </Badge>
              )}
            </TabsTrigger>
          )}
        </TabsList>

        {/* ALL / MY / APPROVALS share the same table */}
        {["all", "my", "approvals"].map((tabValue) => (
          <TabsContent key={tabValue} value={tabValue} className="mt-6 space-y-4">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search expenses..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Approved">Approved</SelectItem>
                  <SelectItem value="Rejected">Rejected</SelectItem>
                  <SelectItem value="Processing">Processing</SelectItem>
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="Travel">Travel</SelectItem>
                  <SelectItem value="Meals">Meals</SelectItem>
                  <SelectItem value="Office Supplies">Office Supplies</SelectItem>
                  <SelectItem value="Software/Tools">Software/Tools</SelectItem>
                  <SelectItem value="Training">Training</SelectItem>
                  <SelectItem value="Miscellaneous">Miscellaneous</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Table (desktop) / Cards (mobile) */}
            <Card className="card-elevated overflow-hidden">
              <CardContent className="p-0">
                {/* Desktop table */}
                <div className="hidden md:block overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="w-[100px]">Date</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead className="min-w-[200px]">Description</TableHead>
                        <TableHead
                          className="w-[120px] cursor-pointer select-none"
                          onClick={() => toggleSort("amount")}
                        >
                          <div className="flex items-center gap-1">
                            Amount
                            <ArrowUpDown className="w-3.5 h-3.5 text-muted-foreground" />
                          </div>
                        </TableHead>
                        <TableHead className="w-[110px]">Status</TableHead>
                        <TableHead className="w-[70px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredExpenses.map((expense) => (
                        <TableRow key={expense.id} className="group">
                          <TableCell className="text-sm font-medium">{expense.date}</TableCell>
                          <TableCell>
                            <Badge variant="secondary" className={`${EXPENSE_TYPE_COLORS[expense.type]} gap-1`}>
                              {EXPENSE_TYPE_ICONS[expense.type]}
                              {expense.type}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="text-sm font-medium line-clamp-1">{expense.description}</p>
                              <p className="text-xs text-muted-foreground mt-0.5">by {expense.submittedByName}</p>
                            </div>
                          </TableCell>
                          <TableCell className="font-semibold">{formatCurrency(expense.amount)}</TableCell>
                          <TableCell>
                            <Badge variant="secondary" className={`${STATUS_STYLES[expense.status]} gap-1`}>
                              {STATUS_ICONS[expense.status]}
                              {expense.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setDetailExpense(expense)} aria-label="View expense details" title="View Details">
                                <Eye className="w-4 h-4" />
                              </Button>
                              {activeTab === "approvals" && expense.status === "Pending" && isAdminOrManager && (
                                <div className="flex items-center gap-1">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-msbm-red hover:text-msbm-red hover:bg-msbm-red/5 dark:hover:bg-msbm-red/20"
                                    onClick={() => handleApproveReject(expense.id, "approve")}
                                    aria-label="Approve expense"
                                    title="Approve"
                                  >
                                    <CheckCircle2 className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                                    onClick={() => handleApproveReject(expense.id, "reject")}
                                    aria-label="Reject expense"
                                    title="Reject"
                                  >
                                    <XCircle className="w-4 h-4" />
                                  </Button>
                                </div>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                      {filteredExpenses.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-12">
                            <div className="flex flex-col items-center">
                              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
                                <Receipt className="w-6 h-6 text-muted-foreground" />
                              </div>
                              <p className="text-sm text-muted-foreground">No expenses found</p>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>

                {/* Mobile cards */}
                <div className="md:hidden divide-y divide-border">
                  {filteredExpenses.map((expense) => (
                    <div key={expense.id} className="p-4 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="secondary" className={`${EXPENSE_TYPE_COLORS[expense.type]} gap-1 text-xs`}>
                              {EXPENSE_TYPE_ICONS[expense.type]}
                              {expense.type}
                            </Badge>
                            <Badge variant="secondary" className={`${STATUS_STYLES[expense.status]} gap-1 text-xs`}>
                              {STATUS_ICONS[expense.status]}
                              {expense.status}
                            </Badge>
                          </div>
                          <p className="text-sm font-medium line-clamp-2">{expense.description}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{expense.date} • by {expense.submittedByName}</p>
                        </div>
                        <p className="text-base font-bold shrink-0">{formatCurrency(expense.amount)}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" className="text-xs h-8" onClick={() => setDetailExpense(expense)}>
                          <Eye className="w-3.5 h-3.5 mr-1" />
                          View
                        </Button>
                        {activeTab === "approvals" && expense.status === "Pending" && isAdminOrManager && (
                          <div className="flex items-center gap-1">
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-xs h-8 text-msbm-red border-msbm-red/20 hover:bg-msbm-red/5"
                              onClick={() => handleApproveReject(expense.id, "approve")}
                            >
                              <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                              Approve
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-xs h-8 text-rose-600 border-rose-300 hover:bg-rose-50"
                              onClick={() => handleApproveReject(expense.id, "reject")}
                            >
                              <XCircle className="w-3.5 h-3.5 mr-1" />
                              Reject
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  {filteredExpenses.length === 0 && (
                    <div className="p-12 text-center">
                      <div className="flex flex-col items-center">
                        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
                          <Receipt className="w-6 h-6 text-muted-foreground" />
                        </div>
                        <p className="text-sm text-muted-foreground">No expenses found</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Summary */}
            {filteredExpenses.length > 0 && (
              <Card className="card-elevated">
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <p className="text-sm text-muted-foreground">
                      Showing {filteredExpenses.length} expense{filteredExpenses.length !== 1 ? "s" : ""}
                    </p>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-muted-foreground">Total:</span>
                      <span className="text-lg font-bold text-msbm-red dark:text-msbm-red-bright">
                        {formatCurrency(filteredExpenses.reduce((sum, e) => sum + e.amount, 0))}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        ))}
      </Tabs>

      {/* SUBMIT EXPENSE DIALOG */}
      <Dialog open={submitDialogOpen} onOpenChange={setSubmitDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-msbm-red to-inner-blue flex items-center justify-center">
                <Plus className="w-4 h-4 text-white" />
              </div>
              Submit Expense
            </DialogTitle>
            <DialogDescription>Fill in the expense details for reimbursement</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Type */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Expense Type</label>
              <Select
                value={newExpense.type}
                onValueChange={(v) => setNewExpense((prev) => ({ ...prev, type: v as ExpenseType }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select expense type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Travel">✈️ Travel</SelectItem>
                  <SelectItem value="Meals">🍽️ Meals</SelectItem>
                  <SelectItem value="Office Supplies">📦 Office Supplies</SelectItem>
                  <SelectItem value="Software/Tools">💻 Software/Tools</SelectItem>
                  <SelectItem value="Training">🎓 Training</SelectItem>
                  <SelectItem value="Miscellaneous">📋 Miscellaneous</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Amount */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Amount (USD)</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={newExpense.amount}
                  onChange={(e) => setNewExpense((prev) => ({ ...prev, amount: e.target.value }))}
                  className="pl-9"
                />
              </div>
            </div>

            {/* Date */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Date</label>
              <Input
                type="date"
                value={newExpense.date}
                onChange={(e) => setNewExpense((prev) => ({ ...prev, date: e.target.value }))}
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Textarea
                placeholder="Describe the expense in detail..."
                value={newExpense.description}
                onChange={(e) => setNewExpense((prev) => ({ ...prev, description: e.target.value }))}
                rows={3}
              />
            </div>

            {/* Receipt Upload (visual only) */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Receipt</label>
              <div className="border-2 border-dashed border-border rounded-xl p-6 text-center hover:border-msbm-red dark:hover:border-msbm-red-bright transition-colors cursor-pointer group">
                <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2 group-hover:text-msbm-red transition-colors" />
                <p className="text-sm font-medium">Click to upload or drag and drop</p>
                <p className="text-xs text-muted-foreground mt-1">PDF, JPG, or PNG (max 10MB)</p>
                {newExpense.receiptName && (
                  <div className="mt-3 flex items-center justify-center gap-2 text-sm text-msbm-red dark:text-msbm-red-bright">
                    <FileText className="w-4 h-4" />
                    {newExpense.receiptName}
                    <button
                      className="text-muted-foreground hover:text-rose-500"
                      onClick={() => setNewExpense((prev) => ({ ...prev, receiptName: "" }))}
                      title="Remove receipt"
                      aria-label="Remove receipt"
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setSubmitDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white"
              onClick={handleSubmitExpense}
              disabled={!newExpense.type || !newExpense.amount || !newExpense.description || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Receipt className="w-4 h-4 mr-2" />
                  Submit Expense
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DETAIL DIALOG */}
      <Dialog open={!!detailExpense} onOpenChange={(open) => !open && setDetailExpense(null)}>
        <DialogContent className="max-w-lg">
          {detailExpense && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="secondary" className={`${EXPENSE_TYPE_COLORS[detailExpense.type]} gap-1`}>
                    {EXPENSE_TYPE_ICONS[detailExpense.type]}
                    {detailExpense.type}
                  </Badge>
                  <Badge variant="secondary" className={`${STATUS_STYLES[detailExpense.status]} gap-1`}>
                    {STATUS_ICONS[detailExpense.status]}
                    {detailExpense.status}
                  </Badge>
                </div>
                <DialogTitle>Expense Details</DialogTitle>
              </DialogHeader>

              <ScrollArea className="max-h-[400px]">
                <div className="space-y-4 pr-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Amount</p>
                      <p className="text-lg font-bold">{formatCurrency(detailExpense.amount)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Date</p>
                      <p className="text-sm font-medium">{detailExpense.date}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Submitted By</p>
                      <p className="text-sm font-medium">{detailExpense.submittedByName}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Receipt</p>
                      <p className="text-sm font-medium">
                        {detailExpense.receiptName ? (
                          <span className="text-msbm-red dark:text-msbm-red-bright flex items-center gap-1">
                            <FileText className="w-3.5 h-3.5" />
                            {detailExpense.receiptName}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">No receipt attached</span>
                        )}
                      </p>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Description</p>
                    <p className="text-sm">{detailExpense.description}</p>
                  </div>

                  {detailExpense.approvedBy && (
                    <>
                      <Separator />
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-muted-foreground">Reviewed By</p>
                          <p className="text-sm font-medium">{detailExpense.approvedBy}</p>
                        </div>
                        {detailExpense.approvedAt && (
                          <div>
                            <p className="text-xs text-muted-foreground">Action Date</p>
                            <p className="text-sm font-medium">{detailExpense.approvedAt}</p>
                          </div>
                        )}
                      </div>
                    </>
                  )}

                  {detailExpense.rejectedReason && (
                    <>
                      <Separator />
                      <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800/30">
                        <p className="text-xs text-rose-600 dark:text-rose-400 font-semibold mb-1 flex items-center gap-1">
                          <Ban className="w-3.5 h-3.5" />
                          Rejection Reason
                        </p>
                        <p className="text-sm text-rose-700 dark:text-rose-300">{detailExpense.rejectedReason}</p>
                      </div>
                    </>
                  )}
                </div>
              </ScrollArea>

              {activeTab === "approvals" && detailExpense.status === "Pending" && isAdminOrManager && (
                <DialogFooter className="gap-2">
                  <Button
                    variant="outline"
                    className="text-rose-600 border-rose-300 hover:bg-rose-50"
                    onClick={() => {
                      setDetailExpense(null);
                      handleApproveReject(detailExpense.id, "reject");
                    }}
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Reject
                  </Button>
                  <Button
                    className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white"
                    onClick={() => {
                      setDetailExpense(null);
                      handleApproveReject(detailExpense.id, "approve");
                    }}
                  >
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Approve
                  </Button>
                </DialogFooter>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* APPROVE/REJECT CONFIRMATION */}
      <AlertDialog open={!!approveRejectId && !!approveRejectAction} onOpenChange={() => { setApproveRejectId(null); setApproveRejectAction(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {approveRejectAction === "approve" ? "✅ Approve Expense" : "❌ Reject Expense"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {approveRejectAction === "approve"
                ? "Are you sure you want to approve this expense? The submitter will be notified."
                : "Please provide a reason for rejecting this expense."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          {approveRejectAction === "reject" && (
            <Textarea
              placeholder="Enter rejection reason..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={3}
              className="mt-2"
            />
          )}
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmApproveReject}
              className={
                approveRejectAction === "approve"
                  ? "bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white"
                  : "bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white"
              }
            >
              {approveRejectAction === "approve" ? "Approve" : "Reject"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
