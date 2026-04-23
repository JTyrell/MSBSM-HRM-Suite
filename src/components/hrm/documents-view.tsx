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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { useAppStore } from "@/store/app";
import { toast } from "@/hooks/use-toast";
import {
  FileText,
  Upload,
  Download,
  Search,
  Filter,
  File,
  Folder,
  MoreVertical,
  Trash2,
  Eye,
  Clock,
  User,
  Building2,
} from "lucide-react";
import { format } from "date-fns";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

// ─── Types ──────────────────────────────────────────────────────────

interface DocumentItem {
  id: string;
  name: string;
  type: "PDF" | "DOCX" | "XLSX";
  size: string;
  updated: string;
  category: "HR Policies" | "Templates" | "Training" | "Finance" | "Legal";
  description: string;
}

// ─── Simulated Documents ────────────────────────────────────────────

const DOCUMENTS: DocumentItem[] = [
  {
    id: "doc-1",
    name: "Employee Handbook 2025",
    type: "PDF",
    size: "2.4MB",
    updated: "2025-03-15",
    category: "HR Policies",
    description: "Comprehensive employee handbook covering all company policies and procedures for 2025.",
  },
  {
    id: "doc-2",
    name: "Benefits Enrollment Guide",
    type: "PDF",
    size: "1.8MB",
    updated: "2025-01-20",
    category: "HR Policies",
    description: "Step-by-step guide for enrolling in company benefits including health, dental, and vision plans.",
  },
  {
    id: "doc-3",
    name: "Company Policy Manual",
    type: "PDF",
    size: "3.2MB",
    updated: "2025-02-10",
    category: "HR Policies",
    description: "Complete company policy manual with sections on conduct, ethics, and workplace standards.",
  },
  {
    id: "doc-4",
    name: "IT Security Guidelines",
    type: "PDF",
    size: "890KB",
    updated: "2025-04-01",
    category: "Legal",
    description: "Information security policies and best practices for all employees.",
  },
  {
    id: "doc-5",
    name: "Onboarding Checklist Template",
    type: "DOCX",
    size: "450KB",
    updated: "2025-03-01",
    category: "Templates",
    description: "Standardized onboarding checklist template for new hires across all departments.",
  },
  {
    id: "doc-6",
    name: "Expense Report Template",
    type: "XLSX",
    size: "320KB",
    updated: "2024-12-15",
    category: "Finance",
    description: "Monthly expense report template with auto-calculations and category tracking.",
  },
  {
    id: "doc-7",
    name: "Performance Review Form",
    type: "PDF",
    size: "560KB",
    updated: "2025-01-05",
    category: "Templates",
    description: "Standard performance review form for quarterly and annual evaluations.",
  },
  {
    id: "doc-8",
    name: "Remote Work Policy",
    type: "PDF",
    size: "780KB",
    updated: "2024-11-20",
    category: "HR Policies",
    description: "Policy governing remote and hybrid work arrangements, expectations, and eligibility.",
  },
  {
    id: "doc-9",
    name: "Safety Training Manual",
    type: "PDF",
    size: "4.1MB",
    updated: "2025-02-28",
    category: "Training",
    description: "Comprehensive workplace safety training manual covering OSHA compliance requirements.",
  },
  {
    id: "doc-10",
    name: "Code of Conduct",
    type: "PDF",
    size: "1.2MB",
    updated: "2025-01-01",
    category: "Legal",
    description: "Company code of conduct including anti-corruption, conflicts of interest, and reporting procedures.",
  },
  {
    id: "doc-11",
    name: "Travel Expense Policy",
    type: "PDF",
    size: "650KB",
    updated: "2024-10-15",
    category: "Finance",
    description: "Policy outlining travel expense limits, approval requirements, and reimbursement procedures.",
  },
  {
    id: "doc-12",
    name: "Anti-Harassment Policy",
    type: "PDF",
    size: "920KB",
    updated: "2024-09-01",
    category: "Legal",
    description: "Comprehensive anti-harassment and anti-discrimination policy with reporting channels.",
  },
];

// ─── Helpers ────────────────────────────────────────────────────────

