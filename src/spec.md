# Specification

## Summary
**Goal:** Collect delivery address details at checkout and apply a ₹80 shipping fee for deliveries outside Gurugram, reflected consistently across customer checkout, admin views, and backend storage.

**Planned changes:**
- Update OrderRequestPage to collect delivery details (at minimum: Delivery Address and Delivery City) with required-field validation and English error messages.
- Add a location-based shipping rule driven by Delivery City (case-insensitive, trimmed): Gurugram => ₹0 shipping; otherwise => ₹80 shipping.
- Update the order summary and UPI payment section to show an INR-formatted breakdown (Items subtotal, Shipping, Total payable) and use Total payable as the Amount to Pay.
- Extend the order submission payload to include delivery address/city so it is persisted and shown in the admin Order Requests UI.
- Update admin Order Requests to display delivery address details and show totals including a separate shipping line item when non-zero.
- Update backend OrderRequest schema and submitOrderRequest to store delivery fields and shippingFee in paise, computed/enforced on the backend (outside Gurugram => 8000 paise; otherwise 0).
- Add a conditional backend migration to preserve existing stored orders by populating new fields with safe defaults and avoiding upgrade traps.

**User-visible outcome:** Customers can enter a delivery address and city during checkout, see shipping (₹0 in Gurugram or ₹80 outside) and a correct total payable for UPI; admins can view delivery details and shipping-inclusive totals for each order.
