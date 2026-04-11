"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { useAppStore, type AttendanceRecord, type Geofence } from "@/store/app";
import {
  Clock,
  MapPin,
  LogIn,
  LogOut,
  Timer,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  Activity,
  Users,
  Building2,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import {
  format,
  intervalToDuration,
  startOfWeek,
  addDays,
  isToday,
  parseISO,
} from "date-fns";
import { Bar, BarChart, XAxis, YAxis, CartesianGrid } from "recharts";

// ============ LAZY LEAFLET IMPORTS ============

const MapContainer = React.lazy(() =>
  import("react-leaflet").then((mod) => ({ default: mod.MapContainer }))
);
const TileLayer = React.lazy(() =>
  import("react-leaflet").then((mod) => ({ default: mod.TileLayer }))
);
const Polygon = React.lazy(() =>
  import("react-leaflet").then((mod) => ({ default: mod.Polygon }))
);
const CircleMarker = React.lazy(() =>
  import("react-leaflet").then((mod) => ({ default: mod.CircleMarker }))
);

// ============ CHART CONFIG ============

const weeklyChartConfig = {
  hours: {
    label: "Hours Worked",
    color: "hsl(160, 84%, 39%)",
  },
} satisfies ChartConfig;

// ============ HELPERS ============

function formatTime(date: Date): string {
  return format(date, "hh:mm:ss a");
}

function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  return format(d, "MMM dd, yyyy");
}

function formatClockTime(date: Date | string): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  return format(d, "hh:mm a");
}

function formatElapsed(ms: number): string {
  const duration = intervalToDuration({ start: 0, end: ms });
  const hours = String(duration.hours ?? 0).padStart(2, "0");
  const minutes = String(duration.minutes ?? 0).padStart(2, "0");
  const seconds = String(duration.seconds ?? 0).padStart(2, "0");
  return `${hours}:${minutes}:${seconds}`;
}

function formatHours(hours: number | null | undefined): string {
  if (hours == null) return "--";
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  return `${h}h ${m}m`;
}

const DEFAULT_LOCATION = { lat: 40.758, lng: -73.9855 };

// ============ GEOFENCE MAP COMPONENT ============

function GeofenceMap({
  geofences,
  clockLocations,
}: {
  geofences: Geofence[];
  clockLocations: { lat: number; lng: number; label: string }[];
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Intentionally set state after mount to avoid SSR hydration mismatch
    // with dynamically-imported Leaflet components
    React.startTransition(() => setMounted(true));
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    document.head.appendChild(link);
    return () => {
      document.head.removeChild(link);
    };
  }, []);

  if (!mounted) {
    return (
      <div className="h-full w-full rounded-lg bg-muted/30 flex items-center justify-center">
        <Skeleton className="h-full w-full rounded-lg" />
      </div>
    );
  }

  const polygonPositions: [number, number][][] = geofences
    .filter((g) => g.polygon)
    .map((g) => {
      try {
        const coords = JSON.parse(g.polygon!);
        return coords.map(
          (c: [number, number]) => [c[1], c[0]] as [number, number]
        );
      } catch {
        return [];
      }
    })
    .filter((p) => p.length > 0);

  const circleGeofences = geofences
    .filter((g) => !g.polygon && g.radius > 0)
    .map((g) => ({
      center: [g.centerLat, g.centerLng] as [number, number],
      radius: g.radius,
      name: g.name,
    }));

  return (
    <React.Suspense
      fallback={
        <div className="h-full w-full flex items-center justify-center bg-muted/20 rounded-lg">
          <Skeleton className="h-full w-full rounded-lg" />
        </div>
      }
    >
      <MapContainer
        center={[DEFAULT_LOCATION.lat, DEFAULT_LOCATION.lng]}
        zoom={12}
        className="h-full w-full rounded-lg z-0"
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {polygonPositions.map((positions, i) => (
          <Polygon
            key={`polygon-${i}`}
            positions={positions}
            pathOptions={{
              color: "#10b981",
              fillColor: "#10b981",
              fillOpacity: 0.15,
              weight: 2,
            }}
          />
        ))}

        {circleGeofences.map((g, i) => (
          <CircleMarker
            key={`circle-${i}`}
            center={g.center}
            radius={Math.min(g.radius / 10, 40)}
            pathOptions={{
              color: "#14b8a6",
              fillColor: "#14b8a6",
              fillOpacity: 0.12,
              weight: 2,
            }}
          />
        ))}

        {clockLocations.map((loc, i) => (
          <CircleMarker
            key={`marker-${i}`}
            center={[loc.lat, loc.lng]}
            radius={6}
            pathOptions={{
              color: "#f59e0b",
              fillColor: "#f59e0b",
              fillOpacity: 0.9,
              weight: 2,
            }}
          />
        ))}
      </MapContainer>
    </React.Suspense>
  );
}

