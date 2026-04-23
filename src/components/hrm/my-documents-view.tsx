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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  FileText,
  FileImage,
  GraduationCap,
  Award,
  BadgeCheck,
  Briefcase,
  Upload,
  Search,
  Filter,
  Clock,
  ExternalLink,
  RefreshCw,
  Plus,
  FolderOpen,
  ShieldCheck,
  ChevronDown,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  File,
  CalendarDays,
  StickyNote,
} from "lucide-react";

// ─── Types ──────────────────────────────────────────────────────────

type DocCategory =
  | "Identification"
  | "Certifications"
  | "Education"
  | "Training"
  | "Employment"
  | "Other";

type DocFileType = "PDF" | "DOCX" | "JPG" | "PNG";

type DocStatus = "Valid" | "Expiring Soon" | "Expired";

type RequestStatus = "Pending" | "Approved" | "Completed" | "Rejected";

interface MyDocument {
  id: string;
  name: string;
  category: DocCategory;
  fileType: DocFileType;
  uploadDate: string;
  expiryDate: string;
  fileSize: string;
  status: DocStatus;
}

interface Certification {
  id: string;
  name: string;
  issuingBody: string;
  issueDate: string;
  expiryDate: string;
  credentialId: string;
  status: DocStatus;
  verifyLink: string;
}

interface DocumentRequest {
  id: string;
  type: string;
  date: string;
  status: RequestStatus;
  notes: string;
}

// ─── Constants ──────────────────────────────────────────────────────

const CATEGORIES: DocCategory[] = [
  "Identification",
  "Certifications",
  "Education",
  "Training",
  "Employment",
  "Other",
];

const CATEGORY_ICONS: Record<DocCategory, React.ElementType> = {
  Identification: ShieldCheck,
  Certifications: Award,
  Education: GraduationCap,
  Training: FileText,
  Employment: Briefcase,
  Other: File,
};

const FILE_TYPE_ICONS: Record<DocFileType, React.ElementType> = {
  PDF: FileText,
  DOCX: FileText,
  JPG: FileImage,
  PNG: FileImage,
};

