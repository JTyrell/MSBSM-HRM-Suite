'use client';

import React, { useState, useMemo, useRef, useCallback } from 'react';
import { useAppStore } from '@/store/app';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Calendar, Clock, AlertTriangle, ArrowRightLeft, DollarSign,
  Users, ChevronLeft, ChevronRight, Plus, CheckCircle2, XCircle,
  CalendarDays, Palette, ToggleLeft, ToggleRight
} from 'lucide-react';

// ============ TYPES ============

interface ShiftAssignment {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  day: string;
  startHour: number;
  endHour: number;
  role: string;
  breakMinutes: number;
}

interface SwapRequest {
  id: string;
  fromEmployee: string;
  toEmployee: string;
  date: string;
  shiftStart: string;
  shiftEnd: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
}

interface ScheduleConflict {
  id: string;
  type: 'double-booking' | 'overtime' | 'budget' | 'missing-break' | 'availability';
  severity: 'high' | 'medium' | 'low';
  employee: string;
  description: string;
  date: string;
}

interface ShiftTemplate {
  id: string;
  name: string;
  startHour: number;
  endHour: number;
  color: string;
  duration: string;
  description: string;
}

interface EmployeeAvailability {
  employeeId: string;
  employeeName: string;
  department: string;
  slots: Record<string, boolean[]>;
}

// ============ CONSTANTS ============

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const HOURS = Array.from({ length: 17 }, (_, i) => i + 6); // 6AM to 10PM
const SHORT_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const DEPT_COLORS: Record<string, string> = {
  ICT: 'bg-msbm-red/20 border-msbm-red text-msbm-red-bright',
  Maintenance: 'bg-amber-500/20 border-amber-500 text-amber-300',
  Admin: 'bg-violet-500/20 border-violet-500 text-violet-300',
  Faculty: 'bg-rose-500/20 border-rose-500 text-rose-300',
};

const DEPT_BLOCK_COLORS: Record<string, string> = {
  ICT: 'bg-msbm-red/70',
  Maintenance: 'bg-amber-500/70',
  Admin: 'bg-violet-500/70',
  Faculty: 'bg-rose-500/70',
};

const DEPT_TEXT: Record<string, string> = {
  ICT: 'text-msbm-red-bright',
  Maintenance: 'text-amber-400',
  Admin: 'text-violet-400',
  Faculty: 'text-rose-400',
};

const TEMPLATES: ShiftTemplate[] = [
  { id: 't1', name: 'Morning', startHour: 6, endHour: 14, color: 'bg-msbm-red', duration: '8 hours', description: 'Early morning shift covering peak operations' },
  { id: 't2', name: 'Afternoon', startHour: 14, endHour: 22, color: 'bg-amber-500', duration: '8 hours', description: 'Afternoon to evening coverage' },
  { id: 't3', name: 'Night', startHour: 22, endHour: 6, color: 'bg-slate-500', duration: '8 hours', description: 'Overnight security and maintenance shift' },
  { id: 't4', name: 'Standard Office', startHour: 8, endHour: 17, color: 'bg-blue-500', duration: '9 hours (8h + 1h lunch)', description: 'Standard business hours with lunch break' },
  { id: 't5', name: 'Flex', startHour: 9, endHour: 17, color: 'bg-inner-blue', duration: '8 hours', description: 'Flexible start time for admin staff' },
  { id: 't6', name: 'Split', startHour: 7, endHour: 17, color: 'bg-orange-500', duration: '8 hours (4h+4h)', description: 'Split shift with mid-day break: 7-11 & 13-17' },
  { id: 't7', name: 'On-Call', startHour: 0, endHour: 24, color: 'bg-rose-500', duration: '24 hours (on-demand)', description: 'On-call availability for emergencies' },
  { id: 't8', name: 'Weekend', startHour: 8, endHour: 18, color: 'bg-purple-500', duration: '10 hours', description: 'Extended weekend coverage shift' },
];

// ============ MAIN COMPONENT ============

