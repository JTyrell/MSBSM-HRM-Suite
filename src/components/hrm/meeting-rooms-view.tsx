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
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DoorOpen,
  CalendarDays,
  Clock,
  Users,
  MapPin,
  Building2,
  Monitor,
  Presentation,
  Phone,
  Tv,
  PenTool,
  Search,
  Filter,
  X,
  ChevronLeft,
  ChevronRight,
  Plus,
  Check,
  AlertCircle,
  Calendar,
  Video,
  Sparkles,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────
interface MeetingRoom {
  id: string;
  name: string;
  capacity: number;
  floor: string;
  building: string;
  equipment: string[];
  status: "Available" | "In Use";
  color: string;
}

interface Booking {
  id: string;
  roomId: string;
  roomName: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: string;
  organizer: string;
  attendees: number;
  status: "Confirmed" | "Pending" | "Cancelled";
  title: string;
}

// ─── Mock Data ────────────────────────────────────────────────────
const ROOMS: MeetingRoom[] = [
  {
    id: "room-1",
    name: "Board Room A",
    capacity: 20,
    floor: "3rd Floor",
    building: "Main Building",
    equipment: ["Projector", "Video Conferencing", "Whiteboard", "Speakerphone", "TV Screen"],
    status: "Available",
    color: "#059669",
  },
  {
    id: "room-2",
    name: "Board Room B",
    capacity: 16,
    floor: "3rd Floor",
    building: "Main Building",
    equipment: ["Projector", "Whiteboard", "Speakerphone"],
    status: "In Use",
    color: "#0d9488",
  },
  {
    id: "room-3",
    name: "Training Lab",
    capacity: 25,
    floor: "2nd Floor",
    building: "West Wing",
    equipment: ["Projector", "TV Screen", "Whiteboard", "Video Conferencing"],
    status: "Available",
    color: "#d97706",
  },
  {
    id: "room-4",
    name: "Innovation Hub",
    capacity: 12,
    floor: "4th Floor",
    building: "Innovation Center",
    equipment: ["TV Screen", "Whiteboard", "Video Conferencing"],
    status: "Available",
    color: "#7c3aed",
  },
  {
    id: "room-5",
    name: "Executive Suite",
    capacity: 8,
    floor: "5th Floor",
    building: "Main Building",
    equipment: ["Projector", "Video Conferencing", "Speakerphone", "TV Screen"],
    status: "In Use",
    color: "#dc2626",
  },
  {
    id: "room-6",
    name: "Graduate Centre",
    capacity: 4,
    floor: "1st Floor",
    building: "Graduate Building",
    equipment: ["TV Screen", "Whiteboard"],
    status: "Available",
    color: "#0891b2",
  },
];

const MOCK_BOOKINGS: Booking[] = [
  { id: "b1", roomId: "room-1", roomName: "Board Room A", date: "2025-07-15", startTime: "9:00 AM", endTime: "10:00 AM", duration: "1h", organizer: "Dr. Sarah Chen", attendees: 12, status: "Confirmed", title: "Q2 Strategy Review" },
  { id: "b2", roomId: "room-3", roomName: "Training Lab", date: "2025-07-15", startTime: "2:00 PM", endTime: "4:00 PM", duration: "2h", organizer: "Mark Williams", attendees: 18, status: "Confirmed", title: "Leadership Workshop" },
  { id: "b3", roomId: "room-4", roomName: "Innovation Hub", date: "2025-07-16", startTime: "10:00 AM", endTime: "11:30 AM", duration: "1.5h", organizer: "Lisa Park", attendees: 8, status: "Pending", title: "Product Brainstorm" },
  { id: "b4", roomId: "room-2", roomName: "Board Room B", date: "2025-07-16", startTime: "1:00 PM", endTime: "2:00 PM", duration: "1h", organizer: "James Rodriguez", attendees: 6, status: "Confirmed", title: "Client Presentation" },
  { id: "b5", roomId: "room-5", roomName: "Executive Suite", date: "2025-07-17", startTime: "3:00 PM", endTime: "4:30 PM", duration: "1.5h", organizer: "Dr. Sarah Chen", attendees: 5, status: "Pending", title: "Budget Planning" },
  { id: "b6", roomId: "room-1", roomName: "Board Room A", date: "2025-07-17", startTime: "11:00 AM", endTime: "12:00 PM", duration: "1h", organizer: "Aisha Johnson", attendees: 15, status: "Confirmed", title: "Department Sync" },
  { id: "b7", roomId: "room-6", roomName: "Graduate Centre", date: "2025-07-18", startTime: "9:30 AM", endTime: "10:30 AM", duration: "1h", organizer: "Tom Baker", attendees: 3, status: "Confirmed", title: "Thesis Review" },
  { id: "b8", roomId: "room-3", roomName: "Training Lab", date: "2025-07-18", startTime: "1:00 PM", endTime: "3:00 PM", duration: "2h", organizer: "Nina Patel", attendees: 20, status: "Pending", title: "Onboarding Session" },
];

