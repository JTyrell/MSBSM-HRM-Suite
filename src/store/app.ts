import { create } from "zustand";

// ============ TYPES ============

export interface Employee {
  id: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  avatar?: string;
  role: string;
  status: string;
  hireDate: string;
  departmentId: string;
  payType: string;
  payRate: number;
  overtimeRate: number;
  workLocationId?: string;
  address?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  bankAccount?: string;
  taxFilingStatus?: string;
  taxAllowances?: number;
  department?: Department;
  workLocation?: Geofence;
}

export interface Department {
  id: string;
  name: string;
  code: string;
  description?: string;
}

export interface Geofence {
  id: string;
  name: string;
  address?: string;
  type: string;
  isActive: boolean;
  polygon?: string;
  centerLat: number;
  centerLng: number;
  radius: number;
  companyId: string;
  departmentId?: string;
  department?: Department;
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  geofenceId: string;
  clockIn: string;
  clockOut?: string;
  clockInLat: number;
  clockInLng: number;
  clockOutLat?: number;
  clockOutLng?: number;
  status: string;
  notes?: string;
  totalHours?: number;
  overtimeHours?: number;
  employee?: Employee;
  geofence?: Geofence;
}

export interface PayrollPeriod {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  status: string;
  companyId: string;
  records?: PayrollRecord[];
}

export interface PayrollRecord {
  id: string;
  payrollPeriodId: string;
  employeeId: string;
  regularHours: number;
  overtimeHours: number;
  totalHours: number;
  grossPay: number;
  federalTax: number;
  stateTax: number;
  socialSecurity: number;
  medicare: number;
  healthInsurance: number;
  retirement401k: number;
  otherDeductions: number;
  totalDeductions: number;
  netPay: number;
  status: string;
  notes?: string;
  employee?: Employee;
}

export interface PTORequest {
  id: string;
  employeeId: string;
  type: string;
  startDate: string;
  endDate: string;
  daysCount: number;
  reason?: string;
  status: string;
  approvedBy?: string;
  approvedAt?: string;
  createdAt?: string;
  employee?: Employee;
}

export interface PTOBalance {
  id: string;
  employeeId: string;
  year: number;
  totalAllocated: number;
  usedSick: number;
  usedVacation: number;
  usedPersonal: number;
  usedOther: number;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  link?: string;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  sessionId: string;
  userId: string;
  role: string;
  content: string;
  agentType?: string;
  createdAt: string;
}

// ============ APP STORE ============

interface AppState {
  // Navigation
  currentView: string;
  setCurrentView: (view: string) => void;

  // Current user (simulated auth)
  currentUserId: string;
  setCurrentUserId: (id: string) => void;

  // Side panel
  sidePanelOpen: boolean;
  setSidePanelOpen: (open: boolean) => void;

  // Data cache
  employees: Employee[];
  setEmployees: (employees: Employee[]) => void;

  departments: Department[];
  setDepartments: (departments: Department[]) => void;

  geofences: Geofence[];
  setGeofences: (geofences: Geofence[]) => void;

  attendance: AttendanceRecord[];
  setAttendance: (records: AttendanceRecord[]) => void;

  payrollPeriods: PayrollPeriod[];
  setPayrollPeriods: (periods: PayrollPeriod[]) => void;

  ptoRequests: PTORequest[];
  setPtoRequests: (requests: PTORequest[]) => void;

  ptoBalances: PTOBalance[];
  setPtoBalances: (balances: PTOBalance[]) => void;

  notifications: Notification[];
  setNotifications: (notifications: Notification[]) => void;

  chatMessages: ChatMessage[];
  setChatMessages: (messages: ChatMessage[]) => void;
  addChatMessage: (message: ChatMessage) => void;

  // Clock status
  isClockedIn: boolean;
  activeAttendanceId: string | null;
  setIsClockedIn: (clockedIn: boolean, attendanceId?: string) => void;

  // Loading states
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  // Navigation
  currentView: "dashboard",
  setCurrentView: (view) => set({ currentView: view }),

  // Auth
  currentUserId: "",
  setCurrentUserId: (id) => set({ currentUserId: id }),

  // Side panel
  sidePanelOpen: false,
  setSidePanelOpen: (open) => set({ sidePanelOpen: open }),

  // Data
  employees: [],
  setEmployees: (employees) => set({ employees }),

  departments: [],
  setDepartments: (departments) => set({ departments }),

  geofences: [],
  setGeofences: (geofences) => set({ geofences }),

  attendance: [],
  setAttendance: (records) => set({ attendance: records }),

  payrollPeriods: [],
  setPayrollPeriods: (periods) => set({ payrollPeriods: periods }),

  ptoRequests: [],
  setPtoRequests: (requests) => set({ ptoRequests: requests }),

  ptoBalances: [],
  setPtoBalances: (balances) => set({ ptoBalances: balances }),

  notifications: [],
  setNotifications: (notifications) => set({ notifications }),

  chatMessages: [],
  setChatMessages: (messages) => set({ chatMessages: messages }),
  addChatMessage: (message) =>
    set((state) => ({ chatMessages: [...state.chatMessages, message] })),

  // Clock
  isClockedIn: false,
  activeAttendanceId: null,
  setIsClockedIn: (clockedIn, attendanceId) =>
    set({ isClockedIn: clockedIn, activeAttendanceId: attendanceId || null }),

  // Loading
  isLoading: false,
  setIsLoading: (loading) => set({ isLoading: loading }),
}));