export function SmartSchedulingView() {
  const { employees } = useAppStore();
  const [activeTab, setActiveTab] = useState('weekly');
  const [selectedDay, setSelectedDay] = useState(DAYS[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1]);
  const [deptFilter, setDeptFilter] = useState('all');
  const [swapFilter, setSwapFilter] = useState('all');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const initialized = useRef(false);

  // ============ MOCK DATA (Lazy Init) ============
  const mockAssignments = useRef<ShiftAssignment[]>([]);
  const mockSwaps = useRef<SwapRequest[]>([]);
  const mockConflicts = useRef<ScheduleConflict[]>([]);
  const mockAvailability = useRef<EmployeeAvailability[]>([]);

  const initMockData = useCallback(() => {
    if (initialized.current) return;
    initialized.current = true;

    const emps = employees.length > 0
      ? employees.slice(0, 10)
      : [
          { id: 'e1', firstName: 'Marcus', lastName: 'Brown', department: { name: 'ICT' } as never, role: 'Manager', payRate: 45 },
          { id: 'e2', firstName: 'Lisa', lastName: 'Chen', department: { name: 'Admin' } as never, role: 'Coordinator', payRate: 38 },
          { id: 'e3', firstName: 'David', lastName: 'Taylor', department: { name: 'Maintenance' } as never, role: 'Technician', payRate: 32 },
          { id: 'e4', firstName: 'Sarah', lastName: 'Williams', department: { name: 'Faculty' } as never, role: 'Professor', payRate: 55 },
          { id: 'e5', firstName: 'James', lastName: 'Anderson', department: { name: 'ICT' } as never, role: 'Developer', payRate: 42 },
          { id: 'e6', firstName: 'Maria', lastName: 'Garcia', department: { name: 'Admin' } as never, role: 'Assistant', payRate: 30 },
          { id: 'e7', firstName: 'Robert', lastName: 'Johnson', department: { name: 'Maintenance' } as never, role: 'Supervisor', payRate: 40 },
          { id: 'e8', firstName: 'Emily', lastName: 'Davis', department: { name: 'Faculty' } as never, role: 'Lecturer', payRate: 48 },
          { id: 'e9', firstName: 'Michael', lastName: 'Thompson', department: { name: 'ICT' } as never, role: 'Analyst', payRate: 36 },
          { id: 'e10', firstName: 'Jessica', lastName: 'Martinez', department: { name: 'Admin' } as never, role: 'Receptionist', payRate: 28 },
        ];

    const depts = ['ICT', 'Maintenance', 'Admin', 'Faculty'];
    const assignments: ShiftAssignment[] = [];
    let aid = 1;

    emps.forEach((emp) => {
      const dept = emp.department?.name || depts[Math.floor(Math.random() * depts.length)];
      const daysPerWeek = 3 + Math.floor(Math.random() * 3);
      const usedDays: number[] = [];
      for (let d = 0; d < daysPerWeek; d++) {
        let dayIdx;
        do { dayIdx = Math.floor(Math.random() * 7); } while (usedDays.includes(dayIdx));
        usedDays.push(dayIdx);
        const startH = 6 + Math.floor(Math.random() * 10);
        const endH = startH + 6 + Math.floor(Math.random() * 4);
        assignments.push({
          id: `a${aid++}`,
          employeeId: emp.id,
          employeeName: `${emp.firstName} ${emp.lastName}`,
          department: dept,
          day: DAYS[dayIdx],
          startHour: startH,
          endHour: Math.min(endH, 22),
          role: emp.role,
          breakMinutes: 30,
        });
      }
    });
    mockAssignments.current = assignments;

    mockSwaps.current = [
      { id: 's1', fromEmployee: 'Marcus Brown', toEmployee: 'James Anderson', date: 'Monday', shiftStart: '06:00', shiftEnd: '14:00', reason: 'Medical appointment', status: 'pending' },
      { id: 's2', fromEmployee: 'Lisa Chen', toEmployee: 'Maria Garcia', date: 'Wednesday', shiftStart: '09:00', shiftEnd: '17:00', reason: 'Family event', status: 'pending' },
      { id: 's3', fromEmployee: 'David Taylor', toEmployee: 'Robert Johnson', date: 'Friday', shiftStart: '08:00', shiftEnd: '16:00', reason: 'Personal day', status: 'pending' },
      { id: 's4', fromEmployee: 'Sarah Williams', toEmployee: 'Emily Davis', date: 'Thursday', shiftStart: '10:00', shiftEnd: '18:00', reason: 'Conference attendance', status: 'approved' },
      { id: 's5', fromEmployee: 'James Anderson', toEmployee: 'Marcus Brown', date: 'Saturday', shiftStart: '08:00', shiftEnd: '16:00', reason: 'Schedule preference', status: 'rejected' },
    ];

    mockConflicts.current = [
      { id: 'c1', type: 'double-booking', severity: 'high', employee: 'Marcus Brown', description: 'Assigned to two overlapping shifts on Monday', date: 'Monday' },
      { id: 'c2', type: 'overtime', severity: 'high', employee: 'David Taylor', description: 'Exceeds 48-hour weekly limit (52h scheduled)', date: 'Week of Jan 13' },
      { id: 'c3', type: 'budget', severity: 'medium', employee: 'N/A', description: 'ICT department projected 12% over weekly labor budget', date: 'Week of Jan 13' },
      { id: 'c4', type: 'missing-break', severity: 'medium', employee: 'James Anderson', description: '8-hour shift on Tuesday without scheduled break', date: 'Tuesday' },
      { id: 'c5', type: 'availability', severity: 'low', employee: 'Sarah Williams', description: 'Scheduled outside stated availability window', date: 'Thursday' },
      { id: 'c6', type: 'double-booking', severity: 'high', employee: 'Lisa Chen', description: 'Overlapping Admin assignments on Wednesday 14:00-16:00', date: 'Wednesday' },
    ];

    const availabilitySlots: Record<string, boolean[]> = {};
    DAYS.forEach(d => {
      const slots: boolean[] = [];
      for (let h = 6; h <= 22; h++) {
        if (d === 'Saturday' || d === 'Sunday') {
          slots.push(Math.random() > 0.7);
        } else {
          slots.push(Math.random() > 0.25);
        }
      }
      availabilitySlots[d] = slots;
    });

    mockAvailability.current = [
      { employeeId: 'e1', employeeName: 'Marcus Brown', department: 'ICT', slots: { ...availabilitySlots, Monday: Array(17).fill(true).map((_, i) => i < 12 || i > 14) } },
      { employeeId: 'e2', employeeName: 'Lisa Chen', department: 'Admin', slots: { ...availabilitySlots } },
      { employeeId: 'e3', employeeName: 'David Taylor', department: 'Maintenance', slots: { ...availabilitySlots, Saturday: Array(17).fill(false), Sunday: Array(17).fill(false) } },
      { employeeId: 'e4', employeeName: 'Sarah Williams', department: 'Faculty', slots: { ...availabilitySlots, Monday: Array(17).fill(true), Wednesday: Array(17).fill(true) } },
      { employeeId: 'e5', employeeName: 'James Anderson', department: 'ICT', slots: { ...availabilitySlots } },
    ];
  }, [employees]);

  // Initialize on first render
  initMockData();

  // ============ COMPUTED VARIABLES ============

  const assignments = mockAssignments.current;

  const totalScheduledHours = useMemo(() => {
    return assignments.reduce((sum, a) => sum + (a.endHour - a.startHour), 0);
  }, [assignments.length > 0]);

  const openShifts = useMemo(() => {
    return Math.max(0, 12 - assignments.length);
  }, [assignments.length]);

  const pendingSwaps = useMemo(() => {
    return mockSwaps.current.filter(s => s.status === 'pending').length;
  }, [mockSwaps.current.length]);

  const activeConflicts = useMemo(() => {
    return mockConflicts.current.length;
  }, [mockConflicts.current.length]);

  const projectedLaborCost = useMemo(() => {
    const empMap = new Map(employees.map(e => [e.id, e]));
    return assignments.reduce((sum, a) => {
      const emp = empMap.get(a.employeeId);
      const rate = emp?.payRate || 35;
      return sum + (a.endHour - a.startHour) * rate;
    }, 0);
  }, [assignments, employees]);

  const dailyStats = useMemo(() => {
    const stats: Record<string, number> = {};
    DAYS.forEach(d => {
      stats[d] = assignments
        .filter(a => a.day === d)
        .reduce((sum, a) => sum + (a.endHour - a.startHour), 0);
    });
    return stats;
  }, [assignments]);

  const weeklyHoursByEmployee = useMemo(() => {
    const hours: Record<string, number> = {};
    assignments.forEach(a => {
      hours[a.employeeName] = (hours[a.employeeName] || 0) + (a.endHour - a.startHour);
    });
    return Object.entries(hours).map(([name, hrs]) => ({ name, hours: hrs })).sort((a, b) => b.hours - a.hours);
  }, [assignments]);

  const filteredAssignments = useMemo(() => {
    return deptFilter === 'all'
      ? assignments
      : assignments.filter(a => a.department === deptFilter);
  }, [deptFilter, assignments]);

  const maxWeeklyHours = useMemo(() => {
    return Math.max(...weeklyHoursByEmployee.map(e => e.hours), 1);
  }, [weeklyHoursByEmployee]);

  const severityColors: Record<string, string> = {
    high: 'bg-red-500/20 text-red-400 border-red-500/30',
    medium: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    low: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  };

  const conflictIcons: Record<string, string> = {
    'double-booking': '🔴',
    overtime: '🟠',
    budget: '🟡',
    'missing-break': '🔵',
    availability: '⚪',
  };

  // ============ HANDLERS ============

  const [swapStatuses, setSwapStatuses] = useState<Record<string, string>>({});

  const handleSwapAction = (id: string, action: 'approved' | 'rejected') => {
    setSwapStatuses(prev => ({ ...prev, [id]: action }));
    const swap = mockSwaps.current.find(s => s.id === id);
    if (swap) swap.status = action;
  };

  const filteredSwaps = useMemo(() => {
    return swapFilter === 'all'
      ? mockSwaps.current
      : mockSwaps.current.filter(s => s.status === swapFilter);
  }, [swapFilter, mockSwaps.current.length, swapStatuses]);

  // ============ STATS CARDS ============

  const statsCards = [
    { label: 'Scheduled Hours', value: totalScheduledHours, icon: Clock, color: 'text-msbm-red-bright', bg: 'bg-msbm-red/10' },
    { label: 'Open Shifts', value: openShifts, icon: Calendar, color: 'text-amber-400', bg: 'bg-amber-500/10' },
    { label: 'Pending Swaps', value: pendingSwaps, icon: ArrowRightLeft, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { label: 'Active Conflicts', value: activeConflicts, icon: AlertTriangle, color: 'text-red-400', bg: 'bg-red-500/10' },
    { label: 'Projected Labor Cost', value: `$${projectedLaborCost.toLocaleString()}`, icon: DollarSign, color: 'text-violet-400', bg: 'bg-violet-500/10', isString: true },
  ];

  // ============ RENDER ============

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <CalendarDays className="h-7 w-7 text-msbm-red-bright" />
            Smart Scheduling Engine
          </h2>
          <p className="text-muted-foreground mt-1">AI-powered shift scheduling, availability management, and conflict detection</p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button className="bg-msbm-red hover:bg-msbm-red/80">
              <Plus className="h-4 w-4 mr-2" /> Create Assignment
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Create Shift Assignment</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Employee</Label>
                <Select>
                  <SelectTrigger><SelectValue placeholder="Select employee" /></SelectTrigger>
                  <SelectContent>
                    {employees.slice(0, 15).map(emp => (
                      <SelectItem key={emp.id} value={emp.id}>
                        {emp.firstName} {emp.lastName} — {emp.role}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Day</Label>
                <Select>
                  <SelectTrigger><SelectValue placeholder="Select day" /></SelectTrigger>
                  <SelectContent>
                    {DAYS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Start Hour</Label>
                  <Input type="number" min={6} max={22} placeholder="8" />
                </div>
                <div className="space-y-2">
                  <Label>End Hour</Label>
                  <Input type="number" min={6} max={22} placeholder="17" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Break (minutes)</Label>
                  <Input type="number" min={0} max={60} placeholder="30" defaultValue="30" />
                </div>
                <div className="space-y-2">
                  <Label>Role</Label>
                  <Input placeholder="e.g. Supervisor" />
                </div>
              </div>
              <Button onClick={() => setShowCreateDialog(false)} className="w-full bg-msbm-red hover:bg-msbm-red/80">
                Create Assignment
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {statsCards.map((stat) => (
          <Card key={stat.label} className="card-lift">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${stat.bg}`}>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                  <p className="text-xl font-bold">{stat.isString ? stat.value : stat.value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="bg-muted/50 p-1 h-auto flex-wrap">
          <TabsTrigger value="weekly" className="text-xs sm:text-sm">Weekly Schedule</TabsTrigger>
          <TabsTrigger value="availability" className="text-xs sm:text-sm">Availability</TabsTrigger>
          <TabsTrigger value="templates" className="text-xs sm:text-sm">Shift Templates</TabsTrigger>
          <TabsTrigger value="swaps" className="text-xs sm:text-sm">Swap Requests</TabsTrigger>
          <TabsTrigger value="conflicts" className="text-xs sm:text-sm">Conflicts</TabsTrigger>
        </TabsList>

        {/* ============ WEEKLY SCHEDULE TAB ============ */}
        <TabsContent value="weekly" className="space-y-4">
          {/* Department Filter + Daily Stats */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <Select value={deptFilter} onValueChange={setDeptFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                <SelectItem value="ICT">ICT</SelectItem>
                <SelectItem value="Maintenance">Maintenance</SelectItem>
                <SelectItem value="Admin">Admin</SelectItem>
                <SelectItem value="Faculty">Faculty</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex gap-2 flex-wrap">
              {DAYS.map(d => (
                <div key={d} className="text-center">
                  <p className="text-xs text-muted-foreground">{SHORT_DAYS[DAYS.indexOf(d)]}</p>
                  <p className="text-sm font-semibold">{dailyStats[d]}h</p>
                </div>
              ))}
            </div>
          </div>

          {/* Desktop: Full Week Grid */}
          <div className="hidden lg:block">
            <Card>
              <CardContent className="p-4">
                <div className="overflow-x-auto">
                  <div className="min-w-[900px]">
                    {/* Header Row */}
                    <div className="grid grid-cols-[60px_repeat(7,1fr)] border-b border-border pb-2 mb-2">
                      <div className="text-xs text-muted-foreground font-medium">Time</div>
                      {DAYS.map(d => (
                        <div key={d} className="text-center text-sm font-medium">{SHORT_DAYS[DAYS.indexOf(d)]}</div>
                      ))}
                    </div>
                    {/* Hour Rows */}
                    {HOURS.map(hour => (
                      <div key={hour} className="grid grid-cols-[60px_repeat(7,1fr)] min-h-[28px] border-b border-border/30">
                        <div className="text-xs text-muted-foreground pr-2 pt-0.5">
                          {hour > 12 ? hour - 12 : hour}{hour >= 12 ? 'PM' : 'AM'}
                        </div>
                        {DAYS.map(day => {
                          const shifts = filteredAssignments.filter(
                            a => a.day === day && hour >= a.startHour && hour < a.endHour
                          );
                          return (
                            <div key={`${day}-${hour}`} className="border-l border-border/20 px-0.5 py-0.5">
                              {shifts.map(s => (
                                <div
                                  key={s.id}
                                  className={`${DEPT_BLOCK_COLORS[s.department] || 'bg-slate-500/70'} rounded text-[10px] px-1 py-0.5 truncate text-white`}
                                  title={`${s.employeeName}: ${s.startHour}-${s.endHour}`}
                                >
                                  {hour === s.startHour ? `${s.employeeName} (${s.startHour}-${s.endHour})` : '\u00A0'}
                                </div>
                              ))}
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Mobile: Single Day Selector */}
          <div className="lg:hidden space-y-3">
            <div className="flex gap-2 overflow-x-auto pb-2">
              {DAYS.map(d => (
                <Button
                  key={d}
                  variant={selectedDay === d ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedDay(d)}
                  className="whitespace-nowrap"
                >
                  {SHORT_DAYS[DAYS.indexOf(d)]}
                </Button>
              ))}
            </div>
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-3">{selectedDay}</h3>
                {filteredAssignments.filter(a => a.day === selectedDay).length === 0 ? (
                  <p className="text-sm text-muted-foreground">No shifts scheduled for this day.</p>
                ) : (
                  <div className="space-y-2">
                    {filteredAssignments.filter(a => a.day === selectedDay).map(a => (
                      <div key={a.id} className={`p-3 rounded-lg border ${DEPT_COLORS[a.department] || 'bg-slate-500/20 border-slate-500 text-slate-300'}`}>
                        <div className="flex justify-between items-center">
                          <span className="font-medium text-sm">{a.employeeName}</span>
                          <Badge variant="outline" className="text-xs">{a.role}</Badge>
                        </div>
                        <div className="flex gap-4 mt-1 text-xs">
                          <span>{a.startHour > 12 ? a.startHour - 12 : a.startHour}{a.startHour >= 12 ? 'PM' : 'AM'} — {a.endHour > 12 ? a.endHour - 12 : a.endHour}{a.endHour >= 12 ? 'PM' : 'AM'}</span>
                          <span>Break: {a.breakMinutes}m</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Weekly Hours Bar Chart */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Weekly Hours by Employee</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {weeklyHoursByEmployee.map(({ name, hours }) => (
                  <div key={name} className="flex items-center gap-3">
                    <span className="text-sm w-32 truncate">{name}</span>
                    <div className="flex-1">
                      <div className="h-5 bg-muted/50 rounded-full overflow-hidden">
                        <div
                          className={`h-full bg-gradient-to-r from-msbm-red to-inner-blue rounded-full transition-all w-[${Math.round((hours / maxWeeklyHours) * 100)}%]`}
                        />
                      </div>
                    </div>
                    <span className="text-sm font-medium w-12 text-right">{hours}h</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ============ AVAILABILITY TAB ============ */}
        <TabsContent value="availability" className="space-y-4">
          <div className="grid gap-4">
            {mockAvailability.current.map((emp) => (
              <Card key={emp.employeeId}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base">{emp.employeeName}</CardTitle>
                      <p className="text-xs text-muted-foreground">{emp.department}</p>
                    </div>
                    <Badge variant="outline" className={DEPT_TEXT[emp.department] || ''}>{emp.department}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map(day => (
                      <div key={day}>
                        <p className="text-xs font-medium text-muted-foreground mb-1">{day}</p>
                        <div className="flex gap-0.5 flex-wrap">
                          {HOURS.filter(h => h <= 22).map(hour => {
                            const slotIdx = hour - 6;
                            const isAvailable = emp.slots[day]?.[slotIdx] ?? false;
                            return (
                              <button
                                key={hour}
                                className={`w-8 h-6 rounded text-[9px] transition-colors ${
                                  isAvailable
                                    ? 'bg-msbm-red/30 text-msbm-red-bright border border-msbm-red/50 hover:bg-msbm-red/50'
                                    : 'bg-muted/30 text-muted-foreground border border-border/50 hover:bg-muted/50'
                                }`}
                                title={`${hour > 12 ? hour - 12 : hour}${hour >= 12 ? 'PM' : 'AM'} - ${isAvailable ? 'Available' : 'Unavailable'}`}
                                onClick={() => {
                                  const slots = emp.slots[day] || [];
                                  slots[slotIdx] = !isAvailable;
                                }}
                              >
                                {hour > 12 ? hour - 12 : hour}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* ============ SHIFT TEMPLATES TAB ============ */}
        <TabsContent value="templates" className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {TEMPLATES.map(tmpl => (
              <Card key={tmpl.id} className="card-lift">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className={`w-3 h-3 rounded-full ${tmpl.color}`} />
                    <h3 className="font-semibold text-sm">{tmpl.name}</h3>
                  </div>
                  <p className="text-xs text-muted-foreground mb-3">{tmpl.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex gap-3 text-xs">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {tmpl.startHour > 12 ? tmpl.startHour - 12 : tmpl.startHour}{tmpl.startHour >= 12 ? 'PM' : 'AM'}-{tmpl.endHour > 12 ? tmpl.endHour - 12 : tmpl.endHour}{tmpl.endHour >= 12 ? 'PM' : 'AM'}
                      </span>
                    </div>
                    <Badge variant="outline" className="text-xs">{tmpl.duration}</Badge>
                  </div>
                  <Button variant="outline" size="sm" className="w-full mt-3 text-xs">
                    <Plus className="h-3 w-3 mr-1" /> Use Template
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* ============ SWAP REQUESTS TAB ============ */}
        <TabsContent value="swaps" className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Filter:</span>
            {['all', 'pending', 'approved', 'rejected'].map(status => (
              <Button
                key={status}
                variant={swapFilter === status ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSwapFilter(status)}
                className="text-xs capitalize"
              >
                {status}
              </Button>
            ))}
          </div>
          <div className="space-y-3">
            {filteredSwaps.map(swap => {
              const statusBadge = {
                pending: <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">Pending</Badge>,
                approved: <Badge className="bg-msbm-red/20 text-msbm-red-bright border-msbm-red/30">Approved</Badge>,
                rejected: <Badge className="bg-red-500/20 text-red-400 border-red-500/30">Rejected</Badge>,
              };
              return (
                <Card key={swap.id}>
                  <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium text-sm">{swap.fromEmployee}</span>
                          <ArrowRightLeft className="h-3 w-3 text-muted-foreground" />
                          <span className="font-medium text-sm">{swap.toEmployee}</span>
                          {statusBadge[swap.status]}
                        </div>
                        <div className="flex gap-4 mt-1 text-xs text-muted-foreground">
                          <span>{swap.date}</span>
                          <span>{swap.shiftStart} – {swap.shiftEnd}</span>
                          <span>Reason: {swap.reason}</span>
                        </div>
                      </div>
                      {swap.status === 'pending' && (
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" className="text-xs border-msbm-red/30 text-msbm-red-bright hover:bg-msbm-red/10"
                            onClick={() => handleSwapAction(swap.id, 'approved')}>
                            <CheckCircle2 className="h-3 w-3 mr-1" /> Approve
                          </Button>
                          <Button size="sm" variant="outline" className="text-xs border-red-500/30 text-red-400 hover:bg-red-500/10"
                            onClick={() => handleSwapAction(swap.id, 'rejected')}>
                            <XCircle className="h-3 w-3 mr-1" /> Reject
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* ============ CONFLICTS TAB ============ */}
        <TabsContent value="conflicts" className="space-y-4">
          <div className="grid gap-3">
            {mockConflicts.current.map(conflict => {
              const borderClass = conflict.severity === 'high' ? 'border-l-red-500' : conflict.severity === 'medium' ? 'border-l-amber-500' : 'border-l-blue-500';
              return (
                <Card key={conflict.id} className={`border-l-4 ${borderClass}`}>
                  <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                      <div className="flex items-start gap-3">
                        <span className="text-xl mt-0.5">{conflictIcons[conflict.type]}</span>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-medium text-sm">{conflict.type.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</h4>
                            <Badge variant="outline" className={severityColors[conflict.severity]}>
                              {conflict.severity}
                            </Badge>
                            <span className="text-xs text-muted-foreground">{conflict.date}</span>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">{conflict.description}</p>
                          {conflict.employee !== 'N/A' && (
                            <p className="text-xs text-muted-foreground mt-1">
                              <Users className="h-3 w-3 inline mr-1" />{conflict.employee}
                            </p>
                          )}
                        </div>
                      </div>
                      <Button variant="outline" size="sm" className="text-xs whitespace-nowrap">
                        Resolve
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
