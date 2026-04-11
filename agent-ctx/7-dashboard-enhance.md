# Task: 7-dashboard-enhance — Dashboard Enhancement

## Summary
Enhanced the MSBM-HR Suite Dashboard module with real-time activity feed, animated stat cards, "Who's Out Today" widget, and upcoming events section.

## Changes Made

### 1. Activity Feed API (`/api/activity-feed/route.ts`)
- Created new API endpoint that aggregates data from:
  - **Attendance Records** (latest 5 clock-in/out events)
  - **PTO Requests** (latest 5 requests)
  - **Announcements** (latest 3 published)
  - **Audit Logs** (latest 5 system events)
- Also fetches employees currently on approved PTO today ("Who's Out")
- Returns sorted unified activity feed (max 20 items) + whosOut list

### 2. Dashboard View Enhancements (`dashboard-view.tsx`)

#### a. Real-Time Activity Feed (replaces old attendance-only feed)
- Fetches from `/api/activity-feed` on mount
- Auto-refreshes every 30 seconds via `setInterval`
- Shows latest 8 activities with:
  - Color-coded left border by type (emerald=attendance, amber=PTO, violet=announcement, gray=system)
  - Type-specific icons (Clock, CalendarDays, Megaphone, Shield)
  - Department badge when available
  - Relative timestamps via `formatDistanceToNow` from date-fns
- Loading state with Skeleton shimmer
- Wrapped in ScrollArea with max-height
- Live indicator with spinning RefreshCw icon during fetches

#### b. "Who's Out Today" Widget
- Shows employees currently on approved PTO
- Avatar with initials, name, PTO type badge, department
- Max 5 shown with "+X more" link
- Empty state: "Everyone is in today" with Sun icon
- Loading skeleton state

#### c. Enhanced Stat Cards
- Subtle animated gradient border effect (emerald/teal color scheme)
- `animate-gradient-border` CSS class with `gradientBorderShift` keyframe
- Wrapped in a gradient-border div with inner Card
- All stat cards now always show trend data (even when pending PTO ≤ 3)

#### d. Upcoming Events Section
- Mock data: Company Picnic (Jul 15), Q3 All Hands (Jul 20), Summer Shutdown (Aug 1-5)
- Each event has icon, title, date, and type badge
- Color-coded by type (social=emerald, meeting=teal, holiday=amber)

### 3. CSS Animations (`globals.css`)
- Added `animate-gradient-border` class with shifting gradient animation
- Added `gradientBorderShift` keyframe (6s cycle, emerald/teal palette)

### 4. Cleanup
- Removed unused imports (TrendingUp, TrendingDown, LogIn, LogOut)
- Added new imports: ScrollArea, Skeleton, formatDistanceToNow, Megaphone, Shield, CalendarHeart, PartyPopper, Building2, RefreshCw

## Files Modified
- `src/app/api/activity-feed/route.ts` (NEW)
- `src/components/hrm/dashboard-view.tsx` (MODIFIED)
- `src/app/globals.css` (MODIFIED)

## Export
- Remains `export function DashboardView()` unchanged
