'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useAppStore } from '@/store/app';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  Clock, MapPin, Play, Square, CheckCircle2, XCircle,
  FileText, Download, Search, TrendingUp, AlertTriangle,
  Shield, Timer, CalendarDays
} from 'lucide-react';

// ============ TYPES ============

interface TimesheetEntry {
  id: string;
  day: string;
  date: string;
  clockIn: string;
  clockOut: string;
  hours: number;
  status: 'complete' | 'incomplete' | 'submitted' | 'approved';
}

interface PendingTimesheet {
  id: string;
  employeeName: string;
  department: string;
  weekOf: string;
  totalHours: number;
  overtimeHours: number;
  status: 'pending' | 'approved' | 'rejected';
  submittedDate: string;
}

interface TimeEntry {
  id: string;
  employeeName: string;
  date: string;
  clockIn: string;
  clockOut: string;
  hours: number;
  overtime: number;
  status: 'approved' | 'pending' | 'rejected';
  department: string;
}

interface LaborDept {
  name: string;
  budget: number;
  actual: number;
  overtime: number;
  color: string;
}

// ============ LABOR COST DATA (computed from API in future) ============

const LABOR_DEPTS: LaborDept[] = [
  { name: 'CEI/ICT', budget: 24000, actual: 0, overtime: 0, color: 'bg-msbm-red' },
  { name: 'Admin/Directors', budget: 18000, actual: 0, overtime: 0, color: 'bg-violet-500' },
  { name: 'Maintenance', budget: 16000, actual: 0, overtime: 0, color: 'bg-amber-500' },
  { name: 'Graduate Prog.', budget: 32000, actual: 0, overtime: 0, color: 'bg-rose-500' },
  { name: 'HR', budget: 12000, actual: 0, overtime: 0, color: 'bg-blue-500' },
  { name: 'Accounting', budget: 14000, actual: 0, overtime: 0, color: 'bg-inner-blue' },
];

// ============ MAIN COMPONENT ============

