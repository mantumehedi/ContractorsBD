# Project Handoff: ContractorsBD 🏗️

## 🎨 Design System (Vibrant Field Mode)
The application uses a high-vibrancy design system optimized for outdoor visibility:
- **Income:** Matrix Green (`#00FF41`) with **Black Text**.
- **Expense:** Spiderman Red (`#E23636`) with **White Text**.
- **Profit/Loss:** Royal Blue (`#4169E1`) with **White Text**.
- **Typography:** 
    - Bengali text increased by **25%** for legibility.
    - Project names in cards are **Mega-Text** (text-base, font-black).
    - Amount labels use **text-xl** for instant readability.

## 🇧🇩 Bilingual Implementation
- **Static terms:** Handled via `DATA_TRANSLATIONS` local dictionary.
- **Dynamic terms:** (New Vendors/Payees) uses the **MyMemory Translation API** with a persistence layer in Supabase.
- **Consistency:** All document upload labels ("Attach Voucher / Memo") and placeholders are strictly bilingual.

## 🛠️ Module Status
- **Database (Supabase):** ✅ Complete. 
    - Schema includes `projects`, `transactions`, `vendors_payees`, `translations`, `profiles`, `project_members`, and `invitations`.
    - RLS enabled with Advanced RBAC policies (Owner vs. Member).
- **Auth & RBAC:** ✅ Complete.
    - Email OTP login/signup implemented with Custom Gmail SMTP.
    - Role system: Every user is a **Contractor** by default (can own projects) but can be a **Site Manager** for others.
    - **Deferred Invitations:** Contractors can invite new users by email; access is granted automatically upon their first login.
- **Analytics:** ✅ Implemented. Project-wise performance summary and category breakdown live in the "Reports" tab.
- **PDF & Exports:** ✅ Complete. Professional voucher generation (A4) with image embedding.
- **Storage:** ✅ Complete. Image uploads for vouchers supported in ledger entries.

## 🚀 Immediate Next Steps
1.  **Reports UI/UX Refinement:** Redesign the reports interface for better data density and visual flow (User requested).
2.  **Project Archiving:** Implement status transitions for completed projects.
3.  **Audit Logs:** Track who edited or deleted specific transactions for accountability.

## ⚠️ Technical Notes
- **PDF Rendering:** `html2canvas` is sensitive to CSS `lab()` and `oklch()` colors in Tailwind 4. Use static HEX codes for PDF templates.
- **Cross-Origin Images:** Supabase Storage bucket MUST be public for `html2canvas` to render voucher photos in PDFs.
- **SMTP Configuration**: Gmail App Passwords must be used for reliable OTP delivery via `smtp.gmail.com`.

---
*Last Session Summary: 2026-04-25*
- **PDF Export:** Integrated `jspdf` and `html2canvas` for field-ready voucher downloads.
- **Storage Integration:** Enabled real-time photo uploads for ledger accountability.
- **Project Analytics:** Built a project-wise drill-down report system with animated charts.
- **CRUD Operations:** Completed Edit/Delete flow for all transaction types.
- **Mobile Navigation:** Activated bottom-tab view switching between Dashboard and Reports.