const TIME_SLOTS: string[] = [];
for (let h = 8; h <= 17; h++) {
  TIME_SLOTS.push(`${h > 12 ? h - 12 : h}:00 ${h >= 12 ? "PM" : "AM"}`);
  if (h < 17) TIME_SLOTS.push(`${h > 12 ? h - 12 : h}:30 ${h >= 12 ? "PM" : "AM"}`);
}

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const EQUIPMENT_ICONS: Record<string, React.ElementType> = {
  Projector: Monitor,
  Whiteboard: PenTool,
  "Video Conferencing": Video,
  Speakerphone: Phone,
  "TV Screen": Tv,
};

const CALENDAR_BOOKINGS = [
  { day: 15, roomId: "room-1", title: "Q2 Strategy", color: "#059669" },
  { day: 15, roomId: "room-3", title: "Leadership WS", color: "#d97706" },
  { day: 16, roomId: "room-4", title: "Brainstorm", color: "#7c3aed" },
  { day: 16, roomId: "room-2", title: "Client Pres.", color: "#0d9488" },
  { day: 17, roomId: "room-5", title: "Budget Plan", color: "#dc2626" },
  { day: 17, roomId: "room-1", title: "Dept Sync", color: "#059669" },
  { day: 18, roomId: "room-6", title: "Thesis Review", color: "#0891b2" },
  { day: 18, roomId: "room-3", title: "Onboarding", color: "#d97706" },
  { day: 21, roomId: "room-1", title: "Board Meeting", color: "#059669" },
  { day: 22, roomId: "room-4", title: "Design Sprint", color: "#7c3aed" },
  { day: 23, roomId: "room-5", title: "Exec Review", color: "#dc2626" },
  { day: 24, roomId: "room-2", title: "Team Standup", color: "#0d9488" },
];

