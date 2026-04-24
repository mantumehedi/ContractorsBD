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
- **Analytics:** 🏗️ Draft. Stats cards dynamically show the **top 2 most recent running projects** with accurate P&L calculation.

## 🚀 Immediate Next Steps
1.  **PDF Exports:** Voucher/Memo generation (PDF) for field printing.
2.  **Storage Integration:** Implement voucher image uploads to Supabase Storage.
3.  **Detailed Analytics:** Multi-project comparison charts and time-series expense tracking.

## ⚠️ Technical Notes
- **Deferred Invitation Trigger**: The `handle_new_user` Postgres function handles the transition from `invitations` to `project_members` upon signup.
- **RLS Automation**: The dashboard relies on Supabase RLS to filter projects and transactions automatically—no client-side filtering is required for security.
- **SMTP Configuration**: Gmail App Passwords must be used for reliable OTP delivery via `smtp.gmail.com`.

---
*Last Session Summary: 2026-04-24*
- **Auth Integration:** Successfully implemented Email OTP and secure callback routing.
- **RBAC & RLS:** Established a context-specific role system protected by backend policies.
- **Deferred Invitation System:** Created a robust flow for inviting new team members.
- **SMTP Optimization:** Configured custom Gmail SMTP to bypass Supabase's default email limits.