export function TimeTrackingView() {
  const { employees, isClockedIn, setIsClockedIn, currentUserId } = useAppStore();
  const [activeTab, setActiveTab] = useState('clock');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [sessionStart, setSessionStart] = useState<Date | null>(null);
  const [sessionSeconds, setSessionSeconds] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortField, setSortField] = useState<'date' | 'hours'>('date');
  const [currentPage, setCurrentPage] = useState(1);
  const [dateRange, setDateRange] = useState({ from: '', to: '' });
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingStatuses, setPendingStatuses] = useState<Record<string, string>>({});
  const [timesheetEntries, setTimesheetEntries] = useState<TimesheetEntry[]>([]);
  const [pendingTimesheets, setPendingTimesheets] = useState<PendingTimesheet[]>([]);

  // Live clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Session timer
  useEffect(() => {
    if (isClockedIn && sessionStart) {
      const timer = setInterval(() => {
        setSessionSeconds(Math.floor((Date.now() - sessionStart.getTime()) / 1000));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [isClockedIn, sessionStart]);

  const handleClockIn = useCallback(() => {
    setIsClockedIn(true);
    setSessionStart(new Date());
    setSessionSeconds(0);
  }, [setIsClockedIn]);

  const handleClockOut = useCallback(() => {
    setIsClockedIn(false, undefined);
    setSessionStart(null);
    setSessionSeconds(0);
  }, [setIsClockedIn]);

  // Fetch time entries from API
  useEffect(() => {
    fetch(`/api/time-entries${currentUserId ? `?employeeId=${currentUserId}` : ''}`)
      .then(r => r.json())
      .then(d => {
        const entries = d.entries || d.timeEntries || [];
        // Map API entries to TimesheetEntry format for the current week
        if (entries.length > 0) {
          const mapped: TimesheetEntry[] = entries.slice(0, 7).map((e: any, i: number) => ({
            id: e.id,
            day: new Date(e.date || e.start_time).toLocaleDateString('en-US', { weekday: 'long' }),
            date: (e.date || e.start_time || '').split('T')[0],
            clockIn: e.start_time ? new Date(e.start_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }) : '—',
            clockOut: e.end_time ? new Date(e.end_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }) : '—',
            hours: e.total_hours || e.totalHours || 0,
            status: e.end_time ? 'complete' : 'incomplete',
          }));
          setTimesheetEntries(mapped);
        }
      })
      .catch(() => {});
  }, [currentUserId]);

  // Time entries for history table
  const allEntries = useState<TimeEntry[]>([]);

  const filteredEntries = useMemo(() => {
    let entries = [...allEntries[0]];

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      entries = entries.filter(e => e.employeeName.toLowerCase().includes(q));
    }
    if (statusFilter !== 'all') {
      entries = entries.filter(e => e.status === statusFilter);
    }
    if (dateRange.from) {
      entries = entries.filter(e => e.date >= dateRange.from);
    }
    if (dateRange.to) {
      entries = entries.filter(e => e.date <= dateRange.to);
    }
    entries.sort((a, b) => {
      if (sortField === 'date') return b.date.localeCompare(a.date);
      return b.hours - a.hours;
    });
    return entries;
  }, [searchQuery, statusFilter, sortField, dateRange.from, dateRange.to, allEntries[0]]);

  const totalPages = Math.ceil(filteredEntries.length / 10);
  const paginatedEntries = useMemo(() => filteredEntries.slice((currentPage - 1) * 10, currentPage * 10), [filteredEntries, currentPage]);

  const formatSessionTime = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const stats = useMemo(() => {
    const weekHours = timesheetEntries.reduce((s, e) => s + e.hours, 0);
    const otHours = timesheetEntries.reduce((s, e) => s + Math.max(0, e.hours - 8), 0);
    const workedDays = timesheetEntries.filter(e => e.status === 'complete').length;
    const avgDaily = workedDays > 0 ? weekHours / workedDays : 0;
    const total = timesheetEntries.length || 1;
    const compliant = timesheetEntries.filter(e => e.hours >= 8 || e.status === 'incomplete').length;
    const complianceRate = (compliant / total) * 100;
    return { weekHours: Math.round(weekHours * 100) / 100, otHours: Math.round(otHours * 100) / 100, avgDaily: Math.round(avgDaily * 100) / 100, complianceRate: Math.round(complianceRate) };
  }, [timesheetEntries]);

  const handlePendingAction = (id: string, action: 'approved' | 'rejected') => {
    setPendingStatuses(prev => ({ ...prev, [id]: action }));
  };

  const handleCSVExport = useCallback(() => {
    const headers = 'Employee,Date,Clock In,Clock Out,Hours,Overtime,Status,Department\n';
    const rows = filteredEntries.map(e =>
      `${e.employeeName},${e.date},${e.clockIn},${e.clockOut},${e.hours},${e.overtime},${e.status},${e.department}`
    ).join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'time-entries.csv';
    a.click();
    URL.revokeObjectURL(url);
  }, [filteredEntries]);

  const totalBudget = LABOR_DEPTS.reduce((s, d) => s + d.budget, 0);
  const totalActual = LABOR_DEPTS.reduce((s, d) => s + d.actual, 0);

  const statCards = [
    { label: 'Hours This Week', value: `${stats.weekHours}h`, icon: Clock, color: 'text-msbm-red-bright', bg: 'bg-msbm-red/10' },
    { label: 'Overtime Hours', value: `${stats.otHours}h`, icon: TrendingUp, color: 'text-amber-400', bg: 'bg-amber-500/10' },
    { label: 'Avg Daily Hours', value: `${stats.avgDaily}h`, icon: Timer, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { label: 'Compliance Rate', value: `${stats.complianceRate}%`, icon: Shield, color: 'text-violet-400', bg: 'bg-violet-500/10' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Clock className="h-7 w-7 text-msbm-red-bright" />
          Time Tracking
        </h2>
        <p className="text-muted-foreground mt-1">Clock in/out, manage timesheets, and track labor costs</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <Card key={stat.label} className="card-lift">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${stat.bg}`}>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                  <p className="text-xl font-bold">{stat.value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-muted/50 p-1 h-auto flex-wrap">
          <TabsTrigger value="clock" className="text-xs sm:text-sm">Time Clock</TabsTrigger>
          <TabsTrigger value="timesheet" className="text-xs sm:text-sm">Timesheet</TabsTrigger>
          <TabsTrigger value="approvals" className="text-xs sm:text-sm">Approvals</TabsTrigger>
          <TabsTrigger value="history" className="text-xs sm:text-sm">History</TabsTrigger>
          <TabsTrigger value="labor" className="text-xs sm:text-sm">Labor Costs</TabsTrigger>
        </TabsList>

        {/* ============ TIME CLOCK TAB ============ */}
        <TabsContent value="clock" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Clock Display */}
            <Card>
              <CardContent className="p-6 flex flex-col items-center text-center">
                <div className="text-5xl font-mono font-bold tracking-wider text-foreground mb-2">
                  {currentTime.toLocaleTimeString()}
                </div>
                <p className="text-sm text-muted-foreground">
                  {currentTime.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </p>

                {isClockedIn && (
                  <div className="mt-4 p-3 bg-msbm-red/10 rounded-lg border border-msbm-red/30 w-full">
                    <p className="text-xs text-msbm-red-bright font-medium">Session Duration</p>
                    <p className="text-2xl font-mono font-bold text-msbm-red-bright mt-1">
                      {formatSessionTime(sessionSeconds)}
                    </p>
                  </div>
                )}

                <Button
                  size="lg"
                  className={`mt-6 w-full ${isClockedIn ? 'bg-red-600 hover:bg-red-700' : 'bg-msbm-red hover:bg-msbm-red/80'}`}
                  onClick={isClockedIn ? handleClockOut : handleClockIn}
                >
                  {isClockedIn ? <><Square className="h-5 w-5 mr-2" /> Clock Out</> : <><Play className="h-5 w-5 mr-2" /> Clock In</>}
                </Button>
              </CardContent>
            </Card>

            {/* Geofence Status */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-msbm-red-bright" />
                  Geofence Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-msbm-red/10 rounded-lg border border-msbm-red/30">
                  <div className="w-3 h-3 rounded-full bg-msbm-red animate-pulse" />
                  <div>
                    <p className="text-sm font-medium">UWI Mona Campus</p>
                    <p className="text-xs text-muted-foreground">Kingston 7, Jamaica</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Status</span>
                    <Badge className="bg-msbm-red/20 text-msbm-red-bright border-msbm-red/30">Within Geofence</Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Latitude</span>
                    <span className="font-mono">18.0042° N</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Longitude</span>
                    <span className="font-mono">76.7467° W</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Radius</span>
                    <span>500m</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Accuracy</span>
                    <span className="text-msbm-red-bright">±8m</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ============ TIMESHEET TAB ============ */}
        <TabsContent value="timesheet" className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Weekly Timesheet — Jan 13–19, 2025</CardTitle>
                <Button className="bg-msbm-red hover:bg-msbm-red/80 text-sm" onClick={() => setShowConfirmDialog(true)}>
                  <FileText className="h-4 w-4 mr-2" /> Submit Timesheet
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Day</TableHead>
                    <TableHead className="hidden sm:table-cell">Date</TableHead>
                    <TableHead>Clock In</TableHead>
                    <TableHead>Clock Out</TableHead>
                    <TableHead>Hours</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {timesheetEntries.length === 0 && (
                    <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">No timesheet entries yet. Clock in to start tracking your hours.</TableCell></TableRow>
                  )}
                  {timesheetEntries.map(entry => (
                    <TableRow key={entry.id}>
                      <TableCell className="font-medium">{entry.day}</TableCell>
                      <TableCell className="hidden sm:table-cell text-muted-foreground">{entry.date}</TableCell>
                      <TableCell className="font-mono text-sm">{entry.clockIn}</TableCell>
                      <TableCell className="font-mono text-sm">{entry.clockOut}</TableCell>
                      <TableCell className="font-semibold">{entry.hours > 0 ? `${entry.hours}h` : '—'}</TableCell>
                      <TableCell>
                        {entry.status === 'complete' && <Badge className="bg-msbm-red/20 text-msbm-red-bright border-msbm-red/30">Complete</Badge>}
                        {entry.status === 'incomplete' && <Badge className="bg-muted text-muted-foreground border-border">Incomplete</Badge>}
                        {entry.status === 'submitted' && <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">Submitted</Badge>}
                        {entry.status === 'approved' && <Badge className="bg-msbm-red/20 text-msbm-red-bright border-msbm-red/30">Approved</Badge>}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="flex justify-between items-center mt-4 text-sm">
                <span className="text-muted-foreground">Weekly Total</span>
                <span className="font-bold text-lg">{stats.weekHours}h</span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ============ APPROVALS TAB ============ */}
        <TabsContent value="approvals" className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Manager Approval Queue</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {pendingTimesheets.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-8">No pending timesheets to review.</p>
              )}
              {pendingTimesheets.map(pt => {
                const action = pendingStatuses[pt.id] as string | undefined;
                const currentStatus = action || pt.status;
                return (
                  <div key={pt.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-lg border border-border/50 bg-card">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-sm">{pt.employeeName}</span>
                        <Badge variant="outline" className="text-xs">{pt.department}</Badge>
                        {currentStatus === 'pending' && <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 text-xs">Pending</Badge>}
                        {currentStatus === 'approved' && <Badge className="bg-msbm-red/20 text-msbm-red-bright border-msbm-red/30 text-xs">Approved</Badge>}
                        {currentStatus === 'rejected' && <Badge className="bg-red-500/20 text-red-400 border-red-500/30 text-xs">Rejected</Badge>}
                      </div>
                      <div className="flex gap-4 mt-1 text-xs text-muted-foreground">
                        <span>Week of {pt.weekOf}</span>
                        <span>Total: {pt.totalHours}h</span>
                        <span>OT: {pt.overtimeHours}h</span>
                        <span>Submitted: {pt.submittedDate}</span>
                      </div>
                    </div>
                    {currentStatus === 'pending' && (
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="text-xs border-msbm-red/30 text-msbm-red-bright hover:bg-msbm-red/10"
                          onClick={() => handlePendingAction(pt.id, 'approved')}>
                          <CheckCircle2 className="h-3 w-3 mr-1" /> Approve
                        </Button>
                        <Button size="sm" variant="outline" className="text-xs border-red-500/30 text-red-400 hover:bg-red-500/10"
                          onClick={() => handlePendingAction(pt.id, 'rejected')}>
                          <XCircle className="h-3 w-3 mr-1" /> Reject
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ============ HISTORY TAB ============ */}
        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <CardTitle className="text-base">Time Entry History</CardTitle>
                <Button variant="outline" size="sm" className="text-xs" onClick={handleCSVExport}>
                  <Download className="h-3 w-3 mr-1" /> Export CSV
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search by employee..." value={searchQuery} onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }} className="pl-8" />
                </div>
                <Select value={statusFilter} onValueChange={v => { setStatusFilter(v); setCurrentPage(1); }}>
                  <SelectTrigger className="w-[130px]"><SelectValue placeholder="Status" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={sortField} onValueChange={v => setSortField(v as 'date' | 'hours')}>
                  <SelectTrigger className="w-[130px]"><SelectValue placeholder="Sort by" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="date">Sort: Date</SelectItem>
                    <SelectItem value="hours">Sort: Hours</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2 items-center">
                <Input type="date" className="w-[150px] text-xs" value={dateRange.from} onChange={e => setDateRange(p => ({ ...p, from: e.target.value }))} />
                <span className="text-xs text-muted-foreground">to</span>
                <Input type="date" className="w-[150px] text-xs" value={dateRange.to} onChange={e => setDateRange(p => ({ ...p, to: e.target.value }))} />
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>In</TableHead>
                      <TableHead>Out</TableHead>
                      <TableHead>Hours</TableHead>
                      <TableHead>OT</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedEntries.map(entry => (
                      <TableRow key={entry.id}>
                        <TableCell className="font-medium text-sm">{entry.employeeName}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{entry.date}</TableCell>
                        <TableCell className="font-mono text-sm">{entry.clockIn}</TableCell>
                        <TableCell className="font-mono text-sm">{entry.clockOut}</TableCell>
                        <TableCell className="font-semibold text-sm">{entry.hours}h</TableCell>
                        <TableCell className="text-sm">{entry.overtime > 0 ? <span className="text-amber-400">{entry.overtime}h</span> : '—'}</TableCell>
                        <TableCell>
                          {entry.status === 'approved' && <Badge className="bg-msbm-red/20 text-msbm-red-bright border-msbm-red/30 text-xs">Approved</Badge>}
                          {entry.status === 'pending' && <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 text-xs">Pending</Badge>}
                          {entry.status === 'rejected' && <Badge className="bg-red-500/20 text-red-400 border-red-500/30 text-xs">Rejected</Badge>}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  Showing {((currentPage - 1) * 10) + 1}–{Math.min(currentPage * 10, filteredEntries.length)} of {filteredEntries.length} entries
                </span>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" disabled={currentPage <= 1} onClick={() => setCurrentPage(p => p - 1)}>Prev</Button>
                  <Button variant="outline" size="sm" disabled={currentPage >= totalPages} onClick={() => setCurrentPage(p => p + 1)}>Next</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ============ LABOR COSTS TAB ============ */}
        <TabsContent value="labor" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-xs text-muted-foreground">Total Budget</p>
                <p className="text-2xl font-bold text-foreground">${totalBudget.toLocaleString()}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-xs text-muted-foreground">Total Actual</p>
                <p className={`text-2xl font-bold ${totalActual > totalBudget ? 'text-red-400' : 'text-msbm-red-bright'}`}>
                  ${totalActual.toLocaleString()}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-xs text-muted-foreground">Total Overtime</p>
                <p className="text-2xl font-bold text-amber-400">
                  ${LABOR_DEPTS.reduce((s, d) => s + d.overtime, 0).toLocaleString()}
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Budget vs. Actual by Department</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {LABOR_DEPTS.map(dept => {
                const overBudget = dept.actual > dept.budget;
                const pct = (dept.actual / dept.budget) * 100;
                return (
                  <div key={dept.name} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${dept.color}`} />
                        <span className="text-sm font-medium">{dept.name}</span>
                        {overBudget && <AlertTriangle className="h-3 w-3 text-red-400" />}
                      </div>
                      <div className="flex gap-4 text-xs">
                        <span className="text-muted-foreground">Budget: ${dept.budget.toLocaleString()}</span>
                        <span className={overBudget ? 'text-red-400 font-medium' : 'text-msbm-red-bright font-medium'}>Actual: ${dept.actual.toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="h-4 bg-muted/30 rounded-full overflow-hidden relative">
                      <div className={`h-full rounded-full transition-all ${dept.color} w-[${Math.round(Math.min(pct, 100))}%]`} />
                      {overBudget && (
                        <div className="absolute inset-0 h-full bg-red-500/20 rounded-full w-[${Math.round(Math.min(pct, 150))}%] max-w-full" />
                      )}
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Overtime Cost: ${dept.overtime.toLocaleString()}</span>
                      <span>{Math.round(pct)}% of budget</span>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Overtime Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {LABOR_DEPTS.filter(d => d.overtime > 0).sort((a, b) => b.overtime - a.overtime).map(dept => (
                  <div key={dept.name} className="flex items-center gap-3 p-3 rounded-lg border border-border/50">
                    <div className={`w-10 h-10 rounded-lg ${dept.color} flex items-center justify-center text-white font-bold text-xs`}>
                      ${(dept.overtime / 1000).toFixed(1)}k
                    </div>
                    <div>
                      <p className="text-sm font-medium">{dept.name}</p>
                      <p className="text-xs text-muted-foreground">${dept.overtime.toLocaleString()} overtime cost</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Submit Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Submit Timesheet</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Are you sure you want to submit your timesheet for the week of January 13–19, 2025?
              This will send your hours to your manager for approval.
            </p>
            <div className="grid grid-cols-2 gap-4 p-3 bg-muted/30 rounded-lg">
              <div>
                <p className="text-xs text-muted-foreground">Regular Hours</p>
                <p className="text-lg font-bold">{(stats.weekHours - stats.otHours).toFixed(2)}h</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Overtime Hours</p>
                <p className="text-lg font-bold text-amber-400">{stats.otHours}h</p>
              </div>
            </div>
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>Cancel</Button>
              <Button className="bg-msbm-red hover:bg-msbm-red/80" onClick={() => setShowConfirmDialog(false)}>
                Confirm Submit
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