const FILE_TYPE_CONFIG: Record<
  string,
  { color: string; bgColor: string; borderColor: string; icon: React.ElementType }
> = {
  PDF: {
    color: "text-red-600 dark:text-red-400",
    bgColor: "bg-red-50 dark:bg-red-950/40",
    borderColor: "border-red-200/60 dark:border-red-800/40",
    icon: FileText,
  },
  DOCX: {
    color: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-50 dark:bg-blue-950/40",
    borderColor: "border-blue-200/60 dark:border-blue-800/40",
    icon: File,
  },
  XLSX: {
    color: "text-msbm-red dark:text-msbm-red-bright",
    bgColor: "bg-msbm-red/5 dark:bg-emerald-950/40",
    borderColor: "border-msbm-red/20/60 dark:border-msbm-red/20/40",
    icon: File,
  },
};

const CATEGORY_COLORS: Record<string, string> = {
  "HR Policies": "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300",
  Templates: "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300",
  Training: "bg-violet-100 text-violet-700 dark:bg-violet-900/50 dark:text-violet-300",
  Finance: "bg-msbm-red/10 text-msbm-red dark:bg-emerald-900/50 dark:text-emerald-300",
  Legal: "bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-300",
};

const EMPLOYEE_DOCS_MAP: Record<string, { name: string; type: string; size: string }[]> = {
  "emp-1": [
    { name: "Employment Contract", type: "PDF", size: "1.2MB" },
    { name: "NDA Agreement", type: "PDF", size: "340KB" },
    { name: "Direct Deposit Form", type: "PDF", size: "180KB" },
    { name: "W-4 Form", type: "PDF", size: "210KB" },
  ],
  "emp-2": [
    { name: "Employment Contract", type: "PDF", size: "1.1MB" },
    { name: "I-9 Form", type: "PDF", size: "290KB" },
    { name: "Benefits Selection", type: "PDF", size: "450KB" },
  ],
  "emp-3": [
    { name: "Employment Contract", type: "PDF", size: "1.3MB" },
    { name: "Professional License", type: "PDF", size: "560KB" },
    { name: "Certification Copy", type: "PDF", size: "780KB" },
    { name: "NDA Agreement", type: "PDF", size: "340KB" },
    { name: "Performance Plan", type: "DOCX", size: "120KB" },
  ],
  "emp-4": [
    { name: "Employment Contract", type: "PDF", size: "1.0MB" },
    { name: "W-4 Form", type: "PDF", size: "210KB" },
  ],
  "emp-5": [
    { name: "Employment Contract", type: "PDF", size: "1.2MB" },
    { name: "NDA Agreement", type: "PDF", size: "340KB" },
    { name: "Benefits Selection", type: "PDF", size: "420KB" },
    { name: "I-9 Form", type: "PDF", size: "290KB" },
  ],
};

function getInitials(firstName: string, lastName: string): string {
  return `${(firstName?.[0] || "").toUpperCase()}${(lastName?.[0] || "").toUpperCase()}`;
}

// ─── Main Component ─────────────────────────────────────────────────

