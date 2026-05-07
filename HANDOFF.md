# Project Handoff: ContractorsBD 🏗️

## 🔐 Authentication Protocol (CRITICAL)
- **Login Email**: Always use `cyberkid.mm@gmail.com`.
- **Verification**: After sending the code, always ask the USER for the verification OTP.

## 📝 Documentation Protocol
- **Continuous Update**: Always update `HANDOFF.md` and `project_status.md` after every finished task or significant response.

## 🎨 Design System (Investment Banking Mode)
The application has transitioned to a premium, high-density **Investment Banking** aesthetic:
- **Primary Palette:** Midnight Navy (`#0F172A`) base with Sapphire Blue (`#2563EB`) accents.
- **Surface Elevation:** Subtle glassmorphism and card elevations for a professional, enterprise feel.
- **Status Indicators:** 
    - **Income:** Matrix Green (`#10B981`)
    - **Expense:** Spiderman Red (`#F43F5E`)
    - **Project Margin:** Sapphire Blue (`#2563EB`)

## 🛠️ Module Status
- **Operational Hub (Projects):** ✅ Complete. 
    - **Density**: 2-column grid layout with high-visibility project headers.
    - **Desktop**: Sidebar navigation implemented for resolutions >= 1024px.
- **Team Management:** ✅ Complete.
    - **Localization**: Modal and lists are fully bilingual.
- **Financial Hub (Reports):** ✅ Complete. 
    - **Analytics**: Donut (Breakdown) and Area (Cash Flow) charts.
    - **Consistency**: English numerics enforced globally.
- **Transaction Ledger:** ✅ Complete.
    - **Manual Search**: Explicit trigger requirement for professional reliability.
    - **Pagination**: 10-item high-density list.
- **Auth Bypass**: ✅ Complete.
    - **Logic**: OTP-less login with auto-signup via fixed dev password.

## 🚀 Immediate Next Steps
1.  **Production Readiness**: Perform a final audit of RLS policies to ensure total data isolation.

## ⚠️ Technical Notes
- **Desktop Navigation**: Sidebar is implemented in `page.tsx` with `lg:flex` and fixed positioning. The main content is wrapped in a scrollable `flex-1` container.
- **Localization Engine**: Uses `t()` for static strings and `getDisplayName()` for dynamic content.
- **Numeric Formatting**: Strictly `en-US` locale enforced for all currency and dates.
- **Auth Bypass Note**: Requires disabling "Confirm Email" in Supabase Auth settings to work without verification emails.

---
*Last Session Summary: 2026-05-03*
- **Desktop Sidebar**: Implemented professional sidebar for desktop view, resolving the "missing navigation" issue.
- **Protocols Updated**: Enforced `cyberkid.mm@gmail.com` login and auto-documentation updates.
- **Git Status**: Changes committed locally; pending push to origin.
