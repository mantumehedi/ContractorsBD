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
- **Dynamic terms:** (New Vendors/Payees) uses the **MyMemory Translation API** with a fallback mechanism.
- **Consistency:** All document upload labels ("Attach Voucher / Memo") and placeholders are strictly bilingual.

## 🛠️ Module Status
- **Add Income:** ✅ Complete. Optimized category map (Bill, Advance, Refund, etc.).
- **Add Expense:** ✅ Complete. Linked to project-specific vendors/units.
- **Transaction Ledger:** 🏗️ Draft. Basic today/yesterday list implemented with vibrant color indicators.
- **Analytics:** 📅 Planned. Project-wise profit/loss summary needed.

## 🚀 Immediate Next Steps
1.  **Supabase Backend:** 
    - Replace `useState` mock lists with `useEffect` fetches from Supabase.
    - Implement `UPSERT` logic for the bilingual dictionary to cache user-added vendors.
2.  **Auth Integration:** Add simple login for contractor-specific project access.
3.  **PDF Exports:** Implement voucher generation for printed records.

## ⚠️ Technical Notes
- **Grid Symmetry:** The dashboard cards and action buttons are locked to `calc(50% - 6px)` with `gap-3` for perfect vertical alignment.
- **Text Wrapping:** `break-words` is applied to project names in cards to prevent overflow.

---
*Last Session Summary: 2026-04-23*
- Applied Matrix Green/Spiderman Red globally.
- Doubled project name font size and removed truncation.
- Tightened card/button padding for high-density layout.
- Removed form separators for seamless UI.