// ─── Component ────────────────────────────────────────────────────
export function MeetingRoomsView() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCapacity, setFilterCapacity] = useState("all");
  const [filterEquipment, setFilterEquipment] = useState("all");
  const [filterFloor, setFilterFloor] = useState("all");
  const [activeTab, setActiveTab] = useState("rooms");
  const [bookings, setBookings] = useState<Booking[]>(MOCK_BOOKINGS);
  const [selectedRoom, setSelectedRoom] = useState<MeetingRoom | null>(null);
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [availabilityRoom, setAvailabilityRoom] = useState(ROOMS[0].id);
  const [calendarMonth, setCalendarMonth] = useState(() => new Date().getMonth());
  const [calendarYear, setCalendarYear] = useState(() => new Date().getFullYear());

  // Booking form
  const [bookingForm, setBookingForm] = useState({
    roomId: "",
    date: "",
    startTime: "",
    title: "",
    description: "",
    attendees: "",
    recurrence: "None",
    equipment: [] as string[],
  });

  // ─── Filtered Rooms ─────────────────────────────────────────────
  const filteredRooms = useMemo(() => {
    return ROOMS.filter((room) => {
      const matchSearch = room.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCap = filterCapacity === "all" || room.capacity >= parseInt(filterCapacity);
      const matchEquip = filterEquipment === "all" || room.equipment.includes(filterEquipment);
      const matchFloor = filterFloor === "all" || room.floor === filterFloor;
      return matchSearch && matchCap && matchEquip && matchFloor;
    });
  }, [searchQuery, filterCapacity, filterEquipment, filterFloor]);

  const availableCount = ROOMS.filter((r) => r.status === "Available").length;
  const uniqueFloors = [...new Set(ROOMS.map((r) => r.floor))];
  const uniqueEquipment = [...new Set(ROOMS.flatMap((r) => r.equipment))];

  // ─── Calendar Grid ──────────────────────────────────────────────
  const calendarDays = useMemo(() => {
    const firstDay = new Date(calendarYear, calendarMonth, 1).getDay();
    const daysInMonth = new Date(calendarYear, calendarMonth + 1, 0).getDate();
    const days: (number | null)[] = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let d = 1; d <= daysInMonth; d++) days.push(d);
    return days;
  }, [calendarMonth, calendarYear]);

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const today = new Date();

  // ─── Availability Grid ──────────────────────────────────────────
  const availabilityData = useMemo(() => {
    const room = ROOMS.find((r) => r.id === availabilityRoom) || ROOMS[0];
    const grid: Record<string, string> = {};
    DAYS.forEach((day, di) => {
      TIME_SLOTS.forEach((slot) => {
        const key = `${day}-${slot}`;
        const hour = parseInt(slot);
        const isWeekend = di >= 5;
        if (isWeekend) {
          grid[key] = "unavailable";
        } else {
          const isBooked = Math.random() < 0.2;
          grid[key] = isBooked ? "booked" : "available";
        }
      });
    });
    return { room, grid };
  }, [availabilityRoom]);

  // ─── Handlers ───────────────────────────────────────────────────
  const openBookingDialog = (room?: MeetingRoom) => {
    if (room) {
      setBookingForm({ ...bookingForm, roomId: room.id });
      setSelectedRoom(room);
    } else {
      setBookingForm({ roomId: "", date: "", startTime: "", title: "", description: "", attendees: "", recurrence: "None", equipment: [] });
      setSelectedRoom(null);
    }
    setBookingDialogOpen(true);
  };

  const handleBookRoom = () => {
    if (!bookingForm.roomId || !bookingForm.date || !bookingForm.startTime || !bookingForm.title) {
      toast.error("Please fill in all required fields");
      return;
    }
    const room = ROOMS.find((r) => r.id === bookingForm.roomId);
    const startH = parseInt(bookingForm.startTime);
    const endH = startH + 1;
    const newBooking: Booking = {
      id: `b-${Date.now()}`,
      roomId: bookingForm.roomId,
      roomName: room?.name || "Room",
      date: bookingForm.date,
      startTime: `${startH > 12 ? startH - 12 : startH}:00 ${startH >= 12 ? "PM" : "AM"}`,
      endTime: `${endH > 12 ? endH - 12 : endH}:00 ${endH >= 12 ? "PM" : "AM"}`,
      duration: "1h",
      organizer: "You",
      attendees: parseInt(bookingForm.attendees) || 1,
      status: "Pending",
      title: bookingForm.title,
    };
    setBookings((prev) => [newBooking, ...prev]);
    setBookingDialogOpen(false);
    toast.success("Room booked successfully!", { description: `${room?.name} — ${newBooking.startTime}` });
  };

  const cancelBooking = (id: string) => {
    setBookings((prev) => prev.map((b) => b.id === id ? { ...b, status: "Cancelled" as const } : b));
    toast.success("Booking cancelled");
  };

  const quickBook = (duration: number) => {
    toast.success(`Quick ${duration}min slot reserved!`, { description: "Room will be confirmed shortly." });
  };

  const prevMonth = () => {
    if (calendarMonth === 0) { setCalendarMonth(11); setCalendarYear((y) => y - 1); }
    else setCalendarMonth((m) => m - 1);
  };

  const nextMonth = () => {
    if (calendarMonth === 11) { setCalendarMonth(0); setCalendarYear((y) => y + 1); }
    else setCalendarMonth((m) => m + 1);
  };

  const toggleEquipment = (eq: string) => {
    setBookingForm((prev) => ({
      ...prev,
      equipment: prev.equipment.includes(eq) ? prev.equipment.filter((e) => e !== eq) : [...prev.equipment, eq],
    }));
  };

  // ─── Stats ──────────────────────────────────────────────────────
  const stats = [
    { label: "Total Rooms", value: 6, icon: DoorOpen, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-950/40" },
    { label: "Available Now", value: availableCount, icon: Check, color: "text-teal-600 dark:text-teal-400", bg: "bg-teal-50 dark:bg-teal-950/40" },
    { label: "Today's Bookings", value: 8, icon: CalendarDays, color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-950/40" },
    { label: "This Week", value: 23, icon: Sparkles, color: "text-violet-600 dark:text-violet-400", bg: "bg-violet-50 dark:bg-violet-950/40" },
  ];

  // ─── Equipment Icon Helper ──────────────────────────────────────
  const EquipmentBadge = ({ name }: { name: string }) => {
    const Icon = EQUIPMENT_ICONS[name] || Monitor;
    return (
      <div className="flex items-center gap-1 text-[10px] text-muted-foreground" title={name}>
        <Icon className="h-3 w-3" />
        <span className="hidden lg:inline">{name}</span>
      </div>
    );
  };

  // ─── Render ─────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Meeting Rooms</h1>
          <p className="text-sm text-muted-foreground">Book and manage meeting rooms across all buildings</p>
        </div>
        <Button onClick={() => openBookingDialog()} className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:from-emerald-600 hover:to-teal-700">
          <Plus className="h-4 w-4 mr-2" />
          Book Room
        </Button>
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
        <TabsList className="flex-wrap">
          <TabsTrigger value="rooms"><DoorOpen className="h-4 w-4 mr-1.5" />Rooms</TabsTrigger>
          <TabsTrigger value="my-bookings"><CalendarDays className="h-4 w-4 mr-1.5" />My Bookings</TabsTrigger>
          <TabsTrigger value="calendar"><Calendar className="h-4 w-4 mr-1.5" />Calendar View</TabsTrigger>
          <TabsTrigger value="availability"><Clock className="h-4 w-4 mr-1.5" />Availability</TabsTrigger>
        </TabsList>

        {/* ─── Rooms Tab ──────────────────────────────────────── */}
        <TabsContent value="rooms" className="mt-4">
          {/* Search & Filters */}
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search rooms..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" />
            </div>
            <Select value={filterCapacity} onValueChange={setFilterCapacity}>
              <SelectTrigger className="w-full sm:w-40"><SelectValue placeholder="Min Capacity" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any Capacity</SelectItem>
                <SelectItem value="4">4+ seats</SelectItem>
                <SelectItem value="8">8+ seats</SelectItem>
                <SelectItem value="12">12+ seats</SelectItem>
                <SelectItem value="16">16+ seats</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterEquipment} onValueChange={setFilterEquipment}>
              <SelectTrigger className="w-full sm:w-44"><SelectValue placeholder="Equipment" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Equipment</SelectItem>
                {uniqueEquipment.map((eq) => <SelectItem key={eq} value={eq}>{eq}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={filterFloor} onValueChange={setFilterFloor}>
              <SelectTrigger className="w-full sm:w-40"><SelectValue placeholder="Floor" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Floors</SelectItem>
                {uniqueFloors.map((f) => <SelectItem key={f} value={f}>{f}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {/* Room Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredRooms.map((room) => (
              <Card key={room.id} className="group card-lift transition-all duration-300 hover:border-emerald-300 dark:hover:border-emerald-700 overflow-hidden">
                <div className="h-1.5" style={{ background: room.status === "Available" ? "linear-gradient(90deg, #059669, #0d9488)" : "linear-gradient(90deg, #dc2626, #f97316)" }} />
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-base">{room.name}</h3>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
                        <MapPin className="h-3 w-3" />
                        <span>{room.floor}, {room.building}</span>
                      </div>
                    </div>
                    <Badge variant="outline" className={
                      room.status === "Available"
                        ? "text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800"
                        : "text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800"
                    }>
                      <span className={`inline-block h-1.5 w-1.5 rounded-full mr-1.5 ${room.status === "Available" ? "bg-emerald-500" : "bg-red-500 animate-pulse"}`} />
                      {room.status}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Users className="h-3 w-3" />
                      <span>{room.capacity} seats</span>
                    </div>
                    <span className="text-muted-foreground">•</span>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Building2 className="h-3 w-3" />
                      <span>{room.floor}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {room.equipment.map((eq) => <EquipmentBadge key={eq} name={eq} />)}
                  </div>

                  <Button
                    size="sm"
                    variant={room.status === "Available" ? "default" : "outline"}
                    className={room.status === "Available" ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:from-emerald-600 hover:to-teal-700 w-full" : "w-full"}
                    onClick={() => openBookingDialog(room)}
                    disabled={room.status === "In Use"}
                  >
                    {room.status === "Available" ? <><Plus className="h-3.5 w-3.5 mr-1.5" />Book Now</> : <><AlertCircle className="h-3.5 w-3.5 mr-1.5" />Currently in Use</>}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
          {filteredRooms.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <DoorOpen className="h-10 w-10 mx-auto mb-2 opacity-40" />
              <p>No rooms match your filters</p>
            </div>
          )}
        </TabsContent>

        {/* ─── My Bookings Tab ────────────────────────────────── */}
        <TabsContent value="my-bookings" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-emerald-500" />
                My Upcoming Bookings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {bookings.map((booking) => (
                  <div key={booking.id} className="flex items-center gap-4 p-4 rounded-xl border hover:bg-accent/30 transition-colors">
                    <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${
                      booking.status === "Confirmed" ? "bg-emerald-50 dark:bg-emerald-950/40" :
                      booking.status === "Pending" ? "bg-amber-50 dark:bg-amber-950/40" :
                      "bg-muted"
                    }`}>
                      <Presentation className={`h-5 w-5 ${
                        booking.status === "Confirmed" ? "text-emerald-600 dark:text-emerald-400" :
                        booking.status === "Pending" ? "text-amber-600 dark:text-amber-400" :
                        "text-muted-foreground"
                      }`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-sm font-medium truncate">{booking.title}</h4>
                        <Badge variant="outline" className={
                          booking.status === "Confirmed" ? "text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-[10px]" :
                          booking.status === "Pending" ? "text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800 text-[10px]" :
                          "text-muted-foreground text-[10px]"
                        }>
                          {booking.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {booking.roomName} • {booking.date} • {booking.startTime} – {booking.endTime} ({booking.duration})
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {booking.organizer} • {booking.attendees} attendees
                      </p>
                    </div>
                    {booking.status === "Pending" && (
                      <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30 shrink-0"
                        onClick={() => cancelBooking(booking.id)}>
                        <X className="h-3.5 w-3.5 mr-1" />Cancel
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── Calendar View Tab ──────────────────────────────── */}
        <TabsContent value="calendar" className="mt-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={prevMonth}><ChevronLeft className="h-4 w-4" /></Button>
                  <CardTitle className="text-base font-semibold">{monthNames[calendarMonth]} {calendarYear}</CardTitle>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={nextMonth}><ChevronRight className="h-4 w-4" /></Button>
                </div>
                {/* Room Color Legend */}
                <div className="flex flex-wrap gap-2">
                  {ROOMS.slice(0, 4).map((room) => (
                    <div key={room.id} className="flex items-center gap-1 text-[10px] text-muted-foreground">
                      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: room.color }} />
                      <span className="hidden sm:inline">{room.name.split(" ").pop()}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-3 sm:p-4">
              <div className="grid grid-cols-7 gap-1 mb-1">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                  <div key={d} className="text-center text-[10px] font-semibold text-muted-foreground uppercase py-1">{d}</div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((day, idx) => {
                  const isToday = day !== null && calendarMonth === today.getMonth() && calendarYear === today.getFullYear() && day === today.getDate();
                  const dayBookings = day !== null ? CALENDAR_BOOKINGS.filter((b) => b.day === day && (calendarMonth + 1) >= 7) : [];
                  return (
                    <div key={idx} className={`min-h-[60px] sm:min-h-[72px] rounded-lg border p-1 transition-colors cursor-pointer ${
                      isToday ? "border-emerald-400 dark:border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/20" : "border-transparent bg-muted/20 hover:bg-muted/40"
                    }`} onClick={() => day !== null && setSelectedDay(day)}>
                      <p className={`text-[11px] font-medium text-right mb-0.5 ${isToday ? "text-emerald-700 dark:text-emerald-300 font-bold" : "text-gray-700 dark:text-gray-300"}`}>
                        {day}
                      </p>
                      {dayBookings.slice(0, 2).map((b, bi) => (
                        <div key={bi} className="text-[8px] sm:text-[9px] px-1 py-0.5 rounded truncate leading-tight text-white font-medium" style={{ backgroundColor: b.color }} title={b.title}>
                          {b.title}
                        </div>
                      ))}
                      {dayBookings.length > 2 && (
                        <p className="text-[8px] text-muted-foreground mt-0.5">+{dayBookings.length - 2} more</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Day Detail Dialog (inline) */}
          {selectedDay !== null && (() => {
            const dayBookings = CALENDAR_BOOKINGS.filter((b) => b.day === selectedDay);
            const selRoom = ROOMS.find((r) => r.id === dayBookings[0]?.roomId);
            return (
              <Card className="mt-4 border-emerald-200 dark:border-emerald-800">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-semibold">
                      {monthNames[calendarMonth]} {selectedDay}, {calendarYear}
                    </CardTitle>
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setSelectedDay(null)}><X className="h-3.5 w-3.5" /></Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {dayBookings.length > 0 ? (
                    <div className="space-y-2">
                      {dayBookings.map((b, bi) => (
                        <div key={bi} className="flex items-center gap-3 p-2.5 rounded-lg" style={{ backgroundColor: b.color + "15" }}>
                          <span className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: b.color }} />
                          <div>
                            <p className="text-sm font-medium">{b.title}</p>
                            <p className="text-xs text-muted-foreground">{ROOMS.find((r) => r.color === b.color)?.name || "Room"} • 9:00 AM – 10:00 AM</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">No bookings for this day</p>
                  )}
                </CardContent>
              </Card>
            );
          })()}
        </TabsContent>

        {/* ─── Availability Tab ───────────────────────────────── */}
        <TabsContent value="availability" className="mt-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
            <Select value={availabilityRoom} onValueChange={setAvailabilityRoom}>
              <SelectTrigger className="w-full sm:w-56"><SelectValue /></SelectTrigger>
              <SelectContent>
                {ROOMS.map((r) => <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => quickBook(30)} className="text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/30">
                <Clock className="h-3.5 w-3.5 mr-1" />30 min
              </Button>
              <Button size="sm" variant="outline" onClick={() => quickBook(60)} className="text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/30">
                <Clock className="h-3.5 w-3.5 mr-1" />60 min
              </Button>
              <Button size="sm" variant="outline" onClick={() => quickBook(90)} className="text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/30">
                <Clock className="h-3.5 w-3.5 mr-1" />90 min
              </Button>
            </div>
          </div>
          <Card>
            <CardContent className="p-3 overflow-x-auto">
              <table className="w-full min-w-[640px]">
                <thead>
                  <tr>
                    <th className="text-[10px] font-semibold text-muted-foreground text-left p-2 w-20">Time</th>
                    {DAYS.map((d) => (
                      <th key={d} className="text-[10px] font-semibold text-muted-foreground text-center p-2">{d}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {TIME_SLOTS.map((slot, si) => {
                    if (si % 2 !== 0 && si !== 1) return null; // Show every other slot for brevity
                    return (
                      <tr key={slot}>
                        <td className="text-[10px] font-medium text-muted-foreground p-2 border-t border-border/50">{slot}</td>
                        {DAYS.map((day) => {
                          const status = availabilityData.grid[`${day}-${slot}`];
                          return (
                            <td key={day} className="text-center p-1 border-t border-border/50">
                              <div className={`h-6 rounded text-[8px] flex items-center justify-center font-medium ${
                                status === "available" ? "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400" :
                                status === "booked" ? "bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400" :
                                "bg-muted text-muted-foreground/40"
                              }`}>
                                {status === "available" ? "Open" : status === "booked" ? "Booked" : "—"}
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <div className="flex items-center gap-4 mt-3 text-[10px] text-muted-foreground">
                <div className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded bg-emerald-100 dark:bg-emerald-900/40 border border-emerald-200 dark:border-emerald-800" />Available</div>
                <div className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded bg-red-100 dark:bg-red-900/40 border border-red-200 dark:border-red-800" />Booked</div>
                <div className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded bg-muted border" />Unavailable</div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ─── Book Room Dialog ──────────────────────────────────── */}
      <Dialog open={bookingDialogOpen} onOpenChange={setBookingDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <DoorOpen className="h-5 w-5 text-emerald-500" />
              Book a Meeting Room
            </DialogTitle>
            <DialogDescription>Fill in the details to reserve a room</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="space-y-2">
              <Label>Room *</Label>
              <Select value={bookingForm.roomId} onValueChange={(v) => setBookingForm((p) => ({ ...p, roomId: v }))}>
                <SelectTrigger><SelectValue placeholder="Select a room" /></SelectTrigger>
                <SelectContent>
                  {ROOMS.filter((r) => r.status === "Available").map((r) => <SelectItem key={r.id} value={r.id}>{r.name} ({r.capacity} seats)</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Date *</Label>
                <Input type="date" value={bookingForm.date} onChange={(e) => setBookingForm((p) => ({ ...p, date: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Start Time *</Label>
                <Select value={bookingForm.startTime} onValueChange={(v) => setBookingForm((p) => ({ ...p, startTime: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select time" /></SelectTrigger>
                  <SelectContent>
                    {TIME_SLOTS.filter((_, i) => i < TIME_SLOTS.length - 1).map((slot) => <SelectItem key={slot} value={slot}>{slot}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Meeting Title *</Label>
              <Input placeholder="e.g. Weekly Team Standup" value={bookingForm.title} onChange={(e) => setBookingForm((p) => ({ ...p, title: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea placeholder="Meeting agenda or notes..." value={bookingForm.description} onChange={(e) => setBookingForm((p) => ({ ...p, description: e.target.value }))} className="resize-none" rows={3} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Attendees</Label>
                <Input type="number" placeholder="Number" value={bookingForm.attendees} onChange={(e) => setBookingForm((p) => ({ ...p, attendees: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Recurrence</Label>
                <Select value={bookingForm.recurrence} onValueChange={(v) => setBookingForm((p) => ({ ...p, recurrence: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="None">None</SelectItem>
                    <SelectItem value="Daily">Daily</SelectItem>
                    <SelectItem value="Weekly">Weekly</SelectItem>
                    <SelectItem value="Monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Equipment Needed</Label>
              <div className="grid grid-cols-2 gap-2">
                {["Projector", "Whiteboard", "Video Conferencing", "Speakerphone", "TV Screen"].map((eq) => (
                  <div key={eq} className="flex items-center gap-2">
                    <Checkbox id={eq} checked={bookingForm.equipment.includes(eq)} onCheckedChange={() => toggleEquipment(eq)} />
                    <label htmlFor={eq} className="text-xs text-muted-foreground cursor-pointer">{eq}</label>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setBookingDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleBookRoom} className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:from-emerald-600 hover:to-teal-700">
              <Check className="h-4 w-4 mr-1.5" />Confirm Booking
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
