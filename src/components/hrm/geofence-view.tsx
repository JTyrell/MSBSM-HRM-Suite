"use client";

import React, { useState, useEffect, useCallback, Suspense } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAppStore } from "@/store/app";
import { toast } from "sonner";
import {
  MapPin,
  Plus,
  Pencil,
  Trash2,
  Building2,
  TreePine,
  Mountain,
  Wifi,
  Eye,
  Loader2,
  Map as MapIcon,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { createCirclePolygon, formatDistance } from "@/lib/geo";

// ─── Dynamic leaflet imports to avoid SSR ────────────────────────────────────

const MapContainer = React.lazy(() =>
  import("react-leaflet").then((mod) => ({ default: mod.MapContainer }))
);
const TileLayer = React.lazy(() =>
  import("react-leaflet").then((mod) => ({ default: mod.TileLayer }))
);
const Polygon = React.lazy(() =>
  import("react-leaflet").then((mod) => ({ default: mod.Polygon }))
);
const Marker = React.lazy(() =>
  import("react-leaflet").then((mod) => ({ default: mod.Marker }))
);
const Popup = React.lazy(() =>
  import("react-leaflet").then((mod) => ({ default: mod.Popup }))
);

// ─── Types ───────────────────────────────────────────────────────────────────

interface GeofenceData {
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
  department?: { id: string; name: string; code: string };
}

interface DepartmentData {
  id: string;
  name: string;
  code: string;
}

type GeofenceType = "office" | "remote_site" | "field";

const GEOFENCE_TYPE_CONFIG: Record<GeofenceType, { label: string; icon: React.ElementType; color: string }> = {
  office: { label: "Office", icon: Building2, color: "bg-msbm-red/10 text-msbm-red dark:bg-emerald-950/40 dark:text-msbm-red-bright" },
  remote_site: { label: "Remote Site", icon: Wifi, color: "bg-sky-100 text-sky-700 dark:bg-sky-950/40 dark:text-sky-400" },
  field: { label: "Field", icon: Mountain, color: "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400" },
};

const POLYGON_HEX: Record<string, string> = {
  office: "#ac1928",
  remote_site: "#0ea5e9",
  field: "#f59e0b",
};

const POLYGON_CLASSES: Record<string, string> = {
  office: "bg-msbm-red",
  remote_site: "bg-sky-500",
  field: "bg-amber-500",
};

// ─── Form defaults ───────────────────────────────────────────────────────────

const DEFAULT_FORM = {
  name: "",
  address: "",
  type: "office" as GeofenceType,
  centerLat: "40.7128",
  centerLng: "-74.006",
  radius: "200",
  departmentId: "",
};

// ─── Map Skeleton ────────────────────────────────────────────────────────────

function MapSkeleton() {
  return (
    <div className="w-full h-[500px] bg-muted rounded-lg flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-msbm-red" />
        <p className="text-sm text-muted-foreground">Loading map...</p>
      </div>
    </div>
  );
}

// ─── Component ───────────────────────────────────────────────────────────────

export function GeofenceView() {
  const { geofences, setGeofences } = useAppStore();

  // State
  const [loading, setLoading] = useState(true);
  const [departments, setDepartments] = useState<DepartmentData[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [mapReady, setMapReady] = useState(false);

  // Form state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(DEFAULT_FORM);
  const [submitting, setSubmitting] = useState(false);

  // Delete confirm
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const selectedGeofence = geofences.find((g) => g.id === selectedId);

  // ─── Load Leaflet CSS dynamically ───────────────────────────────────────
  useEffect(() => {
    if (typeof document !== "undefined") {
      if (!document.querySelector('link[href*="leaflet"]')) {
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
        document.head.appendChild(link);
      }
      // Also fix the default marker icon issue in Next.js
      const fixIcon = async () => {
        const L = (await import("leaflet")).default;
        // @ts-expect-error - accessing internal _getIconUrl
        delete L.Icon.Default.prototype._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
          iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
          shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
        });
        setMapReady(true);
      };
      fixIcon();
    }
  }, []);

  // ─── Fetch data ─────────────────────────────────────────────────────────
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [geoRes, deptRes] = await Promise.all([
        fetch("/api/geofences"),
        fetch("/api/departments"),
      ]);
      const geoData = await geoRes.json();
      const deptData = await deptRes.json();
      setGeofences(geoData.geofences || []);
      setDepartments(deptData.departments || []);
    } catch {
      toast.error("Failed to load geofence data");
    } finally {
      setLoading(false);
    }
  }, [setGeofences]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ─── Build polygon positions from geo data ──────────────────────────────
  const getPolygonPositions = useCallback(
    (geo: GeofenceData): [number, number][] => {
      if (geo.polygon) {
        try {
          const parsed = JSON.parse(geo.polygon);
          // GeoJSON: [lng, lat] → Leaflet needs [lat, lng]
          return parsed.coordinates[0].map(
            (coord: number[]) => [coord[1], coord[0]] as [number, number]
          );
        } catch {
          // fallback
        }
      }
      // Generate circle polygon from center + radius
      const circleCoords = createCirclePolygon(
        geo.centerLat,
        geo.centerLng,
        geo.radius
      );
      return circleCoords.map(
        (coord: number[]) => [coord[1], coord[0]] as [number, number]
      );
    },
    []
  );

  // ─── Map center ─────────────────────────────────────────────────────────
  const mapCenter: [number, number] =
    geofences.length > 0
      ? [
          geofences.reduce((s, g) => s + g.centerLat, 0) / geofences.length,
          geofences.reduce((s, g) => s + g.centerLng, 0) / geofences.length,
        ]
      : [40.7128, -74.006];

  // ─── Open add dialog ────────────────────────────────────────────────────
  const openAddDialog = () => {
    setEditingId(null);
    setForm(DEFAULT_FORM);
    setDialogOpen(true);
  };

  // ─── Open edit dialog ───────────────────────────────────────────────────
  const openEditDialog = (geo: GeofenceData) => {
    setEditingId(geo.id);
    setForm({
      name: geo.name,
      address: geo.address || "",
      type: geo.type as GeofenceType,
      centerLat: String(geo.centerLat),
      centerLng: String(geo.centerLng),
      radius: String(geo.radius),
      departmentId: geo.departmentId || "",
    });
    setDialogOpen(true);
  };

  // ─── Submit form ────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!form.name.trim()) {
      toast.error("Name is required");
      return;
    }
    const lat = parseFloat(form.centerLat);
    const lng = parseFloat(form.centerLng);
    const radius = parseFloat(form.radius);
    if (isNaN(lat) || isNaN(lng) || isNaN(radius)) {
      toast.error("Invalid coordinates or radius");
      return;
    }

    // Auto-generate polygon from center + radius
    const polygonCoords = createCirclePolygon(lat, lng, radius);
    const polygonStr = JSON.stringify({
      type: "Polygon",
      coordinates: [polygonCoords],
    });

    setSubmitting(true);
    try {
      const url = editingId ? "/api/geofences" : "/api/geofences";
      const method = editingId ? "PUT" : "POST";

      const body: Record<string, unknown> = {
        name: form.name.trim(),
        address: form.address.trim() || undefined,
        type: form.type,
        centerLat: lat,
        centerLng: lng,
        radius,
        departmentId: form.departmentId || undefined,
        polygon: polygonStr,
      };

      if (editingId) body.id = editingId;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed to save geofence");
        return;
      }

      toast.success(editingId ? "Geofence updated" : "Geofence created");
      setDialogOpen(false);
      fetchData();
    } catch {
      toast.error("Network error");
    } finally {
      setSubmitting(false);
    }
  };

  // ─── Delete geofence ────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      const res = await fetch(`/api/geofences?id=${deleteId}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || "Failed to delete");
        return;
      }
      toast.success("Geofence deleted");
      if (selectedId === deleteId) setSelectedId(null);
      fetchData();
    } catch {
      toast.error("Network error");
    } finally {
      setDeleteDialogOpen(false);
      setDeleteId(null);
    }
  };

  // ─── Render ─────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Geofence Management</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Define work locations and attendance zones
          </p>
        </div>
        <Button
          onClick={openAddDialog}
          className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg shadow-emerald-500/25"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Geofence
        </Button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* ─── Map Section ─────────────────────────────────────────────── */}
        <div className="xl:col-span-2">
          <Card className="glass-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <MapIcon className="h-5 w-5 text-msbm-red" />
                Interactive Map
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3">
              <div className="rounded-lg overflow-hidden border">
                {loading ? (
                  <MapSkeleton />
                ) : (
                  <Suspense fallback={<MapSkeleton />}>
                    <div className="h-[500px]">
                      <MapContainer
                        center={mapCenter}
                        zoom={geofences.length > 0 ? 12 : 4}
                        scrollWheelZoom={true}
                        className="h-full w-full"
                      >
                        <TileLayer
                          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        {geofences.map((geo) => {
                          const positions = getPolygonPositions(geo);
                          const isSelected = geo.id === selectedId;
                          const color = POLYGON_HEX[geo.type] || "#ac1928";
                          const typeConfig = GEOFENCE_TYPE_CONFIG[geo.type as GeofenceType] || GEOFENCE_TYPE_CONFIG.office;
                          const TypeIcon = typeConfig.icon;

                          return (
                            <React.Fragment key={geo.id}>
                              <Polygon
                                positions={positions}
                                pathOptions={{
                                  color,
                                  weight: isSelected ? 3 : 2,
                                  opacity: isSelected ? 1 : 0.7,
                                  fillOpacity: isSelected ? 0.35 : 0.2,
                                }}
                                eventHandlers={{
                                  click: () => setSelectedId(geo.id),
                                }}
                              />
                              <Marker position={[geo.centerLat, geo.centerLng]}>
                                <Popup>
                                  <div className="space-y-1 min-w-[160px]">
                                    <p className="font-semibold text-sm">{geo.name}</p>
                                    <p className="text-xs text-gray-500 flex items-center gap-1">
                                      <TypeIcon className="h-3 w-3" />
                                      {typeConfig.label}
                                    </p>
                                    {geo.address && (
                                      <p className="text-xs text-gray-500">{geo.address}</p>
                                    )}
                                    <p className="text-xs text-gray-500">
                                      Radius: {formatDistance(geo.radius)}
                                    </p>
                                    <Badge
                                      variant="outline"
                                      className={`text-xs ${
                                        geo.isActive
                                          ? "border-emerald-500 text-msbm-red"
                                          : "border-gray-400 text-gray-500"
                                      }`}
                                    >
                                      {geo.isActive ? "Active" : "Inactive"}
                                    </Badge>
                                  </div>
                                </Popup>
                              </Marker>
                            </React.Fragment>
                          );
                        })}
                      </MapContainer>
                    </div>
                  </Suspense>
                )}
              </div>

              {/* Legend */}
              <div className="flex flex-wrap gap-4 mt-4 px-1">
                {(Object.keys(GEOFENCE_TYPE_CONFIG) as GeofenceType[]).map((type) => (
                  <div key={type} className="flex items-center gap-2">
                    <div
                      className={`w-3 h-3 rounded-full ${POLYGON_CLASSES[type]}`}
                    />
                    <span className="text-xs text-muted-foreground">
                      {GEOFENCE_TYPE_CONFIG[type].label}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ─── Geofence List ────────────────────────────────────────────── */}
        <div className="space-y-4">
          {/* Selected detail */}
          {selectedGeofence && (
            <Card className="border-msbm-red/20 dark:border-msbm-red/20 bg-gradient-to-br from-emerald-50/50 to-teal-50/50 dark:from-emerald-950/20 dark:to-teal-950/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Eye className="h-4 w-4 text-msbm-red" />
                  Selected Zone
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="font-semibold">{selectedGeofence.name}</p>
                {selectedGeofence.address && (
                  <p className="text-sm text-muted-foreground">{selectedGeofence.address}</p>
                )}
                <div className="flex flex-wrap gap-2 mt-1">
                  <Badge variant="outline" className={GEOFENCE_TYPE_CONFIG[selectedGeofence.type as GeofenceType]?.color}>
                    {GEOFENCE_TYPE_CONFIG[selectedGeofence.type as GeofenceType]?.label || selectedGeofence.type}
                  </Badge>
                  <Badge
                    variant="outline"
                    className={
                      selectedGeofence.isActive
                        ? "border-msbm-red text-msbm-red bg-msbm-red/5 dark:bg-msbm-red/20 dark:text-msbm-red-bright"
                        : "border-gray-400 text-gray-500 bg-gray-50 dark:bg-gray-900/30"
                    }
                  >
                    {selectedGeofence.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <div className="text-xs text-muted-foreground space-y-0.5 mt-2">
                  <p>Center: {selectedGeofence.centerLat.toFixed(4)}, {selectedGeofence.centerLng.toFixed(4)}</p>
                  <p>Radius: {formatDistance(selectedGeofence.radius)}</p>
                  {selectedGeofence.department && (
                    <p>Dept: {selectedGeofence.department.name}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* List */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">
                Geofences ({geofences.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="max-h-[420px]">
                <div className="space-y-1 p-3">
                  {loading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="h-20 bg-muted animate-pulse rounded-lg" />
                    ))
                  ) : geofences.length === 0 ? (
                    <div className="text-center py-8">
                      <MapPin className="h-10 w-10 mx-auto text-muted-foreground/40 mb-2" />
                      <p className="text-sm text-muted-foreground">No geofences yet</p>
                    </div>
                  ) : (
                    geofences.map((geo) => {
                      const typeConfig =
                        GEOFENCE_TYPE_CONFIG[geo.type as GeofenceType] ||
                        GEOFENCE_TYPE_CONFIG.office;
                      const TypeIcon = typeConfig.icon;
                      const isSelected = geo.id === selectedId;

                      return (
                        <button
                          key={geo.id}
                          onClick={() => setSelectedId(isSelected ? null : geo.id)}
                          className={`w-full text-left p-3 rounded-lg border transition-all duration-200 ${
                            isSelected
                              ? "border-emerald-300 dark:border-emerald-700 bg-msbm-red/5/50 dark:bg-emerald-950/20 shadow-sm"
                              : "border-transparent hover:bg-muted/50 hover:border-border"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-start gap-3 min-w-0">
                              <div
                                className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                                  typeConfig.color
                                }`}
                              >
                                <TypeIcon className="h-4 w-4" />
                              </div>
                              <div className="min-w-0">
                                <p className="font-medium text-sm truncate">
                                  {geo.name}
                                </p>
                                {geo.address && (
                                  <p className="text-xs text-muted-foreground truncate mt-0.5">
                                    {geo.address}
                                  </p>
                                )}
                                <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                                  <span className="text-xs text-muted-foreground">
                                    {formatDistance(geo.radius)}
                                  </span>
                                  {geo.isActive ? (
                                    <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                                  ) : (
                                    <XCircle className="h-3 w-3 text-gray-400" />
                                  )}
                                  {geo.department && (
                                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                                      {geo.department.code}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-7 w-7"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openEditDialog(geo);
                                }}
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-7 w-7 text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDeleteId(geo.id);
                                  setDeleteDialogOpen(true);
                                }}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ─── Add/Edit Dialog ─────────────────────────────────────────────── */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {editingId ? (
                <>
                  <Pencil className="h-5 w-5 text-msbm-red" />
                  Edit Geofence
                </>
              ) : (
                <>
                  <Plus className="h-5 w-5 text-msbm-red" />
                  Add Geofence
                </>
              )}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="geo-name">Name</Label>
              <Input
                id="geo-name"
                placeholder="e.g., HQ Main Office"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>

            {/* Address */}
            <div className="space-y-2">
              <Label htmlFor="geo-address">Address</Label>
              <Input
                id="geo-address"
                placeholder="123 Main St, City, State"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
              />
            </div>

            {/* Type */}
            <div className="space-y-2">
              <Label>Type</Label>
              <Select
                value={form.type}
                onValueChange={(v) => setForm({ ...form, type: v as GeofenceType })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(GEOFENCE_TYPE_CONFIG) as GeofenceType[]).map((type) => {
                    const Icon = GEOFENCE_TYPE_CONFIG[type].icon;
                    return (
                      <SelectItem key={type} value={type}>
                        <span className="flex items-center gap-2">
                          <Icon className="h-4 w-4" />
                          {GEOFENCE_TYPE_CONFIG[type].label}
                        </span>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            {/* Coordinates */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="geo-lat">Latitude</Label>
                <Input
                  id="geo-lat"
                  type="number"
                  step="any"
                  placeholder="40.7128"
                  value={form.centerLat}
                  onChange={(e) => setForm({ ...form, centerLat: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="geo-lng">Longitude</Label>
                <Input
                  id="geo-lng"
                  type="number"
                  step="any"
                  placeholder="-74.006"
                  value={form.centerLng}
                  onChange={(e) => setForm({ ...form, centerLng: e.target.value })}
                />
              </div>
            </div>

            {/* Radius */}
            <div className="space-y-2">
              <Label htmlFor="geo-radius">Radius (meters)</Label>
              <Input
                id="geo-radius"
                type="number"
                placeholder="200"
                value={form.radius}
                onChange={(e) => setForm({ ...form, radius: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">
                Attendance zone will be auto-generated as a circle around the center point.
              </p>
            </div>

            {/* Department */}
            <div className="space-y-2">
              <Label>Department (optional)</Label>
              <Select
                value={form.departmentId}
                onValueChange={(v) => setForm({ ...form, departmentId: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept.id} value={dept.id}>
                      {dept.name} ({dept.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={submitting || !form.name.trim()}
              className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : editingId ? (
                "Update Geofence"
              ) : (
                "Create Geofence"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Delete Confirm Dialog ───────────────────────────────────────── */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-rose-600">
              <Trash2 className="h-5 w-5" />
              Delete Geofence
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground py-2">
            Are you sure you want to delete this geofence? This action cannot be
            undone. Employees assigned to this location will need to be reassigned.
          </p>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
