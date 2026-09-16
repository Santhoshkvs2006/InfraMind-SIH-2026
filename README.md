# InfraMind – Smart Real-Time Monitoring & Inspection Platform
### Smart India Hackathon 2026 | Problem Statement ID: 26095
**Ministry of Social Justice & Empowerment (DoSJE), Government of India**

---

## 📌 Platform Overview
**InfraMind** is an intelligent, tamper-evident monitoring and inspection governance platform engineered for institutions, projects, and NGOs running under central DoSJE schemes (e.g., PM-AJAY, SMILE, PM-DAKSH, ADIP, Vayoshreshtha, Nasha Mukt Bharat Abhiyaan).

Instead of predictable, pre-scheduled inspections that allow compliance window manipulation, InfraMind introduces:
- **Controlled Random Inspection Assignment** (weighted by risk indicators and operational telemetry)
- **Central Official Command Dashboard** (real-time district oversight)
- **Comprehensive Institute Registry** with explainable risk breakdown (0–100) and trust scoring (0–100)
- **Mobile-First Field Inspection Terminal** for Inspection Officers (geofence verification, 4-category checklist, evidence hashing, offline sync)
- **Tamper-Evident Evidence Vault** with automated SHA-256 cryptographic hashes and GPS tagging
- **Continuous Audit Trail & Official Notifications**

---

## 🚀 Phase 1 & Phase 2 Delivered Modules

### Phase 1: Command Center & Governance
1. **React 19 + TypeScript + Vite Frontend**: Fast, responsive single-page application with modern Government of India enterprise design language.
2. **Tailwind CSS + shadcn/ui Design**: Trustworthy color hierarchy (Green = Normal, Amber = Attention, Red = Verification Required).
3. **FastAPI Python Backend**: REST API with SQLite database (zero configuration required).
4. **Demo JWT Role-Based Authentication**: Single-click demo logins for Official, Inspector, Institute/NGO, and Super Admin.
5. **Official Command Dashboard**:
   - 6 Top Metrics: Total Institutes (248), Active (221), Inspections This Month (31), Pending (8), Alerts (12), High Risk Institutes (9)
   - Monthly inspection trends chart and risk distribution progress meters
   - Recent alerts and live audit activity stream
6. **Institute Registry**: Searchable, filterable table with columns (ID, Name, District, Scheme, Beneficiaries, Last Inspection, Risk Score, Status, CCTV, Actions).
7. **Institute Detail Profile**: Overview, contact directory, operational statistics, **Explainable Risk Score (0–100)** with factor points, and **Monitoring Trust Score (0–100)**.
8. **Controlled Random Inspection Engine**: Weighted selection prioritizing elevated risk institutes, assigning code (`INS-2026-00841`), designated officer (`Officer Arun Kumar`), priority, and timestamp.
9. **Inspection Assignment Dossier**: Geofenced coordinates (`13.0067° N, 80.2206° E`), 7 mandatory evidence criteria, and lifecycle tracker (`Assigned` → `En Route` → `In Progress` → `Submitted` → `Verified` → `Closed`).

### Phase 2: Inspection Officer Field Workflow
1. **Inspection Officer Dashboard (`/inspector`)**:
   - Quota cards: Assigned Inspections, Today's Active Tasks, Pending Submissions, Completed.
   - Assignment cards with Institute name, District, Type, Priority, Status, Distance (e.g. `3.4 km from your location`), and **"START INSPECTION"** trigger.
2. **Mobile-First Field Inspection Wizard (`/inspector/inspect/:id`)**:
   - Sticky top bar with institute details, code, and **ONLINE / OFFLINE mode toggle**.
   - Bottom mobile navigation bar (Home, Assignments, Capture, Reports, Profile).
   - **Step 1: On-Site GPS Geofence Verification**: Real browser geolocation with automatic fallback to **Demo GPS mode** (`13.0067° N, 80.2206° E`, accuracy: `4.2m`), visual map card, and **"Location Verified"** badge.
   - **Step 2: Structured 4-Category Checklist**: 13 statutory compliance items across Infrastructure, Staff, Beneficiaries, and Documentation. Three-state buttons (`Pass`, `Attention`, `Not Verified`) with enforced observation remarks on non-pass items.
   - **Step 3: Tamper-Evident Evidence Vault**: Actions to capture photos/videos with automated **SHA-256 cryptographic checksums**, device coordinates, capture timestamp, and integrity badges.
   - **Step 4: Inspection Summary & Dossier Review**: Pre-submission criteria validation, field notes, and **"Ready for Submission"** verification.
3. **Offline-First Sync Simulation**:
   - Toggle to **OFFLINE** mode allows uninterrupted checklist completion and evidence capture.
   - Live queue indicator (*"X item(s) waiting to sync"*).
   - Instant **"Sync Now"** action uploads and verifies cached data when toggled back to **ONLINE**.
