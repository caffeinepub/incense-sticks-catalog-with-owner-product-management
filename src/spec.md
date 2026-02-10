# Specification

## Summary
**Goal:** Fix INR price scaling so products intended to cost ₹299 display as ₹299.00 (not ₹2.99) across the entire app by ensuring backend-stored prices are consistently in paise to match the existing frontend `formatINR(price: bigint)` behavior.

**Planned changes:**
- Update backend product price storage/handling so `price` is consistently represented in paise (minor units) end-to-end.
- Adjust admin product create/edit handling so entering rupee amounts like `299` or `299.00` results in a stored value that renders as `₹299.00` everywhere.
- Verify all app locations that display prices (storefront catalog cards, product detail, admin product list, admin order request totals/line items) use the corrected stored value and no longer show `₹2.99` for intended `₹299`.

**User-visible outcome:** Prices entered as ₹299 in the admin display as “₹299.00” everywhere in the storefront and admin views, and no part of the UI shows ₹2.99 for products intended to be ₹299.
