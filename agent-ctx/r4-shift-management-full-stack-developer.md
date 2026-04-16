---
Task ID: r4-shift-management
Agent: full-stack-developer
Task: Shift Scheduling Module - Prisma Model, API, UI Component, Navigation

## Work Completed

### Step 1: Prisma Schema
- Added `Shift` model to `/home/z/my-project/prisma/schema.prisma` with fields: id, name, startTime, endTime, breakMinutes, color, isActive, departmentId, companyId, timestamps
- Added `Shift` relation to `Company` model (shifts field)
- Added `Shift` relation to `Department` model (shifts field)
- Added indexes on departmentId and companyId
- Ran `bun run db:push` successfully

### Step 2: API Route
- Created `/home/z/my-project/src/app/api/shifts/route.ts`
  - **GET /api/shifts** - Lists all shifts with optional departmentId filter, includes department relation
  - **POST /api/shifts** - Creates new shift with validation for required fields (name, startTime, endTime, companyId)
  - **PUT /api/shifts** - Updates shift by id with partial field updates
  - **DELETE /api/shifts** - Deletes shift by id

### Step 3: Seed Route Update
- Updated `/home/z/my-project/src/app/api/seed/route.ts`:
  - Added `await db.shift.deleteMany()` in cleanup
  - Added 5 default shifts after company/department creation, before employee creation:
    1. Morning Shift (06:00-14:00, Engineering, #10b981)
    2. Day Shift (09:00-17:00, All, #14b8a6)
    3. Evening Shift (14:00-22:00, Operations, #f59e0b)
    4. Night Shift (22:00-06:00, Operations, #8b5cf6)
    5. Flex Shift (10:00-16:00, Marketing, #ec4899)
  - Added shifts count to seed response stats

### Step 4: UI Component
- Created `/home/z/my-project/src/components/hrm/shifts-view.tsx`
  - **Stats Cards**: Total shifts, Average duration, Daily coverage hours, Departments covered - with gradient icon backgrounds and hover effects
  - **Quick Templates**: 4 preset templates (Standard 9-5, Early Bird, Night Owl, Part Time) that pre-fill the create form
  - **List View (Tab)**: Table with columns for Shift (icon+name), Time Range, Duration, Break, Department, Status (Active/Inactive badge), Actions (Edit/Delete)
  - **Calendar View (Tab)**: Weekly grid (Mon-Sun) showing all shifts as color-coded blocks with shift name, duration, and department code
  - **Create/Edit Dialog**: Form with name, start/end time, duration preview, break duration, color picker (12 preset colors), department select, active toggle switch
  - **Delete Confirmation Dialog**: Confirmation with shift name
  - Department filter select in list view
  - Responsive design with mobile-first approach
  - Emerald/teal color scheme throughout

### Step 5: Navigation Update
- Added import for `ShiftsView` in page.tsx
- Added `{ id: "shifts", label: "Shifts", icon: CalendarClock }` to NAV_ITEMS after "Attendance"
- Added render condition `{currentView === "shifts" && <ShiftsView />}`
- Updated footer version to "v3.0"

## Verification
- `bun run lint` passes with 0 errors (only 2 pre-existing warnings in export.ts)
- Seed returns 200 with 5 shifts in the response
- GET /api/shifts returns all 5 shifts with department relations
- All CRUD operations verified working through API testing

## Stage Summary
- Complete Shift Scheduling Module: Prisma model, API, UI, navigation
- 5 default shift templates seeded automatically
- Interactive calendar and list views with full CRUD
- Zero lint errors
