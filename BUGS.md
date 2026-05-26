## Bug #1 — Order‑card collapse on Cancel/Refund actions
**File(s):** frontend/src/pages/Orders.jsx
**Description:** Clicking the Cancel or Request Refund buttons inside an order card triggered the parent card’s click handler, causing the card to collapse/expand unintentionally. This broke the user flow and made it hard to manage orders.
**Fix:** Added `e.stopPropagation()` to both button click handlers, preventing the event from bubbling to the card container.

---

## Bug #2 — Missing client‑side validation for auction bids
**File(s):** frontend/src/pages/AuctionDetail.jsx
**Description:** Users could submit a bid lower than the required `minNextBid`, resulting in server‑side errors and a poor UX. The input placeholder also displayed the minimum amount rather than a clear “Place Bid” cue.
**Fix:** Updated the bid input placeholder to `"Place Bid"`. Added validation in `handleBid` to ensure the entered amount is a number and not less than `minNextBid`. Disabled the Bid button when the amount is invalid and showed an inline error via toast notifications.

---

## Bug #3 — Quantity selector allowed out‑of‑stock adjustments
**File(s):** frontend/src/pages/ProductDetail.jsx
**Description:** When a product’s `stock` was `0`, the “‑” and “+” quantity buttons remained enabled, allowing users to add unavailable items to the cart.
**Fix:** Disabled both buttons when `stock === 0` (and when limits are reached) and applied visual disabled styling (`opacity-50`, `cursor-not-allowed`).

---

## Bug #4 — Admin tables overflow on small viewports
**File(s):** frontend/src/pages/AdminDashboard.jsx
**Description:** Tables for Products, Orders, Users, and Refunds were not horizontally scrollable, causing layout breakage on mobile devices.
**Fix:** Wrapped each table in a `<div className="overflow-x-auto">` container while preserving the existing glass‑card styling.

---

## Bug #5 — Inconsistent product image handling in admin modal
**File(s):** frontend/src/pages/AdminDashboard.jsx
**Description:** The admin product form stored a single `image` string, while the backend expects an `images` array. This caused newly created or edited products to lose their images.
**Fix:** Changed `productForm` state to use `images: []`. Updated the modal input to accept an image URL and store it as `images: [url]`. Pre‑filled the edit modal with `p.images?.[0]` when editing an existing product.
