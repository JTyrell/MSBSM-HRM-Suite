---
Task ID: 11-training-expenses
Agent: full-stack-developer
Task: Add Training & Learning Management Module + Expense Reimbursement Module (v10.0)

Work Log:
- Created `src/components/hrm/training-view.tsx` (~540 lines) with:
  - Training Courses List: Card grid showing 12 realistic courses with category badges, difficulty levels, duration, enrolled count, ratings, progress bars
  - Categories: Compliance, Leadership, Soft Skills, Technical, Wellness
  - Difficulty colors: green (Beginner), amber (Intermediate), rose (Advanced)
  - My Learning Tab: Enrolled courses with progress bars, Continue Learning button, completed courses with Certified badges, 7-day learning streak counter
  - Course Detail Dialog: Full description, learning objectives, prerequisites, curriculum modules (3-5 per course), enroll/in-progress/completed states, quiz placeholder
  - Leaderboard Tab: Top 10 learners from employee store with gold/silver/bronze styling for top 3, sorted by courses completed and learning hours
  - Stats Cards: Total Courses (12), Completed (2), In Progress (3), Learning Hours
  - Search bar with category and difficulty filters
  - Mock enrollment data initialized via useState (5 pre-seeded enrollments)
  - Leaderboard generated from employees store via useMemo
  - 12 courses: Workplace Safety, Anti-Harassment, Data Privacy & GDPR, Leadership Excellence, Project Management, D&I Workshop, Communication Skills, Time Management, Financial Wellness, Cybersecurity Awareness, Conflict Resolution, Customer Service Excellence

- Created `src/components/hrm/expense-view.tsx` (~530 lines) with:
  - Submit Expense Dialog: Type dropdown (Travel, Meals, Office Supplies, Software/Tools, Training, Miscellaneous), amount with currency formatting, date picker, description textarea, receipt upload placeholder with visual upload area, loading state on submit
  - Expense List: Desktop table + mobile cards with date, type badge, description, amount, status badge, action buttons
  - Status badges: Pending (amber), Approved (emerald), Rejected (rose), Processing (blue)
  - Filters by status and type, sort by date or amount (toggle asc/desc), search
  - Total summary at bottom showing filtered count and total amount
  - 3 tabs: All Expenses, My Expenses, Approvals (admin/manager only)
  - Approval Section: Pending approvals queue with Approve/Reject buttons and confirmation AlertDialog
  - Stats Row: Total Submitted ($5,600+), Pending, Approved, Rejected amounts
  - Detail Dialog: Full expense info, rejection reason display, approve/reject from detail view
  - 14 pre-seeded realistic expense records with varied statuses and types

- Updated `src/app/page.tsx`:
  - Added imports: TrainingView, ExpenseView, GraduationCap, Receipt icons
  - Added NAV_ITEMS: Training (GraduationCap icon), Expenses (Receipt icon)
  - Added view rendering for training and expenses
  - Version bumped from v9.0 to v10.0 in footer and sidebar banner

- Lint fixes:
  - Replaced useEffect + setState for mock data with useState initializer and useMemo for leaderboard
  - Zero lint errors (0 errors, 0 warnings)

Stage Summary:
- New components: 2 (training-view.tsx, expense-view.tsx)
- Total view modules: 22 (was 20)
- Total nav items: 21 (was 19)
- Version: v9.0 → v10.0
- Lint: 0 errors, 0 warnings

Files Created:
- `src/components/hrm/training-view.tsx` — NEW: ~540-line Training & Learning Management Module
- `src/components/hrm/expense-view.tsx` — NEW: ~530-line Expense Reimbursement Module

Files Modified:
- `src/app/page.tsx` — Added 2 imports, 2 nav items, 2 view renderers, version v10.0

QA Verification:
- ✅ `bun run lint` — 0 errors, 0 warnings
- ✅ Dev server compiled successfully (272ms)