4. **Submission Confirmation Screen (`/inspector/confirmed/:id`)**:
   - Displays **"Inspection Submitted Successfully"** with code, submitted time, evidence count, and next step: *"Pending Official Verification"*.
5. **Navbar Notification Bell & Live Dispatch**:
   - Bell icon with unread badge counter in top navigation.
   - Live notification dispatched to Department Official upon field report submission:  
     *`"Inspection INS-2026-00841 submitted by Officer Arun Kumar."`*

---

## 🔑 Demo Credentials

| Role | Email | Password | Access / Scope |
|---|---|---|---|
| **Department Official** | `official@inframind.demo` | `demo123` | Command Dashboard, Random Engine, Official Review |
| **Inspection Officer** | `inspector@inframind.demo` | `demo123` | Field Inspector Terminal (Officer Arun Kumar) |
| **Institute / NGO** | `institute@inframind.demo` | `demo123` | ABC Welfare Centre Admin |
| **Super Admin** | `admin@inframind.demo` | `demo123` | System Administrator |

> *Single-click login shortcuts are also provided directly on the login page.*

---

## 🛠️ Technology Stack
- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, Lucide React, Recharts, React Router DOM, canvas-confetti
- **Backend**: FastAPI, Python 3.13, Uvicorn, SQLAlchemy 2.0, Pydantic v2, Python-Jose (JWT)
- **Database**: SQLite with auto-seeded synthetic DoSJE institutions, inspectors, attendance logs, alerts, and notifications

---

## ⚡ How to Run the Application

### 1. Start Backend Server
Open a terminal in `backend/`:
```bash
cd backend
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
Backend API will be live at: **http://127.0.0.1:8000**  
Interactive API Docs (Swagger): **http://127.0.0.1:8000/docs**

### 2. Start Frontend Application
In a separate terminal in `frontend/`:
```bash
cd frontend
npm run dev
```
Frontend Web UI will be live at: **http://127.0.0.1:5173**

---

## 🧭 Complete Phase 2 Demonstration Walkthrough

1. **Official Generates Assignment**:
   - Log in as **Department Official** (`official@inframind.demo` / `demo123`).
   - Click **"GENERATE RANDOM INSPECTION"** on the dashboard.
   - Unannounced inspection `INS-2026-00841` is generated for `ABC Welfare Centre` and assigned to `Officer Arun Kumar`.
2. **Switch to Inspection Officer**:
   - Use the top-right role switcher dropdown to select **"Inspection Officer"** (or log in via `inspector@inframind.demo`).
   - You are navigated to the **Inspection Officer Dashboard** (`/inspector`).
   - Locate the card for `ABC Welfare Centre` showing distance (`3.4 km`) and priority (`Attention`).
   - Click **"START INSPECTION"**.
3. **Execute Field Inspection**:
   - **Step 1: GPS Geofence**: Click **"VERIFY GPS LOCATION NOW"**. The interface checks in at `13.0067° N, 80.2206° E` (accuracy: `4.2m`) with the badge **"Location Verified"**. Click **"Proceed to Inspection Checklist"**.
   - **Step 2: Compliance Checklist**: Review the 13 statutory items across the 4 categories. Items marked `Attention` require mandatory remarks. Click **"Proceed to Evidence Capture"**.
   - **Step 3: Evidence Capture**: Click **"Capture Photo"** or **"Record Short Video"**. Review the generated SHA-256 checksum and **"Integrity Verified"** tag.
   - **Offline Mode Simulation**: Toggle **ONLINE → OFFLINE** in the top bar. Capture another evidence item → notice *"1 item(s) waiting to sync"*. Toggle back to **ONLINE** → click **"Sync Now"** → see *"Synced & Verified"*. Click **"Proceed to Summary"**.
   - **Step 4: Review & Submit**: Inspect the pre-submission summary dossier. Click **"SUBMIT INSPECTION"**.
4. **Confirmation & Official Notification**:
   - Review the confirmation screen: **"Inspection Submitted Successfully"** with next step *"Pending Official Verification"*.
   - Switch role back to **Department Official** → Notice the notification in the top navigation bell:  
     *`"Inspection INS-2026-00841 submitted by Officer Arun Kumar."`*
   - In **Assignments** (`/assignments`), verify that the status has transitioned from `In Progress` to `SUBMITTED`.

---

## ⚠️ Prototype Notice
- All data presented is synthetic and designed for SIH demonstration.
- No actual government databases or live feeds are accessed.
- Phase 3 will introduce: 4-camera simulated RTSP CCTV monitoring, 5-minute Random VC verification, AI occupancy anomaly detection with explainable risk recalculation (52 → 78), and human verification review.
