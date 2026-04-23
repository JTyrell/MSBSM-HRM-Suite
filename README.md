# MSBM-HRM Suite
### The Next-Generation AI-Powered Human Resource Management System

![MSBM Logo](https://raw.githubusercontent.com/JTyrell/MSBSM-HRM-Suite/main/public/logo.png)

MSBM-HRM Suite is an enterprise-grade Human Resource Management platform designed for modern organizations. Built with **Next.js 16**, **Tailwind CSS v4**, and **Supabase**, it integrates intelligent automation with robust compliance tracking to streamline workforce management.

---

## 🌟 Feature Tour

### 📊 Intelligent Dashboard
*   **Workforce at a Glance**: Real-time metrics on employee status, attendance rates, and pending requests.
*   **World Clock**: Synchronized time tracking across global offices (Kingston, New York, London, Toronto).
*   **Quick Actions**: One-click shortcuts for high-frequency tasks like Running Payroll or Requesting Time Off.

### 📍 GPS-Verified Attendance (Geofencing)
*   **Precise Locations**: Define mandatory clock-in zones using administrative geofencing.
*   **Real-time Tracking**: Live feed of workforce presence with GPS coordinate verification.
*   **Map Integration**: Powered by Mapbox for high-fidelity spatial visualization.

### 💰 Automated Payroll & JA Compliance
*   **Statutory Deductions**: Fully automated calculations for Jamaican statutory requirements, including **NIS**, **NHT**, and **PAYE**.
*   **Pay Frequency Support**: Modular support for Weekly, Bi-weekly, and Monthly payroll cycles.
*   **Staging & Review**: Comprehensive payroll review process with instant pay stub generation.

### 🤖 AI Assistant & Team Hub
*   **HR-Specific AI**: A context-aware AI agent that helps managers with policy queries and employee performance data.
-   **Real-time Collaboration**: A centralized hub for team communication, document sharing, and kudos-based recognition.

### 📈 Advanced Analytics
*   **Team Performance**: Multi-dimensional tracking of employee progress and review cycles.
*   **Workforce Reports**: High-level insights into department distribution and retention trends.

---

## 🛠 Technical Stack

-   **Frontend**: Next.js 16 (App Router), React 19, Tailwind CSS v4, Framer Motion
-   **Backend**: Supabase (PostgreSQL, Auth, Storage)
-   **Optimization**: Standalone Build Support, Turbopack
-   **Services**: Mapbox API, OpenAI API

---

## 🚀 Local Setup Guide

Follow these steps to get the project running on your local machine.

### 1. Prerequisites
- Node.js **22+**
- npm **10+**

### 2. Environment Configuration
Create a `.env.local` file in the root directory and populate it with your credentials:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Services
NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_token
OPENAI_API_KEY=your_openai_key
```

### 3. Installation & Run
```bash
# Install dependencies
npm install

# Run the development server
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to see the application.

---

## Production Deployment (Railway)

This repository is pre-optimized for **Railway** using a multi-stage Docker configuration.

### 1. Automatic Deployment
1. Connect your GitHub repository to Railway.
2. Railway will automatically detect the `railway.toml` and `Dockerfile`.

### 2. Environment Variables
Ensure all variables from `.env.local` (except `SUPABASE_SERVICE_ROLE_KEY` if not used at build time) are added to the Railway Project Settings. 

> [!IMPORTANT]
> `SUPABASE_SERVICE_ROLE_KEY` is required at runtime for administrative actions. Ensure it is explicitly defined in the Railway environment variables dashboard.

### 3. Docker Optimization
The project uses a three-stage Docker build:
- **Deps**: Installs all dependencies (including build-time `devDependencies`).
- **Builder**: Optimized Next.js build using Turbopack.
- **Runner**: A slim Node 22 alpine image using Next.js **standalone output** for minimal footprint and maximum performance.

---

##  Security & Compliance
- **RBAC**: Role-Based Access Control enforced at the middleware and API layers.
- **Data Privacy**: Encrypted communication via Supabase Auth and RLS (Row Level Security) policies.
- **Audit Trails**: Built-in triggers for tracking critical data mutations.

---

##  License
Copyright © 2026 MSBM Group. All rights reserved.