const FILE_TYPE_COLORS: Record<DocFileType, { color: string; bg: string }> = {
  PDF: { color: "text-red-600 dark:text-red-400", bg: "bg-red-50 dark:bg-red-950/40" },
  DOCX: { color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-950/40" },
  JPG: { color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-950/40" },
  PNG: { color: "text-teal-600 dark:text-teal-400", bg: "bg-teal-50 dark:bg-teal-950/40" },
};

const CATEGORY_BADGE_COLORS: Record<DocCategory, string> = {
  Identification: "bg-slate-100 text-slate-700 dark:bg-slate-900/50 dark:text-slate-300",
  Certifications: "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300",
  Education: "bg-violet-100 text-violet-700 dark:bg-violet-900/50 dark:text-violet-300",
  Training: "bg-msbm-red/10 text-msbm-red dark:bg-emerald-900/50 dark:text-emerald-300",
  Employment: "bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-300",
  Other: "bg-gray-100 text-gray-700 dark:bg-gray-900/50 dark:text-gray-300",
};

const STATUS_BADGE: Record<DocStatus, { className: string; icon: React.ElementType }> = {
  Valid: { className: "bg-msbm-red/10 text-msbm-red dark:bg-emerald-900/50 dark:text-emerald-300", icon: CheckCircle2 },
  "Expiring Soon": { className: "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300", icon: AlertTriangle },
  Expired: { className: "bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-300", icon: XCircle },
};

const REQUEST_STATUS_BADGE: Record<RequestStatus, { className: string; icon: React.ElementType }> = {
  Pending: { className: "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300", icon: Clock },
  Approved: { className: "bg-msbm-red/10 text-msbm-red dark:bg-emerald-900/50 dark:text-emerald-300", icon: CheckCircle2 },
  Completed: { className: "bg-teal-100 text-teal-700 dark:bg-teal-900/50 dark:text-teal-300", icon: CheckCircle2 },
  Rejected: { className: "bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-300", icon: XCircle },
};

// ─── Helpers ────────────────────────────────────────────────────────

function getDaysRemaining(expiryDate: string): number {
  if (!expiryDate) return -1;
  const now = new Date();
  const expiry = new Date(expiryDate);
  return Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

function getExpiryStatus(expiryDate: string): DocStatus {
  const days = getDaysRemaining(expiryDate);
  if (days < 0) return "Expired";
  if (days <= 30) return "Expiring Soon";
  return "Valid";
}

function formatDate(dateStr: string): string {
  if (!dateStr) return "No Expiry";
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

// ─── Progress Ring Component ────────────────────────────────────────

function ProgressRing({ days, maxDays }: { days: number; maxDays: number }) {
  const percentage = Math.min(100, Math.max(0, (days / maxDays) * 100));
  const ringColorHex = days <= 30 ? (days <= 0 ? "#f43f5e" : "#f59e0b") : "#10b981";
  const ringColorClass = days <= 30 ? (days <= 0 ? "text-rose-500" : "text-amber-500") : "text-emerald-500";

  return (
    <div className="relative flex items-center justify-center w-14 h-14">
      <svg className="transform -rotate-90 w-14 h-14" viewBox="0 0 56 56">
        <circle cx="28" cy="28" r="24" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-muted/20" />
        <circle
          cx="28"
          cy="28"
          r="24"
          stroke={ringColorHex}
          strokeWidth="4"
          fill="transparent"
          strokeDasharray={2 * Math.PI * 24}
          strokeDashoffset={2 * Math.PI * 24 - (percentage / 100) * (2 * Math.PI * 24)}
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <span className={`absolute text-[10px] font-bold ${ringColorClass}`}>
        {days > 0 ? `${days}d` : "Exp"}
      </span>
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────

export function MyDocumentsView() {
  const [activeTab, setActiveTab] = useState("documents");
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("date");
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [requestDialogOpen, setRequestDialogOpen] = useState(false);
  const [uploadForm, setUploadForm] = useState({ name: "", category: "", expiryDate: "", notes: "" });
  const [requestForm, setRequestForm] = useState({ type: "", notes: "" });
  const [documents, setDocuments] = useState<MyDocument[]>([]);
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [requests, setRequests] = useState<DocumentRequest[]>([]);

  // ─── Computed Stats ────────────────────────────────────────────
  const stats = useMemo(() => {
    const total = documents.length;
    const valid = documents.filter((d) => d.status === "Valid").length;
    const expiring = documents.filter((d) => d.status === "Expiring Soon").length;
    const expired = documents.filter((d) => d.status === "Expired").length;
    return [
      { label: "Total Documents", value: total, icon: FolderOpen, color: "text-msbm-red dark:text-msbm-red-bright", bg: "bg-msbm-red/5 dark:bg-msbm-red/10" },
      { label: "Valid", value: valid, icon: CheckCircle2, color: "text-teal-600 dark:text-teal-400", bg: "bg-teal-50 dark:bg-teal-950/40" },
      { label: "Expiring Soon", value: expiring, icon: AlertTriangle, color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-950/40" },
      { label: "Expired", value: expired, icon: XCircle, color: "text-rose-600 dark:text-rose-400", bg: "bg-rose-50 dark:bg-rose-950/40" },
    ];
  }, [documents]);

  // ─── Filtered Documents ────────────────────────────────────────
  const filteredDocuments = useMemo(() => {
    let result = [...documents];
    if (categoryFilter !== "all") {
      result = result.filter((d) => d.category === categoryFilter);
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter((d) => d.name.toLowerCase().includes(q) || d.category.toLowerCase().includes(q));
    }
    if (sortBy === "name") result.sort((a, b) => a.name.localeCompare(b.name));
    if (sortBy === "date") result.sort((a, b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime());
    if (sortBy === "expiry") result.sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime());
    return result;
  }, [searchQuery, categoryFilter, sortBy, documents]);

  // ─── Handlers ──────────────────────────────────────────────────
  const handleUpload = () => {
    if (!uploadForm.name || !uploadForm.category) {
      toast.error("Please fill in document name and category");
      return;
    }
    toast.success("Document uploaded successfully!", { description: `"${uploadForm.name}" has been added.` });
    setUploadForm({ name: "", category: "", expiryDate: "", notes: "" });
    setUploadDialogOpen(false);
  };

  const handleNewRequest = () => {
    if (!requestForm.type) {
      toast.error("Please select a request type");
      return;
    }
    toast.success("Request submitted!", { description: `${requestForm.type} request has been sent to HR.` });
    setRequestForm({ type: "", notes: "" });
    setRequestDialogOpen(false);
  };

  // ─── Render ────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">My Documents & Certificates</h1>
          <p className="text-sm text-muted-foreground">Manage your personal documents, certifications, and requests</p>
        </div>
        <div className="flex items-center gap-2">
          {activeTab === "documents" && (
            <Button onClick={() => setUploadDialogOpen(true)} className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:from-emerald-600 hover:to-teal-700">
              <Upload className="h-4 w-4 mr-1.5" />Upload Document
            </Button>
          )}
          {activeTab === "requests" && (
            <Button onClick={() => setRequestDialogOpen(true)} className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:from-emerald-600 hover:to-teal-700">
              <Plus className="h-4 w-4 mr-1.5" />New Request
            </Button>
          )}
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
          <TabsTrigger value="documents"><FileText className="h-4 w-4 mr-1.5" />My Documents</TabsTrigger>
          <TabsTrigger value="certifications"><BadgeCheck className="h-4 w-4 mr-1.5" />Certifications</TabsTrigger>
          <TabsTrigger value="requests"><Clock className="h-4 w-4 mr-1.5" />Requests</TabsTrigger>
        </TabsList>

        {/* ─── My Documents Tab ─────────────────────────────────── */}
        <TabsContent value="documents" className="mt-4 space-y-4">
          {/* Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search documents..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground shrink-0" />
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[150px]"><SelectValue placeholder="Category" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[130px]"><SelectValue placeholder="Sort by" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="date">Upload Date</SelectItem>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="expiry">Expiry Date</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Document Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredDocuments.map((doc) => {
              const CatIcon = CATEGORY_ICONS[doc.category];
              const FTypeIcon = FILE_TYPE_ICONS[doc.fileType];
              const fileTypeStyle = FILE_TYPE_COLORS[doc.fileType];
              const statusConfig = STATUS_BADGE[doc.status];
              const StatusIcon = statusConfig.icon;

              return (
                <Card key={doc.id} className="card-lift group transition-all duration-300 hover:border-msbm-red/20/60 dark:hover:border-msbm-red/20/40">
                  <CardContent className="pt-4">
                    <div className="flex items-start gap-3 mb-3">
                      <div className={`flex items-center justify-center h-10 w-10 rounded-xl ${fileTypeStyle.bg} shrink-0 transition-transform group-hover:scale-110`}>
                        <FTypeIcon className={`h-5 w-5 ${fileTypeStyle.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate">{doc.name}</p>
                        <Badge variant="outline" className={`text-[10px] px-1.5 py-0 mt-1 ${CATEGORY_BADGE_COLORS[doc.category]}`}>
                          {doc.category}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-3 pt-2 border-t border-border/50">
                      <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                        <CalendarDays className="h-3 w-3" />
                        {formatDate(doc.uploadDate)}
                      </span>
                      <Badge variant="outline" className={`text-[10px] px-1.5 py-0 gap-0.5 ${statusConfig.className}`}>
                        <StatusIcon className="h-3 w-3" />
                        {doc.status}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between mt-1.5">
                      <span className="text-[10px] text-muted-foreground">{doc.fileSize} · {doc.fileType}</span>
                      {doc.expiryDate && (
                        <span className="text-[10px] text-muted-foreground">Exp: {formatDate(doc.expiryDate)}</span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {filteredDocuments.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <FolderOpen className="h-12 w-12 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground mt-3">No documents found matching your criteria.</p>
            </div>
          )}
        </TabsContent>

        {/* ─── Certifications Tab ───────────────────────────────── */}
        <TabsContent value="certifications" className="mt-4 space-y-4">
          <ScrollArea className="max-h-[680px]">
            <div className="space-y-3 pr-2">
              {certifications.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">No certifications uploaded yet.</p>}
              {certifications.map((cert) => {
                const daysRemaining = getDaysRemaining(cert.expiryDate);
                const statusCfg = STATUS_BADGE[cert.status];

                return (
                  <Card key={cert.id} className="card-lift transition-all duration-300 hover:border-msbm-red/20/60 dark:hover:border-msbm-red/20/40">
                    <CardContent className="pt-4">
                      <div className="flex items-start gap-4">
                        <ProgressRing days={Math.max(0, daysRemaining)} maxDays={1095} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h3 className="text-sm font-semibold">{cert.name}</h3>
                              <p className="text-xs text-muted-foreground mt-0.5">{cert.issuingBody}</p>
                            </div>
                            <Badge variant="outline" className={`text-[10px] px-1.5 py-0 shrink-0 ${statusCfg.className}`}>
                              {cert.status}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-3 mt-2 text-[10px] text-muted-foreground flex-wrap">
                            <span className="flex items-center gap-1"><CalendarDays className="h-3 w-3" />Issued: {formatDate(cert.issueDate)}</span>
                            <span className="flex items-center gap-1"><CalendarDays className="h-3 w-3" />Expires: {formatDate(cert.expiryDate)}</span>
                            <span className="font-mono">ID: {cert.credentialId}</span>
                          </div>
                          <div className="flex items-center gap-2 mt-3">
                            <Button variant="outline" size="sm" className="text-xs h-7 gap-1" asChild>
                              <a href={cert.verifyLink}>
                                <ExternalLink className="h-3 w-3" />Verify
                              </a>
                            </Button>
                            {(cert.status === "Expiring Soon" || cert.status === "Expired") && (
                              <Button variant="outline" size="sm" className="text-xs h-7 gap-1 text-amber-600 border-amber-200 dark:border-amber-800 hover:bg-amber-50 dark:hover:bg-amber-950/30">
                                <RefreshCw className="h-3 w-3" />Renew
                              </Button>
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

        {/* ─── Requests Tab ─────────────────────────────────────── */}
        <TabsContent value="requests" className="mt-4 space-y-4">
          <ScrollArea className="max-h-[680px]">
            <div className="space-y-3 pr-2">
              {requests.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">No document requests yet.</p>}
              {requests.map((req) => {
                const reqStatus = REQUEST_STATUS_BADGE[req.status];
                const ReqIcon = reqStatus.icon;

                return (
                  <Card key={req.id} className="card-lift transition-all duration-300">
                    <CardContent className="pt-4">
                      <div className="flex items-start gap-3">
                        <div className="flex items-center justify-center h-9 w-9 rounded-xl bg-muted shrink-0">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h3 className="text-sm font-semibold">{req.type}</h3>
                              <span className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                                <CalendarDays className="h-3 w-3" />{formatDate(req.date)}
                              </span>
                            </div>
                            <Badge variant="outline" className={`text-[10px] px-1.5 py-0 gap-0.5 shrink-0 ${reqStatus.className}`}>
                              <ReqIcon className="h-3 w-3" />
                              {req.status}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2">{req.notes}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>

      {/* ─── Upload Document Dialog ─────────────────────────────── */}
      <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5 text-emerald-500" />
              Upload Document
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Document Name</Label>
              <Input placeholder="e.g. Professional License" value={uploadForm.name} onChange={(e) => setUploadForm((p) => ({ ...p, name: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={uploadForm.category} onValueChange={(v) => setUploadForm((p) => ({ ...p, category: v }))}>
                <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Upload File</Label>
              <div className="flex items-center justify-center h-24 rounded-xl border-2 border-dashed border-muted-foreground/30 hover:border-emerald-300 dark:hover:border-emerald-700 transition-colors cursor-pointer bg-muted/30">
                <div className="text-center">
                  <Upload className="h-6 w-6 mx-auto text-muted-foreground/60" />
                  <p className="text-xs text-muted-foreground mt-1">Click to upload or drag & drop</p>
                  <p className="text-[10px] text-muted-foreground">PDF, DOCX, JPG, PNG up to 25MB</p>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Expiry Date (Optional)</Label>
              <Input type="date" value={uploadForm.expiryDate} onChange={(e) => setUploadForm((p) => ({ ...p, expiryDate: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Notes (Optional)</Label>
              <Input placeholder="Any additional notes..." value={uploadForm.notes} onChange={(e) => setUploadForm((p) => ({ ...p, notes: e.target.value }))} />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setUploadDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleUpload} className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:from-emerald-600 hover:to-teal-700">
              <Upload className="h-4 w-4 mr-1.5" />Upload
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── New Request Dialog ─────────────────────────────────── */}
      <Dialog open={requestDialogOpen} onOpenChange={setRequestDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-emerald-500" />
              New Document Request
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Request Type</Label>
              <Select value={requestForm.type} onValueChange={(v) => setRequestForm((p) => ({ ...p, type: v }))}>
                <SelectTrigger><SelectValue placeholder="Select request type" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Employment Letter">Employment Letter</SelectItem>
                  <SelectItem value="Reference Letter">Reference Letter</SelectItem>
                  <SelectItem value="Salary Certificate">Salary Certificate</SelectItem>
                  <SelectItem value="Tax Document">Tax Document</SelectItem>
                  <SelectItem value="Experience Letter">Experience Letter</SelectItem>
                  <SelectItem value="Study Leave Approval">Study Leave Approval</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <Input placeholder="Purpose or additional details..." value={requestForm.notes} onChange={(e) => setRequestForm((p) => ({ ...p, notes: e.target.value }))} />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setRequestDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleNewRequest} className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:from-emerald-600 hover:to-teal-700">
              <Plus className="h-4 w-4 mr-1.5" />Submit Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