// ============ STATUS BADGE ============

function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case "completed":
      return (
        <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-100">
          Completed
        </Badge>
      );
    case "active":
      return (
        <Badge className="bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-100">
          Active
        </Badge>
      );
    case "flagged":
      return (
        <Badge className="bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-100">
          <AlertTriangle className="h-3 w-3" />
          Flagged
        </Badge>
      );
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
}

// ============ MAIN COMPONENT ============

export function AttendanceView() {
  const {
    currentUserId,
    isClockedIn,
    activeAttendanceId,
    setIsClockedIn,
    attendance,
    setAttendance,
    geofences,
    setGeofences,
  } = useAppStore();

  const [currentTime, setCurrentTime] = useState(new Date());
  const [elapsedMs, setElapsedMs] = useState(0);
  const [localClockInTime, setLocalClockInTime] = useState<string | null>(null);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [clockingIn, setClockingIn] = useState(false);
  const [clockingOut, setClockingOut] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 20;

  // ---- Update current time every second ----
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // ---- Elapsed time counter ----
  useEffect(() => {
    if (isClockedIn && localClockInTime) {
      const target = parseISO(localClockInTime);
      const interval = setInterval(() => {
        const now = new Date();
        setElapsedMs(now.getTime() - target.getTime());
      }, 1000);
      setElapsedMs(Date.now() - target.getTime());
      return () => clearInterval(interval);
    }
  }, [isClockedIn, localClockInTime]);

  // ---- Fetch attendance records ----
  const fetchRecords = useCallback(
    async (pageNum: number) => {
      try {
        setLoading(true);
        const params = new URLSearchParams({
          limit: String(limit),
          page: String(pageNum),
        });
        const res = await fetch(`/api/attendance/records?${params}`);
        if (res.ok) {
          const data = await res.json();
          setRecords(data.records || []);
          setTotalPages(data.totalPages || 1);
          setAttendance(data.records || []);
        }
      } catch (err) {
        console.error("Failed to fetch attendance records:", err);
      } finally {
        setLoading(false);
      }
    },
    [limit, setAttendance]
  );

  useEffect(() => {
    fetchRecords(page);
  }, [page, fetchRecords]);

  // ---- Fetch geofences ----
  useEffect(() => {
    async function fetchGeofences() {
      try {
        const res = await fetch("/api/geofences");
        if (res.ok) {
          const data = await res.json();
          setGeofences(data.geofences || []);
        }
      } catch (err) {
        console.error("Failed to fetch geofences:", err);
      }
    }
    fetchGeofences();
  }, [setGeofences]);

  // ---- Check active clock-in status on mount ----
  useEffect(() => {
    if (!currentUserId) return;
    async function checkStatus() {
      try {
        const res = await fetch(
          `/api/attendance/records?activeOnly=true&userId=${currentUserId}`
        );
        if (res.ok) {
          const data = await res.json();
          if (data.records && data.records.length > 0) {
            const active = data.records[0];
            setIsClockedIn(true, active.id);
            setLocalClockInTime(active.clockIn);
          }
        }
      } catch {
        // silently fail
      }
    }
    checkStatus();
  }, [currentUserId, setIsClockedIn]);

  // ---- Clock In Handler ----
  const handleClockIn = async () => {
    if (!currentUserId) {
      toast.error("Please select a user first");
      return;
    }
    setClockingIn(true);
    try {
      let lat = DEFAULT_LOCATION.lat;
      let lng = DEFAULT_LOCATION.lng;

      if (navigator.geolocation) {
        try {
          const position = await new Promise<GeolocationPosition>(
            (resolve, reject) => {
              navigator.geolocation.getCurrentPosition(resolve, reject, {
                timeout: 5000,
                maximumAge: 0,
              });
            }
          );
          lat = position.coords.latitude;
          lng = position.coords.longitude;
        } catch {
          // GPS unavailable in sandbox — use default location within geofence
          console.log("GPS unavailable, using default location");
        }
      }

      const res = await fetch("/api/attendance/clock-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: currentUserId,
          latitude: lat,
          longitude: lng,
          timestamp: new Date().toISOString(),
        }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(data.message || "Clocked in successfully!");
        setIsClockedIn(true, data.attendance?.id);
        setLocalClockInTime(new Date().toISOString());
        fetchRecords(page);
      } else {
        toast.error(data.error || "Failed to clock in");
      }
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setClockingIn(false);
    }
  };

  // ---- Clock Out Handler ----
  const handleClockOut = async () => {
    if (!currentUserId) {
      toast.error("No user selected");
      return;
    }
    setClockingOut(true);
    try {
      const res = await fetch("/api/attendance/clock-out", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: currentUserId,
          attendanceId: activeAttendanceId,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(data.message || "Clocked out successfully!");
        setIsClockedIn(false);
        setLocalClockInTime(null);
        fetchRecords(page);
      } else {
        toast.error(data.error || "Failed to clock out");
      }
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setClockingOut(false);
    }
  };

  // ---- Weekly chart data ----
  const weeklyData = React.useMemo(() => {
    const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

    return days.map((day, i) => {
      const date = addDays(weekStart, i);
      const dayRecords = attendance.filter((r) => {
        const clockIn =
          typeof r.clockIn === "string" ? parseISO(r.clockIn) : r.clockIn;
        return (
          format(clockIn, "yyyy-MM-dd") === format(date, "yyyy-MM-dd") &&
          r.status === "completed" &&
          r.totalHours != null
        );
      });

      const totalHours = dayRecords.reduce(
        (sum, r) => sum + (r.totalHours || 0),
        0
      );
      return {
        day,
        hours: Math.round(totalHours * 100) / 100,
        fullDate: formatDate(date),
      };
    });
  }, [attendance]);

  // ---- Map locations from attendance records ----
  const clockLocations = React.useMemo(() => {
    return records
      .filter((r) => r.clockInLat && r.clockInLng)
      .slice(0, 10)
      .map((r) => ({
        lat: r.clockInLat,
        lng: r.clockInLng,
        label: r.employee
          ? `${r.employee.firstName} ${r.employee.lastName}`
          : "Unknown",
      }));
  }, [records]);

  // ---- Today's / week stats ----
  const todayRecords = attendance.filter((r) => {
    const clockIn =
      typeof r.clockIn === "string" ? parseISO(r.clockIn) : r.clockIn;
    return isToday(clockIn);
  });

  const todayTotalHours = todayRecords.reduce(
    (sum, r) => sum + (r.totalHours || 0),
    0
  );

  const weekTotalHours = attendance
    .filter((r) => r.status === "completed" && r.totalHours != null)
    .reduce((sum, r) => sum + (r.totalHours || 0), 0);

  // ============ RENDER ============

  return (
    <div className="space-y-6">
      {/* ===== CLOCK IN/OUT PANEL + GEOFENCE MAP ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* --- Clock In/Out Panel --- */}
        <Card className="relative overflow-hidden border-emerald-200/50">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-teal-50/50 to-transparent pointer-events-none" />
          <CardHeader className="relative pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-emerald-100">
                  <Clock className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">Time Clock</CardTitle>
                  <CardDescription>
                    {format(new Date(), "EEEE, MMMM dd, yyyy")}
                  </CardDescription>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold tabular-nums text-foreground tracking-tight">
                  {formatTime(currentTime)}
                </div>
                {isClockedIn && (
                  <div className="text-xs text-emerald-600 font-medium mt-1 flex items-center justify-end gap-1">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                    </span>
                    Clocked In
                  </div>
                )}
              </div>
            </div>
          </CardHeader>

          <CardContent className="relative space-y-6">
            {/* Status indicator */}
            <div className="flex items-center gap-3 p-4 rounded-xl bg-white/80 border border-emerald-100">
              <div
                className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
                  isClockedIn
                    ? "bg-emerald-100 text-emerald-600"
                    : "bg-gray-100 text-gray-400"
                }`}
              >
                {isClockedIn ? (
                  <Activity className="h-6 w-6" />
                ) : (
                  <Timer className="h-6 w-6" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground">
                  {isClockedIn ? "Currently Clocked In" : "Not Clocked In"}
                </p>
                {isClockedIn ? (
                  <p className="text-sm text-emerald-600 tabular-nums font-medium mt-0.5">
                    Elapsed: {formatElapsed(elapsedMs)}
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Tap the button to start your shift
                  </p>
                )}
              </div>
            </div>

            {/* Clock In/Out Button */}
            <div className="flex justify-center">
              {isClockedIn ? (
                <Button
                  size="lg"
                  className="w-full max-w-xs h-16 text-lg font-bold rounded-2xl shadow-lg shadow-rose-200/50 bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                  onClick={handleClockOut}
                  disabled={clockingOut}
                >
                  {clockingOut ? (
                    <div className="flex items-center gap-2">
                      <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Clocking Out...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <LogOut className="h-6 w-6" />
                      Clock Out
                    </div>
                  )}
                </Button>
              ) : (
                <Button
                  size="lg"
                  className="w-full max-w-xs h-16 text-lg font-bold rounded-2xl shadow-lg shadow-emerald-300/50 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                  onClick={handleClockIn}
                  disabled={clockingIn}
                >
                  {clockingIn ? (
                    <div className="flex items-center gap-2">
                      <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Clocking In...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <LogIn className="h-6 w-6" />
                      Clock In
                    </div>
                  )}
                </Button>
              )}
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center p-3 rounded-lg bg-white/60 border border-emerald-50">
                <div className="text-2xl font-bold text-emerald-600">
                  {formatHours(todayTotalHours)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Today</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-white/60 border border-emerald-50">
                <div className="text-2xl font-bold text-teal-600">
                  {formatHours(weekTotalHours)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">This Week</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-white/60 border border-emerald-50">
                <div className="text-2xl font-bold text-cyan-600">
                  {todayRecords.filter((r) => r.status === "completed").length}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Shifts</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* --- Geofence Map --- */}
        <Card className="border-emerald-200/50">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-teal-100">
                <MapPin className="h-5 w-5 text-teal-600" />
              </div>
              <div>
                <CardTitle className="text-lg">Geofence Map</CardTitle>
                <CardDescription>
                  {geofences.length} active zone
                  {geofences.length !== 1 ? "s" : ""} &middot;{" "}
                  {clockLocations.length} recent clock-ins
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-3">
            <div className="h-[360px] rounded-lg overflow-hidden border border-border/30">
              <GeofenceMap geofences={geofences} clockLocations={clockLocations} />
            </div>
            <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground px-1">
              <div className="flex items-center gap-1.5">
                <div className="h-3 w-3 rounded-sm bg-emerald-500/30 border border-emerald-500" />
                Geofence Zone
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-3 w-3 rounded-full bg-amber-500" />
                Clock-in Location
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ===== WEEKLY HOURS SUMMARY ===== */}
      <Card className="border-emerald-200/50">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-cyan-100">
                <TrendingUp className="h-5 w-5 text-cyan-600" />
              </div>
              <div>
                <CardTitle className="text-lg">Weekly Hours Summary</CardTitle>
                <CardDescription>
                  Total hours worked per day this week
                </CardDescription>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-emerald-600">
                {formatHours(weekTotalHours)}
              </p>
              <p className="text-xs text-muted-foreground">Total this week</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ChartContainer config={weeklyChartConfig} className="h-[280px] w-full">
            <BarChart data={weeklyData} barCategoryGap="25%">
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis
                dataKey="day"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 12 }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 12 }}
                domain={[0, "auto"]}
                tickFormatter={(v) => `${v}h`}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    formatter={(value, _name, _item, _index, payload) => (
                      <div className="text-xs">
                        <span className="font-medium text-foreground">
                          {payload?.[0]?.payload?.fullDate}
                        </span>
                        <span className="ml-2 text-emerald-600 font-semibold">
                          {value}h
                        </span>
                      </div>
                    )}
                  />
                }
              />
              <Bar
                dataKey="hours"
                fill="var(--color-hours)"
                radius={[6, 6, 0, 0]}
                maxBarSize={48}
              />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* ===== ATTENDANCE HISTORY TABLE ===== */}
      <Card className="border-emerald-200/50">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-emerald-100">
              <Users className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <CardTitle className="text-lg">Attendance History</CardTitle>
              <CardDescription>
                Recent attendance records across all employees
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="max-h-[480px] overflow-y-auto rounded-lg border">
            <Table>
              <TableHeader className="sticky top-0 bg-muted/90 backdrop-blur-sm z-10">
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Clock In</TableHead>
                  <TableHead>Clock Out</TableHead>
                  <TableHead className="text-right">Hours</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Skeleton className="h-8 w-8 rounded-full" />
                          <Skeleton className="h-4 w-24" />
                        </div>
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-20" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-16" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-16" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-12" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-20" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-5 w-16" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : records.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center py-12 text-muted-foreground"
                    >
                      <div className="flex flex-col items-center gap-2">
                        <Building2 className="h-10 w-10 text-muted-foreground/40" />
                        <p>No attendance records found</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  records.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                            {record.employee
                              ? `${record.employee.firstName?.[0] || ""}${record.employee.lastName?.[0] || ""}`
                              : "?"}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium truncate">
                              {record.employee
                                ? `${record.employee.firstName} ${record.employee.lastName}`
                                : "Unknown"}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {record.employee?.employeeId || record.employeeId}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        {formatDate(record.clockIn)}
                      </TableCell>
                      <TableCell className="text-sm tabular-nums">
                        {formatClockTime(record.clockIn)}
                      </TableCell>
                      <TableCell className="text-sm tabular-nums">
                        {record.clockOut ? (
                          formatClockTime(record.clockOut)
                        ) : (
                          <span className="text-muted-foreground">--</span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-right tabular-nums font-medium">
                        {formatHours(record.totalHours)}
                      </TableCell>
                      <TableCell className="text-sm">
                        <div className="flex items-center gap-1 text-muted-foreground max-w-[140px]">
                          <MapPin className="h-3 w-3 flex-shrink-0" />
                          <span className="truncate">
                            {record.geofence?.name || "Unknown"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={record.status} />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-muted-foreground">
              Page {page} of {totalPages}
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
