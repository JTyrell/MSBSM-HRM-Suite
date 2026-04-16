"use client";

import React from "react";
import { Loader2, AlertCircle, Inbox } from "lucide-react";

interface ApiStateProps {
  loading: boolean;
  error: string | null;
  empty: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyIcon?: React.ReactNode;
  children: React.ReactNode;
}

/**
 * Wraps API-driven content with unified loading/error/empty states.
 * Shows a spinner while loading, an error message if the fetch failed,
 * or a beautiful empty state if no data exists yet.
 */
export function ApiState({
  loading,
  error,
  empty,
  emptyTitle = "No data yet",
  emptyDescription = "Data will appear here once it's been created.",
  emptyIcon,
  children,
}: ApiStateProps) {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary/60" />
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3">
        <div className="rounded-full bg-destructive/10 p-3">
          <AlertCircle className="h-6 w-6 text-destructive" />
        </div>
        <p className="text-sm font-medium text-destructive">Failed to load data</p>
        <p className="text-xs text-muted-foreground max-w-md text-center">{error}</p>
      </div>
    );
  }

  if (empty) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3">
        <div className="rounded-full bg-muted/50 p-4">
          {emptyIcon || <Inbox className="h-8 w-8 text-muted-foreground/50" />}
        </div>
        <p className="text-sm font-medium text-muted-foreground">{emptyTitle}</p>
        <p className="text-xs text-muted-foreground/70 max-w-md text-center">{emptyDescription}</p>
      </div>
    );
  }

  return <>{children}</>;
}
