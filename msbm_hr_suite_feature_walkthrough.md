# MSBM Human Resource Management Suite
## Feature Walkthrough & Capabilities Overview

**Prepared for the Board of Directors**
**Mona School of Business & Management | The University of the West Indies**

**Document Version:** 1.0
**Date:** April 2026

---

## Executive Summary

The **MSBM HR Suite** is a purpose-built, enterprise-grade Human Resource Information System (HRIS) designed to address the unique operational requirements of the Mona School of Business & Management. Spanning **34 integrated modules** across nine functional categories, the platform consolidates workforce management, payroll processing, regulatory compliance, talent lifecycle operations, and organisational intelligence into a single, unified digital environment.

The system has been architected specifically to support MSBM's 10 departments, over 45 distinct job titles, and the full spectrum of employment types — from senior academic leadership to hourly support staff. It is fully aligned with **Jamaican statutory requirements**, including NIS, NHT, Education Tax, and PAYE obligations, while also incorporating **Sling-style workforce management** capabilities for shift-based and hourly personnel.

> [!IMPORTANT]
> This platform replaces the need for multiple disconnected tools (spreadsheets, paper forms, separate timekeeping systems) with a single, secure, web-based solution accessible from any device.

---

## Organisational Structure Supported

The system is pre-configured to support the full MSBM organisational hierarchy:

| Department | Representative Roles |
|---|---|
| **Maintenance / Support & Service** | Senior Office Attendant, Departmental Attendant, Handyman, Watchman |
| **Centre of Excellence & Innovation** | Information Systems Manager, Computer Technologist, Systems Admin, Senior Consultant, TSR |
| **Accounting** | Accounting Clerk, Assistant Accountant |
| **Administrative Staff / Directors** | Director of Finance, Academic Director, Director of CEI, HR & Admin Manager, Executive Director, MSBM Company Secretary |
| **Marketing** | VHS Programme Coordinator, Administrative Assistant, Student & Alumni Services Officer, Marketing Coordinator |
| **Professional Services Unit (PSU)** | Project Officer, Consultant, Head of PSU, Administrative Assistant |
| **Human Resources** | HR Coordinator, HR Assistant |
| **Graduate Programmes** | Graduate Programmes Coordinator, Administrative Assistant |
| **Office of the Executive Director** | Executive Director, Deputy Executive Director, Unit Head, Senior Lecturer |
| **Documentation Centre** | Records Officer, Administrative Assistant |

---

## Module Categories & Capabilities

### 1. Central Command & Executive Dashboard

#### 1.1 Executive Dashboard
The primary command centre provides real-time visibility into all critical HR metrics at a glance.

- **Workforce KPIs** — Total headcount, active employees, new hires, and attrition rates displayed with trend indicators
- **Attendance Overview** — Real-time clock-in/clock-out status, late arrivals, and absence rates across all departments
- **Payroll Summary** — Current period gross payroll, net disbursements, and statutory deduction totals
- **PTO Utilisation** — Pending leave requests, approval rates, and departmental absence forecasts
- **Departmental Breakdown** — Interactive charts illustrating headcount and budget allocation by department
- **Multi-Timezone Clocks** — Live time display for Kingston, New York, London, and Toronto — essential for international programme coordination
- **Activity Feed** — Chronological log of recent system events including new hires, approvals, and policy changes

#### 1.2 AI Assistant
An integrated conversational AI interface enabling natural-language queries against the HR knowledge base.

- Policy lookup and clarification
- Employee data queries (e.g., "How many employees are in the Marketing department?")
- Compliance guidance and procedural assistance

---

### 2. Workforce Operations & Time Management

#### 2.1 Attendance Tracking
A GPS-enhanced attendance system designed for both on-campus and remote staff.

- **Digital Clock-In/Out** — Employees record start and end times directly from the platform
- **GPS Verification** — Location-stamped entries ensure attendance is recorded from authorised work sites
- **Absence Tracking** — Automatic categorisation of absences (unexcused, medical, personal)
- **Overtime Monitoring** — Real-time alerts when employees approach or exceed standard weekly hours
- **Historical Records** — Comprehensive attendance history with export capabilities

#### 2.2 Time Tracking
A granular time-entry system supporting both hourly and salaried staff.