export function DocumentsView() {
  const { employees } = useAppStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [previewDoc, setPreviewDoc] = useState<DocumentItem | null>(null);
  const [expandedEmployee, setExpandedEmployee] = useState<string | null>(null);
  const [uploadForm, setUploadForm] = useState({
    fileName: "",
    category: "",
    description: "",
    tags: "",
    fileType: "PDF",
  });

  // ─── Filtered documents ─────────────────────────────────────────
  const filteredDocuments = useMemo(() => {
    return DOCUMENTS.filter((doc) => {
      const matchesSearch =
        searchQuery === "" ||
        doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = typeFilter === "All" || doc.type === typeFilter;
      return matchesSearch && matchesType;
    });
  }, [searchQuery, typeFilter]);

  // ─── Employees with documents ──────────────────────────────────
  const employeesWithDocs = useMemo(() => {
    return employees.slice(0, 5).map((emp) => ({
      ...emp,
      documents: EMPLOYEE_DOCS_MAP[emp.id] || [
        { name: "Employment Contract", type: "PDF", size: "1.0MB" },
        { name: "W-4 Form", type: "PDF", size: "210KB" },
      ],
    }));
  }, [employees]);

  // ─── Upload handler ────────────────────────────────────────────
  const handleUpload = () => {
    if (!uploadForm.fileName || !uploadForm.category) {
      toast({
        title: "Missing Information",
        description: "Please fill in the file name and select a category.",
        variant: "destructive",
      });
      return;
    }
    toast({
      title: "Document Uploaded",
      description: `"${uploadForm.fileName}" has been uploaded successfully.`,
    });
    setUploadForm({ fileName: "", category: "", description: "", tags: "", fileType: "PDF" });
  };

  // ─── Storage stats ─────────────────────────────────────────────
  const storageUsed = 18.7;
  const storageTotal = 50;

  // ─── Render ────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Document Management</h1>
          <p className="text-sm text-muted-foreground">
            Manage company documents, policies, and employee files.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="secondary" className="bg-inner-blue/10 text-inner-blue dark:bg-inner-blue/20 dark:text-blue-300">
            {DOCUMENTS.length} documents
          </Badge>
          <Badge variant="outline" className="text-xs">
            <Building2 className="h-3 w-3 mr-1" />
            {storageUsed} / {storageTotal} GB used
          </Badge>
        </div>
      </div>

      {/* Storage Progress */}
      <Card className="border-teal-200/60 dark:border-teal-800/40">
        <CardContent className="pt-0">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Storage Usage</span>
            <span className="text-sm text-muted-foreground">
              {((storageUsed / storageTotal) * 100).toFixed(0)}% used
            </span>
          </div>
          <Progress value={(storageUsed / storageTotal) * 100} className="h-2" />
          <p className="text-xs text-muted-foreground mt-1.5">
            {storageUsed} GB of {storageTotal} GB used &middot; {(storageTotal - storageUsed).toFixed(1)} GB available
          </p>
        </CardContent>
      </Card>

      {/* ─── Tabbed Content ─────────────────────────────────────── */}
      <Tabs defaultValue="all-documents" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all-documents" className="gap-2 text-xs sm:text-sm">
            <Folder className="h-4 w-4 hidden sm:block" />
            All Documents
          </TabsTrigger>
          <TabsTrigger value="employee-docs" className="gap-2 text-xs sm:text-sm">
            <User className="h-4 w-4 hidden sm:block" />
            Employee Docs
          </TabsTrigger>
          <TabsTrigger value="upload" className="gap-2 text-xs sm:text-sm">
            <Upload className="h-4 w-4 hidden sm:block" />
            Upload
          </TabsTrigger>
        </TabsList>

        {/* ═══════════════════════════════════════════════════════ */}
        {/* TAB 1: ALL DOCUMENTS                                   */}
        {/* ═══════════════════════════════════════════════════════ */}
        <TabsContent value="all-documents" className="space-y-4">
          {/* Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search documents by name or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground shrink-0" />
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="File type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Types</SelectItem>
                  <SelectItem value="PDF">PDF</SelectItem>
                  <SelectItem value="DOCX">DOCX</SelectItem>
                  <SelectItem value="XLSX">XLSX</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Document Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredDocuments.map((doc) => {
              const config = FILE_TYPE_CONFIG[doc.type] || FILE_TYPE_CONFIG.PDF;
              const Icon = config.icon;
              return (
                <Card
                  key={doc.id}
                  className={`group transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 cursor-pointer border ${config.borderColor}`}
                  onClick={() => setPreviewDoc(doc)}
                >
                  <CardContent className="pt-0">
                    <div className="flex items-start gap-4">
                      {/* File Icon */}
                      <div
                        className={`flex items-center justify-center h-12 w-12 rounded-xl ${config.bgColor} shrink-0 transition-transform duration-300 group-hover:scale-110`}
                      >
                        <Icon className={`h-6 w-6 ${config.color}`} />
                      </div>
                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate group-hover:text-msbm-red dark:group-hover:text-msbm-red-bright transition-colors">
                          {doc.name}
                        </p>
                        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                          <Badge
                            variant="secondary"
                            className="text-[10px] px-1.5 py-0"
                          >
                            {doc.type}
                          </Badge>
                          <span className="text-xs text-muted-foreground">{doc.size}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge
                            variant="outline"
                            className={`text-[10px] px-1.5 py-0 ${CATEGORY_COLORS[doc.category] || ""}`}
                          >
                            {doc.category}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    {/* Footer */}
                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-border/50">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {format(new Date(doc.updated), "MMM d, yyyy")}
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={(e) => {
                            e.stopPropagation();
                            setPreviewDoc(doc);
                          }}
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={(e) => {
                            e.stopPropagation();
                            toast({
                              title: "Download Started",
                              description: `Downloading "${doc.name}"...`,
                            });
                          }}
                        >
                          <Download className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {filteredDocuments.length === 0 && (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground mt-3">No documents found matching your criteria.</p>
            </div>
          )}

          {/* Document Count Summary */}
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span>Showing {filteredDocuments.length} of {DOCUMENTS.length} documents</span>
            <div className="flex items-center gap-2">
              {(["PDF", "DOCX", "XLSX"] as const).map((type) => (
                <Badge key={type} variant="outline" className="text-[10px]">
                  {type}: {DOCUMENTS.filter((d) => d.type === type).length}
                </Badge>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* ═══════════════════════════════════════════════════════ */}
        {/* TAB 2: EMPLOYEE DOCUMENTS                              */}
        {/* ═══════════════════════════════════════════════════════ */}
        <TabsContent value="employee-docs" className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Click an employee card to view their uploaded documents.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {employeesWithDocs.map((emp) => {
              const isExpanded = expandedEmployee === emp.id;
              return (
                <Card
                  key={emp.id}
                  className={`transition-all duration-300 hover:shadow-md cursor-pointer border ${
                    isExpanded
                      ? "border-emerald-300 dark:border-emerald-700 ring-1 ring-emerald-200 dark:ring-emerald-800"
                      : "hover:border-msbm-red/20/60 dark:hover:border-msbm-red/20/40"
                  }`}
                  onClick={() => setExpandedEmployee(isExpanded ? null : emp.id)}
                >
                  <CardContent className="pt-0">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white text-sm font-semibold">
                          {getInitials(emp.firstName, emp.lastName)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate">
                          {emp.firstName} {emp.lastName}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">{emp.role}</p>
                      </div>
                      <Badge
                        variant="secondary"
                        className="bg-msbm-red/10 text-msbm-red dark:bg-emerald-900/50 dark:text-emerald-300 text-xs shrink-0"
                      >
                        {emp.documents.length} files
                      </Badge>
                    </div>

                    {/* Expanded Documents List */}
                    {isExpanded && (
                      <div className="mt-4 pt-3 border-t border-border/50 space-y-2">
                        {emp.documents.map((doc, idx) => {
                          const docConfig = FILE_TYPE_CONFIG[doc.type] || FILE_TYPE_CONFIG.PDF;
                          const DocIcon = docConfig.icon;
                          return (
                            <div
                              key={idx}
                              className="flex items-center gap-3 p-2.5 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                            >
                              <div className={`flex items-center justify-center h-8 w-8 rounded-lg ${docConfig.bgColor}`}>
                                <DocIcon className={`h-4 w-4 ${docConfig.color}`} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium truncate">{doc.name}</p>
                                <p className="text-[10px] text-muted-foreground">{doc.size}</p>
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 shrink-0"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toast({
                                    title: "Download Started",
                                    description: `Downloading "${doc.name}"...`,
                                  });
                                }}
                              >
                                <Download className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {employeesWithDocs.length === 0 && (
            <div className="text-center py-12">
              <User className="h-12 w-12 mx-auto text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground mt-3">No employees found.</p>
            </div>
          )}
        </TabsContent>

        {/* ═══════════════════════════════════════════════════════ */}
        {/* TAB 3: UPLOAD DOCUMENT                                 */}
        {/* ═══════════════════════════════════════════════════════ */}
        <TabsContent value="upload" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Upload Form */}
            <Card className="border-msbm-red/20/60 dark:border-msbm-red/20/40">
              <CardHeader>
                <CardTitle className="text-base font-semibold">Upload New Document</CardTitle>
                <CardDescription>
                  Fill in the details and select a file to upload.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* File Name */}
                <div className="space-y-2">
                  <Label htmlFor="doc-name">File Name</Label>
                  <Input
                    id="doc-name"
                    placeholder="Enter document name..."
                    value={uploadForm.fileName}
                    onChange={(e) =>
                      setUploadForm((prev) => ({ ...prev, fileName: e.target.value }))
                    }
                  />
                </div>

                {/* File Type Selection */}
                <div className="space-y-2">
                  <Label>File Type</Label>
                  <div className="flex items-center gap-3">
                    {(["PDF", "DOCX", "XLSX"] as const).map((type) => {
                      const config = FILE_TYPE_CONFIG[type];
                      const TypeIcon = config.icon;
                      const isSelected = uploadForm.fileType === type;
                      return (
                        <button
                          key={type}
                          onClick={() =>
                            setUploadForm((prev) => ({ ...prev, fileType: type }))
                          }
                          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border transition-all duration-200 ${
                            isSelected
                              ? `border-current ${config.bgColor} ${config.color} shadow-sm`
                              : "border-border hover:border-muted-foreground/30"
                          }`}
                        >
                          <TypeIcon className="h-5 w-5" />
                          <span className="text-sm font-medium">{type}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Category */}
                <div className="space-y-2">
                  <Label htmlFor="doc-category">Category</Label>
                  <Select
                    value={uploadForm.category}
                    onValueChange={(val) =>
                      setUploadForm((prev) => ({ ...prev, category: val }))
                    }
                  >
                    <SelectTrigger id="doc-category">
                      <SelectValue placeholder="Select category..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="HR Policies">HR Policies</SelectItem>
                      <SelectItem value="Templates">Templates</SelectItem>
                      <SelectItem value="Training">Training</SelectItem>
                      <SelectItem value="Finance">Finance</SelectItem>
                      <SelectItem value="Legal">Legal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="doc-description">Description</Label>
                  <Input
                    id="doc-description"
                    placeholder="Brief description of the document..."
                    value={uploadForm.description}
                    onChange={(e) =>
                      setUploadForm((prev) => ({ ...prev, description: e.target.value }))
                    }
                  />
                </div>

                {/* Tags */}
                <div className="space-y-2">
                  <Label htmlFor="doc-tags">Tags</Label>
                  <Input
                    id="doc-tags"
                    placeholder="Comma-separated tags (e.g. 2025, policy, mandatory)"
                    value={uploadForm.tags}
                    onChange={(e) =>
                      setUploadForm((prev) => ({ ...prev, tags: e.target.value }))
                    }
                  />
                </div>

                {/* Submit */}
                <Button
                  onClick={handleUpload}
                  className="w-full bg-msbm-red hover:bg-msbm-red/80 text-white"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Document
                </Button>
              </CardContent>
            </Card>

            {/* Drag & Drop Zone + Recent Uploads */}
            <div className="space-y-6">
              {/* Drag & Drop Zone */}
              <Card className="border-dashed-2 border-emerald-300 dark:border-emerald-700 bg-msbm-red/5/30 dark:bg-emerald-950/10">
                <CardContent className="pt-0">
                  <div className="flex flex-col items-center justify-center py-10 text-center">
                    <div className="h-16 w-16 rounded-2xl bg-msbm-red/10 dark:bg-emerald-900/40 flex items-center justify-center mb-4">
                      <Upload className="h-8 w-8 text-msbm-red dark:text-msbm-red-bright" />
                    </div>
                    <p className="text-sm font-semibold">Drag & Drop Files Here</p>
                    <p className="text-xs text-muted-foreground mt-1 max-w-[240px]">
                      Or use the form to provide details. Supports PDF, DOCX, and XLSX files up to 25MB.
                    </p>
                    <div className="flex items-center gap-2 mt-4">
                      {(["PDF", "DOCX", "XLSX"] as const).map((type) => {
                        const config = FILE_TYPE_CONFIG[type];
                        return (
                          <Badge
                            key={type}
                            variant="outline"
                            className={`${config.borderColor} ${config.color} text-[10px]`}
                          >
                            {type}
                          </Badge>
                        );
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Category Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base font-semibold">Documents by Category</CardTitle>
                  <CardDescription>Distribution of documents across categories</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {(["HR Policies", "Templates", "Training", "Finance", "Legal"] as const).map(
                      (cat) => {
                        const count = DOCUMENTS.filter((d) => d.category === cat).length;
                        const pct = Math.round((count / DOCUMENTS.length) * 100);
                        return (
                          <div key={cat} className="flex items-center gap-3">
                            <Badge
                              variant="outline"
                              className={`text-[10px] ${CATEGORY_COLORS[cat]} w-28 justify-center`}
                            >
                              {cat}
                            </Badge>
                            <div className="flex-1">
                              <Progress value={pct} className="h-2" />
                            </div>
                            <span className="text-xs font-medium w-8 text-right">{count}</span>
                          </div>
                        );
                      }
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-3">
                <Card className="border-blue-200/60 dark:border-blue-800/40">
                  <CardContent className="pt-0">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center">
                        <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Total Size</p>
                        <p className="text-lg font-bold">{storageUsed} GB</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-amber-200/60 dark:border-amber-800/40">
                  <CardContent className="pt-0">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-amber-50 dark:bg-amber-950/40 flex items-center justify-center">
                        <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Last Upload</p>
                        <p className="text-lg font-bold">Apr 1</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* ─── Document Preview Dialog ───────────────────────────── */}
      <Dialog open={!!previewDoc} onOpenChange={(open) => !open && setPreviewDoc(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              {previewDoc && (
                <>
                  {(() => {
                    const config = FILE_TYPE_CONFIG[previewDoc.type] || FILE_TYPE_CONFIG.PDF;
                    const Icon = config.icon;
                    return (
                      <div className={`h-10 w-10 rounded-xl ${config.bgColor} flex items-center justify-center`}>
                        <Icon className={`h-5 w-5 ${config.color}`} />
                      </div>
                    );
                  })()}
                  {previewDoc.name}
                </>
              )}
            </DialogTitle>
          </DialogHeader>
          {previewDoc && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="secondary" className="text-xs">
                  {previewDoc.type}
                </Badge>
                <Badge
                  variant="outline"
                  className={`text-xs ${CATEGORY_COLORS[previewDoc.category] || ""}`}
                >
                  {previewDoc.category}
                </Badge>
                <span className="text-xs text-muted-foreground">{previewDoc.size}</span>
              </div>

              {/* Document Details Table */}
              <Table>
                <TableBody>
                  <TableRow>
                    <TableHead className="w-32 text-xs">File Name</TableHead>
                    <TableCell className="text-sm font-medium">{previewDoc.name}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableHead className="text-xs">Type</TableHead>
                    <TableCell className="text-sm">{previewDoc.type}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableHead className="text-xs">Size</TableHead>
                    <TableCell className="text-sm">{previewDoc.size}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableHead className="text-xs">Last Updated</TableHead>
                    <TableCell className="text-sm">
                      {format(new Date(previewDoc.updated), "MMMM d, yyyy")}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableHead className="text-xs">Category</TableHead>
                    <TableCell className="text-sm">{previewDoc.category}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableHead className="text-xs">Description</TableHead>
                    <TableCell className="text-sm text-muted-foreground">
                      {previewDoc.description}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          )}
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              size="sm"
              className="text-red-600 hover:text-red-700"
              onClick={() => {
                toast({
                  title: "Document Deleted",
                  description: `"${previewDoc?.name}" has been removed.`,
                  variant: "destructive",
                });
                setPreviewDoc(null);
              }}
            >
              <Trash2 className="h-4 w-4 mr-1.5" />
              Delete
            </Button>
            <Button
              size="sm"
              className="bg-msbm-red hover:bg-msbm-red/80 text-white"
              onClick={() => {
                toast({
                  title: "Download Started",
                  description: `Downloading "${previewDoc?.name}"...`,
                });
              }}
            >
              <Download className="h-4 w-4 mr-1.5" />
              Download
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
