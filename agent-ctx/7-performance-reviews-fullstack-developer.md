---
Task ID: 7-performance-reviews
Agent: fullstack-developer
Task: Create Performance Reviews Module with Full UI

Work Log:
- Added PerformanceReview model to Prisma schema with fields: employeeId, reviewerId, cycleName, status, rating, strengths, improvements, goals, overallComment, reviewedAt
- Added two Employee relations: reviewsReceived and reviewsGiven (with "Reviewer" named relation)
- Pushed schema to SQLite database (removed @db.Text annotations incompatible with SQLite)
- Created /api/performance-reviews route with full CRUD (GET, POST, PUT, DELETE)
  - GET returns all reviews with employee and reviewer info joined
  - POST creates new review with validation (employeeId, reviewerId, cycleName required; rating 1-5 range)
  - PUT updates review fields, auto-sets reviewedAt on completion
  - DELETE removes review by id query param
- Seeded 10 performance reviews with realistic data:
  - 5 completed (Q4 2025): Priya Patel (4.5), James O'Brien (4.0), Emma Thompson (4.8), Maria Garcia (3.5), Noah Martinez (3.8)
  - 3 in-progress (Q1 2026): Aisha Johnson, Carlos Rodriguez (4.2), Liam Turner
  - 2 pending (Q1 2026): Sophia Lee, Olivia Brown
- Created performance-reviews-view.tsx (~1350 lines) with:
  - Page header with "Create Review" button
  - 4 animated stat cards (Total Reviews, Average Rating with star icon, Completed with %, Pending with warning)
  - 4-tab layout:
    - Overview: Department avg rating bar chart, rating distribution (1-5), recent reviews list
    - Reviews: Status/Sort filter bar, review cards with avatar, star rating, status badge, truncated text with expand
    - My Reviews: Reviews assigned to current user with Start/Complete action buttons
    - Cycles: 3 mock review cycles (Q1 2026, Q4 2025, Annual 2025) with progress bars and timeline
  - Create Review dialog: employee select, cycle name, interactive 1-5 star selector, textareas for strengths/improvements/goals/comment
  - Review Detail dialog: full review info, edit mode for in-progress reviews, complete action
  - StarRating component with interactive hover effect
  - StatusBadge component (pending=slate, in_progress=amber, completed=emerald)
  - TruncatableText component with read more/less toggle
  - DetailSection component with inline edit capability
- Updated page.tsx:
  - Added PerformanceReviewsView import
  - Added "Reviews" nav item with Star icon after "Time Off" (index 7, before "Benefits")
  - Added render condition for performance view
  - Updated footer version to v6.0
  - Updated sidebar version to v6.0

Stage Summary:
- New PerformanceReview model in Prisma schema (16th model)
- New API endpoint: /api/performance-reviews (full CRUD)
- 10 seeded performance reviews with realistic detailed text
- New UI module: performance-reviews-view.tsx at /home/z/my-project/src/components/hrm/
- Navigation now has 17 items
- Zero new lint errors (pre-existing payroll-view.tsx error unchanged)