- **Timesheet Management** — Weekly/bi-weekly timesheet submission and approval workflows
- **Manager Approval Queue** — Supervisors review, approve, or return time entries with notes
- **Labour Cost Computation** — Real-time calculation of labour costs based on logged hours and pay rates

#### 2.3 Geofencing
Location-based workforce verification using **Mapbox GL** mapping technology.

- **Custom Geofence Zones** — Define authorised work areas with precision radius controls
- **Map Visualisation** — Interactive map displaying all MSBM campus locations and satellite offices
- **Boundary Enforcement** — Alerts triggered when clock-in attempts originate outside defined zones
- **Multi-Site Support** — Separate geofences for main campus, satellite locations, and remote work zones

#### 2.4 Shift Management
Comprehensive shift-based scheduling for support, maintenance, and hourly staff.

- **Shift Creation & Assignment** — Create recurring or ad-hoc shifts with department and role filtering
- **Visual Shift Calendar** — Weekly and monthly calendar views with drag-and-drop capabilities
- **Shift Templates** — Pre-configured templates (Morning, Afternoon, Night, Standard Office, Flex, Split, On-Call, Weekend)
- **Coverage Monitoring** — Automatic identification of understaffed periods

#### 2.5 Smart Scheduling Engine (Sling-Style)
An intelligent scheduling system inspired by industry-leading workforce management platforms.

- **Weekly Grid View** — Full-week visual schedule with 6AM–10PM hourly resolution across all seven days
- **Employee Availability Management** — Per-employee, per-day availability matrices with interactive toggling
- **Shift Swap Requests** — Employee-initiated shift exchanges with manager approval workflows
- **Conflict Detection** — Automatic identification of scheduling issues:
  - Double-bookings
  - Overtime threshold violations (48-hour weekly limit)
  - Labour budget overruns
  - Missing mandatory break periods
  - Availability mismatches
- **Projected Labour Cost** — Real-time cost projections based on scheduled hours and individual pay rates
- **Department Filtering** — View schedules by ICT, Maintenance, Admin, or Faculty groupings

---

### 3. Compensation & Benefits

#### 3.1 Payroll Processing
A full-cycle payroll engine calibrated for Jamaican statutory requirements.

- **Multi-Period Support** — Weekly, bi-weekly, and monthly pay cycle processing
- **Automated Deductions** — NIS (3% employee / 3.75% employer), NHT (2% / 3%), Education Tax (2.5%), and PAYE (25% above threshold)
- **Gross-to-Net Calculation** — Complete breakdown from gross pay to net disbursement
- **Pay Slip Generation** — Detailed employee pay slips with line-item deduction transparency
- **Payroll History** — Period-over-period comparison and audit trails
- **Multi-Currency Display** — JMD-formatted outputs with proper locale-aware formatting

#### 3.2 Benefits Administration
A structured benefits enrollment and management workspace.

- **Plan Catalogue** — Health insurance, dental, vision, life insurance, and retirement plan options
- **Enrollment Management** — Open enrollment period tracking with deadline reminders
- **Dependent Management** — Add, edit, and remove dependents from benefit plans
- **Cost Analysis** — Employee vs. employer contribution breakdowns per plan
- **Status Tracking** — Active, pending, and expired benefit statuses with visual indicators

#### 3.3 Expense Management
A digital expense reporting and approval pipeline.

- **Expense Submission** — Categorised expense entry with receipt attachment support
- **Approval Workflows** — Multi-level approval chains (submitter → manager → finance)
- **Budget Monitoring** — Department-level expense tracking against allocated budgets
- **Reimbursement Tracking** — Status visibility from submission through to disbursement

---

### 4. Talent Lifecycle Management

#### 4.1 Recruitment Pipeline
An end-to-end recruitment management system with visual candidate tracking.

- **Job Board** — Create, publish, and manage open positions with salary ranges, department, and location metadata
- **Candidate Pipeline** — Four-stage Kanban board (Applied → Screening → Interview → Offer) with card-based candidate profiles
- **Applicant Tracking** — Per-candidate profiles with star ratings, application dates, and role assignments
- **Analytics Dashboard** — Applicants-by-department charts, status breakdowns, total listings, and offer acceptance rates
- **Average Time-to-Hire** — Key metric tracking for recruitment efficiency

