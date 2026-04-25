# ContractorsBD 🏗️🇧🇩

Premium, project-based financial management app tailored for Bangladesh construction contractors. Designed for maximum readability on-site and precision accounting in the office.

## 🚀 Key Features
- **Vibrant Field Mode UI:** High-contrast design (Matrix Green/Spiderman Red) with **Sticky Action Bar** for site-speed entry.
- **Advanced RBAC System:** Context-specific roles (Contractor/Owner vs. Site Manager) with secure Row Level Security (RLS).
- **Frictionless Invitations:** Invite Site Managers by email—even if they haven't signed up yet—via a deferred invitation system.
- **Persistent Backend:** Full Supabase integration for projects, transactions, and vendors.
- **Reactive Ledger:** Live-updating transaction history with **Bilingual Search** (English/Bengali).
- **Bilingual & Localized:** Seamless switching with **Optimized Typography** and persistent translation caching.
- **Project-Wise Analytics:** Animated spending breakdown charts and project efficiency comparisons in the **Reports** tab.
- **PDF Export System:** Professional A4 voucher/memo generation with embedded voucher images.
- **Voucher Accountability:** Real-time photo uploads and management for every ledger entry via Supabase Storage.
- **Full CRUD Ledger:** Edit and Delete existing transactions with real-time stats updates.

## 🛠️ Tech Stack
- **Framework:** Next.js (App Router)
- **Backend:** Supabase (@supabase/ssr)
- **Storage:** Supabase Storage (Voucher Bucket)
- **PDF Engine:** jsPDF + html2canvas
- **Auth:** Email OTP with Custom Gmail SMTP
- **Styling:** Tailwind CSS / Custom MD3 Utility Classes
- **State:** React Hooks & Supabase Client
- **Icons:** Lucide React
- **Animations:** Framer Motion

## 📈 Project Status & Roadmap
For a detailed technical breakdown, see [HANDOFF.md](./HANDOFF.md).

**Current Milestone:** ✅ Accounting CRUD, PDF Export & Storage Complete
**Next Up:** 🏗️ Reports UI/UX Refinement & Project Archiving


## ⚡ Quick Start
1. `npm install`
2. Configure `.env.local` with your Supabase credentials.
3. Configure Gmail SMTP in Supabase Auth settings for reliable OTP delivery.
4. Run the SQL schema from the latest migration script (found in `HANDOFF.md` history).
5. `npm run dev`

---
*Created by Antigravity for ContractorsBD*
