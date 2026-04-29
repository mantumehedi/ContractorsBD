# ContractorsBD 🏗️🇧🇩

Premium, project-based financial management app tailored for Bangladesh construction contractors. Designed for maximum readability on-site and precision accounting in the office.

## 🚀 Key Features
- **Vibrant Field Mode UI:** High-contrast design (Matrix Green/Spiderman Red) with **Sticky Action Bar** for site-speed entry.
- **Reports UI/UX Overhaul**: Replaced global aggregate views with a project-centric navigation system and a premium dropdown selector.
- **High-Fidelity Analytics**: Integrated interactive **Donut Charts** (Expense Breakdown) and **Area Charts** (Cash Flow Trend) using SVG and Framer Motion.
- **Operational separation**: Clearly distinguished the **Projects** tab (Operational Hub) and the **Reports** tab (Financial Hub).
- **Date-Grouped Ledger**: Implemented a transactional ledger with calendar filtering and 7-day pagination logic.
- **Data Seeding**: Populated a comprehensive demo environment with 10 projects and 200+ transactions.
- **Development Auth Bypass**: Temporary guest access enabled for rapid UI verification.
- **Bilingual & Localized:** Seamless switching with **Optimized Typography** and persistent translation caching.
- **PDF Export System:** Professional A4 voucher/memo generation with embedded voucher images.

## 🛠️ Tech Stack
- **Framework:** Next.js (App Router)
- **Backend:** Supabase (@supabase/ssr)
- **PDF Engine:** jsPDF + html2canvas
- **Auth:** Email OTP with Custom Gmail SMTP
- **Animations:** Framer Motion
- **Icons:** Lucide React

## 📈 Project Status & Roadmap
For a detailed technical breakdown, see [HANDOFF.md](./HANDOFF.md).

**Current Milestone:** ✅ Analytical Dashboard & Operational Hub Separation Complete
**Next Up:** 🏗️ Project Archiving Logic & Audit Logs

## ⚡ Quick Start
1. `npm install`
2. Configure `.env.local` with your Supabase credentials.
3. `npm run dev`

---
*Created by Antigravity for ContractorsBD*