#### 4.2 Employee Onboarding
A structured onboarding programme with customisable checklist templates.

- **Onboarding Pipeline** — Visual progress across Pre-Start, First Day, First Week, and First Month phases
- **Template Library** — Four pre-built templates:
  - **Standard** — Comprehensive checklist for full-time office employees (21 items)
  - **Remote Employee** — Modified for virtual setup and digital culture integration
  - **Executive** — Streamlined for leadership integration and stakeholder meetings
  - **Contractor** — Minimal checklist for short-term engagements
- **New Hire Registration** — Direct employee creation with department assignment and manager linkage
- **Progress Tracking** — Per-employee completion percentages with status badges (Pre-Start, In Progress, Completed)

#### 4.3 Performance Reviews
A formal performance evaluation framework supporting multi-cycle review processes.

- **Review Cycle Management** — Create and manage annual, semi-annual, and quarterly review cycles
- **Goal-Linked Evaluations** — Assessment criteria tied to employee-specific objectives
- **Multi-Rater Support** — Self-assessment, manager review, and peer feedback collection
- **Rating Scales** — Configurable competency and performance rating matrices
- **Historical Archives** — Review history accessible for trend analysis and development planning

#### 4.4 Training & Development
A learning management interface for tracking professional development activities.

- **Course Catalogue** — Register and manage training programmes, workshops, and certification courses
- **Enrollment Tracking** — Monitor employee participation and completion status
- **Certification Management** — Track professional certifications with expiration alerts
- **Development Plans** — Link training activities to career progression pathways

#### 4.5 Goals & OKRs
A structured objective-setting and progress-tracking framework.

- **Personal OKRs** — Individual objectives with measurable key results and progress tracking
- **Team Goals** — Department and cross-functional team goal visibility with multi-assignee support
- **Check-Ins** — Weekly, bi-weekly, and monthly progress check-in logs with rating assessments and action items
- **Priority & Status Tracking** — Visual indicators for goal priority (High/Medium/Low) and status (On Track, At Risk, Behind)

---

### 5. Regulatory Compliance & Governance

#### 5.1 General Compliance Engine
A central compliance management dashboard for institutional regulatory obligations.

- **Policy Tracking** — Document and monitor compliance with internal policies
- **Audit Readiness** — Checklist-based audit preparation tools
- **Regulatory Alerts** — Notifications for upcoming compliance deadlines

#### 5.2 Jamaican Statutory Compliance Engine
A specialised module for Jamaica-specific payroll and employment law compliance.

- **Payroll Deduction Calculator** — Real-time computation of all statutory deductions:
  - **NIS** — 3% employee / 3.75% employer (ceiling: JMD 23,880/week)
  - **NHT** — 2% employee / 3% employer (ceiling: JMD 32,000/month)
  - **Education Tax** — 2.5% (no ceiling)
  - **PAYE** — 25% on income above JMD 1,500,096/year threshold
- **PAYE Tax Code Support** — Five tax codes (A through E) including Senior Citizen enhanced thresholds
- **TRN/NIS Validation** — Single and batch validation of Tax Registration Numbers and National Insurance Scheme numbers with format enforcement
- **Statutory Rates Reference** — Complete, up-to-date reference table of all Jamaican deduction rates
- **Labour Law Reference** — Comprehensive guide covering:
  - Maximum shift length (8 hours/day, 40 hours/week)
  - Meal and rest break requirements
  - Overtime compensation rules (1.5x and 2x)
  - Sick leave entitlements (10 days after 12 months)
  - Maternity leave provisions (12 weeks, 8 weeks paid)
  - Termination notice periods (2–12 weeks based on tenure)
- **Compliance Roster** — Per-employee TRN, NIS, and NHT registration status tracking
- **Remittance History** — Monthly statutory remittance records for NIS, NHT, Education Tax, and PAYE

> [!NOTE]
> This module ensures MSBM remains fully compliant with the requirements of the Tax Administration Jamaica (TAJ), the Ministry of Labour and Social Security, and all relevant statutory bodies.

---

### 6. Communication, Culture & Engagement

#### 6.1 Announcements & Holidays
A unified communications hub with an integrated holiday calendar.

