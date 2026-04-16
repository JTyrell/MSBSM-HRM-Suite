"use client";

import { useState, useEffect, useCallback } from "react";
import { useAppStore } from "@/store/app";

/**
 * Generic API fetch hook with loading/error states.
 * Returns data, loading, error, and refetch.
 */
export function useApiData<T>(
  url: string | null,
  defaultValue: T,
  deps: unknown[] = []
): {
  data: T;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
} {
  const [data, setData] = useState<T>(defaultValue);
  const [loading, setLoading] = useState(!!url);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!url) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      // Return first array/object value from the response
      const keys = Object.keys(json);
      const firstArrayKey = keys.find((k) => Array.isArray(json[k]));
      if (firstArrayKey) {
        setData(json[firstArrayKey] as T);
      } else {
        setData(json as T);
      }
    } catch (err: any) {
      console.error(`Failed to fetch ${url}:`, err);
      setError(err.message || "Failed to fetch data");
      setData(defaultValue);
    } finally {
      setLoading(false);
    }
  }, [url, ...deps]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

/**
 * Hook to POST/PUT/DELETE with a callback to refetch.
 */
export function useApiMutation() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = useCallback(
    async (
      url: string,
      method: "POST" | "PUT" | "DELETE" = "POST",
      body?: Record<string, unknown>,
      onSuccess?: (data: any) => void
    ) => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(url, {
          method,
          headers: { "Content-Type": "application/json" },
          body: body ? JSON.stringify(body) : undefined,
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || `HTTP ${res.status}`);
        onSuccess?.(json);
        return json;
      } catch (err: any) {
        setError(err.message || "Operation failed");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { mutate, loading, error };
}

// ─── Convenience hooks for common data ──────────────────────────────

export function useEmployees() {
  return useApiData<any[]>("/api/employees", []);
}

export function useDepartments() {
  return useApiData<any[]>("/api/departments", []);
}

export function useShifts(departmentId?: string) {
  const url = departmentId ? `/api/shifts?departmentId=${departmentId}` : "/api/shifts";
  return useApiData<any[]>(url, [], [departmentId]);
}

export function useAttendance(params?: { employeeId?: string; from?: string; to?: string }) {
  const searchParams = new URLSearchParams();
  if (params?.employeeId) searchParams.set("employeeId", params.employeeId);
  if (params?.from) searchParams.set("from", params.from);
  if (params?.to) searchParams.set("to", params.to);
  const qs = searchParams.toString();
  return useApiData<any[]>(`/api/attendance${qs ? `?${qs}` : ""}`, [], [qs]);
}

export function usePayroll(periodId?: string) {
  const url = periodId ? `/api/payroll?periodId=${periodId}` : "/api/payroll";
  return useApiData<any[]>(url, [], [periodId]);
}

export function useNotifications(userId?: string) {
  return useApiData<any[]>(userId ? `/api/notifications?userId=${userId}` : null, [], [userId]);
}

export function useAnnouncements(category?: string) {
  const url = category && category !== "all" ? `/api/announcements?category=${category}` : "/api/announcements";
  return useApiData<any[]>(url, [], [category]);
}

export function usePerformanceReviews() {
  return useApiData<any[]>("/api/performance-reviews", []);
}

export function useDepartmentRoles(departmentId?: string) {
  const url = departmentId ? `/api/department-roles?departmentId=${departmentId}` : "/api/department-roles";
  return useApiData<any[]>(url, [], [departmentId]);
}

export function usePTORequests(userId?: string) {
  const url = userId ? `/api/pto?userId=${userId}` : "/api/pto";
  return useApiData<any[]>(url, [], [userId]);
}

export function usePTOBalance(userId?: string) {
  return useApiData<any>(userId ? `/api/pto-balances?userId=${userId}` : null, null, [userId]);
}

export function useGeofences() {
  return useApiData<any[]>("/api/geofences", []);
}

export function useSettings() {
  return useApiData<any>("/api/settings", null);
}

export function useJobs(status?: string) {
  const url = status && status !== "all" ? `/api/jobs?status=${status}` : "/api/jobs";
  return useApiData<any[]>(url, [], [status]);
}

export function useActivityFeed() {
  return useApiData<{ activities: any[]; whosOut: any[] }>("/api/activity-feed", { activities: [], whosOut: [] });
}

export function useScheduling(type: string, params?: Record<string, string>) {
  const searchParams = new URLSearchParams({ type, ...params });
  return useApiData<any[]>(`/api/scheduling?${searchParams.toString()}`, [], [type, JSON.stringify(params)]);
}

export function useTimeEntries(params?: { employeeId?: string; from?: string; to?: string }) {
  const searchParams = new URLSearchParams();
  if (params?.employeeId) searchParams.set("employeeId", params.employeeId);
  if (params?.from) searchParams.set("from", params.from);
  if (params?.to) searchParams.set("to", params.to);
  const qs = searchParams.toString();
  return useApiData<any[]>(`/api/time-entries${qs ? `?${qs}` : ""}`, [], [qs]);
}

export function useMessages(channelId?: string) {
  return useApiData<any[]>(channelId ? `/api/messages?channelId=${channelId}` : null, [], [channelId]);
}

export function useChannels() {
  return useApiData<any[]>("/api/messages?type=channels", []);
}
