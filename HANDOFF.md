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
- **Transaction Ledger:** ✅ Fully Functional Prototype. Real-time updates, bilingual search, and vibrant indicators implemented.
- **Analytics:** 🏗️ Draft. Basic stats cards implemented; detailed project-wise breakdown planned.

## 🚀 Immediate Next Steps
1.  **Supabase Backend:** 
    - Replace `transactions` state with Supabase `insert` and `fetch` logic.
    - Persist the bilingual dictionary and cached vendors.
2.  **Auth Integration:** Secure dashboard access.
3.  **PDF Exports:** Voucher/Memo generation for field printing.

## ⚠️ Technical Notes
- **Grid Symmetry:** The dashboard cards and action buttons are locked to `calc(50% - 6px)` with `gap-3` for perfect vertical alignment.
- **Text Wrapping:** `break-words` is applied to project names in cards to prevent overflow.

---
*Last Session Summary: 2026-04-23*
- Implemented **Reactive Transaction Ledger** (Live updates from forms).
- Added **Bilingual Search** for transaction history.
- Implemented **Sticky Action Bar** for Income/Expense buttons.
- Refined **Validation Logic** (Ref No mandatory for bank/cheque, optional for cash).
- Balanced **Bilingual Typography** to prevent card expansion in English mode.
- Switched Bottom Nav to a solid background for premium readability.