- **Company Announcements** — Create, pin, and categorise announcements with priority levels (Normal, Important, Urgent)
- **Category System** — General, Policy, Events, Achievements, and more
- **Reaction System** — Social-media-style emoji reactions for engagement tracking (👍 ❤️ 🎉 👏 🤔 🔥)
- **Expandable Content** — Long-form announcements with read-more/less toggle functionality
- **Holiday Calendar** — Interactive monthly calendar with colour-coded Federal and Company holidays
- **Holiday Countdown** — Prominent display of days remaining until the next upcoming holiday
- **Holiday Statistics** — Total, past, and upcoming holiday counts for the current year

#### 6.2 Team Hub
A real-time team communication and coordination workspace.

- **Team Messaging** — Direct and group messaging capabilities
- **Activity Streams** — Department-level activity feeds for operational transparency
- **Team Directory** — Quick access to colleague profiles and contact information

#### 6.3 Kudos & Recognition
An employee recognition platform fostering a culture of appreciation.

- **Peer Recognition** — Any employee can send kudos to colleagues with personalised messages
- **Recognition Feed** — Chronological timeline of all kudos across the organisation
- **Leaderboards** — Top senders and top recipients tracking to identify culture champions
- **Category Badges** — Recognition types including teamwork, innovation, leadership, and customer service

#### 6.4 Feedback & Surveys
A structured feedback collection and analysis platform.

- **Survey Builder** — Create and distribute employee surveys with multiple question types
- **Anonymous Feedback** — Option for anonymous submission to encourage candid responses
- **Response Analytics** — Aggregated response data with completion rate tracking
- **Action Item Tracking** — Link feedback insights to improvement initiatives

#### 6.5 Employee Wellness Hub
A holistic employee wellness programme management centre.

- **Health Score Tracking** — Composite wellness score across Physical, Mental, Social, and Financial dimensions
- **Mood Logging** — Daily mood check-ins with seven emotional states and streak tracking
- **Activity Tracking** — Log wellness activities across Exercise, Mindfulness, Nutrition, Medical, and Rest categories
- **Wellness Resources** — Curated directory of support resources:
  - Mental Health Hotline and EAP contacts
  - Fitness centre schedules and nutrition guides
  - Stress management articles and ergonomic setup guides
  - Team sports calendar
- **Weekly Wellness Tips** — Rotating evidence-based wellness recommendations

---

### 7. Document & Facilities Management

#### 7.1 Company Documents
A centralised document repository for organisational policies and records.

- **Document Library** — Upload, categorise, and manage company-wide documents
- **Version Control** — Track document revisions and maintain audit history
- **Access Controls** — Role-based document visibility (admin, HR, manager, employee)

#### 7.2 My Documents (Employee Self-Service)
A personal document vault for individual employees.

- **Personal File Management** — Store and access personal HR documents (contracts, tax forms, certifications)
- **Certification Tracking** — Monitor professional certifications with expiration alerts
- **Document Requests** — Formal request system for employment verification letters, payslips, and other HR documents
- **Status Tracking** — Request status visibility from submission through fulfilment

#### 7.3 Meeting Room Booking
A facility reservation system for MSBM's conference and meeting spaces.

- **Room Directory** — Catalogue of available meeting rooms with capacity and amenity details
- **Calendar-Based Booking** — Visual booking calendar with conflict prevention
- **Booking Statistics** — Daily, weekly, and utilisation rate tracking
- **Quick Reserve** — Streamlined booking flow for immediate or scheduled reservations

---

### 8. Intelligence, Reporting & Analytics

#### 8.1 Team Analytics
A deep-dive analytics engine for workforce performance intelligence.

- **Departmental Performance** — Cross-departmental comparison of attendance, productivity, and engagement metrics
- **Headcount Analysis** — Historical and projected headcount trends
- **Turnover Analytics** — Attrition rates by department, tenure, and role classification
- **Diversity Metrics** — Workforce composition analysis across relevant dimensions

#### 8.2 Workforce Reports
Structured operational reporting for HR leadership and executive review.

- **Department Headcount Reports** — Visual distribution of staff across all ten departments
- **Tenure Analysis** — Employee distribution by years of service
- **Compensation Benchmarking** — Salary distribution analysis by department and role
- **Custom Report Builder** — Flexible filtering and export capabilities

