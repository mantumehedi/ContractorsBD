# Project Handoff: ContractorsBD 🏗️

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
    - **Bilingual**: Project names automatically sync between languages via MyMemory API.
- **Team Management:** ✅ Complete.
    - **Localization**: Modal and lists are fully bilingual.
    - **UX**: Refined input styles with dark backgrounds for better readability in the "Midnight" theme.
- **Financial Hub (Reports):** ✅ Complete. 
    - **Analytics**: Donut (Breakdown) and Area (Cash Flow) charts.
    - **Consistency**: English numerics enforced globally for financial precision.
- **Transaction Ledger:** ✅ Complete.
    - **Manual Search**: Explicit trigger requirement (Search button/Enter) for professional reliability.
    - **Pagination**: 10-item high-density list with "Load More" capability.
    - **Date Filtering**: Fixed Calendar interaction logic.

## 🚀 Immediate Next Steps
1.  **Auth Restoration:** Re-enable Email OTP and remove guest bypass in `page.tsx`.
2.  **User Verification:** Conduct end-to-end testing with real Site Manager accounts to verify project-access restrictions.
3.  **Production Readiness:** Perform a final audit of RLS policies to ensure total data isolation.

## ⚠️ Technical Notes
- **Localization Engine**: Uses a centralized `t()` helper for static strings and `getDisplayName()` for dynamic database-linked content.
- **Numeric Formatting**: Strictly `en-US` locale enforced for all currency and date displays to prevent layout shifting and ensure clarity.
- **Bilingual Sync**: Background workers automatically ensure parity for Payees, Categories, and Projects.

---
*Last Session Summary: 2026-05-02*
- **Aesthetic Shift**: Implemented Investment Banking theme.
- **Global Bilingualism**: Standardized all UI elements (Static + Dynamic) for English/Bengali.
- **Interaction Refinement**: Implemented manual search and 10-item pagination.