#### 8.3 General Reports
A comprehensive reporting module for compliance, operational, and financial reporting.

- **Attendance Reports** — Aggregated attendance records with filtering by department, date range, and employee
- **Payroll Reports** — Period-specific payroll summaries with deduction breakdowns
- **Leave Balance Reports** — Organisation-wide PTO balances and utilisation patterns
- **Export Formats** — Support for PDF, CSV, and spreadsheet outputs

---

### 9. System Administration & Configuration

#### 9.1 Department & Roles Management
A dedicated administrative interface for maintaining the organisational structure.

- **Department Registry** — Create, edit, and deactivate departments with hierarchical relationships
- **Role Definitions** — Define job titles, pay grades, and reporting structures
- **Department-Role Mapping** — Link roles to specific departments with activation controls
- **Bulk Operations** — Efficient management of large-scale organisational changes

#### 9.2 Employee Directory
A searchable, visually rich employee directory.

- **Search & Filter** — Full-text search across names, departments, and job titles
- **Profile Cards** — At-a-glance employee information with avatar, role, department, and contact details
- **Organisational Navigation** — Browse by department or role category

#### 9.3 Employee Profile Editor
A comprehensive self-service profile management tool.

- **Personal Information** — Name, contact details, emergency contacts
- **Employment Details** — Department, role, hire date, and pay information
- **Document Upload** — Profile photo and personal document management

#### 9.4 PTO (Paid Time Off) Management
A full-cycle leave management system.

- **Leave Request Submission** — Digital leave requests with date selection, category, and justification
- **Approval Workflows** — Manager review and approval with delegation support
- **Balance Tracking** — Real-time leave balance visibility by category (Vacation, Sick, Personal, Bereavement)
- **Calendar Integration** — Team absence calendar for coverage planning
- **Policy Enforcement** — Automatic validation against company leave policies

#### 9.5 Settings & Configuration
A centralised system configuration panel.

- **Company Profile** — Organisation name, logo, and branding settings
- **Notification Preferences** — Granular control over email and in-app notification delivery
- **Security Settings** — Password policies, session management, and audit log access
- **Data Management** — Database seeding, backup triggers, and maintenance utilities

---

## Security & Authentication

The platform implements enterprise-grade authentication and access control:

- **Role-Based Access Control (RBAC)** — Four permission tiers: Administrator, HR Manager, Manager, and Employee
- **Secure Authentication** — Employee ID and password login with magic link alternative via email
- **Password Reset** — Self-service password recovery with administrative override capability
- **Session Management** — Supabase-backed session tokens with automatic expiration
- **Audit Trail** — Comprehensive logging of all significant system actions

---

## Technology & Infrastructure

| Component | Technology |
|---|---|
| **Frontend Framework** | Next.js 16 (React) |
| **Backend & Database** | Supabase (PostgreSQL) |
| **Authentication** | Supabase Auth |
| **UI Framework** | Tailwind CSS + Radix UI (shadcn/ui) |
| **State Management** | Zustand |
| **Mapping & Geofencing** | Mapbox GL |
| **Charts & Visualisation** | Recharts |
| **Deployment Target** | Docker → Railway |
| **API Architecture** | RESTful API (22 route groups) |

---

## Strategic Value to MSBM

### Operational Efficiency
- Eliminates manual, paper-based HR processes
- Reduces payroll processing time through automated statutory deductions
- Streamlines leave management, approvals, and attendance tracking

### Regulatory Assurance
- Built-in Jamaican statutory compliance (NIS, NHT, PAYE, Education Tax)
- Labour law reference system ensures scheduling decisions respect legal boundaries
- TRN/NIS validation prevents data entry errors in critical government filings

### Talent Management
- Structured onboarding reduces new-hire ramp-up time
- Performance review cycles provide data-driven promotion and development decisions
- Recruitment pipeline visibility enables faster, more informed hiring

### Employee Experience
- Self-service access to payslips, leave balances, and personal documents
- Wellness and recognition programmes support staff retention and morale
- Real-time team communication reduces information silos

### Decision Intelligence
- Executive dashboard provides board-level visibility into workforce metrics
- Department-level analytics support resource allocation decisions
- Workforce reports enable evidence-based strategic planning

---

*This document is confidential and intended solely for the Board of Directors of the Mona School of Business & Management.*
